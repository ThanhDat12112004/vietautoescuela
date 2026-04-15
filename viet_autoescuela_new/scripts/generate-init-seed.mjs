/**
 * Sinh khối INSERT trực tiếp cho infra/mysql/init.sql
 * (dữ liệu mẫu lý thuyết lái xe Tây Ban Nha / Việt Autoescuela).
 * Chạy: node scripts/generate-init-seed.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "''");
}

// --- Quiz topic groups ---
const qGroups = [
  { id: 1, code: 'B1_LT', vi: 'Lý thuyết bằng B — Luật & quy tắc', es: 'Teoría B — Normas y reglas', en: 'Class B theory — Rules and law', rand: 1, tier: 'free' },
  { id: 2, code: 'B1_BB', vi: 'Biển báo & hiệu lệnh', es: 'Señales y órdenes', en: 'Signs and orders', rand: 1, tier: 'free' },
  { id: 3, code: 'B1_AT', vi: 'An toàn & xử lý tình huống', es: 'Seguridad y situaciones', en: 'Safety and situations', rand: 0, tier: 'free' },
  { id: 4, code: 'B1_PREM', vi: 'Ôn luyện nâng cao (Premium)', es: 'Repaso avanzado (Premium)', en: 'Advanced prep (Premium)', rand: 1, tier: 'premium' },
];

const qCats = [
  { id: 1, g: 1, vi: 'Khái niệm & quy tắc chung', es: 'Conceptos generales', en: 'General concepts', slug: 'b1-khai-niem' },
  { id: 2, g: 1, vi: 'Tốc độ & vượt xe', es: 'Velocidad y adelantamientos', en: 'Speed and overtaking', slug: 'b1-toc-do' },
  { id: 3, g: 1, vi: 'Dừng, đỗ & ưu tiên', es: 'Paradas y prioridad', en: 'Stopping and priority', slug: 'b1-uu-tien' },
  { id: 4, g: 2, vi: 'Biển cấm', es: 'Prohibición', en: 'Prohibition signs', slug: 'bb-cam' },
  { id: 5, g: 2, vi: 'Biển nguy hiểm', es: 'Peligro', en: 'Warning signs', slug: 'bb-nguy-hiem' },
  { id: 6, g: 2, vi: 'Biển hiệu lệnh & chỉ dẫn', es: 'Obligación e indicación', en: 'Mandatory and guide', slug: 'bb-lenh' },
  { id: 7, g: 3, vi: 'Khoảng cách an toàn', es: 'Distancia de seguridad', en: 'Safe distance', slug: 'at-kc' },
  { id: 8, g: 3, vi: 'Nồng độ cồn & điểm mù', es: 'Alcohol y puntos ciegos', en: 'Alcohol and blind spots', slug: 'at-con' },
  { id: 9, g: 4, vi: 'Đề tổng hợp 1', es: 'Examen mixto 1', en: 'Mixed set 1', slug: 'prem-m1' },
  { id: 10, g: 4, vi: 'Đề tổng hợp 2', es: 'Examen mixto 2', en: 'Mixed set 2', slug: 'prem-m2' },
];

const bank = [
  {
    q: {
      vi: 'Trên đường đô thị, tốc độ tối đa cho ô tô con (trừ khi biển báo khác) thường là bao nhiêu?',
      es: 'En vía urbana, ¿cuál es la velocidad máxima genérica para turismos si no indica otra señal?',
      en: 'In urban areas, what is the usual max speed for cars unless signed otherwise?',
    },
    exp: { vi: 'Theo quy định chung TBN (trừ khi có biển), thường 50 km/h trong đô thị.', es: 'En España suele ser 50 km/h en travesías urbanas salvo señalización.', en: 'In Spain typically 50 km/h in built-up areas unless otherwise posted.' },
    opts: [
      { vi: '30 km/h', es: '30 km/h', en: '30 km/h', ok: false },
      { vi: '50 km/h', es: '50 km/h', en: '50 km/h', ok: true },
      { vi: '70 km/h', es: '70 km/h', en: '70 km/h', ok: false },
    ],
  },
  {
    q: {
      vi: 'Khi nào được phép vượt xe bên phải?',
      es: '¿Cuándo está permitido adelantar por la derecha?',
      en: 'When is overtaking on the right allowed?',
    },
    exp: { vi: 'Thường chỉ khi các làn cùng hướng chuyển chậm / kẹt có hàng, theo luật địa phương.', es: 'Solo en colas lentas o carriles paralelos según normativa.', en: 'Typically only in slow parallel lanes / queues per local rules.' },
    opts: [
      { vi: 'Luôn được trên đường một chiều', es: 'Siempre en sentido único', en: 'Always on one-way roads', ok: false },
      { vi: 'Khi có nhiều làn cùng chiều và tình huống cho phép', es: 'Con varios carriles y situación permitida', en: 'With multiple lanes when situation allows', ok: true },
      { vi: 'Chỉ ban đêm', es: 'Solo de noche', en: 'Only at night', ok: false },
    ],
  },
  {
    q: {
      vi: 'Tín hiệu đèn đỏ tại giao lộ có nghĩa gì?',
      es: '¿Qué significa el semáforo en rojo en un cruce?',
      en: 'What does a red traffic light at a junction mean?',
    },
    exp: { vi: 'Dừng trước vạch dừng; không được đi (trừ quy định rẽ phải nơi cho phép).', es: 'Detenerse; no pasar salvo giro autorizado donde aplique.', en: 'Stop; do not proceed unless permitted turn applies.' },
    opts: [
      { vi: 'Giảm tốc rồi đi nếu không có xe', es: 'Reducir y pasar si no hay coches', en: 'Slow and go if clear', ok: false },
      { vi: 'Dừng và chờ tín hiệu xanh', es: 'Parar y esperar verde', en: 'Stop and wait for green', ok: true },
      { vi: 'Bấm còi và đi', es: 'Tocar claxon y pasar', en: 'Honk and go', ok: false },
    ],
  },
  {
    q: {
      vi: 'Khoảng cách an toàn phụ thuộc chủ yếu vào điều gì?',
      es: '¿En qué depende principalmente la distancia de seguridad?',
      en: 'What does safe following distance mainly depend on?',
    },
    exp: { vi: 'Tốc độ, điều kiện đường, mưa và phản ứng người lái.', es: 'Velocidad, adherencia, lluvia y tiempo de reacción.', en: 'Speed, grip, weather, and reaction time.' },
    opts: [
      { vi: 'Chỉ loại xe', es: 'Solo tipo de vehículo', en: 'Only vehicle type', ok: false },
      { vi: 'Tốc độ và điều kiện mặt đường', es: 'Velocidad y adherencia', en: 'Speed and road conditions', ok: true },
      { vi: 'Màu xe', es: 'Color del coche', en: 'Car color', ok: false },
    ],
  },
  {
    q: {
      vi: 'Biển hình tròn viền đỏ nền trắng (không có gạch chéo) thường là nhóm gì?',
      es: 'Señal circular borde rojo fondo blanco sin banda: ¿grupo?',
      en: 'Circular red border white face — which sign group?',
    },
    exp: { vi: 'Thường là biển cấm (prohibición).', es: 'Prohibición.', en: 'Prohibition.' },
    opts: [
      { vi: 'Biển cấm', es: 'Prohibición', en: 'Prohibition', ok: true },
      { vi: 'Biển nguy hiểm', es: 'Peligro', en: 'Warning', ok: false },
      { vi: 'Biển chỉ dẫn', es: 'Indicación', en: 'Guide', ok: false },
    ],
  },
  {
    q: {
      vi: 'Người đi bộ đang qua vạch zebra, người lái phải làm gì?',
      es: 'Peatones en paso de cebra: ¿acción del conductor?',
      en: 'Pedestrians on zebra crossing — driver must?',
    },
    exp: { vi: 'Nhường đường, dừng nếu cần.', es: 'Ceder el paso; detenerse si hace falta.', en: 'Yield; stop if needed.' },
    opts: [
      { vi: 'Bấm còi để họ chạy nhanh', es: 'Claxon para que corran', en: 'Honk so they hurry', ok: false },
      { vi: 'Nhường và dừng khi có người qua đường', es: 'Ceder y parar si cruzan', en: 'Yield and stop when crossing', ok: true },
      { vi: 'Tăng tốc vượt trước', es: 'Acelerar y adelantar', en: 'Speed up and pass', ok: false },
    ],
  },
  {
    q: {
      vi: 'Điện thoại cầm tay khi lái xe ở TBN?',
      es: '¿Móvil en mano conduciendo en España?',
      en: 'Handheld phone while driving in Spain?',
    },
    exp: { vi: 'Cấm; chỉ hands-free đúng quy định.', es: 'Prohibido; manos libres autorizado.', en: 'Banned; hands-free per rules only.' },
    opts: [
      { vi: 'Được nếu đi chậm', es: 'Sí si vas lento', en: 'OK if slow', ok: false },
      { vi: 'Cấm cầm tay; dùng hands-free theo quy định', es: 'Prohibido mano; manos libres', en: 'No handheld; hands-free only', ok: true },
      { vi: 'Chỉ cấm trên cao tốc', es: 'Solo en autopista', en: 'Only on motorways', ok: false },
    ],
  },
  {
    q: {
      vi: 'Khoảng cách tối thiểu với xe trước thường được nhắc bằng quy tắc nào?',
      es: '¿Regla mnemotécnica de distancia?',
      en: 'Common mnemonic for following distance?',
    },
    exp: { vi: 'Quy tắc 2 giây (hoặc 3 giây khi trời mưa).', es: 'Regla de los 2 segundos (3 si lluvia).', en: 'Two-second rule (three if wet).' },
    opts: [
      { vi: '0.5 giây', es: '0,5 s', en: '0.5 s', ok: false },
      { vi: 'Khoảng 2 giây (3 giây khi mưa)', es: '2 s (3 si llueve)', en: '~2 s (3 if wet)', ok: true },
      { vi: '10 mét cố định mọi tốc độ', es: '10 m fijos', en: 'Fixed 10 m', ok: false },
    ],
  },
];

function pickBank(i) {
  return bank[i % bank.length];
}

let lines = [];
lines.push('-- === Rich seed: quiz groups, categories, materials, quizzes, Q&A ===');

lines.push(`INSERT INTO quiz_topic_groups (id, code, name_vi, name_es, name_en, description_vi, description_es, description_en, allow_random_quiz, access_tier, is_active) VALUES`);
lines.push(
  qGroups
    .map(
      (g) =>
        `(${g.id}, '${g.code}', '${esc(g.vi)}', '${esc(g.es)}', '${esc(g.en)}', NULL, NULL, NULL, ${g.rand ? 'TRUE' : 'FALSE'}, '${g.tier}', TRUE)`
    )
    .join(',\n') + ';'
);

lines.push(`INSERT INTO quiz_categories (id, quiz_topic_group_id, name_vi, name_es, name_en, slug, description_vi, description_es, description_en, access_tier, is_active) VALUES`);
lines.push(
  qCats
    .map((c) => {
      const tier = c.g === 4 ? 'premium' : 'free';
      return `(${c.id}, ${c.g}, '${esc(c.vi)}', '${esc(c.es)}', '${esc(c.en)}', '${c.slug}', NULL, NULL, NULL, '${tier}', TRUE)`;
    })
    .join(',\n') + ';'
);

// Material groups & types
const mGroups = [
  { id: 1, code: 'MG001', vi: 'Luật & quy tắc giao thông', es: 'Normas de circulación', en: 'Traffic rules' },
  { id: 2, code: 'MG002', vi: 'Biển báo đường bộ', es: 'Señales', en: 'Road signs' },
  { id: 3, code: 'MG003', vi: 'Hướng dẫn ôn thi', es: 'Guía de estudio', en: 'Study guide' },
];

lines.push(`INSERT INTO material_topic_groups (id, code, name_vi, name_es, name_en, description_vi, description_es, description_en, access_tier, is_active, created_by) VALUES`);
lines.push(
  mGroups
    .map(
      (g) =>
        `(${g.id}, '${g.code}', '${esc(g.vi)}', '${esc(g.es)}', '${esc(g.en)}', NULL, NULL, NULL, 'free', TRUE, NULL)`
    )
    .join(',\n') + ';'
);

const mTypes = [
  { id: 1, g: 1, code: 'MT_LT_01', vi: 'Khái niệm & định nghĩa', es: 'Conceptos', en: 'Concepts' },
  { id: 2, g: 1, code: 'MT_LT_02', vi: 'Ưu tiên & nhường đường', es: 'Prioridad', en: 'Priority' },
  { id: 3, g: 1, code: 'MT_LT_03', vi: 'Tốc độ & vượt xe', es: 'Velocidad', en: 'Speed' },
  { id: 4, g: 2, code: 'MT_BB_01', vi: 'Biển cấm', es: 'Prohibición', en: 'Prohibition' },
  { id: 5, g: 2, code: 'MT_BB_02', vi: 'Biển nguy hiểm', es: 'Peligro', en: 'Warning' },
  { id: 6, g: 2, code: 'MT_BB_03', vi: 'Biển chỉ dẫn', es: 'Indicación', en: 'Guide' },
  { id: 7, g: 3, code: 'MT_ON_01', vi: 'Mẹo làm bài trắc nghiệm', es: 'Trucos test', en: 'Test tips' },
  { id: 8, g: 3, code: 'MT_ON_02', vi: 'Ôn tập Premium', es: 'Repaso premium', en: 'Premium review', tier: 'premium' },
  { id: 9, g: 1, code: 'MT_LT_04', vi: 'Giao lộ & đèn tín hiệu', es: 'Cruces y semáforos', en: 'Junctions and signals' },
  { id: 10, g: 1, code: 'MT_LT_05', vi: 'Dừng đỗ & vỉa hè', es: 'Estacionamiento', en: 'Parking rules' },
  { id: 11, g: 2, code: 'MT_BB_04', vi: 'Biển phụ & biển tạm', es: 'Paneles complementarios', en: 'Supplementary & temporary signs' },
  { id: 12, g: 3, code: 'MT_ON_03', vi: 'Câu hay sai & bẫy đề', es: 'Preguntas trampa', en: 'Tricky MCQ patterns' },
];

/** Nội dung HTML dài (vi/es/en) cho mỗi bài tài liệu — đọc được, có cấu trúc. */
function buildMaterialBodies(t, k) {
  const sv = t.vi;
  const ss = t.es;
  const se = t.en;

  const exVi = `Bài ${k} · «${sv}» — ôn lý thuyết B (DGT), nên kết hợp làm trắc nghiệm cùng chủ đề.`;
  const exEs = `Tema ${k} · «${ss}» — repaso permiso B (DGT); combina con tests del bloque.`;
  const exEn = `Part ${k} · «${se}» — Class B (DGT); pair with themed quizzes.`;

  const bodyVi = [
    `<h2>${sv} — Bài ${k}</h2>`,
    `<p class="lead"><strong>Mục tiêu.</strong> Củng cố chủ đề «${sv}» cho kỳ thi lý thuyết; nội dung là tài liệu ôn tập — luôn đối chiếu quy định hiện hành và bộ đề DGT.</p>`,
    `<h3>1. Kiến thức cốt lõi</h3>`,
    `<p>Phần «${sv}» thường xuất hiện trong đề với ngữ cảnh cụ thể: ai được đi trước tại giao lộ, giới hạn tốc độ theo loại đường, cách xử lý khi có người đi bộ, xe ưu tiên, hoặc điều kiện mưa sương. Khi học, hãy ghi lại <em>động từ hành động</em> bằng tiếng Tây Ban Nha (ví dụ: <em>ceder el paso</em>, <em>detenerse</em>, <em>reducir la velocidad</em>) vì đề thi giữ nguyên thuật ngữ gốc.</p>`,
    `<p>Bài ${k} nằm trong chuỗi cùng chuyên mục: sau khi đọc, bạn nên làm thêm 15–30 câu hỏi trắc nghiệm cùng chủ đề để kiểm tra độ nắm. Nếu sai nhiều ở một nhóm biển báo, quay lại phần hình học biển (tròn / tam giác / chữ nhật) và màu viền — đó là “mỏ neo” nhận diện nhanh trong phòng thi.</p>`,
    `<h3>2. Cách ôn hiệu quả</h3>`,
    `<ul>`,
    `<li>Đọc cả đề và bốn phương án trước khi chọn; một từ như “siempre” / “nunca” có thể đảo nghĩa toàn câu.</li>`,
    `<li>Với câu hỏi “phát biểu nào <strong>sai</strong>”, loại dần từng ý đúng trên nháp rồi mới đánh dấu.</li>`,
    `<li>Chú ý biển phụ và mũi tên: thông tin phụ thường là chìa khóa đáp án.</li>`,
    `<li>Giữ nhịp thời gian ~40–50 giây mỗi câu; câu khó đánh dấu bỏ qua, làm xong hồi cuối.</li>`,
    `<li>Sau mỗi đề, xem lại câu sai — Việt Autoescuela giúp theo dõi tiến độ theo chủ đề.</li>`,
    `</ul>`,
    `<h3>3. Ngôn ngữ trong đề thi & bối cảnh DGT</h3>`,
    `<p>Bạn thi theo chương trình Tây Ban Nha; hình ảnh và một phần câu hỏi bằng tiếng Tây Ban Nha. Không cần học thuộc dài dòng, nhưng nên quen dạng câu hỏi: mô tả tình huống kèm hình (biển, làn đường, đèn). Các bài khác trong mục «${sv}» trên trang Tài liệu mở rộng ví dụ tương tự.</p>`,
    `<blockquote><p><strong>Lưu ý:</strong> Tài liệu phục vụ học tập; khi DGT cập nhật bộ câu hỏi hoặc luật, hãy bổ sung từ nguồn chính thức.</p></blockquote>`,
  ].join('');

  const bodyEs = [
    `<h2>${ss} — Tema ${k}</h2>`,
    `<p class="lead"><strong>Objetivo.</strong> Reforzar el bloque «${ss}» para el examen teórico del permiso B (DGT). Texto de estudio; contrasta siempre con la normativa vigente.</p>`,
    `<h3>1. Ideas clave</h3>`,
    `<p>En «${ss}» suelen mezclarse prioridades, velocidades genéricas, señales y conductas prohibidas. Apunta verbos y sustantivos frecuentes en el test: <em>peatón</em>, <em>intersección</em>, <em>arcén</em>, <em>adelantamiento</em>. El tema ${k} amplía patrones que se repiten en exámenes oficiales.</p>`,
    `<p>Tras leer, completa un test corto del mismo capítulo: si fallas en señales, repasa la morfología (circular roja = prohibición u obligación según pictograma; triángulo = peligro).</p>`,
    `<h3>2. Estrategia de examen</h3>`,
    `<ul>`,
    `<li>Lee enunciado y las cuatro opciones enteras; palabras como “siempre” o “jamás” cambian el sentido.</li>`,
    `<li>En preguntas de “¿cuál es <strong>falsa</strong>?”, descarta primero las verdaderas.</li>`,
    `<li>Paneles complementarios y flechas modifican el sentido de la señal principal.</li>`,
    `<li>Gestiona el tiempo; vuelve al final a las marcadas.</li>`,
    `<li>Repasa fallos: mejora más corrigiendo errores que haciendo solo tests nuevos.</li>`,
    `</ul>`,
    `<h3>3. Contexto DGT</h3>`,
    `<p>El examen oficial usa el banco de preguntas de la DGT. Practica también en la app/web en español para acostumbrarte al vocabulario. El siguiente artículo de «${ss}» profundiza en casos parecidos.</p>`,
    `<blockquote><p><strong>Aviso:</strong> Material formativo; verifica cambios normativos en fuentes oficiales.</p></blockquote>`,
  ].join('');

  const bodyEn = [
    `<h2>${se} — Part ${k}</h2>`,
    `<p class="lead"><strong>Goal.</strong> Strengthen «${se}» for the Spanish Class B theory test (DGT). Study notes — always cross-check current traffic law and official question banks.</p>`,
    `<h3>1. Core ideas</h3>`,
    `<p>This block covers rules that often appear as situational questions: priority at junctions, default speed limits, pedestrian crossings, emergency vehicles, and weather-related adjustments. Learn the Spanish keywords used in the real exam (<em>ceder</em>, <em>detenerse</em>, <em>velocidad máxima</em>) even if you think mainly in Vietnamese or English.</p>`,
    `<p>Part ${k} is one step in a longer track: after reading, take a themed quiz so wrong answers point you back to specific gaps (sign shapes, light sequences, lane markings).</p>`,
    `<h3>2. Exam technique</h3>`,
    `<ul>`,
    `<li>Read the full stem and all four options; qualifiers like “always” / “never” are frequent traps.</li>`,
    `<li>For “which statement is <strong>false</strong>”, eliminate true items first.</li>`,
    `<li>Supplementary plates and arrows change the main sign’s meaning.</li>`,
    `<li>Keep ~40–50 seconds per question; flag hard ones and return later.</li>`,
    `<li>Review mistakes — targeted review beats endless new quizzes.</li>`,
    `</ul>`,
    `<h3>3. Spanish wording in the real exam</h3>`,
    `<p>Questions and images may be in Spanish. You do not need perfect Spanish prose, but you should recognise standard phrases about duties and prohibitions. Use Viet Autoescuela materials plus official DGT practice to stay aligned with the real test format.</p>`,
    `<blockquote><p><strong>Note:</strong> Educational content only; verify updates from official sources.</p></blockquote>`,
  ].join('');

  return {
    exVi,
    exEs,
    exEn,
    bodyVi,
    bodyEs,
    bodyEn,
  };
}

lines.push(`INSERT INTO material_types (id, material_topic_group_id, code, name_vi, name_es, name_en, description_vi, description_es, description_en, access_tier, is_active, created_by) VALUES`);
lines.push(
  mTypes
    .map((t) => {
      const tier = t.tier || 'free';
      return `(${t.id}, ${t.g}, '${t.code}', '${esc(t.vi)}', '${esc(t.es)}', '${esc(t.en)}', NULL, NULL, NULL, '${tier}', TRUE, 1)`;
    })
    .join(',\n') + ';'
);

// Material posts: nhiều bài / chủ đề + HTML dài (buildMaterialBodies)
let postId = 0;
const postRows = [];
for (const t of mTypes) {
  const n = t.tier === 'premium' ? 8 : 7;
  for (let k = 1; k <= n; k += 1) {
    postId += 1;
    const titleVi = `${t.vi} — Bài ${k}`;
    const titleEs = `${t.es} — Tema ${k}`;
    const titleEn = `${t.en} — Part ${k}`;
    const b = buildMaterialBodies(t, k);
    postRows.push(
      `(${postId}, ${t.id}, '${esc(titleVi)}', '${esc(titleEs)}', '${esc(titleEn)}', '${esc(b.exVi)}', '${esc(b.exEs)}', '${esc(b.exEn)}', '${esc(b.bodyVi)}', '${esc(b.bodyEs)}', '${esc(b.bodyEn)}', '${t.tier === 'premium' ? 'premium' : 'free'}', TRUE, ${k}, 1)`
    );
  }
}

lines.push(`INSERT INTO material_posts (id, material_type_id, title_vi, title_es, title_en, excerpt_vi, excerpt_es, excerpt_en, body_html_vi, body_html_es, body_html_en, access_tier, is_published, sort_order, created_by) VALUES`);
lines.push(postRows.join(',\n') + ';');

// Quizzes: 2 per category = 20 quizzes
const quizRows = [];
let quizId = 0;
for (const c of qCats) {
  for (let r = 1; r <= 3; r += 1) {
    quizId += 1;
    const tier = c.g === 4 ? 'premium' : 'free';
    const tv = `${c.vi} — Đề ${r}`;
    const te = `${c.es} — Test ${r}`;
    const tn = `${c.en} — Set ${r}`;
    const desc = 'Đề trắc nghiệm lý thuyết (mẫu).';
    quizRows.push(
      `(${quizId}, ${c.id}, '${esc(tv)}', '${esc(te)}', '${esc(tn)}', '${esc(desc)}', '${esc(desc)}', '${esc(desc)}', NULL, NULL, NULL, 30, 5, 70.00, '${tier}', TRUE, 1)`
    );
  }
}

lines.push(`INSERT INTO quizzes (id, category_id, title_vi, title_es, title_en, description_vi, description_es, description_en, instructions_vi, instructions_es, instructions_en, duration_minutes, total_questions, passing_score, access_tier, is_active, created_by) VALUES`);
lines.push(quizRows.join(',\n') + ';');

// Questions & answers
const qRows = [];
const aRows = [];
let questionId = 0;
let answerId = 0;

for (let qi = 1; qi <= quizId; qi += 1) {
  for (let ord = 1; ord <= 5; ord += 1) {
    questionId += 1;
    const b = pickBank(questionId + qi);
    qRows.push(
      `(${questionId}, ${qi}, ${ord}, 1.00, '${esc(b.q.vi)}', '${esc(b.q.es)}', '${esc(b.q.en)}', '${esc(b.exp.vi)}', '${esc(b.exp.es)}', '${esc(b.exp.en)}', NULL)`
    );
    for (let oi = 0; oi < b.opts.length; oi += 1) {
      answerId += 1;
      const o = b.opts[oi];
      aRows.push(
        `(${answerId}, ${questionId}, ${oi + 1}, ${o.ok ? 'TRUE' : 'FALSE'}, '${esc(o.vi)}', '${esc(o.es)}', '${esc(o.en)}')`
      );
    }
  }
}

lines.push(`INSERT INTO questions (id, quiz_id, order_number, points, question_text_vi, question_text_es, question_text_en, explanation_vi, explanation_es, explanation_en, image_url) VALUES`);
lines.push(qRows.join(',\n') + ';');

lines.push(`INSERT INTO answers (id, question_id, order_number, is_correct, answer_text_vi, answer_text_es, answer_text_en) VALUES`);
lines.push(aRows.join(',\n') + ';');

lines.push(`
-- Học viên mẫu: username hocvien / mật khẩu Student123!
INSERT INTO users (id, username, email, password_hash, role, premium_plan, full_name, is_active)
VALUES (
  2,
  'hocvien',
  'hocvien@localhost',
  '$2a$10$LgwNdIqDnflUtHywjg/3BO4p7wESTIUPGhQDojOTNWfXPzZs8JFma',
  'student',
  'none',
  'Học viên mẫu',
  TRUE
);

ALTER TABLE users AUTO_INCREMENT = 100;
ALTER TABLE quiz_topic_groups AUTO_INCREMENT = 100;
ALTER TABLE quiz_categories AUTO_INCREMENT = 100;
ALTER TABLE material_topic_groups AUTO_INCREMENT = 100;
ALTER TABLE material_types AUTO_INCREMENT = 100;
ALTER TABLE material_posts AUTO_INCREMENT = 5000;
ALTER TABLE quizzes AUTO_INCREMENT = 2000;
ALTER TABLE questions AUTO_INCREMENT = 20000;
ALTER TABLE answers AUTO_INCREMENT = 100000;
`);

const out = lines.join('\n');
console.log(`Stats: ${qGroups.length} q-groups, ${qCats.length} q-cats, ${quizId} quizzes, ${questionId} questions, ${answerId} answers, ${postId} posts`);

const initPath = join(root, 'infra/mysql/init.sql');
const startMarker =
  'INSERT INTO material_posts (id, material_type_id, title_vi, title_es, title_en, excerpt_vi, excerpt_es, excerpt_en, body_html_vi, body_html_es, body_html_en, access_tier, is_published, sort_order, created_by) VALUES\n';
const endMarker = '\nINSERT INTO quizzes ';
let initSql = readFileSync(initPath, 'utf8');
const si = initSql.indexOf(startMarker);
const ei = initSql.indexOf(endMarker);
if (si !== -1 && ei !== -1 && ei > si) {
  const newPostsBlock = `${startMarker}${postRows.join(',\n')};`;
  initSql = initSql.slice(0, si) + newPostsBlock + initSql.slice(ei);
  writeFileSync(initPath, initSql);
  console.log('Patched', initPath, '— material_posts excerpts');
} else {
  console.warn('Skip init.sql patch: markers not found (check INSERT INTO material_posts / quizzes).');
}
