/** Giá trị cho `<input type="datetime-local" />` theo giờ máy. */
export function dateToPremiumDatetimeLocal(d: Date): string {
  if (!Number.isFinite(d.getTime())) return '';
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

export function premiumUntilForDatetimeLocal(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return '';
  return dateToPremiumDatetimeLocal(d);
}

export function premiumUntilFromDatetimeLocal(value: string) {
  const s = value.trim();
  if (!s) return null;
  const d = new Date(s);
  if (!Number.isFinite(d.getTime())) return null;
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
}

/**
 * Nâng cấp thủ công: gói 1m/3m + ngày hết = **từ hôm nay** + số tháng (không cộng dồn lên hạn Premium cũ).
 * Admin vẫn có thể sửa trước khi Lưu.
 */
export function buildManualPremiumBoost(plan: '1m' | '3m'): {
  premium_plan: '1m' | '3m';
  premium_until: string;
} {
  const months = plan === '1m' ? 1 : 3;
  const now = new Date();
  const until = new Date(now.getTime());
  until.setMonth(until.getMonth() + months);
  return { premium_plan: plan, premium_until: dateToPremiumDatetimeLocal(until) };
}
