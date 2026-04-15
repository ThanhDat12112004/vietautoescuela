import { tKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

/** Nhãn gói hiển thị cho admin (đồng bộ với trang Premium / hồ sơ học viên). */
export function adminPremiumPlanLabel(lang: Language, planCode: string | null | undefined): string {
  const c = String(planCode || '').trim().toLowerCase();
  if (c === '1m') return tKey(lang, 'premium.duration1Month');
  if (c === '3m') return tKey(lang, 'premium.duration3Months');
  if (!c) return '—';
  return String(planCode).trim() || '—';
}

/** Nhãn trạng thái đơn (đã dịch). */
export function adminPremiumStatusLabel(lang: Language, status: string): string {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'pending') return tKey(lang, 'adminUi.premium_req_pending');
  if (s === 'approved') return tKey(lang, 'adminUi.premium_req_approved');
  if (s === 'rejected') return tKey(lang, 'adminUi.premium_req_rejected');
  return status;
}

export type PremiumRequestUiStatus = 'pending' | 'approved' | 'rejected' | 'other';

export function toPremiumRequestUiStatus(status: string): PremiumRequestUiStatus {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'pending' || s === 'approved' || s === 'rejected') return s;
  return 'other';
}
