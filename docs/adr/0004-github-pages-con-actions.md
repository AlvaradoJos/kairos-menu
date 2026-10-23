# 4. Publicar en GitHub Pages con GitHub Actions

Fecha: 2026-10-22 · Estado: propuesta (falta el OK de Jose y crear el repositorio)

## Contexto
El spec dejaba el hosting abierto (Netlify o Cloudflare Pages). El encargo de Horizon propone GitHub Pages con GitHub Actions, salvo que se acuerde otro hosting.

## Decisión
GitHub Pages con el workflow oficial de Vite y las actions fijadas por SHA. Un trabajo `check` corre pruebas, tipos y build en cada push y pull request; `deploy` publica solo desde `main`. La ruta base sale de `actions/configure-pages`, así que sirve igual en `usuario.github.io/<repo>/` o en un dominio propio.

El trabajo `deploy` además exige la variable del repo `PUBLICAR = true`. Así el repo se puede compartir con el equipo y recibir pushes sin publicar nada hasta que Jose dé el OK (2026-10-22).

## Consecuencias
- Gratis y sin cuentas fuera de GitHub, siempre que el repo sea público. El repo `kairos-menu` es privado, y en una cuenta gratis GitHub Pages no publica repos privados: al lanzar, o se hace público, o se paga un plan, o se cambia de hosting.
- GitHub Pages no deja definir cabeceras HTTP: la política de seguridad va como `<meta>` en el HTML (ADR 5) y no se puede usar `frame-ancestors`. Si hiciera falta, migrar a Cloudflare Pages o Netlify es cambiar solo el workflow.
- Volver atrás: revertir el commit en `main` (se republica solo) o volver a correr un despliegue anterior (`docs/lanzamiento.md`).
