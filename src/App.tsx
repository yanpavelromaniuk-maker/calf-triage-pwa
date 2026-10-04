import { useState } from 'react';
import { assess } from './domain/engine';
import { kb } from './domain/kb';
import { buildVetSummary } from './domain/summary';
import type { Assessment, CaseInput } from './domain/types';
import { strings } from './i18n/strings';
import {
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
  loadSettings,
  makeId,
  saveSettings,
  type AppSettings,
  type HistoryEntry,
} from './state/storage';
import { emptyWizard, toCaseInput, type WizardData } from './state/wizard';
import { FooterDisclaimer } from './ui/components';
import { HistoryScreen } from './ui/history';
import { OnboardingScreen } from './ui/onboarding';
import { ResultScreen } from './ui/result';
import { SettingsScreen } from './ui/settings';
import { SummaryScreen } from './ui/summary';
import { WizardScreen } from './ui/wizard';

type Screen =
  | 'onboarding'
  | 'wizard'
  | 'result'
  | 'summary'
  | 'history'
  | 'settings'
  | 'disclaimer';

function caseToWizard(input: CaseInput): WizardData {
  return {
    ageDays: input.ageDays >= 0 ? input.ageDays : undefined,
    history: input.history,
    symptoms: input.symptoms,
    freeNote: input.freeNote ?? '',
  };
}

function generatedAtLabel(): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [screen, setScreen] = useState<Screen>(() =>
    loadSettings().disclaimerAccepted ? 'wizard' : 'onboarding',
  );
  const [wizard, setWizard] = useState<WizardData>(emptyWizard);
  const [step, setStep] = useState(0);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [activeInput, setActiveInput] = useState<CaseInput | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => loadHistory());

  function updateSettings(patch: Partial<AppSettings>): void {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  function handleAssess(): void {
    const input = toCaseInput(wizard);
    const result = assess(kb, input);
    setAssessment(result);
    setActiveInput(input);
    setFromHistory(false);
    if (settings.historyEnabled) {
      const entry: HistoryEntry = {
        id: makeId(),
        savedAtIso: new Date().toISOString(),
        input,
        assessment: result,
      };
      setHistoryEntries(addHistoryEntry(entry));
    }
    setScreen('result');
  }

  function handleMakeSummary(): void {
    if (!assessment || !activeInput) return;
    setSummaryText(
      buildVetSummary(kb, activeInput, assessment, {
        appName: strings.appName,
        generatedAtLabel: generatedAtLabel(),
      }),
    );
    setScreen('summary');
  }

  function handleEditAnswers(): void {
    if (fromHistory && activeInput) setWizard(caseToWizard(activeInput));
    setScreen('wizard');
  }

  function handleRestart(): void {
    setWizard(emptyWizard);
    setStep(0);
    setAssessment(null);
    setActiveInput(null);
    setFromHistory(false);
    setScreen('wizard');
  }

  function handleOpenEntry(entry: HistoryEntry): void {
    setAssessment(entry.assessment);
    setActiveInput(entry.input);
    setFromHistory(true);
    setScreen('result');
  }

  const navItems: { id: Screen; label: string }[] = [
    { id: 'wizard', label: strings.nav.assessment },
    { id: 'history', label: strings.nav.history },
    { id: 'settings', label: strings.nav.settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2">
          <div>
            <p className="text-base font-extrabold leading-tight text-emerald-800">
              {strings.appName}
            </p>
            <p className="text-xs text-stone-500">{strings.appTagline}</p>
          </div>
          <nav aria-label="Основная навигация" className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                aria-current={
                  (screen === item.id ||
                    (item.id === 'wizard' &&
                      (screen === 'result' || screen === 'summary' || screen === 'onboarding')))
                    ? 'page'
                    : undefined
                }
                className={`min-h-11 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  screen === item.id ? 'text-emerald-800 underline' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {screen === 'onboarding' ? (
          <OnboardingScreen
            firstRun
            onAccept={() => {
              updateSettings({ disclaimerAccepted: true });
              setScreen('wizard');
            }}
            onClose={() => setScreen('wizard')}
          />
        ) : null}

        {screen === 'disclaimer' ? (
          <OnboardingScreen
            firstRun={false}
            onAccept={() => setScreen('settings')}
            onClose={() => setScreen('settings')}
          />
        ) : null}

        {screen === 'wizard' ? (
          <WizardScreen
            data={wizard}
            setWizard={setWizard}
            step={step}
            setStep={setStep}
            onAssess={handleAssess}
          />
        ) : null}

        {screen === 'result' && assessment ? (
          <ResultScreen
            assessment={assessment}
            onMakeSummary={handleMakeSummary}
            onEdit={handleEditAnswers}
            onRestart={handleRestart}
          />
        ) : null}

        {screen === 'summary' ? (
          <SummaryScreen text={summaryText} onBack={() => setScreen('result')} />
        ) : null}

        {screen === 'history' ? (
          <HistoryScreen
            entries={historyEntries}
            historyEnabled={settings.historyEnabled}
            onOpen={handleOpenEntry}
            onDelete={(id) => setHistoryEntries(deleteHistoryEntry(id))}
            onClearAll={() => {
              clearHistory();
              setHistoryEntries([]);
            }}
            onGoSettings={() => setScreen('settings')}
          />
        ) : null}

        {screen === 'settings' ? (
          <SettingsScreen
            settings={settings}
            onChange={updateSettings}
            onShowDisclaimer={() => setScreen('disclaimer')}
            onClearHistory={() => {
              clearHistory();
              setHistoryEntries([]);
            }}
            historyCount={historyEntries.length}
          />
        ) : null}
      </main>

      <FooterDisclaimer onOpen={() => setScreen('disclaimer')} />
    </div>
  );
}
