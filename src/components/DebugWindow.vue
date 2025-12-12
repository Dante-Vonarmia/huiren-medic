<template>
  <div class="debug-window-wrapper">
    <!-- Floating Debug Button -->
    <a-button
      v-if="!isOpen"
      class="debug-float-button"
      type="primary"
      shape="circle"
      size="large"
      @click="toggleWindow"
    >
      <BugOutlined />
      <a-badge :count="unreadLogs" :offset="[-5, 5]" />
    </a-button>

    <!-- Debug Window -->
    <div v-if="isOpen" class="debug-window" :class="{ minimized: isMinimized }">
      <!-- Header -->
      <div class="debug-header">
        <div class="debug-title">
          <BugOutlined />
          <span>Debug 窗口</span>
          <a-badge :count="logs.length" :number-style="{ backgroundColor: '#52c41a' }" />
        </div>
        <div class="debug-controls">
          <a-tooltip title="清空日志">
            <DeleteOutlined @click="clearLogs" class="control-icon" />
          </a-tooltip>
          <a-tooltip title="暂停">
            <PauseCircleOutlined v-if="!isPaused" @click="togglePause" class="control-icon" />
            <PlayCircleOutlined v-else @click="togglePause" class="control-icon" style="color: #52c41a;" />
          </a-tooltip>
          <a-tooltip :title="isMinimized ? '展开' : '最小化'">
            <MinusCircleOutlined @click="toggleMinimize" class="control-icon" />
          </a-tooltip>
          <a-tooltip title="关闭">
            <CloseOutlined @click="toggleWindow" class="control-icon" />
          </a-tooltip>
        </div>
      </div>

      <!-- Filter Bar -->
      <div v-if="!isMinimized" class="debug-filters">
        <a-space size="small">
          <a-tag
            :color="activeFilter === 'all' ? 'blue' : 'default'"
            @click="setFilter('all')"
            class="filter-tag"
          >
            全部 ({{ logs.length }})
          </a-tag>
          <a-tag
            :color="activeFilter === 'api' ? 'cyan' : 'default'"
            @click="setFilter('api')"
            class="filter-tag"
          >
            API ({{ countByType('api') }})
          </a-tag>
          <a-tag
            :color="activeFilter === 'workflow' ? 'purple' : 'default'"
            @click="setFilter('workflow')"
            class="filter-tag"
          >
            工作流 ({{ countByType('workflow') }})
          </a-tag>
          <a-tag
            :color="activeFilter === 'data' ? 'orange' : 'default'"
            @click="setFilter('data')"
            class="filter-tag"
          >
            数据同步 ({{ countByType('data') }})
          </a-tag>
          <a-tag
            :color="activeFilter === 'error' ? 'red' : 'default'"
            @click="setFilter('error')"
            class="filter-tag"
          >
            错误 ({{ countByType('error') }})
          </a-tag>
        </a-space>
      </div>

      <!-- Log Display -->
      <div v-if="!isMinimized" ref="logContainer" class="debug-content">
        <div v-for="(log, index) in filteredLogs" :key="index" class="log-entry" :class="`log-${log.type}`">
          <span class="log-time">[{{ log.time }}]</span>
          <span class="log-type">[{{ log.typeLabel }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>

        <div v-if="filteredLogs.length === 0" class="log-empty">
          <InboxOutlined style="font-size: 32px; color: #666;" />
          <p>暂无日志</p>
        </div>
      </div>

      <!-- Footer Info -->
      <div v-if="!isMinimized" class="debug-footer">
        <span>{{ isPaused ? '已暂停' : '实时更新' }}</span>
        <span>{{ filteredLogs.length }}/{{ logs.length }} 条日志</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  BugOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  MinusCircleOutlined,
  CloseOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// State
const isOpen = ref(false)
const isMinimized = ref(false)
const isPaused = ref(false)
const activeFilter = ref('all')
const logs = ref([])
const unreadLogs = ref(0)
const logContainer = ref(null)

// Demo log generator timer
let logTimer = null

// Type labels mapping
const typeLabels = {
  api: 'API',
  workflow: '工作流',
  data: '数据同步',
  error: '错误',
  info: '信息'
}

// Computed
const filteredLogs = computed(() => {
  if (activeFilter.value === 'all') {
    return logs.value
  }
  return logs.value.filter(log => log.type === activeFilter.value)
})

const countByType = (type) => {
  return logs.value.filter(log => log.type === type).length
}

// Methods
const toggleWindow = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadLogs.value = 0
    isMinimized.value = false
  }
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const togglePause = () => {
  isPaused.value = !isPaused.value
  message.info(isPaused.value ? 'Debug窗口已暂停' : 'Debug窗口继续更新')
}

const clearLogs = () => {
  logs.value = []
  message.success('日志已清空')
}

const setFilter = (filter) => {
  activeFilter.value = filter
}

const addLog = (type, message) => {
  if (isPaused.value) return

  const now = new Date()
  const time = now.toTimeString().split(' ')[0]

  logs.value.push({
    time,
    type,
    typeLabel: typeLabels[type] || type,
    message,
    timestamp: now.getTime()
  })

  // Keep only last 100 logs
  if (logs.value.length > 100) {
    logs.value.shift()
  }

  // Increment unread counter if window is closed
  if (!isOpen.value) {
    unreadLogs.value++
  }

  // Auto scroll to bottom
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

// Demo log scenarios
const demoScenarios = [
  // OKR Creation Flow
  () => {
    addLog('info', '用户[张三]访问OKR管理页面')
    setTimeout(() => addLog('api', 'API调用：GET /api/okr/list → 200 OK (125ms)'), 500)
    setTimeout(() => addLog('data', '加载OKR列表：12条记录'), 800)
  },

  // Data Sync Flow
  () => {
    addLog('data', '启动数据同步任务：MES → 平台数据库')
    setTimeout(() => addLog('api', 'API调用：MES /api/production/today → 200 OK (89ms)'), 300)
    setTimeout(() => addLog('data', '同步生产数据：356条记录'), 600)
    setTimeout(() => addLog('data', '数据同步完成，耗时1.2秒'), 1200)
  },

  // Workflow Execution
  () => {
    addLog('workflow', '工作流引擎启动：绩效评估流程')
    setTimeout(() => addLog('workflow', '流转到节点：部门经理审批'), 400)
    setTimeout(() => addLog('api', 'API调用：POST /api/workflow/approve → 200 OK (45ms)'), 800)
    setTimeout(() => addLog('workflow', '审批通过，流转到HR确认节点'), 1200)
  },

  // QMS Query
  () => {
    addLog('info', '用户查询批次号：BATCH-2025120101')
    setTimeout(() => addLog('api', 'API调用：QMS /api/batch/202512001 → 200 OK (234ms)'), 500)
    setTimeout(() => addLog('data', 'QMS返回：检验状态=已完成，合格率=87.5%'), 900)
    setTimeout(() => addLog('error', '触发预警：合格率低于阈值90%'), 1200)
  },

  // System Connection
  () => {
    addLog('api', '检查系统连接状态...')
    setTimeout(() => addLog('api', 'MES系统：在线 (ping 15ms)'), 300)
    setTimeout(() => addLog('api', 'QMS系统：在线 (ping 22ms)'), 600)
    setTimeout(() => addLog('api', 'WMS系统：在线 (ping 18ms)'), 900)
    setTimeout(() => addLog('error', 'ERP系统：连接超时 (timeout after 5s)'), 1500)
  },

  // Data Aggregation
  () => {
    addLog('data', '开始聚合运营数据...')
    setTimeout(() => addLog('api', 'API调用：MES /api/production/stats → 200 OK (156ms)'), 400)
    setTimeout(() => addLog('api', 'API调用：QMS /api/quality/rate → 200 OK (123ms)'), 700)
    setTimeout(() => addLog('api', 'API调用：WMS /api/inventory/alert → 200 OK (98ms)'), 1000)
    setTimeout(() => addLog('data', '数据聚合完成：生成运营总览报表'), 1400)
  }
]

// Demo log generator
const startDemoLogs = () => {
  // Initial welcome log
  addLog('info', '低代码平台Debug窗口已启动')
  addLog('info', '实时监控系统运行状态...')

  // Generate demo logs periodically
  logTimer = setInterval(() => {
    const scenario = demoScenarios[Math.floor(Math.random() * demoScenarios.length)]
    scenario()
  }, 8000) // Every 8 seconds

  // Initial scenario
  setTimeout(() => {
    demoScenarios[5]() // Run data aggregation on start
  }, 2000)
}

// Expose addLog method to parent component
defineExpose({
  addLog
})

// Lifecycle
onMounted(() => {
  startDemoLogs()
})

onUnmounted(() => {
  if (logTimer) {
    clearInterval(logTimer)
  }
})

// Auto-open on first mount (optional)
setTimeout(() => {
  message.info('💡 右下角Debug窗口可查看后台流程日志', 5)
}, 3000)
</script>

<style scoped>
.debug-window-wrapper {
  position: fixed;
  z-index: 9999;
}

.debug-float-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #1890ff;
  border: none;
  animation: pulse-float 2s infinite;
}

.debug-float-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

@keyframes pulse-float {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.6);
  }
}

.debug-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 600px;
  height: 500px;
  background: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.debug-window.minimized {
  height: auto;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.debug-header {
  background: #252525;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}

.debug-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52c41a;
  font-weight: 600;
  font-size: 14px;
}

.debug-controls {
  display: flex;
  gap: 12px;
}

.control-icon {
  color: #999;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-icon:hover {
  color: #52c41a;
  transform: scale(1.2);
}

.debug-filters {
  background: #252525;
  padding: 8px 16px;
  border-bottom: 1px solid #333;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.filter-tag:hover {
  transform: scale(1.05);
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.log-entry {
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.log-entry:hover {
  background: rgba(82, 196, 26, 0.1);
}

.log-time {
  color: #666;
  flex-shrink: 0;
}

.log-type {
  font-weight: 600;
  flex-shrink: 0;
}

.log-message {
  color: #52c41a;
}

/* Type-specific colors */
.log-api .log-type {
  color: #13c2c2;
}

.log-api .log-message {
  color: #36cfc9;
}

.log-workflow .log-type {
  color: #722ed1;
}

.log-workflow .log-message {
  color: #9254de;
}

.log-data .log-type {
  color: #fa8c16;
}

.log-data .log-message {
  color: #ffa940;
}

.log-error .log-type {
  color: #ff4d4f;
}

.log-error .log-message {
  color: #ff7875;
}

.log-info .log-type {
  color: #1890ff;
}

.log-info .log-message {
  color: #40a9ff;
}

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.debug-footer {
  background: #252525;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #333;
}

/* Scrollbar styling */
.debug-content::-webkit-scrollbar {
  width: 6px;
}

.debug-content::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.debug-content::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.debug-content::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .debug-window {
    width: calc(100vw - 48px);
    right: 24px;
    bottom: 24px;
  }

  .debug-float-button {
    width: 48px;
    height: 48px;
    font-size: 20px;
    bottom: 16px;
    right: 16px;
  }
}
</style>
