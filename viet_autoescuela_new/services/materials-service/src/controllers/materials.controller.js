const materialsService = require('../services/materials.service');
const { getLang } = require('../utils/lang');
const {
  parsePositiveNumber,
  parseRequiredId,
  requireViEsNames,
} = require('../validators/materials.validator');

async function listSubjects(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listSubjects(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listMaterialCountsBySubject(_req, res, next) {
  try {
    const rows = await materialsService.listMaterialCountsBySubject();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listTopicGroups(req, res, next) {
  try {
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listTopicGroups(lang);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function listTopicGroupsAdmin(_req, res, next) {
  try {
    const rows = await materialsService.listTopicGroupsForAdmin();
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
    access_tier,
  } = req.body;
  try {
    requireViEsNames(name_vi, name_es, 'name_vi and name_es are required');
    const result = await materialsService.createTopicGroup({
      code,
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      is_active,
      access_tier,
      created_by: req.user.id,
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
    access_tier,
  } = req.body;
  try {
    const topicGroupId = parseRequiredId(req.params.id, 'id', 'topic group id');
    requireViEsNames(name_vi, name_es, 'name_vi and name_es are required');
    const result = await materialsService.updateTopicGroup(topicGroupId, {
      code,
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

async function deleteTopicGroup(req, res, next) {
  try {
    const topicGroupId = parseRequiredId(req.params.id, 'id', 'topic group id');
    const result = await materialsService.deleteTopicGroup(topicGroupId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function listSubjectsAdmin(_req, res, next) {
  try {
    const rows = await materialsService.listSubjectsForAdmin();
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createSubject(req, res, next) {
  const {
    name_vi,
    name_es,
    name_en,
    description_vi,
    description_es,
    description_en,
    material_topic_group_id,
    access_tier,
  } = req.body;
  try {
    requireViEsNames(name_vi, name_es, 'name_vi and name_es are required');
    const topicGroupId = parsePositiveNumber(
      material_topic_group_id,
      'material_topic_group_id',
      1
    );
    const result = await materialsService.createSubject({
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      material_topic_group_id: topicGroupId,
      access_tier,
      created_by: req.user.id,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateSubject(req, res, next) {
  const {
    name_vi,
    name_es,
    name_en,
    description_vi,
    description_es,
    description_en,
    material_topic_group_id,
    is_active,
    access_tier,
  } = req.body;
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    requireViEsNames(name_vi, name_es, 'name_vi and name_es are required');
    const topicGroupId = parsePositiveNumber(
      material_topic_group_id,
      'material_topic_group_id',
      1
    );
    const result = await materialsService.updateSubject(subjectId, {
      name_vi,
      name_es,
      name_en: String(name_en || name_es).trim(),
      description_vi,
      description_es,
      description_en: description_en != null ? description_en : description_es,
      material_topic_group_id: topicGroupId,
      access_tier,
      ...(is_active !== undefined ? { is_active: Boolean(is_active) } : {}),
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteSubject(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const result = await materialsService.deleteSubject(subjectId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function listMaterialPosts(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const lang = getLang(req.query.lang);
    const rows = await materialsService.listMaterialPosts(subjectId, lang, req.user);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function getMaterialPost(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const postId = parseRequiredId(req.params.postId, 'postId', 'post id');
    const lang = getLang(req.query.lang);
    const row = await materialsService.getMaterialPost(subjectId, postId, lang, req.user);
    return res.json(row);
  } catch (error) {
    return next(error);
  }
}

async function listMaterialPostsAdmin(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const rows = await materialsService.listMaterialPostsForAdmin(subjectId);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

function readMaterialPostPayload(body) {
  const {
    title_vi,
    title_es,
    title_en,
    excerpt_vi,
    excerpt_es,
    excerpt_en,
    body_html_vi,
    body_html_es,
    body_html_en,
    access_tier,
    is_published,
    sort_order,
  } = body;
  return {
    title_vi,
    title_es,
    title_en: title_en != null ? String(title_en).trim() : '',
    excerpt_vi: excerpt_vi || null,
    excerpt_es: excerpt_es || null,
    excerpt_en: excerpt_en || null,
    body_html_vi: body_html_vi != null ? String(body_html_vi) : '',
    body_html_es: body_html_es != null ? String(body_html_es) : '',
    body_html_en: body_html_en != null ? String(body_html_en) : '',
    access_tier,
    is_published,
    sort_order,
  };
}

async function createMaterialPost(req, res, next) {
  try {
    const subjectId = parseRequiredId(req.params.id, 'id', 'subject id');
    const p = readMaterialPostPayload(req.body);
    if (!p.title_vi || !p.title_es) {
      const appError = new Error('title_vi and title_es are required');
      appError.status = 400;
      throw appError;
    }
    const titleEn = String(p.title_en || p.title_es).trim();
    const result = await materialsService.createMaterialPost({
      subject_id: subjectId,
      ...p,
      title_en: titleEn,
      created_by: req.user.id,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateMaterialPost(req, res, next) {
  const postId = Number(req.params.postId);
  if (!Number.isFinite(postId) || postId <= 0) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
  try {
    const p = readMaterialPostPayload(req.body);
    if (!p.title_vi || !p.title_es) {
      return res.status(400).json({ message: 'title_vi and title_es are required' });
    }
    const subjectId = parsePositiveNumber(req.body.material_type_id ?? req.body.subject_id, 'subject_id', 0);
    if (!subjectId) {
      return res.status(400).json({ message: 'subject_id (or material_type_id) is required' });
    }
    const titleEn = String(p.title_en || p.title_es).trim();
    const result = await materialsService.updateMaterialPost(postId, {
      subject_id: subjectId,
      ...p,
      title_en: titleEn,
    }, req.headers.authorization || '');
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteMaterialPost(req, res, next) {
  const postId = Number(req.params.postId);
  if (!Number.isFinite(postId) || postId <= 0) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
  try {
    const result = await materialsService.deleteMaterialPost(postId, req.headers.authorization || '');
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMaterialCountsBySubject,
  listTopicGroups,
  listTopicGroupsAdmin,
  createTopicGroup,
  updateTopicGroup,
  deleteTopicGroup,
  listSubjects,
  listSubjectsAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
  listMaterialPosts,
  getMaterialPost,
  listMaterialPostsAdmin,
  createMaterialPost,
  updateMaterialPost,
  deleteMaterialPost,
};
