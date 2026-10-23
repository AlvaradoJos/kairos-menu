# 5. Todo servido desde el propio sitio, con CSP

Fecha: 2026-10-22 · Estado: aceptada

## Contexto
Lighthouse móvil daba 71 en rendimiento: el logo pesaba 557 KB y las fuentes de Google bloqueaban el render. El sitio no necesita ningún recurso de terceros.

## Decisión
- Logo en WebP de 560 px (35 KB), precargado. Fuentes Poppins y Kaushan Script servidas desde el sitio (`@fontsource`).
- En el build, una `Content-Security-Policy` en `<meta>` que solo permite recursos del propio sitio (`default-src 'self'`, sin scripts ni estilos en línea). No se aplica en `npm run dev`, porque Vite usa scripts en línea para recargar en caliente.
- Enlaces externos con `noopener`. WhatsApp se abre como navegación, no como petición.

## Consecuencias
- Lighthouse móvil: 96 / 100 / 100 / 100, con LCP de 2,4 s.
- Agregar un recurso externo (analítica, mapa, fuentes de otro sitio) exige ampliar la CSP en `vite.config.ts`.
