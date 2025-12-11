<template>
  <div class="debug-console" :class="{ expanded: debugStore.isExpanded }">
    <div class="debug-header" @click="debugStore.toggle()">
      <span class="title">🐛 Debug Console</span>
      <span class="toggle-icon">{{ debugStore.isExpanded ? '▼' : '▲' }}</span>
    </div>
    <div v-show="debugStore.isExpanded" class="debug-body">
      <div class="debug-toolbar">
        <a-button size="small" @click="debugStore.clear()">
          <DeleteOutlined /> 清空
        </a-button>
        <a-switch
          v-model:checked="debugStore.isEnabled"
          size="small"
          checked-children="启用"
          un-checked-children="禁用"
        />
      </div>
      <div class="log-container" ref="logContainer">
        <div
          v-for="log in debugStore.logs"
          :key="log.id"
          class="log-item"
          :class="`log-${log.type}`"
        >
          <span class="timestamp">{{ log.timestamp }}</span>
          <span class="icon">{{ log.icon }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
        <div v-if="debugStore.logs.length === 0" class="empty-log">
          等待日志输出...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDebugStore } from '../stores/debug'
import { ref, watch, nextTick } from 'vue'
import { DeleteOutlined } from '@ant-design/icons-vue'

const debugStore = useDebugStore()
const logContainer = ref(null)

// 自动滚动到底部
watch(() => debugStore.logs.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})
</script>

<style scoped>
.debug-console {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.92);
  border-radius: 6px;
  border: 1px solid #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3), 0 4px 20px rgba(0, 0, 0, 0.6);
  z-index: 9999;
  font-family: 'Courier New', Courier, monospace;
  transition: all 0.2s ease;
}

.debug-console.expanded {
  height: 280px;
}

.debug-header {
  padding: 8px 12px;
  background: #0a0a0a;
  color: #0f0;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px 6px 0 0;
  user-select: none;
  border-bottom: 1px solid #00ff00;
}

.debug-header:hover {
  background: #1a1a1a;
}

.title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.toggle-icon {
  font-size: 10px;
  color: #0f0;
}

.debug-toolbar {
  padding: 6px 10px;
  background: #111;
  display: flex;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid #222;
}

.log-container {
  height: 200px;
  overflow-y: auto;
  padding: 8px 10px;
  font-size: 10px;
  line-height: 1.4;
}

.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.log-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.log-item {
  margin-bottom: 6px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.timestamp {
  color: #666;
  flex-shrink: 0;
  min-width: 80px;
}

.icon {
  flex-shrink: 0;
}

.message {
  color: #0f0;
  flex: 1;
  word-break: break-all;
}

.log-info .message {
  color: #00bfff;
}

.log-success .message {
  color: #0f0;
}

.log-error .message {
  color: #ff4444;
}

.log-warning .message {
  color: #ffaa00;
}

.log-loading .message {
  color: #aaa;
}

.empty-log {
  color: #666;
  text-align: center;
  padding: 40px 20px;
  font-style: italic;
}
</style>
