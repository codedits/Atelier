// Input validation and sanitization utilities

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input.trim().slice(0, maxLength)
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function sanitizeHtml(html: string): string {
  // Basic XSS prevention - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
}

export function validatePositiveNumber(value: any): number | null {
  const num = Number(value)
  if (isNaN(num) || num < 0) return null
  return num
}

export function validateInteger(value: any, min?: number, max?: number): number | null {
  const num = parseInt(value, 10)
  if (isNaN(num)) return null
  if (min !== undefined && num < min) return null
  if (max !== undefined && num > max) return null
  return num
}

// SQL injection prevention for raw queries (use Supabase client instead when possible)
export function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''")
}
