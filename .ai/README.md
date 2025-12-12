# 汇仁药业低代码平台 - 产品文档导航

## 文档版本
- **版本**：v2.0
- **创建时间**：2025-12-11
- **更新时间**：2025-12-11
- **状态**：调整中（明天演示）

---

## 核心文档

### 1. 产品需求文档（prd.md）
**用途**：整体产品规划、功能清单、优先级排序

**核心内容**：
- 企业背景：汇仁药业（中成药制造，1400员工，400亩厂区）
- 核心诉求：OKR + 绩效管理、多系统数据聚合、低代码工具展示
- 功能列表：22个页面（15个保留、2个改造、2个删除、8个新增）
- 优先级：P0（明天演示）、P1（本周）、P2（下周）
- 里程碑：M1（2025-12-12）、M2（2025-12-20）、M3（2026-01-15）

**阅读对象**：所有团队成员

---

### 2. 流程与交互设计（flows.md）
**用途**：页面关系、用户流程、状态迁移、异常处理

**核心内容**：
- 调整后的导航结构（8个分组）
- 3个核心演示场景流程：
  - 场景1：OKR + 绩效管理全流程
  - 场景2：生产 + 质量管理联动
  - 场景3：多系统数据聚合展示
- Debug窗口展示规则（日志分类、颜色、位置）
- 空态与异常处理

**阅读对象**：Frontend、Designer、QA

---

### 3. 页面调整方案（pages-adjustment.md）
**用途**：页面调整清单、实施优先级、风险应对

**核心内容**：
- 保留不变的页面（15个）
- 需要改造的页面（2个）：运营总览、生产异常工单
- 需要删除的页面（2个）：客户360视图、销售漏斗仪表板
- 需要新增的页面（8个）：3个P1 + 5个P2占位
- 实施优先级排序（按"明天演示"紧迫度）

**阅读对象**：Frontend、PM、QA

---

### 4. 字段字典（dictionary.md）
**用途**：数据表结构、字段定义、权限控制、数据来源

**核心内容**：
- 核心业务表（6个）：okr、key_result、performance_period、performance_evaluation、production_workorder、workorder_flow
- 数据源配置表（2个）：datasource、sync_task
- KPI指标表（1个）：kpi_metric
- 用户与权限表（1个）：users
- 外部系统数据（6个，占位）：MES、QMS、WMS、ERP、OA、CRM
- 审计日志表（1个）：audit_log

**阅读对象**：Backend、Frontend、PM

---

### 5. KPI指标字典（kpi.md）
**用途**：指标定义、计算口径、责任部门、刷新频率

**核心内容**：
- 生产管理指标（3个）：今日产量、产能达成率、设备综合效率（OEE）
- 质量管理指标（4个）：合格率、一次检验合格率、不合格品数量、检验及时率
- 库存管理指标（3个）：库存预警数量、库存周转率、呆滞库存占比
- 订单管理指标（3个）：订单按时交付率、订单完成率、平均订单金额
- 工单管理指标（3个）：待处理工单数、工单平均处理时长、紧急工单占比
- OKR与绩效指标（3个）：OKR整体完成度、绩效平均分、OKR审批及时率
- 系统对接指标（2个）：数据源在线率、数据同步成功率

**阅读对象**：Backend、Frontend、Charts、PM

---

### 6. 约定规范（convention.md）
**用途**：命名规范、目录结构、文档格式、提交规范

**核心内容**：
- 命名规范：数据库（snake_case）、API（/api/v1/{资源}）、组件（PascalCase）、变量（camelCase）
- 目录结构：文档（/docs、/.ai）、应用（/src/views）
- 文档格式：Markdown标题体系、表格规范、变更记录格式
- 提交规范：Conventional Commits（feat/fix/chore/docs）
- OpenAPI契约规范
- 演示环境约定（测试账号、Mock数据、演示脚本）

**阅读对象**：所有团队成员

---

### 7. 跨Agent协作与推进（progress.md）
**用途**：交接记录、进度跟踪、风险应对、下一步行动

**核心内容**：
- 交接记录：PM → Designer / Backend / Frontend / Charts / QA / DevOps
- 当前进度跟踪：M1里程碑60%完成
- 风险与应对：时间紧迫、设计稿未完成、后端未实现
- 下一步行动：今晚（技术选型）、明天上午（P0改造）、明天下午（彩排）

**阅读对象**：所有团队成员、项目管理

---

### 8. 验收标准（acceptance.md）
**用途**：BDD格式验收用例、API校验、权限边界

**核心内容**：
- 场景1：OKR + 绩效管理全流程（5个用例）
- 场景2：生产 + 质量管理联动（3个用例）
- 场景3：多系统数据聚合展示（4个用例）
- API校验：参数校验、错误码、数据一致性、口径一致性
- 权限与边界：权限控制矩阵、边界测试

**阅读对象**：QA、Frontend、Backend

---

### 9. 变更记录（changelog/CHANGELOG-20251211.md）
**用途**：记录本次调整的详细变更点、影响范围、后续动作

**核心内容**：
- 变更来源：汇仁药业管理层演示需求
- 变更点：删除2个页面、调整2个页面、新增8个页面、调整导航菜单
- 影响范围：接口（无）、字段（新增3个表）、UI（3个页面重构）、报表（4个图表）
- 后续动作：立即执行、明天上午、明天下午
- 风险与应对

**阅读对象**：所有团队成员、项目管理

---

## 快速导航

### 按角色查阅

#### 产品经理（PM）
1. [prd.md](prd.md) - 整体产品规划
2. [kpi.md](kpi.md) - 指标定义与口径
3. [progress.md](progress.md) - 进度跟踪与风险

#### 设计师（Designer）
1. [flows.md](flows.md) - 页面关系与交互流程
2. [pages-adjustment.md](pages-adjustment.md) - 页面调整清单
3. [convention.md](convention.md) - 设计规范（栅格、主题）

#### 后端开发（Backend）
1. [dictionary.md](dictionary.md) - 数据表结构
2. [kpi.md](kpi.md) - 指标计算口径
3. [convention.md](convention.md) - API规范、命名规范

#### 前端开发（Frontend）
1. [pages-adjustment.md](pages-adjustment.md) - P0/P1/P2页面清单
2. [flows.md](flows.md) - 交互流程与Debug窗口
3. [acceptance.md](acceptance.md) - 验收标准

#### 图表开发（Charts）
1. [kpi.md](kpi.md) - 指标定义与数据来源
2. [flows.md](flows.md) - 图表展示位置与参数

#### 测试（QA）
1. [acceptance.md](acceptance.md) - BDD验收用例
2. [flows.md](flows.md) - 异常路径与边界测试
3. [convention.md](convention.md) - 测试账号

#### 运维（DevOps）
1. [convention.md](convention.md) - 部署环境要求
2. [progress.md](progress.md) - 部署时间节点

---

## 按任务查阅

### 明天演示准备（P0）
1. [pages-adjustment.md](pages-adjustment.md) - P0任务清单
2. [flows.md](flows.md) - 演示场景流程
3. [acceptance.md](acceptance.md) - 演示验收标准
4. [convention.md](convention.md) - 演示脚本

### 本周开发（P1）
1. [pages-adjustment.md](pages-adjustment.md) - P1任务清单（3个新页面）
2. [dictionary.md](dictionary.md) - 数据表设计
3. [kpi.md](kpi.md) - 指标实现

### 下周占位（P2）
1. [pages-adjustment.md](pages-adjustment.md) - P2任务清单（5个占位页面）
2. [progress.md](progress.md) - M2里程碑规划

---

## 文档更新日志

| 日期 | 文档 | 更新内容 | 更新人 |
|------|------|---------|--------|
| 2025-12-11 | 所有文档 | 初始创建，v2.0版本 | PM |

---

## 联系方式

| 角色 | 负责人 | 联系方式 |
|------|--------|---------|
| 产品经理 | PM | - |
| 技术负责人 | Backend Leader | - |
| 前端负责人 | Frontend Leader | - |
| 设计负责人 | Designer Leader | - |

---

**文档结束**
