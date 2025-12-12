/**
 * 表单模板数据
 * 这是低代码平台的核心：在"表单设计器"中设计的模板
 */

export const formTemplates = [
  {
    id: 'leave-application-form',
    name: '请假申请表单',
    category: '人事管理',
    version: 'v1.2',
    description: '用于员工提交请假申请',
    icon: '🌴',
    usedBy: ['请假申请'], // 被哪些业务场景使用
    status: 'published', // draft, published, archived
    createdBy: '系统管理员',
    createdAt: '2024-11-01',
    updatedAt: '2024-12-10',
    // 表单字段配置（从表单设计器导出）
    fields: [
      {
        id: 'leave_type',
        type: 'select',
        label: '请假类型',
        required: true,
        options: ['年假', '病假', '事假', '调休']
      },
      {
        id: 'start_date',
        type: 'date',
        label: '开始日期',
        required: true
      },
      {
        id: 'end_date',
        type: 'date',
        label: '结束日期',
        required: true
      },
      {
        id: 'reason',
        type: 'textarea',
        label: '请假事由',
        required: true,
        placeholder: '请详细说明请假原因'
      }
    ]
  },
  {
    id: 'expense-reimbursement-form',
    name: '报销申请表单',
    category: '财务管理',
    version: 'v1.0',
    description: '用于员工提交费用报销',
    icon: '💰',
    usedBy: ['费用报销'],
    status: 'published',
    createdBy: '系统管理员',
    createdAt: '2024-11-15',
    updatedAt: '2024-11-15',
    fields: [
      {
        id: 'expense_type',
        type: 'select',
        label: '报销类型',
        required: true,
        options: ['差旅费', '办公用品', '业务招待', '培训费', '其他']
      },
      {
        id: 'amount',
        type: 'number',
        label: '报销金额',
        required: true,
        unit: '元'
      },
      {
        id: 'expense_date',
        type: 'date',
        label: '费用发生日期',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: '费用说明',
        required: true,
        placeholder: '请详细说明费用用途'
      },
      {
        id: 'attachments',
        type: 'upload',
        label: '票据附件',
        required: true,
        accept: 'image/*,application/pdf',
        maxCount: 5
      }
    ]
  },
  {
    id: 'okr-creation-form',
    name: 'OKR填报表单',
    category: '绩效管理',
    version: 'v2.0',
    description: '用于员工创建季度OKR',
    icon: '🎯',
    usedBy: ['OKR管理'],
    status: 'published',
    createdBy: '系统管理员',
    createdAt: '2024-10-01',
    updatedAt: '2024-12-01',
    fields: [
      {
        id: 'objective_title',
        type: 'text',
        label: '目标标题',
        required: true,
        placeholder: '例如：提升生产效率20%'
      },
      {
        id: 'objective_description',
        type: 'textarea',
        label: '目标描述',
        required: true,
        placeholder: '详细描述目标内容和意义'
      },
      {
        id: 'period',
        type: 'select',
        label: '考核周期',
        required: true,
        options: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', '2025年度']
      },
      {
        id: 'key_results',
        type: 'dynamic_list',
        label: '关键结果',
        required: true,
        min: 1,
        max: 5,
        itemFields: [
          { id: 'kr_title', type: 'text', label: 'KR标题', required: true },
          { id: 'kr_initial', type: 'number', label: '初始值', required: true },
          { id: 'kr_target', type: 'number', label: '目标值', required: true },
          { id: 'kr_weight', type: 'number', label: '权重(%)', required: true }
        ]
      }
    ]
  },
  {
    id: 'production-workorder-form',
    name: '生产工单上报表单',
    category: '生产管理',
    version: 'v1.1',
    description: '用于车间工人上报生产异常',
    icon: '🏭',
    usedBy: ['生产异常工单'],
    status: 'published',
    createdBy: '系统管理员',
    createdAt: '2024-11-20',
    updatedAt: '2024-12-05',
    fields: [
      {
        id: 'device_code',
        type: 'scan',
        label: '设备编号',
        required: true,
        scanType: 'barcode',
        placeholder: '点击扫描设备二维码'
      },
      {
        id: 'batch_code',
        type: 'scan',
        label: '产品批次',
        required: true,
        scanType: 'barcode',
        placeholder: '点击扫描批次二维码'
      },
      {
        id: 'exception_type',
        type: 'select',
        label: '异常类型',
        required: true,
        options: ['设备故障', '质量异常', '工艺偏差', '安全隐患', '其他']
      },
      {
        id: 'priority',
        type: 'select',
        label: '优先级',
        required: true,
        options: ['普通', '紧急', '特急']
      },
      {
        id: 'photos',
        type: 'upload',
        label: '现场照片',
        required: true,
        accept: 'image/*',
        maxCount: 6,
        capture: 'camera' // 移动端直接调用相机
      },
      {
        id: 'description',
        type: 'textarea',
        label: '异常描述',
        required: true,
        placeholder: '请详细描述异常情况（不少于10个字）',
        minLength: 10
      }
    ]
  },
  {
    id: 'customer-info-form',
    name: '客户信息采集表单',
    category: '客户管理',
    version: 'v1.0',
    description: '用于销售人员采集客户信息',
    icon: '👥',
    usedBy: ['客户管理'],
    status: 'published',
    createdBy: '系统管理员',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
    fields: [
      {
        id: 'customer_name',
        type: 'text',
        label: '客户名称',
        required: true,
        placeholder: '例如：XX医药有限公司'
      },
      {
        id: 'customer_type',
        type: 'select',
        label: '客户类型',
        required: true,
        options: ['经销商', '医院', '药店', '其他']
      },
      {
        id: 'contact_person',
        type: 'text',
        label: '联系人',
        required: true
      },
      {
        id: 'contact_phone',
        type: 'text',
        label: '联系电话',
        required: true,
        pattern: '^1[3-9]\\d{9}$',
        patternMessage: '请输入有效的手机号码'
      },
      {
        id: 'address',
        type: 'text',
        label: '客户地址',
        required: false
      },
      {
        id: 'level',
        type: 'select',
        label: '客户等级',
        required: true,
        options: ['A级（重点）', 'B级（一般）', 'C级（潜在）']
      }
    ]
  }
]

/**
 * 业务场景配置
 * 定义每个业务场景使用哪个表单模板
 */
export const businessSceneConfig = {
  'leave': {
    sceneName: '请假申请',
    templateId: 'leave-application-form',
    templateName: '请假申请表单',
    route: '/leave',
    enabled: true
  },
  'expense': {
    sceneName: '费用报销',
    templateId: 'expense-reimbursement-form',
    templateName: '报销申请表单',
    route: '/expense',
    enabled: true
  },
  'okr': {
    sceneName: 'OKR管理',
    templateId: 'okr-creation-form',
    templateName: 'OKR填报表单',
    route: '/okr',
    enabled: true
  },
  'workorder': {
    sceneName: '生产异常工单',
    templateId: 'production-workorder-form',
    templateName: '生产工单上报表单',
    route: '/workorder',
    enabled: true
  },
  'customer': {
    sceneName: '客户管理',
    templateId: 'customer-info-form',
    templateName: '客户信息采集表单',
    route: '/customer',
    enabled: false // 暂未启用
  }
}

/**
 * 根据业务场景获取表单模板
 */
export function getTemplateByScene(sceneKey) {
  const config = businessSceneConfig[sceneKey]
  if (!config) return null

  return formTemplates.find(t => t.id === config.templateId)
}

/**
 * 根据模板ID获取表单模板
 */
export function getTemplateById(templateId) {
  return formTemplates.find(t => t.id === templateId)
}

/**
 * 获取所有已发布的表单模板
 */
export function getPublishedTemplates() {
  return formTemplates.filter(t => t.status === 'published')
}
