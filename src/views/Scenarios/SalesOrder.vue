<template>
  <div class="sales-order-page">
    <a-card title="📈 销售订单管理" class="header-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateModal = true">
            <PlusOutlined /> 新建订单
          </a-button>
          <a-button><FileExcelOutlined /> 导出</a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-statistic
            title="本月订单"
            :value="156"
            suffix="单"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><ShoppingOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="本月销售额"
            :value="2856000"
            prefix="¥"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><DollarOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="待发货"
            :value="23"
            suffix="单"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="已完成"
            :value="133"
            suffix="单"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 筛选器 -->
      <a-space style="margin-bottom: 16px;">
        <a-select v-model:value="filterStatus" style="width: 120px;" placeholder="订单状态">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="pending">待确认</a-select-option>
          <a-select-option value="confirmed">已确认</a-select-option>
          <a-select-option value="shipping">发货中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
        </a-select>
        <a-range-picker v-model:value="dateRange" />
        <a-input-search style="width: 200px;" placeholder="搜索客户或订单号" />
      </a-space>

      <!-- 订单列表 -->
      <a-table
        :columns="columns"
        :data-source="salesOrders"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'amount'">
            ¥{{ record.amount.toLocaleString() }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small">详情</a-button>
              <a-button type="link" size="small" v-if="record.status === 'pending'">确认</a-button>
              <a-button type="link" size="small" v-if="record.status === 'confirmed'">发货</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建订单弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建销售订单"
      width="800px"
      @ok="handleCreateSubmit"
    >
      <a-form :model="newOrder" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客户名称" required>
              <a-input v-model:value="newOrder.customer" placeholder="请输入客户名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" required>
              <a-input v-model:value="newOrder.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="产品信息" required>
          <a-table
            :columns="productColumns"
            :data-source="newOrder.products"
            :pagination="false"
            size="small"
          >
            <template #footer>
              <a-button type="dashed" block @click="addProduct">
                <PlusOutlined /> 添加产品
              </a-button>
            </template>
          </a-table>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="期望交付日期" required>
              <a-date-picker v-model:value="newOrder.deliveryDate" style="width: 100%;" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="订单总额">
              <a-input-number v-model:value="newOrder.amount" prefix="¥" disabled style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="收货地址" required>
          <a-textarea v-model:value="newOrder.address" :rows="2" placeholder="请输入详细收货地址" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="newOrder.remark" :rows="3" placeholder="订单备注信息" />
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
  ShoppingOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

const showCreateModal = ref(false)
const filterStatus = ref('')
const dateRange = ref([])

const columns = [
  { title: '订单编号', dataIndex: 'id', key: 'id', width: 130, fixed: 'left' },
  { title: '客户名称', dataIndex: 'customer', key: 'customer', width: 150 },
  { title: '产品', dataIndex: 'products', key: 'products', width: 200, ellipsis: true },
  { title: '订单金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', width: 160 },
  { title: '交付日期', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 120 },
  { title: '销售员', dataIndex: 'salesperson', key: 'salesperson', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const salesOrders = ref([
  {
    id: 'SO-2024-001',
    customer: '华润医药',
    products: '金银花颗粒 x 1000盒',
    amount: 85000,
    orderTime: '2024-12-10 10:30:00',
    deliveryDate: '2024-12-20',
    salesperson: '李明',
    status: 'shipping'
  },
  {
    id: 'SO-2024-002',
    customer: '国大药房',
    products: '板蓝根颗粒 x 500盒',
    amount: 32000,
    orderTime: '2024-12-11 14:20:00',
    deliveryDate: '2024-12-18',
    salesperson: '张伟',
    status: 'confirmed'
  },
  {
    id: 'SO-2024-003',
    customer: '老百姓大药房',
    products: '三七粉 x 200罐',
    amount: 18000,
    orderTime: '2024-12-12 09:15:00',
    deliveryDate: '2024-12-25',
    salesperson: '王芳',
    status: 'pending'
  }
])

const productColumns = [
  { title: '产品名称', dataIndex: 'name', key: 'name' },
  { title: '规格', dataIndex: 'spec', key: 'spec', width: 100 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
  { title: '单价', dataIndex: 'price', key: 'price', width: 100 },
  { title: '小计', dataIndex: 'subtotal', key: 'subtotal', width: 100 }
]

const newOrder = ref({
  customer: '',
  phone: '',
  products: [],
  deliveryDate: null,
  amount: 0,
  address: '',
  remark: ''
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    confirmed: 'blue',
    shipping: 'cyan',
    completed: 'green'
  }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待确认',
    confirmed: '已确认',
    shipping: '发货中',
    completed: '已完成'
  }
  return texts[status] || status
}

const addProduct = () => {
  newOrder.value.products.push({
    name: '',
    spec: '',
    quantity: 1,
    price: 0,
    subtotal: 0
  })
}

const handleCreateSubmit = () => {
  message.success('销售订单已创建')
  showCreateModal.value = false
}
</script>

<style scoped>
.sales-order-page {
  padding: 24px;
}
</style>
