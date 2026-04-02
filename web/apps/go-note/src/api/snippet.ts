import request from '@/utils/request'

export type SnippetVisibility = 'private' | 'public'

export interface Snippet {
  id: string | number
  title: string
  content: string
  language: string
  created_at: string
  updated_at: string
  visibility?: SnippetVisibility
  owner_id?: number
}

type RawSnippet = Partial<{
  id: string | number
  ID: string | number
  title: string
  Title: string
  short_link: string
  ShortLink: string
  content: string
  Content: string
  language: string
  Language: string
  created_at: string
  CreatedAt: string
  updated_at: string
  UpdatedAt: string
  visibility: SnippetVisibility
  Visibility: SnippetVisibility
  owner_id: number
  OwnerID: number
}>

export interface SnippetListQuery {
  q?: string
  keyword?: string
  language?: string
  visibility?: SnippetVisibility
  tag?: string
  group_id?: string | number
  page?: number
  page_size?: number
  sort_by?: 'updated_at' | 'created_at' | 'title'
  order?: 'asc' | 'desc'
}

export interface SaveSnippetRequest {
  title: string
  content: string
  language: string
  visibility?: SnippetVisibility
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
  name: string
  description?: string
  color?: string
  snippet_count?: number
}

export interface SaveSnippetGroupRequest {
  name: string
  description?: string
  color?: string
}

export interface DeleteSnippetGroupResponse {
  id: string | number
}

export interface SnippetTag {
  id: string | number
  name: string
  color?: string
  snippet_count?: number
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
  title: string
  description?: string
  language: string
  content: string
  visibility?: SnippetVisibility
  tags?: string[]
}

export interface SnippetTemplateQuery {
  q?: string
  language?: string
  category?: string
}

export interface CreateSnippetFromTemplateRequest {
  template_id: string | number
  title?: string
  visibility?: SnippetVisibility
}

export interface SnippetUploadDraft {
  filename: string
  title?: string
  content: string
  language?: string
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

const encodeID = (id: string | number) => encodeURIComponent(String(id))

const normalizeSnippet = (raw: RawSnippet): Snippet => {
  const id = raw.id ?? raw.ID
  const title = raw.title ?? raw.Title ?? raw.short_link ?? raw.ShortLink
  const content = raw.content ?? raw.Content
  const language = raw.language ?? raw.Language
  const createdAt = raw.created_at ?? raw.CreatedAt
  const updatedAt = raw.updated_at ?? raw.UpdatedAt ?? createdAt

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
    visibility: raw.visibility ?? raw.Visibility,
    owner_id: raw.owner_id ?? raw.OwnerID,
  }
}

// 获取我的代码片段
// 对应网关: GET /api/v1/notes/me/snippets
export const listMySnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippet[]>('/api/v1/notes/me/snippets', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetList)
}

// 获取最近访问片段
// 预留网关: GET /api/v1/notes/me/snippets/recent
export const listRecentSnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippet[]>('/api/v1/notes/me/snippets/recent', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetList)
}

// 获取与我共享的片段
// 预留网关: GET /api/v1/notes/me/snippets/shared
export const listSharedSnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippet[]>('/api/v1/notes/me/snippets/shared', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetList)
}

// 获取收藏片段
// 预留网关: GET /api/v1/notes/me/snippets/favorites
export const listFavoriteSnippets = (query?: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippet[]>('/api/v1/notes/me/snippets/favorites', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetList)
}

// 搜索代码片段
// 预留网关: GET /api/v1/notes/snippets/search
export const searchSnippets = (query: SnippetListQuery) => {
  return request
    .get<unknown, RawSnippet[]>('/api/v1/notes/snippets/search', {
      params: toQueryParams(query),
    })
    .then(normalizeSnippetList)
}

// 获取代码片段详情
// 对应网关: GET /api/v1/notes/snippets/:id
export const getSnippet = (id: string | number) => {
  return request.get<unknown, RawSnippet>(`/api/v1/notes/snippets/${encodeID(id)}`).then(normalizeSnippet)
}

// 获取公开代码片段详情
// 预留网关: GET /api/v1/notes/public/snippets/:id
export const getPublicSnippet = (id: string | number) => {
  return request.get<unknown, RawSnippet>(`/api/v1/notes/public/snippets/${encodeID(id)}`).then(normalizeSnippet)
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
export const listSnippetGroups = () => {
  return request.get<unknown, SnippetGroup[]>('/api/v1/notes/groups')
}

// 创建分组
// 预留网关: POST /api/v1/notes/groups
export const createSnippetGroup = (data: SaveSnippetGroupRequest) => {
  return request.post<unknown, SnippetGroup>('/api/v1/notes/groups', data)
}

// 更新分组
// 预留网关: PUT /api/v1/notes/groups/:id
export const updateSnippetGroup = (id: string | number, data: SaveSnippetGroupRequest) => {
  return request.put<unknown, SnippetGroup>(`/api/v1/notes/groups/${encodeID(id)}`, data)
}

// 删除分组
// 预留网关: DELETE /api/v1/notes/groups/:id
export const deleteSnippetGroup = (id: string | number) => {
  return request.delete<unknown, DeleteSnippetGroupResponse>(`/api/v1/notes/groups/${encodeID(id)}`)
}

// 获取标签列表
// 预留网关: GET /api/v1/notes/tags
export const listSnippetTags = () => {
  return request.get<unknown, SnippetTag[]>('/api/v1/notes/tags')
}

// 创建标签
// 预留网关: POST /api/v1/notes/tags
export const createSnippetTag = (data: SaveSnippetTagRequest) => {
  return request.post<unknown, SnippetTag>('/api/v1/notes/tags', data)
}

// 删除标签
// 预留网关: DELETE /api/v1/notes/tags/:id
export const deleteSnippetTag = (id: string | number) => {
  return request.delete<unknown, DeleteSnippetTagResponse>(`/api/v1/notes/tags/${encodeID(id)}`)
}

// 获取模板列表
// 预留网关: GET /api/v1/notes/templates
export const listSnippetTemplates = (query?: SnippetTemplateQuery) => {
  return request.get<unknown, SnippetTemplate[]>('/api/v1/notes/templates', {
    params: toQueryParams(query),
  })
}

// 获取模板详情
// 预留网关: GET /api/v1/notes/templates/:id
export const getSnippetTemplate = (id: string | number) => {
  return request.get<unknown, SnippetTemplate>(`/api/v1/notes/templates/${encodeID(id)}`)
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
