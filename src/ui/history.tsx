import type { HistoryEntry } from '../state/storage';
import { kb } from '../domain/kb';
import { strings } from '../i18n/strings';
import { Card, PrimaryButton, SecondaryButton, SectionTitle } from './components';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function HistoryScreen({
  entries,
  historyEnabled,
  onOpen,
  onDelete,
  onClearAll,
  onGoSettings,
}: {
  entries: HistoryEntry[];
  historyEnabled: boolean;
  onOpen: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onGoSettings: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="text-2xl font-extrabold text-stone-900">{strings.history.title}</h1>
      <p className="mt-2 text-sm text-stone-600">{strings.history.hint}</p>
      {!historyEnabled ? (
        <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <p>{strings.history.enableHint}</p>
          <div className="mt-2">
            <SecondaryButton onClick={onGoSettings}>{strings.nav.settings}</SecondaryButton>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {entries.length === 0 && historyEnabled ? (
          <p className="text-sm text-stone-600">{strings.history.empty}</p>
        ) : null}
        {entries.map((entry) => {
          const top = entry.assessment.candidates[0];
          const topName = top
            ? (kb.conditions.find((c) => c.id === top.conditionId)?.name ?? '')
            : '';
          const triageLabel =
            kb.triageLevels.find((l) => l.id === entry.assessment.triage.level)?.label ??
            entry.assessment.triage.level;
          return (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {formatDate(entry.savedAtIso)} · {entry.input.ageDays} дн.
                  </p>
                  <p className="mt-1 text-sm text-stone-700">{triageLabel}</p>
                  {topName ? (
                    <p className="mt-0.5 text-xs text-stone-500">1: {topName}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onOpen(entry)}
                    className="min-h-9 rounded-lg px-3 py-1 text-sm font-medium text-emerald-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  >
                    {strings.history.view}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(strings.history.deleteConfirm)) onDelete(entry.id);
                    }}
                    className="min-h-9 rounded-lg px-3 py-1 text-sm text-red-700 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                  >
                    {strings.common.delete}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {entries.length > 0 ? (
        <div className="mt-4">
          <SectionTitle>{strings.settings.historySection}</SectionTitle>
          <PrimaryButton
            onClick={() => {
              if (window.confirm(strings.history.clearAllConfirm)) onClearAll();
            }}
          >
            {strings.settings.clearHistory}
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
