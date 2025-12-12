<template>
  <div class="quality-page">
    <a-card title="✅ 质量检验管理" class="header-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateModal = true">
            <PlusOutlined /> 新建检验
          </a-button>
          <a-button><FileExcelOutlined /> 导出报告</a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col :span="6">
          <a-statistic
            title="待检批次"
            :value="8"
            suffix="批"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="本月合格率"
            :value="99.2"
            suffix="%"
            :precision="1"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="本月检验"
            :value="156"
            suffix="批"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><ExperimentOutlined /></template>
          </a-statistic>
        </a-col>
        <a-col :span="6">
          <a-statistic
            title="不合格批次"
            :value="3"
            suffix="批"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #prefix><CloseCircleOutlined /></template>
          </a-statistic>
        </a-col>
      </a-row>

      <!-- 筛选器 -->
      <a-space style="margin-bottom: 16px;">
        <a-select v-model:value="filterType" style="width: 120px;" placeholder="检验类型">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="incoming">来料检验</a-select-option>
          <a-select-option value="process">过程检验</a-select-option>
          <a-select-option value="final">成品检验</a-select-option>
        </a-select>
        <a-select v-model:value="filterResult" style="width: 120px;" placeholder="检验结果">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="pending">待检</a-select-option>
          <a-select-option value="pass">合格</a-select-option>
          <a-select-option value="fail">不合格</a-select-option>
        </a-select>
        <a-range-picker v-model:value="dateRange" />
      </a-space>

      <!-- 检验列表 -->
      <a-table
        :columns="columns"
        :data-source="inspections"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'result'">
            <a-tag :color="getResultColor(record.result)">
              {{ getResultText(record.result) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'passRate'">
            <span :style="{ color: record.passRate >= 99 ? '#52c41a' : record.passRate >= 95 ? '#faad14' : '#ff4d4f' }">
              {{ record.passRate }}%
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewReport(record)">报告</a-button>
              <a-button type="link" size="small" v-if="record.result === 'pending'" @click="doInspection(record)">检验</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建检验弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建质量检验"
      width="700px"
      @ok="handleCreateSubmit"
    >
      <a-form :model="newInspection" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="检验类型" required>
              <a-select v-model:value="newInspection.type">
                <a-select-option value="incoming">来料检验</a-select-option>
                <a-select-option value="process">过程检验</a-select-option>
                <a-select-option value="final">成品检验</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="产品/物料" required>
              <a-input v-model:value="newInspection.product" placeholder="请输入产品或物料名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="生产批号" required>
              <a-input v-model:value="newInspection.batchNo" placeholder="请输入生产批号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="样本数量" required>
              <a-input-number v-model:value="newInspection.sampleSize" min="1" style="width: 100%;" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="检验标准" required>
          <a-select v-model:value="newInspection.standard">
            <a-select-option value="gb">国标GB/T</a-select-option>
            <a-select-option value="yb">药典标准</a-select-option>
            <a-select-option value="qb">企业标准</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="检验项目" required>
          <a-checkbox-group v-model:value="newInspection.items">
            <a-row>
              <a-col :span="8"><a-checkbox value="appearance">外观检查</a-checkbox></a-col>
              <a-col :span="8"><a-checkbox value="weight">重量检测</a-checkbox></a-col>
              <a-col :span="8"><a-checkbox value="moisture">水分含量</a-checkbox></a-col>
              <a-col :span="8"><a-checkbox value="purity">纯度检测</a-checkbox></a-col>
              <a-col :span="8"><a-checkbox value="heavy">重金属检测</a-checkbox></a-col>
              <a-col :span="8"><a-checkbox value="microbial">微生物检测</a-checkbox></a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="newInspection.remark" :rows="3" placeholder="其他检验要求" />
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
  ExperimentOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'

const showCreateModal = ref(false)
const filterType = ref('')
const filterResult = ref('')
const dateRange = ref([])

const columns = [
  { title: '检验编号', dataIndex: 'id', key: 'id', width: 130, fixed: 'left' },
  { title: '检验类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '产品/物料', dataIndex: 'product', key: 'product', width: 180 },
  { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', width: 150 },
  { title: '样本数', dataIndex: 'sampleSize', key: 'sampleSize', width: 80 },
  { title: '合格率', dataIndex: 'passRate', key: 'passRate', width: 100 },
  { title: '检验员', dataIndex: 'inspector', key: 'inspector', width: 100 },
  { title: '检验结果', dataIndex: 'result', key: 'result', width: 100 },
  { title: '检验时间', dataIndex: 'inspectionTime', key: 'inspectionTime', width: 160 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const inspections = ref([
  {
    id: 'QC-2024-001',
    type: 'incoming',
    product: '金银花原料',
    batchNo: 'JYH-20241201',
    sampleSize: 30,
    passRate: 100,
    inspector: '王检验',
    result: 'pass',
    inspectionTime: '2024-12-10 14:30:00'
  },
  {
    id: 'QC-2024-002',
    type: 'final',
    product: '板蓝根颗粒',
    batchNo: 'BLG-20241205',
    sampleSize: 50,
    passRate: 98,
    inspector: '李检验',
    result: 'pass',
    inspectionTime: '2024-12-11 10:15:00'
  },
  {
    id: 'QC-2024-003',
    type: 'process',
    product: '三七粉',
    batchNo: 'SQF-20241208',
    sampleSize: 20,
    passRate: null,
    inspector: null,
    result: 'pending',
    inspectionTime: null
  },
  {
    id: 'QC-2024-004',
    type: 'final',
    product: '感冒灵颗粒',
    batchNo: 'GML-20241207',
    sampleSize: 40,
    passRate: 92,
    inspector: '张检验',
    result: 'fail',
    inspectionTime: '2024-12-09 16:45:00'
  }
])

const newInspection = ref({
  type: 'final',
  product: '',
  batchNo: '',
  sampleSize: 30,
  standard: 'yb',
  items: [],
  remark: ''
})

const getTypeColor = (type) => {
  const colors = { incoming: 'blue', process: 'orange', final: 'purple' }
  return colors[type] || 'default'
}

const getTypeText = (type) => {
  const texts = { incoming: '来料检验', process: '过程检验', final: '成品检验' }
  return texts[type] || type
}

const getResultColor = (result) => {
  const colors = { pending: 'orange', pass: 'green', fail: 'red' }
  return colors[result] || 'default'
}

const getResultText = (result) => {
  const texts = { pending: '待检', pass: '合格', fail: '不合格' }
  return texts[result] || result
}

const viewReport = (record) => {
  message.info(`查看检验报告: ${record.id}`)
}

const doInspection = (record) => {
  message.info(`开始检验: ${record.id}`)
}

const handleCreateSubmit = () => {
  message.success('质量检验任务已创建')
  showCreateModal.value = false
}
</script>

<style scoped>
.quality-page {
  padding: 24px;
}
</style>
