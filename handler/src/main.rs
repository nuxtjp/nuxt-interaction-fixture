//! Test domain only: no Hatter, sem-lang, HAT or profile dependency.
use serde_json::{Value, json};
use std::{fs, io::{self, BufRead, Write}, path::Path};
use zixcel_interaction::{Availability, InvokeRequest, ResourceSnapshot, validate_invoke};

fn failure(status: &str, reason: &str) -> Value { json!({"status":status,"reason":reason,"issues":[]}) }
fn success(value: Value) -> Value { json!({"status":"Success","value":value}) }

fn handle(state: &mut Value, request: &Value) -> Value {
    let Some(scope) = request["scope"].as_str() else { return failure("Forbidden","scope/missing") };
    if state["scopes"].get(scope).is_none() { return failure("Forbidden","scope/unknown") }
    match request["method"].as_str() {
        // Independent fixture fault injection only; no product capability.
        Some("interrupt") => std::process::exit(7),
        Some("configure") => {
            // Test-control capability only; never included in a product handler.
            state["declarations"] = request["params"]["declarations"].clone();
            state["read_failures"] = request["params"]["read_failures"].clone();
            for (scope_id, scope_value) in request["params"]["scopes"].as_object().unwrap() {
                state["scopes"][scope_id]["resources"] = scope_value["resources"].clone();
                state["scopes"][scope_id]["cursor"] = scope_value["cursor"].clone();
            }
            success(json!({"configured":true}))
        }
        Some("read") => {
            let view = request["params"]["view"].as_str().unwrap_or("");
            if let Some(failure) = state["read_failures"].get(view) { return failure.clone() }
            let Some(declaration) = state["declarations"].get(view).cloned() else { return failure("NotFound","view/missing") };
            let resources = if view == "empty" { json!([]) } else { state["scopes"][scope]["resources"].clone() };
            for resource in resources.as_array().unwrap() {
                let Ok(parsed) = serde_json::from_value::<ResourceSnapshot>(resource.clone()) else { return failure("Unavailable","fixture/resource/invalid") };
                if parsed.validate().is_err() { return failure("Unavailable","fixture/resource/invalid") }
            }
            state["counters"]["read"] = json!(state["counters"]["read"].as_u64().unwrap_or(0) + 1);
            success(json!({"scope":scope,"cursor":state["scopes"][scope]["cursor"],
                "declaration_revision":declaration["revision"],"declaration":declaration,"resources":resources}))
        }
        Some("subscribe") => {
            state["counters"]["subscribe"] = json!(state["counters"]["subscribe"].as_u64().unwrap_or(0) + 1);
            let cursor = state["scopes"][scope]["cursor"].clone();
            // Fixture keeps only current state: old cursor requires coherent reread.
            if request["params"]["after"] != cursor {
                success(json!({"kind":"reset","cursor":cursor,"reason":"cursor/expired"}))
            } else { success(json!({"kind":"changes","after":cursor,"cursor":cursor,"changes":[]})) }
        }
        Some("invoke") => {
            state["counters"]["invoke"] = json!(state["counters"]["invoke"].as_u64().unwrap_or(0) + 1);
            let Ok(invoke) = serde_json::from_value::<InvokeRequest>(request["params"].clone()) else { return failure("ValidationError","request/invalid") };
            let local = &mut state["scopes"][scope];
            let Some(index) = local["resources"].as_array().unwrap().iter().position(|r| r["contract"]["resource_id"] == invoke.target) else { return failure("NotFound","resource/missing") };
            let Ok(resource) = serde_json::from_value::<ResourceSnapshot>(local["resources"][index].clone()) else { return failure("Unavailable","fixture/resource/invalid") };
            let Some(action) = resource.contract.operations.iter().find(|a| a.operation_id == invoke.operation_id) else { return failure("NotFound","operation/missing") };
            // Current authorization is checked before any old receipt is exposed.
            // Identity/scope was resolved above, independently of request payloads.
            match &action.availability {
                Availability::Available => {},
                Availability::Forbidden { reason } => return failure("Forbidden",reason),
                Availability::Unavailable { reason } => return failure("Unavailable",reason),
                Availability::PreconditionFailed { reason } => return failure("PreconditionFailed",reason),
            }
            if let Some(receipt) = local["receipts"].get(&invoke.request_reference) {
                return if receipt["request"] == request["params"] { receipt["result"].clone() } else { failure("Conflict","request/reference/reused") };
            }
            if let Err(error) = validate_invoke(action, &invoke, &resource.resource_revision) { return serde_json::to_value(error).unwrap() }
            if local["receipts"].as_object().unwrap().len() >= 128 { return failure("Unavailable","fixture/receipt/limit") }
            let value = if invoke.operation_id == "replace" {
                let mut value = resource.value.clone().unwrap();
                value["name"] = invoke.input["replacement"].clone();
                value
            } else { invoke.input.clone() };
            if !resource.contract.value_schema.validate(&value).is_empty() { return failure("ValidationError","value/invalid") }
            let revision = local["sequence"].as_u64().unwrap() + 1;
            local["sequence"] = json!(revision); local["cursor"] = json!(format!("c{revision}"));
            local["resources"][index]["value"] = value;
            local["resources"][index]["resource_revision"] = json!(format!("r{revision}"));
            let result = success(local["resources"][index].clone());
            local["receipts"][&invoke.request_reference] = json!({"request":request["params"],"result":result});
            result
        }
        _ => failure("NotFound","method/missing"),
    }
}

fn persist(path: &Path, state: &Value) -> io::Result<()> {
    let temporary = path.with_extension("next");
    let mut file = fs::OpenOptions::new().write(true).create_new(true).open(&temporary)?;
    let result = (|| { file.write_all(&serde_json::to_vec(state)?)?; file.sync_all()?; fs::rename(&temporary,path)?;
        fs::File::open(path.parent().unwrap())?.sync_all() })();
    if result.is_err() { let _ = fs::remove_file(&temporary); }
    result
}

fn main() -> io::Result<()> {
    let location = std::env::var_os("INTERACTION_FIXTURE_STATE").ok_or_else(|| io::Error::other("fixture/state/missing"))?;
    let path = Path::new(&location);
    let mut input = io::stdin().lock();
    let mut output = io::stdout().lock();
    loop {
        let mut line = Vec::new();
        let count = input.read_until(b'\n', &mut line)?;
        if count == 0 { break }
        if count > zixcel_interaction::MAX_MESSAGE_BYTES { return Err(io::Error::other("fixture/input/limit")) }
        let bytes = fs::read(path)?;
        if bytes.len() > zixcel_interaction::MAX_MESSAGE_BYTES { return Err(io::Error::other("fixture/state/limit")) }
        let mut state: Value = serde_json::from_slice(&bytes)?;
        let result = match serde_json::from_slice::<Value>(&line) {
            Ok(request) => handle(&mut state, &request), Err(_) => failure("ValidationError","message/invalid"),
        };
        persist(path, &state)?;
        serde_json::to_writer(&mut output, &result)?; output.write_all(b"\n")?; output.flush()?;
    }
    Ok(())
}
