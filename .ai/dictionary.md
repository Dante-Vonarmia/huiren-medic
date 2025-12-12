# 字段字典 - 汇仁药业低代码平台

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | v2.0 |
| 创建时间 | 2025-12-11 |
| 更新时间 | 2025-12-11 |

---

## 1. 核心业务表

### 1.1 OKR表（okr）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读 | 平台生成 | 实时 |
| user_id | VARCHAR | 36 | 是 | - | 创建人ID | 外键→users.id | 所有人可读 | 用户输入 | 实时 |
| period_id | VARCHAR | 36 | 是 | - | 绩效周期ID | 外键→performance_period.id | 所有人可读 | 用户选择 | 实时 |
| objective | TEXT | - | 是 | - | 目标描述 | 长度5-500字符 | 所有人可读 | 用户输入 | 实时 |
| status | ENUM | - | 是 | draft | 状态 | draft/pending_approval/in_progress/completed/rejected | 所有人可读 | 系统管理 | 实时 |
| overall_progress | DECIMAL | 5,2 | 是 | 0.00 | 整体进度（%） | 0-100 | 所有人可读 | 系统计算 | 实时 |
| created_at | TIMESTAMP | - | 是 | NOW() | 创建时间 | - | 所有人可读 | 系统生成 | 实时 |
| updated_at | TIMESTAMP | - | 是 | NOW() | 更新时间 | - | 所有人可读 | 系统生成 | 实时 |
| approved_by | VARCHAR | 36 | 否 | NULL | 审批人ID | 外键→users.id | 所有人可读 | 系统记录 | 实时 |
| approved_at | TIMESTAMP | - | 否 | NULL | 审批时间 | - | 所有人可读 | 系统记录 | 实时 |

---

### 1.2 关键结果表（key_result）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读 | 平台生成 | 实时 |
| okr_id | VARCHAR | 36 | 是 | - | OKR ID | 外键→okr.id | 所有人可读 | 系统生成 | 实时 |
| title | VARCHAR | 200 | 是 | - | KR标题 | 长度5-200字符 | 所有人可读 | 用户输入 | 实时 |
| initial_value | DECIMAL | 10,2 | 是 | - | 初始值 | - | 所有人可读 | 用户输入 | 实时 |
| target_value | DECIMAL | 10,2 | 是 | - | 目标值 | 必须>初始值 | 所有人可读 | 用户输入 | 实时 |
| current_value | DECIMAL | 10,2 | 是 | - | 当前值 | - | 所有人可读 | 用户更新 | 实时 |
| weight | DECIMAL | 5,2 | 是 | - | 权重（%） | 0-100，同一OKR下总和=100 | 所有人可读 | 用户输入 | 实时 |
| progress | DECIMAL | 5,2 | 是 | 0.00 | 进度（%） | 0-100 | 所有人可读 | 系统计算 | 实时 |
| unit | VARCHAR | 20 | 否 | - | 单位 | 如：%、件、元 | 所有人可读 | 用户输入 | 实时 |

---

### 1.3 绩效周期表（performance_period）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读 | 平台生成 | 实时 |
| name | VARCHAR | 100 | 是 | - | 周期名称 | 如：2025Q4 | 所有人可读 | HR输入 | 实时 |
| type | ENUM | - | 是 | - | 周期类型 | quarterly/annual | 所有人可读 | HR选择 | 实时 |
| start_date | DATE | - | 是 | - | 开始日期 | - | 所有人可读 | HR输入 | 实时 |
| end_date | DATE | - | 是 | - | 结束日期 | 必须>开始日期 | 所有人可读 | HR输入 | 实时 |
| status | ENUM | - | 是 | not_started | 状态 | not_started/in_progress/evaluating/completed | 所有人可读 | 系统管理 | 实时 |
| created_at | TIMESTAMP | - | 是 | NOW() | 创建时间 | - | 所有人可读 | 系统生成 | 实时 |

---

### 1.4 绩效评估表（performance_evaluation）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 经理/HR/本人 | 平台生成 | 实时 |
| period_id | VARCHAR | 36 | 是 | - | 绩效周期ID | 外键→performance_period.id | 经理/HR/本人 | 系统生成 | 实时 |
| user_id | VARCHAR | 36 | 是 | - | 被评估人ID | 外键→users.id | 经理/HR/本人 | 系统生成 | 实时 |
| okr_completion | DECIMAL | 5,2 | 是 | - | OKR完成度（%） | 0-100 | 经理/HR/本人 | 系统计算 | 实时 |
| manager_score | DECIMAL | 3,1 | 是 | - | 主管评分 | 1.0-5.0 | 经理/HR/本人 | 经理打分 | 实时 |
| final_score | DECIMAL | 3,1 | 是 | - | 最终绩效得分 | OKR完成度×0.6 + 主管评分×0.4 | 经理/HR/本人 | 系统计算 | 实时 |
| comments | TEXT | - | 否 | - | 评估意见 | 长度0-1000字符 | 经理/HR/本人 | 经理输入 | 实时 |
| evaluated_at | TIMESTAMP | - | 是 | NOW() | 评估时间 | - | 经理/HR/本人 | 系统生成 | 实时 |

---

### 1.5 生产异常工单表（production_workorder）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读 | 平台生成 | 实时 |
| workorder_no | VARCHAR | 20 | 是 | - | 工单编号 | 格式：WO-YYYYMMDD-XXXX | 所有人可读 | 系统生成 | 实时 |
| title | VARCHAR | 200 | 是 | - | 工单标题 | 长度5-200字符 | 所有人可读 | 用户输入 | 实时 |
| type | ENUM | - | 是 | - | 异常类型 | equipment_failure/material_issue/process_deviation | 所有人可读 | 用户选择 | 实时 |
| batch_no | VARCHAR | 20 | 否 | - | 批次号 | - | 所有人可读 | 用户输入/MES | 实时 |
| description | TEXT | - | 是 | - | 异常描述 | 长度10-2000字符 | 所有人可读 | 用户输入 | 实时 |
| photos | JSON | - | 否 | [] | 现场照片 | 数组格式，最多5张 | 所有人可读 | 用户上传 | 实时 |
| status | ENUM | - | 是 | pending | 状态 | pending/in_progress/pending_approval/completed | 所有人可读 | 系统管理 | 实时 |
| priority | ENUM | - | 是 | normal | 优先级 | normal/urgent/critical | 所有人可读 | 用户选择 | 实时 |
| created_by | VARCHAR | 36 | 是 | - | 创建人ID | 外键→users.id | 所有人可读 | 系统记录 | 实时 |
| assigned_to | VARCHAR | 36 | 否 | NULL | 处理人ID | 外键→users.id | 所有人可读 | 工作流分配 | 实时 |
| created_at | TIMESTAMP | - | 是 | NOW() | 创建时间 | - | 所有人可读 | 系统生成 | 实时 |
| completed_at | TIMESTAMP | - | 否 | NULL | 完成时间 | - | 所有人可读 | 系统记录 | 实时 |

---

### 1.6 工单流转记录表（workorder_flow）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读 | 平台生成 | 实时 |
| workorder_id | VARCHAR | 36 | 是 | - | 工单ID | 外键→production_workorder.id | 所有人可读 | 系统生成 | 实时 |
| from_status | ENUM | - | 否 | NULL | 原状态 | - | 所有人可读 | 系统记录 | 实时 |
| to_status | ENUM | - | 是 | - | 新状态 | - | 所有人可读 | 系统记录 | 实时 |
| operator_id | VARCHAR | 36 | 是 | - | 操作人ID | 外键→users.id | 所有人可读 | 系统记录 | 实时 |
| comments | TEXT | - | 否 | - | 流转意见 | 长度0-500字符 | 所有人可读 | 用户输入 | 实时 |
| created_at | TIMESTAMP | - | 是 | NOW() | 流转时间 | - | 所有人可读 | 系统生成 | 实时 |

---

## 2. 数据源配置表

### 2.1 数据源表（datasource）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 管理员 | 平台生成 | 实时 |
| name | VARCHAR | 100 | 是 | - | 数据源名称 | 如：MES生产执行系统 | 管理员 | 管理员输入 | 实时 |
| type | ENUM | - | 是 | - | 数据源类型 | postgresql/mysql/rest_api/odata | 管理员 | 管理员选择 | 实时 |
| host | VARCHAR | 255 | 否 | - | 主机地址 | 仅DB类型必填 | 管理员 | 管理员输入 | 实时 |
| port | INT | - | 否 | - | 端口 | 1-65535 | 管理员 | 管理员输入 | 实时 |
| database | VARCHAR | 100 | 否 | - | 数据库名 | 仅DB类型必填 | 管理员 | 管理员输入 | 实时 |
| username | VARCHAR | 100 | 否 | - | 用户名 | 仅DB类型必填 | 管理员 | 管理员输入 | 实时 |
| password | VARCHAR | 255 | 否 | - | 密码（加密） | 仅DB类型必填 | 管理员 | 管理员输入 | 实时 |
| endpoint | VARCHAR | 500 | 否 | - | API地址 | 仅API类型必填 | 管理员 | 管理员输入 | 实时 |
| auth_type | ENUM | - | 否 | - | 认证方式 | api_token/oauth2/basic_auth | 管理员 | 管理员选择 | 实时 |
| auth_token | VARCHAR | 500 | 否 | - | 认证令牌 | 仅API类型 | 管理员 | 管理员输入 | 实时 |
| status | ENUM | - | 是 | offline | 连接状态 | online/offline | 管理员 | 系统检测 | 每5分钟 |
| created_at | TIMESTAMP | - | 是 | NOW() | 创建时间 | - | 管理员 | 系统生成 | 实时 |

---

### 2.2 数据同步任务表（sync_task）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 管理员 | 平台生成 | 实时 |
| name | VARCHAR | 100 | 是 | - | 任务名称 | - | 管理员 | 管理员输入 | 实时 |
| datasource_id | VARCHAR | 36 | 是 | - | 数据源ID | 外键→datasource.id | 管理员 | 管理员选择 | 实时 |
| source_table | VARCHAR | 100 | 是 | - | 源表名 | - | 管理员 | 管理员输入 | 实时 |
| target_table | VARCHAR | 100 | 是 | - | 目标表名 | - | 管理员 | 管理员输入 | 实时 |
| sync_type | ENUM | - | 是 | - | 同步类型 | full/incremental | 管理员 | 管理员选择 | 实时 |
| schedule_type | ENUM | - | 是 | - | 调度类型 | realtime/cron | 管理员 | 管理员选择 | 实时 |
| cron_expression | VARCHAR | 50 | 否 | - | Cron表达式 | 仅cron类型必填 | 管理员 | 管理员输入 | 实时 |
| status | ENUM | - | 是 | idle | 任务状态 | idle/running/success/failed | 管理员 | 系统管理 | 实时 |
| last_run_at | TIMESTAMP | - | 否 | NULL | 最后执行时间 | - | 管理员 | 系统记录 | 实时 |
| next_run_at | TIMESTAMP | - | 否 | NULL | 下次执行时间 | - | 管理员 | 系统计算 | 实时 |

---

## 3. KPI指标字典表

### 3.1 KPI指标表（kpi_metric）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 管理员/经理 | 平台生成 | 实时 |
| code | VARCHAR | 50 | 是 | - | 指标编码 | 唯一，如：daily_output | 管理员/经理 | 管理员输入 | 实时 |
| name | VARCHAR | 100 | 是 | - | 指标名称 | 如：今日产量 | 管理员/经理 | 管理员输入 | 实时 |
| category | ENUM | - | 是 | - | 指标分类 | production/quality/inventory/order | 管理员/经理 | 管理员选择 | 实时 |
| datasource_id | VARCHAR | 36 | 是 | - | 数据源ID | 外键→datasource.id | 管理员/经理 | 管理员选择 | 实时 |
| source_table | VARCHAR | 100 | 是 | - | 来源表 | - | 管理员/经理 | 管理员输入 | 实时 |
| formula | TEXT | - | 是 | - | 计算公式 | 如：SUM(completed_quantity) | 管理员/经理 | 管理员输入 | 实时 |
| unit | VARCHAR | 20 | 否 | - | 单位 | 如：件、%、元 | 管理员/经理 | 管理员输入 | 实时 |
| refresh_frequency | VARCHAR | 50 | 是 | - | 刷新频率 | 如：每2小时、每日8:30 | 管理员/经理 | 管理员输入 | 实时 |
| department | VARCHAR | 100 | 是 | - | 责任部门 | 如：生产部 | 管理员/经理 | 管理员输入 | 实时 |
| owner_id | VARCHAR | 36 | 是 | - | 责任人ID | 外键→users.id | 管理员/经理 | 管理员选择 | 实时 |
| threshold_warning | DECIMAL | 10,2 | 否 | NULL | 预警阈值 | - | 管理员/经理 | 管理员输入 | 实时 |
| threshold_critical | DECIMAL | 10,2 | 否 | NULL | 严重阈值 | - | 管理员/经理 | 管理员输入 | 实时 |

---

## 4. 用户与权限表

### 4.1 用户表（users）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读（限本人） | 平台生成 | 实时 |
| username | VARCHAR | 50 | 是 | - | 用户名 | 唯一 | 所有人可读 | 管理员创建 | 实时 |
| real_name | VARCHAR | 100 | 是 | - | 真实姓名 | - | 所有人可读 | 管理员创建 | 实时 |
| role | ENUM | - | 是 | employee | 角色 | employee/manager/hr/admin/leader | 所有人可读 | 管理员分配 | 实时 |
| department | VARCHAR | 100 | 是 | - | 部门 | - | 所有人可读 | 管理员输入 | 实时 |
| position | VARCHAR | 100 | 否 | - | 岗位 | - | 所有人可读 | 管理员输入 | 实时 |
| phone | VARCHAR | 11 | 否 | - | 手机号 | 11位数字 | 仅本人/HR | 管理员输入 | 实时 |
| email | VARCHAR | 100 | 否 | - | 邮箱 | 邮箱格式 | 仅本人/HR | 管理员输入 | 实时 |
| avatar | VARCHAR | 500 | 否 | - | 头像URL | - | 所有人可读 | 用户上传 | 实时 |
| created_at | TIMESTAMP | - | 是 | NOW() | 创建时间 | - | 所有人可读 | 系统生成 | 实时 |

---

## 5. 外部系统数据（占位）

### 5.1 MES生产数据（production_data - 来源MES）

| 字段名 | 类型 | 长度 | 说明 | 来源表 | 刷新频率 |
|--------|------|------|------|--------|---------|
| production_line | VARCHAR | 50 | 产线名称 | mes.production_line | 每2小时 |
| batch_no | VARCHAR | 20 | 批次号 | mes.batch | 每2小时 |
| product_name | VARCHAR | 100 | 产品名称 | mes.product | 每2小时 |
| completed_quantity | INT | - | 完成数量 | mes.batch | 每2小时 |
| target_quantity | INT | - | 目标数量 | mes.batch | 每2小时 |
| status | ENUM | - | 状态（运行中/停机/维护） | mes.production_line | 每2小时 |
| start_time | TIMESTAMP | - | 开始时间 | mes.batch | 每2小时 |
| end_time | TIMESTAMP | - | 结束时间（预计） | mes.batch | 每2小时 |

---

### 5.2 QMS质量数据（quality_data - 来源QMS）

| 字段名 | 类型 | 长度 | 说明 | 来源表 | 刷新频率 |
|--------|------|------|------|--------|---------|
| batch_no | VARCHAR | 20 | 批次号 | qms.inspection_record | 每1小时 |
| product_name | VARCHAR | 100 | 产品名称 | qms.product | 每1小时 |
| inspection_type | ENUM | - | 检验类型（原料/中间体/成品） | qms.inspection_record | 每1小时 |
| inspection_status | ENUM | - | 检验状态（待检/检验中/已完成） | qms.inspection_record | 每1小时 |
| result | ENUM | - | 检验结果（合格/不合格） | qms.inspection_record | 每1小时 |
| quality_rate | DECIMAL | 5,2 | 合格率（%） | 计算字段 | 每1小时 |
| inspector_name | VARCHAR | 100 | 检验员姓名 | qms.user | 每1小时 |
| inspection_date | DATE | - | 检验日期 | qms.inspection_record | 每1小时 |

---

### 5.3 WMS库存数据（inventory_data - 来源WMS）

| 字段名 | 类型 | 长度 | 说明 | 来源表 | 刷新频率 |
|--------|------|------|------|--------|---------|
| product_name | VARCHAR | 100 | 产品名称 | wms.inventory | 每4小时 |
| warehouse_name | VARCHAR | 100 | 仓库名称 | wms.warehouse | 每4小时 |
| quantity | DECIMAL | 10,2 | 库存数量 | wms.inventory | 每4小时 |
| safety_stock | DECIMAL | 10,2 | 安全库存 | wms.product_config | 每4小时 |
| alert_level | ENUM | - | 预警级别（正常/预警/严重） | 计算字段 | 每4小时 |
| last_updated | TIMESTAMP | - | 最后更新时间 | wms.inventory | 每4小时 |

---

### 5.4 ERP订单数据（order_data - 来源ERP）

| 字段名 | 类型 | 长度 | 说明 | 来源表 | 刷新频率 |
|--------|------|------|------|--------|---------|
| order_no | VARCHAR | 20 | 订单号 | erp.sales_order | 每4小时 |
| customer_name | VARCHAR | 100 | 客户名称（经销商） | erp.customer | 每4小时 |
| product_name | VARCHAR | 100 | 产品名称 | erp.product | 每4小时 |
| quantity | DECIMAL | 10,2 | 订单数量 | erp.sales_order_detail | 每4小时 |
| delivery_date | DATE | - | 交付日期 | erp.sales_order | 每4小时 |
| status | ENUM | - | 订单状态（待发货/已发货/已完成） | erp.sales_order | 每4小时 |

---

### 5.5 OA审批数据（approval_data - 来源OA）

| 字段名 | 类型 | 长度 | 说明 | 来源表 | 刷新频率 |
|--------|------|------|------|--------|---------|
| approval_no | VARCHAR | 20 | 审批单号 | oa.approval | 每1小时 |
| type | ENUM | - | 审批类型（请假/报销/采购） | oa.approval_type | 每1小时 |
| applicant_name | VARCHAR | 100 | 申请人姓名 | oa.user | 每1小时 |
| status | ENUM | - | 审批状态（待审批/已通过/已驳回） | oa.approval | 每1小时 |
| created_at | TIMESTAMP | - | 创建时间 | oa.approval | 每1小时 |

---

### 5.6 CRM经销商数据（dealer_data - 来源CRM）

| 字段名 | 类型 | 长度 | 说明 | 来源表 | 刷新频率 |
|--------|------|------|------|--------|---------|
| dealer_name | VARCHAR | 100 | 经销商名称 | crm.customer | 每日8:30 |
| region | VARCHAR | 100 | 区域 | crm.customer | 每日8:30 |
| level | ENUM | - | 经销商等级（A/B/C） | crm.customer | 每日8:30 |
| total_orders | INT | - | 累计订单数 | 计算字段 | 每日8:30 |
| total_amount | DECIMAL | 12,2 | 累计金额 | 计算字段 | 每日8:30 |
| last_order_date | DATE | - | 最后下单日期 | crm.order | 每日8:30 |

---

## 6. 审计日志表

### 6.1 操作日志表（audit_log）

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 管理员 | 平台生成 | 实时 |
| user_id | VARCHAR | 36 | 是 | - | 操作人ID | 外键→users.id | 管理员 | 系统记录 | 实时 |
| action | VARCHAR | 100 | 是 | - | 操作行为 | 如：创建OKR、审批工单 | 管理员 | 系统记录 | 实时 |
| resource_type | VARCHAR | 50 | 是 | - | 资源类型 | 如：okr、workorder、datasource | 管理员 | 系统记录 | 实时 |
| resource_id | VARCHAR | 36 | 是 | - | 资源ID | - | 管理员 | 系统记录 | 实时 |
| old_value | JSON | - | 否 | NULL | 修改前数据 | - | 管理员 | 系统记录 | 实时 |
| new_value | JSON | - | 否 | NULL | 修改后数据 | - | 管理员 | 系统记录 | 实时 |
| ip_address | VARCHAR | 50 | 是 | - | IP地址 | - | 管理员 | 系统记录 | 实时 |
| created_at | TIMESTAMP | - | 是 | NOW() | 操作时间 | - | 管理员 | 系统生成 | 实时 |

---

**文档结束**
