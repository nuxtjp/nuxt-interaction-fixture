<script setup lang="ts">
defineProps<{node:{label:string};resource:{value:{name:string}}}>()
</script>
<template><output>{{ node.label }}: {{ resource.value.name }}</output></template>
