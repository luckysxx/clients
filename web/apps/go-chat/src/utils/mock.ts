export type Conversation = {
  id: string
  name: string
  time: string
  preview: string
  avatar: string
  active?: boolean
}

export type Message = {
  author: string
  level: string
  text: string
  avatar: string
  self?: boolean
}

export type Member = {
  name: string
  role: string
  avatar: string
}

export const makeAvatar = (label: string, startColor: string, endColor: string, textColor = '#ffffff') =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="24" fill="url(#g)" />
      <circle cx="40" cy="32" r="15" fill="rgba(255,255,255,0.18)" />
      <path d="M16 66c4-10 14-16 24-16s20 6 24 16" fill="rgba(255,255,255,0.18)" />
      <text x="40" y="46" text-anchor="middle" font-family="Avenir Next, PingFang SC, sans-serif" font-size="24" font-weight="700" fill="${textColor}">
        ${label.slice(0, 1)}
      </text>
    </svg>
  `)}`

export const mockConversations: Conversation[] = [
  {
    id: '1',
    name: '渣男研讨小组',
    time: '17:10',
    preview: '刘凌志：说买就买',
    avatar: makeAvatar('研', '#607dff', '#6ee7ff'),
  },
  {
    id: '2',
    name: '绯鞠同好会',
    time: '16:57',
    preview: '[@全体成员] 水上田岐今天也要出战',
    avatar: makeAvatar('绯', '#ff9966', '#ff5e62'),
  },
  {
    id: '3',
    name: '9个人机',
    time: '16:51',
    preview: '琳奈莫宁爱弥斯西格莉：今晚继续上分',
    avatar: makeAvatar('9', '#a855f7', '#3b82f6'),
  },
  {
    id: '4',
    name: '2024级十北楼栋群',
    time: '16:03',
    preview: '401李纪伟：老师今天查寝',
    avatar: makeAvatar('楼', '#0ea5e9', '#22c55e'),
  },
  {
    id: '5',
    name: '塔',
    time: '04:33',
    preview: 'luckys：[图片]',
    avatar: makeAvatar('塔', '#f59e0b', '#ef4444'),
  },
  {
    id: '6',
    name: '单身狗小分队',
    time: '昨天18:41',
    preview: '耿伟哲：啊？',
    avatar: makeAvatar('狗', '#64748b', '#94a3b8'),
  },
]

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      author: '东三省巡视使督军大帅奉系军阀老子先行',
      level: 'LV69 蜻蜓点水',
      text: '严肃入手',
      avatar: makeAvatar('东', '#2dd4bf', '#3b82f6'),
    },
    {
      author: '刘凌志',
      level: 'LV100 uzi',
      text: '这就是大师 250 的实力吗',
      avatar: makeAvatar('刘', '#38bdf8', '#60a5fa'),
    },
    {
      author: '刘凌志',
      level: 'LV100 uzi',
      text: '说买就买',
      avatar: makeAvatar('刘', '#38bdf8', '#60a5fa'),
    },
    {
      author: 'luckys',
      level: '群主',
      text: '先把前端搭起来，等接口就位之后再接消息流。',
      avatar: makeAvatar('L', '#fb7185', '#8b5cf6'),
      self: true,
    },
  ],
  '2': [
    {
      author: '水上田岐',
      level: 'LV1',
      text: '今天出战',
      avatar: makeAvatar('水', '#0ea5e9', '#22c55e'),
    }
  ]
}

export const mockMembers: Record<string, Member[]> = {
  '1': [
    { name: '熊凌风', role: '群主', avatar: makeAvatar('熊', '#10b981', '#14b8a6') },
    { name: '东三省巡视使', role: '管理员', avatar: makeAvatar('东', '#2dd4bf', '#3b82f6') },
    { name: '垃圾小姐姐', role: '管理员', avatar: makeAvatar('垃', '#fb7185', '#f97316') },
    { name: '刘凌志', role: '管理员', avatar: makeAvatar('刘', '#38bdf8', '#60a5fa') },
    { name: 'luckys', role: '管理员', avatar: makeAvatar('L', '#fb7185', '#8b5cf6') },
    { name: '毛某', role: '管理员', avatar: makeAvatar('毛', '#f59e0b', '#f97316') },
    { name: '张夏阳冬阴', role: '管理员', avatar: makeAvatar('张', '#8b5cf6', '#6366f1') },
    { name: '胡盛熙', role: '管理员', avatar: makeAvatar('胡', '#0ea5e9', '#2563eb') },
  ],
  '2': [
    { name: '水上田岐', role: '群主', avatar: makeAvatar('水', '#0ea5e9', '#22c55e') }
  ]
}
