import { strings } from '../i18n/strings';

/**
 * Onboarding / full disclaimer screen. Shown on first launch (until the
 * user acknowledges) and reachable from Settings and the footer at any time.
 */
export function OnboardingScreen({
  firstRun,
  onAccept,
  onClose,
}: {
  firstRun: boolean;
  onAccept: () => void;
  onClose: () => void;
}) {
  const d = strings.disclaimer;
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-stone-900">
        {firstRun ? strings.onboarding.title : d.title}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-stone-700">{strings.onboarding.intro}</p>

      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
        <p className="font-bold">{strings.onboarding.notDiagnosis}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
        <p className="font-bold">{d.emergencyTitle}</p>
        <p className="mt-1 text-sm leading-relaxed">{d.emergency}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900">
        <p className="font-bold">{d.privacyTitle}</p>
        <p className="mt-1 text-sm leading-relaxed">{d.privacy}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
        <p className="font-bold text-stone-900">{d.purposeTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-700">{d.purpose}</p>
        <p className="mt-3 font-bold text-stone-900">{d.limitsTitle}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-stone-700">
          {d.limits.map((item) => (
            <li key={item.slice(0, 24)}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        {firstRun ? (
          <button
            type="button"
            onClick={onAccept}
            className="min-h-12 w-full rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            {strings.onboarding.agreement}
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-5 py-3 text-base font-medium text-stone-800 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
          >
            {d.acknowledge}
          </button>
        )}
      </div>
    </div>
  );
}
