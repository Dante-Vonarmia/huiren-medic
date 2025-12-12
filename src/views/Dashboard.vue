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
        <!-- 运营总览 -->
        <a-menu-item key="/overview">
          <DashboardOutlined />
          <span>运营总览</span>
        </a-menu-item>

        <!-- 应用中心（所有用户可用 - 最重要） -->
        <a-menu-item key="/app-center" class="featured-menu-item">
          <ShopOutlined class="featured-icon" />
          <span class="featured-text">🚀 应用中心</span>
        </a-menu-item>

        <!-- OKR与绩效 -->
        <a-sub-menu key="okr-performance">
          <template #icon><TrophyOutlined /></template>
          <template #title>OKR与绩效</template>
          <a-menu-item key="/okr">
            <span>OKR管理</span>
          </a-menu-item>
          <a-menu-item v-if="canAccessPerformance" key="/performance">
            <span>绩效管理</span>
          </a-menu-item>
          <a-menu-item v-if="canAccessPerformance" key="/performance-period">
            <span>绩效周期</span>
          </a-menu-item>
          <a-menu-item v-if="canAccessPerformance" key="/kpi-dict">
            <span>KPI字典</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 业务场景 -->
        <a-sub-menu key="business">
          <template #icon><AppstoreOutlined /></template>
          <template #title>业务场景</template>
          <a-menu-item key="/workorder">
            <span>🏭 生产工单</span>
          </a-menu-item>
          <a-menu-item key="/expense">
            <span>💰 费用报销</span>
          </a-menu-item>
          <a-menu-item key="/purchase">
            <span>🛒 采购申请</span>
          </a-menu-item>
          <a-menu-item key="/sales">
            <span>📈 销售订单</span>
          </a-menu-item>
          <a-menu-item key="/inventory">
            <span>📦 库存管理</span>
          </a-menu-item>
          <a-menu-item key="/quality">
            <span>✅ 质量检验</span>
          </a-menu-item>
          <a-menu-item key="/customer-service">
            <span>🎧 客户服务</span>
          </a-menu-item>
          <a-menu-item key="/leave">
            <span>🌴 请假申请</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 数据集成（仅管理员） -->
        <a-sub-menu v-if="isAdmin" key="data">
          <template #icon><CloudSyncOutlined /></template>
          <template #title>数据集成</template>
          <a-menu-item key="/datasource">
            <span>数据源</span>
          </a-menu-item>
          <a-menu-item key="/datasync">
            <span>数据同步</span>
          </a-menu-item>
          <a-menu-item key="/data-lineage">
            <span>数据血缘</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 低代码设计器 -->
        <a-sub-menu v-if="canAccessPerformance" key="designer">
          <template #icon><FormOutlined /></template>
          <template #title>低代码设计器</template>
          <a-menu-item key="/form-designer">
            <span>表单设计器</span>
          </a-menu-item>
          <a-menu-item key="/workflow-designer">
            <span>流程设计器</span>
          </a-menu-item>
          <a-menu-item key="/page-builder">
            <span>页面构建器</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 低代码管理 -->
        <a-sub-menu v-if="canAccessPerformance" key="lowcode">
          <template #icon><BuildOutlined /></template>
          <template #title>低代码管理</template>
          <a-menu-item key="/form-templates">
            <span>表单模板</span>
          </a-menu-item>
          <a-menu-item key="/page-templates">
            <span>页面模板</span>
          </a-menu-item>
          <a-menu-item key="/workflow-templates">
            <span>流程模板</span>
          </a-menu-item>
          <a-menu-item key="/form-data">
            <span>表单数据</span>
          </a-menu-item>
          <a-menu-item key="/api-management">
            <span>API管理</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 系统管理（仅管理员） -->
        <a-sub-menu v-if="isAdmin" key="system">
          <template #icon><SettingOutlined /></template>
          <template #title>系统管理</template>
          <a-menu-item key="/user-permissions">
            <span>用户权限</span>
          </a-menu-item>
          <a-menu-item key="/business-scene-config">
            <span>业务场景配置</span>
          </a-menu-item>
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

    <!-- Debug Window -->
    <DebugWindow />
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Modal, message } from 'ant-design-vue'
import {
  DashboardOutlined,
  TrophyOutlined,
  LineChartOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  CloudSyncOutlined,
  SyncOutlined,
  ShareAltOutlined,
  FormOutlined,
  PartitionOutlined,
  BuildOutlined,
  ApiOutlined,
  AppstoreOutlined,
  DownOutlined,
  LogoutOutlined,
  FileTextOutlined,
  LayoutOutlined,
  NodeIndexOutlined,
  DatabaseOutlined,
  ShopOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import DebugWindow from '../components/DebugWindow.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedKeys = ref([route.path])
const openKeys = ref([])

// 根据路由路径获取应该打开的子菜单
const getOpenKeysByPath = (path) => {
  const menuMap = {
    '/okr': 'okr-performance',
    '/performance': 'okr-performance',
    '/performance-period': 'okr-performance',
    '/kpi-dict': 'okr-performance',
    '/workorder': 'business',
    '/expense': 'business',
    '/purchase': 'business',
    '/sales': 'business',
    '/inventory': 'business',
    '/quality': 'business',
    '/customer-service': 'business',
    '/leave': 'business',
    '/datasource': 'data',
    '/datasync': 'data',
    '/data-lineage': 'data',
    '/form-designer': 'designer',
    '/workflow-designer': 'designer',
    '/page-builder': 'designer',
    '/app-center': 'lowcode',
    '/form-templates': 'lowcode',
    '/page-templates': 'lowcode',
    '/workflow-templates': 'lowcode',
    '/form-data': 'lowcode',
    '/api-management': 'lowcode',
    '/app-market': 'lowcode',
    '/user-permissions': 'system',
    '/business-scene-config': 'system'
  }
  const key = menuMap[path]
  return key ? [key] : []
}

// 初始化时根据当前路由展开对应菜单
openKeys.value = getOpenKeysByPath(route.path)

watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]
  openKeys.value = getOpenKeysByPath(newPath)
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
  // 设计器路由在新标签页打开（唯一窗口）
  const designerRoutes = {
    '/form-designer': 'form-designer',
    '/workflow-designer': 'workflow-designer',
    '/page-builder': 'page-builder'
  }

  if (designerRoutes[key]) {
    // 使用 window.open 的第二个参数指定窗口名，浏览器会复用同名窗口
    const baseUrl = window.location.origin
    window.open(`${baseUrl}${key}`, designerRoutes[key])
  } else {
    // 其他页面正常路由跳转
    router.push(key)
  }
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

/* 侧边栏 - 红色主题增强 */
.sidebar {
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

/* Logo区域 - 增强设计 */
.logo {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(216, 30, 6, 0.2);
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.1) 0%, transparent 100%);
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d81e06 0%, #ff6b6b 100%);
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 1px;
}

.logo p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* 特色菜单项 - 红色主题 */
.featured-menu-item {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.15) 0%, rgba(216, 30, 6, 0.08) 100%) !important;
  margin: 8px 0 !important;
  border-radius: 6px !important;
  border-left: 3px solid #d81e06 !important;
  box-shadow: 0 2px 8px rgba(216, 30, 6, 0.1) !important;
}

.featured-menu-item:hover {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.2) 0%, rgba(216, 30, 6, 0.12) 100%) !important;
  transform: translateX(2px);
}

.featured-icon {
  color: #ff6b6b !important;
  font-size: 16px !important;
}

.featured-text {
  color: #ff6b6b !important;
  font-weight: 600 !important;
}

/* 顶部导航栏 - 增强设计 */
.header {
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-bottom: 2px solid rgba(216, 30, 6, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #d81e06 0%, transparent 50%, #d81e06 100%);
  opacity: 0.3;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #262626 0%, #595959 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 用户信息区域 - 增强设计 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #f0f0f0;
}

.user-info:hover {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.05) 0%, rgba(216, 30, 6, 0.02) 100%);
  border-color: rgba(216, 30, 6, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(216, 30, 6, 0.08);
}

.user-name {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(216, 30, 6, 0.05);
  border-radius: 4px;
}

/* 主内容区 */
.main-content {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  min-height: calc(100vh - 64px);
}

/* 菜单项动画 */
:deep(.ant-menu-item),
:deep(.ant-menu-submenu-title) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-menu-item:hover),
:deep(.ant-menu-submenu-title:hover) {
  transform: translateX(2px);
}

/* 选中菜单项的红色主题 */
:deep(.ant-menu-dark.ant-menu-inline .ant-menu-item-selected) {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.2) 0%, rgba(216, 30, 6, 0.1) 100%) !important;
  border-left: 3px solid #d81e06;
}

:deep(.ant-menu-dark .ant-menu-item-selected .anticon),
:deep(.ant-menu-dark .ant-menu-item-selected span) {
  color: #ff6b6b !important;
}

/* 下拉菜单增强 */
:deep(.ant-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
