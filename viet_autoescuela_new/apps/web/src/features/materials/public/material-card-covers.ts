/** Minh họa danh sách tài liệu — `public/brand/materials-illustration.png`. Có thể thêm URL khác để xoay vòng. */
export const MATERIAL_STUDY_CARD_COVERS = ['/brand/materials-illustration.png'] as const;

export function materialStudyCardCoverSrc(subjectId: number, postId: number): string {
  const i = Math.abs(subjectId + postId * 31) % MATERIAL_STUDY_CARD_COVERS.length;
  return MATERIAL_STUDY_CARD_COVERS[i];
}
