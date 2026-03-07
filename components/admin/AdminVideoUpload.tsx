import { useState, useRef, useCallback, useEffect } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'

interface AdminVideoUploadProps {
    /** Current video URL value */
    value: string
    /** Called when the URL changes (either by upload or manual paste) */
    onChange: (url: string) => void
    /** Label for the field */
    label?: string
    /** Storage folder */
    folder?: 'feature_video'
    /** Placeholder for the URL input */
    placeholder?: string
}

const ALLOWED_TYPES = ['video/mp4', 'video/webm']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export default function AdminVideoUpload({
    value,
    onChange,
    label = 'Video',
    folder = 'feature_video',
    placeholder = 'Or paste video URL (.mp4, .webm)...'
}: AdminVideoUploadProps) {
    const { token } = useAdminAuth()
    const [preview, setPreview] = useState(value || '')
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const objectUrlRef = useRef<string | null>(null)

    const revokePreview = useCallback(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current)
            objectUrlRef.current = null
        }
    }, [])

    useEffect(() => {
        return () => { revokePreview() }
    }, [revokePreview])

    useEffect(() => {
        if (!pendingFile) {
            setPreview(value || '')
        }
    }, [value, pendingFile])

    const uploadFile = useCallback(async (file: File) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Unsupported format. Use MP4 or WebM.')
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 50 MB.`)
            return
        }

        setError('')
        setUploading(true)
        setProgress(0)

        revokePreview()
        const localPreview = URL.createObjectURL(file)
        setPreview(localPreview)

        try {
            // 1. Get signed upload URL
            const res = await fetch('/api/admin/upload-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ filename: file.name, contentType: file.type, folder })
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.error || 'Failed to get upload URL')
            }

            const { signedUrl, publicUrl } = await res.json()

            // 2. Upload via XHR for progress tracking
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setProgress(Math.round((e.loaded / e.total) * 100))
                    }
                })

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve()
                    } else {
                        reject(new Error(`Upload failed (${xhr.status})`))
                    }
                })

                xhr.addEventListener('error', () => reject(new Error('Network error')))
                xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

                xhr.open('PUT', signedUrl)
                xhr.setRequestHeader('Content-Type', file.type)
                xhr.send(file)
            })

            // 3. Success
            setPreview(publicUrl)
            onChange(publicUrl)
            setProgress(100)
        } catch (err: any) {
            setError(err.message || 'Upload failed')
            setPreview(value)
        } finally {
            setUploading(false)
            URL.revokeObjectURL(localPreview)
        }
    }, [token, folder, onChange, value, revokePreview])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError('Unsupported format. Use MP4 or WebM.')
            } else if (file.size > MAX_FILE_SIZE) {
                setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 50 MB.`)
            } else {
                setError('')
                setPendingFile(file)
                revokePreview()
                const url = URL.createObjectURL(file)
                objectUrlRef.current = url
                setPreview(url)
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (!file) return

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Unsupported format. Use MP4 or WebM.')
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 50 MB.`)
            return
        }

        setError('')
        setPendingFile(file)
        revokePreview()
        const url = URL.createObjectURL(file)
        objectUrlRef.current = url
        setPreview(url)
    }, [revokePreview])

    const handleStartUpload = async () => {
        if (!pendingFile || uploading) return
        await uploadFile(pendingFile)
        setPendingFile(null)
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        onChange(url)
        setPreview(url)
        setPendingFile(null)
        setError('')
    }

    return (
        <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">{label}</label>

            {/* Preview */}
            {preview && (
                <div className="mb-3 relative w-full aspect-video md:aspect-[21/9] rounded-lg overflow-hidden bg-black border border-[#1a1a1a]">
                    <video src={preview} playsInline autoPlay muted loop className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={async () => {
                            if (value) {
                                try {
                                    await fetch('/api/admin/upload-url', {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                                        },
                                        body: JSON.stringify({ url: value, folder })
                                    })
                                } catch (e) {
                                    console.error('Failed to delete video', e)
                                }
                            }
                            onChange('');
                            setPreview('');
                        }}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-[#ff4444]/90 hover:bg-[#ff4444] rounded-full text-white transition-colors text-sm shadow-lg active:scale-90"
                        title="Remove video"
                        aria-label="Remove video"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Upload zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border border-dashed rounded-lg transition-colors ${dragOver
                    ? 'border-white/50 bg-white/5'
                    : 'border-[#333] hover:border-[#555]'
                    }`}
            >
                <label className="flex items-center justify-center gap-2 cursor-pointer py-4 sm:py-3 px-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#888]">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[#888] text-sm">
                        {uploading ? 'Uploading...' : 'Choose video or drag & drop'}
                    </span>
                </label>

                {/* Progress bar */}
                {uploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a1a1a] rounded-b-lg overflow-hidden">
                        <div
                            className="h-full bg-[#C9A96E] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {pendingFile && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#333] bg-[#111] px-3 py-2">
                    <span className="text-[12px] text-[#aaa] truncate">Selected: {pendingFile.name} ({Math.round(pendingFile.size / 1024 / 1024)}MB)</span>
                    <button
                        type="button"
                        onClick={handleStartUpload}
                        disabled={uploading}
                        className="admin-btn admin-btn-primary text-[12px] px-3 py-1.5 disabled:opacity-50 flex-shrink-0"
                    >
                        {uploading ? 'Uploading...' : 'Save & Upload'}
                    </button>
                </div>
            )}

            {/* URL fallback */}
            <input
                type="url"
                value={value}
                onChange={handleUrlChange}
                className="admin-input w-full mt-2"
                placeholder={placeholder}
                disabled={uploading}
            />

            {/* Error */}
            {error && (
                <p className="text-[#ff6166] text-[11px] mt-1">{error}</p>
            )}
        </div>
    )
}
