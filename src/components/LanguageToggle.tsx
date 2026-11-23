// Botón ES | EN del encabezado. Cambia el idioma de toda la página y lo recuerda (LanguageContext).
// El estado se ve (el idioma activo va en amarillo) y se anuncia con aria-pressed.

import { useLanguage } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/language';

const OPTIONS: { lang: Lang; short: string }[] = [
  { lang: 'es', short: 'ES' },
  { lang: 'en', short: 'EN' },
];

/** Dos botones, uno por idioma; el activo queda marcado. */
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div className="lang-toggle" role="group" aria-label={t.language.groupLabel}>
      {OPTIONS.map((option) => (
        <button
          key={option.lang}
          type="button"
          // lang hace que el lector de pantalla pronuncie "Español" o "English" en su idioma.
          lang={option.lang}
          aria-label={t.language[option.lang]}
          aria-pressed={lang === option.lang}
          onClick={() => setLang(option.lang)}
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}
