<template>
  <div class="operational-dashboard">
    <h2 class="page-title">运营总览</h2>
    <p class="page-desc">实时监控各系统关键指标</p>

    <!-- 数据卡片 -->
    <a-row :gutter="[24, 24]">
      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="OKR平均完成率"
            :value="85"
            suffix="%"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <DashboardOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="OA待审批事项"
            :value="23"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="本月订单金额"
            :value="1258"
            prefix="¥"
            suffix="万"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <MoneyCollectOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card hoverable class="metric-card">
          <a-statistic
            title="客户总数"
            :value="458"
            :value-style="{ color: '#f5222d' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 功能引导 -->
    <a-alert
      message="欢迎使用低代码平台演示系统"
      type="success"
      show-icon
      style="margin-top: 24px;"
    >
      <template #description>
        <div>
          <p>🎯 <strong>OKR管理</strong>：支持目标设定、审批流程、进度跟踪</p>
          <p>🔗 <strong>数据聚合</strong>：打通OA、ERP、CRM、WMS等多个系统</p>
          <p>🐛 <strong>Debug窗口</strong>：右下角可查看后台流程日志</p>
          <p>⚙️ <strong>低代码配置</strong>：管理员可配置数据源和字段映射</p>
        </div>
      </template>
    </a-alert>

    <!-- 快速入口 -->
    <a-row :gutter="[24, 24]" style="margin-top: 24px;">
      <a-col :span="8">
        <a-card hoverable class="action-card" @click="router.push('/okr')">
          <div style="text-align: center;">
            <AimOutlined style="font-size: 48px; color: #1890ff;" />
            <h3 style="margin: 16px 0 8px;">OKR管理</h3>
            <p style="color: #999;">查看和管理我的OKR</p>
          </div>
        </a-card>
      </a-col>

      <a-col :span="8" v-if="canAccessPerformance">
        <a-card hoverable class="action-card" @click="router.push('/performance')">
          <div style="text-align: center;">
            <BarChartOutlined style="font-size: 48px; color: #52c41a;" />
            <h3 style="margin: 16px 0 8px;">绩效管理</h3>
            <p style="color: #999;">查看团队绩效情况</p>
          </div>
        </a-card>
      </a-col>

      <a-col :span="8" v-if="isAdmin">
        <a-card hoverable class="action-card" @click="router.push('/datasource')">
          <div style="text-align: center;">
            <ApiOutlined style="font-size: 48px; color: #faad14;" />
            <h3 style="margin: 16px 0 8px;">数据源配置</h3>
            <p style="color: #999;">配置外部系统连接</p>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 系统说明 -->
    <a-card title="系统架构说明" style="margin-top: 24px;">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="技术栈">
          Vue 3 + Ant Design Vue + Pinia
        </a-descriptions-item>
        <a-descriptions-item label="部署方式">
          Vercel / Cloudflare Pages
        </a-descriptions-item>
        <a-descriptions-item label="数据存储">
          本地Mock数据
        </a-descriptions-item>
        <a-descriptions-item label="演示角色">
          5种角色（员工/经理/HR/管理员/领导）
        </a-descriptions-item>
        <a-descriptions-item label="核心功能">
          OKR + 绩效 + 数据聚合
        </a-descriptions-item>
        <a-descriptions-item label="特色功能">
          Debug窗口实时展示流程
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  DashboardOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  UserOutlined,
  AimOutlined,
  BarChartOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const isAdmin = computed(() => {
  return userStore.currentUser?.role === 'admin'
})

const canAccessPerformance = computed(() => {
  const role = userStore.currentUser?.role
  return ['manager', 'hr', 'admin', 'leader'].includes(role)
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

.metric-card {
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
</style>
