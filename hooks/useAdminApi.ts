import { useAdminAuth } from '@/context/AdminAuthContext'

export function useAdminApi() {
  const { token } = useAdminAuth()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const get = async <T,>(endpoint: string): Promise<T> => {
    const res = await fetch(`/api/admin${endpoint}`, { headers })
    if (!res.ok) {
      let body: any = null
      try { body = await res.json() } catch {}
      const msg = body?.error || body?.message || res.statusText || 'API request failed'
      throw new Error(`${res.status} ${msg}`)
    }
    return res.json()
  }

  const post = async <T,>(endpoint: string, data: unknown): Promise<T> => {
    const res = await fetch(`/api/admin${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      let body: any = null
      try { body = await res.json() } catch {}
      const msg = body?.error || body?.message || res.statusText || 'API request failed'
      throw new Error(`${res.status} ${msg}`)
    }
    return res.json()
  }

  const put = async <T,>(endpoint: string, data: unknown): Promise<T> => {
    const res = await fetch(`/api/admin${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      let body: any = null
      try { body = await res.json() } catch {}
      const msg = body?.error || body?.message || res.statusText || 'API request failed'
      throw new Error(`${res.status} ${msg}`)
    }
    return res.json()
  }

  const del = async (endpoint: string): Promise<void> => {
    const res = await fetch(`/api/admin${endpoint}`, {
      method: 'DELETE',
      headers
    })
    if (!res.ok) {
      let body: any = null
      try { body = await res.json() } catch {}
      const msg = body?.error || body?.message || res.statusText || 'API request failed'
      throw new Error(`${res.status} ${msg}`)
    }
  }

  return { get, post, put, del }
}
