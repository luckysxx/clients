export interface PassportOauthProvider {
  id: string
  label: string
}

export interface PassportBrand {
  appId: string
  appCode: string
  productName: string
  brandMark: string
  accent: string
  accentDeep: string
  accentSoft: string
  heroGlow: string
  landingTitle: string
  landingDescription: string
  authTitle: string
  authDescription: string
  heroTitle: string
  heroDescription: string
  oauthProviders: PassportOauthProvider[]
}

const oauthProviders: PassportOauthProvider[] = [
  { id: 'google', label: '使用 Google 登录' },
  { id: 'apple', label: '使用 Apple 登录' },
]

const DEFAULT_PASSPORT_BRAND: PassportBrand = {
  appId: 'default',
  appCode: 'default',
  productName: 'Passport',
  brandMark: 'P',
  accent: '#3572ff',
  accentDeep: '#1f52d6',
  accentSoft: '#e6eeff',
  heroGlow: 'rgba(53, 114, 255, 0.24)',
  landingTitle: '统一通行证入口',
  landingDescription: '通过统一认证层接入业务应用。',
  authTitle: '欢迎使用 Passport',
  authDescription: '登录后继续进入对应应用。',
  heroTitle: '一个通行证承接多应用登录',
  heroDescription: '品牌、渠道和 OAuth2 能力都可以按应用扩展。',
  oauthProviders,
}

const passportBrands: Record<string, PassportBrand> = {
  'go-chat': {
    appId: 'go-chat',
    appCode: 'go-chat',
    productName: 'GoChat',
    brandMark: 'C',
    accent: '#3572ff',
    accentDeep: '#1f52d6',
    accentSoft: '#e6eeff',
    heroGlow: 'rgba(53, 114, 255, 0.24)',
    landingTitle: '统一通行证，先登录再进入会话工作台',
    landingDescription: '把 GoChat 的注册和登录入口收敛到统一认证层，聊天、消息和后续三方登录都从这一处进入。',
    authTitle: '欢迎使用 GoChat Passport',
    authDescription: '登录后继续进入聊天、消息与协作能力。',
    heroTitle: '一个账号接入聊天、团队和未来开放平台',
    heroDescription: '先把登录入口统一，再逐步承接组织、SSO 与第三方 OAuth2。',
    oauthProviders,
  },
  'go-note': {
    appId: 'go-note',
    appCode: 'go-note',
    productName: 'GoNote',
    brandMark: 'N',
    accent: '#2f8f6b',
    accentDeep: '#1f6d51',
    accentSoft: '#e2f5ec',
    heroGlow: 'rgba(47, 143, 107, 0.22)',
    landingTitle: '先通过通行证进入文档空间',
    landingDescription: 'GoNote 不再维护独立注册页，未登录用户先看产品介绍，再通过内嵌通行证登录或注册。',
    authTitle: '欢迎使用 GoNote Passport',
    authDescription: '完成登录后继续进入你的文档、云盘与知识库。',
    heroTitle: '统一账号，连接文档、知识与后续开放生态',
    heroDescription: '先把身份层做轻，再把邮箱、OAuth2 和组织能力逐步接上。',
    oauthProviders,
  },
  'slay-the-spire': {
    appId: 'slay-the-spire',
    appCode: 'slay-the-spire',
    productName: 'Slay the Spire',
    brandMark: 'S',
    accent: '#d66b2d',
    accentDeep: '#a84717',
    accentSoft: '#fde9de',
    heroGlow: 'rgba(214, 107, 45, 0.24)',
    landingTitle: '先通过通行证进入钟楼战局',
    landingDescription: '游戏客户端统一使用 Passport 承接登录与注册，登录成功后自动回到当前对局入口。',
    authTitle: '欢迎进入 Slay the Spire Passport',
    authDescription: '完成登录后继续进入游戏客户端与战斗流程。',
    heroTitle: '一个通行证承接 Roguelike、进度与未来跨端体验',
    heroDescription: '先把游戏身份入口统一，再逐步承接多端同步、活动与第三方登录能力。',
    oauthProviders,
  },
  default: DEFAULT_PASSPORT_BRAND,
}

export function normalizePassportAppId(candidate: string | null | undefined, fallback = 'default'): string {
  const normalized = String(candidate || '').trim().toLowerCase()
  if (normalized && passportBrands[normalized]) {
    return normalized
  }

  return passportBrands[fallback] ? fallback : 'default'
}

export function resolvePassportBrand(candidate: string | null | undefined, fallback = 'default'): PassportBrand {
  const normalized = normalizePassportAppId(candidate, fallback)
  return passportBrands[normalized] ?? DEFAULT_PASSPORT_BRAND
}
