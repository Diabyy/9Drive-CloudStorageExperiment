import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

/**
 * Sends a sleek HTML 6-Digit OTP Email via Resend Transactional Email API.
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  try {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Kode Verifikasi 9DRIVE Vault</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0c0e; color: #ffffff; margin: 0; padding: 40px 20px; }
        .card { max-width: 480px; margin: 0 auto; background: #121216; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 36px 28px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 24px; }
        .logo span { background: linear-gradient(135deg, #2997FF 0%, #BF5AF2 50%, #CCFF00 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .subtitle { font-size: 13px; color: #8E8E93; line-height: 1.5; margin-bottom: 28px; }
        .otp-box { background: rgba(41, 151, 255, 0.08); border: 1px solid rgba(41, 151, 255, 0.3); border-radius: 16px; padding: 18px; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #2997FF; margin-bottom: 28px; }
        .footer { font-size: 11px; color: #636366; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.08); pt-24px; margin-top: 24px; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo"><span>9DRIVE</span> VAULT</div>
        <div class="title">Verifikasi Alamat Email Anda</div>
        <div class="subtitle">Gunakan kode OTP 6-digit di bawah ini untuk menyelesaikan pendaftaran akun 9DRIVE Anda:</div>
        <div class="otp-box">${otpCode}</div>
        <div class="subtitle" style="font-size: 12px; margin-bottom: 0;">Kode verifikasi ini berlaku selama <strong>10 menit</strong>. Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.</div>
        <div class="footer">
          &copy; 2026 9DRIVE Unified Storage Architecture. Hak Cipta Dilindungi.<br>
          Pesan ini dikirim secara otomatis oleh sistem 9DRIVE Security.
        </div>
      </div>
    </body>
    </html>
    `;

    const { data, error } = await resend.emails.send({
      from: '9DRIVE Security <onboarding@resend.dev>',
      to: [toEmail],
      subject: `🔑 [${otpCode}] Kode Verifikasi 9DRIVE Vault Anda`,
      html: htmlContent,
    });

    if (error) {
      console.warn('Resend email API warning:', error);
      return false;
    }

    console.log(`\n[RESEND EMAIL SUCCESS] 📩 Sent OTP email to ${toEmail} (ID: ${data?.id})\n`);
    return true;
  } catch (err: any) {
    console.error('Failed to send OTP email via Resend:', err?.message || err);
    return false;
  }
}
