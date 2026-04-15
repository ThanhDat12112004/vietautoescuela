const path = require('path');
const { Resend } = require('resend');

function resolveResendFrom() {
  const from = String(process.env.RESEND_FROM || '').trim();
  if (from) return from;
  return 'onboarding@resend.dev';
}

/**
 * @param {object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 * @param {string|string[]} [opts.replyTo]
 * @param {Array<{ path?: string, filename?: string, content?: Buffer }>} [opts.attachments]
 */
async function sendViaResend(opts) {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return { ok: false, reason: 'no_key' };

  const { to, subject, text, html, replyTo, attachments } = opts;
  if (!text && !html) {
    throw new Error('sendViaResend: text or html required');
  }

  const resend = new Resend(apiKey);
  const payload = {
    from: resolveResendFrom(),
    to: Array.isArray(to) ? to : [to],
    subject,
  };
  if (text) payload.text = text;
  if (html) payload.html = html;
  if (replyTo) payload.replyTo = replyTo;

  if (attachments?.length) {
    payload.attachments = attachments
      .map((a) => {
        if (a.path) {
          return {
            path: a.path,
            filename: a.filename || path.basename(a.path),
          };
        }
        if (a.content) {
          return { content: a.content, filename: a.filename || 'attachment' };
        }
        return null;
      })
      .filter(Boolean);
  }

  const { data, error } = await resend.emails.send(payload);
  if (error) {
    const msg = error.message || error.name || 'Resend error';
    throw new Error(msg);
  }
  return { ok: true, id: data?.id };
}

/**
 * Gửi email giao dịch qua Resend (cần RESEND_API_KEY).
 * @param {object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 * @param {string} [opts.replyTo]
 * @param {Array<{ path?: string, filename?: string, content?: Buffer }>} [opts.attachments]
 */
async function sendTransactionalEmail(opts) {
  const { to } = opts;

  if (!String(process.env.RESEND_API_KEY || '').trim()) {
    console.warn('[mail] Missing RESEND_API_KEY; skip send to', to);
    return { sent: false, reason: 'not_configured', error: 'RESEND_API_KEY empty' };
  }

  try {
    await sendViaResend(opts);
    return { sent: true, via: 'resend' };
  } catch (e) {
    const detail = e?.message || String(e);
    console.error('[mail] Resend failed:', detail);
    return { sent: false, reason: 'send_failed', error: detail };
  }
}

module.exports = { sendTransactionalEmail };
