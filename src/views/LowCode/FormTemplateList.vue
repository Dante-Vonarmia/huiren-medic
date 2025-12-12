<template>
  <div class="form-template-list">
    <a-page-header
      title="表单模板"
      sub-title="管理和发布表单模板"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-button type="primary" @click="createTemplate">
          <template #icon><PlusOutlined /></template>
          新建表单
        </a-button>
      </template>
    </a-page-header>

    <div class="content-area">
      <a-card :bordered="false">
        <!-- 筛选栏 -->
        <a-form layout="inline" style="margin-bottom: 16px">
          <a-form-item label="状态">
            <a-select v-model:value="filters.status" style="width: 120px" @change="handleFilterChange">
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="draft">草稿</a-select-option>
              <a-select-option value="published">已发布</a-select-option>
              <a-select-option value="archived">已停用</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="搜索">
            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索表单名称"
              style="width: 240px"
              @search="handleFilterChange"
            />
          </a-form-item>
        </a-form>

        <!-- 表格 -->
        <a-table
          :columns="columns"
          :data-source="filteredTemplates"
          :pagination="pagination"
          :loading="loading"
          row-key="id"
        >
          <!-- 表单名称 -->
          <template #name="{ record }">
            <div style="display: flex; align-items: center; gap: 8px">
              <FormOutlined style="color: #1890ff" />
              <a @click="viewDetail(record)">{{ record.name }}</a>
            </div>
          </template>

          <!-- 状态 -->
          <template #status="{ record }">
            <a-tag v-if="record.status === 'draft'" color="default">草稿</a-tag>
            <a-tag v-else-if="record.status === 'published'" color="success">已发布</a-tag>
            <a-tag v-else-if="record.status === 'archived'" color="warning">已停用</a-tag>
          </template>

          <!-- 权限 -->
          <template #permissions="{ record }">
            <a-tag v-for="role in record.permissions" :key="role" color="blue">
              {{ getRoleName(role) }}
            </a-tag>
          </template>

          <!-- 字段数量 -->
          <template #fieldCount="{ record }">
            <a-badge :count="record.fields.length" :number-style="{ backgroundColor: '#52c41a' }" />
          </template>

          <!-- 使用次数 -->
          <template #usageCount="{ record }">
            <a-statistic
              :value="record.usageCount"
              :value-style="{ fontSize: '14px' }"
              suffix="次"
            />
          </template>

          <!-- 操作 -->
          <template #action="{ record }">
            <a-space>
              <a-button type="link" size="small" @click="previewTemplate(record)">
                <EyeOutlined /> 预览
              </a-button>
              <a-button type="link" size="small" @click="editTemplate(record)">
                <EditOutlined /> 编辑
              </a-button>
              <a-dropdown>
                <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu @click="(e) => handleMenuClick(e, record)">
                    <a-menu-item key="copy">
                      <CopyOutlined /> 复制
                    </a-menu-item>
                    <a-menu-item key="publish" v-if="record.status !== 'published'">
                      <CheckCircleOutlined /> 发布
                    </a-menu-item>
                    <a-menu-item key="archive" v-if="record.status === 'published'">
                      <StopOutlined /> 停用
                    </a-menu-item>
                    <a-menu-item key="permissions">
                      <SafetyOutlined /> 设置权限
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <DeleteOutlined /> 删除
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 预览Modal -->
    <a-modal
      v-model:open="previewVisible"
      title="表单预览"
      width="800px"
      :footer="null"
    >
      <div v-if="currentTemplate" class="form-preview">
        <h2 style="text-align: center; margin-bottom: 24px">{{ currentTemplate.name }}</h2>
        <a-form :layout="'vertical'" style="max-width: 600px; margin: 0 auto">
          <a-form-item
            v-for="field in currentTemplate.fields"
            :key="field.id"
            :label="field.label"
            :required="field.required"
          >
            <a-input v-if="field.type === 'input'" :placeholder="field.placeholder" />
            <a-textarea v-else-if="field.type === 'textarea'" :placeholder="field.placeholder" />
            <a-input-number v-else-if="field.type === 'number'" style="width: 100%" />
            <a-select v-else-if="field.type === 'select'" :placeholder="field.placeholder">
              <a-select-option v-for="opt in field.options" :key="opt" :value="opt">
                {{ opt }}
              </a-select-option>
            </a-select>
            <a-date-picker v-else-if="field.type === 'date'" style="width: 100%" />
            <a-upload v-else-if="field.type === 'upload'">
              <a-button><UploadOutlined /> 上传文件</a-button>
            </a-upload>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 权限设置Modal -->
    <a-modal
      v-model:open="permissionVisible"
      title="设置访问权限"
      @ok="savePermissions"
    >
      <a-form layout="vertical">
        <a-form-item label="可访问角色">
          <a-checkbox-group v-model:value="currentPermissions">
            <a-checkbox value="employee">普通员工</a-checkbox>
            <a-checkbox value="manager">部门经理</a-checkbox>
            <a-checkbox value="hr">HR管理员</a-checkbox>
            <a-checkbox value="admin">系统管理员</a-checkbox>
            <a-checkbox value="leader">高层领导</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  FormOutlined,
  EyeOutlined,
  EditOutlined,
  DownOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SafetyOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 筛选条件
const filters = ref({
  status: 'all',
  keyword: ''
})

// 表格状态
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

// Modal状态
const previewVisible = ref(false)
const permissionVisible = ref(false)
const currentTemplate = ref(null)
const currentPermissions = ref([])

// 表格列定义
const columns = [
  {
    title: '表单名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    slots: { customRender: 'name' }
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    slots: { customRender: 'status' }
  },
  {
    title: '字段数',
    dataIndex: 'fieldCount',
    key: 'fieldCount',
    width: 80,
    align: 'center',
    slots: { customRender: 'fieldCount' }
  },
  {
    title: '访问权限',
    dataIndex: 'permissions',
    key: 'permissions',
    width: 200,
    slots: { customRender: 'permissions' }
  },
  {
    title: '使用次数',
    dataIndex: 'usageCount',
    key: 'usageCount',
    width: 100,
    align: 'center',
    slots: { customRender: 'usageCount' }
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
]

// Mock数据
const templates = ref([
  {
    id: 1,
    name: '请假申请表',
    description: '员工请假申请表单，包含请假类型、时间、事由等信息',
    status: 'published',
    permissions: ['employee', 'manager'],
    usageCount: 156,
    updatedAt: '2025-12-10 14:30',
    fields: [
      { id: 1, type: 'select', label: '请假类型', required: true, placeholder: '请选择请假类型', options: ['年假', '病假', '事假', '调休'] },
      { id: 2, type: 'date', label: '开始日期', required: true },
      { id: 3, type: 'date', label: '结束日期', required: true },
      { id: 4, type: 'number', label: '请假天数', required: true },
      { id: 5, type: 'textarea', label: '请假事由', required: true, placeholder: '请输入请假理由' },
      { id: 6, type: 'upload', label: '附件', required: false }
    ]
  },
  {
    id: 2,
    name: '报销申请表',
    description: '费用报销申请表单，支持多项费用录入',
    status: 'published',
    permissions: ['employee', 'manager'],
    usageCount: 89,
    updatedAt: '2025-12-09 16:20',
    fields: [
      { id: 1, type: 'select', label: '费用类型', required: true, placeholder: '请选择费用类型', options: ['差旅费', '餐饮费', '交通费', '办公用品', '其他'] },
      { id: 2, type: 'number', label: '报销金额', required: true },
      { id: 3, type: 'date', label: '发生日期', required: true },
      { id: 4, type: 'textarea', label: '费用说明', required: true, placeholder: '请详细描述费用用途' },
      { id: 5, type: 'upload', label: '发票附件', required: true }
    ]
  },
  {
    id: 3,
    name: 'OKR创建表',
    description: '目标与关键结果设定表单',
    status: 'published',
    permissions: ['employee', 'manager', 'leader'],
    usageCount: 234,
    updatedAt: '2025-12-11 09:15',
    fields: [
      { id: 1, type: 'input', label: '目标标题', required: true, placeholder: '请输入目标' },
      { id: 2, type: 'textarea', label: '目标描述', required: true, placeholder: '详细描述目标内容' },
      { id: 3, type: 'select', label: '考核周期', required: true, options: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', '年度 2025'] },
      { id: 4, type: 'input', label: '审批人', required: true, placeholder: '选择审批人' }
    ]
  },
  {
    id: 4,
    name: '客户信息采集表',
    description: '销售团队客户信息登记表单',
    status: 'draft',
    permissions: ['employee'],
    usageCount: 0,
    updatedAt: '2025-12-11 11:00',
    fields: [
      { id: 1, type: 'input', label: '客户名称', required: true },
      { id: 2, type: 'input', label: '联系人', required: true },
      { id: 3, type: 'input', label: '联系电话', required: true },
      { id: 4, type: 'input', label: '客户地址', required: false },
      { id: 5, type: 'select', label: '客户等级', required: true, options: ['VIP', 'A级', 'B级', 'C级'] },
      { id: 6, type: 'textarea', label: '备注', required: false }
    ]
  }
])

// 过滤后的数据
const filteredTemplates = computed(() => {
  let result = templates.value

  if (filters.value.status !== 'all') {
    result = result.filter(t => t.status === filters.value.status)
  }

  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.description.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 角色名称映射
const getRoleName = (role) => {
  const roleMap = {
    employee: '员工',
    manager: '经理',
    hr: 'HR',
    admin: '管理员',
    leader: '领导'
  }
  return roleMap[role] || role
}

// 筛选变化
const handleFilterChange = () => {
  // 实际项目中这里会重新请求数据
}

// 新建表单
const createTemplate = () => {
  router.push('/form-designer')
}

// 查看详情
const viewDetail = (record) => {
  router.push(`/form-template-detail/${record.id}`)
}

// 编辑表单
const editTemplate = (record) => {
  router.push(`/form-designer?id=${record.id}`)
}

// 预览表单
const previewTemplate = (record) => {
  currentTemplate.value = record
  previewVisible.value = true
}

// 菜单操作
const handleMenuClick = ({ key }, record) => {
  switch (key) {
    case 'copy':
      copyTemplate(record)
      break
    case 'publish':
      publishTemplate(record)
      break
    case 'archive':
      archiveTemplate(record)
      break
    case 'permissions':
      showPermissions(record)
      break
    case 'delete':
      deleteTemplate(record)
      break
  }
}

// 复制模板
const copyTemplate = (record) => {
  const newTemplate = {
    ...record,
    id: templates.value.length + 1,
    name: `${record.name}(副本)`,
    status: 'draft',
    usageCount: 0,
    updatedAt: new Date().toLocaleString('zh-CN')
  }
  templates.value.unshift(newTemplate)
  message.success('复制成功')
}

// 发布模板
const publishTemplate = (record) => {
  Modal.confirm({
    title: '确认发布',
    content: `确定要发布表单"${record.name}"吗？发布后用户即可使用。`,
    onOk() {
      record.status = 'published'
      message.success('发布成功')
    }
  })
}

// 停用模板
const archiveTemplate = (record) => {
  Modal.confirm({
    title: '确认停用',
    content: `确定要停用表单"${record.name}"吗？停用后用户将无法访问。`,
    onOk() {
      record.status = 'archived'
      message.success('已停用')
    }
  })
}

// 显示权限设置
const showPermissions = (record) => {
  currentTemplate.value = record
  currentPermissions.value = [...record.permissions]
  permissionVisible.value = true
}

// 保存权限
const savePermissions = () => {
  if (currentTemplate.value) {
    currentTemplate.value.permissions = [...currentPermissions.value]
    message.success('权限设置已保存')
    permissionVisible.value = false
  }
}

// 删除模板
const deleteTemplate = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除表单"${record.name}"吗？此操作不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    onOk() {
      const index = templates.value.findIndex(t => t.id === record.id)
      if (index > -1) {
        templates.value.splice(index, 1)
        message.success('删除成功')
      }
    }
  })
}
</script>

<style scoped>
.form-template-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-preview {
  padding: 24px;
}
</style>
