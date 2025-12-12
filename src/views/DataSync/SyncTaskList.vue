<template>
  <div class="sync-task-list">
    <!-- Platform Header -->
    <div class="sync-header">
      <div class="header-content">
        <div class="header-title">
          <SyncOutlined style="font-size: 28px; color: #262626;" />
          <div>
            <h2>数据同步任务</h2>
            <p>跨系统实时数据同步，支持增量与全量同步策略</p>
          </div>
        </div>
        <div class="sync-stats">
          <div class="stat-item">
            <DatabaseOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">{{ taskStats.total }}</div>
              <div class="stat-label">同步任务</div>
            </div>
          </div>
          <div class="stat-item">
            <ThunderboltOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">{{ taskStats.todaySync }}</div>
              <div class="stat-label">今日同步</div>
            </div>
          </div>
          <div class="stat-item">
            <CheckCircleOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">{{ taskStats.successRate }}%</div>
              <div class="stat-label">成功率</div>
            </div>
          </div>
        </div>
        <a-space>
          <a-button type="primary" @click="createTask" ghost>
            <PlusOutlined /> 创建任务
          </a-button>
          <a-button @click="refreshTasks" ghost>
            <ReloadOutlined /> 刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总任务数"
            :value="taskStats.total"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><DatabaseOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="运行中"
            :value="taskStats.running"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><SyncOutlined :spin="true" /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日同步"
            :value="taskStats.todaySync"
            suffix="次"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="成功率"
            :value="taskStats.successRate"
            suffix="%"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 任务列表 -->
    <a-card title="同步任务列表">
      <template #extra>
        <a-space>
          <a-select v-model:value="filterStatus" style="width: 120px" placeholder="任务状态">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="ENABLED">运行中</a-select-option>
            <a-select-option value="DISABLED">已停止</a-select-option>
            <a-select-option value="ERROR">错误</a-select-option>
          </a-select>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索任务名称"
            style="width: 200px"
            @search="handleSearch"
          />
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredTasks"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        row-key="task_id"
      >
        <!-- 任务名称 -->
        <template #task_name="{ record }">
          <div>
            <a @click="viewTaskDetail(record)">{{ record.task_name }}</a>
            <a-tag v-if="record.sync_strategy === 'INCREMENTAL'" color="blue" style="margin-left: 8px">
              增量同步
            </a-tag>
            <a-tag v-else color="default" style="margin-left: 8px">
              全量同步
            </a-tag>
          </div>
        </template>

        <!-- 数据源 -->
        <template #datasource="{ record }">
          <div>
            <DatabaseOutlined style="margin-right: 4px; color: #1890ff" />
            {{ record.source_name }}
            <ArrowRightOutlined style="margin: 0 8px; color: #999" />
            {{ record.target_table }}
          </div>
        </template>

        <!-- 同步时间 -->
        <template #schedule="{ record }">
          <div>
            <ClockCircleOutlined style="margin-right: 4px" />
            <span v-if="record.sync_schedule === 'MANUAL'">手动触发</span>
            <span v-else>{{ record.schedule_text }}</span>
          </div>
        </template>

        <!-- 任务状态 -->
        <template #status="{ record }">
          <a-badge
            :status="getStatusBadge(record.task_status)"
            :text="getStatusText(record.task_status)"
          />
        </template>

        <!-- 最后执行 -->
        <template #last_run="{ record }">
          <div v-if="record.last_run_time">
            <div>{{ record.last_run_time }}</div>
            <div style="margin-top: 4px">
              <a-tag v-if="record.last_run_status === 'SUCCESS'" color="success">
                成功: {{ record.last_run_records }}条
              </a-tag>
              <a-tag v-else-if="record.last_run_status === 'FAILED'" color="error">
                失败
              </a-tag>
              <a-tag v-else-if="record.last_run_status === 'PARTIAL'" color="warning">
                部分成功
              </a-tag>
            </div>
          </div>
          <span v-else style="color: #999">未执行</span>
        </template>

        <!-- 下次执行 -->
        <template #next_run="{ record }">
          <div v-if="record.next_run_time && record.task_status === 'ENABLED'">
            {{ record.next_run_time }}
          </div>
          <span v-else style="color: #999">-</span>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <a-space>
            <a-tooltip title="立即执行">
              <a-button
                type="link"
                size="small"
                :disabled="record.task_status !== 'ENABLED'"
                @click="executeTask(record)"
              >
                <PlayCircleOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="查看日志">
              <a-button type="link" size="small" @click="viewLogs(record)">
                <FileTextOutlined />
              </a-button>
            </a-tooltip>
            <a-dropdown>
              <a-button type="link" size="small">
                <EllipsisOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="editTask(record)">
                    <EditOutlined /> 编辑
                  </a-menu-item>
                  <a-menu-item
                    v-if="record.task_status === 'ENABLED'"
                    @click="toggleTaskStatus(record, 'DISABLED')"
                  >
                    <PauseCircleOutlined /> 停止
                  </a-menu-item>
                  <a-menu-item
                    v-else
                    @click="toggleTaskStatus(record, 'ENABLED')"
                  >
                    <PlayCircleOutlined /> 启动
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item danger @click="deleteTask(record)">
                    <DeleteOutlined /> 删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 执行日志抽屉 -->
    <a-drawer
      v-model:visible="logDrawerVisible"
      title="同步日志"
      width="800"
      :body-style="{ padding: 0 }"
    >
      <div v-if="selectedTask" style="padding: 16px">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="任务名称">
            {{ selectedTask.task_name }}
          </a-descriptions-item>
          <a-descriptions-item label="执行状态">
            <a-tag :color="selectedTask.last_run_status === 'SUCCESS' ? 'success' : 'error'">
              {{ selectedTask.last_run_status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="执行时间">
            {{ selectedTask.last_run_time }}
          </a-descriptions-item>
          <a-descriptions-item label="耗时">
            {{ selectedTask.duration_ms }}ms
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <!-- 实时日志 -->
        <div class="log-container">
          <div class="log-header">
            <span>执行日志</span>
            <a-button size="small" @click="refreshLogs">
              <ReloadOutlined /> 刷新
            </a-button>
          </div>
          <div class="log-content">
            <pre>{{ executionLogs }}</pre>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  PauseCircleOutlined
} from '@ant-design/icons-vue'

// 统计数据
const taskStats = ref({
  total: 8,
  running: 5,
  todaySync: 23,
  successRate: 99.2
})

// Mock 数据
const tasks = ref([
  {
    task_id: 'SYNC_20251211_001',
    task_name: 'ERP订单每日同步',
    source_name: 'ERP订单系统',
    target_table: 'orders',
    sync_strategy: 'INCREMENTAL',
    sync_schedule: 'CRON',
    schedule_text: '每2小时 (0 0 */2 * * *)',
    task_status: 'ENABLED',
    last_run_time: '2025-12-11 14:00:00',
    last_run_status: 'SUCCESS',
    last_run_records: 125,
    next_run_time: '2025-12-11 16:00:00',
    duration_ms: 2300
  },
  {
    task_id: 'SYNC_20251211_002',
    task_name: 'CRM客户信息同步',
    source_name: 'CRM客户系统',
    target_table: 'customers',
    sync_strategy: 'INCREMENTAL',
    sync_schedule: 'CRON',
    schedule_text: '每4小时 (0 0 */4 * * *)',
    task_status: 'ENABLED',
    last_run_time: '2025-12-11 12:00:00',
    last_run_status: 'SUCCESS',
    last_run_records: 58,
    next_run_time: '2025-12-11 16:00:00',
    duration_ms: 1850
  },
  {
    task_id: 'SYNC_20251211_003',
    task_name: '钉钉员工花名册同步',
    source_name: '钉钉OA',
    target_table: 'employees',
    sync_strategy: 'FULL',
    sync_schedule: 'CRON',
    schedule_text: '每日08:00 (0 0 8 * * *)',
    task_status: 'ENABLED',
    last_run_time: '2025-12-11 08:00:00',
    last_run_status: 'SUCCESS',
    last_run_records: 320,
    next_run_time: '2025-12-12 08:00:00',
    duration_ms: 4200
  },
  {
    task_id: 'SYNC_20251211_004',
    task_name: '钉钉考勤实时同步',
    source_name: '钉钉OA',
    target_table: 'attendance',
    sync_strategy: 'INCREMENTAL',
    sync_schedule: 'WEBHOOK',
    schedule_text: '实时 (Webhook)',
    task_status: 'ENABLED',
    last_run_time: '2025-12-11 15:23:00',
    last_run_status: 'SUCCESS',
    last_run_records: 15,
    next_run_time: '-',
    duration_ms: 320
  },
  {
    task_id: 'SYNC_20251211_005',
    task_name: 'WMS库存数据同步',
    source_name: 'WMS仓储系统',
    target_table: 'inventory',
    sync_strategy: 'INCREMENTAL',
    sync_schedule: 'CRON',
    schedule_text: '每1小时 (0 0 */1 * * *)',
    task_status: 'ENABLED',
    last_run_time: '2025-12-11 15:00:00',
    last_run_status: 'PARTIAL',
    last_run_records: 245,
    next_run_time: '2025-12-11 16:00:00',
    duration_ms: 5100
  },
  {
    task_id: 'SYNC_20251211_006',
    task_name: '财务系统回款记录同步',
    source_name: '财务系统',
    target_table: 'payments',
    sync_strategy: 'INCREMENTAL',
    sync_schedule: 'CRON',
    schedule_text: '每日21:00 (0 0 21 * * *)',
    task_status: 'DISABLED',
    last_run_time: '2025-12-10 21:00:00',
    last_run_status: 'SUCCESS',
    last_run_records: 89,
    next_run_time: '-',
    duration_ms: 1950
  },
  {
    task_id: 'SYNC_20251211_007',
    task_name: 'CRM销售线索同步',
    source_name: 'CRM客户系统',
    target_table: 'leads',
    sync_strategy: 'INCREMENTAL',
    sync_schedule: 'CRON',
    schedule_text: '每30分钟 (0 */30 * * * *)',
    task_status: 'ENABLED',
    last_run_time: '2025-12-11 15:30:00',
    last_run_status: 'SUCCESS',
    last_run_records: 42,
    next_run_time: '2025-12-11 16:00:00',
    duration_ms: 890
  },
  {
    task_id: 'SYNC_20251211_008',
    task_name: 'ERP采购订单同步',
    source_name: 'ERP订单系统',
    target_table: 'purchase_orders',
    sync_strategy: 'FULL',
    sync_schedule: 'MANUAL',
    schedule_text: '手动触发',
    task_status: 'ERROR',
    last_run_time: '2025-12-11 10:00:00',
    last_run_status: 'FAILED',
    last_run_records: 0,
    next_run_time: '-',
    duration_ms: 1200
  }
])

// 表格列定义
const columns = [
  {
    title: '任务名称',
    dataIndex: 'task_name',
    key: 'task_name',
    width: 220,
    slots: { customRender: 'task_name' }
  },
  {
    title: '数据源 → 目标表',
    key: 'datasource',
    width: 250,
    slots: { customRender: 'datasource' }
  },
  {
    title: '同步时间',
    key: 'schedule',
    width: 200,
    slots: { customRender: 'schedule' }
  },
  {
    title: '任务状态',
    key: 'status',
    width: 100,
    slots: { customRender: 'status' }
  },
  {
    title: '最后执行',
    key: 'last_run',
    width: 180,
    slots: { customRender: 'last_run' }
  },
  {
    title: '下次执行',
    key: 'next_run',
    width: 160,
    slots: { customRender: 'next_run' }
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
]

// 过滤和搜索
const filterStatus = ref('')
const searchText = ref('')
const loading = ref(false)

const filteredTasks = computed(() => {
  let result = tasks.value
  if (filterStatus.value) {
    result = result.filter(t => t.task_status === filterStatus.value)
  }
  if (searchText.value) {
    result = result.filter(t => t.task_name.includes(searchText.value))
  }
  return result
})

// 日志抽屉
const logDrawerVisible = ref(false)
const selectedTask = ref(null)
const executionLogs = ref('')

// 状态显示
const getStatusBadge = (status) => {
  const map = {
    'ENABLED': 'processing',
    'DISABLED': 'default',
    'ERROR': 'error'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    'ENABLED': '运行中',
    'DISABLED': '已停止',
    'ERROR': '错误'
  }
  return map[status] || status
}

// 操作方法
const createTask = () => {
  message.info('打开创建同步任务对话框 (Demo)')
}

const refreshTasks = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('刷新成功')
  }, 500)
}

const handleSearch = () => {
  message.info(`搜索: ${searchText.value}`)
}

const viewTaskDetail = (record) => {
  message.info(`查看任务详情: ${record.task_name}`)
}

const executeTask = (record) => {
  message.loading('正在执行同步任务...', 2)
  setTimeout(() => {
    message.success(`任务 "${record.task_name}" 执行成功，同步了 ${record.last_run_records} 条数据`)
  }, 2000)
}

const viewLogs = (record) => {
  selectedTask.value = record
  logDrawerVisible.value = true

  // Mock 日志内容
  executionLogs.value = `[INFO] ${record.last_run_time} - 同步任务开始
  任务ID: ${record.task_id}
  任务名称: ${record.task_name}
  同步策略: ${record.sync_strategy}

[INFO] 调用API获取数据
  URL: https://${record.source_name.toLowerCase().replace(/\s/g, '-')}.renhe.com/api/data
  参数: { date_from: "2025-12-11", date_to: "2025-12-11" }

[SUCCESS] 数据获取成功
  数据量: ${record.last_run_records}条
  耗时: ${Math.floor(record.duration_ms * 0.3)}ms

[INFO] 字段映射中...
  映射规则: 7条

[INFO] 数据校验中...
  校验规则: 3条
  校验通过: ${record.last_run_records - 1}条
  校验失败: ${record.last_run_status === 'PARTIAL' ? '1条' : '0条'}

[INFO] 写入数据库...
  目标表: ${record.target_table}
  写入模式: UPSERT (基于唯一键)

[SUCCESS] 数据写入完成
  成功: ${record.last_run_records}条 (新增: ${Math.floor(record.last_run_records * 0.8)}, 更新: ${Math.floor(record.last_run_records * 0.2)})
  失败: 0条
  总耗时: ${record.duration_ms}ms

[SUCCESS] 同步任务完成
  成功率: 100%`
}

const refreshLogs = () => {
  message.success('日志已刷新')
}

const editTask = (record) => {
  message.info(`编辑任务: ${record.task_name} (Demo)`)
}

const toggleTaskStatus = (record, newStatus) => {
  const action = newStatus === 'ENABLED' ? '启动' : '停止'
  message.success(`任务已${action}: ${record.task_name}`)
  record.task_status = newStatus
}

const deleteTask = (record) => {
  message.error(`删除任务: ${record.task_name} (Demo)`)
}

onMounted(() => {
  // 初始化加载
})
</script>

<style scoped>
.sync-task-list {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.sync-header {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: #262626;
  border-bottom: 1px solid #e8e8e8;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.header-title p {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.sync-stats {
  display: flex;
  gap: 32px;
}

.sync-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.log-container {
  margin-top: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid #d9d9d9;
  font-weight: 500;
}

.log-content {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: #1e1e1e;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.log-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(.ant-table) {
  background: #fff;
}
</style>
