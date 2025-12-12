<template>
  <div class="performance-page">
    <div class="page-header">
      <h2>绩效管理</h2>
      <a-space>
        <a-select v-model:value="selectedCycle" style="width: 200px" @change="loadPerformanceData">
          <a-select-option value="Q4 2025">Q4 2025</a-select-option>
          <a-select-option value="Q3 2025">Q3 2025</a-select-option>
          <a-select-option value="Q2 2025">Q2 2025</a-select-option>
          <a-select-option value="Q1 2025">Q1 2025</a-select-option>
        </a-select>
        <a-button type="primary" v-if="isManager" @click="showBatchReviewModal = true">
          <TeamOutlined /> 批量评审
        </a-button>
      </a-space>
    </div>

    <!-- Performance Overview Cards -->
    <a-row :gutter="12" style="margin-bottom: 16px;">
      <a-col :span="6">
        <a-card size="small" :body-style="{ padding: '16px' }">
          <a-statistic
            title="团队平均分"
            :value="performanceStats.averageScore"
            :precision="1"
            suffix="/100"
            :value-style="{ color: '#1890ff', fontSize: '20px' }"
          >
            <template #prefix><TrophyOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small" :body-style="{ padding: '16px' }">
          <a-statistic
            title="OKR完成率"
            :value="performanceStats.okrCompletionRate"
            suffix="%"
            :value-style="{ color: '#52c41a', fontSize: '20px' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small" :body-style="{ padding: '16px' }">
          <a-statistic
            title="待评审人数"
            :value="performanceStats.pendingReviews"
            :value-style="{ color: '#faad14', fontSize: '20px' }"
          >
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small" :body-style="{ padding: '16px' }">
          <a-statistic
            title="已完成评审"
            :value="performanceStats.completedReviews"
            :value-style="{ color: '#52c41a', fontSize: '20px' }"
          >
            <template #prefix><FileTextOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- Performance Table -->
    <a-card title="员工绩效列表">
      <a-table
        :columns="columns"
        :data-source="performanceList"
        :pagination="{ pageSize: 10 }"
        :scroll="{ x: 1400 }"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-space>
              <a-avatar :style="{ backgroundColor: '#1890ff' }">
                {{ record.name.substring(0, 1) }}
              </a-avatar>
              <div>
                <div>{{ record.name }}</div>
                <div style="font-size: 12px; color: #999;">{{ record.department }}</div>
              </div>
            </a-space>
          </template>

          <template v-else-if="column.key === 'okr_score'">
            <a-progress
              :percent="record.okr_score"
              :status="record.okr_score >= 80 ? 'success' : record.okr_score >= 60 ? 'normal' : 'exception'"
              size="small"
            />
          </template>

          <template v-else-if="column.key === 'total_score'">
            <a-tag :color="getScoreColor(record.total_score)" style="font-size: 14px; padding: 4px 12px;">
              {{ record.total_score }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'rating'">
            <a-rate :value="record.rating" disabled allow-half />
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="viewDetail(record)">
                <EyeOutlined /> 查看
              </a-button>
              <a-button
                v-if="record.status === 'pending' && isManager"
                size="small"
                type="primary"
                @click="review(record)"
              >
                <EditOutlined /> 评审
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Review Modal -->
    <a-modal
      v-model:open="showReviewModal"
      title="绩效评审"
      width="800px"
      @ok="handleReview"
      :confirm-loading="reviewing"
    >
      <div v-if="currentReview">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="员工姓名">{{ currentReview.name }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ currentReview.department }}</a-descriptions-item>
          <a-descriptions-item label="考核周期">{{ selectedCycle }}</a-descriptions-item>
          <a-descriptions-item label="OKR完成度">{{ currentReview.okr_score }}%</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="能力评分" required>
            <a-rate v-model:value="reviewForm.rating" allow-half />
            <span style="margin-left: 12px; color: #999;">{{ reviewForm.rating }} / 5</span>
          </a-form-item>

          <a-form-item label="态度评分">
            <a-slider
              v-model:value="reviewForm.attitude_score"
              :min="0"
              :max="20"
              :marks="{ 0: '0', 5: '5', 10: '10', 15: '15', 20: '20' }"
            />
          </a-form-item>

          <a-form-item label="协作评分">
            <a-slider
              v-model:value="reviewForm.collaboration_score"
              :min="0"
              :max="20"
              :marks="{ 0: '0', 5: '5', 10: '10', 15: '15', 20: '20' }"
            />
          </a-form-item>

          <a-form-item label="综合得分">
            <a-input-number
              v-model:value="reviewForm.total_score"
              :min="0"
              :max="100"
              style="width: 200px"
            />
            <span style="margin-left: 12px; color: #999;">满分100分</span>
          </a-form-item>

          <a-form-item label="评审意见">
            <a-textarea
              v-model:value="reviewForm.comment"
              :rows="4"
              placeholder="请输入评审意见、优点与改进建议"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- Batch Review Modal -->
    <a-modal
      v-model:open="showBatchReviewModal"
      title="批量评审"
      width="800px"
      @ok="handleBatchReview"
      :confirm-loading="reviewing"
    >
      <a-alert
        message="批量评审提示"
        description="将对选中的待评审员工应用相同的评审标准"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <div style="margin-bottom: 16px">
        <strong>已选择 {{ selectedRowKeys.length }} 名员工：</strong>
        <a-tag v-for="id in selectedRowKeys" :key="id" color="blue" style="margin: 4px">
          {{ performanceList.find(p => p.id === id)?.name }}
        </a-tag>
      </div>

      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="能力评分" required>
          <a-rate v-model:value="batchReviewForm.rating" allow-half />
          <span style="margin-left: 12px; color: #999;">{{ batchReviewForm.rating }} / 5</span>
        </a-form-item>

        <a-form-item label="态度评分">
          <a-slider
            v-model:value="batchReviewForm.attitude_score"
            :min="0"
            :max="20"
            :marks="{ 0: '0', 5: '5', 10: '10', 15: '15', 20: '20' }"
          />
        </a-form-item>

        <a-form-item label="协作评分">
          <a-slider
            v-model:value="batchReviewForm.collaboration_score"
            :min="0"
            :max="20"
            :marks="{ 0: '0', 5: '5', 10: '10', 15: '15', 20: '20' }"
          />
        </a-form-item>

        <a-form-item label="评审意见">
          <a-textarea
            v-model:value="batchReviewForm.comment"
            :rows="4"
            placeholder="请输入统一评审意见"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="showDetailModal"
      title="绩效详情"
      width="900px"
      :footer="null"
    >
      <div v-if="currentDetail">
        <a-descriptions bordered :column="2" style="margin-bottom: 24px;">
          <a-descriptions-item label="员工姓名">{{ currentDetail.name }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ currentDetail.department }}</a-descriptions-item>
          <a-descriptions-item label="岗位">{{ currentDetail.position }}</a-descriptions-item>
          <a-descriptions-item label="考核周期">{{ selectedCycle }}</a-descriptions-item>
          <a-descriptions-item label="OKR完成度">
            <a-progress :percent="currentDetail.okr_score" size="small" />
          </a-descriptions-item>
          <a-descriptions-item label="综合得分">
            <a-tag :color="getScoreColor(currentDetail.total_score)" style="font-size: 16px; padding: 6px 16px;">
              {{ currentDetail.total_score }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="能力评级">
            <a-rate :value="currentDetail.rating" disabled allow-half />
          </a-descriptions-item>
          <a-descriptions-item label="评审状态">
            <a-tag :color="getStatusColor(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <a-card title="评分明细" size="small" style="margin-bottom: 16px;">
          <a-row :gutter="16">
            <a-col :span="8">
              <div class="score-item">
                <div class="score-label">OKR得分 (60%)</div>
                <div class="score-value">{{ (currentDetail.okr_score * 0.6).toFixed(1) }}</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="score-item">
                <div class="score-label">态度得分 (20%)</div>
                <div class="score-value">{{ currentDetail.attitude_score || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="score-item">
                <div class="score-label">协作得分 (20%)</div>
                <div class="score-value">{{ currentDetail.collaboration_score || '-' }}</div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <a-card v-if="currentDetail.comment" title="评审意见" size="small">
          <p>{{ currentDetail.comment }}</p>
        </a-card>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useOKRStore } from '../../stores/okr'
import { useDebugStore, delay } from '../../stores/debug'
import { message } from 'ant-design-vue'
import {
  TeamOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons-vue'

const userStore = useUserStore()
const okrStore = useOKRStore()
const debugStore = useDebugStore()

const selectedCycle = ref('Q4 2025')
const showReviewModal = ref(false)
const showDetailModal = ref(false)
const showBatchReviewModal = ref(false)
const reviewing = ref(false)
const currentReview = ref(null)
const currentDetail = ref(null)
const selectedRowKeys = ref([])

const reviewForm = ref({
  rating: 4,
  attitude_score: 15,
  collaboration_score: 15,
  total_score: 85,
  comment: ''
})

const batchReviewForm = ref({
  rating: 4,
  attitude_score: 15,
  collaboration_score: 15,
  comment: ''
})

const performanceList = ref([
  {
    id: 1,
    user_id: 1,
    name: '张三',
    department: '销售部',
    position: '销售主管',
    okr_score: 75,
    attitude_score: 16,
    collaboration_score: 17,
    total_score: 87,
    rating: 4.5,
    status: 'completed',
    comment: '工作态度积极，团队协作能力强，OKR完成情况良好。'
  },
  {
    id: 2,
    user_id: 4,
    name: '赵六',
    department: '研发部',
    position: '开发工程师',
    okr_score: 88,
    attitude_score: 18,
    collaboration_score: 19,
    total_score: 92,
    rating: 5,
    status: 'completed',
    comment: '技术能力突出，超额完成OKR目标，是团队核心成员。'
  },
  {
    id: 3,
    user_id: 7,
    name: '孙琪',
    department: '人力资源部',
    position: 'HR专员',
    okr_score: 72,
    attitude_score: null,
    collaboration_score: null,
    total_score: null,
    rating: null,
    status: 'pending',
    comment: null
  },
  {
    id: 4,
    user_id: 8,
    name: '李明',
    department: '销售部',
    position: '销售经理',
    okr_score: 82,
    attitude_score: 17,
    collaboration_score: 18,
    total_score: 89,
    rating: 4.5,
    status: 'completed',
    comment: '销售业绩出色，团队管理有方。'
  },
  {
    id: 5,
    user_id: 9,
    name: '王芳',
    department: '研发部',
    position: '前端工程师',
    okr_score: 78,
    attitude_score: null,
    collaboration_score: null,
    total_score: null,
    rating: null,
    status: 'pending',
    comment: null
  },
  {
    id: 6,
    user_id: 10,
    name: '陈佳',
    department: '市场部',
    position: '市场专员',
    okr_score: 68,
    attitude_score: 14,
    collaboration_score: 15,
    total_score: 80,
    rating: 4,
    status: 'completed',
    comment: '市场推广执行到位，需加强数据分析能力。'
  },
  {
    id: 7,
    user_id: 11,
    name: '刘强',
    department: '生产部',
    position: '生产主管',
    okr_score: 85,
    attitude_score: 18,
    collaboration_score: 17,
    total_score: 90,
    rating: 4.5,
    status: 'completed',
    comment: '生产效率提升显著，安全管理到位。'
  },
  {
    id: 8,
    user_id: 12,
    name: '周敏',
    department: '质量部',
    position: '质检员',
    okr_score: 76,
    attitude_score: null,
    collaboration_score: null,
    total_score: null,
    rating: null,
    status: 'pending',
    comment: null
  },
  {
    id: 9,
    user_id: 13,
    name: '吴勇',
    department: '研发部',
    position: '后端工程师',
    okr_score: 91,
    attitude_score: 19,
    collaboration_score: 18,
    total_score: 94,
    rating: 5,
    status: 'completed',
    comment: '技术扎实，代码质量高，是团队技术骨干。'
  },
  {
    id: 10,
    user_id: 14,
    name: '郑丽',
    department: '财务部',
    position: '会计',
    okr_score: 70,
    attitude_score: 15,
    collaboration_score: 16,
    total_score: 82,
    rating: 4,
    status: 'completed',
    comment: '账务处理准确，工作细致认真。'
  },
  {
    id: 11,
    user_id: 15,
    name: '黄涛',
    department: '采购部',
    position: '采购专员',
    okr_score: 74,
    attitude_score: null,
    collaboration_score: null,
    total_score: null,
    rating: null,
    status: 'pending',
    comment: null
  },
  {
    id: 12,
    user_id: 16,
    name: '徐静',
    department: '客服部',
    position: '客服主管',
    okr_score: 79,
    attitude_score: 17,
    collaboration_score: 18,
    total_score: 87,
    rating: 4.5,
    status: 'completed',
    comment: '客户满意度高，团队管理有序。'
  }
])

const performanceStats = computed(() => {
  const completed = performanceList.value.filter(p => p.status === 'completed')
  const pending = performanceList.value.filter(p => p.status === 'pending')

  const avgScore = completed.length > 0
    ? completed.reduce((sum, p) => sum + p.total_score, 0) / completed.length
    : 0

  const avgOKR = completed.length > 0
    ? completed.reduce((sum, p) => sum + p.okr_score, 0) / completed.length
    : 0

  return {
    averageScore: avgScore.toFixed(1),
    okrCompletionRate: avgOKR.toFixed(1),
    pendingReviews: pending.length,
    completedReviews: completed.length
  }
})

const isManager = computed(() => {
  return ['manager', 'hr', 'admin', 'leader'].includes(userStore.currentUser?.role)
})

const columns = [
  { title: '员工', key: 'name', width: 200, fixed: 'left' },
  { title: '岗位', dataIndex: 'position', key: 'position', width: 150 },
  { title: 'OKR完成度', key: 'okr_score', width: 150 },
  { title: '能力评级', key: 'rating', width: 150 },
  { title: '综合得分', key: 'total_score', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

const getScoreColor = (score) => {
  if (!score) return 'default'
  if (score >= 90) return 'green'
  if (score >= 80) return 'blue'
  if (score >= 60) return 'orange'
  return 'red'
}

const getStatusColor = (status) => {
  return status === 'completed' ? 'green' : 'orange'
}

const getStatusText = (status) => {
  return status === 'completed' ? '已完成' : '待评审'
}

const loadPerformanceData = async () => {
  debugStore.log('info', `📊 加载绩效数据 (${selectedCycle.value})`)
  await delay(400)
  debugStore.log('success', `✓ 加载完成: ${performanceList.value.length}条记录`)
}

const viewDetail = (record) => {
  currentDetail.value = record
  showDetailModal.value = true
  debugStore.log('info', `📖 查看${record.name}的绩效详情`)
}

const review = (record) => {
  currentReview.value = record
  reviewForm.value = {
    rating: 4,
    attitude_score: 15,
    collaboration_score: 15,
    total_score: Math.round(record.okr_score * 0.6 + 15 + 15),
    comment: ''
  }
  showReviewModal.value = true
  debugStore.log('info', `📝 开始评审${record.name}的绩效`)
}

const handleReview = async () => {
  reviewing.value = true

  try {
    debugStore.log('info', '💼 提交绩效评审')
    await delay(300)

    debugStore.log('info', `员工: ${currentReview.value.name}`)
    debugStore.log('info', `综合得分: ${reviewForm.value.total_score}`)
    await delay(200)

    debugStore.log('info', '保存评审结果...')
    await delay(400)

    // Update performance record
    const record = performanceList.value.find(p => p.id === currentReview.value.id)
    if (record) {
      record.rating = reviewForm.value.rating
      record.attitude_score = reviewForm.value.attitude_score
      record.collaboration_score = reviewForm.value.collaboration_score
      record.total_score = reviewForm.value.total_score
      record.comment = reviewForm.value.comment
      record.status = 'completed'
    }

    debugStore.log('success', '✓ 评审完成')
    debugStore.log('info', `📨 发送通知给: ${currentReview.value.name}`)
    await delay(200)

    showReviewModal.value = false
    message.success('评审提交成功')

  } catch (error) {
    debugStore.log('error', `评审失败: ${error.message}`)
    message.error('评审失败，请重试')
  } finally {
    reviewing.value = false
  }
}

const handleBatchReview = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请至少选择一名员工')
    return
  }

  reviewing.value = true

  try {
    debugStore.log('info', `📊 批量评审 ${selectedRowKeys.value.length} 名员工`)
    await delay(300)

    for (const id of selectedRowKeys.value) {
      const record = performanceList.value.find(p => p.id === id)
      if (record && record.status === 'pending') {
        const totalScore = Math.round(record.okr_score * 0.6 + batchReviewForm.value.attitude_score + batchReviewForm.value.collaboration_score)

        record.rating = batchReviewForm.value.rating
        record.attitude_score = batchReviewForm.value.attitude_score
        record.collaboration_score = batchReviewForm.value.collaboration_score
        record.total_score = totalScore
        record.comment = batchReviewForm.value.comment
        record.status = 'completed'

        debugStore.log('success', `✓ ${record.name}: ${totalScore}分`)
        await delay(150)
      }
    }

    debugStore.log('success', '✓ 批量评审完成')
    await delay(200)

    showBatchReviewModal.value = false
    selectedRowKeys.value = []
    message.success(`成功评审 ${selectedRowKeys.value.length} 名员工`)

  } catch (error) {
    debugStore.log('error', `批量评审失败: ${error.message}`)
    message.error('批量评审失败，请重试')
  } finally {
    reviewing.value = false
  }
}

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
  debugStore.log('info', `已选择 ${keys.length} 名员工`)
}

onMounted(() => {
  loadPerformanceData()
})
</script>

<style scoped>
.performance-page {
  padding: 12px 16px;
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
}

.score-item {
  text-align: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.score-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.score-value {
  font-size: 20px;
  font-weight: 500;
  color: #1890ff;
}

/* 压缩表格样式 */
:deep(.ant-table-small) {
  font-size: 13px;
}

:deep(.ant-table-small .ant-table-tbody > tr > td) {
  padding: 8px 12px;
}

:deep(.ant-table-small .ant-table-thead > tr > th) {
  padding: 10px 12px;
  font-weight: 600;
}

:deep(.ant-table-small .ant-avatar) {
  width: 28px;
  height: 28px;
  line-height: 28px;
  font-size: 13px;
}

:deep(.ant-progress-line) {
  margin-bottom: 0;
}
</style>
