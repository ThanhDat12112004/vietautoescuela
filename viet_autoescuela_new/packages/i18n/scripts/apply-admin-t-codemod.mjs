import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webSrc = path.join(__dirname, '../../../apps/web/src');

const files = [
  'screens/Admin.tsx',
  'features/admin/users/admin-users-tab.tsx',
  'features/admin/materials/admin-materials-section.tsx',
  'features/admin/quizzes/admin-quizzes-section.tsx',
  'features/admin/admin.lang.ts',
];

const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-ui-extracted.json'), 'utf8'));

function slugifyEn(en) {
  const s = String(en || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 56);
  return s || 'x';
}

const used = new Map();
const mapped = [];
for (const row of rows) {
  let base = slugifyEn(row.en);
  let k = base;
  let n = 1;
  while (used.has(k)) {
    n += 1;
    k = `${base}_${n}`;
  }
  used.set(k, true);
  mapped.push({ vi: row.vi, es: row.es, en: row.en, key: `adminUi.${k}` });
}

mapped.sort((a, b) => {
  const la = a.vi.length + a.es.length + a.en.length;
  const lb = b.vi.length + b.es.length + b.en.length;
  return lb - la;
});

function reEsc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const rel of files) {
  const fp = path.join(webSrc, rel);
  let src = fs.readFileSync(fp, 'utf8');
  for (const { vi, es, en, key } of mapped) {
    const re = new RegExp(
      `adminT\\(\\s*lang\\s*,\\s*'${reEsc(vi)}'\\s*,\\s*'${reEsc(es)}'\\s*,\\s*'${reEsc(en)}'\\s*\\)`,
      'g'
    );
    src = src.replace(re, `tKey(lang, '${key}')`);
  }
  if (src.includes('adminT(')) {
    console.error('WARN: leftover adminT in', rel);
  }
  fs.writeFileSync(fp, src);
  console.error('Patched', rel);
}
