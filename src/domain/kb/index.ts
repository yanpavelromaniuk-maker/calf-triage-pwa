import type { KnowledgeBase } from '../types';
import { ageBands } from './age-bands';
import { symptoms } from './symptoms';
import { historyFactors } from './history-factors';
import { conditions } from './conditions';
import { associations, interactions } from './rules';
import { redFlags, severityGates, triageLevels, ruleOuts } from './triage';

export const KB_VERSION = '0.1.2-beta.1';
export const KB_DATE = '2026-10-04';

export const DISCLAIMER_SHORT =
  'Не является диагнозом и не заменяет ветеринарную помощь.';

export const kb: KnowledgeBase = {
  version: KB_VERSION,
  kbDate: KB_DATE,
  reviewStatus: 'pending-review',
  disclaimer:
    'Приложение не ставит диагноз и не заменяет ветеринарную помощь. Результаты — ориентировочные направления для обсуждения со специалистом. При экстренных признаках обращайтесь к ветеринарному специалисту немедленно. Все клинические пороги подлежат ветеринарной валидации.',
  ageBands,
  symptoms,
  historyFactors,
  conditions,
  associations,
  interactions,
  redFlags,
  severityGates,
  triageLevels,
  ruleOuts,
};

export { ageBands, symptoms, historyFactors, conditions, associations, interactions, redFlags, severityGates, triageLevels, ruleOuts };
