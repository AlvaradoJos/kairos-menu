// Encabezado: logo, frase, botones "Ver menú" y "Pedir por WhatsApp", y el cambio de idioma.
// Lo usa App. El número de WhatsApp sale de config.ts (variable de entorno, ADR 0006).

import { buildWhatsAppUrl } from '../features/whatsapp/message';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface Props {
  whatsappNumber?: string;
}

/** Portada de la página. Sin número de WhatsApp no se muestra el botón de pedir. */
export function Header({ whatsappNumber }: Props) {
  const { t } = useLanguage();
  return (
    <header className="header">
      <LanguageToggle />
      <h1 className="header__title">
        <img className="header__logo" src={`${import.meta.env.BASE_URL}logo.webp`} alt={t.header.logoAlt} width={280} height={280} fetchPriority="high" />
      </h1>
      <p className="header__tagline">{t.header.tagline}</p>
      <div className="header__actions">
        <a className="btn btn--outline" href="#menu">
          {t.header.viewMenu}
        </a>
        {whatsappNumber && (
          <a
            className="btn btn--primary"
            href={buildWhatsAppUrl(whatsappNumber, '')}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.header.orderWhatsApp}
          </a>
        )}
      </div>
    </header>
  );
}
