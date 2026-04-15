const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const mediaStorageDir = process.env.MEDIA_STORAGE_DIR;

if (!mediaStorageDir) {
  throw new Error('Missing MEDIA_STORAGE_DIR in environment');
}

function toPublicMediaPath(relativePath) {
  return `/media/static/${relativePath}`;
}

function sanitizeExtension(filename) {
  if (!filename.includes('.')) {
    return 'bin';
  }

  const extension = filename.split('.').pop().toLowerCase();
  return extension.replace(/[^a-z0-9]/g, '') || 'jpg';
}

async function ensureStorageDir() {
  await fs.mkdir(mediaStorageDir, { recursive: true });
}

async function saveFile(file, dirRelative, defaultExtension = 'bin') {
  await ensureStorageDir();

  const extension = file.originalname.includes('.')
    ? sanitizeExtension(file.originalname)
    : defaultExtension;
  const name = `${randomUUID().replace(/-/g, '')}.${extension}`;
  const relativePath = path.join(dirRelative, name).replace(/\\/g, '/');
  const absoluteDir = path.join(mediaStorageDir, dirRelative);
  const absolutePath = path.join(mediaStorageDir, relativePath);

  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);

  return {
    key: relativePath,
    cdnUrl: toPublicMediaPath(relativePath),
    size: file.size,
  };
}

async function saveImageFile(file) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('questions', String(year)), 'jpg');
}

async function saveAvatarFile(file) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('avatars', String(year)), 'jpg');
}

async function saveMaterialFile(file, langCode) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('materials', langCode, String(year)), 'pdf');
}

async function saveMaterialImageFile(file) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('material-images', String(year)), 'jpg');
}

/** Biên lai Premium — lưu `premium-bills/…`, phục vụ công khai qua `/media/static/…`. */
async function savePremiumBillFile(file) {
  const year = new Date().getFullYear();
  return saveFile(file, path.join('premium-bills', String(year)), 'jpg');
}

function parseMediaKeyFromInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    return parseMediaKeyFromInput(`${parsed.pathname}${parsed.search}${parsed.hash}`);
  } catch {
    // not a full URL
  }

  let normalized = raw;
  if (normalized.startsWith('/media/static/')) {
    normalized = normalized.slice('/media/static/'.length);
  } else if (normalized.startsWith('media/static/')) {
    normalized = normalized.slice('media/static/'.length);
  } else if (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }

  if (!normalized || normalized.includes('..') || normalized.includes('\\')) {
    return '';
  }
  return normalized.replace(/^\/+/, '');
}

async function deleteFileByKey(input) {
  const key = parseMediaKeyFromInput(input);
  if (!key) return { deleted: false, reason: 'invalid_key' };

  const absolutePath = path.resolve(mediaStorageDir, key);
  const baseDir = path.resolve(mediaStorageDir);
  if (!absolutePath.startsWith(`${baseDir}${path.sep}`) && absolutePath !== baseDir) {
    return { deleted: false, reason: 'invalid_path' };
  }

  try {
    await fs.unlink(absolutePath);
    return { deleted: true, key };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { deleted: false, reason: 'not_found', key };
    }
    throw error;
  }
}

module.exports = {
  saveImageFile,
  saveAvatarFile,
  saveMaterialFile,
  saveMaterialImageFile,
  savePremiumBillFile,
  parseMediaKeyFromInput,
  deleteFileByKey,
};
