import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { registerInteractionCapability } from '@nuxtjp/declarative-ui'
export default defineNuxtModule({setup(_,nuxt) {
  registerInteractionCapability(nuxt,{kind:'test_marker',renderer:createResolver(import.meta.url).resolve('../app/components/TestMarker.vue'),
    required:['resource','label'],optional:[]})
}})
