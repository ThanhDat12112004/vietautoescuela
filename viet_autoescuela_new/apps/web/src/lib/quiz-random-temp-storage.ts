import type { QuizDetail } from '@/lib/api/quiz';

const STORAGE_KEY = 'viet:quiz-random-temp-v1';

export function stashRandomTempQuiz(quiz: QuizDetail): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
  } catch {
    // ignore quota / private mode
  }
}

export function readRandomTempQuiz(): QuizDetail | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizDetail;
  } catch {
    return null;
  }
}

export function clearRandomTempQuiz(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
