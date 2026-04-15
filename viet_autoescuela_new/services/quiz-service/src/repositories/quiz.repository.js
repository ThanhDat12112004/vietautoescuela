const pool = require('../config/db');
const { pickCol } = require('../utils/lang');

function normalizeCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase();
}

function isMissingDailyUsageTableError(error) {
  return (
    error &&
    (error.code === 'ER_NO_SUCH_TABLE' ||
      String(error.message || '').includes('user_random_quiz_daily_usages'))
  );
}

async function generateNextQuizTopicGroupCode() {
  const [rows] = await pool.query('SELECT code FROM quiz_topic_groups');
  const usedCodes = new Set();
  let maxIndex = 0;

  for (const row of rows) {
    const normalized = normalizeCode(row.code);
    if (!normalized) continue;
    usedCodes.add(normalized);
    const match = normalized.match(/^QG(\d+)$/);
    if (!match) continue;
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric > maxIndex) {
      maxIndex = numeric;
    }
  }

  let next = maxIndex + 1;
  // QG001, QG002, ...
  // Tránh trùng trong trường hợp code đã được nhập tay.
  while (true) {
    const candidate = `QG${String(next).padStart(3, '0')}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
    next += 1;
  }
}

async function findAllTopicGroups(lang) {
  const [rows] = await pool.query(
    `SELECT
       id,
       code,
       ${pickCol(lang, 'name_vi', 'name_es', 'name_en')} AS name,
       ${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS description,
       allow_random_quiz,
       access_tier,
       is_active,
       created_at,
       updated_at
     FROM quiz_topic_groups
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
       allow_random_quiz,
       access_tier,
       is_active,
       created_at,
       updated_at
     FROM quiz_topic_groups
     ORDER BY created_at DESC, id DESC`
  );
  return rows;
}

async function createTopicGroup(payload) {
  // Cho phép bỏ trống code, khi đó backend tự generate.
  const code = normalizeCode(payload.code) || (await generateNextQuizTopicGroupCode());
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const [result] = await pool.execute(
    `INSERT INTO quiz_topic_groups
      (code, name_vi, name_es, name_en, description_vi, description_es, description_en, allow_random_quiz, access_tier, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      payload.name_vi,
      payload.name_es,
      payload.name_en,
      payload.description_vi || null,
      payload.description_es || null,
      payload.description_en || null,
      payload.allow_random_quiz == null ? false : Boolean(payload.allow_random_quiz),
      accessTier,
      payload.is_active == null ? true : Boolean(payload.is_active),
    ]
  );
  return result.insertId;
}

async function updateTopicGroupById(topicGroupId, payload) {
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const [result] = await pool.execute(
    `UPDATE quiz_topic_groups
     SET code = ?,
         name_vi = ?,
         name_es = ?,
         name_en = ?,
         description_vi = ?,
         description_es = ?,
         description_en = ?,
         allow_random_quiz = ?,
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
      payload.allow_random_quiz == null ? false : Boolean(payload.allow_random_quiz),
      accessTier,
      payload.is_active == null ? true : Boolean(payload.is_active),
      topicGroupId,
    ]
  );
  return result.affectedRows;
}

async function deleteTopicGroupById(topicGroupId) {
  const [result] = await pool.execute('DELETE FROM quiz_topic_groups WHERE id = ?', [topicGroupId]);
  return result.affectedRows;
}

async function countCategoriesByTopicGroupId(topicGroupId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM quiz_categories
     WHERE quiz_topic_group_id = ?`,
    [topicGroupId]
  );
  return Number(rows[0]?.total || 0);
}

async function findAllActiveCategories(lang) {
  const [rows] = await pool.query(
    `SELECT
       qc.id,
       qc.slug,
       qc.quiz_topic_group_id,
       qtg.code AS quiz_topic_group_code,
       ${pickCol(lang, 'qtg.name_vi', 'qtg.name_es', 'qtg.name_en')} AS quiz_topic_group_name,
       ${pickCol(lang, 'qtg.description_vi', 'qtg.description_es', 'qtg.description_en')} AS quiz_topic_group_description,
       ${pickCol(lang, 'qc.name_vi', 'qc.name_es', 'qc.name_en')} AS name,
       ${pickCol(lang, 'qc.description_vi', 'qc.description_es', 'qc.description_en')} AS description,
       qc.access_tier AS category_access_tier,
       qtg.access_tier AS quiz_topic_group_access_tier,
       qtg.allow_random_quiz AS quiz_topic_group_allow_random,
       IFNULL(qc.allow_random_quiz, FALSE) AS quiz_category_allow_random
     FROM quiz_categories qc
     INNER JOIN quiz_topic_groups qtg
       ON qtg.id = qc.quiz_topic_group_id AND qtg.is_active = TRUE
     WHERE qc.is_active = TRUE
     ORDER BY qc.id DESC`
  );

  return rows;
}

async function findAllCategoriesForAdmin() {
  const [rows] = await pool.query(
    `SELECT
       qc.id,
       qc.quiz_topic_group_id,
       qtg.code AS quiz_topic_group_code,
       qtg.name_vi AS quiz_topic_group_name_vi,
       qtg.name_es AS quiz_topic_group_name_es,
       qtg.name_en AS quiz_topic_group_name_en,
       qtg.description_vi AS quiz_topic_group_description_vi,
       qtg.description_es AS quiz_topic_group_description_es,
       qtg.description_en AS quiz_topic_group_description_en,
       qc.name_vi,
       qc.name_es,
       qc.name_en,
       qc.slug,
       qc.description_vi,
       qc.description_es,
       qc.description_en,
       qc.access_tier,
       IFNULL(qc.allow_random_quiz, FALSE) AS allow_random_quiz,
       qc.is_active,
       qc.created_at,
       qc.updated_at
     FROM quiz_categories qc
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = qc.quiz_topic_group_id
     ORDER BY qc.created_at DESC`
  );

  return rows;
}

async function generateNextQuizCategorySlug() {
  const [rows] = await pool.query('SELECT slug FROM quiz_categories');
  const usedSlugs = new Set();
  let maxIndex = 0;

  for (const row of rows) {
    const normalized = normalizeCode(row.slug);
    if (!normalized) continue;
    usedSlugs.add(normalized);
    const match = normalized.match(/^CAT(\d+)$/);
    if (!match) continue;
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric > maxIndex) {
      maxIndex = numeric;
    }
  }

  let next = maxIndex + 1;
  while (true) {
    const candidate = `CAT${String(next).padStart(3, '0')}`;
    if (!usedSlugs.has(candidate)) {
      return candidate;
    }
    next += 1;
  }
}

async function createCategory(payload) {
  const slug = normalizeCode(payload.slug) || (await generateNextQuizCategorySlug());
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const [result] = await pool.execute(
    `INSERT INTO quiz_categories
      (quiz_topic_group_id, name_vi, name_es, name_en, slug, description_vi, description_es, description_en, access_tier, allow_random_quiz, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(payload.quiz_topic_group_id || 1),
      payload.name_vi,
      payload.name_es,
      payload.name_en,
      slug,
      payload.description_vi || null,
      payload.description_es || null,
      payload.description_en || null,
      accessTier,
      payload.allow_random_quiz == null ? false : Boolean(payload.allow_random_quiz),
      payload.is_active == null ? true : Boolean(payload.is_active),
    ]
  );

  return result.insertId;
}

async function updateCategoryById(categoryId, payload) {
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const hasRandomFlag = Object.prototype.hasOwnProperty.call(payload, 'allow_random_quiz');
  const randomVal = hasRandomFlag
    ? payload.allow_random_quiz == null
      ? false
      : Boolean(payload.allow_random_quiz)
    : null;

  const baseArgs = [
    Number(payload.quiz_topic_group_id || 1),
    payload.name_vi,
    payload.name_es,
    payload.name_en,
    payload.slug || null,
    payload.description_vi || null,
    payload.description_es || null,
    payload.description_en || null,
    accessTier,
  ];
  const tailArgs = [
    payload.is_active == null ? true : Boolean(payload.is_active),
    categoryId,
  ];

  const [result] = hasRandomFlag
    ? await pool.execute(
        `UPDATE quiz_categories
         SET quiz_topic_group_id = ?,
             name_vi = ?,
             name_es = ?,
             name_en = ?,
             slug = ?,
             description_vi = ?,
             description_es = ?,
             description_en = ?,
             access_tier = ?,
             allow_random_quiz = ?,
             is_active = ?
         WHERE id = ?`,
        [...baseArgs, randomVal, ...tailArgs]
      )
    : await pool.execute(
        `UPDATE quiz_categories
         SET quiz_topic_group_id = ?,
             name_vi = ?,
             name_es = ?,
             name_en = ?,
             slug = ?,
             description_vi = ?,
             description_es = ?,
             description_en = ?,
             access_tier = ?,
             is_active = ?
         WHERE id = ?`,
        [...baseArgs, ...tailArgs]
      );

  return result.affectedRows;
}

async function deleteCategoryById(categoryId) {
  const [result] = await pool.execute('DELETE FROM quiz_categories WHERE id = ?', [categoryId]);
  return result.affectedRows;
}

async function findAllActiveTypes(lang) {
  const [rows] = await pool.query(
    `SELECT
       qc.id,
       CAST(qc.id AS CHAR) AS code,
       qc.id AS quiz_category_id,
       qc.quiz_topic_group_id,
       qc.id AS quiz_category_id_ref,
       qc.slug AS quiz_category_slug,
       ${pickCol(lang, 'qc.name_vi', 'qc.name_es', 'qc.name_en')} AS quiz_category_name,
       qtg.code AS quiz_topic_group_code,
       ${pickCol(lang, 'qtg.name_vi', 'qtg.name_es', 'qtg.name_en')} AS quiz_topic_group_name,
       ${pickCol(lang, 'qc.name_vi', 'qc.name_es', 'qc.name_en')} AS name,
       ${pickCol(lang, 'qc.description_vi', 'qc.description_es', 'qc.description_en')} AS description
     FROM quiz_categories qc
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = qc.quiz_topic_group_id
     WHERE qc.is_active = TRUE
     ORDER BY qc.created_at DESC, qc.id DESC`
  );

  return rows;
}

async function findAllTypesForAdmin() {
  const [rows] = await pool.query(
    `SELECT
       qc.id,
       CAST(qc.id AS CHAR) AS code,
       qc.id AS quiz_category_id,
       qc.quiz_topic_group_id,
       qc.id AS quiz_category_id_ref,
       qc.slug AS quiz_category_slug,
       qc.name_vi AS quiz_category_name_vi,
       qc.name_es AS quiz_category_name_es,
       qc.name_en AS quiz_category_name_en,
       qtg.code AS quiz_topic_group_code,
       qtg.name_vi AS quiz_topic_group_name_vi,
       qtg.name_es AS quiz_topic_group_name_es,
       qtg.name_en AS quiz_topic_group_name_en,
       qc.name_vi,
       qc.name_es,
       qc.name_en,
       qc.description_vi,
       qc.description_es,
       qc.description_en,
       IFNULL(qc.allow_random_quiz, FALSE) AS allow_random_quiz,
       qc.is_active,
       qc.created_at,
       qc.updated_at
     FROM quiz_categories qc
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = qc.quiz_topic_group_id
     ORDER BY qc.created_at DESC, qc.id DESC`
  );

  return rows;
}

async function findTypeById(typeId) {
  const [rows] = await pool.execute(
    `SELECT id, id AS quiz_category_id, is_active
     FROM quiz_categories
     WHERE id = ?
     LIMIT 1`,
    [typeId]
  );

  return rows[0] || null;
}

async function createType(payload) {
  const categoryPayload = {
    quiz_topic_group_id: payload.quiz_topic_group_id,
    name_vi: payload.name_vi,
    name_es: payload.name_es,
    name_en: payload.name_en,
    slug: payload.code || payload.slug,
    description_vi: payload.description_vi,
    description_es: payload.description_es,
    description_en: payload.description_en,
    is_active: payload.is_active,
    access_tier: payload.access_tier,
  };
  return createCategory(categoryPayload);
}

async function updateTypeById(typeId, payload) {
  return updateCategoryById(typeId, {
    quiz_topic_group_id: payload.quiz_topic_group_id,
    name_vi: payload.name_vi,
    name_es: payload.name_es,
    name_en: payload.name_en,
    slug: payload.code || payload.slug,
    description_vi: payload.description_vi,
    description_es: payload.description_es,
    description_en: payload.description_en,
    is_active: payload.is_active,
    access_tier: payload.access_tier,
  });
}

async function deleteTypeById(typeId) {
  return deleteCategoryById(typeId);
}

async function countQuizzesByTypeId(typeId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM quizzes
     WHERE category_id = ?`,
    [typeId]
  );
  return Number(rows[0]?.total || 0);
}

async function findFirstTypeIdByCategoryId(categoryId) {
  const numeric = Number(categoryId);
  if (Number.isFinite(numeric) && numeric > 0) return Math.trunc(numeric);
  return 1;
}

async function findAllActiveQuizzes(lang, userId = null, pagination = null) {
  const requestedLimit = Number(pagination?.limit || 0);
  const requestedPage = Number(pagination?.page || 1);
  const usePagination = Number.isFinite(requestedLimit) && requestedLimit > 0;
  const safeLimit = usePagination ? Math.min(Math.floor(requestedLimit), 100) : 0;
  const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
  const safeOffset = usePagination ? (safePage - 1) * safeLimit : 0;

  if (!userId) {
    let query = `SELECT
         q.id,
         CAST(q.category_id AS CHAR) AS quiz_type,
         q.duration_minutes,
         q.total_questions,
         q.passing_score,
         q.created_at,
         q.${pickCol(lang, 'title_vi', 'title_es', 'title_en')} AS title,
         q.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS description,
         c.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} AS category_name,
         c.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS category_description,
         qtg.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} AS quiz_topic_group_name,
         qtg.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS quiz_topic_group_description,
         IFNULL(qtg.allow_random_quiz, FALSE) AS quiz_topic_group_allow_random,
         IFNULL(c.allow_random_quiz, FALSE) AS category_allow_random,
         IFNULL(qtg.access_tier, 'free') AS quiz_topic_group_access_tier,
         IFNULL(c.access_tier, 'free') AS category_access_tier,
         (
           q.access_tier = 'premium'
           OR IFNULL(c.access_tier, 'free') = 'premium'
           OR IFNULL(qtg.access_tier, 'free') = 'premium'
         ) AS requires_premium,
         FALSE AS has_completed,
         NULL AS best_percentage,
         NULL AS best_score
       FROM quizzes q
       LEFT JOIN quiz_categories c ON c.id = q.category_id
       LEFT JOIN quiz_topic_groups qtg ON qtg.id = c.quiz_topic_group_id
       WHERE q.is_active = TRUE
         AND (
           q.category_id IS NULL
           OR (c.is_active = TRUE AND qtg.is_active = TRUE)
         )
       ORDER BY q.created_at DESC`;

    const queryParams = [];
    if (usePagination) {
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(safeLimit, safeOffset);
    }

    const [rows] = await pool.query(query, queryParams);

    return rows;
  }

  let query = `SELECT
       q.id,
       CAST(q.category_id AS CHAR) AS quiz_type,
       q.duration_minutes,
       q.total_questions,
       q.passing_score,
       q.created_at,
       q.${pickCol(lang, 'title_vi', 'title_es', 'title_en')} AS title,
       q.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS description,
       c.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} AS category_name,
       c.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS category_description,
       qtg.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} AS quiz_topic_group_name,
       qtg.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS quiz_topic_group_description,
       IFNULL(qtg.allow_random_quiz, FALSE) AS quiz_topic_group_allow_random,
       IFNULL(c.allow_random_quiz, FALSE) AS category_allow_random,
       IFNULL(qtg.access_tier, 'free') AS quiz_topic_group_access_tier,
       IFNULL(c.access_tier, 'free') AS category_access_tier,
       (
         q.access_tier = 'premium'
         OR IFNULL(c.access_tier, 'free') = 'premium'
         OR IFNULL(qtg.access_tier, 'free') = 'premium'
       ) AS requires_premium,
       CASE WHEN ua.quiz_id IS NULL THEN FALSE ELSE TRUE END AS has_completed,
       ua.best_percentage,
       ua.best_score
     FROM quizzes q
     LEFT JOIN quiz_categories c ON c.id = q.category_id
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = c.quiz_topic_group_id
     LEFT JOIN (
       SELECT
         quiz_id,
         MAX(percentage) AS best_percentage,
         MAX(score) AS best_score
       FROM user_quiz_attempts
       WHERE user_id = ? AND status = 'completed'
       GROUP BY quiz_id
     ) ua ON ua.quiz_id = q.id
     WHERE q.is_active = TRUE
       AND (
         q.category_id IS NULL
         OR (c.is_active = TRUE AND qtg.is_active = TRUE)
       )
     ORDER BY q.created_at DESC`;

  const queryParams = [userId];
  if (usePagination) {
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(safeLimit, safeOffset);
  }

  const [rows] = await pool.query(query, queryParams);

  return rows;
}

async function findQuizById(quizId, lang) {
  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.duration_minutes,
       q.total_questions,
       q.passing_score,
       q.${pickCol(lang, 'title_vi', 'title_es', 'title_en')} AS title,
       q.${pickCol(lang, 'description_vi', 'description_es', 'description_en')} AS description,
       q.${pickCol(lang, 'instructions_vi', 'instructions_es', 'instructions_en')} AS instructions
     FROM quizzes q
     LEFT JOIN quiz_categories c ON c.id = q.category_id
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = c.quiz_topic_group_id
     WHERE q.id = ? AND q.is_active = TRUE
       AND (
         q.category_id IS NULL
         OR (c.is_active = TRUE AND qtg.is_active = TRUE)
       )
     LIMIT 1`,
    [quizId]
  );

  return rows[0] || null;
}

async function findQuestionsByQuizId(quizId, lang) {
  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.order_number,
       q.points,
       q.image_url,
       q.${pickCol(lang, 'question_text_vi', 'question_text_es', 'question_text_en')} AS question_text,
       q.${pickCol(lang, 'explanation_vi', 'explanation_es', 'explanation_en')} AS explanation
     FROM questions q
     WHERE q.quiz_id = ?
     ORDER BY q.order_number ASC`,
    [quizId]
  );

  return rows;
}

async function findAnswersByQuestionIds(questionIds, lang) {
  if (!questionIds.length) {
    return [];
  }

  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.question_id,
       a.order_number,
       a.${pickCol(lang, 'answer_text_vi', 'answer_text_es', 'answer_text_en')} AS answer_text
     FROM answers a
     WHERE a.question_id IN (?)
       AND a.order_number <= 3
     ORDER BY a.question_id ASC, a.order_number ASC`,
    [questionIds]
  );

  return rows;
}

async function findRandomQuestionsByFilters({ quizTopicGroupName, categoryName, limit, lang, hasPremium }) {
  const params = [];
  const gTrim = String(quizTopicGroupName || '').trim();
  const catTrim = String(categoryName || '').trim();
  const whereParts = ['z.is_active = TRUE', 'c.is_active = TRUE', 'tg.is_active = TRUE'];
  // Đã chọn chủ đề (tên category): chỉ cần category bật random; nhóm cha có thể tắt.
  if (catTrim) {
    whereParts.push('IFNULL(c.allow_random_quiz, FALSE) = TRUE');
  } else {
    whereParts.push('tg.allow_random_quiz = TRUE');
    whereParts.push('IFNULL(c.allow_random_quiz, FALSE) = TRUE');
  }
  if (!hasPremium) {
    whereParts.push(`z.access_tier = 'free' AND c.access_tier = 'free' AND tg.access_tier = 'free'`);
  }
  if (gTrim) {
    whereParts.push(`tg.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} = ?`);
    params.push(gTrim);
  }
  if (catTrim) {
    whereParts.push(`c.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} = ?`);
    params.push(catTrim);
  }
  params.push(Number(limit));

  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.order_number,
       q.points,
       q.image_url,
       q.${pickCol(lang, 'question_text_vi', 'question_text_es', 'question_text_en')} AS question_text,
       q.${pickCol(lang, 'explanation_vi', 'explanation_es', 'explanation_en')} AS explanation
     FROM questions q
     INNER JOIN quizzes z ON z.id = q.quiz_id AND z.is_active = TRUE
     INNER JOIN quiz_categories c ON c.id = z.category_id
     INNER JOIN quiz_topic_groups tg ON tg.id = c.quiz_topic_group_id
     WHERE ${whereParts.join(' AND ')}
     ORDER BY RAND()
     LIMIT ?`,
    params
  );

  return rows;
}

async function findRandomQuestionsByFiltersTrilingual({
  quizTopicGroupName,
  categoryName,
  quizCategoryId,
  limit,
  lang,
  hasPremium,
}) {
  const params = [];
  const gTrim = String(quizTopicGroupName || '').trim();
  const catTrim = String(categoryName || '').trim();
  const qCatId = Number(quizCategoryId);
  const useCategoryIdOnly =
    Number.isFinite(qCatId) && qCatId > 0 && !gTrim && !catTrim;

  const whereParts = ['z.is_active = TRUE', 'c.is_active = TRUE', 'tg.is_active = TRUE'];
  const randomByCategoryOnly = useCategoryIdOnly || Boolean(catTrim);
  if (randomByCategoryOnly) {
    whereParts.push('IFNULL(c.allow_random_quiz, FALSE) = TRUE');
  } else {
    whereParts.push('tg.allow_random_quiz = TRUE');
    whereParts.push('IFNULL(c.allow_random_quiz, FALSE) = TRUE');
  }

  if (!hasPremium) {
    whereParts.push(`z.access_tier = 'free' AND c.access_tier = 'free' AND tg.access_tier = 'free'`);
  }
  if (useCategoryIdOnly) {
    whereParts.push('z.category_id = ?');
    params.push(Math.trunc(qCatId));
  } else {
    if (gTrim) {
      whereParts.push(`tg.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} = ?`);
      params.push(gTrim);
    }
    if (catTrim) {
      whereParts.push(`c.${pickCol(lang, 'name_vi', 'name_es', 'name_en')} = ?`);
      params.push(catTrim);
    }
  }
  params.push(Number(limit));

  const [rows] = await pool.query(
    `SELECT
       q.id,
       q.order_number,
       q.points,
       q.image_url,
       q.question_text_vi,
       q.question_text_es,
       q.question_text_en,
       q.explanation_vi,
       q.explanation_es,
       q.explanation_en
     FROM questions q
     INNER JOIN quizzes z ON z.id = q.quiz_id AND z.is_active = TRUE
     INNER JOIN quiz_categories c ON c.id = z.category_id
     INNER JOIN quiz_topic_groups tg ON tg.id = c.quiz_topic_group_id
     WHERE ${whereParts.join(' AND ')}
     ORDER BY RAND()
     LIMIT ?`,
    params
  );

  return rows;
}

async function verifyRandomQuizAllowedForSelection({ lang, quizTopicGroupName, categoryName, quizCategoryId }) {
  const g = String(quizTopicGroupName || '').trim();
  const cat = String(categoryName || '').trim();
  const nameCol = pickCol(lang, 'name_vi', 'name_es', 'name_en');
  const qCatId = Number(quizCategoryId);

  if (Number.isFinite(qCatId) && qCatId > 0 && !g && !cat) {
    const [rows] = await pool.execute(
      `SELECT IFNULL(c.allow_random_quiz, FALSE) AS ar
       FROM quiz_categories c
       INNER JOIN quiz_topic_groups tg ON tg.id = c.quiz_topic_group_id
       WHERE c.id = ? AND tg.is_active = TRUE AND c.is_active = TRUE AND tg.is_active = TRUE
       LIMIT 1`,
      [Math.trunc(qCatId)]
    );
    return Boolean(rows[0]?.ar);
  }

  if (cat && g) {
    const [rows] = await pool.execute(
      `SELECT IFNULL(c.allow_random_quiz, FALSE) AS ar
       FROM quiz_topic_groups tg
       INNER JOIN quiz_categories c ON c.quiz_topic_group_id = tg.id
       WHERE tg.${nameCol} = ? AND c.${nameCol} = ? AND tg.is_active = TRUE AND c.is_active = TRUE
       LIMIT 1`,
      [g, cat]
    );
    return Boolean(rows[0]?.ar);
  }

  if (cat && !g) {
    const [rows] = await pool.execute(
      `SELECT IFNULL(c.allow_random_quiz, FALSE) AS ar
       FROM quiz_categories c
       INNER JOIN quiz_topic_groups tg ON tg.id = c.quiz_topic_group_id
       WHERE c.${nameCol} = ? AND tg.is_active = TRUE AND c.is_active = TRUE AND tg.is_active = TRUE
       LIMIT 1`,
      [cat]
    );
    return Boolean(rows[0]?.ar);
  }

  if (g) {
    const [rows] = await pool.execute(
      `SELECT allow_random_quiz AS ar
       FROM quiz_topic_groups tg
       WHERE tg.${nameCol} = ? AND tg.is_active = TRUE
       LIMIT 1`,
      [g]
    );
    return Boolean(rows[0]?.ar);
  }

  return false;
}

async function getFreeRandomQuizUsageForToday(userId) {
  try {
    const [rows] = await pool.execute(
      `SELECT used_count
       FROM user_random_quiz_daily_usages
       WHERE user_id = ? AND usage_date = CURRENT_DATE()
       LIMIT 1`,
      [userId]
    );
    return Number(rows[0]?.used_count || 0);
  } catch (error) {
    // Backward compatible: if table is not migrated yet, treat as not used.
    if (isMissingDailyUsageTableError(error)) return 0;
    throw error;
  }
}

async function incrementFreeRandomQuizUsageForToday(userId) {
  try {
    await pool.execute(
      `INSERT INTO user_random_quiz_daily_usages (user_id, usage_date, used_count)
       VALUES (?, CURRENT_DATE(), 1)
       ON DUPLICATE KEY UPDATE
         used_count = used_count + 1,
         updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );
  } catch (error) {
    // Backward compatible: skip write when migration has not been applied yet.
    if (isMissingDailyUsageTableError(error)) return;
    throw error;
  }
}

async function findQuizRequiresPremium(quizId) {
  const [rows] = await pool.execute(
    `SELECT
       CASE
         WHEN q.access_tier = 'premium'
           OR IFNULL(c.access_tier, 'free') = 'premium'
           OR IFNULL(qtg.access_tier, 'free') = 'premium'
         THEN TRUE
         ELSE FALSE
       END AS requires_premium
     FROM quizzes q
     LEFT JOIN quiz_categories c ON c.id = q.category_id
     LEFT JOIN quiz_topic_groups qtg ON qtg.id = c.quiz_topic_group_id
     WHERE q.id = ?
     LIMIT 1`,
    [quizId]
  );
  return Boolean(rows[0]?.requires_premium);
}

async function findAnswersWithCorrectByQuestionIds(questionIds, lang) {
  if (!questionIds.length) return [];
  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.question_id,
       a.order_number,
       a.is_correct,
       a.${pickCol(lang, 'answer_text_vi', 'answer_text_es', 'answer_text_en')} AS answer_text
     FROM answers a
     WHERE a.question_id IN (?)
       AND a.order_number <= 3
     ORDER BY a.question_id ASC, a.order_number ASC`,
    [questionIds]
  );
  return rows;
}

async function findAnswersTrilingualWithCorrectByQuestionIds(questionIds) {
  if (!questionIds.length) return [];
  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.question_id,
       a.order_number,
       a.is_correct,
       a.answer_text_vi,
       a.answer_text_es,
       a.answer_text_en
     FROM answers a
     WHERE a.question_id IN (?)
       AND a.order_number <= 3
     ORDER BY a.question_id ASC, a.order_number ASC`,
    [questionIds]
  );
  return rows;
}

async function createManualQuiz(payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
    const [quizResult] = await connection.execute(
      `INSERT INTO quizzes
        (
          category_id,
          title_vi,
          title_es,
          title_en,
          description_vi,
          description_es,
          description_en,
          instructions_vi,
          instructions_es,
          instructions_en,
          duration_minutes,
          total_questions,
          passing_score,
          access_tier,
          is_active,
          created_by
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        payload.category_id || null,
        payload.title_vi,
        payload.title_es,
        payload.title_en,
        payload.description_vi || null,
        payload.description_es || null,
        payload.description_en || null,
        payload.instructions_vi || null,
        payload.instructions_es || null,
        payload.instructions_en || null,
        payload.duration_minutes ?? 0,
        payload.questions.length,
        payload.passing_score ?? 10,
        accessTier,
        payload.created_by,
      ]
    );

    const quizId = quizResult.insertId;
    const pointsPerQuestion = Number((10 / payload.questions.length).toFixed(2));

    for (let index = 0; index < payload.questions.length; index += 1) {
      const question = payload.questions[index];
      const [questionResult] = await connection.execute(
        `INSERT INTO questions
          (
            quiz_id,
            order_number,
            points,
            question_text_vi,
            question_text_es,
            question_text_en,
            explanation_vi,
            explanation_es,
            explanation_en,
            image_url
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          index + 1,
          pointsPerQuestion,
          question.question_text_vi,
          question.question_text_es,
          question.question_text_en,
          question.explanation_vi || null,
          question.explanation_es || null,
          question.explanation_en || null,
          question.image_url || null,
        ]
      );

      const questionId = questionResult.insertId;

      for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex += 1) {
        const answer = question.answers[answerIndex];
        await connection.execute(
          `INSERT INTO answers
            (
              question_id,
              order_number,
              is_correct,
              answer_text_vi,
              answer_text_es,
              answer_text_en
            )
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            questionId,
            answerIndex + 1,
            answer.is_correct,
            answer.answer_text_vi,
            answer.answer_text_es,
            answer.answer_text_en,
          ]
        );
      }
    }

    await connection.commit();
    return { id: quizId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findAllQuizzesForAdmin() {
  const [rows] = await pool.query(
    `SELECT
      q.id,
      CAST(q.category_id AS CHAR) AS quiz_type,
      qc.name_vi AS quiz_type_name_vi,
      qc.name_es AS quiz_type_name_es,
      qc.name_en AS quiz_type_name_en,
      q.category_id,
      qtg.name_vi AS quiz_topic_group_name_vi,
      qtg.name_es AS quiz_topic_group_name_es,
      qtg.name_en AS quiz_topic_group_name_en,
      q.title_vi,
      q.title_es,
      q.title_en,
      q.description_vi,
      q.description_es,
      q.description_en,
      q.instructions_vi,
      q.instructions_es,
      q.instructions_en,
      q.duration_minutes,
      q.total_questions,
      q.passing_score,
      q.access_tier,
      q.is_active,
      q.created_at
     FROM quizzes q
      LEFT JOIN quiz_categories qc ON qc.id = q.category_id
      LEFT JOIN quiz_topic_groups qtg ON qtg.id = qc.quiz_topic_group_id
     ORDER BY q.created_at DESC`
  );

  return rows;
}

async function updateQuizById(quizId, payload) {
  const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
  const [result] = await pool.execute(
    `UPDATE quizzes
     SET category_id = ?,
         title_vi = ?,
         title_es = ?,
         title_en = ?,
         description_vi = ?,
         description_es = ?,
         description_en = ?,
         instructions_vi = ?,
         instructions_es = ?,
         instructions_en = ?,
         passing_score = ?,
         access_tier = ?,
         is_active = ?
     WHERE id = ?`,
    [
      payload.category_id || null,
      payload.title_vi,
      payload.title_es,
      payload.title_en,
      payload.description_vi || null,
      payload.description_es || null,
      payload.description_en || null,
      payload.instructions_vi || null,
      payload.instructions_es || null,
      payload.instructions_en || null,
      payload.passing_score,
      accessTier,
      !!payload.is_active,
      quizId,
    ]
  );

  return result.affectedRows;
}

async function findQuizDetailForAdmin(quizId) {
  const [quizRows] = await pool.execute(
    `SELECT
       q.id,
       q.category_id,
       CAST(q.category_id AS CHAR) AS quiz_type,
       q.title_vi,
       q.title_es,
       q.title_en,
       q.description_vi,
       q.description_es,
       q.description_en,
       q.instructions_vi,
       q.instructions_es,
       q.instructions_en,
       q.duration_minutes,
       q.total_questions,
       q.passing_score,
       q.access_tier,
       q.is_active,
       q.created_at
     FROM quizzes q
     WHERE q.id = ?
     LIMIT 1`,
    [quizId]
  );

  const quiz = quizRows[0] || null;
  if (!quiz) {
    return null;
  }

  const [questionRows] = await pool.execute(
    `SELECT
       id,
       order_number,
       points,
       question_text_vi,
       question_text_es,
       question_text_en,
       explanation_vi,
       explanation_es,
       explanation_en,
       image_url
     FROM questions
     WHERE quiz_id = ?
     ORDER BY order_number ASC`,
    [quizId]
  );

  const questionIds = questionRows.map((row) => row.id);
  let answerRows = [];
  if (questionIds.length) {
    const [rows] = await pool.query(
      `SELECT
         id,
         question_id,
         order_number,
         is_correct,
         answer_text_vi,
         answer_text_es,
         answer_text_en
       FROM answers
       WHERE question_id IN (?)
         AND order_number <= 3
       ORDER BY question_id ASC, order_number ASC`,
      [questionIds]
    );
    answerRows = rows;
  }

  const answersByQuestion = answerRows.reduce((acc, answer) => {
    if (!acc[answer.question_id]) {
      acc[answer.question_id] = [];
    }
    acc[answer.question_id].push(answer);
    return acc;
  }, {});

  return {
    ...quiz,
    questions: questionRows.map((question) => ({
      ...question,
      answers: answersByQuestion[question.id] || [],
    })),
  };
}

async function updateQuizDetailById(quizId, payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const accessTier = payload.access_tier === 'premium' ? 'premium' : 'free';
    const [quizUpdateResult] = await connection.execute(
      `UPDATE quizzes
       SET category_id = ?,
           title_vi = ?,
           title_es = ?,
           title_en = ?,
           description_vi = ?,
           description_es = ?,
           description_en = ?,
           instructions_vi = ?,
           instructions_es = ?,
           instructions_en = ?,
           total_questions = ?,
           passing_score = ?,
           access_tier = ?,
           is_active = ?
       WHERE id = ?`,
      [
        payload.category_id || null,
        payload.title_vi,
        payload.title_es,
        payload.title_en,
        payload.description_vi || null,
        payload.description_es || null,
        payload.description_en || null,
        payload.instructions_vi || null,
        payload.instructions_es || null,
        payload.instructions_en || null,
        payload.questions.length,
        payload.passing_score,
        accessTier,
        payload.is_active == null ? true : Boolean(payload.is_active),
        quizId,
      ]
    );

    if (!quizUpdateResult.affectedRows) {
      await connection.rollback();
      return 0;
    }

    const pointsPerQuestion = Number((10 / payload.questions.length).toFixed(2));

    const [existingQuestionRows] = await connection.execute(
      `SELECT id FROM questions WHERE quiz_id = ?`,
      [quizId]
    );
    const existingQuestionIds = new Set(existingQuestionRows.map((row) => Number(row.id)));

    const incomingQuestionIds = payload.questions
      .map((question) => Number(question.id))
      .filter((id) => Number.isInteger(id) && id > 0);

    const questionIdsToDelete = [...existingQuestionIds].filter(
      (id) => !incomingQuestionIds.includes(id)
    );

    if (questionIdsToDelete.length) {
      await connection.query(`DELETE FROM answers WHERE question_id IN (?)`, [questionIdsToDelete]);
      await connection.query(`DELETE FROM questions WHERE id IN (?) AND quiz_id = ?`, [
        questionIdsToDelete,
        quizId,
      ]);
    }

    for (let questionIndex = 0; questionIndex < payload.questions.length; questionIndex += 1) {
      const question = payload.questions[questionIndex];
      const providedQuestionId = Number(question.id);
      const hasProvidedQuestionId = Number.isInteger(providedQuestionId) && providedQuestionId > 0;
      let questionId = providedQuestionId;

      if (hasProvidedQuestionId && !existingQuestionIds.has(providedQuestionId)) {
        const notFoundError = new Error('Question not found');
        notFoundError.status = 404;
        throw notFoundError;
      }

      if (hasProvidedQuestionId) {
        await connection.execute(
          `UPDATE questions
           SET order_number = ?,
               points = ?,
               question_text_vi = ?,
               question_text_es = ?,
               question_text_en = ?,
               explanation_vi = ?,
               explanation_es = ?,
               explanation_en = ?,
               image_url = ?
           WHERE id = ? AND quiz_id = ?`,
          [
            questionIndex + 1,
            pointsPerQuestion,
            question.question_text_vi,
            question.question_text_es,
            question.question_text_en,
            question.explanation_vi || null,
            question.explanation_es || null,
            question.explanation_en || null,
            question.image_url || null,
            providedQuestionId,
            quizId,
          ]
        );
      } else {
        const [questionInsertResult] = await connection.execute(
          `INSERT INTO questions
             (quiz_id, order_number, points, question_text_vi, question_text_es, question_text_en, explanation_vi, explanation_es, explanation_en, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quizId,
            questionIndex + 1,
            pointsPerQuestion,
            question.question_text_vi,
            question.question_text_es,
            question.question_text_en,
            question.explanation_vi || null,
            question.explanation_es || null,
            question.explanation_en || null,
            question.image_url || null,
          ]
        );
        questionId = Number(questionInsertResult.insertId);
      }

      const [existingAnswerRows] = await connection.execute(
        `SELECT id FROM answers WHERE question_id = ?`,
        [questionId]
      );
      const existingAnswerIds = new Set(existingAnswerRows.map((row) => Number(row.id)));

      const incomingAnswerIds = (question.answers || [])
        .map((answer) => Number(answer.id))
        .filter((id) => Number.isInteger(id) && id > 0);

      const answerIdsToDelete = [...existingAnswerIds].filter((id) => !incomingAnswerIds.includes(id));
      if (answerIdsToDelete.length) {
        await connection.query(`DELETE FROM answers WHERE id IN (?) AND question_id = ?`, [
          answerIdsToDelete,
          questionId,
        ]);
      }

      for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex += 1) {
        const answer = question.answers[answerIndex];
        const providedAnswerId = Number(answer.id);
        const hasProvidedAnswerId = Number.isInteger(providedAnswerId) && providedAnswerId > 0;

        if (hasProvidedAnswerId && !existingAnswerIds.has(providedAnswerId)) {
          const notFoundError = new Error('Answer not found');
          notFoundError.status = 404;
          throw notFoundError;
        }

        if (hasProvidedAnswerId) {
          await connection.execute(
            `UPDATE answers
             SET order_number = ?,
                 is_correct = ?,
                 answer_text_vi = ?,
                 answer_text_es = ?,
                 answer_text_en = ?
             WHERE id = ? AND question_id = ?`,
            [
              answerIndex + 1,
              Boolean(answer.is_correct),
              answer.answer_text_vi,
              answer.answer_text_es,
              answer.answer_text_en,
              providedAnswerId,
              questionId,
            ]
          );
        } else {
          await connection.execute(
            `INSERT INTO answers
               (question_id, order_number, is_correct, answer_text_vi, answer_text_es, answer_text_en)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              questionId,
              answerIndex + 1,
              Boolean(answer.is_correct),
              answer.answer_text_vi,
              answer.answer_text_es,
              answer.answer_text_en,
            ]
          );
        }
      }
    }

    await connection.commit();
    return 1;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteQuizById(quizId) {
  const [result] = await pool.execute('DELETE FROM quizzes WHERE id = ?', [quizId]);
  return result.affectedRows;
}

module.exports = {
  findAllTopicGroups,
  findAllTopicGroupsForAdmin,
  createTopicGroup,
  updateTopicGroupById,
  deleteTopicGroupById,
  countCategoriesByTopicGroupId,
  findAllActiveCategories,
  findAllCategoriesForAdmin,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  findAllActiveTypes,
  findAllTypesForAdmin,
  findTypeById,
  createType,
  updateTypeById,
  deleteTypeById,
  countQuizzesByTypeId,
  findFirstTypeIdByCategoryId,
  findAllActiveQuizzes,
  findQuizById,
  findQuestionsByQuizId,
  findAnswersByQuestionIds,
  findRandomQuestionsByFilters,
  findRandomQuestionsByFiltersTrilingual,
  verifyRandomQuizAllowedForSelection,
  getFreeRandomQuizUsageForToday,
  incrementFreeRandomQuizUsageForToday,
  findQuizRequiresPremium,
  findAnswersWithCorrectByQuestionIds,
  findAnswersTrilingualWithCorrectByQuestionIds,
  createManualQuiz,
  findAllQuizzesForAdmin,
  updateQuizById,
  findQuizDetailForAdmin,
  updateQuizDetailById,
  deleteQuizById,
};
