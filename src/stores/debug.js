import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDebugStore = defineStore('debug', () => {
  const logs = ref([])
  const isEnabled = ref(true)
  const isExpanded = ref(true)
  let logId = 0

  const log = (type, message) => {
    if (!isEnabled.value) return

    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const icons = {
      info: '📋',
      success: '✓',
      error: '✗',
      warning: '⚠',
      loading: '⏳'
    }

    logs.value.push({
      id: logId++,
      timestamp,
      type,
      icon: icons[type] || '•',
      message
    })

    // 最多保留100条日志
    if (logs.value.length > 100) {
      logs.value.shift()
    }
  }

  const clear = () => {
    logs.value = []
  }

  const toggle = () => {
    isExpanded.value = !isExpanded.value
  }

  const setEnabled = (enabled) => {
    isEnabled.value = enabled
  }

  return {
    logs,
    isEnabled,
    isExpanded,
    log,
    clear,
    toggle,
    setEnabled
  }
})

// 工具函数：模拟延迟
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
