# Lanzamiento

## Antes de publicar (bloquea)

- [ ] Número de WhatsApp para pedidos en `src/config.ts` (formato `506XXXXXXXX`).
- [ ] Probar un pedido real de punta a punta desde un celular a ese número y revisar que el mensaje llegue completo (tildes, ₡, —).
- [ ] Jose aprueba la vista previa.
- [ ] Repositorio creado en GitHub y *Settings → Pages → Source: GitHub Actions*.

## Conviene antes de publicar

- [ ] Horario, dirección, redes y costo de envío en `src/config.ts`.
- [ ] Respuestas a `pendiente_confirmar_con_el_negocio` en `menu.json` (precio de La Rascacielos, adicionales de desayuno, ortografía).

## Ya verificado (2026-10-22)

- 108 pruebas, chequeo de tipos y build en verde.
- Lighthouse móvil: 96 / 100 / 100 / 100.
- Flujo completo en Chrome con un número de prueba: agregar, opciones, carrito guardado, formulario, mensaje y apertura de WhatsApp.
- A 390 px no hay scroll horizontal y todos los controles miden 44 px o más.
- El build con ruta base `/<repo>/` deja bien HTML, JS, logo y fuentes.

## Después de publicar

- Abrir la URL de GitHub Pages en un celular: que cargue, agregar un platillo y enviar un pedido de prueba.
- Revisar en *Actions* que el despliegue quedó en verde.

## Volver atrás

El sitio no guarda datos en un servidor, así que volver atrás no pierde nada: el carrito vive en cada celular.

1. **Normal:** `git revert <commit malo>` y push a `main`. El workflow publica la versión anterior.
2. **Rápido:** en GitHub, *Actions → Revisar y publicar en GitHub Pages*, abrir el último despliegue que funcionaba y usar *Re-run all jobs*. Vuelve a construir desde ese commit.
3. **Apagar el sitio:** *Settings → Pages → Unpublish site*.
