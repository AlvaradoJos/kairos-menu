# 6. Número de WhatsApp por variable de entorno

Fecha: 2026-11-07 · Estado: propuesta (falta aprobación del equipo)

## Contexto
El número real del negocio estaba escrito en `src/config.ts` y, por lo tanto, en el código, en el build y en el historial de git. Para el proyecto del curso el repo puede hacerse público (GitHub Pages gratis lo exige, ADR 4) y los compañeros van a probar la demo haciendo pedidos: con el número real, esos pedidos le llegarían al negocio. Las reglas del proyecto piden que el número real no aparezca en ejemplos, pruebas ni capturas.

## Decisión
- `src/config.ts` lee el número de `VITE_WHATSAPP_NUMBER` con `parseWhatsappNumber` (`src/features/whatsapp/number.ts`), que acepta dígitos, `+`, espacios y guiones y exige de 10 a 15 dígitos con código de país. Si falta o no es válido, el sitio queda en "Número pendiente".
- En local, el número va en `.env` (excluido por `.gitignore`); `.env.example` documenta la variable sin valor.
- Al publicar, el workflow toma la variable del repo `WHATSAPP_NUMBER` (*Settings → Secrets and variables → Actions → Variables*). Para la demo del curso se usa un número de pruebas.

## Consecuencias
- Cambiar de número de pruebas a número real es cambiar una variable en GitHub y volver a correr el despliegue, sin tocar código.
- El número real sigue en el historial de git (commit `1840854`). Antes de hacer público el repo hay que decidir si se reescribe el historial o si se acepta que quede visible (es el número de pedidos del negocio, que de todos modos sería público en el sitio).
- Quien clone el repo sin `.env` ve el sitio completo, pero no puede enviar pedidos hasta definir la variable.
