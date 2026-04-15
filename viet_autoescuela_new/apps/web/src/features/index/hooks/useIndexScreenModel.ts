import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Target, Users } from '@/components/brand';
import { Newspaper } from 'lucide-react';
import { getStoredAuth } from '@/lib/auth';
import {
  formatCountByLocale,
  getPrimaryTypeQuestionTotal,
  getPrimaryTypeQuizzes,
  getUniqueQuizTypes,
} from '@/features/index/index.selectors';
import { formatQuizTypeName, getQuizTopicDescription } from '@/features/index/index.quiz-type.helpers';
import { useIndexHomeData } from '@/features/index/hooks/useIndexHomeData';
import type { Language } from '@/lib/api/types';
import type { I18nKey } from '@viet/i18n';

type TkFn = (key: I18nKey) => string;

export function useIndexScreenModel(lang: Language, tk: TkFn) {
  const {
    quizzes,
    subjects,
    quizTypeCatalog,
    homeSummary,
    isLoadingHome,
    homeDataFetchFailed,
    homeDataRefetchBusy,
    refetchHomeData,
    subjectsLoading,
    materialCountsQuery,
    homeMaterialFilesTotal,
  } = useIndexHomeData(lang);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const statsScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = statsScrollRef.current;
    if (!container) return;

    const enabledQuery = window.matchMedia('(max-width: 1023px)');
    if (!enabledQuery.matches) return;

    let rafId = 0;
    let lastTs = 0;
    let paused = false;
    let resumeTimer: number | null = null;

    const stopTemporarily = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
      }
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 1800);
    };

    const onPointerDown = () => {
      paused = true;
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const onPointerUp = () => stopTemporarily();
    const onTouchMove = () => stopTemporarily();
    const onWheel = () => stopTemporarily();

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!paused) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft > 0) {
          container.scrollLeft += (34 * dt) / 1000;
          if (container.scrollLeft >= maxScrollLeft - 1) {
            container.scrollLeft = 0;
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('wheel', onWheel);
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
      }
    };
  }, [lang]);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAuthenticated(Boolean(auth?.token));
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    window.addEventListener('auth-updated', syncAuth as EventListener);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('auth-updated', syncAuth as EventListener);
    };
  }, []);

  const quizTypes = useMemo(() => getUniqueQuizTypes(quizzes, 6), [quizzes]);
  const primaryQuizType = quizTypes[0] || null;
  const numberLocale = lang === 'vi' ? 'vi-VN' : lang === 'en' ? 'en-US' : 'es-ES';
  const formatCount = useCallback((value: number) => formatCountByLocale(value, numberLocale), [numberLocale]);
  const formatQuizType = useCallback(
    (value: string) => formatQuizTypeName(value, quizTypeCatalog),
    [quizTypeCatalog]
  );
  const getTopicDescriptionByType = useCallback(
    (type: string) =>
      getQuizTopicDescription(
        type,
        quizTypeCatalog,
        tk('indexModel.topicNoDesc')
      ),
    [quizTypeCatalog, tk]
  );

  const primaryTypeQuizzes = useMemo(
    () => getPrimaryTypeQuizzes(quizzes, primaryQuizType),
    [primaryQuizType, quizzes]
  );
  const primaryTypeDescription = useMemo(
    () => (primaryQuizType ? getTopicDescriptionByType(primaryQuizType) : ''),
    [primaryQuizType, getTopicDescriptionByType]
  );
  const primaryTypeQuestionTotal = useMemo(
    () => getPrimaryTypeQuestionTotal(primaryTypeQuizzes),
    [primaryTypeQuizzes]
  );
  const materialsStatLoading = materialCountsQuery.isLoading || subjectsLoading;
  const quizCountForStat =
    homeSummary != null && typeof homeSummary.total_quizzes === 'number'
      ? Number(homeSummary.total_quizzes)
      : null;

  const quickStats = useMemo(
    () => [
      {
        label: tk('indexModel.statQuizzes'),
        value: isLoadingHome
          ? '...'
          : formatCount(quizCountForStat != null ? quizCountForStat : quizzes.length),
        hint: tk('indexModel.statQuizzesHint'),
        icon: BookOpen,
      },
      {
        label: tk('indexModel.statMaterials'),
        value: materialsStatLoading ? '...' : formatCount(homeMaterialFilesTotal ?? 0),
        hint: tk('indexModel.statMaterialsHint'),
        icon: Newspaper,
      },
      {
        label: tk('indexModel.statLearners'),
        value: isLoadingHome ? '...' : formatCount(Number(homeSummary?.total_students || 0)),
        hint: tk('indexModel.statLearnersHint'),
        icon: Users,
      },
      {
        label: tk('indexModel.statAttempts'),
        value: isLoadingHome ? '...' : formatCount(Number(homeSummary?.total_attempts || 0)),
        hint: tk('indexModel.statAttemptsHint'),
        icon: Target,
      },
    ],
    [
      formatCount,
      homeMaterialFilesTotal,
      homeSummary?.total_attempts,
      homeSummary?.total_students,
      isLoadingHome,
      materialsStatLoading,
      quizCountForStat,
      quizzes.length,
      tk,
    ]
  );

  return {
    quizzes,
    subjects,
    quizTypeCatalog,
    homeSummary,
    isLoadingHome,
    homeDataFetchFailed,
    homeDataRefetchBusy,
    refetchHomeData,
    subjectsLoading,
    materialCountsQuery,
    homeMaterialFilesTotal,
    isAuthenticated,
    statsScrollRef,
    quizTypes,
    primaryQuizType,
    formatCount,
    formatQuizType,
    getTopicDescriptionByType,
    primaryTypeQuizzes,
    primaryTypeDescription,
    primaryTypeQuestionTotal,
    quickStats,
  };
}
