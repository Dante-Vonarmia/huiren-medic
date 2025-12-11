<template>
  <div class="config-page">
    <div class="page-header">
      <a-button @click="router.back()">
        <ArrowLeftOutlined /> 返回列表
      </a-button>
      <a-space>
        <a-button @click="testMapping">
          <ExperimentOutlined /> 测试映射
        </a-button>
        <a-button type="primary" @click="saveConfig" :loading="saving">
          <SaveOutlined /> 保存配置
        </a-button>
      </a-space>
    </div>

    <a-card title="数据源信息" style="margin-bottom: 16px;">
      <a-descriptions bordered :column="3">
        <a-descriptions-item label="数据源名称">
          {{ dataSource.name }}
        </a-descriptions-item>
        <a-descriptions-item label="类型">
          {{ dataSource.type }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="dataSource.status === 'connected' ? 'green' : 'default'">
            {{ dataSource.status === 'connected' ? '已连接' : '未连接' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="连接地址" :span="2">
          {{ dataSource.host }}
        </a-descriptions-item>
        <a-descriptions-item label="数据库">
          {{ dataSource.database }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-row :gutter="16">
      <!-- Source Fields -->
      <a-col :span="11">
        <a-card title="源数据字段" :bodyStyle="{ padding: 0 }">
          <template #extra>
            <a-button size="small" @click="loadSourceFields">
              <ReloadOutlined /> 刷新
            </a-button>
          </template>

          <div class="field-list">
            <a-input-search
              v-model:value="sourceSearchText"
              placeholder="搜索字段"
              style="margin: 16px; width: calc(100% - 32px);"
            />

            <div class="field-group" v-for="table in sourceFields" :key="table.name">
              <div class="group-header">
                <TableOutlined /> {{ table.name }}
                <a-tag size="small">{{ table.fields.length }}</a-tag>
              </div>

              <draggable
                v-model="table.fields"
                group="fields"
                :item-key="f => f.name"
                class="draggable-list"
              >
                <template #item="{ element }">
                  <div
                    class="field-item"
                    :class="{ selected: isFieldMapped(element) }"
                    @click="selectSourceField(element, table.name)"
                  >
                    <div class="field-info">
                      <span class="field-name">{{ element.name }}</span>
                      <a-tag size="small" :color="getTypeColor(element.type)">
                        {{ element.type }}
                      </a-tag>
                    </div>
                    <div class="field-desc">{{ element.description }}</div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Mapping Arrow -->
      <a-col :span="2" style="display: flex; align-items: center; justify-content: center;">
        <div class="mapping-arrow">
          <ArrowRightOutlined style="font-size: 24px; color: #1890ff;" />
        </div>
      </a-col>

      <!-- Target Fields -->
      <a-col :span="11">
        <a-card title="目标平台字段" :bodyStyle="{ padding: 0 }">
          <template #extra>
            <a-button size="small" type="primary" @click="addTargetField">
              <PlusOutlined /> 添加字段
            </a-button>
          </template>

          <div class="field-list">
            <a-input-search
              v-model:value="targetSearchText"
              placeholder="搜索字段"
              style="margin: 16px; width: calc(100% - 32px);"
            />

            <div class="field-group">
              <div class="group-header">
                <DatabaseOutlined /> 统一数据模型
              </div>

              <div class="field-mappings">
                <div
                  v-for="(mapping, index) in fieldMappings"
                  :key="index"
                  class="mapping-item"
                >
                  <div class="mapping-header">
                    <div class="target-field">
                      <span class="field-name">{{ mapping.targetField }}</span>
                      <a-tag size="small" :color="getTypeColor(mapping.targetType)">
                        {{ mapping.targetType }}
                      </a-tag>
                    </div>
                    <a-button
                      type="text"
                      danger
                      size="small"
                      @click="removeMapping(index)"
                    >
                      <DeleteOutlined />
                    </a-button>
                  </div>

                  <div class="mapping-source">
                    <a-select
                      v-model:value="mapping.sourceField"
                      placeholder="选择源字段"
                      style="width: 100%;"
                      show-search
                    >
                      <a-select-option
                        v-for="field in allSourceFields"
                        :key="field.fullName"
                        :value="field.fullName"
                      >
                        {{ field.table }}.{{ field.name }} ({{ field.type }})
                      </a-select-option>
                    </a-select>
                  </div>

                  <div v-if="mapping.transform" class="mapping-transform">
                    <a-tag color="blue">
                      <FunctionOutlined /> {{ mapping.transform }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Mapping Rules -->
    <a-card title="映射规则" style="margin-top: 16px;">
      <a-table
        :columns="mappingColumns"
        :data-source="fieldMappings"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'transform'">
            <a-select
              v-model:value="record.transform"
              size="small"
              style="width: 150px;"
              allow-clear
            >
              <a-select-option value="trim">去除空格</a-select-option>
              <a-select-option value="uppercase">转大写</a-select-option>
              <a-select-option value="lowercase">转小写</a-select-option>
              <a-select-option value="date_format">日期格式化</a-select-option>
              <a-select-option value="number_format">数字格式化</a-select-option>
            </a-select>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add Target Field Modal -->
    <a-modal
      v-model:open="showAddFieldModal"
      title="添加目标字段"
      @ok="handleAddField"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="字段名称" required>
          <a-input v-model:value="newField.name" placeholder="例如：employee_name" />
        </a-form-item>
        <a-form-item label="字段类型" required>
          <a-select v-model:value="newField.type">
            <a-select-option value="string">字符串</a-select-option>
            <a-select-option value="number">数字</a-select-option>
            <a-select-option value="date">日期</a-select-option>
            <a-select-option value="boolean">布尔</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="源字段">
          <a-select v-model:value="newField.sourceField" show-search>
            <a-select-option
              v-for="field in allSourceFields"
              :key="field.fullName"
              :value="field.fullName"
            >
              {{ field.table }}.{{ field.name }} ({{ field.type }})
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebugStore, delay } from '../../stores/debug'
import { message } from 'ant-design-vue'
import draggable from 'vuedraggable'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  TableOutlined,
  DatabaseOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  DeleteOutlined,
  FunctionOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const debugStore = useDebugStore()

const saving = ref(false)
const sourceSearchText = ref('')
const targetSearchText = ref('')
const showAddFieldModal = ref(false)

const newField = ref({
  name: '',
  type: 'string',
  sourceField: ''
})

const dataSource = ref({
  id: 1,
  name: '钉钉OA系统',
  type: 'OA - 办公自动化',
  status: 'connected',
  host: 'https://oapi.dingtalk.com',
  database: 'dingtalk_hr'
})

const sourceFields = ref([
  {
    name: 'employees',
    fields: [
      { name: 'emp_id', type: 'string', description: '员工ID' },
      { name: 'emp_name', type: 'string', description: '员工姓名' },
      { name: 'dept_id', type: 'string', description: '部门ID' },
      { name: 'position', type: 'string', description: '职位' },
      { name: 'email', type: 'string', description: '邮箱' },
      { name: 'phone', type: 'string', description: '电话' },
      { name: 'hire_date', type: 'date', description: '入职日期' }
    ]
  },
  {
    name: 'departments',
    fields: [
      { name: 'dept_id', type: 'string', description: '部门ID' },
      { name: 'dept_name', type: 'string', description: '部门名称' },
      { name: 'parent_id', type: 'string', description: '上级部门ID' }
    ]
  },
  {
    name: 'attendance',
    fields: [
      { name: 'record_id', type: 'string', description: '记录ID' },
      { name: 'emp_id', type: 'string', description: '员工ID' },
      { name: 'check_in_time', type: 'date', description: '签到时间' },
      { name: 'check_out_time', type: 'date', description: '签退时间' }
    ]
  }
])

const fieldMappings = ref([
  {
    targetField: 'user_id',
    targetType: 'string',
    sourceField: 'employees.emp_id',
    transform: 'trim'
  },
  {
    targetField: 'user_name',
    targetType: 'string',
    sourceField: 'employees.emp_name',
    transform: null
  },
  {
    targetField: 'department',
    targetType: 'string',
    sourceField: 'departments.dept_name',
    transform: null
  },
  {
    targetField: 'email',
    targetType: 'string',
    sourceField: 'employees.email',
    transform: 'lowercase'
  },
  {
    targetField: 'join_date',
    targetType: 'date',
    sourceField: 'employees.hire_date',
    transform: 'date_format'
  }
])

const allSourceFields = computed(() => {
  const fields = []
  sourceFields.value.forEach(table => {
    table.fields.forEach(field => {
      fields.push({
        table: table.name,
        name: field.name,
        type: field.type,
        description: field.description,
        fullName: `${table.name}.${field.name}`
      })
    })
  })
  return fields
})

const mappingColumns = [
  { title: '目标字段', dataIndex: 'targetField', key: 'targetField', width: 200 },
  { title: '类型', dataIndex: 'targetType', key: 'targetType', width: 100 },
  { title: '源字段', dataIndex: 'sourceField', key: 'sourceField', width: 250 },
  { title: '转换规则', key: 'transform', width: 180 }
]

const getTypeColor = (type) => {
  const colorMap = {
    string: 'blue',
    number: 'green',
    date: 'orange',
    boolean: 'purple'
  }
  return colorMap[type] || 'default'
}

const isFieldMapped = (field) => {
  // Check if this field is used in any mapping
  return false // Simplified for demo
}

const selectSourceField = (field, tableName) => {
  debugStore.log('info', `选择源字段: ${tableName}.${field.name}`)
}

const loadSourceFields = async () => {
  debugStore.log('info', '🔄 加载源数据字段')
  await delay(300)
  debugStore.log('info', '连接数据源...')
  await delay(400)
  debugStore.log('success', `✓ 发现 ${sourceFields.value.length} 个数据表`)

  sourceFields.value.forEach(table => {
    debugStore.log('info', `  - ${table.name}: ${table.fields.length} 个字段`)
  })
  await delay(200)
  debugStore.log('success', '✓ 字段加载完成')
  message.success('字段列表已更新')
}

const addTargetField = () => {
  showAddFieldModal.value = true
  newField.value = {
    name: '',
    type: 'string',
    sourceField: ''
  }
}

const handleAddField = () => {
  if (!newField.value.name || !newField.value.sourceField) {
    message.error('请填写完整信息')
    return
  }

  fieldMappings.value.push({
    targetField: newField.value.name,
    targetType: newField.value.type,
    sourceField: newField.value.sourceField,
    transform: null
  })

  debugStore.log('success', `✓ 添加字段映射: ${newField.value.name} <- ${newField.value.sourceField}`)
  showAddFieldModal.value = false
  message.success('字段映射已添加')
}

const removeMapping = (index) => {
  const mapping = fieldMappings.value[index]
  debugStore.log('info', `🗑️ 删除映射: ${mapping.targetField}`)
  fieldMappings.value.splice(index, 1)
  message.success('映射已删除')
}

const testMapping = async () => {
  debugStore.log('info', '🧪 测试字段映射')
  await delay(300)

  debugStore.log('info', `映射规则数量: ${fieldMappings.value.length}`)
  await delay(200)

  debugStore.log('info', '模拟数据转换...')
  await delay(500)

  fieldMappings.value.forEach((mapping, idx) => {
    debugStore.log('info', `  [${idx + 1}] ${mapping.targetField} <- ${mapping.sourceField}`)
  })
  await delay(400)

  debugStore.log('success', '✓ 映射测试通过')
  debugStore.log('info', '示例数据:')
  debugStore.log('info', '  user_id: "E001"')
  debugStore.log('info', '  user_name: "张三"')
  debugStore.log('info', '  department: "销售部"')

  message.success('映射测试成功')
}

const saveConfig = async () => {
  saving.value = true

  try {
    debugStore.log('info', '💾 保存配置')
    await delay(300)

    debugStore.log('info', '验证映射规则...')
    await delay(400)

    debugStore.log('success', '✓ 验证通过')
    debugStore.log('info', '生成配置文件...')
    await delay(500)

    debugStore.log('info', '保存到数据库...')
    await delay(400)

    debugStore.log('success', '✓ 配置保存成功')
    message.success('配置已保存')

  } catch (error) {
    debugStore.log('error', `保存失败: ${error.message}`)
    message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  debugStore.log('info', '📖 加载数据源配置')
  await delay(400)
  debugStore.log('success', `✓ ${dataSource.value.name}`)
})
</script>

<style scoped>
.config-page {
  padding: 24px;
  max-width: 1800px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.field-list {
  max-height: 600px;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
}

.draggable-list {
  min-height: 50px;
}

.field-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.field-item:hover {
  background: #f5f5f5;
}

.field-item.selected {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.field-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.field-name {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.field-desc {
  font-size: 12px;
  color: #999;
}

.mapping-arrow {
  text-align: center;
  padding: 20px;
}

.field-mappings {
  padding: 16px;
}

.mapping-item {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.target-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mapping-source {
  margin-bottom: 8px;
}

.mapping-transform {
  margin-top: 8px;
}
</style>
