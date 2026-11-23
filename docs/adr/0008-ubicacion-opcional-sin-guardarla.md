# 8. Ubicación opcional en express, sin guardarla, con enlaces de Maps y Waze

Fecha: 2026-11-22 · Estado: aceptada (aprobada por Jose el 2026-11-22)

## Contexto
En los pedidos express el repartidor se guía por la dirección escrita y las señas, que a veces no alcanzan. La ubicación del celular ayuda a encontrar la casa y a que Jose calcule el envío, pero es un dato personal preciso. La entrega de la Semana 3 pide "Ubicación en pedidos Express". La primera versión (commit `d4f9aac`) mandaba solo un enlace de Google Maps.

## Decisión
- **Opcional y solo en express.** Botón "Compartir mi ubicación" en el formulario. La dirección sigue siendo obligatoria aunque se comparta la ubicación: la ubicación dice dónde, la dirección y la referencia dicen cómo llegar.
- **Se pide solo al tocar el botón**, nunca al cargar la página. `requestLocation` (`src/features/location/location.ts`) envuelve `navigator.geolocation.getCurrentPosition` en una promesa con `enableHighAccuracy: true`, `timeout: 10000` y `maximumAge: 60000` (MDN: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
- **Un mensaje de error para cada caso**, según `GeolocationPositionError.code` (MDN: https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError/code): `denied` (1, permiso negado), `unavailable` (2, posición no disponible), `timeout` (3, tiempo agotado), `insecure` (el sitio no usa HTTPS) y `unsupported` (el navegador no tiene GPS). En cualquier caso el pedido se puede enviar con la dirección escrita.
- **Solo en HTTPS o `localhost`.** La Geolocation API es exclusiva de contextos seguros. GitHub Pages usa HTTPS. Si `window.isSecureContext` es `false`, se muestra un aviso propio (`insecure`: "Esta página no es segura…") sin preguntar al GPS; no invita a reintentar porque no serviría. Si el navegador no informa el dato, se deja decidir al GPS.
- **No se guarda.** El punto vive solo en el estado del formulario (en memoria) y en el mensaje que el cliente envía. No va a `localStorage` ni a ningún servidor; al recargar la página se pierde.
- **Enlaces con 6 decimales** (≈ 10 cm): `Ubicación (Google Maps): https://www.google.com/maps?q=LAT,LNG` y `Waze: https://waze.com/ul?ll=LAT,LNG&navigate=yes`, después de la dirección y la referencia. Si el cliente cambia a "Para recoger", no salen en el mensaje.

## Consecuencias
- El sitio no calcula el envío por distancia; Jose lo calcula al recibir el pedido. Hacerlo automático requiere saber cómo cobra el express (pendiente del negocio).
- La precisión depende del celular. Se prueba con un GPS simulado en Vitest y en Chrome; [PENDIENTE: prueba en un celular real].
- Al quedarse solo en memoria, quien recarga la página tiene que compartir la ubicación otra vez. Es el precio de no guardar el dato.
