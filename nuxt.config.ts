export default defineNuxtConfig({
  compatibilityDate:'2026-09-01', devtools:{enabled:false},
  modules:['@nuxt/ui','@nuxtjp/declarative-ui'],
  ui:{fonts:false}, css:['~/assets/main.css'],
  icon:{serverBundle:{collections:['lucide']},clientBundle:{scan:true}},
  nitro:{preset:'node-server',externals:{inline:['@nuxtjp/declarative-ui','@zixcel/interaction','@crowsi/interaction-transport']}},
  routeRules:{'/**':{headers:{'cache-control':'private, no-store'}}},
})
