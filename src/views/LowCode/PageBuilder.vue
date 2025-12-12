<template>
  <div class="page-builder">
    <div class="builder-header">
      <div class="header-title">
        <LayoutOutlined style="font-size: 24px; color: white" />
        <span>页面构建器</span>
        <a-tag color="blue" style="margin-left: 12px;">响应式布局</a-tag>
        <a-tag color="green">13+ 组件</a-tag>
        <a-tag color="purple">4种模板</a-tag>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <DragOutlined style="font-size: 16px; color: #262626;" />
          <span>拖拽式设计</span>
        </div>
        <div class="stat-item">
          <MobileOutlined style="font-size: 16px; color: #262626;" />
          <span>多端适配</span>
        </div>
        <div class="stat-item">
          <ThunderboltOutlined style="font-size: 16px; color: #262626;" />
          <span>实时预览</span>
        </div>
      </div>
      <a-space>
        <a-button @click="goBack" size="small">
          <ArrowLeftOutlined /> 返回
        </a-button>
        <a-radio-group v-model:value="device" button-style="solid" size="small">
          <a-radio-button value="desktop"><DesktopOutlined /></a-radio-button>
          <a-radio-button value="tablet"><TabletOutlined /></a-radio-button>
          <a-radio-button value="mobile"><MobileOutlined /></a-radio-button>
        </a-radio-group>
        <a-button type="primary" @click="publish" size="small">
          <GlobalOutlined /> 发布
        </a-button>
      </a-space>
    </div>

    <div class="builder-container">
      <!-- 左侧组件 -->
      <div class="component-panel">
        <div class="drag-hint-top">
          <DragOutlined /> 拖拽组件到画布
        </div>
        <a-tabs>
          <a-tab-pane key="components">
            <template #tab>
              <span>组件 <a-badge :count="displayComponents.length + formComponents.length + dataComponents.length" :number-style="{ backgroundColor: '#d81e06', fontSize: '10px' }" /></span>
            </template>
            <a-collapse :default-active-key="['display', 'form', 'data']" ghost>
              <a-collapse-panel key="display" header="展示组件">
                <div class="comp-grid">
                  <div
                    v-for="comp in displayComponents"
                    :key="comp.type"
                    class="comp-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, comp)"
                  >
                    <component :is="comp.icon" /> {{ comp.label }}
                  </div>
                </div>
              </a-collapse-panel>
              <a-collapse-panel key="form" header="表单组件">
                <div class="comp-grid">
                  <div
                    v-for="comp in formComponents"
                    :key="comp.type"
                    class="comp-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, comp)"
                  >
                    <component :is="comp.icon" /> {{ comp.label }}
                  </div>
                </div>
              </a-collapse-panel>
              <a-collapse-panel key="data" header="数据组件">
                <div class="comp-grid">
                  <div
                    v-for="comp in dataComponents"
                    :key="comp.type"
                    class="comp-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, comp)"
                  >
                    <component :is="comp.icon" /> {{ comp.label }}
                  </div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>
          <a-tab-pane key="templates">
            <template #tab>
              <span>模板 <a-badge :count="templates.length" :number-style="{ backgroundColor: '#d81e06', fontSize: '10px' }" /></span>
            </template>
            <div class="template-list">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-item"
                @click="loadTemplate(template)"
              >
                {{ template.icon }} {{ template.name }}
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-panel">
        <div class="canvas-wrapper" :class="deviceClass">
          <div
            class="page-canvas"
            :class="{ 'drag-over': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <!-- 页面标题 -->
            <div class="page-header-demo">
              <h1>{{ pageTitle }}</h1>
            </div>

            <!-- 页面网格 -->
            <div class="page-grid" :style="gridStyle">
              <div
                v-for="(component, index) in pageComponents"
                :key="component.id"
                class="grid-item"
                :class="{ 'component-selected': selectedComponentIndex === index }"
                :style="{ gridColumn: `span ${component.span}` }"
                @click.stop="selectComponent(index)"
              >
                <div class="widget-card">
                  <div class="widget-header">
                    <div class="header-left">
                      <component :is="component.icon" />
                      <span>{{ component.title }}</span>
                    </div>
                    <!-- 操作按钮 - 在标题右侧 -->
                    <div class="component-actions-header">
                      <ArrowUpOutlined
                        @click.stop="moveComponentUp(index)"
                        :class="{ 'action-disabled': index === 0 }"
                        title="上移"
                      />
                      <ArrowDownOutlined
                        @click.stop="moveComponentDown(index)"
                        :class="{ 'action-disabled': index === pageComponents.length - 1 }"
                        title="下移"
                      />
                      <CopyOutlined @click.stop="copyComponent(index)" title="复制" />
                      <DeleteOutlined @click.stop="confirmRemoveComponent(index)" title="删除" />
                    </div>
                  </div>
                  <div class="widget-content">
                    <!-- 动态渲染不同类型的组件 -->
                    <component
                      :is="getComponentRenderer(component.type)"
                      :component="component"
                    />
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="pageComponents.length === 0" class="empty-canvas">
                <InboxOutlined style="font-size: 48px; color: #ccc" />
                <p>从左侧拖拽组件到此处</p>
                <p style="font-size: 12px; color: #999">或点击模板快速开始</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性 -->
      <div class="property-panel">
        <h3>{{ selectedComponent ? '组件属性' : '页面配置' }}</h3>
        <a-form layout="vertical" size="small">
          <template v-if="!selectedComponent">
            <!-- 页面全局配置 -->
            <a-form-item label="页面标题">
              <a-input v-model:value="pageTitle" />
            </a-form-item>
            <a-form-item label="布局方式">
              <a-select v-model:value="layoutType">
                <a-select-option value="grid">网格布局</a-select-option>
                <a-select-option value="flex">弹性布局</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="网格列数">
              <a-slider v-model:value="gridColumns" :min="2" :max="12" :marks="{ 2: '2', 4: '4', 6: '6', 8: '8', 12: '12' }" />
            </a-form-item>
            <a-form-item label="数据源">
              <a-select v-model:value="dataSource">
                <a-select-option value="customer_360">客户360查询</a-select-option>
                <a-select-option value="order_list">订单列表</a-select-option>
                <a-select-option value="product_stats">产品统计</a-select-option>
              </a-select>
            </a-form-item>
          </template>

          <template v-else>
            <!-- 组件属性配置 -->
            <a-form-item label="组件标题">
              <a-input v-model:value="selectedComponent.title" />
            </a-form-item>
            <a-form-item label="图标">
              <a-select v-model:value="selectedComponent.iconName">
                <a-select-option value="UserOutlined">用户</a-select-option>
                <a-select-option value="ShoppingOutlined">购物</a-select-option>
                <a-select-option value="DollarOutlined">金额</a-select-option>
                <a-select-option value="TableOutlined">表格</a-select-option>
                <a-select-option value="BarChartOutlined">图表</a-select-option>
                <a-select-option value="FileTextOutlined">文本</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="宽度占比">
              <a-slider v-model:value="selectedComponent.span" :min="1" :max="gridColumns" :marks="getSpanMarks()" />
            </a-form-item>
            <a-form-item label="背景颜色">
              <a-input v-model:value="selectedComponent.bgColor" type="color" />
            </a-form-item>

            <!-- 特定组件类型的属性 -->
            <template v-if="selectedComponent.type === 'stat'">
              <a-form-item label="数值">
                <a-input v-model:value="selectedComponent.value" />
              </a-form-item>
              <a-form-item label="单位">
                <a-input v-model:value="selectedComponent.unit" />
              </a-form-item>
              <a-form-item label="数值颜色">
                <a-input v-model:value="selectedComponent.valueColor" type="color" />
              </a-form-item>
            </template>

            <template v-if="selectedComponent.type === 'info'">
              <a-form-item label="信息字段">
                <a-button size="small" @click="addInfoField" block>添加字段</a-button>
                <div v-for="(field, idx) in selectedComponent.fields" :key="idx" style="margin-top: 8px">
                  <a-input-group compact>
                    <a-input v-model:value="field.label" placeholder="标签" style="width: 45%" />
                    <a-input v-model:value="field.value" placeholder="值" style="width: 45%" />
                    <a-button @click="removeInfoField(idx)" danger size="small" style="width: 10%">
                      <DeleteOutlined />
                    </a-button>
                  </a-input-group>
                </div>
              </a-form-item>
            </template>

            <template v-if="selectedComponent.type === 'text'">
              <a-form-item label="文本内容">
                <a-textarea v-model:value="selectedComponent.content" :rows="4" />
              </a-form-item>
              <a-form-item label="文本大小">
                <a-slider v-model:value="selectedComponent.fontSize" :min="12" :max="32" />
              </a-form-item>
            </template>
          </template>
        </a-form>
      </div>
    </div>

    <!-- 发布模态框 -->
    <a-modal
      v-model:open="publishVisible"
      title="发布页面配置"
      width="800px"
      :footer="null"
    >
      <a-alert
        message="发布成功"
        description="页面配置已生成，您可以复制以下JSON配置"
        type="success"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-textarea
        :value="pageConfigJson"
        :rows="20"
        readonly
        style="font-family: monospace; font-size: 12px"
      />
      <div style="margin-top: 16px; text-align: right">
        <a-space>
          <a-button @click="publishVisible = false">关闭</a-button>
          <a-button type="primary" @click="copyConfig">复制配置</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  LayoutOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  GlobalOutlined,
  TableOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PictureOutlined,
  EditOutlined,
  DownOutlined,
  CalendarOutlined,
  UploadOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  DragOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 组件库定义
const displayComponents = [
  { type: 'table', label: '表格', icon: TableOutlined },
  { type: 'chart', label: '图表', icon: BarChartOutlined },
  { type: 'text', label: '文本', icon: FileTextOutlined },
  { type: 'image', label: '图片', icon: PictureOutlined }
]

const formComponents = [
  { type: 'input', label: '输入框', icon: EditOutlined },
  { type: 'select', label: '下拉框', icon: DownOutlined },
  { type: 'date', label: '日期', icon: CalendarOutlined },
  { type: 'upload', label: '上传', icon: UploadOutlined }
]

const dataComponents = [
  { type: 'datatable', label: '数据表格', icon: DatabaseOutlined },
  { type: 'trend', label: '趋势图', icon: LineChartOutlined },
  { type: 'pie', label: '饼图', icon: PieChartOutlined },
  { type: 'stat', label: '统计卡片', icon: DashboardOutlined },
  { type: 'info', label: '信息卡片', icon: UserOutlined }
]

// 模板定义
const templates = [
  {
    id: 'dashboard',
    name: '数据看板',
    icon: '📊',
    components: [
      {
        type: 'stat',
        title: '总销售额',
        iconName: 'DollarOutlined',
        span: 2,
        value: '¥285万',
        unit: '元',
        valueColor: '#1890ff'
      },
      {
        type: 'stat',
        title: '订单数量',
        iconName: 'ShoppingOutlined',
        span: 2,
        value: '1,234',
        unit: '笔',
        valueColor: '#52c41a'
      },
      {
        type: 'chart',
        title: '销售趋势',
        iconName: 'LineChartOutlined',
        span: 4,
        chartType: 'line'
      },
      {
        type: 'table',
        title: '订单列表',
        iconName: 'TableOutlined',
        span: 4
      }
    ]
  },
  {
    id: 'form',
    name: '表单页面',
    icon: '📝',
    components: [
      {
        type: 'text',
        title: '表单说明',
        iconName: 'FileTextOutlined',
        span: 4,
        content: '请填写以下信息',
        fontSize: 14
      },
      {
        type: 'input',
        title: '基本信息',
        iconName: 'EditOutlined',
        span: 4
      }
    ]
  },
  {
    id: 'list',
    name: '列表页面',
    icon: '📋',
    components: [
      {
        type: 'datatable',
        title: '数据列表',
        iconName: 'DatabaseOutlined',
        span: 4
      }
    ]
  },
  {
    id: 'detail',
    name: '详情页面',
    icon: '📄',
    components: [
      {
        type: 'info',
        title: '客户信息',
        iconName: 'UserOutlined',
        span: 4,
        fields: [
          { label: '客户名称', value: 'XX医药有限公司' },
          { label: '客户等级', value: 'VIP' },
          { label: '联系人', value: '张三' },
          { label: '联系电话', value: '138xxxx8888' }
        ]
      },
      {
        type: 'table',
        title: '订单历史',
        iconName: 'TableOutlined',
        span: 4
      }
    ]
  }
]

// 页面状态
const device = ref('desktop')
const pageTitle = ref('客户360视图')
const layoutType = ref('grid')
const gridColumns = ref(4)
const dataSource = ref('customer_360')
const isDragOver = ref(false)
let componentIdCounter = 10

// 组件列表
const pageComponents = ref([
  {
    id: 1,
    type: 'info',
    title: '客户信息',
    icon: UserOutlined,
    iconName: 'UserOutlined',
    span: 2,
    bgColor: '#ffffff',
    fields: [
      { label: '客户名称', value: 'XX医药有限公司' },
      { label: '客户等级', value: 'VIP' }
    ]
  },
  {
    id: 2,
    type: 'stat',
    title: '累计订单',
    icon: ShoppingOutlined,
    iconName: 'ShoppingOutlined',
    span: 1,
    value: '25',
    unit: '笔',
    valueColor: '#1890ff',
    bgColor: '#ffffff'
  },
  {
    id: 3,
    type: 'stat',
    title: '订单金额',
    icon: DollarOutlined,
    iconName: 'DollarOutlined',
    span: 1,
    value: '¥285万',
    unit: '',
    valueColor: '#52c41a',
    bgColor: '#ffffff'
  },
  {
    id: 4,
    type: 'table',
    title: '订单历史',
    icon: TableOutlined,
    iconName: 'TableOutlined',
    span: 4,
    bgColor: '#ffffff'
  }
])

// 选中的组件
const selectedComponentIndex = ref(null)
const selectedComponent = computed(() => {
  if (selectedComponentIndex.value !== null && pageComponents.value[selectedComponentIndex.value]) {
    return pageComponents.value[selectedComponentIndex.value]
  }
  return null
})

// 发布相关
const publishVisible = ref(false)
const pageConfigJson = ref('')

// 计算属性
const deviceClass = computed(() => {
  return `device-${device.value}`
})

const gridStyle = computed(() => {
  const columnCount = device.value === 'mobile' ? 1 : device.value === 'tablet' ? 2 : gridColumns.value
  return {
    gridTemplateColumns: `repeat(${columnCount}, 1fr)`
  }
})

// 图标映射
const iconMap = {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TableOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  EditOutlined
}

// 获取宽度标记
const getSpanMarks = () => {
  const marks = {}
  for (let i = 1; i <= gridColumns.value; i++) {
    marks[i] = i.toString()
  }
  return marks
}

// 组件渲染器
const getComponentRenderer = (type) => {
  const renderers = {
    stat: (props) => {
      const comp = props.component
      return h('div', {
        style: {
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 12px'
        }
      }, [
        h('div', {
          style: {
            fontSize: '40px',
            fontWeight: '700',
            color: comp.valueColor || '#1890ff',
            marginBottom: '4px',
            lineHeight: '1.1'
          }
        }, comp.value || '0'),
        comp.unit && h('div', {
          style: {
            color: '#999',
            fontSize: '12px',
            marginTop: '2px'
          }
        }, comp.unit)
      ])
    },
    info: (props) => {
      const comp = props.component
      const fields = comp.fields || []
      return h('div', {
        style: {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0'
        }
      }, fields.map((field, index) =>
        h('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 8px',
            borderBottom: index < fields.length - 1 ? '1px solid #f0f0f0' : 'none'
          }
        }, [
          h('span', {
            style: {
              color: '#666',
              fontSize: '13px',
              flex: '0 0 auto',
              marginRight: '12px'
            }
          }, field.label + ':'),
          h('span', {
            style: {
              fontWeight: '600',
              color: '#333',
              fontSize: '14px',
              textAlign: 'right',
              flex: '1 1 auto',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }, field.value)
        ])
      ))
    },
    table: () => {
      return h('div', { style: { width: '100%', overflow: 'auto', maxHeight: '400px' } }, [
        h('table', {
          class: 'demo-table',
          style: {
            width: '100%',
            fontSize: '12px',
            borderCollapse: 'collapse',
            tableLayout: 'fixed'
          }
        }, [
          h('thead', [
            h('tr', [
              h('th', {
                style: {
                  padding: '10px 8px',
                  background: '#fafafa',
                  textAlign: 'left',
                  borderBottom: '2px solid #e8e8e8',
                  fontWeight: '600',
                  color: '#333',
                  width: '35%'
                }
              }, '订单号'),
              h('th', {
                style: {
                  padding: '10px 8px',
                  background: '#fafafa',
                  textAlign: 'left',
                  borderBottom: '2px solid #e8e8e8',
                  fontWeight: '600',
                  color: '#333',
                  width: '25%'
                }
              }, '金额'),
              h('th', {
                style: {
                  padding: '10px 8px',
                  background: '#fafafa',
                  textAlign: 'left',
                  borderBottom: '2px solid #e8e8e8',
                  fontWeight: '600',
                  color: '#333',
                  width: '20%'
                }
              }, '状态'),
              h('th', {
                style: {
                  padding: '10px 8px',
                  background: '#fafafa',
                  textAlign: 'left',
                  borderBottom: '2px solid #e8e8e8',
                  fontWeight: '600',
                  color: '#333',
                  width: '20%'
                }
              }, '时间')
            ])
          ]),
          h('tbody', [
            h('tr', [
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#333' } }, 'ORD20251211001'),
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#333' } }, '¥128,000'),
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0' } }, h('span', { style: { color: '#52c41a', background: '#f6ffed', padding: '2px 8px', borderRadius: '2px', fontSize: '11px' } }, '已确认')),
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#666' } }, '2025-12-11')
            ]),
            h('tr', [
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#333' } }, 'ORD20251210001'),
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#333' } }, '¥95,000'),
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0' } }, h('span', { style: { color: '#1890ff', background: '#e6f7ff', padding: '2px 8px', borderRadius: '2px', fontSize: '11px' } }, '已发货')),
              h('td', { style: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#666' } }, '2025-12-10')
            ])
          ])
        ])
      ])
    },
    chart: () => {
      return h('div', {
        style: {
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: '4px',
          minHeight: '180px',
          maxHeight: '180px'
        }
      }, [
        h(BarChartOutlined, { style: { fontSize: '48px', color: '#d9d9d9' } })
      ])
    },
    text: (props) => {
      const comp = props.component
      return h('div', {
        style: {
          fontSize: `${comp.fontSize || 14}px`,
          lineHeight: '1.6',
          wordBreak: 'break-word',
          padding: '4px 0'
        }
      }, comp.content || '文本内容')
    },
    datatable: () => {
      return h('div', {
        style: {
          padding: '16px',
          textAlign: 'center',
          color: '#999'
        }
      }, [
        h(DatabaseOutlined, { style: { fontSize: '32px', marginBottom: '8px' } }),
        h('div', '数据表格组件')
      ])
    },
    default: () => {
      return h('div', {
        style: { textAlign: 'center', padding: '20px', color: '#999' }
      }, '组件预览')
    }
  }

  return renderers[type] || renderers.default
}

// 拖拽处理
const handleDragStart = (event, component) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('component', JSON.stringify(component))
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  try {
    const componentData = JSON.parse(event.dataTransfer.getData('component'))

    // 创建新组件
    const newComponent = {
      id: componentIdCounter++,
      type: componentData.type,
      title: componentData.label,
      icon: componentData.icon,
      iconName: componentData.icon.name || 'TableOutlined',
      span: 2,
      bgColor: '#ffffff'
    }

    // 根据类型添加默认属性
    if (componentData.type === 'stat') {
      newComponent.value = '0'
      newComponent.unit = ''
      newComponent.valueColor = '#1890ff'
    } else if (componentData.type === 'info') {
      newComponent.fields = [
        { label: '字段1', value: '值1' },
        { label: '字段2', value: '值2' }
      ]
    } else if (componentData.type === 'text') {
      newComponent.content = '文本内容'
      newComponent.fontSize = 14
    }

    pageComponents.value.push(newComponent)
    message.success(`已添加 ${componentData.label}`)

    // 自动选中新添加的组件
    selectedComponentIndex.value = pageComponents.value.length - 1
  } catch (error) {
    console.error('拖拽添加失败:', error)
  }
}

// 选择组件
const selectComponent = (index) => {
  selectedComponentIndex.value = index
}

// 组件操作
const moveComponentUp = (index) => {
  if (index > 0) {
    const temp = pageComponents.value[index]
    pageComponents.value[index] = pageComponents.value[index - 1]
    pageComponents.value[index - 1] = temp

    if (selectedComponentIndex.value === index) {
      selectedComponentIndex.value = index - 1
    } else if (selectedComponentIndex.value === index - 1) {
      selectedComponentIndex.value = index
    }

    message.success('组件已上移')
  }
}

const moveComponentDown = (index) => {
  if (index < pageComponents.value.length - 1) {
    const temp = pageComponents.value[index]
    pageComponents.value[index] = pageComponents.value[index + 1]
    pageComponents.value[index + 1] = temp

    if (selectedComponentIndex.value === index) {
      selectedComponentIndex.value = index + 1
    } else if (selectedComponentIndex.value === index + 1) {
      selectedComponentIndex.value = index
    }

    message.success('组件已下移')
  }
}

const copyComponent = (index) => {
  const originalComponent = pageComponents.value[index]
  const copiedComponent = {
    ...JSON.parse(JSON.stringify(originalComponent)),
    id: componentIdCounter++,
    title: `${originalComponent.title} (副本)`
  }

  pageComponents.value.splice(index + 1, 0, copiedComponent)
  message.success('组件已复制')
  selectedComponentIndex.value = index + 1
}

const confirmRemoveComponent = (index) => {
  const component = pageComponents.value[index]

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除组件"${component.title}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      removeComponent(index)
    }
  })
}

const removeComponent = (index) => {
  pageComponents.value.splice(index, 1)

  if (selectedComponentIndex.value === index) {
    selectedComponentIndex.value = null
  } else if (selectedComponentIndex.value > index) {
    selectedComponentIndex.value--
  }

  message.success('组件已删除')
}

// 信息字段管理
const addInfoField = () => {
  if (selectedComponent.value && selectedComponent.value.type === 'info') {
    if (!selectedComponent.value.fields) {
      selectedComponent.value.fields = []
    }
    selectedComponent.value.fields.push({ label: '新字段', value: '值' })
  }
}

const removeInfoField = (index) => {
  if (selectedComponent.value && selectedComponent.value.fields) {
    selectedComponent.value.fields.splice(index, 1)
  }
}

// 模板加载
const loadTemplate = (template) => {
  Modal.confirm({
    title: '加载模板',
    content: `确定要加载"${template.name}"模板吗？当前页面内容将被替换。`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      pageTitle.value = template.name
      pageComponents.value = template.components.map(comp => ({
        ...comp,
        id: componentIdCounter++,
        icon: iconMap[comp.iconName] || TableOutlined
      }))
      selectedComponentIndex.value = null
      message.success(`已加载模板：${template.name}`)
    }
  })
}

// 发布到应用中心
const publish = () => {
  if (pageComponents.value.length === 0) {
    message.warning('页面为空，请先添加组件')
    return
  }

  Modal.confirm({
    title: '发布页面到应用中心',
    content: `确定要将「${pageTitle.value}」发布到应用中心吗？发布后所有员工都可以查看和使用此页面。`,
    okText: '发布',
    cancelText: '取消',
    onOk: () => {
      // 模拟发布逻辑
      const config = {
        title: pageTitle.value,
        layout: {
          type: layoutType.value,
          columns: gridColumns.value
        },
        dataSource: dataSource.value,
        components: pageComponents.value.map(comp => ({
          id: comp.id,
          type: comp.type,
          title: comp.title,
          iconName: comp.iconName,
          span: comp.span,
          bgColor: comp.bgColor,
          ...(comp.value && { value: comp.value }),
          ...(comp.unit && { unit: comp.unit }),
          ...(comp.valueColor && { valueColor: comp.valueColor }),
          ...(comp.fields && { fields: comp.fields }),
          ...(comp.content && { content: comp.content }),
          ...(comp.fontSize && { fontSize: comp.fontSize })
        })),
        device: device.value
      }

      message.success('🎉 页面已成功发布到应用中心！')
      message.info('提示：返回应用中心即可查看和使用', 3)
    }
  })
}

// 复制配置
const copyConfig = () => {
  navigator.clipboard.writeText(pageConfigJson.value).then(() => {
    message.success('配置已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}

// 返回主界面
const goBack = () => {
  router.push('/overview')
}
</script>

<style scoped>
.page-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-bottom: 2px solid rgba(216, 30, 6, 0.2);
  color: #262626;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.builder-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #d81e06 0%, transparent 50%, #d81e06 100%);
  opacity: 0.3;
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

.builder-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.component-panel {
  width: 260px;
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

.component-panel :deep(.ant-tabs) {
  padding: 0;
}

.component-panel :deep(.ant-tabs-nav) {
  padding: 0 12px;
  margin-bottom: 0;
}

.component-panel :deep(.ant-tabs-content) {
  padding: 0;
}

.component-panel :deep(.ant-collapse) {
  padding: 0 8px;
}

.component-panel :deep(.ant-collapse-header) {
  padding: 10px 12px !important;
  font-weight: 500;
  color: #262626;
}

.component-panel :deep(.ant-collapse-content-box) {
  padding: 8px 4px !important;
}

.drag-hint-top {
  padding: 8px 12px;
  margin: 12px;
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.08) 0%, rgba(216, 30, 6, 0.04) 100%);
  border: 1px dashed #d81e06;
  border-radius: 6px;
  font-size: 12px;
  color: #d81e06;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
}

.comp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 4px 8px 12px 8px;
}

.comp-item {
  padding: 12px 8px;
  background: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  cursor: move;
  transition: all 0.3s;
  user-select: none;
}

.comp-item:hover {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.05) 0%, rgba(216, 30, 6, 0.02) 100%);
  border-color: #d81e06;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(216, 30, 6, 0.15);
}

.comp-item:active {
  transform: scale(0.95);
}

.template-list {
  padding: 12px 16px;
}

.template-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.05) 0%, rgba(216, 30, 6, 0.02) 100%);
  border-left: 3px solid #d81e06;
  padding-left: 9px;
  transform: translateX(4px);
}

.canvas-panel {
  flex: 1;
  overflow: auto;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.canvas-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.device-desktop {
  width: 1200px;
  min-height: 800px;
}

.device-tablet {
  width: 768px;
  min-height: 1024px;
}

.device-mobile {
  width: 375px;
  min-height: 667px;
}

.page-canvas {
  padding: 32px 24px;
  flex: 1;
  overflow-y: auto;
  transition: background 0.3s;
}

.page-canvas.drag-over {
  background: rgba(216, 30, 6, 0.03);
  outline: 2px dashed #d81e06;
  outline-offset: -8px;
}

.page-header-demo {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.page-header-demo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  line-height: 1.4;
}

.page-grid {
  display: grid;
  gap: 16px;
  transition: grid-template-columns 0.3s;
  align-items: start;
  grid-auto-rows: auto;
}

.grid-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  animation: slideIn 0.3s ease-out;
}

.grid-item:hover {
  transform: translateY(-2px);
}

.grid-item.component-selected {
  outline: 2px solid #d81e06;
  outline-offset: 2px;
  border-radius: 4px;
  box-shadow: 0 0 0 4px rgba(216, 30, 6, 0.1);
}

.widget-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.grid-item:hover .widget-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.widget-header {
  padding: 12px 14px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 48px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.header-left > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.widget-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
}

.component-actions-header {
  display: flex;
  gap: 6px;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  flex-shrink: 0;
}

.grid-item:hover .component-actions-header,
.grid-item.component-selected .component-actions-header {
  opacity: 1;
}

.component-actions-header > * {
  cursor: pointer;
  font-size: 15px;
  color: #8c8c8c;
  transition: all 0.2s;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-actions-header > *:hover {
  color: #d81e06;
  background: rgba(216, 30, 6, 0.1);
}

.component-actions-header > *.action-disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.component-actions-header > *.action-disabled:hover {
  color: #d9d9d9;
  background: transparent;
}

.empty-canvas {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  grid-column: 1 / -1;
}

.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}

.property-panel h3 {
  margin-bottom: 16px;
  color: #333;
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 滚动条美化 */
.component-panel::-webkit-scrollbar,
.property-panel::-webkit-scrollbar,
.page-canvas::-webkit-scrollbar {
  width: 6px;
}

.component-panel::-webkit-scrollbar-thumb,
.property-panel::-webkit-scrollbar-thumb,
.page-canvas::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.component-panel::-webkit-scrollbar-thumb:hover,
.property-panel::-webkit-scrollbar-thumb:hover,
.page-canvas::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .component-panel {
    width: 220px;
  }

  .property-panel {
    width: 280px;
  }
}
</style>
