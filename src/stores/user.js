import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDebugStore, delay } from './debug'
import users from '../mock/users.json'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref(null)

  const login = async (username, password) => {
    const debug = useDebugStore()

    debug.log('info', '🔐 用户登录请求')
    debug.log('info', `验证用户名：${username}`)

    await delay(300)

    const user = users.find(u => u.username === username)

    if (!user) {
      debug.log('error', '用户不存在')
      throw new Error('用户不存在')
    }

    debug.log('success', '验证用户名：通过')
    debug.log('info', '验证密码：******')

    await delay(200)

    if (user.password !== password) {
      debug.log('error', '密码错误')
      throw new Error('密码错误')
    }

    debug.log('success', '验证密码：通过')
    debug.log('info', `查询用户权限：${user.role}`)

    await delay(200)

    debug.log('success', `加载组织架构：${user.department}`)

    // 生成模拟Token
    const mockToken = btoa(`${username}:${Date.now()}`)
    token.value = mockToken

    debug.log('success', `生成Token：${mockToken.substring(0, 20)}...`)
    debug.log('success', '→ 跳转至首页')

    currentUser.value = user

    // 保存到localStorage
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', mockToken)

    return user
  }

  const logout = () => {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      currentUser.value = JSON.parse(savedUser)
      token.value = savedToken
      return true
    }
    return false
  }

  return {
    currentUser,
    token,
    login,
    logout,
    checkAuth
  }
})
