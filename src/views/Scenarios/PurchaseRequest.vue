<template>
  <div class="purchase-request-page">
    <a-card title="🛒 采购申请" class="header-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateModal = true">
            <PlusOutlined /> 新建采购申请
          </a-button>
          <a-button><FileExcelOutlined /> 导出</a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-statistic
            title="待审批"
            :value="5"
            suffix="项"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已批准"
            :value="18"
            suffix="项"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="本月金额"
            :value="125000"
            prefix="¥"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><DollarOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="待采购"
            :value="12"
            suffix="项"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix><ShoppingCartOutlined /></template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 筛选器 -->
      <a-space style="margin-bottom: 16px;">
        <a-select v-model:value="filterStatus" style="width: 120px;" placeholder="审批状态">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="pending">待审批</a-select-option>
          <a-select-option value="approved">已批准</a-select-option>
          <a-select-option value="purchasing">采购中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
        </a-select>
        <a-select v-model:value="filterCategory" style="width: 120px;" placeholder="物料类别">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="raw">原材料</a-select-option>
          <a-select-option value="equipment">设备</a-select-option>
          <a-select-option value="office">办公用品</a-select-option>
        </a-select>
        <a-input-search style="width: 200px;" placeholder="搜索申请编号或物料" />
      </a-space>

      <!-- 申请列表 -->
      <a-table
        :columns="columns"
        :data-source="purchaseRequests"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryText(record.category) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'amount'">
            ¥{{ record.amount.toLocaleString() }}
          </template>
          <template v-if="column.key === 'urgency'">
            <a-tag :color="record.urgency === 'high' ? 'red' : record.urgency === 'medium' ? 'orange' : 'default'">
              {{ record.urgency === 'high' ? '紧急' : record.urgency === 'medium' ? '一般' : '普通' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small">查看</a-button>
              <a-button type="link" size="small" v-if="record.status === 'pending'">审批</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建申请弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建采购申请"
      width="700px"
      @ok="handleCreateSubmit"
    >
      <a-form :model="newRequest" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="物料类别" required>
              <a-select v-model:value="newRequest.category">
                <a-select-option value="raw">原材料</a-select-option>
                <a-select-option value="equipment">设备</a-select-option>
                <a-select-option value="office">办公用品</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="紧急程度" required>
              <a-select v-model:value="newRequest.urgency">
                <a-select-option value="low">普通</a-select-option>
                <a-select-option value="medium">一般</a-select-option>
                <a-select-option value="high">紧急</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="物料名称" required>
          <a-input v-model:value="newRequest.itemName" placeholder="请输入物料名称" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="数量" required>
              <a-input-number v-model:value="newRequest.quantity" min="1" style="width: 100%;" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="单位" required>
              <a-input v-model:value="newRequest.unit" placeholder="如：个/箱/吨" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="预估金额" required>
              <a-input-number v-model:value="newRequest.amount" min="0" prefix="¥" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="期望交付日期" required>
          <a-date-picker v-model:value="newRequest.expectedDate" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="采购理由" required>
          <a-textarea v-model:value="newRequest.reason" :rows="4" placeholder="请说明采购用途和必要性" />
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
  CheckCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons-vue'

const showCreateModal = ref(false)
const filterStatus = ref('')
const filterCategory = ref('')

const columns = [
  { title: '申请编号', dataIndex: 'id', key: 'id', width: 130 },
  { title: '物料类别', dataIndex: 'category', key: 'category', width: 100 },
  { title: '物料名称', dataIndex: 'itemName', key: 'itemName', width: 200 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
  { title: '预估金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '紧急程度', dataIndex: 'urgency', key: 'urgency', width: 100 },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '申请时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]

const purchaseRequests = ref([
  {
    id: 'PR-2024-001',
    category: 'raw',
    itemName: '金银花原料',
    quantity: 1000,
    unit: 'kg',
    amount: 50000,
    urgency: 'high',
    applicant: '张伟',
    status: 'pending',
    createTime: '2024-12-12 09:30:00'
  },
  {
    id: 'PR-2024-002',
    category: 'equipment',
    itemName: '生产线输送带',
    quantity: 2,
    unit: '套',
    amount: 35000,
    urgency: 'medium',
    applicant: '李娜',
    status: 'approved',
    createTime: '2024-12-11 14:20:00'
  },
  {
    id: 'PR-2024-003',
    category: 'office',
    itemName: '办公打印纸',
    quantity: 50,
    unit: '箱',
    amount: 2500,
    urgency: 'low',
    applicant: '王芳',
    status: 'completed',
    createTime: '2024-12-10 10:15:00'
  }
])

const newRequest = ref({
  category: 'raw',
  itemName: '',
  quantity: 1,
  unit: '',
  amount: 0,
  urgency: 'medium',
  expectedDate: null,
  reason: ''
})

const getCategoryColor = (category) => {
  const colors = { raw: 'blue', equipment: 'purple', office: 'green' }
  return colors[category] || 'default'
}

const getCategoryText = (category) => {
  const texts = { raw: '原材料', equipment: '设备', office: '办公用品' }
  return texts[category] || category
}

const getStatusColor = (status) => {
  const colors = { pending: 'orange', approved: 'green', purchasing: 'blue', completed: 'default' }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { pending: '待审批', approved: '已批准', purchasing: '采购中', completed: '已完成' }
  return texts[status] || status
}

const handleCreateSubmit = () => {
  message.success('采购申请已提交')
  showCreateModal.value = false
}
</script>

<style scoped>
.purchase-request-page {
  padding: 24px;
}
</style>
