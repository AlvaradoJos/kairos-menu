# Lanzamiento

## Antes de publicar (bloquea)

- [ ] Número de WhatsApp para pedidos en la variable del repo `WHATSAPP_NUMBER` (formato `506XXXXXXXX`; ADR 6). Para la demo del curso, un número de pruebas.
- [ ] Probar un pedido real de punta a punta desde un celular a ese número y revisar que el mensaje llegue completo (tildes, ₡, —).
- [ ] Jose aprueba la vista previa.
- [ ] *Settings → Pages → Source: GitHub Actions* y variable del repo `PUBLICAR` = `true` (sin ella el workflow no publica).
- [ ] El repo `kairos-menu` es privado: decidir si se hace público (GitHub Pages gratis lo exige), si se paga un plan o si se usa otro hosting.

## Demo del curso (con número de pruebas)

Para que los compañeros y el profesor puedan pedir sin escribirle al negocio. Lo hace el dueño del repo en GitHub; nada de esto se hace desde la computadora sin su OK.

1. **Decidir qué hacer con el historial (D-02), antes de hacer público el repo.** Los commits `1840854` y `547d116` tienen el número real del negocio, y `547d116` ya está en `main` en GitHub (el repo es privado). Opciones:
   - **a) Reescribir el historial** con `git filter-repo --replace-text`, cambiando el número por un texto como `NUMERO-REMOVIDO`. Se conservan todos los commits, pero cambian sus códigos (hash): hay que actualizar los que citan los documentos y todos los integrantes vuelven a clonar. Es irreversible en GitHub una vez que se sube con `--force`.
   - **b) Publicar desde un repo nuevo**, por ejemplo `kairos-menu-demo`, con una sola copia limpia del código. El repo privado queda intacto, pero el público no muestra el historial de commits, que el profesor podría querer evaluar.
   - **c) No hacerlo público:** pagar un plan de GitHub con Pages privado o usar otro hosting (ADR 4).
2. Unir la rama de trabajo a `main` con un pull request revisado por otro integrante, y ver la revisión de GitHub Actions en verde.
3. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
4. *Settings → Secrets and variables → Actions → Variables*:
   - `WHATSAPP_NUMBER` = el número **de pruebas**, solo dígitos con código de país (`506XXXXXXXX`).
   - `PUBLICAR` = `true`.
5. *Settings → General → Danger Zone → Change visibility* → **Public** (solo después del paso 1).
6. *Actions → Revisar y publicar en GitHub Pages → Run workflow* sobre `main`.
7. Abrir la URL que muestra el despliegue (para este repo, `https://alvaradojos.github.io/kairos-menu/`) en un celular y hacer un pedido de prueba completo: debe llegar al número de pruebas.
8. Para el lanzamiento real con el negocio: cambiar `WHATSAPP_NUMBER` por el número del negocio, con el OK de Jose, y volver a correr el workflow.

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
