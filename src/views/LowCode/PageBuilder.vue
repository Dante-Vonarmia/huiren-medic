<template>
  <div class="page-builder">
    <div class="builder-header">
      <div class="header-title">
        <LayoutOutlined style="font-size: 24px; color: #722ed1" />
        <span>页面构建器</span>
      </div>
      <a-space>
        <a-radio-group v-model:value="device" button-style="solid">
          <a-radio-button value="desktop"><DesktopOutlined /> 桌面</a-radio-button>
          <a-radio-button value="tablet"><TabletOutlined /> 平板</a-radio-button>
          <a-radio-button value="mobile"><MobileOutlined /> 手机</a-radio-button>
        </a-radio-group>
        <a-button type="primary" @click="publish">
          <GlobalOutlined /> 发布
        </a-button>
      </a-space>
    </div>

    <div class="builder-container">
      <!-- 左侧组件 -->
      <div class="component-panel">
        <a-tabs>
          <a-tab-pane key="components" tab="组件">
            <a-collapse default-active-key="['display', 'form', 'data']" ghost>
              <a-collapse-panel key="display" header="展示组件">
                <div class="comp-grid">
                  <div class="comp-item"><TableOutlined /> 表格</div>
                  <div class="comp-item"><BarChartOutlined /> 图表</div>
                  <div class="comp-item"><FileTextOutlined /> 文本</div>
                  <div class="comp-item"><PictureOutlined /> 图片</div>
                </div>
              </a-collapse-panel>
              <a-collapse-panel key="form" header="表单组件">
                <div class="comp-grid">
                  <div class="comp-item"><EditOutlined /> 输入框</div>
                  <div class="comp-item"><DownOutlined /> 下拉框</div>
                  <div class="comp-item"><CalendarOutlined /> 日期</div>
                  <div class="comp-item"><UploadOutlined /> 上传</div>
                </div>
              </a-collapse-panel>
              <a-collapse-panel key="data" header="数据组件">
                <div class="comp-grid">
                  <div class="comp-item"><DatabaseOutlined /> 数据表格</div>
                  <div class="comp-item"><LineChartOutlined /> 趋势图</div>
                  <div class="comp-item"><PieChartOutlined /> 饼图</div>
                  <div class="comp-item"><DashboardOutlined /> 仪表盘</div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>
          <a-tab-pane key="templates" tab="模板">
            <div class="template-list">
              <div class="template-item">📊 数据看板</div>
              <div class="template-item">📝 表单页面</div>
              <div class="template-item">📋 列表页面</div>
              <div class="template-item">📄 详情页面</div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-panel">
        <div class="canvas-wrapper" :class="deviceClass">
          <div class="page-canvas">
            <!-- 模拟页面 -->
            <div class="page-header-demo">
              <h1>客户360视图</h1>
            </div>

            <div class="page-grid">
              <div class="grid-item" style="grid-column: span 2">
                <div class="widget-card">
                  <div class="widget-header">
                    <UserOutlined /> 客户信息
                  </div>
                  <div class="widget-content">
                    <div class="info-row">
                      <span>客户名称:</span>
                      <span>XX医药有限公司</span>
                    </div>
                    <div class="info-row">
                      <span>客户等级:</span>
                      <a-tag color="gold">VIP</a-tag>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid-item">
                <div class="widget-card">
                  <div class="widget-header">
                    <ShoppingOutlined /> 累计订单
                  </div>
                  <div class="widget-content">
                    <div class="stat-value">25</div>
                    <div class="stat-label">笔</div>
                  </div>
                </div>
              </div>

              <div class="grid-item">
                <div class="widget-card">
                  <div class="widget-header">
                    <DollarOutlined /> 订单金额
                  </div>
                  <div class="widget-content">
                    <div class="stat-value">¥285万</div>
                  </div>
                </div>
              </div>

              <div class="grid-item" style="grid-column: span 4">
                <div class="widget-card">
                  <div class="widget-header">
                    <TableOutlined /> 订单历史
                  </div>
                  <div class="widget-content">
                    <table class="demo-table">
                      <thead>
                        <tr>
                          <th>订单号</th>
                          <th>金额</th>
                          <th>状态</th>
                          <th>时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>ORD20251211001</td>
                          <td>¥128,000</td>
                          <td><a-tag color="success">已确认</a-tag></td>
                          <td>2025-12-11</td>
                        </tr>
                        <tr>
                          <td>ORD20251210001</td>
                          <td>¥95,000</td>
                          <td><a-tag color="processing">已发货</a-tag></td>
                          <td>2025-12-10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性 -->
      <div class="property-panel">
        <h3>页面配置</h3>
        <a-form layout="vertical" size="small">
          <a-form-item label="页面标题">
            <a-input value="客户360视图" />
          </a-form-item>
          <a-form-item label="布局方式">
            <a-select value="grid">
              <a-select-option value="grid">网格布局</a-select-option>
              <a-select-option value="flex">弹性布局</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="数据源">
            <a-select value="customer_360">
              <a-select-option value="customer_360">客户360查询</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  LayoutOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  GlobalOutlined,
  TableOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PictureOutlined,
  EditOutlined,
  DownOutlined,
  CalendarOutlined,
  UploadOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined
} from '@ant-design/icons-vue'

const device = ref('desktop')

const deviceClass = computed(() => {
  return `device-${device.value}`
})

const publish = () => {
  message.success('页面发布成功！')
}
</script>

<style scoped>
.page-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.builder-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.component-panel {
  width: 250px;
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
}

.comp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
}

.comp-item {
  padding: 12px 8px;
  background: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  cursor: move;
}

.comp-item:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

.template-list {
  padding: 8px;
}

.template-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
}

.canvas-panel {
  flex: 1;
  overflow: auto;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.canvas-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.device-desktop {
  width: 1200px;
  height: 800px;
}

.device-tablet {
  width: 768px;
  height: 1024px;
}

.device-mobile {
  width: 375px;
  height: 667px;
}

.page-canvas {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.page-header-demo {
  margin-bottom: 24px;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.widget-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.widget-header {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.widget-content {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  text-align: center;
}

.stat-label {
  text-align: center;
  color: #999;
}

.demo-table {
  width: 100%;
  font-size: 12px;
}

.demo-table th {
  padding: 8px;
  background: #fafafa;
  font-weight: 600;
  text-align: left;
}

.demo-table td {
  padding: 8px;
  border-top: 1px solid #f0f0f0;
}

.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}
</style>
