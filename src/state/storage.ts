import type { Assessment, CaseInput } from '../domain/types';

/**
 * Local persistence — localStorage only, opt-in for history.
 * No personal data, no telemetry: everything stays on the device.
 */

const SETTINGS_KEY = 'ct.settings.v1';
const HISTORY_KEY = 'ct.history.v1';
const MAX_HISTORY = 10;

export interface AppSettings {
  disclaimerAccepted: boolean;
  historyEnabled: boolean;
}

export interface HistoryEntry {
  id: string;
  savedAtIso: string;
  input: CaseInput;
  assessment: Assessment;
}

const DEFAULT_SETTINGS: AppSettings = { disclaimerAccepted: false, historyEnabled: false };

function readJson<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full — app keeps working without persistence */
  }
}

export function loadSettings(): AppSettings {
  const stored = readJson<Partial<AppSettings>>(SETTINGS_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  return {
    disclaimerAccepted: stored.disclaimerAccepted === true,
    historyEnabled: stored.historyEnabled === true,
  };
}

export function saveSettings(settings: AppSettings): void {
  writeJson(SETTINGS_KEY, settings);
}

export function loadHistory(): HistoryEntry[] {
  const stored = readJson<HistoryEntry[]>(HISTORY_KEY);
  if (!Array.isArray(stored)) return [];
  return stored.filter((entry) => entry && typeof entry.id === 'string');
}

export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, MAX_HISTORY);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((entry) => entry.id !== id);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function makeId(): string {
  const cryptoRef = globalThis.crypto as Crypto | undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') return cryptoRef.randomUUID();
  return `id-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}
