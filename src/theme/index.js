// 慧仁医药主题配置
export const themeConfig = {
  token: {
    // 品牌色 - 医药红色系
    colorPrimary: '#d81e06',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // 文字颜色
    colorTextBase: '#262626',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8c8c8c',

    // 边框
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // 字体
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,

    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      primaryShadow: '0 2px 8px rgba(216, 30, 6, 0.2)',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 2px 12px rgba(0, 0, 0, 0.06)',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#262626',
      rowHoverBg: '#fff7f7',
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Select: {
      controlHeight: 40,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(216, 30, 6, 0.08)',
      itemSelectedColor: '#d81e06',
      itemHoverBg: 'rgba(216, 30, 6, 0.04)',
    },
  },
}

// 自定义颜色变量
export const customColors = {
  // 渐变色
  gradientRed: 'linear-gradient(135deg, #d81e06 0%, #ff6b6b 100%)',
  gradientBlue: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
  gradientGreen: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
  gradientOrange: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
  gradientPurple: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',

  // 背景色
  bgGray: '#fafafa',
  bgLight: '#ffffff',

  // 医药行业特色色
  medicalRed: '#d81e06',
  medicalRedLight: '#ff6b6b',
  medicalRedDark: '#a81505',

  // 状态色增强
  statusPending: '#faad14',
  statusProcessing: '#1890ff',
  statusSuccess: '#52c41a',
  statusError: '#ff4d4f',
  statusWarning: '#fa8c16',
}
