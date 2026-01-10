// backend/services/mailerService.js

import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'tuananhauxiliary@gmail.com',
    pass: process.env.SMTP_PASS || 'fcswrlowgiwjtftm',
  },
})

export async function sendInvitationMail({ to, inviterName, walletName, acceptUrl }) {
  return transporter.sendMail({
    from: `4Money App <${process.env.SMTP_USER || 'tuananhauxiliary@gmail.com'}>`,
    to,
    subject: `Invitation to join shared wallet: ${walletName}`,
    html: `
      <div style="font-family: 'Manrope', 'Noto Sans', Arial, sans-serif; background: #f6f8f6; padding: 32px 0;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(25,230,94,0.08); overflow: hidden; border: 1.5px solid #e5e7eb;">
          <div style="background: #19e65e; padding: 28px 0 18px 0; text-align: center;">
            <span style="color: #fff; font-size: 2.1rem; font-weight: bold; letter-spacing: 2px;">4Money</span>
          </div>
          <div style="padding: 32px 28px 24px 28px; text-align: center;">
            <h2 style="margin: 0 0 14px 0; color: #112116; font-size: 1.25rem; font-weight: 700;">You've been invited to join <span style='color:#19e65e'>${walletName}</span></h2>
            <p style="color: #29382e; margin: 0 0 20px 0; font-size: 1.05rem;">${inviterName} has invited you to join a shared wallet on <b>4Money</b>.</p>
            <a href="${acceptUrl}" style="display:inline-block;background:#19e65e;color:#fff;padding:13px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:1.07rem;box-shadow:0 2px 8px rgba(25,230,94,0.13);margin:20px 0 14px 0;transition:background 0.2s;letter-spacing:0.5px;">Accept Invitation</a>
            <p style="color: #9db8a6; font-size: 0.98rem; margin: 28px 0 0 0;">If you did not expect this, you can safely ignore this email.</p>
          </div>
          <div style="background: #f6f8f6; padding: 16px 0; text-align: center; color: #9db8a6; font-size: 0.95rem; border-top: 1px solid #e5e7eb;">
            &copy; ${new Date().getFullYear()} 4Money. All rights reserved.
          </div>
        </div>
      </div>
    `,
  })
}
