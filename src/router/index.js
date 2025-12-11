import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
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
      {
        path: 'okr/create',
        name: 'OKRCreate',
        component: () => import('../views/OKR/OKRCreate.vue'),
        meta: { title: '创建OKR' }
      },
      {
        path: 'okr/:id',
        name: 'OKRDetail',
        component: () => import('../views/OKR/OKRDetail.vue'),
        meta: { title: 'OKR详情' }
      },
      {
        path: 'datasource',
        name: 'DataSourceList',
        component: () => import('../views/DataSource/DataSourceList.vue'),
        meta: { title: '数据源配置', roles: ['admin'] }
      },
      {
        path: 'datasource/config/:id?',
        name: 'DataSourceConfig',
        component: () => import('../views/DataSource/DataSourceConfig.vue'),
        meta: { title: '配置数据源', roles: ['admin'] }
      },
      {
        path: 'performance',
        name: 'Performance',
        component: () => import('../views/Performance/PerformanceManagement.vue'),
        meta: { title: '绩效管理', roles: ['manager', 'hr', 'admin'] }
      },
      {
        path: 'performance/period',
        name: 'PerformancePeriod',
        component: () => import('../views/Performance/PerformancePeriodManagement.vue'),
        meta: { title: '绩效周期管理', roles: ['manager', 'hr', 'admin'] }
      },
      {
        path: 'datasource/lineage',
        name: 'DataLineage',
        component: () => import('../views/DataSource/DataLineage.vue'),
        meta: { title: '数据血缘', roles: ['admin'] }
      },
      {
        path: 'datasync',
        name: 'DataSync',
        component: () => import('../views/DataSync/SyncTaskList.vue'),
        meta: { title: '数据同步任务', roles: ['admin'] }
      },
      {
        path: 'kpi/dict',
        name: 'KPIDict',
        component: () => import('../views/KPI/KPIMetricDict.vue'),
        meta: { title: 'KPI指标字典', roles: ['admin', 'manager'] }
      },
      {
        path: 'lowcode/form-designer',
        name: 'FormDesigner',
        component: () => import('../views/LowCode/FormDesigner.vue'),
        meta: { title: '表单设计器' }
      },
      {
        path: 'lowcode/workflow-designer',
        name: 'WorkflowDesigner',
        component: () => import('../views/LowCode/WorkflowDesigner.vue'),
        meta: { title: '工作流设计器' }
      },
      {
        path: 'lowcode/page-builder',
        name: 'PageBuilder',
        component: () => import('../views/LowCode/PageBuilder.vue'),
        meta: { title: '页面构建器' }
      },
      {
        path: 'lowcode/api-management',
        name: 'APIManagement',
        component: () => import('../views/LowCode/APIManagement.vue'),
        meta: { title: 'API管理' }
      },
      {
        path: 'lowcode/app-market',
        name: 'AppMarket',
        component: () => import('../views/LowCode/AppMarket.vue'),
        meta: { title: '应用市场' }
      },
      {
        path: 'scenarios/customer360',
        name: 'Customer360',
        component: () => import('../views/Scenarios/Customer360View.vue'),
        meta: { title: '客户360视图' }
      },
      {
        path: 'scenarios/sales-funnel',
        name: 'SalesFunnel',
        component: () => import('../views/Scenarios/SalesFunnelDashboard.vue'),
        meta: { title: '销售漏斗仪表板' }
      },
      {
        path: 'scenarios/expense',
        name: 'Expense',
        component: () => import('../views/Scenarios/ExpenseReimbursement.vue'),
        meta: { title: '费用报销' }
      },
      {
        path: 'scenarios/workorder',
        name: 'WorkOrder',
        component: () => import('../views/Scenarios/ProductionWorkOrder.vue'),
        meta: { title: '生产异常工单' }
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
