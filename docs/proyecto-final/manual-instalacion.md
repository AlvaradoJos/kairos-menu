# Manual de instalación

Proyecto de Ingeniería del Software II · Prof. Erick Chaves
Menú digital y pedidos por WhatsApp de Kairos Foods · Versión del documento: 1 (2026-11-18)

Este manual sirve para que cualquier persona corra el proyecto en su computadora, corra las pruebas y vea el sitio como quedaría publicado. No hace falta cuenta en ningún servicio: el sitio es estático y no tiene servidor ni base de datos.

## 1. Requisitos

| Programa | Versión | Cómo revisarla | Dónde se consigue |
|---|---|---|---|
| Node.js (incluye npm) | **22.22.2 o más reciente dentro de la 22**, o **24.15.0 o más reciente** (también 26+) | `node -v` | https://nodejs.org (versión LTS) |
| npm | La que trae Node (probado con 11.12.1) | `npm -v` | Viene con Node.js |
| Git | Cualquiera reciente (probado con 2.53) | `git --version` | https://git-scm.com |
| Navegador | Chrome, Edge, Firefox o Safari recientes | — | — |

**Por qué esa versión de Node:** las pruebas usan jsdom 30, que exige `^22.22.2 || ^24.15.0 || >=26.0.0`. `package.json` declara ese rango en `engines`. Con una versión más vieja, `npm ci` muestra un aviso `EBADENGINE` (lo dispara jsdom) pero sigue: es la señal para actualizar Node antes de seguir.

Probado en Windows 10 con Node 24.15.0, npm 11.12.1 y Git 2.53. La revisión automática de GitHub Actions corre en Ubuntu con la versión LTS de Node.

Espacio: unos 200 MB, casi todo de `node_modules`.

## 2. Obtener el código

El repositorio es privado: hace falta que el dueño te agregue como colaborador (`README.md` → "Agregar al profesor al repositorio"; los compañeros, igual).

```bash
git clone https://github.com/AlvaradoJos/kairos-menu.git
cd kairos-menu
```

Sin acceso a GitHub (por ejemplo, el día de la defensa sin internet): copiar la carpeta del proyecto en una llave USB **sin** `node_modules` ni `dist`, y llevar también una copia de `node_modules` ya instalada en una computadora con el mismo sistema operativo, por si no hay red para `npm ci`.

## 3. Instalar dependencias

```bash
npm ci
```

`npm ci` instala exactamente las versiones de `package-lock.json`. Tarda uno o dos minutos la primera vez y necesita internet.

## 4. Configurar el número de WhatsApp (opcional)

Sin este paso el sitio funciona igual, pero el botón de enviar dice "Número pendiente" y no abre WhatsApp.

```bash
cp .env.example .env            # Linux, macOS o Git Bash
Copy-Item .env.example .env     # PowerShell
```

Abrir `.env` y escribir un número **de pruebas**, con código de país y solo dígitos:

```
VITE_WHATSAPP_NUMBER=506XXXXXXXX
```

Reglas:
- Nunca el número real del negocio: los pedidos de prueba le llegarían a Kairos.
- `.env` no se sube al repositorio (`.gitignore` lo excluye).
- Después de cambiar `.env`, detener y volver a correr `npm run dev`.

## 5. Correr el sitio

```bash
npm run dev
```

Abrir http://localhost:5173. Para verlo en un celular conectado a la misma red wifi:

```bash
npm run dev -- --host
```

y abrir en el celular la dirección "Network" que muestra la terminal. Compartir la ubicación (pedidos express) solo funciona en `localhost` o en HTTPS: desde el celular por la red local el navegador la bloquea y el sitio muestra el aviso; el pedido se envía igual.

## 6. Correr las pruebas y las revisiones

```bash
npm test           # 141 pruebas con Vitest
npm run typecheck  # chequeo de tipos de TypeScript
npm run build      # genera el sitio publicable en dist/
```

Resultado esperado de `npm test`:

```
 Test Files  15 passed (15)
      Tests  141 passed (141)
```

Para ver el detalle de cada prueba: `npx vitest run --reporter=verbose`.

## 7. Ver la versión de producción

```bash
npm run build
npm run preview
```

Abrir http://localhost:4173. Es exactamente lo que se publicaría en GitHub Pages.

## 8. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `npm ci` muestra `EBADENGINE` o `npm test` falla con errores de jsdom | Node más viejo que 22.22.2 / 24.15.0 | Instalar la versión LTS de https://nodejs.org y repetir desde el paso 3 |
| `npm ci` dice que falta `package-lock.json` | Se copió el proyecto sin ese archivo | Copiarlo del repositorio; no usar `npm install` en su lugar |
| El botón dice "Número pendiente" | Falta `.env`, el número está vacío o tiene otro formato | Revisar el paso 4 y reiniciar `npm run dev` |
| El puerto 5173 está ocupado | Otro programa lo usa | Vite usa el siguiente puerto libre y lo dice en la terminal |
| "Compartir mi ubicación" muestra un aviso | Se abrió desde la red local (sin HTTPS) o se negó el permiso | Normal; probarla en `localhost` o en el sitio publicado |
| Una prueba falla por tiempo (`Test timed out`) en una computadora lenta | La computadora está muy cargada | Cerrar programas y repetir; si sigue, `npx vitest run --no-file-parallelism` |

## 9. Preparación para la defensa

Al menos 2 o 3 integrantes deben tener el proyecto corriendo en su computadora (`02-prefactibilidad.md` §3.5). Lista para cada uno, **el día antes**:

- [ ] `node -v` muestra 22.22.2+ o 24.15.0+.
- [ ] `git pull` en la rama que se va a presentar.
- [ ] `npm ci` sin errores.
- [ ] `.env` con el número de pruebas.
- [ ] `npm test`, `npm run typecheck` y `npm run build` en verde.
- [ ] `npm run dev` abre el sitio y se puede armar un pedido completo.
- [ ] Celular con WhatsApp para recibir el pedido de prueba en vivo.

| Integrante | Sistema operativo | Node | Lista completa |
|---|---|---|---|
| [PENDIENTE: integrante] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |
| [PENDIENTE: integrante] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |
| [PENDIENTE: integrante] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |
