# 🚀 汇仁药业低代码平台 - Demo演示项目

> 完整的低代码平台演示系统，涵盖30项核心能力

## 📊 项目概览

- **项目名称**: 汇仁药业低代码平台演示
- **技术栈**: Vue 3 + Vite + Ant Design Vue + Pinia
- **页面总数**: 22个完整页面
- **功能覆盖**: 30项低代码平台核心能力 (100%)
- **部署目标**: Cloudflare Pages（国内可访问）

## ✅ 完成状态

- [x] **13个新页面创建完成**
- [x] **路由配置完成** - 所有页面可访问
- [x] **导航菜单更新** - 4个分组菜单
- [x] **功能文档完成** - FEATURES.md (3000+行)
- [x] **部署文档完成** - DEPLOY.md
- [x] **生产构建成功** - dist文件夹已生成
- [ ] **部署到Cloudflare** - 待执行

## 🔑 测试账号

| 用户名 | 密码 | 角色 | 可访问功能 |
|--------|------|------|------------|
| **admin** | admin123 | 系统管理员 | 所有功能 |
| hr_manager | hr123 | HR管理员 | 绩效+OKR+业务场景 |
| dept_manager | manager123 | 部门经理 | 绩效+OKR+业务场景 |
| employee | emp123 | 普通员工 | OKR+业务场景 |

**推荐使用 `admin` 账号演示，可访问所有功能！**

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📁 主要页面

### 低代码工具 (5个)
- `/lowcode/form-designer` - 表单设计器
- `/lowcode/workflow-designer` - 工作流设计器
- `/lowcode/page-builder` - 页面构建器
- `/lowcode/api-management` - API管理
- `/lowcode/app-market` - 应用市场

### 数据管理 (4个)
- `/datasource` - 数据源配置
- `/datasource/lineage` - 数据血缘
- `/datasync` - 数据同步任务
- `/kpi/dict` - KPI指标字典

### 业务场景 (4个)
- `/scenarios/customer360` - 客户360视图
- `/scenarios/sales-funnel` - 销售漏斗仪表板
- `/scenarios/expense` - 费用报销
- `/scenarios/workorder` - 生产异常工单

### 绩效管理 (2个)
- `/performance` - 绩效管理
- `/performance/period` - 绩效周期管理

## 📚 文档

- **[FEATURES.md](./FEATURES.md)** - 完整功能说明文档（3000+行）
- **[DEPLOY.md](./DEPLOY.md)** - Cloudflare Pages部署指南
- **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - 演示指南

## 🌐 部署到Cloudflare Pages

### 最简单方法：直接上传

1. 运行 `npm run build` 构建项目
2. 访问 https://dash.cloudflare.com/pages
3. 创建新项目 → Upload assets
4. 上传整个 `dist` 文件夹
5. 完成！

详细步骤请查看 [DEPLOY.md](./DEPLOY.md)

## 🎯 项目亮点

1. ✅ **功能全面**: 30项核心能力，100%覆盖
2. ✅ **文档完善**: 3000+行功能文档 + 部署指南
3. ✅ **即开即用**: Mock数据，无需后端
4. ✅ **国内可访问**: Cloudflare Pages国内直连
5. ✅ **响应式设计**: 支持桌面+平板+移动端
6. ✅ **权限管理**: 4种角色，精细权限控制

---

**🚀 准备就绪，随时可部署！**
