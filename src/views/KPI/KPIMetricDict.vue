<template>
  <div class="kpi-metric-dict">
    <a-page-header
      title="KPI指标字典"
      sub-title="定义业务指标计算规则，自动聚合多源数据"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="createMetric">
            <template #icon><PlusOutlined /></template>
            创建指标
          </a-button>
          <a-button @click="batchCalculate">
            <template #icon><ThunderboltOutlined /></template>
            批量试算
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <!-- 指标分类标签 -->
    <a-card style="margin-bottom: 16px">
      <a-tabs v-model:activeKey="activeCategory">
        <a-tab-pane key="all" tab="全部指标">
          <a-badge :count="metrics.length" :overflow-count="99" />
        </a-tab-pane>
        <a-tab-pane key="sales" tab="销售类">
          <a-badge :count="metrics.filter(m => m.category === 'sales').length" />
        </a-tab-pane>
        <a-tab-pane key="production" tab="生产类">
          <a-badge :count="metrics.filter(m => m.category === 'production').length" />
        </a-tab-pane>
        <a-tab-pane key="quality" tab="质量类">
          <a-badge :count="metrics.filter(m => m.category === 'quality').length" />
        </a-tab-pane>
        <a-tab-pane key="attendance" tab="考勤类">
          <a-badge :count="metrics.filter(m => m.category === 'attendance').length" />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 指标卡片列表 -->
    <a-row :gutter="[16, 16]">
      <a-col
        v-for="metric in filteredMetrics"
        :key="metric.metric_id"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        :xl="8"
      >
        <a-card
          hoverable
          :class="['metric-card', metric.is_active ? '' : 'metric-disabled']"
        >
          <template #title>
            <div class="metric-header">
              <span class="metric-icon" :style="{ background: getCategoryColor(metric.category) }">
                {{ getCategoryIcon(metric.category) }}
              </span>
              <div class="metric-title">
                <div>{{ metric.metric_name }}</div>
                <a-tag :color="getCategoryColor(metric.category)" size="small">
                  {{ getCategoryName(metric.category) }}
                </a-tag>
              </div>
            </div>
          </template>

          <template #extra>
            <a-switch
              v-model:checked="metric.is_active"
              checked-children="启用"
              un-checked-children="停用"
              size="small"
            />
          </template>

          <div class="metric-content">
            <!-- 指标描述 -->
            <div class="metric-description">
              {{ metric.description }}
            </div>

            <!-- 数据来源 -->
            <a-divider style="margin: 12px 0" />
            <div class="metric-info-item">
              <DatabaseOutlined style="color: #1890ff; margin-right: 8px" />
              <span class="label">数据来源:</span>
              <span class="value">{{ metric.data_source }}</span>
            </div>

            <!-- 计算公式 -->
            <div class="metric-info-item">
              <CalculatorOutlined style="color: #52c41a; margin-right: 8px" />
              <span class="label">计算方式:</span>
              <span class="value">{{ metric.calculation_type }}</span>
            </div>

            <!-- 刷新频率 -->
            <div class="metric-info-item">
              <ClockCircleOutlined style="color: #faad14; margin-right: 8px" />
              <span class="label">刷新频率:</span>
              <span class="value">{{ metric.refresh_frequency }}</span>
            </div>

            <!-- 负责人 -->
            <div class="metric-info-item">
              <UserOutlined style="color: #722ed1; margin-right: 8px" />
              <span class="label">负责人:</span>
              <span class="value">{{ metric.owner }}</span>
            </div>

            <!-- 计算公式预览 -->
            <a-divider style="margin: 12px 0" />
            <div class="formula-preview">
              <div class="formula-label">
                <CodeOutlined /> 计算公式
              </div>
              <div class="formula-content">
                <pre>{{ metric.formula_preview }}</pre>
              </div>
            </div>

            <!-- 试算结果 -->
            <div v-if="metric.last_calculation" class="calculation-result">
              <a-divider style="margin: 12px 0" />
              <div class="result-header">
                <LineChartOutlined /> 最近试算结果
              </div>
              <div class="result-value">
                <span class="value-number">{{ metric.last_calculation.value }}</span>
                <span class="value-unit">{{ metric.last_calculation.unit }}</span>
                <a-tag
                  v-if="metric.last_calculation.trend === 'up'"
                  color="success"
                  style="margin-left: 8px"
                >
                  <ArrowUpOutlined /> {{ metric.last_calculation.change }}
                </a-tag>
                <a-tag
                  v-else-if="metric.last_calculation.trend === 'down'"
                  color="error"
                  style="margin-left: 8px"
                >
                  <ArrowDownOutlined /> {{ metric.last_calculation.change }}
                </a-tag>
              </div>
              <div class="result-time">
                更新时间: {{ metric.last_calculation.time }}
              </div>
            </div>

            <!-- 操作按钮 -->
            <a-divider style="margin: 12px 0" />
            <a-space style="width: 100%; justify-content: space-between">
              <a-button type="primary" size="small" @click="testCalculate(metric)">
                <ThunderboltOutlined /> 试算
              </a-button>
              <a-dropdown>
                <a-button size="small">
                  更多 <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="viewFormula(metric)">
                      <EyeOutlined /> 查看完整公式
                    </a-menu-item>
                    <a-menu-item @click="viewHistory(metric)">
                      <HistoryOutlined /> 计算历史
                    </a-menu-item>
                    <a-menu-item @click="editMetric(metric)">
                      <EditOutlined /> 编辑
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item danger @click="deleteMetric(metric)">
                      <DeleteOutlined /> 删除
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 公式详情模态框 -->
    <a-modal
      v-model:visible="formulaModalVisible"
      title="计算公式详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedMetric">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="指标名称">
            {{ selectedMetric.metric_name }}
          </a-descriptions-item>
          <a-descriptions-item label="数据来源">
            {{ selectedMetric.data_source }}
          </a-descriptions-item>
          <a-descriptions-item label="计算类型">
            {{ selectedMetric.calculation_type }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>SQL 查询语句</a-divider>
        <div class="code-block">
          <pre>{{ selectedMetric.formula_full }}</pre>
        </div>

        <a-divider>参数说明</a-divider>
        <a-table
          :columns="paramColumns"
          :data-source="selectedMetric.params"
          :pagination="false"
          size="small"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CodeOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownOutlined,
  EyeOutlined,
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 当前分类
const activeCategory = ref('all')

// Mock KPI指标数据
const metrics = ref([
  {
    metric_id: 'KPI_ORDER_ONTIME_RATE',
    metric_name: '订单准时率',
    category: 'sales',
    description: '按期完成订单数占总订单数的百分比，反映销售团队的交付效率',
    data_source: 'ERP订单表',
    calculation_type: 'SQL聚合',
    refresh_frequency: '每日09:00',
    owner: '销售部-数据分析师',
    is_active: true,
    formula_preview: `(按期完成订单数 / 总订单数) × 100%`,
    formula_full: `SELECT
  (COUNT(*) FILTER(WHERE delivered_date <= expected_date) * 100.0 / COUNT(*)) AS ontime_rate
FROM orders
WHERE salesman_id = :employee_id
  AND DATE_TRUNC('quarter', create_time) = :period
  AND order_status = '已交付'`,
    params: [
      { name: 'employee_id', type: 'string', required: true, description: '销售员ID' },
      { name: 'period', type: 'quarter', required: true, description: '统计周期（季度）' }
    ],
    last_calculation: {
      value: '92.5',
      unit: '%',
      trend: 'up',
      change: '+3.2%',
      time: '2025-12-11 09:00:00'
    }
  },
  {
    metric_id: 'KPI_CUSTOMER_SATISFACTION',
    metric_name: '客户满意度',
    category: 'sales',
    description: '客户评分的平均值，反映客户对产品和服务的满意程度',
    data_source: 'CRM评分表',
    calculation_type: 'SQL聚合',
    refresh_frequency: '每日09:00',
    owner: '客服部-质量专员',
    is_active: true,
    formula_preview: `AVG(评分) FROM 客户评价表`,
    formula_full: `SELECT
  AVG(rating_score) AS avg_satisfaction
FROM customer_ratings
WHERE salesman_id = :employee_id
  AND rating_date >= :period_start
  AND rating_date <= :period_end`,
    params: [
      { name: 'employee_id', type: 'string', required: true, description: '销售员ID' },
      { name: 'period_start', type: 'date', required: true, description: '开始日期' },
      { name: 'period_end', type: 'date', required: true, description: '结束日期' }
    ],
    last_calculation: {
      value: '4.5',
      unit: '分',
      trend: 'up',
      change: '+0.2',
      time: '2025-12-11 09:00:00'
    }
  },
  {
    metric_id: 'KPI_ATTENDANCE_RATE',
    metric_name: '出勤率',
    category: 'attendance',
    description: '员工正常出勤天数占应出勤天数的百分比',
    data_source: '钉钉考勤表',
    calculation_type: 'SQL聚合',
    refresh_frequency: '实时 (Webhook)',
    owner: '人事部-考勤专员',
    is_active: true,
    formula_preview: `(正常出勤天数 / 应出勤天数) × 100%`,
    formula_full: `SELECT
  ((workdays - leave_days - absent_days) * 100.0 / workdays) AS attendance_rate
FROM attendance
WHERE employee_id = :employee_id
  AND DATE_TRUNC('month', attendance_date) = :period`,
    params: [
      { name: 'employee_id', type: 'string', required: true, description: '员工ID' },
      { name: 'period', type: 'month', required: true, description: '统计周期（月度）' }
    ],
    last_calculation: {
      value: '96.0',
      unit: '%',
      trend: 'down',
      change: '-1.5%',
      time: '2025-12-11 15:30:00'
    }
  },
  {
    metric_id: 'KPI_SALES_CONVERSION',
    metric_name: '销售转化率',
    category: 'sales',
    description: '成交客户数占总线索数的百分比，衡量销售效率',
    data_source: 'CRM线索表+订单表',
    calculation_type: 'SQL多表关联',
    refresh_frequency: '每日08:30',
    owner: '销售部-CRM管理员',
    is_active: true,
    formula_preview: `(成交客户数 / 线索数) × 100%`,
    formula_full: `SELECT
  (COUNT(DISTINCT o.customer_id) * 100.0 / COUNT(DISTINCT l.lead_id)) AS conversion_rate
FROM leads l
LEFT JOIN orders o ON o.customer_id = l.customer_id
WHERE l.salesman_id = :employee_id
  AND DATE_TRUNC('month', l.create_time) = :period`,
    params: [
      { name: 'employee_id', type: 'string', required: true, description: '销售员ID' },
      { name: 'period', type: 'month', required: true, description: '统计周期（月度）' }
    ],
    last_calculation: {
      value: '28.3',
      unit: '%',
      trend: 'up',
      change: '+5.1%',
      time: '2025-12-11 08:30:00'
    }
  },
  {
    metric_id: 'KPI_PRODUCTION_YIELD',
    metric_name: '生产良品率',
    category: 'production',
    description: '合格品数量占总产量的百分比，反映生产质量',
    data_source: 'MES生产表',
    calculation_type: 'SQL聚合',
    refresh_frequency: '每小时',
    owner: '生产部-质量工程师',
    is_active: true,
    formula_preview: `(合格品数 / 总产量) × 100%`,
    formula_full: `SELECT
  (SUM(qualified_quantity) * 100.0 / SUM(total_quantity)) AS yield_rate
FROM production_records
WHERE workshop_id = :workshop_id
  AND production_date >= :date_start
  AND production_date <= :date_end`,
    params: [
      { name: 'workshop_id', type: 'string', required: true, description: '车间ID' },
      { name: 'date_start', type: 'date', required: true, description: '开始日期' },
      { name: 'date_end', type: 'date', required: true, description: '结束日期' }
    ],
    last_calculation: {
      value: '98.2',
      unit: '%',
      trend: 'up',
      change: '+0.5%',
      time: '2025-12-11 15:00:00'
    }
  },
  {
    metric_id: 'KPI_EQUIPMENT_UTILIZATION',
    metric_name: '设备利用率',
    category: 'production',
    description: '设备实际运行时间占可用时间的百分比',
    data_source: 'MES设备表',
    calculation_type: 'SQL聚合',
    refresh_frequency: '每小时',
    owner: '设备部-工程师',
    is_active: true,
    formula_preview: `(运行时间 / 可用时间) × 100%`,
    formula_full: `SELECT
  (SUM(running_hours) * 100.0 / SUM(available_hours)) AS utilization_rate
FROM equipment_logs
WHERE equipment_id = :equipment_id
  AND log_date >= :date_start
  AND log_date <= :date_end`,
    params: [
      { name: 'equipment_id', type: 'string', required: true, description: '设备ID' },
      { name: 'date_start', type: 'date', required: true, description: '开始日期' },
      { name: 'date_end', type: 'date', required: true, description: '结束日期' }
    ],
    last_calculation: {
      value: '85.7',
      unit: '%',
      trend: 'down',
      change: '-2.3%',
      time: '2025-12-11 15:00:00'
    }
  },
  {
    metric_id: 'KPI_DEFECT_RATE',
    metric_name: '质量缺陷率',
    category: 'quality',
    description: '检测到的缺陷产品数占总检测数的百分比',
    data_source: 'QMS质检表',
    calculation_type: 'SQL聚合',
    refresh_frequency: '每日10:00',
    owner: '质量部-QA工程师',
    is_active: false,
    formula_preview: `(缺陷数 / 总检测数) × 100%`,
    formula_full: `SELECT
  (COUNT(*) FILTER(WHERE result = 'DEFECT') * 100.0 / COUNT(*)) AS defect_rate
FROM quality_inspections
WHERE inspector_id = :inspector_id
  AND inspection_date >= :date_start
  AND inspection_date <= :date_end`,
    params: [
      { name: 'inspector_id', type: 'string', required: true, description: '质检员ID' },
      { name: 'date_start', type: 'date', required: true, description: '开始日期' },
      { name: 'date_end', type: 'date', required: true, description: '结束日期' }
    ],
    last_calculation: {
      value: '1.8',
      unit: '%',
      trend: 'down',
      change: '-0.3%',
      time: '2025-12-11 10:00:00'
    }
  },
  {
    metric_id: 'KPI_OKR_COMPLETION',
    metric_name: 'OKR完成度',
    category: 'sales',
    description: '员工OKR目标的完成百分比',
    data_source: '平台OKR表',
    calculation_type: 'JavaScript计算',
    refresh_frequency: '实时',
    owner: '人事部-绩效专员',
    is_active: true,
    formula_preview: `SUM(关键结果权重 × 完成度)`,
    formula_full: `// JavaScript计算逻辑
const okr = await getOKR(employee_id, period);
let totalScore = 0;
for (const kr of okr.key_results) {
  totalScore += kr.weight * kr.completion_rate;
}
return totalScore;`,
    params: [
      { name: 'employee_id', type: 'string', required: true, description: '员工ID' },
      { name: 'period', type: 'quarter', required: true, description: '统计周期（季度）' }
    ],
    last_calculation: {
      value: '88.0',
      unit: '%',
      trend: 'up',
      change: '+12.0%',
      time: '2025-12-11 16:00:00'
    }
  }
])

// 过滤后的指标
const filteredMetrics = computed(() => {
  if (activeCategory.value === 'all') {
    return metrics.value
  }
  return metrics.value.filter(m => m.category === activeCategory.value)
})

// 模态框
const formulaModalVisible = ref(false)
const selectedMetric = ref(null)

// 参数表格列
const paramColumns = [
  { title: '参数名', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '必填', dataIndex: 'required', key: 'required', customRender: ({ text }) => text ? '是' : '否' },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

// 工具方法
const getCategoryColor = (category) => {
  const colors = {
    sales: '#1890ff',
    production: '#52c41a',
    quality: '#faad14',
    attendance: '#722ed1'
  }
  return colors[category] || '#d9d9d9'
}

const getCategoryIcon = (category) => {
  const icons = {
    sales: '💰',
    production: '🏭',
    quality: '✅',
    attendance: '📅'
  }
  return icons[category] || '📊'
}

const getCategoryName = (category) => {
  const names = {
    sales: '销售类',
    production: '生产类',
    quality: '质量类',
    attendance: '考勤类'
  }
  return names[category] || category
}

// 操作方法
const createMetric = () => {
  message.info('打开创建KPI指标对话框 (Demo)')
}

const batchCalculate = () => {
  message.loading('正在批量试算所有指标...', 2)
  setTimeout(() => {
    message.success('批量试算完成！8个指标已更新')
  }, 2000)
}

const testCalculate = (metric) => {
  message.loading(`正在试算 "${metric.metric_name}"...`, 1.5)
  setTimeout(() => {
    message.success(`试算成功！${metric.metric_name}: ${metric.last_calculation.value}${metric.last_calculation.unit}`)
  }, 1500)
}

const viewFormula = (metric) => {
  selectedMetric.value = metric
  formulaModalVisible.value = true
}

const viewHistory = (metric) => {
  message.info(`查看计算历史: ${metric.metric_name} (Demo)`)
}

const editMetric = (metric) => {
  message.info(`编辑指标: ${metric.metric_name} (Demo)`)
}

const deleteMetric = (metric) => {
  message.error(`删除指标: ${metric.metric_name} (Demo)`)
}
</script>

<style scoped>
.kpi-metric-dict {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.metric-card {
  height: 100%;
  transition: all 0.3s;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.metric-disabled {
  opacity: 0.6;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.metric-title {
  flex: 1;
  min-width: 0;
}

.metric-title > div:first-child {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-content {
  font-size: 13px;
}

.metric-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.metric-info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.metric-info-item .label {
  color: #999;
  margin-right: 4px;
}

.metric-info-item .value {
  color: #333;
  font-weight: 500;
}

.formula-preview {
  background: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}

.formula-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.formula-content pre {
  margin: 0;
  font-size: 11px;
  color: #1890ff;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.calculation-result {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.result-header {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.result-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.value-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.value-unit {
  font-size: 16px;
  margin-left: 4px;
  opacity: 0.9;
}

.result-time {
  font-size: 11px;
  opacity: 0.8;
}

.code-block {
  background: #1e1e1e;
  color: #00ff00;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
}

:deep(.ant-card-head) {
  border-bottom: 2px solid #f0f0f0;
}
</style>
