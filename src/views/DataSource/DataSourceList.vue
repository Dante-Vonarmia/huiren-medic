<template>
  <div class="datasource-page">
    <!-- Platform Integration Header -->
    <div class="integration-header">
      <div class="header-content">
        <div class="header-title">
          <DatabaseOutlined style="font-size: 28px; color: #262626;" />
          <div>
            <h2>企业系统数据集成</h2>
            <p>实时连接6大核心业务系统，统一数据治理与智能分析</p>
          </div>
        </div>
        <div class="integration-stats">
          <div class="stat-item">
            <CloudServerOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">{{ dataSources.length }}</div>
              <div class="stat-label">系统接入</div>
            </div>
          </div>
          <div class="stat-item">
            <SyncOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">实时</div>
              <div class="stat-label">数据同步</div>
            </div>
          </div>
          <div class="stat-item">
            <ThunderboltOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">&lt;500ms</div>
              <div class="stat-label">同步延迟</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-header">
      <h3>数据源管理</h3>
      <a-button type="primary" @click="router.push('/datasource-config')">
        <PlusOutlined /> 添加数据源
      </a-button>
    </div>

    <!-- Overview Cards -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="已连接"
            :value="stats.connected"
            suffix="个"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="未连接"
            :value="stats.disconnected"
            suffix="个"
            :value-style="{ color: '#999' }"
          >
            <template #prefix><CloseCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总数据量"
            :value="stats.totalRecords"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix><DatabaseOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="同步任务"
            :value="stats.syncTasks"
            suffix="个"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix><SyncOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- Data Source List -->
    <a-row :gutter="16">
      <a-col
        v-for="source in dataSources"
        :key="source.id"
        :span="12"
        style="margin-bottom: 16px;"
      >
        <a-card :class="['datasource-card', source.status]">
          <template #title>
            <div class="card-title">
              <span class="icon" :style="{ backgroundColor: source.color }">
                {{ source.icon }}
              </span>
              <div>
                <div class="name">{{ source.name }}</div>
                <div class="type">{{ source.type }}</div>
              </div>
            </div>
          </template>
          <template #extra>
            <a-tag :color="source.status === 'connected' ? 'green' : 'default'">
              {{ source.status === 'connected' ? '已连接' : '未连接' }}
            </a-tag>
          </template>

          <div class="datasource-info">
            <div class="info-row">
              <span class="label">连接地址:</span>
              <span class="value">{{ source.host }}</span>
            </div>
            <div class="info-row">
              <span class="label">数据库:</span>
              <span class="value">{{ source.database }}</span>
            </div>
            <div class="info-row">
              <span class="label">最后同步:</span>
              <span class="value">{{ source.lastSync }}</span>
            </div>
            <div class="info-row">
              <span class="label">数据量:</span>
              <span class="value">{{ source.recordCount.toLocaleString() }} 条</span>
            </div>
          </div>

          <a-divider style="margin: 16px 0;" />

          <div class="datasource-actions">
            <a-space>
              <a-button size="small" @click="testConnection(source)">
                <ApiOutlined /> 测试连接
              </a-button>
              <a-button
                size="small"
                type="primary"
                @click="router.push(`/datasource-config/${source.id}`)"
              >
                <SettingOutlined /> 配置
              </a-button>
              <a-button
                size="small"
                :loading="source.syncing"
                @click="syncData(source)"
              >
                <SyncOutlined /> 同步
              </a-button>
              <a-button size="small" danger @click="deleteSource(source)">
                <DeleteOutlined />
              </a-button>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDebugStore, delay } from '../../stores/debug'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  SyncOutlined,
  ApiOutlined,
  SettingOutlined,
  DeleteOutlined,
  CloudServerOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const debugStore = useDebugStore()

const dataSources = ref([
  {
    id: 1,
    name: '钉钉OA系统',
    type: 'OA - 办公自动化',
    icon: '📋',
    color: '#1890ff',
    status: 'connected',
    host: 'https://oapi.dingtalk.com',
    database: 'dingtalk_hr',
    lastSync: '2025-12-11 10:30:00',
    recordCount: 15680,
    syncing: false
  },
  {
    id: 2,
    name: '用友ERP',
    type: 'ERP - 企业资源计划',
    icon: '💼',
    color: '#52c41a',
    status: 'connected',
    host: '192.168.1.100:8080',
    database: 'yonyou_erp',
    lastSync: '2025-12-11 09:45:00',
    recordCount: 45230,
    syncing: false
  },
  {
    id: 3,
    name: 'Salesforce CRM',
    type: 'CRM - 客户关系管理',
    icon: '👥',
    color: '#faad14',
    status: 'connected',
    host: 'https://api.salesforce.com',
    database: 'salesforce_prod',
    lastSync: '2025-12-11 11:15:00',
    recordCount: 8920,
    syncing: false
  },
  {
    id: 4,
    name: 'SAP WMS',
    type: 'WMS - 仓储管理系统',
    icon: '📦',
    color: '#722ed1',
    status: 'connected',
    host: '192.168.1.200:3000',
    database: 'sap_wms',
    lastSync: '2025-12-11 08:15:00',
    recordCount: 12450,
    syncing: false
  },
  {
    id: 5,
    name: 'MES生产系统',
    type: 'MES - 生产执行系统',
    icon: '⚙️',
    color: '#13c2c2',
    status: 'connected',
    host: '192.168.1.150:8090',
    database: 'mes_production',
    lastSync: '2025-12-11 10:45:00',
    recordCount: 32150,
    syncing: false
  },
  {
    id: 6,
    name: 'QMS质检系统',
    type: 'QMS - 质量管理系统',
    icon: '✓',
    color: '#eb2f96',
    status: 'connected',
    host: '192.168.1.180:9000',
    database: 'qms_quality',
    lastSync: '2025-12-11 11:00:00',
    recordCount: 18760,
    syncing: false
  }
])

const stats = computed(() => {
  return {
    connected: dataSources.value.filter(s => s.status === 'connected').length,
    disconnected: dataSources.value.filter(s => s.status === 'disconnected').length,
    totalRecords: dataSources.value.reduce((sum, s) => sum + s.recordCount, 0),
    syncTasks: dataSources.value.filter(s => s.syncing).length
  }
})

const testConnection = async (source) => {
  try {
    debugStore.log('info', `🔌 测试连接: ${source.name}`)
    await delay(300)

    debugStore.log('info', `连接地址: ${source.host}`)
    await delay(200)

    debugStore.log('info', '建立TCP连接...')
    await delay(400)

    debugStore.log('info', '验证认证信息...')
    await delay(300)

    if (source.status === 'connected') {
      debugStore.log('success', '✓ 连接成功')
      debugStore.log('info', `数据库: ${source.database}`)
      await delay(200)
      debugStore.log('success', `可用数据表: ${Math.floor(Math.random() * 20) + 10} 个`)
      message.success('连接测试成功')
    } else {
      debugStore.log('error', '✗ 连接失败: 超时')
      message.error('连接失败，请检查配置')
    }
  } catch (error) {
    debugStore.log('error', `连接错误: ${error.message}`)
    message.error('测试连接失败')
  }
}

const syncData = async (source) => {
  source.syncing = true

  try {
    debugStore.log('info', `🔄 开始同步: ${source.name}`)
    await delay(300)

    debugStore.log('info', '连接数据源...')
    await delay(400)

    debugStore.log('success', '✓ 连接成功')
    debugStore.log('info', '查询增量数据...')
    await delay(500)

    const newRecords = Math.floor(Math.random() * 100) + 50
    debugStore.log('info', `发现新数据: ${newRecords} 条`)
    await delay(400)

    debugStore.log('info', '数据转换中...')
    await delay(600)

    debugStore.log('info', '写入本地数据库...')
    await delay(500)

    source.recordCount += newRecords
    source.lastSync = new Date().toLocaleString('zh-CN')

    debugStore.log('success', `✓ 同步完成: +${newRecords} 条`)
    message.success(`同步成功，新增 ${newRecords} 条数据`)

  } catch (error) {
    debugStore.log('error', `同步失败: ${error.message}`)
    message.error('数据同步失败')
  } finally {
    source.syncing = false
  }
}

const deleteSource = (source) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除数据源"${source.name}"吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        debugStore.log('info', `🗑️ 删除数据源: ${source.name}`)
        await delay(300)

        debugStore.log('info', '断开连接...')
        await delay(200)

        debugStore.log('info', '清理配置信息...')
        await delay(300)

        const index = dataSources.value.findIndex(s => s.id === source.id)
        if (index > -1) {
          dataSources.value.splice(index, 1)
        }

        debugStore.log('success', '✓ 删除完成')
        message.success('数据源已删除')

      } catch (error) {
        debugStore.log('error', `删除失败: ${error.message}`)
        message.error('删除失败，请重试')
      }
    }
  })
}
</script>

<style scoped>
.datasource-page {
  padding: 24px;
  max-width: 1600px;
}

.integration-header {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: #262626;
  border-bottom: 1px solid #e8e8e8;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.header-title p {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.integration-stats {
  display: flex;
  gap: 32px;
}

.integration-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.datasource-card {
  border: 2px solid #e8e8e8;
  transition: all 0.3s;
}

.datasource-card.connected {
  border-color: #52c41a;
}

.datasource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title .icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
}

.card-title .name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-title .type {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.datasource-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-row .label {
  color: #999;
  width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #333;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.datasource-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
