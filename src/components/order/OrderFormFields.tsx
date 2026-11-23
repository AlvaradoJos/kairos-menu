// Campos del formulario del pedido: nombre, tipo, dirección, ubicación, referencia, hora, pago y comentario.
// Lo usa OrderView, que guarda el formulario y valida. Aquí solo se dibujan los campos y se avisan los cambios.

import {
  ORDER_TYPE_LABEL,
  PAYMENT_LABEL,
  type FormErrors,
  type OrderForm,
  type OrderType,
  type PaymentMethod,
} from '../../features/order-form/validation';
import { useLanguage } from '../../i18n/LanguageContext';
import { Field } from './Field';
import { LocationField } from './LocationField';
import { RadioFieldset } from './RadioFieldset';

// Las opciones salen de las mismas listas que usa el mensaje, para que no se desincronicen.
const ORDER_TYPES = Object.keys(ORDER_TYPE_LABEL) as OrderType[];
const PAYMENTS = Object.keys(PAYMENT_LABEL) as PaymentMethod[];

interface Props {
  form: OrderForm;
  errors: FormErrors;
  /** Cambia solo los campos indicados, p. ej. onChange({ name: 'Ana' }). */
  onChange(changes: Partial<OrderForm>): void;
}

/**
 * Formulario del pedido. La dirección, la ubicación y la referencia salen solo en express;
 * la hora, solo para recoger.
 */
export function OrderFormFields({ form, errors, onChange }: Props) {
  const { t } = useLanguage();
  return (
    <>
      <Field label={t.order.name} error={errors.name && t.errors[errors.name]}>
        {(id, describedBy) => (
          <input
            id={id}
            type="text"
            autoComplete="name"
            value={form.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        )}
      </Field>

      <RadioFieldset
        legend={t.order.orderType}
        name="order-type"
        error={errors.type && t.errors[errors.type]}
        options={ORDER_TYPES.map((type) => ({
          key: type,
          label: t.order.types[type],
          checked: form.type === type,
          onSelect: () => onChange({ type }),
        }))}
      />

      {form.type === 'express' && (
        <>
          <Field label={t.order.address} error={errors.address && t.errors[errors.address]}>
            {(id, describedBy) => (
              <textarea
                id={id}
                rows={2}
                autoComplete="street-address"
                value={form.address}
                aria-invalid={Boolean(errors.address)}
                aria-describedby={describedBy}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            )}
          </Field>
          <LocationField value={form.location} onChange={(location) => onChange({ location })} />
          <Field label={t.order.reference}>
            {(id) => (
              <input
                id={id}
                type="text"
                placeholder={t.order.referencePlaceholder}
                value={form.reference}
                onChange={(e) => onChange({ reference: e.target.value })}
              />
            )}
          </Field>
        </>
      )}

      {form.type === 'recoger' && (
        <Field label={t.order.pickupTime}>
          {(id) => (
            <input id={id} type="time" value={form.pickupTime} onChange={(e) => onChange({ pickupTime: e.target.value })} />
          )}
        </Field>
      )}

      <RadioFieldset
        legend={t.order.payment}
        name="payment"
        error={errors.payment && t.errors[errors.payment]}
        options={PAYMENTS.map((payment) => ({
          key: payment,
          label: t.order.payments[payment],
          checked: form.payment === payment,
          onSelect: () => onChange({ payment }),
        }))}
      />

      <Field label={t.order.comment}>
        {(id) => (
          <textarea id={id} rows={2} value={form.comment} onChange={(e) => onChange({ comment: e.target.value })} />
        )}
      </Field>
    </>
  );
}
