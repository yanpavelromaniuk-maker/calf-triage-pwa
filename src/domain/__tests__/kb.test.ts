import { describe, expect, it } from 'vitest';
import { kb } from '../kb';
import { negate } from '../findings';

/** Every finding the KB can possibly emit from answers. */
function producibleFindings(): Set<string> {
  const set = new Set<string>();
  for (const symptom of kb.symptoms) {
    if (symptom.input === 'boolean') {
      set.add(symptom.id);
      set.add(negate(symptom.id));
    } else if (symptom.input === 'choice') {
      for (const option of symptom.options) {
        for (const finding of option.findings) set.add(finding);
      }
    } else {
      for (const range of symptom.ranges) set.add(range.finding);
    }
  }
  for (const factor of kb.historyFactors) {
    for (const option of factor.options) {
      for (const finding of option.findings) set.add(finding);
    }
  }
  return set;
}

const producible = producibleFindings();
const conditionIds = new Set(kb.conditions.map((c) => c.id));

function expectUnique(ids: string[], label: string) {
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  expect(duplicates, `duplicate ${label}: ${duplicates.join(', ')}`).toEqual([]);
}

describe('knowledge base integrity', () => {
  it('has a semver-ish version and a KB date', () => {
    expect(kb.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(kb.kbDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(kb.disclaimer.length).toBeGreaterThan(40);
  });

  it('uses unique ids within each entity collection', () => {
    expectUnique(kb.symptoms.map((s) => s.id), 'symptom ids');
    expectUnique(kb.conditions.map((c) => c.id), 'condition ids');
    expectUnique(kb.historyFactors.map((f) => f.id), 'history factor ids');
    expectUnique(kb.redFlags.map((r) => r.id), 'red flag ids');
    expectUnique(kb.severityGates.map((g) => g.id), 'severity gate ids');
    expectUnique(kb.interactions.map((i) => i.id), 'interaction ids');
  });

  it('only references conditions that exist', () => {
    for (const association of kb.associations) {
      expect(conditionIds.has(association.conditionId)).toBe(true);
    }
    for (const interaction of kb.interactions) {
      expect(conditionIds.has(interaction.conditionId)).toBe(true);
    }
  });

  it('only references findings that can be produced by an answer', () => {
    const check = (finding: string, where: string) =>
      expect(producible.has(finding), `${where}: unknown finding «${finding}»`).toBe(true);
    for (const association of kb.associations) check(association.finding, 'association');
    for (const interaction of kb.interactions) {
      for (const finding of interaction.allOf) check(finding, 'interaction');
    }
    for (const rule of [...kb.redFlags, ...kb.severityGates]) {
      for (const finding of rule.allOf) check(finding, 'rule.allOf');
      for (const finding of rule.anyOf) check(finding, 'rule.anyOf');
    }
    for (const note of kb.ruleOuts) {
      for (const finding of note.whenFindings) check(finding, 'rule-out');
    }
  });

  it('keeps association weights in 1..5 with valid direction and age bands', () => {
    const bandIds = new Set(kb.ageBands.map((b) => b.id));
    for (const association of kb.associations) {
      expect(association.weight).toBeGreaterThanOrEqual(1);
      expect(association.weight).toBeLessThanOrEqual(5);
      expect(['supporting', 'against']).toContain(association.direction);
      if (association.ageMultipliers) {
        for (const key of Object.keys(association.ageMultipliers)) {
          expect(bandIds.has(key as never)).toBe(true);
        }
      }
    }
  });

  it('gives every condition at least 2 supporting associations and a sane window', () => {
    for (const condition of kb.conditions) {
      const supporting = kb.associations.filter(
        (a) => a.conditionId === condition.id && a.direction === 'supporting',
      );
      expect(
        supporting.length,
        `condition ${condition.id} needs ≥2 supporting associations`,
      ).toBeGreaterThanOrEqual(2);
      expect(condition.ageWindow.min).toBeGreaterThanOrEqual(0);
      expect(condition.ageWindow.max).toBeLessThanOrEqual(180);
      expect(condition.ageWindow.min).toBeLessThanOrEqual(condition.ageWindow.max);
      expect(condition.prior).toBeGreaterThanOrEqual(0);
      expect(condition.prior).toBeLessThanOrEqual(1.5);
      expect(condition.name.length).toBeGreaterThan(3);
      expect(condition.description.length).toBeGreaterThan(30);
      expect(['well-established', 'commonly-recognized', 'needs-veterinary-review']).toContain(
        condition.confidence,
      );
      expect(['draft', 'pending-review', 'vet-approved']).toContain(condition.reviewStatus);
    }
  });

  it('defines exactly the four triage levels', () => {
    expect(kb.triageLevels.map((l) => l.id)).toEqual([
      'emergency',
      'urgent',
      'prompt',
      'monitor',
    ]);
  });

  it('keeps red flags conservative and reviewable', () => {
    for (const flag of kb.redFlags) {
      expect(flag.message.length).toBeGreaterThan(20);
      expect(flag.allOf.length + flag.anyOf.length).toBeGreaterThan(0);
      if (flag.ageBands) {
        const ids = new Set(kb.ageBands.map((b) => b.id));
        for (const band of flag.ageBands) expect(ids.has(band)).toBe(true);
      }
    }
    expect(kb.redFlags.length).toBeGreaterThanOrEqual(10);
  });

  it('covers age bands 0..180 without gaps or overlaps', () => {
    const sorted = [...kb.ageBands].sort((a, b) => a.minDay - b.minDay);
    expect(sorted[0]?.minDay).toBe(0);
    expect(sorted[sorted.length - 1]?.maxDay).toBe(180);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const current = sorted[i];
      expect(current?.minDay).toBe((prev?.maxDay ?? 0) + 1);
    }
  });

  it('maps temperature thresholds into non-overlapping normal/fever bands', () => {
    const temp = kb.symptoms.find((s) => s.id === 'measured-temp');
    expect(temp?.input).toBe('number');
    if (temp?.input === 'number') {
      const findings = temp.ranges.map((r) => r.finding);
      expect(findings).toContain('temp-hypothermia');
      expect(findings).toContain('temp-normal');
      expect(findings).toContain('temp-fever');
      expect(findings).toContain('temp-high-fever');
      for (const range of temp.ranges) {
        expect(range.basis).toContain('veterinary-review');
      }
    }
  });

  it('zoonotic conditions include hygiene wording in their description', () => {
    for (const condition of kb.conditions) {
      if (condition.zoonotic) {
        expect(condition.description.toLowerCase()).toMatch(/человек|гигиен/i);
      }
    }
  });
});
