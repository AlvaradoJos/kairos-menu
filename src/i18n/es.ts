// Diccionario en español: todos los textos de la interfaz. Es la forma base; en.ts debe tener la misma.
// Lo usan los componentes con useLanguage().t, y message.ts para los avisos del mensaje (siempre en español).
// Los textos que llevan un dato (un nombre, un precio) son funciones.

export const es = {
  meta: {
    title: "Kairos Food's · Menú",
  },
  language: {
    groupLabel: 'Idioma',
    es: 'Español',
    en: 'English',
  },
  header: {
    logoAlt: 'Kairos Foods',
    tagline: 'Desayunos, almuerzos, hamburguesas, tacos y más. Pide desde tu celular.',
    viewMenu: 'Ver menú',
    orderWhatsApp: 'Pedir por WhatsApp',
  },
  nav: {
    label: 'Secciones del menú',
  },
  menu: {
    priceFrom: (price: string) => `desde ${price}`,
    pricePending: 'Precio por confirmar',
    add: (name: string) => `Agregar ${name}`,
    added: (name: string) => `Agregado: ${name}`,
    unpricedExtrasHint: 'Pídelos en las notas de tu pedido y te confirmamos el precio.',
  },
  sheet: {
    close: 'Cerrar',
    pricePending: 'Precio por confirmar con el restaurante',
    size: 'Tamaño',
    extras: 'Adicionales',
    notes: 'Notas',
    notesPlaceholder: 'Ej.: sin cebolla',
    minusOne: 'Restar uno',
    plusOne: 'Sumar uno',
    add: (total: string) => `Agregar · ${total}`,
  },
  cartBar: {
    items: (count: number) => `${count} ${count === 1 ? 'platillo' : 'platillos'}`,
    approx: 'aprox.',
    viewOrder: 'Ver pedido',
  },
  order: {
    title: 'Tu pedido',
    close: 'Cerrar',
    empty: 'Tu pedido está vacío.',
    viewMenu: 'Ver menú',
    delivery: 'Envío',
    total: 'Total',
    name: 'Nombre',
    orderType: 'Tipo de pedido',
    types: { recoger: 'Para recoger', express: 'Express' },
    address: 'Dirección',
    reference: 'Referencia (opcional)',
    referencePlaceholder: 'Ej.: portón negro',
    pickupTime: 'Hora a la que pasas (opcional)',
    payment: 'Método de pago',
    payments: { efectivo: 'Efectivo', sinpe: 'SINPE Móvil', tarjeta: 'Tarjeta' },
    comment: 'Comentario (opcional)',
    missingData: 'Faltan datos. Revisa lo marcado en rojo.',
    send: 'Enviar por WhatsApp',
    numberPending: 'Número pendiente',
  },
  errors: {
    nameMissing: 'Falta el nombre',
    typeMissing: 'Falta el tipo de pedido',
    addressMissing: 'Falta la dirección',
    paymentMissing: 'Falta el método de pago',
  },
  warnings: {
    pendingPrice: (names: string) => `Precio por confirmar: ${names}`,
    unpricedExtras: 'Adicionales por confirmar',
    deliveryFeePending: 'Costo de envío por confirmar',
  },
  line: {
    minusOne: (name: string) => `Restar uno de ${name}`,
    plusOne: (name: string) => `Sumar uno de ${name}`,
    removeLabel: (name: string) => `Quitar ${name}`,
    remove: 'Quitar',
    note: 'Nota',
    noteUnpricedExtras: 'Nota (adicionales: te confirmamos el precio)',
  },
  location: {
    label: 'Ubicación (opcional)',
    ready: 'Ubicación lista',
    viewMap: 'Ver en el mapa',
    remove: 'Quitar ubicación',
    searching: 'Buscando tu ubicación…',
    share: 'Compartir mi ubicación',
    hint: 'Te decimos el costo del envío al recibir el pedido.',
    errors: {
      denied: 'No nos diste permiso para ver tu ubicación. Puedes activarlo en el navegador o solo escribir la dirección.',
      timeout: 'Tu ubicación tardó demasiado. Intenta de nuevo o escribe bien la dirección.',
      unavailable: 'No pudimos encontrar tu ubicación. Intenta de nuevo o escribe bien la dirección.',
      insecure: 'Esta página no es segura (sin https), así que el navegador no da la ubicación. Escribe la dirección con buenas señas.',
      unsupported: 'Tu navegador no permite compartir la ubicación. Escribe la dirección con buenas señas.',
    },
  },
  sent: {
    title: '¿Ya enviaste tu pedido?',
    body: 'Si WhatsApp no se abrió, vuelve al pedido e inténtalo de nuevo.',
    confirm: 'Sí, vaciar carrito',
    back: 'No, volver al pedido',
  },
  footer: {
    hours: (hours: string) => `Horario: ${hours}`,
  },
};

/** La forma de un diccionario. en.ts usa este tipo: si le falta un texto, TypeScript lo marca. */
export type Dictionary = typeof es;
