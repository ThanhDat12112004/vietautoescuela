function hasPremiumAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!user.premium_until) return false;
  const t = new Date(user.premium_until).getTime();
  return Number.isFinite(t) && t > Date.now();
}

module.exports = { hasPremiumAccess };
