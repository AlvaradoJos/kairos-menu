import { formatColones } from '../features/menu/price';
import type { Colones } from '../features/menu/types';

interface Props {
  count: number;
  total: Colones;
  /** Hay platillos con precio por confirmar: el total es aproximado. */
  hasPending: boolean;
  onOpen(): void;
}

export function CartBar({ count, total, hasPending, onOpen }: Props) {
  return (
    <button type="button" className="cart-bar" onClick={onOpen}>
      <span>
        {count} {count === 1 ? 'platillo' : 'platillos'} · {hasPending && 'aprox. '}
        {formatColones(total)}
      </span>
      <span>Ver pedido</span>
    </button>
  );
}
