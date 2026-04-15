const path = require('path');
const premiumPaymentRepository = require('../repositories/premium-payment.repository');
const userRepository = require('../repositories/user.repository');
const { sendTransactionalEmail } = require('../utils/mail');

const PLAN_LABELS = {
  '1m': '1 thang — 150.000 VND',
  '3m': '3 thang — 300.000 VND',
};

/** Key từ media-service: premium-bills hoặc questions (legacy). Một file — CDN + DB chỉ lưu một đường dẫn. */
const BILL_MEDIA_KEY_RE =
  /^(?:premium-bills|questions)\/\d{4}\/[a-f0-9]{32}\.[a-z0-9]+$/i;

function publicOrigin() {
  return String(process.env.PUBLIC_WEB_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || '').replace(
    /\/+$/,
    ''
  );
}

function normalizeCdnUrl(cdnUrl, mediaKey) {
  const trimmed = String(cdnUrl || '').trim();
  if (trimmed) return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `/media/static/${String(mediaKey).replace(/^\//, '')}`;
}

async function submitPremiumPaymentRequest({
  userId,
  planCode,
  payerNote,
  billAbsolutePath,
  skipServerEmail = true,
}) {
  if (planCode !== '1m' && planCode !== '3m') {
    const err = new Error('plan_code must be 1m or 3m');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const relPath = `/uploads/premium-bills/${path.basename(billAbsolutePath)}`;
  const requestId = await premiumPaymentRepository.insertPremiumPaymentRequest({
    userId,
    planCode,
    payerNote,
    billStoragePath: relPath,
    billCdnUrl: null,
  });

  const notifyTo = process.env.PREMIUM_NOTIFY_EMAIL || 'vietautoescuela@gmail.com';

  const textBody = [
    'Premium payment notification',
    `Request id: ${requestId}`,
    `User id: ${user.id}`,
    `Username: ${user.username}`,
    `Email: ${user.email}`,
    `Plan: ${planCode} (${PLAN_LABELS[planCode]})`,
    payerNote ? `Note from user: ${payerNote}` : '',
    `Bill file (server path): ${billAbsolutePath}`,
  ]
    .filter(Boolean)
    .join('\n');

  if (skipServerEmail) {
    console.info('[premium-payment] skip server email; client mail flow:', requestId);
  } else {
    try {
      const result = await sendTransactionalEmail({
        to: notifyTo,
        replyTo: user.email,
        subject: `[Premium] ${user.email} — ${planCode}`,
        text: textBody,
        attachments: [{ path: billAbsolutePath }],
      });
      if (!result.sent) {
        console.warn(
          '[premium-payment] email not sent (configure RESEND_API_KEY); saved request:',
          requestId
        );
      }
    } catch (e) {
      console.error('[premium-payment] email send failed', e);
    }
  }

  return {
    id: requestId,
    bill_image_public_url: null,
    bill_cdn_url: null,
  };
}

async function submitPremiumPaymentFromMedia({
  userId,
  planCode,
  payerNote,
  billMediaKey,
  billCdnUrl,
  skipServerEmail = true,
}) {
  if (planCode !== '1m' && planCode !== '3m') {
    const err = new Error('plan_code must be 1m or 3m');
    err.status = 400;
    throw err;
  }

  const key = String(billMediaKey || '').trim().replace(/\\/g, '/');
  if (!BILL_MEDIA_KEY_RE.test(key)) {
    const err = new Error('Invalid bill_media_key');
    err.status = 400;
    throw err;
  }

  const cdn = normalizeCdnUrl(billCdnUrl, key);
  const okCdn =
    (key.startsWith('premium-bills/') && cdn.startsWith('/media/static/premium-bills/')) ||
    (key.startsWith('questions/') && cdn.startsWith('/media/static/questions/'));
  if (!okCdn) {
    const err = new Error('bill_cdn_url must match uploaded bill path');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const requestId = await premiumPaymentRepository.insertPremiumPaymentRequest({
    userId,
    planCode,
    payerNote,
    billStoragePath: key,
    billCdnUrl: cdn,
  });

  const notifyTo = process.env.PREMIUM_NOTIFY_EMAIL || 'vietautoescuela@gmail.com';
  const origin = publicOrigin();
  const relCdn = cdn.startsWith('/') ? cdn : `/${cdn}`;
  const billPublicUrl = origin ? `${origin}${relCdn}` : relCdn;

  const textBody = [
    'Premium payment notification (CDN bill)',
    `Request id: ${requestId}`,
    `Bill image (CDN): ${billPublicUrl}`,
    `User id: ${user.id}`,
    `Username: ${user.username}`,
    `Email: ${user.email}`,
    `Plan: ${planCode} (${PLAN_LABELS[planCode]})`,
    payerNote ? `Note from user: ${payerNote}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `<p>Premium payment (CDN bill)</p><p><strong>Request</strong> #${requestId}</p><p><strong>Bill image</strong>: <a href="${billPublicUrl}">${billPublicUrl}</a></p>`;

  if (skipServerEmail) {
    console.info('[premium-payment] skip server email (media flow);', requestId);
  } else {
    try {
      const result = await sendTransactionalEmail({
        to: notifyTo,
        replyTo: user.email,
        subject: `[Premium] ${user.email} — ${planCode}`,
        text: textBody,
        html: htmlBody,
      });
      if (!result.sent) {
        console.warn(
          '[premium-payment] email not sent (configure RESEND_API_KEY); saved CDN request:',
          requestId
        );
      }
    } catch (e) {
      console.error('[premium-payment] email send failed', e);
    }
  }

  return {
    id: requestId,
    bill_cdn_url: cdn,
    bill_image_public_url: origin ? billPublicUrl : null,
  };
}

module.exports = { submitPremiumPaymentRequest, submitPremiumPaymentFromMedia };
