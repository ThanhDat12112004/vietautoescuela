const quizService = require('../services/quiz.service');
const { getLang } = require('../utils/lang');
const {
  createManualQuizSchema,
  updateQuizDetailSchema,
} = require('../validators/quiz-admin.validator');
const {
  parseOptionalPositiveNumber,
  parsePositiveNumber,
  parseRequiredId,
  requireViEsNames,
} = require('../validators/quiz-request.validator');
const { validateOrThrow } = require('../utils/validate');

async function listQuizzes(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rawLimit = Number(req.query.limit);
    const rawPage = Number(req.query.page || 1);
    const hasPagination = Number.isFinite(rawLimit) && rawLimit > 0;
    const pagination = hasPagination
      ? {
          limit: Math.min(Math.floor(rawLimit), 100),
          page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
        }
      : null;

    const quizzes = await quizService.listQuizzes(lang, req.user?.id || null, pagination);
    return res.json(quizzes);
  } catch (error) {
    return next(error);
  }
}

async function listCategories(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await quizService.listCategories(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listTopicGroups(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await quizService.listTopicGroups(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listAdminTopicGroups(_req, res, next) {
  try {
    const rows = await quizService.listTopicGroupsForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createTopicGroup(req, res, next) {
  const {
    code,
    name_vi,
    name_es,
    name_en,
    description_vi,
    description_es,
    description_en,
    is_active,
    allow_random_quiz,
    access_tier,
  } = req.body;
  try {
    requireViEsNames(name_vi, name_es);
    const result = await quizService.createTopicGroup({
      code,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      allow_random_quiz,
      access_tier,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateTopicGroup(req, res, next) {
  const {
    code,
    name_vi,
    name_es,
    name_en,
    description_vi,
    description_es,
    description_en,
    is_active,
    allow_random_quiz,
    access_tier,
  } = req.body;
  try {
    const topicGroupId = parseRequiredId(req.params.id, 'topic group id');
    requireViEsNames(name_vi, name_es);
    const result = await quizService.updateTopicGroup(topicGroupId, {
      code,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      allow_random_quiz,
      access_tier,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteTopicGroup(req, res, next) {
  try {
    const topicGroupId = parseRequiredId(req.params.id, 'topic group id');
    const result = await quizService.deleteTopicGroup(topicGroupId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function listTypes(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await quizService.listTypes(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function getQuizDetail(req, res, next) {
  try {
    const quizId = parseRequiredId(req.params.id, 'quiz id');
    const lang = getLang(req.query.lang);
    const quiz = await quizService.getQuizDetail(quizId, lang, req.user);
    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

async function getRandomQuizPreviewAccess(req, res, next) {
  try {
    const access = await quizService.getRandomQuizPreviewAccess(req.user);
    return res.json(access);
  } catch (error) {
    return next(error);
  }
}

async function getRandomQuizPreview(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const totalQuestions = Number(req.body?.total_questions || 30);
    const quizTopicGroupName = String(req.body?.quiz_topic_group_name || '').trim();
    const categoryName = String(req.body?.category_name || '').trim();
    const quizCategoryIdRaw = Number(req.body?.quiz_category_id);
    const quizCategoryId =
      Number.isFinite(quizCategoryIdRaw) && quizCategoryIdRaw > 0 ? Math.trunc(quizCategoryIdRaw) : null;

    if (totalQuestions !== 30) {
      return res.status(400).json({ message: 'Only 30-question random quiz is supported' });
    }

    const quiz = await quizService.getRandomQuizPreview(
      lang,
      {
        total_questions: 30,
        ...(quizCategoryId && !quizTopicGroupName && !categoryName
          ? { quiz_category_id: quizCategoryId }
          : {}),
        ...(quizTopicGroupName ? { quiz_topic_group_name: quizTopicGroupName } : {}),
        ...(categoryName ? { category_name: categoryName } : {}),
      },
      req.user
    );
    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
}

async function createManualQuiz(req, res, next) {
  try {
    const payload = validateOrThrow(createManualQuizSchema, req.body);
    const created = await quizService.createManualQuiz({
      ...payload,
      created_by: req.user.id,
    });
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

async function listAdminQuizzes(_req, res, next) {
  try {
    const rows = await quizService.listQuizzesForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listAdminCategories(_req, res, next) {
  try {
    const rows = await quizService.listCategoriesForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listAdminTypes(_req, res, next) {
  try {
    const rows = await quizService.listTypesForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createType(req, res, next) {
  const {
    code,
    name_vi,
    name_es,
    name_en,
    description_vi,
    description_es,
    description_en,
    is_active,
    quiz_topic_group_id,
    quiz_category_id,
    access_tier,
  } = req.body;

  try {
    requireViEsNames(name_vi, name_es);
    const topicGroupId = parseOptionalPositiveNumber(quiz_topic_group_id, 'quiz_topic_group_id');
    const categoryId = parseOptionalPositiveNumber(quiz_category_id, 'quiz_category_id');
    const result = await quizService.createType({
      code,
      quiz_topic_group_id: Number.isFinite(topicGroupId) ? topicGroupId : undefined,
      quiz_category_id: Number.isFinite(categoryId) ? categoryId : undefined,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      access_tier,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateType(req, res, next) {
  const {
    code,
    name_vi,
    name_es,
    name_en,
    description_vi,
    description_es,
    description_en,
    is_active,
    quiz_topic_group_id,
    quiz_category_id,
    access_tier,
  } = req.body;
  try {
    const typeId = parseRequiredId(req.params.id, 'type id');
    requireViEsNames(name_vi, name_es);
    const topicGroupId = parseOptionalPositiveNumber(quiz_topic_group_id, 'quiz_topic_group_id');
    const categoryId = parseOptionalPositiveNumber(quiz_category_id, 'quiz_category_id');
    const result = await quizService.updateType(typeId, {
      code,
      quiz_topic_group_id: Number.isFinite(topicGroupId) ? topicGroupId : undefined,
      quiz_category_id: Number.isFinite(categoryId) ? categoryId : undefined,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      access_tier,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteType(req, res, next) {
  try {
    const typeId = parseRequiredId(req.params.id, 'type id');
    const result = await quizService.deleteType(typeId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  const {
    name_vi,
    name_es,
    name_en,
    slug,
    description_vi,
    description_es,
    description_en,
    is_active,
    quiz_topic_group_id,
    access_tier,
    allow_random_quiz,
  } = req.body;

  try {
    requireViEsNames(name_vi, name_es);
    const topicGroupId = parsePositiveNumber(quiz_topic_group_id, 'quiz_topic_group_id', 1);
    const result = await quizService.createCategory({
      quiz_topic_group_id: topicGroupId,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      slug,
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      access_tier,
      allow_random_quiz,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateCategory(req, res, next) {
  const {
    name_vi,
    name_es,
    name_en,
    slug,
    description_vi,
    description_es,
    description_en,
    is_active,
    quiz_topic_group_id,
    access_tier,
    allow_random_quiz,
  } = req.body;

  try {
    const categoryId = parseRequiredId(req.params.id, 'category id');
    requireViEsNames(name_vi, name_es);
    const topicGroupId = parsePositiveNumber(quiz_topic_group_id, 'quiz_topic_group_id', 1);
    const result = await quizService.updateCategory(categoryId, {
      quiz_topic_group_id: topicGroupId,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      slug,
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      access_tier,
      allow_random_quiz,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const categoryId = parseRequiredId(req.params.id, 'category id');
    const result = await quizService.deleteCategory(categoryId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateQuiz(req, res, next) {
  const {
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
    passing_score,
    is_active,
    access_tier,
  } = req.body;

  if (!title_vi || !title_es || !passing_score) {
    return res
      .status(400)
      .json({ message: 'title_vi, title_es, passing_score are required' });
  }

  try {
    const quizId = parseRequiredId(req.params.id, 'quiz id');
    const result = await quizService.updateQuiz(quizId, {
      category_id,
      title_vi,
      title_es,
      title_en: String(title_en || title_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      instructions_vi,
      instructions_es,
      instructions_en: instructions_en != null ? instructions_en : instructions_es,
      passing_score,
      is_active,
      access_tier,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getAdminQuizDetail(req, res, next) {
  try {
    const quizId = parseRequiredId(req.params.id, 'quiz id');
    const detail = await quizService.getQuizDetailForAdmin(quizId);
    return res.json(detail);
  } catch (error) {
    return next(error);
  }
}

async function updateQuizDetail(req, res, next) {
  try {
    const quizId = parseRequiredId(req.params.id, 'quiz id');
    const payload = validateOrThrow(updateQuizDetailSchema, req.body);
    const result = await quizService.updateQuizDetail(quizId, payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    const quizId = parseRequiredId(req.params.id, 'quiz id');
    const result = await quizService.deleteQuiz(quizId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listQuizzes,
  listTopicGroups,
  listAdminTopicGroups,
  createTopicGroup,
  updateTopicGroup,
  deleteTopicGroup,
  listCategories,
  listTypes,
  getQuizDetail,
  getRandomQuizPreviewAccess,
  getRandomQuizPreview,
  createManualQuiz,
  listAdminQuizzes,
  listAdminCategories,
  listAdminTypes,
  createType,
  updateType,
  deleteType,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminQuizDetail,
  updateQuizDetail,
  updateQuiz,
  deleteQuiz,
};
