const streamsBySessionId = new Map();

function writeEvent(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload || {})}\n\n`);
}

function subscribeSession(sessionId, res) {
  if (!sessionId) {
    return () => {};
  }

  if (!streamsBySessionId.has(sessionId)) {
    streamsBySessionId.set(sessionId, new Set());
  }

  const bucket = streamsBySessionId.get(sessionId);
  bucket.add(res);

  writeEvent(res, 'ready', { ok: true });

  return () => {
    const nextBucket = streamsBySessionId.get(sessionId);
    if (!nextBucket) return;
    nextBucket.delete(res);
    if (nextBucket.size === 0) {
      streamsBySessionId.delete(sessionId);
    }
  };
}

function publishSessionReplaced(sessionId) {
  if (!sessionId) return;
  const bucket = streamsBySessionId.get(sessionId);
  if (!bucket || bucket.size === 0) return;

  for (const res of bucket) {
    writeEvent(res, 'session-replaced', {
      reason: 'Session expired on this device',
    });
    res.end();
  }
  streamsBySessionId.delete(sessionId);
}

module.exports = {
  subscribeSession,
  publishSessionReplaced,
};
