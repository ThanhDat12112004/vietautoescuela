import type { Language, QuizAnswer, QuizDetail, QuizQuestion } from '@/lib/api/types';

/** Trắc nghiệm chỉ có 3 phương án A/B/C — lấy theo `order_number`, bỏ mọi đáp án thứ 4+ từ DB cũ. */
export function takeTripleChoiceAnswers<T extends { order_number: number }>(answers: T[]): T[] {
  return [...answers].sort((a, b) => a.order_number - b.order_number).slice(0, 3);
}

/** Giữ thứ tự câu & đáp án (sau shuffle), chỉ thay nội dung theo ngôn ngữ mới — không gọi startAttempt lại. */
export function mergeQuizDetailForLanguageChange(prev: QuizDetail, next: QuizDetail): QuizDetail {
  if (next.content_locked) {
    return {
      ...next,
      questions: [],
      code: next.code ?? String(next.id),
      content_locked: true,
      requires_premium: next.requires_premium ?? true,
    };
  }

  const nextByQid = new Map(next.questions.map((q) => [q.id, q]));

  const mergedQuestions: QuizQuestion[] = prev.questions.map((q) => {
    const nq = nextByQid.get(q.id);
    if (!nq) return q;

    const nextByAid = new Map(nq.answers.map((a) => [a.id, a]));
    const mergedAnswers: QuizAnswer[] = q.answers
      .map((a) => {
        const na = nextByAid.get(a.id);
        return na ? { ...a, answer_text: na.answer_text } : null;
      })
      .filter((a): a is QuizAnswer => a != null);

    return {
      ...q,
      question_text: nq.question_text,
      explanation: nq.explanation,
      points: nq.points,
      image_url: nq.image_url ?? q.image_url,
      answers: mergedAnswers,
    };
  });

  return {
    ...prev,
    id: next.id,
    code: next.code,
    title: next.title,
    description: next.description,
    instructions: next.instructions,
    duration_minutes: next.duration_minutes,
    total_questions: next.total_questions,
    passing_score: next.passing_score,
    content_locked: next.content_locked ?? false,
    requires_premium: next.requires_premium ?? prev.requires_premium,
    questions: mergedQuestions,
  };
}

function hasTrilingualQuestionPayload(q: QuizQuestion): boolean {
  const nonEmpty = (s: unknown) => typeof s === 'string' && s.trim() !== '';
  return (
    nonEmpty(q.question_text_vi) ||
    nonEmpty(q.question_text_es) ||
    nonEmpty(q.question_text_en)
  );
}

function hasTrilingualAnswerPayload(a: QuizAnswer): boolean {
  const nonEmpty = (s: unknown) => typeof s === 'string' && s.trim() !== '';
  return (
    nonEmpty(a.answer_text_vi) ||
    nonEmpty(a.answer_text_es) ||
    nonEmpty(a.answer_text_en)
  );
}

/** Bài random tạm: server gửi đủ vi/es/en; client chỉ đổi `question_text` / `answer_text` theo ngôn ngữ UI. */
export function localizeQuizQuestionTrilingual(q: QuizQuestion, lang: Language): QuizQuestion {
  if (!hasTrilingualQuestionPayload(q)) return q;

  const pickQ = (l: Language) =>
    l === 'vi' ? q.question_text_vi : l === 'es' ? q.question_text_es : q.question_text_en;
  const pickE = (l: Language) =>
    l === 'vi' ? q.explanation_vi : l === 'es' ? q.explanation_es : q.explanation_en;

  const qText =
    (pickQ(lang)?.trim() ||
      q.question_text_vi?.trim() ||
      q.question_text_es?.trim() ||
      q.question_text_en?.trim() ||
      q.question_text) ??
    '';

  const expl =
    pickE(lang) ?? q.explanation_vi ?? q.explanation_es ?? q.explanation_en ?? q.explanation;

  const localizeAnswer = (a: QuizAnswer): QuizAnswer => {
    if (!hasTrilingualAnswerPayload(a)) return a;
    const p = (l: Language) =>
      l === 'vi' ? a.answer_text_vi : l === 'es' ? a.answer_text_es : a.answer_text_en;
    const text =
      (p(lang)?.trim() ||
        a.answer_text_vi?.trim() ||
        a.answer_text_es?.trim() ||
        a.answer_text_en?.trim() ||
        a.answer_text) ??
      '';
    return { ...a, answer_text: text };
  };

  return {
    ...q,
    question_text: qText,
    explanation: expl ?? null,
    answers: q.answers.map(localizeAnswer),
  };
}

export function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '00')}`;
}
