import { NextResponse } from 'next/server';
import {
  getPublicCacheControl,
  PUBLIC_RESOURCE_REVALIDATE_SECONDS,
  type PublicCachedResource,
} from '@/lib/cache-policy';

type PublicResource = PublicCachedResource;

const API_ORIGIN =
  process.env.INTERNAL_API_BASE_URL ||
  process.env.API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8080';

function normalizeLang(value: string | null) {
  const s = String(value || 'vi').trim().toLowerCase();
  if (s === 'es') return 'es';
  if (s === 'en') return 'en';
  return 'vi';
}

function normalizePeriod(value: string | null) {
  const normalized = String(value || 'all').trim().toLowerCase();
  if (normalized === 'week' || normalized === 'month') return normalized;
  return 'all';
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value || 10);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

function normalizePage(value: string | null) {
  const parsed = Number(value || 1);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
}

function isPublicResource(value: string): value is PublicResource {
  return (
    value === 'quizzes' ||
    value === 'categories' ||
    value === 'types' ||
    value === 'leaderboard' ||
    value === 'summary'
  );
}

function buildUpstreamPath(resource: PublicResource, query: URLSearchParams) {
  const lang = normalizeLang(query.get('lang'));

  if (resource === 'quizzes') {
    const limit = Number(query.get('limit'));
    const page = Number(query.get('page'));
    const params = new URLSearchParams({ lang });
    if (Number.isFinite(limit) && limit > 0) {
      params.set('limit', String(Math.min(Math.floor(limit), 100)));
      params.set('page', String(Number.isFinite(page) && page > 0 ? Math.floor(page) : 1));
    }
    return `/api/quizzes?${params.toString()}`;
  }

  if (resource === 'categories') {
    return `/api/categories?lang=${lang}`;
  }

  if (resource === 'types') {
    return `/api/types?lang=${lang}`;
  }

  if (resource === 'leaderboard') {
    const limit = normalizeLimit(query.get('limit'));
    const period = normalizePeriod(query.get('period'));
    return `/stats/leaderboard?limit=${limit}&period=${period}`;
  }

  return '/stats/summary';
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const resourceParam = String(requestUrl.searchParams.get('resource') || '').trim().toLowerCase();

  if (!isPublicResource(resourceParam)) {
    return NextResponse.json({ message: 'Invalid cache resource' }, { status: 400 });
  }

  const upstreamPath = buildUpstreamPath(resourceParam, requestUrl.searchParams);

  const authHeader = request.headers.get('authorization');
  const isAuthScopedRequest = resourceParam === 'quizzes' && Boolean(authHeader);
  const revalidateSeconds = PUBLIC_RESOURCE_REVALIDATE_SECONDS[resourceParam];
  /** Bỏ cache Next/fetch (và CDN) — dùng khi cần làm mới ngay (ví dụ sau cập nhật nội dung). */
  const bustCache = requestUrl.searchParams.has('bust');

  const upstreamHeaders: Record<string, string> = {};
  if (authHeader) {
    upstreamHeaders.Authorization = authHeader;
  }
  if (request.headers.get('ngrok-skip-browser-warning')) {
    upstreamHeaders['ngrok-skip-browser-warning'] = 'true';
  }

  const upstreamResponse = await fetch(`${API_ORIGIN}${upstreamPath}`, {
    headers: upstreamHeaders,
    ...(isAuthScopedRequest || bustCache
      ? { cache: 'no-store' }
      : { next: { revalidate: revalidateSeconds } }),
  });

  const responseText = await upstreamResponse.text();

  if (!upstreamResponse.ok) {
    try {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed, { status: upstreamResponse.status });
    } catch {
      return NextResponse.json(
        { message: responseText || `Upstream request failed (${upstreamResponse.status})` },
        { status: upstreamResponse.status }
      );
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    const response = NextResponse.json(parsed, { status: 200 });

    if (isAuthScopedRequest) {
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('Vary', 'Authorization');
    } else if (bustCache) {
      response.headers.set('Cache-Control', 'private, no-store');
    } else {
      response.headers.set('Cache-Control', getPublicCacheControl(revalidateSeconds));
    }

    return response;
  } catch {
    return NextResponse.json({ message: 'Invalid upstream JSON payload' }, { status: 502 });
  }
}
