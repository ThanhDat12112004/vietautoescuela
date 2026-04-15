import { apiRequest } from './client';
import type { Language, MaterialPostDetail, MaterialPostListItem, MaterialSubjectCountRow, Subject } from './types';

export async function getSubjects(lang: Language) {
  return apiRequest<Subject[]>(`/materials-api/subjects?lang=${lang}`, { auth: 'optional' });
}

export async function getMaterialCountsBySubject() {
  return apiRequest<MaterialSubjectCountRow[]>('/materials-api/subjects/material-counts');
}

export async function getMaterialPostsBySubject(
  subjectId: number,
  lang: Language,
  options?: { bustCache?: boolean }
) {
  const params = new URLSearchParams({ lang });
  if (options?.bustCache) {
    params.set('bust', String(Date.now()));
  }
  return apiRequest<MaterialPostListItem[]>(`/materials-api/subjects/${subjectId}/posts?${params.toString()}`, {
    auth: 'optional',
    ...(options?.bustCache ? { cache: { skip: true } } : {}),
  });
}

export async function getMaterialPostDetail(
  subjectId: number,
  postId: number,
  lang: Language,
  options?: { bustCache?: boolean }
) {
  const params = new URLSearchParams({ lang });
  if (options?.bustCache) {
    params.set('bust', String(Date.now()));
  }
  return apiRequest<MaterialPostDetail>(
    `/materials-api/subjects/${subjectId}/posts/${postId}?${params.toString()}`,
    {
      auth: 'optional',
      ...(options?.bustCache ? { cache: { skip: true } } : {}),
    }
  );
}

/** @deprecated Use getMaterialPostsBySubject */
export async function getMaterialsBySubject(
  subjectId: number,
  lang: Language,
  options?: { bustCache?: boolean }
) {
  return getMaterialPostsBySubject(subjectId, lang, options);
}

export type { MaterialPostDetail, MaterialPostListItem, Subject };
