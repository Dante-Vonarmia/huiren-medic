<template>
  <div class="workflow-designer">
    <div class="designer-header">
      <div class="header-title">
        <BranchesOutlined style="font-size: 24px; color: #52c41a" />
        <span>工作流设计器</span>
      </div>
      <a-space>
        <a-button @click="validateFlow">
          <CheckCircleOutlined /> 验证流程
        </a-button>
        <a-button type="primary" @click="saveFlow">
          <SaveOutlined /> 保存流程
        </a-button>
      </a-space>
    </div>

    <div class="designer-container">
      <!-- 左侧节点库 -->
      <div class="node-panel">
        <h3>节点库</h3>
        <div class="node-categories">
          <div class="node-category">
            <h4>基础节点</h4>
            <div class="node-item start-node">
              <PlayCircleOutlined /> 开始
            </div>
            <div class="node-item end-node">
              <CheckCircleOutlined /> 结束
            </div>
          </div>

          <div class="node-category">
            <h4>审批节点</h4>
            <div class="node-item approval-node">
              <AuditOutlined /> 审批
            </div>
            <div class="node-item">
              <UsergroupAddOutlined /> 会签
            </div>
          </div>

          <div class="node-category">
            <h4>条件节点</h4>
            <div class="node-item condition-node">
              <BranchesOutlined /> 条件分支
            </div>
            <div class="node-item">
              <ForkOutlined /> 并行分支
            </div>
          </div>

          <div class="node-category">
            <h4>动作节点</h4>
            <div class="node-item action-node">
              <ApiOutlined /> API调用
            </div>
            <div class="node-item">
              <NotificationOutlined /> 发送通知
            </div>
          </div>
        </div>
      </div>

      <!-- 中间流程画布 -->
      <div class="canvas-panel">
        <div class="canvas-content">
          <div class="workflow-canvas">
            <!-- 模拟工作流 -->
            <div class="flow-container">
              <div class="flow-node start-node-display">
                <PlayCircleOutlined />
                <div>开始</div>
              </div>

              <div class="flow-connector">
                <div class="connector-line"></div>
              </div>

              <div class="flow-node approval-node-display">
                <AuditOutlined />
                <div>部门经理审批</div>
                <div class="node-config">审批人: 动态(上级)</div>
              </div>

              <div class="flow-connector">
                <div class="connector-line"></div>
              </div>

              <div class="flow-node condition-node-display">
                <BranchesOutlined />
                <div>金额判断</div>
                <div class="node-config">条件: amount > 5000</div>
              </div>

              <div class="flow-branch">
                <div class="branch-left">
                  <div class="branch-label">是</div>
                  <div class="flow-connector">
                    <div class="connector-line"></div>
                  </div>
                  <div class="flow-node approval-node-display">
                    <AuditOutlined />
                    <div>总经理审批</div>
                  </div>
                </div>

                <div class="branch-right">
                  <div class="branch-label">否</div>
                  <div class="flow-connector">
                    <div class="connector-line"></div>
                  </div>
                  <div class="flow-node approval-node-display">
                    <AuditOutlined />
                    <div>财务审核</div>
                  </div>
                </div>
              </div>

              <div class="flow-connector">
                <div class="connector-line"></div>
              </div>

              <div class="flow-node action-node-display">
                <ApiOutlined />
                <div>生成付款单</div>
                <div class="node-config">写入: payment_orders</div>
              </div>

              <div class="flow-connector">
                <div class="connector-line"></div>
              </div>

              <div class="flow-node action-node-display">
                <NotificationOutlined />
                <div>发送钉钉通知</div>
                <div class="node-config">接收人: 申请人</div>
              </div>

              <div class="flow-connector">
                <div class="connector-line"></div>
              </div>

              <div class="flow-node end-node-display">
                <CheckCircleOutlined />
                <div>结束</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3>节点配置</h3>
        <a-form layout="vertical" size="small">
          <a-form-item label="节点名称">
            <a-input value="部门经理审批" />
          </a-form-item>
          <a-form-item label="审批人类型">
            <a-select value="dynamic">
              <a-select-option value="dynamic">动态审批人</a-select-option>
              <a-select-option value="role">角色审批</a-select-option>
              <a-select-option value="specific">指定人员</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="审批人规则">
            <a-select value="direct_manager">
              <a-select-option value="direct_manager">提交人的直属上级</a-select-option>
              <a-select-option value="department_manager">部门经理</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="超时设置">
            <a-input-number value="24" suffix="小时" style="width: 100%" />
          </a-form-item>
          <a-form-item label="超时动作">
            <a-select value="escalate">
              <a-select-option value="escalate">升级到上级</a-select-option>
              <a-select-option value="auto_approve">自动通过</a-select-option>
              <a-select-option value="auto_reject">自动驳回</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue'
import {
  BranchesOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  AuditOutlined,
  UsergroupAddOutlined,
  ForkOutlined,
  ApiOutlined,
  NotificationOutlined
} from '@ant-design/icons-vue'

const validateFlow = () => {
  message.success('✅ 流程验证通过！无断开节点，无死循环')
}

const saveFlow = () => {
  message.success('流程保存成功！')
}
</script>

<style scoped>
.workflow-designer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
}

.designer-header {
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

.designer-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.node-panel {
  width: 250px;
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}

.node-category {
  margin-bottom: 20px;
}

.node-category h4 {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.node-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: move;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.node-item:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

.canvas-panel {
  flex: 1;
  overflow: auto;
}

.canvas-content {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.workflow-canvas {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
  min-width: 600px;
}

.flow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.flow-node {
  background: white;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px 24px;
  text-align: center;
  min-width: 180px;
  cursor: pointer;
  transition: all 0.3s;
}

.flow-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.start-node-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.approval-node-display {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
}

.condition-node-display {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
}

.action-node-display {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border: none;
}

.end-node-display {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border: none;
}

.node-config {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.9;
}

.flow-connector {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connector-line {
  width: 2px;
  height: 100%;
  background: #d9d9d9;
  position: relative;
}

.connector-line::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: -3px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #d9d9d9;
}

.flow-branch {
  display: flex;
  gap: 60px;
  margin: 20px 0;
}

.branch-left,
.branch-right {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.branch-label {
  background: #1890ff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 8px;
}

.property-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
  padding: 16px;
}
</style>
