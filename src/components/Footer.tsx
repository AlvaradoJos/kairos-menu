import { Fragment } from 'react';
import type { BusinessConfig } from '../config';

interface Props {
  config: BusinessConfig;
}

export function Footer({ config }: Props) {
  return (
    <footer className="footer">
      {config.hours && <p>Horario: {config.hours}</p>}
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
