<template>
  <a-layout class="dashboard-container">
    <!-- 侧边栏 -->
    <a-layout-sider :width="240" class="sidebar">
      <div class="logo">
        <h2>低代码平台</h2>
        <p>汇仁药业</p>
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="/overview">
          <DashboardOutlined />
          <span>运营总览</span>
        </a-menu-item>

        <a-menu-item key="/okr">
          <AimOutlined />
          <span>OKR管理</span>
        </a-menu-item>

        <a-sub-menu v-if="canAccessPerformance" key="performance">
          <template #icon><BarChartOutlined /></template>
          <template #title>绩效管理</template>
          <a-menu-item key="/performance">绩效管理</a-menu-item>
          <a-menu-item key="/performance/period">绩效周期管理</a-menu-item>
        </a-sub-menu>

        <a-sub-menu v-if="isAdmin" key="data">
          <template #icon><DatabaseOutlined /></template>
          <template #title>数据管理</template>
          <a-menu-item key="/datasource">数据源配置</a-menu-item>
          <a-menu-item key="/datasource/lineage">数据血缘</a-menu-item>
          <a-menu-item key="/datasync">数据同步任务</a-menu-item>
          <a-menu-item key="/kpi/dict">KPI指标字典</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="lowcode">
          <template #icon><BuildOutlined /></template>
          <template #title>低代码工具</template>
          <a-menu-item key="/lowcode/form-designer">表单设计器</a-menu-item>
          <a-menu-item key="/lowcode/workflow-designer">工作流设计器</a-menu-item>
          <a-menu-item key="/lowcode/page-builder">页面构建器</a-menu-item>
          <a-menu-item key="/lowcode/api-management">API管理</a-menu-item>
          <a-menu-item key="/lowcode/app-market">应用市场</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="scenarios">
          <template #icon><AppstoreOutlined /></template>
          <template #title>业务场景</template>
          <a-menu-item key="/scenarios/customer360">客户360视图</a-menu-item>
          <a-menu-item key="/scenarios/sales-funnel">销售漏斗仪表板</a-menu-item>
          <a-menu-item key="/scenarios/expense">费用报销</a-menu-item>
          <a-menu-item key="/scenarios/workorder">生产异常工单</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header class="header">
        <div class="header-left">
          <span class="page-title">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32" :src="userStore.currentUser?.avatar" />
              <span class="user-name">{{ userStore.currentUser?.realName }}</span>
              <DownOutlined />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item disabled>
                  <div class="user-role">
                    {{ getRoleText(userStore.currentUser?.role) }}
                  </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="main-content">
        <router-view />
      </a-layout-content>
    </a-layout>

    <!-- Debug Console -->
    <DebugConsole />
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Modal, message } from 'ant-design-vue'
import {
  DashboardOutlined,
  AimOutlined,
  BarChartOutlined,
  ApiOutlined,
  DatabaseOutlined,
  BuildOutlined,
  AppstoreOutlined,
  DownOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import DebugConsole from '../components/DebugConsole.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedKeys = ref([route.path])
const openKeys = ref(['lowcode', 'scenarios'])

watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]
})

const currentPageTitle = computed(() => {
  return route.meta.title || '首页'
})

const isAdmin = computed(() => {
  return userStore.currentUser?.role === 'admin'
})

const canAccessPerformance = computed(() => {
  const role = userStore.currentUser?.role
  return ['manager', 'hr', 'admin', 'leader'].includes(role)
})

const getRoleText = (role) => {
  const roleMap = {
    employee: '普通员工',
    manager: '部门经理',
    hr: 'HR管理员',
    admin: '系统管理员',
    leader: '高层领导'
  }
  return roleMap[role] || role
}

const handleMenuClick = ({ key }) => {
  router.push(key)
}

const handleLogout = () => {
  Modal.confirm({
    title: '提示',
    content: '确定要退出登录吗？',
    onOk: () => {
      userStore.logout()
      message.success('已退出登录')
      router.push('/login')
    }
  })
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
}

.sidebar {
  background: #001529;
}

.logo {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.logo p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.user-role {
  font-size: 12px;
  color: #999;
}

.main-content {
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}
</style>
