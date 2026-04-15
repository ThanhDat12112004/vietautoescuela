import { getMaterialCountsBySubject, getSubjects, type Subject } from '@/lib/api/materials';
import { getHomeSummary, getQuizTypes, getQuizzes, type QuizListItem, type QuizType } from '@/lib/api/quiz';
import type { HomeSummary, Language } from '@/lib/api/types';

export function fetchHomeQuizzes(lang: Language) {
  return getQuizzes(lang, { limit: 24, page: 1 });
}

export function fetchHomeQuizTypes(lang: Language) {
  return getQuizTypes(lang);
}

export function fetchHomeSummary() {
  return getHomeSummary();
}

export function fetchHomeSubjects(lang: Language) {
  return getSubjects(lang);
}

export function fetchHomeMaterialCounts() {
  return getMaterialCountsBySubject();
}

export type { HomeSummary, QuizListItem, QuizType, Subject };
