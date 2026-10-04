import type {
  Assessment,
  AssociationDef,
  Candidate,
  CandidateBand,
  CaseInput,
  ConditionDef,
  EvidenceItem,
  KnowledgeBase,
  RedFlagDef,
  SeverityGateDef,
  TriageLevel,
  TriageOutcome,
} from './types';
import { ageBandOf, buildFindingIndex, deriveFindings, isAnswered } from './findings';

/**
 * Triage engine — PURE and deterministic.
 *
 * Safety-first design decisions:
 * 1. URGENCY is decided by red flags and severity gates ONLY. Diagnostic
 *    scores never raise urgency above the conservative "prompt" floor.
 * 2. Likelihood is expressed in categorical bands, never percentages.
 * 3. Unanswered questions emit no findings and are surfaced as missing info.
 * 4. Conditions outside the calf's typical age window are excluded entirely.
 * 5. No randomness, no clock: same input + same KB version → same output.
 */

/** Score thresholds for likelihood bands (fixed, versioned with the engine). */
export const BAND_THRESHOLDS: Record<CandidateBand, number> = {
  probable: 13,
  possible: 8,
  low: 4,
};

export const MAX_CANDIDATES = 5;

const LEVEL_RANK: Record<TriageLevel, number> = {
  monitor: 0,
  prompt: 1,
  urgent: 2,
  emergency: 3,
};

function maxLevel(a: TriageLevel, b: TriageLevel): TriageLevel {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b;
}

/** A red flag / severity gate fires when its finding pattern matches. */
function ruleMatches(
  rule: RedFlagDef | SeverityGateDef,
  findings: Set<string>,
  bandId: string,
): boolean {
  if (rule.allOf.some((f) => !findings.has(f))) return false;
  if (rule.anyOf.length > 0 && !rule.anyOf.some((f) => findings.has(f))) return false;
  if (rule.ageBands && !rule.ageBands.includes(bandId as never)) return false;
  return true;
}

function ageInWindow(condition: ConditionDef, ageDays: number): boolean {
  return ageDays >= condition.ageWindow.min && ageDays <= condition.ageWindow.max;
}

function bandOfScore(score: number): CandidateBand | undefined {
  if (score >= BAND_THRESHOLDS.probable) return 'probable';
  if (score >= BAND_THRESHOLDS.possible) return 'possible';
  if (score >= BAND_THRESHOLDS.low) return 'low';
  return undefined;
}

function associationsByCondition(
  associations: AssociationDef[],
): Map<string, AssociationDef[]> {
  const map = new Map<string, AssociationDef[]>();
  for (const association of associations) {
    const list = map.get(association.conditionId);
    if (list) list.push(association);
    else map.set(association.conditionId, [association]);
  }
  return map;
}

export function assess(kb: KnowledgeBase, input: CaseInput): Assessment {
  const findingIndex = buildFindingIndex(kb);
  const findings = deriveFindings(kb, input);
  const band = ageBandOf(kb, input.ageDays);

  /* ---------- age outside supported range ---------- */
  if (!band) {
    return {
      triage: {
        level: 'prompt',
        reasons: [
          'Возраст вне поддерживаемого диапазона (0–180 дней). Покажите теленка ветеринарному специалисту.',
        ],
        firedRedFlags: [],
        firedGates: [],
      },
      candidates: [],
      insufficientData: true,
      ruleOuts: [],
      kbVersion: kb.version,
    };
  }

  /* ---------- 1. red flags → emergency, independent of diagnosis ---------- */
  const firedRedFlags = kb.redFlags.filter((rule) => ruleMatches(rule, findings, band.id));

  /* ---------- 2. severity gates → triage floor ---------- */
  const firedGates = kb.severityGates.filter((gate) => ruleMatches(gate, findings, band.id));

  let level: TriageLevel = 'monitor';
  const reasons: string[] = [];
  for (const flag of firedRedFlags) {
    level = 'emergency';
    reasons.push(flag.message);
  }
  for (const gate of firedGates) {
    level = maxLevel(level, gate.floor);
    reasons.push(gate.reason);
  }

  /* ---------- 3. deterministic candidate scoring ---------- */
  const byCondition = associationsByCondition(kb.associations);
  const candidates: Candidate[] = [];

  for (const condition of kb.conditions) {
    if (!ageInWindow(condition, input.ageDays)) continue;
    const associations = byCondition.get(condition.id) ?? [];

    let score = condition.prior;
    const evidenceFor: EvidenceItem[] = [];
    const evidenceAgainst: EvidenceItem[] = [];
    const interactionsFired: string[] = [];

    for (const association of associations) {
      if (!findings.has(association.finding)) continue;
      const info = findingIndex.get(association.finding);
      const label = info?.label ?? association.finding;
      if (association.direction === 'supporting') {
        const multiplier = association.ageMultipliers?.[band.id] ?? 1;
        const contribution = association.weight * multiplier;
        score += contribution;
        evidenceFor.push({
          finding: association.finding,
          label,
          weight: Math.round(contribution * 10) / 10,
        });
      } else {
        score -= association.weight;
        evidenceAgainst.push({
          finding: association.finding,
          label,
          weight: association.weight,
        });
      }
    }

    for (const interaction of kb.interactions) {
      if (interaction.conditionId !== condition.id) continue;
      if (interaction.allOf.every((f) => findings.has(f))) {
        score += interaction.bonus;
        interactionsFired.push(interaction.note);
      }
    }

    const candidateBand = bandOfScore(score);
    if (!candidateBand) continue;

    /* missing info: key supporting findings (weight ≥ 3) from unanswered questions */
    const missing: string[] = [];
    const seenQuestions = new Set<string>();
    for (const association of associations) {
      if (association.direction !== 'supporting' || association.weight < 3) continue;
      if (findings.has(association.finding)) continue;
      const info = findingIndex.get(association.finding);
      if (!info) continue;
      if (isAnswered(info.sourceId, info.sourceKind, input)) continue;
      if (seenQuestions.has(info.questionLabel)) continue;
      seenQuestions.add(info.questionLabel);
      missing.push(info.questionLabel);
      if (missing.length >= 4) break;
    }

    candidates.push({
      conditionId: condition.id,
      score: Math.round(score * 10) / 10,
      band: candidateBand,
      evidenceFor,
      evidenceAgainst,
      interactionsFired,
      missing,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, MAX_CANDIDATES);

  /* ---------- 4. conservative default: positive findings → at least "prompt" ---------- */
  const hasPositiveSignal =
    firedRedFlags.length > 0 ||
    kb.associations.some(
      (a) => a.direction === 'supporting' && findings.has(a.finding),
    ) ||
    kb.redFlags.some(
      (rule) =>
        rule.allOf.some((f) => findings.has(f)) || rule.anyOf.some((f) => findings.has(f)),
    );

  if (level === 'monitor' && hasPositiveSignal) {
    level = 'prompt';
    reasons.push(
      'Отмечены клинические признаки — покажите теленка ветеринарному специалисту в ближайшие 1–2 дня.',
    );
  }

  /* ---------- 5. contextual rule-out notes (not scored) ---------- */
  const ruleOuts = kb.ruleOuts.filter(
    (note) =>
      note.whenFindings.some((f) => findings.has(f)) &&
      (!note.ageBands || note.ageBands.includes(band.id)),
  );

  /* ---------- 6. insufficient data flag ---------- */
  const insufficientData = top.length === 0 && firedGates.length === 0;

  const triage: TriageOutcome = { level, reasons, firedRedFlags, firedGates };

  return { triage, candidates: top, insufficientData, ruleOuts, kbVersion: kb.version };
}
