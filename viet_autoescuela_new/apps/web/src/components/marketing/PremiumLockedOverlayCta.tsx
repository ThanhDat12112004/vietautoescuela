'use client';

import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Vàng Premium gọn — gradient nhẹ, viền đồng, không glow/blur ngoài nút. */
const premiumCtaButtonClassName = cn(
  'relative h-10 min-w-[9.5rem] rounded-lg border border-amber-700/55',
  'bg-gradient-to-b from-[#fff9e6] via-[#f0d78c] to-[#c9a227]',
  'px-5 text-[12px] font-bold uppercase tracking-[0.07em] text-[#3d2f0f]',
  'shadow-[0_2px_0_0_rgba(160,110,20,0.35),0_4px_12px_rgba(90,60,10,0.12)]',
  'transition-all duration-200 hover:border-amber-800/60',
  'hover:from-[#fffbed] hover:via-[#f5e19a] hover:to-[#d4ae32] hover:text-[#2a2008]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/45 focus-visible:ring-offset-2'
);

const overlayByVariant = {
  /** Nền thẻ có màu (vd. cột đề) — lớp trắng mờ. */
  frost: 'bg-gradient-to-b from-white/40 via-white/28 to-white/38 backdrop-blur-[2px]',
  /** Nền thẻ trắng — lớp burgundy rất nhẹ để vẫn “thấy mờ” ảnh + chữ, không bị sương trắng đục. */
  veil: 'bg-[#3d0f1c]/[0.14] backdrop-blur-[2px] sm:bg-[#3d0f1c]/[0.12] sm:backdrop-blur-[3px]',
} as const;

export type PremiumGoldCtaLinkProps = {
  label: string;
  ariaLabel?: string;
  className?: string;
};

export function PremiumGoldCtaLink({ label, ariaLabel = label, className }: PremiumGoldCtaLinkProps) {
  return (
    <LocaleLink href={APP_ROUTES.PREMIUM} className={cn('inline-flex', className)} aria-label={ariaLabel}>
      <Button size="sm" variant="ghost" className={premiumCtaButtonClassName}>
        {label}
      </Button>
    </LocaleLink>
  );
}

export type PremiumLockedOverlayCtaProps = {
  label: string;
  ariaLabel?: string;
  className?: string;
  /** `veil` cho thẻ nền trắng (Tài liệu); `frost` mặc định cho Bài thi. */
  variant?: keyof typeof overlayByVariant;
  children?: ReactNode;
};

export function PremiumLockedOverlayCta({
  label,
  ariaLabel = label,
  className,
  variant = 'frost',
  children,
}: PremiumLockedOverlayCtaProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4',
        overlayByVariant[variant],
        className
      )}
    >
      <PremiumGoldCtaLink label={label} ariaLabel={ariaLabel} className="pointer-events-auto shadow-sm" />
      {children}
    </div>
  );
}
