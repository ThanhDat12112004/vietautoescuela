'use client';

import { useLanguage } from '@/hooks/useLanguage';

type LegalHubStripProps = {
  /** Tiêu đề trang hiện tại (giống hero Tài liệu). */
  pageTitle: string;
  /** Mô tả ngắn dưới tiêu đề. */
  pageSubtitle: string;
};

export function LegalHubStrip({ pageTitle, pageSubtitle }: LegalHubStripProps) {
  const { tk } = useLanguage();

  return (
    <div className="w-full border-b-2 border-primary/25 bg-card">
      <div className="w-full px-3 py-5 sm:px-4 md:py-6 lg:px-5">
        <div className="max-w-3xl border-l-[3px] border-primary/60 pl-3 sm:pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
            {tk('footer.legalEyebrow')}
          </p>
          <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
            {pageSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
