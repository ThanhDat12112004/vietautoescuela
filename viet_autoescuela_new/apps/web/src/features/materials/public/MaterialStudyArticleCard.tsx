'use client';

import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';
import { ArrowRight, Lock } from 'lucide-react';

export type MaterialStudyArticleCardProps = {
  title: string;
  description: string;
  topicGroupLabel: string;
  subjectName: string;
  readHref: string;
  locked: boolean;
  /** Ảnh minh họa (đường dẫn public), ví dụ `/brand/materials-illustration.png`. */
  illustrationSrc: string;
  /** Nhãn “Nâng cao” khi mục thuộc gói premium (hiển thị cả khi user đã mở khóa). */
  tierAdvancedLabel?: string | null;
  readArticleLabel: string;
  lockedCtaLabel: string;
  lockedHintLabel?: string;
  noDescriptionLabel: string;
  /** Giảm padding trên khi là item đầu ngay dưới breadcrumb (danh sách tài liệu). */
  tightTop?: boolean;
};

/**
 * Thẻ mục trong danh sách tài liệu — có cột minh họa + mô tả rút gọn.
 */
export function MaterialStudyArticleCard({
  title,
  description,
  topicGroupLabel,
  subjectName,
  readHref,
  locked,
  illustrationSrc,
  tierAdvancedLabel,
  readArticleLabel,
  lockedCtaLabel,
  lockedHintLabel,
  noDescriptionLabel,
  tightTop = false,
}: MaterialStudyArticleCardProps) {
  const raw = description?.trim();
  const excerpt = raw || noDescriptionLabel;

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-none border border-[#e8d0d6] bg-gradient-to-br from-white via-white to-[#fff6f8]',
        'shadow-[0_2px_12px_rgba(122,32,56,0.06)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_28px_rgba(122,32,56,0.1)]',
        locked && 'bg-white'
      )}
    >
      {locked ? (
        <div className="pointer-events-none absolute right-2 top-2 z-[2] inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-amber-900 shadow-sm">
          <Lock className="h-3 w-3" aria-hidden />
          {tierAdvancedLabel || 'Premium'}
        </div>
      ) : null}
      {locked ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.16]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, rgba(217,119,6,0.2) 0 8px, rgba(217,119,6,0.05) 8px 16px)',
          }}
        />
      ) : null}
      <div
        className={cn(
          /* self-stretch + min-h-0: cột ảnh cao bằng cột chữ; khung flex-1 để max-h-full trên ảnh luôn vừa khung */
          'flex flex-col sm:flex-row sm:items-stretch',
          locked && 'select-none saturate-[0.95]'
        )}
      >
        <div
          className={cn(
            'relative flex w-full shrink-0 flex-col',
            'aspect-[5/3] sm:aspect-auto sm:min-h-0 sm:w-[196px] sm:max-w-[196px] sm:self-stretch',
            'md:w-[208px] md:max-w-[208px]'
          )}
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8f223d]/[0.07] via-[#fff4f7] to-primary/[0.04]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90" />
          <div
            className={cn(
              'relative z-[1] flex min-h-0 w-full flex-1 flex-col justify-end px-3 pb-4 sm:pb-5',
              tightTop ? 'pt-2 sm:pt-2' : 'pt-3 sm:pt-4'
            )}
          >
            <img
              src={illustrationSrc}
              alt=""
              width={200}
              height={200}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full max-w-[min(11.5rem,88vw)] max-h-[min(10.5rem,48vw)] object-contain object-bottom drop-shadow-[0_4px_14px_rgba(45,24,36,0.1)] sm:max-h-full sm:max-w-[min(11.75rem,100%)]"
            />
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col border-t border-[#f0e3e7] sm:border-l sm:border-t-0 sm:py-1">
          <div
            className={cn(
              'flex flex-col px-4 pb-4 sm:px-5 sm:pb-5',
              tightTop ? 'pt-1.5 sm:pt-2' : 'pt-3 sm:pt-5'
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:text-[11px]">
              <span className="text-[#7a2038]">{topicGroupLabel}</span>
              <span className="text-[#e8d0d6]" aria-hidden>
                /
              </span>
              <span className="text-foreground/70">{subjectName}</span>
              {tierAdvancedLabel ? (
                <span className="rounded-md border border-amber-800/20 bg-amber-50/95 px-2 py-px text-[9px] font-bold tracking-wide text-amber-950 shadow-sm">
                  {tierAdvancedLabel}
                </span>
              ) : null}
            </div>

            <h3 className="font-display mt-2.5 text-lg font-bold leading-snug tracking-tight text-[#4a1526] sm:mt-3 sm:text-xl">
              {title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/72 sm:line-clamp-3 sm:text-[15px]">
              {excerpt}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f5e8ec] pt-4">
              {locked ? (
                <LocaleLink href={APP_ROUTES.PREMIUM} className="mr-auto block w-full max-w-[18rem]">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-full rounded-md border-2 border-amber-300/85 bg-amber-50 text-[12px] font-semibold text-amber-900 shadow-sm hover:border-amber-400 hover:bg-amber-100/90 focus-visible:ring-amber-500/40 sm:text-[13px]"
                    aria-label={lockedCtaLabel}
                  >
                    <Lock className="mr-1 h-3.5 w-3.5" aria-hidden />
                    {lockedCtaLabel}
                  </Button>
                </LocaleLink>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-auto gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-[#7a2038] hover:bg-[#fff4f7] hover:text-[#5a1428] sm:text-[15px]"
                >
                  <LocaleLink href={readHref}>
                    {readArticleLabel}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </LocaleLink>
                </Button>
              )}
              {locked && lockedHintLabel ? (
                <p className="text-[11px] font-semibold text-amber-900/85">{lockedHintLabel}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
