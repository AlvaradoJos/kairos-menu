// Ubicación opcional de los pedidos express. La usa LocationField (formulario) y message.ts (enlaces).
// El punto sale del GPS del celular; no se guarda en ningún lado, solo viaja en el mensaje (ADR 0008).

/** Un punto en el mapa, en grados decimales. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Por qué no se pudo leer la ubicación. La interfaz traduce cada caso con el diccionario.
 * denied: el cliente dijo que no al permiso · timeout: el GPS tardó más de 10 s ·
 * unavailable: el GPS no encontró el punto o el sitio no usa HTTPS · unsupported: el navegador no tiene GPS.
 */
export type LocationError = 'denied' | 'timeout' | 'unavailable' | 'unsupported';

/** 6 decimales ≈ 10 cm: de sobra para encontrar la casa. */
function coords({ lat, lng }: GeoPoint): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/** Enlace de Google Maps que Jose abre desde WhatsApp. */
export function mapsLink(point: GeoPoint): string {
  return `https://www.google.com/maps?q=${coords(point)}`;
}

/** Enlace de Waze que abre la navegación hasta el punto, para el repartidor. */
export function wazeLink(point: GeoPoint): string {
  return `https://waze.com/ul?ll=${coords(point)}&navigate=yes`;
}

/** Códigos de GeolocationPositionError (MDN): 1 permiso negado, 2 posición no disponible, 3 tiempo agotado. */
function toLocationError(error: GeolocationPositionError): LocationError {
  if (error.code === error.PERMISSION_DENIED) return 'denied';
  if (error.code === error.TIMEOUT) return 'timeout';
  return 'unavailable';
}

/**
 * Pide la ubicación al GPS del celular. Rechaza con un LocationError, nunca con un objeto del navegador.
 * Se llama solo cuando el cliente toca "Compartir mi ubicación", nunca al cargar la página.
 * El navegador solo da la ubicación en HTTPS (GitHub Pages) o en localhost; en otro sitio ni se pregunta.
 */
export function requestLocation(
  geo: Geolocation | undefined = typeof navigator === 'undefined' ? undefined : navigator.geolocation,
  secure: boolean | undefined = typeof window === 'undefined' ? undefined : window.isSecureContext,
): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!geo) {
      reject('unsupported' satisfies LocationError);
      return;
    }
    // Solo se corta si el navegador dice claramente que el sitio no es seguro. Si no lo dice
    // (undefined, navegadores viejos), se pregunta al GPS y el navegador decide.
    if (secure === false) {
      reject('unavailable' satisfies LocationError);
      return;
    }
    geo.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(toLocationError(error)),
      // Alta precisión para la casa exacta; 10 s de espera; sirve una lectura de hasta 1 minuto atrás.
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}
