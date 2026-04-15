const fs = require('fs');
const path = require('path');

const premiumBillDir = path.join(__dirname, '../../uploads/premium-bills');

/** Các thư mục gốc chứa file giống media-service (`premium-bills/…`, `questions/…`). */
function collectMediaStorageRoots() {
  const roots = [];
  const raw = String(process.env.MEDIA_STORAGE_DIR || '').trim();
  const repoRoot = path.resolve(__dirname, '../../../../');
  if (raw) {
    if (path.isAbsolute(raw)) {
      roots.push(path.resolve(raw));
    } else {
      roots.push(path.resolve(process.cwd(), raw));
      roots.push(path.resolve(repoRoot, raw));
    }
  }
  // Monorepo: ảnh thường nằm trong media-service/storage dù user-service không set MEDIA_STORAGE_DIR
  roots.push(path.resolve(__dirname, '../../../media-service/storage'));
  const uniq = [...new Set(roots.map((r) => path.resolve(r)))];
  return uniq;
}

function sniffImageMime(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp';
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  return 'application/octet-stream';
}

/**
 * Đường dẫn tuyệt đối tới file biên lai trên đĩa (media CDN hoặc upload cũ).
 * Trả null nếu đã xóa / không tồn tại.
 */
function resolvePremiumBillAbsolutePath(row) {
  const storageKey = String(row?.bill_storage_path || '')
    .trim()
    .replace(/\\/g, '/');
  if (!storageKey || storageKey === '(removed)') {
    return null;
  }

  const tryUnderMediaRoots = (relKey) => {
    if (!relKey || !(relKey.startsWith('questions/') || relKey.startsWith('premium-bills/'))) {
      return null;
    }
    for (const root of collectMediaStorageRoots()) {
      const rootResolved = path.resolve(root);
      const abs = path.normalize(path.join(rootResolved, relKey));
      if (!abs.startsWith(rootResolved + path.sep) && abs !== rootResolved) {
        continue;
      }
      if (fs.existsSync(abs)) {
        return abs;
      }
    }
    return null;
  };

  if (/^questions\//i.test(storageKey)) {
    const hit = tryUnderMediaRoots(storageKey);
    if (hit) return hit;
  }

  if (/^premium-bills\//i.test(storageKey)) {
    const hit = tryUnderMediaRoots(storageKey);
    if (hit) return hit;
  }

  const filename = path.basename(storageKey);
  if (!filename || filename === '.' || filename === '..') {
    return null;
  }
  const legacyAbs = path.resolve(path.join(premiumBillDir, filename));
  const legacyRoot = path.resolve(premiumBillDir);
  if (legacyAbs.startsWith(legacyRoot) && fs.existsSync(legacyAbs)) {
    return legacyAbs;
  }

  return null;
}

/**
 * URL nội bộ tới media-service để tải ảnh khi không đọc được từ đĩa (Docker, ổ khác máy).
 */
function resolveInternalMediaBillFetchUrl(row) {
  const base = String(process.env.MEDIA_SERVICE_URL || '').replace(/\/$/, '');
  if (!base) return null;
  const key = String(row?.bill_storage_path || '')
    .trim()
    .replace(/\\/g, '/');
  if (/^(?:premium-bills|questions)\//i.test(key)) {
    return new URL(`/media/static/${key.replace(/^\//, '')}`, `${base}/`).href;
  }
  const cdn = String(row?.bill_cdn_url || '').trim();
  if (cdn.startsWith('/media/static/')) {
    return new URL(cdn, `${base}/`).href;
  }
  return null;
}

module.exports = {
  premiumBillDir,
  resolvePremiumBillAbsolutePath,
  resolveInternalMediaBillFetchUrl,
  sniffImageMime,
};
