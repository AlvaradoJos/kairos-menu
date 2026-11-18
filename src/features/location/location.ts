export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Por qué no se pudo leer la ubicación. "denied": el cliente dijo que no al permiso. */
export type LocationError = 'denied' | 'unavailable' | 'unsupported';

export const LOCATION_ERROR_TEXT: Record<LocationError, string> = {
  denied: 'No nos diste permiso para ver tu ubicación. Puedes activarlo en el navegador o solo escribir la dirección.',
  unavailable: 'No pudimos encontrar tu ubicación. Intenta de nuevo o escribe bien la dirección.',
  unsupported: 'Tu navegador no permite compartir la ubicación. Escribe la dirección con buenas señas.',
};

/** Enlace que Jose abre desde WhatsApp. 6 decimales ≈ 10 cm: de sobra para encontrar la casa. */
export function mapsLink({ lat, lng }: GeoPoint): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Pide la ubicación al GPS del celular. Rechaza con un LocationError, nunca con un objeto del navegador.
 * Solo funciona en HTTPS (GitHub Pages) o en localhost.
 */
export function requestLocation(
  geo: Geolocation | undefined = typeof navigator === 'undefined' ? undefined : navigator.geolocation,
): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!geo) {
      reject('unsupported' satisfies LocationError);
      return;
    }
    geo.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject((error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable') satisfies LocationError),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}
