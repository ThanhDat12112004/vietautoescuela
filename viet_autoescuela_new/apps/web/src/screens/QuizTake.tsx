'use client';

import { BrandLogo } from '@/components/brand';
import { LanguageDropdown } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/useLanguage';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import {
  getQuizDetail,
  startAttempt,
  submitAttempt,
  type CheckQuestionResult,
  type QuizDetail,
  type SubmitAttemptResult,
} from '@/lib/api/quiz';
import {
  resolveMediaUrl,
} from '@/lib/api/upload';
import { getStoredAuth } from '@/lib/auth';
import {
  formatTimer,
  getCandidateDisplayName,
  getQuestionBadgeClassName as getQuestionBadgeClassNameHelper,
  hasUnsavedQuizProgress,
  localizeQuizQuestionTrilingual,
  mergeQuizDetailForLanguageChange,
  shuffleArray,
  takeTripleChoiceAnswers,
} from '@/features/quiz-take';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Lightbulb,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { APP_ROUTES } from '@/config/routes';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { localePath } from '@/lib/i18n-routing';
import { clearRandomTempQuiz, readRandomTempQuiz } from '@/lib/quiz-random-temp-storage';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Language } from '@/lib/api/types';

type QuizMode = 'practice' | 'exam';

type CheckedMap = Record<number, CheckQuestionResult>;

type QuizTakeDialogState =
  | { kind: 'none' }
  | { kind: 'leave'; path: string }
  | { kind: 'submitUnanswered' };

const ANSWER_BADGES = ['/brand/a.png', '/brand/b.png', '/brand/c.png'];
const QUIZ_PASS_MIN_CORRECT = 27;

const QuizTake = () => {
  const { lang, setLang, tk, tkFill } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocaleFromPath();
  const quizId = Number(id || 1);
  const isTempRandomQuiz = String(id || '') === 'random-temp';
  const tempRandomQuizRef = useRef<QuizDetail | null | undefined>(undefined);
  if (!isTempRandomQuiz) {
    tempRandomQuizRef.current = undefined;
  } else if (tempRandomQuizRef.current === undefined) {
    tempRandomQuizRef.current = readRandomTempQuiz();
  }
  const tempQuizFromState = isTempRandomQuiz ? tempRandomQuizRef.current ?? null : null;
  const rawMode: QuizMode = (searchParams.get('mode') as QuizMode) || 'practice';
  /** Đề random chỉ hỗ trợ luyện tập (không thi thật / không lưu server). */
  const mode: QuizMode = isTempRandomQuiz ? 'practice' : rawMode;
  /** Thi thật: nội dung câu hỏi chỉ ES hoặc EN (DGT); giao diện tiếng Việt vẫn ép sang ES cho đồng bộ. */
  const effectiveLang: Language = mode === 'exam' ? (lang === 'en' ? 'en' : 'es') : lang;
  const langBeforeExamRef = useRef<Language | null>(null);

  useLayoutEffect(() => {
    if (mode !== 'exam') {
      if (langBeforeExamRef.current !== null) {
        setLang(langBeforeExamRef.current);
        langBeforeExamRef.current = null;
      }
      return;
    }
    if (langBeforeExamRef.current === null) {
      langBeforeExamRef.current = lang;
    }
    if (lang === 'vi') {
      setLang('es');
    }
  }, [mode, lang, setLang]);

  useEffect(() => {
    return () => {
      if (langBeforeExamRef.current !== null) {
        setLang(langBeforeExamRef.current);
        langBeforeExamRef.current = null;
      }
    };
  }, [setLang]);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [checkedMap, setCheckedMap] = useState<CheckedMap>({});
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);
  // Một cột (max-width 1023px): mở giải thích bằng sheet để cuộn và đọc rõ trên điện thoại.
  const [isQuizNarrowLayout, setIsQuizNarrowLayout] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitResult, setSubmitResult] = useState<SubmitAttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizDialog, setQuizDialog] = useState<QuizTakeDialogState>({ kind: 'none' });
  const authUser = getStoredAuth()?.user;
  const candidateName = getCandidateDisplayName(authUser);
  /** Phân biệt đổi đề (bootstrap lại) vs chỉ đổi ngôn ngữ (giữ attempt + đồng hồ). */
  const quizLoadSessionRef = useRef<{ quizId: number; lang: Language } | null>(null);
  /** Phiên làm bài hiện tại (đổi = reset đồng hồ từ lúc mở đề). */
  const quizClockSessionRef = useRef('');
  /** Mốc thời gian khi đề đã hiện (thi + luyện); đếm bằng Date.now() để không bị kẹt khi chuyển tab. */
  const quizOpenedAtMsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!getStoredAuth()?.token) {
      const search = searchParams.toString();
      const from = `${pathname}${search ? `?${search}` : ''}`;
      router.replace(
        `${localePath(locale, APP_ROUTES.LOGIN)}?from=${encodeURIComponent(from)}`
      );
    }
  }, [locale, pathname, router, searchParams]);

  /** Bài random tạm: bootstrap một lần (không phụ thuộc đổi ngôn ngữ — tránh shuffle lại). */
  useEffect(() => {
    if (!isTempRandomQuiz) return;

    if (!tempQuizFromState) {
      setError(tk('quizTake.tempExpired'));
      setLoading(false);
      return;
    }

    setLoading(true);
    quizLoadSessionRef.current = { quizId: -1, lang: 'vi' };
    setQuiz({
      ...tempQuizFromState,
      questions: tempQuizFromState.questions.map((q) => ({
        ...q,
        answers: shuffleArray(takeTripleChoiceAnswers(q.answers)),
      })),
    });
    setAttemptId(null);
    quizClockSessionRef.current = '';
    quizOpenedAtMsRef.current = null;
    setTimer(0);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCheckedMap({});
    setShowResult(false);
    setShowReview(false);
    setReviewIndex(0);
    setSubmitResult(null);
    setShowExplanationPanel(false);
    setError('');
    setLoading(false);
    clearRandomTempQuiz();
    // Không đưa `tk` vào deps: `tk` đổi mỗi khi đổi ngôn ngữ → effect chạy lại → mất đáp án, về câu 1, reset đồng hồ.
  }, [isTempRandomQuiz, tempQuizFromState]);

  useEffect(() => {
    let active = true;
    if (isTempRandomQuiz) return;

    const prevSession = quizLoadSessionRef.current;
    const isLangOnly =
      prevSession !== null &&
      prevSession.quizId === quizId &&
      prevSession.lang !== effectiveLang;

    (async () => {
      try {
        if (!isLangOnly) {
          setLoading(true);
          quizClockSessionRef.current = '';
          quizOpenedAtMsRef.current = null;
          const detail = await getQuizDetail(quizId, effectiveLang);
          if (!active) return;

          if (detail.content_locked) {
            quizLoadSessionRef.current = { quizId, lang: effectiveLang };
            quizClockSessionRef.current = '';
            quizOpenedAtMsRef.current = null;
            setQuiz({
              ...detail,
              questions: [],
              code: detail.code ?? String(detail.id),
              content_locked: true,
            });
            setAttemptId(null);
            setTimer(0);
            setCurrentIndex(0);
            setSelectedAnswers({});
            setCheckedMap({});
            setShowResult(false);
            setShowReview(false);
            setReviewIndex(0);
            setSubmitResult(null);
            setShowExplanationPanel(false);
            setError('');
          } else {
            let nextAttemptId: number | null = null;
            if (mode === 'exam') {
              const attempt = await startAttempt(quizId);
              if (!active) return;
              nextAttemptId = attempt.attempt_id;
            }

            quizLoadSessionRef.current = { quizId, lang: effectiveLang };
            setQuiz({
              ...detail,
              questions: detail.questions.map((q) => ({
                ...q,
                answers: shuffleArray(takeTripleChoiceAnswers(q.answers)),
              })),
            });
            setAttemptId(nextAttemptId);
            setTimer(0);
            setCurrentIndex(0);
            setSelectedAnswers({});
            setCheckedMap({});
            setShowResult(false);
            setShowReview(false);
            setReviewIndex(0);
            setSubmitResult(null);
            setShowExplanationPanel(false);
            setError('');
          }
        } else {
          const detail = await getQuizDetail(quizId, effectiveLang);
          if (!active) return;
          quizLoadSessionRef.current = { quizId, lang: effectiveLang };
          if (detail.content_locked) {
            quizClockSessionRef.current = '';
            quizOpenedAtMsRef.current = null;
            setQuiz({
              ...detail,
              questions: [],
              code: detail.code ?? String(detail.id),
              content_locked: true,
            });
            setAttemptId(null);
          } else {
            setQuiz((prevQuiz) =>
              prevQuiz ? mergeQuizDetailForLanguageChange(prevQuiz, detail) : null
            );
          }
          setError('');
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? formatUserFacingApiError(lang, err) : tk('quizTake.loadFailed')
        );
      } finally {
        if (active && !isLangOnly) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isTempRandomQuiz, effectiveLang, lang, quizId, mode, tk]);

  useLayoutEffect(() => {
    if (loading || showResult || showReview || !quiz || quiz.content_locked) return;
    if (!quiz.questions?.length) return;

    const session = isTempRandomQuiz
      ? `temp:${Number(quiz.id) || 0}`
      : `${quizId}:${mode}:${mode === 'exam' ? String(attemptId ?? '') : 'p'}`;

    if (quizClockSessionRef.current !== session) {
      quizClockSessionRef.current = session;
      quizOpenedAtMsRef.current = Date.now();
    }
    if (quizOpenedAtMsRef.current != null) {
      setTimer(Math.max(0, Math.floor((Date.now() - quizOpenedAtMsRef.current) / 1000)));
    }
  }, [
    loading,
    showResult,
    showReview,
    quiz,
    quiz?.content_locked,
    quiz?.questions?.length,
    quizId,
    mode,
    attemptId,
    isTempRandomQuiz,
  ]);

  useEffect(() => {
    if (loading || showResult || showReview || quiz?.content_locked) return;
    if (quizOpenedAtMsRef.current == null) return;

    const tick = () => {
      const opened = quizOpenedAtMsRef.current;
      if (opened == null) return;
      setTimer(Math.max(0, Math.floor((Date.now() - opened) / 1000)));
    };

    const onResume = () => {
      if (document.visibilityState === 'visible') tick();
    };

    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', onResume);
    window.addEventListener('focus', onResume);
    tick();
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('focus', onResume);
    };
  }, [loading, showResult, showReview, quiz?.content_locked, quizId, mode, attemptId, isTempRandomQuiz]);

  useEffect(() => {
    if (loading || showResult || showReview || quiz?.content_locked) return;

    const blockEvent = (event: Event) => {
      event.preventDefault();
    };

    const blockKeyboardShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'a' || key === 'p') {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', blockEvent);
    document.addEventListener('cut', blockEvent);
    document.addEventListener('contextmenu', blockEvent);
    document.addEventListener('selectstart', blockEvent);
    document.addEventListener('dragstart', blockEvent);
    document.addEventListener('keydown', blockKeyboardShortcut);

    return () => {
      document.removeEventListener('copy', blockEvent);
      document.removeEventListener('cut', blockEvent);
      document.removeEventListener('contextmenu', blockEvent);
      document.removeEventListener('selectstart', blockEvent);
      document.removeEventListener('dragstart', blockEvent);
      document.removeEventListener('keydown', blockKeyboardShortcut);
    };
  }, [loading, showResult, showReview, quiz?.content_locked]);

  useEffect(() => {
    if (!showExplanationPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowExplanationPanel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showExplanationPanel]);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const sync = () => setIsQuizNarrowLayout(mql.matches);
    mql.addEventListener('change', sync);
    sync();
    return () => mql.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setShowExplanationPanel(false);
  }, [currentIndex]);

  const rawQuestions = useMemo(() => quiz?.questions ?? [], [quiz?.questions]);
  const questions = useMemo(() => {
    if (!isTempRandomQuiz) return rawQuestions;
    return rawQuestions.map((q) => localizeQuizQuestionTrilingual(q, effectiveLang));
  }, [isTempRandomQuiz, rawQuestions, effectiveLang]);
  const question = questions[currentIndex];
  const selectedId = question ? selectedAnswers[question.id] : undefined;
  const checkedForCurrent = question ? checkedMap[question.id] : undefined;

  const allQuestionsAnswered = useMemo(
    () =>
      questions.length > 0 &&
      questions.every(
        (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null
      ),
    [questions, selectedAnswers]
  );

  const isLastQuestion = questions.length > 0 && currentIndex >= questions.length - 1;

  const detailsMap = useMemo(() => {
    const map: Record<number, CheckQuestionResult> = { ...checkedMap };
    submitResult?.details.forEach((item) => {
      map[item.question_id] = item;
    });
    return map;
  }, [checkedMap, submitResult]);

  // Auto-check when answer is selected in practice mode
  const handleSelect = (answerId: number) => {
    if (!question) return;
    if (mode === 'practice' && checkedForCurrent) return;

    setShowExplanationPanel(false);

    setSelectedAnswers((prev) => ({ ...prev, [question.id]: answerId }));

    // Luyện tập: chấm trên client, không gọi API (không lưu lịch sử).
    if (mode === 'practice') {
      const correct = question.answers.find((answer) => Boolean(answer.is_correct)) || null;
      const correctAnswerId = correct ? Number(correct.id) : null;
      const selectedAnswerId = Number(answerId);
      const isCorrect = correctAnswerId ? correctAnswerId === selectedAnswerId : false;
      setCheckedMap((prev) => ({
        ...prev,
        [question.id]: {
          attempt_id: 0,
          question_id: Number(question.id),
          selected_answer_id: selectedAnswerId,
          correct_answer_id: correctAnswerId,
          is_correct: isCorrect,
          points_earned: isCorrect ? Number(question.points || 0) : 0,
        },
      }));
    }
  };

  /** Luyện tập & đề random: kết quả chỉ trên client, không submit attempt server. */
  const completeOfflinePracticeSubmit = () => {
    let correctCount = 0;
    const details = questions.map((q) => {
      const selectedAnswerId = selectedAnswers[q.id] ?? null;
      const correct = q.answers.find((answer) => Boolean(answer.is_correct)) || null;
      const correctAnswerId = correct ? Number(correct.id) : null;
      const isCorrect =
        selectedAnswerId != null && correctAnswerId != null
          ? Number(selectedAnswerId) === Number(correctAnswerId)
          : false;
      if (isCorrect) correctCount += 1;
      return {
        attempt_id: 0,
        question_id: Number(q.id),
        selected_answer_id: selectedAnswerId == null ? 0 : Number(selectedAnswerId),
        correct_answer_id: correctAnswerId,
        is_correct: isCorrect,
        points_earned: isCorrect ? Number(q.points || 0) : 0,
      };
    });
    const totalQuestions = questions.length || 1;
    const percentage = Number(((correctCount / totalQuestions) * 100).toFixed(2));
    const score = Number(((correctCount / totalQuestions) * 10).toFixed(2));
    const opened = quizOpenedAtMsRef.current;
    const durationSec =
      opened != null ? Math.max(0, Math.floor((Date.now() - opened) / 1000)) : timer;
    setSubmitResult({
      attempt_id: 0,
      score,
      total_points: 10,
      correct_count: correctCount,
      total_questions: questions.length,
      percentage,
      duration_seconds: durationSec,
      details,
    });
    setShowResult(true);
    setShowReview(false);
  };

  const completeServerSubmit = async () => {
    if (!attemptId || isSubmitting || submitResult) return;
    try {
      setError('');
      setIsSubmitting(true);
      const payload = Object.fromEntries(
        Object.entries(selectedAnswers).map(([key, value]) => [String(key), value])
      );
      const opened = quizOpenedAtMsRef.current;
      const elapsedSeconds =
        opened != null ? Math.max(0, Math.floor((Date.now() - opened) / 1000)) : undefined;
      const result = await submitAttempt(attemptId, payload, {
        elapsed_seconds: elapsedSeconds,
      });
      setSubmitResult(result);
      setShowResult(true);
      setShowReview(false);
    } catch (err) {
      setError(
        err instanceof Error ? formatUserFacingApiError(lang, err) : tk('quizTake.submitFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (mode === 'practice') {
      if (!allQuestionsAnswered) {
        setError(tk('quizTake.answerAllPractice'));
        return;
      }
      completeOfflinePracticeSubmit();
      return;
    }

    if (!attemptId || isSubmitting || submitResult) return;
    if (!allQuestionsAnswered) {
      setQuizDialog({ kind: 'submitUnanswered' });
      return;
    }

    await completeServerSubmit();
  };

  const handleLeaveQuiz = (targetPath: string) => {
    if (isSubmitting) return;
    const hasUnsavedProgress = hasUnsavedQuizProgress(
      submitResult,
      Object.keys(selectedAnswers).length,
      timer
    );
    if (hasUnsavedProgress) {
      setQuizDialog({ kind: 'leave', path: targetPath });
      return;
    }

    if (isTempRandomQuiz) clearRandomTempQuiz();
    router.push(localePath(locale, targetPath));
  };

  const confirmQuizDialogPrimary = () => {
    if (quizDialog.kind === 'leave') {
      const path = quizDialog.path;
      setQuizDialog({ kind: 'none' });
      if (isTempRandomQuiz) clearRandomTempQuiz();
      router.push(localePath(locale, path));
      return;
    }
    if (quizDialog.kind === 'submitUnanswered') {
      setQuizDialog({ kind: 'none' });
      setError('');
      void completeServerSubmit();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{tk('quizTake.loading')}</p>
      </div>
    );
  }

  if (quiz?.content_locked) {
    return (
      <div className="app-page flex min-h-[100dvh] flex-col bg-background">
        <div className="flex min-h-0 w-full max-w-none flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2.5 sm:px-4">
            <h1 className="min-w-0 truncate font-display text-base font-bold text-foreground sm:text-lg">
              {quiz.title}
            </h1>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <LocaleLink href="/quizzes">{tk('quizTake.back')}</LocaleLink>
            </Button>
          </div>
          {quiz.description ? (
            <p className="shrink-0 border-b border-border bg-muted/15 px-3 py-2 text-sm leading-snug text-muted-foreground sm:px-4">
              {quiz.description}
            </p>
          ) : null}
          <div className="relative min-h-[min(48vh,380px)] flex-1 bg-muted/10 p-3 sm:p-4 md:min-h-[320px]">
            <div
              className="relative h-full min-h-[220px] overflow-hidden rounded-lg border border-slate-200/90 bg-slate-50 shadow-inner"
              aria-hidden
            >
              <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/5 via-background/20 to-background/40 backdrop-blur-[1px]" />
              <div className="relative z-0 flex h-full flex-col justify-center gap-3 p-4 sm:p-6">
                <div className="mx-auto w-full max-w-xl space-y-2.5 opacity-70 blur-[0.5px]">
                  <div className="h-3.5 w-full rounded bg-slate-300" />
                  <div className="h-3.5 w-4/5 rounded bg-slate-300" />
                  <div className="h-24 w-full rounded-lg bg-slate-200/90 sm:h-28" />
                  <div className="h-10 w-full rounded-md bg-slate-200/90" />
                  <div className="h-10 w-full rounded-md bg-slate-200/90" />
                  <div className="h-10 w-full rounded-md bg-slate-200/90" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card p-3 sm:flex-row sm:justify-center sm:gap-3 sm:px-4 sm:py-3">
            <Button
              asChild
              variant="outline"
              className="w-full border-2 border-[#F59E0B]/70 bg-[#F59E0B]/14 font-bold text-amber-950 shadow-sm hover:border-[#F59E0B] hover:bg-[#F59E0B]/26 hover:text-amber-950 sm:w-auto sm:min-w-[180px]"
            >
              <LocaleLink href={APP_ROUTES.PREMIUM}>{tk('listing.content_tier_advanced')}</LocaleLink>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto sm:min-w-[180px]">
              <LocaleLink href="/quizzes">{tk('quizTake.back')}</LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {error || tk('quizTake.notFound')}
          </p>
          <LocaleLink href="/quizzes">
            <Button>{tk('quizTake.back')}</Button>
          </LocaleLink>
        </div>
      </div>
    );
  }

  if (showReview) {
    const reviewQuestion = questions[reviewIndex];
    const detail = detailsMap[reviewQuestion.id];

    return (
      <div className="app-page h-screen flex flex-col bg-background">
        <div className="border-b border-border bg-card px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{tk('quizTake.reviewMode')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowReview(false)}
          >
            {tk('quizTake.backToResults')}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 w-full">
          <h3 className="font-display font-bold text-base mb-4">
            {reviewQuestion.order_number}. {reviewQuestion.question_text}
          </h3>
          <div className="space-y-2">
            {reviewQuestion.answers.map((answer) => {
              const isSelected = detail?.selected_answer_id === answer.id;
              const isCorrect = detail?.correct_answer_id === answer.id;

              return (
                <div
                  key={answer.id}
                  className={`border rounded-lg px-3 py-2 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                      : isSelected
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isSelected ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    {answer.answer_text}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold mb-1">{tk('quizTake.explanation')}</p>
            <p className="text-muted-foreground">
              {reviewQuestion.explanation || tk('quizTake.noExplanation')}
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-card p-3 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
            disabled={reviewIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {tk('quizTake.prev')}
          </Button>
          <Button
            size="sm"
            onClick={() => setReviewIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={reviewIndex === questions.length - 1}
          >
            {tk('quizTake.next')} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (showResult && submitResult) {
    const passed = Number(submitResult.correct_count || 0) >= QUIZ_PASS_MIN_CORRECT;

    return (
      <div className="app-page h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
                passed ? 'bg-accent/20' : 'bg-destructive/10'
              }`}
            >
              {passed ? (
                <CheckCircle2 className="h-10 w-10 text-accent" />
              ) : (
                <XCircle className="h-10 w-10 text-destructive" />
              )}
            </div>
            <h2 className="font-display text-xl font-800 mb-1">
              {passed
                ? tk('quizTake.passedTitle')
                : tk('quizTake.failedTitle')}
            </h2>
            <p className="text-xs text-muted-foreground mb-1">
              {mode === 'exam'
                ? tk('quizTake.examMode')
                : tk('quizTake.practiceMode')}
            </p>
            <div className="font-display my-2 text-6xl font-900 text-primary">
              {submitResult.correct_count ?? 0}
              <span className="text-2xl text-muted-foreground">/{submitResult.total_questions ?? 0}</span>
            </div>
            <div className="font-display text-4xl font-900 text-primary/85 my-2">
              {Number(submitResult.score || 0).toFixed(1)}
              <span className="text-xl text-muted-foreground">/10</span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">
              {tkFill('quizTake.resultCorrect', {
                c: submitResult.correct_count ?? 0,
                t: submitResult.total_questions ?? 0,
              })}
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              {tk('quizTake.timeTaken')}:{' '}
              <span className="font-sans tabular-nums font-semibold text-foreground">
                {formatTimer(
                  Number(
                    submitResult.duration_seconds != null
                      ? submitResult.duration_seconds
                      : timer
                  )
                )}
              </span>
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => {
                  setShowResult(true);
                  setShowReview(true);
                  setReviewIndex(0);
                }}
              >
                <Eye className="h-4 w-4" />
                {tk('quizTake.reviewAnswers')}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4" />
                  {tk('quizTake.retry')}
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  onClick={() => router.push(localePath(locale, '/quizzes'))}
                >
                  <Home className="h-4 w-4" />
                  {tk('quizTake.list')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shouldUseTwoRowsOnMobile = questions.length > 20;
  const mobileTopCount = Math.ceil(questions.length / 2);

  /** Ô số câu đang xem: sky (dễ tách khỏi đỏ “sai”). Đã làm / đúng: lá; sai: đỏ đậm hơn. */
  const getQuestionBadgeClassName = (questionId: number, index: number) =>
    getQuestionBadgeClassNameHelper({
      mode,
      questionId,
      index,
      currentIndex,
      selectedAnswers,
      detailsMap,
    });

  const explanationDisabled =
    mode !== 'practice' || !checkedForCurrent || !question.explanation;

  const renderImageArea = (variant: 'stack' | 'split', overlay?: ReactNode) => (
    <div
      className={
        variant === 'split'
          ? 'relative flex min-h-0 h-full w-full min-h-[12rem] items-center justify-center overflow-hidden rounded-lg border-0 bg-transparent lg:rounded-md'
          : 'relative flex w-full h-[clamp(150px,30vmin,260px)] max-h-[42dvh] min-h-[130px] items-center justify-center overflow-hidden rounded-lg border-0 bg-transparent sm:h-[clamp(160px,28vmin,280px)]'
      }
    >
      {question.image_url ? (
        <img
          src={resolveMediaUrl(question.image_url)}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-contain object-center"
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center px-2 text-center text-[clamp(0.625rem,2vmin,0.8125rem)] text-muted-foreground ${variant === 'stack' ? 'pb-3 pt-2' : ''}`}
        >
          {tk('quizTake.noImage')}
        </div>
      )}
      {overlay}
    </div>
  );

  const explanationToggleClass =
    'group mt-2 hidden w-full items-center gap-1.5 rounded-lg border px-[clamp(0.375rem,1.5vmin,0.75rem)] py-[clamp(0.25rem,1.35vmin,0.5rem)] text-left leading-snug transition-all duration-200 border-amber-600/55 bg-amber-50/90 text-amber-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-35 lg:flex';

  const explanationMobileOnImageClass =
    'pointer-events-auto absolute bottom-1.5 right-1.5 z-10 flex max-w-[calc(100%-0.75rem)] items-center gap-0.5 rounded-md border border-amber-700/55 bg-amber-50/95 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-950 shadow-[0_2px_10px_rgba(15,23,42,0.18)] backdrop-blur-[2px] transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40 sm:bottom-2 sm:right-2 sm:px-2 sm:py-1 sm:text-[11px]';

  const toggleExplanationPanel = () => setShowExplanationPanel((prev) => !prev);

  /** Nút nhỏ trên ảnh — chỉ dùng trong layout một cột (mobile). */
  const renderPracticeExplanationOnImage = () => {
    if (mode !== 'practice' || !question.explanation) return null;
    return (
      <div className="pointer-events-none absolute inset-0">
        <button
          type="button"
          className={explanationMobileOnImageClass}
          disabled={explanationDisabled}
          onClick={toggleExplanationPanel}
          aria-label={
            showExplanationPanel
              ? tk('quizTake.hideExplanation')
              : tk('quizTake.explanation')
          }
        >
          <Lightbulb className="h-3 w-3 shrink-0 opacity-90 sm:h-3.5 sm:w-3.5" aria-hidden />
          <span className="truncate">
            {showExplanationPanel
              ? tk('quizTake.hide')
              : tk('quizTake.explanation')}
          </span>
        </button>
      </div>
    );
  };

  const renderPracticeExplanation = () => {
    if (mode !== 'practice' || !question.explanation) return null;
    return (
      <>
        <button
          type="button"
          className={explanationToggleClass}
          disabled={explanationDisabled}
          onClick={toggleExplanationPanel}
          aria-label={
            showExplanationPanel
              ? tk('quizTake.hideExplanation')
              : tk('quizTake.explanation')
          }
        >
          <Lightbulb
            className="mt-0.5 h-[clamp(1.125rem,3.2vmin,1.5rem)] w-[clamp(1.125rem,3.2vmin,1.5rem)] shrink-0"
            aria-hidden
          />
          <span className="flex-1 pt-0.5 text-[clamp(0.9375rem,2.05vmin,1.3125rem)] font-semibold leading-snug">
            {showExplanationPanel
              ? tk('quizTake.hideExplanation')
              : tk('quizTake.explanation')}
          </span>
        </button>
        {checkedForCurrent && showExplanationPanel && !isQuizNarrowLayout && (
          <div
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-[clamp(0.375rem,1.5vmin,0.75rem)] py-[clamp(0.25rem,1.35vmin,0.5rem)] text-left shadow-sm"
            role="region"
            aria-label={tk('quizTake.explanation')}
          >
            <p className="select-text break-words text-[clamp(0.9375rem,2.05vmin,1.3125rem)] leading-snug text-foreground">
              {question.explanation}
            </p>
          </div>
        )}
      </>
    );
  };

  const renderQuestionHeader = () => (
    <div className="mb-1.5 flex items-baseline gap-1.5 landscape:mb-2 landscape:gap-2 xl:mb-3 xl:gap-3 2xl:gap-4">
      <span className="shrink-0 tabular-nums font-bold leading-snug text-slate-800 text-[clamp(1rem,2.35vmin,1.375rem)] landscape:text-[clamp(1.0625rem,2.15vmin,1.4375rem)]">
        {String(question.order_number).padStart(2, '0')}.
      </span>
      <h3 className="min-w-0 flex-1 font-bold leading-snug text-slate-800 text-[clamp(1rem,2.35vmin,1.375rem)] landscape:text-[clamp(1.0625rem,2.15vmin,1.4375rem)]">
        {question.question_text}
      </h3>
    </div>
  );

  const renderAnswerList = () => (
    <div className="mt-0.5 w-full space-y-1 pb-0.5 landscape:mt-1 landscape:space-y-1.5 landscape:pb-1">
      {question.answers.map((answer, idx) => {
        const detail = detailsMap[question.id];
        const isSelected = selectedId === answer.id;
        const isCorrect = detail?.correct_answer_id === answer.id;
        const isWrong = Boolean(detail && isSelected && !detail.is_correct);
        const badgeSrc = ANSWER_BADGES[idx] || null;
        const answerTextClass = isCorrect
          ? 'text-green-700'
          : isWrong
            ? 'text-destructive'
            : 'text-foreground';
        return (
          <button
            key={answer.id}
            onClick={() => handleSelect(answer.id)}
            className={`group flex w-full items-center gap-1.5 rounded-lg border px-[clamp(0.375rem,1.5vmin,0.75rem)] py-[clamp(0.25rem,1.35vmin,0.5rem)] text-left leading-snug transition-all duration-200
              landscape:gap-2.5 landscape:rounded-lg landscape:px-[clamp(0.4rem,1.25vmin,0.65rem)] landscape:py-[clamp(0.28rem,1.1vmin,0.5rem)] ${
              isCorrect
                ? 'border-green-500 bg-green-50 shadow-sm'
                : isWrong
                  ? 'border-destructive bg-destructive/10 shadow-sm'
                  : isSelected
                    ? 'border-slate-500 bg-slate-100 shadow-sm'
                    : 'border-slate-300 bg-white hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm'
            }`}
          >
            {badgeSrc ? (
              <img
                src={badgeSrc}
                alt={`option-${idx + 1}`}
                className="mt-0.5 h-[clamp(1.125rem,3.2vmin,1.5rem)] w-[clamp(1.125rem,3.2vmin,1.5rem)] shrink-0 object-contain landscape:h-[clamp(1.35rem,2.95vmin,1.75rem)] landscape:w-[clamp(1.35rem,2.95vmin,1.75rem)]"
              />
            ) : (
              <span className="mt-0.5 flex h-[clamp(1.125rem,3.2vmin,1.5rem)] w-[clamp(1.125rem,3.2vmin,1.5rem)] shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-bold text-[#5b5b5b] text-[clamp(0.5625rem,2vmin,0.75rem)] landscape:h-[clamp(1.35rem,2.95vmin,1.75rem)] landscape:w-[clamp(1.35rem,2.95vmin,1.75rem)] landscape:text-[clamp(0.6875rem,1.65vmin,0.8125rem)]">
                {String.fromCharCode(65 + idx)}
              </span>
            )}
            <span
              className={`flex-1 break-words pt-0.5 text-[clamp(0.9375rem,2.05vmin,1.3125rem)] leading-snug landscape:leading-snug ${answerTextClass}`}
            >
              {answer.answer_text}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderNavButtons = () => {
    /* Mobile: chữ như đáp án; padding dọc nhỏ hơn ô đáp án để nút không thừa trên/dưới. lg+: nút gọn. */
    const navTextPad =
      'max-lg:!h-auto min-h-0 gap-1.5 px-[clamp(0.375rem,1.5vmin,0.75rem)] py-[clamp(0.06rem,0.42vmin,0.2rem)] text-[clamp(0.9375rem,2.05vmin,1.3125rem)] leading-snug landscape:rounded-lg landscape:px-[clamp(0.4rem,1.25vmin,0.65rem)] landscape:py-[clamp(0.08rem,0.48vmin,0.24rem)] lg:h-9 lg:!h-9 lg:min-h-0 lg:gap-2 lg:py-0 lg:leading-none lg:px-[clamp(0.375rem,1.4vmin,0.625rem)] lg:text-xs';
    const navIcons =
      '[&_svg]:!h-[clamp(1rem,2.8vmin,1.375rem)] [&_svg]:!w-[clamp(1rem,2.8vmin,1.375rem)] lg:[&_svg]:!h-4 lg:[&_svg]:!w-4';

    if (mode === 'exam') {
      const examRowStretch = 'h-full w-full min-h-0';
      const examPrevBtn = `rounded-md border-2 border-brand-burgundy/35 bg-white font-semibold text-brand-heading shadow-sm transition-colors hover:bg-brand-burgundy/[0.06] disabled:opacity-40 justify-center px-1 sm:px-1.5 ${examRowStretch} ${navTextPad} ${navIcons}`;
      const examNextBtn = `brand-cta-primary rounded-md border-transparent font-semibold text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] disabled:pointer-events-none disabled:opacity-45 ${examRowStretch} ${navTextPad} [&_svg]:text-brand-onCta ${navIcons}`;
      const examSubmitBtn = `rounded-lg border-2 border-slate-500/85 bg-white font-semibold text-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition hover:border-slate-600 hover:bg-slate-50/95 disabled:pointer-events-none disabled:opacity-45 ${examRowStretch} ${navTextPad}`;
      return (
        <div className="grid w-full grid-cols-[minmax(2.5rem,auto)_minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-1 landscape:gap-1.5 xl:gap-2">
          <Button
            type="button"
            variant="outline"
            className={examPrevBtn}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            aria-label={tk('quizTake.prev')}
            title={tk('quizTake.prev')}
          >
            <ArrowLeft className="shrink-0 text-brand-cta" />
          </Button>
          <Button
            type="button"
            className={examNextBtn}
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={isLastQuestion}
            aria-label={tk('quizTake.next')}
          >
            {tk('quizTake.nextCaps')}
            <ArrowRight className="ml-0.5 shrink-0" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className={examSubmitBtn}
            onClick={() => void handleFinish()}
            disabled={isSubmitting || Boolean(submitResult)}
          >
            {isSubmitting ? (
              tk('quizTake.submitting')
            ) : (
              <>
                <span
                  className="flex h-[clamp(1.35rem,3.4vmin,1.75rem)] w-[clamp(1.35rem,3.4vmin,1.75rem)] shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-emerald-600/30 lg:h-7 lg:w-7"
                  aria-hidden
                >
                  <Check className="h-[55%] w-[55%]" strokeWidth={3} />
                </span>
                {tk('quizTake.submitCaps')}
              </>
            )}
          </Button>
        </div>
      );
    }

    return (
      <div className="grid w-full grid-cols-2 items-stretch gap-1 landscape:gap-1.5 xl:gap-2">
        <Button
          type="button"
          variant="outline"
          className={`h-full w-full min-h-0 rounded-md border-2 border-brand-burgundy/35 bg-white font-semibold text-brand-heading shadow-sm transition-colors hover:bg-brand-burgundy/[0.06] disabled:opacity-40 ${navTextPad} ${navIcons}`}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-0.5 shrink-0 text-brand-cta" />
          {tk('quizTake.prevCaps')}
        </Button>

        {isLastQuestion ? (
          <Button
            type="button"
            className={`h-full w-full min-h-0 brand-cta-primary rounded-md border-transparent font-semibold text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] disabled:pointer-events-none disabled:opacity-45 ${navTextPad}`}
            onClick={() => void handleFinish()}
            disabled={!allQuestionsAnswered || isSubmitting || Boolean(submitResult)}
            title={
              !allQuestionsAnswered
                ? tk('quizTake.answerAllToSubmit')
                : undefined
            }
          >
            {isSubmitting
              ? tk('quizTake.submitting')
              : tk('quizTake.submitCaps')}
          </Button>
        ) : (
          <Button
            type="button"
            className={`h-full w-full min-h-0 brand-cta-primary rounded-md border-transparent font-semibold text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] ${navTextPad} [&_svg]:text-brand-onCta ${navIcons}`}
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            {tk('quizTake.nextCaps')}
            <ArrowRight className="ml-0.5 shrink-0" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      className="app-page font-sans flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-none flex-col overflow-hidden print:hidden select-none bg-[radial-gradient(circle_at_18%_12%,rgba(224,231,255,0.35),transparent_38%),radial-gradient(circle_at_84%_6%,rgba(226,232,240,0.45),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_55%,#f5f7fb_100%)] p-0 md:h-screen md:max-h-screen"
    >
      <div className="flex min-h-0 w-full max-w-none flex-1 flex-col gap-0 overflow-hidden rounded-none border-0 bg-white/95 shadow-none px-0 pt-0 pb-0.5 sm:pb-0.5 lg:pb-1">
        <div className="shrink-0 grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-0.5 md:gap-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-1.5 lg:gap-y-0.5">
          {/* Thứ tự: exam luôn trên cùng; logo cột trái full 2 hàng ở desktop */}
          <div className="order-2 flex min-h-0 items-center rounded-md border border-slate-300/70 bg-slate-50/80 px-[clamp(0.3rem,1.15vmin,0.55rem)] py-[clamp(0.16rem,0.8vmin,0.32rem)] text-[clamp(0.8125rem,1.65vmin,1.0625rem)] leading-snug lg:order-none lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-between lg:gap-1">
            <div className="min-w-0">
              <span className="font-bold">{tk('quizTake.quizLabel')}:</span>
              <span className="ml-1 break-words">{quiz.title}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-[clamp(1.4rem,3.1vmin,1.8rem)] shrink-0 rounded-md border-slate-300 bg-white px-[clamp(0.28rem,1vmin,0.5rem)] text-[clamp(0.6875rem,1.35vmin,0.8125rem)] font-semibold leading-none lg:inline-flex"
              onClick={() => handleLeaveQuiz('/quizzes')}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              {tk('quizTake.back')}
            </Button>
          </div>

          <div className="order-3 flex min-h-0 items-center justify-center rounded-md border border-slate-300/70 bg-slate-50/80 px-[clamp(0.3rem,1.15vmin,0.55rem)] py-[clamp(0.16rem,0.8vmin,0.32rem)] lg:order-none lg:col-span-1 lg:col-start-3 lg:row-start-1">
            <div className="flex items-center gap-0.5">
              <Clock className="h-[clamp(0.75rem,1.7vmin,0.95rem)] w-[clamp(0.75rem,1.7vmin,0.95rem)] shrink-0 text-muted-foreground" />
              <span
                className={`font-sans tabular-nums text-[clamp(0.8125rem,1.65vmin,1.0625rem)] font-bold leading-snug ${timer < 60 ? 'text-destructive' : 'text-foreground'}`}
              >
                {formatTimer(timer)}
              </span>
            </div>
          </div>

          <div className="order-1 col-span-2 flex w-full min-w-0 items-center justify-between gap-1 rounded-md border border-slate-300/70 bg-slate-50/90 px-[clamp(0.3rem,1.15vmin,0.55rem)] py-[clamp(0.16rem,0.8vmin,0.32rem)] lg:order-none lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-auto lg:max-w-full lg:self-stretch lg:justify-start lg:gap-1.5 lg:px-1.5">
            <button
              type="button"
              onClick={() => handleLeaveQuiz('/')}
              className="flex min-w-0 max-w-[calc(100%-4.5rem)] items-center text-left sm:max-w-none lg:max-w-none"
              aria-label={tk('quizTake.goHomeAria')}
            >
              <BrandLogo
                imageClassName="h-7 shrink-0 sm:h-8 md:h-8 lg:h-8"
                withText
                textClassName="text-[13px] leading-tight sm:text-sm sm:leading-tight md:text-[0.9375rem] lg:whitespace-nowrap"
              />
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 shrink-0 rounded-md border-slate-300 bg-white px-1.5 text-[10px] font-semibold sm:h-7 sm:px-2 sm:text-[11px] md:text-xs lg:hidden"
              onClick={() => handleLeaveQuiz('/quizzes')}
            >
              <ArrowLeft className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
              {tk('quizTake.back')}
            </Button>
          </div>

          <div className="order-4 flex min-h-0 items-center rounded-md border border-slate-300/70 bg-slate-50/80 px-[clamp(0.3rem,1.15vmin,0.55rem)] py-[clamp(0.16rem,0.8vmin,0.32rem)] text-[clamp(0.8125rem,1.65vmin,1.0625rem)] leading-snug lg:order-none lg:col-span-1 lg:col-start-2 lg:row-start-2">
            <span className="font-bold">{tk('quizTake.candidate')}:</span>
            <span className="ml-1 min-w-0 break-words">{candidateName}</span>
          </div>

          <div className="order-5 flex min-h-0 min-w-0 items-center justify-end px-[clamp(0.3rem,1.15vmin,0.55rem)] py-[clamp(0.16rem,0.8vmin,0.32rem)] lg:order-none lg:col-span-1 lg:col-start-3 lg:row-start-2 lg:justify-end lg:pl-1 lg:pr-0">
            {mode === 'exam' ? (
              <LanguageDropdown
                lang={effectiveLang}
                setLang={setLang}
                languages={['es', 'en']}
                align="end"
                compact
                bareTrigger
                triggerTitle={tk('quizTake.examSpanishOnly')}
                triggerClassName="!py-[clamp(0.12rem,0.55vmin,0.24rem)] !px-[clamp(0.28rem,0.95vmin,0.46rem)] gap-0.5 !text-[clamp(0.8125rem,1.65vmin,1.0625rem)] [&_span]:!text-[clamp(0.8125rem,1.65vmin,1.0625rem)] [&_.lang-menu-chevron]:!h-[clamp(0.68rem,1.45vmin,0.85rem)] [&_.lang-menu-chevron]:!w-[clamp(0.68rem,1.45vmin,0.85rem)]"
              />
            ) : (
              <LanguageDropdown
                lang={lang}
                setLang={setLang}
                align="end"
                compact
                bareTrigger
                triggerClassName="!py-[clamp(0.12rem,0.55vmin,0.24rem)] !px-[clamp(0.28rem,0.95vmin,0.46rem)] gap-0.5 !text-[clamp(0.8125rem,1.65vmin,1.0625rem)] [&_span]:!text-[clamp(0.8125rem,1.65vmin,1.0625rem)] [&_.lang-menu-chevron]:!h-[clamp(0.68rem,1.45vmin,0.85rem)] [&_.lang-menu-chevron]:!w-[clamp(0.68rem,1.45vmin,0.85rem)]"
              />
            )}
          </div>
        </div>

        {/* Một cột khi chiều ngang &lt; breakpoint lg (1024px) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-lg rounded-t-none border border-slate-300/70 border-t-slate-300/60 bg-slate-100/65 p-0 lg:hidden">
          <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain rounded-none border-0 bg-white px-1 py-1 sm:px-1">
            <div className="space-y-1">
              {renderImageArea('stack', renderPracticeExplanationOnImage())}
              {error && <p className="text-xs text-destructive">{error}</p>}
              {renderQuestionHeader()}
              {renderAnswerList()}
            </div>
          </div>
          <div className="shrink-0 border-t border-slate-200/90 bg-white px-1 pb-[max(0.05rem,env(safe-area-inset-bottom))] pt-0 sm:px-1">
            {renderNavButtons()}
          </div>
        </div>

        {/* ≥lg: ảnh 4 | chữ 6 — chỉ phụ thuộc chiều ngang, không đổi sang mobile khi cửa sổ thấp */}
        <div className="hidden min-h-0 flex-1 grid-cols-[minmax(0,4fr)_minmax(0,6fr)] items-stretch gap-0 rounded-b-lg rounded-t-none border border-slate-300/70 border-t-slate-300/60 bg-slate-100/65 p-0 lg:grid">
          <div className="flex min-h-0 flex-col gap-0 overflow-hidden rounded-bl-lg rounded-br-none rounded-tl-none rounded-tr-none border border-slate-300/70 border-r-2 border-r-slate-300/80 border-t-0 bg-white p-0.5 sm:p-1">
            <div className="min-h-0 flex-1">{renderImageArea('split')}</div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-br-lg rounded-tl-none rounded-tr-none border border-slate-300/70 border-l-0 border-t-0 bg-white">
            {error && (
              <p className="shrink-0 px-1 pt-1 text-xs text-destructive sm:px-1 lg:px-1">{error}</p>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-1 pt-1 pb-0.5 sm:px-1 lg:px-1 lg:pb-1 lg:pt-1">
              <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-0 [scrollbar-gutter:stable]">
                {renderQuestionHeader()}
                {renderAnswerList()}
                {renderPracticeExplanation()}
              </div>

              <div className="shrink-0 border-t border-slate-200/90 bg-white py-0.5 pt-0.5 sm:pt-1 sm:pb-0.5">
                {renderNavButtons()}
              </div>
            </div>
          </div>
        </div>

        <div
          className="shrink-0 rounded-md border border-slate-300/70 bg-white px-0 py-0.5 sm:px-0 sm:py-0.5 md:py-1"
        >
          {shouldUseTwoRowsOnMobile ? (
            <>
              <div
                className="grid gap-px lg:hidden"
                style={{ gridTemplateColumns: `repeat(${mobileTopCount}, minmax(0, 1fr))` }}
              >
                {questions.slice(0, mobileTopCount).map((item, index) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded font-semibold transition-all h-[clamp(1.375rem,3.8vmin,1.75rem)] text-[clamp(0.5625rem,1.85vmin,0.75rem)] leading-none ${getQuestionBadgeClassName(item.id, index)}`}
                      aria-label={`${tk('quizTake.question')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <div
                className="mt-px grid gap-px lg:hidden"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(questions.length - mobileTopCount, 1)}, minmax(0, 1fr))`,
                }}
              >
                {questions.slice(mobileTopCount).map((item, idx) => {
                  const index = mobileTopCount + idx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded font-semibold transition-all h-[clamp(1.375rem,3.8vmin,1.75rem)] text-[clamp(0.5625rem,1.85vmin,0.75rem)] leading-none ${getQuestionBadgeClassName(item.id, index)}`}
                      aria-label={`${tk('quizTake.question')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              <div
                className="hidden gap-px lg:grid lg:grid-cols-18 xl:grid-cols-20 2xl:grid-cols-25"
              >
                {questions.map((item, index) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                       className={`rounded font-semibold transition-all
                             h-[clamp(1.375rem,3.5vmin,1.75rem)] text-[clamp(0.625rem,1.9vmin,0.8125rem)] leading-none
                             xl:h-8 xl:text-sm
                             2xl:h-9 2xl:text-base
                             ${getQuestionBadgeClassName(item.id, index)}`}
                      aria-label={`${tk('quizTake.question')} ${index + 1}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div
              className="grid gap-px
                         grid-cols-10
                         sm:grid-cols-15
                         lg:grid-cols-18
                         xl:grid-cols-20
                         2xl:grid-cols-25"
            >
              {questions.map((item, index) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded font-semibold transition-all
                             h-[clamp(1.375rem,3.8vmin,1.75rem)] text-[clamp(0.5625rem,1.85vmin,0.75rem)] leading-none
                             lg:h-7 lg:text-xs
                             xl:h-8 xl:text-sm
                             2xl:h-9 2xl:text-base
                             ${getQuestionBadgeClassName(item.id, index)}`}
                    aria-label={`${tk('quizTake.question')} ${index + 1}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend — nhỏ gọn; màu khớp ô số câu */}
          <div
            className="mt-0.5 border-t border-border pt-0.5
                         flex flex-wrap items-center gap-x-1.5 gap-y-0.5
                         text-[9px] leading-tight sm:text-[10px] md:text-[11px] lg:text-xs"
          >
            <div
              className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 md:gap-x-2.5"
            >
              <span className="shrink-0 font-bold text-slate-900">
                {tk('quizTake.legend')}
              </span>

              <div className="flex items-center gap-0.5">
                <span
                  className="inline-block h-2 w-3.5 shrink-0 rounded-full border-2 border-slate-500 bg-white sm:h-2.5 sm:w-4 md:h-2.5 md:w-[1.15rem]"
                />
                <span className="font-medium text-slate-800">
                  {mode === 'exam' ? tk('quizTake.notDoneExam') : tk('quizTake.unanswered')}
                </span>
              </div>

              {mode === 'exam' ? (
                <>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block h-2 w-3.5 shrink-0 rounded-full border-2 border-blue-800 bg-blue-200 sm:h-2.5 sm:w-4 md:h-2.5 md:w-[1.15rem]"
                    />
                    <span className="font-medium text-blue-950">{tk('quizTake.viewing')}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block h-2 w-3.5 shrink-0 rounded-full border-2 border-emerald-800 bg-emerald-200 sm:h-2.5 sm:w-4 md:h-2.5 md:w-[1.15rem]"
                    />
                    <span className="font-medium text-emerald-950">{tk('quizTake.doneStat')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block h-2 w-3.5 shrink-0 rounded-full border-2 border-blue-800 bg-blue-200 sm:h-2.5 sm:w-4 md:h-2.5 md:w-[1.15rem]"
                    />
                    <span className="font-medium text-blue-950">{tk('quizTake.viewing')}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block h-2 w-3.5 shrink-0 rounded-full border-2 border-green-800 bg-green-200 sm:h-2.5 sm:w-4 md:h-2.5 md:w-[1.15rem]"
                    />
                    <span className="font-medium text-green-950">{tk('quizTake.correctAdj')}</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <span
                      className="inline-block h-2 w-3.5 shrink-0 rounded-full border-2 border-red-800 bg-red-200 sm:h-2.5 sm:w-4 md:h-2.5 md:w-[1.15rem]"
                    />
                    <span className="font-medium text-red-950">{tk('quizTake.wrongAdj')}</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {mode === 'practice' &&
        question &&
        checkedForCurrent &&
        question.explanation &&
        isQuizNarrowLayout && (
          <Sheet
            open={showExplanationPanel}
            onOpenChange={(open) => {
              if (!open) setShowExplanationPanel(false);
            }}
          >
            <SheetContent
              side="bottom"
              className="flex max-h-[min(88dvh,640px)] flex-col gap-0 overflow-hidden rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
            >
              <SheetHeader className="shrink-0 space-y-1 pb-2 text-left">
                <SheetTitle className="text-base font-bold text-slate-900">
                  {tk('quizTake.explanation')}
                </SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
                <p className="select-text whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed text-slate-900 sm:text-base">
                  {question.explanation}
                </p>
              </div>
            </SheetContent>
          </Sheet>
        )}

      <AlertDialog
        open={quizDialog.kind !== 'none'}
        onOpenChange={(open) => {
          if (!open) setQuizDialog({ kind: 'none' });
        }}
      >
        <AlertDialogContent className="max-w-[min(100%,24rem)] border-slate-200 bg-white shadow-lg sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left font-display text-lg text-slate-900">
              {quizDialog.kind === 'leave'
                ? tk('quizTake.leaveTitle')
                : quizDialog.kind === 'submitUnanswered'
                  ? tk('quizTake.submitUnansweredTitle')
                  : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-sm leading-relaxed text-slate-600">
              {quizDialog.kind === 'leave'
                ? tk('quizTake.leaveConfirm')
                : quizDialog.kind === 'submitUnanswered'
                  ? tk('quizTake.confirmUnanswered')
                  : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel type="button" className="mt-0 border-slate-300">
              {tk('quizTake.dialogStay')}
            </AlertDialogCancel>
            {quizDialog.kind === 'leave' ? (
              <Button
                type="button"
                variant="destructive"
                className="font-semibold"
                onClick={confirmQuizDialogPrimary}
              >
                {tk('quizTake.dialogLeave')}
              </Button>
            ) : quizDialog.kind === 'submitUnanswered' ? (
              <Button
                type="button"
                className="brand-cta-primary font-semibold text-brand-onCta shadow-brand-cta hover:opacity-[0.94]"
                onClick={confirmQuizDialogPrimary}
              >
                {tk('quizTake.dialogSubmitAnyway')}
              </Button>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizTake;
