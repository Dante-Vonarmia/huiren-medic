<template>
  <div class="kpi-metric-dict">
    <div class="page-header">
      <div class="header-content">
        <h1>KPI指标字典</h1>
        <p class="header-desc">
          📌 定义业务指标计算规则，自动从ERP/CRM/MES等系统拉取数据并计算<br>
          💡 <strong>试算</strong>=模拟执行SQL公式查看结果 | <strong>创建指标</strong>=配置新的KPI计算规则
        </p>
      </div>
      <a-space size="middle">
        <a-button type="primary" @click="createMetric" size="large">
          <template #icon><PlusOutlined /></template>
          创建指标
        </a-button>
        <a-button @click="batchCalculate" size="large">
          <template #icon><ThunderboltOutlined /></template>
          批量试算
        </a-button>
      </a-space>
    </div>

    <!-- 指标分类标签 -->
    <div class="category-tabs">
      <div
        v-for="cat in categories"
        :key="cat.key"
        :class="['category-tab', { active: activeCategory === cat.key }]"
        @click="activeCategory = cat.key"
      >
        <span class="tab-icon">{{ cat.icon }}</span>
        <span class="tab-name">{{ cat.name }}</span>
        <span class="tab-count">{{ cat.count }}</span>
      </div>
    </div>

    <!-- 指标卡片列表 -->
    <div class="metrics-grid">
      <div
        v-for="metric in filteredMetrics"
        :key="metric.metric_id"
        :class="['metric-card', { disabled: !metric.is_active }]"
      >
        <!-- 卡片头部 -->
        <div class="card-header" :style="{ background: getCategoryGradient(metric.category) }">
          <div class="header-left">
            <div class="metric-icon">{{ getCategoryIcon(metric.category) }}</div>
            <div class="metric-info">
              <h3>{{ metric.metric_name }}</h3>
              <span class="metric-category">{{ getCategoryName(metric.category) }}</span>
            </div>
          </div>
          <a-switch
            v-model:checked="metric.is_active"
            size="small"
          />
        </div>

        <!-- 卡片内容 -->
        <div class="card-body">
          <!-- 描述 -->
          <p class="metric-description">{{ metric.description }}</p>

          <!-- 数据流说明 -->
          <div class="data-flow-info">
            <div class="flow-step">
              <DatabaseOutlined class="flow-icon" />
              <span>从 <strong>{{ metric.data_source }}</strong> 拉取数据</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <CalculatorOutlined class="flow-icon" />
              <span>执行 <strong>{{ metric.calculation_type }}</strong></span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <CheckCircleOutlined class="flow-icon" />
              <span>得出结果</span>
            </div>
          </div>

          <!-- 试算结果 -->
          <div v-if="metric.last_calculation" class="result-section">
            <div class="result-label">最近试算结果</div>
            <div class="result-display">
              <span class="result-value">{{ metric.last_calculation.value }}</span>
              <span class="result-unit">{{ metric.last_calculation.unit }}</span>
              <a-tag
                v-if="metric.last_calculation.trend === 'up'"
                color="success"
              >
                <ArrowUpOutlined /> {{ metric.last_calculation.change }}
              </a-tag>
              <a-tag
                v-else-if="metric.last_calculation.trend === 'down'"
                color="error"
              >
                <ArrowDownOutlined /> {{ metric.last_calculation.change }}
              </a-tag>
            </div>
            <div class="result-time">{{ metric.last_calculation.time }}</div>
          </div>

          <!-- 指标详情 -->
          <div class="metric-details">
            <div class="detail-item">
              <DatabaseOutlined class="detail-icon" />
              <div class="detail-content">
                <span class="detail-label">数据来源</span>
                <span class="detail-value">{{ metric.data_source }}</span>
              </div>
            </div>
            <div class="detail-item">
              <CalculatorOutlined class="detail-icon" />
              <div class="detail-content">
                <span class="detail-label">计算方式</span>
                <span class="detail-value">{{ metric.calculation_type }}</span>
              </div>
            </div>
            <div class="detail-item">
              <ClockCircleOutlined class="detail-icon" />
              <div class="detail-content">
                <span class="detail-label">刷新频率</span>
                <span class="detail-value">{{ metric.refresh_frequency }}</span>
              </div>
            </div>
            <div class="detail-item">
              <UserOutlined class="detail-icon" />
              <div class="detail-content">
                <span class="detail-label">负责人</span>
                <span class="detail-value">{{ metric.owner }}</span>
              </div>
            </div>
          </div>

          <!-- 公式预览 -->
          <div class="formula-section">
            <div class="formula-header">
              <CodeOutlined /> 计算公式
            </div>
            <div class="formula-code">{{ metric.formula_preview }}</div>
          </div>
        </div>

        <!-- 卡片底部操作 -->
        <div class="card-footer">
          <a-button type="primary" size="small" @click="testCalculate(metric)">
            <ThunderboltOutlined /> 试算
          </a-button>
          <a-button size="small" @click="viewFormula(metric)">
            <EyeOutlined /> 查看公式
          </a-button>
          <a-dropdown>
            <a-button size="small">
              <MoreOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
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
        </div>
      </div>
    </div>

    <!-- 创建指标模态框 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="创建KPI指标"
      width="800px"
      @ok="handleCreateMetric"
      ok-text="创建"
      cancel-text="取消"
    >
      <a-form :model="newMetric" layout="vertical">
        <a-form-item label="指标名称" required>
          <a-input v-model:value="newMetric.name" placeholder="例如：订单准时率" />
        </a-form-item>

        <a-form-item label="指标分类" required>
          <a-select v-model:value="newMetric.category" placeholder="选择分类">
            <a-select-option value="sales">销售类</a-select-option>
            <a-select-option value="production">生产类</a-select-option>
            <a-select-option value="quality">质量类</a-select-option>
            <a-select-option value="attendance">考勤类</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="指标描述" required>
          <a-textarea
            v-model:value="newMetric.description"
            placeholder="例如：按期完成订单数占总订单数的百分比"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="数据来源" required>
          <a-select v-model:value="newMetric.dataSource" placeholder="选择数据源">
            <a-select-option value="ERP订单表">ERP订单表</a-select-option>
            <a-select-option value="CRM客户表">CRM客户表</a-select-option>
            <a-select-option value="MES生产表">MES生产表</a-select-option>
            <a-select-option value="钉钉考勤表">钉钉考勤表</a-select-option>
            <a-select-option value="平台OKR表">平台OKR表</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="计算类型" required>
          <a-select v-model:value="newMetric.calculationType" placeholder="选择计算类型">
            <a-select-option value="SQL聚合">SQL聚合</a-select-option>
            <a-select-option value="SQL多表关联">SQL多表关联</a-select-option>
            <a-select-option value="JavaScript计算">JavaScript计算</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="计算公式" required>
          <a-textarea
            v-model:value="newMetric.formula"
            placeholder="输入SQL查询或JavaScript代码"
            :rows="6"
            style="font-family: monospace;"
          />
          <div style="margin-top: 8px; font-size: 12px; color: #8c8c8c;">
            💡 提示：可以使用变量如 :employee_id, :period 等
          </div>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="刷新频率" required>
              <a-select v-model:value="newMetric.refreshFrequency">
                <a-select-option value="实时">实时</a-select-option>
                <a-select-option value="每小时">每小时</a-select-option>
                <a-select-option value="每日09:00">每日09:00</a-select-option>
                <a-select-option value="每周一">每周一</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人" required>
              <a-input v-model:value="newMetric.owner" placeholder="例如：销售部-数据分析师" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 试算参数模态框 -->
    <a-modal
      v-model:visible="testCalcModalVisible"
      title="指标试算"
      width="700px"
      @ok="handleTestCalculate"
      ok-text="执行试算"
      cancel-text="取消"
    >
      <div v-if="selectedMetric">
        <a-alert
          message="试算说明"
          description="试算会模拟执行计算公式，从数据源拉取真实数据并计算指标值。请先配置必要的参数。"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />

        <a-descriptions title="指标信息" :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="指标名称" :span="2">
            {{ selectedMetric.metric_name }}
          </a-descriptions-item>
          <a-descriptions-item label="数据来源">
            {{ selectedMetric.data_source }}
          </a-descriptions-item>
          <a-descriptions-item label="计算类型">
            {{ selectedMetric.calculation_type }}
          </a-descriptions-item>
        </a-descriptions>

        <h4 style="margin-bottom: 12px;">计算参数</h4>
        <a-form layout="vertical">
          <a-form-item
            v-for="param in selectedMetric.params"
            :key="param.name"
            :label="param.description"
            :required="param.required"
          >
            <a-input
              v-if="param.type === 'string'"
              v-model:value="testParams[param.name]"
              :placeholder="`请输入${param.description}`"
            />
            <a-date-picker
              v-else-if="param.type === 'date'"
              v-model:value="testParams[param.name]"
              style="width: 100%"
            />
            <a-select
              v-else-if="param.type === 'quarter'"
              v-model:value="testParams[param.name]"
              placeholder="选择季度"
            >
              <a-select-option value="Q1">Q1 (1-3月)</a-select-option>
              <a-select-option value="Q2">Q2 (4-6月)</a-select-option>
              <a-select-option value="Q3">Q3 (7-9月)</a-select-option>
              <a-select-option value="Q4">Q4 (10-12月)</a-select-option>
            </a-select>
            <a-select
              v-else-if="param.type === 'month'"
              v-model:value="testParams[param.name]"
              placeholder="选择月份"
            >
              <a-select-option value="2025-12">2025年12月</a-select-option>
              <a-select-option value="2025-11">2025年11月</a-select-option>
              <a-select-option value="2025-10">2025年10月</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>

        <div class="formula-preview" style="margin-top: 16px;">
          <h4>将执行的SQL公式：</h4>
          <div class="code-block" style="margin-top: 8px;">
            <pre>{{ selectedMetric.formula_full }}</pre>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 公式详情模态框 -->
    <a-modal
      v-model:visible="formulaModalVisible"
      title="计算公式详情"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedMetric" class="formula-modal">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="指标名称" :span="2">
            {{ selectedMetric.metric_name }}
          </a-descriptions-item>
          <a-descriptions-item label="数据来源">
            {{ selectedMetric.data_source }}
          </a-descriptions-item>
          <a-descriptions-item label="计算类型">
            {{ selectedMetric.calculation_type }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="modal-section">
          <h4>完整计算公式</h4>
          <div class="code-block">
            <pre>{{ selectedMetric.formula_full }}</pre>
          </div>
        </div>

        <div class="modal-section">
          <h4>参数说明</h4>
          <a-table
            :columns="paramColumns"
            :data-source="selectedMetric.params"
            :pagination="false"
            size="small"
          />
        </div>
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
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

// 当前分类
const activeCategory = ref('all')

// 分类配置
const categories = computed(() => [
  { key: 'all', name: '全部指标', icon: '📊', count: metrics.value.length },
  { key: 'sales', name: '销售类', icon: '💰', count: metrics.value.filter(m => m.category === 'sales').length },
  { key: 'production', name: '生产类', icon: '🏭', count: metrics.value.filter(m => m.category === 'production').length },
  { key: 'quality', name: '质量类', icon: '✅', count: metrics.value.filter(m => m.category === 'quality').length },
  { key: 'attendance', name: '考勤类', icon: '📅', count: metrics.value.filter(m => m.category === 'attendance').length }
])

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
const createModalVisible = ref(false)
const testCalcModalVisible = ref(false)
const selectedMetric = ref(null)

// 新建指标表单数据
const newMetric = ref({
  name: '',
  category: '',
  description: '',
  dataSource: '',
  calculationType: '',
  formula: '',
  refreshFrequency: '每日09:00',
  owner: ''
})

// 试算参数
const testParams = ref({})

// 参数表格列
const paramColumns = [
  { title: '参数名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '必填', dataIndex: 'required', key: 'required', width: 80, customRender: ({ text }) => text ? '是' : '否' },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

// 工具方法
const getCategoryGradient = (category) => {
  const gradients = {
    sales: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    production: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    quality: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    attendance: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
  return gradients[category] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
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
  // 重置表单
  newMetric.value = {
    name: '',
    category: '',
    description: '',
    dataSource: '',
    calculationType: '',
    formula: '',
    refreshFrequency: '每日09:00',
    owner: ''
  }
  createModalVisible.value = true
}

const handleCreateMetric = () => {
  // 验证表单
  if (!newMetric.value.name || !newMetric.value.category || !newMetric.value.formula) {
    message.warning('请填写必填字段')
    return
  }

  // 模拟创建
  message.loading('正在创建指标...', 1.5)
  setTimeout(() => {
    message.success(`指标"${newMetric.value.name}"创建成功！`)
    createModalVisible.value = false

    // 添加到指标列表
    const newId = `KPI_${Date.now()}`
    metrics.value.unshift({
      metric_id: newId,
      metric_name: newMetric.value.name,
      category: newMetric.value.category,
      description: newMetric.value.description,
      data_source: newMetric.value.dataSource,
      calculation_type: newMetric.value.calculationType,
      refresh_frequency: newMetric.value.refreshFrequency,
      owner: newMetric.value.owner,
      is_active: true,
      formula_preview: newMetric.value.formula.substring(0, 50) + '...',
      formula_full: newMetric.value.formula,
      params: [],
      last_calculation: null
    })
  }, 1500)
}

const batchCalculate = () => {
  message.loading('正在批量试算所有指标...', 2)
  setTimeout(() => {
    message.success('批量试算完成！8个指标已更新')
  }, 2000)
}

const testCalculate = (metric) => {
  selectedMetric.value = metric
  // 初始化试算参数
  testParams.value = {}
  if (metric.params) {
    metric.params.forEach(param => {
      testParams.value[param.name] = ''
    })
  }
  testCalcModalVisible.value = true
}

const handleTestCalculate = () => {
  // 验证参数
  const requiredParams = selectedMetric.value.params?.filter(p => p.required) || []
  const missingParams = requiredParams.filter(p => !testParams.value[p.name])

  if (missingParams.length > 0) {
    message.warning('请填写所有必填参数')
    return
  }

  // 模拟执行试算
  message.loading(`正在执行SQL查询并计算"${selectedMetric.value.metric_name}"...`, 2)

  setTimeout(() => {
    // 随机生成一个结果
    const randomValue = (Math.random() * 100).toFixed(1)
    const randomChange = (Math.random() * 10 - 5).toFixed(1)

    message.success(`试算成功！${selectedMetric.value.metric_name}: ${randomValue}${selectedMetric.value.last_calculation?.unit || '%'}`)

    // 更新试算结果
    if (selectedMetric.value.last_calculation) {
      selectedMetric.value.last_calculation.value = randomValue
      selectedMetric.value.last_calculation.change = `${randomChange > 0 ? '+' : ''}${randomChange}${selectedMetric.value.last_calculation.unit}`
      selectedMetric.value.last_calculation.trend = randomChange > 0 ? 'up' : 'down'
      selectedMetric.value.last_calculation.time = new Date().toLocaleString('zh-CN')
    }

    testCalcModalVisible.value = false
  }, 2000)
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
  padding: 32px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-content p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #8c8c8c;
}

.header-desc {
  line-height: 1.8;
  margin-top: 12px !important;
}

.header-desc strong {
  color: #1890ff;
  font-weight: 600;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.tab-icon {
  font-size: 18px;
}

.tab-name {
  font-size: 14px;
  font-weight: 500;
}

.tab-count {
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.category-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

/* 指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* 指标卡片 */
.metric-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-card.disabled {
  opacity: 0.6;
  filter: grayscale(0.5);
}

/* 卡片头部 */
.card-header {
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.metric-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.metric-info {
  flex: 1;
  min-width: 0;
}

.metric-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-category {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

/* 卡片内容 */
.card-body {
  padding: 20px;
}

.metric-description {
  margin: 0 0 16px 0;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

/* 数据流说明 */
.data-flow-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f5ff;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 12px;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #262626;
}

.flow-step strong {
  color: #1890ff;
  font-weight: 600;
}

.flow-icon {
  font-size: 14px;
  color: #1890ff;
}

.flow-arrow {
  color: #8c8c8c;
  font-size: 14px;
  font-weight: bold;
}

/* 试算结果 */
.result-section {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.result-label {
  font-size: 12px;
  color: #595959;
  margin-bottom: 8px;
  font-weight: 500;
}

.result-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}

.result-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.result-unit {
  font-size: 18px;
  color: #595959;
  font-weight: 500;
}

.result-time {
  font-size: 11px;
  color: #8c8c8c;
}

/* 指标详情 */
.metric-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-icon {
  font-size: 16px;
  color: #1890ff;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-label {
  font-size: 11px;
  color: #8c8c8c;
}

.detail-value {
  font-size: 12px;
  color: #262626;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 公式区域 */
.formula-section {
  background: #f9fafb;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
}

.formula-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #595959;
  margin-bottom: 8px;
  font-weight: 500;
}

.formula-code {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 11px;
  color: #1890ff;
  line-height: 1.5;
  overflow-x: auto;
}

/* 卡片底部 */
.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
}

/* 模态框 */
.formula-modal {
  padding: 8px 0;
}

.modal-section {
  margin-top: 24px;
}

.modal-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.6;
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
}

/* 响应式 */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .kpi-metric-dict {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-details {
    grid-template-columns: 1fr;
  }
}
</style>
