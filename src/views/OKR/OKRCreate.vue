<template>
  <div class="okr-create-page">
    <div class="page-header">
      <h2>创建OKR</h2>
      <a-space>
        <a-button @click="router.back()">取消</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitting">
          提交审批
        </a-button>
      </a-space>
    </div>

    <a-card title="目标信息" style="margin-bottom: 16px;">
      <a-form :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="目标标题" required>
          <a-input
            v-model:value="formData.title"
            placeholder="请输入目标标题，例如：提升销售业绩"
            :maxlength="100"
            show-count
          />
        </a-form-item>

        <a-form-item label="目标描述">
          <a-textarea
            v-model:value="formData.description"
            placeholder="详细描述目标的背景、意义和预期成果"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>

        <a-form-item label="考核周期" required>
          <a-select v-model:value="formData.period" placeholder="选择考核周期">
            <a-select-option value="Q1 2025">Q1 2025</a-select-option>
            <a-select-option value="Q2 2025">Q2 2025</a-select-option>
            <a-select-option value="Q3 2025">Q3 2025</a-select-option>
            <a-select-option value="Q4 2025">Q4 2025</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="审批人" required>
          <a-select v-model:value="formData.approverId" placeholder="选择审批人">
            <a-select-option
              v-for="manager in managers"
              :key="manager.id"
              :value="manager.id"
            >
              {{ manager.realName }} - {{ manager.department }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="关键结果 (Key Results)">
      <template #extra>
        <a-space>
          <span :style="{ color: totalWeight === 100 ? '#52c41a' : '#ff4d4f' }">
            总权重: {{ totalWeight }}%
          </span>
          <a-button
            type="dashed"
            size="small"
            @click="addKeyResult"
            :disabled="formData.keyResults.length >= 5"
          >
            <template #icon><PlusOutlined /></template>
            添加关键结果
          </a-button>
        </a-space>
      </template>

      <div class="key-results-container">
        <div
          v-for="(kr, index) in formData.keyResults"
          :key="kr.tempId"
          class="key-result-item"
        >
          <div class="kr-header">
            <span class="kr-number">KR{{ index + 1 }}</span>
            <a-button
              type="text"
              danger
              size="small"
              @click="removeKeyResult(index)"
              :disabled="formData.keyResults.length <= 1"
            >
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </div>

          <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="结果描述" required>
              <a-input
                v-model:value="kr.title"
                placeholder="例如：新增客户数量"
                :maxlength="100"
              />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="初始值" :label-col="{ span: 12 }" required>
                  <a-input-number
                    v-model:value="kr.initial_value"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="目标值" :label-col="{ span: 12 }" required>
                  <a-input-number
                    v-model:value="kr.target_value"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="权重 %" :label-col="{ span: 12 }" required>
                  <a-input-number
                    v-model:value="kr.weight"
                    :min="0"
                    :max="100"
                    :precision="0"
                    style="width: 100%"
                    @change="validateWeights"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="衡量单位">
              <a-input
                v-model:value="kr.unit"
                placeholder="例如：个、万元、%等"
                style="width: 200px"
              />
            </a-form-item>
          </a-form>
        </div>

        <a-alert
          v-if="formData.keyResults.length === 0"
          message="请至少添加一个关键结果"
          type="warning"
          show-icon
          style="margin-top: 16px"
        />

        <a-alert
          v-if="totalWeight !== 100 && formData.keyResults.length > 0"
          :message="`所有关键结果的权重总和必须等于100%，当前为${totalWeight}%`"
          type="error"
          show-icon
          style="margin-top: 16px"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOKRStore } from '../../stores/okr'
import { useUserStore } from '../../stores/user'
import { useDebugStore, delay } from '../../stores/debug'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import usersData from '../../mock/users.json'

const router = useRouter()
const okrStore = useOKRStore()
const userStore = useUserStore()
const debugStore = useDebugStore()

const submitting = ref(false)

const formData = ref({
  title: '',
  description: '',
  period: 'Q4 2025',
  approverId: null,
  keyResults: [
    {
      tempId: Date.now(),
      title: '',
      initial_value: 0,
      target_value: 100,
      weight: 100,
      unit: ''
    }
  ]
})

const managers = computed(() => {
  return usersData.filter(u =>
    ['manager', 'leader', 'hr', 'admin'].includes(u.role)
  )
})

const totalWeight = computed(() => {
  return formData.value.keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0)
})

let krIdCounter = 1

const addKeyResult = () => {
  if (formData.value.keyResults.length >= 5) {
    message.warning('最多只能添加5个关键结果')
    return
  }

  formData.value.keyResults.push({
    tempId: Date.now() + krIdCounter++,
    title: '',
    initial_value: 0,
    target_value: 100,
    weight: 0,
    unit: ''
  })
}

const removeKeyResult = (index) => {
  if (formData.value.keyResults.length <= 1) {
    message.warning('至少需要保留一个关键结果')
    return
  }
  formData.value.keyResults.splice(index, 1)
}

const validateWeights = () => {
  // Auto-adjust weights if needed (optional)
}

const validateForm = () => {
  if (!formData.value.title || formData.value.title.trim() === '') {
    message.error('请输入目标标题')
    return false
  }

  if (!formData.value.period) {
    message.error('请选择考核周期')
    return false
  }

  if (!formData.value.approverId) {
    message.error('请选择审批人')
    return false
  }

  if (formData.value.keyResults.length === 0) {
    message.error('请至少添加一个关键结果')
    return false
  }

  for (let i = 0; i < formData.value.keyResults.length; i++) {
    const kr = formData.value.keyResults[i]
    if (!kr.title || kr.title.trim() === '') {
      message.error(`请填写关键结果${i + 1}的描述`)
      return false
    }
    if (kr.target_value <= kr.initial_value) {
      message.error(`关键结果${i + 1}的目标值必须大于初始值`)
      return false
    }
    if (!kr.weight || kr.weight <= 0) {
      message.error(`请设置关键结果${i + 1}的权重`)
      return false
    }
  }

  if (totalWeight.value !== 100) {
    message.error(`所有关键结果的权重总和必须等于100%，当前为${totalWeight.value}%`)
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    debugStore.log('info', '📝 开始创建OKR')
    await delay(300)

    debugStore.log('info', '验证表单数据...')
    await delay(200)
    debugStore.log('success', '✓ 表单验证通过')

    debugStore.log('info', `目标标题: ${formData.value.title}`)
    debugStore.log('info', `考核周期: ${formData.value.period}`)
    debugStore.log('info', `关键结果数量: ${formData.value.keyResults.length}`)
    await delay(300)

    const approver = usersData.find(u => u.id === formData.value.approverId)
    debugStore.log('info', `审批人: ${approver?.realName}`)
    await delay(200)

    debugStore.log('info', '计算权重分配...')
    formData.value.keyResults.forEach((kr, idx) => {
      debugStore.log('info', `  KR${idx + 1}: ${kr.title} (权重: ${kr.weight}%)`)
    })
    await delay(400)

    debugStore.log('success', '✓ 权重验证通过 (总计: 100%)')
    await delay(300)

    const newOKR = {
      id: okrStore.okrs.length + 1,
      title: formData.value.title,
      description: formData.value.description,
      period: formData.value.period,
      status: 'pending',
      owner_id: userStore.currentUser.id,
      owner_name: userStore.currentUser.realName,
      approver_id: formData.value.approverId,
      approver_name: approver?.realName,
      created_at: new Date().toISOString(),
      keyResults: formData.value.keyResults.map((kr, idx) => ({
        id: idx + 1,
        title: kr.title,
        initial_value: kr.initial_value,
        target_value: kr.target_value,
        current_value: kr.initial_value,
        weight: kr.weight,
        unit: kr.unit || ''
      }))
    }

    debugStore.log('info', '保存到数据库...')
    await delay(400)

    okrStore.okrs.push(newOKR)

    debugStore.log('success', '✓ OKR创建成功')
    await delay(200)

    debugStore.log('info', `📨 发送审批通知给: ${approver?.realName}`)
    await delay(300)

    debugStore.log('success', '→ 跳转至OKR列表')
    await delay(200)

    message.success('OKR已创建，等待审批')
    router.push('/okr')

  } catch (error) {
    debugStore.log('error', `创建失败: ${error.message}`)
    message.error('创建失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // Set default approver (user's manager)
  const currentUser = userStore.currentUser
  if (currentUser?.managerId) {
    formData.value.approverId = currentUser.managerId
  }
})
</script>

<style scoped>
.okr-create-page {
  max-width: 1200px;
  padding: 24px;
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

.key-results-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.key-result-item {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
}

.kr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.kr-number {
  font-weight: 600;
  font-size: 14px;
  color: #1890ff;
}
</style>
