<script setup lang="ts">
const route = useRoute()
const scope = useCookie<string>('fixture_scope', {default:() => 'u1/r1'})
</script>
<template><NuxtJpInteractionSurface :key="String(route.params.view)" :scope="scope" :view="String(route.params.view)" endpoint="/api/interaction" /></template>
