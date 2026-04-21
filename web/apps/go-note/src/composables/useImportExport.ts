import { ref } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { toast } from '@/composables/useToast'

const importing = ref(false)

// ─── 工具函数 ──────────────────────────────────────────────────

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`读取文件 "${file.name}" 失败`))
    reader.readAsText(file)
  })
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.(md|markdown|mdown|mkd|mkdn|txt)$/i, '').trim() || '未命名文档'
}

/**
 * 生成安全文件名，自动去重
 */
function safeFileName(title: string, usedNames: Set<string>): string {
  const baseName = (title || '未命名文档').replace(/[<>:"/\\|?*]/g, '_').trim()
  let fileName = `${baseName}.md`
  let counter = 1
  while (usedNames.has(fileName)) {
    fileName = `${baseName} (${counter}).md`
    counter++
  }
  usedNames.add(fileName)
  return fileName
}

/**
 * 浏览器是否支持 File System Access API
 */
export const supportsFileSystemAccess =
  typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showDirectoryPicker' in window

// ─── 导入 ──────────────────────────────────────────────────────

export interface ImportedFile {
  title: string
  content: string
}

/**
 * 弹出文件选择器，读取一个 .md 文件并返回 {title, content}。
 * 调用方负责将内容填入编辑器表单，不自动保存或创建草稿。
 *
 * @returns 文件内容，或 null（用户取消）
 */
export function pickMarkdownFile(): Promise<ImportedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.mdown,.mkd,.mkdn,.txt'
    input.multiple = false
    input.style.display = 'none'

    input.addEventListener('change', async () => {
      if (input.files && input.files.length > 0) {
        try {
          const file = input.files[0]
          if (!file) {
            resolve(null)
            return
          }
          const content = await readFileAsText(file)
          const title = titleFromFilename(file.name)
          resolve({ title, content })
        } catch (err) {
          toast.error('读取文件失败')
          resolve(null)
        }
      } else {
        resolve(null)
      }
      input.remove()
    })

    input.addEventListener('cancel', () => {
      resolve(null)
      input.remove()
    })

    document.body.appendChild(input)
    input.click()
  })
}

// ─── 导出：单篇 → 弹出「另存为」对话框 ───────────────────────

/**
 * 导出单篇文档，弹出系统「另存为」对话框让用户选择保存位置。
 * 不支持的浏览器自动降级为直接下载。
 *
 * @returns 'saved' | 'cancelled' | 'fallback'
 */
export async function exportSingleToFile(
  snippet: { title: string; content: string },
): Promise<'saved' | 'cancelled' | 'fallback'> {
  const title = snippet.title || '未命名文档'

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${title}.md`,
        types: [
          {
            description: 'Markdown 文件',
            accept: { 'text/markdown': ['.md'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(snippet.content)
      await writable.close()
      toast.success('文档已导出')
      return 'saved'
    } catch (err: any) {
      if (err?.name === 'AbortError') return 'cancelled'
      toast.error('导出失败')
      return 'cancelled'
    }
  }

  // 降级
  const blob = new Blob([snippet.content], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `${title}.md`)
  toast.success('文档已导出')
  return 'fallback'
}

// ─── 导出：多篇 → 弹出文件夹选择器 ───────────────────────────

export interface ExportToFolderProgress {
  total: number
  done: number
}

/**
 * 批量导出到用户选择的文件夹。
 *
 * @param snippets 要导出的文档
 * @param onProgress 可选的进度回调
 * @returns 成功导出的数量，-1 表示用户取消
 */
export async function exportToFolder(
  snippets: Array<{ title: string; content: string }>,
  onProgress?: (p: ExportToFolderProgress) => void,
): Promise<number> {
  if (snippets.length === 0) {
    toast.warning('没有可导出的文档')
    return 0
  }

  let dirHandle: FileSystemDirectoryHandle
  try {
    dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
  } catch {
    return -1 // 用户取消
  }

  const usedNames = new Set<string>()
  let successCount = 0

  for (let i = 0; i < snippets.length; i++) {
    const s = snippets[i]
    if (!s) {
      onProgress?.({ total: snippets.length, done: i + 1 })
      continue
    }
    try {
      const fileName = safeFileName(s.title, usedNames)
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(s.content)
      await writable.close()
      successCount++
    } catch (err) {
      console.error(`导出失败: ${s.title}`, err)
    }
    onProgress?.({ total: snippets.length, done: i + 1 })
  }

  if (successCount === snippets.length) {
    toast.success(`已导出 ${successCount} 篇文档到文件夹`)
  } else if (successCount > 0) {
    toast.warning(`已导出 ${successCount} / ${snippets.length} 篇，部分失败`)
  } else {
    toast.error('导出失败')
  }

  return successCount
}

// ─── 导出：ZIP 下载（降级方案）────────────────────────────────

export async function exportSnippetsAsZip(snippets: Array<{ title: string; content: string }>) {
  if (snippets.length === 0) {
    toast.warning('没有可导出的文档')
    return
  }

  const zip = new JSZip()
  const usedNames = new Set<string>()

  for (const snippet of snippets) {
    const fileName = safeFileName(snippet.title, usedNames)
    zip.file(fileName, snippet.content)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const timestamp = new Date().toISOString().slice(0, 10)
  saveAs(blob, `go-note-export-${timestamp}.zip`)
  toast.success(`已导出 ${snippets.length} 篇文档`)
}

// ─── 保留旧的 Blob 下载（兼容）────────────────────────────────

export function exportSnippetAsMarkdown(snippet: { title: string; content: string }) {
  const filename = `${snippet.title || '未命名文档'}.md`
  const blob = new Blob([snippet.content], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, filename)
  toast.success('文档已导出')
}

// ─── Composable ───────────────────────────────────────────────

export function useImportExport() {
  return {
    importing,
    supportsFileSystemAccess,
    pickMarkdownFile,
    exportSingleToFile,
    exportToFolder,
    exportSnippetsAsZip,
    exportSnippetAsMarkdown,
  }
}
