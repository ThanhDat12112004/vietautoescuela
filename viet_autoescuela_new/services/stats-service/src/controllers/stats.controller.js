const statsService = require('../services/stats.service');
const { getLang } = require('../utils/lang');
const { normalizePeriod, parseLimit, parseRadius } = require('../validators/stats.validator');

async function getLeaderboard(req, res, next) {
  try {
    const limit = parseLimit(req.query.limit, 10, 1, 100);
    const period = normalizePeriod(req.query.period);
    const data = await statsService.getLeaderboard(limit, period);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getSummary(_req, res, next) {
  try {
    const data = await statsService.getHomeSummary();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMyDashboard(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const data = await statsService.getUserDashboard(req.user.id, lang);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getUserDashboard(req, res, next) {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const isOwner = userId === req.user.id;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const lang = getLang(req.query.lang);
    const data = await statsService.getUserDashboard(userId, lang);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMyQuizAttempts(req, res, next) {
  const quizId = Number(req.params.quizId);
  if (Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz id' });
  }

  try {
    const data = await statsService.getUserQuizAttempts(req.user.id, quizId);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMyAttemptReview(req, res, next) {
  const attemptId = Number(req.params.attemptId);
  if (Number.isNaN(attemptId)) {
    return res.status(400).json({ message: 'Invalid attempt id' });
  }

  try {
    const lang = getLang(req.query.lang);
    const data = await statsService.getAttemptReview(attemptId, req.user.id, lang);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

function assertSelfOrAdmin(req, targetUserId) {
  const isOwner = targetUserId === req.user.id;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return false;
  }
  return true;
}

async function getQuizAttemptsForUser(req, res, next) {
  const userId = Number(req.params.userId);
  const quizId = Number(req.params.quizId);
  if (Number.isNaN(userId) || Number.isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid user id or quiz id' });
  }
  if (!assertSelfOrAdmin(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const data = await statsService.getUserQuizAttempts(userId, quizId);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getAttemptReviewForUser(req, res, next) {
  const userId = Number(req.params.userId);
  const attemptId = Number(req.params.attemptId);
  if (Number.isNaN(userId) || Number.isNaN(attemptId)) {
    return res.status(400).json({ message: 'Invalid user id or attempt id' });
  }
  if (!assertSelfOrAdmin(req, userId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const lang = getLang(req.query.lang);
    const data = await statsService.getAttemptReview(attemptId, userId, lang);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMyLeaderboardRank(req, res, next) {
  try {
    const period = normalizePeriod(req.query.period);
    const data = await statsService.getMyLeaderboardRank(req.user.id, period);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMyLeaderboardAround(req, res, next) {
  try {
    const period = normalizePeriod(req.query.period);
    const radius = parseRadius(req.query.radius, 3, 1, 10);
    const data = await statsService.getMyLeaderboardAround(req.user.id, period, radius);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLeaderboard,
  getSummary,
  getMyDashboard,
  getUserDashboard,
  getMyQuizAttempts,
  getMyAttemptReview,
  getQuizAttemptsForUser,
  getAttemptReviewForUser,
  getMyLeaderboardRank,
  getMyLeaderboardAround,
};
