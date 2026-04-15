import { clearAuth, getStoredAuth } from '@/lib/auth';
import { PUBLIC_RESOURCE_REVALIDATE_SECONDS } from '@/lib/cache-policy';

export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiCacheOptions = {
  ttlMs?: number;
  skip?: boolean;
};

export type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  /** Use for multipart uploads; do not set JSON Content-Type manually. */
  rawBody?: BodyInit;
  auth?: boolean | 'optional';
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: ApiCacheOptions;
};

type ApiErrorPayload = {
  message?: string;
};

export const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;
/** PDF tài liệu (admin upload) — khớp giới hạn multer `upload-material` trên media-service. */
export const MAX_UPLOAD_MATERIAL_BYTES = 200 * 1024 * 1024;

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const MAX_API_CACHE_ENTRIES = 300;

type CachedApiResponse = {
  data: unknown;
  expiresAt: number;
};

const apiGetResponseCache = new Map<string, CachedApiResponse>();
const apiInFlightGetRequests = new Map<string, Promise<unknown>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const value = payload.message;
  return typeof value === 'string' && value.trim() ? value : null;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

/**
 * Base URL công khai (gateway) cho link tuyệt đối: mail, chia sẻ ảnh CDN.
 * Trên trình duyệt `getApiBaseUrl()` trả rỗng (fetch tương đối) — không dùng cho mailto.
 */
export function getPublicGatewayBaseUrl(): string {
  const env = String(process.env.NEXT_PUBLIC_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (env) return env;
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return DEFAULT_API_BASE_URL;
}

function shouldBypassNgrokWarning() {
  if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok-free.app')) {
    return true;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return baseUrl.includes('ngrok-free.app');
}

export function withNgrokHeaders(headers: Record<string, string>) {
  if (shouldBypassNgrokWarning()) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

function normalizePayload(rawText: string): unknown {
  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch {
    return { message: rawText } as ApiErrorPayload;
  }
}

function inferDefaultCacheTtlMs(path: string): number {
  if (!path) return 0;

  if (path.includes('/cache-api/public')) {
    // `/cache-api/public` already applies server-side cache headers + Next revalidate.
    // Avoid adding an extra client memory cache layer that can become stale independently.
    return 0;
  }

  if (path.includes('/stats/leaderboard')) {
    return PUBLIC_RESOURCE_REVALIDATE_SECONDS.leaderboard * 1000;
  }
  if (path.includes('/stats/summary')) {
    return PUBLIC_RESOURCE_REVALIDATE_SECONDS.summary * 1000;
  }

  if (
    path.includes('/api/quizzes') ||
    path.includes('/api/categories') ||
    path.includes('/api/types') ||
    path.includes('/materials-api/subjects')
  ) {
    return PUBLIC_RESOURCE_REVALIDATE_SECONDS.quizzes * 1000;
  }

  return 0;
}

function buildCacheScope(authMode: ApiRequestOptions['auth'], token: string | null): string {
  if (!authMode) return 'anon';
  if (!token) return authMode === true ? 'required-no-token' : 'optional-anon';
  return `token:${token.slice(0, 24)}`;
}

function setCachedResponse(cacheKey: string, data: unknown, ttlMs: number) {
  if (ttlMs <= 0) return;

  if (apiGetResponseCache.size >= MAX_API_CACHE_ENTRIES) {
    const firstKey = apiGetResponseCache.keys().next().value;
    if (firstKey) apiGetResponseCache.delete(firstKey);
  }

  apiGetResponseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function readCachedResponse(cacheKey: string): unknown | null {
  const entry = apiGetResponseCache.get(cacheKey);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    apiGetResponseCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

function invalidateApiGetCache() {
  apiGetResponseCache.clear();
}

export async function parseUploadError(response: Response, fallbackMessage: string): Promise<never> {
  const rawText = await response.text();
  const payload = normalizePayload(rawText);
  const message = readMessage(payload) || fallbackMessage;
  throw new Error(`${message} (${response.status})`);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase() as ApiMethod;
  const storedAuth = getStoredAuth();
  const authToken = storedAuth?.token || null;

  const isFormData =
    typeof FormData !== 'undefined' && options.rawBody != null && options.rawBody instanceof FormData;

  const headers = withNgrokHeaders({
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  });

  if (options.auth === true && !headers.Authorization) {
    if (!authToken) {
      throw new Error('Vui long dang nhap');
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (options.auth === 'optional') {
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }

  const cacheTtlMs = options.cache?.skip
    ? 0
    : (options.cache?.ttlMs ?? inferDefaultCacheTtlMs(path));
  const shouldCacheGet = method === 'GET' && !options.signal && cacheTtlMs > 0;
  const cacheKey = shouldCacheGet
    ? `${method}:${path}|scope=${buildCacheScope(options.auth, authToken)}`
    : '';

  if (shouldCacheGet) {
    const cached = readCachedResponse(cacheKey);
    if (cached != null) {
      return cached as T;
    }

    const inFlight = apiInFlightGetRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const execute = async (): Promise<T> => {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body:
        options.rawBody != null
          ? options.rawBody
          : options.body == null
            ? undefined
            : JSON.stringify(options.body),
      signal: options.signal,
    });

    const rawText = await response.text();
    const payload = normalizePayload(rawText);

    if (!response.ok) {
      if (response.status === 401 && (options.auth === true || options.auth === 'optional')) {
        const reason = readMessage(payload) || '';
        clearAuth();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-updated'));
          window.dispatchEvent(
            new CustomEvent('auth-session-ended', {
              detail: { reason },
            })
          );
        }
      }

      throw new Error(readMessage(payload) || `Request failed (${response.status})`);
    }

    if (method !== 'GET') {
      invalidateApiGetCache();
    }

    if (shouldCacheGet) {
      setCachedResponse(cacheKey, payload, cacheTtlMs);
    }

    return payload as T;
  };

  if (!shouldCacheGet) {
    return execute();
  }

  const requestPromise = execute();
  apiInFlightGetRequests.set(cacheKey, requestPromise as Promise<unknown>);

  try {
    return await requestPromise;
  } finally {
    apiInFlightGetRequests.delete(cacheKey);
  }
}
