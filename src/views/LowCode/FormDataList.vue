<template>
  <div class="form-data-list">
    <a-page-header title="表单数据" sub-title="查看和管理已提交的表单数据" @back="() => $router.back()" />

    <div class="content-area">
      <a-card :bordered="false">
        <!-- 筛选栏 -->
        <a-form layout="inline" style="margin-bottom: 16px">
          <a-form-item label="表单类型">
            <a-select v-model:value="filters.formType" style="width: 200px" @change="loadData">
              <a-select-option value="all">全部表单</a-select-option>
              <a-select-option value="1">请假申请表</a-select-option>
              <a-select-option value="2">报销申请表</a-select-option>
              <a-select-option value="3">OKR创建表</a-select-option>
              <a-select-option value="4">客户信息采集表</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="提交人">
            <a-input v-model:value="filters.submitter" placeholder="搜索提交人" style="width: 160px" />
          </a-form-item>

          <a-form-item label="日期范围">
            <a-range-picker v-model:value="filters.dateRange" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="loadData">查询</a-button>
            <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
            <a-button style="margin-left: 8px" @click="exportData">
              <template #icon><DownloadOutlined /></template>
              导出
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 统计卡片 -->
        <a-row :gutter="16" style="margin-bottom: 24px">
          <a-col :xs="24" :sm="6">
            <a-statistic
              title="总提交数"
              :value="statistics.total"
              suffix="条"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <FileTextOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :xs="24" :sm="6">
            <a-statistic
              title="今日新增"
              :value="statistics.today"
              suffix="条"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <PlusCircleOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :xs="24" :sm="6">
            <a-statistic
              title="本周新增"
              :value="statistics.week"
              suffix="条"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <RiseOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :xs="24" :sm="6">
            <a-statistic
              title="本月新增"
              :value="statistics.month"
              suffix="条"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <CalendarOutlined />
              </template>
            </a-statistic>
          </a-col>
        </a-row>

        <!-- 表格 -->
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :loading="loading"
          row-key="id"
        >
          <template #formName="{ record }">
            <a-tag color="blue" style="cursor: pointer" @click="goToTemplate(record.templateId)">
              <span style="margin-right: 4px">{{ record.templateIcon }}</span>
              {{ record.templateName }}
            </a-tag>
          </template>

          <template #submitter="{ record }">
            <div style="display: flex; align-items: center; gap: 8px">
              <a-avatar size="small" :style="{ backgroundColor: record.submitterColor }">
                {{ record.submitter[0] }}
              </a-avatar>
              {{ record.submitter }}
            </div>
          </template>

          <template #action="{ record }">
            <a-space>
              <a-button type="link" size="small" @click="viewData(record)">
                <EyeOutlined /> 查看
              </a-button>
              <a-button type="link" size="small" @click="exportSingle(record)">
                <DownloadOutlined /> 导出
              </a-button>
              <a-button type="link" size="small" danger @click="deleteData(record)">
                <DeleteOutlined /> 删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 数据详情Modal -->
    <a-modal
      v-model:open="detailVisible"
      :title="`${currentData?.formName} - 详情`"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentData">
        <a-descriptions-item label="表单类型">{{ currentData.formName }}</a-descriptions-item>
        <a-descriptions-item label="提交人">{{ currentData.submitter }}</a-descriptions-item>
        <a-descriptions-item label="提交时间">{{ currentData.submittedAt }}</a-descriptions-item>
        <a-descriptions-item label="数据ID">{{ currentData.id }}</a-descriptions-item>
        <a-descriptions-item label="表单数据" :span="2">
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; max-height: 300px; overflow: auto">{{ JSON.stringify(currentData.data, null, 2) }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  FileTextOutlined,
  PlusCircleOutlined,
  RiseOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { formTemplates } from '../../mock/formTemplates'

const router = useRouter()

const loading = ref(false)
const detailVisible = ref(false)
const currentData = ref(null)

const filters = ref({
  formType: 'all',
  submitter: '',
  dateRange: null
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 342,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const statistics = ref({
  total: 342,
  today: 12,
  week: 67,
  month: 189
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '表单类型', dataIndex: 'formName', key: 'formName', width: 150, slots: { customRender: 'formName' } },
  { title: '提交人', dataIndex: 'submitter', key: 'submitter', width: 150, slots: { customRender: 'submitter' } },
  { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 180 },
  { title: '数据摘要', dataIndex: 'summary', key: 'summary', ellipsis: true },
  { title: '操作', key: 'action', width: 220, fixed: 'right', slots: { customRender: 'action' } }
]

const dataList = ref([
  {
    id: 101,
    templateId: 'leave-application-form', // 关联表单模板ID
    templateName: '请假申请表单', // 模板名称
    templateIcon: '🌴',
    formName: '请假申请表', // 向后兼容
    submitter: '张伟',
    submitterColor: '#1890ff',
    submittedAt: '2025-12-11 14:30',
    summary: '年假，2025-12-15至2025-12-17，共3天',
    data: {
      leaveType: '年假',
      startDate: '2025-12-15',
      endDate: '2025-12-17',
      days: 3,
      reason: '家庭事务'
    }
  },
  {
    id: 102,
    templateId: 'expense-reimbursement-form',
    templateName: '报销申请表单',
    templateIcon: '💰',
    formName: '报销申请表',
    submitter: '李明',
    submitterColor: '#52c41a',
    submittedAt: '2025-12-11 10:20',
    summary: '差旅费，¥3,520',
    data: {
      expenseType: '差旅费',
      amount: 3520,
      date: '2025-12-10',
      description: '北京出差机票及住宿'
    }
  },
  {
    id: 103,
    templateId: 'okr-creation-form',
    templateName: 'OKR填报表单',
    templateIcon: '🎯',
    formName: 'OKR创建表',
    submitter: '王芳',
    submitterColor: '#722ed1',
    submittedAt: '2025-12-10 16:45',
    summary: 'Q4 2025 销售目标：提升客户满意度',
    data: {
      objective: '提升客户满意度',
      description: '通过优化服务流程提升客户体验',
      period: 'Q4 2025',
      approver: '赵建'
    }
  },
  {
    id: 104,
    templateId: 'customer-info-form',
    templateName: '客户信息采集表单',
    templateIcon: '👥',
    formName: '客户信息采集表',
    submitter: '刘强',
    submitterColor: '#fa8c16',
    submittedAt: '2025-12-10 09:30',
    summary: '客户：XX医药有限公司，VIP级别',
    data: {
      customerName: 'XX医药有限公司',
      contact: '张总',
      phone: '138xxxx8888',
      level: 'VIP'
    }
  },
  {
    id: 105,
    templateId: 'leave-application-form',
    templateName: '请假申请表单',
    templateIcon: '🌴',
    formName: '请假申请表',
    submitter: '陈华',
    submitterColor: '#13c2c2',
    submittedAt: '2025-12-09 15:10',
    summary: '病假，2025-12-10至2025-12-11，共2天',
    data: {
      leaveType: '病假',
      startDate: '2025-12-10',
      endDate: '2025-12-11',
      days: 2,
      reason: '感冒发烧'
    }
  }
])

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据已刷新')
  }, 500)
}

const resetFilters = () => {
  filters.value = {
    formType: 'all',
    submitter: '',
    dateRange: null
  }
  loadData()
}

const exportData = () => {
  message.success('导出Excel文件成功')
}

const viewData = (record) => {
  router.push(`/form-data-detail/${record.id}`)
}

const exportSingle = (record) => {
  message.success(`导出"${record.formName}"数据成功`)
}

const deleteData = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除这条数据吗？此操作不可恢复。`,
    okType: 'danger',
    onOk() {
      const index = dataList.value.findIndex(d => d.id === record.id)
      if (index > -1) {
        dataList.value.splice(index, 1)
        message.success('删除成功')
        pagination.value.total--
      }
    }
  })
}

// 跳转到表单模板（表单设计器）
const goToTemplate = (templateId) => {
  // 跳转到表单模板列表，并携带templateId参数
  router.push({
    path: '/form-templates',
    query: { highlight: templateId }
  })
  message.info('跳转到表单模板管理')
}
</script>

<style scoped>
.form-data-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
</style>
