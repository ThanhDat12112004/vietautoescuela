/** Cờ premium từ API (boolean / 0-1 / chuỗi) — đồng bộ toàn app. */
export function isPremiumContentFlag(v: boolean | number | string | null | undefined): boolean {
  if (v === true || v === 1 || v === '1') return true;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    return t === 'true' || t === 'premium' || t === 'yes';
  }
  return false;
}
