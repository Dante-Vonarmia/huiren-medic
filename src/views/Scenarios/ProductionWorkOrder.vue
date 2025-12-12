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

    <!-- 统计卡片 - 顶部横向布局 -->
    <a-row :gutter="16" v-if="viewMode === 'desktop'" style="margin-bottom: 16px;">
      <a-col :span="6">
        <a-card size="small">
          <a-statistic title="待处理" :value="stats.pending" :value-style="{ color: '#faad14', fontSize: '20px' }">
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small">
          <a-statistic title="处理中" :value="stats.processing" :value-style="{ color: '#1890ff', fontSize: '20px' }">
            <template #prefix><SyncOutlined :spin="true" /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small">
          <a-statistic title="今日完成" :value="stats.todayCompleted" :value-style="{ color: '#52c41a', fontSize: '20px' }">
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small">
          <a-statistic title="平均响应" :value="stats.avgResponseTime" suffix="分钟" :value-style="{ fontSize: '20px' }">
            <template #prefix><ThunderboltOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 工单列表 - 全宽 -->
    <a-row :gutter="16" v-if="viewMode === 'desktop'">
      <a-col :span="24">
        <a-card title="工单列表">
          <!-- Search and Filter Bar -->
          <div class="list-controls" style="margin-bottom: 16px;">
            <a-space style="width: 100%; justify-content: space-between;">
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索工单号、设备编号、描述"
                style="width: 300px;"
                @search="handleSearch"
              >
                <template #prefix><SearchOutlined /></template>
              </a-input-search>

              <a-space>
                <a-select
                  v-model:value="filterStatus"
                  style="width: 120px;"
                  placeholder="状态筛选"
                  allowClear
                  @change="applyFilters"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="PENDING">待处理</a-select-option>
                  <a-select-option value="PROCESSING">处理中</a-select-option>
                  <a-select-option value="COMPLETED">已完成</a-select-option>
                </a-select>

                <a-select
                  v-model:value="filterPriority"
                  style="width: 120px;"
                  placeholder="优先级筛选"
                  allowClear
                  @change="applyFilters"
                >
                  <a-select-option value="">全部优先级</a-select-option>
                  <a-select-option value="紧急">紧急</a-select-option>
                  <a-select-option value="普通">普通</a-select-option>
                </a-select>

                <a-button @click="resetFilters"><ReloadOutlined /> 重置</a-button>
              </a-space>
            </a-space>
          </div>

          <a-table
            :columns="columns"
            :data-source="filteredWorkorders"
            :pagination="{ pageSize: 10 }"
            row-key="workorder_no"
            size="small"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.key === 'workorder_no'">
                <a @click="viewDetail(record)">{{ record.workorder_no }}</a>
              </template>

              <template v-else-if="column.key === 'fault_type'">
                <a-tag :color="getFaultColor(text)">{{ text }}</a-tag>
              </template>

              <template v-else-if="column.key === 'status'">
                <a-badge
                  :status="getStatusBadge(text)"
                  :text="getStatusText(text)"
                />
              </template>

              <template v-else-if="column.key === 'priority'">
                <a-tag :color="text === '紧急' ? 'red' : 'default'">{{ text }}</a-tag>
              </template>

              <template v-else-if="column.key === 'photos'">
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

              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button
                    type="link"
                    size="small"
                    @click="editWorkorder(record)"
                  >
                    编辑
                  </a-button>
                  <a-button
                    type="link"
                    size="small"
                    @click="changeStatus(record)"
                  >
                    更新状态
                  </a-button>
                  <a-popconfirm
                    title="确定删除此工单？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="deleteWorkorder(record.workorder_no)"
                  >
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 移动端视图 -->
    <div v-else class="mobile-view">
      <div class="mobile-container">
        <div class="mobile-screen" ref="mobileScreenRef">
          <!-- Mobile Header with Tabs -->
          <div class="mobile-header">
            <h3>生产异常上报</h3>
            <div class="mobile-tabs">
              <div
                :class="['tab-item', { active: activeTab === 'form' }]"
                @click="activeTab = 'form'"
              >
                <FormOutlined /> 上报
              </div>
              <div
                :class="['tab-item', { active: activeTab === 'list' }]"
                @click="activeTab = 'list'"
              >
                <UnorderedListOutlined /> 工单列表
              </div>
            </div>
          </div>

          <!-- Form Tab -->
          <div v-show="activeTab === 'form'" class="mobile-form">
            <!-- Draft Indicator -->
            <a-alert
              v-if="hasDraft"
              message="检测到未提交的草稿"
              type="info"
              closable
              show-icon
              style="margin-bottom: 16px;"
              @close="clearDraft"
            >
              <template #description>
                草稿已自动恢复，继续编辑或清除草稿
              </template>
            </a-alert>

            <a-form layout="vertical" :model="formData">
              <a-form-item
                label="设备编号"
                :validate-status="validationErrors.device_id ? 'error' : ''"
                :help="validationErrors.device_id"
              >
                <a-input
                  v-model:value="formData.device_id"
                  placeholder="扫码或手动输入"
                  size="large"
                  @input="validateField('device_id')"
                >
                  <template #suffix>
                    <ScanOutlined
                      @click="openScanner('device')"
                      class="scan-icon"
                    />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                label="产品批次"
                :validate-status="validationErrors.batch_no ? 'error' : ''"
                :help="validationErrors.batch_no"
              >
                <a-input
                  v-model:value="formData.batch_no"
                  placeholder="扫描产品批次码"
                  size="large"
                  @input="validateField('batch_no')"
                >
                  <template #suffix>
                    <ScanOutlined
                      @click="openScanner('batch')"
                      class="scan-icon"
                    />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                label="异常类型"
                :validate-status="validationErrors.fault_type ? 'error' : ''"
                :help="validationErrors.fault_type"
              >
                <a-select
                  v-model:value="formData.fault_type"
                  placeholder="选择异常类型"
                  size="large"
                  @change="validateField('fault_type')"
                >
                  <a-select-option value="设备故障">设备故障</a-select-option>
                  <a-select-option value="质量异常">质量异常</a-select-option>
                  <a-select-option value="安全隐患">安全隐患</a-select-option>
                  <a-select-option value="其他">其他</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item
                label="优先级"
                :validate-status="validationErrors.priority ? 'error' : ''"
                :help="validationErrors.priority"
              >
                <a-radio-group
                  v-model:value="formData.priority"
                  size="large"
                  button-style="solid"
                  @change="validateField('priority')"
                >
                  <a-radio-button value="普通">普通</a-radio-button>
                  <a-radio-button value="紧急">紧急</a-radio-button>
                </a-radio-group>
              </a-form-item>

              <a-form-item
                label="现场照片"
                :validate-status="validationErrors.photos ? 'error' : ''"
                :help="validationErrors.photos"
              >
                <div class="photo-upload">
                  <div class="upload-btn" @click="openCamera">
                    <CameraOutlined style="font-size: 24px" />
                    <div>拍照</div>
                  </div>

                  <div
                    v-for="(photo, index) in formData.photos"
                    :key="index"
                    class="photo-preview"
                  >
                    <img :src="photo.url" @click="previewPhoto(index)" />
                    <div class="photo-overlay">
                      <div class="photo-info">
                        <span>{{ photo.size }}</span>
                        <span>{{ photo.time }}</span>
                      </div>
                      <CloseCircleFilled
                        class="photo-remove"
                        @click.stop="removePhoto(index)"
                      />
                    </div>
                  </div>
                </div>
                <div class="photo-count">{{ formData.photos.length }}/6 张照片</div>
              </a-form-item>

              <a-form-item
                label="异常描述"
                :validate-status="validationErrors.description ? 'error' : ''"
                :help="validationErrors.description"
              >
                <a-textarea
                  v-model:value="formData.description"
                  :rows="4"
                  placeholder="请详细描述异常情况（至少10个字）"
                  size="large"
                  :maxlength="500"
                  show-count
                  @input="validateField('description')"
                />
              </a-form-item>

              <a-form-item label="位置信息">
                <a-input
                  v-model:value="formData.location"
                  disabled
                  size="large"
                >
                  <template #prefix>
                    <EnvironmentOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-space direction="vertical" style="width: 100%;" :size="12">
                <a-button
                  type="primary"
                  block
                  size="large"
                  :loading="submitting"
                  @click="submitForm"
                >
                  <template #icon><CheckOutlined /></template>
                  提交工单
                </a-button>

                <a-button
                  block
                  size="large"
                  @click="resetForm"
                >
                  <template #icon><ReloadOutlined /></template>
                  重置表单
                </a-button>
              </a-space>
            </a-form>

            <!-- Submission History -->
            <div v-if="submissionHistory.length > 0" class="submission-history">
              <a-divider>提交历史</a-divider>
              <a-timeline>
                <a-timeline-item
                  v-for="(item, index) in submissionHistory"
                  :key="index"
                  :color="item.success ? 'green' : 'red'"
                >
                  <template #dot>
                    <CheckCircleOutlined v-if="item.success" />
                    <CloseCircleOutlined v-else />
                  </template>
                  <div class="history-item">
                    <div>{{ item.workorder_no }}</div>
                    <div class="history-time">{{ item.timestamp }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </div>

          <!-- List Tab -->
          <div v-show="activeTab === 'list'" class="mobile-list">
            <!-- Pull to Refresh Indicator -->
            <div v-if="isRefreshing" class="refresh-indicator">
              <SyncOutlined :spin="true" /> 刷新中...
            </div>

            <!-- Mobile Search and Filter -->
            <div class="mobile-search">
              <a-input-search
                v-model:value="mobileSearchKeyword"
                placeholder="搜索工单"
                size="large"
                @search="handleMobileSearch"
              >
                <template #prefix><SearchOutlined /></template>
              </a-input-search>

              <div class="mobile-filters">
                <a-tag
                  :color="mobileFilterStatus === '' ? 'blue' : 'default'"
                  @click="mobileFilterStatus = ''; applyMobileFilters()"
                  class="filter-tag"
                >
                  全部
                </a-tag>
                <a-tag
                  :color="mobileFilterStatus === 'PENDING' ? 'orange' : 'default'"
                  @click="mobileFilterStatus = 'PENDING'; applyMobileFilters()"
                  class="filter-tag"
                >
                  待处理
                </a-tag>
                <a-tag
                  :color="mobileFilterStatus === 'PROCESSING' ? 'blue' : 'default'"
                  @click="mobileFilterStatus = 'PROCESSING'; applyMobileFilters()"
                  class="filter-tag"
                >
                  处理中
                </a-tag>
                <a-tag
                  :color="mobileFilterStatus === 'COMPLETED' ? 'green' : 'default'"
                  @click="mobileFilterStatus = 'COMPLETED'; applyMobileFilters()"
                  class="filter-tag"
                >
                  已完成
                </a-tag>
              </div>
            </div>

            <!-- Mobile Workorder Cards -->
            <div class="mobile-workorder-list">
              <div
                v-for="workorder in filteredMobileWorkorders"
                :key="workorder.workorder_no"
                class="workorder-card"
                @click="viewMobileDetail(workorder)"
              >
                <div class="card-header">
                  <span class="workorder-no">{{ workorder.workorder_no }}</span>
                  <a-badge
                    :status="getStatusBadge(workorder.status)"
                    :text="getStatusText(workorder.status)"
                  />
                </div>

                <div class="card-content">
                  <div class="card-row">
                    <span class="label">设备:</span>
                    <span class="value">{{ workorder.device_id }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">类型:</span>
                    <a-tag :color="getFaultColor(workorder.fault_type)" size="small">
                      {{ workorder.fault_type }}
                    </a-tag>
                    <a-tag
                      :color="workorder.priority === '紧急' ? 'red' : 'default'"
                      size="small"
                    >
                      {{ workorder.priority }}
                    </a-tag>
                  </div>
                  <div class="card-row">
                    <span class="label">描述:</span>
                    <span class="value description">{{ workorder.description }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">时间:</span>
                    <span class="value">{{ workorder.created_at }}</span>
                  </div>
                </div>

                <div v-if="workorder.photos.length > 0" class="card-photos">
                  <img
                    v-for="(photo, idx) in workorder.photos.slice(0, 3)"
                    :key="idx"
                    :src="photo"
                    class="card-photo"
                  />
                  <span v-if="workorder.photos.length > 3" class="more-photos">
                    +{{ workorder.photos.length - 3 }}
                  </span>
                </div>
              </div>

              <div v-if="filteredMobileWorkorders.length === 0" class="empty-list">
                <InboxOutlined style="font-size: 48px; color: #ccc;" />
                <p>暂无工单</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <a-modal
      v-model:open="scannerVisible"
      title="扫描二维码"
      :footer="null"
      :width="400"
      @cancel="closeScanner"
    >
      <div class="scanner-container">
        <div class="scanner-frame">
          <div class="scanner-line"></div>
          <div class="scanner-corners">
            <span class="corner top-left"></span>
            <span class="corner top-right"></span>
            <span class="corner bottom-left"></span>
            <span class="corner bottom-right"></span>
          </div>
        </div>

        <div class="scanner-hint">
          <ScanOutlined style="font-size: 32px; margin-bottom: 12px;" />
          <p>将二维码放入框内</p>
          <p class="hint-text">
            {{ scannerType === 'device' ? '正在扫描设备编号' :
               scannerType === 'batch' ? '正在扫描产品批次' :
               '正在扫描位置信息' }}
          </p>
        </div>

        <a-button
          type="primary"
          block
          size="large"
          style="margin-top: 20px;"
          @click="simulateScan"
        >
          模拟扫描成功
        </a-button>

        <!-- Scan History -->
        <div v-if="scanHistory.length > 0" class="scan-history">
          <a-divider>最近扫描</a-divider>
          <div
            v-for="(scan, index) in scanHistory.slice(0, 3)"
            :key="index"
            class="scan-history-item"
            @click="useScanHistory(scan)"
          >
            <div>{{ scan.value }}</div>
            <div class="scan-history-time">{{ scan.time }}</div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- Camera Modal -->
    <a-modal
      v-model:open="cameraVisible"
      title="拍照上传"
      :footer="null"
      :width="400"
    >
      <div class="camera-container">
        <div class="camera-preview">
          <CameraOutlined style="font-size: 64px; color: #999;" />
          <p>相机预览</p>
          <p class="hint-text">实际应用中这里显示摄像头实时画面</p>
        </div>

        <a-space direction="vertical" style="width: 100%; margin-top: 20px;" :size="12">
          <a-upload
            :before-upload="handlePhotoUpload"
            :show-upload-list="false"
            accept="image/*"
          >
            <a-button type="primary" block size="large">
              <UploadOutlined /> 从相册选择
            </a-button>
          </a-upload>

          <a-button
            type="primary"
            block
            size="large"
            @click="simulateCapture"
          >
            <CameraOutlined /> 拍照
          </a-button>

          <a-button
            block
            size="large"
            @click="cameraVisible = false"
          >
            取消
          </a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- Photo Preview Modal -->
    <a-modal
      v-model:open="photoPreviewVisible"
      title="照片预览"
      :footer="null"
      :width="600"
    >
      <div v-if="previewPhotoIndex !== null" class="photo-preview-container">
        <img
          :src="formData.photos[previewPhotoIndex]?.url"
          style="width: 100%; border-radius: 8px;"
        />
        <div class="photo-metadata">
          <p><strong>大小:</strong> {{ formData.photos[previewPhotoIndex]?.size }}</p>
          <p><strong>时间:</strong> {{ formData.photos[previewPhotoIndex]?.time }}</p>
        </div>
      </div>
    </a-modal>

    <!-- Success Modal -->
    <a-modal
      v-model:open="successVisible"
      title="提交成功"
      :footer="null"
      :width="400"
    >
      <a-result
        status="success"
        title="工单已成功提交！"
      >
        <template #subTitle>
          <div class="success-details">
            <p><strong>工单号:</strong> {{ submittedWorkorder.workorder_no }}</p>
            <p><strong>设备编号:</strong> {{ submittedWorkorder.device_id }}</p>
            <p><strong>异常类型:</strong> {{ submittedWorkorder.fault_type }}</p>
            <p><strong>优先级:</strong> {{ submittedWorkorder.priority }}</p>
            <p><strong>提交时间:</strong> {{ submittedWorkorder.created_at }}</p>
          </div>
        </template>
        <template #extra>
          <a-space>
            <a-button type="primary" @click="continueSubmit">
              继续提交
            </a-button>
            <a-button @click="viewSubmittedWorkorder">
              查看工单
            </a-button>
          </a-space>
        </template>
      </a-result>
    </a-modal>

    <!-- Mobile Detail Drawer -->
    <a-drawer
      v-model:open="mobileDetailVisible"
      title="工单详情"
      placement="bottom"
      :height="500"
      class="mobile-detail-drawer"
    >
      <div v-if="selectedWorkorder" class="mobile-detail">
        <a-descriptions bordered :column="1" size="small">
          <a-descriptions-item label="工单号">
            {{ selectedWorkorder.workorder_no }}
          </a-descriptions-item>
          <a-descriptions-item label="设备编号">
            {{ selectedWorkorder.device_id }}
          </a-descriptions-item>
          <a-descriptions-item label="异常类型">
            <a-tag :color="getFaultColor(selectedWorkorder.fault_type)">
              {{ selectedWorkorder.fault_type }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-badge
              :status="getStatusBadge(selectedWorkorder.status)"
              :text="getStatusText(selectedWorkorder.status)"
            />
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="selectedWorkorder.priority === '紧急' ? 'red' : 'default'">
              {{ selectedWorkorder.priority }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="描述">
            {{ selectedWorkorder.description }}
          </a-descriptions-item>
          <a-descriptions-item label="报告人">
            {{ selectedWorkorder.reporter }}
          </a-descriptions-item>
          <a-descriptions-item label="维修工" v-if="selectedWorkorder.assigned_to">
            {{ selectedWorkorder.assigned_to }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ selectedWorkorder.created_at }}
          </a-descriptions-item>
          <a-descriptions-item label="完成时间" v-if="selectedWorkorder.completed_at">
            {{ selectedWorkorder.completed_at }}
          </a-descriptions-item>
        </a-descriptions>

        <div v-if="selectedWorkorder.photos.length > 0" style="margin-top: 16px;">
          <h4>现场照片</h4>
          <a-space>
            <a-image
              v-for="(photo, index) in selectedWorkorder.photos"
              :key="index"
              :width="80"
              :src="photo"
              :preview="true"
            />
          </a-space>
        </div>

        <a-space style="margin-top: 20px; width: 100%;" direction="vertical">
          <a-button type="primary" block @click="changeMobileStatus">
            更新状态
          </a-button>
          <a-button block @click="mobileDetailVisible = false">
            关闭
          </a-button>
        </a-space>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  DesktopOutlined,
  MobileOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  CameraOutlined,
  ScanOutlined,
  FormOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CloseCircleFilled,
  UploadOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'
import { productionWorkOrders, qmsData } from '../../mock/mockData.js'

// ==================== State Management ====================
const viewMode = ref('desktop')
const activeTab = ref('form')
const submitting = ref(false)
const successVisible = ref(false)
const scannerVisible = ref(false)
const cameraVisible = ref(false)
const photoPreviewVisible = ref(false)
const mobileDetailVisible = ref(false)
const isRefreshing = ref(false)
const previewPhotoIndex = ref(null)
const scannerType = ref('device') // 'device', 'batch', 'location'
const selectedWorkorder = ref(null)

// QMS Integration
const qmsLoading = ref(false)
const selectedBatch = ref(null)

// ==================== Form Data ====================
const formData = ref({
  device_id: '',
  batch_no: '',
  fault_type: '',
  priority: '普通',
  photos: [],
  description: '',
  location: '自动获取: 北京市朝阳区xxx工厂A区'
})

const validationErrors = ref({
  device_id: '',
  batch_no: '',
  fault_type: '',
  priority: '',
  photos: '',
  description: ''
})

// ==================== Workorders Data ====================
// 使用完整Mock数据（已在顶部导入）
const workorders = ref([...productionWorkOrders])

const submittedWorkorder = ref({})
const submissionHistory = ref([])
const scanHistory = ref([])

// ==================== Stats ====================
const stats = computed(() => {
  const pending = workorders.value.filter(w => w.status === 'PENDING').length
  const processing = workorders.value.filter(w => w.status === 'PROCESSING').length
  const completed = workorders.value.filter(w => w.status === 'COMPLETED')

  // Count today's completed (2025-12-11)
  const todayCompleted = completed.filter(w =>
    w.completed_at && w.completed_at.startsWith('2025-12-11')
  ).length

  return {
    pending,
    processing,
    todayCompleted,
    avgResponseTime: 15
  }
})

const workers = ref([
  { name: '李师傅', online: true, currentWorkorders: 1 },
  { name: '赵师傅', online: true, currentWorkorders: 2 },
  { name: '孙师傅', online: false, currentWorkorders: 0 }
])

// ==================== Table Columns ====================
const columns = [
  { title: '工单号', dataIndex: 'workorder_no', key: 'workorder_no', width: 130 },
  { title: '设备编号', dataIndex: 'device_id', key: 'device_id', width: 100 },
  { title: '异常类型', dataIndex: 'fault_type', key: 'fault_type', width: 100 },
  { title: '报告人', dataIndex: 'reporter', key: 'reporter', width: 80 },
  { title: '维修工', dataIndex: 'assigned_to', key: 'assigned_to', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '照片', key: 'photos', width: 100 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

// ==================== Search and Filter ====================
const searchKeyword = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const mobileSearchKeyword = ref('')
const mobileFilterStatus = ref('')

const filteredWorkorders = computed(() => {
  let result = [...workorders.value]

  // Search
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(w =>
      w.workorder_no.toLowerCase().includes(keyword) ||
      w.device_id.toLowerCase().includes(keyword) ||
      w.description.toLowerCase().includes(keyword)
    )
  }

  // Filter by status
  if (filterStatus.value) {
    result = result.filter(w => w.status === filterStatus.value)
  }

  // Filter by priority
  if (filterPriority.value) {
    result = result.filter(w => w.priority === filterPriority.value)
  }

  return result.sort((a, b) => b.workorder_no.localeCompare(a.workorder_no))
})

const filteredMobileWorkorders = computed(() => {
  let result = [...workorders.value]

  // Search
  if (mobileSearchKeyword.value) {
    const keyword = mobileSearchKeyword.value.toLowerCase()
    result = result.filter(w =>
      w.workorder_no.toLowerCase().includes(keyword) ||
      w.device_id.toLowerCase().includes(keyword) ||
      w.description.toLowerCase().includes(keyword)
    )
  }

  // Filter by status
  if (mobileFilterStatus.value) {
    result = result.filter(w => w.status === mobileFilterStatus.value)
  }

  return result.sort((a, b) => b.workorder_no.localeCompare(a.workorder_no))
})

// ==================== Draft Management ====================
const DRAFT_KEY = 'production_workorder_draft'
const hasDraft = ref(false)

const saveDraft = () => {
  if (formData.value.device_id || formData.value.description) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      data: formData.value,
      timestamp: new Date().toISOString()
    }))
  }
}

const loadDraft = () => {
  const draft = localStorage.getItem(DRAFT_KEY)
  if (draft) {
    try {
      const { data } = JSON.parse(draft)
      formData.value = { ...formData.value, ...data }
      hasDraft.value = true
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY)
  hasDraft.value = false
}

// Auto-save draft as user types
watch(formData, () => {
  saveDraft()
}, { deep: true })

// ==================== Validation ====================
const validateField = (field) => {
  validationErrors.value[field] = ''

  switch (field) {
    case 'device_id':
      if (!formData.value.device_id) {
        validationErrors.value.device_id = '请输入设备编号'
      } else if (!/^DEV-[A-Z]-\d{3}$/.test(formData.value.device_id)) {
        validationErrors.value.device_id = '设备编号格式: DEV-A-001'
      }
      break

    case 'batch_no':
      if (!formData.value.batch_no) {
        validationErrors.value.batch_no = '请输入产品批次'
      } else if (!/^BATCH-\d{10}$/.test(formData.value.batch_no)) {
        validationErrors.value.batch_no = '批次格式: BATCH-2025120101'
      }
      break

    case 'fault_type':
      if (!formData.value.fault_type) {
        validationErrors.value.fault_type = '请选择异常类型'
      }
      break

    case 'priority':
      if (!formData.value.priority) {
        validationErrors.value.priority = '请选择优先级'
      }
      break

    case 'description':
      if (!formData.value.description) {
        validationErrors.value.description = '请输入异常描述'
      } else if (formData.value.description.length < 10) {
        validationErrors.value.description = '描述至少需要10个字符'
      }
      break
  }
}

const validateForm = () => {
  const fields = ['device_id', 'batch_no', 'fault_type', 'priority', 'description']
  let isValid = true

  fields.forEach(field => {
    validateField(field)
    if (validationErrors.value[field]) {
      isValid = false
    }
  })

  if (formData.value.photos.length === 0) {
    validationErrors.value.photos = '请至少上传一张现场照片'
    isValid = false
  }

  return isValid
}

// ==================== Form Actions ====================
const submitForm = async () => {
  if (!validateForm()) {
    message.error('请完善表单信息')
    // Haptic feedback simulation
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(200)
    }
    return
  }

  submitting.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Generate workorder number
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
  const timeStr = now.toTimeString().split(' ')[0].slice(0, 5)
  const count = workorders.value.length + 1
  const workorderNo = `WO${dateStr}${String(count).padStart(3, '0')}`

  // Create new workorder
  const newWorkorder = {
    workorder_no: workorderNo,
    device_id: formData.value.device_id,
    batch_no: formData.value.batch_no,
    fault_type: formData.value.fault_type,
    description: formData.value.description,
    reporter: '操作员',
    assigned_to: null,
    status: 'PENDING',
    priority: formData.value.priority,
    created_at: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)} ${timeStr}`,
    completed_at: null,
    photos: formData.value.photos.map(p => p.url)
  }

  // Add to workorders list
  workorders.value.unshift(newWorkorder)

  // Save to submission history
  submissionHistory.value.unshift({
    workorder_no: workorderNo,
    timestamp: newWorkorder.created_at,
    success: true
  })

  // Show success modal
  submittedWorkorder.value = newWorkorder
  successVisible.value = true

  // Clear draft
  clearDraft()

  submitting.value = false

  // Haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate([100, 50, 100])
  }

  message.success('工单提交成功！')
}

const resetForm = () => {
  formData.value = {
    device_id: '',
    batch_no: '',
    fault_type: '',
    priority: '普通',
    photos: [],
    description: '',
    location: '自动获取: 北京市朝阳区xxx工厂A区'
  }

  validationErrors.value = {
    device_id: '',
    batch_no: '',
    fault_type: '',
    priority: '',
    photos: '',
    description: ''
  }

  clearDraft()
  message.info('表单已重置')
}

const continueSubmit = () => {
  successVisible.value = false
  resetForm()
  activeTab.value = 'form'
}

const viewSubmittedWorkorder = () => {
  successVisible.value = false
  activeTab.value = 'list'
  selectedWorkorder.value = submittedWorkorder.value
  mobileDetailVisible.value = true
}

// ==================== Scanner ====================
const openScanner = (type) => {
  scannerType.value = type
  scannerVisible.value = true

  // Auto simulate scan after 2 seconds for demo
  setTimeout(() => {
    if (scannerVisible.value) {
      simulateScan()
    }
  }, 2000)
}

const closeScanner = () => {
  scannerVisible.value = false
}

const simulateScan = () => {
  let scannedValue = ''

  switch (scannerType.value) {
    case 'device':
      scannedValue = `DEV-${String.fromCharCode(65 + Math.floor(Math.random() * 3))}-${String(Math.floor(Math.random() * 900) + 100)}`
      formData.value.device_id = scannedValue
      validateField('device_id')
      break

    case 'batch':
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
      scannedValue = `BATCH-${date.slice(2)}${String(Math.floor(Math.random() * 90) + 10)}`
      formData.value.batch_no = scannedValue
      validateField('batch_no')
      break

    case 'location':
      scannedValue = '北京市朝阳区xxx工厂B区'
      formData.value.location = `自动获取: ${scannedValue}`
      break
  }

  // Add to scan history
  scanHistory.value.unshift({
    type: scannerType.value,
    value: scannedValue,
    time: new Date().toLocaleTimeString()
  })

  // Keep only last 10 scans
  if (scanHistory.value.length > 10) {
    scanHistory.value = scanHistory.value.slice(0, 10)
  }

  scannerVisible.value = false
  message.success(`扫描成功: ${scannedValue}`)

  // Haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50)
  }
}

const useScanHistory = (scan) => {
  switch (scan.type) {
    case 'device':
      formData.value.device_id = scan.value
      validateField('device_id')
      break
    case 'batch':
      formData.value.batch_no = scan.value
      validateField('batch_no')
      break
    case 'location':
      formData.value.location = `自动获取: ${scan.value}`
      break
  }

  scannerVisible.value = false
  message.success('已应用历史扫描记录')
}

// ==================== Camera & Photos ====================
const openCamera = () => {
  if (formData.value.photos.length >= 6) {
    message.warning('最多只能上传6张照片')
    return
  }
  cameraVisible.value = true
}

const simulateCapture = () => {
  const photoUrl = `https://via.placeholder.com/400x300?text=Photo+${formData.value.photos.length + 1}`
  const now = new Date()

  formData.value.photos.push({
    url: photoUrl,
    size: `${(Math.random() * 2 + 1).toFixed(1)}MB`,
    time: now.toLocaleString()
  })

  validationErrors.value.photos = ''
  cameraVisible.value = false
  message.success('照片拍摄成功')

  // Haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50)
  }
}

const handlePhotoUpload = (file) => {
  if (formData.value.photos.length >= 6) {
    message.warning('最多只能上传6张照片')
    return false
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    message.error('只能上传图片文件')
    return false
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过5MB')
    return false
  }

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const now = new Date()
    formData.value.photos.push({
      url: e.target.result,
      size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
      time: now.toLocaleString()
    })

    validationErrors.value.photos = ''
    cameraVisible.value = false
    message.success('照片上传成功')
  }

  reader.readAsDataURL(file)
  return false
}

const removePhoto = (index) => {
  formData.value.photos.splice(index, 1)
  message.info('照片已移除')

  // Haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50)
  }
}

const previewPhoto = (index) => {
  previewPhotoIndex.value = index
  photoPreviewVisible.value = true
}

// ==================== Workorder Management ====================
const createWorkorder = () => {
  if (viewMode.value === 'mobile') {
    activeTab.value = 'form'
    resetForm()
  } else {
    message.info('创建新工单 (Demo)')
  }
}

const viewDetail = (record) => {
  message.info(`查看工单详情: ${record.workorder_no}`)
}

const viewMobileDetail = (workorder) => {
  selectedWorkorder.value = workorder
  mobileDetailVisible.value = true
}

const editWorkorder = (record) => {
  message.info(`编辑工单: ${record.workorder_no}`)
}

const changeStatus = (record) => {
  const statusFlow = {
    'PENDING': 'PROCESSING',
    'PROCESSING': 'COMPLETED',
    'COMPLETED': 'COMPLETED'
  }

  const newStatus = statusFlow[record.status]

  if (newStatus === record.status) {
    message.info('工单已是最终状态')
    return
  }

  record.status = newStatus

  if (newStatus === 'COMPLETED') {
    const now = new Date()
    record.completed_at = now.toLocaleString()
  }

  message.success(`状态已更新为: ${getStatusText(newStatus)}`)
}

const changeMobileStatus = () => {
  if (selectedWorkorder.value) {
    changeStatus(selectedWorkorder.value)
  }
}

const deleteWorkorder = (workorderNo) => {
  const index = workorders.value.findIndex(w => w.workorder_no === workorderNo)
  if (index !== -1) {
    workorders.value.splice(index, 1)
    message.success('工单已删除')
  }
}

// ==================== Search & Filter Actions ====================
const handleSearch = () => {
  // Search is reactive through computed property
  message.info(`搜索: ${searchKeyword.value}`)
}

const handleMobileSearch = () => {
  message.info(`搜索: ${mobileSearchKeyword.value}`)
}

const applyFilters = () => {
  // Filters are reactive through computed property
  message.info('筛选已应用')
}

const applyMobileFilters = () => {
  // Filters are reactive through computed property
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterPriority.value = ''
  message.info('筛选已重置')
}

// ==================== Mobile Pull to Refresh ====================
const mobileScreenRef = ref(null)
let startY = 0
let isPulling = false

const handleTouchStart = (e) => {
  if (activeTab.value === 'list' && mobileScreenRef.value?.scrollTop === 0) {
    startY = e.touches[0].clientY
    isPulling = true
  }
}

const handleTouchMove = (e) => {
  if (!isPulling) return

  const currentY = e.touches[0].clientY
  const diff = currentY - startY

  if (diff > 80) {
    triggerRefresh()
    isPulling = false
  }
}

const handleTouchEnd = () => {
  isPulling = false
}

const triggerRefresh = async () => {
  isRefreshing.value = true

  // Simulate refresh
  await new Promise(resolve => setTimeout(resolve, 1000))

  isRefreshing.value = false
  message.success('刷新完成')

  // Haptic feedback
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50)
  }
}

// ==================== Helper Functions ====================
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

// ==================== QMS Integration ====================
const queryQMSData = async () => {
  qmsLoading.value = true

  // Simulate API call to QMS system
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 从Mock数据中随机选择一个批次记录
  const randomBatch = qmsData.batchInspections[
    Math.floor(Math.random() * qmsData.batchInspections.length)
  ]

  selectedBatch.value = {
    ...randomBatch,
    inspection_status: randomBatch.inspection_status === '已完成' ? '已完成' : '检验中'
  }

  qmsLoading.value = false

  message.success(`QMS数据查询成功 - 批次${randomBatch.batch_no}`)
}

const viewBatchDetails = () => {
  message.info('跳转到批次追溯页面（P2功能，待开发）')
}

// ==================== Lifecycle ====================
onMounted(() => {
  loadDraft()

  // Add touch event listeners for pull-to-refresh
  if (mobileScreenRef.value) {
    mobileScreenRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    mobileScreenRef.value.addEventListener('touchmove', handleTouchMove, { passive: true })
    mobileScreenRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  // Clean up event listeners
  if (mobileScreenRef.value) {
    mobileScreenRef.value.removeEventListener('touchstart', handleTouchStart)
    mobileScreenRef.value.removeEventListener('touchmove', handleTouchMove)
    mobileScreenRef.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style scoped>
.production-workorder {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

/* ==================== Desktop View ==================== */
.list-controls {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

/* ==================== Mobile View ==================== */
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
  overflow-x: hidden;
}

.mobile-header {
  padding: 16px;
  background: #1890ff;
  color: #ffffff;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-header h3 {
  margin: 0 0 12px 0;
  color: #262626;
  font-size: 18px;
  font-weight: 600;
}

.mobile-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.tab-item {
  flex: 1;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tab-item.active {
  background: white;
  color: #1890ff;
  font-weight: 600;
}

/* ==================== Mobile Form ==================== */
.mobile-form {
  padding: 16px;
}

.scan-icon {
  font-size: 20px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
}

.scan-icon:hover {
  color: #40a9ff;
  transform: scale(1.1);
}

.photo-upload {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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
  min-height: 44px;
  font-size: 12px;
  color: #666;
}

.upload-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  transform: scale(1.05);
}

.upload-btn:active {
  transform: scale(0.95);
}

.photo-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.photo-preview:hover {
  transform: scale(1.05);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px;
}

.photo-preview:hover .photo-overlay {
  opacity: 1;
}

.photo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #262626;
}

.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 20px;
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.3s;
}

.photo-remove:hover {
  color: #ff7875;
  transform: scale(1.2);
}

.photo-count {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

/* ==================== Submission History ==================== */
.submission-history {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.history-item {
  font-size: 14px;
}

.history-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* ==================== Mobile List ==================== */
.mobile-list {
  padding: 16px;
}

.refresh-indicator {
  text-align: center;
  padding: 12px;
  color: #1890ff;
  font-size: 14px;
}

.mobile-search {
  margin-bottom: 16px;
}

.mobile-filters {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
}

.filter-tag:active {
  transform: scale(0.95);
}

.mobile-workorder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workorder-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  min-height: 44px;
}

.workorder-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.workorder-card:active {
  transform: translateY(0);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.workorder-no {
  font-weight: 600;
  font-size: 14px;
  color: #1890ff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-row {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.card-row .label {
  color: #999;
  min-width: 48px;
  margin-right: 8px;
}

.card-row .value {
  color: #333;
  flex: 1;
}

.card-row .description {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-photos {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
}

.card-photo {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.more-photos {
  font-size: 12px;
  color: #999;
}

.empty-list {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

/* ==================== Scanner Modal ==================== */
.scanner-container {
  padding: 20px;
}

.scanner-frame {
  width: 100%;
  height: 250px;
  background: #ffffff;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0%, 100% {
    top: 20%;
  }
  50% {
    top: 80%;
  }
}

.scanner-corners {
  position: absolute;
  top: 20%;
  left: 20%;
  right: 20%;
  bottom: 20%;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid white;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.scanner-hint {
  text-align: center;
  color: #262626;
  z-index: 1;
}

.scanner-hint p {
  margin: 8px 0;
}

.hint-text {
  font-size: 12px;
  opacity: 0.8;
}

.scan-history {
  margin-top: 20px;
}

.scan-history-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.scan-history-item:hover {
  background: #e6f7ff;
  transform: translateX(4px);
}

.scan-history-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* ==================== Camera Modal ==================== */
.camera-container {
  padding: 20px;
}

.camera-preview {
  width: 100%;
  height: 250px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.camera-preview p {
  margin: 8px 0;
}

/* ==================== Photo Preview Modal ==================== */
.photo-preview-container {
  text-align: center;
}

.photo-metadata {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  text-align: left;
}

.photo-metadata p {
  margin: 8px 0;
}

/* ==================== Success Modal ==================== */
.success-details {
  text-align: left;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 16px;
}

.success-details p {
  margin: 8px 0;
  font-size: 14px;
}

/* ==================== Mobile Detail Drawer ==================== */
.mobile-detail-drawer .mobile-detail {
  padding: 0;
}

.mobile-detail h4 {
  margin-top: 16px;
  margin-bottom: 12px;
}

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .production-workorder {
    padding: 12px;
  }

  .mobile-container {
    padding: 8px;
    border-radius: 24px;
  }

  .mobile-screen {
    width: calc(100vw - 32px);
    max-width: 375px;
  }
}

/* ==================== Animations ==================== */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.workorder-card {
  animation: fadeIn 0.3s ease-in-out;
}

/* ==================== Touch Optimizations ==================== */
@media (hover: none) and (pointer: coarse) {
  /* Remove hover effects on touch devices */
  .tab-item:hover,
  .upload-btn:hover,
  .scan-icon:hover,
  .photo-preview:hover,
  .workorder-card:hover {
    transform: none;
  }

  /* Add active states for touch feedback */
  .tab-item:active,
  .upload-btn:active,
  .workorder-card:active,
  .filter-tag:active {
    opacity: 0.7;
  }
}

/* ==================== Scrollbar Styling ==================== */
.mobile-screen::-webkit-scrollbar {
  width: 4px;
}

.mobile-screen::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-screen::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 4px;
}

.mobile-screen::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
