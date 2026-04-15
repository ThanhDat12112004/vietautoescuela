/** Email hỗ trợ / premium (mailto, footer, liên hệ). Mặc định vietautoescuela@gmail.com */
const DEFAULT_SUPPORT_EMAIL = 'vietautoescuela@gmail.com';

function readEnv(...keys: string[]): string {
  if (typeof process === 'undefined') return '';
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return '';
}

/** Hộp thư nhận đơn Premium — ưu tiên NEXT_PUBLIC_PREMIUM_INBOX_EMAIL. */
export function getPremiumInboxEmail(): string {
  return readEnv('NEXT_PUBLIC_PREMIUM_INBOX_EMAIL', 'NEXT_PUBLIC_CONTACT_EMAIL') || DEFAULT_SUPPORT_EMAIL;
}

/** Email liên hệ (footer, menu nổi) — ưu tiên NEXT_PUBLIC_CONTACT_EMAIL. */
export function getContactEmail(): string {
  return readEnv('NEXT_PUBLIC_CONTACT_EMAIL', 'NEXT_PUBLIC_PREMIUM_INBOX_EMAIL') || DEFAULT_SUPPORT_EMAIL;
}

/** `mailto:` an toàn — percent-encode (RFC 6068). Không dùng URLSearchParams: toString() dùng `+` cho space, nhiều client mail hiển thị sai. */
export function buildMailtoHref(to: string, params?: { subject?: string; body?: string }): string {
  const addr = String(to || '')
    .trim()
    .replace(/^mailto:/i, '');
  if (!addr) return '#';
  const parts: string[] = [];
  if (params?.subject) parts.push(`subject=${encodeURIComponent(params.subject)}`);
  if (params?.body) parts.push(`body=${encodeURIComponent(params.body)}`);
  const qs = parts.join('&');
  return qs ? `mailto:${addr}?${qs}` : `mailto:${addr}`;
}
