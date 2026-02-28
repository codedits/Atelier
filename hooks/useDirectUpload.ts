import { useState, useCallback, useRef } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']

export interface UploadItem {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  publicUrl?: string
  error?: string
}

export function useDirectUpload() {
  const { token } = useAdminAuth()
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const abortControllers = useRef<Map<string, XMLHttpRequest>>(new Map())

  /** Validate a file before adding to the queue */
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported image type`
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return `"${file.name}" is ${sizeMB} MB — max is 8 MB`
    }
    return null
  }, [])

  /** Add files to the pending queue, returns validation errors */
  const addFiles = useCallback((files: File[], maxTotal: number): string[] => {
    const errors: string[] = []
    const valid: UploadItem[] = []

    for (const file of files) {
      const err = validateFile(file)
      if (err) {
        errors.push(err)
        continue
      }
      valid.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending'
      })
    }

    setUploads(prev => {
      const remaining = maxTotal - prev.length
      if (valid.length > remaining) {
        errors.push(`Only ${remaining} more image(s) allowed (max ${maxTotal})`)
        return [...prev, ...valid.slice(0, remaining)]
      }
      return [...prev, ...valid]
    })

    return errors
  }, [validateFile])

  /** Upload a single file via signed URL */
  const uploadOne = useCallback(async (item: UploadItem): Promise<string> => {
    // 1. Get signed upload URL from our API
    const res = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        filename: item.file.name,
        contentType: item.file.type,
        folder: 'products'
      })
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to get upload URL')
    }

    const { signedUrl, publicUrl, token: uploadToken } = await res.json()

    // 2. Upload directly to Supabase Storage with XHR for progress
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      abortControllers.current.set(item.id, xhr)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setUploads(prev =>
            prev.map(u => u.id === item.id ? { ...u, progress: pct } : u)
          )
        }
      })

      xhr.addEventListener('load', () => {
        abortControllers.current.delete(item.id)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(publicUrl)
        } else {
          reject(new Error(`Upload failed (${xhr.status})`))
        }
      })

      xhr.addEventListener('error', () => {
        abortControllers.current.delete(item.id)
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('abort', () => {
        abortControllers.current.delete(item.id)
        reject(new Error('Upload cancelled'))
      })

      // Supabase signed upload uses PUT with the token as a query param
      const url = signedUrl
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', item.file.type)
      xhr.send(item.file)
    })
  }, [token])

  /** Start uploading all pending items */
  const uploadAll = useCallback(async (): Promise<string[]> => {
    const pending = uploads.filter(u => u.status === 'pending')
    if (!pending.length) return []

    // Mark all as uploading
    setUploads(prev =>
      prev.map(u => u.status === 'pending' ? { ...u, status: 'uploading', progress: 0 } : u)
    )

    const results: string[] = []

    for (const item of pending) {
      try {
        const publicUrl = await uploadOne(item)
        results.push(publicUrl)
        setUploads(prev =>
          prev.map(u => u.id === item.id ? { ...u, status: 'done', progress: 100, publicUrl } : u)
        )
      } catch (err: any) {
        setUploads(prev =>
          prev.map(u => u.id === item.id ? { ...u, status: 'error', error: err.message } : u)
        )
      }
    }

    return results
  }, [uploads, uploadOne])

  /** Remove a file from the queue and revoke its preview URL */
  const removeUpload = useCallback((id: string) => {
    setUploads(prev => {
      const item = prev.find(u => u.id === id)
      if (item) {
        URL.revokeObjectURL(item.previewUrl)
        // Abort if still uploading
        const xhr = abortControllers.current.get(id)
        if (xhr) xhr.abort()
      }
      return prev.filter(u => u.id !== id)
    })
  }, [])

  /** Clear all completed/errored uploads */
  const clearDone = useCallback(() => {
    setUploads(prev => {
      prev.filter(u => u.status === 'done' || u.status === 'error')
        .forEach(u => URL.revokeObjectURL(u.previewUrl))
      return prev.filter(u => u.status !== 'done' && u.status !== 'error')
    })
  }, [])

  /** Reset everything */
  const reset = useCallback(() => {
    uploads.forEach(u => URL.revokeObjectURL(u.previewUrl))
    abortControllers.current.forEach(xhr => xhr.abort())
    abortControllers.current.clear()
    setUploads([])
  }, [uploads])

  const isUploading = uploads.some(u => u.status === 'uploading')
  const pendingCount = uploads.filter(u => u.status === 'pending').length
  const totalProgress = uploads.length
    ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length)
    : 0

  return {
    uploads,
    addFiles,
    uploadAll,
    removeUpload,
    clearDone,
    reset,
    isUploading,
    pendingCount,
    totalProgress,
    MAX_FILE_SIZE
  }
}
