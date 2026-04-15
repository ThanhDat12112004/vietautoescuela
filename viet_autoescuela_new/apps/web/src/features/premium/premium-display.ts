import type { I18nKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';
import { userHasPremium, type AuthUser } from '@/lib/auth';

const MS_PER_DAY = 86_400_000;

/** Mã gói lưu trong DB/API (`1m` / `3m`). */
export type StoredPremiumPlanCode = '1m' | '3m';

export type DisplayPremiumPlan = StoredPremiumPlanCode | 'unknown' | 'none';

export function normalizePremiumPlanCode(raw: string | null | undefined): DisplayPremiumPlan {
  const s = String(raw || '').trim().toLowerCase();
  if (s === '1m') return '1m';
  if (s === '3m') return '3m';
  if (!s || s === 'none') return 'none';
  return 'unknown';
}

/** Số ngày còn lại (làm tròn lên theo chu kỳ 24h) — phù hợp hiển thị “còn X ngày”. */
export function wholeCalendarDaysLeft(
  premiumUntilIso: string | null | undefined,
  nowMs = Date.now()
): number {
  if (!premiumUntilIso) return 0;
  const until = new Date(premiumUntilIso).getTime();
  if (!Number.isFinite(until) || until <= nowMs) return 0;
  return Math.ceil((until - nowMs) / MS_PER_DAY);
}

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return String(user?.role || '').toLowerCase() === 'admin';
}

export type PremiumToolbarState =
  | { kind: 'hidden' }
  | { kind: 'learner'; plan: DisplayPremiumPlan; daysLeft: number; untilIso: string };

/**
 * Navbar / hồ sơ: không hiện nhãn Premium cho admin; chỉ học viên gói nâng cao còn hạn
 * (≥1 ngày theo lịch) mới thấy badge — nội dung hiển thị là ngày hết hạn (format theo locale).
 */
export function getPremiumToolbarState(
  user: AuthUser | null | undefined,
  nowMs = Date.now()
): PremiumToolbarState {
  if (!user) return { kind: 'hidden' };
  if (isAdminUser(user)) return { kind: 'hidden' };
  if (!userHasPremium(user)) return { kind: 'hidden' };
  const daysLeft = wholeCalendarDaysLeft(user.premium_until ?? null, nowMs);
  if (daysLeft < 1) return { kind: 'hidden' };
  return {
    kind: 'learner',
    plan: normalizePremiumPlanCode(user.premium_plan),
    daysLeft,
    untilIso: String(user.premium_until || ''),
  };
}

/** Ngày hết hạn gói nâng cao (chỉ ngày), theo ngôn ngữ giao diện. */
export function formatPremiumUntilNav(iso: string | null | undefined, lang: Language): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const locale = lang === 'vi' ? 'vi-VN' : lang === 'es' ? 'es-ES' : 'en-US';
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatPremiumPlanDuration(
  tk: (key: I18nKey) => string,
  plan: DisplayPremiumPlan
): string {
  if (plan === '1m') return tk('premium.duration1Month');
  if (plan === '3m') return tk('premium.duration3Months');
  return tk('premium.durationActiveGeneric');
}
