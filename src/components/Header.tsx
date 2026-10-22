import { buildWhatsAppUrl } from '../features/whatsapp/message';

interface Props {
  whatsappNumber?: string;
}

export function Header({ whatsappNumber }: Props) {
  return (
    <header className="header">
      <h1 className="header__title">
        <img className="header__logo" src="/logo.png" alt="Kairos Foods" width={280} height={280} />
      </h1>
      <p className="header__tagline">Desayunos, almuerzos, hamburguesas, tacos y más. Pide desde tu celular.</p>
      <div className="header__actions">
        <a className="btn btn--outline" href="#menu">
          Ver menú
        </a>
        {whatsappNumber && (
          <a
            className="btn btn--primary"
            href={buildWhatsAppUrl(whatsappNumber, '')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir por WhatsApp
          </a>
        )}
      </div>
    </header>
  );
}
