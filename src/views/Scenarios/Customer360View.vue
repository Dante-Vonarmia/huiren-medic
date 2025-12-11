<template>
  <div class="customer-360">
    <a-page-header
      title="客户360视图"
      sub-title="整合CRM + ERP + WMS多源数据"
      @back="() => $router.back()"
    >
      <template #extra>
        <a-button @click="refreshData">
          <ReloadOutlined /> 刷新
        </a-button>
        <a-button type="primary" @click="exportData">
          <DownloadOutlined /> 导出
        </a-button>
      </template>
    </a-page-header>

    <!-- 客户基础信息卡片 -->
    <a-card class="customer-info-card">
      <a-row :gutter="24" align="middle">
        <a-col :span="2">
          <a-avatar :size="80" style="background: #1890ff">
            {{ customerInfo.name.substring(0, 2) }}
          </a-avatar>
        </a-col>
        <a-col :span="10">
          <h2 style="margin: 0">{{ customerInfo.name }}</h2>
          <a-space style="margin-top: 8px">
            <a-tag color="gold">{{ customerInfo.level }}</a-tag>
            <span style="color: #999">{{ customerInfo.industry }}</span>
            <span style="color: #999">创建于: {{ customerInfo.created_at }}</span>
          </a-space>
          <div style="margin-top: 12px">
            <PhoneOutlined /> {{ customerInfo.phone }}
            <EnvironmentOutlined style="margin-left: 16px" /> {{ customerInfo.address }}
          </div>
        </a-col>
        <a-col :span="12">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-statistic
                title="累计订单"
                :value="customerStats.totalOrders"
                suffix="笔"
              >
                <template #prefix><ShoppingOutlined /></template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
              <a-statistic
                title="订单金额"
                :value="customerStats.totalAmount / 10000"
                suffix="万元"
                :precision="2"
              >
                <template #prefix><DollarOutlined /></template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
              <a-statistic
                title="发货次数"
                :value="customerStats.totalShipments"
                suffix="次"
              >
                <template #prefix><RocketOutlined /></template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 左侧标签页 -->
      <a-col :span="18">
        <a-card>
          <a-tabs>
            <a-tab-pane key="orders" tab="订单历史">
              <div class="data-source-badge">
                <DatabaseOutlined /> 数据来源: ERP订单系统
              </div>
              <a-table
                :columns="orderColumns"
                :data-source="orders"
                :pagination="{ pageSize: 5 }"
                size="small"
              >
                <template #order_no="{ record }">
                  <a>{{ record.order_no }}</a>
                </template>
                <template #order_amount="{ text }">
                  ¥{{ text.toLocaleString() }}
                </template>
                <template #order_status="{ text }">
                  <a-tag :color="getStatusColor(text)">{{ text }}</a-tag>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="shipments" tab="发货记录">
              <div class="data-source-badge">
                <DatabaseOutlined /> 数据来源: WMS仓储系统
              </div>
              <a-table
                :columns="shipmentColumns"
                :data-source="shipments"
                :pagination="{ pageSize: 5 }"
                size="small"
              />
            </a-tab-pane>

            <a-tab-pane key="ratings" tab="客户评价">
              <div class="data-source-badge">
                <DatabaseOutlined /> 数据来源: CRM客户系统
              </div>
              <a-list
                :data-source="ratings"
                item-layout="horizontal"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta>
                      <template #title>
                        <a-rate :value="item.rating" disabled />
                        <span style="margin-left: 8px">{{ item.create_time }}</span>
                      </template>
                      <template #description>
                        {{ item.comment }}
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>

      <!-- 右侧数据卡片 -->
      <a-col :span="6">
        <a-card title="数据同步状态" size="small" style="margin-bottom: 16px">
          <div class="sync-status">
            <div class="sync-item">
              <SyncOutlined :spin="true" style="color: #52c41a" />
              <span>CRM客户信息</span>
              <a-tag color="success" size="small">实时</a-tag>
            </div>
            <div class="sync-item">
              <SyncOutlined :spin="true" style="color: #52c41a" />
              <span>ERP订单数据</span>
              <a-tag color="success" size="small">2小时前</a-tag>
            </div>
            <div class="sync-item">
              <SyncOutlined :spin="true" style="color: #52c41a" />
              <span>WMS发货记录</span>
              <a-tag color="success" size="small">1小时前</a-tag>
            </div>
          </div>
        </a-card>

        <a-card title="销售负责人" size="small">
          <div style="text-align: center">
            <a-avatar :size="64" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix">
            </a-avatar>
            <h3 style="margin-top: 12px">张伟</h3>
            <p style="color: #999">销售部</p>
            <a-button type="primary" size="small" block>
              <PhoneOutlined /> 联系
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  DownloadOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RocketOutlined,
  DatabaseOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'

const customerInfo = ref({
  name: 'XX医药有限公司',
  level: 'VIP客户',
  industry: '医药批发',
  phone: '138****5678',
  address: '北京市朝阳区xxx',
  created_at: '2023-05-10'
})

const customerStats = ref({
  totalOrders: 25,
  totalAmount: 2850000,
  totalShipments: 18
})

const orderColumns = [
  { title: '订单号', dataIndex: 'order_no', key: 'order_no', slots: { customRender: 'order_no' } },
  { title: '订单金额', dataIndex: 'order_amount', key: 'order_amount', slots: { customRender: 'order_amount' } },
  { title: '订单状态', dataIndex: 'order_status', key: 'order_status', slots: { customRender: 'order_status' } },
  { title: '下单时间', dataIndex: 'create_time', key: 'create_time' }
]

const orders = ref([
  { order_no: 'ORD20251211001', order_amount: 128000, order_status: '已确认', create_time: '2025-12-11 08:30' },
  { order_no: 'ORD20251210001', order_amount: 95000, order_status: '已发货', create_time: '2025-12-10 14:20' },
  { order_no: 'ORD20251209001', order_amount: 156000, order_status: '已交付', create_time: '2025-12-09 10:15' },
  { order_no: 'ORD20251208001', order_amount: 88000, order_status: '已交付', create_time: '2025-12-08 16:30' },
  { order_no: 'ORD20251207001', order_amount: 210000, order_status: '已交付', create_time: '2025-12-07 09:45' }
])

const shipmentColumns = [
  { title: '发货单号', dataIndex: 'shipment_no', key: 'shipment_no' },
  { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity' },
  { title: '发货日期', dataIndex: 'shipment_date', key: 'shipment_date' }
]

const shipments = ref([
  { shipment_no: 'SHIP20251210001', product_name: '感冒灵颗粒', quantity: 500, shipment_date: '2025-12-10' },
  { shipment_no: 'SHIP20251209001', product_name: '板蓝根颗粒', quantity: 800, shipment_date: '2025-12-09' },
  { shipment_no: 'SHIP20251208001', product_name: '999感冒灵', quantity: 300, shipment_date: '2025-12-08' }
])

const ratings = ref([
  { rating: 5, comment: '产品质量很好，配送及时', create_time: '2025-12-10' },
  { rating: 4, comment: '服务态度不错，价格合理', create_time: '2025-12-05' },
  { rating: 5, comment: '长期合作伙伴，值得信赖', create_time: '2025-11-28' }
])

const getStatusColor = (status) => {
  const colors = {
    '已确认': 'blue',
    '已发货': 'processing',
    '已交付': 'success',
    '已取消': 'default'
  }
  return colors[status] || 'default'
}

const refreshData = () => {
  message.success('数据已刷新')
}

const exportData = () => {
  message.success('导出客户数据 (Demo)')
}
</script>

<style scoped>
.customer-360 {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.customer-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.customer-info-card :deep(.ant-card-body) {
  padding: 24px;
}

.customer-info-card h2 {
  color: white;
}

.data-source-badge {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  font-size: 12px;
  color: #1890ff;
}

.sync-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sync-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.sync-item span {
  flex: 1;
}
</style>
