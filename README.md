# Kairos Foods · Menú digital

Página web donde los clientes de Kairos Foods ven el menú desde el celular, arman su pedido y lo envían ya escrito al WhatsApp del restaurante. Es un sitio estático: no tiene servidor, base de datos ni costos mensuales.

Trabajo de Horizon Software Solutions. Contexto del cliente: `CLAUDE.md`. Reglas para quien programe: `AGENTS.md`.

## Qué hace (Semana 3)

- **Menú y carrito:** las 11 secciones y 51 platillos de `menu.json`; tamaños, opción (carne o pollo…), adicionales, notas y cantidades. El carrito se guarda en el celular y sobrevive a recargar la página.
- **Pedido por WhatsApp:** el formulario valida los datos y abre `api.whatsapp.com/send` con el mensaje completo, sin emojis y **siempre en español**.
- **Español e inglés:** botón **ES | EN** arriba a la derecha. Cambia toda la página y se recuerda al volver. Si el cliente usa inglés, el mensaje agrega "Idioma del cliente: inglés" (ADR 0007).
- **Ubicación en express:** botón opcional "Compartir mi ubicación"; el mensaje trae enlaces de Google Maps y Waze. La ubicación no se guarda en ningún lado (ADR 0008).

Recorrido del código, archivo por archivo, para explicarlo en clase: `docs/GUIA-DEL-CODIGO.md`.

## Cambiar precios, platillos o descripciones

Todo el menú está en **`menu.json`**. Ningún otro archivo tiene precios.

1. Abrir `menu.json` y buscar el platillo por su nombre.
2. Cambiar `"precio": 3800` (o el `"precio"` de cada opción en `"opciones"` si el platillo tiene tamaños). Los precios van **sin punto ni símbolo**: el sitio los muestra como ₡3.800.
3. Para un platillo nuevo, copiar uno parecido y ponerle un `"id"` nuevo, en minúsculas y con guiones (`"id": "taco-de-pollo"`). **No cambiar el `id` de un platillo existente**: lo usa el carrito guardado en el celular de los clientes.
4. Si un precio ya quedó confirmado con el negocio, borrar su línea `"por_confirmar"`. Mientras exista, el sitio lo marca como "Precio por confirmar".
5. Correr `npm test`. Una prueba revisa que cada platillo tenga precio o tamaños, que no se repitan ids y que el sitio muestre exactamente lo que dice `menu.json`.
6. Hacer commit y push a `main`: el sitio se publica solo (ver abajo).

Otros campos útiles:

- `"nota"` de una categoría: la franja amarilla al final de la sección. `{precio}` se reemplaza por el precio del adicional.
- `"adicionales"`: extras con precio (papas o aros por ₡1.200, duplicar nachos por ₡2.000).
- `"elegir"`: carne o pollo, etc. No cambia el precio.
- Campos `_en` (`nombre_en`, `nota_en`, `descripcion_en`, `etiqueta_en`, `opciones_en`): el texto en inglés. Son opcionales: si falta uno, la página muestra el español. Los nombres de los platillos no se traducen.

## Cambiar o agregar un texto en los dos idiomas

Ningún texto visible está escrito en un componente: todos salen de `src/i18n/`.

1. Abrir `src/i18n/es.ts` y cambiar o agregar el texto en su grupo (por ejemplo `order.send: 'Enviar por WhatsApp'`).
2. Hacer lo mismo en `src/i18n/en.ts` (`order.send: 'Send on WhatsApp'`). Si se olvida, `npm run typecheck` falla y dice cuál falta.
3. En el componente, usarlo con el hook: `const { t } = useLanguage();` y `{t.order.send}`.
4. Si el texto lleva un dato, se escribe como función: `` add: (name: string) => `Agregar ${name}` ``, y se usa `t.menu.add(item.name)`.
5. Los textos del **mensaje de WhatsApp** no se traducen: viven en `src/features/whatsapp/message.ts` y `ORDER_TYPE_LABEL` / `PAYMENT_LABEL` (`validation.ts`).

## Cómo funciona la ubicación

- Solo en pedidos **Express**, y solo si el cliente toca "Compartir mi ubicación". La dirección sigue siendo obligatoria.
- El navegador pide permiso y el GPS responde en hasta 10 segundos. Si el cliente no da permiso, si tarda demasiado, si no encuentra la ubicación o si el navegador no tiene GPS, sale un aviso para cada caso y el pedido se envía igual con la dirección.
- **Necesita HTTPS** (o `localhost` en desarrollo): los navegadores solo dan la ubicación en sitios seguros. GitHub Pages ya es HTTPS. Si abrís el sitio desde otro celular con `npm run dev -- --host` (`http://192.168…`), la ubicación va a decir "no disponible": es lo esperado.
- La ubicación vive solo en el formulario y en el mensaje. No se guarda en `localStorage` ni se manda a ningún otro lado.

## Demo paso a paso (Semana 3)

Con `npm run dev` y un número **de pruebas** en `.env` (nunca el real). Abrir http://localhost:5173 con la vista de celular del navegador (F12 → ícono de celular, 375 px).

**En español**
1. Bajar por el menú o tocar una sección en la barra (por ejemplo "Hamburguesas").
2. Tocar **+** en "Bacon & Chesse", elegir "Pechuga de pollo" y "Papas fritas" y tocar "Agregar · ₡5.000".
3. Tocar **+** en "Típico" (se agrega directo). Recargar la página: el carrito sigue ahí.
4. Tocar "Ver pedido", subir a 2 el Típico y escribir una nota.
5. Llenar nombre, escoger **Express**, escribir la dirección y tocar **Compartir mi ubicación** (dar permiso). Aparece "Ubicación lista".
6. Escoger el pago y tocar **Enviar por WhatsApp**: se abre WhatsApp con el pedido, la dirección y los enlaces de Google Maps y Waze.
7. Volver a la página y responder "Sí, vaciar carrito".

**En inglés**
1. Tocar **EN** arriba a la derecha: todo cambia a inglés ("Breakfast", "Add · ₡5.000", "Your order"…). Los nombres de los platillos y los precios quedan igual.
2. Repetir los pasos 2 a 6 ("Share my location", "Send on WhatsApp").
3. El mensaje que se abre en WhatsApp sigue en español y termina con "Idioma del cliente: inglés".
4. Recargar: la página sigue en inglés.

## Datos del negocio

Costo de envío, horario, dirección y redes van en `src/config.ts`. El **número de WhatsApp no va en el código**: sale de la variable de entorno `VITE_WHATSAPP_NUMBER` (ADR 6).

- **En tu computadora:** copiá `.env.example` como `.env` y poné un número de pruebas con código de país (`506` + 8 dígitos, sin espacios). `.env` nunca se sube al repo.
- **Al publicar:** el workflow toma la variable del repo `WHATSAPP_NUMBER` (*Settings → Secrets and variables → Actions → Variables*).
- Sin número, el botón de enviar dice "Número pendiente" y no se puede pedir; el resto del sitio funciona igual.

```ts
export const config: BusinessConfig = {
  whatsappNumber: parseWhatsappNumber(import.meta.env.VITE_WHATSAPP_NUMBER),
  deliveryFee: undefined, // sin definir: el mensaje dice "Costo de envío por confirmar"
  hours: undefined,
  address: undefined,
  socials: [],
};
```

## Instalación y ejecución paso a paso

Requisitos: **Node.js 22.22.2 o más reciente dentro de la 22, o 24.15.0 o más reciente** (incluye npm) y **Git**. Lo exige jsdom, que usan las pruebas; con una versión anterior `npm ci` avisa y `npm test` puede fallar. Probado con Node 24.15.0 y npm 11.12.1 en Windows 10. Detalle: `docs/proyecto-final/manual-instalacion.md`.

1. Revisar las versiones:
   ```bash
   node -v   # v22.22.2+ o v24.15.0+
   npm -v
   git --version
   ```
2. Clonar el repo y entrar a la carpeta:
   ```bash
   git clone https://github.com/AlvaradoJos/kairos-menu.git
   cd kairos-menu
   ```
3. Instalar las dependencias exactas del `package-lock.json`:
   ```bash
   npm ci
   ```
4. (Opcional, para poder enviar pedidos) Crear el archivo `.env`:
   ```bash
   cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
   ```
   y escribir un número **de pruebas** en `VITE_WHATSAPP_NUMBER=`.
5. Correr el sitio en modo desarrollo y abrir http://localhost:5173:
   ```bash
   npm run dev
   ```
   Para verlo en el celular dentro de la misma red: `npm run dev -- --host` y abrir la dirección "Network" que muestra la terminal.
6. Antes de subir cambios, correr las tres revisiones:
   ```bash
   npm test           # pruebas (Vitest)
   npm run typecheck  # chequeo de tipos
   npm run build      # sitio listo para publicar en dist/
   ```
7. Ver el build final como quedaría publicado (http://localhost:4173):
   ```bash
   npm run preview
   ```

Problemas comunes: si `npm ci` falla, revisar la versión de Node; si el puerto 5173 está ocupado, Vite usa el siguiente y lo dice en la terminal; si el botón dice "Número pendiente", falta o está mal el `.env` (reiniciar `npm run dev` después de cambiarlo).

## Estructura de carpetas

```
kairos-menu/
├── menu.json                 Menú completo: única fuente de platillos y precios
├── index.html                Página base
├── vite.config.ts            Configuración de Vite, Vitest y la CSP
├── .env.example              Variables de entorno (sin valores reales)
├── .github/workflows/        Revisión y publicación en GitHub Pages
├── public/                   Logo WebP, ícono y robots.txt (se copian tal cual)
├── assets/                   Logo original y menú impreso de referencia
├── src/
│   ├── main.tsx, App.tsx     Arranque y pantalla principal
│   ├── config.ts             Datos del negocio
│   ├── data/menu.ts          Convierte menu.json a los tipos del sitio
│   ├── features/             Lógica pura, cada una con __tests__/
│   │   ├── menu/             Tipos y formato de precios
│   │   ├── cart/             Carrito y guardado en el celular
│   │   ├── order-form/       Validación del formulario, totales y avisos
│   │   ├── location/         GPS del celular y enlaces de Maps y Waze
│   │   └── whatsapp/         Mensaje, enlace de WhatsApp y número
│   ├── i18n/                 Diccionarios es/en, idioma elegido y textos del menú
│   ├── components/           Interfaz (no calcula precios) y sus pruebas
│   │   └── order/            Ventana "Tu pedido": líneas, formulario, ubicación, diálogo
│   ├── styles/               tokens.css (colores) y app.css
│   ├── __tests__/            Pruebas de la app completa (flujo e idiomas)
│   └── test/                 Menú de prueba para las pruebas
└── docs/
    ├── GUIA-DEL-CODIGO.md    Recorrido del código para estudiantes
    ├── adr/                  Decisiones técnicas
    ├── proyecto-final/       Entregables del curso, uno por semana
    ├── superpowers/          Spec y plan aprobados
    └── lanzamiento.md        Lista de lanzamiento y cómo volver atrás
```

## Cómo trabajamos

### Ramas

- `main` siempre funciona y es lo que se publica. **Nadie hace push directo a `main`.**
- Una rama por tarea, creada desde `main` actualizado:
  - `feature/<tema>`: funcionalidad nueva (`feature/numero-por-env`).
  - `fix/<tema>`: corrección de un defecto (`fix/total-con-envio`).
  - `docs/<tema>`: documentos (`docs/semana-3`).
  - `test/<tema>`: solo pruebas.
- En minúsculas, con guiones y sin tildes. Se borra después de unirla.

### Mensajes de commit

- En español, en infinitivo o imperativo, describiendo el cambio: `Validar la dirección en pedidos express`.
- Primera línea de 72 caracteres o menos, sin punto final.
- Si hace falta, una línea en blanco y un párrafo con el **porqué**.
- Un commit = un cambio con sentido propio; que el proyecto compile y las pruebas pasen en cada commit.
- Si se usó IA para el cambio, se indica en el cuerpo del commit (por ejemplo, `Co-Authored-By:`).

### Revisión por pares

1. Abrir un pull request hacia `main` con: qué cambia, por qué, cómo se probó y capturas si cambia la interfaz.
2. GitHub Actions corre pruebas, tipos y build; si algo falla, no se une.
3. **Al menos otro integrante** revisa y aprueba. Revisa que: haga lo que dice, tenga pruebas, no copie precios fuera de `menu.json`, no invente datos del negocio, no tenga secretos ni el número real, y que se entienda.
4. Quien revisa deja comentarios concretos; quien hizo el cambio responde o corrige.
5. Se une con *Squash and merge* o *Merge* y se borra la rama.

Configuración sugerida en GitHub: *Settings → Branches → Add branch ruleset* para `main` con "Require a pull request before merging" (1 aprobación) y "Require status checks to pass" (`check`).

### Agregar al profesor al repositorio

El repo `kairos-menu` es privado. Para darle acceso al profesor:

1. *Settings → Collaborators → Add people*.
2. Escribir su correo institucional: [PENDIENTE: correo del profe]. Si ese correo no tiene cuenta de GitHub, le llega una invitación para crearla.
3. Rol: **Read** (puede ver código, issues y pull requests sin cambiar nada).
4. El profesor acepta la invitación desde el correo o desde https://github.com/notifications.

Agregar al profesor no publica nada ni hace público el repo.

## Publicar

El sitio se publica en **GitHub Pages** con GitHub Actions (`.github/workflows/deploy.yml`, basado en la [guía oficial de Vite](https://vite.dev/guide/static-deploy#github-pages)).

- Cada push o pull request corre pruebas, chequeo de tipos y build. Si algo falla, no se publica.
- Cada push a `main` que pasa la revisión publica el sitio, **solo si la variable del repo `PUBLICAR` vale `true`**. Mientras no exista, nada se publica.
- Para activar la publicación la primera vez:
  1. *Settings → Pages → Build and deployment → Source: GitHub Actions*.
  2. *Settings → Secrets and variables → Actions → Variables → New repository variable*: `PUBLICAR` = `true` y `WHATSAPP_NUMBER` = el número que recibe los pedidos (de pruebas para la demo del curso).
  3. *Actions → Revisar y publicar en GitHub Pages → Run workflow* (o hacer un push a `main`).
- El repo es privado. En una cuenta gratis, GitHub Pages solo funciona con repos públicos, así que para publicar hay que hacerlo público, tener un plan pago o usar otro hosting (ADR 4).
- Dominio propio: *Settings → Pages → Custom domain*. La ruta base se ajusta sola.

Lista de lanzamiento y cómo volver atrás: `docs/lanzamiento.md`.

## Decisiones

Los porqués están en `docs/adr/`. El spec y el plan aprobados están en `docs/superpowers/`. Los entregables del curso están en `docs/proyecto-final/`.
