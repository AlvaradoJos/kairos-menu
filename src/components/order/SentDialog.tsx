// Diálogo "¿Ya enviaste tu pedido?" que sale después de abrir WhatsApp. Lo usa OrderView.
// El sitio no puede saber si el cliente de verdad envió el mensaje, por eso le pregunta antes de vaciar el carrito.

import { useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useDialogFocus } from '../useDialogFocus';

interface Props {
  onConfirm(): void;
  onBack(): void;
}

/**
 * Pregunta si ya se envió. El foco empieza en "No, volver al pedido", la opción que no borra nada,
 * para que un Enter sin querer no vacíe el carrito. Escape también vuelve al pedido.
 */
export function SentDialog({ onConfirm, onBack }: Props) {
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
