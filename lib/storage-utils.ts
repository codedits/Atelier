import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Parse a Supabase Storage public URL and extract the bucket name + file path.
 *
 * Public URLs follow the pattern:
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path...>
 *
 * Returns `{ bucket, filePath }` or `null` if the URL doesn't match.
 */
export function parseStorageUrl(publicUrl: string): { bucket: string; filePath: string } | null {
    if (!publicUrl) return null
    try {
        const parsed = new URL(publicUrl)
        const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
        if (!match) return null
        return { bucket: match[1], filePath: decodeURIComponent(match[2]) }
    } catch {
        return null
    }
}

/**
 * Delete a file from Supabase Storage given its public URL.
 * Silently ignores failures (logs a warning) to avoid blocking the caller.
 */
export async function deleteStorageFile(
    adminClient: SupabaseClient,
    publicUrl: string
): Promise<void> {
    const parsed = parseStorageUrl(publicUrl)
    if (!parsed) return

    try {
        const { error } = await adminClient.storage
            .from(parsed.bucket)
            .remove([parsed.filePath])

        if (error) {
            console.warn(`Storage delete failed for ${parsed.bucket}/${parsed.filePath}:`, error.message)
        }
    } catch (err) {
        console.warn('Storage cleanup failed (non-fatal):', err)
    }
}

/**
 * Delete multiple files from Supabase Storage given their public URLs.
 */
export async function deleteStorageFiles(
    adminClient: SupabaseClient,
    publicUrls: string[]
): Promise<void> {
    // Group by bucket for efficiency
    const byBucket = new Map<string, string[]>()

    for (const url of publicUrls) {
        if (!url) continue
        const parsed = parseStorageUrl(url)
        if (!parsed) continue
        const list = byBucket.get(parsed.bucket) || []
        list.push(parsed.filePath)
        byBucket.set(parsed.bucket, list)
    }

    for (const [bucket, paths] of byBucket) {
        try {
            const { error } = await adminClient.storage.from(bucket).remove(paths)
            if (error) {
                console.warn(`Storage batch delete failed for bucket "${bucket}":`, error.message)
            }
        } catch (err) {
            console.warn('Storage batch cleanup failed (non-fatal):', err)
        }
    }
}
