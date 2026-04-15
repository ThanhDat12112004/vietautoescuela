const MATERIAL_IMAGE_PREFIX = 'material-images/';

function extractMaterialImageKeysFromHtml(html) {
  const text = String(html || '');
  if (!text) return new Set();

  const keys = new Set();
  const srcRegex = /src\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = srcRegex.exec(text)) != null) {
    const raw = String(match[1] || '').trim();
    if (!raw) continue;

    let key = '';
    try {
      const parsed = new URL(raw);
      key = parsed.pathname || '';
    } catch {
      key = raw;
    }

    if (key.startsWith('/media/static/')) key = key.slice('/media/static/'.length);
    if (key.startsWith('media/static/')) key = key.slice('media/static/'.length);
    if (key.startsWith('/')) key = key.slice(1);

    if (key.startsWith(MATERIAL_IMAGE_PREFIX)) {
      keys.add(key);
    }
  }

  return keys;
}

function extractMaterialImageKeysFromPost(post) {
  const result = new Set();
  if (!post) return result;

  const sources = [post.body_html_vi, post.body_html_es, post.body_html_en];
  for (const html of sources) {
    const keys = extractMaterialImageKeysFromHtml(html);
    for (const key of keys) result.add(key);
  }

  return result;
}

function diffRemovedMaterialImages(previousPost, nextPost) {
  const prev = extractMaterialImageKeysFromPost(previousPost);
  const next = extractMaterialImageKeysFromPost(nextPost);
  const removed = [];
  for (const key of prev) {
    if (!next.has(key)) removed.push(key);
  }
  return removed;
}

module.exports = {
  MATERIAL_IMAGE_PREFIX,
  extractMaterialImageKeysFromHtml,
  extractMaterialImageKeysFromPost,
  diffRemovedMaterialImages,
};
