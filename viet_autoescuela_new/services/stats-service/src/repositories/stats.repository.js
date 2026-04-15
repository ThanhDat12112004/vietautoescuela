const pool = require('../config/db');
const { pickCol } = require('../utils/lang');

async function findUserSessionById(userId) {
  const [rows] = await pool.execute(
    `SELECT id, role, is_active, current_session_id, premium_plan, premium_until
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findLeaderboard(limit = 20) {
  const [rows] = await pool.query(
    `SELECT
       id,
       username,
       full_name,
       avatar_url,
       total_score,
       total_quizzes,
       total_correct,
       total_questions,
       average_percentage
     FROM users
     WHERE is_active = TRUE
     ORDER BY total_score DESC, average_percentage DESC, total_correct DESC
     LIMIT ?`,
    [limit]
  );

  return rows;
}

function normalizePeriod(period) {
  const value = String(period || 'all').trim().toLowerCase();
  if (value === 'week' || value === 'month') return value;
  return 'all';
}

function getPeriodStartDate(period) {
  const now = new Date();
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start;
  }
  if (period === 'month') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return start;
  }
  return null;
}

async function findLeaderboardByPeriod(period = 'all', limit = 20) {
  const safePeriod = normalizePeriod(period);
  if (safePeriod === 'all') {
    return findLeaderboard(limit);
  }

  const startDate = getPeriodStartDate(safePeriod);
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.username,
       u.full_name,
       u.avatar_url,
       ROUND(COALESCE(SUM(a.score), 0), 1) AS total_score,
       COUNT(a.id) AS total_quizzes,
       COALESCE(SUM(a.correct_count), 0) AS total_correct,
       COALESCE(SUM(a.total_questions), 0) AS total_questions,
       CASE
         WHEN COALESCE(SUM(a.total_questions), 0) > 0
           THEN ROUND((COALESCE(SUM(a.correct_count), 0) / COALESCE(SUM(a.total_questions), 0)) * 100, 1)
         ELSE 0
       END AS average_percentage
     FROM users u
     LEFT JOIN user_quiz_attempts a
       ON a.user_id = u.id
      AND a.status = 'completed'
      AND a.completed_at >= ?
     WHERE u.is_active = TRUE
     GROUP BY u.id, u.username, u.full_name, u.avatar_url
     HAVING COUNT(a.id) > 0
     ORDER BY total_score DESC, average_percentage DESC, total_correct DESC
     LIMIT ?`,
    [startDate, limit]
  );

  return rows;
}

async function findHomeSummary() {
  const [[questionsRow]] = await pool.query(`SELECT COUNT(*) AS total_questions FROM questions`);

  const [[studentsRow]] = await pool.query(
    `SELECT COUNT(*) AS total_students
     FROM users
     WHERE is_active = TRUE AND role = 'student'`
  );

  const [[attemptsRow]] = await pool.query(
    `SELECT
       COUNT(*) AS total_completed,
       SUM(CASE WHEN a.percentage >= q.passing_score THEN 1 ELSE 0 END) AS total_passed
     FROM user_quiz_attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.status = 'completed'`
  );

  const totalCompleted = Number(attemptsRow.total_completed || 0);
  const totalPassed = Number(attemptsRow.total_passed || 0);
  const passRate =
    totalCompleted > 0 ? Number(((totalPassed / totalCompleted) * 100).toFixed(1)) : 0;

  const [[quizzesRow]] = await pool.query(
    `SELECT COUNT(*) AS total_quizzes
     FROM quizzes q
     LEFT JOIN quiz_categories c ON c.id = q.category_id
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = c.quiz_topic_group_id
     WHERE q.is_active = TRUE
       AND (
         q.category_id IS NULL
         OR (c.is_active = TRUE AND qtg.is_active = TRUE)
       )`
  );

  return {
    total_questions: Number(questionsRow.total_questions || 0),
    total_quizzes: Number(quizzesRow?.total_quizzes || 0),
    total_students: Number(studentsRow.total_students || 0),
    pass_rate: passRate,
    total_attempts: totalCompleted,
  };
}

async function findUserStats(userId) {
  const [rows] = await pool.query(
    `SELECT
       id,
       username,
       full_name,
       avatar_url,
       total_score,
       total_quizzes,
       total_correct,
       total_questions,
       average_percentage
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findUserAttemptHistory(userId, lang, limit = 30) {
  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.quiz_id,
       CAST(a.quiz_id AS CHAR) AS quiz_code,
       q.${pickCol(lang, 'title_vi', 'title_es', 'title_en')} AS quiz_title,
       a.score,
       a.percentage,
       a.correct_count,
       a.total_questions,
       a.status,
       a.started_at,
       a.completed_at,
       CASE
         WHEN a.completed_at IS NOT NULL
         THEN TIMESTAMPDIFF(SECOND, a.started_at, a.completed_at)
         ELSE NULL
       END AS duration_seconds
     FROM user_quiz_attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.user_id = ?
     ORDER BY COALESCE(a.completed_at, a.started_at) DESC
     LIMIT ?`,
    [userId, limit]
  );

  return rows;
}

/** Mỗi quiz một dòng: lần làm điểm cao nhất (tie: %, rồi ngày) + số lần đã làm. Cần MySQL 8+ / MariaDB window. */
async function findUserQuizSummaries(userId, lang) {
  const titleCol = pickCol(lang, 'title_vi', 'title_es', 'title_en');
  const [rows] = await pool.query(
    `SELECT
       x.quiz_id,
       x.quiz_title,
       x.id AS best_attempt_id,
       x.score AS best_score,
       x.percentage AS best_percentage,
       x.correct_count AS best_correct_count,
       x.total_questions AS best_total_questions,
       x.completed_at AS best_completed_at,
       x.duration_seconds AS best_duration_seconds,
       x.attempt_count
     FROM (
       SELECT
         a.id,
         a.quiz_id,
         q.${titleCol} AS quiz_title,
         a.score,
         a.percentage,
         a.correct_count,
         a.total_questions,
         a.completed_at,
         CASE
           WHEN a.completed_at IS NOT NULL
           THEN TIMESTAMPDIFF(SECOND, a.started_at, a.completed_at)
           ELSE NULL
         END AS duration_seconds,
         COUNT(*) OVER (PARTITION BY a.quiz_id) AS attempt_count,
         ROW_NUMBER() OVER (
           PARTITION BY a.quiz_id
           ORDER BY a.score DESC, a.percentage DESC, COALESCE(a.completed_at, a.started_at) DESC
         ) AS rn
       FROM user_quiz_attempts a
       JOIN quizzes q ON q.id = a.quiz_id
       WHERE a.user_id = ? AND a.status = 'completed'
     ) x
     WHERE x.rn = 1
     ORDER BY x.completed_at DESC`,
    [userId]
  );

  return rows;
}

async function findUserAttemptsForQuiz(userId, quizId) {
  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.score,
       a.percentage,
       a.correct_count,
       a.total_questions,
       a.started_at,
       a.completed_at,
       CASE
         WHEN a.completed_at IS NOT NULL
         THEN TIMESTAMPDIFF(SECOND, a.started_at, a.completed_at)
         ELSE NULL
       END AS duration_seconds
     FROM user_quiz_attempts a
     WHERE a.user_id = ? AND a.quiz_id = ? AND a.status = 'completed'
     ORDER BY COALESCE(a.completed_at, a.started_at) DESC`,
    [userId, quizId]
  );

  return rows;
}

async function findAttemptReviewDetail(attemptId, userId, lang) {
  const titleCol = pickCol(lang, 'title_vi', 'title_es', 'title_en');
  const qText = pickCol(lang, 'question_text_vi', 'question_text_es', 'question_text_en');
  const expCol = pickCol(lang, 'explanation_vi', 'explanation_es', 'explanation_en');
  const ansText = pickCol(lang, 'answer_text_vi', 'answer_text_es', 'answer_text_en');

  const [attemptRows] = await pool.execute(
    `SELECT
       a.id,
       a.quiz_id,
       a.score,
       a.percentage,
       a.correct_count,
       a.total_questions,
       a.started_at,
       a.completed_at,
       CASE
         WHEN a.completed_at IS NOT NULL
         THEN TIMESTAMPDIFF(SECOND, a.started_at, a.completed_at)
         ELSE NULL
       END AS duration_seconds,
       q.${titleCol} AS quiz_title
     FROM user_quiz_attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.id = ?
       AND a.user_id = ?
       AND a.status = 'completed'
     LIMIT 1`,
    [attemptId, userId]
  );

  const attempt = attemptRows[0];
  if (!attempt) return null;

  const [questions] = await pool.query(
    `SELECT id, order_number, ${qText} AS question_text, image_url, ${expCol} AS explanation
     FROM questions
     WHERE quiz_id = ?
     ORDER BY order_number ASC`,
    [attempt.quiz_id]
  );

  const qids = questions.map((q) => q.id);
  let answerRows = [];
  if (qids.length) {
    const [ar] = await pool.query(
      `SELECT id, question_id, order_number, ${ansText} AS answer_text, is_correct
       FROM answers
       WHERE question_id IN (?)
       ORDER BY question_id, order_number`,
      [qids]
    );
    answerRows = ar;
  }

  const [userAnsRows] = await pool.query(
    `SELECT question_id, selected_answer_id, is_correct
     FROM user_answers
     WHERE attempt_id = ?`,
    [attemptId]
  );

  const uaByQ = new Map(userAnsRows.map((u) => [Number(u.question_id), u]));
  const answersByQ = new Map();
  for (const ans of answerRows) {
    const qid = Number(ans.question_id);
    if (!answersByQ.has(qid)) answersByQ.set(qid, []);
    answersByQ.get(qid).push({
      id: Number(ans.id),
      answer_text: ans.answer_text,
      is_correct: Boolean(ans.is_correct),
    });
  }

  const questionsOut = questions.map((q) => {
    const qid = Number(q.id);
    const ua = uaByQ.get(qid);
    return {
      id: qid,
      order_number: Number(q.order_number),
      question_text: q.question_text,
      image_url: q.image_url,
      explanation: q.explanation,
      selected_answer_id: ua?.selected_answer_id != null ? Number(ua.selected_answer_id) : null,
      is_correct: ua?.is_correct != null ? Boolean(ua.is_correct) : null,
      answers: answersByQ.get(qid) || [],
    };
  });

  return {
    attempt: {
      id: Number(attempt.id),
      quiz_id: Number(attempt.quiz_id),
      quiz_title: attempt.quiz_title,
      score: Number(attempt.score),
      percentage: Number(attempt.percentage),
      correct_count: Number(attempt.correct_count),
      total_questions: Number(attempt.total_questions),
      started_at: attempt.started_at,
      completed_at: attempt.completed_at,
      duration_seconds:
        attempt.duration_seconds != null ? Number(attempt.duration_seconds) : null,
    },
    questions: questionsOut,
  };
}

/** Thứ hạng global (1 = cao nhất), cùng logic sắp xếp với findLeaderboard */
async function findUserLeaderboardRank(userId) {
  const [[row]] = await pool.query(
    `SELECT
       (
         SELECT COUNT(*)
         FROM users u2
         WHERE u2.is_active = TRUE
           AND (
             u2.total_score > u.total_score
             OR (
               u2.total_score = u.total_score
               AND u2.average_percentage > u.average_percentage
             )
             OR (
               u2.total_score = u.total_score
               AND u2.average_percentage = u.average_percentage
               AND u2.total_correct > u.total_correct
             )
           )
       ) + 1 AS leaderboard_rank,
       u.total_score,
       u.total_quizzes,
       u.average_percentage
     FROM users u
     WHERE u.id = ? AND u.is_active = TRUE
     LIMIT 1`,
    [userId]
  );

  return row || null;
}

async function findUserLeaderboardRankByPeriod(userId, period = 'all') {
  const safePeriod = normalizePeriod(period);
  if (safePeriod === 'all') {
    return findUserLeaderboardRank(userId);
  }

  const startDate = getPeriodStartDate(safePeriod);
  const [[target]] = await pool.query(
    `SELECT
       u.id,
       ROUND(COALESCE(SUM(a.score), 0), 1) AS total_score,
       COUNT(a.id) AS total_quizzes,
       COALESCE(SUM(a.correct_count), 0) AS total_correct,
       CASE
         WHEN COALESCE(SUM(a.total_questions), 0) > 0
           THEN ROUND((COALESCE(SUM(a.correct_count), 0) / COALESCE(SUM(a.total_questions), 0)) * 100, 1)
         ELSE 0
       END AS average_percentage
     FROM users u
     LEFT JOIN user_quiz_attempts a
       ON a.user_id = u.id
      AND a.status = 'completed'
      AND a.completed_at >= ?
     WHERE u.id = ? AND u.is_active = TRUE
     GROUP BY u.id`,
    [startDate, userId]
  );

  if (!target || Number(target.total_quizzes || 0) <= 0) return null;

  const [[rankRow]] = await pool.query(
    `SELECT
       COUNT(*) + 1 AS leaderboard_rank
     FROM (
       SELECT
         u.id,
         ROUND(COALESCE(SUM(a.score), 0), 1) AS total_score,
         COALESCE(SUM(a.correct_count), 0) AS total_correct,
         CASE
           WHEN COALESCE(SUM(a.total_questions), 0) > 0
             THEN ROUND((COALESCE(SUM(a.correct_count), 0) / COALESCE(SUM(a.total_questions), 0)) * 100, 1)
           ELSE 0
         END AS average_percentage,
         COUNT(a.id) AS total_quizzes
       FROM users u
       LEFT JOIN user_quiz_attempts a
         ON a.user_id = u.id
        AND a.status = 'completed'
        AND a.completed_at >= ?
       WHERE u.is_active = TRUE
       GROUP BY u.id
       HAVING COUNT(a.id) > 0
     ) x
     WHERE
       x.total_score > ?
       OR (x.total_score = ? AND x.average_percentage > ?)
       OR (x.total_score = ? AND x.average_percentage = ? AND x.total_correct > ?)`,
    [
      startDate,
      Number(target.total_score || 0),
      Number(target.total_score || 0),
      Number(target.average_percentage || 0),
      Number(target.total_score || 0),
      Number(target.average_percentage || 0),
      Number(target.total_correct || 0),
    ]
  );

  return {
    leaderboard_rank: Number(rankRow?.leaderboard_rank || 0),
    total_score: Number(target.total_score || 0),
    total_quizzes: Number(target.total_quizzes || 0),
    average_percentage: Number(target.average_percentage || 0),
  };
}

async function findLeaderboardAroundUser(userId, period = 'all', radius = 3) {
  const safePeriod = normalizePeriod(period);
  const safeRadius = Math.min(Math.max(Number(radius || 3), 1), 10);
  const poolLimit = 500;
  const rows = await findLeaderboardByPeriod(safePeriod, poolLimit);
  const idx = rows.findIndex((item) => Number(item.id) === Number(userId));
  if (idx < 0) return [];
  const start = Math.max(0, idx - safeRadius);
  const end = Math.min(rows.length, idx + safeRadius + 1);
  return rows.slice(start, end).map((item, index) => ({
    ...item,
    rank: start + index + 1,
  }));
}

module.exports = {
  findUserSessionById,
  findLeaderboard,
  findLeaderboardByPeriod,
  findHomeSummary,
  findUserStats,
  findUserAttemptHistory,
  findUserQuizSummaries,
  findUserAttemptsForQuiz,
  findAttemptReviewDetail,
  findUserLeaderboardRank,
  findUserLeaderboardRankByPeriod,
  findLeaderboardAroundUser,
};
