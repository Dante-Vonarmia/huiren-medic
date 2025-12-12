<template>
  <div class="inventory-page">
    <a-card title="📦 库存管理" class="header-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showInboundModal = true">
            <PlusOutlined /> 入库
          </a-button>
          <a-button @click="showOutboundModal = true">
            <MinusOutlined /> 出库
          </a-button>
          <a-button><FileExcelOutlined /> 导出</a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-statistic
            title="库存总值"
            :value="3580000"
            prefix="¥"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><DollarOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="库存SKU"
            :value="286"
            suffix="种"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><DatabaseOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="库存预警"
            :value="12"
            suffix="项"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><WarningOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="近效期"
            :value="5"
            suffix="批"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 筛选器 -->
      <a-space style="margin-bottom: 16px;">
        <a-select v-model:value="filterCategory" style="width: 120px;" placeholder="物料类别">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="raw">原材料</a-select-option>
          <a-select-option value="semi">半成品</a-select-option>
          <a-select-option value="finished">成品</a-select-option>
        </a-select>
        <a-select v-model:value="filterStatus" style="width: 120px;" placeholder="库存状态">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="normal">正常</a-select-option>
          <a-select-option value="warning">预警</a-select-option>
          <a-select-option value="shortage">缺货</a-select-option>
          <a-select-option value="expiring">近效期</a-select-option>
        </a-select>
        <a-input-search style="width: 200px;" placeholder="搜索物料名称或编号" />
      </a-space>

      <!-- 库存列表 -->
      <a-table
        :columns="columns"
        :data-source="inventory"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">
              {{ getCategoryText(record.category) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'quantity'">
            <span :style="{ color: record.quantity < record.minStock ? '#ff4d4f' : record.quantity < record.safeStock ? '#faad14' : '#52c41a' }">
              {{ record.quantity }} {{ record.unit }}
            </span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'value'">
            ¥{{ (record.quantity * record.unitPrice).toLocaleString() }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small">详情</a-button>
              <a-button type="link" size="small">盘点</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 入库弹窗 -->
    <a-modal
      v-model:open="showInboundModal"
      title="入库登记"
      width="600px"
      @ok="handleInbound"
    >
      <a-form layout="vertical">
        <a-form-item label="物料名称" required>
          <a-select placeholder="请选择物料">
            <a-select-option value="1">金银花原料</a-select-option>
            <a-select-option value="2">板蓝根原料</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="入库数量" required>
          <a-input-number min="1" suffix="kg" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="生产批号" required>
          <a-input placeholder="请输入生产批号" />
        </a-form-item>
        <a-form-item label="生产日期" required>
          <a-date-picker style="width: 100%;" />
        </a-form-item>
        <a-form-item label="有效期至" required>
          <a-date-picker style="width: 100%;" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 出库弹窗 -->
    <a-modal
      v-model:open="showOutboundModal"
      title="出库登记"
      width="600px"
      @ok="handleOutbound"
    >
      <a-form layout="vertical">
        <a-form-item label="物料名称" required>
          <a-select placeholder="请选择物料">
            <a-select-option value="1">金银花颗粒</a-select-option>
            <a-select-option value="2">板蓝根颗粒</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="出库数量" required>
          <a-input-number min="1" suffix="盒" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="出库类型" required>
          <a-select>
            <a-select-option value="sale">销售出库</a-select-option>
            <a-select-option value="production">生产领料</a-select-option>
            <a-select-option value="sample">样品出库</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="领用部门">
          <a-input placeholder="请输入领用部门" />
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
  MinusOutlined,
  FileExcelOutlined,
  DollarOutlined,
  DatabaseOutlined,
  WarningOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

const showInboundModal = ref(false)
const showOutboundModal = ref(false)
const filterCategory = ref('')
const filterStatus = ref('')

const columns = [
  { title: '物料编号', dataIndex: 'code', key: 'code', width: 120, fixed: 'left' },
  { title: '物料名称', dataIndex: 'name', key: 'name', width: 200, fixed: 'left' },
  { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
  { title: '库存数量', dataIndex: 'quantity', key: 'quantity', width: 120 },
  { title: '安全库存', dataIndex: 'safeStock', key: 'safeStock', width: 100 },
  { title: '最低库存', dataIndex: 'minStock', key: 'minStock', width: 100 },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
  { title: '库存金额', dataIndex: 'value', key: 'value', width: 120 },
  { title: '仓位', dataIndex: 'location', key: 'location', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const inventory = ref([
  {
    code: 'MAT-001',
    name: '金银花原料',
    category: 'raw',
    quantity: 5000,
    unit: 'kg',
    safeStock: 3000,
    minStock: 1000,
    unitPrice: 50,
    location: 'A-01-001',
    status: 'normal'
  },
  {
    code: 'MAT-002',
    name: '板蓝根原料',
    category: 'raw',
    quantity: 800,
    unit: 'kg',
    safeStock: 2000,
    minStock: 1000,
    unitPrice: 45,
    location: 'A-01-002',
    status: 'warning'
  },
  {
    code: 'PRD-001',
    name: '金银花颗粒',
    category: 'finished',
    quantity: 15000,
    unit: '盒',
    safeStock: 10000,
    minStock: 5000,
    unitPrice: 85,
    location: 'C-02-015',
    status: 'normal'
  },
  {
    code: 'PRD-002',
    name: '板蓝根颗粒',
    category: 'finished',
    quantity: 800,
    unit: '盒',
    safeStock: 5000,
    minStock: 2000,
    unitPrice: 65,
    location: 'C-02-018',
    status: 'shortage'
  }
])

const getCategoryColor = (category) => {
  const colors = { raw: 'blue', semi: 'orange', finished: 'green' }
  return colors[category] || 'default'
}

const getCategoryText = (category) => {
  const texts = { raw: '原材料', semi: '半成品', finished: '成品' }
  return texts[category] || category
}

const getStatusColor = (status) => {
  const colors = { normal: 'green', warning: 'orange', shortage: 'red', expiring: 'purple' }
  return colors[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { normal: '正常', warning: '预警', shortage: '缺货', expiring: '近效期' }
  return texts[status] || status
}

const handleInbound = () => {
  message.success('入库登记成功')
  showInboundModal.value = false
}

const handleOutbound = () => {
  message.success('出库登记成功')
  showOutboundModal.value = false
}
</script>

<style scoped>
.inventory-page {
  padding: 24px;
}
</style>
