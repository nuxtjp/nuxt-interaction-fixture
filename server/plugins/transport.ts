import {closeBridge} from '../utils/bridge.mjs'
export default defineNitroPlugin(nitro => { nitro.hooks.hook('close', closeBridge) })
