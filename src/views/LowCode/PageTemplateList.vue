<template>
  <div class="page-template-list">
    <a-page-header
      title="页面模板"
      sub-title="管理和发布页面模板"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-button type="primary" @click="createPage">
          <template #icon><PlusOutlined /></template>
          新建页面
        </a-button>
      </template>
    </a-page-header>

    <div class="content-area">
      <a-card :bordered="false">
        <!-- 视图切换 -->
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
          <a-radio-group v-model:value="viewMode" button-style="solid">
            <a-radio-button value="list"><UnorderedListOutlined /> 列表</a-radio-button>
            <a-radio-button value="card"><AppstoreOutlined /> 卡片</a-radio-button>
          </a-radio-group>

          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索页面"
            style="width: 300px"
          />
        </div>

        <!-- 列表视图 -->
        <a-table
          v-if="viewMode === 'list'"
          :columns="columns"
          :data-source="filteredPages"
          :pagination="pagination"
          row-key="id"
        >
          <template #name="{ record }">
            <div style="display: flex; align-items: center; gap: 8px">
              <LayoutOutlined style="color: #722ed1" />
              <a @click="viewDetail(record)">{{ record.name }}</a>
            </div>
          </template>

          <template #status="{ record }">
            <a-tag v-if="record.status === 'draft'" color="default">草稿</a-tag>
            <a-tag v-else-if="record.status === 'published'" color="success">已发布</a-tag>
          </template>

          <template #componentCount="{ record }">
            <a-badge :count="record.componentCount" :number-style="{ backgroundColor: '#722ed1' }" />
          </template>

          <template #action="{ record }">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                <EyeOutlined /> 查看详情
              </a-button>
              <a-button type="link" size="small" @click="editPage(record)">
                <EditOutlined /> 编辑
              </a-button>
              <a-button type="link" size="small" @click="publishPage(record)" v-if="record.status === 'draft'">
                <CheckCircleOutlined /> 发布
              </a-button>
            </a-space>
          </template>
        </a-table>

        <!-- 卡片视图 -->
        <div v-else class="card-grid">
          <a-card
            v-for="page in filteredPages"
            :key="page.id"
            hoverable
            class="page-card"
          >
            <template #cover>
              <div class="page-preview" @click="viewDetail(page)">
                <img v-if="page.thumbnail" :src="page.thumbnail" :alt="page.name" />
                <div v-else class="preview-placeholder" :style="{ background: page.color }">
                  <span style="font-size: 48px">{{ page.icon }}</span>
                </div>
                <div class="preview-overlay">
                  <EyeOutlined style="font-size: 32px; color: white" />
                </div>
              </div>
            </template>
            <a-card-meta :title="page.name" :description="page.description">
              <template #avatar>
                <a-avatar :style="{ backgroundColor: page.color }">
                  {{ page.icon }}
                </a-avatar>
              </template>
            </a-card-meta>
            <template #actions>
              <span @click="editPage(page)"><EditOutlined /> 编辑</span>
              <span @click="viewDetail(page)"><EyeOutlined /> 预览</span>
              <span @click="publishPage(page)" v-if="page.status === 'draft'">
                <CheckCircleOutlined /> 发布
              </span>
              <span v-else style="color: #52c41a">
                <CheckCircleOutlined /> 已发布
              </span>
            </template>
          </a-card>
        </div>
      </a-card>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  LayoutOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const viewMode = ref('card')
const searchKeyword = ref('')

const pagination = ref({
  current: 1,
  pageSize: 9,
  showSizeChanger: true
})

const columns = [
  { title: '页面名称', dataIndex: 'name', key: 'name', slots: { customRender: 'name' } },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '组件数', dataIndex: 'componentCount', key: 'componentCount', width: 100, align: 'center', slots: { customRender: 'componentCount' } },
  { title: '访问次数', dataIndex: 'viewCount', key: 'viewCount', width: 100, align: 'center' },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
  { title: '操作', key: 'action', width: 200, fixed: 'right', slots: { customRender: 'action' } }
]

const pages = ref([
  {
    id: 1,
    name: '客户360视图',
    description: '全面展示客户信息、订单历史和交互记录',
    status: 'published',
    componentCount: 4,
    viewCount: 892,
    updatedAt: '2025-12-11 10:30',
    icon: '👤',
    color: '#1890ff',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: '生产工单Dashboard',
    description: '生产工单状态监控和数据统计面板',
    status: 'published',
    componentCount: 6,
    viewCount: 567,
    updatedAt: '2025-12-10 15:20',
    icon: '🏭',
    color: '#52c41a',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: '数据分析大屏',
    description: '实时业务数据可视化大屏',
    status: 'published',
    componentCount: 8,
    viewCount: 1234,
    updatedAt: '2025-12-09 18:45',
    icon: '📊',
    color: '#722ed1',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: '销售漏斗分析',
    description: '销售阶段转化率和漏斗分析',
    status: 'draft',
    componentCount: 5,
    viewCount: 0,
    updatedAt: '2025-12-11 11:30',
    icon: '🔻',
    color: '#fa8c16',
    thumbnail: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=400&h=300&fit=crop'
  }
])

const filteredPages = computed(() => {
  if (!searchKeyword.value) return pages.value
  const keyword = searchKeyword.value.toLowerCase()
  return pages.value.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    p.description.toLowerCase().includes(keyword)
  )
})

const createPage = () => {
  router.push('/page-builder')
}

const viewDetail = (record) => {
  router.push(`/page-template-detail/${record.id}`)
}

const editPage = (record) => {
  router.push(`/page-builder?id=${record.id}`)
}

const publishPage = (record) => {
  record.status = 'published'
  message.success(`页面"${record.name}"已发布`)
}
</script>

<style scoped>
.page-template-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.page-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.page-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .preview-overlay {
    opacity: 1;
  }
}
</style>
