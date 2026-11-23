// Ventana "Tu pedido": líneas del carrito, total, avisos, formulario y botón de WhatsApp.
// La abre App desde la barra del carrito. Los precios y el mensaje los calculan features/; aquí solo se muestran.

import { useEffect, useRef, useState } from 'react';
import type { CartLine } from '../../features/cart/cart';
import { formatColones } from '../../features/menu/price';
import type { Colones, MenuSection } from '../../features/menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings, warningText } from '../../features/order-form/totals';
import { hasErrors, validateOrderForm, type FormErrors, type OrderForm } from '../../features/order-form/validation';
import { buildOrderMessage, buildWhatsAppUrl } from '../../features/whatsapp/message';
import { useLanguage } from '../../i18n/LanguageContext';
import { Icon } from '../Icon';
import { useDialogFocus } from '../useDialogFocus';
import { useLockBodyScroll } from '../useLockBodyScroll';
import { OrderFormFields } from './OrderFormFields';
import { OrderLine } from './OrderLine';
import { SentDialog } from './SentDialog';

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

/**
 * Pantalla completa del pedido. Al tocar "Enviar por WhatsApp" valida el formulario; si falta algo marca
 * los campos y lleva el foco al primero. Si todo está bien abre WhatsApp y pregunta si ya se envió.
 */
export function OrderView(props: Props) {
  const { menu, lines, form, onFormChange, whatsappNumber, deliveryFee } = props;
  const { lang, t } = useLanguage();
  // Los errores se muestran solo después del primer intento de enviar, no mientras el cliente escribe.
  const [submitted, setSubmitted] = useState(false);
  const [askSent, setAskSent] = useState(false);
  const [focusErrors, setFocusErrors] = useState(0);
  const orderRef = useRef<HTMLDivElement>(null);
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

  // El GPS puede tardar varios segundos. Si el cliente escribe mientras tanto, la ubicación debe
  // sumarse al formulario de ese momento y no al de cuando tocó el botón: por eso se lee de una ref.
  const formRef = useRef(form);
  formRef.current = form;

  function update(changes: Partial<OrderForm>) {
    onFormChange({ ...formRef.current, ...changes });
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

            <OrderFormFields form={form} errors={errors} onChange={update} deliveryFee={deliveryFee} />

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
