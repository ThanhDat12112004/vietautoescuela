'use client';

import { Medal } from '@/components/brand';
import { formatPremiumUntilNav, premiumVipLearnerBox, usePremiumToolbarState } from '@/features/premium';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

/**
 * Nhãn gói nâng cao trong navbar (học viên Premium còn hạn): chỉ ngày hết hạn, theo locale.
 * Admin không thấy badge này.
 */
export function PremiumNavbarBadge({ className }: { className?: string }) {
  const { lang } = useLanguage();
  const state = usePremiumToolbarState();

  if (state.kind !== 'learner') return null;

  const dateLabel = formatPremiumUntilNav(state.untilIso, lang);

  return (
    <div
      className={cn(
        'inline-flex max-w-[min(11rem,42vw)] shrink-0 items-center gap-1 px-2 py-1 sm:max-w-[14rem]',
        premiumVipLearnerBox,
        className
      )}
      role="status"
      title={dateLabel}
    >
      <Medal className="h-3.5 w-3.5 shrink-0 text-[#8a6a0a]" aria-hidden />
      <span className="truncate text-[10px] font-bold tabular-nums leading-tight sm:text-[11px]">
        {dateLabel}
      </span>
    </div>
  );
}
