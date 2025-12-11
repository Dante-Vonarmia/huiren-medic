<template>
  <div class="app-market">
    <a-page-header
      title="应用市场"
      sub-title="快速安装预置应用模板"
    >
      <template #extra>
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索应用"
          style="width: 300px"
        />
      </template>
    </a-page-header>

    <a-tabs v-model:activeKey="category">
      <a-tab-pane key="all" tab="全部应用"></a-tab-pane>
      <a-tab-pane key="hr" tab="人事管理"></a-tab-pane>
      <a-tab-pane key="finance" tab="财务管理"></a-tab-pane>
      <a-tab-pane key="sales" tab="销售管理"></a-tab-pane>
      <a-tab-pane key="production" tab="生产管理"></a-tab-pane>
    </a-tabs>

    <a-row :gutter="[16, 16]">
      <a-col
        v-for="app in filteredApps"
        :key="app.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <a-card hoverable class="app-card">
          <div class="app-icon">{{ app.icon }}</div>
          <h3>{{ app.name }}</h3>
          <p class="app-description">{{ app.description }}</p>

          <a-divider style="margin: 12px 0" />

          <div class="app-meta">
            <div class="meta-item">
              <DownloadOutlined /> {{ app.downloads }}次安装
            </div>
            <div class="meta-item">
              <StarFilled style="color: #faad14" /> {{ app.rating }}
            </div>
          </div>

          <a-divider style="margin: 12px 0" />

          <a-space style="width: 100%">
            <a-button type="primary" block @click="installApp(app)">
              <DownloadOutlined /> 安装
            </a-button>
            <a-button @click="previewApp(app)">
              <EyeOutlined /> 预览
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  DownloadOutlined,
  StarFilled,
  EyeOutlined
} from '@ant-design/icons-vue'

const category = ref('all')
const searchText = ref('')

const apps = ref([
  {
    id: 1,
    name: '员工请假审批',
    icon: '📝',
    description: '支持多种请假类型，自动审批流程，钉钉通知',
    category: 'hr',
    downloads: 1520,
    rating: 4.8
  },
  {
    id: 2,
    name: '费用报销',
    icon: '💰',
    description: '多级审批，自动生成付款单，对接财务系统',
    category: 'finance',
    downloads: 1380,
    rating: 4.7
  },
  {
    id: 3,
    name: '销售漏斗',
    icon: '📊',
    description: '线索→商机→成单，可视化转化率分析',
    category: 'sales',
    downloads: 980,
    rating: 4.9
  },
  {
    id: 4,
    name: '客户管理',
    icon: '👥',
    description: '客户信息、跟进记录、合同管理一体化',
    category: 'sales',
    downloads: 2100,
    rating: 4.6
  },
  {
    id: 5,
    name: '生产工单',
    icon: '🏭',
    description: '异常上报、工单分配、进度跟踪',
    category: 'production',
    downloads: 650,
    rating: 4.5
  },
  {
    id: 6,
    name: '质量检验',
    icon: '✅',
    description: '检验标准、不合格品处理、统计分析',
    category: 'production',
    downloads: 520,
    rating: 4.4
  },
  {
    id: 7,
    name: '采购申请',
    icon: '🛒',
    description: '采购需求、供应商管理、比价议价',
    category: 'finance',
    downloads: 880,
    rating: 4.7
  },
  {
    id: 8,
    name: '绩效考核',
    icon: '🎯',
    description: 'OKR管理、绩效评分、自动计算',
    category: 'hr',
    downloads: 1650,
    rating: 4.9
  }
])

const filteredApps = computed(() => {
  let result = apps.value
  if (category.value !== 'all') {
    result = result.filter(app => app.category === category.value)
  }
  if (searchText.value) {
    result = result.filter(app =>
      app.name.includes(searchText.value) ||
      app.description.includes(searchText.value)
    )
  }
  return result
})

const installApp = (app) => {
  message.loading(`正在安装 "${app.name}"...`, 2)
  setTimeout(() => {
    message.success(`"${app.name}" 安装成功！`)
  }, 2000)
}

const previewApp = (app) => {
  message.info(`预览 "${app.name}" (Demo)`)
}
</script>

<style scoped>
.app-market {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.app-card {
  text-align: center;
  transition: all 0.3s;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.app-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.app-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.app-description {
  font-size: 13px;
  color: #666;
  min-height: 40px;
}

.app-meta {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
