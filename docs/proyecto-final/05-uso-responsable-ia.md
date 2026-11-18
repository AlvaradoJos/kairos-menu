# Semana 5 · Uso responsable de IA, créditos y fuentes

Proyecto de Ingeniería del Software II · Prof. Erick Chaves · Versión del documento: 1 (2026-11-18)

## 1. Qué herramientas de IA se usaron

| Herramienta | Para qué |
|---|---|
| **Claude Code** (Anthropic), modelo Claude Opus | Asistente de programación en la terminal: escribió borradores de spec, plan, código, pruebas y documentos, corrió los comandos y propuso cambios que el equipo revisó. |
| Skills de **superpowers** dentro de Claude Code | Método de trabajo: `brainstorming` (spec), `writing-plans` (plan), `test-driven-development` (prueba primero), `subagent-driven-development` (tareas del plan con revisión entre tareas), `verification-before-completion` (no dar algo por hecho sin correr las revisiones). |
| Skills de diseño (`impeccable`, `design-taste-frontend`, `emil-design-eng`, `frontend-ui-engineering`) | Criterios de interfaz: contraste, controles de 44 px, foco visible, animaciones que respetan "menos movimiento". Quedaron anotadas como decisiones en el registro de trabajo. |
| `code-review-and-quality` y `ponytail-review` | Revisión de código antes de la versión candidata (`04-pruebas.md` §5). |
| Subagente revisor (Claude) | Revisión final del MVP: 4 hallazgos importantes y 8 menores, sin críticos; los importantes se corrigieron con una prueba que primero fallaba (`.superpowers/sdd/2026-10-22-menu-digital/progress.md`). |

No se usó IA para generar imágenes, fotos de platillos ni datos del negocio. El logo y el menú impreso son del negocio (`assets/`).

## 2. En qué partes

Los 25 commits del repositorio (del 2026-10-22 al 2026-11-18) llevan la línea `Co-Authored-By: Claude`: toda la base de código se escribió con asistencia de IA.

| Parte | Qué hizo la IA | Qué decidió o aportó el equipo |
|---|---|---|
| Spec y plan (`docs/superpowers/`) | Redactó a partir de la conversación con el negocio y del menú impreso. | Aprobó el spec y el plan; decidió el alcance y las exclusiones. |
| `menu.json` | Transcribió el menú impreso. | Verificar contra el menú impreso; las dudas quedaron en `pendiente_confirmar_con_el_negocio`. |
| Lógica (`src/features/*`) y pruebas | Escribió primero la prueba y después el código, tarea por tarea. | Revisar cada tarea antes de la siguiente; dar el OK a la dirección visual (2026-10-22). |
| Interfaz (`src/components/*`, estilos) | Propuso y escribió los componentes y el CSS. | Aprobar la dirección visual y los colores de la marca. |
| Defectos D-01 a D-05 | Encontró las causas y propuso las correcciones con su prueba de regresión. | Decidir prioridades y qué queda abierto (D-02, D-03, D-04). |
| Documentos del curso (01 a 05) | Redactó los borradores a partir del código, el spec y los ADR. | Completar los `[PENDIENTE]`, revisar y aprobar cada semana. |

## 3. Qué revisó el equipo

[PENDIENTE: cada integrante completa su fila con lo que revisó de verdad. No llenar por adelantado.]

| Integrante | Qué revisó | Cómo (leer el código, correr pruebas, probar en celular) | Puede explicar |
|---|---|---|---|
| [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |
| [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |
| [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |

**Compromiso:** cada integrante debe poder explicar cualquier parte del código en la defensa. Para prepararse, se recomienda que cada uno:

1. Lea `src/features/cart/cart.ts` y `src/features/whatsapp/message.ts` y explique cómo se calcula un total con adicionales.
2. Rompa a propósito una línea (por ejemplo, quitar `* quantity` en un adicional), corra `npm test`, vea qué prueba falla y por qué, y deshaga el cambio.
3. Recorra el flujo en el navegador y lo siga en el código: `ItemSheet` → `addLine` → `CartBar` → `OrderView` → `buildOrderMessage` → `buildWhatsAppUrl`.

## 4. Controles que se aplicaron a lo que hizo la IA

- **Nada sin pruebas:** cada cambio de lógica entró con una prueba que primero fallaba; antes de cerrar cada tarea se corrieron `npm test`, `npm run typecheck` y `npm run build`.
- **Revisión automática:** GitHub Actions no publica si falla una prueba, el chequeo de tipos o el build.
- **Pruebas de mutación:** se rompió el código a propósito 14 veces para comprobar que las pruebas detectan errores (`04-pruebas.md` §3.4).
- **Nada inventado:** platillos, precios, horario, dirección y número salen del negocio; lo que falta queda como `[PENDIENTE]` o "por confirmar".
- **Nada sale sin OK:** la IA no hizo push, publicación ni envíos sin autorización.
- **Datos:** el número real no aparece en el código, las pruebas ni las capturas; las pruebas usan datos sintéticos.

## 5. Créditos: bibliotecas, plantillas, imágenes y fuentes

### 5.1 Bibliotecas

| Biblioteca | Versión | Licencia | Uso |
|---|---|---|---|
| React y React DOM | 19.3.1 | MIT | Interfaz |
| Vite | 8.3.5 | MIT | Servidor de desarrollo y build |
| @vitejs/plugin-react | 6.1.2 | MIT | React en Vite |
| TypeScript | 7.0.2 | Apache-2.0 | Tipos |
| Vitest | 5.0.5 | MIT | Pruebas |
| @testing-library/react, dom y user-event | 16.3.3, 10.4.2, 14.6.8 | MIT | Pruebas de componentes |
| jsdom | 30.1.3 | MIT | Navegador simulado en las pruebas |

### 5.2 Tipografías

| Fuente | Paquete | Licencia |
|---|---|---|
| Kaushan Script | `@fontsource/kaushan-script` 5.3.0 | SIL Open Font License 1.1 |
| Poppins | `@fontsource/poppins` 5.3.0 | SIL Open Font License 1.1 |

### 5.3 Plantillas y código de terceros

- Workflow de GitHub Actions basado en el workflow oficial de Vite para GitHub Pages: https://vite.dev/guide/static-deploy#github-pages (actions de GitHub fijadas por SHA; `.github/workflows/deploy.yml`).

### 5.4 Imágenes

- Logo de Kairos Foods y fotos del menú impreso: propiedad del negocio, que los entregó para este proyecto (`assets/`). [PENDIENTE: confirmar por escrito el permiso del negocio para mostrarlos en la defensa y en un repositorio público.]
- Íconos de la interfaz: SVG dibujados en el propio código (`src/components/Icon.tsx`).
- Sin fotos de stock ni imágenes generadas con IA.

### 5.5 Fuentes de información

Las fuentes citadas en la propuesta y la prefactibilidad están en `02-prefactibilidad.md` §10.2.
