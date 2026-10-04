import type { AgeBand } from '../types';

/**
 * Age stratification (days of life, inclusive bounds).
 * Boundaries follow the project brief; band labels are user-facing.
 */
export const ageBands: AgeBand[] = [
  { id: 'd0-7', minDay: 0, maxDay: 7, label: '0–7 дней (новорожденный)' },
  { id: 'd8-21', minDay: 8, maxDay: 21, label: '8–21 день (молочный период)' },
  { id: 'd22-42', minDay: 22, maxDay: 42, label: '22–42 дня' },
  { id: 'd43-90', minDay: 43, maxDay: 90, label: '43–90 дней' },
  { id: 'd91-180', minDay: 91, maxDay: 180, label: '91–180 дней' },
];
