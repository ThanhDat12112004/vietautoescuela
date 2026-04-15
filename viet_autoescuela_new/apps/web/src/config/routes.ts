/**
 * Đường dẫn ứng dụng không gồm segment locale (middleware sẽ gắn /vi|es|en).
 * Dùng với localePath() trong lib/i18n-routing.
 */
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OAUTH_CALLBACK: '/auth/callback',
  MATERIALS: '/materials',
  QUIZZES: '/quizzes',
  QUIZ_TAKE: '/quiz/:id',
  QUIZ_PREFIX: '/quiz/',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  PREMIUM: '/premium',
  PREMIUM_PAYMENT: '/premium/payment',
  ADMIN: '/admin',
  TERMS: '/terms',
  SERVICE_POLICY: '/service-policy',
  FAQ: '/faq',
} as const;
