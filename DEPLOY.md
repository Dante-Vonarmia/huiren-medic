# 📦 Cloudflare Pages 部署指南

## 一、前置准备

### 1. Cloudflare账号
- 访问 https://dash.cloudflare.com/
- 注册或登录Cloudflare账号

### 2. 项目构建
```bash
# 进入项目目录
cd /Users/dantevonalcatraz/Development/huiren-medic/demo

# 安装依赖（如果还没安装）
npm install

# 构建生产版本
npm run build
```

构建成功后，会在项目根目录生成 `dist` 文件夹，包含所有静态文件。

## 二、通过 Cloudflare Dashboard 部署（推荐）

### 步骤1: 上传到Git仓库（推荐）

1. 初始化Git仓库（如果还没有）：
```bash
cd /Users/dantevonalcatraz/Development/huiren-medic/demo
git init
git add .
git commit -m "Initial commit: 低代码平台演示项目"
```

2. 推送到GitHub/GitLab：
```bash
# 已完成！代码已推送到：
# https://github.com/Dante-Vonarmia/huiren-medic

# 如需更新代码：
git add .
git commit -m "Update features"
git push origin main
```

### 步骤2: 在Cloudflare Pages创建项目

1. 登录Cloudflare Dashboard
2. 进入 **Pages** 服务
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权并选择你的仓库
6. 配置构建设置：

```
项目名称: huiren-medic-demo
生产分支: main
构建命令: npm run build
构建输出目录: dist
环境变量: （无需设置）
```

7. 点击 **Save and Deploy**

### 步骤3: 等待部署完成

- Cloudflare会自动构建和部署
- 部署完成后会获得一个URL: `https://huiren-medic-demo.pages.dev`
- 可以自定义域名（可选）

## 三、通过 Wrangler CLI 部署（高级）

### 安装 Wrangler
```bash
npm install -g wrangler
```

### 登录Cloudflare
```bash
wrangler login
```

### 创建Pages项目
```bash
cd /Users/dantevonalcatraz/Development/huiren-medic/demo

# 首次部署
wrangler pages deploy dist --project-name=huiren-medic-demo
```

### 后续更新
```bash
# 重新构建
npm run build

# 部署新版本
wrangler pages deploy dist --project-name=huiren-medic-demo
```

## 四、直接上传 dist 文件夹（最简单）

### 方法1: 通过Dashboard上传

1. 登录Cloudflare Dashboard
2. 进入 **Pages**
3. 点击 **Create a project** → **Upload assets**
4. 将整个 `dist` 文件夹拖拽到上传区域
5. 设置项目名称: `huiren-medic-demo`
6. 点击 **Deploy site**

### 方法2: 使用 Drag & Drop

1. 访问 https://dash.cloudflare.com/pages
2. 创建新项目
3. 选择 "Direct Upload"
4. 上传 dist 目录下的所有文件
5. 部署完成

## 五、验证部署

### 1. 访问URL
部署成功后，访问Cloudflare提供的URL（例如 `https://huiren-medic-demo.pages.dev`）

### 2. 测试功能
- 访问 `/login` 登录页面
- 使用测试账号登录（见下方）
- 测试所有页面和功能

### 3. 测试账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | admin123 | 系统管理员 | 所有权限 |
| hr_manager | hr123 | HR管理员 | 绩效+OKR |
| dept_manager | manager123 | 部门经理 | 绩效+OKR |
| employee | emp123 | 普通员工 | OKR |

## 六、自定义域名（可选）

### 1. 在Cloudflare Pages设置自定义域名

1. 进入Pages项目
2. 点击 **Custom domains**
3. 添加自定义域名（需要域名在Cloudflare管理）
4. Cloudflare会自动配置DNS记录

### 2. 示例配置
```
自定义域名: demo.yourcompany.com
```

## 七、国内访问优化

### Cloudflare Pages 在中国大陆可访问性

✅ **好消息**: Cloudflare Pages 默认即可在中国大陆访问
- Cloudflare 在中国有 CDN 节点
- `.pages.dev` 域名在大陆可以访问
- 无需额外配置

### 提升访问速度（可选）

1. **使用自定义域名** + Cloudflare中国网络：
   - 将域名解析到Cloudflare
   - 启用 Cloudflare CDN
   - 自动使用中国节点加速

2. **配置缓存规则**：
   - 在Cloudflare Dashboard设置页面缓存
   - 设置静态资源缓存时间

## 八、环境变量配置（如需要）

如果项目需要环境变量，在Cloudflare Pages项目设置中添加：

1. 进入项目 → **Settings** → **Environment variables**
2. 添加变量：
```
VITE_API_BASE_URL = https://api.example.com
VITE_APP_TITLE = 低代码平台演示
```

3. 重新部署以使环境变量生效

## 九、持续部署（CI/CD）

### Git集成自动部署

一旦连接了Git仓库，每次推送代码到主分支都会自动触发部署：

```bash
git add .
git commit -m "Update features"
git push origin main
```

Cloudflare会自动：
1. 检测到新提交
2. 运行构建命令 `npm run build`
3. 部署到生产环境
4. 更新URL内容

## 十、故障排查

### 构建失败

**问题**: 构建时报错
**解决**:
1. 检查 `package.json` 中的构建命令
2. 确保 `vite.config.js` 配置正确
3. 查看构建日志找到具体错误

### 页面404

**问题**: 访问子路由时404
**解决**: 在项目根目录创建 `_redirects` 文件：
```
/*    /index.html   200
```

或在 `vite.config.js` 中配置：
```javascript
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

### 路由刷新404

**问题**: 刷新页面时404
**解决**: Cloudflare Pages已默认支持SPA路由，确保使用了HTML5 History模式：
```javascript
// router/index.js
const router = createRouter({
  history: createWebHistory(), // ✅ 已配置
  routes
})
```

## 十一、项目URL

部署成功后，你的项目将在以下URL可访问：

```
生产环境: https://huiren-medic-demo.pages.dev
预览环境: https://[commit-hash].huiren-medic-demo.pages.dev
```

## 十二、快速部署命令总结

```bash
# 1. 构建
cd /Users/dantevonalcatraz/Development/huiren-medic/demo
npm run build

# 2. 使用Wrangler部署
wrangler pages deploy dist --project-name=huiren-medic-demo

# 或者直接上传dist文件夹到Cloudflare Dashboard
```

---

## 📱 明日演示准备清单

- [x] 所有页面构建成功
- [x] 路由配置完整
- [x] 功能文档准备完毕（FEATURES.md）
- [ ] 部署到Cloudflare Pages
- [ ] 验证国内访问正常
- [ ] 准备演示账号和流程
- [ ] 确认所有功能可正常演示

## 🎯 演示重点功能

1. **低代码工具**（5个页面）
   - 表单设计器
   - 工作流设计器
   - 页面构建器
   - API管理
   - 应用市场

2. **数据管理**（4个页面）
   - 数据源配置
   - 数据血缘
   - 数据同步任务
   - KPI指标字典

3. **业务场景**（4个页面）
   - 客户360视图
   - 销售漏斗仪表板
   - 费用报销
   - 生产异常工单

4. **绩效管理**（2个页面）
   - 绩效管理
   - 绩效周期管理

**总计**: 22个完整页面，覆盖30项低代码平台核心能力

---

🎉 **部署完成后，记得分享URL给团队！**
