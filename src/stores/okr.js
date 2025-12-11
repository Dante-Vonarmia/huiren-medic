import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDebugStore, delay } from './debug'
import initialOKRs from '../mock/okr.json'

export const useOKRStore = defineStore('okr', () => {
  const okrs = ref([...initialOKRs])
  const nextId = ref(Math.max(...initialOKRs.map(o => o.id), 0) + 1)

  const create = async (okrData) => {
    const debug = useDebugStore()

    debug.log('info', '📝 创建OKR请求')
    debug.log('info', `标题：${okrData.title}`)

    await delay(300)

    debug.log('info', '校验字段完整性...')

    await delay(200)

    const newOKR = {
      id: nextId.value++,
      ...okrData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    okrs.value.push(newOKR)

    debug.log('success', `OKR创建成功，ID: ${newOKR.id}`)
    debug.log('info', `查询审批人：${okrData.approver_name || '直属经理'}`)

    await delay(200)

    debug.log('info', '创建审批记录...')
    debug.log('success', '发送审批通知')
    debug.log('success', '→ OKR已提交审批')

    return newOKR
  }

  const approve = async (id, comment = '') => {
    const debug = useDebugStore()

    debug.log('info', `✓ OKR审批请求 #${id}`)

    await delay(300)

    const okr = okrs.value.find(o => o.id === id)
    if (!okr) {
      debug.log('error', 'OKR不存在')
      throw new Error('OKR不存在')
    }

    debug.log('info', '加载OKR详情...')

    await delay(200)

    okr.status = 'approved'
    okr.updated_at = new Date().toISOString()
    okr.approval_comment = comment

    debug.log('success', '更新OKR状态：pending → approved')
    debug.log('info', '记录审批日志...')

    await delay(200)

    debug.log('success', '发送通知给员工')
    debug.log('success', '审批完成')

    return okr
  }

  const reject = async (id, comment) => {
    const debug = useDebugStore()

    debug.log('info', `✗ OKR退回请求 #${id}`)

    await delay(300)

    const okr = okrs.value.find(o => o.id === id)
    if (!okr) {
      debug.log('error', 'OKR不存在')
      throw new Error('OKR不存在')
    }

    okr.status = 'draft'
    okr.updated_at = new Date().toISOString()
    okr.approval_comment = comment

    debug.log('success', '更新OKR状态：pending → draft')
    debug.log('info', '记录退回原因...')

    await delay(200)

    debug.log('success', '发送通知给员工')
    debug.log('success', '退回完成')

    return okr
  }

  const updateProgress = async (okrId, krId, value) => {
    const debug = useDebugStore()

    debug.log('info', `📊 更新KR进度 #${krId}`)
    debug.log('info', `当前值：${value}`)

    await delay(300)

    const okr = okrs.value.find(o => o.id === okrId)
    if (!okr || !okr.keyResults) {
      debug.log('error', 'OKR或KR不存在')
      throw new Error('OKR或KR不存在')
    }

    const kr = okr.keyResults.find(k => k.id === krId)
    if (!kr) {
      debug.log('error', 'KR不存在')
      throw new Error('KR不存在')
    }

    kr.current_value = value
    okr.updated_at = new Date().toISOString()

    debug.log('success', '进度更新成功')

    // 计算完成百分比
    const completion = ((value - kr.initial_value) / (kr.target_value - kr.initial_value) * 100).toFixed(1)
    debug.log('info', `完成度：${completion}%`)

    return okr
  }

  // 计算属性
  const myOKRs = computed(() => {
    return (userId) => okrs.value.filter(o => o.owner_id === userId)
  })

  const pendingOKRs = computed(() => {
    return (approverId) => okrs.value.filter(o =>
      o.status === 'pending' && o.approver_id === approverId
    )
  })

  const getById = computed(() => {
    return (id) => okrs.value.find(o => o.id === id)
  })

  return {
    okrs,
    create,
    approve,
    reject,
    updateProgress,
    myOKRs,
    pendingOKRs,
    getById
  }
})
