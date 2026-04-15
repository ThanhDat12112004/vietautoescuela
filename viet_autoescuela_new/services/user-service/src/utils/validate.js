function validateOrThrow(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const msg = first?.message || 'Invalid payload';
    const err = new Error(msg);
    err.status = 400;
    err.details = parsed.error.issues;
    throw err;
  }
  return parsed.data;
}

module.exports = { validateOrThrow };
