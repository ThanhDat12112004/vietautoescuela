import type { Language } from '@/lib/api/types';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';

export function buildRankMotivation(rank: number | null, lang: Language) {
  if (!rank) {
    if (lang === 'vi')
      return 'Làm bài thi để tích điểm và xuất hiện trên bảng xếp hạng — mỗi bài đều đếm!';
    if (lang === 'en')
      return 'Take quizzes to earn points and appear on the leaderboard — every attempt counts!';
    return 'Haz exámenes para sumar puntos y entrar en el ranking: ¡cada intento cuenta!';
  }
  if (rank === 1) {
    if (lang === 'vi')
      return 'Bạn đang dẫn đầu bảng — duy trì nhịp luyện để giữ ngôi vương!';
    if (lang === 'en')
      return 'You are #1 on the leaderboard — keep practicing to stay on top!';
    return 'Lideras la clasificación: ¡mantén el ritmo para seguir arriba!';
  }
  if (rank <= 3) {
    if (lang === 'vi')
      return `Bạn đang top #${rank} — thêm vài bài nữa để tranh hạng cao hơn!`;
    if (lang === 'en')
      return `You're in the top #${rank} — a few more quizzes to climb higher!`;
    return `¡Estás en el top #${rank}! Unos exámenes más y subes posiciones.`;
  }
  if (rank <= 10) {
    if (lang === 'vi')
      return `Bạn đã lọt top 10 (#${rank}) — cố một nhịp nữa để tiến xa hơn!`;
    if (lang === 'en')
      return `You're in the top 10 (#${rank}) — keep going to move up!`;
    return `¡Entre los 10 primeros (#${rank})! Sigue practicando para subir.`;
  }
  if (lang === 'vi') return `Hạng #${rank} — mỗi lần làm bài đều giúp bạn tiến lên.`;
  if (lang === 'en')
    return `Rank #${rank} — every quiz helps you move up the board.`;
  return `Puesto #${rank}: cada examen te acerca a los primeros puestos.`;
}

export function toUpdateErrorMessage(error: unknown, fallback: string, lang: Language) {
  return error instanceof Error ? formatUserFacingApiError(lang, error) : fallback;
}
