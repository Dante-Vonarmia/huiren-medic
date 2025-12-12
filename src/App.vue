<script setup>
import { useUserStore } from './stores/user'
import { onMounted } from 'vue'
import { themeConfig } from './theme'

const userStore = useUserStore()

onMounted(() => {
  // 检查是否已登录
  userStore.checkAuth()
})
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
