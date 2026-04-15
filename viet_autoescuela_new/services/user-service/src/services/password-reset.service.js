const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const passwordResetRepository = require('../repositories/password-reset.repository');
const { sendTransactionalEmail } = require('../utils/mail');

const GENERIC_OK = {
  ok: true,
  message: 'If an account exists with this email, we sent reset instructions.',
};

function normalizeLocale(loc) {
  const s = String(loc || 'vi').toLowerCase();
  if (s === 'es' || s === 'en') return s;
  return 'vi';
}

async function requestPasswordReset(emailRaw, localeRaw) {
  const email = String(emailRaw || '').trim().toLowerCase();
  const locale = normalizeLocale(localeRaw);

  if (!email) {
    return GENERIC_OK;
  }

  const user = await userRepository.findUserByEmail(email);
  if (!user || !user.is_active) {
    return GENERIC_OK;
  }

  if (!user.password_hash && user.google_sub) {
    const googleHint = await sendTransactionalEmail({
      to: email,
      subject: '[Viet Autoescuela] Sign-in',
      text:
        'Your account uses Google sign-in. Please use "Continue with Google" on the login page instead of a password reset.',
    });
    if (!googleHint.sent) {
      console.error('[password-reset] Google-only user hint email not sent:', googleHint);
    }
    return GENERIC_OK;
  }

  if (!user.password_hash) {
    return GENERIC_OK;
  }

  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await passwordResetRepository.deleteTokensForUser(user.id);
  await passwordResetRepository.insertToken({ userId: user.id, tokenHash, expiresAt });

  const base = (
    process.env.FRONTEND_PUBLIC_URL ||
    process.env.PUBLIC_WEB_ORIGIN ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
  const link = `${base}/${locale}/reset-password?token=${encodeURIComponent(raw)}`;

  const mailResult = await sendTransactionalEmail({
    to: email,
    subject: '[Viet Autoescuela] Reset your password',
    text: `Set a new password (link valid 1 hour):\n\n${link}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Set a new password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`,
  });
  if (!mailResult.sent) {
    console.error('[password-reset] Reset email not sent:', {
      to: email,
      reason: mailResult.reason,
      error: mailResult.error,
      hint:
        mailResult.reason === 'not_configured'
          ? 'Set RESEND_API_KEY in .env (monorepo root) and restart user-service.'
          : 'Resend: check dashboard logs; with onboarding@resend.dev you can only send to verified/test recipient emails.',
    });
  }

  return GENERIC_OK;
}

async function resetPasswordWithToken(tokenRaw, newPassword) {
  const raw = String(tokenRaw || '').trim();
  if (!raw) {
    const err = new Error('Invalid or expired token');
    err.status = 400;
    throw err;
  }

  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const row = await passwordResetRepository.findValidByTokenHash(tokenHash);
  if (!row) {
    const err = new Error('Invalid or expired token');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.setPasswordHash(row.user_id, passwordHash);
  await passwordResetRepository.markUsed(row.id);
  await passwordResetRepository.deleteTokensForUser(row.user_id);

  return { ok: true, message: 'Password updated. You can sign in now.' };
}

module.exports = { requestPasswordReset, resetPasswordWithToken, normalizeLocale };
