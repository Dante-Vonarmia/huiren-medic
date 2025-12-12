import { computed } from 'vue'
import { useUserStore } from '../stores/user'

export function usePermissions() {
  const userStore = useUserStore()

  const currentUser = computed(() => userStore.currentUser)
  const userRole = computed(() => currentUser.value?.role)
  const userPermissions = computed(() => currentUser.value?.permissions || [])

  // 检查是否有特定权限
  const hasPermission = (permission) => {
    if (!currentUser.value) return false
    if (userPermissions.value.includes('*')) return true
    return userPermissions.value.includes(permission)
  }

  // 检查是否有任意一个权限
  const hasAnyPermission = (...permissions) => {
    return permissions.some(p => hasPermission(p))
  }

  // 检查是否有所有权限
  const hasAllPermissions = (...permissions) => {
    return permissions.every(p => hasPermission(p))
  }

  // 角色检查
  const isAdmin = computed(() => userRole.value === 'admin')
  const isManager = computed(() => userRole.value === 'manager')
  const isEmployee = computed(() => userRole.value === 'employee')
  const isHR = computed(() => userRole.value === 'hr')
  const isLeader = computed(() => userRole.value === 'leader')

  // 功能模块访问权限
  const canAccessPerformance = computed(() => {
    return isAdmin.value || isManager.value || isHR.value || isLeader.value
  })

  const canAccessKPI = computed(() => {
    return isAdmin.value || isManager.value || isLeader.value
  })

  const canAccessDataSource = computed(() => {
    return isAdmin.value
  })

  const canAccessSystemSettings = computed(() => {
    return isAdmin.value
  })

  const canAccessLowCodeTemplates = computed(() => {
    return isAdmin.value || isManager.value
  })

  const canAccessProduction = computed(() => {
    if (isAdmin.value || isLeader.value) return true
    const dept = currentUser.value?.department
    return dept === '生产部'
  })

  const canAccessSales = computed(() => {
    if (isAdmin.value || isLeader.value) return true
    const dept = currentUser.value?.department
    return dept === '销售部'
  })

  const canAccessFinance = computed(() => {
    if (isAdmin.value || isLeader.value) return true
    const dept = currentUser.value?.department
    return dept === '财务部'
  })

  const canManageTeam = computed(() => {
    return isAdmin.value || isManager.value || isLeader.value
  })

  // 业务场景权限
  const canAccessExpense = computed(() => {
    return hasAnyPermission('view_expense', 'approve_expense') || isAdmin.value
  })

  const canAccessWorkOrder = computed(() => {
    return hasAnyPermission('view_workorder', 'create_workorder') || canAccessProduction.value
  })

  const canAccessLeave = computed(() => {
    return true // 所有人都可以请假
  })

  const canAccessPurchase = computed(() => {
    return canManageTeam.value || isAdmin.value
  })

  const canAccessInventory = computed(() => {
    return canAccessProduction.value || isAdmin.value
  })

  const canAccessQuality = computed(() => {
    return canAccessProduction.value || isAdmin.value
  })

  const canAccessCustomerService = computed(() => {
    return canAccessSales.value || isAdmin.value
  })

  return {
    currentUser,
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isEmployee,
    isHR,
    isLeader,
    canAccessPerformance,
    canAccessKPI,
    canAccessDataSource,
    canAccessSystemSettings,
    canAccessLowCodeTemplates,
    canAccessProduction,
    canAccessSales,
    canAccessFinance,
    canManageTeam,
    canAccessExpense,
    canAccessWorkOrder,
    canAccessLeave,
    canAccessPurchase,
    canAccessInventory,
    canAccessQuality,
    canAccessCustomerService
  }
}
