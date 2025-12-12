<template>
  <div class="form-template-detail">
    <a-page-header
      :title="template?.name || '表单模板详情'"
      sub-title="查看表单模板详细信息"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-space>
          <a-button @click="previewTemplate">
            <template #icon><EyeOutlined /></template>
            预览
          </a-button>
          <a-button type="primary" @click="editTemplate">
            <template #icon><EditOutlined /></template>
            编辑
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-area">
      <a-spin :spinning="loading">
        <a-row :gutter="16">
          <!-- 左侧：基本信息 -->
          <a-col :span="16">
            <a-card title="基本信息" :bordered="false" style="margin-bottom: 16px">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="表单名称" :span="2">
                  {{ template?.name }}
                </a-descriptions-item>
                <a-descriptions-item label="描述" :span="2">
                  {{ template?.description }}
                </a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag v-if="template?.status === 'draft'" color="default">草稿</a-tag>
                  <a-tag v-else-if="template?.status === 'published'" color="success">已发布</a-tag>
                  <a-tag v-else-if="template?.status === 'archived'" color="warning">已停用</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="字段数量">
                  <a-badge :count="template?.fields?.length || 0" :number-style="{ backgroundColor: '#52c41a' }" />
                </a-descriptions-item>
                <a-descriptions-item label="访问权限" :span="2">
                  <a-tag v-for="role in template?.permissions || []" :key="role" color="blue">
                    {{ getRoleName(role) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="使用次数">
                  {{ template?.usageCount || 0 }} 次
                </a-descriptions-item>
                <a-descriptions-item label="创建时间">
                  {{ template?.createdAt || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="创建人">
                  {{ template?.creator || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="更新时间">
                  {{ template?.updatedAt || '-' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <!-- 表单字段配置 -->
            <a-card title="表单字段" :bordered="false">
              <a-table
                :columns="fieldColumns"
                :data-source="template?.fields || []"
                :pagination="false"
                row-key="id"
              >
                <template #type="{ record }">
                  <a-tag>{{ getFieldTypeName(record.type) }}</a-tag>
                </template>
                <template #required="{ record }">
                  <a-tag v-if="record.required" color="red">必填</a-tag>
                  <a-tag v-else color="default">非必填</a-tag>
                </template>
              </a-table>
            </a-card>
          </a-col>

          <!-- 右侧：统计信息和操作历史 -->
          <a-col :span="8">
            <a-card title="使用统计" :bordered="false" style="margin-bottom: 16px">
              <a-statistic
                title="总使用次数"
                :value="template?.usageCount || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-statistic
                title="本月使用"
                :value="template?.monthlyUsage || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-statistic
                title="今日使用"
                :value="template?.dailyUsage || 0"
                suffix="次"
              />
            </a-card>

            <a-card title="操作历史" :bordered="false">
              <a-timeline>
                <a-timeline-item v-for="(log, index) in operationLogs" :key="index">
                  <p style="margin: 0">{{ log.action }}</p>
                  <p style="margin: 0; font-size: 12px; color: #999">
                    {{ log.user }} - {{ log.time }}
                  </p>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </a-col>
        </a-row>
      </a-spin>
    </div>

    <!-- 预览Modal -->
    <a-modal
      v-model:open="previewVisible"
      title="表单预览"
      width="800px"
      :footer="null"
    >
      <div v-if="template" class="form-preview">
        <h2 style="text-align: center; margin-bottom: 24px">{{ template.name }}</h2>
        <a-form :layout="'vertical'" style="max-width: 600px; margin: 0 auto">
          <a-form-item
            v-for="field in template.fields"
            :key="field.id"
            :label="field.label"
            :required="field.required"
          >
            <a-input v-if="field.type === 'input'" :placeholder="field.placeholder" disabled />
            <a-textarea v-else-if="field.type === 'textarea'" :placeholder="field.placeholder" disabled />
            <a-input-number v-else-if="field.type === 'number'" style="width: 100%" disabled />
            <a-select v-else-if="field.type === 'select'" :placeholder="field.placeholder" disabled>
              <a-select-option v-for="opt in field.options" :key="opt" :value="opt">
                {{ opt }}
              </a-select-option>
            </a-select>
            <a-date-picker v-else-if="field.type === 'date'" style="width: 100%" disabled />
            <a-upload v-else-if="field.type === 'upload'" disabled>
              <a-button disabled><UploadOutlined /> 上传文件</a-button>
            </a-upload>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { EyeOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const template = ref(null)
const previewVisible = ref(false)

// 表格列定义
const fieldColumns = [
  {
    title: '字段名称',
    dataIndex: 'label',
    key: 'label',
    width: 150
  },
  {
    title: '字段类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    slots: { customRender: 'type' }
  },
  {
    title: '是否必填',
    key: 'required',
    width: 100,
    slots: { customRender: 'required' }
  },
  {
    title: '提示文本',
    dataIndex: 'placeholder',
    key: 'placeholder',
    ellipsis: true
  }
]

// 操作日志
const operationLogs = ref([
  { action: '发布表单', user: '张三', time: '2025-12-10 14:30' },
  { action: '更新字段配置', user: '李四', time: '2025-12-09 16:20' },
  { action: '创建表单', user: '王五', time: '2025-12-08 10:15' }
])

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

// 字段类型名称
const getFieldTypeName = (type) => {
  const typeMap = {
    input: '单行文本',
    textarea: '多行文本',
    number: '数字',
    select: '下拉选择',
    date: '日期',
    upload: '文件上传'
  }
  return typeMap[type] || type
}

// 加载模板详情
const loadTemplate = () => {
  loading.value = true

  // Mock数据 - 实际项目中从API获取
  setTimeout(() => {
    const mockData = {
      id: route.params.id,
      name: '请假申请表',
      description: '员工请假申请表单，包含请假类型、时间、事由等信息',
      status: 'published',
      permissions: ['employee', 'manager'],
      usageCount: 156,
      monthlyUsage: 45,
      dailyUsage: 3,
      creator: '张三',
      createdAt: '2025-12-01 10:00',
      updatedAt: '2025-12-10 14:30',
      fields: [
        { id: 1, type: 'select', label: '请假类型', required: true, placeholder: '请选择请假类型', options: ['年假', '病假', '事假', '调休'] },
        { id: 2, type: 'date', label: '开始日期', required: true },
        { id: 3, type: 'date', label: '结束日期', required: true },
        { id: 4, type: 'number', label: '请假天数', required: true },
        { id: 5, type: 'textarea', label: '请假事由', required: true, placeholder: '请输入请假理由' },
        { id: 6, type: 'upload', label: '附件', required: false }
      ]
    }
    template.value = mockData
    loading.value = false
  }, 500)
}

// 预览表单
const previewTemplate = () => {
  previewVisible.value = true
}

// 编辑表单
const editTemplate = () => {
  router.push(`/form-designer?id=${template.value.id}`)
}

onMounted(() => {
  loadTemplate()
})
</script>

<style scoped>
.form-template-detail {
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
