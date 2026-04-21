import type { Snippet, SnippetGroup, SnippetTag } from '@/api/snippet'

export interface OrganizeGroupNode extends SnippetGroup {
  children: OrganizeGroupNode[]
}

export interface OrganizeGroupOption {
  id: string | number
  name: string
  depth: number
}

export interface OrganizeTagMapItem extends SnippetTag {
  color: string
}

export interface OrganizeSharedState {
  snippets: Snippet[]
  groups: OrganizeGroupNode[]
  flatGroups: OrganizeGroupOption[]
  tagMap: Map<string, OrganizeTagMapItem>
  activeGroupId: string | number
  selectedIds: Array<string | number>
  loading: boolean
}
