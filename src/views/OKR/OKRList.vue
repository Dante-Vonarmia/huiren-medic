<template>
  <div class="okr-list-page">
    <div class="page-header">
      <h2>OKR管理</h2>
      <a-button type="primary" @click="router.push('/okr/create')">
        <template #icon><PlusOutlined /></template>
        创建OKR
      </a-button>
    </div>

    <a-card style="margin-bottom: 16px;">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="my" tab="我的OKR">
          <a-table
            :columns="columns"
            :data-source="myOKRList"
            :pagination="{ pageSize: 10 }"
            :scroll="{ x: 1200 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <a @click="viewDetail(record.id)">{{ record.title }}</a>
              </template>

              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>

              <template v-else-if="column.key === 'progress'">
                <a-progress
                  :percent="calculateProgress(record)"
                  :status="record.status === 'approved' ? 'active' : 'normal'"
                  size="small"
                />
              </template>

              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button size="small" @click="viewDetail(record.id)">查看</a-button>
                  <a-button
                    v-if="record.status === 'draft'"
                    size="small"
                    type="primary"
                    @click="router.push(`/okr/${record.id}/edit`)"
                  >
                    编辑
                  </a-button>
                  <a-button
                    v-if="record.status === 'approved'"
                    size="small"
                    @click="updateProgress(record)"
                  >
                    更新进度
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane v-if="isManager" key="team" tab="团队OKR">
          <a-table
            :columns="teamColumns"
            :data-source="teamOKRList"
            :pagination="{ pageSize: 10 }"
            :scroll="{ x: 1300 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <a @click="viewDetail(record.id)">{{ record.title }}</a>
              </template>

              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>

              <template v-else-if="column.key === 'progress'">
                <a-progress
                  :percent="calculateProgress(record)"
                  size="small"
                />
              </template>

              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button size="small" @click="viewDetail(record.id)">查看</a-button>
                  <a-button
                    v-if="record.status === 'pending'"
                    size="small"
                    type="primary"
                    @click="approveOKR(record)"
                  >
                    审批
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOKRStore } from '../../stores/okr'
import { useUserStore } from '../../stores/user'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const okrStore = useOKRStore()
const userStore = useUserStore()

const activeTab = ref('my')

const columns = [
  { title: '目标标题', dataIndex: 'title', key: 'title', width: 250, fixed: 'left' },
  { title: '周期', dataIndex: 'period', key: 'period', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '进度', key: 'progress', width: 150 },
  { title: '审批人', dataIndex: 'approver_name', key: 'approver_name', width: 120 },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180,
    customRender: ({ text }) => new Date(text).toLocaleString('zh-CN') },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

const teamColumns = [
  { title: '目标标题', dataIndex: 'title', key: 'title', width: 250, fixed: 'left' },
  { title: '负责人', dataIndex: 'owner_name', key: 'owner_name', width: 120 },
  { title: '周期', dataIndex: 'period', key: 'period', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '进度', key: 'progress', width: 150 },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180,
    customRender: ({ text }) => new Date(text).toLocaleString('zh-CN') },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const myOKRList = computed(() => {
  return okrStore.myOKRs(userStore.currentUser.id)
})

const teamOKRList = computed(() => {
  return okrStore.pendingOKRs(userStore.currentUser.id)
})

const isManager = computed(() => {
  return ['manager', 'hr', 'admin', 'leader'].includes(userStore.currentUser?.role)
})

const getStatusColor = (status) => {
  const colorMap = {
    draft: 'default',
    pending: 'orange',
    approved: 'blue',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    pending: '待审批',
    approved: '进行中',
    completed: '已完成'
  }
  return textMap[status] || status
}

const calculateProgress = (okr) => {
  if (!okr.keyResults || okr.keyResults.length === 0) return 0

  const totalProgress = okr.keyResults.reduce((sum, kr) => {
    const progress = ((kr.current_value - kr.initial_value) / (kr.target_value - kr.initial_value)) * 100
    return sum + Math.max(0, Math.min(100, progress)) * (kr.weight / 100)
  }, 0)

  return Math.round(totalProgress)
}

const viewDetail = (id) => {
  router.push(`/okr/${id}`)
}

const updateProgress = (record) => {
  message.info('跳转到进度更新页面')
  router.push(`/okr/${record.id}`)
}

const approveOKR = async (record) => {
  Modal.confirm({
    title: '审批OKR',
    content: `确定要审批"${record.title}"吗？`,
    okText: '通过',
    cancelText: '取消',
    onOk: async () => {
      try {
        await okrStore.approve(record.id, '目标合理，同意')
        message.success('审批成功')
      } catch (error) {
        message.error(error.message)
      }
    }
  })
}

onMounted(() => {
  // 数据已经在store中
})
</script>

<style scoped>
.okr-list-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
</style>
