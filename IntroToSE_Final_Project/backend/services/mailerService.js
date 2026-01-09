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
      <div style="font-family:sans-serif;max-width:480px">
        <h2>You've been invited to join <b>${walletName}</b></h2>
        <p>${inviterName} has invited you to join a shared wallet on 4Money.</p>
        <p>
          <a href="${acceptUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Accept Invitation</a>
        </p>
        <p>If you did not expect this, you can ignore this email.</p>
      </div>
    `,
  })
}
