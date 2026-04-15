/**
 * One-off helper: scan apps/web admin files for adminT(lang, 'vi', 'es', 'en')
 * and print JSON of unique triples for merging into adminUi namespace.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../../../apps/web/src');

const files = [
  'screens/Admin.tsx',
  'features/admin/users/admin-users-tab.tsx',
  'features/admin/materials/admin-materials-section.tsx',
  'features/admin/quizzes/admin-quizzes-section.tsx',
  'features/admin/admin.lang.ts',
];

function unescapeStr(s) {
  return s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

/** Extract single-quoted string starting at i; returns [value, endIndex] */
function parseQuoted(src, start) {
  if (src[start] !== "'") return null;
  let j = start + 1;
  let out = '';
  while (j < src.length) {
    const c = src[j];
    if (c === '\\') {
      out += src[j + 1] || '';
      j += 2;
      continue;
    }
    if (c === "'") return [unescapeStr(out), j + 1];
    out += c;
    j += 1;
  }
  return null;
}

function skipWs(src, i) {
  let j = i;
  while (j < src.length && /\s/.test(src[j])) j++;
  return j;
}

/**
 * Find adminT( then parse lang, comma, 3 quoted strings.
 * Returns { vi, es, en, end } or null.
 */
function parseAdminTCall(src, from) {
  const needle = 'adminT(';
  const idx = src.indexOf(needle, from);
  if (idx === -1) return null;
  let j = idx + needle.length;
  j = skipWs(src, j);
  // lang
  while (j < src.length && /[a-zA-Z0-9_.]/.test(src[j])) j++;
  j = skipWs(src, j);
  if (src[j] !== ',') return { next: idx + 1 };
  j++;
  j = skipWs(src, j);
  const a = parseQuoted(src, j);
  if (!a) return { next: idx + 1 };
  j = skipWs(src, a[1]);
  if (src[j] !== ',') return { next: idx + 1 };
  j++;
  j = skipWs(src, j);
  const b = parseQuoted(src, j);
  if (!b) return { next: idx + 1 };
  j = skipWs(src, b[1]);
  if (src[j] !== ',') return { next: idx + 1 };
  j++;
  j = skipWs(src, j);
  const c = parseQuoted(src, j);
  if (!c) return { next: idx + 1 };
  return { vi: a[0], es: b[0], en: c[0], end: c[1], next: c[1] };
}

function toKey(vi) {
  const base = vi
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48);
  return base || 'k';
}

const seen = new Map(); // vi -> { vi, es, en, keys: [] }

for (const rel of files) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) continue;
  const src = fs.readFileSync(fp, 'utf8');
  let pos = 0;
  while (pos < src.length) {
    const r = parseAdminTCall(src, pos);
    if (!r) break;
    if (!r.vi) {
      pos = r.next;
      continue;
    }
    const k = toKey(r.vi);
    if (!seen.has(r.vi)) {
      seen.set(r.vi, { vi: r.vi, es: r.es, en: r.en, slug: k, files: [] });
    }
    const e = seen.get(r.vi);
    if (!e.files.includes(rel)) e.files.push(rel);
    pos = r.end;
  }
}

const arr = [...seen.values()].sort((a, b) => a.vi.localeCompare(b.vi));
// resolve duplicate slugs
const slugCount = new Map();
for (const row of arr) {
  let s = row.slug;
  const n = (slugCount.get(s) || 0) + 1;
  slugCount.set(s, n);
  if (n > 1) row.slug = `${s}_${n}`;
}

console.log(JSON.stringify(arr, null, 2));
console.error('unique strings:', arr.length);
