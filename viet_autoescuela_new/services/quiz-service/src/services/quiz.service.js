const quizRepository = require('../repositories/quiz.repository');
const { hasPremiumAccess } = require('../utils/access');

function normalizeMediaPath(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }
}

function normalizeQuestionMediaRefs(questions = []) {
  return questions.map((question) => ({
    ...question,
    image_url: normalizeMediaPath(question.image_url),
  }));
}

/** English columns are NOT NULL: copy ES when client omits EN (admin may fill VI/ES/EN separately). */
function fillEnglishFromSpanish(payload) {
  const p = { ...payload };
  p.title_en = String(p.title_en || p.title_es || '').trim();
  if (p.description_en == null || String(p.description_en).trim() === '') {
    p.description_en = p.description_es;
  }
  if (p.instructions_en == null || String(p.instructions_en).trim() === '') {
    p.instructions_en = p.instructions_es;
  }
  p.questions = (p.questions || []).map((q) => {
    const question = { ...q };
    question.question_text_en = String(question.question_text_en || question.question_text_es || '').trim();
    if (question.explanation_en == null || String(question.explanation_en).trim() === '') {
      question.explanation_en = question.explanation_es;
    }
    question.answers = (question.answers || []).map((a) => ({
      ...a,
      answer_text_en: String(a.answer_text_en || a.answer_text_es || '').trim(),
    }));
    return question;
  });
  return p;
}

function normalizeQuizTypeId(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.trunc(numeric);
  }

  // Backward-compatible mapping for legacy string values.
  const legacyMap = {
    general: 1,
    bien_bao: 2,
    cao_toc: 3,
    ly_thuyet: 4,
    an_toan: 5,
    sa_hinh: 6,
  };
  return legacyMap[String(value || '').trim().toLowerCase()] || 1;
}

async function resolveQuizTypeId(payload = {}) {
  const categoryId = Number(payload.category_id);
  if (Number.isFinite(categoryId) && categoryId > 0) {
    const byCategory = await quizRepository.findFirstTypeIdByCategoryId(categoryId);
    if (byCategory) return byCategory;
  }
  return normalizeQuizTypeId(payload.quiz_type_id ?? payload.quiz_type);
}

async function getRandomQuizPreviewAccess(user) {
  const hasPremium = hasPremiumAccess(user);
  if (hasPremium) {
    return {
      has_premium: true,
      daily_limit: null,
      used_today: 0,
      can_use_today: true,
    };
  }

  const usedToday = await quizRepository.getFreeRandomQuizUsageForToday(user.id);
  const dailyLimit = 1;
  return {
    has_premium: false,
    daily_limit: dailyLimit,
    used_today: usedToday,
    can_use_today: usedToday < dailyLimit,
  };
}

async function listQuizzes(lang, userId = null, pagination = null) {
  return quizRepository.findAllActiveQuizzes(lang, userId, pagination);
}

async function listTopicGroups(lang) {
  return quizRepository.findAllTopicGroups(lang);
}

async function listTopicGroupsForAdmin() {
  return quizRepository.findAllTopicGroupsForAdmin();
}

async function createTopicGroup(payload) {
  try {
    const id = await quizRepository.createTopicGroup(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Topic group code already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function updateTopicGroup(topicGroupId, payload) {
  try {
    const affected = await quizRepository.updateTopicGroupById(topicGroupId, payload);
    if (!affected) {
      const appError = new Error('Topic group not found');
      appError.status = 404;
      throw appError;
    }
    return { id: topicGroupId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Topic group code already exists');
      appError.status = 409;
      throw appError;
    }
    throw error;
  }
}

async function deleteTopicGroup(topicGroupId) {
  const usedCount = await quizRepository.countCategoriesByTopicGroupId(topicGroupId);
  if (usedCount > 0) {
    const appError = new Error('Cannot delete topic group because it is being used');
    appError.status = 409;
    throw appError;
  }
  const affected = await quizRepository.deleteTopicGroupById(topicGroupId);
  if (!affected) {
    const appError = new Error('Topic group not found');
    appError.status = 404;
    throw appError;
  }
  return { id: topicGroupId };
}

async function listCategories(lang) {
  return quizRepository.findAllActiveCategories(lang);
}

async function listCategoriesForAdmin() {
  return quizRepository.findAllCategoriesForAdmin();
}

async function listTypes(lang) {
  return quizRepository.findAllActiveTypes(lang);
}

async function listTypesForAdmin() {
  return quizRepository.findAllTypesForAdmin();
}

async function createType(payload) {
  try {
    const id = await quizRepository.createType(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Type already exists');
      appError.status = 409;
      throw appError;
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      const appError = new Error('Quiz topic group not found');
      appError.status = 400;
      throw appError;
    }

    throw error;
  }
}

async function updateType(typeId, payload) {
  const existing = await quizRepository.findTypeById(typeId);
  if (!existing) {
    const appError = new Error('Type not found');
    appError.status = 404;
    throw appError;
  }

  try {
    const affected = await quizRepository.updateTypeById(typeId, payload);
    if (!affected) {
      const appError = new Error('Type not found');
      appError.status = 404;
      throw appError;
    }

    return { id: typeId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Type already exists');
      appError.status = 409;
      throw appError;
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      const appError = new Error('Quiz topic group not found');
      appError.status = 400;
      throw appError;
    }

    throw error;
  }
}

async function deleteType(typeId) {
  const existing = await quizRepository.findTypeById(typeId);
  if (!existing) {
    const appError = new Error('Type not found');
    appError.status = 404;
    throw appError;
  }

  const usedCount = await quizRepository.countQuizzesByTypeId(existing.id);
  if (usedCount > 0) {
    const appError = new Error('Cannot delete type because it is being used');
    appError.status = 409;
    throw appError;
  }

  const affected = await quizRepository.deleteTypeById(typeId);
  if (!affected) {
    const appError = new Error('Type not found');
    appError.status = 404;
    throw appError;
  }

  return { id: typeId };
}

async function createCategory(payload) {
  try {
    const id = await quizRepository.createCategory(payload);
    return { id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Category slug already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function updateCategory(categoryId, payload) {
  try {
    const affected = await quizRepository.updateCategoryById(categoryId, payload);
    if (!affected) {
      const appError = new Error('Category not found');
      appError.status = 404;
      throw appError;
    }

    return { id: categoryId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Category slug already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function deleteCategory(categoryId) {
  try {
    const affected = await quizRepository.deleteCategoryById(categoryId);
    if (!affected) {
      const appError = new Error('Category not found');
      appError.status = 404;
      throw appError;
    }

    return { id: categoryId };
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      const appError = new Error('Cannot delete category because it is being used');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function getQuizDetail(quizId, lang, user) {
  const quiz = await quizRepository.findQuizById(quizId, lang);

  if (!quiz) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  const requiresPremium = await quizRepository.findQuizRequiresPremium(quizId);
  const premiumOk = hasPremiumAccess(user);
  if (requiresPremium && !premiumOk) {
    return {
      id: quiz.id,
      code: String(quiz.id),
      duration_minutes: Number(quiz.duration_minutes || 0),
      total_questions: Number(quiz.total_questions || 0),
      passing_score: Number(quiz.passing_score || 0),
      title: quiz.title,
      description: quiz.description,
      instructions: quiz.instructions || null,
      questions: [],
      content_locked: true,
      requires_premium: true,
    };
  }

  const questions = await quizRepository.findQuestionsByQuizId(quizId, lang);
  const questionIds = questions.map((item) => item.id);
  const answers = await quizRepository.findAnswersByQuestionIds(questionIds, lang);

  const answersByQuestion = answers.reduce((acc, item) => {
    if (!acc[item.question_id]) {
      acc[item.question_id] = [];
    }

    acc[item.question_id].push({
      id: item.id,
      order_number: item.order_number,
      answer_text: item.answer_text,
    });

    return acc;
  }, {});

  quiz.code = quiz.code != null ? String(quiz.code) : String(quiz.id);
  quiz.content_locked = false;
  quiz.requires_premium = Boolean(requiresPremium);
  quiz.questions = questions.map((question) => ({
    id: question.id,
    order_number: question.order_number,
    points: Number(question.points),
    image_url: question.image_url,
    question_text: question.question_text,
    explanation: question.explanation,
    answers: answersByQuestion[question.id] || [],
  }));

  return quiz;
}

async function getRandomQuizPreview(lang, payload, user) {
  const totalQuestions = Number(payload.total_questions || 30);
  const quizTopicGroupName = String(payload.quiz_topic_group_name || '').trim();
  const categoryName = String(payload.category_name || '').trim();
  const quizCategoryIdRaw = Number(payload.quiz_category_id);
  const quizCategoryId =
    Number.isFinite(quizCategoryIdRaw) && quizCategoryIdRaw > 0 ? Math.trunc(quizCategoryIdRaw) : null;
  const hasPremium = hasPremiumAccess(user);

  if (!hasPremium) {
    const usedToday = await quizRepository.getFreeRandomQuizUsageForToday(user.id);
    if (usedToday >= 1) {
      const appError = new Error('Free account can use random quiz only once per day');
      appError.status = 403;
      throw appError;
    }
  }

  if (quizTopicGroupName || categoryName || quizCategoryId) {
    const allowed = await quizRepository.verifyRandomQuizAllowedForSelection({
      lang,
      quizTopicGroupName,
      categoryName,
      quizCategoryId,
    });
    if (!allowed) {
      const appError = new Error(
        'Random quiz is not enabled for this selection (admin: enable “Allow random” on the quiz topic / category; the parent topic group can stay off when random is scoped to a topic)'
      );
      appError.status = 403;
      throw appError;
    }
  }

  const questions = await quizRepository.findRandomQuestionsByFiltersTrilingual({
    quizTopicGroupName: quizTopicGroupName || null,
    categoryName: categoryName || null,
    quizCategoryId,
    limit: totalQuestions,
    lang,
    hasPremium,
  });

  if (!questions.length) {
    const appError = new Error('No questions found for selected filters');
    appError.status = 404;
    throw appError;
  }

  const questionIds = questions.map((item) => item.id);
  const answers = await quizRepository.findAnswersTrilingualWithCorrectByQuestionIds(questionIds);
  const answersByQuestion = answers.reduce((acc, item) => {
    if (!acc[item.question_id]) acc[item.question_id] = [];
    const primary =
      lang === 'es'
        ? item.answer_text_es || item.answer_text_vi || item.answer_text_en
        : lang === 'en'
          ? item.answer_text_en || item.answer_text_es || item.answer_text_vi
          : item.answer_text_vi || item.answer_text_es || item.answer_text_en;
    acc[item.question_id].push({
      id: item.id,
      order_number: item.order_number,
      answer_text: String(primary ?? ''),
      answer_text_vi: item.answer_text_vi,
      answer_text_es: item.answer_text_es,
      answer_text_en: item.answer_text_en,
      is_correct: Boolean(item.is_correct),
    });
    return acc;
  }, {});

  if (!hasPremium) {
    await quizRepository.incrementFreeRandomQuizUsageForToday(user.id);
  }

  return {
    id: 0,
    code: 'random-temp',
    duration_minutes: 0,
    total_questions: questions.length,
    passing_score: 5,
    title: `De random tam thoi (${questions.length} cau)`,
    description: 'Khong luu lich su, khong luu ket qua vao he thong.',
    instructions: null,
    questions: questions.map((question, index) => {
      const qtVi = question.question_text_vi;
      const qtEs = question.question_text_es;
      const qtEn = question.question_text_en;
      const exVi = question.explanation_vi;
      const exEs = question.explanation_es;
      const exEn = question.explanation_en;
      const questionPrimary =
        lang === 'es'
          ? qtEs || qtVi || qtEn
          : lang === 'en'
            ? qtEn || qtEs || qtVi
            : qtVi || qtEs || qtEn;
      const explanationPrimary =
        lang === 'es'
          ? exEs ?? exVi ?? exEn
          : lang === 'en'
            ? exEn ?? exEs ?? exVi
            : exVi ?? exEs ?? exEn;

      return {
        id: question.id,
        order_number: index + 1,
        points: Number(question.points || 0),
        image_url: question.image_url,
        question_text: String(questionPrimary ?? ''),
        explanation: explanationPrimary ?? null,
        question_text_vi: qtVi,
        question_text_es: qtEs,
        question_text_en: qtEn,
        explanation_vi: exVi,
        explanation_es: exEs,
        explanation_en: exEn,
        answers: answersByQuestion[question.id] || [],
      };
    }),
  };
}

async function createManualQuiz(payload) {
  try {
    const quizTypeId = await resolveQuizTypeId(payload);
    const withLang = fillEnglishFromSpanish({
      ...payload,
      questions: normalizeQuestionMediaRefs(payload.questions || []),
    });
    return await quizRepository.createManualQuiz({
      ...withLang,
      quiz_type_id: quizTypeId,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const appError = new Error('Quiz already exists');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function listQuizzesForAdmin() {
  return quizRepository.findAllQuizzesForAdmin();
}

async function updateQuiz(quizId, payload) {
  const quizTypeId = await resolveQuizTypeId(payload);
  const normalizedPayload = {
    ...payload,
    title_en: String(payload.title_en || payload.title_es || '').trim(),
    description_en:
      payload.description_en != null && String(payload.description_en).trim() !== ''
        ? payload.description_en
        : payload.description_es,
    instructions_en:
      payload.instructions_en != null && String(payload.instructions_en).trim() !== ''
        ? payload.instructions_en
        : payload.instructions_es,
    quiz_type_id: quizTypeId,
  };

  const affected = await quizRepository.updateQuizById(quizId, normalizedPayload);
  if (!affected) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return { id: quizId };
}

async function getQuizDetailForAdmin(quizId) {
  const detail = await quizRepository.findQuizDetailForAdmin(quizId);
  if (!detail) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return detail;
}

async function updateQuizDetail(quizId, payload) {
  const quizTypeId = await resolveQuizTypeId(payload);
  const normalizedPayload = fillEnglishFromSpanish({
    ...payload,
    quiz_type_id: quizTypeId,
    questions: normalizeQuestionMediaRefs(payload.questions || []),
  });

  const affected = await quizRepository.updateQuizDetailById(quizId, normalizedPayload);
  if (!affected) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return { id: quizId };
}

async function deleteQuiz(quizId) {
  const affected = await quizRepository.deleteQuizById(quizId);
  if (!affected) {
    const appError = new Error('Quiz not found');
    appError.status = 404;
    throw appError;
  }

  return { id: quizId };
}

module.exports = {
  listQuizzes,
  listTopicGroups,
  listTopicGroupsForAdmin,
  createTopicGroup,
  updateTopicGroup,
  deleteTopicGroup,
  listCategories,
  listCategoriesForAdmin,
  listTypes,
  listTypesForAdmin,
  createType,
  updateType,
  deleteType,
  createCategory,
  updateCategory,
  deleteCategory,
  getQuizDetail,
  getRandomQuizPreviewAccess,
  getRandomQuizPreview,
  createManualQuiz,
  listQuizzesForAdmin,
  getQuizDetailForAdmin,
  updateQuizDetail,
  updateQuiz,
  deleteQuiz,
};
