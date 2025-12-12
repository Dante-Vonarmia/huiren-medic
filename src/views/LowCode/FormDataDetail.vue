<template>
  <div class="form-data-detail">
    <a-page-header
      :title="`${formData?.formName || '表单数据'} - 详情`"
      sub-title="查看表单提交数据详情"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-space>
          <a-button @click="exportData">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
          <a-button type="primary" danger @click="deleteData">
            <template #icon><DeleteOutlined /></template>
            删除
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-area">
      <a-spin :spinning="loading">
        <a-row :gutter="16">
          <!-- 左侧：表单数据 -->
          <a-col :span="16">
            <a-card title="提交信息" :bordered="false" style="margin-bottom: 16px">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="数据ID">
                  {{ formData?.id }}
                </a-descriptions-item>
                <a-descriptions-item label="表单类型">
                  <a-tag color="blue">{{ formData?.formName }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="提交人">
                  <div style="display: flex; align-items: center; gap: 8px">
                    <a-avatar size="small" :style="{ backgroundColor: formData?.submitterColor }">
                      {{ formData?.submitter?.[0] }}
                    </a-avatar>
                    {{ formData?.submitter }}
                  </div>
                </a-descriptions-item>
                <a-descriptions-item label="提交时间">
                  {{ formData?.submittedAt }}
                </a-descriptions-item>
                <a-descriptions-item label="数据摘要" :span="2">
                  {{ formData?.summary }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <!-- 表单数据详情 -->
            <a-card title="表单数据" :bordered="false">
              <a-descriptions :column="1" bordered v-if="formData?.data">
                <a-descriptions-item
                  v-for="(value, key) in formData.data"
                  :key="key"
                  :label="formatFieldLabel(key)"
                >
                  {{ formatFieldValue(value) }}
                </a-descriptions-item>
              </a-descriptions>

              <!-- JSON数据视图 -->
              <a-collapse style="margin-top: 16px">
                <a-collapse-panel key="1" header="查看JSON格式">
                  <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; max-height: 400px; overflow: auto">{{ JSON.stringify(formData?.data, null, 2) }}</pre>
                </a-collapse-panel>
              </a-collapse>
            </a-card>
          </a-col>

          <!-- 右侧：附加信息 -->
          <a-col :span="8">
            <a-card title="关联流程" :bordered="false" style="margin-bottom: 16px">
              <div v-if="workflow">
                <a-steps :current="workflow.currentStep" direction="vertical" size="small">
                  <a-step
                    v-for="(step, index) in workflow.steps"
                    :key="index"
                    :title="step.title"
                    :description="step.description"
                    :status="step.status"
                  />
                </a-steps>
              </div>
              <div v-else style="text-align: center; color: #999; padding: 20px">
                该表单未关联审批流程
              </div>
            </a-card>

            <a-card title="附件列表" :bordered="false" style="margin-bottom: 16px">
              <a-list
                v-if="attachments.length > 0"
                :data-source="attachments"
                size="small"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta>
                      <template #avatar>
                        <FileOutlined />
                      </template>
                      <template #title>
                        <a @click="downloadAttachment(item)">{{ item.name }}</a>
                      </template>
                      <template #description>
                        {{ item.size }}
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
              <div v-else style="text-align: center; color: #999; padding: 20px">
                暂无附件
              </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const formData = ref(null)

// 关联流程
const workflow = ref(null)

// 附件列表
const attachments = ref([])

// 操作日志
const operationLogs = ref([
  { action: '提交表单', user: '张伟', time: '2025-12-11 14:30' }
])

// 格式化字段标签
const formatFieldLabel = (key) => {
  const labelMap = {
    leaveType: '请假类型',
    startDate: '开始日期',
    endDate: '结束日期',
    days: '请假天数',
    reason: '请假事由',
    expenseType: '费用类型',
    amount: '报销金额',
    date: '发生日期',
    description: '费用说明',
    objective: '目标标题',
    period: '考核周期',
    approver: '审批人',
    customerName: '客户名称',
    contact: '联系人',
    phone: '联系电话',
    level: '客户等级'
  }
  return labelMap[key] || key
}

// 格式化字段值
const formatFieldValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') {
    // 如果是金额，格式化为货币
    if (value > 100) {
      return `¥${value.toLocaleString()}`
    }
    return value
  }
  return value
}

// 加载表单数据详情
const loadData = () => {
  loading.value = true

  // Mock数据 - 实际项目中从API获取
  setTimeout(() => {
    const mockData = {
      id: route.params.id,
      formName: '请假申请表',
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
    }

    formData.value = mockData

    // Mock流程数据
    workflow.value = {
      currentStep: 1,
      steps: [
        { title: '提交申请', description: '张伟 - 2025-12-11 14:30', status: 'finish' },
        { title: '经理审批', description: '待张经理审批', status: 'process' },
        { title: 'HR备案', description: '待处理', status: 'wait' },
        { title: '完成', description: '', status: 'wait' }
      ]
    }

    // Mock附件数据
    attachments.value = [
      { name: '请假申请.pdf', size: '125 KB', url: '#' }
    ]

    loading.value = false
  }, 500)
}

// 导出数据
const exportData = () => {
  message.success('导出成功')
}

// 删除数据
const deleteData = () => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条数据吗？此操作不可恢复。',
    okType: 'danger',
    onOk() {
      message.success('删除成功')
      router.back()
    }
  })
}

// 下载附件
const downloadAttachment = (item) => {
  message.success(`下载"${item.name}"成功`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.form-data-detail {
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
