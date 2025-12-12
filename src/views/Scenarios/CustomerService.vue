<template>
  <div class="customer-service-page">
    <a-card title="🎧 客户服务工单" class="header-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateModal = true">
            <PlusOutlined /> 新建工单
          </a-button>
          <a-button><FileExcelOutlined /> 导出</a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-statistic
            title="待处理"
            :value="15"
            suffix="单"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="处理中"
            :value="8"
            suffix="单"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><LoadingOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已解决"
            :value="142"
            suffix="单"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="客户满意度"
            :value="96.5"
            suffix="%"
            :precision="1"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix><SmileOutlined /></template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 筛选器 -->
      <a-space style="margin-bottom: 16px;">
        <a-select v-model:value="filterStatus" style="width: 120px;" placeholder="工单状态">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="pending">待处理</a-select-option>
          <a-select-option value="processing">处理中</a-select-option>
          <a-select-option value="resolved">已解决</a-select-option>
          <a-select-option value="closed">已关闭</a-select-option>
        </a-select>
        <a-select v-model:value="filterType" style="width: 120px;" placeholder="问题类型">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="complaint">投诉</a-select-option>
          <a-select-option value="consult">咨询</a-select-option>
          <a-select-option value="after-sale">售后</a-select-option>
          <a-select-option value="suggestion">建议</a-select-option>
        </a-select>
        <a-select v-model:value="filterPriority" style="width: 120px;" placeholder="优先级">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="low">低</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="high">高</a-select-option>
          <a-select-option value="urgent">紧急</a-select-option>
        </a-select>
        <a-input-search style="width: 200px;" placeholder="搜索工单号或客户" />
      </a-space>

      <!-- 工单列表 -->
      <a-table
        :columns="columns"
        :data-source="tickets"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1600 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'satisfaction'">
            <a-rate v-if="record.satisfaction" :value="record.satisfaction" disabled style="font-size: 14px;" />
            <span v-else style="color: #999;">未评价</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">详情</a-button>
              <a-button type="link" size="small" v-if="record.status === 'pending'" @click="assignTicket(record)">分配</a-button>
              <a-button type="link" size="small" v-if="record.status === 'processing'" @click="resolveTicket(record)">解决</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建工单弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建服务工单"
      width="700px"
      @ok="handleCreateSubmit"
    >
      <a-form :model="newTicket" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客户名称" required>
              <a-input v-model:value="newTicket.customer" placeholder="请输入客户名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" required>
              <a-input v-model:value="newTicket.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="问题类型" required>
              <a-select v-model:value="newTicket.type">
                <a-select-option value="complaint">投诉</a-select-option>
                <a-select-option value="consult">咨询</a-select-option>
                <a-select-option value="after-sale">售后</a-select-option>
                <a-select-option value="suggestion">建议</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="优先级" required>
              <a-select v-model:value="newTicket.priority">
                <a-select-option value="low">低</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="urgent">紧急</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="关联产品">
          <a-input v-model:value="newTicket.product" placeholder="如涉及产品问题，请填写产品名称" />
        </a-form-item>
        <a-form-item label="问题标题" required>
          <a-input v-model:value="newTicket.title" placeholder="请简要描述问题" />
        </a-form-item>
        <a-form-item label="问题描述" required>
          <a-textarea v-model:value="newTicket.description" :rows="4" placeholder="请详细描述客户问题" />
        </a-form-item>
        <a-form-item label="附件">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            @remove="handleRemove"
          >
            <a-button>
              <UploadOutlined /> 上传附件
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  SmileOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'

const showCreateModal = ref(false)
const filterStatus = ref('')
const filterType = ref('')
const filterPriority = ref('')
const fileList = ref([])

const columns = [
  { title: '工单编号', dataIndex: 'id', key: 'id', width: 130, fixed: 'left' },
  { title: '客户名称', dataIndex: 'customer', key: 'customer', width: 150 },
  { title: '问题类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 90 },
  { title: '问题描述', dataIndex: 'title', key: 'title', width: 250, ellipsis: true },
  { title: '处理人', dataIndex: 'handler', key: 'handler', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '满意度', dataIndex: 'satisfaction', key: 'satisfaction', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const tickets = ref([
  {
    id: 'CS-2024-001',
    customer: '华润医药',
    type: 'complaint',
    priority: 'high',
    title: '产品包装破损',
    description: '收到的金银花颗粒外包装有破损',
    handler: '客服小张',
    status: 'processing',
    satisfaction: null,
    createTime: '2024-12-12 09:30:00'
  },
  {
    id: 'CS-2024-002',
    customer: '国大药房',
    type: 'consult',
    priority: 'medium',
    title: '产品使用咨询',
    description: '询问板蓝根颗粒的服用方法',
    handler: '客服小李',
    status: 'resolved',
    satisfaction: 5,
    createTime: '2024-12-11 14:20:00'
  },
  {
    id: 'CS-2024-003',
    customer: '老百姓大药房',
    type: 'after-sale',
    priority: 'urgent',
    title: '要求退货',
    description: '客户要求退货，产品临近效期',
    handler: null,
    status: 'pending',
    satisfaction: null,
    createTime: '2024-12-12 10:15:00'
  },
  {
    id: 'CS-2024-004',
    customer: '健之佳药房',
    type: 'suggestion',
    priority: 'low',
    title: '产品改进建议',
    description: '建议增加便携装规格',
    handler: '客服小王',
    status: 'closed',
    satisfaction: 4,
    createTime: '2024-12-10 11:00:00'
  }
])

const newTicket = ref({
  customer: '',
  phone: '',
  type: 'consult',
  priority: 'medium',
  product: '',
  title: '',
  description: ''
})

const getTypeColor = (type) => {
  const colors = { complaint: 'red', consult: 'blue', 'after-sale': 'orange', suggestion: 'green' }
  return colors[type] || 'default'
}

const getTypeText = (type) => {
  const texts = { complaint: '投诉', consult: '咨询', 'after-sale': '售后', suggestion: '建议' }
  return texts[type] || type
}

const getPriorityColor = (priority) => {
  const colors = { low: 'default', medium: 'blue', high: 'orange', urgent: 'red' }
  return colors[priority] || 'default'
}

const getPriorityText = (priority) => {
  const texts = { low: '低', medium: '中', high: '高', urgent: '紧急' }
  return texts[priority] || priority
}

const getStatusColor = (status) => {
  const colors = { pending: 'orange', processing: 'blue', resolved: 'green', closed: 'default' }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { pending: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭' }
  return texts[status] || status
}

const viewDetail = (record) => {
  message.info(`查看工单详情: ${record.id}`)
}

const assignTicket = (record) => {
  message.success(`工单 ${record.id} 已分配`)
}

const resolveTicket = (record) => {
  message.success(`工单 ${record.id} 已标记为已解决`)
}

const handleCreateSubmit = () => {
  message.success('服务工单已创建')
  showCreateModal.value = false
  newTicket.value = {
    customer: '',
    phone: '',
    type: 'consult',
    priority: 'medium',
    product: '',
    title: '',
    description: ''
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
</script>

<style scoped>
.customer-service-page {
  padding: 24px;
}
</style>
