import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import net from 'node:net'
import {spawn} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const pause = ms => new Promise(resolve => setTimeout(resolve,ms))
function seed() {
  const schema = {type:'object',fields:{name:{type:'string',min_length:1,max_length:40},enabled:{type:'boolean'}},required:['name','enabled']}
  const resource = name => ({contract:{resource_id:'draft',contract_revision:'c1',value_schema:schema,readable:true,
    availability:{state:'available'},operations:[{operation_id:'save',target:'draft',contract_revision:'a1',input_schema:schema,
      availability:{state:'available'},expected_revision_required:true}]},resource_revision:'r1',value:{name,enabled:false}})
  const rows = name => ({contract:{resource_id:'items',contract_revision:'c1',value_schema:{type:'array',max_items:8,
    items:{type:'object',fields:{name:{type:'string'}}}},readable:true,availability:{state:'available'},operations:[]},resource_revision:'r1',value:[{name}]})
  const nodes = [{id:'main',kind:'region',children:[
    {id:'display',kind:'display',resource:'draft',field:'name',label:'Current name'},
    {id:'name',kind:'input',resource:'draft',operation:'save',field:'name',from:'name',label:'Name'},
    {id:'enabled',kind:'input',resource:'draft',operation:'save',field:'enabled',from:'enabled',label:'Enabled'},
    {id:'list',kind:'collection',resource:'items',fields:['name'],label:'Items'},
    {id:'save',kind:'action',resource:'draft',operation:'save',label:'Save'},
    {id:'outcome',kind:'feedback'},
  ]}]
  const scope = name => ({cursor:'c1',sequence:1,receipts:{},resources:[resource(name),rows(name)]})
  return {counters:{read:0,invoke:0,subscribe:0},declarations:{items:{id:'items',revision:'d1',title:'Items',nodes},
    empty:{id:'empty',revision:'e1',title:'Empty view',nodes:[]}},scopes:{'u1/r1':scope('Ada'),'u2/r1':scope('Lin'),'u1/r2':scope('Role two')}}
}

export async function startFixture() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(),'interaction-acceptance-'))
  const stateFile = path.join(directory,'state.json')
  await fs.writeFile(stateFile,JSON.stringify(seed()),{mode:0o600})
  const allocator = net.createServer()
  await new Promise(resolve => allocator.listen(0,'127.0.0.1',resolve))
  const port = allocator.address().port
  await new Promise(resolve => allocator.close(resolve))
  const url = `http://127.0.0.1:${port}`
  let output = ''
  const child = spawn(process.execPath,[path.join(root,'.output/server/index.mjs')],{cwd:root,detached:true,
    env:{...process.env,HOST:'127.0.0.1',PORT:String(port),INTERACTION_FIXTURE_ORIGIN:url,
      INTERACTION_FIXTURE_STATE:stateFile,INTERACTION_FIXTURE_HANDLER:process.env.INTERACTION_FIXTURE_HANDLER || path.join(root,'handler/target/debug/interaction-fixture-handler')},
    stdio:['ignore','pipe','pipe']})
  const capture = bytes => {output=(output+bytes.toString()).slice(-32768)}
  child.stdout.on('data',capture); child.stderr.on('data',capture)
  const exited = new Promise(resolve => child.once('close',resolve))
  child.on('error',capture)
  async function close() {
    if (child.exitCode === null && child.signalCode === null) {
      try {process.kill(-child.pid,'SIGTERM')} catch(e) {if(e.code!=='ESRCH')throw e}
      const kill = setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL')}catch{}},3000)
      await exited; clearTimeout(kill)
    }
    await fs.rm(directory,{recursive:true,force:true})
  }
  try {
    let ready = false
    for (let attempt=0; attempt<100; attempt++) {
      if (child.exitCode !== null) throw new Error(`fixture/exited: ${output}`)
      try {if((await fetch(url+'/api/health')).ok){ready=true;break}} catch {}
      await pause(100)
    }
    if (!ready) throw new Error(`fixture/start/timeout: ${output}`)
  } catch(error) {await close();throw error}
  const state = async () => JSON.parse(await fs.readFile(stateFile,'utf8'))
  async function configure(updated) {
    const response = await fetch(url+'/api/interaction',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({method:'configure',params:updated})})
    const result = await response.json()
    if(result.status!=='Success')throw new Error(JSON.stringify(result))
  }
  return {url,state,close,configure,output:()=>output,addField:async () => {
    const updated = await state()
    updated.declarations.items.revision = 'd2'
    updated.declarations.items.nodes[0].children.push({id:'extra',kind:'input',resource:'draft',operation:'save',field:'extra',from:'extra',label:'Extra'})
    updated.declarations.items.nodes[0].children.push({id:'module',kind:'test_marker',resource:'draft',label:'Module extension'})
    updated.declarations.added={id:'added',revision:'n1',title:'Added at runtime',nodes:[
      {id:'newCollection',kind:'collection',resource:'items',fields:['name'],label:'New collection'},
      {id:'newInput',kind:'input',resource:'draft',operation:'replace',field:'replacement',from:'name',label:'New input'},
      {id:'newAction',kind:'action',resource:'draft',operation:'replace',label:'Replace'},
      {id:'newResult',kind:'feedback'},
    ]}
    for(const item of Object.values(updated.scopes)) {
      item.cursor += '/declaration2'
      const resource=item.resources[0]
      resource.contract.value_schema.fields.extra={type:'string'}
      resource.contract.operations[0].input_schema.fields.extra={type:'string'}
      resource.value.extra='new field';resource.resource_revision+='/extra';resource.contract.contract_revision='c2'
      resource.contract.operations[0].contract_revision='a2'
      resource.contract.operations.push({...structuredClone(resource.contract.operations[0]),operation_id:'replace',
        input_schema:{type:'object',fields:{replacement:{type:'string',min_length:1,max_length:40}},required:['replacement']}})
    }
    await configure(updated)
  }}
}
