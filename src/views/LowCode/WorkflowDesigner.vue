<template>
  <div class="workflow-designer">
    <div class="designer-header">
      <div class="header-title">
        <BranchesOutlined style="font-size: 24px; color: white" />
        <span>工作流设计器</span>
        <a-tag color="blue" style="margin-left: 12px;">可视化流程</a-tag>
        <a-tag color="green">8+ 节点类型</a-tag>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <DragOutlined style="font-size: 16px; color: #262626;" />
          <span>拖拽式设计</span>
        </div>
        <div class="stat-item">
          <LinkOutlined style="font-size: 16px; color: #262626;" />
          <span>节点连接</span>
        </div>
        <div class="stat-item">
          <CodeOutlined style="font-size: 16px; color: #262626;" />
          <span>流程验证</span>
        </div>
      </div>
      <a-space>
        <a-button @click="goBack" size="small">
          <ArrowLeftOutlined /> 返回
        </a-button>
        <a-button @click="clearCanvas" danger size="small">
          <DeleteOutlined /> 清空
        </a-button>
        <a-button
          @click="toggleConnectionMode"
          :type="connectionMode ? 'primary' : 'default'"
          size="small"
        >
          <LinkOutlined /> {{ connectionMode ? '退出' : '连接' }}
        </a-button>
        <a-button @click="zoomOut" size="small">
          <ZoomOutOutlined />
        </a-button>
        <a-button @click="zoomIn" size="small">
          <ZoomInOutlined />
        </a-button>
        <a-button @click="validateFlow" size="small">
          <CheckCircleOutlined /> 验证
        </a-button>
        <a-button @click="saveFlow" size="small">
          <SaveOutlined /> 保存
        </a-button>
        <a-button type="primary" @click="saveAndPublish" size="small">
          <CloudUploadOutlined /> 保存并发布
        </a-button>
      </a-space>
    </div>

    <div class="designer-container">
      <!-- 左侧节点库 -->
      <div class="node-panel">
        <div class="panel-header">
          <h3>节点库</h3>
          <a-badge :count="8" :number-style="{ backgroundColor: '#52c41a' }" />
        </div>
        <div class="drag-hint">
          <DragOutlined /> 拖拽节点到画布
        </div>
        <div class="node-categories">
          <div class="node-category">
            <h4>基础节点</h4>
            <div
              class="node-item start-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'start')"
            >
              <PlayCircleOutlined /> 开始
            </div>
            <div
              class="node-item end-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'end')"
            >
              <CheckCircleOutlined /> 结束
            </div>
          </div>

          <div class="node-category">
            <h4>审批节点</h4>
            <div
              class="node-item approval-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'approval')"
            >
              <AuditOutlined /> 审批
            </div>
            <div
              class="node-item countersign-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'countersign')"
            >
              <UsergroupAddOutlined /> 会签
            </div>
          </div>

          <div class="node-category">
            <h4>条件节点</h4>
            <div
              class="node-item condition-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'condition')"
            >
              <BranchesOutlined /> 条件分支
            </div>
            <div
              class="node-item parallel-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'parallel')"
            >
              <ForkOutlined /> 并行分支
            </div>
          </div>

          <div class="node-category">
            <h4>动作节点</h4>
            <div
              class="node-item action-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'api')"
            >
              <ApiOutlined /> API调用
            </div>
            <div
              class="node-item notify-node"
              draggable="true"
              @dragstart="handleDragStart($event, 'notify')"
            >
              <NotificationOutlined /> 发送通知
            </div>
          </div>
        </div>
      </div>

      <!-- 中间流程画布 -->
      <div class="canvas-panel">
        <div
          class="canvas-content"
          @drop="handleCanvasDrop"
          @dragover="handleCanvasDragOver"
          @dragleave="handleCanvasDragLeave"
          @click="handleCanvasClick"
        >
          <div
            class="workflow-canvas"
            :style="{ transform: `scale(${zoom})` }"
            ref="canvasRef"
          >
            <!-- 拖拽预览 -->
            <div
              v-if="dragPreview.show"
              class="drag-preview"
              :style="{
                left: dragPreview.x + 'px',
                top: dragPreview.y + 'px'
              }"
            >
              <component :is="getNodeIcon(dragPreview.type)" />
              {{ getNodeLabel(dragPreview.type) }}
            </div>

            <!-- SVG 连接线层 -->
            <svg class="connection-layer">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#1890ff" />
                </marker>
              </defs>
              <line
                v-for="connection in connections"
                :key="connection.id"
                :x1="getNodeCenter(connection.source).x"
                :y1="getNodeCenter(connection.source).y"
                :x2="getNodeCenter(connection.target).x"
                :y2="getNodeCenter(connection.target).y"
                stroke="#1890ff"
                stroke-width="2"
                marker-end="url(#arrowhead)"
                class="connection-line"
                @click.stop="deleteConnection(connection.id)"
              />
            </svg>

            <!-- 空画布提示 -->
            <div v-if="nodes.length === 0" class="empty-canvas">
              <InboxOutlined style="font-size: 48px; color: #ccc" />
              <p>从左侧拖拽节点到此处开始设计流程</p>
            </div>

            <!-- 渲染节点 -->
            <div
              v-for="node in nodes"
              :key="node.id"
              :class="[
                'flow-node',
                `${node.type}-node-display`,
                { selected: selectedNode?.id === node.id },
                { dragging: draggedNode?.id === node.id }
              ]"
              :style="{
                left: node.x + 'px',
                top: node.y + 'px'
              }"
              @mousedown.stop="handleNodeMouseDown($event, node)"
              @click.stop="handleNodeClick(node)"
            >
              <!-- 删除按钮 -->
              <div class="node-delete" @click.stop="deleteNode(node.id)">
                <CloseOutlined />
              </div>

              <!-- 节点内容 -->
              <component :is="getNodeIcon(node.type)" style="font-size: 20px" />
              <div class="node-title">{{ node.label }}</div>
              <div v-if="node.config" class="node-config">
                {{ getConfigDisplay(node) }}
              </div>

              <!-- 连接点 -->
              <div
                v-if="connectionMode"
                class="connection-point"
                @click.stop="handleConnectionPoint(node)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3>{{ selectedNode ? '节点配置' : '属性面板' }}</h3>

        <div v-if="!selectedNode" class="no-selection">
          <p>点击画布中的节点进行配置</p>
        </div>

        <a-form v-else layout="vertical" size="small">
          <a-form-item label="节点类型">
            <a-input :value="getNodeTypeLabel(selectedNode.type)" disabled />
          </a-form-item>

          <a-form-item label="节点名称">
            <a-input
              v-model:value="selectedNode.label"
              placeholder="请输入节点名称"
            />
          </a-form-item>

          <!-- 审批节点配置 -->
          <template v-if="selectedNode.type === 'approval' || selectedNode.type === 'countersign'">
            <a-form-item label="审批人类型">
              <a-select v-model:value="selectedNode.config.approverType">
                <a-select-option value="dynamic">动态审批人</a-select-option>
                <a-select-option value="role">角色审批</a-select-option>
                <a-select-option value="specific">指定人员</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="审批人规则">
              <a-select v-model:value="selectedNode.config.approverRule">
                <a-select-option value="direct_manager">提交人的直属上级</a-select-option>
                <a-select-option value="department_manager">部门经理</a-select-option>
                <a-select-option value="hr_manager">人事经理</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="超时设置">
              <a-input-number
                v-model:value="selectedNode.config.timeout"
                :min="1"
                suffix="小时"
                style="width: 100%"
              />
            </a-form-item>
          </template>

          <!-- 条件节点配置 -->
          <template v-if="selectedNode.type === 'condition'">
            <a-form-item label="条件表达式">
              <a-textarea
                v-model:value="selectedNode.config.expression"
                placeholder="例如: amount > 5000"
                :rows="3"
              />
            </a-form-item>
          </template>

          <!-- API节点配置 -->
          <template v-if="selectedNode.type === 'api'">
            <a-form-item label="API地址">
              <a-input
                v-model:value="selectedNode.config.url"
                placeholder="例如: /api/orders"
              />
            </a-form-item>
            <a-form-item label="请求方法">
              <a-select v-model:value="selectedNode.config.method">
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
                <a-select-option value="PUT">PUT</a-select-option>
                <a-select-option value="DELETE">DELETE</a-select-option>
              </a-select>
            </a-form-item>
          </template>

          <!-- 通知节点配置 -->
          <template v-if="selectedNode.type === 'notify'">
            <a-form-item label="通知渠道">
              <a-select v-model:value="selectedNode.config.channel">
                <a-select-option value="email">邮件</a-select-option>
                <a-select-option value="dingtalk">钉钉</a-select-option>
                <a-select-option value="wechat">企业微信</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="接收人">
              <a-input
                v-model:value="selectedNode.config.receiver"
                placeholder="例如: 申请人"
              />
            </a-form-item>
          </template>

          <a-form-item label="节点位置">
            <a-space>
              <a-input-number
                v-model:value="selectedNode.x"
                :min="0"
                placeholder="X"
                style="width: 100px"
              />
              <a-input-number
                v-model:value="selectedNode.y"
                :min="0"
                placeholder="Y"
                style="width: 100px"
              />
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- 流程配置预览Modal -->
    <a-modal
      v-model:open="showConfigModal"
      title="流程配置预览"
      width="800px"
      :footer="null"
    >
      <a-textarea
        :value="JSON.stringify(exportConfig, null, 2)"
        :rows="20"
        readonly
        style="font-family: 'Courier New', monospace; font-size: 12px"
      />
      <div style="margin-top: 16px; text-align: right">
        <a-button type="primary" @click="copyConfig">
          <CopyOutlined /> 复制配置
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  BranchesOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  AuditOutlined,
  UsergroupAddOutlined,
  ForkOutlined,
  ApiOutlined,
  NotificationOutlined,
  DeleteOutlined,
  LinkOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CloseOutlined,
  InboxOutlined,
  CopyOutlined,
  DragOutlined,
  CodeOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 画布缩放
const zoom = ref(1)
const canvasRef = ref(null)

// 节点数据
const nodes = ref([])
const connections = ref([])
const selectedNode = ref(null)
const nodeIdCounter = ref(1)
const connectionIdCounter = ref(1)

// 拖拽状态
const draggedNodeType = ref(null)
const draggedNode = ref(null)
const dragPreview = reactive({
  show: false,
  x: 0,
  y: 0,
  type: ''
})

// 连接模式
const connectionMode = ref(false)
const connectionSource = ref(null)

// 节点拖动状态
const nodeDragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  nodeStartX: 0,
  nodeStartY: 0
})

// 配置导出
const showConfigModal = ref(false)
const exportConfig = ref({})

// 节点类型配置
const nodeTypeConfig = {
  start: {
    label: '开始',
    icon: PlayCircleOutlined,
    color: 'start'
  },
  end: {
    label: '结束',
    icon: CheckCircleOutlined,
    color: 'end'
  },
  approval: {
    label: '审批',
    icon: AuditOutlined,
    color: 'approval'
  },
  countersign: {
    label: '会签',
    icon: UsergroupAddOutlined,
    color: 'approval'
  },
  condition: {
    label: '条件分支',
    icon: BranchesOutlined,
    color: 'condition'
  },
  parallel: {
    label: '并行分支',
    icon: ForkOutlined,
    color: 'condition'
  },
  api: {
    label: 'API调用',
    icon: ApiOutlined,
    color: 'action'
  },
  notify: {
    label: '发送通知',
    icon: NotificationOutlined,
    color: 'action'
  }
}

// 从左侧面板拖拽节点
const handleDragStart = (event, type) => {
  draggedNodeType.value = type
  event.dataTransfer.effectAllowed = 'copy'
}

// 画布拖拽悬停
const handleCanvasDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'

  const rect = event.currentTarget.getBoundingClientRect()
  dragPreview.x = (event.clientX - rect.left) / zoom.value - 60
  dragPreview.y = (event.clientY - rect.top) / zoom.value - 40
  dragPreview.type = draggedNodeType.value
  dragPreview.show = true
}

const handleCanvasDragLeave = (event) => {
  dragPreview.show = false
}

// 画布放置节点
const handleCanvasDrop = (event) => {
  event.preventDefault()
  dragPreview.show = false

  if (!draggedNodeType.value) return

  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left) / zoom.value - 60
  const y = (event.clientY - rect.top) / zoom.value - 40

  createNode(draggedNodeType.value, x, y)
  draggedNodeType.value = null
}

// 创建节点
const createNode = (type, x, y) => {
  const config = nodeTypeConfig[type]
  const node = {
    id: `node_${nodeIdCounter.value++}`,
    type,
    label: config.label,
    x,
    y,
    config: getDefaultConfig(type)
  }

  nodes.value.push(node)
  message.success(`已添加 ${config.label} 节点`)
}

// 获取节点默认配置
const getDefaultConfig = (type) => {
  switch (type) {
    case 'approval':
    case 'countersign':
      return {
        approverType: 'dynamic',
        approverRule: 'direct_manager',
        timeout: 24
      }
    case 'condition':
      return {
        expression: ''
      }
    case 'api':
      return {
        url: '',
        method: 'POST'
      }
    case 'notify':
      return {
        channel: 'dingtalk',
        receiver: '申请人'
      }
    default:
      return {}
  }
}

// 节点点击选择
const handleNodeClick = (node) => {
  if (connectionMode.value) return
  selectedNode.value = node
}

// 画布点击取消选择
const handleCanvasClick = (event) => {
  if (event.target.classList.contains('canvas-content') ||
      event.target.classList.contains('workflow-canvas')) {
    selectedNode.value = null
  }
}

// 节点拖动开始
const handleNodeMouseDown = (event, node) => {
  if (connectionMode.value) return

  draggedNode.value = node
  nodeDragState.isDragging = true
  nodeDragState.startX = event.clientX
  nodeDragState.startY = event.clientY
  nodeDragState.nodeStartX = node.x
  nodeDragState.nodeStartY = node.y

  document.addEventListener('mousemove', handleNodeMouseMove)
  document.addEventListener('mouseup', handleNodeMouseUp)
}

const handleNodeMouseMove = (event) => {
  if (!nodeDragState.isDragging || !draggedNode.value) return

  const deltaX = (event.clientX - nodeDragState.startX) / zoom.value
  const deltaY = (event.clientY - nodeDragState.startY) / zoom.value

  draggedNode.value.x = Math.max(0, nodeDragState.nodeStartX + deltaX)
  draggedNode.value.y = Math.max(0, nodeDragState.nodeStartY + deltaY)
}

const handleNodeMouseUp = () => {
  nodeDragState.isDragging = false
  draggedNode.value = null

  document.removeEventListener('mousemove', handleNodeMouseMove)
  document.removeEventListener('mouseup', handleNodeMouseUp)
}

// 删除节点
const deleteNode = (nodeId) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除节点将同时删除相关连线，是否继续？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      nodes.value = nodes.value.filter(n => n.id !== nodeId)
      connections.value = connections.value.filter(
        c => c.source !== nodeId && c.target !== nodeId
      )
      if (selectedNode.value?.id === nodeId) {
        selectedNode.value = null
      }
      message.success('节点已删除')
    }
  })
}

// 连接模式切换
const toggleConnectionMode = () => {
  connectionMode.value = !connectionMode.value
  connectionSource.value = null

  if (connectionMode.value) {
    message.info('连接模式已启用，点击源节点和目标节点建立连接')
  } else {
    message.info('连接模式已关闭')
  }
}

// 处理连接点点击
const handleConnectionPoint = (node) => {
  if (!connectionSource.value) {
    connectionSource.value = node
    message.info(`已选择源节点: ${node.label}，请选择目标节点`)
  } else {
    if (connectionSource.value.id === node.id) {
      message.warning('不能连接到自己')
      return
    }

    // 检查是否已存在连接
    const exists = connections.value.some(
      c => c.source === connectionSource.value.id && c.target === node.id
    )

    if (exists) {
      message.warning('该连接已存在')
    } else {
      connections.value.push({
        id: `conn_${connectionIdCounter.value++}`,
        source: connectionSource.value.id,
        target: node.id
      })
      message.success(`已创建连接: ${connectionSource.value.label} → ${node.label}`)
    }

    connectionSource.value = null
  }
}

// 删除连接
const deleteConnection = (connId) => {
  connections.value = connections.value.filter(c => c.id !== connId)
  message.success('连接已删除')
}

// 获取节点中心点坐标
const getNodeCenter = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  return {
    x: node.x + 90, // 节点宽度的一半
    y: node.y + 50  // 节点高度的一半
  }
}

// 返回主界面
const goBack = () => {
  router.push('/overview')
}

// 清空画布
const clearCanvas = () => {
  Modal.confirm({
    title: '确认清空',
    content: '清空画布将删除所有节点和连线，是否继续？',
    okText: '清空',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      nodes.value = []
      connections.value = []
      selectedNode.value = null
      message.success('画布已清空')
    }
  })
}

// 缩放功能
const zoomIn = () => {
  if (zoom.value < 1.5) {
    zoom.value = Math.min(1.5, zoom.value + 0.1)
    message.info(`缩放: ${Math.round(zoom.value * 100)}%`)
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(0.5, zoom.value - 0.1)
    message.info(`缩放: ${Math.round(zoom.value * 100)}%`)
  }
}

// 验证流程
const validateFlow = () => {
  const errors = []

  // 检查是否有节点
  if (nodes.value.length === 0) {
    errors.push('画布为空，请添加节点')
  }

  // 检查开始节点
  const startNodes = nodes.value.filter(n => n.type === 'start')
  if (startNodes.length === 0) {
    errors.push('缺少开始节点')
  } else if (startNodes.length > 1) {
    errors.push('开始节点只能有一个')
  }

  // 检查结束节点
  const endNodes = nodes.value.filter(n => n.type === 'end')
  if (endNodes.length === 0) {
    errors.push('缺少结束节点')
  }

  // 检查孤立节点
  const connectedNodes = new Set()
  connections.value.forEach(conn => {
    connectedNodes.add(conn.source)
    connectedNodes.add(conn.target)
  })

  const isolatedNodes = nodes.value.filter(
    n => !connectedNodes.has(n.id) && n.type !== 'start' && n.type !== 'end'
  )

  if (isolatedNodes.length > 0) {
    errors.push(`存在 ${isolatedNodes.length} 个未连接的节点`)
  }

  // 显示验证结果
  if (errors.length > 0) {
    Modal.error({
      title: '流程验证失败',
      content: errors.join('\n')
    })
  } else {
    Modal.success({
      title: '流程验证通过',
      content: '流程结构完整，所有节点已正确连接'
    })
  }
}

// 保存流程
const saveFlow = () => {
  exportConfig.value = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    nodes: nodes.value.map(node => ({
      id: node.id,
      type: node.type,
      label: node.label,
      position: { x: node.x, y: node.y },
      config: node.config
    })),
    connections: connections.value.map(conn => ({
      id: conn.id,
      source: conn.source,
      target: conn.target
    }))
  }

  showConfigModal.value = true
}

// 保存并发布到应用中心
const saveAndPublish = () => {
  if (nodes.value.length === 0) {
    message.warning('流程为空，请先添加节点')
    return
  }

  // 验证流程
  const hasStart = nodes.value.some(n => n.type === 'start')
  const hasEnd = nodes.value.some(n => n.type === 'end')

  if (!hasStart || !hasEnd) {
    message.warning('流程必须包含开始节点和结束节点')
    return
  }

  Modal.confirm({
    title: '发布流程到应用中心',
    content: '确定要将此流程发布到应用中心吗？发布后所有员工都可以使用此流程。',
    okText: '发布',
    cancelText: '取消',
    onOk: () => {
      // 模拟发布逻辑
      const config = {
        version: '1.0',
        nodes: nodes.value.map(node => ({
          id: node.id,
          type: node.type,
          label: node.label
        })),
        connections: connections.value
      }

      message.success('🎉 流程已成功发布到应用中心！')
      message.info('提示：返回应用中心即可查看和使用', 3)
    }
  })
}

// 复制配置
const copyConfig = () => {
  const configText = JSON.stringify(exportConfig.value, null, 2)
  navigator.clipboard.writeText(configText).then(() => {
    message.success('配置已复制到剪贴板')
  })
}

// 辅助函数
const getNodeIcon = (type) => {
  return nodeTypeConfig[type]?.icon || PlayCircleOutlined
}

const getNodeLabel = (type) => {
  return nodeTypeConfig[type]?.label || type
}

const getNodeTypeLabel = (type) => {
  return nodeTypeConfig[type]?.label || type
}

const getConfigDisplay = (node) => {
  const { type, config } = node

  switch (type) {
    case 'approval':
    case 'countersign':
      return `审批人: ${config.approverRule === 'direct_manager' ? '直属上级' : '部门经理'}`
    case 'condition':
      return config.expression ? `条件: ${config.expression}` : '未配置条件'
    case 'api':
      return config.url ? `${config.method} ${config.url}` : '未配置API'
    case 'notify':
      return `${config.channel === 'dingtalk' ? '钉钉' : '邮件'} → ${config.receiver}`
    default:
      return ''
  }
}
</script>

<style scoped>
.workflow-designer {
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
  border-bottom: 2px solid #0ea07a;
  color: #262626;
  z-index: 10;
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

/* 左侧节点面板 */
.node-panel {
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

.node-panel h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.drag-hint {
  padding: 8px 12px;
  background: #e6fff9;
  border: 1px dashed #52c41a;
  border-radius: 4px;
  font-size: 12px;
  color: #52c41a;
  text-align: center;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.node-category {
  margin-bottom: 20px;
}

.node-category h4 {
  font-size: 13px;
  color: #999;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: move;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  user-select: none;
}

.node-item:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  transform: translateX(4px);
}

.node-item:active {
  opacity: 0.6;
}

/* 中间画布区域 */
.canvas-panel {
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
  position: relative;
}

.canvas-content {
  min-height: 100%;
  min-width: 100%;
  padding: 40px;
  position: relative;
}

.workflow-canvas {
  position: relative;
  min-width: 2000px;
  min-height: 1500px;
  background: white;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 8px;
  transform-origin: top left;
  transition: transform 0.2s;
}

/* 空画布提示 */
.empty-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  pointer-events: none;
}

.empty-canvas p {
  margin-top: 12px;
  font-size: 14px;
}

/* 拖拽预览 */
.drag-preview {
  position: absolute;
  padding: 12px 20px;
  background: rgba(24, 144, 255, 0.1);
  border: 2px dashed #1890ff;
  border-radius: 8px;
  color: #1890ff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  z-index: 1000;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* SVG 连接线层 */
.connection-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-line {
  pointer-events: stroke;
  cursor: pointer;
  transition: all 0.3s;
}

.connection-line:hover {
  stroke: #ff4d4f;
  stroke-width: 3;
}

/* 画布节点 */
.flow-node {
  position: absolute;
  background: white;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px 24px;
  text-align: center;
  min-width: 180px;
  cursor: move;
  transition: all 0.3s;
  user-select: none;
  z-index: 2;
}

.flow-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.flow-node.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
  z-index: 4;
}

.flow-node.dragging {
  opacity: 0.8;
  cursor: grabbing;
  z-index: 5;
}

/* 节点删除按钮 */
.node-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #ff4d4f;
  border-radius: 50%;
  color: #262626;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  z-index: 10;
}

.flow-node:hover .node-delete {
  display: flex;
}

.node-delete:hover {
  background: #ff7875;
  transform: scale(1.2);
}

/* 节点连接点 */
.connection-point {
  position: absolute;
  top: 50%;
  right: -12px;
  width: 20px;
  height: 20px;
  background: #1890ff;
  border: 2px solid white;
  border-radius: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  transition: all 0.3s;
  animation: ripple 1.5s infinite;
  z-index: 10;
}

@keyframes ripple {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(24, 144, 255, 0);
  }
}

.connection-point:hover {
  transform: translateY(-50%) scale(1.3);
  background: #40a9ff;
}

/* 节点内容 */
.node-title {
  margin-top: 8px;
  font-weight: 500;
  font-size: 14px;
}

.node-config {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.9;
}

/* 不同类型节点的颜色 */
.start-node-display {
  background: #ffffff;
  color: #262626;
  border: none;
}

.end-node-display {
  background: #ff7875;
  color: #ffffff;
  border: none;
}

.approval-node-display,
.countersign-node-display {
  background: #9254de;
  color: #ffffff;
  border: none;
}

.condition-node-display,
.parallel-node-display {
  background: #40a9ff;
  color: #ffffff;
  border: none;
}

.action-node-display,
.api-node-display,
.notify-node-display {
  background: #73d13d;
  color: #ffffff;
  border: none;
}

/* 右侧属性面板 */
.property-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}

.property-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.no-selection {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.no-selection p {
  margin: 0;
  font-size: 13px;
}

/* 滚动条样式 */
.node-panel::-webkit-scrollbar,
.property-panel::-webkit-scrollbar,
.canvas-panel::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.node-panel::-webkit-scrollbar-thumb,
.property-panel::-webkit-scrollbar-thumb,
.canvas-panel::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.node-panel::-webkit-scrollbar-thumb:hover,
.property-panel::-webkit-scrollbar-thumb:hover,
.canvas-panel::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .node-panel {
    width: 220px;
  }

  .property-panel {
    width: 280px;
  }
}
</style>
