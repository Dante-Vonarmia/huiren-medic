<template>
  <div class="login-container">
    <!-- Left Brand Section -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-area">
          <div class="logo-icon">🏥</div>
          <h1 class="brand-title">汇仁药业</h1>
          <p class="brand-subtitle">Huiren Pharmaceutical</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>智能化OKR管理</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>全链路绩效考核</span>
          </div>
          <div class="feature-item">
            <CheckCircleOutlined class="feature-icon" />
            <span>多源数据聚合</span>
          </div>
        </div>
        <div class="slogan">
          低代码驱动，AI赋能企业数字化转型
        </div>
      </div>
    </div>

    <!-- Right Login Section -->
    <div class="login-section">
      <div class="login-card">
        <div class="card-header">
          <h2>登录平台</h2>
          <p>Enterprise Management System</p>
        </div>

        <a-form
          :model="loginForm"
          :rules="rules"
          @finish="handleLogin"
          class="login-form"
        >
          <a-form-item name="username">
            <a-input
              v-model:value="loginForm.username"
              placeholder="用户名 / 邮箱"
              size="large"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password">
            <a-input-password
              v-model:value="loginForm.password"
              placeholder="密码"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="login-btn"
            >
              登 录
            </a-button>
          </a-form-item>
        </a-form>

        <a-divider style="margin: 16px 0; font-size: 12px; color: #999;">快速测试 (Demo)</a-divider>

        <div class="demo-accounts">
          <div
            v-for="(account, index) in accounts"
            :key="index"
            class="account-item"
            @click="fillAccount(account)"
          >
            <CrownOutlined v-if="account.icon === 'CrownOutlined'" />
            <TeamOutlined v-else-if="account.icon === 'TeamOutlined'" />
            <UserOutlined v-else />
            <div>
              <div class="account-name">{{ account.username }}</div>
              <div class="account-role">{{ account.role }}</div>
            </div>
          </div>
        </div>

        <div class="login-footer">
          <SafetyCertificateOutlined />
          所有测试账号密码：123456
        </div>
      </div>
    </div>

    <!-- Debug Console -->
    <DebugConsole />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '../stores/user'
import DebugConsole from '../components/DebugConsole.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

const accounts = [
  { username: 'admin', password: '123456', role: '系统管理员', icon: 'CrownOutlined' },
  { username: 'li.ming', password: '123456', role: '销售部经理', icon: 'TeamOutlined' },
  { username: 'zhang.wei', password: '123456', role: '销售员工', icon: 'UserOutlined' },
  { username: 'zhou.lan', password: '123456', role: '生产部经理', icon: 'TeamOutlined' },
  { username: 'liu.qiang', password: '123456', role: '生产员工', icon: 'UserOutlined' },
  { username: 'chen.hr', password: '123456', role: 'HR', icon: 'UserOutlined' }
]

const fillAccount = (account) => {
  loginForm.username = account.username
  loginForm.password = account.password
}

const handleLogin = async () => {
  loading.value = true

  try {
    await userStore.login(loginForm.username, loginForm.password)

    message.success('登录成功')

    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Left Brand Section - 红色主题 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #d81e06 0%, #a81505 50%, #d81e06 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 2px, transparent 2px);
  background-size: 60px 60px;
  animation: drift 25s linear infinite;
}

.brand-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top left, rgba(255, 107, 107, 0.3), transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(168, 21, 5, 0.3), transparent 50%);
}

@keyframes drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

.brand-content {
  position: relative;
  z-index: 1;
  color: #ffffff;
  max-width: 500px;
  padding: 40px;
}

.logo-area {
  margin-bottom: 60px;
}

.logo-icon {
  font-size: 72px;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.brand-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.95;
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
}

.features {
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  opacity: 0.95;
}

.feature-icon {
  font-size: 20px;
  color: #ffd700;
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
}

.slogan {
  font-size: 14px;
  opacity: 0.85;
  line-height: 1.8;
  font-weight: 300;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border-left: 3px solid rgba(255, 215, 0, 0.6);
}

/* Right Login Section */
.login-section {
  width: 480px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
}

.login-card {
  width: 100%;
  padding: 40px;
}

.card-header {
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #262626 0%, #595959 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 500;
}

.login-form {
  margin-bottom: 0;
}

.login-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(216, 30, 6, 0.2);
}

.login-btn:hover {
  box-shadow: 0 6px 16px rgba(216, 30, 6, 0.3);
}

.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.account-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #d81e06 0%, #ff6b6b 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.account-item:hover {
  background: linear-gradient(135deg, rgba(216, 30, 6, 0.05) 0%, rgba(216, 30, 6, 0.02) 100%);
  border-color: rgba(216, 30, 6, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(216, 30, 6, 0.1);
}

.account-item:hover::before {
  transform: scaleY(1);
}

.account-item > span {
  font-size: 14px;
  color: #d81e06;
  transition: all 0.3s ease;
}

.account-item:hover > span {
  color: #ff6b6b;
  transform: scale(1.1);
}

.account-name {
  font-size: 12px;
  font-weight: 500;
  color: #1a1a1a;
  font-family: 'Monaco', 'Courier New', monospace;
}

.account-role {
  font-size: 11px;
  color: #999;
  margin-top: 1px;
}

.login-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
