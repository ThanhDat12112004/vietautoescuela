const { z } = require('zod');

const MIN_LEN = 8;
const MAX_LEN = 128;

function isStrongPassword(s) {
  if (typeof s !== 'string' || s.length < MIN_LEN || s.length > MAX_LEN) return false;
  if (!/[a-zA-Z]/.test(s)) return false;
  if (!/[0-9]/.test(s)) return false;
  return true;
}

/** Dùng cho register / reset / đổi mật khẩu. */
const strongPasswordSchema = z
  .string()
  .min(MIN_LEN, { message: `Password must be at least ${MIN_LEN} characters` })
  .max(MAX_LEN, { message: `Password must be at most ${MAX_LEN} characters` })
  .refine(isStrongPassword, {
    message: 'Password must include at least one letter and one number',
  });

module.exports = {
  MIN_LEN,
  MAX_LEN,
  isStrongPassword,
  strongPasswordSchema,
};
