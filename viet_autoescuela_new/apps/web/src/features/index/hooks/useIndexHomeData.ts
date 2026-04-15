import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchHomeMaterialCounts,
  fetchHomeQuizTypes,
  fetchHomeQuizzes,
  fetchHomeSubjects,
  fetchHomeSummary,
  type HomeSummary,
  type QuizListItem,
  type QuizType,
  type Subject,
} from '@/features/index/api/home.api';
import type { Language } from '@/lib/api/types';

export function useIndexHomeData(lang: Language) {
  const quizzesQuery = useQuery<QuizListItem[]>({
    queryKey: ['home', 'quizzes', lang],
    queryFn: () => fetchHomeQuizzes(lang),
    staleTime: 60_000,
  });
  const quizTypesQuery = useQuery<QuizType[]>({
    queryKey: ['home', 'quiz-types', lang],
    queryFn: () => fetchHomeQuizTypes(lang),
    staleTime: 60_000,
  });
  const homeSummaryQuery = useQuery<HomeSummary>({
    queryKey: ['home', 'summary'],
    queryFn: fetchHomeSummary,
    staleTime: 30_000,
  });
  const subjectsQuery = useQuery<Subject[]>({
    queryKey: ['materials', 'subjects', lang],
    queryFn: () => fetchHomeSubjects(lang),
    staleTime: 60_000,
  });
  const materialCountsQuery = useQuery({
    queryKey: ['materials', 'subject-counts'],
    queryFn: fetchHomeMaterialCounts,
    staleTime: 60_000,
  });

  const quizzes = quizzesQuery.data ?? [];
  const subjects = useMemo(() => subjectsQuery.data ?? [], [subjectsQuery.data]);
  const quizTypeCatalog = quizTypesQuery.data ?? [];
  const homeSummary = homeSummaryQuery.data ?? null;

  const isLoadingHome =
    quizzesQuery.isLoading || quizTypesQuery.isLoading || homeSummaryQuery.isLoading;

  const homeDataFetchFailed =
    !isLoadingHome &&
    (quizzesQuery.isError ||
      quizTypesQuery.isError ||
      homeSummaryQuery.isError ||
      subjectsQuery.isError ||
      materialCountsQuery.isError);

  const homeDataRefetchBusy =
    quizzesQuery.isFetching ||
    quizTypesQuery.isFetching ||
    homeSummaryQuery.isFetching ||
    subjectsQuery.isFetching ||
    materialCountsQuery.isFetching;

  const refetchHomeData = useCallback(() => {
    void Promise.all([
      quizzesQuery.refetch(),
      quizTypesQuery.refetch(),
      homeSummaryQuery.refetch(),
      subjectsQuery.refetch(),
      materialCountsQuery.refetch(),
    ]);
  }, [quizzesQuery, quizTypesQuery, homeSummaryQuery, subjectsQuery, materialCountsQuery]);

  const homeMaterialFilesTotal = useMemo(() => {
    const rows = materialCountsQuery.data;
    if (rows === undefined || !subjects.length) return null;
    const byId = new Map(rows.map((r) => [r.subject_id, Number(r.total || 0)]));
    let sum = 0;
    for (const s of subjects) {
      sum += byId.get(s.id) ?? 0;
    }
    return sum;
  }, [materialCountsQuery.data, subjects]);

  return {
    quizzes,
    subjects,
    quizTypeCatalog,
    homeSummary,
    isLoadingHome,
    homeDataFetchFailed,
    homeDataRefetchBusy,
    refetchHomeData,
    subjectsLoading: subjectsQuery.isLoading,
    materialCountsQuery,
    homeMaterialFilesTotal,
  };
}
