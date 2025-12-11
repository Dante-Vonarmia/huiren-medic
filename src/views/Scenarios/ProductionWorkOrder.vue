<template>
  <div class="production-workorder">
    <a-page-header
      title="生产异常工单"
      sub-title="移动端快速上报，自动分配维修工"
    >
      <template #extra>
        <a-space>
          <a-radio-group v-model:value="viewMode" button-style="solid">
            <a-radio-button value="desktop"><DesktopOutlined /> 桌面</a-radio-button>
            <a-radio-button value="mobile"><MobileOutlined /> 手机</a-radio-button>
          </a-radio-group>
          <a-button type="primary" @click="createWorkorder">
            <PlusOutlined /> 新建工单
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16" v-if="viewMode === 'desktop'">
      <a-col :span="16">
        <a-card title="工单列表">
          <a-table
            :columns="columns"
            :data-source="workorders"
            :pagination="{ pageSize: 10 }"
            row-key="workorder_no"
          >
            <template #workorder_no="{ record }">
              <a @click="viewDetail(record)">{{ record.workorder_no }}</a>
            </template>

            <template #fault_type="{ text }">
              <a-tag :color="getFaultColor(text)">{{ text }}</a-tag>
            </template>

            <template #status="{ text }">
              <a-badge
                :status="getStatusBadge(text)"
                :text="getStatusText(text)"
              />
            </template>

            <template #priority="{ text }">
              <a-tag :color="text === '紧急' ? 'red' : 'default'">{{ text }}</a-tag>
            </template>

            <template #photos="{ record }">
              <a-space>
                <a-image
                  v-for="(photo, index) in record.photos"
                  :key="index"
                  :width="40"
                  :src="photo"
                  :preview="true"
                />
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="工单统计" style="margin-bottom: 16px">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="待处理" :value="stats.pending" :value-style="{ color: '#faad14' }">
                <template #prefix><ClockCircleOutlined /></template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="处理中" :value="stats.processing" :value-style="{ color: '#1890ff' }">
                <template #prefix><SyncOutlined :spin="true" /></template>
              </a-statistic>
            </a-col>
          </a-row>
          <a-divider />
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="今日完成" :value="stats.todayCompleted" :value-style="{ color: '#52c41a' }">
                <template #prefix><CheckCircleOutlined /></template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="平均响应" :value="stats.avgResponseTime" suffix="分钟">
                <template #prefix><ThunderboltOutlined /></template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>

        <a-card title="维修工在线状态" size="small">
          <a-list
            :data-source="workers"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`" />
                  </template>
                  <template #title>
                    {{ item.name }}
                    <a-badge
                      :status="item.online ? 'processing' : 'default'"
                      :text="item.online ? '在线' : '离线'"
                      style="margin-left: 8px"
                    />
                  </template>
                  <template #description>
                    当前工单: {{ item.currentWorkorders }}个
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 移动端视图 -->
    <div v-else class="mobile-view">
      <div class="mobile-container">
        <div class="mobile-screen">
          <div class="mobile-header">
            <h3>生产异常上报</h3>
          </div>

          <div class="mobile-form">
            <a-form layout="vertical">
              <a-form-item label="设备编号">
                <a-input placeholder="扫码或手动输入" suffix="📷" />
              </a-form-item>

              <a-form-item label="异常类型">
                <a-select placeholder="选择异常类型">
                  <a-select-option value="设备故障">设备故障</a-select-option>
                  <a-select-option value="质量异常">质量异常</a-select-option>
                  <a-select-option value="安全隐患">安全隐患</a-select-option>
                  <a-select-option value="其他">其他</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="现场照片">
                <div class="photo-upload">
                  <div class="upload-btn">
                    <CameraOutlined style="font-size: 24px" />
                    <div>拍照</div>
                  </div>
                  <div class="photo-preview">
                    <img src="https://via.placeholder.com/80" />
                  </div>
                  <div class="photo-preview">
                    <img src="https://via.placeholder.com/80" />
                  </div>
                </div>
              </a-form-item>

              <a-form-item label="异常描述">
                <a-textarea
                  :rows="4"
                  placeholder="请详细描述异常情况"
                />
              </a-form-item>

              <a-form-item label="位置信息">
                <a-input
                  value="自动获取: 北京市朝阳区xxx工厂A区"
                  disabled
                  prefix="📍"
                />
              </a-form-item>

              <a-button type="primary" block size="large">
                提交工单
              </a-button>
            </a-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  DesktopOutlined,
  MobileOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  CameraOutlined
} from '@ant-design/icons-vue'

const viewMode = ref('desktop')

const workorders = ref([
  {
    workorder_no: 'WO20251211001',
    device_id: 'DEV-A-001',
    fault_type: '设备故障',
    description: 'A区1号生产线传送带突然停止',
    reporter: '王师傅',
    assigned_to: '李师傅',
    status: 'COMPLETED',
    priority: '紧急',
    created_at: '2025-12-11 10:30',
    completed_at: '2025-12-11 11:15',
    photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251211002',
    device_id: 'DEV-B-003',
    fault_type: '质量异常',
    description: 'B区3号线产品尺寸偏差',
    reporter: '张师傅',
    assigned_to: '赵师傅',
    status: 'PROCESSING',
    priority: '普通',
    created_at: '2025-12-11 14:20',
    photos: ['https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251211003',
    device_id: 'DEV-C-002',
    fault_type: '安全隐患',
    description: 'C区2号设备护栏损坏',
    reporter: '刘师傅',
    assigned_to: null,
    status: 'PENDING',
    priority: '紧急',
    created_at: '2025-12-11 15:45',
    photos: []
  }
])

const stats = ref({
  pending: 3,
  processing: 5,
  todayCompleted: 12,
  avgResponseTime: 15
})

const workers = ref([
  { name: '李师傅', online: true, currentWorkorders: 1 },
  { name: '赵师傅', online: true, currentWorkorders: 2 },
  { name: '孙师傅', online: false, currentWorkorders: 0 }
])

const columns = [
  { title: '工单号', dataIndex: 'workorder_no', key: 'workorder_no', width: 130, slots: { customRender: 'workorder_no' } },
  { title: '设备编号', dataIndex: 'device_id', key: 'device_id', width: 100 },
  { title: '异常类型', dataIndex: 'fault_type', key: 'fault_type', width: 100, slots: { customRender: 'fault_type' } },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '报告人', dataIndex: 'reporter', key: 'reporter', width: 80 },
  { title: '维修工', dataIndex: 'assigned_to', key: 'assigned_to', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80, slots: { customRender: 'priority' } },
  { title: '照片', key: 'photos', width: 120, slots: { customRender: 'photos' } }
]

const getFaultColor = (type) => {
  const colors = {
    '设备故障': 'red',
    '质量异常': 'orange',
    '安全隐患': 'purple',
    '其他': 'default'
  }
  return colors[type] || 'default'
}

const getStatusBadge = (status) => {
  const map = {
    'PENDING': 'warning',
    'PROCESSING': 'processing',
    'COMPLETED': 'success'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    'PENDING': '待处理',
    'PROCESSING': '处理中',
    'COMPLETED': '已完成'
  }
  return map[status] || status
}

const createWorkorder = () => {
  message.info('创建新工单 (Demo)')
}

const viewDetail = (record) => {
  message.info(`查看工单详情: ${record.workorder_no}`)
}
</script>

<style scoped>
.production-workorder {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.mobile-view {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.mobile-container {
  background: #333;
  border-radius: 36px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.mobile-screen {
  width: 375px;
  height: 667px;
  background: white;
  border-radius: 20px;
  overflow-y: auto;
}

.mobile-header {
  padding: 16px;
  background: #1890ff;
  color: white;
  text-align: center;
}

.mobile-header h3 {
  margin: 0;
  color: white;
}

.mobile-form {
  padding: 16px;
}

.photo-upload {
  display: flex;
  gap: 12px;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.photo-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
