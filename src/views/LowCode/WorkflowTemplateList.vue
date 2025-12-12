<template>
  <div class="workflow-template-list">
    <a-page-header title="流程模板" sub-title="管理审批和业务流程" @back="() => $router.back()">
      <template #extra>
        <a-button type="primary" @click="createWorkflow">
          <template #icon><PlusOutlined /></template>
          新建流程
        </a-button>
      </template>
    </a-page-header>

    <div class="content-area">
      <a-card :bordered="false">
        <a-table :columns="columns" :data-source="workflows" :pagination="pagination" row-key="id">
          <template #name="{ record }">
            <div style="display: flex; align-items: center; gap: 8px">
              <NodeIndexOutlined style="color: #ff4d4f" />
              <a @click="viewDetail(record)">{{ record.name }}</a>
            </div>
          </template>

          <template #status="{ record }">
            <a-badge
              :status="record.status === 'active' ? 'success' : 'default'"
              :text="record.status === 'active' ? '已启用' : '未启用'"
            />
          </template>

          <template #nodeCount="{ record }">
            <a-tag color="blue">{{ record.nodeCount }} 个节点</a-tag>
          </template>

          <template #action="{ record }">
            <a-space>
              <a-button type="link" size="small" @click="editWorkflow(record)">
                <EditOutlined /> 编辑
              </a-button>
              <a-button type="link" size="small" @click="toggleStatus(record)">
                <PoweroffOutlined /> {{ record.status === 'active' ? '停用' : '启用' }}
              </a-button>
              <a-button type="link" size="small" @click="viewHistory(record)">
                <HistoryOutlined /> 执行记录
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  NodeIndexOutlined,
  EditOutlined,
  PoweroffOutlined,
  HistoryOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const pagination = ref({ current: 1, pageSize: 10 })

const columns = [
  { title: '流程名称', dataIndex: 'name', key: 'name', slots: { customRender: 'name' } },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '节点数', dataIndex: 'nodeCount', key: 'nodeCount', width: 120, slots: { customRender: 'nodeCount' } },
  { title: '绑定表单', dataIndex: 'bindForm', key: 'bindForm', width: 150 },
  { title: '执行次数', dataIndex: 'execCount', key: 'execCount', width: 100, align: 'center' },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
  { title: '操作', key: 'action', width: 260, fixed: 'right', slots: { customRender: 'action' } }
]

const workflows = ref([
  {
    id: 1,
    name: 'OKR审批流程',
    description: '目标与关键结果审批流程：员工提交 → 经理审批 → 进行中',
    status: 'active',
    nodeCount: 4,
    bindForm: 'OKR创建表',
    execCount: 234,
    updatedAt: '2025-12-10 14:20'
  },
  {
    id: 2,
    name: '报销审批流程',
    description: '费用报销审批流程：员工提交 → 直属经理审批 → 财务审核 → 完成',
    status: 'active',
    nodeCount: 5,
    bindForm: '报销申请表',
    execCount: 89,
    updatedAt: '2025-12-09 16:30'
  },
  {
    id: 3,
    name: '请假审批流程',
    description: '员工请假审批流程：提交 → 经理审批 → HR备案',
    status: 'active',
    nodeCount: 4,
    bindForm: '请假申请表',
    execCount: 156,
    updatedAt: '2025-12-08 10:15'
  },
  {
    id: 4,
    name: '客户审核流程',
    description: '新客户信息审核流程',
    status: 'inactive',
    nodeCount: 3,
    bindForm: '客户信息采集表',
    execCount: 0,
    updatedAt: '2025-12-11 11:45'
  }
])

const createWorkflow = () => {
  router.push('/workflow-designer')
}

const viewDetail = (record) => {
  router.push(`/workflow-template-detail/${record.id}`)
}

const editWorkflow = (record) => {
  router.push(`/workflow-designer?id=${record.id}`)
}

const toggleStatus = (record) => {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  message.success(`流程已${record.status === 'active' ? '启用' : '停用'}`)
}

const viewHistory = (record) => {
  message.info(`查看"${record.name}"的执行记录`)
}
</script>

<style scoped>
.workflow-template-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
</style>
