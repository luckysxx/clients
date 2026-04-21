import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  listSnippetGroups,
  listSnippetTags,
  createSnippetGroup,
  updateSnippetGroup,
  deleteSnippetGroup,
  createSnippetTag,
  updateSnippetTag,
  deleteSnippetTag,
  type SnippetGroup,
  type SnippetTag,
  type SaveSnippetGroupRequest,
  type SaveSnippetTagRequest,
} from '@/api/snippet'
import { isSameId } from '@clients/shared'

export const useWorkspaceStore = defineStore('workspace', () => {
  // ── State ──
  const groups = ref<SnippetGroup[]>([])
  const tags = ref<SnippetTag[]>([])
  const activeGroupId = ref<string | number | null>(null)
  const activeTagId = ref<string | number | null>(null)
  const groupsLoading = ref(false)
  const tagsLoading = ref(false)
  const templateDialogOpen = ref(false)

  // ── Getters ──
  const topLevelGroups = computed(() =>
    groups.value.filter(g => !g.parent_id)
  )

  const activeGroup = computed(() =>
    groups.value.find(g => isSameId(g.id, activeGroupId.value)) ?? null
  )

  // ── Actions ──
  async function fetchGroups() {
    groupsLoading.value = true
    try {
      groups.value = await listSnippetGroups()
    } finally {
      groupsLoading.value = false
    }
  }

  async function fetchTags() {
    tagsLoading.value = true
    try {
      tags.value = await listSnippetTags()
    } finally {
      tagsLoading.value = false
    }
  }

  async function addGroup(data: SaveSnippetGroupRequest) {
    const created = await createSnippetGroup(data)
    groups.value.push(created)
    return created
  }

  async function removeGroup(id: string | number) {
    await deleteSnippetGroup(id)
    groups.value = groups.value.filter(g => !isSameId(g.id, id))
    if (isSameId(activeGroupId.value, id)) {
      activeGroupId.value = null
    }
  }

  async function addTag(data: SaveSnippetTagRequest) {
    const created = await createSnippetTag(data)
    tags.value.push(created)
    return created
  }

  async function removeTag(id: string | number) {
    await deleteSnippetTag(id)
    tags.value = tags.value.filter(t => !isSameId(t.id, id))
    if (isSameId(activeTagId.value, id)) {
      activeTagId.value = null
    }
  }

  function selectGroup(id: string | number | null) {
    activeGroupId.value = id
  }

  function selectTag(id: any) {
    activeTagId.value = isSameId(id, activeTagId.value) ? null : id
  }

  return {
    groups, tags,
    activeGroupId, activeTagId,
    groupsLoading, tagsLoading,
    templateDialogOpen,
    topLevelGroups, activeGroup,
    fetchGroups, fetchTags,
    addGroup, removeGroup,
    addTag, removeTag,
    selectGroup, selectTag,
  }
})
