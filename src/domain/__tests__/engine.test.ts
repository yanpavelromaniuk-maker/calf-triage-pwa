import { describe, expect, it } from 'vitest';
import { assess, BAND_THRESHOLDS, MAX_CANDIDATES } from '../engine';
import { kb } from '../kb';
import type { CaseInput } from '../types';

function buildCase(ageDays: number, over: Partial<CaseInput> = {}): CaseInput {
  return { ageDays, history: {}, symptoms: {}, ...over };
}

const yes = (_id: string) => ({ input: 'boolean' as const, value: true });
const choice = (optionId: string) => ({ input: 'choice' as const, optionId });
const number = (value: number) => ({ input: 'number' as const, value });

/** Golden case: classic watery-calf-scours picture on the second week of life. */
function scoursCase(ageDays: number): CaseInput {
  return buildCase(ageDays, {
    history: { colostrum: 'uncertain', housing: 'group', duration: 'd1-2' },
    symptoms: {
      'stool-consistency': choice('watery'),
      'stool-frequency': choice('high'),
      dehydration: choice('moderate'),
      lethargy: yes('lethargy'),
    },
  });
}

describe('triage engine — age handling', () => {
  it('returns a safe fallback when the age is outside 0–180 days', () => {
    const result = assess(kb, buildCase(200));
    expect(result.triage.level).toBe('prompt');
    expect(result.candidates).toEqual([]);
    expect(result.insufficientData).toBe(true);
    expect(result.triage.reasons.join(' ')).toMatch(/0–180/);
  });

  it('gates conditions by their typical age window', () => {
    const atFiveDays = assess(kb, scoursCase(5));
    const atFourteenDays = assess(kb, scoursCase(14));
    const ids5 = atFiveDays.candidates.map((c) => c.conditionId);
    const ids14 = atFourteenDays.candidates.map((c) => c.conditionId);
    expect(ids5).toContain('colibacillosis');
    expect(ids14).not.toContain('colibacillosis');
    expect(ids5).not.toContain('coccidiosis');
  });

  it('applies age multipliers to supporting weights', () => {
    const wateryOnly = (ageDays: number) =>
      assess(kb, buildCase(ageDays, { symptoms: { 'stool-consistency': choice('watery') } }));
    const at14 = wateryOnly(14).candidates.find((c) => c.conditionId === 'cryptosporidiosis');
    const at27 = wateryOnly(27).candidates.find((c) => c.conditionId === 'cryptosporidiosis');
    // 1 (prior) + 4 × 1.25 = 6 vs 1 + 4 = 5
    expect(at14?.score).toBe(6);
    expect(at27?.score).toBe(5);
  });
});

describe('triage engine — golden cases', () => {
  it('ranks crypto/rota top and dehydration syndrome for second-week watery scours', () => {
    const result = assess(kb, scoursCase(14));
    expect(result.candidates[0]?.conditionId).toBe('cryptosporidiosis');
    expect(result.candidates[0]?.band).toBe('probable');
    expect(result.candidates[1]?.conditionId).toBe('rota-corona');
    const dehydration = result.candidates.find(
      (c) => c.conditionId === 'dehydration-syndrome',
    );
    expect(dehydration).toBeDefined();
    // Urgent floor from the moderate-dehydration severity gate
    expect(result.triage.level).toBe('urgent');
    expect(
      result.triage.firedGates.some((g) => g.id === 'gate-moderate-dehydration'),
    ).toBe(true);
  });

  it('keeps scores inside their declared bands', () => {
    const result = assess(kb, scoursCase(14));
    for (const candidate of result.candidates) {
      if (candidate.band === 'probable') {
        expect(candidate.score).toBeGreaterThanOrEqual(BAND_THRESHOLDS.probable);
      } else if (candidate.band === 'possible') {
        expect(candidate.score).toBeGreaterThanOrEqual(BAND_THRESHOLDS.possible);
        expect(candidate.score).toBeLessThan(BAND_THRESHOLDS.probable);
      } else {
        expect(candidate.score).toBeGreaterThanOrEqual(BAND_THRESHOLDS.low);
        expect(candidate.score).toBeLessThan(BAND_THRESHOLDS.possible);
      }
    }
    expect(result.candidates.length).toBeLessThanOrEqual(MAX_CANDIDATES);
  });

  it('fires the emergency banner for bloody diarrhea with fever and lethargy and ranks salmonellosis', () => {
    const result = assess(
      kb,
      buildCase(60, {
        symptoms: {
          'stool-blood': choice('noticeable'),
          lethargy: yes('lethargy'),
          'measured-temp': number(40.1),
        },
      }),
    );
    expect(result.triage.level).toBe('emergency');
    expect(
      result.triage.firedRedFlags.some((f) => f.id === 'rf-bloody-diarrhea-systemic'),
    ).toBe(true);
    const salmonella = result.candidates.find((c) => c.conditionId === 'salmonellosis');
    expect(salmonella?.band).toBe('probable');
  });

  it('treats a recumbent calf as emergency regardless of diagnostic scores', () => {
    const result = assess(kb, buildCase(20, { symptoms: { recumbent: yes('recumbent') } }));
    expect(result.triage.level).toBe('emergency');
    expect(result.triage.firedRedFlags.some((f) => f.id === 'rf-recumbent')).toBe(true);
    expect(result.triage.reasons.length).toBeGreaterThan(0);
  });

  it('measured high fever alone is an emergency (red flag, stacked ranges)', () => {
    const result = assess(kb, buildCase(30, { symptoms: { 'measured-temp': number(41.2) } }));
    expect(result.triage.level).toBe('emergency');
    expect(result.triage.firedRedFlags.some((f) => f.id === 'rf-high-fever')).toBe(true);
  });

  it('normal temperature emits no red flags and no fever gates', () => {
    const result = assess(kb, buildCase(30, { symptoms: { 'measured-temp': number(39.0) } }));
    expect(result.triage.firedRedFlags).toEqual([]);
    expect(result.triage.level).toBe('monitor');
  });

  it('raises the triage floor via gates for moderate dehydration without red flags', () => {
    const result = assess(
      kb,
      buildCase(40, { symptoms: { dehydration: choice('moderate') } }),
    );
    expect(result.triage.level).toBe('urgent');
    expect(result.triage.firedGates.some((g) => g.id === 'gate-moderate-dehydration')).toBe(true);
  });

  it('keeps an explicitly healthy case at monitor level', () => {
    const result = assess(
      kb,
      buildCase(100, {
        symptoms: {
          'stool-consistency': choice('none'),
          dehydration: choice('none'),
          appetite: choice('normal'),
          cough: choice('none'),
        },
      }),
    );
    expect(result.triage.level).toBe('monitor');
    expect(result.triage.firedRedFlags).toEqual([]);
    expect(result.candidates).toEqual([]);
    expect(result.insufficientData).toBe(true);
  });

  it('defaults to at least prompt when positive clinical findings exist', () => {
    const result = assess(kb, buildCase(60, { symptoms: { lethargy: yes('lethargy') } }));
    expect(['prompt', 'urgent', 'emergency']).toContain(result.triage.level);
    expect(result.triage.reasons.join(' ')).toMatch(/покажите теленка/i);
  });

  it('lists unanswered key questions as missing info', () => {
    const result = assess(
      kb,
      buildCase(14, {
        history: { colostrum: 'uncertain' },
        symptoms: {
          'stool-consistency': choice('watery'),
          'stool-frequency': choice('high'),
        },
      }),
    );
    const crypto = result.candidates.find((c) => c.conditionId === 'cryptosporidiosis');
    expect(crypto).toBeDefined();
    expect(crypto?.missing).toContain('Признаки обезвоживания');
  });

  it('shows rule-out notes contextually without scoring them', () => {
    const result = assess(kb, buildCase(60, { symptoms: { 'skin-patches': yes('skin-patches') } }));
    expect(result.ruleOuts.some((r) => r.id === 'ro-dermatophytosis')).toBe(true);
    expect(result.candidates).toEqual([]);
  });

  it('shows the hemorrhagic rule-out only for young calves with noticeable blood', () => {
    const young = assess(kb, buildCase(10, { symptoms: { 'stool-blood': choice('noticeable') } }));
    expect(young.ruleOuts.some((r) => r.id === 'ro-hemorrhagic-enterotoxemia')).toBe(true);

    const older = assess(kb, buildCase(90, { symptoms: { 'stool-blood': choice('noticeable') } }));
    expect(older.ruleOuts.some((r) => r.id === 'ro-hemorrhagic-enterotoxemia')).toBe(false);
  });

  it('excludes salmonellosis below 14 days of age (Merck)', () => {
    const at10 = assess(kb, buildCase(10, { symptoms: { 'stool-blood': choice('noticeable') } }));
    expect(at10.candidates.some((c) => c.conditionId === 'salmonellosis')).toBe(false);
    const at20 = assess(kb, buildCase(20, { symptoms: { 'stool-blood': choice('noticeable') } }));
    expect(at20.candidates.some((c) => c.conditionId === 'salmonellosis')).toBe(true);
  });

  it('is deterministic: same input → identical assessment', () => {
    expect(assess(kb, scoursCase(14))).toEqual(assess(kb, scoursCase(14)));
  });
});
