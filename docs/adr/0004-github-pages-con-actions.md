# 4. Publicar en GitHub Pages con GitHub Actions

Fecha: 2026-10-22 · Estado: propuesta (falta el OK de Jose y crear el repositorio)

## Contexto
El spec dejaba el hosting abierto (Netlify o Cloudflare Pages). El encargo de Horizon propone GitHub Pages con GitHub Actions, salvo que se acuerde otro hosting.

## Decisión
GitHub Pages con el workflow oficial de Vite y las actions fijadas por SHA. Un trabajo `check` corre pruebas, tipos y build en cada push y pull request; `deploy` publica solo desde `main`. La ruta base sale de `actions/configure-pages`, así que sirve igual en `usuario.github.io/<repo>/` o en un dominio propio.

## Consecuencias
- Gratis y sin cuentas fuera de GitHub.
- GitHub Pages no deja definir cabeceras HTTP: la política de seguridad va como `<meta>` en el HTML (ADR 5) y no se puede usar `frame-ancestors`. Si hiciera falta, migrar a Cloudflare Pages o Netlify es cambiar solo el workflow.
- Volver atrás: revertir el commit en `main` (se republica solo) o volver a correr un despliegue anterior (`docs/lanzamiento.md`).
