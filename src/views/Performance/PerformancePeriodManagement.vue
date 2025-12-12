<template>
  <div class="performance-period">
    <!-- 功能说明卡片 -->
    <a-card class="intro-card" size="small">
      <div class="intro-content">
        <div class="intro-text">
          <h3>📅 绩效周期管理</h3>
          <p>统一管理考核周期，自动开启/关闭评审入口，确保评审流程规范化执行</p>
        </div>
        <a-button type="primary" @click="createPeriod">
          <PlusOutlined /> 创建周期
        </a-button>
      </div>
    </a-card>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 当前周期 -->
      <a-col :span="16">
        <a-card title="当前周期" size="small" class="current-period-card">
          <div class="period-main">
            <div class="period-left">
              <h2 class="period-title">{{ currentPeriod.period_name }}</h2>
              <div class="period-meta">
                <a-tag color="processing">
                  <ClockCircleOutlined /> {{ currentPeriod.status_text }}
                </a-tag>
                <span class="period-date">
                  <CalendarOutlined /> {{ currentPeriod.start_date }} ~ {{ currentPeriod.end_date }}
                </span>
              </div>
            </div>
            <div class="period-right">
              <a-progress
                type="circle"
                :percent="currentPeriod.progress"
                :width="80"
                :stroke-width="8"
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
              />
              <div class="days-left">剩余 {{ currentPeriod.days_left }} 天</div>
            </div>
          </div>

          <a-divider style="margin: 16px 0" />

          <a-row :gutter="16" class="period-stats">
            <a-col :span="8">
              <div class="stat-item">
                <TeamOutlined class="stat-icon" style="color: #1890ff" />
                <div class="stat-content">
                  <div class="stat-label">参与员工</div>
                  <div class="stat-value">{{ currentPeriod.employee_count }}人</div>
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="stat-item">
                <DashboardOutlined class="stat-icon" style="color: #52c41a" />
                <div class="stat-content">
                  <div class="stat-label">关联KPI</div>
                  <div class="stat-value">{{ currentPeriod.kpi_count }}个</div>
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="stat-item">
                <CheckCircleOutlined class="stat-icon" style="color: #faad14" />
                <div class="stat-content">
                  <div class="stat-label">完成评审</div>
                  <div class="stat-value">234/{{ currentPeriod.employee_count }}</div>
                </div>
              </div>
            </a-col>
          </a-row>

          <a-divider style="margin: 16px 0" />

          <div style="margin-bottom: 12px">
            <strong style="font-size: 13px">关联KPI指标：</strong>
          </div>
          <a-space wrap :size="8">
            <a-tag
              v-for="kpi in currentPeriod.linked_kpis"
              :key="kpi.id"
              :color="kpi.color"
            >
              {{ kpi.icon }} {{ kpi.name }}
            </a-tag>
          </a-space>

          <a-divider style="margin: 16px 0" />

          <a-space :size="8">
            <a-button type="primary" size="small" @click="viewEmployeePerformance">
              查看员工绩效
            </a-button>
            <a-button size="small" @click="exportData">
              <DownloadOutlined /> 导出
            </a-button>
            <a-button size="small" danger @click="closePeriod" :disabled="currentPeriod.status !== 'ACTIVE'">
              关闭周期
            </a-button>
          </a-space>
        </a-card>
      </a-col>

      <!-- 历史周期 -->
      <a-col :span="8">
        <a-card title="历史周期" size="small" class="history-card">
          <div class="history-list">
            <div
              v-for="period in historyPeriods"
              :key="period.period_id"
              class="history-item"
              @click="viewPeriodDetail(period)"
            >
              <div class="history-header">
                <strong>{{ period.period_name }}</strong>
                <a-badge :status="getStatusBadge(period.status)" />
              </div>
              <div class="history-date">{{ period.start_date }} ~ {{ period.end_date }}</div>
              <div class="history-stats">
                <span><TeamOutlined /> {{ period.employee_count }}人</span>
                <span><DashboardOutlined /> {{ period.kpi_count }}个</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
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
  CheckCircleOutlined,
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
    period_name: '2025 Q3',
    start_date: '2025-07-01',
    end_date: '2025-09-30',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 315,
    kpi_count: 4
  },
  {
    period_id: 'PERIOD_2025_Q2',
    period_name: '2025 Q2',
    start_date: '2025-04-01',
    end_date: '2025-06-30',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 308,
    kpi_count: 3
  },
  {
    period_id: 'PERIOD_2025_Q1',
    period_name: '2025 Q1',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 302,
    kpi_count: 3
  },
  {
    period_id: 'PERIOD_2024_Q4',
    period_name: '2024 Q4',
    start_date: '2024-10-01',
    end_date: '2024-12-31',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 298,
    kpi_count: 3
  },
  {
    period_id: 'PERIOD_2024_Q3',
    period_name: '2024 Q3',
    start_date: '2024-07-01',
    end_date: '2024-09-30',
    status: 'CLOSED',
    status_text: '已关闭',
    employee_count: 292,
    kpi_count: 3
  }
])

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
  padding: 16px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

/* 功能说明卡片 */
.intro-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.intro-card :deep(.ant-card-body) {
  padding: 16px 20px;
}

.intro-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.intro-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: white;
  font-weight: 600;
}

.intro-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

/* 当前周期卡片 */
.current-period-card {
  height: 100%;
}

.current-period-card :deep(.ant-card-body) {
  padding: 20px;
}

.current-period-card :deep(.ant-card-head) {
  padding: 0 20px;
  min-height: 40px;
}

.period-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-left {
  flex: 1;
}

.period-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
}

.period-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-date {
  font-size: 13px;
  color: #666;
}

.period-right {
  text-align: center;
}

.days-left {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.period-stats {
  margin: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 历史周期卡片 */
.history-card {
  height: 100%;
}

.history-card :deep(.ant-card-body) {
  padding: 12px;
}

.history-card :deep(.ant-card-head) {
  padding: 0 12px;
  min-height: 40px;
}

.history-list {
  max-height: 460px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #fafafa;
  border-color: #1890ff;
  transform: translateX(4px);
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.history-header strong {
  font-size: 14px;
  color: #333;
}

.history-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.history-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.history-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
