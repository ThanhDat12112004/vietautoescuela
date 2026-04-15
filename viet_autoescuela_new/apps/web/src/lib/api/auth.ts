import type { AuthUser } from '@/lib/auth';
import { apiRequest, getApiBaseUrl } from './client';
import type { LoginResponse } from './types';

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  full_name?: string;
};

/** `email` = email hoặc username (tên field giữ để tương thích API). */
export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateMyProfilePayload = {
  full_name?: string;
  current_password?: string;
  new_password?: string;
};

type MessageWithUser = {
  message: string;
  user: AuthUser;
};

export async function register(payload: RegisterPayload) {
  return apiRequest<{ id: number; username: string; email: string }>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function logout() {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    auth: true,
  });
}

export type SessionPingResponse = { ok: boolean; user: AuthUser };

export async function pingSession() {
  return apiRequest<SessionPingResponse>('/auth/session', {
    method: 'GET',
    auth: true,
  });
}

/** Dùng sau OAuth: token chưa lưu localStorage — gửi Bearer trực tiếp. */
export async function fetchSessionWithBearer(token: string) {
  return apiRequest<SessionPingResponse>('/auth/session', {
    method: 'GET',
    auth: true,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function forgotPassword(payload: { email: string; locale?: 'vi' | 'es' | 'en' }) {
  return apiRequest<{ ok: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

export async function resetPassword(payload: { token: string; new_password: string }) {
  return apiRequest<{ ok: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: payload,
  });
}

/** URL đầy đủ hoặc path tương đối (qua rewrite Next) tới Google OAuth. */
export function getGoogleOAuthStartUrl(locale: string): string {
  const path = `/auth/oauth/google/start?locale=${encodeURIComponent(locale)}`;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return base ? `${base}${path}` : path;
}

/** `true` khi user-service đã set GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI. */
export async function fetchGoogleOAuthStatus(): Promise<boolean> {
  try {
    const data = await apiRequest<{ configured?: boolean }>('/auth/oauth/google/status', {
      auth: 'optional',
    });
    return Boolean(data?.configured);
  } catch {
    return false;
  }
}

export async function updateMyAvatar(avatarUrl: string) {
  return apiRequest<MessageWithUser>('/auth/me/avatar', {
    method: 'PATCH',
    auth: true,
    body: { avatar_url: avatarUrl },
  });
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return apiRequest<MessageWithUser>('/auth/me', {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}

export async function submitPremiumPaymentRequest(payload: {
  plan_code: '1m' | '3m';
  payer_note?: string;
  bill: File;
  /** Bỏ qua email thông báo phía server (người dùng tự gửi biên lai qua app mail trên máy). */
  skip_server_email?: boolean;
}) {
  const form = new FormData();
  form.set('plan_code', payload.plan_code);
  if (payload.payer_note) form.set('payer_note', payload.payer_note);
  form.set('bill', payload.bill);
  if (payload.skip_server_email) {
    form.set('skip_server_email', '1');
  }

  return apiRequest<{ id: number }>('/auth/premium-payment', {
    method: 'POST',
    auth: true,
    rawBody: form,
  });
}

export async function submitPremiumPaymentFromMedia(payload: {
  plan_code: '1m' | '3m';
  payer_note?: string;
  bill_media_key: string;
  bill_cdn_url: string;
  skip_server_email?: boolean;
}) {
  return apiRequest<{
    id: number;
    bill_cdn_url: string | null;
    bill_image_public_url: string | null;
  }>('/auth/premium-payment', {
    method: 'POST',
    auth: true,
    body: {
      plan_code: payload.plan_code,
      payer_note: payload.payer_note,
      bill_media_key: payload.bill_media_key,
      bill_cdn_url: payload.bill_cdn_url,
      ...(payload.skip_server_email ? { skip_server_email: '1' } : {}),
    },
  });
}

export type { LoginResponse };
