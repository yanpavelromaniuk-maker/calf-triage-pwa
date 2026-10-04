import { APP_VERSION } from '../version';
import { KB_DATE, KB_VERSION, kb } from '../domain/kb';
import { strings } from '../i18n/strings';
import type { AppSettings } from '../state/storage';
import { Card, PrimaryButton, SectionTitle } from './components';

export function SettingsScreen({
  settings,
  onChange,
  onShowDisclaimer,
  onClearHistory,
  historyCount,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onShowDisclaimer: () => void;
  onClearHistory: () => void;
  historyCount: number;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <h1 className="text-2xl font-extrabold text-stone-900">{strings.settings.title}</h1>

      <section>
        <SectionTitle hint={strings.settings.historyToggleHint}>
          {strings.settings.historySection}
        </SectionTitle>
        <Card>
          <label className="flex min-h-11 items-center justify-between gap-3 py-1">
            <span className="text-base font-medium text-stone-900">
              {strings.settings.historyToggle}
            </span>
            <input
              type="checkbox"
              checked={settings.historyEnabled}
              onChange={(event) => onChange({ historyEnabled: event.target.checked })}
              className="h-6 w-6 accent-emerald-700"
            />
          </label>
          {settings.historyEnabled ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-sm text-stone-600">
                {historyCount} / 10
              </p>
              <PrimaryButton onClick={onClearHistory}>{strings.settings.clearHistory}</PrimaryButton>
            </div>
          ) : null}
        </Card>
      </section>

      <section>
        <SectionTitle>{strings.settings.legalSection}</SectionTitle>
        <Card>
          <PrimaryButton onClick={onShowDisclaimer}>
            {strings.settings.showDisclaimer}
          </PrimaryButton>
        </Card>
      </section>

      <section>
        <SectionTitle>{strings.settings.aboutSection}</SectionTitle>
        <Card>
          <dl className="space-y-2 text-sm text-stone-700">
            <div className="flex justify-between gap-3">
              <dt>{strings.settings.appVersion}</dt>
              <dd className="font-medium">{APP_VERSION}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{strings.settings.kbVersion}</dt>
              <dd className="font-medium">{KB_VERSION}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{strings.settings.kbDate}</dt>
              <dd className="font-medium">{KB_DATE}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{strings.settings.reviewStatus}</dt>
              <dd className="font-medium">
                {kb.reviewStatus === 'vet-approved'
                  ? 'Проверено ветеринаром'
                  : strings.settings.reviewStatusPending}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-stone-500">{strings.settings.languageNote}</p>
          <p className="mt-1 text-xs text-stone-500">{strings.settings.installNote}</p>
        </Card>
      </section>
    </div>
  );
}
