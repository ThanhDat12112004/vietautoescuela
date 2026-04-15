const pool = require('../config/db');

async function insertPremiumPaymentRequest({
  userId,
  planCode,
  payerNote,
  billStoragePath,
  billCdnUrl = null,
}) {
  const [result] = await pool.execute(
    `INSERT INTO premium_payment_requests (user_id, plan_code, payer_note, bill_storage_path, bill_cdn_url, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [userId, planCode, payerNote || null, billStoragePath, billCdnUrl || null]
  );
  return result.insertId;
}

async function findPremiumPaymentRequestByIdAndUser(requestId, userId) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, bill_storage_path, bill_cdn_url
     FROM premium_payment_requests
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [requestId, userId]
  );
  return rows[0] || null;
}

async function findPremiumPaymentRequestById(requestId) {
  const [rows] = await pool.execute(
    `SELECT id, user_id, plan_code, payer_note, bill_storage_path, bill_cdn_url, status,
            admin_note, reviewed_at, reviewed_by_id, created_at
     FROM premium_payment_requests
     WHERE id = ?
     LIMIT 1`,
    [requestId]
  );
  return rows[0] || null;
}

function isYmd(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function listPremiumPaymentRequestsWithUsers({
  status,
  limit = 50,
  offset = 0,
  usernameSearch,
  planCode,
  dateFrom,
  dateTo,
}) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const off = Math.max(Number(offset) || 0, 0);
  const params = [];
  let where = '1=1';
  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    where += ' AND r.status = ?';
    params.push(status);
  }
  const userTerm = String(usernameSearch || '').trim();
  if (userTerm) {
    where += ' AND LOCATE(LOWER(?), LOWER(u.username)) > 0';
    params.push(userTerm);
  }
  if (planCode === '1m' || planCode === '3m') {
    where += ' AND r.plan_code = ?';
    params.push(planCode);
  }
  if (isYmd(dateFrom)) {
    where += ' AND DATE(r.created_at) >= ?';
    params.push(dateFrom);
  }
  if (isYmd(dateTo)) {
    where += ' AND DATE(r.created_at) <= ?';
    params.push(dateTo);
  }
  params.push(lim, off);

  const [rows] = await pool.query(
    `SELECT r.id, r.user_id, r.plan_code, r.payer_note, r.bill_storage_path, r.bill_cdn_url, r.status,
            r.admin_note, r.reviewed_at, r.reviewed_by_id, r.created_at,
            u.username, u.email, u.full_name
     FROM premium_payment_requests r
     INNER JOIN users u ON u.id = r.user_id
     WHERE ${where}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    params
  );
  return rows;
}

async function updatePremiumRequestReview({ id, status, reviewedById, adminNote }) {
  const [result] = await pool.execute(
    `UPDATE premium_payment_requests
     SET status = ?, reviewed_at = NOW(), reviewed_by_id = ?, admin_note = ?
     WHERE id = ? AND status = 'pending'`,
    [status, reviewedById || null, adminNote || null, id]
  );
  return result.affectedRows;
}

async function deletePremiumPaymentRequestById(id) {
  const [result] = await pool.execute(`DELETE FROM premium_payment_requests WHERE id = ?`, [id]);
  return result.affectedRows;
}

module.exports = {
  insertPremiumPaymentRequest,
  findPremiumPaymentRequestByIdAndUser,
  findPremiumPaymentRequestById,
  listPremiumPaymentRequestsWithUsers,
  updatePremiumRequestReview,
  deletePremiumPaymentRequestById,
};
