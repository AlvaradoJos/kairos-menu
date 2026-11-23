import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  mapsLink,
  requestLocation,
  type GeoPoint,
  type LocationError,
} from '../features/location/location';
import { lineTotal, resolveLine, type CartLine } from '../features/cart/cart';
import { formatColones } from '../features/menu/price';
import type { Colones, MenuSection } from '../features/menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings, warningText } from '../features/order-form/totals';
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
import { useLanguage } from '../i18n/LanguageContext';
import { choiceOption, extraLabel, sizeLabel } from '../i18n/menuText';
import { Icon } from './Icon';
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
  const { lang, t } = useLanguage();
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

  // El GPS puede tardar varios segundos: al volver, el cambio se aplica sobre el formulario de ese momento.
  const formRef = useRef(form);
  formRef.current = form;

  function update<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    onFormChange({ ...formRef.current, [key]: value });
  }

  function handleSend() {
    setSubmitted(true);
    if (hasErrors(validateOrderForm(form))) {
      setFocusErrors((n) => n + 1);
      return;
    }
    if (!whatsappNumber || lines.length === 0) return;
    const message = buildOrderMessage(menu, lines, form, deliveryFee, lang);
    window.open(buildWhatsAppUrl(whatsappNumber, message), '_blank', 'noopener');
    setAskSent(true);
  }

  return (
    <div className="order" ref={orderRef} role="dialog" aria-modal="true" aria-label={t.order.title}>
      <div className="order__inner">
        <div className="order__header">
          <h2 className="order__title">{t.order.title}</h2>
          <button type="button" className="sheet__close" onClick={props.onClose} aria-label={t.order.close}>
            <Icon name="close" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="empty">
            <p>{t.order.empty}</p>
            <button type="button" className="btn btn--outline" onClick={props.onClose}>
              {t.order.viewMenu}
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
                <span>{t.order.delivery}</span>
                <span>{formatColones(fee)}</span>
              </div>
            )}
            <div className="order__total">
              <span>{t.order.total}</span>
              <span>{formatColones(orderTotal(menu, lines, form, deliveryFee))}</span>
            </div>
            {warnings.map((warning) => (
              <p key={warning.kind} className="order__warning">
                {warningText(warning, t)}
              </p>
            ))}

            <Field label={t.order.name} error={errors.name && t.errors[errors.name]}>
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
              <legend>{t.order.orderType}</legend>
              <div className="choice-row">
                {ORDER_TYPES.map((type) => (
                  <label key={type} className="option">
                    <input
                      type="radio"
                      name="order-type"
                      checked={form.type === type}
                      onChange={() => update('type', type)}
                    />
                    <span className="option__label">{t.order.types[type]}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="field__error" id={typeErrorId}>
                  {t.errors[errors.type]}
                </p>
              )}
            </fieldset>

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
                      onChange={(e) => update('address', e.target.value)}
                    />
                  )}
                </Field>
                <LocationField value={form.location} onChange={(location) => update('location', location)} />
                <Field label={t.order.reference}>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      placeholder={t.order.referencePlaceholder}
                      value={form.reference}
                      onChange={(e) => update('reference', e.target.value)}
                    />
                  )}
                </Field>
              </>
            )}

            {form.type === 'recoger' && (
              <Field label={t.order.pickupTime}>
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
              <legend>{t.order.payment}</legend>
              <div className="choice-row">
                {PAYMENTS.map((payment) => (
                  <label key={payment} className="option">
                    <input
                      type="radio"
                      name="payment"
                      checked={form.payment === payment}
                      onChange={() => update('payment', payment)}
                    />
                    <span className="option__label">{t.order.payments[payment]}</span>
                  </label>
                ))}
              </div>
              {errors.payment && (
                <p className="field__error" id={paymentErrorId}>
                  {t.errors[errors.payment]}
                </p>
              )}
            </fieldset>

            <Field label={t.order.comment}>
              {(id) => (
                <textarea id={id} rows={2} value={form.comment} onChange={(e) => update('comment', e.target.value)} />
              )}
            </Field>

            <div role="alert">
              {hasErrors(errors) && <p className="field__error">{t.order.missingData}</p>}
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block order__send"
              disabled={!whatsappNumber}
              onClick={handleSend}
            >
              {whatsappNumber ? t.order.send : t.order.numberPending}
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
  const { t } = useLanguage();

  return (
    <div className="backdrop backdrop--center">
      <div className="dialog" ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="sent-title">
        <h3 id="sent-title">{t.sent.title}</h3>
        <p className="item-card__description">{t.sent.body}</p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            {t.sent.confirm}
          </button>
          <button type="button" className="btn btn--outline" ref={backRef} onClick={onBack}>
            {t.sent.back}
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
  const { lang, t } = useLanguage();
  const resolved = resolveLine(menu, line);
  if (!resolved) return null;

  // Detalles en el idioma de la página: tamaño, opción y adicionales.
  const details: string[] = [];
  if (resolved.size) details.push(sizeLabel(resolved.size, lang));
  if (line.choice && resolved.item.choice) details.push(choiceOption(resolved.item.choice, line.choice, lang));
  for (const extra of resolved.extras) details.push(`+ ${extraLabel(extra, lang)}`);
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
          <button type="button" aria-label={t.line.minusOne(name)} onClick={() => onSetQuantity(line.quantity - 1)}>
            <Icon name="minus" />
          </button>
          <span aria-live="polite">{line.quantity}</span>
          <button type="button" aria-label={t.line.plusOne(name)} onClick={() => onSetQuantity(line.quantity + 1)}>
            <Icon name="plus" />
          </button>
        </div>
        <button type="button" className="link-btn" aria-label={t.line.removeLabel(name)} onClick={() => onSetQuantity(0)}>
          {t.line.remove}
        </button>
      </div>
      <div className="field">
        <label className="field__label" htmlFor={noteId}>
          {resolved.section.hasUnpricedExtras ? t.line.noteUnpricedExtras : t.line.note}
        </label>
        <textarea id={noteId} rows={1} value={line.note ?? ''} onChange={(e) => onSetNote(e.target.value)} />
      </div>
    </div>
  );
}

interface LocationFieldProps {
  value: GeoPoint | null;
  onChange(location: GeoPoint | null): void;
}

/** Botón opcional para mandar el punto exacto. Jose lo usa para calcular el envío; la dirección sigue siendo obligatoria. */
function LocationField({ value, onChange }: LocationFieldProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const { t } = useLanguage();

  async function share() {
    setLoading(true);
    setError(null);
    try {
      onChange(await requestLocation());
    } catch (reason) {
      setError(reason as LocationError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="field location">
      <span className="field__label">{t.location.label}</span>
      {value ? (
        <div className="location__ready">
          <span className="location__status">
            <Icon name="pin" />
            {t.location.ready}
          </span>
          <a href={mapsLink(value)} target="_blank" rel="noopener noreferrer" className="link-btn">
            {t.location.viewMap}
          </a>
          <button type="button" className="link-btn" onClick={() => onChange(null)}>
            {t.location.remove}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--outline btn--block" onClick={share} disabled={loading}>
          <Icon name="pin" />
          {loading ? t.location.searching : t.location.share}
        </button>
      )}
      <p className="field__hint" aria-live="polite">
        {error ? t.location.errors[error] : t.location.hint}
      </p>
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
