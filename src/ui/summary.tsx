import { useState } from 'react';
import { strings } from '../i18n/strings';
import { PrimaryButton, SecondaryButton } from './components';

export function SummaryScreen({ text, onBack }: { text: string; onBack: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* Clipboard API unavailable — fallback below */
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch {
        setCopied(false);
      }
      area.remove();
    }
  }

  async function share() {
    if (typeof navigator.share !== 'function') return;
    try {
      await navigator.share({
        title: strings.summary.title,
        text,
      });
    } catch {
      /* user cancelled sharing */
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="text-2xl font-extrabold text-stone-900">{strings.summary.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">{strings.summary.hint}</p>
      <p className="mt-1 text-xs text-stone-500">{strings.summary.copyHint}</p>

      <div className="mt-4 flex flex-wrap gap-2 no-print">
        <PrimaryButton onClick={copy}>{copied ? strings.common.copied : strings.common.copy}</PrimaryButton>
        {typeof navigator.share === 'function' ? (
          <SecondaryButton onClick={share}>{strings.common.share}</SecondaryButton>
        ) : null}
        <SecondaryButton onClick={() => window.print()}>{strings.common.print}</SecondaryButton>
      </div>

      <pre
        className="print-area mt-4 whitespace-pre-wrap rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-900"
        aria-label={strings.summary.title}
      >
        {text}
      </pre>

      <div className="mt-4 no-print">
        <SecondaryButton full onClick={onBack}>
          {strings.summary.backToResult}
        </SecondaryButton>
      </div>
    </div>
  );
}
