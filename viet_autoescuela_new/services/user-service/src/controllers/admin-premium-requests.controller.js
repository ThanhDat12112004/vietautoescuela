const adminPremiumRequestsService = require('../services/admin-premium-requests.service');
const premiumPaymentRepository = require('../repositories/premium-payment.repository');
const {
  resolvePremiumBillAbsolutePath,
  resolveInternalMediaBillFetchUrl,
  sniffImageMime,
} = require('../utils/premium-bill-file');
const fsSync = require('fs');

async function list(req, res, next) {
  try {
    const statusRaw = String(req.query.status || '').trim().toLowerCase();
    const status =
      statusRaw === 'pending' || statusRaw === 'approved' || statusRaw === 'rejected'
        ? statusRaw
        : undefined;
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const usernameSearch = String(req.query.username || '').trim();
    const planRaw = String(req.query.plan_code || '').trim().toLowerCase();
    const planCode = planRaw === '1m' || planRaw === '3m' ? planRaw : undefined;
    const dateFrom = String(req.query.date_from || '').trim();
    const dateTo = String(req.query.date_to || '').trim();
    const rows = await adminPremiumRequestsService.listRequests({
      status,
      limit,
      offset,
      usernameSearch: usernameSearch || undefined,
      planCode,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    return res.json({ items: rows });
  } catch (e) {
    return next(e);
  }
}

async function approve(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const adminNote = String(req.body?.admin_note || '').trim() || null;
    const result = await adminPremiumRequestsService.approveRequest({
      requestId: id,
      adminUserId: req.user.id,
      adminNote,
    });
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

async function reject(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const adminNote = String(req.body?.admin_note || '').trim() || null;
    const result = await adminPremiumRequestsService.rejectRequest({
      requestId: id,
      adminUserId: req.user.id,
      adminNote,
    });
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

async function getBill(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const row = await premiumPaymentRepository.findPremiumPaymentRequestById(id);
    if (!row) {
      return res.status(404).json({ message: 'Not found' });
    }
    const abs = resolvePremiumBillAbsolutePath(row);
    if (abs) {
      const fd = fsSync.openSync(abs, 'r');
      const buf = Buffer.alloc(16);
      fsSync.readSync(fd, buf, 0, 16, 0);
      fsSync.closeSync(fd);
      const mime = sniffImageMime(buf);
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.sendFile(abs);
    }

    const remoteUrl = resolveInternalMediaBillFetchUrl(row);
    if (remoteUrl && typeof fetch === 'function') {
      const r = await fetch(remoteUrl);
      if (r.ok) {
        const body = Buffer.from(await r.arrayBuffer());
        const head = body.length >= 16 ? body.subarray(0, 16) : body;
        const mime = sniffImageMime(head);
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.send(body);
      }
    }

    return res.status(404).json({ message: 'Bill file not found' });
  } catch (e) {
    return next(e);
  }
}

async function destroy(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const result = await adminPremiumRequestsService.deleteRequest({ requestId: id });
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

module.exports = { list, approve, reject, getBill, destroy };
