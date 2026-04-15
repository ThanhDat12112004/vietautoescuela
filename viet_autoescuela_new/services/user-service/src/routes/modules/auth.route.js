const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const authController = require('../../controllers/auth.controller');
const googleOauthController = require('../../controllers/google-oauth.controller');
const adminUserController = require('../../controllers/admin-user.controller');
const premiumPaymentController = require('../../controllers/premium-payment.controller');
const adminPremiumRequestsController = require('../../controllers/admin-premium-requests.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();

const premiumBillDir = path.join(__dirname, '../../../uploads/premium-bills');
fs.mkdirSync(premiumBillDir, { recursive: true });
const premiumBillUpload = multer({
  dest: premiumBillDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    if (!ok) {
      return cb(new Error('Only image files are allowed for bill'));
    }
    return cb(null, true);
  },
});

router.get('/oauth/google/status', googleOauthController.status);
router.get('/oauth/google/start', googleOauthController.start);
router.get('/oauth/google/callback', googleOauthController.callback);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/session', authRequired, authController.sessionPing);
router.get('/session/stream', authController.sessionStream);
router.post('/logout', authRequired, authController.logout);
router.patch('/me/avatar', authRequired, authController.updateMyAvatar);
router.patch('/me', authRequired, authController.updateMyProfile);

router.post('/premium-payment', authRequired, (req, res, next) => {
  const key = req.body && typeof req.body.bill_media_key === 'string' ? req.body.bill_media_key.trim() : '';
  if (key) {
    return premiumPaymentController.submitPremiumPaymentFromMedia(req, res, next);
  }
  return premiumBillUpload.single('bill')(req, res, (err) => {
    if (err) return next(err);
    return premiumPaymentController.submitPremiumPayment(req, res, next);
  });
});

router.get(
  '/admin/premium-requests',
  authRequired,
  requireRoles('admin'),
  adminPremiumRequestsController.list
);
router.get(
  '/admin/premium-requests/:id/bill',
  authRequired,
  requireRoles('admin'),
  adminPremiumRequestsController.getBill
);
router.post(
  '/admin/premium-requests/:id/approve',
  authRequired,
  requireRoles('admin'),
  adminPremiumRequestsController.approve
);
router.post(
  '/admin/premium-requests/:id/reject',
  authRequired,
  requireRoles('admin'),
  adminPremiumRequestsController.reject
);
router.delete(
  '/admin/premium-requests/:id',
  authRequired,
  requireRoles('admin'),
  adminPremiumRequestsController.destroy
);

router.get('/admin/users', authRequired, requireRoles('admin'), adminUserController.listUsers);
router.patch(
  '/admin/users/:id',
  authRequired,
  requireRoles('admin'),
  adminUserController.updateUser
);
router.delete(
  '/admin/users/:id',
  authRequired,
  requireRoles('admin'),
  adminUserController.deleteUser
);
router.post(
  '/admin/users/:id/lock',
  authRequired,
  requireRoles('admin'),
  adminUserController.lockUser
);
router.post(
  '/admin/users/:id/unlock',
  authRequired,
  requireRoles('admin'),
  adminUserController.unlockUser
);

module.exports = router;
