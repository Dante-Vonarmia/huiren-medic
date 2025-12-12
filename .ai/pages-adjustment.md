# 页面调整方案 - 汇仁药业低代码平台

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | v2.0 |
| 创建时间 | 2025-12-11 |
| 更新时间 | 2025-12-11 |
| 紧迫度 | 明天演示 |

---

## 1. 页面调整总览

### 1.1 统计数据

| 类型 | 数量 | 说明 |
|------|------|------|
| **现有页面** | 22个 | 包含登录、主框架等基础页面 |
| **保留不变** | 15个 | 核心功能页面 |
| **需要改造** | 2个 | 调整业务逻辑与展示内容 |
| **需要删除** | 2个 | 不符合制药业务场景 |
| **需要新增** | 8个 | 补充制药行业核心场景（优先级分级） |

---

## 2. 保留不变的页面（15个）

### 2.1 基础页面（2个）

| 路由 | 组件 | 说明 | 优先级 |
|------|------|------|--------|
| `/login` | `Login.vue` | 登录页 | P0 |
| `/` | `Dashboard.vue` | 主框架（侧边栏+顶栏+内容区） | P0 |

---

### 2.2 OKR与绩效（5个）

| 路由 | 组件 | 说明 | 优先级 |
|------|------|------|--------|
| `/overview` | `Overview/OperationalDashboard.vue` | 运营总览大屏 | P0 |
| `/okr` | `OKR/OKRList.vue` | OKR列表 | P0 |
| `/okr/create` | `OKR/OKRCreate.vue` | 创建OKR | P0 |
| `/okr/:id` | `OKR/OKRDetail.vue` | OKR详情 | P0 |
| `/performance` | `Performance/PerformanceManagement.vue` | 绩效管理 | P0 |
| `/performance/period` | `Performance/PerformancePeriodManagement.vue` | 绩效周期管理 | P0 |

**保留理由**：PRD核心要求，OKR与绩效管理是演示重点。

---

### 2.3 数据集成（4个）

| 路由 | 组件 | 说明 | 优先级 |
|------|------|------|--------|
| `/datasource` | `DataSource/DataSourceList.vue` | 数据源配置列表 | P0 |
| `/datasource/config/:id?` | `DataSource/DataSourceConfig.vue` | 数据源配置详情 | P0 |
| `/datasource/lineage` | `DataSource/DataLineage.vue` | 数据血缘可视化 | P1 |
| `/datasync` | `DataSync/SyncTaskList.vue` | 数据同步任务 | P1 |
| `/kpi/dict` | `KPI/KPIMetricDict.vue` | KPI指标字典 | P1 |

**保留理由**：展示多系统对接能力，低代码平台核心价值。

---

### 2.4 低代码工具（5个）

| 路由 | 组件 | 说明 | 优先级 |
|------|------|------|--------|
| `/lowcode/form-designer` | `LowCode/FormDesigner.vue` | 表单设计器 | P1 |
| `/lowcode/workflow-designer` | `LowCode/WorkflowDesigner.vue` | 工作流设计器 | P1 |
| `/lowcode/page-builder` | `LowCode/PageBuilder.vue` | 页面构建器 | P1 |
| `/lowcode/api-management` | `LowCode/APIManagement.vue` | API管理 | P1 |
| `/lowcode/app-market` | `LowCode/AppMarket.vue` | 应用市场 | P2 |

**保留理由**：展示低代码平台核心能力，演示价值高。

---

## 3. 需要改造的页面（2个）

### 3.1 运营总览大屏

**路由**：`/overview`
**组件**：`Overview/OperationalDashboard.vue`
**优先级**：P0（明天演示核心）

**现状问题**：
- 缺少制药行业核心指标（产量、合格率、库存预警）
- 缺少六大系统连接状态展示

**改造内容**：

#### 布局调整
```
┌────────────────────────────────────────────────────────────┐
│                      运营总览                                │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│  今日产量   │   合格率    │  库存预警   │  待处理工单      │
│  (MES)     │   (QMS)     │   (WMS)    │  (平台)          │
├─────────────┴─────────────┴─────────────┴─────────────────┤
│                     系统连接状态                             │
│  MES●  QMS●  WMS●  ERP●  OA●  CRM●                       │
├────────────────────────────────────────────────────────────┤
│            生产趋势图 (MES)            │   质量趋势图 (QMS)│
├────────────────────────────────────────┼──────────────────┤
│            异常工单统计                 │   库存分布图     │
└────────────────────────────────────────────────────────────┘
```

#### 新增组件
1. **核心指标卡片**（4个）
   - 今日产量：数字 + 目标完成率 + 趋势箭头
   - 合格率：百分比 + 趋势迷你图
   - 库存预警：数量 + 预警品种列表
   - 待处理工单：数量 + 紧急工单数

2. **系统连接状态**（6个灯）
   - 在线：绿色圆点 + 系统名称
   - 离线：红色圆点 + "连接超时"
   - 点击跳转到数据源配置页

3. **图表模块**（4个）
   - 生产趋势图：折线图（最近7天产量）
   - 质量趋势图：柱状图（最近7天合格率）
   - 异常工单统计：饼图（按类型分布）
   - 库存分布图：雷达图（各品种库存占比）

#### 数据来源（占位）
```javascript
// Mock数据示例
{
  todayOutput: { value: 1200, target: 1500, trend: 'up' }, // MES
  qualityRate: { value: 92, history: [89, 90, 91, 92] },   // QMS
  inventoryAlert: { count: 3, items: ['肾宝片', '六味地黄丸'] }, // WMS
  pendingWorkorders: { count: 8, urgent: 2 },              // 平台
  systemStatus: {
    MES: 'online',
    QMS: 'online',
    WMS: 'online',
    ERP: 'offline', // 模拟离线
    OA: 'online',
    CRM: 'online'
  }
}
```

#### Debug窗口展示
```
[19:00:00] 加载运营总览数据
[19:00:01] API调用：MES → /api/production/today → 200 OK
[19:00:01] API调用：QMS → /api/quality/rate → 200 OK
[19:00:02] API调用：WMS → /api/inventory/alert → 200 OK
[19:00:05] API调用：ERP → /api/order/status → 超时（5秒无响应）
[19:00:05] 警告：ERP连接异常
```

---

### 3.2 生产异常工单

**路由**：`/scenarios/workorder`（改为 `/production/workorder`）
**组件**：`Scenarios/ProductionWorkOrder.vue`（移动到 `Production/`）
**优先级**：P0（演示场景2核心）

**现状问题**：
- 缺少与MES/QMS的联动展示
- 缺少工作流流转可视化

**改造内容**：

#### 工单列表增强
1. **筛选器**
   - 按状态：待处理/处理中/已完成
   - 按类型：设备故障/物料问题/工艺偏差
   - 按紧急程度：普通/紧急/非常紧急

2. **列表字段**
   - 工单编号、标题、类型、状态、创建人、创建时间、处理人

3. **批量操作**
   - 批量分配处理人
   - 批量导出Excel

#### 工单详情增强
1. **工单信息卡片**
   - 基础信息（编号、类型、状态、创建人、创建时间）
   - 异常描述（富文本）
   - 现场照片（图片预览）
   - 批次号（点击跳转到批次追溯页面）

2. **流转记录时间轴**
   ```
   ○ 2025-12-11 18:48:00  车间班组长[王五]创建工单
   ↓
   ○ 2025-12-11 18:48:30  自动分配到质检员[赵六]
   ↓
   ● 2025-12-11 18:50:00  质检员[赵六]处理中...
   ```

3. **关联数据展示**（占位）
   - **MES数据**：设备运行状态、产量数据
   - **QMS数据**：批次检验记录、合格率
   - 点击"查询QMS数据"按钮，模拟API调用

#### Debug窗口展示
```
[18:48:00] 用户[王五]创建工单：批次202512001工艺偏差
[18:48:00] 工作流引擎启动：生产异常处理流程
[18:48:00] API调用：QMS批次查询 → /api/qms/batch/202512001
[18:48:01] QMS返回：批次202512001，检验状态=待检，合格率=87%
[18:48:01] 触发预警：合格率低于阈值90%
[18:48:01] 工作流引擎：流转到审批节点
```

---

## 4. 需要删除的页面（2个）

### 4.1 客户360视图

**路由**：`/scenarios/customer360`
**组件**：`Scenarios/Customer360View.vue`
**优先级**：P3（删除）

**删除原因**：
1. 汇仁药业是B2B2C模式（经销商 + 终端消费者），不适合"客户360"概念
2. 制药企业关注点在生产质量，而非客户行为分析
3. CRM系统已有经销商管理功能，不需要重复建设

**替代方案**：
- 新增"经销商画像"页面（展示经销商的订单数据、回款数据、库存数据）
- 优先级降为P2（非明天演示必须）

---

### 4.2 销售漏斗仪表板

**路由**：`/scenarios/sales-funnel`
**组件**：`Scenarios/SalesFunnelDashboard.vue`
**优先级**：P3（删除）

**删除原因**：
1. 制药企业不适合"销售漏斗"模型（非直销）
2. 订单来源于经销商，不存在"线索→商机→成交"的转化流程

**替代方案**：
- 新增"订单履约看板"页面（展示订单状态、发货进度、逾期订单）
- 优先级降为P2（非明天演示必须）

---

## 5. 需要新增的页面（8个）

### 5.1 P0 - 明天演示必须（0个）
**说明**：现有页面改造后已满足演示需求，暂不新增P0页面。

---

### 5.2 P1 - 建议快速新增（3个）

#### 5.2.1 生产进度看板

**路由**：`/production/progress`
**组件**：`Production/ProductionProgress.vue`（新建）
**优先级**：P1

**功能**：
1. **实时产线状态**
   - 3条产线（肾宝片线、六味地黄丸线、乌鸡白凤丸线）
   - 状态：运行中/停机/维护
   - 当前批次号、已完成数量、目标数量、完成率

2. **看板布局**
   ```
   ┌────────────────────────────────────────┐
   │  产线1：肾宝片线                        │
   │  状态：●运行中   批次：202512001       │
   │  进度：800/1000（80%）[进度条]        │
   └────────────────────────────────────────┘
   ```

3. **数据来源**：MES（占位）

4. **交互**：
   - 点击产线跳转到详情页（P2）
   - 自动刷新（30秒）

---

#### 5.2.2 质量检验工单

**路由**：`/quality/inspection`
**组件**：`Quality/InspectionWorkorder.vue`（新建）
**优先级**：P1

**功能**：
1. **检验工单列表**
   - 字段：批次号、产品名称、检验类型、检验状态、检验员、创建时间
   - 筛选：按状态（待检/检验中/已完成）、按产品

2. **检验详情**
   - 批次信息（批次号、生产日期、产量）
   - 检验项目（含量测定、微生物检测、重金属检测）
   - 检验结果（合格/不合格）
   - 不合格项处理意见

3. **数据来源**：QMS（占位）

4. **与生产工单联动**
   - 生产异常工单中点击"查询QMS数据"，跳转到该页面

---

#### 5.2.3 库存预警

**路由**：`/supply/inventory`
**组件**：`Supply/InventoryAlert.vue`（新建）
**优先级**：P1

**功能**：
1. **预警列表**
   - 字段：产品名称、库存数量、安全库存、预警级别、更新时间
   - 预警级别：
     - 红色：库存 < 安全库存 × 50%
     - 橙色：库存 < 安全库存
     - 绿色：库存充足

2. **库存趋势图**
   - 最近30天的库存变化曲线
   - 安全库存线（虚线）

3. **数据来源**：WMS（占位）

4. **快捷操作**
   - 点击"生成采购建议"（跳转到ERP）

---

### 5.3 P2 - 建议占位展示（5个）

#### 5.3.1 设备状态监控

**路由**：`/production/equipment`
**组件**：`Production/EquipmentMonitor.vue`（新建占位）
**优先级**：P2

**占位内容**：
- 显示"功能开发中，敬请期待"
- 展示设备列表（模拟数据）
- 数据来源：MES

---

#### 5.3.2 不合格品统计

**路由**：`/quality/defect`
**组件**：`Quality/DefectStatistics.vue`（新建占位）
**优先级**：P2

**占位内容**：
- 显示"功能开发中，敬请期待"
- 展示不合格品趋势图（模拟数据）
- 数据来源：QMS

---

#### 5.3.3 批次追溯

**路由**：`/quality/traceability`
**组件**：`Quality/BatchTraceability.vue`（新建占位）
**优先级**：P2

**占位内容**：
- 显示"功能开发中，敬请期待"
- 展示批次追溯流程图（模拟数据）
- 数据来源：QMS + MES + WMS

---

#### 5.3.4 订单履约看板

**路由**：`/supply/order`
**组件**：`Supply/OrderFulfillment.vue`（新建占位）
**优先级**：P2

**占位内容**：
- 显示"功能开发中，敬请期待"
- 展示订单状态统计（模拟数据）
- 数据来源：ERP + WMS

---

#### 5.3.5 经销商画像

**路由**：`/supply/dealer`
**组件**：`Supply/DealerProfile.vue`（新建占位）
**优先级**：P2

**占位内容**：
- 显示"功能开发中，敬请期待"
- 展示经销商列表（模拟数据）
- 数据来源：CRM + ERP

---

## 6. 导航菜单结构调整

### 6.1 调整后的菜单（Dashboard.vue）

```javascript
const menuItems = [
  {
    key: 'overview',
    icon: 'DashboardOutlined',
    title: '运营总览',
    path: '/overview'
  },
  {
    key: 'okr-performance',
    icon: 'AimOutlined',
    title: 'OKR与绩效',
    children: [
      { key: '/okr', title: 'OKR管理' },
      { key: '/performance', title: '绩效管理', roles: ['manager', 'hr', 'admin'] },
      { key: '/performance/period', title: '绩效周期管理', roles: ['hr', 'admin'] }
    ]
  },
  {
    key: 'production',
    icon: 'ToolOutlined',
    title: '生产管理',
    children: [
      { key: '/production/workorder', title: '生产异常工单' },
      { key: '/production/progress', title: '生产进度看板' },
      { key: '/production/equipment', title: '设备状态监控', badge: '占位' }
    ]
  },
  {
    key: 'quality',
    icon: 'SafetyOutlined',
    title: '质量管理',
    children: [
      { key: '/quality/inspection', title: '质量检验工单' },
      { key: '/quality/defect', title: '不合格品统计', badge: '占位' },
      { key: '/quality/traceability', title: '批次追溯', badge: '占位' }
    ]
  },
  {
    key: 'supply',
    icon: 'ShoppingOutlined',
    title: '供应链管理',
    children: [
      { key: '/supply/inventory', title: '库存预警' },
      { key: '/supply/order', title: '订单履约看板', badge: '占位' },
      { key: '/supply/dealer', title: '经销商画像', badge: '占位' }
    ]
  },
  {
    key: 'data',
    icon: 'DatabaseOutlined',
    title: '数据集成',
    roles: ['admin'],
    children: [
      { key: '/datasource', title: '数据源配置' },
      { key: '/datasource/lineage', title: '数据血缘' },
      { key: '/datasync', title: '数据同步任务' },
      { key: '/kpi/dict', title: 'KPI指标字典', roles: ['admin', 'manager'] }
    ]
  },
  {
    key: 'lowcode',
    icon: 'BuildOutlined',
    title: '低代码工具',
    children: [
      { key: '/lowcode/form-designer', title: '表单设计器' },
      { key: '/lowcode/workflow-designer', title: '工作流设计器' },
      { key: '/lowcode/page-builder', title: '页面构建器' },
      { key: '/lowcode/api-management', title: 'API管理' },
      { key: '/lowcode/app-market', title: '应用市场' }
    ]
  },
  {
    key: 'other',
    icon: 'AppstoreOutlined',
    title: '其他场景',
    children: [
      { key: '/scenarios/expense', title: '费用报销' }
    ]
  }
]
```

---

## 7. 实施优先级排序

### 7.1 明天演示（2025-12-12）必须完成

| 优先级 | 任务 | 预计工时 | 负责人 |
|-------|------|---------|--------|
| **P0-1** | 改造"运营总览"页面 | 4小时 | Frontend |
| **P0-2** | 改造"生产异常工单"页面 | 3小时 | Frontend |
| **P0-3** | 调整导航菜单结构（Dashboard.vue） | 1小时 | Frontend |
| **P0-4** | 删除"客户360"和"销售漏斗"页面 | 0.5小时 | Frontend |
| **P0-5** | 准备演示数据（Mock） | 1小时 | Frontend |
| **合计** | - | **9.5小时** | - |

---

### 7.2 本周完成（2025-12-13 - 12-15）

| 优先级 | 任务 | 预计工时 | 负责人 |
|-------|------|---------|--------|
| **P1-1** | 新增"生产进度看板"页面 | 3小时 | Frontend |
| **P1-2** | 新增"质量检验工单"页面 | 3小时 | Frontend |
| **P1-3** | 新增"库存预警"页面 | 2小时 | Frontend |
| **P1-4** | 完善Debug窗口（日志分类、颜色） | 2小时 | Frontend |
| **合计** | - | **10小时** | - |

---

### 7.3 下周占位（2025-12-16 - 12-20）

| 优先级 | 任务 | 预计工时 | 负责人 |
|-------|------|---------|--------|
| **P2-1** | 新增5个占位页面（设备监控、不合格品、批次追溯、订单看板、经销商画像） | 5小时 | Frontend |
| **P2-2** | 完善数据源配置（6个系统占位） | 2小时 | Frontend |
| **P2-3** | 完善KPI指标字典（制药行业指标） | 2小时 | PM + Frontend |
| **合计** | - | **9小时** | - |

---

## 8. 文件操作清单

### 8.1 需要修改的文件

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|--------|
| `src/router/index.js` | 调整路由（删除2个、新增8个、移动1个） | P0 |
| `src/views/Dashboard.vue` | 调整导航菜单结构 | P0 |
| `src/views/Overview/OperationalDashboard.vue` | 重构页面（新增6个系统状态、4个指标卡片、4个图表） | P0 |
| `src/views/Scenarios/ProductionWorkOrder.vue` | 移动到`src/views/Production/`，增强功能 | P0 |

---

### 8.2 需要删除的文件

| 文件路径 | 删除原因 | 优先级 |
|---------|---------|--------|
| `src/views/Scenarios/Customer360View.vue` | 不符合制药业务 | P0 |
| `src/views/Scenarios/SalesFunnelDashboard.vue` | 不符合制药业务 | P0 |

---

### 8.3 需要新增的文件

| 文件路径 | 功能 | 优先级 |
|---------|------|--------|
| `src/views/Production/ProductionProgress.vue` | 生产进度看板 | P1 |
| `src/views/Quality/InspectionWorkorder.vue` | 质量检验工单 | P1 |
| `src/views/Supply/InventoryAlert.vue` | 库存预警 | P1 |
| `src/views/Production/EquipmentMonitor.vue` | 设备状态监控（占位） | P2 |
| `src/views/Quality/DefectStatistics.vue` | 不合格品统计（占位） | P2 |
| `src/views/Quality/BatchTraceability.vue` | 批次追溯（占位） | P2 |
| `src/views/Supply/OrderFulfillment.vue` | 订单履约看板（占位） | P2 |
| `src/views/Supply/DealerProfile.vue` | 经销商画像（占位） | P2 |

---

## 9. 风险与建议

### 9.1 风险

| 风险项 | 影响 | 应对措施 |
|-------|------|---------|
| 时间紧迫（明天演示） | 功能不完整 | 优先完成P0任务，P1/P2占位展示 |
| 数据来源未真实对接 | 演示不真实 | 使用Mock数据，但展示对接配置界面 |
| Debug窗口可能干扰演示 | 页面拥挤 | 设计为可收起的浮动窗口，默认展开 |

---

### 9.2 建议

1. **明天演示流程**
   - 场景1：OKR + 绩效管理（10分钟）
   - 场景2：生产 + 质量管理（10分钟）
   - 场景3：低代码工具演示（5分钟）
   - 合计：25分钟（含问答）

2. **演示准备**
   - 准备3套测试账号（员工、经理、管理员）
   - 准备Mock数据脚本（自动生成OKR、工单、指标数据）
   - 准备演讲稿（突出低代码价值、多系统对接、制药行业适配）

3. **后续优化**
   - P1任务：本周完成（补充3个核心页面）
   - P2任务：下周完成（占位页面 + 数据字典完善）
   - M2里程碑（2025-12-20）：6个系统占位展示完整

---

**文档结束**
