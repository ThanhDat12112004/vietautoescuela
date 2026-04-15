const express = require('express');
const statsController = require('../../controllers/stats.controller');
const { authRequired } = require('../../middleware/auth.middleware');
const { cacheGet } = require('../../middleware/cache.middleware');

const router = express.Router();

router.get('/leaderboard', cacheGet(15_000), statsController.getLeaderboard);
router.get('/leaderboard/me', authRequired, statsController.getMyLeaderboardRank);
router.get('/leaderboard/me/around', authRequired, statsController.getMyLeaderboardAround);
router.get('/summary', cacheGet(30_000), statsController.getSummary);
router.get('/me/dashboard', authRequired, statsController.getMyDashboard);
router.get('/me/quizzes/:quizId/attempts', authRequired, statsController.getMyQuizAttempts);
router.get('/me/attempts/:attemptId/review', authRequired, statsController.getMyAttemptReview);
router.get('/users/:id/dashboard', authRequired, statsController.getUserDashboard);
router.get(
  '/users/:userId/quizzes/:quizId/attempts',
  authRequired,
  statsController.getQuizAttemptsForUser
);
router.get(
  '/users/:userId/attempts/:attemptId/review',
  authRequired,
  statsController.getAttemptReviewForUser
);

module.exports = router;
