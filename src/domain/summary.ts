import type { Assessment, CaseInput, KnowledgeBase, SymptomDef } from './types';

/**
 * Veterinary summary — deterministic template-based text generation.
 * No LLM, no external API: the rules decide, the template phrases.
 */

export interface SummaryOptions {
  appName: string;
  /** Pre-formatted wall-clock label, supplied by the caller (UI). */
  generatedAtLabel: string;
}

const BAND_LABELS: Record<string, string> = {
  probable: 'вероятный кандидат',
  possible: 'возможный кандидат',
  low: 'менее вероятно',
};

/** Resolve one answered symptom/history factor to «Вопрос — Ответ» lines. */
export function describeAnswers(kb: KnowledgeBase, input: CaseInput): string[] {
  const lines: string[] = [];

  for (const factor of kb.historyFactors) {
    const value = input.history[factor.id];
    if (value === undefined) continue;
    if (factor.input === 'choice') {
      if (typeof value !== 'string') continue;
      const option = factor.options.find((o) => o.id === value);
      if (option) lines.push(`${factor.label}: ${option.label}`);
    } else {
      if (!Array.isArray(value) || value.length === 0) continue;
      const labels = value
        .map((id) => factor.options.find((o) => o.id === id)?.label)
        .filter((l): l is string => l !== undefined);
      if (labels.length > 0) lines.push(`${factor.label}: ${labels.join('; ')}`);
    }
  }

  for (const symptom of kb.symptoms) {
    const answer = input.symptoms[symptom.id];
    if (!answer) continue;
    lines.push(`${symptom.label}: ${describeSymptomAnswer(symptom, answer)}`);
  }

  return lines;
}

function describeSymptomAnswer(
  symptom: SymptomDef,
  answer: CaseInput['symptoms'][string],
): string {
  switch (symptom.input) {
    case 'boolean': {
      if (answer.input !== 'boolean') return '';
      return answer.value ? 'Да' : 'Нет';
    }
    case 'choice': {
      if (answer.input !== 'choice') return '';
      const option = symptom.options.find((o) => o.id === answer.optionId);
      return option?.label ?? '';
    }
    case 'number': {
      if (answer.input !== 'number') return '';
      return `${answer.value} ${symptom.unit}`;
    }
  }
}

const SPECIALIST_QUESTIONS = [
  'Какие мероприятия по выпойке молозива и кормлению применяются в хозяйстве?',
  'Были ли похожие случаи или падеж в группе за последние недели?',
  'Какие исследования нужно провести для уточнения причины?',
  'Что можно и чего нельзя делать до вашего осмотра?',
];

export function buildVetSummary(
  kb: KnowledgeBase,
  input: CaseInput,
  assessment: Assessment,
  options: SummaryOptions,
): string {
  const out: string[] = [];
  const nl = () => out.push('');

  out.push('СВОДКА ДЛЯ ВЕТЕРИНАРНОГО СПЕЦИАЛИСТА');
  out.push(`Сформировано офлайн-приложением «${options.appName}». Не является диагнозом.`);
  out.push(`Дата и время: ${options.generatedAtLabel}`);
  nl();

  /* ---------- the calf ---------- */
  out.push('ТЕЛЕНОК');
  out.push(`Возраст: ${input.ageDays} дн.`);
  const sex = readChoice(kb, input, 'sex');
  if (sex) out.push(`Пол: ${sex}`);
  const calfType = readChoice(kb, input, 'calf-type');
  if (calfType) out.push(`Порода/направление: ${calfType}`);
  nl();

  /* ---------- anamnesis ---------- */
  out.push('АНАМНЕЗ');
  const anamnesis = describeAnswers(kb, input);
  if (anamnesis.length > 0) {
    for (const line of anamnesis) out.push(`• ${line}`);
  } else {
    out.push('• Данные анамнеза не заполнены');
  }
  if (input.freeNote && input.freeNote.trim().length > 0) {
    out.push(`Примечание владельца: ${input.freeNote.trim()}`);
  }
  nl();

  /* ---------- triage ---------- */
  out.push('УРОВЕНЬ СРОЧНОСТИ');
  const triageLevel = kb.triageLevels.find((l) => l.id === assessment.triage.level);
  out.push(triageLevel ? triageLevel.label : assessment.triage.level);
  if (assessment.triage.reasons.length > 0) {
    out.push('Обоснование срочности:');
    for (const reason of assessment.triage.reasons) out.push(`• ${reason}`);
  }
  nl();

  /* ---------- candidates ---------- */
  out.push('ВЕРОЯТНЫЕ НАПРАВЛЕНИЯ (НЕ ДИАГНОЗ)');
  out.push(
    'У телят инфекции часто бывают смешанными — несколько направлений могут присутствовать одновременно.',
  );
  if (assessment.candidates.length === 0) {
    out.push('• Отмеченных данных недостаточно для формирования направлений.');
  } else {
    assessment.candidates.forEach((candidate, index) => {
      const condition = kb.conditions.find((c) => c.id === candidate.conditionId);
      if (!condition) return;
      out.push(
        `${index + 1}. ${condition.name} — ${BAND_LABELS[candidate.band] ?? candidate.band}`,
      );
      const forList = candidate.evidenceFor.map((e) => e.label).slice(0, 6);
      const againstList = candidate.evidenceAgainst.map((e) => e.label).slice(0, 4);
      if (forList.length > 0) out.push(`   Поддерживают: ${forList.join('; ')}`);
      if (againstList.length > 0) out.push(`   Против: ${againstList.join('; ')}`);
      if (condition.zoonotic) {
        out.push('   ВНИМАНИЕ: возможная передача человеку — соблюдайте гигиену рук.');
      }
    });
  }
  nl();

  /* ---------- missing info ---------- */
  const missing = new Set<string>();
  for (const candidate of assessment.candidates) {
    for (const label of candidate.missing) missing.add(label);
  }
  if (missing.size > 0) {
    out.push('ЧЕГО НЕ ХВАТАЕТ ДЛЯ ОЦЕНКИ');
    for (const label of missing) out.push(`• ${label}`);
    nl();
  }

  /* ---------- rule-outs ---------- */
  if (assessment.ruleOuts.length > 0) {
    out.push('ДОПОЛНИТЕЛЬНО УЧЕСТЬ (НЕ ДИАГНОЗ)');
    for (const note of assessment.ruleOuts) out.push(`• ${note.label}: ${note.note}`);
    nl();
  }

  /* ---------- questions ---------- */
  out.push('ВОПРОСЫ ДЛЯ СПЕЦИАЛИСТА');
  for (const question of SPECIALIST_QUESTIONS) out.push(`— ${question}`);
  nl();

  /* ---------- disclaimer ---------- */
  out.push('ДИСКЛЕЙМЕР');
  out.push(kb.disclaimer);

  return out.join('\n');
}

function readChoice(
  kb: KnowledgeBase,
  input: CaseInput,
  factorId: string,
): string | undefined {
  const factor = kb.historyFactors.find((f) => f.id === factorId);
  if (!factor || factor.input !== 'choice') return undefined;
  const value = input.history[factorId];
  if (typeof value !== 'string') return undefined;
  return factor.options.find((o) => o.id === value)?.label;
}
