<template>
  <div class="sales-funnel">
    <a-page-header
      title="销售漏斗仪表板"
      sub-title="ERP订单数据实时同步与可视化分析"
    >
      <template #extra>
        <a-space>
          <a-range-picker v-model:value="dateRange" />
          <a-button @click="refreshDashboard">
            <ReloadOutlined /> 刷新
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <!-- KPI卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日订单总额"
            :value="dashboardStats.todayAmount / 10000"
            suffix="万元"
            :precision="2"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix><DollarOutlined /></template>
          </a-statistic>
          <div class="stat-footer">
            <ArrowUpOutlined style="color: #52c41a" /> 较昨日 +12.5%
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="新增客户"
            :value="dashboardStats.newCustomers"
            suffix="家"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><UserAddOutlined /></template>
          </a-statistic>
          <div class="stat-footer">
            <ArrowUpOutlined style="color: #52c41a" /> 较昨日 +8家
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="销售转化率"
            :value="dashboardStats.conversionRate"
            suffix="%"
            :precision="1"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix><FunnelPlotOutlined /></template>
          </a-statistic>
          <div class="stat-footer">
            <ArrowUpOutlined style="color: #52c41a" /> 较上月 +5.1%
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="订单准时率"
            :value="dashboardStats.ontimeRate"
            suffix="%"
            :precision="1"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
          <div class="stat-footer">
            <ArrowUpOutlined style="color: #52c41a" /> 较上月 +3.2%
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 销售漏斗 + 趋势图 -->
    <a-row :gutter="16">
      <a-col :span="10">
        <a-card title="今日销售漏斗" class="funnel-card">
          <div class="data-source-note">
            <DatabaseOutlined /> 数据来源: CRM线索表 + ERP订单表
            <a-tag color="success" style="margin-left: 8px">实时</a-tag>
          </div>

          <div class="funnel-container">
            <div class="funnel-level level-1">
              <div class="level-label">线索</div>
              <div class="level-value">150</div>
              <div class="level-bar"></div>
            </div>
            <div class="funnel-arrow">
              <div class="arrow-label">转化率: 53.3%</div>
            </div>
            <div class="funnel-level level-2">
              <div class="level-label">商机</div>
              <div class="level-value">80</div>
              <div class="level-bar"></div>
            </div>
            <div class="funnel-arrow">
              <div class="arrow-label">转化率: 37.5%</div>
            </div>
            <div class="funnel-level level-3">
              <div class="level-label">成单</div>
              <div class="level-value">30</div>
              <div class="level-bar"></div>
            </div>
          </div>

          <a-divider />

          <div class="funnel-summary">
            <div class="summary-item">
              <span>线索→商机:</span>
              <strong>53.3%</strong>
            </div>
            <div class="summary-item">
              <span>商机→成单:</span>
              <strong>37.5%</strong>
            </div>
            <div class="summary-item">
              <span>线索→成单:</span>
              <strong style="color: #52c41a">20.0%</strong>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="14">
        <a-card title="近7日订单趋势">
          <div class="data-source-note">
            <DatabaseOutlined /> 数据来源: ERP订单系统
            <a-tag color="blue" style="margin-left: 8px">每2小时同步</a-tag>
          </div>

          <div class="chart-container">
            <div class="trend-chart">
              <div class="chart-y-axis">
                <div>100万</div>
                <div>75万</div>
                <div>50万</div>
                <div>25万</div>
                <div>0</div>
              </div>
              <div class="chart-bars">
                <div v-for="day in trendData" :key="day.date" class="bar-group">
                  <div class="bar" :style="{ height: day.percentage + '%', background: day.color }"></div>
                  <div class="bar-label">{{ day.label }}</div>
                  <div class="bar-value">{{ day.amount }}万</div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 销售员排行榜 -->
    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="销售员业绩排行 (本月)">
          <a-table
            :columns="salesmanColumns"
            :data-source="salesmen"
            :pagination="{ pageSize: 5 }"
            size="small"
          >
            <template #rank="{ text, record }">
              <a-badge
                :count="text"
                :number-style="{
                  backgroundColor: text <= 3 ? '#52c41a' : '#d9d9d9',
                  color: text <= 3 ? 'white' : '#666'
                }"
              />
            </template>
            <template #name="{ record }">
              <a-avatar :size="24" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.name}`" />
              <span style="margin-left: 8px">{{ record.name }}</span>
            </template>
            <template #orderAmount="{ text }">
              ¥{{ text.toLocaleString() }}
            </template>
            <template #ontimeRate="{ text }">
              <a-progress :percent="text" size="small" :stroke-color="text >= 90 ? '#52c41a' : '#faad14'" />
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  DollarOutlined,
  UserAddOutlined,
  FunnelPlotOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'

const dateRange = ref(null)

const dashboardStats = ref({
  todayAmount: 850000,
  newCustomers: 12,
  conversionRate: 28.3,
  ontimeRate: 92.5
})

const trendData = ref([
  { date: '12-05', label: '12/05', amount: 65, percentage: 65, color: '#1890ff' },
  { date: '12-06', label: '12/06', amount: 72, percentage: 72, color: '#1890ff' },
  { date: '12-07', label: '12/07', amount: 58, percentage: 58, color: '#1890ff' },
  { date: '12-08', label: '12/08', amount: 88, percentage: 88, color: '#52c41a' },
  { date: '12-09', label: '12/09', amount: 95, percentage: 95, color: '#52c41a' },
  { date: '12-10', label: '12/10', amount: 78, percentage: 78, color: '#1890ff' },
  { date: '12-11', label: '12/11', amount: 85, percentage: 85, color: '#52c41a' }
])

const salesmanColumns = [
  { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, slots: { customRender: 'rank' } },
  { title: '姓名', dataIndex: 'name', key: 'name', slots: { customRender: 'name' } },
  { title: '订单数', dataIndex: 'orderCount', key: 'orderCount' },
  { title: '订单金额', dataIndex: 'orderAmount', key: 'orderAmount', slots: { customRender: 'orderAmount' } },
  { title: '订单准时率', dataIndex: 'ontimeRate', key: 'ontimeRate', slots: { customRender: 'ontimeRate' } }
]

const salesmen = ref([
  { rank: 1, name: '张伟', orderCount: 92, orderAmount: 2850000, ontimeRate: 92 },
  { rank: 2, name: '李明', orderCount: 85, orderAmount: 2650000, ontimeRate: 88 },
  { rank: 3, name: '王芳', orderCount: 78, orderAmount: 2350000, ontimeRate: 95 },
  { rank: 4, name: '赵健', orderCount: 65, orderAmount: 1980000, ontimeRate: 85 },
  { rank: 5, name: '孙慧', orderCount: 58, orderAmount: 1750000, ontimeRate: 90 }
])

const refreshDashboard = () => {
  message.success('仪表板已刷新')
}
</script>

<style scoped>
.sales-funnel {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.stat-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #52c41a;
}

.data-source-note {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f0f5ff;
  border-left: 3px solid #1890ff;
  font-size: 12px;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.funnel-container {
  padding: 20px 0;
}

.funnel-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
}

.level-1 { width: 100%; }
.level-2 { width: 70%; }
.level-3 { width: 40%; }

.level-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.level-value {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 12px;
}

.level-bar {
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.funnel-arrow {
  text-align: center;
  margin: 12px 0;
}

.arrow-label {
  font-size: 13px;
  color: #52c41a;
  font-weight: 600;
}

.funnel-summary {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-item span {
  font-size: 12px;
  color: #999;
}

.summary-item strong {
  font-size: 18px;
  color: #1890ff;
}

.chart-container {
  height: 300px;
  padding: 20px 0;
}

.trend-chart {
  display: flex;
  height: 100%;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50px;
  font-size: 12px;
  color: #999;
  text-align: right;
  padding-right: 8px;
}

.chart-bars {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  border-bottom: 2px solid #e8e8e8;
  border-left: 2px solid #e8e8e8;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 40px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
}

.bar-label {
  margin-top: 8px;
  font-size: 11px;
  color: #999;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
</style>
