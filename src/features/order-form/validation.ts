export type OrderType = 'recoger' | 'express';
export type PaymentMethod = 'efectivo' | 'sinpe' | 'tarjeta';

export interface OrderForm {
  name: string;
  type: OrderType | '';
  address: string;
  reference: string;
  /** "HH:MM" del input de hora; vacío si no la indica. */
  pickupTime: string;
  payment: PaymentMethod | '';
  comment: string;
}

export const EMPTY_FORM: OrderForm = {
  name: '',
  type: '',
  address: '',
  reference: '',
  pickupTime: '',
  payment: '',
  comment: '',
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  recoger: 'Para recoger',
  express: 'Express',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  sinpe: 'SINPE Móvil',
  tarjeta: 'Tarjeta',
};

export type FormErrors = Partial<Record<'name' | 'type' | 'address' | 'payment', string>>;

export function validateOrderForm(form: OrderForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Falta el nombre';
  if (!form.type) errors.type = 'Falta el tipo de pedido';
  if (form.type === 'express' && !form.address.trim()) errors.address = 'Falta la dirección';
  if (!form.payment) errors.payment = 'Falta el método de pago';
  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
