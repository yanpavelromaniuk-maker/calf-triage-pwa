import type { HistoryFactorDef } from '../types';

/**
 * History (anamnesis) factors.
 *
 * Conventions:
 * - Answers emit findings the engine consumes; «Неизвестно» options emit NO
 *   findings — the engine never assumes (missing data stays missing).
 * - `sex`, `calf-type` and `vaccination` emit no findings: they are shown
 *   only in the veterinary summary, never used for scoring.
 */
export const historyFactors: HistoryFactorDef[] = [
  {
    input: 'choice',
    id: 'sex',
    label: 'Пол',
    options: [
      { id: 'male', label: 'Бычок', findings: [] },
      { id: 'female', label: 'Телочка', findings: [] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'calf-type',
    label: 'Порода / направление',
    options: [
      { id: 'dairy', label: 'Молочная', findings: [] },
      { id: 'beef', label: 'Мясная', findings: [] },
      { id: 'mixed', label: 'Смешанная', findings: [] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'colostrum',
    label: 'Молозиво в первые часы жизни',
    hint: 'Ключевой фактор защиты новорожденного: получал ли теленок достаточно молозива.',
    options: [
      {
        id: 'good',
        label: 'Да, качественное молозиво в первые часы жизни',
        findings: ['colostrum-good'],
      },
      {
        id: 'uncertain',
        label: 'Получал, но качество или количество под вопросом',
        findings: ['colostrum-uncertain'],
      },
      {
        id: 'none',
        label: 'Не получал, или поздно / скудно',
        findings: ['colostrum-none'],
      },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'multi',
    id: 'feeding',
    label: 'Кормление сейчас',
    hint: 'Отметьте всё, что получает теленок.',
    options: [
      { id: 'whole-milk', label: 'Цельное молоко', findings: ['feeding-whole-milk'] },
      {
        id: 'milk-replacer',
        label: 'Заменитель цельного молока (ЗЦМ)',
        findings: ['feeding-milk-replacer'],
      },
      { id: 'starter', label: 'Стартер (стартовый комбикорм)', findings: ['feeding-starter'] },
      { id: 'hay', label: 'Сено', findings: ['feeding-hay'] },
      { id: 'water', label: 'Вода', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'housing',
    label: 'Содержание',
    options: [
      { id: 'individual', label: 'Индивидуально (клетка, будка)', findings: ['housing-individual'] },
      { id: 'group', label: 'В группе с другими телятами', findings: ['housing-group'] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'bedding',
    label: 'Подстилка',
    options: [
      { id: 'dry', label: 'Сухая, чистая', findings: ['bedding-dry'] },
      { id: 'wet', label: 'Сырая, грязная', findings: ['bedding-wet'] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'ventilation',
    label: 'Вентиляция помещения',
    options: [
      { id: 'good', label: 'Хорошая, без сквозняков', findings: ['ventilation-good'] },
      {
        id: 'poor',
        label: 'Плохая: душно, сквозняки, конденсат на стенах',
        findings: ['ventilation-poor'],
      },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'contact-sick',
    label: 'Контакт с больными животными',
    options: [
      {
        id: 'yes',
        label: 'Да, был контакт с больными животными',
        findings: ['contact-sick-yes'],
      },
      { id: 'no', label: 'Нет', findings: ['contact-sick-no'] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'vaccination',
    label: 'Вакцинация',
    hint: 'Используется только в сводке для ветеринара, на оценку не влияет.',
    options: [
      { id: 'known', label: 'Известна (перечень в примечании)', findings: [] },
      { id: 'none', label: 'Не вакцинирован', findings: [] },
      { id: 'unknown', label: 'Неизвестно', findings: [] },
    ],
  },
  {
    input: 'choice',
    id: 'duration',
    label: 'Длительность симптомов',
    options: [
      { id: 'hours', label: 'Несколько часов', findings: ['duration-hours'] },
      { id: 'd1-2', label: '1–2 дня', findings: ['duration-1-2d'] },
      { id: 'd3-7', label: '3–7 дней', findings: ['duration-3-7d'] },
      { id: 'gt7d', label: 'Более недели', findings: ['duration-gt7d'] },
    ],
  },
  {
    input: 'choice',
    id: 'trend',
    label: 'Динамика состояния',
    options: [
      { id: 'improving', label: 'Улучшается', findings: ['trend-improving'] },
      { id: 'stable', label: 'Стабильно', findings: ['trend-stable'] },
      { id: 'worsening', label: 'Ухудшается постепенно', findings: ['trend-worsening'] },
      {
        id: 'rapid',
        label: 'Резко ухудшается за несколько часов',
        findings: ['trend-rapid', 'trend-worsening'],
      },
    ],
  },
];
