import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fp = path.join(__dirname, 'build-page-fragments.mjs');
let s = fs.readFileSync(fp, 'utf8');

function trimLeadingBlank(s0) {
  return s0.replace(/^\s*\n/, '');
}

const viSnip = trimLeadingBlank(
  fs.readFileSync(path.join(__dirname, 'admin-ui-vi-snippet.txt'), 'utf8')
);
const esSnip = trimLeadingBlank(
  fs.readFileSync(path.join(__dirname, 'admin-ui-es-snippet.txt'), 'utf8')
);
const enSnip = trimLeadingBlank(
  fs.readFileSync(path.join(__dirname, 'admin-ui-en-snippet.txt'), 'utf8')
);

const viMark = `      correctParen: 'Đúng',
      loading: 'Đang tải...',
    },
    adminUser: {`;
const viRepl = `      correctParen: 'Đúng',
      loading: 'Đang tải...',
    },
${viSnip}
    adminUser: {`;

const esMark = `    correctParen: 'Correcta',
    loading: 'Cargando...',
  },
  adminUser: {`;
const esRepl = `    correctParen: 'Correcta',
    loading: 'Cargando...',
  },
${esSnip}
  adminUser: {`;

const enMark = `    correctParen: 'Correct',
    loading: 'Loading...',
  },
  adminUser: {`;
const enRepl = `    correctParen: 'Correct',
    loading: 'Loading...',
  },
${enSnip}
  adminUser: {`;

if (!s.includes(viMark)) throw new Error('vi marker not found');
if (!s.includes(esMark)) throw new Error('es marker not found');
if (!s.includes(enMark)) throw new Error('en marker not found');

s = s.replace(viMark, viRepl);
s = s.replace(esMark, esRepl);
s = s.replace(enMark, enRepl);

fs.writeFileSync(fp, s);
console.error('Injected adminUi into build-page-fragments.mjs');
