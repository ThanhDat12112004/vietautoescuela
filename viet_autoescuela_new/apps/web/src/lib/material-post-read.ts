const STORAGE_KEY = 'viet_autoescuela_material_post_read_v1';

type ReadMap = Record<string, true>;

function storageKey(subjectId: number, postId: number) {
  return `${subjectId}:${postId}`;
}

function parseMap(): ReadMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ReadMap;
  } catch {
    return {};
  }
}

export function isMaterialPostRead(subjectId: number, postId: number): boolean {
  const map = parseMap();
  return Boolean(map[storageKey(subjectId, postId)]);
}

/** Đánh dấu đã đọc khi user xem được nội dung đầy đủ (không khóa premium). */
export function markMaterialPostRead(subjectId: number, postId: number): void {
  if (typeof window === 'undefined') return;
  try {
    const map = parseMap();
    map[storageKey(subjectId, postId)] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('material-post-read-updated'));
  } catch {
    /* ignore quota / private mode */
  }
}
