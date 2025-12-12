<template>
  <div class="workflow-template-detail">
    <a-page-header
      :title="workflow?.name || '流程模板详情'"
      sub-title="查看流程模板详细信息"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-space>
          <a-button @click="viewHistory">
            <template #icon><HistoryOutlined /></template>
            执行记录
          </a-button>
          <a-button type="primary" @click="editWorkflow">
            <template #icon><EditOutlined /></template>
            编辑
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-area">
      <a-spin :spinning="loading">
        <a-row :gutter="16">
          <!-- 左侧：基本信息 -->
          <a-col :span="16">
            <a-card title="基本信息" :bordered="false" style="margin-bottom: 16px">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="流程名称" :span="2">
                  {{ workflow?.name }}
                </a-descriptions-item>
                <a-descriptions-item label="描述" :span="2">
                  {{ workflow?.description }}
                </a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-badge
                    :status="workflow?.status === 'active' ? 'success' : 'default'"
                    :text="workflow?.status === 'active' ? '已启用' : '未启用'"
                  />
                </a-descriptions-item>
                <a-descriptions-item label="节点数量">
                  <a-tag color="blue">{{ workflow?.nodeCount || 0 }} 个节点</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="绑定表单">
                  {{ workflow?.bindForm || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="执行次数">
                  {{ workflow?.execCount || 0 }} 次
                </a-descriptions-item>
                <a-descriptions-item label="创建时间">
                  {{ workflow?.createdAt || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="创建人">
                  {{ workflow?.creator || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="更新时间">
                  {{ workflow?.updatedAt || '-' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <!-- 流程节点配置 -->
            <a-card title="流程节点" :bordered="false">
              <a-table
                :columns="nodeColumns"
                :data-source="workflow?.nodes || []"
                :pagination="false"
                row-key="id"
              >
                <template #type="{ record }">
                  <a-tag :color="getNodeTypeColor(record.type)">
                    {{ getNodeTypeName(record.type) }}
                  </a-tag>
                </template>
                <template #approver="{ record }">
                  <a-tag v-for="user in record.approvers || []" :key="user">
                    {{ user }}
                  </a-tag>
                </template>
              </a-table>
            </a-card>
          </a-col>

          <!-- 右侧：统计信息和操作历史 -->
          <a-col :span="8">
            <a-card title="执行统计" :bordered="false" style="margin-bottom: 16px">
              <a-statistic
                title="总执行次数"
                :value="workflow?.execCount || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-statistic
                title="本月执行"
                :value="workflow?.monthlyExec || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-statistic
                title="今日执行"
                :value="workflow?.dailyExec || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-divider />
              <a-statistic
                title="平均处理时长"
                :value="workflow?.avgDuration || 0"
                suffix="小时"
              />
            </a-card>

            <a-card title="流程图" :bordered="false" style="margin-bottom: 16px">
              <div class="workflow-diagram">
                <div v-for="(node, index) in workflow?.nodes || []" :key="node.id" class="node-item">
                  <div class="node-box" :style="{ borderColor: getNodeTypeColor(node.type) }">
                    <div class="node-name">{{ node.name }}</div>
                    <div class="node-type">{{ getNodeTypeName(node.type) }}</div>
                  </div>
                  <div v-if="index < (workflow?.nodes?.length || 0) - 1" class="node-arrow">↓</div>
                </div>
              </div>
            </a-card>

            <a-card title="操作历史" :bordered="false">
              <a-timeline>
                <a-timeline-item v-for="(log, index) in operationLogs" :key="index">
                  <p style="margin: 0">{{ log.action }}</p>
                  <p style="margin: 0; font-size: 12px; color: #999">
                    {{ log.user }} - {{ log.time }}
                  </p>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </a-col>
        </a-row>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined, HistoryOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const workflow = ref(null)

// 表格列定义
const nodeColumns = [
  {
    title: '节点名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '节点类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    slots: { customRender: 'type' }
  },
  {
    title: '审批人',
    key: 'approver',
    width: 200,
    slots: { customRender: 'approver' }
  },
  {
    title: '处理规则',
    dataIndex: 'rule',
    key: 'rule',
    ellipsis: true
  }
]

// 操作日志
const operationLogs = ref([
  { action: '启用流程', user: '张三', time: '2025-12-10 14:20' },
  { action: '更新节点配置', user: '李四', time: '2025-12-09 16:30' },
  { action: '创建流程', user: '王五', time: '2025-12-08 10:00' }
])

// 节点类型名称
const getNodeTypeName = (type) => {
  const typeMap = {
    start: '开始',
    approve: '审批',
    notify: '通知',
    condition: '条件判断',
    end: '结束'
  }
  return typeMap[type] || type
}

// 节点类型颜色
const getNodeTypeColor = (type) => {
  const colorMap = {
    start: '#52c41a',
    approve: '#1890ff',
    notify: '#faad14',
    condition: '#722ed1',
    end: '#ff4d4f'
  }
  return colorMap[type] || '#d9d9d9'
}

// 加载流程详情
const loadWorkflow = () => {
  loading.value = true

  // Mock数据 - 实际项目中从API获取
  setTimeout(() => {
    const mockData = {
      id: route.params.id,
      name: 'OKR审批流程',
      description: '目标与关键结果审批流程：员工提交 → 经理审批 → 进行中',
      status: 'active',
      nodeCount: 4,
      bindForm: 'OKR创建表',
      execCount: 234,
      monthlyExec: 56,
      dailyExec: 3,
      avgDuration: 2.5,
      creator: '张三',
      createdAt: '2025-12-01 10:00',
      updatedAt: '2025-12-10 14:20',
      nodes: [
        { id: 1, name: '开始', type: 'start', rule: '员工发起OKR创建申请', approvers: [] },
        { id: 2, name: '经理审批', type: 'approve', rule: '直属经理审批', approvers: ['张经理', '李经理'] },
        { id: 3, name: '通知HR', type: 'notify', rule: '审批通过后通知HR备案', approvers: [] },
        { id: 4, name: '结束', type: 'end', rule: 'OKR创建完成', approvers: [] }
      ]
    }
    workflow.value = mockData
    loading.value = false
  }, 500)
}

// 编辑流程
const editWorkflow = () => {
  router.push(`/workflow-designer?id=${workflow.value.id}`)
}

// 查看执行记录
const viewHistory = () => {
  message.info(`查看"${workflow.value?.name}"的执行记录`)
}

onMounted(() => {
  loadWorkflow()
})
</script>

<style scoped>
.workflow-template-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.workflow-diagram {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.node-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-box {
  padding: 12px 16px;
  background: white;
  border: 2px solid;
  border-radius: 4px;
  text-align: center;
  min-width: 120px;
}

.node-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.node-type {
  font-size: 12px;
  color: #999;
}

.node-arrow {
  margin: 8px 0;
  font-size: 20px;
  color: #999;
}
</style>
