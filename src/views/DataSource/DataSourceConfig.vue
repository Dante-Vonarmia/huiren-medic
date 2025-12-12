<template>
  <div class="config-page">
    <div class="page-header">
      <a-button @click="router.back()">
        <ArrowLeftOutlined /> 返回列表
      </a-button>
      <a-space>
        <a-button
          :type="connectionMode ? 'primary' : 'default'"
          @click="toggleConnectionMode"
        >
          <LinkOutlined /> {{ connectionMode ? '连接模式 (开)' : '连接模式 (关)' }}
        </a-button>
        <a-button @click="autoMapFields">
          <ThunderboltOutlined /> 自动映射
        </a-button>
        <a-button @click="clearAllMappings" danger>
          <ClearOutlined /> 清除所有映射
        </a-button>
        <a-button @click="testConnection" :loading="testingConnection">
          <ApiOutlined /> 测试连接
        </a-button>
        <a-button type="primary" @click="saveConfig" :loading="saving">
          <SaveOutlined /> 保存配置
        </a-button>
      </a-space>
    </div>

    <a-card title="数据源信息" style="margin-bottom: 16px;">
      <template #extra>
        <a-space>
          <a-tag :color="connectionStatus.color">
            {{ connectionStatus.text }}
          </a-tag>
          <a-statistic
            title="映射数量"
            :value="mappingConnections.length"
            :value-style="{ fontSize: '16px' }"
          />
        </a-space>
      </template>
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

    <!-- Mapping Canvas -->
    <div class="mapping-container" ref="mappingContainerRef">
      <a-row :gutter="16">
        <!-- Source Fields -->
        <a-col :span="10">
          <a-card title="源数据字段" :bodyStyle="{ padding: 0 }">
            <template #extra>
              <a-space>
                <a-tag>{{ allSourceFields.length }} 字段</a-tag>
                <a-button size="small" @click="loadSourceFields">
                  <ReloadOutlined /> 刷新
                </a-button>
              </a-space>
            </template>

            <div class="field-list">
              <a-input-search
                v-model:value="sourceSearchText"
                placeholder="搜索字段"
                style="margin: 16px; width: calc(100% - 32px);"
              />

              <div class="field-group" v-for="table in filteredSourceFields" :key="table.name">
                <div class="group-header">
                  <TableOutlined /> {{ table.name }}
                  <a-tag size="small">{{ table.fields.length }}</a-tag>
                </div>

                <div class="field-items">
                  <div
                    v-for="field in table.fields"
                    :key="field.name"
                    :ref="el => setSourceFieldRef(el, `${table.name}.${field.name}`)"
                    class="field-item source-field"
                    :class="{
                      selected: selectedSourceField?.fullName === `${table.name}.${field.name}`,
                      mapped: isSourceFieldMapped(`${table.name}.${field.name}`),
                      'connection-mode': connectionMode
                    }"
                    draggable="true"
                    @dragstart="handleDragStart($event, field, table.name)"
                    @dragend="handleDragEnd"
                    @click="handleSourceFieldClick(field, table.name)"
                  >
                    <div class="field-info">
                      <div class="field-name-wrapper">
                        <span class="field-name">{{ field.name }}</span>
                        <a-badge
                          v-if="getSourceFieldMappingCount(`${table.name}.${field.name}`) > 0"
                          :count="getSourceFieldMappingCount(`${table.name}.${field.name}`)"
                          :number-style="{ backgroundColor: '#52c41a' }"
                        />
                      </div>
                      <a-tag size="small" :color="getTypeColor(field.type)">
                        {{ field.type }}
                      </a-tag>
                    </div>
                    <div class="field-desc">{{ field.description }}</div>
                    <div class="connection-point source-point"></div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- Connection Canvas -->
        <a-col :span="4">
          <div class="connection-canvas-container">
            <svg
              ref="connectionSvgRef"
              class="connection-svg"
              :width="canvasWidth"
              :height="canvasHeight"
            >
              <defs>
                <marker
                  id="arrowhead-auto"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#52c41a" />
                </marker>
                <marker
                  id="arrowhead-manual"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#1890ff" />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Temporary connection line while dragging -->
              <path
                v-if="dragConnection.active"
                :d="dragConnection.path"
                class="connection-line dragging"
                stroke="#1890ff"
                stroke-width="2"
                stroke-dasharray="5,5"
                fill="none"
              />

              <!-- Established connections -->
              <g
                v-for="(conn, index) in mappingConnections"
                :key="`conn-${index}`"
                class="connection-group"
                :class="{
                  hovered: hoveredConnection === index,
                  selected: selectedConnection === index
                }"
                @mouseenter="hoveredConnection = index"
                @mouseleave="hoveredConnection = null"
                @click="selectConnection(index)"
              >
                <!-- Connection path -->
                <path
                  :d="conn.path"
                  class="connection-line"
                  :class="conn.type"
                  :stroke="conn.type === 'auto' ? '#52c41a' : '#1890ff'"
                  stroke-width="2"
                  fill="none"
                  :marker-end="`url(#arrowhead-${conn.type})`"
                />

                <!-- Invisible wider path for easier clicking -->
                <path
                  :d="conn.path"
                  class="connection-hit-area"
                  stroke="transparent"
                  stroke-width="20"
                  fill="none"
                />

                <!-- Delete button on hover -->
                <g v-if="hoveredConnection === index" :transform="`translate(${conn.midPoint.x - 12}, ${conn.midPoint.y - 12})`">
                  <circle
                    cx="12"
                    cy="12"
                    r="12"
                    fill="#ff4d4f"
                    class="delete-button"
                    @click.stop="removeConnection(index)"
                  />
                  <text
                    x="12"
                    y="16"
                    text-anchor="middle"
                    fill="white"
                    font-size="14"
                    font-weight="bold"
                    style="pointer-events: none;"
                  >×</text>
                </g>

                <!-- Connection type indicator -->
                <circle
                  :cx="conn.midPoint.x"
                  :cy="conn.midPoint.y"
                  r="4"
                  :fill="conn.type === 'auto' ? '#52c41a' : '#1890ff'"
                />
              </g>
            </svg>

            <!-- Canvas overlay info -->
            <div class="canvas-overlay" v-if="connectionMode">
              <div class="connection-mode-hint">
                <LinkOutlined style="font-size: 20px;" />
                <div>连接模式已启用</div>
                <div class="hint-text">点击源字段，然后点击目标字段创建连接</div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- Target Fields -->
        <a-col :span="10">
          <a-card title="目标平台字段" :bodyStyle="{ padding: 0 }">
            <template #extra>
              <a-space>
                <a-tag>{{ targetFields.length }} 字段</a-tag>
                <a-button size="small" type="primary" @click="addTargetField">
                  <PlusOutlined /> 添加字段
                </a-button>
              </a-space>
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

                <div class="field-items">
                  <div
                    v-for="(field, index) in filteredTargetFields"
                    :key="field.name"
                    :ref="el => setTargetFieldRef(el, field.name)"
                    class="field-item target-field"
                    :class="{
                      selected: selectedTargetField?.name === field.name,
                      mapped: isTargetFieldMapped(field.name),
                      'connection-mode': connectionMode,
                      'drag-over': dragOverTarget === field.name
                    }"
                    @dragover.prevent="handleDragOver($event, field.name)"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop($event, field)"
                    @click="handleTargetFieldClick(field)"
                  >
                    <div class="connection-point target-point"></div>
                    <div class="field-info">
                      <div class="field-name-wrapper">
                        <span class="field-name">{{ field.name }}</span>
                        <a-badge
                          v-if="getTargetFieldMappingCount(field.name) > 0"
                          :count="getTargetFieldMappingCount(field.name)"
                          :number-style="{ backgroundColor: '#1890ff' }"
                        />
                      </div>
                      <a-tag size="small" :color="getTypeColor(field.type)">
                        {{ field.type }}
                      </a-tag>
                    </div>
                    <div class="field-desc">{{ field.description }}</div>
                    <div
                      v-if="isTargetFieldMapped(field.name)"
                      class="field-mapping-source"
                    >
                      <ArrowLeftOutlined style="font-size: 10px;" />
                      {{ getTargetFieldSources(field.name).join(', ') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Mapping Details Panel -->
    <a-card
      v-if="selectedConnection !== null"
      title="映射详情"
      style="margin-top: 16px;"
      class="mapping-details-card"
    >
      <template #extra>
        <a-button size="small" @click="selectedConnection = null">
          <CloseOutlined /> 关闭
        </a-button>
      </template>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-descriptions bordered :column="1" size="small">
            <a-descriptions-item label="源字段">
              <a-tag color="blue">{{ selectedConnectionData.source }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="源类型">
              <a-tag :color="getTypeColor(selectedConnectionData.sourceType)">
                {{ selectedConnectionData.sourceType }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :span="12">
          <a-descriptions bordered :column="1" size="small">
            <a-descriptions-item label="目标字段">
              <a-tag color="green">{{ selectedConnectionData.target }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="目标类型">
              <a-tag :color="getTypeColor(selectedConnectionData.targetType)">
                {{ selectedConnectionData.targetType }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>

      <a-divider />

      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="映射类型">
              <a-select v-model:value="selectedConnectionData.type" disabled>
                <a-select-option value="auto">自动映射</a-select-option>
                <a-select-option value="manual">手动映射</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8}>
            <a-form-item label="转换规则">
              <a-select
                v-model:value="selectedConnectionData.transform"
                allow-clear
                placeholder="选择转换规则"
              >
                <a-select-option value="trim">去除空格</a-select-option>
                <a-select-option value="uppercase">转大写</a-select-option>
                <a-select-option value="lowercase">转小写</a-select-option>
                <a-select-option value="date_format">日期格式化</a-select-option>
                <a-select-option value="number_format">数字格式化</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="默认值">
              <a-input
                v-model:value="selectedConnectionData.defaultValue"
                placeholder="留空使用源值"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-alert
          v-if="!isTypeCompatible(selectedConnectionData.sourceType, selectedConnectionData.targetType)"
          message="类型不匹配"
          description="源字段和目标字段的类型不兼容，可能需要添加转换规则"
          type="warning"
          show-icon
          style="margin-top: 16px;"
        />
      </a-form>
    </a-card>

    <!-- Mapping Summary -->
    <a-card title="映射规则汇总" style="margin-top: 16px;">
      <template #extra>
        <a-space>
          <a-button size="small" @click="exportMappings">
            <ExportOutlined /> 导出
          </a-button>
          <a-button size="small" type="primary" @click="copyMappingsJSON">
            <CopyOutlined /> 复制JSON
          </a-button>
        </a-space>
      </template>

      <a-table
        :columns="mappingColumns"
        :data-source="mappingTableData"
        :pagination="{ pageSize: 10 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === 'auto' ? 'green' : 'blue'">
              {{ record.type === 'auto' ? '自动' : '手动' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'sourceType'">
            <a-tag size="small" :color="getTypeColor(record.sourceType)">
              {{ record.sourceType }}
            </a-tag>
          </template>
          <template v-if="column.key === 'targetType'">
            <a-tag size="small" :color="getTypeColor(record.targetType)">
              {{ record.targetType }}
            </a-tag>
          </template>
          <template v-if="column.key === 'transform'">
            <a-select
              v-model:value="record.transform"
              size="small"
              style="width: 150px;"
              allow-clear
              @change="updateConnectionTransform(record.index, record.transform)"
            >
              <a-select-option value="trim">去除空格</a-select-option>
              <a-select-option value="uppercase">转大写</a-select-option>
              <a-select-option value="lowercase">转小写</a-select-option>
              <a-select-option value="date_format">日期格式化</a-select-option>
              <a-select-option value="number_format">数字格式化</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'compatible'">
            <a-tag :color="record.compatible ? 'success' : 'warning'">
              {{ record.compatible ? '兼容' : '需转换' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button
                size="small"
                type="link"
                @click="selectConnection(record.index)"
              >
                详情
              </a-button>
              <a-button
                size="small"
                type="link"
                danger
                @click="removeConnection(record.index)"
              >
                删除
              </a-button>
            </a-space>
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
        <a-form-item label="字段描述">
          <a-input v-model:value="newField.description" placeholder="字段用途说明" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Test Connection Modal -->
    <a-modal
      v-model:open="showTestConnectionModal"
      title="测试连接结果"
      width="800px"
      :footer="null"
    >
      <a-result
        :status="testResult.status"
        :title="testResult.title"
        :sub-title="testResult.message"
      >
        <template #extra>
          <a-button type="primary" @click="showTestConnectionModal = false">
            关闭
          </a-button>
        </template>
      </a-result>

      <a-divider />

      <h4>字段预览（示例数据）</h4>
      <a-table
        :columns="previewColumns"
        :data-source="previewData"
        :pagination="false"
        size="small"
        bordered
      />
    </a-modal>

    <!-- Save Confirmation Modal -->
    <a-modal
      v-model:open="showSaveModal"
      title="保存配置"
      width="800px"
      @ok="confirmSave"
      :confirm-loading="saving"
    >
      <a-alert
        message="配置预览"
        description="以下是将要保存的映射配置，请确认后保存"
        type="info"
        show-icon
        style="margin-bottom: 16px;"
      />

      <a-descriptions bordered :column="2" size="small" style="margin-bottom: 16px;">
        <a-descriptions-item label="数据源">{{ dataSource.name }}</a-descriptions-item>
        <a-descriptions-item label="映射数量">{{ mappingConnections.length }}</a-descriptions-item>
        <a-descriptions-item label="自动映射">{{ autoMappingCount }}</a-descriptions-item>
        <a-descriptions-item label="手动映射">{{ manualMappingCount }}</a-descriptions-item>
      </a-descriptions>

      <h4>配置JSON</h4>
      <a-textarea
        :value="JSON.stringify(configJSON, null, 2)"
        :rows="15"
        readonly
        style="font-family: 'Monaco', 'Courier New', monospace; font-size: 12px;"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebugStore, delay } from '../../stores/debug'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
  TableOutlined,
  DatabaseOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  DeleteOutlined,
  FunctionOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  ApiOutlined,
  CloseOutlined,
  ExportOutlined,
  CopyOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const debugStore = useDebugStore()

// State
const saving = ref(false)
const testingConnection = ref(false)
const sourceSearchText = ref('')
const targetSearchText = ref('')
const showAddFieldModal = ref(false)
const showTestConnectionModal = ref(false)
const showSaveModal = ref(false)
const connectionMode = ref(false)

// Connection drawing state
const mappingContainerRef = ref(null)
const connectionSvgRef = ref(null)
const canvasWidth = ref(300)
const canvasHeight = ref(800)
const sourceFieldRefs = ref({})
const targetFieldRefs = ref({})

// Selection state
const selectedSourceField = ref(null)
const selectedTargetField = ref(null)
const selectedConnection = ref(null)
const hoveredConnection = ref(null)

// Drag state
const dragOverTarget = ref(null)
const dragConnection = ref({
  active: false,
  path: '',
  sourceField: null
})

const newField = ref({
  name: '',
  type: 'string',
  description: ''
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
      { name: 'hire_date', type: 'date', description: '入职日期' },
      { name: 'salary', type: 'number', description: '薪资' }
    ]
  },
  {
    name: 'departments',
    fields: [
      { name: 'dept_id', type: 'string', description: '部门ID' },
      { name: 'dept_name', type: 'string', description: '部门名称' },
      { name: 'parent_id', type: 'string', description: '上级部门ID' },
      { name: 'manager_id', type: 'string', description: '部门经理ID' }
    ]
  },
  {
    name: 'attendance',
    fields: [
      { name: 'record_id', type: 'string', description: '记录ID' },
      { name: 'emp_id', type: 'string', description: '员工ID' },
      { name: 'check_in_time', type: 'date', description: '签到时间' },
      { name: 'check_out_time', type: 'date', description: '签退时间' },
      { name: 'work_hours', type: 'number', description: '工作时长' }
    ]
  }
])

const targetFields = ref([
  { name: 'user_id', type: 'string', description: '用户唯一标识' },
  { name: 'user_name', type: 'string', description: '用户姓名' },
  { name: 'department', type: 'string', description: '所属部门' },
  { name: 'email', type: 'string', description: '电子邮箱' },
  { name: 'join_date', type: 'date', description: '加入日期' },
  { name: 'phone_number', type: 'string', description: '联系电话' },
  { name: 'job_title', type: 'string', description: '职位名称' },
  { name: 'monthly_salary', type: 'number', description: '月薪' },
  { name: 'department_id', type: 'string', description: '部门ID' },
  { name: 'manager_name', type: 'string', description: '直属经理' }
])

// Mapping connections with visual paths
const mappingConnections = ref([])

const testResult = ref({
  status: 'success',
  title: '连接测试成功',
  message: '数据源连接正常，字段映射配置有效'
})

// Computed properties
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

const filteredSourceFields = computed(() => {
  if (!sourceSearchText.value) return sourceFields.value

  const search = sourceSearchText.value.toLowerCase()
  return sourceFields.value.map(table => ({
    ...table,
    fields: table.fields.filter(field =>
      field.name.toLowerCase().includes(search) ||
      field.description.toLowerCase().includes(search)
    )
  })).filter(table => table.fields.length > 0)
})

const filteredTargetFields = computed(() => {
  if (!targetSearchText.value) return targetFields.value

  const search = targetSearchText.value.toLowerCase()
  return targetFields.value.filter(field =>
    field.name.toLowerCase().includes(search) ||
    field.description.toLowerCase().includes(search)
  )
})

const connectionStatus = computed(() => {
  if (testingConnection.value) {
    return { color: 'processing', text: '测试中...' }
  }
  if (dataSource.value.status === 'connected') {
    return { color: 'success', text: '连接正常' }
  }
  return { color: 'default', text: '未连接' }
})

const autoMappingCount = computed(() =>
  mappingConnections.value.filter(c => c.type === 'auto').length
)

const manualMappingCount = computed(() =>
  mappingConnections.value.filter(c => c.type === 'manual').length
)

const selectedConnectionData = computed(() => {
  if (selectedConnection.value === null) return null

  const conn = mappingConnections.value[selectedConnection.value]
  return {
    source: conn.source,
    target: conn.target,
    sourceType: conn.sourceType,
    targetType: conn.targetType,
    type: conn.type,
    transform: conn.transform,
    defaultValue: conn.defaultValue
  }
})

const mappingTableData = computed(() => {
  return mappingConnections.value.map((conn, index) => ({
    index,
    source: conn.source,
    target: conn.target,
    sourceType: conn.sourceType,
    targetType: conn.targetType,
    type: conn.type,
    transform: conn.transform,
    compatible: isTypeCompatible(conn.sourceType, conn.targetType)
  }))
})

const configJSON = computed(() => {
  return {
    dataSource: {
      id: dataSource.value.id,
      name: dataSource.value.name,
      type: dataSource.value.type,
      connection: {
        host: dataSource.value.host,
        database: dataSource.value.database
      }
    },
    mappings: mappingConnections.value.map(conn => ({
      source: conn.source,
      target: conn.target,
      sourceType: conn.sourceType,
      targetType: conn.targetType,
      type: conn.type,
      transform: conn.transform,
      defaultValue: conn.defaultValue
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      autoMappingCount: autoMappingCount.value,
      manualMappingCount: manualMappingCount.value,
      totalMappings: mappingConnections.value.length
    }
  }
})

const previewColumns = [
  { title: '字段名', dataIndex: 'field', key: 'field' },
  { title: '源值', dataIndex: 'sourceValue', key: 'sourceValue' },
  { title: '目标值', dataIndex: 'targetValue', key: 'targetValue' },
  { title: '转换', dataIndex: 'transform', key: 'transform' }
]

const previewData = ref([
  { field: 'user_id', sourceValue: 'E001', targetValue: 'E001', transform: 'trim' },
  { field: 'user_name', sourceValue: '张三', targetValue: '张三', transform: '-' },
  { field: 'email', sourceValue: 'Zhang.San@Company.com', targetValue: 'zhang.san@company.com', transform: 'lowercase' },
  { field: 'join_date', sourceValue: '2023-01-15', targetValue: '2023-01-15', transform: 'date_format' }
])

const mappingColumns = [
  { title: '源字段', dataIndex: 'source', key: 'source', width: 200 },
  { title: '源类型', key: 'sourceType', width: 100 },
  { title: '目标字段', dataIndex: 'target', key: 'target', width: 200 },
  { title: '目标类型', key: 'targetType', width: 100 },
  { title: '映射类型', key: 'type', width: 100 },
  { title: '转换规则', key: 'transform', width: 180 },
  { title: '兼容性', key: 'compatible', width: 100 },
  { title: '操作', key: 'actions', width: 150 }
]

// Helper functions
const getTypeColor = (type) => {
  const colorMap = {
    string: 'blue',
    number: 'green',
    date: 'orange',
    boolean: 'purple'
  }
  return colorMap[type] || 'default'
}

const isTypeCompatible = (sourceType, targetType) => {
  if (sourceType === targetType) return true

  // Allow some implicit conversions
  const compatiblePairs = [
    ['string', 'number'],
    ['string', 'date'],
    ['number', 'string']
  ]

  return compatiblePairs.some(([from, to]) =>
    sourceType === from && targetType === to
  )
}

const setSourceFieldRef = (el, fullName) => {
  if (el) {
    sourceFieldRefs.value[fullName] = el
  }
}

const setTargetFieldRef = (el, name) => {
  if (el) {
    targetFieldRefs.value[name] = el
  }
}

const calculateConnectionPath = (sourceEl, targetEl) => {
  if (!sourceEl || !targetEl || !mappingContainerRef.value) return ''

  const containerRect = mappingContainerRef.value.getBoundingClientRect()
  const sourceRect = sourceEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()

  // Calculate positions relative to the container
  const startX = sourceRect.right - containerRect.left
  const startY = sourceRect.top - containerRect.top + sourceRect.height / 2
  const endX = targetRect.left - containerRect.left
  const endY = targetRect.top - containerRect.top + targetRect.height / 2

  // Create a curved path
  const controlX1 = startX + (endX - startX) / 3
  const controlX2 = startX + (endX - startX) * 2 / 3

  return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`
}

const updateAllConnectionPaths = () => {
  mappingConnections.value = mappingConnections.value.map(conn => {
    const sourceEl = sourceFieldRefs.value[conn.source]
    const targetEl = targetFieldRefs.value[conn.target]
    const path = calculateConnectionPath(sourceEl, targetEl)

    if (!path) return conn

    // Calculate midpoint for indicators
    const sourceRect = sourceEl?.getBoundingClientRect()
    const targetRect = targetEl?.getBoundingClientRect()
    const containerRect = mappingContainerRef.value?.getBoundingClientRect()

    if (sourceRect && targetRect && containerRect) {
      const midX = ((sourceRect.right - containerRect.left) + (targetRect.left - containerRect.left)) / 2
      const midY = ((sourceRect.top - containerRect.top + sourceRect.height / 2) +
                    (targetRect.top - containerRect.top + targetRect.height / 2)) / 2

      return {
        ...conn,
        path,
        midPoint: { x: midX, y: midY }
      }
    }

    return { ...conn, path }
  })
}

// Field mapping checks
const isSourceFieldMapped = (fullName) => {
  return mappingConnections.value.some(conn => conn.source === fullName)
}

const isTargetFieldMapped = (name) => {
  return mappingConnections.value.some(conn => conn.target === name)
}

const getSourceFieldMappingCount = (fullName) => {
  return mappingConnections.value.filter(conn => conn.source === fullName).length
}

const getTargetFieldMappingCount = (name) => {
  return mappingConnections.value.filter(conn => conn.target === name).length
}

const getTargetFieldSources = (name) => {
  return mappingConnections.value
    .filter(conn => conn.target === name)
    .map(conn => conn.source.split('.')[1])
}

// Event handlers
const toggleConnectionMode = () => {
  connectionMode.value = !connectionMode.value
  if (connectionMode.value) {
    message.info('连接模式已启用，点击源字段和目标字段创建映射')
    debugStore.log('info', '🔗 启用连接模式')
  } else {
    selectedSourceField.value = null
    selectedTargetField.value = null
    debugStore.log('info', '🔗 关闭连接模式')
  }
}

const handleSourceFieldClick = (field, tableName) => {
  const fullName = `${tableName}.${field.name}`

  if (connectionMode.value) {
    selectedSourceField.value = { ...field, fullName, tableName }
    debugStore.log('info', `选择源字段: ${fullName}`)
    message.info(`已选择源字段: ${fullName}`)
  }
}

const handleTargetFieldClick = (field) => {
  if (connectionMode.value && selectedSourceField.value) {
    // Create connection
    createConnection(selectedSourceField.value, field, 'manual')
    selectedSourceField.value = null
    selectedTargetField.value = null
  } else {
    selectedTargetField.value = field
  }
}

const createConnection = (sourceField, targetField, type = 'manual') => {
  const source = sourceField.fullName || `${sourceField.tableName}.${sourceField.name}`
  const target = targetField.name

  // Check if connection already exists
  const exists = mappingConnections.value.some(
    conn => conn.source === source && conn.target === target
  )

  if (exists) {
    message.warning('该映射已存在')
    return
  }

  const sourceEl = sourceFieldRefs.value[source]
  const targetEl = targetFieldRefs.value[target]

  if (!sourceEl || !targetEl) {
    message.error('无法创建连接，请稍后重试')
    return
  }

  const path = calculateConnectionPath(sourceEl, targetEl)

  // Calculate midpoint
  const sourceRect = sourceEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  const containerRect = mappingContainerRef.value.getBoundingClientRect()

  const midX = ((sourceRect.right - containerRect.left) + (targetRect.left - containerRect.left)) / 2
  const midY = ((sourceRect.top - containerRect.top + sourceRect.height / 2) +
                (targetRect.top - containerRect.top + targetRect.height / 2)) / 2

  mappingConnections.value.push({
    source,
    target,
    sourceType: sourceField.type,
    targetType: targetField.type,
    type,
    path,
    midPoint: { x: midX, y: midY },
    transform: null,
    defaultValue: null
  })

  debugStore.log('success', `✓ 创建映射: ${source} → ${target}`)
  message.success(`已创建映射: ${source} → ${target}`)
}

const removeConnection = (index) => {
  const conn = mappingConnections.value[index]
  debugStore.log('info', `🗑️ 删除映射: ${conn.source} → ${conn.target}`)
  mappingConnections.value.splice(index, 1)

  if (selectedConnection.value === index) {
    selectedConnection.value = null
  } else if (selectedConnection.value !== null && selectedConnection.value > index) {
    selectedConnection.value--
  }

  message.success('映射已删除')
}

const selectConnection = (index) => {
  selectedConnection.value = index
  debugStore.log('info', `选择映射: ${mappingConnections.value[index].source} → ${mappingConnections.value[index].target}`)
}

const updateConnectionTransform = (index, transform) => {
  if (mappingConnections.value[index]) {
    mappingConnections.value[index].transform = transform
  }
}

// Drag and drop handlers
const handleDragStart = (event, field, tableName) => {
  const fullName = `${tableName}.${field.name}`
  dragConnection.value.sourceField = { ...field, fullName, tableName }
  event.dataTransfer.effectAllowed = 'link'
  event.dataTransfer.setData('text/plain', fullName)

  debugStore.log('info', `开始拖拽: ${fullName}`)
}

const handleDragEnd = () => {
  dragConnection.value = {
    active: false,
    path: '',
    sourceField: null
  }
}

const handleDragOver = (event, targetName) => {
  event.preventDefault()
  dragOverTarget.value = targetName

  // Update drag connection line
  if (dragConnection.value.sourceField) {
    const sourceEl = sourceFieldRefs.value[dragConnection.value.sourceField.fullName]
    const targetEl = targetFieldRefs.value[targetName]

    if (sourceEl && targetEl) {
      dragConnection.value.active = true
      dragConnection.value.path = calculateConnectionPath(sourceEl, targetEl)
    }
  }
}

const handleDragLeave = () => {
  dragOverTarget.value = null
}

const handleDrop = (event, targetField) => {
  event.preventDefault()
  dragOverTarget.value = null

  if (dragConnection.value.sourceField) {
    createConnection(dragConnection.value.sourceField, targetField, 'manual')
  }

  handleDragEnd()
}

// Auto-mapping
const autoMapFields = async () => {
  debugStore.log('info', '🤖 执行自动映射')
  await delay(300)

  let mappedCount = 0

  targetFields.value.forEach(targetField => {
    // Try to find matching source field by name similarity
    const targetName = targetField.name.toLowerCase()

    let bestMatch = null
    let bestScore = 0

    allSourceFields.value.forEach(sourceField => {
      const sourceName = sourceField.name.toLowerCase()

      // Calculate similarity score
      let score = 0

      // Exact match
      if (sourceName === targetName) score = 100
      // Contains
      else if (sourceName.includes(targetName) || targetName.includes(sourceName)) score = 80
      // Word match
      else {
        const sourceWords = sourceName.split('_')
        const targetWords = targetName.split('_')
        const matchingWords = sourceWords.filter(w => targetWords.includes(w)).length
        score = (matchingWords / Math.max(sourceWords.length, targetWords.length)) * 70
      }

      // Type compatibility bonus
      if (sourceField.type === targetField.type) score += 20

      if (score > bestScore) {
        bestScore = score
        bestMatch = sourceField
      }
    })

    // Create mapping if score is high enough
    if (bestMatch && bestScore >= 60) {
      const exists = mappingConnections.value.some(
        conn => conn.source === bestMatch.fullName && conn.target === targetField.name
      )

      if (!exists) {
        createConnection(bestMatch, targetField, 'auto')
        mappedCount++
      }
    }
  })

  await delay(500)

  if (mappedCount > 0) {
    debugStore.log('success', `✓ 自动映射完成，创建了 ${mappedCount} 个映射`)
    message.success(`自动映射完成，创建了 ${mappedCount} 个映射`)
  } else {
    debugStore.log('info', '未找到可自动映射的字段')
    message.info('未找到可自动映射的字段')
  }

  await nextTick()
  updateAllConnectionPaths()
}

const clearAllMappings = () => {
  if (mappingConnections.value.length === 0) {
    message.info('没有映射可清除')
    return
  }

  const count = mappingConnections.value.length
  mappingConnections.value = []
  selectedConnection.value = null

  debugStore.log('info', `🗑️ 清除所有映射 (${count}个)`)
  message.success(`已清除 ${count} 个映射`)
}

// Field operations
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

  await nextTick()
  updateAllConnectionPaths()
}

const addTargetField = () => {
  showAddFieldModal.value = true
  newField.value = {
    name: '',
    type: 'string',
    description: ''
  }
}

const handleAddField = async () => {
  if (!newField.value.name) {
    message.error('请填写字段名称')
    return
  }

  // Check if field already exists
  const exists = targetFields.value.some(f => f.name === newField.value.name)
  if (exists) {
    message.error('字段已存在')
    return
  }

  targetFields.value.push({
    name: newField.value.name,
    type: newField.value.type,
    description: newField.value.description
  })

  debugStore.log('success', `✓ 添加目标字段: ${newField.value.name}`)
  showAddFieldModal.value = false
  message.success('字段已添加')

  await nextTick()
  updateAllConnectionPaths()
}

// Test connection
const testConnection = async () => {
  testingConnection.value = true
  debugStore.log('info', '🔌 测试数据源连接')
  await delay(500)

  debugStore.log('info', '连接到数据源...')
  await delay(800)

  debugStore.log('info', '验证凭据...')
  await delay(600)

  debugStore.log('info', '测试字段映射...')
  await delay(700)

  const success = Math.random() > 0.1 // 90% success rate

  if (success) {
    testResult.value = {
      status: 'success',
      title: '连接测试成功',
      message: `数据源连接正常，字段映射配置有效。共 ${mappingConnections.value.length} 个映射。`
    }
    debugStore.log('success', '✓ 连接测试成功')
  } else {
    testResult.value = {
      status: 'error',
      title: '连接测试失败',
      message: '无法连接到数据源，请检查连接配置'
    }
    debugStore.log('error', '✗ 连接测试失败')
  }

  testingConnection.value = false
  showTestConnectionModal.value = true
}

// Save and export
const saveConfig = () => {
  if (mappingConnections.value.length === 0) {
    message.warning('请至少创建一个字段映射')
    return
  }

  showSaveModal.value = true
  debugStore.log('info', '📝 准备保存配置')
}

const confirmSave = async () => {
  saving.value = true

  try {
    debugStore.log('info', '💾 保存配置')
    await delay(300)

    debugStore.log('info', '验证映射规则...')
    await delay(400)

    debugStore.log('success', '✓ 验证通过')
    debugStore.log('info', '生成配置文件...')
    await delay(500)

    debugStore.log('info', JSON.stringify(configJSON.value, null, 2))
    await delay(300)

    debugStore.log('info', '保存到数据库...')
    await delay(400)

    debugStore.log('success', '✓ 配置保存成功')
    message.success('配置已保存')

    showSaveModal.value = false
  } catch (error) {
    debugStore.log('error', `保存失败: ${error.message}`)
    message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const exportMappings = () => {
  const dataStr = JSON.stringify(configJSON.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mapping-config-${dataSource.value.name}-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)

  debugStore.log('success', '✓ 配置已导出')
  message.success('配置已导出')
}

const copyMappingsJSON = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(configJSON.value, null, 2))
    message.success('JSON已复制到剪贴板')
    debugStore.log('success', '✓ JSON已复制')
  } catch (error) {
    message.error('复制失败')
  }
}

// Lifecycle and watchers
watch(() => mappingConnections.value.length, () => {
  nextTick(() => {
    updateAllConnectionPaths()
  })
})

watch([sourceSearchText, targetSearchText], () => {
  nextTick(() => {
    updateAllConnectionPaths()
  })
})

onMounted(async () => {
  debugStore.log('info', '📖 加载数据源配置')
  await delay(400)
  debugStore.log('success', `✓ ${dataSource.value.name}`)

  // Set canvas dimensions
  await nextTick()
  if (mappingContainerRef.value) {
    const rect = mappingContainerRef.value.getBoundingClientRect()
    canvasHeight.value = Math.max(800, rect.height)
  }

  // Create some initial auto-mappings for demo
  await delay(200)
  debugStore.log('info', '🤖 加载预设映射')

  const initialMappings = [
    { source: 'employees.emp_id', target: 'user_id', type: 'auto' },
    { source: 'employees.emp_name', target: 'user_name', type: 'auto' },
    { source: 'employees.email', target: 'email', type: 'auto' },
    { source: 'employees.hire_date', target: 'join_date', type: 'auto' }
  ]

  await nextTick()

  initialMappings.forEach(mapping => {
    const sourceField = allSourceFields.value.find(f => f.fullName === mapping.source)
    const targetField = targetFields.value.find(f => f.name === mapping.target)

    if (sourceField && targetField) {
      createConnection(sourceField, targetField, mapping.type)
    }
  })

  debugStore.log('success', `✓ 加载了 ${initialMappings.length} 个预设映射`)

  // Update all connection paths
  await nextTick()
  updateAllConnectionPaths()

  // Add window resize listener
  window.addEventListener('resize', updateAllConnectionPaths)
})
</script>

<style scoped>
.config-page {
  padding: 24px;
  max-width: 1920px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* Mapping Container */
.mapping-container {
  position: relative;
  margin-bottom: 24px;
}

.connection-canvas-container {
  position: relative;
  height: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-svg * {
  pointer-events: auto;
}

/* Connection Lines */
.connection-line {
  transition: all 0.3s ease;
  cursor: pointer;
}

.connection-line.auto {
  stroke: #52c41a;
  animation: flow-auto 2s linear infinite;
}

.connection-line.manual {
  stroke: #1890ff;
  animation: flow-manual 2s linear infinite;
}

.connection-line.dragging {
  animation: dash 1s linear infinite;
}

.connection-group:hover .connection-line {
  stroke-width: 3;
  filter: url(#glow);
}

.connection-group.selected .connection-line {
  stroke-width: 3;
  filter: url(#glow);
}

.connection-hit-area {
  cursor: pointer;
}

/* Delete Button */
.delete-button {
  cursor: pointer;
  transition: all 0.2s;
}

.delete-button:hover {
  transform: scale(1.1);
}

/* Canvas Overlay */
.canvas-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 2;
}

.connection-mode-hint {
  background: rgba(24, 144, 255, 0.1);
  border: 2px dashed #1890ff;
  border-radius: 12px;
  padding: 24px 32px;
  color: #1890ff;
  font-weight: 600;
  font-size: 14px;
  animation: pulse 2s ease-in-out infinite;
}

.hint-text {
  font-size: 12px;
  font-weight: normal;
  margin-top: 8px;
  opacity: 0.8;
}

/* Field List */
.field-list {
  max-height: 700px;
  overflow-y: auto;
  overflow-x: hidden;
}

.field-list::-webkit-scrollbar {
  width: 8px;
}

.field-list::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.field-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 4px;
}

.field-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
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
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  position: sticky;
  top: 0;
  z-index: 10;
}

.field-items {
  position: relative;
}

/* Field Items */
.field-item {
  position: relative;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.field-item:hover {
  background: #f5f5f5;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.field-item.selected {
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
  padding-left: 12px;
}

.field-item.mapped {
  background: #f6ffed;
}

.field-item.mapped.selected {
  background: #d9f7be;
  border-left-color: #52c41a;
}

.field-item.connection-mode {
  cursor: crosshair;
}

.field-item.drag-over {
  background: #e6f7ff;
  border: 2px dashed #1890ff;
  animation: glow-border 1s ease-in-out infinite;
}

/* Source Field Connection Point */
.source-field {
  padding-right: 32px;
}

.source-field .connection-point {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #1890ff;
  border: 2px solid white;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.source-field:hover .connection-point,
.source-field.connection-mode .connection-point,
.source-field.mapped .connection-point {
  opacity: 1;
}

.source-field.mapped .connection-point {
  background: #52c41a;
}

.source-field.selected .connection-point {
  animation: pulse-point 1s ease-in-out infinite;
}

/* Target Field Connection Point */
.target-field {
  padding-left: 32px;
}

.target-field .connection-point {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #1890ff;
  border: 2px solid white;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.target-field:hover .connection-point,
.target-field.connection-mode .connection-point,
.target-field.mapped .connection-point {
  opacity: 1;
}

.target-field.mapped .connection-point {
  background: #52c41a;
}

/* Field Info */
.field-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 8px;
}

.field-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.field-name {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-mapping-source {
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Mapping Details Card */
.mapping-details-card {
  border: 2px solid #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  animation: slideIn 0.3s ease;
}

/* Animations */
@keyframes flow-auto {
  0% {
    stroke-dasharray: 10 5;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 10 5;
    stroke-dashoffset: 15;
  }
}

@keyframes flow-manual {
  0% {
    stroke-dasharray: 8 4;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 8 4;
    stroke-dashoffset: 12;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.02);
  }
}

@keyframes pulse-point {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: translateY(-50%) scale(1.3);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  }
}

@keyframes glow-border {
  0%, 100% {
    border-color: #1890ff;
    box-shadow: 0 0 5px rgba(24, 144, 255, 0.3);
  }
  50% {
    border-color: #40a9ff;
    box-shadow: 0 0 20px rgba(24, 144, 255, 0.6);
  }
}

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

/* Responsive */
@media (max-width: 1600px) {
  .config-page {
    max-width: 100%;
  }

  .field-list {
    max-height: 500px;
  }
}

/* Utility Classes */
.mapping-arrow {
  text-align: center;
  padding: 20px;
}
</style>
