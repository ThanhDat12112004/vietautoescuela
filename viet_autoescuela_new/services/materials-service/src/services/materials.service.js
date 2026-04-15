const materialsRepository = require('../repositories/materials.repository');
const { hasPremiumAccess } = require('../utils/access');
const { diffRemovedMaterialImages, extractMaterialImageKeysFromPost } = require('../utils/material-media-cleanup');

const LANGS = ['vi', 'es', 'en'];
const mediaServiceUrl = String(process.env.MEDIA_SERVICE_URL || '').trim().replace(/\/$/, '');

function pickLang(row, lang, base) {
  const s = lang === 'es' ? 'es' : lang === 'en' ? 'en' : 'vi';
  return row[`${base}_${s}`];
}

async function listSubjects(lang) {
  return materialsRepository.findSubjects(lang);
}

async function listTopicGroups(lang) {
  return materialsRepository.findAllTopicGroups(lang);
}

async function listTopicGroupsForAdmin() {
  return materialsRepository.findAllTopicGroupsForAdmin();
}

async function createTopicGroup(payload) {
  try {
    const id = await materialsRepository.createTopicGroup(payload);
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
    const affected = await materialsRepository.updateTopicGroupById(topicGroupId, payload);
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
  const usedCount = await materialsRepository.countSubjectsByTopicGroupId(topicGroupId);
  if (usedCount > 0) {
    const appError = new Error('Cannot delete topic group because it is being used');
    appError.status = 409;
    throw appError;
  }
  const affected = await materialsRepository.deleteTopicGroupById(topicGroupId);
  if (!affected) {
    const appError = new Error('Topic group not found');
    appError.status = 404;
    throw appError;
  }
  return { id: topicGroupId };
}

async function listSubjectsForAdmin() {
  return materialsRepository.findAllSubjectsAdmin();
}

async function listMaterialCountsBySubject() {
  return materialsRepository.findMaterialCountsBySubject();
}

async function createSubject(payload) {
  const topicGroupId = Number(payload.material_topic_group_id || 1);
  const exists = await materialsRepository.materialTopicGroupExistsById(topicGroupId);
  if (!exists) {
    const appError = new Error(
      'Chưa có nhóm chủ đề tương ứng. Hãy tạo nhóm tài liệu (lớp cha) trong Admin trước, rồi chọn đúng nhóm khi tạo chủ đề.'
    );
    appError.status = 400;
    throw appError;
  }
  try {
    return await materialsRepository.createSubject(payload);
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      const appError = new Error(
        'Nhóm chủ đề không tồn tại hoặc đã bị xóa. Chọn nhóm tài liệu khác hoặc tạo nhóm mới.'
      );
      appError.status = 400;
      throw appError;
    }
    throw error;
  }
}

async function updateSubject(subjectId, payload) {
  const topicGroupId = Number(payload.material_topic_group_id || 1);
  const exists = await materialsRepository.materialTopicGroupExistsById(topicGroupId);
  if (!exists) {
    const appError = new Error(
      'Chưa có nhóm chủ đề tương ứng. Hãy tạo nhóm tài liệu (lớp cha) trong Admin trước, rồi chọn đúng nhóm.'
    );
    appError.status = 400;
    throw appError;
  }
  try {
    const affected = await materialsRepository.updateSubject(subjectId, payload);

    if (!affected) {
      const appError = new Error('Subject not found');
      appError.status = 404;
      throw appError;
    }

    return { id: subjectId };
  } catch (error) {
    if (error.status) throw error;
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      const appError = new Error(
        'Nhóm chủ đề không tồn tại hoặc đã bị xóa. Chọn nhóm tài liệu khác hoặc tạo nhóm mới.'
      );
      appError.status = 400;
      throw appError;
    }
    throw error;
  }
}

async function deleteSubject(subjectId) {
  try {
    const affected = await materialsRepository.deleteSubject(subjectId);

    if (!affected) {
      const appError = new Error('Subject not found');
      appError.status = 404;
      throw appError;
    }

    return { id: subjectId };
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      const appError = new Error('Cannot delete subject because it is being used');
      appError.status = 409;
      throw appError;
    }

    throw error;
  }
}

async function assertSubjectVisibleToLearner(subjectId) {
  const visible = await materialsRepository.findMaterialSubjectPublicGate(subjectId);
  if (!visible) {
    const appError = new Error('Subject not found');
    appError.status = 404;
    throw appError;
  }
}

function boolPremiumFlag(v) {
  return Boolean(v === true || v === 1 || v === '1');
}

async function requestDeleteMediaFile(key, authHeader) {
  if (!mediaServiceUrl || !key) return;
  const headers = { 'Content-Type': 'application/json' };
  if (authHeader) headers.Authorization = authHeader;

  try {
    await fetch(`${mediaServiceUrl}/media/files`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ key }),
    });
  } catch (error) {
    console.error('[materials-service] failed to delete media file', key, error?.message || error);
  }
}

async function cleanupMaterialImages(keys, authHeader) {
  if (!Array.isArray(keys) || !keys.length) return;
  await Promise.all(keys.map((key) => requestDeleteMediaFile(key, authHeader)));
}

async function listMaterialPosts(subjectId, lang, user) {
  await assertSubjectVisibleToLearner(subjectId);
  const subjectNeedsPremium = await materialsRepository.findSubjectRequiresPremium(subjectId);
  const premiumOk = hasPremiumAccess(user);
  const rows = await materialsRepository.findMaterialPostsList(subjectId, lang);
  return rows.map((row) => {
    const postPremium = boolPremiumFlag(row.requires_premium);
    const subjectLocked = subjectNeedsPremium && !premiumOk;
    const contentLocked = subjectLocked || (postPremium && !premiumOk);
    return {
      ...row,
      requires_premium: postPremium,
      subject_requires_premium: subjectNeedsPremium,
      content_locked: contentLocked,
    };
  });
}

async function getMaterialPost(subjectId, postId, lang, user) {
  await assertSubjectVisibleToLearner(subjectId);

  const l = LANGS.includes(lang) ? lang : 'vi';
  const row = await materialsRepository.findMaterialPostById(subjectId, postId, l);
  if (!row || !row.is_published) {
    const appError = new Error('Post not found');
    appError.status = 404;
    throw appError;
  }

  const subjectNeedsPremium = await materialsRepository.findSubjectRequiresPremium(subjectId);
  const postNeedsPremium = boolPremiumFlag(row.requires_premium);
  const premiumOk = hasPremiumAccess(user);
  const contentLocked = (subjectNeedsPremium || postNeedsPremium) && !premiumOk;

  const topicGroupName = row.topic_group_name != null ? String(row.topic_group_name).trim() : '';
  const subjectName = row.subject_name != null ? String(row.subject_name).trim() : '';
  const base = {
    id: row.id,
    subject_id: row.subject_id,
    title: pickLang(row, l, 'title'),
    excerpt: pickLang(row, l, 'excerpt'),
    requires_premium: postNeedsPremium,
    subject_requires_premium: subjectNeedsPremium,
    content_locked: contentLocked,
    updated_at: row.uploaded_at,
    topic_group_name: topicGroupName || null,
    subject_name: subjectName || null,
  };

  if (contentLocked) {
    return {
      ...base,
      body_html: '',
    };
  }

  return {
    ...base,
    body_html: pickLang(row, l, 'body_html'),
  };
}

async function listMaterialPostsForAdmin(subjectId) {
  const exists = await materialsRepository.findMaterialSubjectExists(subjectId);
  if (!exists) {
    const appError = new Error('Subject not found');
    appError.status = 404;
    throw appError;
  }
  return materialsRepository.findMaterialPostsAdminBySubject(subjectId);
}

async function createMaterialPost(payload) {
  try {
    const id = await materialsRepository.createMaterialPost(payload);
    return { id };
  } catch (error) {
    throw error;
  }
}

async function updateMaterialPost(postId, payload, authHeader = '') {
  const existing = await materialsRepository.findMaterialPostRawById(postId);
  if (!existing) {
    const appError = new Error('Post not found');
    appError.status = 404;
    throw appError;
  }

  const affected = await materialsRepository.updateMaterialPost(postId, payload);
  if (!affected) {
    const appError = new Error('Post not found');
    appError.status = 404;
    throw appError;
  }

  const removedKeys = diffRemovedMaterialImages(existing, payload);
  await cleanupMaterialImages(removedKeys, authHeader);
  return { id: postId };
}

async function deleteMaterialPost(postId, authHeader = '') {
  const existing = await materialsRepository.findMaterialPostRawById(postId);
  if (!existing) {
    const appError = new Error('Post not found');
    appError.status = 404;
    throw appError;
  }

  const affected = await materialsRepository.deleteMaterialPost(postId);
  if (!affected) {
    const appError = new Error('Post not found');
    appError.status = 404;
    throw appError;
  }

  const keys = Array.from(extractMaterialImageKeysFromPost(existing));
  await cleanupMaterialImages(keys, authHeader);
  return { id: postId };
}

module.exports = {
  listTopicGroups,
  listTopicGroupsForAdmin,
  createTopicGroup,
  updateTopicGroup,
  deleteTopicGroup,
  listSubjects,
  listSubjectsForAdmin,
  listMaterialCountsBySubject,
  createSubject,
  updateSubject,
  deleteSubject,
  listMaterialPosts,
  getMaterialPost,
  listMaterialPostsForAdmin,
  createMaterialPost,
  updateMaterialPost,
  deleteMaterialPost,
};
