import type { FindingInfo, KnowledgeBase, CaseInput } from './types';

/**
 * Finding derivation and label resolution.
 *
 * The engine only sees BOOLEAN findings. Symptoms and history factors are
 * mapped to findings here:
 * - boolean symptom: yes → `<id>`, no → `<id>::no`
 * - choice option:   option.findings
 * - number symptom:  every matching range (thresholds stack by design)
 * - choice factor:   option.findings
 * - multi factor:    each selected option emits its findings
 */

const NEG_SUFFIX = '::no';

export function negate(id: string): string {
  return `${id}${NEG_SUFFIX}`;
}

export function isNegativeFinding(id: string): boolean {
  return id.endsWith(NEG_SUFFIX);
}

export function positiveOf(id: string): string {
  return isNegativeFinding(id) ? id.slice(0, -NEG_SUFFIX.length) : id;
}

/** All findings present in the case (set of boolean fact ids). */
export function deriveFindings(kb: KnowledgeBase, input: CaseInput): Set<string> {
  const findings = new Set<string>();

  for (const symptom of kb.symptoms) {
    const answer = input.symptoms[symptom.id];
    if (!answer) continue;
    switch (symptom.input) {
      case 'boolean': {
        if (answer.input !== 'boolean') break;
        findings.add(answer.value ? symptom.id : negate(symptom.id));
        break;
      }
      case 'choice': {
        if (answer.input !== 'choice') break;
        const option = symptom.options.find((o) => o.id === answer.optionId);
        for (const f of option?.findings ?? []) findings.add(f);
        break;
      }
      case 'number': {
        if (answer.input !== 'number') break;
        for (const range of symptom.ranges) {
          const inBand =
            range.op === 'gte'
              ? answer.value >= range.value &&
                (range.andBelow === undefined || answer.value <= range.andBelow)
              : answer.value <= range.value;
          if (inBand) findings.add(range.finding);
        }
        break;
      }
    }
  }

  for (const factor of kb.historyFactors) {
    const value = input.history[factor.id];
    if (value === undefined) continue;
    if (factor.input === 'choice') {
      if (typeof value !== 'string') continue;
      const option = factor.options.find((o) => o.id === value);
      for (const f of option?.findings ?? []) findings.add(f);
    } else {
      if (!Array.isArray(value)) continue;
      for (const optionId of value) {
        const option = factor.options.find((o) => o.id === optionId);
        for (const f of option?.findings ?? []) findings.add(f);
      }
    }
  }

  return findings;
}

/** Was the question (symptom or history factor) answered at all? */
export function isAnswered(
  sourceId: string,
  sourceKind: FindingInfo['sourceKind'],
  input: CaseInput,
): boolean {
  const record = sourceKind === 'symptom' ? input.symptoms : input.history;
  const value = record[sourceId];
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    // boolean answer object always counts as answered (true or false)
    return true;
  }
  return true;
}

/** Index finding → display info for evidence lists, missing data, summaries. */
export function buildFindingIndex(kb: KnowledgeBase): Map<string, FindingInfo> {
  const index = new Map<string, FindingInfo>();

  const put = (finding: string, info: FindingInfo) => {
    if (!index.has(finding)) index.set(finding, info);
  };

  for (const symptom of kb.symptoms) {
    switch (symptom.input) {
      case 'boolean': {
        put(symptom.id, {
          finding: symptom.id,
          label: symptom.label,
          questionLabel: symptom.label,
          sourceId: symptom.id,
          sourceKind: 'symptom',
        });
        put(negate(symptom.id), {
          finding: negate(symptom.id),
          label: `${symptom.label}: нет`,
          questionLabel: symptom.label,
          sourceId: symptom.id,
          sourceKind: 'symptom',
        });
        break;
      }
      case 'choice': {
        for (const option of symptom.options) {
          for (const finding of option.findings) {
            put(finding, {
              finding,
              label: `${symptom.label}: ${option.label}`,
              questionLabel: symptom.label,
              sourceId: symptom.id,
              sourceKind: 'symptom',
            });
          }
        }
        break;
      }
      case 'number': {
        for (const range of symptom.ranges) {
          put(range.finding, {
            finding: range.finding,
            label: `${symptom.label}: ${range.describe}`,
            questionLabel: symptom.label,
            sourceId: symptom.id,
            sourceKind: 'symptom',
          });
        }
        break;
      }
    }
  }

  for (const factor of kb.historyFactors) {
    for (const option of factor.options) {
      for (const finding of option.findings) {
        put(finding, {
          finding,
          label: `${factor.label}: ${option.label}`,
          questionLabel: factor.label,
          sourceId: factor.id,
          sourceKind: 'history',
        });
      }
    }
  }

  return index;
}

/** Age band for a day count, or undefined when the age is out of range. */
export function ageBandOf(kb: KnowledgeBase, ageDays: number) {
  return kb.ageBands.find((band) => ageDays >= band.minDay && ageDays <= band.maxDay);
}
