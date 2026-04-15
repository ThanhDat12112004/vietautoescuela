const premiumPaymentService = require('../services/premium-payment.service');

async function submitPremiumPayment(req, res, next) {
  try {
    const planCode = String(req.body?.plan_code || '').trim();
    const payerNote = String(req.body?.payer_note || '').trim();
    const file = req.file;
    const skipServerEmail = ['1', 'true', 'yes'].includes(
      String(req.body?.skip_server_email || '').toLowerCase()
    );

    if (!file?.path) {
      return res.status(400).json({ message: 'bill image (field: bill) is required' });
    }

    const result = await premiumPaymentService.submitPremiumPaymentRequest({
      userId: req.user.id,
      planCode,
      payerNote,
      billAbsolutePath: file.path,
      skipServerEmail,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function submitPremiumPaymentFromMedia(req, res, next) {
  try {
    const planCode = String(req.body?.plan_code || '').trim();
    const payerNote = String(req.body?.payer_note || '').trim();
    const billMediaKey = String(req.body?.bill_media_key || '').trim();
    const billCdnUrl = String(req.body?.bill_cdn_url || '').trim();
    const skipServerEmail = ['1', 'true', 'yes'].includes(
      String(req.body?.skip_server_email || '').toLowerCase()
    );

    if (!billMediaKey) {
      return res.status(400).json({ message: 'bill_media_key is required' });
    }

    const result = await premiumPaymentService.submitPremiumPaymentFromMedia({
      userId: req.user.id,
      planCode,
      payerNote,
      billMediaKey,
      billCdnUrl,
      skipServerEmail,
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { submitPremiumPayment, submitPremiumPaymentFromMedia };
