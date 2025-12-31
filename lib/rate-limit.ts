// Simple in-memory rate limiter for API routes
// For production scale, use Redis or Upstash

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, maxRequests } = options

  return {
    check: (identifier: string): { success: boolean; remaining: number } => {
      const now = Date.now()
      const key = identifier

      // Clean up expired entries periodically
      if (Math.random() < 0.01) {
        Object.keys(store).forEach(k => {
          if (store[k].resetTime < now) {
            delete store[k]
          }
        })
      }

      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 1,
          resetTime: now + interval
        }
        return { success: true, remaining: maxRequests - 1 }
      }

      store[key].count++

      if (store[key].count > maxRequests) {
        return { success: false, remaining: 0 }
      }

      return { success: true, remaining: maxRequests - store[key].count }
    }
  }
}

// Helper to get client IP
export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  )
}
