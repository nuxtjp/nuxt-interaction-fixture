import {createJsonEndpoint} from '@crowsi/interaction-transport/http'
import {bridge} from '../utils/bridge.mjs'
export default defineEventHandler(async event => {
  // Explicit fixture identity resolver, not a production authentication implementation.
  const scope = getCookie(event, 'fixture_scope') ?? 'u1/r1'
  const endpoint = createJsonEndpoint((payload: unknown, options: {signal:AbortSignal}) =>
    bridge().request({...payload as object,scope},options), {origins:[process.env.INTERACTION_FIXTURE_ORIGIN!]})
  return sendWebResponse(event, await endpoint(toWebRequest(event)))
})
