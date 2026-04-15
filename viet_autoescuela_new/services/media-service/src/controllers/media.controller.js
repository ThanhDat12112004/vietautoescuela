const mediaService = require('../services/media.service');

function health(_req, res) {
  return res.json({ service: 'media-service', status: 'ok' });
}

async function uploadImage(req, res, next) {
  try {
    const result = await mediaService.uploadQuestionImage(req.file);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    const result = await mediaService.uploadAvatarImage(req.file);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function uploadPremiumBill(req, res, next) {
  try {
    const result = await mediaService.uploadPremiumBillImage(req.file);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function uploadMaterialImage(req, res, next) {
  try {
    const result = await mediaService.uploadMaterialImage(req.file);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function uploadMaterial(req, res, next) {
  try {
    const langCode = req.body?.lang_code;
    const result = await mediaService.uploadMaterialFile(req.file, langCode);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteFile(req, res, next) {
  try {
    const key = String(req.body?.key || req.body?.file_key || req.body?.cdn_url || '').trim();
    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }
    const result = await mediaService.removeFileByKey(key);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  health,
  uploadImage,
  uploadAvatar,
  uploadPremiumBill,
  uploadMaterialImage,
  uploadMaterial,
  deleteFile,
};
