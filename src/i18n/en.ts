// Diccionario en inglés. Tiene el tipo Dictionary (la forma de es.ts): si falta un texto, el typecheck falla.
// Solo cambia la página; el mensaje de WhatsApp que recibe el negocio sigue en español.

import type { Dictionary } from './es';

export const en: Dictionary = {
  meta: {
    title: "Kairos Food's · Menu",
  },
  language: {
    groupLabel: 'Language',
    es: 'Español',
    en: 'English',
  },
  header: {
    logoAlt: 'Kairos Foods',
    tagline: 'Breakfast, lunch, burgers, tacos and more. Order from your phone.',
    viewMenu: 'See menu',
    orderWhatsApp: 'Order on WhatsApp',
  },
  nav: {
    label: 'Menu sections',
  },
  menu: {
    priceFrom: (price) => `from ${price}`,
    pricePending: 'Price to be confirmed',
    add: (name) => `Add ${name}`,
    added: (name) => `Added: ${name}`,
    unpricedExtrasHint: "Ask for them in your order notes and we'll confirm the price.",
  },
  sheet: {
    close: 'Close',
    pricePending: 'Price to be confirmed with the restaurant',
    size: 'Size',
    extras: 'Extras',
    notes: 'Notes',
    notesPlaceholder: 'E.g.: no onion',
    minusOne: 'Remove one',
    plusOne: 'Add one',
    add: (total) => `Add · ${total}`,
  },
  cartBar: {
    items: (count) => `${count} ${count === 1 ? 'item' : 'items'}`,
    approx: 'approx.',
    viewOrder: 'View order',
  },
  order: {
    title: 'Your order',
    close: 'Close',
    empty: 'Your order is empty.',
    viewMenu: 'See menu',
    delivery: 'Delivery',
    total: 'Total',
    name: 'Name',
    orderType: 'Order type',
    types: { recoger: 'Pickup', express: 'Delivery (Express)' },
    address: 'Address',
    reference: 'Landmark (optional)',
    referencePlaceholder: 'E.g.: black gate',
    pickupTime: 'Pickup time (optional)',
    payment: 'Payment method',
    payments: { efectivo: 'Cash', sinpe: 'SINPE Móvil', tarjeta: 'Card' },
    comment: 'Comment (optional)',
    missingData: 'Some details are missing. Check the fields marked in red.',
    send: 'Send on WhatsApp',
    numberPending: 'Number pending',
  },
  errors: {
    nameMissing: 'Name is missing',
    typeMissing: 'Order type is missing',
    addressMissing: 'Address is missing',
    paymentMissing: 'Payment method is missing',
  },
  warnings: {
    pendingPrice: (names) => `Price to be confirmed: ${names}`,
    unpricedExtras: 'Extras to be confirmed',
    deliveryFeePending: 'Delivery fee to be confirmed',
  },
  line: {
    minusOne: (name) => `Remove one ${name}`,
    plusOne: (name) => `Add one more ${name}`,
    removeLabel: (name) => `Remove ${name}`,
    remove: 'Remove',
    note: 'Note',
    noteUnpricedExtras: "Note (extras: we'll confirm the price)",
  },
  location: {
    label: 'Location (optional)',
    ready: 'Location ready',
    viewMap: 'See on the map',
    remove: 'Remove location',
    searching: 'Finding your location…',
    share: 'Share my location',
    hint: "We'll tell you the delivery fee when we get your order.",
    errors: {
      denied: "You didn't allow us to see your location. You can turn it on in your browser or just type the address.",
      timeout: 'Finding your location took too long. Try again or type the address carefully.',
      unavailable: "We couldn't find your location. Try again or type the address carefully.",
      unsupported: "Your browser can't share your location. Type the address with clear directions.",
    },
  },
  sent: {
    title: 'Did you send your order?',
    body: "If WhatsApp didn't open, go back to your order and try again.",
    confirm: 'Yes, empty the cart',
    back: 'No, back to my order',
  },
  footer: {
    hours: (hours) => `Hours: ${hours}`,
  },
};
