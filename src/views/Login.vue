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

        <a-divider style="margin: 20px 0; font-size: 12px; color: #999;">演示账号</a-divider>

        <div class="demo-accounts">
          <div class="account-item" @click="fillAccount(accounts[0])">
            <UserOutlined />
            <div>
              <div class="account-name">zhang.wei</div>
              <div class="account-role">销售部员工</div>
            </div>
          </div>
          <div class="account-item" @click="fillAccount(accounts[1])">
            <TeamOutlined />
            <div>
              <div class="account-name">li.ming</div>
              <div class="account-role">销售部经理</div>
            </div>
          </div>
          <div class="account-item" @click="fillAccount(accounts[2])">
            <CrownOutlined />
            <div>
              <div class="account-name">admin</div>
              <div class="account-role">系统管理员</div>
            </div>
          </div>
        </div>

        <div class="login-footer">
          <SafetyCertificateOutlined />
          密码：Huiren@2025 | 管理员：Admin@2025
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
  username: 'zhang.wei',
  password: 'Huiren@2025'
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

const accounts = [
  { username: 'zhang.wei', password: 'Huiren@2025' },
  { username: 'li.ming', password: 'Huiren@2025' },
  { username: 'admin', password: 'Admin@2025' }
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

/* Left Brand Section */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
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
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: drift 20s linear infinite;
}

@keyframes drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.brand-content {
  position: relative;
  z-index: 1;
  color: white;
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
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
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
}

.feature-icon {
  font-size: 20px;
  color: #4ade80;
}

.slogan {
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.6;
  font-weight: 300;
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
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 13px;
  color: #999;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-form {
  margin-bottom: 0;
}

.login-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.account-item:hover {
  background: #e9ecef;
  border-color: #1890ff;
  transform: translateX(4px);
}

.account-item > span {
  font-size: 18px;
  color: #1890ff;
}

.account-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  font-family: 'Monaco', 'Courier New', monospace;
}

.account-role {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
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
