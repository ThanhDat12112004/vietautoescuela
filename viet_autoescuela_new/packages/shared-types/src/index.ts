export type Locale = 'vi' | 'es' | 'en';

export type UserRole = 'student' | 'teacher' | 'admin';

export type AccessTier = 'free' | 'premium';

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};
