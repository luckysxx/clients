import { completeUpload, requestPresign } from '@/api/upload'
import { toast } from '@/composables/useToast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']

/**
 * 校验上传文件是否满足图片上传的基本要求。
 * 返回错误信息或 null（校验通过）。
 */
function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.some((t) => file.type.startsWith(t.split('/')[0]!))) {
    return `不支持的文件类型: ${file.type || '未知'}，仅支持 PNG/JPEG/GIF/WebP/SVG`
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    return `文件过大 (${sizeMB}MB)，上限为 10MB`
  }
  return null
}

/**
 * 上传图片到 MinIO 对象存储，返回访问 URL。
 * 内含前端文件校验（类型 + 大小），失败时弹 toast 并返回空字符串。
 * 供 MilkdownEditor 的 ImageBlock.onUpload 回调使用。
 */
export async function handleImageUpload(file: File): Promise<string> {
  const error = validateImageFile(file)
  if (error) {
    toast.warning(error)
    return ''
  }

  try {
    const presign = await requestPresign({
      filename: file.name,
      mime_type: file.type || 'application/octet-stream',
      size: file.size,
    })

    const putHeaders = { ...presign.headers }
    delete putHeaders['Content-Length']

    const putResponse = await fetch(presign.url, {
      method: 'PUT',
      body: file,
      headers: putHeaders,
    })

    if (!putResponse.ok) {
      throw new Error(`MinIO PUT failed with status ${putResponse.status}`)
    }

    const completed = await completeUpload({
      object_key: presign.object_key,
      filename: file.name,
      size: file.size,
      mime_type: file.type || 'application/octet-stream',
    })

    return completed.url
  } catch (e) {
    console.error('Image upload failed:', e)
    toast.error('图片上传失败，请稍后重试')
    return ''
  }
}
