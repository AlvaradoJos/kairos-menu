// Formulario del pedido: sus tipos, los textos en español del mensaje y la validación.
// Lo usan OrderView, OrderFormFields y message.ts.

import type { GeoPoint } from '../location/location';

export type OrderType = 'recoger' | 'express';
export type PaymentMethod = 'efectivo' | 'sinpe' | 'tarjeta';

/** Lo que el cliente escribe en el formulario. Vive solo en memoria: no se guarda en localStorage. */
export interface OrderForm {
  name: string;
  type: OrderType | '';
  address: string;
  reference: string;
  /** Punto del GPS que el cliente compartió (solo express). null si no lo compartió. */
  location: GeoPoint | null;
  /** "HH:MM" del input de hora; vacío si no la indica. */
  pickupTime: string;
  payment: PaymentMethod | '';
  comment: string;
}

/** Formulario vacío, al abrir la página. */
export const EMPTY_FORM: OrderForm = {
  name: '',
  type: '',
  address: '',
  reference: '',
  location: null,
  pickupTime: '',
  payment: '',
  comment: '',
};

/** Textos del mensaje de WhatsApp, siempre en español. La página usa t.order.types. */
export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  recoger: 'Para recoger',
  express: 'Express',
};

/** Textos del mensaje de WhatsApp, siempre en español. La página usa t.order.payments. */
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  sinpe: 'SINPE Móvil',
  tarjeta: 'Tarjeta',
};

/** Claves de error; la interfaz las traduce con t.errors (es.ts / en.ts). */
export type FormErrorKey = 'nameMissing' | 'typeMissing' | 'addressMissing' | 'paymentMissing';

export type FormErrors = Partial<Record<'name' | 'type' | 'address' | 'payment', FormErrorKey>>;

/** Revisa los datos obligatorios. En express la dirección es obligatoria aunque se comparta la ubicación. */
export function validateOrderForm(form: OrderForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'nameMissing';
  if (!form.type) errors.type = 'typeMissing';
  if (form.type === 'express' && !form.address.trim()) errors.address = 'addressMissing';
  if (!form.payment) errors.payment = 'paymentMissing';
  return errors;
}

/** Si hay al menos un error. */
export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
