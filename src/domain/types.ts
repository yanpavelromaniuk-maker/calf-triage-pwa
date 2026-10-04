/**
 * Domain types for the Calf Triage knowledge base and triage engine.
 *
 * Architecture rules:
 * - The engine is a PURE function over these structures — no DOM, no React,
 *   no Date.now(), no randomness. Everything is deterministic and testable.
 * - The knowledge base is plain data (src/domain/kb/*). Clinical statements
 *   carry confidence + review status; numeric thresholds are marked as
 *   requiring veterinary validation.
 * - Findings: a boolean fact the engine reasons over. Conventions:
 *     boolean symptom answered "yes" → finding `symptomId`
 *     boolean symptom answered "no"  → finding `symptomId::no` (explicit negative)
 *     choice options / numeric ranges emit explicit finding ids.
 * - Absence of an answer emits NO findings (engine never assumes).
 */

/* ---------- age ---------- */

export type AgeBandId = 'd0-7' | 'd8-21' | 'd22-42' | 'd43-90' | 'd91-180';

export interface AgeBand {
  id: AgeBandId;
  /** inclusive */
  minDay: number;
  /** inclusive */
  maxDay: number;
  label: string;
}

/* ---------- symptoms ---------- */

export type SystemId =
  | 'general'
  | 'gi'
  | 'resp'
  | 'ocular'
  | 'neuro'
  | 'musculo'
  | 'umbilical'
  | 'skin'
  | 'urinary';

export type SymptomAnswer =
  | { input: 'boolean'; value: boolean }
  | { input: 'choice'; optionId: string }
  | { input: 'number'; value: number };

export interface BooleanSymptomDef {
  input: 'boolean';
  id: string;
  system: SystemId;
  label: string;
  hint?: string;
  /** Question shown only in these age bands (undefined = always). */
  ageBands?: AgeBandId[];
}

export interface ChoiceOptionDef {
  id: string;
  label: string;
  /** Findings emitted when this option is chosen. */
  findings: string[];
}

export interface ChoiceSymptomDef {
  input: 'choice';
  id: string;
  system: SystemId;
  label: string;
  hint?: string;
  ageBands?: AgeBandId[];
  options: ChoiceOptionDef[];
}

export interface NumericRangeDef {
  finding: string;
  op: 'gte' | 'lte';
  value: number;
  /** Optional upper bound turning the range into a closed band [value, andBelow]. */
  andBelow?: number;
  /** Human-readable description for evidence lists, e.g. «39,5 °C и выше». */
  describe: string;
  /** Why the threshold exists — for veterinary review docs. */
  basis: string;
}

export interface NumberSymptomDef {
  input: 'number';
  id: string;
  system: SystemId;
  label: string;
  hint?: string;
  ageBands?: AgeBandId[];
  unit: string;
  normalHint: string;
  /** All matching ranges fire (higher gte thresholds stack on lower ones). */
  ranges: NumericRangeDef[];
}

export type SymptomDef = BooleanSymptomDef | ChoiceSymptomDef | NumberSymptomDef;

/* ---------- history factors ---------- */

export interface HistoryOptionDef {
  id: string;
  label: string;
  findings: string[];
}

export interface SingleChoiceFactorDef {
  input: 'choice';
  id: string;
  label: string;
  hint?: string;
  options: HistoryOptionDef[];
}

export interface MultiChoiceFactorDef {
  input: 'multi';
  id: string;
  label: string;
  hint?: string;
  /** Options are independent toggles; each emits its findings when on. */
  options: HistoryOptionDef[];
}

export type HistoryFactorDef = SingleChoiceFactorDef | MultiChoiceFactorDef;

/* ---------- conditions (differentials) ---------- */

export type ConfidenceId =
  | 'well-established'
  | 'commonly-recognized'
  | 'needs-veterinary-review';

export type ReviewStatusId = 'draft' | 'pending-review' | 'vet-approved';

export type ConditionCategory =
  | 'diarrhea'
  | 'gi'
  | 'respiratory'
  | 'neonatal'
  | 'metabolic'
  | 'ocular'
  | 'neurologic'
  | 'other';

export interface ConditionDef {
  id: string;
  name: string;
  category: ConditionCategory;
  /** RU description — carefully worded, no treatment advice. */
  description: string;
  /** Typical onset window in days, inclusive; outside → condition excluded. */
  ageWindow: { min: number; max: number };
  confidence: ConfidenceId;
  zoonotic: boolean;
  /**
   * Small frequency tie-breaker (0–1.5) used only to order plausible
   * candidates. NOT a probability and never shown as one.
   */
  prior: number;
  reviewStatus: ReviewStatusId;
}

/* ---------- associations (finding ↔ condition) ---------- */

export type AssociationDirection = 'supporting' | 'against';

export interface AssociationDef {
  conditionId: string;
  finding: string;
  direction: AssociationDirection;
  /** 1 (weak) … 5 (strong). */
  weight: number;
  /** Optional per-age-band multipliers applied to supporting weights. */
  ageMultipliers?: Partial<Record<AgeBandId, number>>;
  /** Internal clinical note for veterinary reviewers (not shown to users). */
  note?: string;
}

/* ---------- interactions (additive combination rules) ---------- */

export interface InteractionDef {
  id: string;
  conditionId: string;
  /** All of these findings present → bonus added. */
  allOf: string[];
  bonus: number;
  note: string;
}

/* ---------- red flags (immediate emergency banner) ---------- */

export interface RedFlagDef {
  id: string;
  /** All of these findings must be present. */
  allOf: string[];
  /** If non-empty, at least one must be present. */
  anyOf: string[];
  /** Restrict to age bands (undefined = any age). */
  ageBands?: AgeBandId[];
  /** RU emergency message shown in the banner. */
  message: string;
}

/* ---------- severity gates (triage floor, independent of diagnosis) ---------- */

export interface SeverityGateDef {
  id: string;
  allOf: string[];
  anyOf: string[];
  /** Restrict to age bands (undefined = any age). */
  ageBands?: AgeBandId[];
  floor: Exclude<TriageLevel, 'monitor'>;
  /** RU reason shown to the user. */
  reason: string;
}

/* ---------- triage ---------- */

export type TriageLevel = 'emergency' | 'urgent' | 'prompt' | 'monitor';

export interface TriageLevelDef {
  id: TriageLevel;
  label: string;
  description: string;
  action: string;
}

/* ---------- rule-outs (static contextual notes, not scored) ---------- */

export interface RuleOutDef {
  id: string;
  label: string;
  note: string;
  /** Shown when any of these findings is present. */
  whenFindings: string[];
  /** Restrict to age bands (undefined = any age). */
  ageBands?: AgeBandId[];
}

/* ---------- knowledge base ---------- */

export interface KnowledgeBase {
  version: string;
  /** ISO date of the last KB revision. */
  kbDate: string;
  reviewStatus: ReviewStatusId;
  disclaimer: string;
  ageBands: AgeBand[];
  symptoms: SymptomDef[];
  historyFactors: HistoryFactorDef[];
  conditions: ConditionDef[];
  associations: AssociationDef[];
  interactions: InteractionDef[];
  redFlags: RedFlagDef[];
  severityGates: SeverityGateDef[];
  triageLevels: TriageLevelDef[];
  ruleOuts: RuleOutDef[];
}

/* ---------- case input ---------- */

export interface CaseInput {
  ageDays: number;
  /** historyFactorId → optionId (choice) | optionIds (multi) */
  history: Record<string, string | string[]>;
  /** symptomId → answer */
  symptoms: Record<string, SymptomAnswer>;
  /** Free-form note (already-given treatment etc.), shown only in the vet summary. */
  freeNote?: string;
}

/* ---------- assessment output ---------- */

export interface EvidenceItem {
  finding: string;
  /** Human-readable RU label resolved from the KB. */
  label: string;
  weight: number;
}

/** Categorical likelihood — deliberately NOT a percentage. */
export type CandidateBand = 'probable' | 'possible' | 'low';

export interface Candidate {
  conditionId: string;
  score: number;
  band: CandidateBand;
  evidenceFor: EvidenceItem[];
  evidenceAgainst: EvidenceItem[];
  interactionsFired: string[];
  /** Labels of unanswered key questions for this candidate. */
  missing: string[];
}

export interface TriageOutcome {
  level: TriageLevel;
  /** RU reasons for the assigned level. */
  reasons: string[];
  firedRedFlags: RedFlagDef[];
  firedGates: SeverityGateDef[];
}

export interface Assessment {
  triage: TriageOutcome;
  candidates: Candidate[];
  /** True when too little was answered for a meaningful differential list. */
  insufficientData: boolean;
  ruleOuts: RuleOutDef[];
  kbVersion: string;
}

/* ---------- finding index (label resolution) ---------- */

export interface FindingInfo {
  finding: string;
  /** Display label of the finding itself. */
  label: string;
  /** Label of the question the finding came from. */
  questionLabel: string;
  sourceId: string;
  sourceKind: 'symptom' | 'history';
}
