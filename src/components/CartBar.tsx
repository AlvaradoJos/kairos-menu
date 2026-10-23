import { formatColones } from '../features/menu/price';
import type { Colones } from '../features/menu/types';

interface Props {
  count: number;
  total: Colones;
  onOpen(): void;
}

export function CartBar({ count, total, onOpen }: Props) {
  return (
    <button type="button" className="cart-bar" onClick={onOpen}>
      <span>
        {count} {count === 1 ? 'platillo' : 'platillos'} · {formatColones(total)}
      </span>
      <span>Ver pedido</span>
    </button>
  );
}
