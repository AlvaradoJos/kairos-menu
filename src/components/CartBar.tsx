// Barra fija abajo con la cantidad de platillos y el total. Al tocarla se abre el pedido.
// La usa App cuando el carrito tiene algo; el total lo calcula useCart, no este componente.

import { formatColones } from '../features/menu/price';
import type { Colones } from '../features/menu/types';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  count: number;
  total: Colones;
  /** Hay platillos con precio por confirmar: el total es aproximado. */
  hasPending: boolean;
  onOpen(): void;
}

/** Resumen del carrito: "2 platillos · ₡5.000" y "Ver pedido". */
export function CartBar({ count, total, hasPending, onOpen }: Props) {
  const { t } = useLanguage();
  return (
    <button type="button" className="cart-bar" onClick={onOpen}>
      <span>
        {t.cartBar.items(count)} · {hasPending && `${t.cartBar.approx} `}
        {formatColones(total)}
      </span>
      <span>{t.cartBar.viewOrder}</span>
    </button>
  );
}
