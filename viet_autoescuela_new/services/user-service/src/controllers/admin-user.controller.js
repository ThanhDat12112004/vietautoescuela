const adminUserService = require('../services/admin-user.service');

function toUserId(rawId) {
  const userId = Number(rawId);
  if (Number.isNaN(userId)) {
    const error = new Error('Invalid user id');
    error.status = 400;
    throw error;
  }
  return userId;
}

async function listUsers(_req, res, next) {
  try {
    const users = await adminUserService.listUsers();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = toUserId(req.params.id);
    const result = await adminUserService.updateUser(userId, req.body || {}, req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = toUserId(req.params.id);
    const result = await adminUserService.deleteUser(userId, req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function lockUser(req, res, next) {
  try {
    const userId = toUserId(req.params.id);
    const result = await adminUserService.setUserLock(userId, true, req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function unlockUser(req, res, next) {
  try {
    const userId = toUserId(req.params.id);
    const result = await adminUserService.setUserLock(userId, false, req.user.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
  lockUser,
  unlockUser,
};
