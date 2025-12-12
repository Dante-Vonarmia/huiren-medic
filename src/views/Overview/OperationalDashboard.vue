<template>
  <div class="operational-dashboard">
    <!-- 平台定位标识 - 简洁设计 -->
    <div class="page-header-clean">
      <div class="header-left">
        <h1 class="page-title">运营总览</h1>
        <p class="page-subtitle" v-if="canViewOperationalData">
          实时整合6大企业系统 · 支持15+数据源 · 低代码快速构建
        </p>
        <p class="page-subtitle" v-else>
          快速访问常用功能和应用
        </p>
      </div>
      <div class="header-stats" v-if="canViewOperationalData">
        <div class="stat-box">
          <div class="stat-value">{{ systemStatus.filter(s => s.online).length }}/{{ systemStatus.length }}</div>
          <div class="stat-label">系统在线</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">实时</div>
          <div class="stat-label">数据同步</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">&lt;500ms</div>
          <div class="stat-label">同步延迟</div>
        </div>
      </div>
    </div>

    <!-- 我的数据面板 - 所有用户可见 -->
    <a-card size="small" title="📊 我的数据" :bodyStyle="{ padding: '12px' }" style="margin-bottom: 12px;">
      <a-row :gutter="[16, 16]">
        <!-- 待办事项 -->
        <a-col :span="6">
          <div class="personal-stat-item">
            <div class="psi-header">
              <CheckCircleOutlined class="psi-icon" style="color: #52c41a;" />
              <span class="psi-label">待办事项</span>
            </div>
            <div class="psi-value">8 项</div>
            <div class="psi-detail">
              <span>紧急: 2</span>
              <span style="margin-left: 8px;">普通: 6</span>
            </div>
          </div>
        </a-col>

        <!-- OKR进度 -->
        <a-col :span="6">
          <div class="personal-stat-item">
            <div class="psi-header">
              <TrophyOutlined class="psi-icon" style="color: #faad14;" />
              <span class="psi-label">OKR完成度</span>
            </div>
            <div class="psi-value">68%</div>
            <a-progress :percent="68" :showInfo="false" size="small" strokeColor="#52c41a" />
            <div class="psi-detail" style="margin-top: 4px;">本季度 3 个目标</div>
          </div>
        </a-col>

        <!-- 申请状态 -->
        <a-col :span="6">
          <div class="personal-stat-item">
            <div class="psi-header">
              <FileTextOutlined class="psi-icon" style="color: #1890ff;" />
              <span class="psi-label">申请状态</span>
            </div>
            <div class="psi-badges">
              <a-tag color="processing">审批中 3</a-tag>
              <a-tag color="success">已通过 12</a-tag>
            </div>
          </div>
        </a-col>

        <!-- 本月考勤 -->
        <a-col :span="6">
          <div class="personal-stat-item">
            <div class="psi-header">
              <CalendarOutlined class="psi-icon" style="color: #722ed1;" />
              <span class="psi-label">本月考勤</span>
            </div>
            <div class="psi-value">20 天</div>
            <div class="psi-detail">
              <span>出勤率: 100%</span>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 系统连接状态 - 突出数据整合能力 (仅管理层可见) -->
    <a-card
      v-if="canViewOperationalData"
      size="small"
      style="margin-bottom: 12px;"
      :bodyStyle="{ padding: '12px' }"
    >
      <template #title>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span><CloudServerOutlined /> 企业系统实时连接</span>
          <a-tag color="success" style="margin: 0;">
            <CheckCircleOutlined /> {{ systemStatus.filter(s => s.online).length }}/{{ systemStatus.length }} 在线
          </a-tag>
        </div>
      </template>
      <a-row :gutter="[8, 8]">
        <a-col :span="4" v-for="system in systemStatus" :key="system.key">
          <div class="system-status-card-compact" :class="{ offline: !system.online }">
            <div class="status-indicator-compact">
              <component :is="system.icon" :style="{ fontSize: '20px', color: system.online ? '#52c41a' : '#ff4d4f' }" />
              <span class="status-dot-compact" :class="{ online: system.online }"></span>
            </div>
            <div class="system-info-compact">
              <div class="system-name-compact">{{ system.name }}</div>
              <div class="system-desc-compact">{{ system.desc }}</div>
              <div class="system-time-compact">{{ system.lastSync }}</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 核心指标卡片 - 数据密度优化 (仅管理层可见) -->
    <a-row v-if="canViewOperationalData" :gutter="[12, 12]" style="margin-bottom: 12px;">
      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="今日产量"
            :value="productionData.todayOutput"
            suffix="kg"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ExperimentOutlined />
            </template>
          </a-statistic>
          <div class="metric-trend">
            <ArrowUpOutlined style="color: #52c41a;" />
            <span style="color: #52c41a; margin-left: 4px;">较昨日 +12.5%</span>
          </div>
          <div class="metric-source">数据来源: MES</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="合格率"
            :value="qualityData.passRate"
            suffix="%"
            :value-style="{ color: '#52c41a' }"
            :precision="2"
          >
            <template #prefix>
              <SafetyCertificateOutlined />
            </template>
          </a-statistic>
          <div class="metric-trend">
            <CheckCircleOutlined style="color: #52c41a;" />
            <span style="color: #52c41a; margin-left: 4px;">符合GMP标准</span>
          </div>
          <div class="metric-source">数据来源: QMS</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="库存预警"
            :value="inventoryData.alertCount"
            suffix="项"
            :value-style="{ color: inventoryData.alertCount > 0 ? '#faad14' : '#52c41a' }"
          >
            <template #prefix>
              <WarningOutlined />
            </template>
          </a-statistic>
          <div class="metric-trend">
            <InfoCircleOutlined style="color: #faad14;" />
            <span style="color: #faad14; margin-left: 4px;">{{ inventoryData.alertCount }}种原料低于安全库存</span>
          </div>
          <div class="metric-source">数据来源: WMS</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card hoverable class="metric-card" :class="{ 'error-card': !systemStatus[3].online }">
          <a-statistic
            title="订单按时交付率"
            :value="systemStatus[3].online ? orderData.onTimeRate : 0"
            suffix="%"
            :value-style="{ color: systemStatus[3].online ? '#52c41a' : '#999' }"
            :precision="1"
          >
            <template #prefix>
              <DeliveredProcedureOutlined />
            </template>
          </a-statistic>
          <div class="metric-trend" v-if="!systemStatus[3].online">
            <CloseCircleOutlined style="color: #ff4d4f;" />
            <span style="color: #ff4d4f; margin-left: 4px;">ERP系统离线，无法获取数据</span>
          </div>
          <div class="metric-trend" v-else>
            <CheckCircleOutlined style="color: #52c41a;" />
            <span style="color: #52c41a; margin-left: 4px;">本月准时交付 {{ orderData.onTimeCount }} 单</span>
          </div>
          <div class="metric-source">数据来源: ERP</div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 (仅管理层可见) -->
    <a-row v-if="canViewOperationalData" :gutter="[24, 24]">
      <a-col :span="12">
        <a-card title="生产趋势图（近7天）" :extra="productionChartExtra">
          <div ref="productionChartRef" style="width: 100%; height: 300px;"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="质量趋势图（近7天）">
          <div ref="qualityChartRef" style="width: 100%; height: 300px;"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="异常工单统计（按类型）">
          <div ref="workorderChartRef" style="width: 100%; height: 300px;"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card title="数据流转统计">
          <div class="data-flow-stats">
            <a-row :gutter="[16, 16]">
              <a-col :span="12">
                <div class="flow-stat-item">
                  <CloudSyncOutlined style="font-size: 32px; color: #1890ff;" />
                  <div class="flow-stat-content">
                    <div class="flow-stat-value">{{ dataFlow.syncTasks }}</div>
                    <div class="flow-stat-label">运行中的同步任务</div>
                  </div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flow-stat-item">
                  <DatabaseOutlined style="font-size: 32px; color: '#52c41a;" />
                  <div class="flow-stat-content">
                    <div class="flow-stat-value">{{ dataFlow.recordsToday }}</div>
                    <div class="flow-stat-label">今日同步数据条数</div>
                  </div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flow-stat-item">
                  <ApiOutlined style="font-size: 32px; color: #faad14;" />
                  <div class="flow-stat-content">
                    <div class="flow-stat-value">{{ dataFlow.apiCalls }}</div>
                    <div class="flow-stat-label">今日API调用次数</div>
                  </div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flow-stat-item">
                  <PartitionOutlined style="font-size: 32px; color: #722ed1;" />
                  <div class="flow-stat-content">
                    <div class="flow-stat-value">{{ dataFlow.dataSources }}</div>
                    <div class="flow-stat-label">已配置数据源</div>
                  </div>
                </div>
              </a-col>
            </a-row>
            <a-button type="link" @click="router.push('/datasource')" style="margin-top: 16px;" v-if="isAdmin">
              查看数据血缘关系 →
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Agent基座和数据治理能力展示 (仅管理层可见) -->
    <a-row v-if="canViewOperationalData" :gutter="[12, 12]" style="margin-top: 12px;">
      <a-col :span="12">
        <a-card size="small" :bodyStyle="{ padding: '12px' }">
          <template #title>
            <span><RobotOutlined /> Agent 智能基座能力</span>
          </template>
          <div style="font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0;"><strong>📡 实时数据接入</strong>：6大企业系统实时同步，数据延迟 <500ms</p>
            <p style="margin: 0 0 8px 0;"><strong>🧠 智能数据清洗</strong>：自动识别异常数据，智能补全缺失字段</p>
            <p style="margin: 0 0 0 0;"><strong>🔗 统一数据接口</strong>：为AI Agent提供标准化API，支持自然语言查询</p>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card size="small" :bodyStyle="{ padding: '12px' }">
          <template #title>
            <span><DatabaseOutlined /> 数据治理引擎</span>
          </template>
          <div style="font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 8px 0;"><strong>📋 血缘追踪</strong>：完整记录数据流转路径，支持逆向溯源</p>
            <p style="margin: 0 0 8px 0;"><strong>🔒 权限管控</strong>：细粒度数据访问控制，符合合规要求</p>
            <p style="margin: 0 0 0 0;"><strong>📊 质量监控</strong>：实时监控数据质量指标，异常自动告警</p>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 个人工作台（所有员工可见） -->
    <a-row :gutter="[12, 12]" style="margin-top: 24px;">
      <a-col :span="24">
        <!-- 快速入口 - 紧凑6列布局 -->
        <a-card size="small" title="🚀 快速入口" :bodyStyle="{ padding: '12px' }">
          <a-row :gutter="[8, 8]">
            <!-- 应用中心 - 最重要 -->
            <a-col :span="4">
              <div class="quick-access-card primary" @click="router.push('/app-center')">
                <div class="qa-icon-wrapper primary">
                  <ShopOutlined class="qa-icon" />
                </div>
                <div class="qa-title">应用中心</div>
                <div class="qa-subtitle">8个应用</div>
              </div>
            </a-col>

            <!-- OKR管理 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/okr')">
                <div class="qa-icon-wrapper green">
                  <TrophyOutlined class="qa-icon" />
                </div>
                <div class="qa-title">OKR管理</div>
                <div class="qa-subtitle">3个进行中</div>
              </div>
            </a-col>

            <!-- 请假申请 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/leave')">
                <div class="qa-icon-wrapper orange">
                  <CalendarOutlined class="qa-icon" />
                </div>
                <div class="qa-title">请假申请</div>
                <div class="qa-subtitle">年假剩12天</div>
              </div>
            </a-col>

            <!-- 费用报销 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/expense')">
                <div class="qa-icon-wrapper pink">
                  <WalletOutlined class="qa-icon" />
                </div>
                <div class="qa-title">费用报销</div>
                <div class="qa-subtitle">2个待审批</div>
              </div>
            </a-col>

            <!-- 生产工单 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/workorder')">
                <div class="qa-icon-wrapper blue">
                  <FileExcelOutlined class="qa-icon" />
                </div>
                <div class="qa-title">生产工单</div>
                <div class="qa-subtitle">5个待处理</div>
              </div>
            </a-col>

            <!-- 销售订单 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/sales')">
                <div class="qa-icon-wrapper purple">
                  <ShoppingOutlined class="qa-icon" />
                </div>
                <div class="qa-title">销售订单</div>
                <div class="qa-subtitle">查看详情</div>
              </div>
            </a-col>

            <!-- 采购申请 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/purchase')">
                <div class="qa-icon-wrapper cyan">
                  <AppstoreOutlined class="qa-icon" />
                </div>
                <div class="qa-title">采购申请</div>
                <div class="qa-subtitle">新建申请</div>
              </div>
            </a-col>

            <!-- 库存管理 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/inventory')">
                <div class="qa-icon-wrapper geekblue">
                  <DatabaseOutlined class="qa-icon" />
                </div>
                <div class="qa-title">库存管理</div>
                <div class="qa-subtitle">查看库存</div>
              </div>
            </a-col>

            <!-- 质量检验 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/quality')">
                <div class="qa-icon-wrapper lime">
                  <SafetyCertificateOutlined class="qa-icon" />
                </div>
                <div class="qa-title">质量检验</div>
                <div class="qa-subtitle">待检3批</div>
              </div>
            </a-col>

            <!-- 客户服务 -->
            <a-col :span="4">
              <div class="quick-access-card" @click="router.push('/customer-service')">
                <div class="qa-icon-wrapper gold">
                  <TeamOutlined class="qa-icon" />
                </div>
                <div class="qa-title">客户服务</div>
                <div class="qa-subtitle">5个工单</div>
              </div>
            </a-col>

            <!-- 绩效管理 (管理层) -->
            <a-col :span="4" v-if="canAccessPerformance">
              <div class="quick-access-card" @click="router.push('/performance')">
                <div class="qa-icon-wrapper volcano">
                  <BarChartOutlined class="qa-icon" />
                </div>
                <div class="qa-title">绩效管理</div>
                <div class="qa-subtitle">员工评估</div>
              </div>
            </a-col>

            <!-- 表单设计 (设计师/管理员) -->
            <a-col :span="4" v-if="canAccessPerformance">
              <div class="quick-access-card" @click="router.push('/form-designer')">
                <div class="qa-icon-wrapper purple">
                  <FormOutlined class="qa-icon" />
                </div>
                <div class="qa-title">表单设计</div>
                <div class="qa-subtitle">创建表单</div>
              </div>
            </a-col>

            <!-- 流程设计 (设计师/管理员) -->
            <a-col :span="4" v-if="canAccessPerformance">
              <div class="quick-access-card" @click="router.push('/workflow-designer')">
                <div class="qa-icon-wrapper magenta">
                  <PartitionOutlined class="qa-icon" />
                </div>
                <div class="qa-title">流程设计</div>
                <div class="qa-subtitle">编排流程</div>
              </div>
            </a-col>

            <!-- 数据源 (管理员) -->
            <a-col :span="4" v-if="isAdmin">
              <div class="quick-access-card" @click="router.push('/datasource')">
                <div class="qa-icon-wrapper blue">
                  <CloudServerOutlined class="qa-icon" />
                </div>
                <div class="qa-title">数据源</div>
                <div class="qa-subtitle">系统对接</div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近使用的应用 -->
    <a-card size="small" title="🕐 最近使用" :bodyStyle="{ padding: '12px' }" style="margin-top: 12px;">
      <a-row :gutter="8">
        <a-col :span="3" v-for="app in recentApps" :key="app.id">
          <div class="recent-app-card" @click="router.push(app.route)">
            <div class="recent-app-icon">{{ app.icon }}</div>
            <div class="recent-app-name">{{ app.name }}</div>
            <div class="recent-app-time">{{ app.lastUsed }}</div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as echarts from 'echarts'
import {
  ExperimentOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  DeliveredProcedureOutlined,
  CloudSyncOutlined,
  DatabaseOutlined,
  ApiOutlined,
  PartitionOutlined,
  FileExcelOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  ShoppingOutlined,
  ShopOutlined,
  CalendarOutlined,
  TeamOutlined,
  DesktopOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  FormOutlined,
  AppstoreOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { h } from 'vue'

const router = useRouter()
const userStore = useUserStore()

const isAdmin = computed(() => {
  return userStore.currentUser?.role === 'admin'
})

const canAccessPerformance = computed(() => {
  const role = userStore.currentUser?.role
  return ['manager', 'hr', 'admin', 'leader'].includes(role)
})

// 是否可以查看运营数据（管理层、HR、admin、leader）
const canViewOperationalData = computed(() => {
  const role = userStore.currentUser?.role
  return ['manager', 'hr', 'admin', 'leader'].includes(role)
})

// 普通员工
const isRegularEmployee = computed(() => {
  const role = userStore.currentUser?.role
  return role === 'employee' || !role
})

// 系统状态数据
const systemStatus = ref([
  {
    key: 'mes',
    name: 'MES',
    desc: '生产执行系统',
    online: true,
    lastSync: '2秒前',
    icon: h(ExperimentOutlined)
  },
  {
    key: 'qms',
    name: 'QMS',
    desc: '质量管理系统',
    online: true,
    lastSync: '5秒前',
    icon: h(SafetyCertificateOutlined)
  },
  {
    key: 'wms',
    name: 'WMS',
    desc: '仓储管理系统',
    online: true,
    lastSync: '3秒前',
    icon: h(DatabaseOutlined)
  },
  {
    key: 'erp',
    name: 'ERP',
    desc: '企业资源计划',
    online: false, // 模拟离线状态
    lastSync: '5分钟前',
    icon: h(DesktopOutlined)
  },
  {
    key: 'oa',
    name: 'OA',
    desc: '办公自动化',
    online: true,
    lastSync: '1秒前',
    icon: h(FileExcelOutlined)
  },
  {
    key: 'crm',
    name: 'CRM',
    desc: '客户关系管理',
    online: true,
    lastSync: '4秒前',
    icon: h(TeamOutlined)
  }
])

// 生产数据 (from MES)
const productionData = ref({
  todayOutput: 12580, // kg
  targetOutput: 15000,
  utilizationRate: 83.9
})

// 质量数据 (from QMS)
const qualityData = ref({
  passRate: 99.12,
  inspectionCount: 156,
  rejectCount: 2
})

// 库存数据 (from WMS)
const inventoryData = ref({
  alertCount: 3,
  totalItems: 248,
  lowStockItems: ['当归', '黄芪', '枸杞子']
})

// 订单数据 (from ERP - 离线状态)
const orderData = ref({
  onTimeRate: 94.5,
  onTimeCount: 87,
  totalOrders: 92
})

// 数据流转统计
const dataFlow = ref({
  syncTasks: 12,
  recordsToday: 45823,
  apiCalls: 1256,
  dataSources: 6
})

// 图表引用
const productionChartRef = ref(null)
const qualityChartRef = ref(null)
const workorderChartRef = ref(null)

let productionChart = null
let qualityChart = null
let workorderChart = null

// 生产趋势图数据
const productionChartData = {
  dates: ['12-04', '12-05', '12-06', '12-07', '12-08', '12-09', '12-10'],
  output: [11200, 11800, 12100, 12500, 12300, 12650, 12580],
  target: [15000, 15000, 15000, 15000, 15000, 15000, 15000]
}

// 质量趋势图数据
const qualityChartData = {
  dates: ['12-04', '12-05', '12-06', '12-07', '12-08', '12-09', '12-10'],
  passRate: [98.8, 99.2, 98.5, 99.0, 99.3, 99.1, 99.12],
  inspections: [142, 156, 138, 165, 159, 151, 156]
}

// 异常工单统计数据
const workorderChartData = {
  types: ['设备故障', '原料问题', '工艺偏差', '人员操作', '环境因素'],
  counts: [12, 8, 15, 6, 4]
}

const productionChartExtra = h('span', { style: 'color: #999; font-size: 12px;' }, '数据来源: MES')

// 初始化图表
const initCharts = () => {
  // 生产趋势图
  if (productionChartRef.value) {
    productionChart = echarts.init(productionChartRef.value)
    productionChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['实际产量', '目标产量']
      },
      xAxis: {
        type: 'category',
        data: productionChartData.dates
      },
      yAxis: {
        type: 'value',
        name: '产量 (kg)'
      },
      series: [
        {
          name: '实际产量',
          type: 'line',
          data: productionChartData.output,
          smooth: true,
          itemStyle: { color: '#1890ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          }
        },
        {
          name: '目标产量',
          type: 'line',
          data: productionChartData.target,
          lineStyle: { type: 'dashed', color: '#ff4d4f' },
          itemStyle: { color: '#ff4d4f' }
        }
      ]
    })
  }

  // 质量趋势图
  if (qualityChartRef.value) {
    qualityChart = echarts.init(qualityChartRef.value)
    qualityChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['合格率', '检验批次']
      },
      xAxis: {
        type: 'category',
        data: qualityChartData.dates
      },
      yAxis: [
        {
          type: 'value',
          name: '合格率 (%)',
          min: 98,
          max: 100
        },
        {
          type: 'value',
          name: '批次数'
        }
      ],
      series: [
        {
          name: '合格率',
          type: 'line',
          data: qualityChartData.passRate,
          smooth: true,
          itemStyle: { color: '#52c41a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ])
          }
        },
        {
          name: '检验批次',
          type: 'bar',
          yAxisIndex: 1,
          data: qualityChartData.inspections,
          itemStyle: { color: '#1890ff', opacity: 0.6 }
        }
      ]
    })
  }

  // 异常工单统计图
  if (workorderChartRef.value) {
    workorderChart = echarts.init(workorderChartRef.value)
    workorderChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}单 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '异常类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{c}单'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: workorderChartData.types.map((type, index) => ({
            name: type,
            value: workorderChartData.counts[index]
          }))
        }
      ]
    })
  }
}

// 窗口大小调整处理
const handleResize = () => {
  productionChart?.resize()
  qualityChart?.resize()
  workorderChart?.resize()
}

// 最近使用的应用
const recentApps = ref([
  { id: 1, name: '应用中心', icon: '🚀', route: '/app-center', lastUsed: '刚刚' },
  { id: 2, name: 'OKR管理', icon: '🏆', route: '/okr', lastUsed: '5分钟前' },
  { id: 3, name: '请假申请', icon: '🌴', route: '/leave', lastUsed: '1小时前' },
  { id: 4, name: '费用报销', icon: '💰', route: '/expense', lastUsed: '2小时前' },
  { id: 5, name: '生产工单', icon: '🏭', route: '/workorder', lastUsed: '3小时前' },
  { id: 6, name: '销售订单', icon: '📈', route: '/sales', lastUsed: '昨天' },
  { id: 7, name: '库存管理', icon: '📦', route: '/inventory', lastUsed: '昨天' },
  { id: 8, name: '质量检验', icon: '✅', route: '/quality', lastUsed: '2天前' }
])

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  productionChart?.dispose()
  qualityChart?.dispose()
  workorderChart?.dispose()
})
</script>

<style scoped>
.operational-dashboard {
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #999;
  margin: 0 0 24px 0;
}

/* 系统状态卡片 */
.system-status-card {
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
  background: #fafafa;
}

.system-status-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.system-status-card.offline {
  background: #fff2f0;
  border-color: #ffccc7;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.online {
  background: #52c41a;
  box-shadow: 0 0 8px #52c41a;
  animation: pulse 2s infinite;
}

.status-dot.offline {
  background: #ff4d4f;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.system-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.system-desc {
  font-size: 12px;
  color: #999;
}

/* ===== 新增紧凑型样式 ===== */
/* 简洁专业的页面头部 */
.page-header-clean {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  flex: 1;
}

.title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
}

.title-tags {
  display: flex;
  gap: 8px;
}

.tag-item {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.tag-blue {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.tag-cyan {
  background: #e6fffb;
  color: #13c2c2;
  border: 1px solid #87e8de;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-box {
  text-align: center;
  min-width: 80px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 紧凑型系统状态卡片 */
.system-status-card-compact {
  padding: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
}

.system-status-card-compact:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.system-status-card-compact.offline {
  background: #fff2f0;
  border-color: #ffccc7;
}

.status-indicator-compact {
  position: relative;
  flex-shrink: 0;
}

.status-dot-compact {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid white;
}

.status-dot-compact.online {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a;
  animation: pulse 2s infinite;
}

.system-info-compact {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.system-name-compact {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.system-desc-compact {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.system-time-compact {
  font-size: 10px;
  color: #bbb;
}

.system-time {
  font-size: 11px;
  color: #bfbfbf;
}

/* 指标卡片 */
.metric-card {
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.metric-card.error-card {
  background: #fff;
  border: 1px solid #ffccc7;
}

.metric-trend {
  margin-top: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.metric-source {
  margin-top: 8px;
  font-size: 11px;
  color: #bfbfbf;
  font-style: italic;
}

/* 快速入口卡片 */
.action-card {
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* 数据流转统计 */
.data-flow-stats {
  padding: 16px 0;
}

.flow-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;
}

.flow-stat-item:hover {
  background: #f0f0f0;
}

.flow-stat-content {
  flex: 1;
}

.flow-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.flow-stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 快速访问卡片 */
.quick-access-card {
  padding: 12px 8px;
  text-align: center;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.quick-access-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.quick-access-card:hover::before {
  transform: scaleX(1);
}

.quick-access-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  transform: translateY(-2px);
}

.quick-access-card.primary {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-color: #91d5ff;
}

.quick-access-card.primary:hover {
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.qa-icon-wrapper {
  width: 48px;
  height: 48px;
  margin: 0 auto 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  transition: all 0.3s;
}

.quick-access-card:hover .qa-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.qa-icon {
  font-size: 24px;
  color: #595959;
}

.qa-icon-wrapper.primary { background: linear-gradient(135deg, #1890ff, #096dd9); }
.qa-icon-wrapper.primary .qa-icon { color: white; }

.qa-icon-wrapper.green { background: linear-gradient(135deg, #52c41a, #389e0d); }
.qa-icon-wrapper.green .qa-icon { color: white; }

.qa-icon-wrapper.orange { background: linear-gradient(135deg, #fa8c16, #d46b08); }
.qa-icon-wrapper.orange .qa-icon { color: white; }

.qa-icon-wrapper.pink { background: linear-gradient(135deg, #eb2f96, #c41d7f); }
.qa-icon-wrapper.pink .qa-icon { color: white; }

.qa-icon-wrapper.blue { background: linear-gradient(135deg, #1890ff, #096dd9); }
.qa-icon-wrapper.blue .qa-icon { color: white; }

.qa-icon-wrapper.purple { background: linear-gradient(135deg, #722ed1, #531dab); }
.qa-icon-wrapper.purple .qa-icon { color: white; }

.qa-icon-wrapper.cyan { background: linear-gradient(135deg, #13c2c2, #08979c); }
.qa-icon-wrapper.cyan .qa-icon { color: white; }

.qa-icon-wrapper.geekblue { background: linear-gradient(135deg, #2f54eb, #1d39c4); }
.qa-icon-wrapper.geekblue .qa-icon { color: white; }

.qa-icon-wrapper.lime { background: linear-gradient(135deg, #a0d911, #7cb305); }
.qa-icon-wrapper.lime .qa-icon { color: white; }

.qa-icon-wrapper.gold { background: linear-gradient(135deg, #faad14, #d48806); }
.qa-icon-wrapper.gold .qa-icon { color: white; }

.qa-icon-wrapper.volcano { background: linear-gradient(135deg, #fa541c, #d4380d); }
.qa-icon-wrapper.volcano .qa-icon { color: white; }

.qa-icon-wrapper.magenta { background: linear-gradient(135deg, #eb2f96, #c41d7f); }
.qa-icon-wrapper.magenta .qa-icon { color: white; }

.qa-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qa-subtitle {
  font-size: 11px;
  color: #999;
}

/* 个人统计项 */
.personal-stat-item {
  padding: 8px 0;
}

.psi-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.psi-icon {
  font-size: 16px;
}

.psi-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.psi-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.psi-detail {
  font-size: 11px;
  color: #999;
}

.psi-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 最近使用的应用 */
.recent-app-card {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.recent-app-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-2px);
}

.recent-app-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.recent-app-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-app-time {
  font-size: 11px;
  color: #999;
}
</style>
