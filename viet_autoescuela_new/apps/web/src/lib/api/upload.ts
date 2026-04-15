import { getStoredAuth } from '@/lib/auth';
import {
  getApiBaseUrl,
  getPublicGatewayBaseUrl,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_MATERIAL_BYTES,
  parseUploadError,
  withNgrokHeaders,
} from './client';
import type { UploadedFileMeta } from './types';

const USE_PRESIGNED_UPLOAD = process.env.NEXT_PUBLIC_USE_PRESIGNED_UPLOAD === 'true';

type PresignedUploadPayload = {
  upload_url: string;
  method?: 'PUT' | 'POST';
  headers?: Record<string, string>;
  file_key: string;
  cdn_url?: string;
  public_url?: string;
};

function joinApiBase(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  return `${baseUrl}${normalizedPath}`;
}

/** Link ảnh/media đầy đủ (mailto, email) — luôn dùng gateway công khai. */
function joinPublicGateway(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const baseUrl = getPublicGatewayBaseUrl().replace(/\/+$/, '');
  return `${baseUrl}${normalizedPath}`;
}

export function resolveMediaUrl(filePath: string) {
  if (!filePath) return filePath;

  const trimmedPath = String(filePath).trim();
  if (!trimmedPath) return '';

  if (/^ttps?:\/\//i.test(trimmedPath)) {
    return `h${trimmedPath}`;
  }

  if (trimmedPath.startsWith('//')) {
    return `https:${trimmedPath}`;
  }

  if (/^lh\d+\.googleusercontent\.com\//i.test(trimmedPath)) {
    return `https://${trimmedPath}`;
  }

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const parsedUrl = new URL(trimmedPath);
      if (parsedUrl.pathname.startsWith('/media/static/')) {
        return joinPublicGateway(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
      }
    } catch {
      return trimmedPath;
    }
    return trimmedPath;
  }

  if (trimmedPath.startsWith('media/static/')) {
    return joinPublicGateway(`/${trimmedPath}`);
  }

  if (/^(questions|materials|material-images|avatars|premium-bills)\//i.test(trimmedPath)) {
    return joinPublicGateway(`/media/static/${trimmedPath}`);
  }

  if (trimmedPath.startsWith('/media/static/')) {
    return joinPublicGateway(trimmedPath);
  }

  const normalizedPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
  return joinPublicGateway(normalizedPath);
}

function buildUploadHeaders() {
  const headers: Record<string, string> = withNgrokHeaders({});
  const stored = getStoredAuth();
  if (stored?.token) {
    headers.Authorization = `Bearer ${stored.token}`;
  }
  return headers;
}

async function uploadViaPresignedUrl(
  presignPath: string,
  file: File,
  extra: Record<string, unknown> = {}
): Promise<UploadedFileMeta> {
  const presignResponse = await fetch(`${getApiBaseUrl()}${presignPath}`, {
    method: 'POST',
    headers: {
      ...buildUploadHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      ...extra,
    }),
  });

  if (!presignResponse.ok) {
    await parseUploadError(presignResponse, 'Presign request failed');
  }

  const presigned = (await presignResponse.json()) as PresignedUploadPayload;
  const uploadMethod = presigned.method || 'PUT';

  const uploadResponse = await fetch(presigned.upload_url, {
    method: uploadMethod,
    headers: {
      ...(presigned.headers || {}),
      ...(uploadMethod === 'PUT' && !presigned.headers?.['Content-Type']
        ? { 'Content-Type': file.type || 'application/octet-stream' }
        : {}),
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Presigned upload failed (${uploadResponse.status})`);
  }

  const key = String(presigned.file_key || '').trim();
  const cdnUrl = String(presigned.cdn_url || presigned.public_url || '').trim();

  return {
    key,
    cdn_url: cdnUrl || `/media/static/${key}`,
    size: file.size,
  };
}

function assertImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tep khong phai anh hop le');
  }

  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error('Anh vuot qua gioi han 20MB');
  }
}

async function uploadFile<T>(path: string, formData: FormData, fallbackErrorMessage: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: buildUploadHeaders(),
    body: formData,
  });

  if (!response.ok) {
    await parseUploadError(response, fallbackErrorMessage);
  }

  return response.json() as Promise<T>;
}

export async function uploadMaterialFile(file: File, langCode: string) {
  if (file.size > MAX_UPLOAD_MATERIAL_BYTES) {
    const mb = Math.round(MAX_UPLOAD_MATERIAL_BYTES / (1024 * 1024));
    throw new Error(`Tệp PDF vượt quá giới hạn ${mb} MB`);
  }

  if (USE_PRESIGNED_UPLOAD) {
    try {
      return await uploadViaPresignedUrl('/media/upload-material/presign', file, {
        lang_code: langCode,
      });
    } catch {
      // Fallback keeps current behavior while allowing gradual rollout of presigned uploads.
    }
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('lang_code', langCode);

  return uploadFile<UploadedFileMeta>('/media/upload-material', formData, 'Upload material failed');
}

export async function uploadQuestionImage(file: File) {
  assertImageFile(file);

  if (USE_PRESIGNED_UPLOAD) {
    try {
      return await uploadViaPresignedUrl('/media/upload-image/presign', file);
    } catch {
      // Fallback keeps current behavior while allowing gradual rollout of presigned uploads.
    }
  }

  const formData = new FormData();
  formData.append('image', file);

  return uploadFile<UploadedFileMeta>('/media/upload-image', formData, 'Upload image failed');
}

export async function uploadMaterialContentImage(file: File) {
  assertImageFile(file);
  const formData = new FormData();
  formData.append('image', file);
  return uploadFile<UploadedFileMeta>(
    '/media/upload-material-image',
    formData,
    'Upload material image failed'
  );
}

/** Ảnh biên lai Premium (học viên đã đăng nhập; không cần quyền admin). */
export async function uploadPremiumBillImage(file: File) {
  assertImageFile(file);

  const formData = new FormData();
  formData.append('image', file);

  return uploadFile<UploadedFileMeta>(
    '/media/upload-premium-bill',
    formData,
    'Upload receipt image failed'
  );
}

export async function uploadAvatarImage(file: File) {
  assertImageFile(file);

  if (USE_PRESIGNED_UPLOAD) {
    try {
      return await uploadViaPresignedUrl('/media/upload-avatar/presign', file);
    } catch {
      // Fallback keeps current behavior while allowing gradual rollout of presigned uploads.
    }
  }

  const formData = new FormData();
  formData.append('image', file);

  return uploadFile<UploadedFileMeta>('/media/upload-avatar', formData, 'Upload avatar failed');
}
