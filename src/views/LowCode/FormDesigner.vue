<template>
  <div class="form-designer">
    <div class="designer-header">
      <div class="header-title">
        <FormOutlined style="font-size: 24px; color: #1890ff" />
        <span>表单设计器</span>
        <a-tag color="blue" style="margin-left: 12px;">拖拽式设计</a-tag>
        <a-tag color="green">6+ 字段类型</a-tag>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <DragOutlined style="font-size: 16px; color: #1890ff;" />
          <span>拖拽式设计</span>
        </div>
        <div class="stat-item">
          <ThunderboltOutlined style="font-size: 16px; color: #52c41a;" />
          <span>实时预览</span>
        </div>
        <div class="stat-item">
          <CodeOutlined style="font-size: 16px; color: #722ed1;" />
          <span>JSON导出</span>
        </div>
      </div>
      <a-space>
        <a-button @click="goBack">
          <ArrowLeftOutlined /> 返回
        </a-button>
        <a-button @click="preview">
          <EyeOutlined /> 预览
        </a-button>
        <a-button @click="save">
          <SaveOutlined /> 保存
        </a-button>
        <a-button type="primary" @click="saveAndPublish">
          <CloudUploadOutlined /> 保存并发布
        </a-button>
      </a-space>
    </div>

    <div class="designer-container">
      <!-- 左侧组件库 -->
      <div class="component-panel">
        <div class="panel-header">
          <h3>组件库</h3>
          <a-badge :count="basicComponents.length + advancedComponents.length" :number-style="{ backgroundColor: '#1890ff' }" />
        </div>
        <div class="drag-hint">
          <DragOutlined /> 拖拽组件到画布
        </div>
        <a-collapse default-active-key="['basic', 'advanced']" ghost>
          <a-collapse-panel key="basic" header="基础组件">
            <div class="component-list">
              <div
                v-for="comp in basicComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
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
                @dragstart="handleDragStart($event, comp)"
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
            <a-tooltip :title="`撤销 (${historyIndex})`">
              <a-button size="small" @click="undo" :disabled="!canUndo">
                <UndoOutlined /> 撤销
              </a-button>
            </a-tooltip>
            <a-tooltip :title="`重做 (${history.length - historyIndex - 1})`">
              <a-button size="small" @click="redo" :disabled="!canRedo">
                <RedoOutlined /> 重做
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-radio-group v-model:value="layout" size="small">
              <a-radio-button value="vertical">竖排</a-radio-button>
              <a-radio-button value="horizontal">横排</a-radio-button>
            </a-radio-group>
          </a-space>
        </div>

        <div
          class="canvas-content"
          @drop="handleDrop"
          @dragover="handleDragOver"
        >
          <div class="form-preview">
            <h2 style="text-align: center; color: #333; margin-bottom: 24px">
              {{ formTitle }}
            </h2>

            <a-form :layout="layout">
              <div
                v-for="(field, index) in formFields"
                :key="field.id"
                class="form-field-item"
                :class="{ 'field-selected': selectedFieldIndex === index }"
                @click.stop="selectField(index)"
              >
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
                  <a-tooltip title="上移">
                    <ArrowUpOutlined
                      @click.stop="moveFieldUp(index)"
                      :class="{ 'action-disabled': index === 0 }"
                    />
                  </a-tooltip>
                  <a-tooltip title="下移">
                    <ArrowDownOutlined
                      @click.stop="moveFieldDown(index)"
                      :class="{ 'action-disabled': index === formFields.length - 1 }"
                    />
                  </a-tooltip>
                  <a-tooltip title="复制">
                    <CopyOutlined @click.stop="copyField(index)" />
                  </a-tooltip>
                  <a-tooltip title="删除">
                    <DeleteOutlined @click.stop="confirmRemoveField(index)" />
                  </a-tooltip>
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
            <a-input v-model:value="formTitle" @change="saveHistory" />
          </a-form-item>
          <a-divider />
          <div v-if="selectedField">
            <a-form-item label="字段标签">
              <a-input v-model:value="selectedField.label" @change="saveHistory" />
            </a-form-item>
            <a-form-item label="字段名称">
              <a-input v-model:value="selectedField.name" @change="saveHistory" />
            </a-form-item>
            <a-form-item label="占位提示">
              <a-input v-model:value="selectedField.placeholder" @change="saveHistory" />
            </a-form-item>
            <a-form-item label="是否必填">
              <a-switch v-model:checked="selectedField.required" @change="saveHistory" />
            </a-form-item>
            <a-form-item v-if="selectedField.type === 'select'" label="选项">
              <a-select v-model:value="selectedField.options" mode="tags" @change="saveHistory" />
            </a-form-item>
          </div>
          <a-empty v-else description="请选择字段" :image="simpleImage" />
        </a-form>
      </div>
    </div>

    <!-- 预览模态框 -->
    <a-modal
      v-model:open="previewVisible"
      title="表单预览"
      width="800px"
      :footer="null"
    >
      <div class="preview-modal-content">
        <h2 style="text-align: center; margin-bottom: 24px">{{ formTitle }}</h2>
        <a-form
          ref="previewFormRef"
          :model="previewFormData"
          :layout="layout"
          @finish="handlePreviewSubmit"
        >
          <a-form-item
            v-for="field in formFields"
            :key="field.id"
            :label="field.label"
            :name="field.name"
            :rules="[{ required: field.required, message: `请输入${field.label}` }]"
          >
            <a-input
              v-if="field.type === 'input'"
              v-model:value="previewFormData[field.name]"
              :placeholder="field.placeholder"
            />
            <a-textarea
              v-else-if="field.type === 'textarea'"
              v-model:value="previewFormData[field.name]"
              :placeholder="field.placeholder"
            />
            <a-input-number
              v-else-if="field.type === 'number'"
              v-model:value="previewFormData[field.name]"
              style="width: 100%"
            />
            <a-select
              v-else-if="field.type === 'select'"
              v-model:value="previewFormData[field.name]"
              :placeholder="field.placeholder"
            >
              <a-select-option v-for="opt in field.options" :key="opt" :value="opt">
                {{ opt }}
              </a-select-option>
            </a-select>
            <a-date-picker
              v-else-if="field.type === 'date'"
              v-model:value="previewFormData[field.name]"
              style="width: 100%"
            />
            <a-upload v-else-if="field.type === 'upload'">
              <a-button><UploadOutlined /> 上传文件</a-button>
            </a-upload>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">提交</a-button>
              <a-button @click="resetPreviewForm">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 保存配置预览模态框 -->
    <a-modal
      v-model:open="saveConfigVisible"
      title="表单配置"
      width="800px"
      :footer="null"
    >
      <a-alert
        message="保存成功"
        description="表单配置已生成，您可以复制以下JSON配置"
        type="success"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-textarea
        :value="formConfigJson"
        :rows="20"
        readonly
        style="font-family: monospace; font-size: 12px"
      />
      <div style="margin-top: 16px; text-align: right">
        <a-space>
          <a-button @click="saveConfigVisible = false">关闭</a-button>
          <a-button type="primary" @click="copyConfig">复制配置</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
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
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  DragOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

// 基础数据
const formTitle = ref('员工请假申请表')
const layout = ref('vertical')
let fieldIdCounter = 6

// 字段选择
const selectedFieldIndex = ref(null)
const selectedField = computed(() => {
  if (selectedFieldIndex.value !== null && formFields.value[selectedFieldIndex.value]) {
    return formFields.value[selectedFieldIndex.value]
  }
  return null
})

// 历史管理
const history = ref([])
const historyIndex = ref(-1)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// 预览相关
const previewVisible = ref(false)
const previewFormRef = ref(null)
const previewFormData = ref({})

// 保存配置相关
const saveConfigVisible = ref(false)
const formConfigJson = ref('')

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
    id: 0,
    type: 'select',
    label: '请假类型',
    name: 'leave_type',
    placeholder: '请选择请假类型',
    required: true,
    options: ['年假', '事假', '病假', '调休']
  },
  {
    id: 1,
    type: 'date',
    label: '开始日期',
    name: 'start_date',
    required: true
  },
  {
    id: 2,
    type: 'date',
    label: '结束日期',
    name: 'end_date',
    required: true
  },
  {
    id: 3,
    type: 'number',
    label: '请假天数',
    name: 'days',
    required: true
  },
  {
    id: 4,
    type: 'textarea',
    label: '请假事由',
    name: 'reason',
    placeholder: '请输入请假事由',
    required: true
  },
  {
    id: 5,
    type: 'upload',
    label: '附件',
    name: 'attachment',
    required: false
  }
])

// 初始化历史记录
const initHistory = () => {
  const initialState = {
    formTitle: formTitle.value,
    formFields: JSON.parse(JSON.stringify(formFields.value)),
    layout: layout.value
  }
  history.value = [initialState]
  historyIndex.value = 0
}
initHistory()

// 保存历史状态
const saveHistory = () => {
  // 移除当前索引之后的所有历史记录
  history.value = history.value.slice(0, historyIndex.value + 1)

  // 添加新的历史记录
  const newState = {
    formTitle: formTitle.value,
    formFields: JSON.parse(JSON.stringify(formFields.value)),
    layout: layout.value
  }
  history.value.push(newState)
  historyIndex.value++

  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

// 撤销
const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    restoreState(history.value[historyIndex.value])
    message.success(`已撤销，还可撤销 ${historyIndex.value} 次`)
  }
}

// 重做
const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    restoreState(history.value[historyIndex.value])
    const redoCount = history.value.length - historyIndex.value - 1
    message.success(`已重做，还可重做 ${redoCount} 次`)
  }
}

// 恢复状态
const restoreState = (state) => {
  formTitle.value = state.formTitle
  formFields.value = JSON.parse(JSON.stringify(state.formFields))
  layout.value = state.layout
  selectedFieldIndex.value = null
}

// 生成唯一字段名
const generateFieldName = (type) => {
  const existingNames = formFields.value.map(f => f.name)
  let name = type
  let counter = 1

  while (existingNames.includes(name)) {
    name = `${type}_${counter}`
    counter++
  }

  return name
}

// 拖拽开始
const handleDragStart = (event, component) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('component', JSON.stringify(component))
}

// 拖拽悬停
const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

// 拖拽释放
const handleDrop = (event) => {
  event.preventDefault()

  try {
    const componentData = JSON.parse(event.dataTransfer.getData('component'))

    // 创建新字段
    const newField = {
      id: fieldIdCounter++,
      type: componentData.type,
      label: componentData.label,
      name: generateFieldName(componentData.type),
      placeholder: `请输入${componentData.label}`,
      required: false
    }

    // 为select类型添加默认选项
    if (componentData.type === 'select') {
      newField.options = ['选项1', '选项2', '选项3']
    }

    formFields.value.push(newField)
    saveHistory()
    message.success(`已添加 ${componentData.label}`)

    // 自动选中新添加的字段
    selectedFieldIndex.value = formFields.value.length - 1
  } catch (error) {
    console.error('拖拽添加失败:', error)
  }
}

// 选择字段
const selectField = (index) => {
  selectedFieldIndex.value = index
}

// 字段上移
const moveFieldUp = (index) => {
  if (index > 0) {
    const temp = formFields.value[index]
    formFields.value[index] = formFields.value[index - 1]
    formFields.value[index - 1] = temp

    // 更新选中索引
    if (selectedFieldIndex.value === index) {
      selectedFieldIndex.value = index - 1
    } else if (selectedFieldIndex.value === index - 1) {
      selectedFieldIndex.value = index
    }

    saveHistory()
    message.success('字段已上移')
  }
}

// 字段下移
const moveFieldDown = (index) => {
  if (index < formFields.value.length - 1) {
    const temp = formFields.value[index]
    formFields.value[index] = formFields.value[index + 1]
    formFields.value[index + 1] = temp

    // 更新选中索引
    if (selectedFieldIndex.value === index) {
      selectedFieldIndex.value = index + 1
    } else if (selectedFieldIndex.value === index + 1) {
      selectedFieldIndex.value = index
    }

    saveHistory()
    message.success('字段已下移')
  }
}

// 复制字段
const copyField = (index) => {
  const originalField = formFields.value[index]
  const copiedField = {
    ...JSON.parse(JSON.stringify(originalField)),
    id: fieldIdCounter++,
    name: generateFieldName(originalField.type),
    label: `${originalField.label} (副本)`
  }

  // 在原字段后面插入
  formFields.value.splice(index + 1, 0, copiedField)
  saveHistory()
  message.success('字段已复制')

  // 选中复制的字段
  selectedFieldIndex.value = index + 1
}

// 确认删除字段
const confirmRemoveField = (index) => {
  const field = formFields.value[index]

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除字段"${field.label}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      removeField(index)
    }
  })
}

// 删除字段
const removeField = (index) => {
  formFields.value.splice(index, 1)

  // 清除选中状态
  if (selectedFieldIndex.value === index) {
    selectedFieldIndex.value = null
  } else if (selectedFieldIndex.value > index) {
    selectedFieldIndex.value--
  }

  saveHistory()
  message.success('字段已删除')
}

// 返回主界面
const goBack = () => {
  router.push('/overview')
}

// 预览表单
const preview = () => {
  if (formFields.value.length === 0) {
    message.warning('请先添加表单字段')
    return
  }

  // 重置预览表单数据
  previewFormData.value = {}
  previewVisible.value = true
}

// 处理预览表单提交
const handlePreviewSubmit = (values) => {
  console.log('表单数据:', values)
  message.success('表单验证通过！')
  Modal.info({
    title: '表单数据',
    content: JSON.stringify(values, null, 2),
    width: 600
  })
}

// 重置预览表单
const resetPreviewForm = () => {
  if (previewFormRef.value) {
    previewFormRef.value.resetFields()
  }
  previewFormData.value = {}
  message.info('表单已重置')
}

// 保存表单配置
const save = () => {
  if (formFields.value.length === 0) {
    message.warning('表单为空，请先添加字段')
    return
  }

  const config = {
    title: formTitle.value,
    layout: layout.value,
    fields: formFields.value.map(field => ({
      type: field.type,
      label: field.label,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      ...(field.options && { options: field.options })
    }))
  }

  formConfigJson.value = JSON.stringify(config, null, 2)
  saveConfigVisible.value = true
  message.success('表单配置已生成！')
}

// 保存并发布到应用中心
const saveAndPublish = () => {
  if (formFields.value.length === 0) {
    message.warning('表单为空，请先添加字段')
    return
  }

  Modal.confirm({
    title: '发布表单到应用中心',
    content: `确定要将「${formTitle.value}」发布到应用中心吗？发布后所有员工都可以使用此表单。`,
    okText: '发布',
    cancelText: '取消',
    onOk: () => {
      // 模拟发布逻辑（实际应该调用API）
      const config = {
        title: formTitle.value,
        layout: layout.value,
        fields: formFields.value.map(field => ({
          type: field.type,
          label: field.label,
          name: field.name,
          placeholder: field.placeholder,
          required: field.required,
          ...(field.options && { options: field.options })
        }))
      }

      message.success('🎉 表单已成功发布到应用中心！')
      message.info('提示：返回应用中心即可查看和使用', 3)
    }
  })
}

// 复制配置
const copyConfig = () => {
  navigator.clipboard.writeText(formConfigJson.value).then(() => {
    message.success('配置已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}

// 监听布局变化
watch(layout, () => {
  saveHistory()
})
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
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 2px solid #5568d3;
  color: #262626;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.header-stats {
  display: flex;
  gap: 24px;
  margin-left: auto;
  margin-right: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #262626;
  opacity: 0.95;
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

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.drag-hint {
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px dashed #1890ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
  text-align: center;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  user-select: none;
}

.component-item:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.component-item:active {
  transform: scale(0.95);
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
  padding-right: 80px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  overflow: visible;
}

.form-field-item {
  position: relative;
  padding: 8px;
  margin: -8px;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
}

.form-field-item:hover {
  background: #f5f5f5;
}

.form-field-item.field-selected {
  background: #e6f7ff;
  border: 2px solid #1890ff;
  padding: 6px;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.field-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: auto;
}

.form-field-item:hover .field-actions,
.form-field-item.field-selected .field-actions {
  opacity: 1;
  pointer-events: auto;
}

.field-actions > * {
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 2px;
}

.field-actions > *:hover {
  color: #1890ff;
  background: #f0f0f0;
}

.field-actions > *.action-disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.field-actions > *.action-disabled:hover {
  color: #d9d9d9;
  background: transparent;
}

.empty-canvas {
  text-align: center;
  padding: 80px 0;
  color: #999;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  margin: 20px 0;
}

.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}

.preview-modal-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

/* 拖拽时的视觉反馈 */
.canvas-content.drag-over {
  background: rgba(24, 144, 255, 0.05);
}

/* 平滑的动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-field-item {
  animation: slideIn 0.3s ease-out;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .component-panel {
    width: 200px;
  }

  .property-panel {
    width: 260px;
  }
}

/* 滚动条美化 */
.component-panel::-webkit-scrollbar,
.property-panel::-webkit-scrollbar,
.canvas-content::-webkit-scrollbar {
  width: 6px;
}

.component-panel::-webkit-scrollbar-thumb,
.property-panel::-webkit-scrollbar-thumb,
.canvas-content::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.component-panel::-webkit-scrollbar-thumb:hover,
.property-panel::-webkit-scrollbar-thumb:hover,
.canvas-content::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
