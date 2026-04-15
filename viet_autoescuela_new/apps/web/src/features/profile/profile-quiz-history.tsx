import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { getMyAttemptReview, getMyQuizAttempts } from '@/lib/api/quiz';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/api/upload';
import type {
  AttemptReviewResponse,
  DashboardResponse,
  Language,
  QuizAttemptListItem,
  QuizHistorySummary,
} from '@/lib/api/types';
import { formatTimer } from '@/features/quiz-take';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { LocaleLink } from '@/components/navigation';
import type { I18nKey } from '@viet/i18n';

type TkFn = (key: I18nKey) => string;

function buildSummariesFromFlatHistory(history: DashboardResponse['history']): QuizHistorySummary[] {
  const byQuiz = new Map<number, DashboardResponse['history']>();
  for (const row of history) {
    if (String(row.status || 'completed') !== 'completed') continue;
    const list = byQuiz.get(row.quiz_id) ?? [];
    list.push(row);
    byQuiz.set(row.quiz_id, list);
  }
  const out: QuizHistorySummary[] = [];
  for (const [, rows] of byQuiz) {
    const sorted = [...rows].sort((a, b) => {
      const ds = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (ds !== 0) return ds;
      const dp = (Number(b.percentage) || 0) - (Number(a.percentage) || 0);
      if (dp !== 0) return dp;
      const ta = new Date(a.completed_at || a.started_at || 0).getTime();
      const tb = new Date(b.completed_at || b.started_at || 0).getTime();
      return tb - ta;
    });
    const best = sorted[0];
    out.push({
      quiz_id: best.quiz_id,
      quiz_title: best.quiz_title,
      best_attempt_id: best.id,
      best_score: Number(best.score) || 0,
      best_percentage: Number(best.percentage) || 0,
      best_correct_count: best.correct_count,
      best_total_questions: best.total_questions,
      best_completed_at: best.completed_at,
      best_duration_seconds: best.duration_seconds ?? null,
      attempt_count: rows.length,
    });
  }
  return out.sort((a, b) => {
    const ta = new Date(a.best_completed_at || 0).getTime();
    const tb = new Date(b.best_completed_at || 0).getTime();
    return tb - ta;
  });
}

function formatLocaleDateTime(iso: string | null, lang: Language) {
  if (!iso) return '—';
  try {
    const locale = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'vi-VN';
    return new Date(iso).toLocaleString(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function passLabel(score: number, tk: TkFn) {
  return Number(score) >= 5 ? tk('profileHistory.pass') : tk('profileHistory.fail');
}

function passClass(score: number) {
  return Number(score) >= 5
    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
    : 'bg-destructive/10 text-destructive';
}

type Props = {
  quizSummaries: QuizHistorySummary[] | undefined;
  fallbackHistory: DashboardResponse['history'];
  lang: Language;
  tk: TkFn;
  /** Gọi API khác (ví dụ admin xem user học viên). Mặc định: /stats/me/... */
  fetchQuizAttempts?: (quizId: number) => Promise<QuizAttemptListItem[]>;
  fetchAttemptReview?: (attemptId: number) => Promise<AttemptReviewResponse>;
  /** Ẩn nút “Làm bài ngay” khi chưa có lịch sử (ví dụ trang admin). */
  showPracticeCta?: boolean;
  /** `student`: nhãn “Học viên chọn” trong dialog xem lại bài. */
  reviewAnswerPerspective?: 'self' | 'student';
  /** Bỏ viền trên khi nhúng trong panel admin. */
  compactLayout?: boolean;
};

export function ProfileQuizHistory({
  quizSummaries,
  fallbackHistory,
  lang,
  tk,
  fetchQuizAttempts: fetchQuizAttemptsProp,
  fetchAttemptReview: fetchAttemptReviewProp,
  showPracticeCta = true,
  reviewAnswerPerspective = 'self',
  compactLayout = false,
}: Props) {
  const rows = useMemo(() => {
    if (quizSummaries && quizSummaries.length > 0) return quizSummaries;
    return buildSummariesFromFlatHistory(fallbackHistory || []);
  }, [quizSummaries, fallbackHistory]);

  const resolveFetchAttempts = useMemo(
    () => fetchQuizAttemptsProp ?? ((qid: number) => getMyQuizAttempts(qid)),
    [fetchQuizAttemptsProp]
  );

  const resolveFetchReview = useMemo(
    () =>
      fetchAttemptReviewProp ?? ((aid: number) => getMyAttemptReview(aid, lang)),
    [fetchAttemptReviewProp, lang]
  );

  const selectedAnswerLabel =
    reviewAnswerPerspective === 'student'
      ? tk('profileHistory.learnerAnswer')
      : tk('profileHistory.yourAnswer');

  const [openQuizIds, setOpenQuizIds] = useState<Set<number>>(() => new Set());
  const [attemptsByQuiz, setAttemptsByQuiz] = useState<Record<number, QuizAttemptListItem[]>>({});
  const [attemptsLoading, setAttemptsLoading] = useState<Record<number, boolean>>({});
  const [attemptsError, setAttemptsError] = useState<Record<number, string>>({});

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [review, setReview] = useState<AttemptReviewResponse | null>(null);
  const [reviewError, setReviewError] = useState('');

  const loadAttempts = useCallback(
    async (quizId: number) => {
      if (attemptsByQuiz[quizId] !== undefined) return;
      setAttemptsLoading((m) => ({ ...m, [quizId]: true }));
      setAttemptsError((m) => {
        const next = { ...m };
        delete next[quizId];
        return next;
      });
      try {
        const list = await resolveFetchAttempts(quizId);
        setAttemptsByQuiz((m) => ({ ...m, [quizId]: list }));
      } catch (e) {
        setAttemptsError((m) => ({
          ...m,
          [quizId]:
            e instanceof Error ? formatUserFacingApiError(lang, e) : tk('profileHistory.loadListFail'),
        }));
      } finally {
        setAttemptsLoading((m) => ({ ...m, [quizId]: false }));
      }
    },
    [attemptsByQuiz, lang, resolveFetchAttempts, tk]
  );

  const openReview = useCallback(
    async (attemptId: number) => {
      setReviewOpen(true);
      setReview(null);
      setReviewError('');
      setReviewLoading(true);
      try {
        const data = await resolveFetchReview(attemptId);
        setReview(data);
      } catch (e) {
        setReviewError(
          e instanceof Error ? formatUserFacingApiError(lang, e) : tk('profileHistory.loadAttemptFail')
        );
      } finally {
        setReviewLoading(false);
      }
    },
    [lang, resolveFetchReview, tk]
  );

  const closeReview = useCallback(() => {
    setReviewOpen(false);
    setReview(null);
    setReviewError('');
  }, []);

  if (rows.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center">
        <p className="text-sm font-semibold text-foreground">
          {tk('profileHistory.empty')}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {tk('profileHistory.emptyHint')}
        </p>
        {showPracticeCta ? (
          <Button asChild className="mt-5 brand-cta-primary" size="sm">
            <LocaleLink href="/quizzes">{tk('profile.takeQuizNow')}</LocaleLink>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'space-y-3',
          compactLayout ? 'pt-0' : 'border-t border-primary/15 pt-6'
        )}
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tk('profileHistory.introHint')}
        </p>

        {rows.map((summary) => {
          const isOpen = openQuizIds.has(summary.quiz_id);
          const attempts = attemptsByQuiz[summary.quiz_id];
          const loading = attemptsLoading[summary.quiz_id];
          const err = attemptsError[summary.quiz_id];

          return (
            <Collapsible
              key={summary.quiz_id}
              open={isOpen}
              onOpenChange={(next) => {
                setOpenQuizIds((prev) => {
                  const s = new Set(prev);
                  if (next) {
                    s.add(summary.quiz_id);
                    void loadAttempts(summary.quiz_id);
                  } else {
                    s.delete(summary.quiz_id);
                  }
                  return s;
                });
              }}
            >
              <div className="overflow-hidden rounded-2xl border-2 border-primary/15 bg-white/75 shadow-sm">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/[0.04] sm:items-center sm:gap-4"
                  >
                    <ChevronDown
                      className={`mt-0.5 h-5 w-5 shrink-0 text-primary transition-transform sm:mt-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {summary.quiz_title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {summary.attempt_count}{' '}
                        {tk('profileHistory.attempts')} · {tk('profileHistory.best')}{' '}
                        <span className="font-display font-bold tabular-nums text-primary">
                          {Number(summary.best_score).toFixed(1)}
                        </span>
                        /10 ({Number(summary.best_percentage).toFixed(0)}%)
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${passClass(summary.best_score)}`}
                        >
                          {passLabel(summary.best_score, tk)}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {formatLocaleDateTime(summary.best_completed_at, lang)}
                        </span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${passClass(summary.best_score)}`}>
                        {passLabel(summary.best_score, tk)}
                      </span>
                      <span className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                        {formatLocaleDateTime(summary.best_completed_at, lang)}
                      </span>
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-primary/10 bg-primary/[0.02] px-4 py-3">
                    {loading && attempts === undefined ? (
                      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {tk('profileHistory.loading')}
                      </div>
                    ) : err ? (
                      <p className="py-2 text-sm text-destructive">{err}</p>
                    ) : attempts && attempts.length > 0 ? (
                      <ul className="space-y-2">
                        {attempts.map((a) => (
                          <li key={a.id}>
                            <button
                              type="button"
                              onClick={() => void openReview(a.id)}
                              className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/12 bg-white/90 px-3 py-2.5 text-left text-xs transition-colors hover:border-primary/25 hover:bg-white"
                            >
                              <span className="font-medium tabular-nums text-primary">
                                {Number(a.score).toFixed(1)}/10 · {a.correct_count}/{a.total_questions}{' '}
                                {tk('profileHistory.correctShort')}
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                {a.duration_seconds != null && a.duration_seconds >= 0
                                  ? formatTimer(Number(a.duration_seconds))
                                  : '—'}{' '}
                                · {formatLocaleDateTime(a.completed_at || a.started_at, lang)}
                              </span>
                              <span
                                className={`w-full shrink-0 rounded-full px-2 py-0.5 text-center text-[10px] font-semibold sm:w-auto ${passClass(a.score)}`}
                              >
                                {passLabel(a.score, tk)} · {tk('profileHistory.viewDetails')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {tk('profileHistory.noAttempts')}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      <Dialog
        open={reviewOpen}
        onOpenChange={(o) => {
          if (!o) closeReview();
        }}
      >
        <DialogContent
          suppressAriaDescribedBy={false}
          className={cn(
            'fixed inset-0 left-0 top-0 z-[101] flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-white p-0 shadow-none sm:p-0',
            'min-h-0'
          )}
          closeLabel={tk('profileHistory.close')}
        >
          {reviewLoading ? (
            <div className="flex min-h-[200px] flex-1 items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {tk('profileHistory.loadingAttempt')}
            </div>
          ) : reviewError ? (
            <div className="p-6 pr-14">
              <DialogHeader>
                <DialogTitle className="text-destructive">{tk('profileHistory.error')}</DialogTitle>
                <DialogDescription>{reviewError}</DialogDescription>
              </DialogHeader>
            </div>
          ) : review ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <DialogHeader className="shrink-0 space-y-1.5 border-b border-primary/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(255,247,250,0.95)_100%)] px-6 pb-4 pt-6 pr-14 text-left">
                <DialogTitle className="font-display text-lg font-bold leading-tight text-primary sm:text-xl">
                  {review.attempt.quiz_title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-snug text-muted-foreground sm:text-[0.9375rem]">
                  {Number(review.attempt.score).toFixed(1)}/10 · {review.attempt.correct_count}/
                  {review.attempt.total_questions} {tk('profileHistory.correctShort')} ·{' '}
                  {review.attempt.duration_seconds != null && review.attempt.duration_seconds >= 0
                    ? formatTimer(Number(review.attempt.duration_seconds))
                    : '—'}{' '}
                  · {formatLocaleDateTime(review.attempt.completed_at || review.attempt.started_at, lang)}
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-4">
                {review.questions.map((q) => (
                  <article
                    key={q.id}
                    className={`rounded-xl border-2 px-4 py-4 sm:px-5 sm:py-4 ${
                      q.is_correct === true
                        ? 'border-green-200/80 bg-green-50/40 dark:border-green-500/20 dark:bg-green-950/20'
                        : q.is_correct === false
                          ? 'border-destructive/25 bg-destructive/[0.06]'
                          : 'border-primary/12 bg-white/60'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {tk('quizTake.question')} {q.order_number}
                    </p>
                    <p className="mt-2 text-base font-semibold leading-snug text-foreground">
                      {q.question_text}
                    </p>
                    {q.image_url ? (
                      <div className="relative mt-2 h-48 w-full overflow-hidden rounded-lg border border-primary/10 bg-muted/30">
                        <img
                          src={resolveMediaUrl(q.image_url)}
                          alt=""
                          className="absolute inset-0 h-full w-full object-contain object-center"
                        />
                      </div>
                    ) : null}
                    <ul className="mt-3 space-y-2">
                      {q.answers.map((ans) => {
                        const selected = q.selected_answer_id === ans.id;
                        return (
                          <li
                            key={ans.id}
                            className={`rounded-md border px-3 py-2.5 text-sm leading-snug ${
                              ans.is_correct
                                ? 'border-green-400/60 bg-green-100/50 font-medium text-green-900 dark:border-green-500/40 dark:bg-green-950/40 dark:text-green-100'
                                : selected
                                  ? 'border-primary/35 bg-primary/[0.08]'
                                  : 'border-transparent bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            {selected && (
                              <span className="mr-1.5 text-xs font-semibold text-primary">
                                [{selectedAnswerLabel}]
                              </span>
                            )}
                            {ans.answer_text}
                            {ans.is_correct ? (
                              <span className="ml-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                                ({tk('profileHistory.correctParen')})
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                    {q.explanation ? (
                      <p className="mt-3 border-t border-primary/10 pt-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {tk('quizTake.explanation')}:{' '}
                        </span>
                        {q.explanation}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
