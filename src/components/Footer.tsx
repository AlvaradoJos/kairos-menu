// Pie de página con horario, dirección y redes. Lo usa App.
// Los datos salen de config.ts; mientras Jose no los dé, quedan sin definir y no se muestran.

import { Fragment } from 'react';
import type { BusinessConfig } from '../config';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  config: BusinessConfig;
}

/** Datos del negocio que ya están confirmados, más el nombre. */
export function Footer({ config }: Props) {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      {config.hours && <p>{t.footer.hours(config.hours)}</p>}
      {config.address && <p>{config.address}</p>}
      {config.socials.length > 0 && (
        <p>
          {config.socials.map((social, i) => (
            <Fragment key={social.url}>
              {i > 0 && ' · '}
              <a href={social.url} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            </Fragment>
          ))}
        </p>
      )}
      <p>Kairos Food's</p>
    </footer>
  );
}
