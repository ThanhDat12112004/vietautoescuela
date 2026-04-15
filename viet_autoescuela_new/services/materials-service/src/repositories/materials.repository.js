const pool = require('../config/db');
const { pickCol } = require('../utils/lang');

function normalizeCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase();
}

async function findUserSessionById(userId) {
  const [rows] = await pool.execute(
    `SELECT id, role, is_active, current_session_id, premium_plan, premium_until
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findAllTopicGroups(lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       ${pickCol(lang, 'name_vi', 'name_es', 'name_en')} AS name,
       ${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS description,
       access_tier,
       is_active,
       created_at,
       updated_at
     FROM material_topic_groups
     WHERE is_active = TRUE
     ORDER BY created_at DESC, id DESC`
  );
  return rows;
}

async function findAllTopicGroupsForAdmin() {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       name_vi,
       name_es,
       name_en,
       description_vi,
       description_es,
       description_en,
       access_tier,
       is_active,
       created_at,
       updated_at
     FROM material_topic_groups
     ORDER BY created_at DESC, id DESC`
  );
  return rows;
}

async function generateNextMaterialTopicGroupCode() {
  const [rows] = await pool.query('SELECT code FROM material_topic_groups');
  const usedCodes = new Set();
  let maxIndex = 0;

  for (const row of rows) {
    const normalized = normalizeCode(row.code);
    if (!normalized) continue;
    usedCodes.add(normalized);
    const match = normalized.match(/^MG(\d+)$/);
    if (!match) continue;
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric > maxIndex) {
      maxIndex = numeric;
    }
  }

  let next = maxIndex + 1;
  while (true) {
    const candidate = `MG${String(next).padStart(3, '0')}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
    next += 1;
  }
}

async function createTopicGroup(payload) {
  const code = normalizeCode(payload.code) || (await generateNextMaterialTopicGroupCode());
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const [result] = await pool.execute(
    `INSERT INTO material_topic_groups
      (code, name_vi, name_es, name_en, description_vi, description_es, description_en, access_tier, is_active, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      payload.name_vi,
      payload.name_es,
      payload.name_en,
      payload.description_vi || null,
      payload.description_es || null,
      payload.description_en || null,
      accessTier,
      payload.is_active == null ? true : Boolean(payload.is_active),
      payload.created_by || null,
    ]
  );
  return result.insertId;
}

async function updateTopicGroupById(topicGroupId, payload) {
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const [result] = await pool.execute(
    `UPDATE material_topic_groups
     SET code = ?,
         name_vi = ?,
         name_es = ?,
         name_en = ?,
         description_vi = ?,
         description_es = ?,
         description_en = ?,
         access_tier = ?,
         is_active = ?
     WHERE id = ?`,
    [
      payload.code,
      payload.name_vi,
      payload.name_es,
      payload.name_en,
      payload.description_vi || null,
      payload.description_es || null,
      payload.description_en || null,
      accessTier,
      payload.is_active == null ? true : Boolean(payload.is_active),
      topicGroupId,
    ]
  );
  return result.affectedRows;
}

async function deleteTopicGroupById(topicGroupId) {
  const [result] = await pool.execute('DELETE FROM material_topic_groups WHERE id = ?', [topicGroupId]);
  return result.affectedRows;
}

async function countSubjectsByTopicGroupId(topicGroupId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM material_types
     WHERE material_topic_group_id = ?`,
    [topicGroupId]
  );
  return Number(rows[0]?.total || 0);
}

async function materialTopicGroupExistsById(topicGroupId) {
  const [rows] = await pool.execute(
    'SELECT 1 FROM material_topic_groups WHERE id = ? LIMIT 1',
    [topicGroupId]
  );
  return rows.length > 0;
}

async function findSubjects(lang) {
  const [rows] = await pool.query(
    `SELECT
       mt.id,
       mt.code,
       mt.material_topic_group_id,
       mtg.code AS material_topic_group_code,
       ${pickCol(lang, 'mtg.name_vi', 'mtg.name_es', 'mtg.name_en')} AS material_topic_group_name,
       ${pickCol(lang, 'mtg.description_vi', 'mtg.description_es', 'mtg.description_en')} AS material_topic_group_description,
       IFNULL(mtg.access_tier, 'free') AS material_topic_group_access_tier,
       ${pickCol(lang, 'mt.name_vi', 'mt.name_es', 'mt.name_en')} AS name,
       ${pickCol(lang, 'mt.description_vi', 'mt.description_es', 'mt.description_en')} AS description,
       (
         mt.access_tier = 'premium'
         OR IFNULL(mtg.access_tier, 'free') = 'premium'
       ) AS requires_premium,
       mt.created_at
     FROM material_types mt
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     WHERE mt.is_active = TRUE
       AND (
         mt.material_topic_group_id IS NULL
         OR mtg.is_active = TRUE
       )
     ORDER BY mt.created_at DESC`
  );

  return rows;
}

async function findAllSubjectsAdmin() {
  const [rows] = await pool.query(
    `SELECT
       mt.id,
       mt.code,
       mt.material_topic_group_id,
       mtg.code AS material_topic_group_code,
       mtg.name_vi AS material_topic_group_name_vi,
       mtg.name_es AS material_topic_group_name_es,
       mtg.name_en AS material_topic_group_name_en,
       mtg.description_vi AS material_topic_group_description_vi,
       mtg.description_es AS material_topic_group_description_es,
       mtg.description_en AS material_topic_group_description_en,
       mt.name_vi,
       mt.name_es,
       mt.name_en,
       mt.description_vi,
       mt.description_es,
       mt.description_en,
       mt.access_tier,
       mtg.access_tier AS material_topic_group_access_tier,
       mt.is_active,
       mt.created_at
     FROM material_types mt
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     ORDER BY mt.created_at DESC`
  );

  return rows;
}

async function findMaterialCountsBySubject() {
  const [rows] = await pool.query(
    `SELECT
       mt.id AS subject_id,
       COUNT(mp.id) AS total
     FROM material_types mt
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     LEFT JOIN material_posts mp ON mp.material_type_id = mt.id AND mp.is_published = TRUE
     WHERE mt.is_active = TRUE
       AND (
         mt.material_topic_group_id IS NULL
         OR mtg.is_active = TRUE
       )
     GROUP BY mt.id
     ORDER BY mt.id ASC`
  );

  return rows.map((row) => ({
    subject_id: Number(row.subject_id),
    total: Number(row.total || 0),
  }));
}

async function generateNextSubjectCode() {
  const [rows] = await pool.query('SELECT code FROM material_types');
  const usedCodes = new Set();
  let maxIndex = 0;

  for (const row of rows) {
    const normalized = normalizeCode(row.code);
    if (!normalized) continue;
    usedCodes.add(normalized);
    const match = normalized.match(/^SUB(\d+)$/);
    if (!match) continue;
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric > maxIndex) {
      maxIndex = numeric;
    }
  }

  let next = maxIndex + 1;
  while (true) {
    const candidate = `SUB${String(next).padStart(3, '0')}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
    next += 1;
  }
}

async function createSubject(payload) {
  // Retry a few times in case concurrent inserts pick the same generated code.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = await generateNextSubjectCode();
    try {
      const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
      const [result] = await pool.execute(
        `INSERT INTO material_types
          (
            code,
            material_topic_group_id,
            name_vi,
            name_es,
            name_en,
            description_vi,
            description_es,
            description_en,
            access_tier,
            is_active,
            created_by
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          Number(payload.material_topic_group_id || 1),
          payload.name_vi,
          payload.name_es,
          payload.name_en,
          payload.description_vi || null,
          payload.description_es || null,
          payload.description_en || null,
          accessTier,
          payload.is_active == null ? true : Boolean(payload.is_active),
          payload.created_by || null,
        ]
      );

      return { id: result.insertId, code };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        continue;
      }
      throw error;
    }
  }

  const appError = new Error('Unable to generate subject code');
  appError.status = 500;
  throw appError;
}

async function updateSubject(subjectId, payload) {
  const topicGroupId = Number(payload.material_topic_group_id || 1);
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const baseFields = [
    topicGroupId,
    payload.name_vi,
    payload.name_es,
    payload.name_en,
    payload.description_vi || null,
    payload.description_es || null,
    payload.description_en || null,
    accessTier,
  ];

  let sql;
  let params;
  if (payload.is_active !== undefined) {
    sql = `UPDATE material_types
     SET material_topic_group_id = ?,
         name_vi = ?,
         name_es = ?,
         name_en = ?,
         description_vi = ?,
         description_es = ?,
         description_en = ?,
         access_tier = ?,
         is_active = ?
     WHERE id = ?`;
    params = [...baseFields, Boolean(payload.is_active), subjectId];
  } else {
    sql = `UPDATE material_types
     SET material_topic_group_id = ?,
         name_vi = ?,
         name_es = ?,
         name_en = ?,
         description_vi = ?,
         description_es = ?,
         description_en = ?,
         access_tier = ?
     WHERE id = ?`;
    params = [...baseFields, subjectId];
  }

  const [result] = await pool.execute(sql, params);
  return result.affectedRows;
}

async function deleteSubject(subjectId) {
  const [result] = await pool.execute('DELETE FROM material_types WHERE id = ?', [subjectId]);
  return result.affectedRows;
}

/** Public learner API: subject must be active and (no group or parent topic group active). */
async function findMaterialSubjectPublicGate(subjectId) {
  const [rows] = await pool.execute(
    `SELECT mt.id
     FROM material_types mt
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     WHERE mt.id = ?
       AND mt.is_active = TRUE
       AND (
         mt.material_topic_group_id IS NULL
         OR mtg.is_active = TRUE
       )
     LIMIT 1`,
    [subjectId]
  );
  return rows[0] || null;
}

/** Admin: subject row exists (any active flag) — for listing materials in back-office. */
async function findMaterialSubjectExists(subjectId) {
  const [rows] = await pool.execute('SELECT id FROM material_types WHERE id = ? LIMIT 1', [subjectId]);
  return rows[0] || null;
}

async function findSubjectRequiresPremium(subjectId) {
  const [rows] = await pool.execute(
    `SELECT
       CASE
         WHEN mt.access_tier = 'premium' OR IFNULL(mtg.access_tier, 'free') = 'premium'
         THEN TRUE ELSE FALSE
       END AS requires_premium
     FROM material_types mt
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     WHERE mt.id = ?
     LIMIT 1`,
    [subjectId]
  );
  return Boolean(rows[0]?.requires_premium);
}

/** Public / learner: published posts only, list fields (no HTML body). */
async function findMaterialPostsList(subjectId, lang) {
  const [rows] = await pool.query(
    `SELECT
       mp.id,
       mp.material_type_id AS subject_id,
       mp.title_vi,
       mp.title_es,
       mp.title_en,
       mp.excerpt_vi,
       mp.excerpt_es,
       mp.excerpt_en,
       (
         mp.access_tier = 'premium'
         OR mt.access_tier = 'premium'
         OR IFNULL(mtg.access_tier, 'free') = 'premium'
       ) AS requires_premium,
       CASE ? WHEN 'es' THEN mp.title_es WHEN 'en' THEN mp.title_en ELSE mp.title_vi END AS title,
       CASE ? WHEN 'es' THEN mp.excerpt_es WHEN 'en' THEN mp.excerpt_en ELSE mp.excerpt_vi END AS description,
       mp.updated_at AS uploaded_at
     FROM material_posts mp
     INNER JOIN material_types mt ON mt.id = mp.material_type_id
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     WHERE mp.material_type_id = ?
       AND mp.is_published = TRUE
     ORDER BY mp.sort_order ASC, mp.updated_at DESC, mp.id DESC`,
    [lang, lang, subjectId]
  );

  return rows;
}

/** Admin: all posts for subject including drafts and full i18n fields. */
async function findMaterialPostsAdminBySubject(subjectId) {
  const [rows] = await pool.query(
    `SELECT
       mp.id,
       mp.material_type_id AS subject_id,
       mp.title_vi,
       mp.title_es,
       mp.title_en,
       mp.excerpt_vi,
       mp.excerpt_es,
       mp.excerpt_en,
       mp.body_html_vi,
       mp.body_html_es,
       mp.body_html_en,
       mp.access_tier,
       mp.is_published,
       mp.sort_order,
       mp.created_at,
       mp.updated_at AS uploaded_at
     FROM material_posts mp
     WHERE mp.material_type_id = ?
     ORDER BY mp.sort_order ASC, mp.updated_at DESC, mp.id DESC`,
    [subjectId]
  );
  return rows;
}

async function findMaterialPostById(subjectId, postId, lang) {
  const l = ['vi', 'es', 'en'].includes(lang) ? lang : 'vi';
  const [rows] = await pool.query(
    `SELECT
       mp.id,
       mp.material_type_id AS subject_id,
       mp.title_vi,
       mp.title_es,
       mp.title_en,
       mp.excerpt_vi,
       mp.excerpt_es,
       mp.excerpt_en,
       mp.body_html_vi,
       mp.body_html_es,
       mp.body_html_en,
       mp.access_tier,
       mp.is_published,
       (
         mp.access_tier = 'premium'
         OR mt.access_tier = 'premium'
         OR IFNULL(mtg.access_tier, 'free') = 'premium'
       ) AS requires_premium,
       mp.updated_at AS uploaded_at,
       ${pickCol(l, 'mtg.name_vi', 'mtg.name_es', 'mtg.name_en')} AS topic_group_name,
       ${pickCol(l, 'mt.name_vi', 'mt.name_es', 'mt.name_en')} AS subject_name
     FROM material_posts mp
     INNER JOIN material_types mt ON mt.id = mp.material_type_id
     LEFT JOIN material_topic_groups mtg ON mtg.id = mt.material_topic_group_id
     WHERE mp.id = ? AND mp.material_type_id = ?
     LIMIT 1`,
    [postId, subjectId]
  );
  return rows[0] || null;
}

async function findMaterialPostRawById(postId) {
  const [rows] = await pool.query(
    `SELECT
       id,
       material_type_id AS subject_id,
       body_html_vi,
       body_html_es,
       body_html_en
     FROM material_posts
     WHERE id = ?
     LIMIT 1`,
    [postId]
  );
  return rows[0] || null;
}

async function createMaterialPost(payload) {
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const published = payload.is_published == null ? true : Boolean(payload.is_published);
  const sortOrder = payload.sort_order != null ? Number(payload.sort_order) : 0;
  const [result] = await pool.execute(
    `INSERT INTO material_posts
      (
        material_type_id,
        title_vi, title_es, title_en,
        excerpt_vi, excerpt_es, excerpt_en,
        body_html_vi, body_html_es, body_html_en,
        access_tier, is_published, sort_order, created_by
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.subject_id,
      payload.title_vi,
      payload.title_es,
      payload.title_en,
      payload.excerpt_vi || null,
      payload.excerpt_es || null,
      payload.excerpt_en || null,
      payload.body_html_vi || '',
      payload.body_html_es || '',
      payload.body_html_en || '',
      accessTier,
      published,
      Number.isFinite(sortOrder) ? sortOrder : 0,
      payload.created_by,
    ]
  );
  return result.insertId;
}

async function updateMaterialPost(postId, payload) {
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const published = payload.is_published == null ? true : Boolean(payload.is_published);
  const sortOrder = payload.sort_order != null ? Number(payload.sort_order) : 0;
  const [result] = await pool.execute(
    `UPDATE material_posts
     SET material_type_id = ?,
         title_vi = ?,
         title_es = ?,
         title_en = ?,
         excerpt_vi = ?,
         excerpt_es = ?,
         excerpt_en = ?,
         body_html_vi = ?,
         body_html_es = ?,
         body_html_en = ?,
         access_tier = ?,
         is_published = ?,
         sort_order = ?
     WHERE id = ?`,
    [
      payload.subject_id,
      payload.title_vi,
      payload.title_es,
      payload.title_en,
      payload.excerpt_vi || null,
      payload.excerpt_es || null,
      payload.excerpt_en || null,
      payload.body_html_vi || '',
      payload.body_html_es || '',
      payload.body_html_en || '',
      accessTier,
      published,
      Number.isFinite(sortOrder) ? sortOrder : 0,
      postId,
    ]
  );
  return result.affectedRows;
}

async function deleteMaterialPost(postId) {
  const [result] = await pool.execute('DELETE FROM material_posts WHERE id = ?', [postId]);
  return result.affectedRows;
}

module.exports = {
  findUserSessionById,
  findAllTopicGroups,
  findAllTopicGroupsForAdmin,
  materialTopicGroupExistsById,
  createTopicGroup,
  updateTopicGroupById,
  deleteTopicGroupById,
  countSubjectsByTopicGroupId,
  findSubjects,
  findMaterialSubjectPublicGate,
  findMaterialSubjectExists,
  findSubjectRequiresPremium,
  findAllSubjectsAdmin,
  findMaterialCountsBySubject,
  createSubject,
  updateSubject,
  deleteSubject,
  findMaterialPostsList,
  findMaterialPostsAdminBySubject,
  findMaterialPostById,
  findMaterialPostRawById,
  createMaterialPost,
  updateMaterialPost,
  deleteMaterialPost,
};
