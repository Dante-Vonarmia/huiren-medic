<template>
  <div class="okr-detail-page">
    <div class="page-header">
      <a-button @click="router.back()">
        <template #icon><ArrowLeftOutlined /></template>
        返回列表
      </a-button>
      <a-space v-if="okr">
        <a-button
          v-if="okr.status === 'draft' && isOwner"
          type="primary"
          @click="startEdit"
        >
          <EditOutlined /> 编辑
        </a-button>
        <a-button
          v-if="okr.status === 'approved' && isOwner"
          type="primary"
          @click="showUpdateModal = true"
        >
          <LineChartOutlined /> 更新进度
        </a-button>
        <a-button
          v-if="okr.status === 'pending' && isApprover"
          type="primary"
          @click="showApprovalModal = true"
        >
          <CheckOutlined /> 审批
        </a-button>
      </a-space>
    </div>

    <div v-if="loading" style="text-align: center; padding: 100px;">
      <a-spin size="large" />
    </div>

    <div v-else-if="okr">
      <!-- View Mode -->
      <div v-if="!isEditing">
        <!-- OKR Header -->
        <a-card style="margin-bottom: 16px;">
          <div class="okr-header">
            <div class="okr-title-section">
              <h1 class="okr-title">{{ okr.title }}</h1>
              <div class="okr-meta">
                <a-tag :color="getStatusColor(okr.status)">
                  {{ getStatusText(okr.status) }}
                </a-tag>
                <span class="meta-item">
                  <CalendarOutlined /> {{ okr.period }}
                </span>
                <span class="meta-item">
                  <UserOutlined /> 负责人：{{ okr.owner_name }}
                </span>
                <span class="meta-item">
                  <TeamOutlined /> 审批人：{{ okr.approver_name }}
                </span>
              </div>
            </div>
            <div class="okr-progress-section">
              <div class="progress-circle">
                <a-progress
                  type="circle"
                  :percent="calculateProgress(okr)"
                  :width="120"
                  :stroke-color="{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }"
                />
              </div>
            </div>
          </div>

          <a-divider />

          <div v-if="okr.description" class="okr-description">
            <h3>目标描述</h3>
            <p>{{ okr.description }}</p>
          </div>
        </a-card>
      </div>

      <!-- Edit Mode -->
      <a-card v-else title="编辑OKR" style="margin-bottom: 16px;">
        <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item label="目标标题" required>
            <a-input v-model:value="editForm.title" placeholder="请输入OKR目标标题" />
          </a-form-item>

          <a-form-item label="目标描述">
            <a-textarea v-model:value="editForm.description" :rows="4" placeholder="详细描述这个OKR的背景和意义" />
          </a-form-item>

          <a-form-item label="周期" required>
            <a-select v-model:value="editForm.period" style="width: 200px">
              <a-select-option value="Q1 2025">Q1 2025</a-select-option>
              <a-select-option value="Q2 2025">Q2 2025</a-select-option>
              <a-select-option value="Q3 2025">Q3 2025</a-select-option>
              <a-select-option value="Q4 2025">Q4 2025</a-select-option>
              <a-select-option value="2025年度">2025年度</a-select-option>
            </a-select>
          </a-form-item>

          <a-divider orientation="left">关键结果 (Key Results)</a-divider>

          <div v-for="(kr, index) in editForm.keyResults" :key="kr.id" style="margin-bottom: 24px; padding: 16px; background: #fafafa; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h4 style="margin: 0;">KR{{ index + 1 }}</h4>
              <a-button v-if="editForm.keyResults.length > 1" danger size="small" @click="removeKR(index)">
                删除
              </a-button>
            </div>

            <a-form-item label="KR标题" required :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
              <a-input v-model:value="kr.title" placeholder="关键结果描述" />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="初始值" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                  <a-input-number v-model:value="kr.initial_value" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="目标值" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                  <a-input-number v-model:value="kr.target_value" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="单位" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                  <a-input v-model:value="kr.unit" placeholder="如: 个, %, 元" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="权重(%)" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
              <a-slider v-model:value="kr.weight" :min="0" :max="100" :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }" />
            </a-form-item>
          </div>

          <a-form-item :wrapper-col="{ span: 20, offset: 4 }">
            <a-button type="dashed" block @click="addKR">
              <PlusOutlined /> 添加关键结果
            </a-button>
          </a-form-item>

          <a-form-item :wrapper-col="{ span: 20, offset: 4 }">
            <a-space>
              <a-button type="primary" @click="saveOKR">保存</a-button>
              <a-button type="primary" @click="submitForApproval">提交审批</a-button>
              <a-button @click="isEditing = false">取消</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- View Mode - Key Results and History -->
      <div v-if="!isEditing">
        <!-- Key Results -->
        <a-card title="关键结果 (Key Results)" style="margin-bottom: 16px;">
          <div class="key-results-list">
            <div
              v-for="(kr, index) in okr.keyResults"
              :key="kr.id"
              class="kr-item"
            >
              <div class="kr-header">
                <div class="kr-title-section">
                  <span class="kr-number">KR{{ index + 1 }}</span>
                  <span class="kr-title">{{ kr.title }}</span>
                  <a-tag v-if="kr.unit" color="blue">{{ kr.unit }}</a-tag>
                </div>
                <span class="kr-weight">权重: {{ kr.weight }}%</span>
              </div>

              <div class="kr-values">
                <div class="value-item">
                  <span class="label">初始值:</span>
                  <span class="value">{{ kr.initial_value }}</span>
                </div>
                <div class="value-item">
                  <span class="label">当前值:</span>
                  <span class="value current">{{ kr.current_value }}</span>
                </div>
                <div class="value-item">
                  <span class="label">目标值:</span>
                  <span class="value target">{{ kr.target_value }}</span>
                </div>
              </div>

              <div class="kr-progress">
                <a-progress
                  :percent="calculateKRProgress(kr)"
                  :status="calculateKRProgress(kr) >= 100 ? 'success' : 'active'"
                />
              </div>
            </div>
          </div>
        </a-card>

        <!-- Update History -->
        <a-card title="更新记录">
          <a-timeline>
            <a-timeline-item color="green">
              <template #dot><CheckCircleOutlined /></template>
              <p>{{ new Date(okr.created_at).toLocaleString('zh-CN') }}</p>
              <p>{{ okr.owner_name }} 创建了OKR</p>
            </a-timeline-item>
            <a-timeline-item v-if="okr.status !== 'draft'" color="blue">
              <template #dot><SendOutlined /></template>
              <p>{{ new Date(okr.created_at).toLocaleString('zh-CN') }}</p>
              <p>提交给 {{ okr.approver_name }} 审批</p>
            </a-timeline-item>
            <a-timeline-item v-if="okr.status === 'approved' || okr.status === 'completed'" color="green">
              <template #dot><CheckCircleOutlined /></template>
              <p>{{ new Date(okr.created_at).toLocaleString('zh-CN') }}</p>
              <p>{{ okr.approver_name }} 审批通过</p>
            </a-timeline-item>
            <a-timeline-item v-if="okr.status === 'completed'" color="green">
              <template #dot><TrophyOutlined /></template>
              <p>{{ new Date().toLocaleString('zh-CN') }}</p>
              <p>OKR已完成</p>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </div>
    </div>

    <a-empty v-else description="OKR不存在" />

    <!-- Update Progress Modal -->
    <a-modal
      v-model:open="showUpdateModal"
      title="更新进度"
      width="800px"
      @ok="handleUpdateProgress"
      :confirm-loading="updating"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <div v-for="(kr, index) in updateForm.keyResults" :key="kr.id" style="margin-bottom: 24px;">
          <a-divider orientation="left">KR{{ index + 1 }}: {{ kr.title }}</a-divider>
          <a-form-item label="当前值">
            <a-input-number
              v-model:value="kr.current_value"
              :min="kr.initial_value"
              :max="kr.target_value"
              :precision="2"
              style="width: 200px"
            />
            <span style="margin-left: 12px; color: #999;">
              (初始: {{ kr.initial_value }}, 目标: {{ kr.target_value }})
            </span>
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

    <!-- Approval Modal -->
    <a-modal
      v-model:open="showApprovalModal"
      title="审批OKR"
      @ok="handleApprove"
      :confirm-loading="approving"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="审批意见">
          <a-textarea
            v-model:value="approvalComment"
            :rows="4"
            placeholder="请输入审批意见（可选）"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOKRStore } from '../../stores/okr'
import { useUserStore } from '../../stores/user'
import { useDebugStore, delay } from '../../stores/debug'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  EditOutlined,
  LineChartOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SendOutlined,
  TrophyOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const okrStore = useOKRStore()
const userStore = useUserStore()
const debugStore = useDebugStore()

const loading = ref(true)
const okr = ref(null)
const isEditing = ref(false)
const showUpdateModal = ref(false)
const showApprovalModal = ref(false)
const updating = ref(false)
const approving = ref(false)
const approvalComment = ref('目标合理，同意')

const updateForm = ref({
  keyResults: []
})

const editForm = ref({
  title: '',
  description: '',
  period: '',
  keyResults: []
})

const isOwner = computed(() => {
  return okr.value && okr.value.owner_id === userStore.currentUser.id
})

const isApprover = computed(() => {
  return okr.value && okr.value.approver_id === userStore.currentUser.id
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

const calculateKRProgress = (kr) => {
  const progress = ((kr.current_value - kr.initial_value) / (kr.target_value - kr.initial_value)) * 100
  return Math.round(Math.max(0, Math.min(100, progress)))
}

const handleUpdateProgress = async () => {
  updating.value = true

  try {
    debugStore.log('info', '📊 更新OKR进度')
    await delay(300)

    debugStore.log('info', '验证进度数据...')
    await delay(200)

    updateForm.value.keyResults.forEach((kr, idx) => {
      debugStore.log('info', `KR${idx + 1}: ${kr.current_value} / ${kr.target_value}`)
    })
    await delay(400)

    debugStore.log('success', '✓ 数据验证通过')
    await delay(200)

    debugStore.log('info', '保存进度更新...')
    await delay(400)

    // Update the store
    okr.value.keyResults = updateForm.value.keyResults.map(kr => ({ ...kr }))

    const progress = calculateProgress(okr.value)
    debugStore.log('success', `✓ 总进度更新为: ${progress}%`)
    await delay(300)

    if (progress >= 100) {
      debugStore.log('success', '🎉 OKR已完成！')
      okr.value.status = 'completed'
    }

    showUpdateModal.value = false
    message.success('进度更新成功')

  } catch (error) {
    debugStore.log('error', `更新失败: ${error.message}`)
    message.error('更新失败，请重试')
  } finally {
    updating.value = false
  }
}

const handleApprove = async () => {
  approving.value = true

  try {
    debugStore.log('info', '✓ 审批OKR')
    await delay(300)

    debugStore.log('info', `审批人: ${userStore.currentUser.realName}`)
    debugStore.log('info', `审批意见: ${approvalComment.value}`)
    await delay(400)

    debugStore.log('info', '更新OKR状态...')
    await delay(300)

    await okrStore.approve(okr.value.id, approvalComment.value)

    okr.value.status = 'approved'

    debugStore.log('success', '✓ 审批通过')
    debugStore.log('info', `📨 发送通知给: ${okr.value.owner_name}`)
    await delay(200)

    showApprovalModal.value = false
    message.success('审批成功')

  } catch (error) {
    debugStore.log('error', `审批失败: ${error.message}`)
    message.error('审批失败，请重试')
  } finally {
    approving.value = false
  }
}

const startEdit = () => {
  editForm.value = {
    title: okr.value.title,
    description: okr.value.description,
    period: okr.value.period,
    keyResults: okr.value.keyResults.map(kr => ({ ...kr }))
  }
  isEditing.value = true
}

const addKR = () => {
  editForm.value.keyResults.push({
    id: Date.now(),
    title: '',
    initial_value: 0,
    target_value: 100,
    current_value: 0,
    weight: 100 / (editForm.value.keyResults.length + 1),
    unit: ''
  })
}

const removeKR = (index) => {
  editForm.value.keyResults.splice(index, 1)
}

const saveOKR = async () => {
  debugStore.log('info', '💾 保存OKR草稿')
  await delay(300)

  debugStore.log('info', '验证表单数据...')
  await delay(200)

  // 验证权重总和
  const totalWeight = editForm.value.keyResults.reduce((sum, kr) => sum + kr.weight, 0)
  if (Math.abs(totalWeight - 100) > 0.1) {
    message.warning(`关键结果权重总和应为100%，当前为${totalWeight.toFixed(1)}%`)
    debugStore.log('error', `权重总和错误: ${totalWeight}%`)
    return
  }

  debugStore.log('success', '✓ 数据验证通过')
  await delay(200)

  // 更新OKR
  okr.value.title = editForm.value.title
  okr.value.description = editForm.value.description
  okr.value.period = editForm.value.period
  okr.value.keyResults = editForm.value.keyResults.map(kr => ({ ...kr }))

  debugStore.log('success', '✓ OKR已保存')
  await delay(200)

  isEditing.value = false
  message.success('OKR保存成功')
}

const submitForApproval = async () => {
  debugStore.log('info', '📤 提交OKR审批')
  await delay(300)

  debugStore.log('info', '验证表单数据...')
  await delay(200)

  // 验证权重总和
  const totalWeight = editForm.value.keyResults.reduce((sum, kr) => sum + kr.weight, 0)
  if (Math.abs(totalWeight - 100) > 0.1) {
    message.warning(`关键结果权重总和应为100%，当前为${totalWeight.toFixed(1)}%`)
    debugStore.log('error', `权重总和错误: ${totalWeight}%`)
    return
  }

  debugStore.log('success', '✓ 数据验证通过')
  await delay(200)

  // 更新OKR
  okr.value.title = editForm.value.title
  okr.value.description = editForm.value.description
  okr.value.period = editForm.value.period
  okr.value.keyResults = editForm.value.keyResults.map(kr => ({ ...kr }))
  okr.value.status = 'pending'

  debugStore.log('info', `发送审批通知给: ${okr.value.approver_name}`)
  await delay(300)

  debugStore.log('success', '✓ 已提交审批')
  await delay(200)

  isEditing.value = false
  message.success('OKR已提交审批')
}

onMounted(async () => {
  const okrId = parseInt(route.params.id)

  debugStore.log('info', `📖 加载OKR详情 (ID: ${okrId})`)
  await delay(400)

  okr.value = okrStore.getById(okrId)

  if (okr.value) {
    debugStore.log('success', `✓ 加载成功: ${okr.value.title}`)

    // Initialize update form
    updateForm.value.keyResults = okr.value.keyResults.map(kr => ({ ...kr }))
  } else {
    debugStore.log('error', 'OKR不存在')
  }

  loading.value = false
})
</script>

<style scoped>
.okr-detail-page {
  max-width: 1200px;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.okr-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.okr-title-section {
  flex: 1;
}

.okr-title {
  margin: 0 0 16px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.okr-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.okr-progress-section {
  flex-shrink: 0;
}

.okr-description {
  margin-top: 16px;
}

.okr-description h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.okr-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.key-results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kr-item {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.kr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kr-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kr-number {
  background: #1890ff;
  color: #262626;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.kr-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.kr-weight {
  color: #666;
  font-size: 14px;
}

.kr-values {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.value-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.value-item .label {
  font-size: 12px;
  color: #999;
}

.value-item .value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.value-item .value.current {
  color: #1890ff;
}

.value-item .value.target {
  color: #52c41a;
}

.kr-progress {
  margin-top: 8px;
}
</style>
