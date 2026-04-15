'use client';

import { BRAND_LOGO_IMAGE_SRC } from '@/components/brand';
import { Footer, Navbar } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { getLeaderboard as getLeaderboardStats } from '@/lib/api/quiz';
import { resolveMediaUrl } from '@/lib/api/upload';
import type { LeaderboardPeriod, LeaderboardUser } from '@/lib/api/types';
import { useLanguage } from '@/hooks/useLanguage';
import { getStoredAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { LocaleLink } from '@/components/navigation';

const RANK_BADGE_SVG: Record<number, string> = {
  1: '/brand/rank-top-1.svg',
  2: '/brand/rank-top-2.svg',
  3: '/brand/rank-top-3.svg',
  4: '/brand/rank-top-4.svg',
  5: '/brand/rank-top-5.svg',
};

/** Nền SVG full-width cho từng hàng top 1–5 */
const RANK_ROW_BG_SVG: Record<number, string> = {
  1: '/brand/rank-row-bg-1.svg',
  2: '/brand/rank-row-bg-2.svg',
  3: '/brand/rank-row-bg-3.svg',
  4: '/brand/rank-row-bg-4.svg',
  5: '/brand/rank-row-bg-5.svg',
};

const topRowBorderClass: Record<number, string> = {
  1: 'border-amber-400/55 ring-1 ring-amber-300/30',
  2: 'border-slate-400/55 ring-1 ring-slate-300/35',
  3: 'border-orange-400/50 ring-1 ring-orange-300/28',
  4: 'border-primary/40 ring-1 ring-primary/20',
  5: 'border-slate-500/45 ring-1 ring-slate-400/30',
};

/** Huy chương SVG (top 1–5) hoặc số thứ hạng */
function RankBadge({ rank, compact }: { rank: number; compact?: boolean }) {
  const svgSrc = RANK_BADGE_SVG[rank];

  if (svgSrc) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent shadow-sm ring-2 ring-white/90 dark:ring-border/50',
          compact ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10'
        )}
        aria-label={`#${rank}`}
      >
        <img src={svgSrc} alt="" width={40} height={40} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-bold tabular-nums text-foreground',
        compact ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm sm:h-10 sm:w-10'
      )}
      aria-label={`#${rank}`}
    >
      {rank}
    </div>
  );
}

const Leaderboard = () => {
  const { tk, lang } = useLanguage();
  const [failedAvatarIds, setFailedAvatarIds] = useState<Record<number, true>>({});
  const period: LeaderboardPeriod = 'all';

  const myUserId = getStoredAuth()?.user?.id ?? null;

  const {
    data: rows = [],
    isLoading: loading,
    error: leaderboardError,
  } = useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard', period],
    queryFn: () => getLeaderboardStats(10, period),
    staleTime: 15_000,
  });

  const error = useMemo(
    () =>
      leaderboardError
        ? leaderboardError instanceof Error
          ? formatUserFacingApiError(lang, leaderboardError)
          : tk('leaderboard.loadError')
        : '',
    [leaderboardError, lang, tk]
  );

  /** Ưu tiên họ tên đầy đủ; không có thì username */
  const getPrimaryName = (user: LeaderboardUser) => {
    const fn = user.full_name?.trim();
    if (fn) return fn;
    return user.username?.trim() || 'User';
  };
  const getAvatarSrc = (user: LeaderboardUser) => {
    if (!user.avatar_url || failedAvatarIds[user.id]) return BRAND_LOGO_IMAGE_SRC;
    return resolveMediaUrl(user.avatar_url);
  };

  const isDefaultAvatar = (user: LeaderboardUser) =>
    !user.avatar_url || Boolean(failedAvatarIds[user.id]);

  const markAvatarFailed = (id: number) => {
    setFailedAvatarIds((prev) => ({ ...prev, [id]: true }));
  };

  const ranked = useMemo(() => rows.map((item, index) => ({ ...item, rank: index + 1 })), [rows]);

  return (
    <div className="app-page relative flex min-h-screen flex-col overflow-x-hidden bg-muted/25">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Cùng pattern tiêu đề với Quizzes */}
          <div className="border-b-2 border-primary/25 bg-card">
            <div className="w-full px-4 py-5 sm:px-6 md:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="min-w-0 max-w-3xl border-l-[3px] border-primary/60 pl-3 sm:pl-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                    {tk('leaderboard.community')}
                  </p>
                  <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                    {tk('leaderboard.title')}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                    {tk('leaderboard.subtitle')}
                  </p>

                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex-1 pb-0">
            {loading && (
              <p className="px-4 py-4 text-sm text-muted-foreground">
                {tk('common.loading')}
              </p>
            )}
            {!loading && error && (
              <div className="px-4 py-4">
                <Card className="border-destructive/40 bg-card">
                  <CardContent className="px-4 py-4 text-sm text-destructive">{error}</CardContent>
                </Card>
              </div>
            )}

            {!loading && !error && ranked.length === 0 && (
              <div className="px-4 py-4">
                <Card className="border-dashed border-border">
                  <CardContent className="px-5 py-10 text-center text-sm text-muted-foreground">
                    {tk('leaderboard.emptyData')}
                  </CardContent>
                </Card>
              </div>
            )}

            {!loading && !error && ranked.length > 0 && (
              <div className="w-full px-0 pb-4 pt-0">
                <div
                  className={cn(
                    'mx-auto w-full max-w-full overflow-hidden rounded-none border-x-0 border-y border-slate-200/90 bg-white',
                    'shadow-[0_2px_16px_rgba(45,25,35,0.05)]',
                    'dark:border-border dark:bg-card',
                    'lg:min-h-[min(92vh,calc(100dvh-8.5rem))]'
                  )}
                >
                    <div
                    className={cn(
                      'min-w-0 bg-gradient-to-b from-slate-100/95 via-white to-white',
                      'px-0 pb-4 pt-3 sm:pb-5 sm:pt-4',
                      'dark:from-muted/45 dark:via-card dark:to-card'
                    )}
                  >
                    {/* Tiêu đề cột */}
                    <div className="flex items-center gap-3 border-b border-slate-200/80 bg-slate-100/90 px-0 py-4 sm:gap-5 sm:py-5 dark:border-border dark:bg-muted/50">
                      <span className="w-8 shrink-0 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:w-9">
                        #
                      </span>
                      <span className="h-10 w-10 shrink-0 sm:h-14 sm:w-14" aria-hidden />
                      <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:text-xs">
                        {tk('auth.fullName')}
                      </span>
                      <span className="w-[4.5rem] shrink-0 text-center text-[11px] font-bold uppercase tracking-wide text-foreground sm:w-28 sm:text-[13px]">
                        {tk('leaderboard.colAttempts')}
                      </span>
                      <span className="w-[5.75rem] shrink-0 text-center text-[11px] font-bold uppercase tracking-wide text-primary sm:w-[8.5rem] sm:text-[13px]">
                        {tk('leaderboard.colScore')}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-3 px-0 pb-2 pt-4 sm:gap-4 md:gap-5 sm:pb-3 sm:pt-5">
                      {ranked.map((user) => {
                        const rowBg = RANK_ROW_BG_SVG[user.rank];
                        const isTop5 = user.rank >= 1 && user.rank <= 5;
                        const restStripeEven = !isTop5 && user.rank % 2 === 0;
                        const restStripeOdd = !isTop5 && user.rank % 2 === 1;
                        const isMe = myUserId !== null && user.id === myUserId;
                        return (
                          <li
                            key={user.id}
                            className={cn(
                              'group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300',
                              isMe &&
                                'z-[2] border-primary/55 ring-2 ring-primary/35 ring-offset-2 ring-offset-white dark:ring-offset-card',
                              user.rank === 1 &&
                                'z-[3] shadow-[0_14px_44px_rgba(251,191,36,0.38)] ring-2 ring-amber-400/60 sm:scale-[1.015] sm:shadow-[0_18px_50px_rgba(251,191,36,0.42)]',
                              restStripeEven &&
                                'border-slate-300/90 bg-slate-100/95 font-medium text-foreground hover:border-primary/35 hover:shadow-md dark:border-border dark:bg-muted/55 dark:hover:border-primary/35',
                              restStripeOdd &&
                                'border-slate-300/90 bg-white hover:border-primary/30 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-primary/30',
                              isTop5 &&
                                cn(
                                  'shadow-md hover:shadow-lg dark:border-border',
                                  topRowBorderClass[user.rank]
                                )
                            )}
                          >
                            {rowBg && (
                              <>
                                <div
                                  className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat dark:opacity-[0.88]"
                                  style={{ backgroundImage: `url(${rowBg})` }}
                                  aria-hidden
                                />
                                <div
                                  className={cn(
                                    'pointer-events-none absolute inset-0 dark:bg-card/55',
                                    user.rank <= 3 ? 'bg-white/32' : 'bg-white/38'
                                  )}
                                  aria-hidden
                                />
                              </>
                            )}
                            <div className="relative z-[1] flex min-h-[4.5rem] items-center gap-2 px-2 py-3 sm:min-h-[5.5rem] sm:gap-5 sm:px-5 sm:py-5">
                              <RankBadge rank={user.rank} compact />
                              <div
                                className={cn(
                                  'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md ring-2 ring-slate-200/80',
                                  'sm:h-14 sm:w-14 sm:ring-4',
                                  'dark:border-border dark:bg-muted dark:ring-border/60'
                                )}
                              >
                                <img
                                  src={getAvatarSrc(user)}
                                  alt={getPrimaryName(user)}
                                  width={112}
                                  height={112}
                                  loading="lazy"
                                  decoding="async"
                                  className={cn(
                                    'h-full w-full',
                                    isDefaultAvatar(user)
                                      ? 'object-contain bg-white p-1.5'
                                      : 'object-cover'
                                  )}
                                  onError={() => {
                                    if (user.avatar_url && !failedAvatarIds[user.id]) {
                                      markAvatarFailed(user.id);
                                    }
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1 py-1">
                                <p
                                  className="line-clamp-2 break-words text-sm font-bold leading-snug text-foreground sm:text-lg"
                                  title={getPrimaryName(user)}
                                >
                                  <span className="flex flex-wrap items-center gap-1.5 align-middle">
                                    <span>{getPrimaryName(user)}</span>
                                    {isMe && (
                                      <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:text-[11px]">
                                        {tk('leaderboard.you')}
                                      </span>
                                    )}
                                  </span>
                                </p>
                                {Number(user.average_percentage) > 0 && (
                                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                    {tk('leaderboard.avg')}{' '}
                                    <span className="font-medium tabular-nums text-foreground/80">
                                      {Math.round(Number(user.average_percentage))}%
                                    </span>
                                  </p>
                                )}
                                {isMe && (
                                  <LocaleLink
                                    href="/quizzes"
                                    className="mt-2 inline-flex items-center text-sm font-bold text-primary underline-offset-2 hover:underline"
                                  >
                                    {tk('leaderboard.practiceNow')}
                                  </LocaleLink>
                                )}
                                {!isMe && (
                                  <LocaleLink
                                    href="/quizzes"
                                    className="mt-2 hidden items-center gap-1 text-xs font-semibold text-primary/90 underline-offset-2 hover:underline group-hover:inline-flex sm:text-sm"
                                  >
                                    {tk('leaderboard.competeRank')}
                                  </LocaleLink>
                                )}
                              </div>
                              <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-white/75 px-1 py-1.5 backdrop-blur-[2px] sm:w-24 sm:py-2.5 dark:border-border dark:bg-muted/60">
                                <span className="text-[11px] font-bold uppercase leading-tight tracking-wide text-muted-foreground sm:text-[13px]">
                                  {tk('leaderboard.quizzesShort')}
                                </span>
                                <span className="mt-1 font-display text-base font-bold tabular-nums leading-none text-foreground sm:text-xl">
                                  {user.total_quizzes}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'flex w-[5.75rem] shrink-0 flex-col items-center justify-center rounded-xl border px-1.5 py-2 sm:w-[8.5rem] sm:px-2 sm:py-3.5',
                                  'border-primary/40 bg-gradient-to-b from-primary/22 to-primary/[0.12] shadow-md backdrop-blur-[1px]',
                                  'dark:from-primary/28 dark:to-primary/16'
                                )}
                              >
                                <span className="text-[11px] font-bold uppercase leading-tight tracking-wide text-primary sm:text-[13px]">
                                  {tk('leaderboard.colScore')}
                                </span>
                                <span className="mt-1 inline-flex items-baseline gap-0.5 font-display text-[2rem] font-extrabold tabular-nums leading-none text-primary sm:mt-1.5 sm:text-4xl">
                                  {Number(user.total_score || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Leaderboard;
