import { describe, expect, it } from 'vitest';
import { buildVetSummary } from '../summary';
import { assess } from '../engine';
import { kb } from '../kb';
import type { CaseInput } from '../types';

const choice = (optionId: string) => ({ input: 'choice' as const, optionId });
const yes = { input: 'boolean' as const, value: true };

const scoursCase: CaseInput = {
  ageDays: 14,
  history: {
    sex: 'male',
    'calf-type': 'dairy',
    colostrum: 'uncertain',
    housing: 'group',
    feeding: ['whole-milk', 'starter'],
    duration: 'd1-2',
    trend: 'worsening',
  },
  symptoms: {
    'stool-consistency': choice('watery'),
    'stool-frequency': choice('high'),
    dehydration: choice('moderate'),
    lethargy: yes,
  },
  freeNote: 'Уже выпаивал электролиты один раз.',
};

describe('veterinary summary generation', () => {
  const assessment = assess(kb, scoursCase);
  const text = buildVetSummary(kb, scoursCase, assessment, {
    appName: 'Calf Triage',
    generatedAtLabel: '04.10.2026, 12:00',
  });

  it('renders header, calf data and anamnesis', () => {
    expect(text).toContain('СВОДКА ДЛЯ ВЕТЕРИНАРНОГО СПЕЦИАЛИСТА');
    expect(text).toContain('Возраст: 14 дн.');
    expect(text).toContain('Пол: Бычок');
    expect(text).toContain('Молозиво в первые часы жизни: Получал, но качество или количество под вопросом');
    expect(text).toContain('Цельное молоко');
    expect(text).toContain('Примечание владельца: Уже выпаивал электролиты один раз.');
  });

  it('states the triage level with reasons', () => {
    expect(text).toContain('УРОВЕНЬ СРОЧНОСТИ');
    expect(text).toContain('Срочно — ветеринар нужен сегодня');
    expect(text).toContain('Умеренное обезвоживание требует осмотра');
  });

  it('lists candidates as directions, never as a diagnosis', () => {
    expect(text).toContain('ВЕРОЯТНЫЕ НАПРАВЛЕНИЯ (НЕ ДИАГНОЗ)');
    expect(text).toContain('Криптоспоридиоз — вероятный кандидат');
    expect(text).toContain('Поддерживают:');
  });

  it('includes zoonotic warnings, missing info and the disclaimer', () => {
    expect(text).toContain('передача человеку');
    expect(text).toContain('ЧЕГО НЕ ХВАТАЕТ ДЛЯ ОЦЕНКИ');
    expect(text).toContain('Признаки обезвоживания');
    expect(text).toContain(kb.disclaimer);
  });

  it('never leaks undefined or technical ids into user-facing text', () => {
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object');
    expect(text).not.toContain('::no');
  });

  it('frames candidates as possibly mixed infections, without KB metadata', () => {
    expect(text).toContain('смешанными');
    expect(text).not.toContain('Версия базы знаний');
    expect(text).not.toContain('ожидает ветеринарной валидации');
  });

  it('handles an empty case gracefully', () => {
    const empty: CaseInput = { ageDays: 30, history: {}, symptoms: {} };
    const emptySummary = buildVetSummary(kb, empty, assess(kb, empty), {
      appName: 'Calf Triage',
      generatedAtLabel: '04.10.2026, 12:00',
    });
    expect(emptySummary).toContain('Данные анамнеза не заполнены');
    expect(emptySummary).toContain('недостаточно для формирования направлений');
  });
});
