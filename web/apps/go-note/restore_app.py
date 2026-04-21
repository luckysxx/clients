import re

content_with_lines = r"""1: <template>
2:   <div class="min-h-screen">
3:     <div v-if="showWorkspaceShell" class="flex min-h-screen bg-transparent">
4:       <aside
5:         class="app-scrollbar fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col overflow-y-auto overflow-x-hidden whitespace-nowrap border-r border-black/[0.08] bg-[rgba(15,15,17,0.9)] px-3 py-4 text-neutral-200 backdrop-blur-2xl transition-all duration-200 ease-in-out"
6:         :class="sidebarCollapsed ? 'w-[64px]' : 'w-[280px]'"
7:       >
8:         <div class="mb-5 flex items-center" :class="sidebarCollapsed ? 'justify-center' : 'gap-2'">
9:           <button type="button" class="ui-icon-button border-white/[0.1] bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1] hover:text-white" @click="sidebarCollapsed = !sidebarCollapsed">
10:             <PanelLeftClose v-if="!sidebarCollapsed" class="h-4 w-4" />
11:             <PanelLeftOpen v-else class="h-4 w-4" />
12:           </button>
13: 
14:           <button
15:             v-show="!sidebarCollapsed"
16:             type="button"
17:             class="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors duration-150 hover:bg-white/[0.06]"
18:             @click="handleBrandClick"
19:           >
20:             <div class="flex shrink-0 h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b8cf8,#53b3ff)] text-black">
21:               <NotebookPen class="h-5 w-5" />
22:             </div>
23:             <div class="min-w-0">
24:               <p class="truncate text-sm font-semibold tracking-[0.02em] text-white">GoNote</p>
25:               <p class="truncate text-xs text-neutral-500">Docs for builders</p>
26:             </div>
27:           </button>
28:         </div>
29: 
30:         <div v-if="!sidebarCollapsed" class="mb-4">
31:           <div class="relative">
32:             <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
33:             <input
34:               v-model="workspaceKeyword"
35:               type="search"
36:               class="h-10 w-full rounded-2xl border border-white/[0.1] bg-white/[0.06] pl-9 pr-3 text-sm text-white outline-none transition-all duration-150 placeholder:text-neutral-500 focus:border-white/[0.2]"
37:               placeholder="筛选当前文档"
38:               @keydown.enter.prevent="handleWorkspaceSearch"
39:             />
40:           </div>
41:         </div>
42: 
43:         <nav class="mb-5 space-y-1">
44:           <button
45:             v-for="item in primaryNav"
46:             :key="item.label"
47:             type="button"
48:             class="flex items-center rounded-xl text-[13px] font-medium transition-all duration-150"
49:             :class="[
50:               isRouteActive(item.path) ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white',
51:               sidebarCollapsed ? 'justify-center w-10 h-10 px-0' : 'justify-start w-full gap-3 px-3 py-2.5'
52:             ]"
53:             @click="router.push(item.path)"
54:           >
55:             <component :is="item.icon" class="h-4 w-4 shrink-0" />
56:             <span v-if="!sidebarCollapsed" class="truncate">{{ item.label }}</span>
57:           </button>
58:         </nav>
59: 
60:         <section v-if="!sidebarCollapsed" class="mb-5 space-y-2">
61:           <div class="flex items-center justify-between px-2">
62:             <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Workspace</p>
63:             <button type="button" class="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-white" @click="handleAllDocs">
64:               <Library class="h-4 w-4" />
65:             </button>
66:           </div>
67: 
68:           <button
69:             type="button"
70:             class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-150"
71:             :class="route.path === '/workspace' && !workspaceStore.activeGroupId ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'"
72:             @click="handleAllDocs"
73:           >
74:             <span class="inline-flex items-center gap-2">
75:               <PanelTop class="h-4 w-4" />
76:               全部文档
77:             </span>
78:             <span class="rounded-full border border-white/[0.1] px-2 py-0.5 text-[11px] text-neutral-500">{{ workspaceStore.groups.length }}</span>
79:           </button>
80:         </section>
81: 
82:         <section v-if="!sidebarCollapsed" class="mb-5 space-y-2">
83:           <div class="flex items-center justify-between px-2">
84:             <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Groups</p>
85:             <DialogRoot v-model:open="groupDialogOpen">
86:               <DialogTrigger as-child>
87:                 <button type="button" class="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-white">
88:                   <Plus class="h-4 w-4" />
89:                 </button>
90:               </DialogTrigger>
91:               <DialogPortal>
92:                 <DialogOverlay class="dialog-overlay" />
93:                 <DialogContent class="dialog-content">
94:                   <DialogTitle class="text-lg font-semibold text-neutral-950">新建分组</DialogTitle>
95:                   <DialogDescription class="mt-1 text-sm text-neutral-500">
96:                     侧栏会立即刷新，新的分组可直接用于过滤文档。
97:                   </DialogDescription>
98:                   <div class="mt-5 space-y-4">
99:                     <div>
100:                       <label class="ui-label">分组名称</label>
101:                       <input v-model="newGroupName" class="ui-input" placeholder="例如：后端笔记" @keydown.enter.prevent="submitCreateGroup" />
102:                     </div>
103:                     <div class="flex justify-end gap-2">
104:                       <DialogClose as-child>
105:                         <button type="button" class="ui-button">取消</button>
106:                       </DialogClose>
107:                       <button type="button" class="ui-button ui-button-primary" @click="submitCreateGroup">创建分组</button>
108:                     </div>
109:                   </div>
110:                 </DialogContent>
111:               </DialogPortal>
112:             </DialogRoot>
113:           </div>
114: 
115:           <WorkspaceGroupTree :groups="groupTree" :active-id="workspaceStore.activeGroupId" @select="handleGroupClick" />
116:         </section>
117: 
118:         <section v-if="!sidebarCollapsed" class="mt-auto space-y-3">
119:           <div class="flex items-center justify-between px-2">
120:             <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Tags</p>
121:             <DialogRoot v-model:open="tagDialogOpen">
122:               <DialogTrigger as-child>
123:                 <button type="button" class="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-white">
124:                   <Plus class="h-4 w-4" />
125:                 </button>
126:               </DialogTrigger>
127:               <DialogPortal>
128:                 <DialogOverlay class="dialog-overlay" />
129:                 <DialogContent class="dialog-content">
130:                   <DialogTitle class="text-lg font-semibold text-neutral-950">新建标签</DialogTitle>
131:                   <DialogDescription class="mt-1 text-sm text-neutral-500">
132:                     用低饱和颜色给知识点做索引，方便主视图即时筛选。
133:                   </DialogDescription>
134:                   <div class="mt-5 space-y-4">
135:                     <div>
136:                       <label class="ui-label">标签名称</label>
137:                       <input v-model="newTagName" class="ui-input" placeholder="例如：Go / 性能 / 架构" />
138:                     </div>
139:                     <div>
140:                       <label class="ui-label">标签颜色</label>
141:                       <div class="flex flex-wrap gap-2">
142:                         <button
143:                           v-for="color in tagPalette"
144:                           :key="color"
145:                           type="button"
146:                           class="h-8 w-8 rounded-full border transition-all duration-150"
147:                           :class="newTagColor === color ? 'scale-110 border-neutral-950' : 'border-black/[0.1]'"
148:                           :style="{ backgroundColor: color }"
149:                           @click="newTagColor = color"
150:                         />
151:                       </div>
152:                     </div>
153:                     <div class="flex justify-end gap-2">
154:                       <DialogClose as-child>
155:                         <button type="button" class="ui-button">取消</button>
156:                       </DialogClose>
157:                       <button type="button" class="ui-button ui-button-primary" @click="submitCreateTag">创建标签</button>
158:                     </div>
159:                   </div>
160:                 </DialogContent>
161:               </DialogPortal>
162:             </DialogRoot>
163:           </div>
164: 
165:           <div class="flex flex-wrap gap-2">
166:             <button
167:               v-for="tag in workspaceStore.tags"
168:               :key="tag.id"
169:               type="button"
170:               class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150"
171:               :class="workspaceStore.activeTagId === tag.id ? 'border-white/[0.15] bg-white/[0.1] text-white' : 'border-white/[0.08] bg-white/[0.05] text-neutral-300 hover:bg-white/[0.08] hover:text-white'"
172:               @click="handleTagClick(tag.id)"
173:             >
174:               <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: tag.color || '#818cf8' }"></span>
175:               {{ tag.name }}
176:             </button>
177:           </div>
178:         </section>
179:       </aside>
180: 
181:       <section class="flex min-h-screen flex-1 flex-col transition-all duration-200 ease-in-out" :class="sidebarCollapsed ? 'pl-[64px]' : 'pl-[280px]'">
182:         <header class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-black/[0.06] bg-white px-6">
183:           <div class="mx-auto flex w-full max-w-[1024px] items-center justify-between gap-4">
184:             <div class="flex items-center gap-3">
185:               <div class="flex items-center gap-2 text-[13px] font-medium text-neutral-500">
186:                 <span v-for="crumb in breadcrumbs" :key="crumb" class="inline-flex items-center gap-2">
187:                   <span>{{ crumb }}</span>
188:                   <ChevronRight v-if="crumb !== breadcrumbs[breadcrumbs.length - 1]" class="h-3 w-3" />
189:                 </span>
190:               </div>
191:               <h1 v-if="pageTitle !== '知识工作台'" class="text-[13px] font-semibold text-neutral-900">{{ pageTitle }}</h1>
192:             </div>
193: 
194:             <div class="flex items-center gap-2">
195:               <button type="button" class="ui-button ui-button-primary" @click="router.push('/snippets/new')">
196:                 <Plus class="h-4 w-4" />
197:                 新建
198:               </button>
199:               <el-dropdown v-if="isAuthenticated" trigger="click" popper-class="!rounded-[16px]">
200:                 <button
201:                   type="button"
202:                   class="inline-flex h-11 items-center gap-3 rounded-2xl border border-black/[0.08] bg-white/[0.8] px-3 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-white outline-none"
203:                 >
204:                   <span class="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
205:                     {{ userInitial }}
206:                   </span>
207:                   <span class="hidden text-sm font-medium text-neutral-900 md:block">{{ authStore.user?.username }}</span>
208:                 </button>
209:                 <template #dropdown>
210:                   <el-dropdown-menu class="min-w-[160px] !rounded-xl !p-1 !border-black/[0.08] !shadow-lg">
211:                     <el-dropdown-item @click="router.push('/about')">
212:                       <div class="flex items-center gap-2 text-[13px] py-1 text-neutral-600">
213:                         <Sparkles class="h-4 w-4" />
214:                         关于 GoNote
215:                       </div>
216:                     </el-dropdown-item>
217:                     <el-dropdown-item @click="router.push('/settings')">
218:                       <div class="flex items-center gap-2 text-[13px] py-1 text-neutral-600">
219:                         <Settings2 class="h-4 w-4" />
220:                         账户设置
221:                       </div>
222:                     </el-dropdown-item>
223:                     <el-dropdown-item @click="openPassportFromShell('login')">
224:                       <div class="flex items-center gap-2 text-[13px] py-1 text-neutral-600">
225:                         <Users class="h-4 w-4" />
226:                         切换账号
227:                       </div>
228:                     </el-dropdown-item>
229:                     <el-dropdown-item divided @click="handleLogout">
230:                       <div class="flex items-center gap-2 text-[13px] py-1 text-red-600 font-medium">
231:                         <LogOut class="h-4 w-4" />
232:                         退出登录
233:                       </div>
234:                     </el-dropdown-item>
235:                   </el-dropdown-menu>
236:                 </template>
237:               </el-dropdown>
238:               <button v-else type="button" class="ui-button ui-button-primary" @click="openPassportFromShell('register')">
239:                 登录 / 注册
240:               </button>
241:             </div>
242:           </div>
243:         </header>
244: 
245:         <main class="flex-1 w-full bg-white">
246:           <div class="mx-auto w-full max-w-[1024px] px-6 py-10">
247:             <router-view v-slot="{ Component }">
248:               <transition name="fade" mode="out-in">
249:                 <component :is="Component" />
250:               </transition>
251:             </router-view>
252:           </div>
253:         </main>
254:       </section>
255:     </div>
256: 
257:     <main v-else>
258:       <router-view v-slot="{ Component }">
259:         <transition name="fade" mode="out-in">
260:           <component :is="Component" />
261:         </transition>
262:       </router-view>
263:     </main>
264:   </div>
265: </template>
266: 
267: <script setup lang="ts">
268: import { computed, onMounted, ref, watch } from 'vue'
269: import { useRoute, useRouter } from 'vue-router'
270: import { buildAuthAppLoginPath } from '@clients/shared'
271: import {
272:   ChevronRight,
273:   Library,
274:   LogOut,
275:   NotebookPen,
276:   PanelLeftClose,
277:   PanelLeftOpen,
278:   PanelTop,
279:   Plus,
280:   Search,
281:   Settings2,
282:   Sparkles,
283:   Users,
284: } from 'lucide-vue-next'
285: import {
286:   DialogClose,
287:   DialogContent,
288:   DialogDescription,
289:   DialogOverlay,
290:   DialogPortal,
291:   DialogRoot,
292:   DialogTitle,
293:   DialogTrigger,
294: } from 'radix-vue'
295: import { logout } from '@/api/user'
296: import { useAuthStore } from '@/stores/auth'
297: import { useWorkspaceStore } from '@/stores/workspace'
298: import WorkspaceGroupTree from '@/components/WorkspaceGroupTree.vue'
299: 
300: interface WorkspaceGroupInput {
301:   id: number
302:   parent_id?: number | null
303:   name: string
304:   snippet_count: number
305:   children?: WorkspaceGroupInput[]
306: }
307: 
308: interface WorkspaceGroupNode {
309:   id: number
310:   parent_id?: number | null
311:   name: string
312:   snippet_count: number
313:   children: WorkspaceGroupNode[]
314: }
315: 
316: const router = useRouter()
317: const route = useRoute()
318: const authStore = useAuthStore()
319: const workspaceStore = useWorkspaceStore()
320: 
321: const sidebarCollapsed = ref(false)
322: const workspaceKeyword = ref('')
323: const groupDialogOpen = ref(false)
324: const tagDialogOpen = ref(false)
325: const newGroupName = ref('')
326: const newTagName = ref('')
327: const newTagColor = ref('#818cf8')
328: 
329: const tagPalette = ['#818cf8', '#60a5fa', '#34d399', '#f59e0b', '#fb7185', '#94a3b8'] as const
330: 
331: const primaryNav = [
332:   { label: '全部文档', path: '/workspace', icon: PanelTop },
333: ]
334: 
335: const isAuthenticated = computed(() => authStore.isAuthenticated)
336: const showWorkspaceShell = computed(() => !['landing'].includes(String(route.name ?? '')))
337: const userInitial = computed(() => authStore.user?.username?.slice(0, 1).toUpperCase() || 'G')
338: 
339: const pageTitle = computed(() => {
340:   switch (route.name) {
341:     case 'snippet-new':
342:       return '新建文档'
343:     case 'snippet-edit':
344:       return '编辑文档'
345:     case 'snippet-detail':
346:       return '文档详情'
347:     case 'about':
348:       return '关于 GoNote'
349:     case 'settings':
350:       return '账户设置'
351:     default:
352:       return '知识工作台'
353:   }
354: })
355: 
356: const pageSubtitle = computed(() => {
357:   switch (route.name) {
358:     case 'snippet-new':
359:       return '用无边框的编辑体验快速沉淀你的下一篇知识文档。'
360:     case 'snippet-edit':
361:       return '延续当前思路，把内容整理成可复用的团队资产。'
362:     case 'snippet-detail':
363:       return '浏览正文、元信息与最近更新时间。'
364:     case 'about':
365:       return '了解产品定位、技术栈与这次改造的设计方向。'
366:     case 'settings':
367:       return '管理邮箱、密码与账户安全策略。'
368:     default:
369:       return '按分组和标签过滤文档，把侧边栏留给结构，把中间留给阅读。'
370:   }
371: })
372: 
373: const groupTree = computed<WorkspaceGroupNode[]>(() => buildGroupTree(workspaceStore.groups as WorkspaceGroupInput[]))
374: 
375: const breadcrumbs = computed(() => {
376:   const base = ['GoNote']
377: 
378:   if (route.name === 'workspace') {
379:     if (workspaceStore.activeGroup?.name) {
380:       return [...base, workspaceStore.activeGroup.name, '文档列表']
381:     }
382: 
383:     const activeTag = workspaceStore.tags.find((item) => item.id === workspaceStore.activeTagId)
384:     if (activeTag?.name) {
385:       return [...base, `标签 ${activeTag.name}`, '文档列表']
386:     }
387: 
388:     return [...base, '全部文档']
389:   }
390: 
391:   if (route.name === 'snippet-new') {
392:     return [...base, '创建文档']
393:   }
394: 
395:   if (route.name === 'snippet-edit') {
396:     return [...base, '编辑文档']
397:   }
398: 
399:   if (route.name === 'snippet-detail') {
400:     return [...base, '阅读文档']
401:   }
402: 
403:   if (route.name === 'settings') {
404:     return [...base, '账户设置']
405:   }
406: 
407:   if (route.name === 'about') {
408:     return [...base, '产品说明']
409:   }
410: 
411:   return base
412: })
413: 
414: const syncWorkspaceKeyword = () => {
415:   workspaceKeyword.value = typeof route.query.q === 'string' ? route.query.q : ''
416: }
417: 
418: const syncWorkspaceFilters = () => {
419:   const groupId = route.query.group_id ? Number(route.query.group_id) : null
420:   const tagId = route.query.tag ? Number(route.query.tag) : null
421: 
422:   workspaceStore.selectGroup(Number.isFinite(groupId) ? groupId : null)
423:   workspaceStore.activeTagId = Number.isFinite(tagId) ? tagId : null
424: }
425: 
426: const buildGroupTree = (groups: WorkspaceGroupInput[]) => {
427:   if (!groups.length) return []
428: 
429:   const normalizeNode = (group: WorkspaceGroupInput): WorkspaceGroupNode => ({
430:     id: group.id,
431:     parent_id: group.parent_id,
432:     name: group.name,
433:     snippet_count: group.snippet_count,
434:     children: (group.children ?? []).map(normalizeNode),
435:   })
436: 
437:   if (groups.some((group) => Array.isArray(group.children))) {
438:     return groups.filter((group) => !group.parent_id)
439:       .map(normalizeNode)
440:   }
441: 
442:   const map = new Map<number, WorkspaceGroupNode & { children: WorkspaceGroupNode[] }>()
443:   const roots: Array<WorkspaceGroupNode & { children: WorkspaceGroupNode[] }> = []
444: 
445:   for (const group of groups) {
446:     map.set(group.id, {
447:       ...group,
448:       children: [],
449:     })
450:   }
451: 
452:   for (const group of map.values()) {
453:     if (group.parent_id && map.has(group.parent_id)) {
454:       map.get(group.parent_id)?.children.push(group)
455:     } else {
456:       roots.push(group)
457:     }
458:   }
459: 
460:   return roots
461: }
462: 
463: const handleWorkspaceSearch = () => {
464:   const q = workspaceKeyword.value.trim()
465:   router.replace({
466:     path: '/workspace',
467:     query: {
468:       ...route.query,
469:       q: q || undefined,
470:     },
471:   })
472: }
473: 
474: const handleAllDocs = () => {
475:   workspaceStore.selectGroup(null)
476:   workspaceStore.selectTag(null)
477:   router.push({ path: '/workspace', query: { q: typeof route.query.q === 'string' ? route.query.q : undefined } })
478: }
479: 
480: const handleGroupClick = (id: number) => {
481:   workspaceStore.selectGroup(id)
482:   workspaceStore.selectTag(null)
483:   router.push({
484:     path: '/workspace',
485:     query: {
486:       q: typeof route.query.q === 'string' ? route.query.q : undefined,
487:       group_id: String(id),
488:       tag: undefined,
489:     },
490:   })
491: }
492: 
493: const handleTagClick = (id: number) => {
494:   const nextId = workspaceStore.activeTagId === id ? null : id
495:   workspaceStore.selectTag(id)
496:   workspaceStore.selectGroup(null)
497:   router.push({
498:     path: '/workspace',
499:     query: {
500:       q: typeof route.query.q === 'string' ? route.query.q : undefined,
501:       group_id: undefined,
502:       tag: nextId ? String(nextId) : undefined,
503:     },
504:   })
505: }
506: 
507: const isRouteActive = (path: string) => {
508:   if (path === '/workspace') {
509:     return route.path === '/workspace'
510:   }
511:   return route.path.startsWith(path)
512: }
513: 
514: const handleBrandClick = () => {
515:   router.push(isAuthenticated.value ? '/workspace' : '/')
516: }
517: 
518: const openPassportFromShell = (intent: 'login' | 'register' = 'login') => {
519:   authStore.clearSsoSuppression()
520:   window.location.replace(buildAuthAppLoginPath({
521:     appCode: 'go-note',
522:     intent,
523:     redirectPath: route.fullPath,
524:   }))
525: }
526: 
527: const submitCreateGroup = async () => {
528:   const name = newGroupName.value.trim()
529:   if (!name) {
530:     ElMessage.warning('请输入分组名称')
531:     return
532:   }
533: 
534:   await workspaceStore.addGroup({ name })
535:   newGroupName.value = ''
536:   groupDialogOpen.value = false
537:   ElMessage.success('分组已创建')
538: }
539: 
540: const submitCreateTag = async () => {
541:   const name = newTagName.value.trim()
542:   if (!name) {
543:     ElMessage.warning('请输入标签名称')
544:     return
545:   }
546: 
547:   await workspaceStore.addTag({ name, color: newTagColor.value })
548:   newTagName.value = ''
549:   newTagColor.value = tagPalette[0]
550:   tagDialogOpen.value = false
551:   ElMessage.success('标签已创建')
552: }
553: 
554: const handleLogout = async () => {
555:   const accessToken = authStore.token
556:   authStore.suppressSsoAutoLogin()
557: 
558:   try {
559:     if (accessToken) {
560:       await logout(accessToken)
561:     }
562:   } catch (error) {
563:     ElMessage.warning(error instanceof Error ? error.message : '退出接口调用失败，已清理本地登录态')
564:   } finally {
565:     authStore.logout()
566:     ElMessage.success('已退出登录')
567:     router.push('/')
568:   }
569: }
570: 
571: watch(
572:   () => route.fullPath,
573:   () => {
574:     syncWorkspaceKeyword()
575:     syncWorkspaceFilters()
576:   },
577:   { immediate: true },
578: )
579: 
580: onMounted(async () => {
581:   authStore.initFromStorage()
582:   await Promise.all([workspaceStore.fetchGroups(), workspaceStore.fetchTags()])
583:   syncWorkspaceFilters()
584: })
585: </script>
586: 
587: <style scoped>
588: .fade-enter-active,
589: .fade-leave-active {
590:   transition: opacity 0.18s ease, transform 0.18s ease;
591: }
592: 
593: .fade-enter-from,
594: .fade-leave-to {
595:   opacity: 0;
596:   transform: translateY(8px);
597: }
598: </style>
599: 
"""

clean_content = re.sub(r'^\d+:\s', '', content_with_lines, flags=re.MULTILINE)

with open('src/App.vue', 'w') as f:
    f.write(clean_content)

print("Restored.")
