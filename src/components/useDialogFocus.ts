// Manejo del foco de las ventanas modales (platillo, pedido y '¿Ya enviaste?'), para usar con teclado
// y lector de pantalla. Lo usan ItemSheet, OrderView y SentDialog.

import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Foco de una ventana modal: entra al abrir (al primer control o a `initialFocus`),
 * se queda dentro con Tab, Escape la cierra y al cerrar vuelve a donde estaba.
 */
export function useDialogFocus(
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current ?? containerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
    // Solo al montar y desmontar la ventana.
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      // Foco atrapado: con el teclado, Tab desde el último control vuelve al primero (y Shift+Tab al revés).
      // Sin esto, el foco se iría a la página de atrás, que el cliente no ve mientras la ventana está abierta.
      if (e.key !== 'Tab') return;
      const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  }, [containerRef, onClose]);
}
