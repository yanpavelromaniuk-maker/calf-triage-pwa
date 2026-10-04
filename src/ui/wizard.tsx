import { useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { ageBandOf } from '../domain/findings';
import { kb } from '../domain/kb';
import type { HistoryFactorDef, SymptomAnswer, SymptomDef, SystemId } from '../domain/types';
import { describeAnswers } from '../domain/summary';
import { strings } from '../i18n/strings';
import { countAnswered, isValidAge, toCaseInput, type WizardData } from '../state/wizard';
import {
  BooleanControl,
  Card,
  ChoiceControl,
  MultiControl,
  NumberControl,
  PrimaryButton,
  SecondaryButton,
} from './components';

const SYSTEM_LABELS: Record<SystemId, string> = {
  general: 'Общее состояние',
  gi: 'Желудок и кишечник',
  resp: 'Дыхание',
  ocular: 'Глаза и слизистые',
  neuro: 'Нервная система',
  musculo: 'Суставы и конечности',
  umbilical: 'Пупочная область',
  skin: 'Кожа',
  urinary: 'Мочеиспускание',
};

const SYSTEM_ORDER: SystemId[] = [
  'general',
  'gi',
  'resp',
  'ocular',
  'neuro',
  'musculo',
  'umbilical',
  'skin',
  'urinary',
];

const STEPS = [
  { id: 'age', title: 'Возраст и общее' },
  { id: 'history', title: 'Анамнез' },
  { id: 'course', title: 'Течение' },
  { id: 'symptoms', title: 'Симптомы' },
  { id: 'review', title: 'Проверка' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const AGE_STEP_FACTORS = ['sex', 'calf-type'];
const HISTORY_STEP_FACTORS = [
  'colostrum',
  'feeding',
  'housing',
  'bedding',
  'ventilation',
  'contact-sick',
  'vaccination',
];
const COURSE_STEP_FACTORS = ['duration', 'trend'];

function factorById(id: string): HistoryFactorDef | undefined {
  return kb.historyFactors.find((f) => f.id === id);
}

function factorByStep(stepId: StepId): HistoryFactorDef[] {
  const ids =
    stepId === 'age'
      ? AGE_STEP_FACTORS
      : stepId === 'history'
        ? HISTORY_STEP_FACTORS
        : COURSE_STEP_FACTORS;
  return ids.map(factorById).filter((f): f is HistoryFactorDef => f !== undefined);
}

function renderFactor(
  factor: HistoryFactorDef,
  data: WizardData,
  setWizard: Dispatch<SetStateAction<WizardData>>,
): ReactNode {
  const raw = data.history[factor.id];
  if (factor.input === 'choice') {
    return (
      <ChoiceControl
        key={factor.id}
        label={factor.label}
        hint={factor.hint}
        options={factor.options.map((o) => ({ id: o.id, label: o.label }))}
        value={typeof raw === 'string' ? raw : undefined}
        onChange={(value) =>
          setWizard((prev) => {
            const history = { ...prev.history };
            if (value === undefined) delete history[factor.id];
            else history[factor.id] = value;
            return { ...prev, history };
          })
        }
      />
    );
  }
  return (
    <MultiControl
      key={factor.id}
      label={factor.label}
      hint={factor.hint}
      options={factor.options.map((o) => ({ id: o.id, label: o.label }))}
      value={Array.isArray(raw) ? raw : []}
      onChange={(ids) =>
        setWizard((prev) => ({ ...prev, history: { ...prev.history, [factor.id]: ids } }))
      }
    />
  );
}

function renderSymptom(
  symptom: SymptomDef,
  data: WizardData,
  setWizard: Dispatch<SetStateAction<WizardData>>,
): ReactNode {
  const answer = data.symptoms[symptom.id];
  const update = (next: SymptomAnswer | undefined) =>
    setWizard((prev) => {
      const symptoms = { ...prev.symptoms };
      if (next === undefined) delete symptoms[symptom.id];
      else symptoms[symptom.id] = next;
      return { ...prev, symptoms };
    });

  if (symptom.input === 'boolean') {
    return (
      <BooleanControl
        key={symptom.id}
        label={symptom.label}
        hint={symptom.hint}
        value={answer?.input === 'boolean' ? answer.value : undefined}
        onChange={(value) =>
          update(value === undefined ? undefined : { input: 'boolean', value })
        }
      />
    );
  }
  if (symptom.input === 'choice') {
    return (
      <ChoiceControl
        key={symptom.id}
        label={symptom.label}
        hint={symptom.hint}
        options={symptom.options.map((o) => ({ id: o.id, label: o.label }))}
        value={answer?.input === 'choice' ? answer.optionId : undefined}
        onChange={(optionId) =>
          update(optionId === undefined ? undefined : { input: 'choice', optionId })
        }
      />
    );
  }
  return (
    <NumberControl
      key={symptom.id}
      label={symptom.label}
      hint={symptom.hint}
      unit={symptom.unit}
      normalHint={symptom.normalHint}
      value={answer?.input === 'number' ? answer.value : undefined}
      onChange={(value) => update(value === undefined ? undefined : { input: 'number', value })}
    />
  );
}

export function WizardScreen({
  data,
  setWizard,
  step,
  setStep,
  onAssess,
}: {
  data: WizardData;
  setWizard: Dispatch<SetStateAction<WizardData>>;
  step: number;
  setStep: (step: number) => void;
  onAssess: () => void;
}) {
  const current = STEPS[step] ?? STEPS[0];
  const stepId = current.id;
  const band = data.ageDays !== undefined && isValidAge(data.ageDays)
    ? ageBandOf(kb, data.ageDays)
    : undefined;

  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ general: true });

  const visibleSymptoms = useMemo(() => {
    return kb.symptoms.filter((symptom) => {
      if (symptom.ageBands && band && !symptom.ageBands.includes(band.id)) return false;
      if (search.trim().length === 0) return true;
      return symptom.label.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [band, search]);

  const grouped = useMemo(() => {
    const groups = new Map<SystemId, SymptomDef[]>();
    for (const symptom of visibleSymptoms) {
      const list = groups.get(symptom.system);
      if (list) list.push(symptom);
      else groups.set(symptom.system, [symptom]);
    }
    return SYSTEM_ORDER.filter((system) => groups.has(system)).map(
      (system) => [system, groups.get(system) ?? []] as const,
    );
  }, [visibleSymptoms]);

  const answeredInGroup = (system: SystemId): number =>
    kb.symptoms.filter(
      (s) => s.system === system && data.symptoms[s.id] !== undefined,
    ).length;

  const canProceed = stepId !== 'age' || isValidAge(data.ageDays);
  const ageError = stepId === 'age' && data.ageDays !== undefined && !isValidAge(data.ageDays);
  const answeredTotal = countAnswered(data);

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      {/* progress */}
      <div className="mb-4">
        <p className="text-sm font-medium text-stone-600">
          {strings.wizard.stepOf(step + 1, STEPS.length)} — {current.title}
        </p>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, index) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${
                index <= step ? 'bg-emerald-700' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>

      <Card>
        {stepId === 'age' ? (
          <>
            <NumberControl
              label={strings.wizard.ageDaysLabel}
              hint={strings.wizard.ageDaysHint}
              unit="дн."
              normalHint="Целое число от 0 до 180."
              value={data.ageDays}
              onChange={(value) =>
                setWizard((prev) => ({ ...prev, ageDays: value === undefined ? undefined : Math.trunc(value) }))
              }
            />
            {ageError ? (
              <p className="mb-2 text-sm font-medium text-red-700" role="alert">
                {strings.wizard.ageRequired}
              </p>
            ) : null}
            {band ? (
              <p className="mb-2 text-sm text-stone-700">
                {strings.wizard.ageBandLabel}: <strong>{band.label}</strong>
              </p>
            ) : null}
            {factorByStep('age').map((factor) => renderFactor(factor, data, setWizard))}
          </>
        ) : null}

        {stepId === 'history' || stepId === 'course' ? (
          <>
            {factorByStep(stepId).map((factor) => renderFactor(factor, data, setWizard))}
            {stepId === 'course' ? (
              <div className="py-2">
                <label htmlFor="free-note" className="text-base font-medium text-stone-900">
                  Примечание (необязательно)
                </label>
                <p className="mt-0.5 text-sm text-stone-600">
                  Что уже давали теленку, что говорит врач, что важно учесть.
                </p>
                <textarea
                  id="free-note"
                  value={data.freeNote}
                  onChange={(event) =>
                    setWizard((prev) => ({ ...prev, freeNote: event.target.value }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                />
              </div>
            ) : null}
          </>
        ) : null}

        {stepId === 'symptoms' ? (
          <>
            <p className="mb-2 text-sm text-stone-600">{strings.wizard.symptomsHint}</p>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={strings.wizard.symptomsSearch}
              aria-label={strings.wizard.symptomsSearch}
              className="mb-3 min-h-11 w-full rounded-xl border border-stone-300 px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            />
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const all: Record<string, boolean> = {};
                  for (const [system] of grouped) all[system] = true;
                  setOpenGroups(all);
                }}
                className="rounded-lg px-2 py-1 text-sm text-emerald-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                {strings.wizard.groupsOpenAll}
              </button>
              <button
                type="button"
                onClick={() => setOpenGroups({})}
                className="rounded-lg px-2 py-1 text-sm text-emerald-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                {strings.wizard.groupsCloseAll}
              </button>
            </div>
            {grouped.length === 0 ? (
              <p className="py-4 text-center text-sm text-stone-600">
                {strings.wizard.symptomsEmptySearch}
              </p>
            ) : (
              grouped.map(([system, list]) => {
                const open = openGroups[system] === true || search.trim().length > 0;
                const answered = answeredInGroup(system);
                return (
                  <div key={system} className="border-t border-stone-100 first:border-t-0">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [system]: !open }))}
                      className="flex min-h-11 w-full items-center justify-between py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    >
                      <span className="text-base font-semibold text-stone-900">
                        {SYSTEM_LABELS[system]}
                      </span>
                      <span className="flex items-center gap-2">
                        {answered > 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            {answered}
                          </span>
                        ) : null}
                        <span aria-hidden="true" className="text-stone-400">
                          {open ? '−' : '+'}
                        </span>
                      </span>
                    </button>
                    {open ? <div className="divide-y divide-stone-100">{list.map((symptom) => renderSymptom(symptom, data, setWizard))}</div> : null}
                  </div>
                );
              })
            )}
          </>
        ) : null}

        {stepId === 'review' ? (
          <>
            <p className="mb-3 text-sm text-stone-600">{strings.wizard.reviewHint}</p>
            <p className="text-sm font-medium text-stone-700">
              {strings.wizard.answeredCount(answeredTotal)}
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-stone-800">
              <li>
                <strong>Возраст:</strong>{' '}
                {data.ageDays !== undefined ? `${data.ageDays} дн.` : strings.common.notAnswered}
                {band ? ` (${band.label})` : ''}
              </li>
              {describeAnswers(kb, toCaseInput(data)).map((line) => (
                <li key={line}>• {line}</li>
              ))}
              {data.freeNote.trim().length > 0 ? <li>• Примечание: {data.freeNote}</li> : null}
            </ul>
          </>
        ) : null}
      </Card>

      {/* navigation */}
      <div className="mt-4 flex flex-col gap-2">
        {stepId === 'review' ? (
          <PrimaryButton full onClick={onAssess} disabled={!isValidAge(data.ageDays)}>
            {strings.wizard.assessButton}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            full
            onClick={() => setStep(step + 1)}
            disabled={!canProceed}
          >
            {strings.common.next}
          </PrimaryButton>
        )}
        <div className="flex gap-2">
          {step > 0 ? (
            <SecondaryButton full onClick={() => setStep(step - 1)}>
              {strings.common.back}
            </SecondaryButton>
          ) : null}
          {stepId === 'symptoms' ? (
            <SecondaryButton full onClick={() => setStep(STEPS.length - 1)}>
              {strings.common.skip}
            </SecondaryButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
