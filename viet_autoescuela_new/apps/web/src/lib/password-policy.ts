/** Khớp quy tắc `services/user-service/src/validators/password-policy.js` */

export const PASSWORD_MIN_LEN = 8;
export const PASSWORD_MAX_LEN = 128;

export function isStrongPassword(value: string): boolean {
  if (value.length < PASSWORD_MIN_LEN || value.length > PASSWORD_MAX_LEN) return false;
  if (!/[a-zA-Z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  return true;
}

/** Username đăng ký: chữ, số, . _ - */
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function isValidRegisterUsername(value: string): boolean {
  const t = value.trim();
  return t.length >= 3 && t.length <= 50 && USERNAME_PATTERN.test(t);
}
