import { describe, expect, it } from 'vitest';
import { mapsLink, requestLocation, wazeLink } from '../location';

/** GPS de mentira: responde con el punto o con el código de error que se le pida. */
function fakeGeo(result: { coords?: { latitude: number; longitude: number }; errorCode?: number }) {
  const calls: (PositionOptions | undefined)[] = [];
  const geo = {
    getCurrentPosition(ok: PositionCallback, fail?: PositionErrorCallback | null, options?: PositionOptions) {
      calls.push(options);
      if (result.coords) ok({ coords: result.coords } as GeolocationPosition);
      else fail?.({ code: result.errorCode, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    },
  } as Geolocation;
  return { geo, calls };
}

describe('mapsLink', () => {
  it('arma un enlace de Google Maps con 6 decimales', () => {
    expect(mapsLink({ lat: 9.9325427, lng: -84.0795782 })).toBe('https://www.google.com/maps?q=9.932543,-84.079578');
  });
});

describe('wazeLink', () => {
  it('arma un enlace de Waze con 6 decimales que abre la navegación', () => {
    expect(wazeLink({ lat: 9.9325427, lng: -84.0795782 })).toBe(
      'https://waze.com/ul?ll=9.932543,-84.079578&navigate=yes',
    );
  });
});

describe('requestLocation', () => {
  it('devuelve el punto del GPS', async () => {
    const { geo } = fakeGeo({ coords: { latitude: 9.93, longitude: -84.08 } });
    await expect(requestLocation(geo, true)).resolves.toEqual({ lat: 9.93, lng: -84.08 });
  });

  it('pide alta precisión, espera hasta 10 s y acepta una lectura de hasta 1 minuto', async () => {
    const { geo, calls } = fakeGeo({ coords: { latitude: 9.93, longitude: -84.08 } });
    await requestLocation(geo, true);
    expect(calls).toEqual([{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }]);
  });

  it('distingue cuando el cliente no da permiso', async () => {
    await expect(requestLocation(fakeGeo({ errorCode: 1 }).geo, true)).rejects.toBe('denied');
  });

  it('distingue cuando el GPS no encuentra la ubicación', async () => {
    await expect(requestLocation(fakeGeo({ errorCode: 2 }).geo, true)).rejects.toBe('unavailable');
  });

  it('distingue cuando se acaba el tiempo', async () => {
    await expect(requestLocation(fakeGeo({ errorCode: 3 }).geo, true)).rejects.toBe('timeout');
  });

  it('falla si el navegador no tiene GPS', async () => {
    await expect(requestLocation(undefined, true)).rejects.toBe('unsupported');
  });

  it('si el navegador no dice si el sitio es seguro, deja que el GPS decida', async () => {
    const { geo } = fakeGeo({ coords: { latitude: 9.93, longitude: -84.08 } });
    await expect(requestLocation(geo, undefined)).resolves.toEqual({ lat: 9.93, lng: -84.08 });
  });

  it('en un sitio sin HTTPS la marca como no disponible, sin preguntar al GPS', async () => {
    const { geo, calls } = fakeGeo({ coords: { latitude: 9.93, longitude: -84.08 } });
    await expect(requestLocation(geo, false)).rejects.toBe('unavailable');
    expect(calls).toEqual([]);
  });
});
