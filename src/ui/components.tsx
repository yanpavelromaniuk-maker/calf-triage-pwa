import type { ReactNode } from 'react';

/**
 * Shared UI primitives. Mobile-first, WCAG-AA-minded: ≥44 px touch targets,
 * visible focus rings, labeled controls, AA contrast color pairs.
 */

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  full = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold transition
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2
        ${full ? 'w-full' : ''} ${
          disabled
            ? 'cursor-not-allowed bg-emerald-800/40 text-emerald-100/60'
            : 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900'
        }`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  full = false,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-base font-medium text-stone-800 transition hover:bg-stone-100
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2
        ${full ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-bold text-stone-900">{children}</h2>
      {hint ? <p className="mt-1 text-sm text-stone-600">{hint}</p> : null}
    </div>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  tone = 'default',
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: 'default' | 'danger';
}) {
  const base =
    'min-h-11 rounded-xl border px-4 py-2 text-left text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1';
  const state =
    selected && tone === 'default'
      ? 'border-emerald-700 bg-emerald-700 text-white'
      : selected && tone === 'danger'
        ? 'border-red-700 bg-red-700 text-white'
        : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100';
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`${base} ${state}`}>
      {children}
    </button>
  );
}

/** Three-state boolean: unanswered / yes / no. Never assumes. */
export function BooleanControl({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  return (
    <div className="py-2">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-base font-medium text-stone-900">{label}</span>
        {value === undefined ? null : (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-stone-500 underline hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            сбросить
          </button>
        )}
      </div>
      {hint ? <p className="mt-0.5 text-sm text-stone-600">{hint}</p> : null}
      <div className="mt-2 flex gap-2" role="group" aria-label={label}>
        <Chip selected={value === true} onClick={() => onChange(true)} tone="danger">
          Да
        </Chip>
        <Chip selected={value === false} onClick={() => onChange(false)}>
          Нет
        </Chip>
      </div>
    </div>
  );
}

export function ChoiceControl({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { id: string; label: string }[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="py-2">
      <span className="text-base font-medium text-stone-900">{label}</span>
      {hint ? <p className="mt-0.5 text-sm text-stone-600">{hint}</p> : null}
      <div className="mt-2 flex flex-col gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <Chip
            key={option.id}
            selected={value === option.id}
            onClick={() => onChange(value === option.id ? undefined : option.id)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function MultiControl({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div className="py-2">
      <span className="text-base font-medium text-stone-900">{label}</span>
      {hint ? <p className="mt-0.5 text-sm text-stone-600">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <Chip key={option.id} selected={value.includes(option.id)} onClick={() => toggle(option.id)}>
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function NumberControl({
  label,
  hint,
  unit,
  normalHint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  unit: string;
  normalHint: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="py-2">
      <span className="text-base font-medium text-stone-900">{label}</span>
      {hint ? <p className="mt-0.5 text-sm text-stone-600">{hint}</p> : null}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          aria-label={`${label}, ${unit}`}
          value={value ?? ''}
          onChange={(event) => {
            const parsed = Number.parseFloat(event.target.value);
            onChange(Number.isFinite(parsed) ? parsed : undefined);
          }}
          className="min-h-11 w-28 rounded-xl border border-stone-300 px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        />
        <span className="text-base text-stone-700">{unit}</span>
      </div>
      <p className="mt-1 text-xs text-stone-500">{normalHint}</p>
    </div>
  );
}

export function Alert({
  tone,
  title,
  children,
}: {
  tone: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    danger: 'border-red-700 bg-red-50 text-red-900',
    warning: 'border-orange-600 bg-orange-50 text-orange-900',
    info: 'border-sky-700 bg-sky-50 text-sky-900',
    success: 'border-emerald-700 bg-emerald-50 text-emerald-900',
  } as const;
  return (
    <div role="alert" className={`rounded-2xl border-l-4 p-4 ${tones[tone]}`}>
      <p className="font-bold">{title}</p>
      {children ? <div className="mt-1 text-sm leading-relaxed">{children}</div> : null}
    </div>
  );
}

export function FooterDisclaimer({ onOpen }: { onOpen: () => void }) {
  return (
    <footer className="no-print mt-6 border-t border-stone-200 bg-stone-50 px-4 py-3 text-center">
      <p className="text-xs leading-snug text-stone-600">
        Не является диагнозом и не заменяет ветеринарную помощь.{' '}
        <button
          type="button"
          onClick={onOpen}
          className="underline hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        >
          Подробнее
        </button>
      </p>
    </footer>
  );
}
