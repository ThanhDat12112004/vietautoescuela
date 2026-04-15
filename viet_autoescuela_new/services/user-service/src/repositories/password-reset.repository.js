const pool = require('../config/db');

async function deleteTokensForUser(userId) {
  await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
}

async function insertToken({ userId, tokenHash, expiresAt }) {
  const [result] = await pool.execute(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );
  return result.insertId;
}

async function findValidByTokenHash(tokenHash) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, token_hash, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [id]);
}

module.exports = {
  deleteTokensForUser,
  insertToken,
  findValidByTokenHash,
  markUsed,
};
