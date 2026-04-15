const pool = require('../config/db');

async function createUser({ username, email, passwordHash, fullName }) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, fullName || null]
  );

  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, role, full_name, password_hash, google_sub, avatar_url, is_active, current_session_id,
            premium_plan, premium_until
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

/** Đăng nhập: cùng một chuỗi có thể là email (so khớp không phân biệt hoa thường) hoặc username (khớp chính xác). */
async function findUserByUsernameOrEmail(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;

  const [rows] = await pool.execute(
    `SELECT id, username, email, role, full_name, password_hash, google_sub, avatar_url, is_active, current_session_id,
            premium_plan, premium_until
     FROM users WHERE LOWER(email) = LOWER(?) OR username = ? LIMIT 1`,
    [raw, raw]
  );

  return rows[0] || null;
}

async function findUserByGoogleSub(googleSub) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, role, full_name, password_hash, google_sub, avatar_url, is_active, current_session_id,
            premium_plan, premium_until
     FROM users WHERE google_sub = ? LIMIT 1`,
    [googleSub]
  );
  return rows[0] || null;
}

async function createGoogleUser({ username, email, googleSub, fullName, avatarUrl }) {
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, google_sub, full_name, avatar_url)
     VALUES (?, ?, NULL, ?, ?, ?)`,
    [username, email, googleSub, fullName || null, avatarUrl || null]
  );
  return result.insertId;
}

async function linkGoogleSub(userId, googleSub) {
  const [result] = await pool.execute(
    `UPDATE users SET google_sub = ? WHERE id = ? AND google_sub IS NULL`,
    [googleSub, userId]
  );
  return result.affectedRows;
}

async function updateGoogleProfileFields(userId, payload = {}) {
  const fullName = payload.fullName == null ? null : String(payload.fullName).trim() || null;
  const avatarUrl = payload.avatarUrl == null ? null : String(payload.avatarUrl).trim() || null;
  await pool.execute(
    `UPDATE users
     SET full_name = COALESCE(?, full_name),
         avatar_url = COALESCE(?, avatar_url)
     WHERE id = ?`,
    [fullName, avatarUrl, userId]
  );
}

async function setPasswordHash(userId, passwordHash) {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

async function isUsernameTaken(username) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
  return !!rows[0];
}

async function updateLoginSession(userId, sessionId) {
  await pool.execute(
    'UPDATE users SET last_login_at = NOW(), current_session_id = ? WHERE id = ?',
    [sessionId, userId]
  );
}

async function clearCurrentSession(userId) {
  await pool.execute('UPDATE users SET current_session_id = NULL WHERE id = ?', [userId]);
}

async function findSessionByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT id, role, is_active, current_session_id, premium_plan, premium_until
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findAllUsers() {
  const [rows] = await pool.query(
    `SELECT
      id,
      username,
      email,
      role,
      full_name,
      premium_plan,
      premium_until,
      is_active,
      last_login_at,
      created_at
     FROM users
     ORDER BY created_at DESC`
  );

  return rows;
}

async function findUserById(userId) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, role, full_name, avatar_url, is_active, premium_plan, premium_until
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function findUserWithPasswordById(userId) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, role, full_name, avatar_url, password_hash, is_active
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function updateUserByAdmin(userId, payload) {
  if (payload.passwordHash) {
    await pool.execute(
      `UPDATE users
       SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?, password_hash = ?,
           premium_plan = ?, premium_until = ?,
           current_session_id = CASE WHEN ? = FALSE THEN NULL ELSE current_session_id END
       WHERE id = ?`,
      [
        payload.username,
        payload.email,
        payload.fullName || null,
        payload.role,
        !!payload.isActive,
        payload.passwordHash,
        payload.premiumPlan,
        payload.premiumUntil,
        !!payload.isActive,
        userId,
      ]
    );
    return;
  }

  await pool.execute(
    `UPDATE users
     SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?,
         premium_plan = ?, premium_until = ?,
         current_session_id = CASE WHEN ? = FALSE THEN NULL ELSE current_session_id END
     WHERE id = ?`,
    [
      payload.username,
      payload.email,
      payload.fullName || null,
      payload.role,
      !!payload.isActive,
      payload.premiumPlan,
      payload.premiumUntil,
      !!payload.isActive,
      userId,
    ]
  );
}

async function deleteUserById(userId) {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
  return result.affectedRows;
}

async function setUserLock(userId, locked) {
  const [result] = await pool.execute(
    `UPDATE users
     SET is_active = ?, current_session_id = CASE WHEN ? = TRUE THEN NULL ELSE current_session_id END
     WHERE id = ?`,
    [!locked, !!locked, userId]
  );

  return result.affectedRows;
}

async function updateProfileByUser(userId, payload) {
  if (payload.passwordHash) {
    await pool.execute(
      `UPDATE users
       SET full_name = ?, password_hash = ?
       WHERE id = ?`,
      [payload.fullName || null, payload.passwordHash, userId]
    );
    return;
  }

  await pool.execute(
    `UPDATE users
     SET full_name = ?
     WHERE id = ?`,
    [payload.fullName || null, userId]
  );
}

async function updateAvatarUrl(userId, avatarUrl) {
  await pool.execute(
    `UPDATE users
     SET avatar_url = ?
     WHERE id = ?`,
    [avatarUrl || null, userId]
  );

  return findUserById(userId);
}

/** Gia hạn gói từ max(hiện tại, premium_until) theo plan_code (1m | 3m). */
async function extendPremiumFromRequest(userId, planCode) {
  const months = planCode === '3m' ? 3 : 1;
  await pool.execute(
    `UPDATE users
     SET premium_plan = ?,
         premium_until = DATE_ADD(
           GREATEST(COALESCE(premium_until, '2000-01-01 00:00:00'), NOW()),
           INTERVAL ? MONTH
         )
     WHERE id = ?`,
    [planCode, months, userId]
  );
  return findUserById(userId);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsernameOrEmail,
  findUserByGoogleSub,
  createGoogleUser,
  linkGoogleSub,
  updateGoogleProfileFields,
  setPasswordHash,
  isUsernameTaken,
  updateLoginSession,
  clearCurrentSession,
  findSessionByUserId,
  findAllUsers,
  findUserById,
  findUserWithPasswordById,
  updateUserByAdmin,
  deleteUserById,
  setUserLock,
  updateAvatarUrl,
  updateProfileByUser,
  extendPremiumFromRequest,
};
