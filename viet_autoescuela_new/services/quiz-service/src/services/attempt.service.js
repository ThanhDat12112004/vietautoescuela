const attemptRepository = require('../repositories/attempt.repository');
const quizRepository = require('../repositories/quiz.repository');
const { hasPremiumAccess } = require('../utils/access');

async function calculateAttemptResult(quizId, submittedAnswers) {
  const questions = await attemptRepository.findQuestionsByQuizId(quizId);

  if (!questions.length) {
    return {
      totalQuestions: 0,
      totalPoints: 0,
      score: 0,
      percentage: 0,
      correctCount: 0,
      details: [],
    };
  }

  const questionIds = questions.map((q) => q.id);
  const answers = await attemptRepository.findAnswersByQuestionIds(questionIds);

  const correctAnswerByQuestion = new Map();
  for (const ans of answers) {
    if (ans.is_correct) {
      correctAnswerByQuestion.set(ans.question_id, ans.id);
    }
  }

  let correctCount = 0;

  const details = questions.map((question) => {
    const selectedAnswerId = submittedAnswers[String(question.id)] || null;
    const correctAnswerId = correctAnswerByQuestion.get(question.id) || null;
    const isCorrect =
      selectedAnswerId && correctAnswerId
        ? Number(selectedAnswerId) === Number(correctAnswerId)
        : false;

    const pointsEarned = isCorrect ? Number(question.points) : 0;
    if (isCorrect) {
      correctCount += 1;
    }

    return {
      questionId: question.id,
      selectedAnswerId: selectedAnswerId ? Number(selectedAnswerId) : null,
      correctAnswerId,
      isCorrect,
      pointsEarned,
    };
  });

  const totalQuestions = questions.length;
  const ratio = correctCount / totalQuestions;
  /** Thang điểm 10: (đúng / tổng) × 10, 2 chữ số thập phân — tương ứng % × 10 / 100 */
  const score = Number((ratio * 10).toFixed(2));
  const percentage = Number((ratio * 100).toFixed(2));

  return {
    totalQuestions,
    totalPoints: 10,
    score,
    percentage,
    correctCount,
    details,
  };
}

async function startAttempt(user, quizId) {
  const quiz = await attemptRepository.findActiveQuizById(quizId);
  if (!quiz) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  const requiresPremium = await quizRepository.findQuizRequiresPremium(quizId);
  if (requiresPremium && !hasPremiumAccess(user)) {
    const appError = new Error('This quiz requires an active Premium subscription');
    appError.status = 403;
    throw appError;
  }

  const attemptId = await attemptRepository.createAttempt(user.id, quizId);
  return { attempt_id: attemptId };
}

async function checkQuestion(userId, attemptId, payload) {
  const attempt = await attemptRepository.findAttemptByIdAndUser(attemptId, userId);

  if (!attempt) {
    const appError = new Error('Attempt not found');
    appError.status = 404;
    throw appError;
  }

  if (attempt.status === 'completed') {
    const appError = new Error('Attempt already submitted');
    appError.status = 400;
    throw appError;
  }

  const question = await attemptRepository.findQuestionByIdAndQuizId(payload.question_id, attempt.quiz_id);
  if (!question) {
    const appError = new Error('Question does not belong to this attempt');
    appError.status = 400;
    throw appError;
  }

  const selectedAnswer = await attemptRepository.findAnswerByIdAndQuestionId(
    payload.answer_id,
    payload.question_id
  );
  if (!selectedAnswer) {
    const appError = new Error('Answer does not belong to this question');
    appError.status = 400;
    throw appError;
  }

  const correctAnswer = await attemptRepository.findCorrectAnswerForQuestion(payload.question_id);
  const correctAnswerId = correctAnswer ? Number(correctAnswer.id) : null;
  const selectedAnswerId = Number(payload.answer_id);
  const isCorrect = correctAnswerId ? correctAnswerId === selectedAnswerId : false;

  return {
    attempt_id: attemptId,
    question_id: Number(payload.question_id),
    selected_answer_id: selectedAnswerId,
    correct_answer_id: correctAnswerId,
    is_correct: isCorrect,
    points_earned: isCorrect ? Number(question.points) : 0,
  };
}

async function submitAttempt(userId, attemptId, answers, options = {}) {
  const connection = await attemptRepository.getConnection();

  try {
    await connection.beginTransaction();

    const attempt = await attemptRepository.findAttemptForSubmit(connection, attemptId, userId);

    if (!attempt) {
      const appError = new Error('Attempt not found');
      appError.status = 404;
      throw appError;
    }

    if (attempt.status === 'completed') {
      const appError = new Error('Attempt already submitted');
      appError.status = 400;
      throw appError;
    }

    const result = await calculateAttemptResult(attempt.quiz_id, answers);
    const { percentage } = result;

    await attemptRepository.markAttemptCompleted(connection, {
      attemptId,
      score: result.score,
      percentage,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
    });

    for (const item of result.details) {
      await attemptRepository.upsertUserAnswer(connection, {
        attemptId,
        questionId: item.questionId,
        selectedAnswerId: item.selectedAnswerId,
        isCorrect: item.isCorrect,
        pointsEarned: item.pointsEarned,
      });
    }

    let durationSeconds = await attemptRepository.getAttemptDurationSeconds(connection, attemptId);
    const rawClient = options.elapsed_seconds;
    if (rawClient != null && Number.isFinite(Number(rawClient))) {
      const clientSec = Math.max(0, Math.floor(Number(rawClient)));
      const serverSec = durationSeconds;
      if (clientSec <= serverSec + 120 && clientSec >= serverSec - 900) {
        durationSeconds = clientSec;
      }
    }

    await attemptRepository.refreshUserStats(connection, userId);
    await connection.commit();

    return {
      attempt_id: attemptId,
      score: result.score,
      total_points: result.totalPoints,
      correct_count: result.correctCount,
      total_questions: result.totalQuestions,
      percentage,
      duration_seconds: durationSeconds,
      details: result.details.map((item) => ({
        question_id: item.questionId,
        selected_answer_id: item.selectedAnswerId,
        correct_answer_id: item.correctAnswerId,
        is_correct: item.isCorrect,
        points_earned: item.pointsEarned,
      })),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { calculateAttemptResult, startAttempt, checkQuestion, submitAttempt };
