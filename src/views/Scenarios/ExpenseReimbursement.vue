<template>
  <div class="expense-reimbursement">
    <a-page-header
      title="费用报销"
      sub-title="多级审批流程，自动生成付款单"
    >
      <template #extra>
        <a-button type="primary" @click="createExpense">
          <template #icon><PlusOutlined /></template>
          新建报销
        </a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="16">
        <a-card title="报销列表">
          <a-table
            :columns="columns"
            :data-source="expenses"
            :pagination="{ pageSize: 10 }"
            row-key="expense_no"
          >
            <template #expense_no="{ record }">
              <a @click="viewDetail(record)">{{ record.expense_no }}</a>
            </template>

            <template #expense_type="{ text }">
              <a-tag :color="getTypeColor(text)">{{ text }}</a-tag>
            </template>

            <template #expense_amount="{ text }">
              ¥{{ text.toLocaleString() }}
            </template>

            <template #approval_status="{ text }">
              <a-badge
                :status="getStatusBadge(text)"
                :text="getStatusText(text)"
              />
            </template>

            <template #workflow="{ record }">
              <a-steps :current="getWorkflowStep(record.approval_status)" size="small" style="width: 300px">
                <a-step title="提交" />
                <a-step :title="record.expense_amount > 5000 ? '经理' : '财务'" />
                <a-step v-if="record.expense_amount > 5000" title="总经理" />
                <a-step title="完成" />
              </a-steps>
            </template>

            <template #action="{ record }">
              <a-space>
                <a @click="viewDetail(record)">查看</a>
                <a v-if="record.approval_status === 'PENDING'" @click="editExpense(record)">编辑</a>
                <a v-if="record.approval_status === 'PENDING'" @click="cancelExpense(record)">撤销</a>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="报销统计" style="margin-bottom: 16px">
          <a-statistic title="本月报销总额" :value="stats.monthlyTotal / 10000" suffix="万元" :precision="2">
            <template #prefix><DollarOutlined /></template>
          </a-statistic>
          <a-divider />
          <a-statistic title="待审批" :value="stats.pending">
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-card>

        <a-card title="审批流程说明" size="small">
          <a-timeline size="small">
            <a-timeline-item color="blue">
              <strong>1. 提交申请</strong>
              <div style="color: #999; font-size: 12px">填写报销信息，上传发票</div>
            </a-timeline-item>
            <a-timeline-item color="green">
              <strong>2. 部门经理审批</strong>
              <div style="color: #999; font-size: 12px">审核费用合理性</div>
            </a-timeline-item>
            <a-timeline-item color="orange">
              <strong>3. 总经理审批</strong>
              <div style="color: #999; font-size: 12px">金额>5000需总经理审批</div>
            </a-timeline-item>
            <a-timeline-item color="purple">
              <strong>4. 财务审核</strong>
              <div style="color: #999; font-size: 12px">发票验证，生成付款单</div>
            </a-timeline-item>
            <a-timeline-item color="cyan">
              <strong>5. 自动付款</strong>
              <div style="color: #999; font-size: 12px">对接财务系统，自动转账</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详情抽屉 -->
    <a-drawer
      v-model:visible="detailVisible"
      title="报销详情"
      width="600"
    >
      <div v-if="selectedExpense">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="报销单号">
            {{ selectedExpense.expense_no }}
          </a-descriptions-item>
          <a-descriptions-item label="申请人">
            {{ selectedExpense.applicant }}
          </a-descriptions-item>
          <a-descriptions-item label="费用类型">
            <a-tag :color="getTypeColor(selectedExpense.expense_type)">
              {{ selectedExpense.expense_type }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="报销金额">
            ¥{{ selectedExpense.expense_amount.toLocaleString() }}
          </a-descriptions-item>
          <a-descriptions-item label="费用说明">
            {{ selectedExpense.description }}
          </a-descriptions-item>
          <a-descriptions-item label="发票附件">
            <a-space>
              <a-button size="small" type="link">发票1.jpg</a-button>
              <a-button size="small" type="link">发票2.jpg</a-button>
            </a-space>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>审批记录</a-divider>

        <a-timeline>
          <a-timeline-item v-for="record in selectedExpense.approvalRecords" :key="record.id" :color="record.color">
            <p>
              <strong>{{ record.nodeName }}</strong>
              <a-tag :color="record.color" style="margin-left: 8px">{{ record.result }}</a-tag>
            </p>
            <p style="color: #999; font-size: 12px">
              审批人: {{ record.approver }} | 时间: {{ record.time }}
            </p>
            <p v-if="record.comment" style="color: #666; font-size: 13px">
              意见: {{ record.comment }}
            </p>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

const expenses = ref([
  {
    expense_no: 'EXP20251211001',
    applicant: '张三',
    expense_type: '差旅费',
    expense_amount: 3500,
    description: '北京-上海出差，拜访客户',
    approval_status: 'APPROVED',
    submitted_at: '2025-12-11 09:00',
    approvalRecords: [
      { id: 1, nodeName: '提交申请', approver: '张三', time: '2025-12-11 09:00', result: '已提交', color: 'blue' },
      { id: 2, nodeName: '部门经理审批', approver: '李经理', time: '2025-12-11 11:30', result: '同意', comment: '同意报销', color: 'green' },
      { id: 3, nodeName: '财务审核', approver: '王专员', time: '2025-12-11 14:20', result: '通过', comment: '发票验证通过', color: 'green' }
    ]
  },
  {
    expense_no: 'EXP20251210001',
    applicant: '李四',
    expense_type: '办公用品',
    expense_amount: 1200,
    description: '采购办公用品',
    approval_status: 'PENDING',
    submitted_at: '2025-12-10 15:30'
  },
  {
    expense_no: 'EXP20251209001',
    applicant: '王五',
    expense_type: '餐费',
    expense_amount: 800,
    description: '客户招待',
    approval_status: 'APPROVED',
    submitted_at: '2025-12-09 10:15'
  }
])

const stats = ref({
  monthlyTotal: 125000,
  pending: 5
})

const columns = [
  { title: '报销单号', dataIndex: 'expense_no', key: 'expense_no', width: 140, slots: { customRender: 'expense_no' } },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 80 },
  { title: '费用类型', dataIndex: 'expense_type', key: 'expense_type', width: 100, slots: { customRender: 'expense_type' } },
  { title: '报销金额', dataIndex: 'expense_amount', key: 'expense_amount', width: 100, slots: { customRender: 'expense_amount' } },
  { title: '审批状态', dataIndex: 'approval_status', key: 'approval_status', width: 100, slots: { customRender: 'approval_status' } },
  { title: '提交时间', dataIndex: 'submitted_at', key: 'submitted_at', width: 140 },
  { title: '操作', key: 'action', width: 150, slots: { customRender: 'action' } }
]

const detailVisible = ref(false)
const selectedExpense = ref(null)

const getTypeColor = (type) => {
  const colors = {
    '差旅费': 'blue',
    '餐费': 'green',
    '办公用品': 'orange',
    '其他': 'default'
  }
  return colors[type] || 'default'
}

const getStatusBadge = (status) => {
  const map = {
    'PENDING': 'processing',
    'APPROVED': 'success',
    'REJECTED': 'error'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    'PENDING': '审批中',
    'APPROVED': '已通过',
    'REJECTED': '已驳回'
  }
  return map[status] || status
}

const getWorkflowStep = (status) => {
  const map = {
    'PENDING': 1,
    'APPROVED': 3,
    'REJECTED': 1
  }
  return map[status] || 0
}

const createExpense = () => {
  message.info('创建新报销 (Demo)')
}

const viewDetail = (record) => {
  selectedExpense.value = record
  detailVisible.value = true
}

const editExpense = (record) => {
  message.info(`编辑报销: ${record.expense_no}`)
}

const cancelExpense = (record) => {
  message.warning(`撤销报销: ${record.expense_no}`)
}
</script>

<style scoped>
.expense-reimbursement {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}
</style>
