const statsRepository = require('../repositories/stats.repository');

function normalizePeriod(period) {
  const value = String(period || 'all').trim().toLowerCase();
  return value === 'week' || value === 'month' ? value : 'all';
}

async function getLeaderboard(limit = 10, period = 'all') {
  return statsRepository.findLeaderboardByPeriod(normalizePeriod(period), limit);
}

async function getHomeSummary() {
  return statsRepository.findHomeSummary();
}

function mapQuizSummaryRow(r) {
  return {
    quiz_id: Number(r.quiz_id),
    quiz_title: r.quiz_title,
    best_attempt_id: Number(r.best_attempt_id),
    best_score: Number(r.best_score),
    best_percentage: Number(r.best_percentage),
    best_correct_count: Number(r.best_correct_count),
    best_total_questions: Number(r.best_total_questions),
    best_completed_at: r.best_completed_at,
    best_duration_seconds:
      r.best_duration_seconds != null ? Number(r.best_duration_seconds) : null,
    attempt_count: Number(r.attempt_count),
  };
}

function mapAttemptListRow(r) {
  return {
    id: Number(r.id),
    score: Number(r.score),
    percentage: Number(r.percentage),
    correct_count: Number(r.correct_count),
    total_questions: Number(r.total_questions),
    started_at: r.started_at,
    completed_at: r.completed_at,
    duration_seconds: r.duration_seconds != null ? Number(r.duration_seconds) : null,
  };
}

async function getUserDashboard(userId, lang) {
  const stats = await statsRepository.findUserStats(userId);

  if (!stats) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  const [quizSummariesRaw, history] = await Promise.all([
    statsRepository.findUserQuizSummaries(userId, lang),
    statsRepository.findUserAttemptHistory(userId, lang, 80),
  ]);

  const quiz_summaries = quizSummariesRaw.map(mapQuizSummaryRow);

  return { stats, quiz_summaries, history };
}

async function getUserQuizAttempts(userId, quizId) {
  const id = Number(quizId);
  if (!Number.isFinite(id) || id <= 0) {
    const err = new Error('Invalid quiz id');
    err.status = 400;
    throw err;
  }
  const rows = await statsRepository.findUserAttemptsForQuiz(userId, id);
  return rows.map(mapAttemptListRow);
}

async function getAttemptReview(attemptId, userId, lang) {
  const id = Number(attemptId);
  if (!Number.isFinite(id) || id <= 0) {
    const err = new Error('Invalid attempt id');
    err.status = 400;
    throw err;
  }
  const data = await statsRepository.findAttemptReviewDetail(id, userId, lang);
  if (!data) {
    const err = new Error('Attempt not found');
    err.status = 404;
    throw err;
  }
  return data;
}

async function getMyLeaderboardRank(userId, period = 'all') {
  const row = await statsRepository.findUserLeaderboardRankByPeriod(userId, normalizePeriod(period));
  if (!row) {
    const appError = new Error('User not found');
    appError.status = 404;
    throw appError;
  }

  return {
    rank: Number(row.leaderboard_rank || 0),
    total_score: Number(row.total_score || 0),
    total_quizzes: Number(row.total_quizzes || 0),
    average_percentage: Number(row.average_percentage || 0),
  };
}

async function getMyLeaderboardAround(userId, period = 'all', radius = 3) {
  return statsRepository.findLeaderboardAroundUser(userId, normalizePeriod(period), radius);
}

module.exports = {
  getLeaderboard,
  getHomeSummary,
  getUserDashboard,
  getUserQuizAttempts,
  getAttemptReview,
  getMyLeaderboardRank,
  getMyLeaderboardAround,
};
