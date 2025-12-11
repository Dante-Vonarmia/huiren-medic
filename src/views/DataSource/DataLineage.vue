<template>
  <div class="data-lineage">
    <a-page-header
      title="数据血缘分析"
      sub-title="追溯数据来源，可视化数据流转路径"
    >
      <template #extra>
        <a-space>
          <a-select v-model:value="selectedMetric" style="width: 200px" placeholder="选择指标">
            <a-select-option value="order_ontime_rate">订单准时率</a-select-option>
            <a-select-option value="customer_satisfaction">客户满意度</a-select-option>
            <a-select-option value="attendance_rate">出勤率</a-select-option>
          </a-select>
          <a-button @click="resetGraph">
            <ReloadOutlined /> 重置
          </a-button>
          <a-button type="primary" @click="exportGraph">
            <DownloadOutlined /> 导出图谱
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <!-- 左侧图谱 -->
      <a-col :span="18">
        <a-card title="数据血缘图谱" :body-style="{ padding: 0, height: '600px' }">
          <div id="lineage-graph" style="width: 100%; height: 100%; background: #f9f9f9">
            <!-- 模拟血缘图 -->
            <div class="lineage-visualization">
              <div class="lineage-node source-node">
                <div class="node-icon">🗄️</div>
                <div class="node-label">ERP订单系统</div>
                <div class="node-detail">orders表</div>
              </div>

              <div class="lineage-arrow">
                <div class="arrow-label">REST API调用</div>
                <div class="arrow-line"></div>
              </div>

              <div class="lineage-node transform-node">
                <div class="node-icon">🔄</div>
                <div class="node-label">字段映射 & 转换</div>
                <div class="node-detail">
                  <div>• order_amount / 100</div>
                  <div>• CONFIRMED → 已确认</div>
                </div>
              </div>

              <div class="lineage-arrow">
                <div class="arrow-label">数据写入</div>
                <div class="arrow-line"></div>
              </div>

              <div class="lineage-node platform-node">
                <div class="node-icon">💾</div>
                <div class="node-label">平台订单表</div>
                <div class="node-detail">orders (本地)</div>
              </div>

              <div class="lineage-arrow">
                <div class="arrow-label">SQL聚合</div>
                <div class="arrow-line"></div>
              </div>

              <div class="lineage-node kpi-node">
                <div class="node-icon">📊</div>
                <div class="node-label">订单准时率指标</div>
                <div class="node-detail">92.5%</div>
              </div>

              <div class="lineage-arrow">
                <div class="arrow-label">绩效计算</div>
                <div class="arrow-line"></div>
              </div>

              <div class="lineage-node result-node">
                <div class="node-icon">🎯</div>
                <div class="node-label">张伟 Q4绩效</div>
                <div class="node-detail">得分: 30/30</div>
              </div>

              <div class="lineage-arrow">
                <div class="arrow-label">汇总</div>
                <div class="arrow-line"></div>
              </div>

              <div class="lineage-node final-node">
                <div class="node-icon">⭐</div>
                <div class="node-label">综合绩效</div>
                <div class="node-detail">91分 (A)</div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧详情 -->
      <a-col :span="6">
        <a-card title="节点详情" v-if="selectedNode">
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="节点名称">
              {{ selectedNode.name }}
            </a-descriptions-item>
            <a-descriptions-item label="节点类型">
              <a-tag :color="selectedNode.color">{{ selectedNode.type }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">
              {{ selectedNode.updateTime }}
            </a-descriptions-item>
          </a-descriptions>

          <a-divider />

          <div v-if="selectedNode.transforms">
            <h4>转换规则</h4>
            <div v-for="(rule, index) in selectedNode.transforms" :key="index" class="transform-rule">
              <CodeOutlined /> {{ rule }}
            </div>
          </div>

          <div v-if="selectedNode.formula">
            <h4>计算公式</h4>
            <div class="formula-box">
              <pre>{{ selectedNode.formula }}</pre>
            </div>
          </div>
        </a-card>

        <a-card title="数据质量" style="margin-top: 16px">
          <a-statistic title="数据准确率" :value="99.2" suffix="%" :value-style="{ color: '#3f8600' }">
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
          <a-divider />
          <a-statistic title="同步延迟" :value="2.3" suffix="秒" :value-style="{ color: '#1890ff' }">
            <template #prefix><ClockCircleOutlined /></template>
          </a-statistic>
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
  CodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

const selectedMetric = ref('order_ontime_rate')

const selectedNode = ref({
  name: '字段映射 & 转换',
  type: '数据转换',
  color: 'orange',
  updateTime: '2025-12-11 14:00:00',
  transforms: [
    'order_id → order_no (直接映射)',
    'order_amount / 100 → order_amount (元)',
    'CONFIRMED → 已确认 (枚举映射)',
    'ISO8601 → 本地时间 (格式转换)'
  ]
})

const resetGraph = () => {
  message.info('重置图谱')
}

const exportGraph = () => {
  message.success('导出图谱 (Demo)')
}
</script>

<style scoped>
.data-lineage {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.lineage-visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 20px;
}

.lineage-node {
  background: white;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s;
}

.lineage-node:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.source-node {
  border-color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.transform-node {
  border-color: #faad14;
  background: linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%);
}

.platform-node {
  border-color: #52c41a;
  background: linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%);
}

.kpi-node {
  border-color: #722ed1;
  background: linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%);
}

.result-node {
  border-color: #eb2f96;
  background: linear-gradient(135deg, #fff0f6 0%, #ffadd2 100%);
}

.final-node {
  border-color: #faad14;
  background: linear-gradient(135deg, #fff7e6 0%, #ffd666 100%);
}

.node-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.node-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.node-detail {
  font-size: 12px;
  color: #666;
}

.lineage-arrow {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.arrow-label {
  font-size: 12px;
  color: #999;
  background: white;
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: -8px;
  z-index: 1;
}

.arrow-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #d9d9d9 0%, #1890ff 100%);
  position: relative;
}

.arrow-line::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: -4px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 8px solid #1890ff;
}

.transform-rule {
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.formula-box {
  background: #1e1e1e;
  color: #00ff00;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  overflow-x: auto;
}

.formula-box pre {
  margin: 0;
}
</style>
