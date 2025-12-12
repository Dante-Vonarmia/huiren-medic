<template>
  <div class="api-management">
    <!-- Platform Header -->
    <div class="api-header">
      <div class="header-content">
        <div class="header-title">
          <ApiOutlined style="font-size: 28px; color: #262626;" />
          <div>
            <h2>API管理中心</h2>
            <p>统一API配置、测试与管理，支持RESTful规范</p>
          </div>
        </div>
        <div class="api-stats">
          <div class="stat-item">
            <CodeOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">{{ apis.length }}</div>
              <div class="stat-label">API端点</div>
            </div>
          </div>
          <div class="stat-item">
            <ThunderboltOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">实时</div>
              <div class="stat-label">测试调用</div>
            </div>
          </div>
          <div class="stat-item">
            <CheckCircleOutlined style="font-size: 20px;" />
            <div>
              <div class="stat-value">100%</div>
              <div class="stat-label">可用率</div>
            </div>
          </div>
        </div>
        <a-button type="primary" @click="createAPI" ghost>
          <PlusOutlined /> 添加API
        </a-button>
      </div>
    </div>

    <a-row :gutter="16">
      <a-col :span="10">
        <a-card title="API列表">
          <a-list
            :data-source="apis"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item
                :class="['api-item', { active: selectedAPI?.api_id === item.api_id }]"
                @click="selectAPI(item)"
              >
                <a-list-item-meta>
                  <template #title>
                    <a-tag :color="getMethodColor(item.method)">{{ item.method }}</a-tag>
                    {{ item.name }}
                  </template>
                  <template #description>
                    {{ item.path }}
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a @click.stop="testAPI(item)">测试</a>
                  <a @click.stop="deleteAPI(item)">删除</a>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="14">
        <a-card title="API配置" v-if="selectedAPI">
          <a-form layout="vertical">
            <a-form-item label="API名称">
              <a-input v-model:value="selectedAPI.name" />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item label="请求方法">
                  <a-select v-model:value="selectedAPI.method">
                    <a-select-option value="GET">GET</a-select-option>
                    <a-select-option value="POST">POST</a-select-option>
                    <a-select-option value="PUT">PUT</a-select-option>
                    <a-select-option value="DELETE">DELETE</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="18">
                <a-form-item label="请求路径">
                  <a-input v-model:value="selectedAPI.path" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="查询参数">
              <div v-for="(param, index) in selectedAPI.params" :key="index" class="param-row">
                <a-input
                  v-model:value="param.name"
                  placeholder="参数名"
                  style="width: 30%"
                />
                <a-select v-model:value="param.type" style="width: 25%">
                  <a-select-option value="string">String</a-select-option>
                  <a-select-option value="number">Number</a-select-option>
                  <a-select-option value="date">Date</a-select-option>
                </a-select>
                <a-checkbox v-model:checked="param.required">必填</a-checkbox>
                <a-button type="text" danger @click="removeParam(index)">
                  <DeleteOutlined />
                </a-button>
              </div>
              <a-button type="dashed" block @click="addParam">
                <PlusOutlined /> 添加参数
              </a-button>
            </a-form-item>

            <a-form-item label="请求体" v-if="selectedAPI.method === 'POST'">
              <a-textarea
                v-model:value="selectedAPI.body"
                :rows="6"
                placeholder='{"key": "value"}'
              />
            </a-form-item>

            <a-divider />

            <a-space>
              <a-button type="primary" @click="testAPI(selectedAPI)">
                <ThunderboltOutlined /> 测试调用
              </a-button>
              <a-button @click="saveAPI">
                <SaveOutlined /> 保存配置
              </a-button>
            </a-space>
          </a-form>

          <a-divider>测试结果</a-divider>

          <div v-if="testResult" class="test-result">
            <div class="result-header">
              <span>状态码: </span>
              <a-tag :color="testResult.status === 200 ? 'success' : 'error'">
                {{ testResult.status }}
              </a-tag>
              <span style="margin-left: 16px">耗时: {{ testResult.duration }}ms</span>
            </div>
            <div class="result-body">
              <pre>{{ testResult.data }}</pre>
            </div>
          </div>
        </a-card>

        <a-empty v-else description="请选择API端点" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  ApiOutlined,
  CodeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'

const apis = ref([
  {
    api_id: 'API_001',
    name: '获取订单列表',
    method: 'GET',
    path: '/orders',
    params: [
      { name: 'date_from', type: 'date', required: true },
      { name: 'date_to', type: 'date', required: true },
      { name: 'status', type: 'string', required: false }
    ]
  },
  {
    api_id: 'API_002',
    name: '创建订单',
    method: 'POST',
    path: '/orders',
    body: '{\n  "customer_id": "C001",\n  "amount": 10000\n}'
  },
  {
    api_id: 'API_003',
    name: '获取客户信息',
    method: 'GET',
    path: '/customers/:id',
    params: []
  }
])

const selectedAPI = ref(apis.value[0])
const testResult = ref(null)

const getMethodColor = (method) => {
  const colors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red'
  }
  return colors[method] || 'default'
}

const selectAPI = (api) => {
  selectedAPI.value = api
  testResult.value = null
}

const addParam = () => {
  if (!selectedAPI.value.params) {
    selectedAPI.value.params = []
  }
  selectedAPI.value.params.push({ name: '', type: 'string', required: false })
}

const removeParam = (index) => {
  selectedAPI.value.params.splice(index, 1)
}

const testAPI = (api) => {
  message.loading('测试中...', 1)
  setTimeout(() => {
    testResult.value = {
      status: 200,
      duration: 156,
      data: JSON.stringify({
        code: 0,
        message: 'success',
        data: [
          {
            order_id: 'ORD20251211001',
            customer_name: 'XX医药有限公司',
            order_amount: 128000,
            order_status: '已确认'
          }
        ],
        total: 125
      }, null, 2)
    }
    message.success('测试成功！')
  }, 1000)
}

const saveAPI = () => {
  message.success('API配置已保存！')
}

const createAPI = () => {
  message.info('创建新API (Demo)')
}

const deleteAPI = (api) => {
  message.error(`删除API: ${api.name} (Demo)`)
}
</script>

<style scoped>
.api-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.api-header {
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

.api-stats {
  display: flex;
  gap: 32px;
}

.api-stats .stat-item {
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

.api-item {
  cursor: pointer;
  transition: all 0.3s;
}

.api-item:hover {
  background: #f5f5f5;
}

.api-item.active {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.param-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.test-result {
  background: #f9f9f9;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.result-header {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #d9d9d9;
}

.result-body {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.result-body pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}
</style>
