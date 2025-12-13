import nodemailer from 'nodemailer'

// Create transporter - configure based on your email provider
// For development, you can use services like Mailtrap or Ethereal
// For production, use services like SendGrid, AWS SES, or SMTP

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendOtpEmailOptions {
  to: string
  otp: string
  storeName?: string
}

export async function sendOtpEmail({ to, otp, storeName = 'Atelier' }: SendOtpEmailOptions): Promise<boolean> {
  // In development without SMTP configured, just log the OTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n========================================`)
    console.log(`📧 OTP Email (DEV MODE - No SMTP configured)`)
    console.log(`To: ${to}`)
    console.log(`OTP Code: ${otp}`)
    console.log(`========================================\n`)
    return true
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${storeName}" <noreply@atelier.com>`,
      to,
      subject: `Your ${storeName} Login Code: ${otp}`,
      text: `Your one-time login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: #111827; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 4px;">${storeName.toUpperCase()}</h1>
            </div>
            <div style="padding: 40px 32px; text-align: center;">
              <h2 style="color: #111827; margin: 0 0 16px; font-size: 20px; font-weight: 500;">Your Login Code</h2>
              <p style="color: #6b7280; margin: 0 0 32px; font-size: 14px;">Enter this code to sign in to your account</p>
              <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <span style="font-size: 36px; font-weight: 600; letter-spacing: 8px; color: #111827;">${otp}</span>
              </div>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">This code expires in 10 minutes</p>
            </div>
            <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return false
  }
}
