<template>
  <div class="leave-application-page">
    <a-card class="header-card">
      <template #title>
        <div>
          <div style="font-size: 20px; font-weight: 600; margin-bottom: 4px">
            🌴 请假申请
          </div>
          <div style="font-size: 12px; color: #999; font-weight: normal">
            使用模板：
            <a-tag color="blue" size="small" style="cursor: pointer" @click="goToTemplate">
              请假申请表单 v1.2
            </a-tag>
            <a-tooltip title="点击查看模板详情">
              <InfoCircleOutlined style="margin-left: 4px; color: #999" />
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateModal = true">
            <PlusOutlined /> 新建请假申请
          </a-button>
          <a-button>
            <FileExcelOutlined /> 导出
          </a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-statistic
            title="年假余额"
            :value="12"
            suffix="天"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><CalendarOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="待审批"
            :value="2"
            suffix="项"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已批准"
            :value="8"
            suffix="项"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="本月请假"
            :value="3"
            suffix="天"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix><CalendarOutlined /></template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 筛选器 -->
      <a-space style="margin-bottom: 16px;">
        <a-select v-model:value="filterStatus" style="width: 120px;" placeholder="审批状态">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="pending">待审批</a-select-option>
          <a-select-option value="approved">已批准</a-select-option>
          <a-select-option value="rejected">已拒绝</a-select-option>
        </a-select>
        <a-select v-model:value="filterType" style="width: 120px;" placeholder="假期类型">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="annual">年假</a-select-option>
          <a-select-option value="sick">病假</a-select-option>
          <a-select-option value="personal">事假</a-select-option>
          <a-select-option value="maternity">产假</a-select-option>
        </a-select>
        <a-range-picker v-model:value="dateRange" />
      </a-space>

      <!-- 申请列表 -->
      <a-table
        :columns="columns"
        :data-source="filteredApplications"
        :pagination="{ pageSize: 10 }"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'duration'">
            {{ record.duration }} 天
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                查看
              </a-button>
              <a-button
                v-if="record.status === 'pending'"
                type="link"
                size="small"
                danger
                @click="cancelApplication(record)"
              >
                撤销
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建申请弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建请假申请"
      width="600px"
      @ok="handleCreateSubmit"
    >
      <a-form :model="newApplication" layout="vertical">
        <a-form-item label="假期类型" required>
          <a-select v-model:value="newApplication.type">
            <a-select-option value="annual">年假</a-select-option>
            <a-select-option value="sick">病假</a-select-option>
            <a-select-option value="personal">事假</a-select-option>
            <a-select-option value="maternity">产假</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开始日期" required>
          <a-date-picker v-model:value="newApplication.startDate" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="结束日期" required>
          <a-date-picker v-model:value="newApplication.endDate" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="请假时长">
          <a-input-number v-model:value="newApplication.duration" min="0.5" step="0.5" suffix="天" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="请假事由" required>
          <a-textarea v-model:value="newApplication.reason" :rows="4" placeholder="请输入请假事由" />
        </a-form-item>
        <a-form-item label="附件">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            @remove="handleRemove"
          >
            <a-button>
              <UploadOutlined /> 上传附件（如病假条等）
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const loading = ref(false)
const showCreateModal = ref(false)
const filterStatus = ref('')
const filterType = ref('')
const dateRange = ref([])
const fileList = ref([])

const columns = [
  { title: '申请编号', dataIndex: 'id', key: 'id', width: 120 },
  { title: '假期类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '时长', dataIndex: 'duration', key: 'duration', width: 80 },
  { title: '请假事由', dataIndex: 'reason', key: 'reason', ellipsis: true },
  { title: '审批人', dataIndex: 'approver', key: 'approver', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '申请时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]

const applications = ref([
  {
    id: 'LEAVE-2024-001',
    type: 'annual',
    startDate: '2024-12-20',
    endDate: '2024-12-22',
    duration: 3,
    reason: '回家过圣诞节',
    approver: '张经理',
    status: 'approved',
    createTime: '2024-12-10 10:30:00'
  },
  {
    id: 'LEAVE-2024-002',
    type: 'sick',
    startDate: '2024-12-15',
    endDate: '2024-12-15',
    duration: 1,
    reason: '感冒发烧需要休息',
    approver: '张经理',
    status: 'pending',
    createTime: '2024-12-14 09:15:00'
  },
  {
    id: 'LEAVE-2024-003',
    type: 'personal',
    startDate: '2024-12-18',
    endDate: '2024-12-18',
    duration: 0.5,
    reason: '处理个人事务',
    approver: '张经理',
    status: 'pending',
    createTime: '2024-12-12 14:20:00'
  },
  {
    id: 'LEAVE-2024-004',
    type: 'annual',
    startDate: '2024-11-25',
    endDate: '2024-11-29',
    duration: 5,
    reason: '全家出游',
    approver: '张经理',
    status: 'approved',
    createTime: '2024-11-15 11:00:00'
  }
])

const newApplication = ref({
  type: 'annual',
  startDate: null,
  endDate: null,
  duration: 1,
  reason: ''
})

const filteredApplications = computed(() => {
  return applications.value.filter(app => {
    if (filterStatus.value && app.status !== filterStatus.value) return false
    if (filterType.value && app.type !== filterType.value) return false
    return true
  })
})

const getTypeColor = (type) => {
  const colors = {
    annual: 'blue',
    sick: 'orange',
    personal: 'purple',
    maternity: 'pink'
  }
  return colors[type] || 'default'
}

const getTypeText = (type) => {
  const texts = {
    annual: '年假',
    sick: '病假',
    personal: '事假',
    maternity: '产假'
  }
  return texts[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

const viewDetail = (record) => {
  message.info(`查看申请详情: ${record.id}`)
}

const cancelApplication = (record) => {
  message.warning(`撤销申请: ${record.id}`)
}

const handleCreateSubmit = () => {
  message.success('请假申请已提交')
  showCreateModal.value = false
  newApplication.value = {
    type: 'annual',
    startDate: null,
    endDate: null,
    duration: 1,
    reason: ''
  }
}

const beforeUpload = (file) => {
  fileList.value = [...fileList.value, file]
  return false
}

const handleRemove = (file) => {
  const index = fileList.value.indexOf(file)
  const newFileList = fileList.value.slice()
  newFileList.splice(index, 1)
  fileList.value = newFileList
}

// 跳转到表单模板查看
const goToTemplate = () => {
  router.push({
    path: '/form-templates',
    query: { highlight: 'leave-application-form' }
  })
  message.info('跳转到表单模板：请假申请表单')
}
</script>

<style scoped>
.leave-application-page {
  padding: 24px;
}

.header-card {
  margin-bottom: 16px;
}
</style>
