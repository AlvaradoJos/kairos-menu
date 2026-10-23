import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { lineTotal, resolveLine, type CartLine } from '../features/cart/cart';
import { formatColones } from '../features/menu/price';
import type { Colones, MenuSection } from '../features/menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../features/order-form/totals';
import {
  hasErrors,
  ORDER_TYPE_LABEL,
  PAYMENT_LABEL,
  validateOrderForm,
  type FormErrors,
  type OrderForm,
  type OrderType,
  type PaymentMethod,
} from '../features/order-form/validation';
import { buildOrderMessage, buildWhatsAppUrl } from '../features/whatsapp/message';
import { useDialogFocus } from './useDialogFocus';
import { useLockBodyScroll } from './useLockBodyScroll';

interface Props {
  menu: MenuSection[];
  lines: CartLine[];
  form: OrderForm;
  onFormChange(form: OrderForm): void;
  whatsappNumber?: string;
  deliveryFee?: Colones;
  onSetQuantity(index: number, quantity: number): void;
  onSetNote(index: number, note: string): void;
  onClear(): void;
  onClose(): void;
}

const ORDER_TYPES = Object.keys(ORDER_TYPE_LABEL) as OrderType[];
const PAYMENTS = Object.keys(PAYMENT_LABEL) as PaymentMethod[];

export function OrderView(props: Props) {
  const { menu, lines, form, onFormChange, whatsappNumber, deliveryFee } = props;
  const [submitted, setSubmitted] = useState(false);
  const [askSent, setAskSent] = useState(false);
  const [focusErrors, setFocusErrors] = useState(0);
  const orderRef = useRef<HTMLDivElement>(null);
  const typeErrorId = useId();
  const paymentErrorId = useId();
  useLockBodyScroll();
  useDialogFocus(orderRef, props.onClose);

  // Después de un envío con datos faltantes, el foco va al primer campo marcado.
  useEffect(() => {
    if (focusErrors === 0) return;
    orderRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"], fieldset[aria-invalid="true"] input')
      ?.focus();
  }, [focusErrors]);

  const errors: FormErrors = submitted ? validateOrderForm(form) : {};
  const fee = deliveryFeeFor(form, deliveryFee);
  const warnings = orderWarnings(menu, lines, form, deliveryFee);

  function update<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    onFormChange({ ...form, [key]: value });
  }

  function handleSend() {
    setSubmitted(true);
    if (hasErrors(validateOrderForm(form))) {
      setFocusErrors((n) => n + 1);
      return;
    }
    if (!whatsappNumber || lines.length === 0) return;
    const message = buildOrderMessage(menu, lines, form, deliveryFee);
    window.open(buildWhatsAppUrl(whatsappNumber, message), '_blank', 'noopener');
    setAskSent(true);
  }

  return (
    <div className="order" ref={orderRef} role="dialog" aria-modal="true" aria-label="Tu pedido">
      <div className="order__inner">
        <div className="order__header">
          <h2 className="order__title">Tu pedido</h2>
          <button type="button" className="sheet__close" onClick={props.onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="empty">
            <p>Tu pedido está vacío.</p>
            <button type="button" className="btn btn--outline" onClick={props.onClose}>
              Ver menú
            </button>
          </div>
        ) : (
          <>
            {lines.map((line, index) => (
              <OrderLine
                // El índice como key mantiene el foco en la nota mientras se escribe.
                key={index}
                menu={menu}
                line={line}
                onSetQuantity={(q) => props.onSetQuantity(index, q)}
                onSetNote={(n) => props.onSetNote(index, n)}
              />
            ))}

            {fee !== undefined && (
              <div className="order__row">
                <span>Envío</span>
                <span>{formatColones(fee)}</span>
              </div>
            )}
            <div className="order__total">
              <span>Total</span>
              <span>{formatColones(orderTotal(menu, lines, form, deliveryFee))}</span>
            </div>
            {warnings.map((w) => (
              <p key={w} className="order__warning">
                {w}
              </p>
            ))}

            <Field label="Nombre" error={errors.name}>
              {(id, describedBy) => (
                <input
                  id={id}
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy}
                  onChange={(e) => update('name', e.target.value)}
                />
              )}
            </Field>

            <fieldset
              className="option-group"
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? typeErrorId : undefined}
            >
              <legend>Tipo de pedido</legend>
              <div className="choice-row">
                {ORDER_TYPES.map((type) => (
                  <label key={type} className="option">
                    <input
                      type="radio"
                      name="order-type"
                      checked={form.type === type}
                      onChange={() => update('type', type)}
                    />
                    <span className="option__label">{ORDER_TYPE_LABEL[type]}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="field__error" id={typeErrorId}>
                  {errors.type}
                </p>
              )}
            </fieldset>

            {form.type === 'express' && (
              <>
                <Field label="Dirección" error={errors.address}>
                  {(id, describedBy) => (
                    <textarea
                      id={id}
                      rows={2}
                      autoComplete="street-address"
                      value={form.address}
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={describedBy}
                      onChange={(e) => update('address', e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Referencia (opcional)">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      placeholder="Ej.: portón negro"
                      value={form.reference}
                      onChange={(e) => update('reference', e.target.value)}
                    />
                  )}
                </Field>
              </>
            )}

            {form.type === 'recoger' && (
              <Field label="Hora a la que pasas (opcional)">
                {(id) => (
                  <input id={id} type="time" value={form.pickupTime} onChange={(e) => update('pickupTime', e.target.value)} />
                )}
              </Field>
            )}

            <fieldset
              className="option-group"
              aria-invalid={Boolean(errors.payment)}
              aria-describedby={errors.payment ? paymentErrorId : undefined}
            >
              <legend>Método de pago</legend>
              <div className="choice-row">
                {PAYMENTS.map((payment) => (
                  <label key={payment} className="option">
                    <input
                      type="radio"
                      name="payment"
                      checked={form.payment === payment}
                      onChange={() => update('payment', payment)}
                    />
                    <span className="option__label">{PAYMENT_LABEL[payment]}</span>
                  </label>
                ))}
              </div>
              {errors.payment && (
                <p className="field__error" id={paymentErrorId}>
                  {errors.payment}
                </p>
              )}
            </fieldset>

            <Field label="Comentario (opcional)">
              {(id) => (
                <textarea id={id} rows={2} value={form.comment} onChange={(e) => update('comment', e.target.value)} />
              )}
            </Field>

            <div role="alert">
              {hasErrors(errors) && <p className="field__error">Faltan datos. Revisa lo marcado en rojo.</p>}
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block order__send"
              disabled={!whatsappNumber}
              onClick={handleSend}
            >
              {whatsappNumber ? 'Enviar por WhatsApp' : 'Número pendiente'}
            </button>
          </>
        )}
      </div>

      {askSent && (
        <SentDialog
          onConfirm={() => {
            props.onClear();
            props.onClose();
          }}
          onBack={() => setAskSent(false)}
        />
      )}
    </div>
  );
}

interface SentDialogProps {
  onConfirm(): void;
  onBack(): void;
}

function SentDialog({ onConfirm, onBack }: SentDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  useDialogFocus(dialogRef, onBack, backRef);

  return (
    <div className="backdrop backdrop--center">
      <div className="dialog" ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="sent-title">
        <h3 id="sent-title">¿Ya enviaste tu pedido?</h3>
        <p className="item-card__description">Si WhatsApp no se abrió, vuelve al pedido e inténtalo de nuevo.</p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            Sí, vaciar carrito
          </button>
          <button type="button" className="btn btn--outline" ref={backRef} onClick={onBack}>
            No, volver al pedido
          </button>
        </div>
      </div>
    </div>
  );
}

interface OrderLineProps {
  menu: MenuSection[];
  line: CartLine;
  onSetQuantity(quantity: number): void;
  onSetNote(note: string): void;
}

function OrderLine({ menu, line, onSetQuantity, onSetNote }: OrderLineProps) {
  const noteId = useId();
  const resolved = resolveLine(menu, line);
  if (!resolved) return null;
  const details = [resolved.size?.label, line.choice, ...resolved.extras.map((e) => `+ ${e.label}`)].filter(Boolean);
  const name = resolved.item.name;

  return (
    <div className="order-line">
      <div className="order-line__top">
        <span>{name}</span>
        <span>{formatColones(lineTotal(menu, line))}</span>
      </div>
      {details.length > 0 && <p className="order-line__details">{details.join(' · ')}</p>}
      <div className="order-line__actions">
        <div className="qty">
          <button type="button" aria-label={`Restar uno de ${name}`} onClick={() => onSetQuantity(line.quantity - 1)}>
            −
          </button>
          <span aria-live="polite">{line.quantity}</span>
          <button type="button" aria-label={`Sumar uno de ${name}`} onClick={() => onSetQuantity(line.quantity + 1)}>
            +
          </button>
        </div>
        <button type="button" className="link-btn" aria-label={`Quitar ${name}`} onClick={() => onSetQuantity(0)}>
          Quitar
        </button>
      </div>
      <div className="field">
        <label className="field__label" htmlFor={noteId}>
          {resolved.section.hasUnpricedExtras ? 'Nota (adicionales: te confirmamos el precio)' : 'Nota'}
        </label>
        <textarea id={noteId} rows={1} value={line.note ?? ''} onChange={(e) => onSetNote(e.target.value)} />
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children(id: string, describedBy: string | undefined): ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children(id, error ? errorId : undefined)}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
