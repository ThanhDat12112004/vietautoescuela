'use client';

import { Footer, Navbar } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/** Rộng tối đa khung nội dung (bài + cột phụ bên phải từ `lg`). */
const CONTENT_MAX = 'max-w-[min(100%,92rem)]';

/** Tiêu đề bài + mô tả (eyebrow tùy chọn — trang post tài liệu không dùng để tránh lặp “Tài liệu”). */
export type MaterialStudyPostHero = {
  eyebrow?: string;
  title: string;
  lead: string | null;
};

type MaterialStudyPostLayoutProps = {
  backLabel: string;
  metaLine?: string | null;
  children: ReactNode;
  asideStart?: ReactNode;
  asideEnd?: ReactNode;
  /** Khi có: hàng 1 = nút + breadcrumb; hàng 2 = tiêu đề; hàng 3 = mô tả (không lặp nhãn “Tài liệu”). */
  postHero?: MaterialStudyPostHero | null;
};

export function MaterialStudyPostLayout({
  backLabel,
  metaLine,
  children,
  asideStart,
  asideEnd,
  postHero,
}: MaterialStudyPostLayoutProps) {
  const hasStart = Boolean(asideStart);
  const hasEnd = Boolean(asideEnd);
  const richHeader = Boolean(postHero);

  const mainSpan = cn(
    hasStart && hasEnd && 'lg:col-span-6 xl:col-span-7',
    hasStart && !hasEnd && 'lg:col-span-9',
    !hasStart && !hasEnd && 'lg:col-span-12'
  );

  /** Không gap ngang — phân cách bằng viền dọc (|) giữa các cột từ `lg`. */
  const gridTight = 'gap-0';

  /** Cột trái (menu): vạch phải + padding. Hai cột bài|sidebar: sát mép, chỉ một đường border-l ở sidebar. */
  const sepStartCol = 'lg:border-r lg:border-border lg:pr-2';
  const sepAfterLeftRule = 'lg:pl-2';
  /** Bài không có padding phải — khối nội dung dính vạch dọc. */
  const sepMainFlushRight = 'lg:pr-0';
  /** Viền dọc trên cột sidebar — full chiều cao ô grid / flex (stretch + min-h-full ở layout 2 cột). */
  const sepEndCol = 'lg:flex lg:min-h-0 lg:min-w-0 lg:flex-col lg:self-stretch lg:border-l lg:border-border lg:pl-0';

  /** Cột trái / menu dài: sticky + cuộn trong khung. */
  const stickyWrap = 'lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100vh-6rem)] lg:min-h-0 lg:flex-1 lg:overflow-y-auto';
  /** Cột “Tài liệu cùng chủ đề” trong layout 3 cột: sticky; cột ngoài đã stretch để vạch | full cao. */
  const stickyEndAsideWrap =
    'lg:sticky lg:top-[5.5rem] lg:min-h-0 lg:w-full lg:self-start lg:overflow-visible';
  /** Hai cột bài|sidebar: không sticky — cuộn theo trang; wrapper chỉ giữ min-width cho chữ. */
  const endAsideInner = 'w-full min-w-0';
  /** Sidebar sát vạch dọc trái và mép phải cột (không lệch padding ngang). */
  const stickyEndPad = 'lg:pl-0 lg:pr-0';

  return (
    <div className="app-page flex min-h-screen flex-col bg-background">
      <Navbar />

      <header
        className={cn(
          'bg-card',
          richHeader ? 'border-b border-primary/20' : 'border-b border-border'
        )}
      >
        <div className={cn('mx-auto w-full', CONTENT_MAX)}>
          <div className="flex flex-col gap-1 px-2 py-2 sm:gap-1.5 sm:px-2 lg:px-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-2.5">
              <Button
                asChild
                variant="outline"
                size="default"
                className="h-9 min-h-9 shrink-0 gap-2 rounded-lg border-primary/25 bg-card px-3 text-[14px] font-semibold text-brand-ink shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/50 hover:text-brand-heading sm:h-10 sm:px-3.5 sm:text-[15px]"
              >
                <LocaleLink href={APP_ROUTES.MATERIALS}>
                  <ArrowLeft className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {backLabel}
                </LocaleLink>
              </Button>

              {metaLine ? (
                <>
                  <span
                    className="hidden h-4 w-px shrink-0 bg-border sm:block"
                    aria-hidden
                  />
                  <p className="max-w-[min(100%,32rem)] text-[11px] font-bold uppercase leading-snug tracking-[0.07em] text-foreground/88 sm:text-[13px] sm:tracking-[0.08em]">
                    {metaLine}
                  </p>
                </>
              ) : null}
            </div>

            {postHero ? (
              <div className="min-w-0">
                <h1 className="font-display text-[1.35rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.55rem] md:text-[1.75rem]">
                  {postHero.title}
                </h1>
                {postHero.lead ? (
                  <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                    {postHero.lead}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-2 sm:px-2 lg:px-2',
          richHeader ? 'bg-card pb-4 pt-0 sm:pb-5' : 'bg-background py-3 sm:py-4',
          CONTENT_MAX
        )}
      >
        {hasStart || hasEnd ? (
          hasStart ? (
            <div className={cn('grid grid-cols-1 lg:grid-cols-12 lg:items-stretch', gridTight)}>
              <div className={cn('order-3 lg:order-1 lg:col-span-3 xl:col-span-2', sepStartCol)}>
                <div className={cn(stickyWrap, 'lg:h-full')}>{asideStart}</div>
              </div>
              <div
                className={cn(
                  'order-1 min-w-0',
                  mainSpan,
                  sepAfterLeftRule,
                  hasEnd && sepMainFlushRight
                )}
              >
                {children}
              </div>
              {hasEnd ? (
                <div className={cn('order-2 lg:order-3 lg:col-span-3 xl:col-span-3', sepEndCol)}>
                  <div className={cn(stickyEndAsideWrap, stickyEndPad)}>{asideEnd}</div>
                </div>
              ) : null}
            </div>
          ) : hasEnd ? (
            <div className="flex min-h-0 flex-col gap-0 lg:flex-row lg:items-stretch">
              <div className={cn('min-w-0 w-full flex-1 basis-0', sepMainFlushRight)}>
                {children}
              </div>
              <aside
                className={cn(
                  'min-w-0 w-full border-t border-border lg:mt-0 lg:min-h-full lg:max-w-[min(32%,24rem)] lg:shrink-0 lg:basis-[min(32%,24rem)] lg:self-stretch lg:border-t-0',
                  sepEndCol
                )}
              >
                <div className={cn(endAsideInner, 'flex h-full min-h-0 flex-col', stickyEndPad)}>
                  {asideEnd}
                </div>
              </aside>
            </div>
          ) : (
            children
          )
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
}
