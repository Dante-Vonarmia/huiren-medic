import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  // 全屏设计器路由（无侧边栏）
  {
    path: '/form-designer',
    name: 'FormDesigner',
    component: () => import('../views/LowCode/FormDesigner.vue'),
    meta: { requiresAuth: true, title: '表单设计器', fullscreen: true }
  },
  {
    path: '/workflow-designer',
    name: 'WorkflowDesigner',
    component: () => import('../views/LowCode/WorkflowDesigner.vue'),
    meta: { requiresAuth: true, title: '流程设计器', fullscreen: true }
  },
  {
    path: '/page-builder',
    name: 'PageBuilder',
    component: () => import('../views/LowCode/PageBuilder.vue'),
    meta: { requiresAuth: true, title: '页面构建器', fullscreen: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('../views/Overview/OperationalDashboard.vue'),
        meta: { title: '运营总览' }
      },
      {
        path: 'okr',
        name: 'OKRList',
        component: () => import('../views/OKR/OKRList.vue'),
        meta: { title: 'OKR管理' }
      },
      // OKR管理 - 扁平化路由
      {
        path: 'okr-create',
        name: 'OKRCreate',
        component: () => import('../views/OKR/OKRCreate.vue'),
        meta: { title: '创建OKR' }
      },
      {
        path: 'okr-detail/:id',
        name: 'OKRDetail',
        component: () => import('../views/OKR/OKRDetail.vue'),
        meta: { title: 'OKR详情' }
      },
      // 数据源管理 - 扁平化路由
      {
        path: 'datasource',
        name: 'DataSourceList',
        component: () => import('../views/DataSource/DataSourceList.vue'),
        meta: { title: '数据源列表', roles: ['admin'] }
      },
      {
        path: 'datasource-config/:id?',
        name: 'DataSourceConfig',
        component: () => import('../views/DataSource/DataSourceConfig.vue'),
        meta: { title: '数据源配置', roles: ['admin'] }
      },
      {
        path: 'data-lineage',
        name: 'DataLineage',
        component: () => import('../views/DataSource/DataLineage.vue'),
        meta: { title: '数据血缘', roles: ['admin'] }
      },
      {
        path: 'datasync',
        name: 'DataSync',
        component: () => import('../views/DataSync/SyncTaskList.vue'),
        meta: { title: '数据同步', roles: ['admin'] }
      },
      // 绩效管理 - 扁平化路由
      {
        path: 'performance',
        name: 'Performance',
        component: () => import('../views/Performance/PerformanceManagement.vue'),
        meta: { title: '绩效管理', roles: ['manager', 'hr', 'admin'] }
      },
      {
        path: 'performance-period',
        name: 'PerformancePeriod',
        component: () => import('../views/Performance/PerformancePeriodManagement.vue'),
        meta: { title: '绩效周期', roles: ['manager', 'hr', 'admin'] }
      },
      // KPI管理 - 扁平化路由
      {
        path: 'kpi-dict',
        name: 'KPIDict',
        component: () => import('../views/KPI/KPIMetricDict.vue'),
        meta: { title: 'KPI字典', roles: ['admin', 'manager'] }
      },
      // 低代码工具 - 扁平化路由
      {
        path: 'api-management',
        name: 'APIManagement',
        component: () => import('../views/LowCode/APIManagement.vue'),
        meta: { title: 'API管理' }
      },
      {
        path: 'app-market',
        name: 'AppMarket',
        component: () => import('../views/LowCode/AppMarket.vue'),
        meta: { title: '应用市场' }
      },
      // 低代码模板管理 - 扁平化路由
      {
        path: 'form-templates',
        name: 'FormTemplateList',
        component: () => import('../views/LowCode/FormTemplateList.vue'),
        meta: { title: '表单模板', roles: ['admin', 'manager'] }
      },
      {
        path: 'form-template-detail/:id',
        name: 'FormTemplateDetail',
        component: () => import('../views/LowCode/FormTemplateDetail.vue'),
        meta: { title: '表单模板详情', roles: ['admin', 'manager'] }
      },
      {
        path: 'page-templates',
        name: 'PageTemplateList',
        component: () => import('../views/LowCode/PageTemplateList.vue'),
        meta: { title: '页面模板', roles: ['admin', 'manager'] }
      },
      {
        path: 'page-template-detail/:id',
        name: 'PageTemplateDetail',
        component: () => import('../views/LowCode/PageTemplateDetail.vue'),
        meta: { title: '页面模板详情', roles: ['admin', 'manager'] }
      },
      {
        path: 'workflow-templates',
        name: 'WorkflowTemplateList',
        component: () => import('../views/LowCode/WorkflowTemplateList.vue'),
        meta: { title: '流程模板', roles: ['admin', 'manager'] }
      },
      {
        path: 'workflow-template-detail/:id',
        name: 'WorkflowTemplateDetail',
        component: () => import('../views/LowCode/WorkflowTemplateDetail.vue'),
        meta: { title: '流程模板详情', roles: ['admin', 'manager'] }
      },
      {
        path: 'app-center',
        name: 'AppCenter',
        component: () => import('../views/LowCode/AppCenter.vue'),
        meta: { title: '应用中心' }
      },
      {
        path: 'form-data',
        name: 'FormDataList',
        component: () => import('../views/LowCode/FormDataList.vue'),
        meta: { title: '表单数据', roles: ['admin', 'manager'] }
      },
      {
        path: 'form-data-detail/:id',
        name: 'FormDataDetail',
        component: () => import('../views/LowCode/FormDataDetail.vue'),
        meta: { title: '表单数据详情', roles: ['admin', 'manager'] }
      },
      // 业务场景 - 扁平化路由
      {
        path: 'expense',
        name: 'Expense',
        component: () => import('../views/Scenarios/ExpenseReimbursement.vue'),
        meta: { title: '费用报销' }
      },
      {
        path: 'workorder',
        name: 'WorkOrder',
        component: () => import('../views/Scenarios/ProductionWorkOrder.vue'),
        meta: { title: '生产工单' }
      },
      {
        path: 'leave',
        name: 'Leave',
        component: () => import('../views/Scenarios/LeaveApplication.vue'),
        meta: { title: '请假申请' }
      },
      {
        path: 'purchase',
        name: 'Purchase',
        component: () => import('../views/Scenarios/PurchaseRequest.vue'),
        meta: { title: '采购申请' }
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('../views/Scenarios/SalesOrder.vue'),
        meta: { title: '销售订单' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/Scenarios/InventoryManagement.vue'),
        meta: { title: '库存管理' }
      },
      {
        path: 'quality',
        name: 'Quality',
        component: () => import('../views/Scenarios/QualityInspection.vue'),
        meta: { title: '质量检验' }
      },
      {
        path: 'customer-service',
        name: 'CustomerService',
        component: () => import('../views/Scenarios/CustomerService.vue'),
        meta: { title: '客户服务' }
      },
      // 系统管理 - 扁平化路由
      {
        path: 'user-permissions',
        name: 'UserPermissions',
        component: () => import('../views/System/UserPermissions.vue'),
        meta: { title: '用户权限', roles: ['admin'] }
      },
      {
        path: 'business-scene-config',
        name: 'BusinessSceneConfig',
        component: () => import('../views/System/BusinessSceneConfig.vue'),
        meta: { title: '业务场景配置', roles: ['admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth && !userStore.currentUser) {
    next('/login')
    return
  }

  // 检查角色权限
  if (to.meta.roles && userStore.currentUser) {
    const hasRole = to.meta.roles.includes(userStore.currentUser.role)
    if (!hasRole) {
      next('/overview')
      return
    }
  }

  next()
})

export default router
