const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const googleOauthService = require('../services/google-oauth.service');

function frontendBase() {
  return (process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function safeLocale(v) {
  const s = String(v || 'vi').toLowerCase();
  if (s === 'es' || s === 'en') return s;
  return 'vi';
}

const FALLBACK_LOCALE = 'vi';

function isGoogleOAuthConfigured() {
  return Boolean(
    String(process.env.GOOGLE_CLIENT_ID || '').trim() &&
      String(process.env.GOOGLE_CLIENT_SECRET || '').trim() &&
      String(process.env.GOOGLE_OAUTH_REDIRECT_URI || '').trim()
  );
}

/** Trả về cho frontend có nên hiện nút “Đăng nhập Google” hay không (không lộ secret). */
function status(_req, res) {
  res.json({ configured: isGoogleOAuthConfigured() });
}

function start(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server misconfiguration' });
    }
    const locale = safeLocale(req.query.locale);
    const state = jwt.sign({ locale, n: randomUUID() }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const url = googleOauthService.buildGoogleAuthUrl(state);
    if (!url) {
      return res.status(503).json({ message: 'Google sign-in is not configured' });
    }
    return res.redirect(302, url);
  } catch (e) {
    return next(e);
  }
}

async function callback(req, res) {
  const base = frontendBase();
  let locale = FALLBACK_LOCALE;

  try {
    const stateRaw = String(req.query.state || '').trim();
    try {
      const payload = googleOauthService.verifyOAuthState(stateRaw);
      locale = safeLocale(payload.locale);
    } catch {
      return res.redirect(302, `${base}/${FALLBACK_LOCALE}/auth/callback#error=invalid_state`);
    }

    const errParam = String(req.query.error || '').trim();
    if (errParam) {
      return res.redirect(302, `${base}/${locale}/auth/callback#error=oauth_denied`);
    }

    const code = String(req.query.code || '').trim();
    if (!code) {
      return res.redirect(302, `${base}/${locale}/auth/callback#error=missing_code`);
    }

    const tokens = await googleOauthService.exchangeCodeForTokens(code);
    if (!tokens.access_token) {
      return res.redirect(302, `${base}/${locale}/auth/callback#error=no_access_token`);
    }

    const profile = await googleOauthService.fetchGoogleProfile(tokens.access_token);
    const { token } = await googleOauthService.signInOrRegisterWithGoogle(profile);

    return res.redirect(
      302,
      `${base}/${locale}/auth/callback#token=${encodeURIComponent(token)}`
    );
  } catch (e) {
    const msg = encodeURIComponent(
      String(e.message || 'oauth_error')
        .slice(0, 100)
        .replace(/\s+/g, '_')
    );
    return res.redirect(302, `${base}/${locale}/auth/callback#error=${msg}`);
  }
}

module.exports = { start, callback, status };
