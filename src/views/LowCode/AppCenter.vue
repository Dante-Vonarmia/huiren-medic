<template>
  <div class="app-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>🚀 应用中心</h1>
        <p>低代码快速搭建，所有员工都可以使用已发布的应用</p>
      </div>
      <a-space v-if="isDesigner">
        <a-button @click="router.push('/form-designer')">
          <template #icon><FormOutlined /></template>
          创建表单
        </a-button>
        <a-button @click="router.push('/workflow-designer')">
          <template #icon><NodeIndexOutlined /></template>
          创建流程
        </a-button>
        <a-button @click="router.push('/page-builder')" type="primary">
          <template #icon><LayoutOutlined /></template>
          创建页面
        </a-button>
      </a-space>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-bar">
      <a-space size="large">
        <div class="filter-group">
          <label>应用类型：</label>
          <a-radio-group v-model:value="typeFilter" button-style="solid" size="small">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="form">📝 表单</a-radio-button>
            <a-radio-button value="workflow">🔄 流程</a-radio-button>
            <a-radio-button value="page">📊 页面</a-radio-button>
          </a-radio-group>
        </div>
        <div class="filter-group">
          <label>业务类别：</label>
          <a-select v-model:value="categoryFilter" style="width: 160px" size="small">
            <a-select-option value="all">全部类别</a-select-option>
            <a-select-option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </a-select-option>
          </a-select>
        </div>
        <div class="filter-group">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索应用..."
            style="width: 200px"
            size="small"
          />
        </div>
      </a-space>
      <div class="stats">
        <a-tag color="blue">{{ filteredApps.length }} 个应用</a-tag>
        <a-tag color="green">今日使用 {{ todayUsage }} 次</a-tag>
      </div>
    </div>

    <!-- 应用列表 -->
    <div class="apps-grid">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="app in filteredApps"
          :key="app.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <a-card hoverable class="app-card" @click="openApp(app)">
            <!-- 应用封面 -->
            <div class="app-thumbnail">
              <img v-if="app.thumbnail" :src="app.thumbnail" :alt="app.name" />
              <div v-else class="placeholder-icon">{{ app.icon }}</div>
              <div class="app-type-badge" :class="`type-${app.type}`">
                {{ getTypeName(app.type) }}
              </div>
            </div>

            <!-- 应用信息 -->
            <div class="app-info">
              <h3>{{ app.name }}</h3>
              <p class="app-desc">{{ app.description }}</p>

              <div class="app-meta">
                <a-tag color="purple" size="small">{{ app.category }}</a-tag>
                <span class="usage-count">
                  <FireOutlined />
                  {{ app.usageCount }} 次使用
                </span>
              </div>

              <div class="app-footer">
                <div class="creator">
                  <UserOutlined />
                  {{ app.createdBy }}
                </div>
                <div class="created-date">{{ app.createdAt }}</div>
              </div>

              <a-button type="primary" block class="use-btn">
                {{ getActionText(app.type) }}
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 空状态 -->
      <a-empty v-if="filteredApps.length === 0" description="没有找到匹配的应用" style="margin-top: 60px">
        <a-button type="primary" @click="resetFilters">重置筛选</a-button>
      </a-empty>
    </div>

    <!-- 应用运行Modal -->
    <a-modal
      v-model:open="appModalVisible"
      :title="currentApp?.name"
      :width="appModalWidth"
      :footer="null"
      :destroyOnClose="true"
    >
      <div v-if="currentApp" class="app-runner">
        <!-- 表单类型 -->
        <div v-if="currentApp.type === 'form'" class="form-runner">
          <a-form :layout="'vertical'">
            <a-form-item
              v-for="(field, index) in currentApp.config.fields"
              :key="index"
              :label="field.label"
              :required="field.required"
            >
              <a-input v-if="field.type === 'input'" :placeholder="field.placeholder || `请输入${field.label}`" />
              <a-textarea v-else-if="field.type === 'textarea'" :placeholder="field.placeholder || `请输入${field.label}`" :rows="4" />
              <a-input-number v-else-if="field.type === 'number'" style="width: 100%" :placeholder="field.placeholder || `请输入${field.label}`" />
              <a-select v-else-if="field.type === 'select'" :placeholder="field.placeholder || `请选择${field.label}`">
                <a-select-option v-for="opt in field.options" :key="opt" :value="opt">
                  {{ opt }}
                </a-select-option>
              </a-select>
              <a-date-picker v-else-if="field.type === 'date'" style="width: 100%" :placeholder="field.placeholder || `请选择${field.label}`" />
              <a-range-picker v-else-if="field.type === 'daterange'" style="width: 100%" />
            </a-form-item>
          </a-form>
          <div class="form-actions">
            <a-button @click="appModalVisible = false">取消</a-button>
            <a-button type="primary" @click="submitForm">提交</a-button>
          </div>
        </div>

        <!-- 流程类型 -->
        <div v-else-if="currentApp.type === 'workflow'" class="workflow-runner">
          <a-result
            status="info"
            title="流程发起"
            :sub-title="`即将发起「${currentApp.name}」流程`"
          >
            <template #extra>
              <div class="workflow-nodes">
                <a-steps :current="0" direction="vertical" size="small">
                  <a-step
                    v-for="node in currentApp.config.nodes"
                    :key="node.id"
                    :title="node.label"
                    :description="node.type"
                  />
                </a-steps>
              </div>
              <div style="margin-top: 24px">
                <a-button @click="appModalVisible = false">取消</a-button>
                <a-button type="primary" @click="startWorkflow" style="margin-left: 8px">发起流程</a-button>
              </div>
            </template>
          </a-result>
        </div>

        <!-- 页面类型 -->
        <div v-else-if="currentApp.type === 'page'" class="page-runner">
          <div class="page-preview-header">
            <h3>{{ currentApp.name }}</h3>
            <p>{{ currentApp.description }}</p>
          </div>

          <div class="page-preview-content">
            <!-- 模拟页面组件展示 -->
            <a-row :gutter="16">
              <a-col
                v-for="(comp, idx) in currentApp.config.components"
                :key="idx"
                :span="comp.chartType === 'line' || comp.chartType === 'bar' ? 12 : 6"
              >
                <a-card :title="comp.title" size="small" class="preview-card">
                  <!-- 图表类型 -->
                  <div v-if="comp.type === 'chart'" class="chart-preview">
                    <div v-if="comp.chartType === 'line'" class="mock-chart line-chart">
                      <div class="chart-line"></div>
                      <div class="chart-dots">
                        <span v-for="i in 6" :key="i" class="dot"></span>
                      </div>
                    </div>
                    <div v-else-if="comp.chartType === 'pie'" class="mock-chart pie-chart">
                      <div class="pie-slice slice-1"></div>
                      <div class="pie-slice slice-2"></div>
                      <div class="pie-slice slice-3"></div>
                    </div>
                    <div v-else-if="comp.chartType === 'bar'" class="mock-chart bar-chart">
                      <div class="bar" style="height: 60%"></div>
                      <div class="bar" style="height: 80%"></div>
                      <div class="bar" style="height: 45%"></div>
                      <div class="bar" style="height: 90%"></div>
                      <div class="bar" style="height: 70%"></div>
                    </div>
                  </div>

                  <!-- 表格类型 -->
                  <div v-else-if="comp.type === 'table'" class="table-preview">
                    <div class="table-row header">
                      <span>姓名</span>
                      <span>销售额</span>
                      <span>排名</span>
                    </div>
                    <div class="table-row" v-for="i in 3" :key="i">
                      <span>员工{{ i }}</span>
                      <span>¥{{ (100 - i * 10) }}万</span>
                      <span>{{ i }}</span>
                    </div>
                  </div>

                  <!-- 卡片类型 -->
                  <div v-else-if="comp.type === 'card'" class="card-preview">
                    <div class="big-number">{{ Math.floor(Math.random() * 500) + 200 }}万</div>
                    <div class="trend">
                      <span class="up">↑ 12.5%</span>
                      <span class="label">较上月</span>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>

          <div class="page-preview-footer">
            <a-button @click="appModalVisible = false">关闭</a-button>
            <a-button type="primary" @click="openPageFull" style="margin-left: 8px">
              全屏查看
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '../../stores/user'
import {
  FormOutlined,
  LayoutOutlined,
  NodeIndexOutlined,
  FireOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import applicationsData from '../../mock/applications.json'

const router = useRouter()
const userStore = useUserStore()

// 筛选条件
const typeFilter = ref('all')
const categoryFilter = ref('all')
const searchKeyword = ref('')

// 应用数据
const applications = ref(applicationsData.filter(app => app.published))

// 获取所有类别
const categories = computed(() => {
  const cats = new Set(applications.value.map(app => app.category))
  return Array.from(cats)
})

// 筛选后的应用
const filteredApps = computed(() => {
  return applications.value.filter(app => {
    // 类型筛选
    if (typeFilter.value !== 'all' && app.type !== typeFilter.value) {
      return false
    }
    // 类别筛选
    if (categoryFilter.value !== 'all' && app.category !== categoryFilter.value) {
      return false
    }
    // 关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      return app.name.toLowerCase().includes(keyword) ||
             app.description.toLowerCase().includes(keyword)
    }
    return true
  })
})

// 今日使用次数（模拟）
const todayUsage = computed(() => {
  return applications.value.reduce((sum, app) => sum + Math.floor(app.usageCount / 10), 0)
})

// 判断是否是设计师/管理员
const isDesigner = computed(() => {
  return ['admin', 'manager', 'hr'].includes(userStore.currentUser?.role)
})

// Modal相关
const appModalVisible = ref(false)
const currentApp = ref(null)
const appModalWidth = computed(() => {
  if (!currentApp.value) return '800px'
  if (currentApp.value.type === 'form') return '800px'
  if (currentApp.value.type === 'page') return '1000px'
  return '600px'
})

// 获取类型名称
const getTypeName = (type) => {
  const map = { form: '表单', workflow: '流程', page: '页面' }
  return map[type] || type
}

// 获取操作文本
const getActionText = (type) => {
  const map = {
    form: '填写表单',
    workflow: '发起流程',
    page: '查看页面'
  }
  return map[type] || '使用应用'
}

// 打开应用
const openApp = (app) => {
  currentApp.value = app
  appModalVisible.value = true
  // 增加使用次数（模拟）
  app.usageCount++
}

// 提交表单
const submitForm = () => {
  message.success('表单提交成功！数据已保存')
  appModalVisible.value = false
}

// 发起流程
const startWorkflow = () => {
  message.success('流程已发起！请等待审批')
  appModalVisible.value = false
}

// 全屏打开页面
const openPageFull = () => {
  message.info('页面应用将在新标签页打开（Demo）')
  appModalVisible.value = false
}

// 重置筛选
const resetFilters = () => {
  typeFilter.value = 'all'
  categoryFilter.value = 'all'
  searchKeyword.value = ''
}
</script>

<style scoped>
.app-center {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.page-header {
  background: white;
  padding: 32px 32px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-content p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #8c8c8c;
}

.filter-bar {
  background: white;
  padding: 16px 32px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.stats {
  display: flex;
  gap: 8px;
}

.apps-grid {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.app-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.app-card :deep(.ant-card-body) {
  padding: 0;
}

.app-thumbnail {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

.app-type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(10px);
}

.type-form { background: rgba(24, 144, 255, 0.9); }
.type-workflow { background: rgba(82, 196, 26, 0.9); }
.type-page { background: rgba(250, 140, 22, 0.9); }

.app-info {
  padding: 16px;
}

.app-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.usage-count {
  font-size: 12px;
  color: #ff4d4f;
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

.creator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.use-btn {
  margin-top: 4px;
}

.app-runner {
  padding: 8px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.workflow-nodes {
  max-width: 400px;
  margin: 24px auto;
  text-align: left;
}

.page-components {
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin: 16px 0;
}

/* 页面预览样式 */
.page-preview-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-preview-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.page-preview-header p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.page-preview-content {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.page-preview-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.preview-card {
  margin-bottom: 16px;
}

/* 图表预览 */
.chart-preview {
  min-height: 150px;
}

.mock-chart {
  height: 150px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 10px;
}

/* 折线图 */
.line-chart {
  background: linear-gradient(to top, rgba(24, 144, 255, 0.05) 0%, transparent 100%);
}

.chart-line {
  position: absolute;
  top: 30%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg,
    #1890ff 0%,
    #1890ff 20%,
    #52c41a 20%,
    #52c41a 40%,
    #faad14 40%,
    #faad14 60%,
    #f5222d 60%,
    #f5222d 80%,
    #722ed1 80%,
    #722ed1 100%
  );
  transform: rotate(-5deg);
}

.chart-dots {
  position: absolute;
  top: 20%;
  left: 10%;
  right: 10%;
  display: flex;
  justify-content: space-between;
}

.dot {
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 饼图 */
.pie-chart {
  justify-content: center;
  align-items: center;
}

.pie-slice {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transform-origin: center;
}

.slice-1 {
  background: conic-gradient(#1890ff 0deg 120deg, transparent 120deg);
}

.slice-2 {
  background: conic-gradient(transparent 0deg 120deg, #52c41a 120deg 240deg, transparent 240deg);
}

.slice-3 {
  background: conic-gradient(transparent 0deg 240deg, #faad14 240deg 360deg);
}

/* 柱状图 */
.bar-chart {
  gap: 8px;
  padding-bottom: 20px;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, #1890ff, #40a9ff);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s;
  box-shadow: 0 -2px 8px rgba(24, 144, 255, 0.3);
}

.bar:hover {
  background: linear-gradient(to top, #096dd9, #1890ff);
  transform: scaleY(1.05);
}

/* 表格预览 */
.table-preview {
  font-size: 12px;
}

.table-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.table-row.header {
  background: #fafafa;
  font-weight: 600;
  color: #666;
}

.table-row:last-child {
  border-bottom: none;
}

/* 卡片预览 */
.card-preview {
  text-align: center;
  padding: 20px 0;
}

.big-number {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 12px;
}

.trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
}

.trend .up {
  color: #52c41a;
  font-weight: 600;
}

.trend .label {
  color: #999;
}
</style>
