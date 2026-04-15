const fs = require('fs');
const premiumPaymentRepository = require('../repositories/premium-payment.repository');
const userRepository = require('../repositories/user.repository');
const { resolvePremiumBillAbsolutePath } = require('../utils/premium-bill-file');

async function listRequests({ status, limit, offset, usernameSearch, planCode, dateFrom, dateTo }) {
  return premiumPaymentRepository.listPremiumPaymentRequestsWithUsers({
    status,
    limit,
    offset,
    usernameSearch,
    planCode,
    dateFrom,
    dateTo,
  });
}

async function approveRequest({ requestId, adminUserId, adminNote }) {
  const row = await premiumPaymentRepository.findPremiumPaymentRequestById(requestId);
  if (!row) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }
  if (row.status !== 'pending') {
    const err = new Error('Request is not pending');
    err.status = 409;
    throw err;
  }

  const updated = await premiumPaymentRepository.updatePremiumRequestReview({
    id: requestId,
    status: 'approved',
    reviewedById: adminUserId,
    adminNote,
  });
  if (!updated) {
    const err = new Error('Could not update request');
    err.status = 409;
    throw err;
  }

  await userRepository.extendPremiumFromRequest(row.user_id, row.plan_code);
  return { ok: true, request_id: requestId };
}

async function rejectRequest({ requestId, adminUserId, adminNote }) {
  const row = await premiumPaymentRepository.findPremiumPaymentRequestById(requestId);
  if (!row) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }
  if (row.status !== 'pending') {
    const err = new Error('Request is not pending');
    err.status = 409;
    throw err;
  }

  const updated = await premiumPaymentRepository.updatePremiumRequestReview({
    id: requestId,
    status: 'rejected',
    reviewedById: adminUserId,
    adminNote,
  });
  if (!updated) {
    const err = new Error('Could not update request');
    err.status = 409;
    throw err;
  }

  return { ok: true, request_id: requestId };
}

async function deleteRequest({ requestId }) {
  const row = await premiumPaymentRepository.findPremiumPaymentRequestById(requestId);
  if (!row) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }
  const abs = resolvePremiumBillAbsolutePath(row);
  if (abs) {
    try {
      fs.unlinkSync(abs);
    } catch {
      /* best-effort */
    }
  }
  const deleted = await premiumPaymentRepository.deletePremiumPaymentRequestById(requestId);
  if (!deleted) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }
  return { ok: true, request_id: requestId };
}

module.exports = { listRequests, approveRequest, rejectRequest, deleteRequest };
