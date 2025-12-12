<template>
  <div class="business-scene-config">
    <a-page-header
      title="业务场景配置"
      sub-title="配置每个业务场景使用哪个表单模板"
      @back="() => $router.back()"
    />

    <div class="content-area">
      <a-card :bordered="false">
        <!-- 说明提示 -->
        <a-alert
          message="低代码平台核心配置"
          type="info"
          show-icon
          closable
          style="margin-bottom: 24px"
        >
          <template #description>
            <div>
              <p style="margin-bottom: 8px">
                <strong>这是低代码平台的核心配置页面。</strong>在这里，管理员可以配置每个业务场景使用哪个表单模板：
              </p>
              <ul style="margin: 0; padding-left: 20px">
                <li>📋 <strong>表单模板</strong>：在【表单设计器】中设计的模板</li>
                <li>🔗 <strong>业务场景</strong>：实际的业务功能（如请假申请、费用报销）</li>
                <li>👥 <strong>员工使用</strong>：员工填写的表单就是基于选定的模板动态渲染的</li>
                <li>📊 <strong>数据追溯</strong>：表单数据会记录来自哪个模板，可追溯到模板源头</li>
              </ul>
            </div>
          </template>
        </a-alert>

        <!-- 配置表单 -->
        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
          <a-divider orientation="left">
            <TagOutlined /> 人事管理场景
          </a-divider>

          <!-- 请假申请 -->
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span>🌴 请假申请</span>
                <a-tag color="success" size="small">启用中</a-tag>
              </div>
            </template>
            <a-select
              v-model:value="sceneConfig.leave.templateId"
              placeholder="选择表单模板"
              @change="(value) => handleTemplateChange('leave', value)"
            >
              <a-select-option
                v-for="template in getTemplatesByCategory('人事管理')"
                :key="template.id"
                :value="template.id"
              >
                <span style="margin-right: 8px">{{ template.icon }}</span>
                {{ template.name }}
                <a-tag size="small" style="margin-left: 8px">{{ template.version }}</a-tag>
              </a-select-option>
            </a-select>
            <div class="template-info" v-if="sceneConfig.leave.templateId">
              <InfoCircleOutlined style="margin-right: 4px" />
              当前模板：{{ getTemplateById(sceneConfig.leave.templateId)?.name }}
              （{{ getTemplateById(sceneConfig.leave.templateId)?.fields.length }} 个字段）
              <a-button type="link" size="small" @click="viewTemplate(sceneConfig.leave.templateId)">
                查看详情
              </a-button>
            </div>
          </a-form-item>

          <a-divider orientation="left">
            <TagOutlined /> 财务管理场景
          </a-divider>

          <!-- 费用报销 -->
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span>💰 费用报销</span>
                <a-tag color="success" size="small">启用中</a-tag>
              </div>
            </template>
            <a-select
              v-model:value="sceneConfig.expense.templateId"
              placeholder="选择表单模板"
              @change="(value) => handleTemplateChange('expense', value)"
            >
              <a-select-option
                v-for="template in getTemplatesByCategory('财务管理')"
                :key="template.id"
                :value="template.id"
              >
                <span style="margin-right: 8px">{{ template.icon }}</span>
                {{ template.name }}
                <a-tag size="small" style="margin-left: 8px">{{ template.version }}</a-tag>
              </a-select-option>
            </a-select>
            <div class="template-info" v-if="sceneConfig.expense.templateId">
              <InfoCircleOutlined style="margin-right: 4px" />
              当前模板：{{ getTemplateById(sceneConfig.expense.templateId)?.name }}
              （{{ getTemplateById(sceneConfig.expense.templateId)?.fields.length }} 个字段）
              <a-button type="link" size="small" @click="viewTemplate(sceneConfig.expense.templateId)">
                查看详情
              </a-button>
            </div>
          </a-form-item>

          <a-divider orientation="left">
            <TagOutlined /> 绩效管理场景
          </a-divider>

          <!-- OKR管理 -->
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span>🎯 OKR管理</span>
                <a-tag color="success" size="small">启用中</a-tag>
              </div>
            </template>
            <a-select
              v-model:value="sceneConfig.okr.templateId"
              placeholder="选择表单模板"
              @change="(value) => handleTemplateChange('okr', value)"
            >
              <a-select-option
                v-for="template in getTemplatesByCategory('绩效管理')"
                :key="template.id"
                :value="template.id"
              >
                <span style="margin-right: 8px">{{ template.icon }}</span>
                {{ template.name }}
                <a-tag size="small" style="margin-left: 8px">{{ template.version }}</a-tag>
              </a-select-option>
            </a-select>
            <div class="template-info" v-if="sceneConfig.okr.templateId">
              <InfoCircleOutlined style="margin-right: 4px" />
              当前模板：{{ getTemplateById(sceneConfig.okr.templateId)?.name }}
              （{{ getTemplateById(sceneConfig.okr.templateId)?.fields.length }} 个字段）
              <a-button type="link" size="small" @click="viewTemplate(sceneConfig.okr.templateId)">
                查看详情
              </a-button>
            </div>
          </a-form-item>

          <a-divider orientation="left">
            <TagOutlined /> 生产管理场景
          </a-divider>

          <!-- 生产异常工单 -->
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span>🏭 生产异常工单</span>
                <a-tag color="success" size="small">启用中</a-tag>
              </div>
            </template>
            <a-select
              v-model:value="sceneConfig.workorder.templateId"
              placeholder="选择表单模板"
              @change="(value) => handleTemplateChange('workorder', value)"
            >
              <a-select-option
                v-for="template in getTemplatesByCategory('生产管理')"
                :key="template.id"
                :value="template.id"
              >
                <span style="margin-right: 8px">{{ template.icon }}</span>
                {{ template.name }}
                <a-tag size="small" style="margin-left: 8px">{{ template.version }}</a-tag>
              </a-select-option>
            </a-select>
            <div class="template-info" v-if="sceneConfig.workorder.templateId">
              <InfoCircleOutlined style="margin-right: 4px" />
              当前模板：{{ getTemplateById(sceneConfig.workorder.templateId)?.name }}
              （{{ getTemplateById(sceneConfig.workorder.templateId)?.fields.length }} 个字段）
              <a-button type="link" size="small" @click="viewTemplate(sceneConfig.workorder.templateId)">
                查看详情
              </a-button>
            </div>
          </a-form-item>

          <a-divider orientation="left">
            <TagOutlined /> 客户管理场景
          </a-divider>

          <!-- 客户管理 -->
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; gap: 8px">
                <span>👥 客户管理</span>
                <a-tag color="default" size="small">未启用</a-tag>
              </div>
            </template>
            <a-select
              v-model:value="sceneConfig.customer.templateId"
              placeholder="选择表单模板"
              @change="(value) => handleTemplateChange('customer', value)"
              disabled
            >
              <a-select-option
                v-for="template in getTemplatesByCategory('客户管理')"
                :key="template.id"
                :value="template.id"
              >
                <span style="margin-right: 8px">{{ template.icon }}</span>
                {{ template.name }}
                <a-tag size="small" style="margin-left: 8px">{{ template.version }}</a-tag>
              </a-select-option>
            </a-select>
            <div class="template-info">
              <InfoCircleOutlined style="margin-right: 4px" />
              该场景暂未启用，请联系管理员开通
            </div>
          </a-form-item>

          <a-divider />

          <!-- 操作按钮 -->
          <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
            <a-space>
              <a-button type="primary" @click="saveConfig" :loading="saving">
                <SaveOutlined /> 保存配置
              </a-button>
              <a-button @click="resetConfig">
                <UndoOutlined /> 重置为默认
              </a-button>
              <a-button @click="$router.push('/form-templates')">
                <AppstoreOutlined /> 管理表单模板
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>

        <!-- 配置预览 -->
        <a-card title="配置预览" style="margin-top: 24px" size="small">
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; max-height: 300px; overflow: auto">{{ JSON.stringify(sceneConfig, null, 2) }}</pre>
        </a-card>
      </a-card>
    </div>

    <!-- 模板详情Modal -->
    <a-modal
      v-model:open="detailVisible"
      :title="`${currentTemplate?.name} - 模板详情`"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentTemplate">
        <a-descriptions-item label="模板名称" :span="2">
          {{ currentTemplate.icon }} {{ currentTemplate.name }}
        </a-descriptions-item>
        <a-descriptions-item label="分类">{{ currentTemplate.category }}</a-descriptions-item>
        <a-descriptions-item label="版本">{{ currentTemplate.version }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentTemplate.status === 'published' ? 'success' : 'default'">
            {{ currentTemplate.status === 'published' ? '已发布' : '草稿' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="字段数">{{ currentTemplate.fields.length }} 个</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ currentTemplate.description }}</a-descriptions-item>
        <a-descriptions-item label="字段列表" :span="2">
          <a-table
            :dataSource="currentTemplate.fields"
            :columns="fieldColumns"
            size="small"
            :pagination="false"
          >
            <template #required="{ record }">
              <a-tag :color="record.required ? 'error' : 'default'" size="small">
                {{ record.required ? '必填' : '选填' }}
              </a-tag>
            </template>
          </a-table>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  TagOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  UndoOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'
import { formTemplates, businessSceneConfig } from '../../mock/formTemplates'

const router = useRouter()

const saving = ref(false)
const detailVisible = ref(false)
const currentTemplate = ref(null)

// 场景配置（深拷贝初始配置）
const sceneConfig = ref(JSON.parse(JSON.stringify(businessSceneConfig)))

// 字段列配置
const fieldColumns = [
  { title: '字段ID', dataIndex: 'id', key: 'id', width: 180 },
  { title: '字段标签', dataIndex: 'label', key: 'label' },
  { title: '字段类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '是否必填', key: 'required', width: 80, slots: { customRender: 'required' } }
]

// 根据分类获取模板
const getTemplatesByCategory = (category) => {
  return formTemplates.filter(t => t.category === category && t.status === 'published')
}

// 根据ID获取模板
const getTemplateById = (templateId) => {
  return formTemplates.find(t => t.id === templateId)
}

// 模板变更处理
const handleTemplateChange = (sceneKey, templateId) => {
  const template = getTemplateById(templateId)
  if (template) {
    sceneConfig.value[sceneKey].templateName = template.name
    message.success(`已选择模板：${template.name}`)
  }
}

// 查看模板详情
const viewTemplate = (templateId) => {
  currentTemplate.value = getTemplateById(templateId)
  if (currentTemplate.value) {
    detailVisible.value = true
  }
}

// 保存配置
const saveConfig = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    message.success('配置已保存！员工填写表单时将使用新配置的模板。')

    // 模拟发送到后端API
    console.log('保存配置:', sceneConfig.value)
  }, 800)
}

// 重置为默认配置
const resetConfig = () => {
  sceneConfig.value = JSON.parse(JSON.stringify(businessSceneConfig))
  message.info('已重置为默认配置')
}
</script>

<style scoped>
.business-scene-config {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.template-info {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
}
</style>
