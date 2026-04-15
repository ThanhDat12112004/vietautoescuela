const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const authService = require('./auth.service');

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

async function exchangeCodeForTokens(code) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    const err = new Error('Google OAuth is not configured');
    err.status = 503;
    throw err;
  }

  const body = new URLSearchParams({
    code: String(code),
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const t = await res.text();
    const err = new Error(`Google token exchange failed`);
    err.status = 502;
    err.detail = t;
    throw err;
  }

  return res.json();
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = new Error('Google userinfo failed');
    err.status = 502;
    throw err;
  }
  return res.json();
}

async function pickUsernameFromEmail(email) {
  const localPart = String(email || '').split('@')[0] || 'user';
  const base = localPart.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40) || 'user';
  let candidate = base;
  let n = 0;
  while (await userRepository.isUsernameTaken(candidate)) {
    n += 1;
    candidate = `${base}${n}`.slice(0, 50);
  }
  return candidate;
}

function normalizeGoogleAvatarUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  if (raw.startsWith('//')) {
    return `https:${raw}`;
  }

  if (/^ttps?:\/\//i.test(raw)) {
    return `h${raw}`;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (/^lh\d+\.googleusercontent\.com\//i.test(raw)) {
    return `https://${raw}`;
  }

  return raw;
}

/**
 * profile: { id, email, name, picture } from Google userinfo
 */
async function signInOrRegisterWithGoogle(profile) {
  const googleSub = String(profile.id || '').trim();
  const email = String(profile.email || '').trim().toLowerCase();
  const fullName = String(profile.name || '').trim() || null;
  const avatarUrl = normalizeGoogleAvatarUrl(profile.picture);
  if (!googleSub || !email) {
    const err = new Error('Google account missing email');
    err.status = 400;
    throw err;
  }

  let user = await userRepository.findUserByGoogleSub(googleSub);
  if (user) {
    if (!user.is_active) {
      const err = new Error('Account is disabled');
      err.status = 403;
      throw err;
    }
    await userRepository.updateGoogleProfileFields(user.id, { fullName, avatarUrl });
    return authService.createSessionForUser(user);
  }

  const byEmail = await userRepository.findUserByEmail(email);
  if (byEmail) {
    if (!byEmail.is_active) {
      const err = new Error('Account is disabled');
      err.status = 403;
      throw err;
    }
    if (byEmail.google_sub && byEmail.google_sub !== googleSub) {
      const err = new Error('Email already linked to another Google account');
      err.status = 409;
      throw err;
    }
    if (!byEmail.google_sub) {
      await userRepository.linkGoogleSub(byEmail.id, googleSub);
    }
    await userRepository.updateGoogleProfileFields(byEmail.id, { fullName, avatarUrl });
    user = await userRepository.findUserByGoogleSub(googleSub);
    return authService.createSessionForUser(user);
  }

  const username = await pickUsernameFromEmail(email);

  await userRepository.createGoogleUser({
    username,
    email,
    googleSub,
    fullName,
    avatarUrl,
  });

  user = await userRepository.findUserByGoogleSub(googleSub);
  return authService.createSessionForUser(user);
}

function buildGoogleAuthUrl(state) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return null;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function verifyOAuthState(stateToken) {
  return jwt.verify(String(stateToken || ''), process.env.JWT_SECRET);
}

module.exports = {
  exchangeCodeForTokens,
  fetchGoogleProfile,
  signInOrRegisterWithGoogle,
  buildGoogleAuthUrl,
  verifyOAuthState,
};
