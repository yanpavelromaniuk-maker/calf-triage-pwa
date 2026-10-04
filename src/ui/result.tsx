import { kb } from '../domain/kb';
import type { Assessment, CandidateBand, TriageLevel } from '../domain/types';
import { strings } from '../i18n/strings';
import { Alert, Card, PrimaryButton, SecondaryButton, SectionTitle } from './components';

const BAND_LABEL: Record<CandidateBand, string> = {
  probable: strings.result.bandProbable,
  possible: strings.result.bandPossible,
  low: strings.result.bandLow,
};

const BAND_STYLES: Record<CandidateBand, string> = {
  probable: 'bg-emerald-700 text-white',
  possible: 'bg-amber-500 text-stone-900',
  low: 'bg-stone-200 text-stone-700',
};

const TRIAGE_STYLES: Record<TriageLevel, string> = {
  emergency: 'border-red-700 bg-red-50 text-red-900',
  urgent: 'border-orange-600 bg-orange-50 text-orange-900',
  prompt: 'border-amber-400 bg-amber-50 text-amber-900',
  monitor: 'border-emerald-700 bg-emerald-50 text-emerald-900',
};

export function ResultScreen({
  assessment,
  onMakeSummary,
  onEdit,
  onRestart,
}: {
  assessment: Assessment;
  onMakeSummary: () => void;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const triage = kb.triageLevels.find((l) => l.id === assessment.triage.level);
  const hasRedFlags = assessment.triage.firedRedFlags.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <h1 className="text-2xl font-extrabold text-stone-900">{strings.result.title}</h1>

      {/* ---------- triage banner ---------- */}
      <section
        role="alert"
        aria-live="assertive"
        className={`rounded-2xl border-l-8 p-4 ${TRIAGE_STYLES[assessment.triage.level]}`}
      >
        <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
          {strings.result.triageTitle}
        </p>
        <p className="mt-1 text-xl font-extrabold leading-snug">
          {triage?.label ?? assessment.triage.level}
        </p>
        {triage ? <p className="mt-1 text-sm">{triage.description}</p> : null}
        {triage ? (
          <p className="mt-2 rounded-xl bg-white/60 p-3 text-sm font-medium">{triage.action}</p>
        ) : null}

        {hasRedFlags ? (
          <div className="mt-3">
            <p className="text-sm font-bold uppercase tracking-wide">
              {strings.result.redFlagsTitle}
            </p>
            <ul className="mt-1 space-y-1 text-sm font-medium">
              {assessment.triage.firedRedFlags.map((flag) => (
                <li key={flag.id}>• {flag.message}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium">{strings.result.noRedFlags}</p>
        )}

        {assessment.triage.reasons.length > 0 ? (
          <div className="mt-3">
            <p className="text-sm font-bold">{strings.result.reasonsTitle}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              {assessment.triage.reasons.map((reason) => (
                <li key={reason.slice(0, 40)}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* ---------- candidates ---------- */}
      <section>
        <SectionTitle hint={strings.result.candidatesHint}>
          {strings.result.candidatesTitle}
        </SectionTitle>
        {assessment.candidates.length === 0 ? (
          <Alert tone="info" title={strings.result.insufficientDataTitle}>
            {strings.result.insufficientData}
          </Alert>
        ) : (
          <div className="space-y-3">
            {assessment.candidates.map((candidate, index) => {
              const condition = kb.conditions.find((c) => c.id === candidate.conditionId);
              if (!condition) return null;
              return (
                <Card key={candidate.conditionId}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-stone-900">
                      {index + 1}. {condition.name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${BAND_STYLES[candidate.band]}`}
                    >
                      {BAND_LABEL[candidate.band]}
                    </span>
                    {condition.zoonotic ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                        зооноз
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {condition.description}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    {strings.result.ageWindowLabel}{' '}
                    {strings.result.ageWindowRange(
                      condition.ageWindow.min,
                      condition.ageWindow.max,
                    )}
                  </p>

                  {candidate.evidenceFor.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-emerald-800">
                        {strings.result.evidenceFor}
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-700">
                        {candidate.evidenceFor.map((evidence) => (
                          <li key={evidence.finding}>{evidence.label}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {candidate.evidenceAgainst.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-stone-600">
                        {strings.result.evidenceAgainst}
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-600">
                        {candidate.evidenceAgainst.map((evidence) => (
                          <li key={evidence.finding}>{evidence.label}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {candidate.missing.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-sky-800">
                        {strings.result.missingTitle}
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-stone-700">
                        {candidate.missing.map((label) => (
                          <li key={label}>{label}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {condition.zoonotic ? (
                    <p className="mt-3 rounded-xl bg-red-50 p-2 text-xs font-medium text-red-800">
                      {strings.result.zoonoticWarning}
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- rule-outs ---------- */}
      {assessment.ruleOuts.length > 0 ? (
        <section>
          <SectionTitle>{strings.result.ruleOutsTitle}</SectionTitle>
          <div className="space-y-2">
            {assessment.ruleOuts.map((note) => (
              <Card key={note.id}>
                <p className="text-sm font-bold text-stone-900">{note.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{note.note}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- do / don't ---------- */}
      <section>
        <SectionTitle>{strings.result.actionsTitle}</SectionTitle>
        <Card>
          <p className="text-sm leading-relaxed text-stone-800">
            {triage?.action ?? ''}
          </p>
          <p className="mt-3 text-sm font-bold text-stone-900">{strings.result.notDoTitle}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-stone-700">
            {strings.result.notDoItems.map((item) => (
              <li key={item.slice(0, 30)}>{item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <div className="flex flex-col gap-2">
        <PrimaryButton full onClick={onMakeSummary}>
          {strings.result.summaryButton}
        </PrimaryButton>
        <div className="flex gap-2">
          <SecondaryButton full onClick={onEdit}>
            {strings.common.editAnswers}
          </SecondaryButton>
          <SecondaryButton full onClick={onRestart}>
            {strings.common.startOver}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
