type CheckedDetail = { is_correct?: boolean } | undefined;

export function getCandidateDisplayName(user?: { full_name?: string | null; username?: string | null }) {
  return (user?.full_name && user.full_name.trim()) || user?.username || '-';
}

export function hasUnsavedQuizProgress(
  submitResult: unknown,
  selectedAnswersCount: number,
  timer: number
) {
  return !submitResult && (selectedAnswersCount > 0 || timer > 0);
}

export function getQuestionBadgeClassName(params: {
  mode: 'practice' | 'exam';
  questionId: number;
  index: number;
  currentIndex: number;
  selectedAnswers: Record<number, number>;
  detailsMap: Record<number, CheckedDetail>;
}) {
  const { mode, questionId, index, currentIndex, selectedAnswers, detailsMap } = params;
  const isCurrent = index === currentIndex;
  const currentMark =
    'border-2 border-blue-700 bg-blue-100 text-blue-950 shadow-sm [box-shadow:inset_0_0_0_1px_rgba(29,78,216,0.12)]';

  if (mode === 'exam') {
    const hasAnswered = Boolean(selectedAnswers[questionId]);
    if (hasAnswered) return 'border-2 border-emerald-700 bg-emerald-100 text-emerald-950';
    return isCurrent
      ? currentMark
      : 'border-2 border-slate-400 bg-slate-50/90 text-slate-800 hover:bg-slate-100';
  }

  const detail = detailsMap[questionId];
  const hasJudged = Boolean(detail);
  const isCorrect = Boolean(detail?.is_correct);

  if (hasJudged) {
    return isCorrect
      ? 'border-2 border-green-700 bg-green-100 text-green-950'
      : 'border-2 border-red-700 bg-red-100 text-red-950 [box-shadow:inset_0_0_0_1px_rgba(185,28,28,0.12)]';
  }

  return isCurrent
    ? currentMark
    : 'border-2 border-slate-400 bg-slate-50/90 text-slate-800 hover:bg-slate-100';
}
