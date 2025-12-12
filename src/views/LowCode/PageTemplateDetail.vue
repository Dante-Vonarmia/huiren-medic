<template>
  <div class="page-template-detail">
    <a-page-header
      :title="page?.name || '页面模板详情'"
      sub-title="查看页面模板详细信息"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-space>
          <a-button @click="previewPage">
            <template #icon><EyeOutlined /></template>
            预览
          </a-button>
          <a-button type="primary" @click="editPage">
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
                <a-descriptions-item label="页面名称" :span="2">
                  {{ page?.name }}
                </a-descriptions-item>
                <a-descriptions-item label="描述" :span="2">
                  {{ page?.description }}
                </a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag v-if="page?.status === 'draft'" color="default">草稿</a-tag>
                  <a-tag v-else-if="page?.status === 'published'" color="success">已发布</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="组件数量">
                  <a-badge :count="page?.componentCount || 0" :number-style="{ backgroundColor: '#722ed1' }" />
                </a-descriptions-item>
                <a-descriptions-item label="访问次数">
                  {{ page?.viewCount || 0 }} 次
                </a-descriptions-item>
                <a-descriptions-item label="创建时间">
                  {{ page?.createdAt || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="创建人">
                  {{ page?.creator || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="更新时间">
                  {{ page?.updatedAt || '-' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <!-- 组件配置 -->
            <a-card title="页面组件" :bordered="false">
              <a-table
                :columns="componentColumns"
                :data-source="page?.components || []"
                :pagination="false"
                row-key="id"
              >
                <template #type="{ record }">
                  <a-tag>{{ getComponentTypeName(record.type) }}</a-tag>
                </template>
                <template #position="{ record }">
                  {{ record.position }}
                </template>
              </a-table>
            </a-card>
          </a-col>

          <!-- 右侧：统计信息和操作历史 -->
          <a-col :span="8">
            <a-card title="访问统计" :bordered="false" style="margin-bottom: 16px">
              <a-statistic
                title="总访问次数"
                :value="page?.viewCount || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-statistic
                title="本月访问"
                :value="page?.monthlyViews || 0"
                suffix="次"
                style="margin-bottom: 16px"
              />
              <a-statistic
                title="今日访问"
                :value="page?.dailyViews || 0"
                suffix="次"
              />
            </a-card>

            <a-card title="页面预览" :bordered="false" style="margin-bottom: 16px">
              <div class="page-thumbnail">
                <div class="thumbnail-content">
                  <div :style="{ background: page?.color || '#722ed1', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                    <span style="font-size: 48px">{{ page?.icon || '📄' }}</span>
                  </div>
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

    <!-- 预览Modal -->
    <a-modal
      v-model:open="previewVisible"
      :title="page?.name"
      width="90%"
      :footer="null"
      :body-style="{ padding: 0, height: '80vh', overflow: 'auto' }"
    >
      <iframe
        v-if="page"
        :src="`/page-builder?preview=${page.id}`"
        style="width: 100%; height: 100%; border: none"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { EyeOutlined, EditOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const page = ref(null)
const previewVisible = ref(false)

// 表格列定义
const componentColumns = [
  {
    title: '组件名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '组件类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    slots: { customRender: 'type' }
  },
  {
    title: '位置',
    key: 'position',
    width: 120,
    slots: { customRender: 'position' }
  },
  {
    title: '配置说明',
    dataIndex: 'config',
    key: 'config',
    ellipsis: true
  }
]

// 操作日志
const operationLogs = ref([
  { action: '发布页面', user: '张三', time: '2025-12-11 10:30' },
  { action: '更新组件配置', user: '李四', time: '2025-12-10 15:20' },
  { action: '创建页面', user: '王五', time: '2025-12-09 09:00' }
])

// 组件类型名称
const getComponentTypeName = (type) => {
  const typeMap = {
    chart: '图表',
    table: '表格',
    form: '表单',
    card: '卡片',
    list: '列表',
    header: '页头',
    footer: '页脚'
  }
  return typeMap[type] || type
}

// 加载页面详情
const loadPage = () => {
  loading.value = true

  // Mock数据 - 实际项目中从API获取
  setTimeout(() => {
    const mockData = {
      id: route.params.id,
      name: '客户360视图',
      description: '全面展示客户信息、订单历史和交互记录',
      status: 'published',
      componentCount: 4,
      viewCount: 892,
      monthlyViews: 234,
      dailyViews: 12,
      creator: '张三',
      createdAt: '2025-12-01 08:00',
      updatedAt: '2025-12-11 10:30',
      icon: '👤',
      color: '#1890ff',
      components: [
        { id: 1, name: '客户基本信息', type: 'card', position: '左上', config: '显示客户姓名、联系方式等基本信息' },
        { id: 2, name: '订单历史', type: 'table', position: '左下', config: '展示客户历史订单列表' },
        { id: 3, name: '消费趋势图', type: 'chart', position: '右上', config: '折线图展示消费趋势' },
        { id: 4, name: '交互记录', type: 'list', position: '右下', config: '客户交互和沟通记录' }
      ]
    }
    page.value = mockData
    loading.value = false
  }, 500)
}

// 预览页面
const previewPage = () => {
  previewVisible.value = true
}

// 编辑页面
const editPage = () => {
  router.push(`/page-builder?id=${page.value.id}`)
}

onMounted(() => {
  loadPage()
})
</script>

<style scoped>
.page-template-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.page-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail-content {
  width: 100%;
  height: 100%;
}
</style>
