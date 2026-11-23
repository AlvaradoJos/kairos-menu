// Botón opcional "Compartir mi ubicación" de los pedidos express. Lo usa OrderFormFields.
// El punto lo da el GPS (requestLocation en features/location) y queda solo en el formulario: no se guarda.

import { useState } from 'react';
import { mapsLink, requestLocation, type GeoPoint, type LocationError } from '../../features/location/location';
import { useLanguage } from '../../i18n/LanguageContext';
import { Icon } from '../Icon';

interface Props {
  value: GeoPoint | null;
  onChange(location: GeoPoint | null): void;
}

/**
 * Tres estados: sin ubicación (botón), buscando (botón deshabilitado) y lista (ver en el mapa o quitarla).
 * Si falla, explica por qué con un mensaje distinto para cada caso y deja seguir con la dirección escrita.
 * Jose usa el punto para calcular el envío; la dirección sigue siendo obligatoria.
 */
export function LocationField({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const { t } = useLanguage();

  // El navegador pregunta el permiso aquí, cuando el cliente toca el botón; nunca al cargar la página.
  async function share() {
    setLoading(true);
    setError(null);
    try {
      onChange(await requestLocation());
    } catch (reason) {
      // requestLocation solo rechaza con un LocationError.
      setError(reason as LocationError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="field location">
      <span className="field__label">{t.location.label}</span>
      {value ? (
        <div className="location__ready">
          <span className="location__status">
            <Icon name="pin" />
            {t.location.ready}
          </span>
          <a href={mapsLink(value)} target="_blank" rel="noopener noreferrer" className="link-btn">
            {t.location.viewMap}
          </a>
          <button type="button" className="link-btn" onClick={() => onChange(null)}>
            {t.location.remove}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--outline btn--block" onClick={share} disabled={loading}>
          <Icon name="pin" />
          {loading ? t.location.searching : t.location.share}
        </button>
      )}
      {/* aria-live: el lector de pantalla lee el error en cuanto aparece. */}
      <p className="field__hint" aria-live="polite">
        {error ? t.location.errors[error] : t.location.hint}
      </p>
    </div>
  );
}
