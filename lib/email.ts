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

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface SendOrderConfirmationEmailOptions {
  to: string
  orderId: string
  userName: string
  items: OrderItem[]
  totalPrice: number
  paymentMethod: string
  address: string
  phone: string
  storeName?: string
}

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  userName,
  items,
  totalPrice,
  paymentMethod,
  address,
  phone,
  storeName = 'Atelier',
}: SendOrderConfirmationEmailOptions): Promise<boolean> {
  // In development without SMTP configured, just log the order details
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n========================================`)
    console.log(`📧 Order Confirmation Email (DEV MODE - No SMTP configured)`)
    console.log(`To: ${to}`)
    console.log(`Order ID: ${orderId}`)
    console.log(`Customer: ${userName}`)
    console.log(`Total: ₨${totalPrice.toLocaleString()}`)
    console.log(`Items: ${items.map(i => `${i.name} x${i.quantity}`).join(', ')}`)
    console.log(`========================================\n`)
    return true
  }

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₨${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
    )
    .join('')

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${storeName}" <noreply@atelier.com>`,
      to,
      subject: `Order Confirmation: ${orderId.slice(0, 8).toUpperCase()}`,
      text: `Thank you for your order!\n\nOrder ID: ${orderId}\nTotal: ₨${totalPrice.toLocaleString()}\n\nWe will process your ${paymentMethod} payment and ship your order soon.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: #111827; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">${storeName.toUpperCase()}</h1>
              <p style="color: #B91C1C; margin: 8px 0 0; font-size: 14px;">Order Confirmation</p>
            </div>
            
            <div style="padding: 40px 32px;">
              <h2 style="color: #111827; margin: 0 0 8px; font-size: 20px; font-weight: 500;">Thank You, ${userName}!</h2>
              <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Your order has been successfully placed.</p>
              
              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #B91C1C;">
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p style="color: #111827; margin: 0; font-size: 22px; font-weight: 600;">#${orderId.slice(0, 8).toUpperCase()}</p>
              </div>

              <h3 style="color: #111827; margin: 0 0 16px; font-size: 16px; font-weight: 600;">Order Items</h3>
              <table style="width: 100%; margin-bottom: 32px;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 500; font-size: 12px;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 500; font-size: 12px;">Quantity</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500; font-size: 12px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280;">Subtotal</span>
                  <span style="color: #111827; font-weight: 500;">₨${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <h3 style="color: #111827; margin: 0 0 16px; font-size: 16px; font-weight: 600;">Delivery Details</h3>
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Address</p>
                <p style="color: #111827; margin: 0 0 16px; line-height: 1.6;">${address}</p>
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                <p style="color: #111827; margin: 0;">${phone}</p>
              </div>

              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 32px; border-left: 4px solid #d97706;">
                <p style="color: #92400e; margin: 0; font-size: 13px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p style="color: #92400e; margin: 8px 0 0; font-size: 13px;">Your payment status: <strong>Pending</strong></p>
              </div>

              <p style="color: #6b7280; margin: 0 0 16px; font-size: 14px;">We will process your order and send you a tracking number via email shortly.</p>
            </div>

            <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 12px;">Have questions? Reply to this email or visit our website.</p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return true
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    return false
  }
}

interface SendDeliveryNotificationEmailOptions {
  to: string
  orderId: string
  userName: string
  items: OrderItem[]
  totalPrice: number
  storeName?: string
}

export async function sendDeliveryNotificationEmail({
  to,
  orderId,
  userName,
  items,
  totalPrice,
  storeName = 'Atelier',
}: SendDeliveryNotificationEmailOptions): Promise<boolean> {
  // In development without SMTP configured, just log the delivery details
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n========================================`)
    console.log(`📧 DELIVERY NOTIFICATION EMAIL (DEV MODE - No SMTP configured)`)
    console.log(`To: ${to}`)
    console.log(`Order ID: ${orderId}`)
    console.log(`Customer: ${userName}`)
    console.log(`Total: ₨${totalPrice.toLocaleString()}`)
    console.log(`Items: ${items.map(i => `${i.name} x${i.quantity}`).join(', ')}`)
    console.log(`========================================\n`)
    return true
  }

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₨${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
    )
    .join('')

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${storeName}" <noreply@atelier.com>`,
      to,
      subject: `Your Order Has Been Delivered! - #${orderId.slice(0, 8).toUpperCase()}`,
      text: `Great news, ${userName}!\n\nYour order #${orderId.slice(0, 8).toUpperCase()} has been delivered.\n\nWe hope you love your new jewelry! Please take a moment to leave a review and share your experience.\n\nThank you for shopping with ${storeName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">${storeName.toUpperCase()}</h1>
              <div style="margin-top: 24px;">
                <div style="display: inline-block; background: #22c55e; width: 60px; height: 60px; border-radius: 50%; line-height: 60px;">
                  <span style="color: white; font-size: 32px;">✓</span>
                </div>
              </div>
              <p style="color: #22c55e; margin: 16px 0 0; font-size: 18px; font-weight: 500;">Order Delivered!</p>
            </div>
            
            <div style="padding: 40px 32px;">
              <h2 style="color: #111827; margin: 0 0 8px; font-size: 22px; font-weight: 500;">Hello ${userName}!</h2>
              <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">Great news! Your order has been successfully delivered. We hope you love your new jewelry!</p>
              
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #B91C1C;">
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p style="color: #111827; margin: 0; font-size: 24px; font-weight: 600;">#${orderId.slice(0, 8).toUpperCase()}</p>
              </div>

              <h3 style="color: #111827; margin: 0 0 16px; font-size: 16px; font-weight: 600;">What You Received</h3>
              <table style="width: 100%; margin-bottom: 32px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 500; font-size: 12px; border-radius: 4px 0 0 4px;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 500; font-size: 12px;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500; font-size: 12px; border-radius: 0 4px 4px 0;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: 600; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
                    <td style="padding: 16px 12px; text-align: right; font-weight: 600; color: #111827; border-top: 2px solid #e5e7eb;">₨${totalPrice.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Review CTA -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center; border: 1px solid #fecaca;">
                <div style="margin-bottom: 12px;">
                  <span style="color: #B91C1C; font-size: 28px;">★★★★★</span>
                </div>
                <h3 style="color: #111827; margin: 0 0 8px; font-size: 18px; font-weight: 600;">We'd Love Your Feedback!</h3>
                <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.5;">
                  Share your experience and help other customers make informed decisions.
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app/account'}/orders/${orderId}" 
                   style="display: inline-block; background: linear-gradient(135deg, #B91C1C 0%, #991B1B 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
                  Write a Review
                </a>
              </div>

              <div style="background: #f9fafb; border-radius: 8px; padding: 20px;">
                <h4 style="color: #111827; margin: 0 0 12px; font-size: 14px; font-weight: 600;">Need Help?</h4>
                <p style="color: #6b7280; margin: 0; font-size: 13px; line-height: 1.6;">
                  If you have any questions about your order or need assistance with returns, 
                  please don't hesitate to contact us. We're here to help!
                </p>
              </div>
            </div>

            <div style="background: #111827; padding: 24px 32px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">Thank you for choosing ${storeName}</p>
              <p style="color: #6b7280; margin: 0; font-size: 11px;">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return true
  } catch (error) {
    console.error('Failed to send delivery notification email:', error)
    return false
  }
}
