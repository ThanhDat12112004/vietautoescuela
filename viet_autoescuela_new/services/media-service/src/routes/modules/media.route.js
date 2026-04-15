const express = require('express');
const multer = require('multer');
const mediaController = require('../../controllers/media.controller');
const { authRequired, requireRoles } = require('../../middleware/auth.middleware');

const router = express.Router();
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});
const uploadMaterial = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.get('/health', mediaController.health);
router.post(
  '/upload-image',
  authRequired,
  requireRoles('admin'),
  uploadImage.single('image'),
  mediaController.uploadImage
);
/** Ảnh biên lai Premium — lưu premium-bills/… (public qua /media/static). */
router.post(
  '/upload-premium-bill',
  authRequired,
  uploadImage.single('image'),
  mediaController.uploadPremiumBill
);
router.post('/upload-avatar', authRequired, uploadImage.single('image'), mediaController.uploadAvatar);
router.post(
  '/upload-material-image',
  authRequired,
  requireRoles('admin'),
  uploadImage.single('image'),
  mediaController.uploadMaterialImage
);
router.post(
  '/upload-material',
  authRequired,
  requireRoles('admin'),
  uploadMaterial.single('file'),
  mediaController.uploadMaterial
);
router.delete('/files', authRequired, requireRoles('admin'), mediaController.deleteFile);

module.exports = router;
