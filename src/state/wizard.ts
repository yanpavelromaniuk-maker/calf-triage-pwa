import type { CaseInput, SymptomAnswer } from '../domain/types';

/**
 * Wizard form state. Unanswered questions stay undefined — the engine
 * never assumes, and unanswered items surface as «missing info».
 */
export interface WizardData {
  ageDays: number | undefined;
  history: Record<string, string | string[]>;
  symptoms: Record<string, SymptomAnswer>;
  freeNote: string;
}

export const emptyWizard: WizardData = {
  ageDays: undefined,
  history: {},
  symptoms: {},
  freeNote: '',
};

export function toCaseInput(data: WizardData): CaseInput {
  return {
    ageDays: data.ageDays ?? -1,
    history: data.history,
    symptoms: data.symptoms,
    freeNote: data.freeNote.trim().length > 0 ? data.freeNote.trim() : undefined,
  };
}

export function countAnswered(data: WizardData): number {
  let count = 0;
  for (const value of Object.values(data.history)) {
    if (Array.isArray(value) ? value.length > 0 : value !== undefined) count += 1;
  }
  count += Object.values(data.symptoms).length;
  return count;
}

export function isValidAge(ageDays: number | undefined): boolean {
  return (
    ageDays !== undefined &&
    Number.isFinite(ageDays) &&
    Number.isInteger(ageDays) &&
    ageDays >= 0 &&
    ageDays <= 180
  );
}
