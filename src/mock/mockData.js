// 汇仁药业低代码平台 - 完整Mock数据
// 包含6大系统的模拟数据：MES, QMS, WMS, ERP, OA, CRM

// ==================== 产品主数据 ====================
export const products = [
  { code: 'P001', name: '肾宝片', spec: '0.5g*12片*3板', unit: '盒' },
  { code: 'P002', name: '六味地黄丸', spec: '9g*10丸', unit: '盒' },
  { code: 'P003', name: '乌鸡白凤丸', spec: '6g*10丸', unit: '盒' },
  { code: 'P004', name: '补肾固齿丸', spec: '6g*10丸', unit: '盒' },
  { code: 'P005', name: '藿香正气丸', spec: '9g*10丸', unit: '盒' }
]

// ==================== MES生产执行系统数据 ====================
export const mesData = {
  // 生产线配置
  productionLines: [
    {
      id: 'LINE-001',
      name: '肾宝片生产线',
      location: 'A车间1号线',
      status: 'running',
      capacity: 15000, // 日产能（盒）
      currentProduct: 'P001',
      currentBatch: 'BATCH-20251211001',
      currentOutput: 12580,
      targetOutput: 15000,
      startTime: '2025-12-11 08:00:00',
      operators: ['王师傅', '李师傅', '张师傅']
    },
    {
      id: 'LINE-002',
      name: '六味地黄丸生产线',
      location: 'A车间2号线',
      status: 'running',
      capacity: 12000,
      currentProduct: 'P002',
      currentBatch: 'BATCH-20251211002',
      currentOutput: 9650,
      targetOutput: 12000,
      startTime: '2025-12-11 08:30:00',
      operators: ['赵师傅', '刘师傅']
    },
    {
      id: 'LINE-003',
      name: '乌鸡白凤丸生产线',
      location: 'B车间1号线',
      status: 'maintenance',
      capacity: 10000,
      currentProduct: null,
      currentBatch: null,
      currentOutput: 0,
      targetOutput: 0,
      startTime: null,
      operators: []
    }
  ],

  // 生产历史数据（近7天）
  productionHistory: [
    { date: '2025-12-04', output: 33200, target: 37000, oee: 0.847 },
    { date: '2025-12-05', output: 34800, target: 37000, oee: 0.892 },
    { date: '2025-12-06', output: 33100, target: 37000, oee: 0.835 },
    { date: '2025-12-07', output: 35500, target: 37000, oee: 0.905 },
    { date: '2025-12-08', output: 34300, target: 37000, oee: 0.873 },
    { date: '2025-12-09', output: 35650, target: 37000, oee: 0.913 },
    { date: '2025-12-10', output: 34580, target: 37000, oee: 0.881 }
  ],

  // 设备运行状态
  equipment: [
    { id: 'DEV-A-001', name: '混合机01', line: 'LINE-001', status: 'running', utilization: 0.92 },
    { id: 'DEV-A-002', name: '压片机01', line: 'LINE-001', status: 'running', utilization: 0.89 },
    { id: 'DEV-A-003', name: '包装机01', line: 'LINE-001', status: 'running', utilization: 0.95 },
    { id: 'DEV-B-001', name: '混合机02', line: 'LINE-002', status: 'running', utilization: 0.87 },
    { id: 'DEV-B-002', name: '压片机02', line: 'LINE-002', status: 'running', utilization: 0.85 },
    { id: 'DEV-B-003', name: '包装机02', line: 'LINE-002', status: 'running', utilization: 0.91 },
    { id: 'DEV-C-001', name: '混合机03', line: 'LINE-003', status: 'maintenance', utilization: 0.0 },
    { id: 'DEV-C-002', name: '丸剂机01', line: 'LINE-003', status: 'maintenance', utilization: 0.0 }
  ]
}

// ==================== QMS质量管理系统数据 ====================
export const qmsData = {
  // 批次检验记录（近30批）
  batchInspections: [
    {
      batch_no: 'BATCH-20251211001',
      product: 'P001',
      product_name: '肾宝片',
      inspection_status: '检验中',
      sample_size: 200,
      qualified_count: 187,
      unqualified_count: 13,
      pass_rate: 93.5,
      inspector: '质检员-赵六',
      inspection_time: '2025-12-11 14:30:00',
      defect_types: {
        '外观不良': 5,
        '重量偏差': 4,
        '硬度不合格': 3,
        '崩解时限': 1
      }
    },
    {
      batch_no: 'BATCH-20251211002',
      product: 'P002',
      product_name: '六味地黄丸',
      inspection_status: '已完成',
      sample_size: 200,
      qualified_count: 196,
      unqualified_count: 4,
      pass_rate: 98.0,
      inspector: '质检员-孙七',
      inspection_time: '2025-12-11 15:45:00',
      defect_types: {
        '外观不良': 2,
        '重量偏差': 2
      }
    },
    {
      batch_no: 'BATCH-20251210001',
      product: 'P001',
      product_name: '肾宝片',
      inspection_status: '已完成',
      sample_size: 200,
      qualified_count: 192,
      unqualified_count: 8,
      pass_rate: 96.0,
      inspector: '质检员-赵六',
      inspection_time: '2025-12-10 16:20:00',
      defect_types: {
        '外观不良': 3,
        '重量偏差': 5
      }
    },
    {
      batch_no: 'BATCH-20251210002',
      product: 'P002',
      product_name: '六味地黄丸',
      inspection_status: '已完成',
      sample_size: 200,
      qualified_count: 199,
      unqualified_count: 1,
      pass_rate: 99.5,
      inspector: '质检员-孙七',
      inspection_time: '2025-12-10 17:10:00',
      defect_types: {
        '重量偏差': 1
      }
    },
    {
      batch_no: 'BATCH-20251209001',
      product: 'P003',
      product_name: '乌鸡白凤丸',
      inspection_status: '已完成',
      sample_size: 200,
      qualified_count: 197,
      unqualified_count: 3,
      pass_rate: 98.5,
      inspector: '质检员-周八',
      inspection_time: '2025-12-09 14:50:00',
      defect_types: {
        '外观不良': 1,
        '重量偏差': 2
      }
    }
  ],

  // 质量趋势数据（近7天）
  qualityTrend: [
    { date: '2025-12-04', pass_rate: 98.8, inspections: 142, defects: 17 },
    { date: '2025-12-05', pass_rate: 99.2, inspections: 156, defects: 12 },
    { date: '2025-12-06', pass_rate: 98.5, inspections: 138, defects: 21 },
    { date: '2025-12-07', pass_rate: 99.0, inspections: 165, defects: 17 },
    { date: '2025-12-08', pass_rate: 99.3, inspections: 159, defects: 11 },
    { date: '2025-12-09', pass_rate: 99.1, inspections: 151, defects: 14 },
    { date: '2025-12-10', pass_rate: 98.7, inspections: 156, defects: 20 }
  ],

  // GMP合规检查
  gmpCompliance: {
    lastAuditDate: '2025-11-15',
    nextAuditDate: '2026-02-15',
    complianceRate: 98.5,
    openIssues: 3,
    closedIssues: 47
  }
}

// ==================== WMS仓储管理系统数据 ====================
export const wmsData = {
  // 原料库存
  rawMaterials: [
    {
      material_code: 'RM001',
      material_name: '当归',
      category: '中药材',
      stock: 1250, // kg
      safety_stock: 2000,
      unit: 'kg',
      location: '原料库-A01',
      status: 'low_stock', // 低库存预警
      supplier: '安徽亳州中药材公司',
      last_purchase: '2025-12-05',
      batch_no: 'RM-BATCH-202512001'
    },
    {
      material_code: 'RM002',
      material_name: '黄芪',
      category: '中药材',
      stock: 1580,
      safety_stock: 2000,
      unit: 'kg',
      location: '原料库-A02',
      status: 'low_stock',
      supplier: '甘肃定西中药材公司',
      last_purchase: '2025-12-03',
      batch_no: 'RM-BATCH-202512002'
    },
    {
      material_code: 'RM003',
      material_name: '枸杞子',
      category: '中药材',
      stock: 890,
      safety_stock: 1500,
      unit: 'kg',
      location: '原料库-A03',
      status: 'critical', // 严重短缺
      supplier: '宁夏中宁枸杞公司',
      last_purchase: '2025-11-28',
      batch_no: 'RM-BATCH-202511003'
    },
    {
      material_code: 'RM004',
      material_name: '熟地黄',
      category: '中药材',
      stock: 3200,
      safety_stock: 2000,
      unit: 'kg',
      location: '原料库-A04',
      status: 'normal',
      supplier: '河南焦作中药材公司',
      last_purchase: '2025-12-08',
      batch_no: 'RM-BATCH-202512004'
    },
    {
      material_code: 'RM005',
      material_name: '山药',
      category: '中药材',
      stock: 2750,
      safety_stock: 2000,
      unit: 'kg',
      location: '原料库-A05',
      status: 'normal',
      supplier: '河南焦作中药材公司',
      last_purchase: '2025-12-07',
      batch_no: 'RM-BATCH-202512005'
    },
    {
      material_code: 'RM006',
      material_name: '山茱萸',
      category: '中药材',
      stock: 2100,
      safety_stock: 1500,
      unit: 'kg',
      location: '原料库-A06',
      status: 'normal',
      supplier: '河南南阳中药材公司',
      last_purchase: '2025-12-06',
      batch_no: 'RM-BATCH-202512006'
    }
  ],

  // 成品库存
  finishedGoods: [
    {
      product_code: 'P001',
      product_name: '肾宝片',
      stock: 45800,
      unit: '盒',
      location: '成品库-B01',
      status: 'normal',
      production_date: '2025-12-10',
      expiry_date: '2027-12-10'
    },
    {
      product_code: 'P002',
      product_name: '六味地黄丸',
      stock: 38600,
      unit: '盒',
      location: '成品库-B02',
      status: 'normal',
      production_date: '2025-12-09',
      expiry_date: '2027-12-09'
    },
    {
      product_code: 'P003',
      product_name: '乌鸡白凤丸',
      stock: 22100,
      unit: '盒',
      location: '成品库-B03',
      status: 'normal',
      production_date: '2025-12-08',
      expiry_date: '2027-12-08'
    },
    {
      product_code: 'P004',
      product_name: '补肾固齿丸',
      stock: 15400,
      unit: '盒',
      location: '成品库-B04',
      status: 'normal',
      production_date: '2025-12-07',
      expiry_date: '2027-12-07'
    },
    {
      product_code: 'P005',
      product_name: '藿香正气丸',
      stock: 31200,
      unit: '盒',
      location: '成品库-B05',
      status: 'normal',
      production_date: '2025-12-06',
      expiry_date: '2027-12-06'
    }
  ],

  // 库存周转率
  turnoverRate: {
    rawMaterials: 4.2, // 次/年
    finishedGoods: 8.5 // 次/年
  },

  // 出入库记录（近10条）
  transactions: [
    {
      id: 'TRX-20251211001',
      type: 'outbound',
      date: '2025-12-11 09:30:00',
      product: 'P001',
      quantity: 5000,
      destination: '经销商-华东区-001',
      operator: '仓管员-钱九'
    },
    {
      id: 'TRX-20251211002',
      type: 'inbound',
      date: '2025-12-11 10:45:00',
      product: 'P002',
      quantity: 12000,
      source: '生产线-LINE-002',
      operator: '仓管员-孙十'
    },
    {
      id: 'TRX-20251210003',
      type: 'outbound',
      date: '2025-12-10 14:20:00',
      product: 'P001',
      quantity: 8000,
      destination: '经销商-华南区-002',
      operator: '仓管员-钱九'
    }
  ]
}

// ==================== ERP企业资源计划系统数据 ====================
export const erpData = {
  // 销售订单（近30天）
  salesOrders: [
    {
      order_no: 'SO-20251211001',
      customer_name: '华东区经销商-上海仁和医药',
      customer_code: 'CUST-001',
      order_date: '2025-12-11',
      delivery_date: '2025-12-15',
      status: 'confirmed',
      total_amount: 285000,
      items: [
        { product: 'P001', quantity: 5000, unit_price: 32, amount: 160000 },
        { product: 'P002', quantity: 2500, unit_price: 50, amount: 125000 }
      ]
    },
    {
      order_no: 'SO-20251210002',
      customer_name: '华南区经销商-广州康诺医药',
      customer_code: 'CUST-002',
      order_date: '2025-12-10',
      delivery_date: '2025-12-14',
      status: 'in_delivery',
      total_amount: 420000,
      items: [
        { product: 'P001', quantity: 8000, unit_price: 32, amount: 256000 },
        { product: 'P003', quantity: 4000, unit_price: 41, amount: 164000 }
      ]
    },
    {
      order_no: 'SO-20251209003',
      customer_name: '华北区经销商-北京同仁堂',
      customer_code: 'CUST-003',
      order_date: '2025-12-09',
      delivery_date: '2025-12-12',
      status: 'completed',
      total_amount: 315000,
      items: [
        { product: 'P002', quantity: 6000, unit_price: 50, amount: 300000 },
        { product: 'P005', quantity: 500, unit_price: 30, amount: 15000 }
      ]
    },
    {
      order_no: 'SO-20251208004',
      customer_name: '西南区经销商-成都百草堂',
      customer_code: 'CUST-004',
      order_date: '2025-12-08',
      delivery_date: '2025-12-11',
      status: 'completed',
      total_amount: 195000,
      items: [
        { product: 'P001', quantity: 3000, unit_price: 32, amount: 96000 },
        { product: 'P004', quantity: 3000, unit_price: 33, amount: 99000 }
      ]
    },
    {
      order_no: 'SO-20251207005',
      customer_name: '华中区经销商-武汉九州通',
      customer_code: 'CUST-005',
      order_date: '2025-12-07',
      delivery_date: '2025-12-10',
      status: 'overdue',
      total_amount: 560000,
      items: [
        { product: 'P001', quantity: 10000, unit_price: 32, amount: 320000 },
        { product: 'P002', quantity: 4000, unit_price: 50, amount: 200000 },
        { product: 'P003', quantity: 1000, unit_price: 40, amount: 40000 }
      ]
    }
  ],

  // 订单履约率统计
  fulfillment: {
    onTimeOrders: 87,
    totalOrders: 92,
    onTimeRate: 94.6,
    overdueOrders: 5,
    averageDelay: 1.8 // 天
  },

  // 采购订单（原料）
  purchaseOrders: [
    {
      po_no: 'PO-20251211001',
      supplier: '安徽亳州中药材公司',
      material: 'RM001',
      material_name: '当归',
      quantity: 2000,
      unit: 'kg',
      unit_price: 85,
      total_amount: 170000,
      order_date: '2025-12-11',
      expected_date: '2025-12-18',
      status: 'pending'
    },
    {
      po_no: 'PO-20251210002',
      supplier: '甘肃定西中药材公司',
      material: 'RM002',
      material_name: '黄芪',
      quantity: 1500,
      unit: 'kg',
      unit_price: 92,
      total_amount: 138000,
      order_date: '2025-12-10',
      expected_date: '2025-12-17',
      status: 'pending'
    },
    {
      po_no: 'PO-20251209003',
      supplier: '宁夏中宁枸杞公司',
      material: 'RM003',
      material_name: '枸杞子',
      quantity: 1000,
      unit: 'kg',
      unit_price: 120,
      total_amount: 120000,
      order_date: '2025-12-09',
      expected_date: '2025-12-16',
      status: 'in_transit'
    }
  ],

  // 财务数据
  financial: {
    monthlyRevenue: 12580000, // 本月营收（元）
    monthlyProfit: 3145000, // 本月利润（元）
    profitMargin: 0.25, // 利润率
    accountsReceivable: 4580000, // 应收账款
    accountsPayable: 2340000 // 应付账款
  }
}

// ==================== OA办公自动化系统数据 ====================
export const oaData = {
  // 待审批事项
  pendingApprovals: [
    {
      id: 'APPROVAL-20251211001',
      type: '采购申请',
      title: '当归采购申请-2000kg',
      applicant: '采购部-李经理',
      apply_date: '2025-12-11 09:30:00',
      amount: 170000,
      status: 'pending',
      current_approver: 'CEO-陈总'
    },
    {
      id: 'APPROVAL-20251211002',
      type: '费用报销',
      title: '差旅费报销',
      applicant: '销售部-王主管',
      apply_date: '2025-12-11 10:15:00',
      amount: 8500,
      status: 'pending',
      current_approver: '财务部-张经理'
    },
    {
      id: 'APPROVAL-20251210003',
      type: '请假申请',
      title: '事假申请-2天',
      applicant: '生产部-赵师傅',
      apply_date: '2025-12-10 14:20:00',
      amount: 0,
      status: 'pending',
      current_approver: '生产部-刘经理'
    },
    {
      id: 'APPROVAL-20251210004',
      type: 'OKR审批',
      title: 'Q4 OKR审批-销售部',
      applicant: '销售部-王主管',
      apply_date: '2025-12-10 16:45:00',
      amount: 0,
      status: 'approved',
      current_approver: 'CEO-陈总'
    }
  ],

  // 公告通知
  announcements: [
    {
      id: 'ANN-20251211001',
      title: '关于加强GMP规范执行的通知',
      publisher: '质量部',
      publish_date: '2025-12-11',
      priority: 'high',
      read_count: 156
    },
    {
      id: 'ANN-20251210002',
      title: '2025年年终总结大会通知',
      publisher: '行政部',
      publish_date: '2025-12-10',
      priority: 'normal',
      read_count: 342
    },
    {
      id: 'ANN-20251209003',
      title: '冬季安全生产注意事项',
      publisher: '安全部',
      publish_date: '2025-12-09',
      priority: 'high',
      read_count: 298
    }
  ],

  // 工作流统计
  workflowStats: {
    totalTasks: 156,
    completedTasks: 132,
    pendingTasks: 23,
    overdureTasks: 1,
    averageProcessTime: 2.3 // 天
  }
}

// ==================== CRM客户关系管理系统数据 ====================
export const crmData = {
  // 经销商客户（B2B）
  distributors: [
    {
      customer_code: 'CUST-001',
      customer_name: '华东区经销商-上海仁和医药',
      region: '华东',
      contact_person: '张经理',
      contact_phone: '021-12345678',
      level: 'A', // A级大客户
      credit_limit: 2000000,
      current_balance: 285000,
      total_orders_ytd: 45, // 今年订单数
      total_amount_ytd: 8650000, // 今年订单总额
      last_order_date: '2025-12-11',
      cooperation_years: 8
    },
    {
      customer_code: 'CUST-002',
      customer_name: '华南区经销商-广州康诺医药',
      region: '华南',
      contact_person: '李经理',
      contact_phone: '020-87654321',
      level: 'A',
      credit_limit: 1500000,
      current_balance: 420000,
      total_orders_ytd: 38,
      total_amount_ytd: 7230000,
      last_order_date: '2025-12-10',
      cooperation_years: 6
    },
    {
      customer_code: 'CUST-003',
      customer_name: '华北区经销商-北京同仁堂',
      region: '华北',
      contact_person: '王经理',
      contact_phone: '010-88776655',
      level: 'S', // S级战略客户
      credit_limit: 3000000,
      current_balance: 0,
      total_orders_ytd: 52,
      total_amount_ytd: 12450000,
      last_order_date: '2025-12-09',
      cooperation_years: 15
    },
    {
      customer_code: 'CUST-004',
      customer_name: '西南区经销商-成都百草堂',
      region: '西南',
      contact_person: '赵经理',
      contact_phone: '028-66554433',
      level: 'B',
      credit_limit: 1000000,
      current_balance: 195000,
      total_orders_ytd: 28,
      total_amount_ytd: 4580000,
      last_order_date: '2025-12-08',
      cooperation_years: 4
    },
    {
      customer_code: 'CUST-005',
      customer_name: '华中区经销商-武汉九州通',
      region: '华中',
      contact_person: '刘经理',
      contact_phone: '027-33221100',
      level: 'A',
      credit_limit: 2000000,
      current_balance: 560000,
      total_orders_ytd: 41,
      total_amount_ytd: 9120000,
      last_order_date: '2025-12-07',
      cooperation_years: 10
    }
  ],

  // 终端医院客户（B2B2C）
  hospitals: [
    {
      hospital_code: 'HOSP-001',
      hospital_name: '北京协和医院',
      level: '三甲',
      region: '华北',
      distributor: 'CUST-003',
      monthly_purchase: 125000
    },
    {
      hospital_code: 'HOSP-002',
      hospital_name: '上海华山医院',
      level: '三甲',
      region: '华东',
      distributor: 'CUST-001',
      monthly_purchase: 98000
    },
    {
      hospital_code: 'HOSP-003',
      hospital_name: '广州中山医院',
      level: '三甲',
      region: '华南',
      distributor: 'CUST-002',
      monthly_purchase: 87000
    }
  ],

  // 客户投诉与反馈
  complaints: [
    {
      id: 'COMP-20251210001',
      customer: 'CUST-004',
      product: 'P001',
      issue: '包装破损',
      severity: 'low',
      status: 'resolved',
      submit_date: '2025-12-10',
      resolve_date: '2025-12-11'
    },
    {
      id: 'COMP-20251205002',
      customer: 'CUST-002',
      product: 'P002',
      issue: '物流延迟',
      severity: 'medium',
      status: 'in_process',
      submit_date: '2025-12-05',
      resolve_date: null
    }
  ]
}

// ==================== 生产异常工单数据 ====================
export const productionWorkOrders = [
  {
    workorder_no: 'WO20251211001',
    device_id: 'DEV-A-001',
    batch_no: 'BATCH-20251211001',
    fault_type: '设备故障',
    description: 'A区1号混合机01温度传感器故障，温度显示异常',
    reporter: '王师傅',
    assigned_to: '李师傅',
    status: 'COMPLETED',
    priority: '紧急',
    created_at: '2025-12-11 10:30',
    completed_at: '2025-12-11 11:15',
    photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251211002',
    device_id: 'DEV-B-002',
    batch_no: 'BATCH-20251211002',
    fault_type: '质量异常',
    description: 'B区压片机02生产的片剂重量偏差超出允许范围',
    reporter: '张师傅',
    assigned_to: '赵师傅',
    status: 'PROCESSING',
    priority: '普通',
    created_at: '2025-12-11 14:20',
    photos: ['https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251211003',
    device_id: 'DEV-C-001',
    batch_no: 'BATCH-20251209001',
    fault_type: '安全隐患',
    description: 'C区混合机03护栏松动，存在安全隐患',
    reporter: '刘师傅',
    assigned_to: null,
    status: 'PENDING',
    priority: '紧急',
    created_at: '2025-12-11 15:45',
    photos: []
  },
  {
    workorder_no: 'WO20251210004',
    device_id: 'DEV-A-003',
    batch_no: 'BATCH-20251210001',
    fault_type: '设备故障',
    description: '包装机01输送带异响，需要检修',
    reporter: '孙师傅',
    assigned_to: '周师傅',
    status: 'COMPLETED',
    priority: '普通',
    created_at: '2025-12-10 09:15',
    completed_at: '2025-12-10 10:30',
    photos: ['https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251210005',
    device_id: 'DEV-B-001',
    batch_no: 'BATCH-20251210002',
    fault_type: '工艺偏差',
    description: '混合时间超过标准工艺时间2分钟',
    reporter: '赵师傅',
    assigned_to: '钱师傅',
    status: 'COMPLETED',
    priority: '普通',
    created_at: '2025-12-10 13:40',
    completed_at: '2025-12-10 14:25',
    photos: []
  },
  {
    workorder_no: 'WO20251209006',
    device_id: 'DEV-A-002',
    batch_no: 'BATCH-20251209001',
    fault_type: '原料问题',
    description: '当归原料水分含量超标，影响生产',
    reporter: '李师傅',
    assigned_to: '孙师傅',
    status: 'COMPLETED',
    priority: '紧急',
    created_at: '2025-12-09 08:50',
    completed_at: '2025-12-09 10:20',
    photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251209007',
    device_id: 'DEV-C-002',
    batch_no: 'BATCH-20251209001',
    fault_type: '设备故障',
    description: '丸剂机主轴异常震动',
    reporter: '周师傅',
    assigned_to: null,
    status: 'PENDING',
    priority: '紧急',
    created_at: '2025-12-09 16:10',
    photos: ['https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251208008',
    device_id: 'DEV-B-003',
    batch_no: 'BATCH-20251208001',
    fault_type: '环境因素',
    description: 'B车间湿度超标，影响片剂质量',
    reporter: '钱师傅',
    assigned_to: '吴师傅',
    status: 'COMPLETED',
    priority: '普通',
    created_at: '2025-12-08 11:30',
    completed_at: '2025-12-08 13:00',
    photos: []
  },
  {
    workorder_no: 'WO20251208009',
    device_id: 'DEV-A-001',
    batch_no: 'BATCH-20251208002',
    fault_type: '设备故障',
    description: '混合机控制面板显示错误',
    reporter: '王师傅',
    assigned_to: '李师傅',
    status: 'COMPLETED',
    priority: '普通',
    created_at: '2025-12-08 14:50',
    completed_at: '2025-12-08 15:45',
    photos: ['https://via.placeholder.com/150']
  },
  {
    workorder_no: 'WO20251207010',
    device_id: 'DEV-A-002',
    batch_no: 'BATCH-20251207001',
    fault_type: '人员操作',
    description: '操作人员未按SOP流程操作',
    reporter: '张师傅',
    assigned_to: '赵师傅',
    status: 'COMPLETED',
    priority: '普通',
    created_at: '2025-12-07 10:20',
    completed_at: '2025-12-07 11:00',
    photos: []
  }
]

// ==================== 工单统计数据 ====================
export const workOrderStats = {
  byType: [
    { type: '设备故障', count: 12 },
    { type: '原料问题', count: 8 },
    { type: '工艺偏差', count: 15 },
    { type: '人员操作', count: 6 },
    { type: '环境因素', count: 4 }
  ],
  byStatus: {
    pending: 3,
    processing: 2,
    completed: 12
  },
  avgResponseTime: 15 // 分钟
}

// 导出所有数据
export default {
  products,
  mesData,
  qmsData,
  wmsData,
  erpData,
  oaData,
  crmData,
  productionWorkOrders,
  workOrderStats
}
