import request from '@/utils/request'

export interface Snippet {
  id: string | number
  title: string
  content: string
  language: string
  created_at: string
  updated_at: string
  owner_id?: string | number
  group_id?: string | number
  tag_ids?: (string | number)[]
  is_favorite?: boolean
  deleted_at?: string | null
  sort_order?: number
}

type RawSnippet = Partial<{
  id: string | number
  ID: string | number
  title: string
  Title: string
  short_link: string
  ShortLink: string
  shortLink: string
  content: string
  Content: string
  language: string
  Language: string
  created_at: string
  CreatedAt: string
  createdAt: string
  updated_at: string
  UpdatedAt: string
  updatedAt: string
  owner_id: string | number
  OwnerID: string | number
  ownerId: string | number
  group_id: string | number
  GroupId: string | number
  groupId: string | number
  tag_ids: (string | number)[]
  TagIDs: (string | number)[]
  tagIds: (string | number)[]
  is_favorite: boolean
  IsFavorite: boolean
  isFavorite: boolean
  deleted_at: string | null
  DeletedAt: string | null
  deletedAt: string | null
  sort_order: number
  SortOrder: number
  sortOrder: number
}>

type RawSnippetListPayload = RawSnippet[] | { snippets?: RawSnippet[] }

type RawGroup = Partial<{
  id: number
  ID: number
  owner_id: number
  OwnerID: number
  ownerId: number
  parent_id: number | null
  ParentID: number | null
  parentId: number | null
  name: string
  Name: string
  description: string
  Description: string
  sort_order: number
  SortOrder: number
  sortOrder: number
  children_count: number
  ChildrenCount: number
  childrenCount: number
  snippet_count: number
  SnippetCount: number
  snippetCount: number
  created_at: string
  CreatedAt: string
  createdAt: string
  updated_at: string
  UpdatedAt: string
  updatedAt: string
}>

type RawGroupListPayload = RawGroup[] | { groups?: RawGroup[] }

type RawTag = Partial<{
  id: number
  ID: number
  owner_id: number
  OwnerID: number
  ownerId: number
  name: string
  Name: string
  color: string
  Color: string
  created_at: string
  CreatedAt: string
  createdAt: string
}>

type RawTagListPayload = RawTag[] | { tags?: RawTag[] }

export interface SnippetListQuery {
  q?: string
  keyword?: string
  language?: string
  tag_id?: string | number
  group_id?: string | number
  page?: number
  page_size?: number
  sort_by?: 'updated_at' | 'created_at' | 'title'
  order?: 'asc' | 'desc'
  cursor?: string
  limit?: number
  status?: string
}

export interface SnippetListResponse {
  snippets: Snippet[]
  next_cursor: string
  has_more: boolean
}

export interface SaveSnippetRequest {
  title: string
  content: string
  language: string
  group_id?: number | string
  tag_ids?: (number | string)[]
}

export interface SetTagsRequest {
  tag_ids: (number | string)[]
}

export interface MoveSnippetRequest {
  group_id?: number | string
  sort_order?: number
}

export interface SnippetFavoriteState {
  snippet_id: string | number
  favorite: boolean
}

export interface DeleteSnippetResponse {
  id: string | number
}

export interface SnippetGroup {
  id: string | number
  owner_id: string | number
  parent_id?: string | number | null
  name: string
  description: string
  sort_order: number
  children_count: number
  snippet_count: number
  created_at: string
  updated_at: string
}

export interface SaveSnippetGroupRequest {
  name: string
  parent_id?: number | null
  description?: string
  sort_order?: number
}

export interface DeleteSnippetGroupResponse {
  id: string | number
}

export interface SnippetTag {
  id: string | number
  owner_id: string | number
  name: string
  color: string
  created_at: string
}

export interface SaveSnippetTagRequest {
  name: string
  color?: string
}

export interface DeleteSnippetTagResponse {
  id: string | number
}

export interface SnippetTemplate {
  id: string | number
  name: string
  description?: string
  language: string
  content: string
  category?: string
  is_system?: boolean
  owner_id?: string | number
  created_at?: string
  updated_at?: string
}

export interface SnippetTemplateQuery {
  q?: string
  language?: string
  category?: string
}

export interface CreateSnippetFromTemplateRequest {
  template_id: string | number
  title?: string
}

export interface CreateSnippetFromShareRequest {
  token: string
  password?: string
  title?: string
}

export interface SnippetUploadDraft {
  filename: string
  title?: string
  content: string
  language?: string
  url?: string
}

export interface UploadImageResult {
  url: string
  filename: string
  size: number
  mime_type: string
  thumbnail_url?: string
}

type RequestQueryValue = string | number | boolean | undefined | null

const toQueryParams = <T extends object>(query?: T) => {
  if (!query) {
    return undefined
  }

  const params: Record<string, string | number | boolean> = {}

  for (const [key, value] of Object.entries(query as Record<string, RequestQueryValue>)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    params[key] = value
  }

  return Object.keys(params).length > 0 ? params : undefined
}

const normalizeSnippetList = (list: RawSnippet[]) => list.map(normalizeSnippet)

const normalizeSnippetListPayload = (payload: RawSnippetListPayload) => {
  const list = Array.isArray(payload) ? payload : (payload.snippets ?? [])
  return normalizeSnippetList(list)
}

const encodeID = (id: string | number) => encodeURIComponent(String(id))

const normalizeSnippet = (raw: RawSnippet): Snippet => {
  const id = raw.id ?? raw.ID
  const title = raw.title ?? raw.Title ?? raw.short_link ?? raw.ShortLink ?? raw.shortLink
  const content = raw.content ?? raw.Content
  const language = raw.language ?? raw.Language
  const createdAt = raw.created_at ?? raw.CreatedAt ?? raw.createdAt
  const updatedAt = raw.updated_at ?? raw.UpdatedAt ?? raw.updatedAt ?? createdAt

  if (id === undefined || !title || !content || !language || !createdAt || !updatedAt) {
    throw new Error('Snippet 响应字段缺失')
  }

  return {
    id,
    title,
    content,
    language,
    created_at: createdAt,
    updated_at: updatedAt,
    owner_id: raw.owner_id ?? raw.OwnerID ?? raw.ownerId,
    group_id: raw.group_id ?? raw.GroupId ?? raw.groupId ?? 0,
    tag_ids: raw.tag_ids ?? raw.TagIDs ?? raw.tagIds ?? [],
    is_favorite: raw.is_favorite ?? raw.IsFavorite ?? raw.isFavorite ?? false,
    deleted_at: raw.deleted_at ?? raw.DeletedAt ?? raw.deletedAt ?? null,
    sort_order: raw.sort_order ?? raw.SortOrder ?? raw.sortOrder ?? 0,
  }
}

const normalizeGroup = (raw: RawGroup): SnippetGroup => {
  const id = raw.id ?? raw.ID
  const name = raw.name ?? raw.Name

  if (id === undefined || !name) {
    throw new Error('Group 响应字段缺失')
  }

  return {
    id,
    owner_id: raw.owner_id ?? raw.OwnerID ?? raw.ownerId ?? 0,
    parent_id: raw.parent_id ?? raw.ParentID ?? raw.parentId ?? null,
    name,
    description: raw.description ?? raw.Description ?? '',
    sort_order: raw.sort_order ?? raw.SortOrder ?? raw.sortOrder ?? 0,
    children_count: raw.children_count ?? raw.ChildrenCount ?? raw.childrenCount ?? 0,
    snippet_count: raw.snippet_count ?? raw.SnippetCount ?? raw.snippetCount ?? 0,
    created_at: raw.created_at ?? raw.CreatedAt ?? raw.createdAt ?? '',
    updated_at: raw.updated_at ?? raw.UpdatedAt ?? raw.updatedAt ?? '',
  }
}

const normalizeGroupListPayload = (payload: RawGroupListPayload) => {
  const list = Array.isArray(payload) ? payload : (payload.groups ?? [])
  return list.map(normalizeGroup)
}

const normalizeTag = (raw: RawTag): SnippetTag => {
  const id = raw.id ?? raw.ID
  const name = raw.name ?? raw.Name

  if (id === undefined || !name) {
    throw new Error('Tag 响应字段缺失')
  }

  return {
    id,
    owner_id: raw.owner_id ?? raw.OwnerID ?? 0,
    name,
    color: raw.color ?? raw.Color ?? '#6366f1',
    created_at: raw.created_at ?? raw.CreatedAt ?? '',
  }
}

const normalizeTagListPayload = (payload: RawTagListPayload) => {
  const list = Array.isArray(payload) ? payload : (payload.tags ?? [])
  return list.map(normalizeTag)
}

// 获取我的代码片段（分页版）
// 对应网关: GET /api/v1/notes/me/snippets
export const listMySnippets = (query?: SnippetListQuery): Promise<SnippetListResponse> => {
  return request
    .get<unknown, RawSnippetListPayload>('/api/v1/notes/me/snippets', {
      params: toQueryParams(query),
    })
    .then((payload) => {
      const list = Array.isArray(payload) ? payload : (payload.snippets ?? [])
      const nextCursor = !Array.isArray(payload) ? ((payload as any).next_cursor ?? '') : ''
      const hasMore = !Array.isArray(payload) ? ((payload as any).has_more ?? false) : false
      return {
        snippets: normalizeSnippetList(list),
        next_cursor: nextCursor,
        has_more: hasMore,
      }
    })
}

// 获取最近访问片段
// 预留网关: GET /api/v1/notes/me/snippets/recent
export const listRecentSnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippetListPayload>('/api/v1/notes/me/snippets/recent', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetListPayload)
}

// 获取与我共享的片段
// 预留网关: GET /api/v1/notes/me/snippets/shared
export const listSharedSnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippetListPayload>('/api/v1/notes/me/snippets/shared', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetListPayload)
}

// 获取收藏片段
// 预留网关: GET /api/v1/notes/me/snippets/favorites
export const listFavoriteSnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippetListPayload>('/api/v1/notes/me/snippets/favorites', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetListPayload)
}

// 搜索代码片段
// 预留网关: GET /api/v1/notes/snippets/search
export const searchSnippets = (query: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippetListPayload>('/api/v1/notes/snippets/search', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetListPayload)
}

// 获取代码片段详情
// 对应网关: GET /api/v1/notes/snippets/:id
export const getSnippet = (id: string | number) => {
  return request.get<unknown, RawSnippet>(`/api/v1/notes/snippets/${encodeID(id)}`).then(normalizeSnippet)
}


// 创建代码片段
// 对应网关: POST /api/v1/notes/snippets
export const createSnippet = (data: SaveSnippetRequest) => {
  return request.post<unknown, RawSnippet>('/api/v1/notes/snippets', data).then(normalizeSnippet)
}

// 从模板创建代码片段
// 预留网关: POST /api/v1/notes/snippets/from-template
export const createSnippetFromTemplate = (data: CreateSnippetFromTemplateRequest) => {
  return request.post<unknown, RawSnippet>('/api/v1/notes/snippets/from-template', data).then(normalizeSnippet)
}

export const createSnippetFromShare = (data: CreateSnippetFromShareRequest) => {
  return request.post<unknown, RawSnippet>('/api/v1/notes/snippets/from-share', data).then(normalizeSnippet)
}

// 更新代码片段
// 对应网关: PUT /api/v1/notes/snippets/:id
export const updateSnippet = (id: string | number, data: SaveSnippetRequest) => {
  return request.put<unknown, RawSnippet>(`/api/v1/notes/snippets/${encodeID(id)}`, data).then(normalizeSnippet)
}

// 删除代码片段
// 预留网关: DELETE /api/v1/notes/snippets/:id
export const deleteSnippet = (id: string | number) => {
  return request.delete<unknown, DeleteSnippetResponse>(`/api/v1/notes/snippets/${encodeID(id)}`)
}

// 恢复代码片段（从回收站）
// 对应网关: POST /api/v1/notes/snippets/:id/restore
export const restoreSnippet = (id: string | number) => {
  return request.post<unknown, void>(`/api/v1/notes/snippets/${encodeID(id)}/restore`)
}

// 移动代码片段
// 对应网关: PUT /api/v1/notes/snippets/:id/move
export const moveSnippet = (id: string | number, data: MoveSnippetRequest) => {
  return request.put<unknown, void>(`/api/v1/notes/snippets/${encodeID(id)}/move`, data)
}

// 设置代码片段标签
// 对应网关: PUT /api/v1/notes/snippets/:id/tags
export const setSnippetTags = (id: string | number, data: SetTagsRequest) => {
  return request.put<unknown, void>(`/api/v1/notes/snippets/${encodeID(id)}/tags`, data)
}

// 收藏代码片段
// 预留网关: POST /api/v1/notes/snippets/:id/favorite
export const favoriteSnippet = (id: string | number) => {
  return request.post<unknown, SnippetFavoriteState>(`/api/v1/notes/snippets/${encodeID(id)}/favorite`, {})
}

// 取消收藏代码片段
// 预留网关: DELETE /api/v1/notes/snippets/:id/favorite
export const unfavoriteSnippet = (id: string | number) => {
  return request.delete<unknown, SnippetFavoriteState>(`/api/v1/notes/snippets/${encodeID(id)}/favorite`)
}

// 获取分组列表
// 预留网关: GET /api/v1/notes/groups
export const listSnippetGroups = (parentId?: number) => {
  return request.get<unknown, RawGroupListPayload>('/api/v1/notes/groups', {
    params: parentId ? { parent_id: parentId } : undefined,
  }).then(normalizeGroupListPayload)
}

// 获取分组详情
// 对应网关: GET /api/v1/notes/groups/:id
export const getSnippetGroup = (id: number) => {
  return request.get<unknown, RawGroup>(`/api/v1/notes/groups/${id}`).then(normalizeGroup)
}

// 创建分组
// 预留网关: POST /api/v1/notes/groups
export const createSnippetGroup = (data: SaveSnippetGroupRequest) => {
  return request.post<unknown, RawGroup>('/api/v1/notes/groups', data).then(normalizeGroup)
}

// 更新分组
// 预留网关: PUT /api/v1/notes/groups/:id
export const updateSnippetGroup = (id: string | number, data: SaveSnippetGroupRequest) => {
  return request.put<unknown, RawGroup>(`/api/v1/notes/groups/${encodeID(id)}`, data).then(normalizeGroup)
}

// 删除分组
// 预留网关: DELETE /api/v1/notes/groups/:id
export const deleteSnippetGroup = (id: string | number) => {
  return request.delete<unknown, DeleteSnippetGroupResponse>(`/api/v1/notes/groups/${encodeID(id)}`)
}

// 获取标签列表
// 预留网关: GET /api/v1/notes/tags
export const listSnippetTags = () => {
  return request.get<unknown, RawTagListPayload>('/api/v1/notes/tags').then(normalizeTagListPayload)
}

// 创建标签
// 预留网关: POST /api/v1/notes/tags
export const createSnippetTag = (data: SaveSnippetTagRequest) => {
  return request.post<unknown, RawTag>('/api/v1/notes/tags', data).then(normalizeTag)
}

// 更新标签
// ⚠️ 网关需新增: PUT /api/v1/notes/tags/:id
export const updateSnippetTag = (id: string | number, data: SaveSnippetTagRequest) => {
  return request.put<unknown, RawTag>(`/api/v1/notes/tags/${encodeID(id)}`, data).then(normalizeTag)
}

// 删除标签
// 预留网关: DELETE /api/v1/notes/tags/:id
export const deleteSnippetTag = (id: string | number) => {
  return request.delete<unknown, DeleteSnippetTagResponse>(`/api/v1/notes/tags/${encodeID(id)}`)
}

// 获取模板列表
// 网关: GET /api/v1/notes/templates
export const listSnippetTemplates = (query?: SnippetTemplateQuery) => {
  return request.get<unknown, { templates: SnippetTemplate[] }>('/api/v1/notes/templates', {
    params: toQueryParams(query),
  }).then(res => res.templates ?? [])
}

// 获取模板详情
// 网关: GET /api/v1/notes/templates/:id
export const getSnippetTemplate = (id: string | number) => {
  return request.get<unknown, SnippetTemplate>(`/api/v1/notes/templates/${encodeID(id)}`)
}

// 创建个人模板
export const createSnippetTemplate = (data: { name: string; content: string; language?: string; description?: string; category?: string }) => {
  return request.post<unknown, SnippetTemplate>('/api/v1/notes/templates', data)
}

// 更新个人模板
export const updateSnippetTemplate = (id: string | number, data: { name?: string; content?: string; language?: string; description?: string; category?: string }) => {
  return request.put<unknown, SnippetTemplate>(`/api/v1/notes/templates/${encodeID(id)}`, data)
}

// 删除个人模板
export const deleteSnippetTemplate = (id: string | number) => {
  return request.delete<unknown, { id: string }>(`/api/v1/notes/templates/${encodeID(id)}`)
}

export interface AITodoItem {
  text: string
  priority: 'high' | 'medium' | 'low' | string
  done: boolean
}

export interface AIMetadata {
  snippet_id: string | number
  summary: string
  suggested_tags: string[]
  todos: AITodoItem[]
  model: string
  prompt_version: string
  updated_at: string
}

type RawAIMetadata = Partial<{
  snippet_id: string | number
  SnippetId: string | number
  snippetId: string | number
  summary: string
  Summary: string
  suggested_tags: string[]
  SuggestedTags: string[]
  suggestedTags: string[]
  todos: RawAITodoItem[]
  Todos: RawAITodoItem[]
  model: string
  Model: string
  prompt_version: string
  PromptVersion: string
  promptVersion: string
  updated_at: string
  UpdatedAt: string
  updatedAt: string
}>

type RawAITodoItem = Partial<{
  text: string
  Text: string
  priority: string
  Priority: string
  done: boolean
  Done: boolean
}>

const normalizeAITodo = (raw: RawAITodoItem): AITodoItem => ({
  text: raw.text ?? raw.Text ?? '',
  priority: (raw.priority ?? raw.Priority ?? 'medium') as AITodoItem['priority'],
  done: raw.done ?? raw.Done ?? false,
})

const normalizeAIMetadata = (raw: RawAIMetadata): AIMetadata => ({
  snippet_id: raw.snippet_id ?? raw.SnippetId ?? raw.snippetId ?? '',
  summary: raw.summary ?? raw.Summary ?? '',
  suggested_tags: raw.suggested_tags ?? raw.SuggestedTags ?? raw.suggestedTags ?? [],
  todos: (raw.todos ?? raw.Todos ?? []).map(normalizeAITodo),
  model: raw.model ?? raw.Model ?? '',
  prompt_version: raw.prompt_version ?? raw.PromptVersion ?? raw.promptVersion ?? '',
  updated_at: raw.updated_at ?? raw.UpdatedAt ?? raw.updatedAt ?? '',
})

// 获取片段的 AI 元数据
// 对应网关: GET /api/v1/notes/snippets/:id/ai
// 404 表示「AI 尚未处理」，返回 null 让调用方展示 placeholder（不弹 toast）
export const getSnippetAiMetadata = (id: string | number): Promise<AIMetadata | null> => {
  return request
    .get<unknown, RawAIMetadata>(`/api/v1/notes/snippets/${encodeID(id)}/ai`, {
      // @ts-expect-error 自定义 config 字段，interceptor 里读取
      skipErrorToast: true,
    })
    .then(normalizeAIMetadata)
    .catch((err) => {
      if (err?.response?.status === 404) return null
      throw err
    })
}

// 上传本地文件并解析为片段草稿
// 预留网关: POST /api/v1/notes/uploads
export const uploadSnippetFile = (file: File) => {
  const formData = new FormData()
  formData.set('file', file)

  return request.post<unknown, SnippetUploadDraft>('/api/v1/notes/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 上传图片到对象存储，返回访问 URL（供编辑器 ImageBlock 使用）
// 对应网关: POST /api/v1/notes/uploads
export const uploadImage = (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.set('file', file)

  return request
    .post<unknown, UploadImageResult>('/api/v1/notes/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // 文件上传给予 30 秒超时（默认 5 秒不够）
    })
    .then((res) => ({ url: res.url }))
}
