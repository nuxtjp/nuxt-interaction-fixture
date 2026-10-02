import {createStdioTransport} from '@crowsi/interaction-transport/stdio'
let transport
export function bridge() {
  if (!transport) transport = createStdioTransport({command:process.env.INTERACTION_FIXTURE_HANDLER})
  return transport
}
export async function closeBridge() { await transport?.close(); transport = undefined }
