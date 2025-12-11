<template>
  <div class="form-designer">
    <div class="designer-header">
      <div class="header-title">
        <FormOutlined style="font-size: 24px; color: #1890ff" />
        <span>表单设计器</span>
      </div>
      <a-space>
        <a-button @click="preview">
          <EyeOutlined /> 预览
        </a-button>
        <a-button type="primary" @click="save">
          <SaveOutlined /> 保存
        </a-button>
      </a-space>
    </div>

    <div class="designer-container">
      <!-- 左侧组件库 -->
      <div class="component-panel">
        <h3>组件库</h3>
        <a-collapse default-active-key="['basic', 'advanced']" ghost>
          <a-collapse-panel key="basic" header="基础组件">
            <div class="component-list">
              <div
                v-for="comp in basicComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
              >
                <component :is="comp.icon" />
                <span>{{ comp.label }}</span>
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="advanced" header="高级组件">
            <div class="component-list">
              <div
                v-for="comp in advancedComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
              >
                <component :is="comp.icon" />
                <span>{{ comp.label }}</span>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-panel">
        <div class="canvas-toolbar">
          <a-space>
            <a-button size="small" @click="undo">
              <UndoOutlined /> 撤销
            </a-button>
            <a-button size="small" @click="redo">
              <RedoOutlined /> 重做
            </a-button>
            <a-divider type="vertical" />
            <a-radio-group v-model:value="layout" size="small">
              <a-radio-button value="vertical">竖排</a-radio-button>
              <a-radio-button value="horizontal">横排</a-radio-button>
            </a-radio-group>
          </a-space>
        </div>

        <div class="canvas-content">
          <div class="form-preview">
            <h2 style="text-align: center; color: #333; margin-bottom: 24px">
              {{ formTitle }}
            </h2>

            <a-form :layout="layout">
              <div v-for="(field, index) in formFields" :key="index" class="form-field-item">
                <a-form-item :label="field.label" :required="field.required">
                  <a-input v-if="field.type === 'input'" :placeholder="field.placeholder" />
                  <a-textarea v-else-if="field.type === 'textarea'" :placeholder="field.placeholder" />
                  <a-input-number v-else-if="field.type === 'number'" style="width: 100%" />
                  <a-select v-else-if="field.type === 'select'" :placeholder="field.placeholder">
                    <a-select-option v-for="opt in field.options" :key="opt" :value="opt">
                      {{ opt }}
                    </a-select-option>
                  </a-select>
                  <a-date-picker v-else-if="field.type === 'date'" style="width: 100%" />
                  <a-upload v-else-if="field.type === 'upload'">
                    <a-button><UploadOutlined /> 上传文件</a-button>
                  </a-upload>
                </a-form-item>
                <div class="field-actions">
                  <SettingOutlined @click="editField(index)" />
                  <DeleteOutlined @click="removeField(index)" />
                </div>
              </div>

              <div v-if="formFields.length === 0" class="empty-canvas">
                <InboxOutlined style="font-size: 48px; color: #ccc" />
                <p>从左侧拖拽组件到此处</p>
              </div>
            </a-form>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3>属性配置</h3>
        <a-form layout="vertical" size="small">
          <a-form-item label="表单标题">
            <a-input v-model:value="formTitle" />
          </a-form-item>
          <a-divider />
          <div v-if="selectedField">
            <a-form-item label="字段标签">
              <a-input v-model:value="selectedField.label" />
            </a-form-item>
            <a-form-item label="字段名称">
              <a-input v-model:value="selectedField.name" />
            </a-form-item>
            <a-form-item label="占位提示">
              <a-input v-model:value="selectedField.placeholder" />
            </a-form-item>
            <a-form-item label="是否必填">
              <a-switch v-model:checked="selectedField.required" />
            </a-form-item>
            <a-form-item v-if="selectedField.type === 'select'" label="选项">
              <a-select v-model:value="selectedField.options" mode="tags" />
            </a-form-item>
          </div>
          <a-empty v-else description="请选择字段" :image="simpleImage" />
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { Empty } from 'ant-design-vue'
import {
  FormOutlined,
  EyeOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  EditOutlined,
  NumberOutlined,
  CalendarOutlined,
  DownOutlined,
  FileTextOutlined,
  UploadOutlined,
  SettingOutlined,
  DeleteOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const formTitle = ref('员工请假申请表')
const layout = ref('vertical')
const selectedField = ref(null)

const basicComponents = [
  { type: 'input', label: '单行文本', icon: EditOutlined },
  { type: 'textarea', label: '多行文本', icon: FileTextOutlined },
  { type: 'number', label: '数字输入', icon: NumberOutlined },
  { type: 'select', label: '下拉选择', icon: DownOutlined },
  { type: 'date', label: '日期选择', icon: CalendarOutlined }
]

const advancedComponents = [
  { type: 'upload', label: '文件上传', icon: UploadOutlined }
]

const formFields = ref([
  {
    type: 'select',
    label: '请假类型',
    name: 'leave_type',
    placeholder: '请选择请假类型',
    required: true,
    options: ['年假', '事假', '病假', '调休']
  },
  {
    type: 'date',
    label: '开始日期',
    name: 'start_date',
    required: true
  },
  {
    type: 'date',
    label: '结束日期',
    name: 'end_date',
    required: true
  },
  {
    type: 'number',
    label: '请假天数',
    name: 'days',
    required: true
  },
  {
    type: 'textarea',
    label: '请假事由',
    name: 'reason',
    placeholder: '请输入请假事由',
    required: true
  },
  {
    type: 'upload',
    label: '附件',
    name: 'attachment',
    required: false
  }
])

const preview = () => {
  message.info('打开预览模式 (Demo)')
}

const save = () => {
  message.success('表单保存成功！')
}

const undo = () => {
  message.info('撤销操作')
}

const redo = () => {
  message.info('重做操作')
}

const editField = (index) => {
  selectedField.value = formFields.value[index]
  message.info(`编辑字段: ${formFields.value[index].label}`)
}

const removeField = (index) => {
  formFields.value.splice(index, 1)
  message.success('字段已删除')
}
</script>

<style scoped>
.form-designer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.designer-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.component-panel {
  width: 250px;
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}

.component-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: move;
  font-size: 12px;
  transition: all 0.3s;
}

.component-item:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-toolbar {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.canvas-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-preview {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-field-item {
  position: relative;
}

.field-actions {
  position: absolute;
  top: 0;
  right: -40px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.form-field-item:hover .field-actions {
  opacity: 1;
}

.field-actions > * {
  cursor: pointer;
  font-size: 16px;
  color: #999;
}

.field-actions > *:hover {
  color: #1890ff;
}

.empty-canvas {
  text-align: center;
  padding: 80px 0;
  color: #999;
}

.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}
</style>
