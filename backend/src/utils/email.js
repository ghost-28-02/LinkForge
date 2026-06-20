import { config } from '../config/env.js';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Low-level sender. Posts a transactional email through the Brevo API.
 * When no API key is configured (e.g. local dev) it logs the message to the
 * console instead of failing, so the auth flows remain testable offline.
 */
async function sendEmail({ to, subject, html, text }) {
  if (!config.brevoApiKey) {
    console.log('\n[email] BREVO_API_KEY not set — printing email to console:');
    console.log(`  to:      ${to}`);
    console.log(`  subject: ${subject}`);
    console.log(`  text:    ${text}\n`);
    return { mocked: true };
  }

  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': config.brevoApiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: config.brevoSenderEmail, name: config.brevoSenderName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo send failed (${res.status}): ${detail}`);
  }
  return res.json().catch(() => ({}));
}

const brand = '#4f46e5';

function shell(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
    <div style="max-width:480px;margin:0 auto;padding:32px 16px">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:22px;font-weight:800;color:${brand}">Link<span style="color:#0f172a">Forge</span></span>
      </div>
      <div style="background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(15,23,42,.08)">
        <h1 style="margin:0 0 12px;font-size:20px">${title}</h1>
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">
        You received this email because someone used this address on LinkForge.
      </p>
    </div>
  </body></html>`;
}

export function sendOtpEmail(to, code) {
  const subject = 'Your LinkForge verification code';
  const html = shell(
    'Confirm your email',
    `<p style="margin:0 0 16px;color:#475569">Use this code to finish creating your LinkForge account. It expires in ${config.otpTtlMinutes} minutes.</p>
     <div style="text-align:center;margin:24px 0">
       <span style="display:inline-block;font-size:34px;letter-spacing:10px;font-weight:800;color:${brand};background:#eef2ff;border-radius:12px;padding:14px 24px">${code}</span>
     </div>
     <p style="margin:0;color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email.</p>`
  );
  const text = `Your LinkForge verification code is ${code}. It expires in ${config.otpTtlMinutes} minutes.`;
  return sendEmail({ to, subject, html, text });
}

export function sendResetEmail(to, token) {
  const link = `${config.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Reset your LinkForge password';
  const html = shell(
    'Reset your password',
    `<p style="margin:0 0 16px;color:#475569">We received a request to reset your password. This link expires in ${config.resetTtlMinutes} minutes.</p>
     <div style="text-align:center;margin:24px 0">
       <a href="${link}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;font-weight:600;border-radius:10px;padding:12px 28px">Reset password</a>
     </div>
     <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">Or paste this link into your browser:</p>
     <p style="margin:0;color:#64748b;font-size:13px;word-break:break-all">${link}</p>`
  );
  const text = `Reset your LinkForge password using this link (expires in ${config.resetTtlMinutes} minutes): ${link}`;
  return sendEmail({ to, subject, html, text });
}
