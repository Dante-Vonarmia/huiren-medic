<template>
  <div class="user-permissions">
    <div class="page-header">
      <div class="header-content">
        <h1>用户权限管理</h1>
        <p>管理用户角色和功能权限（Demo）</p>
      </div>
      <a-space>
        <a-button @click="resetPermissions">
          <template #icon><ReloadOutlined /></template>
          重置权限
        </a-button>
        <a-button type="primary" @click="savePermissions">
          <template #icon><SaveOutlined /></template>
          保存更改
        </a-button>
      </a-space>
    </div>

    <a-card title="用户列表" style="margin-bottom: 24px">
      <a-table
        :columns="columns"
        :data-source="users"
        :pagination="{ pageSize: 20 }"
        row-key="id"
      >
        <template #username="{ record }">
          <a-space>
            <a-avatar :src="record.avatar" :size="32" />
            <div>
              <div style="font-weight: 500">{{ record.realName }}</div>
              <div style="font-size: 12px; color: #999">{{ record.username }}</div>
            </div>
          </a-space>
        </template>

        <template #role="{ record }">
          <a-select
            v-model:value="record.role"
            style="width: 140px"
            size="small"
            @change="onRoleChange(record)"
          >
            <a-select-option value="employee">
              <UserOutlined /> 普通员工
            </a-select-option>
            <a-select-option value="manager">
              <TeamOutlined /> 部门经理
            </a-select-option>
            <a-select-option value="hr">
              <IdcardOutlined /> HR
            </a-select-option>
            <a-select-option value="leader">
              <CrownOutlined /> 高层领导
            </a-select-option>
            <a-select-option value="admin">
              <SafetyOutlined /> 系统管理员
            </a-select-option>
          </a-select>
        </template>

        <template #permissions="{ record }">
          <a-button size="small" @click="openPermissionModal(record)">
            <SettingOutlined /> 配置权限
          </a-button>
        </template>

        <template #status="{ record }">
          <a-switch v-model:checked="record.active" size="small" />
        </template>
      </a-table>
    </a-card>

    <!-- 权限配置弹窗 -->
    <a-modal
      v-model:visible="permissionModalVisible"
      :title="`配置权限 - ${currentUser?.realName}`"
      width="800px"
      @ok="saveUserPermissions"
    >
      <div v-if="currentUser" class="permission-config">
        <a-alert
          message="提示"
          description="勾选用户可以访问的功能模块。管理员默认拥有所有权限。"
          type="info"
          show-icon
          style="margin-bottom: 24px"
        />

        <a-row :gutter="[16, 16]">
          <a-col :span="12" v-for="category in permissionCategories" :key="category.key">
            <a-card :title="category.name" size="small">
              <a-checkbox-group
                v-model:value="currentUser.permissions"
                style="width: 100%"
              >
                <div v-for="perm in category.items" :key="perm.value" style="margin-bottom: 8px">
                  <a-checkbox :value="perm.value">
                    {{ perm.label }}
                  </a-checkbox>
                </div>
              </a-checkbox-group>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  CrownOutlined,
  SafetyOutlined,
  SettingOutlined,
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import usersData from '../../mock/users.json'

const users = ref(usersData.map(u => ({ ...u, active: true })))
const permissionModalVisible = ref(false)
const currentUser = ref(null)

const columns = [
  { title: '用户', dataIndex: 'username', key: 'username', width: 240, slots: { customRender: 'username' } },
  { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
  { title: '角色', dataIndex: 'role', key: 'role', width: 160, slots: { customRender: 'role' } },
  { title: '权限配置', key: 'permissions', width: 140, align: 'center', slots: { customRender: 'permissions' } },
  { title: '状态', key: 'status', width: 80, align: 'center', slots: { customRender: 'status' } }
]

const permissionCategories = [
  {
    key: 'okr',
    name: 'OKR与绩效',
    items: [
      { value: 'view_okr', label: '查看OKR' },
      { value: 'create_okr', label: '创建OKR' },
      { value: 'manage_performance', label: '绩效管理' },
      { value: 'view_kpi', label: '查看KPI' }
    ]
  },
  {
    key: 'business',
    name: '业务场景',
    items: [
      { value: 'view_workorder', label: '查看工单' },
      { value: 'create_workorder', label: '创建工单' },
      { value: 'view_expense', label: '查看报销' },
      { value: 'create_expense', label: '创建报销' }
    ]
  },
  {
    key: 'data',
    name: '数据集成',
    items: [
      { value: 'view_datasource', label: '查看数据源' },
      { value: 'manage_datasource', label: '管理数据源' },
      { value: 'view_datasync', label: '查看同步' },
      { value: 'manage_datasync', label: '管理同步' }
    ]
  },
  {
    key: 'lowcode',
    name: '低代码平台',
    items: [
      { value: 'use_designer', label: '使用设计器' },
      { value: 'manage_lowcode', label: '管理模板' },
      { value: 'view_formdata', label: '查看表单数据' },
      { value: 'manage_formdata', label: '管理表单数据' }
    ]
  },
  {
    key: 'system',
    name: '系统管理',
    items: [
      { value: 'manage_team', label: '团队管理' },
      { value: 'manage_attendance', label: '考勤管理' },
      { value: 'view_reports', label: '查看报表' },
      { value: 'view_all', label: '查看所有' }
    ]
  },
  {
    key: 'other',
    name: '其他功能',
    items: [
      { value: 'view_employee', label: '查看员工' },
      { value: 'approve_expense', label: '审批报销' },
      { value: 'manage_production', label: '生产管理' }
    ]
  }
]

const openPermissionModal = (user) => {
  currentUser.value = { ...user }
  if (!currentUser.value.permissions) {
    currentUser.value.permissions = []
  }
  permissionModalVisible.value = true
}

const saveUserPermissions = () => {
  const userIndex = users.value.findIndex(u => u.id === currentUser.value.id)
  if (userIndex !== -1) {
    users.value[userIndex].permissions = currentUser.value.permissions
  }
  message.success('权限配置已保存')
  permissionModalVisible.value = false
}

const onRoleChange = (user) => {
  message.info(`已将 ${user.realName} 的角色修改为 ${getRoleName(user.role)}`)
}

const getRoleName = (role) => {
  const roleMap = {
    employee: '普通员工',
    manager: '部门经理',
    hr: 'HR',
    leader: '高层领导',
    admin: '系统管理员'
  }
  return roleMap[role] || role
}

const savePermissions = () => {
  message.success('所有权限更改已保存（Demo）')
}

const resetPermissions = () => {
  users.value = usersData.map(u => ({ ...u, active: true }))
  message.info('权限已重置为默认配置')
}
</script>

<style scoped>
.user-permissions {
  padding: 32px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.permission-config {
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
}
</style>
