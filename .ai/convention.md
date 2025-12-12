# 约定（Convention）- 汇仁药业低代码平台

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | v2.0 |
| 创建时间 | 2025-12-11 |
| 更新时间 | 2025-12-11 |

---

## 1. 命名规范

### 1.1 数据库

#### 表名
- **规则**：`snake_case`（小写 + 下划线）
- **示例**：
  - ✅ `production_workorder`
  - ✅ `performance_evaluation`
  - ❌ `ProductionWorkOrder`
  - ❌ `performance-evaluation`

#### 字段名
- **规则**：`snake_case`（小写 + 下划线）
- **示例**：
  - ✅ `created_at`
  - ✅ `overall_progress`
  - ❌ `createdAt`
  - ❌ `OverallProgress`

#### 索引名
- **规则**：`idx_{表名}_{字段名}`
- **示例**：
  - ✅ `idx_okr_user_id`
  - ✅ `idx_workorder_status`
  - ❌ `okr_user_index`

#### 外键名
- **规则**：`fk_{表名}_{外键字段名}`
- **示例**：
  - ✅ `fk_okr_user_id`
  - ✅ `fk_workorder_created_by`

---

### 1.2 API路径

#### RESTful风格
- **规则**：`/api/v1/{资源名（名词复数）}`
- **方法**：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- **示例**：
  ```
  GET    /api/v1/okrs              # 获取OKR列表
  POST   /api/v1/okrs              # 创建OKR
  GET    /api/v1/okrs/:id          # 获取OKR详情
  PUT    /api/v1/okrs/:id          # 更新OKR
  DELETE /api/v1/okrs/:id          # 删除OKR
  POST   /api/v1/okrs/:id/approve  # 审批OKR（自定义动作）
  ```

#### 错误码
- **规则**：`H{HTTP状态码}{业务编码}`
- **示例**：
  - ✅ `H4001`：未认证（401 Unauthorized）
  - ✅ `H4031`：无权限访问OKR（403 Forbidden）
  - ✅ `H5001`：服务器内部错误（500 Internal Server Error）

#### 响应格式
```json
{
  "code": "H2000",
  "message": "success",
  "data": { ... },
  "timestamp": "2025-12-11T19:00:00Z"
}
```

#### 错误响应格式
```json
{
  "code": "H4001",
  "message": "未登录，请先登录",
  "error": "Unauthorized",
  "timestamp": "2025-12-11T19:00:00Z"
}
```

---

### 1.3 前端代码

#### 组件名
- **规则**：`PascalCase`（大驼峰）
- **示例**：
  - ✅ `OKRList.vue`
  - ✅ `DataSourceConfig.vue`
  - ❌ `okr-list.vue`
  - ❌ `data_source_config.vue`

#### 变量/函数名
- **规则**：`camelCase`（小驼峰）
- **示例**：
  - ✅ `const selectedKeys = ref([])`
  - ✅ `function handleMenuClick() { ... }`
  - ❌ `const selected_keys = ref([])`
  - ❌ `function handle_menu_click() { ... }`

#### 常量名
- **规则**：`UPPER_SNAKE_CASE`（全大写 + 下划线）
- **示例**：
  - ✅ `const MAX_FILE_SIZE = 5 * 1024 * 1024`
  - ✅ `const API_BASE_URL = 'http://localhost:3000/api/v1'`

#### 文件名
- **规则**：`kebab-case`（小写 + 连字符）或 `PascalCase`（组件）
- **示例**：
  - ✅ `okr-list.js`（工具函数）
  - ✅ `OKRList.vue`（组件）
  - ✅ `data-source-utils.js`（工具）
  - ❌ `okr_list.vue`

---

### 1.4 后端代码（Node.js + Koa）

#### 类名
- **规则**：`PascalCase`（大驼峰）
- **示例**：
  - ✅ `class OKRController { ... }`
  - ✅ `class DatabaseService { ... }`

#### 方法名
- **规则**：`camelCase`（小驼峰）
- **示例**：
  - ✅ `async createOKR(ctx) { ... }`
  - ✅ `async getOKRList(ctx) { ... }`

#### 文件名
- **规则**：`kebab-case`（小写 + 连字符）
- **示例**：
  - ✅ `okr-controller.js`
  - ✅ `database-service.js`

---

## 2. 目录结构

### 2.1 文档目录

```
/
├─ docs/                  # 对外文档（用户手册、API文档）
│  ├─ user-guide.md
│  ├─ api-reference.md
│  └─ changelog.md
├─ .ai/                   # 对内过程文档（PRD、字典、约定）
│  ├─ prd.md
│  ├─ flows.md
│  ├─ acceptance.md
│  ├─ dictionary.md
│  ├─ kpi.md
│  ├─ convention.md
│  ├─ progress.md
│  └─ changelog/
│      ├─ CHANGELOG-20251211.md
│      └─ CHANGELOG-20251212.md
└─ README.md              # 项目概述
```

---

### 2.2 应用目录

```
/
├─ src/
│  ├─ views/              # 页面组件
│  │  ├─ OKR/
│  │  │  ├─ OKRList.vue
│  │  │  ├─ OKRCreate.vue
│  │  │  └─ OKRDetail.vue
│  │  ├─ Production/
│  │  │  ├─ ProductionWorkOrder.vue
│  │  │  └─ ProductionProgress.vue
│  │  ├─ Quality/
│  │  │  └─ InspectionWorkorder.vue
│  │  ├─ Supply/
│  │  │  └─ InventoryAlert.vue
│  │  ├─ DataSource/
│  │  ├─ LowCode/
│  │  └─ Performance/
│  ├─ components/         # 通用组件
│  │  ├─ DebugConsole.vue
│  │  ├─ StatusTag.vue
│  │  └─ DataTable.vue
│  ├─ stores/             # 状态管理（Pinia）
│  │  ├─ user.js
│  │  ├─ okr.js
│  │  └─ datasource.js
│  ├─ router/             # 路由配置
│  │  └─ index.js
│  ├─ utils/              # 工具函数
│  │  ├─ request.js       # API请求封装
│  │  ├─ date-utils.js
│  │  └─ format-utils.js
│  ├─ assets/             # 静态资源
│  │  ├─ images/
│  │  └─ styles/
│  ├─ App.vue
│  └─ main.js
├─ public/
│  └─ favicon.ico
├─ package.json
└─ vite.config.js
```

---

### 2.3 共享包目录（未实现）

```
/packages/
├─ common/                # 通用工具包
│  ├─ src/
│  │  ├─ validators.js
│  │  └─ constants.js
│  └─ package.json
├─ ui/                    # UI组件库
│  ├─ src/
│  │  ├─ Button.vue
│  │  └─ Table.vue
│  └─ package.json
└─ api-client/            # API客户端
   ├─ src/
   │  └─ okr-api.js
   └─ package.json
```

---

## 3. 文档格式

### 3.1 Markdown标题体系

#### 标题层级
- **H1**：文档标题（每个文档仅一个）
- **H2**：一级章节
- **H3**：二级章节
- **H4**：三级章节
- **H5/H6**：避免使用（层级过深）

#### 示例
```markdown
# 产品需求文档 - 汇仁药业低代码平台

## 1. 概述

### 1.1 企业背景

### 1.2 问题陈述

## 2. 角色与场景

### 2.1 核心角色
```

---

### 3.2 表格规范

#### 字段齐全
- **必填字段**：字段名、类型、长度、必填、默认值、说明
- **扩展字段**：校验规则、权限、来源、刷新频率

#### 示例
```markdown
| 字段名 | 类型 | 长度 | 必填 | 默认值 | 说明 | 校验规则 | 权限 | 来源 | 刷新频率 |
|--------|------|------|------|--------|------|---------|------|------|---------|
| id | VARCHAR | 36 | 是 | UUID | 主键 | UUID格式 | 所有人可读 | 平台生成 | 实时 |
```

---

### 3.3 变更记录格式

#### 文件名
- **规则**：`CHANGELOG-YYYYMMDD.md`
- **示例**：`CHANGELOG-20251211.md`

#### 内容格式
```markdown
# 变更记录 - 2025-12-11

## 来源
- 需求方：业务部门
- 需求文档：《汇仁药业低代码平台演示需求》

## 变更点
1. **删除页面**：客户360视图、销售漏斗仪表板（不符合制药业务）
2. **新增页面**：生产进度看板、质量检验工单、库存预警
3. **调整页面**：运营总览（新增6个系统状态展示）

## 影响范围
- **接口**：无（未实现后端）
- **字段**：新增 `production_data.production_line`
- **UI**：调整导航菜单结构
- **报表**：新增"生产趋势图"

## 后续动作
1. Frontend：完成页面调整（P0，明天演示）
2. PM：准备演示数据（Mock）
3. Designer：无需调整（使用现有组件）
```

---

## 4. 提交与发布规范

### 4.1 Git提交规范（Conventional Commits）

#### 提交类型
- `feat`：新功能
- `fix`：修复Bug
- `chore`：构建/工具配置
- `docs`：文档更新
- `style`：代码格式（不影响逻辑）
- `refactor`：重构（不改变功能）
- `test`：测试相关
- `perf`：性能优化

#### 提交格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 示例
```
feat(okr): 新增OKR审批流程

- 增加审批节点配置
- 支持多级审批
- 审批通过后自动流转到执行阶段

Closes #123
```

---

### 4.2 分支规范

#### 分支类型
- `main`：生产环境
- `develop`：开发环境
- `feature/*`：功能分支（如 `feature/okr-approval`）
- `bugfix/*`：修复分支（如 `bugfix/okr-progress-calc`）
- `hotfix/*`：紧急修复（如 `hotfix/datasource-connection`）

#### 分支流程
```
main ←── hotfix/xxx
  ↑
  └─── develop ←── feature/xxx
                └─── bugfix/xxx
```

---

### 4.3 发布前检查清单

#### 代码质量
- [ ] ESLint检查通过（无错误）
- [ ] TypeScript类型检查通过（如适用）
- [ ] 单元测试通过（如适用）

#### 文档同步
- [ ] OpenAPI契约已更新（如有接口变更）
- [ ] 字段字典已更新（如有数据表变更）
- [ ] KPI指标字典已更新（如有指标变更）
- [ ] Changelog已记录

#### 功能验证
- [ ] 核心场景可演示（OKR + 绩效、生产 + 质量、多系统对接）
- [ ] Debug窗口正常展示
- [ ] 权限控制正常（管理员/经理/员工）

---

## 5. OpenAPI契约规范

### 5.1 契约文件位置
- **文件路径**：`/docs/api/openapi.yaml`（或 `openapi.json`）

### 5.2 契约格式（示例）

```yaml
openapi: 3.0.0
info:
  title: 汇仁药业低代码平台API
  version: 2.0.0
  description: 低代码平台后端API文档

servers:
  - url: http://localhost:3000/api/v1
    description: 本地开发环境

paths:
  /okrs:
    get:
      summary: 获取OKR列表
      tags:
        - OKR
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, pending_approval, in_progress, completed, rejected]
        - name: user_id
          in: query
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: H2000
                  message:
                    type: string
                    example: success
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/OKR'

components:
  schemas:
    OKR:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        objective:
          type: string
        status:
          type: string
          enum: [draft, pending_approval, in_progress, completed, rejected]
        overall_progress:
          type: number
          format: float
          minimum: 0
          maximum: 100
        created_at:
          type: string
          format: date-time
```

---

### 5.3 契约同步规则

#### 何时更新
- 新增接口：立即更新契约
- 修改接口参数/响应：立即更新契约
- 废弃接口：标记为 `deprecated`，保留至下个大版本

#### 版本管理
- **规则**：遵循语义化版本（Semantic Versioning）
- **格式**：`MAJOR.MINOR.PATCH`
- **示例**：
  - `2.0.0`：重大变更（不兼容）
  - `2.1.0`：新增功能（向后兼容）
  - `2.1.1`：Bug修复（向后兼容）

---

## 6. 兼容性与风险控制

### 6.1 API兼容性

#### 破坏性变更（需升级大版本）
- 删除接口
- 修改接口路径
- 修改响应字段类型

#### 非破坏性变更（可升级小版本）
- 新增接口
- 新增可选参数
- 新增响应字段

#### 兼容期
- **时长**：至少保留1个季度
- **通知**：提前2周通知使用方
- **文档**：在Changelog中标记"即将废弃"

---

### 6.2 数据库迁移

#### 迁移文件命名
- **规则**：`V{版本号}__{描述}.sql`
- **示例**：
  - `V1.0.0__init_tables.sql`
  - `V1.1.0__add_okr_approval_fields.sql`

#### 迁移原则
- 仅增不删（新增表/字段，不删除）
- 废弃字段标记为 `deprecated`
- 提供回滚脚本（如 `V1.1.0__rollback.sql`）

---

## 7. 代码风格与工具

### 7.1 ESLint配置（Vue）

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1
    }],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never']
  }
}
```

---

### 7.2 Prettier配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "arrowParens": "avoid",
  "printWidth": 100
}
```

---

## 8. 演示环境约定

### 8.1 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| `admin` | `admin123` | admin | 系统管理员（可访问所有页面） |
| `manager` | `manager123` | manager | 部门经理（可审批OKR、管理绩效） |
| `employee` | `employee123` | employee | 普通员工（可创建OKR、查看绩效） |
| `hr` | `hr123` | hr | HR管理员（可管理绩效周期） |
| `leader` | `leader123` | leader | 高层领导（可查看所有数据） |

---

### 8.2 Mock数据约定

#### 数据量
- **OKR**：每个用户2-3个（覆盖不同状态）
- **工单**：10-15个（覆盖待处理/处理中/已完成）
- **数据源**：6个（MES、QMS、WMS、ERP、OA、CRM）

#### 数据真实性
- 批次号：使用真实格式（如 `202512001`）
- 产品名称：使用汇仁实际产品（肾宝片、六味地黄丸、乌鸡白凤丸）
- 日期：使用近期日期（避免使用2020年等过时数据）

---

### 8.3 演示脚本约定

#### 场景1：OKR + 绩效管理（10分钟）
1. 以 `hr` 账号登录，创建绩效周期（2025Q4）
2. 以 `employee` 账号登录，创建OKR（3个KR）
3. 以 `manager` 账号登录，审批OKR（通过）
4. 以 `employee` 账号登录，更新KR进度
5. Debug窗口展示：创建OKR → 工作流流转 → 审批通过

#### 场景2：生产 + 质量管理（10分钟）
1. 以 `employee` 账号登录，创建生产异常工单
2. Debug窗口展示：工单创建 → QMS数据查询 → 工作流分配
3. 以 `manager` 账号登录，查看运营总览（发现质量异常趋势）
4. 点击"库存预警"卡片，跳转到库存预警页面

#### 场景3：多系统数据聚合（5分钟）
1. 以 `admin` 账号登录，进入数据源配置
2. 展示6个系统的连接状态（5个在线，1个离线）
3. 进入数据血缘页面，展示数据流向图
4. 进入KPI指标字典，展示指标定义与口径

---

**文档结束**
