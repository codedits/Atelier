// Simple in-memory OTP helper for admin (single-use, short-lived)
type OtpEntry = { code: string; expiresAt: number }

const otpStore = new Map<string, OtpEntry>()

const DEV_NO_AUTH = process.env.ADMIN_NO_AUTH === 'true'

// Generate a 6-digit OTP for a username, valid for 5 minutes
export function generateOtpForUser(username: string): string {
  // In dev no-auth mode always return a predictable code for testing
  if (DEV_NO_AUTH) {
    const code = '000000'
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Admin OTP (dev-no-auth) for ${username}: ${code}`)
    }
    return code
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
  otpStore.set(username, { code, expiresAt })
  
  // Only log OTP in development - NEVER in production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Admin OTP for ${username}: ${code} (expires in 5 minutes)`)
  }
  
  return code
}

// Verify and consume an OTP for a username
export function verifyOtpForUser(username: string, code: string): boolean {
  // In dev no-auth mode always accept the OTP
  if (DEV_NO_AUTH) return true
  const entry = otpStore.get(username)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(username)
    return false
  }
  if (entry.code !== code) return false
  otpStore.delete(username)
  return true
}

// Helper for testing / maintenance
export function clearOtpForUser(username: string) {
  otpStore.delete(username)
}

export function _debugListOtps() {
  return Array.from(otpStore.entries())
}
