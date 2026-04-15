const pdfParse = require('pdf-parse');
const {
  saveImageFile,
  saveAvatarFile,
  saveMaterialFile,
  saveMaterialImageFile,
  savePremiumBillFile,
  deleteFileByKey,
} = require('./storage.service');

async function tryPdfPageCount(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) return null;
  try {
    const data = await pdfParse(buffer);
    const n = data?.numpages;
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/** Materials: PDF only (page count + storage use .pdf). */
const allowedMaterialMimeTypes = new Set(['application/pdf']);

async function uploadQuestionImage(file) {
  if (!file) {
    const appError = new Error("File is required with field name 'image'");
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveImageFile(file);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

async function uploadAvatarImage(file) {
  if (!file) {
    const appError = new Error("File is required with field name 'image'");
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveAvatarFile(file);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

async function uploadPremiumBillImage(file) {
  if (!file) {
    const appError = new Error("File is required with field name 'image'");
    appError.status = 400;
    throw appError;
  }

  const uploaded = await savePremiumBillFile(file);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

async function uploadMaterialImage(file) {
  if (!file) {
    const appError = new Error("File is required with field name 'image'");
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveMaterialImageFile(file);
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size };
}

async function uploadMaterialFile(file, langCode) {
  if (!file) {
    const appError = new Error("File is required with field name 'file'");
    appError.status = 400;
    throw appError;
  }

  const normalized = String(langCode || '')
    .trim()
    .toLowerCase();
  if (!['vi', 'es', 'en'].includes(normalized)) {
    const appError = new Error("lang_code must be 'vi', 'es', or 'en'");
    appError.status = 400;
    throw appError;
  }

  if (!allowedMaterialMimeTypes.has(file.mimetype)) {
    const appError = new Error('Unsupported file type');
    appError.status = 400;
    throw appError;
  }

  const uploaded = await saveMaterialFile(file, normalized);
  let pageCount = null;
  if (file.mimetype === 'application/pdf') {
    pageCount = await tryPdfPageCount(file.buffer);
  }
  return { key: uploaded.key, cdn_url: uploaded.cdnUrl, size: uploaded.size, page_count: pageCount };
}

async function removeFileByKey(input) {
  const result = await deleteFileByKey(input);
  return result;
}

module.exports = {
  uploadQuestionImage,
  uploadAvatarImage,
  uploadPremiumBillImage,
  uploadMaterialImage,
  uploadMaterialFile,
  removeFileByKey,
};
