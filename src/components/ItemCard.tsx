import { displayPrice } from '../features/menu/price';
import type { MenuItem } from '../features/menu/types';

interface Props {
  item: MenuItem;
  onAdd(item: MenuItem): void;
}

export function ItemCard({ item, onAdd }: Props) {
  return (
    <article className="item-card">
      <div>
        <h3 className="item-card__name">{item.name}</h3>
        {item.description && <p className="item-card__description">{item.description}</p>}
      </div>
      <div className="item-card__side">
        <span className="price-pill">{displayPrice(item)}</span>
        {item.pending && <span className="price-pending">Precio por confirmar</span>}
        <button type="button" className="add-btn" onClick={() => onAdd(item)} aria-label={`Agregar ${item.name}`}>
          +
        </button>
      </div>
    </article>
  );
}
