import { describe, expect, it } from 'vitest';
import { mapsLink, requestLocation } from '../location';

function fakeGeo(result: { coords?: { latitude: number; longitude: number }; errorCode?: number }): Geolocation {
  return {
    getCurrentPosition(ok: PositionCallback, fail?: PositionErrorCallback | null) {
      if (result.coords) ok({ coords: result.coords } as GeolocationPosition);
      else fail?.({ code: result.errorCode, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    },
  } as Geolocation;
}

describe('mapsLink', () => {
  it('arma un enlace de Google Maps con 6 decimales', () => {
    expect(mapsLink({ lat: 9.9325427, lng: -84.0795782 })).toBe('https://www.google.com/maps?q=9.932543,-84.079578');
  });
});

describe('requestLocation', () => {
  it('devuelve el punto del GPS', async () => {
    await expect(requestLocation(fakeGeo({ coords: { latitude: 9.93, longitude: -84.08 } }))).resolves.toEqual({
      lat: 9.93,
      lng: -84.08,
    });
  });

  it('distingue cuando el cliente no da permiso', async () => {
    await expect(requestLocation(fakeGeo({ errorCode: 1 }))).rejects.toBe('denied');
  });

  it('marca como no disponible cualquier otro fallo', async () => {
    await expect(requestLocation(fakeGeo({ errorCode: 2 }))).rejects.toBe('unavailable');
    await expect(requestLocation(fakeGeo({ errorCode: 3 }))).rejects.toBe('unavailable');
  });

  it('falla si el navegador no tiene GPS', async () => {
    await expect(requestLocation(undefined)).rejects.toBe('unsupported');
  });
});
