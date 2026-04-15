import { tKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

export function fileNameFromStoredPath(path: string): string {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export function isPdfFile(file: File): boolean {
  const t = (file.type || '').toLowerCase();
  if (t === 'application/pdf') return true;
  return file.name.toLowerCase().endsWith('.pdf');
}

/** Hiển thị vai trò tài khoản theo ngôn ngữ giao diện. */
export function formatUserRole(role: string, lang: Language): string {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return tKey(lang, 'adminUi.administrator');
  if (r === 'teacher') return tKey(lang, 'adminUi.teacher');
  if (r === 'student') return tKey(lang, 'adminUi.student');
  return role || '—';
}
