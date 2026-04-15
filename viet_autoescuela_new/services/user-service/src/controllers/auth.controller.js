const authService = require('../services/auth.service');
const userRepository = require('../repositories/user.repository');
const jwt = require('jsonwebtoken');
const passwordResetService = require('../services/password-reset.service');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');
const { validateOrThrow } = require('../utils/validate');
const { subscribeSession } = require('../utils/session-stream');

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment');
}

async function register(req, res, next) {
  try {
    const payload = validateOrThrow(registerSchema, req.body);
    const result = await authService.register(payload);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = validateOrThrow(loginSchema, req.body);
    const result = await authService.login(payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

/** JWT + session hợp lệ; trả về user đầy đủ (OAuth callback dùng token mới). */
async function sessionPing(req, res, next) {
  try {
    const user = await userRepository.findUserById(req.user.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.json({ ok: true, user: authService.mapUserResponse(user) });
  } catch (e) {
    return next(e);
  }
}

async function sessionStream(req, res) {
  const token = String(req.query?.token || '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.sid) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const unsubscribe = subscribeSession(payload.sid, res);
    req.on('close', () => {
      unsubscribe();
    });

    return undefined;
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function updateMyAvatar(req, res, next) {
  try {
    const avatarUrl = String(req.body?.avatar_url || '').trim();
    if (!avatarUrl) {
      return res.status(400).json({ message: 'avatar_url is required' });
    }

    const result = await authService.updateMyAvatar(req.user.id, avatarUrl);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const payload = validateOrThrow(updateProfileSchema, req.body || {});
    const result = await authService.updateMyProfile(req.user.id, payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const payload = validateOrThrow(forgotPasswordSchema, req.body || {});
    const result = await passwordResetService.requestPasswordReset(payload.email, payload.locale);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const payload = validateOrThrow(resetPasswordSchema, req.body || {});
    const result = await passwordResetService.resetPasswordWithToken(
      payload.token,
      payload.new_password
    );
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  sessionPing,
  sessionStream,
  updateMyAvatar,
  updateMyProfile,
  forgotPassword,
  resetPassword,
};
