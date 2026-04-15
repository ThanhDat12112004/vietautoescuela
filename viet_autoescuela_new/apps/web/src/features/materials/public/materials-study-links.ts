import type { Subject } from '@/lib/api/types';

/** Khớp `Materials.tsx` — nhóm chưa gán trên URL. */
export const MATERIALS_TOPIC_UNGROUPED_PARAM = '_ungrouped';

/** Link tới trang tài liệu lọc theo loại chủ đề (topic group). */
export function buildMaterialsTopicGroupHref(topicGroupKey: string): string {
  const k = String(topicGroupKey || '').trim();
  const params = new URLSearchParams();
  if (!k) {
    params.set('topic_group', MATERIALS_TOPIC_UNGROUPED_PARAM);
  } else {
    params.set('topic_group', k);
  }
  return `/materials?${params.toString()}`;
}

/** Link tới trang tài liệu đã chọn đúng nhóm + chủ đề (subject) — giống `applyTopicScope` trong Materials.tsx. */
export function buildMaterialsSubjectHref(subject: Subject): string {
  const topic = String(subject.material_topic_group_name || '').trim();
  const params = new URLSearchParams();
  if (!topic) {
    params.set('topic_group', MATERIALS_TOPIC_UNGROUPED_PARAM);
  } else {
    params.set('topic_group', topic);
  }
  params.set('subject', String(subject.id));
  return `/materials?${params.toString()}`;
}
