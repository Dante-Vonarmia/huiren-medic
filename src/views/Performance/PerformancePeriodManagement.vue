<template>
  <div class="performance-period">
    <a-page-header
      title="绩效周期管理"
      sub-title="配置绩效考核周期，自动开启与关闭"
    >
      <template #extra>
        <a-button type="primary" @click="createPeriod">
          <template #icon><PlusOutlined /></template>
          创建周期
        </a-button>
      </template>
    </a-page-header>

    <!-- 当前周期卡片 -->
    <a-card class="current-period-card" v-if="currentPeriod">
      <div class="period-header">
        <div class="period-icon">📅</div>
        <div class="period-info">
          <h2>{{ currentPeriod.period_name }}</h2>
          <a-tag color="processing" style="margin-top: 8px">
            <ClockCircleOutlined /> {{ currentPeriod.status_text }}
          </a-tag>
        </div>
        <div class="period-progress">
          <a-progress
            type="circle"
            :percent="currentPeriod.progress"
            :width="100"
            :stroke-color="{
              '0%': '#108ee9',
              '100%': '#87d068',
            }"
          />
          <div class="progress-text">
            剩余 {{ currentPeriod.days_left }} 天
          </div>
        </div>
      </div>

      <a-divider />

      <a-row :gutter="24">
        <a-col :span="8">
          <div class="info-item">
            <CalendarOutlined class="info-icon" />
            <div>
              <div class="info-label">周期时间</div>
              <div class="info-value">{{ currentPeriod.start_date }} ~ {{ currentPeriod.end_date }}</div>
            </div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-item">
            <TeamOutlined class="info-icon" />
            <div>
              <div class="info-label">参与员工</div>
              <div class="info-value">{{ currentPeriod.employee_count }} 人</div>
            </div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-item">
            <DashboardOutlined class="info-icon" />
            <div>
              <div class="info-label">关联KPI</div>
              <div class="info-value">{{ currentPeriod.kpi_count }} 个</div>
            </div>
          </div>
        </a-col>
      </a-row>

      <a-divider>关联KPI指标</a-divider>

      <a-space wrap>
        <a-tag
          v-for="kpi in currentPeriod.linked_kpis"
          :key="kpi.id"
          :color="kpi.color"
          style="margin-bottom: 8px; padding: 4px 12px; font-size: 13px"
        >
          {{ kpi.icon }} {{ kpi.name }}
        </a-tag>
      </a-space>

      <a-divider />

      <a-space>
        <a-button type="primary" @click="viewEmployeePerformance">
          查看员工绩效
        </a-button>
        <a-button @click="exportData">
          <DownloadOutlined /> 导出数据
        </a-button>
        <a-button danger @click="closePeriod" :disabled="currentPeriod.status !== 'ACTIVE'">
          关闭周期
        </a-button>
      </a-space>
    </a-card>

    <!-- 历史周期列表 -->
    <a-card title="历史周期" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="historyPeriods"
        :pagination="{ pageSize: 5 }"
        row-key="period_id"
      >
        <template #period_name="{ record }">
          <div>
            <strong>{{ record.period_name }}</strong>
            <div style="color: #999; font-size: 12px">
              {{ record.start_date }} ~ {{ record.end_date }}
            </div>
          </div>
        </template>

        <template #status="{ record }">
          <a-badge
            :status="getStatusBadge(record.status)"
            :text="record.status_text"
          />
        </template>

        <template #stats="{ record }">
          <div style="font-size: 12px">
            <div>参与: {{ record.employee_count }}人</div>
            <div>KPI: {{ record.kpi_count }}个</div>
          </div>
        </template>

        <template #action="{ record }">
          <a-space>
            <a @click="viewPeriodDetail(record)">查看</a>
            <a @click="copyPeriod(record)">复制配置</a>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  DashboardOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 当前周期
const currentPeriod = ref({
  period_id: 'PERIOD_2025_Q4',
  period_name: '2025 Q4 绩效周期',
  start_date: '2025-10-01',
  end_date: '2025-12-31',
  status: 'ACTIVE',
  status_text: '进行中',
  progress: 67,
  days_left: 20,
  employee_count: 320,
  kpi_count: 4,
  linked_kpis: [
    { id: 1, name: '订单准时率', icon: '📊', color: 'blue' },
    { id: 2, name: '客户满意度', icon: '😊', color: 'green' },
    { id: 3, name: '出勤率', icon: '📅', color: 'purple' },
    { id: 4, name: 'OKR完成度', icon: '🎯', color: 'orange' }
  ],
  auto_close_time: '2025-12-31 23:59:59'
})

// 历史周期
const historyPeriods = ref([
  {
    period_id: 'PERIOD_2025_Q3',
    period_name: '2025 Q3 绩效周期',
    start_date: '2025-07-01',
    end_date: '2025-09-30',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 315,
    kpi_count: 4
  },
  {
    period_id: 'PERIOD_2025_Q2',
    period_name: '2025 Q2 绩效周期',
    start_date: '2025-04-01',
    end_date: '2025-06-30',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 308,
    kpi_count: 3
  },
  {
    period_id: 'PERIOD_2025_Q1',
    period_name: '2025 Q1 绩效周期',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 302,
    kpi_count: 3
  }
])

const columns = [
  {
    title: '周期名称',
    key: 'period_name',
    width: 250,
    slots: { customRender: 'period_name' }
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    slots: { customRender: 'status' }
  },
  {
    title: '统计',
    key: 'stats',
    width: 150,
    slots: { customRender: 'stats' }
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    slots: { customRender: 'action' }
  }
]

const getStatusBadge = (status) => {
  const map = {
    'ACTIVE': 'processing',
    'CLOSED': 'default',
    'PENDING': 'warning'
  }
  return map[status] || 'default'
}

const createPeriod = () => {
  message.info('创建新周期 (Demo)')
}

const viewEmployeePerformance = () => {
  router.push('/performance')
}

const exportData = () => {
  message.success('数据导出中... (Demo)')
}

const closePeriod = () => {
  message.warning('关闭周期 (Demo)')
}

const viewPeriodDetail = (record) => {
  message.info(`查看周期详情: ${record.period_name}`)
}

const copyPeriod = (record) => {
  message.success(`复制配置: ${record.period_name}`)
}
</script>

<style scoped>
.performance-period {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.current-period-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.current-period-card :deep(.ant-card-body) {
  padding: 32px;
}

.period-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.period-icon {
  font-size: 64px;
  flex-shrink: 0;
}

.period-info {
  flex: 1;
}

.period-info h2 {
  color: white;
  font-size: 28px;
  margin: 0;
}

.period-progress {
  text-align: center;
}

.progress-text {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  font-size: 24px;
  opacity: 0.8;
}

.info-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
}

.current-period-card :deep(.ant-divider) {
  border-color: rgba(255, 255, 255, 0.3);
}

.current-period-card :deep(.ant-tag) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}
</style>
