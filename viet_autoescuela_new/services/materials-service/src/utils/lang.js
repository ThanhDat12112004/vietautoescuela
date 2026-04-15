function getLang(lang) {
  const s = String(lang || 'vi')
    .trim()
    .toLowerCase();
  if (s === 'es') return 'es';
  if (s === 'en') return 'en';
  return 'vi';
}

function pickCol(lang, viCol, esCol, enCol) {
  const l = getLang(lang);
  if (l === 'es') return esCol;
  if (l === 'en') return enCol;
  return viCol;
}

module.exports = { getLang, pickCol };
