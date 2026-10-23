# Kairos Foods · Menú digital

Página web donde los clientes de Kairos Foods ven el menú desde el celular, arman su pedido y lo envían ya escrito al WhatsApp del restaurante. Es un sitio estático: no tiene servidor, base de datos ni costos mensuales.

Trabajo de Horizon Software Solutions. Contexto del cliente: `CLAUDE.md`. Reglas para quien programe: `AGENTS.md`.

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

## Datos del negocio

WhatsApp, costo de envío, horario, dirección y redes van en `src/config.ts`. Mientras `whatsappNumber` no esté definido, el botón de enviar dice "Número pendiente" y no se puede pedir.

```ts
export const config: BusinessConfig = {
  whatsappNumber: '506XXXXXXXX', // formato internacional, solo números
  deliveryFee: undefined,        // sin definir: el mensaje dice "Costo de envío por confirmar"
  hours: undefined,
  address: undefined,
  socials: [],
};
```

## Desarrollo

Requiere Node 22 o más reciente.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas (Vitest)
npm run typecheck  # chequeo de tipos
npm run build      # sitio listo para publicar en dist/
npm run preview    # ver el build en http://localhost:4173
```

## Publicar

El sitio se publica en **GitHub Pages** con GitHub Actions (`.github/workflows/deploy.yml`, basado en la [guía oficial de Vite](https://vite.dev/guide/static-deploy#github-pages)).

- Cada push o pull request corre pruebas, chequeo de tipos y build. Si algo falla, no se publica.
- Cada push a `main` que pasa la revisión publica el sitio.
- La primera vez: en GitHub, *Settings → Pages → Build and deployment → Source: GitHub Actions*.
- Dominio propio: *Settings → Pages → Custom domain*. La ruta base se ajusta sola.

Lista de lanzamiento y cómo volver atrás: `docs/lanzamiento.md`.

## Decisiones

Los porqués están en `docs/adr/`. El spec y el plan aprobados están en `docs/superpowers/`.
