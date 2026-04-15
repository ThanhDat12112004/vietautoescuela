const express = require('express');
const materialsController = require('../../controllers/materials.controller');
const { authRequired, authOptional, requireRoles } = require('../../middleware/auth.middleware');
const { cacheGet } = require('../../middleware/cache.middleware');

const router = express.Router();

router.get(
  '/subjects',
  authOptional,
  cacheGet(60_000, { bypass: (req) => Boolean(req.headers.authorization) }),
  materialsController.listSubjects
);
router.get('/subjects/material-counts', cacheGet(60_000), materialsController.listMaterialCountsBySubject);
router.get('/topic-groups', cacheGet(60_000), materialsController.listTopicGroups);
router.get(
  '/admin/topic-groups',
  authRequired,
  requireRoles('admin'),
  materialsController.listTopicGroupsAdmin
);
router.post(
  '/admin/topic-groups',
  authRequired,
  requireRoles('admin'),
  materialsController.createTopicGroup
);
router.patch(
  '/admin/topic-groups/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.updateTopicGroup
);
router.delete(
  '/admin/topic-groups/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.deleteTopicGroup
);
router.get(
  '/admin/subjects',
  authRequired,
  requireRoles('admin'),
  materialsController.listSubjectsAdmin
);
router.post(
  '/admin/subjects',
  authRequired,
  requireRoles('admin'),
  materialsController.createSubject
);
router.patch(
  '/admin/subjects/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.updateSubject
);
router.delete(
  '/admin/subjects/:id',
  authRequired,
  requireRoles('admin'),
  materialsController.deleteSubject
);
router.get(
  '/admin/subjects/:id/posts',
  authRequired,
  requireRoles('admin'),
  materialsController.listMaterialPostsAdmin
);
router.post(
  '/admin/subjects/:id/posts',
  authRequired,
  requireRoles('admin'),
  materialsController.createMaterialPost
);
router.get(
  '/subjects/:id/posts',
  authOptional,
  cacheGet(60_000, {
    bypass: (req) => Boolean(req.query?.bust) || Boolean(req.headers.authorization),
  }),
  materialsController.listMaterialPosts
);
router.get(
  '/subjects/:id/posts/:postId',
  authOptional,
  cacheGet(30_000, {
    bypass: (req) => Boolean(req.query?.bust) || Boolean(req.headers.authorization),
  }),
  materialsController.getMaterialPost
);
router.patch(
  '/admin/posts/:postId',
  authRequired,
  requireRoles('admin'),
  materialsController.updateMaterialPost
);
router.delete(
  '/admin/posts/:postId',
  authRequired,
  requireRoles('admin'),
  materialsController.deleteMaterialPost
);

module.exports = router;
