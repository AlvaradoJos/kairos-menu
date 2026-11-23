// Tarjeta de un platillo en el menú: nombre, descripción, precio y botón "+".
// La usa MenuSectionView. Los datos vienen de MENU; los textos, del diccionario.

import { formatColones, startingPrice } from '../features/menu/price';
import type { MenuItem } from '../features/menu/types';
import { useLanguage } from '../i18n/LanguageContext';
import { itemDescription } from '../i18n/menuText';
import { Icon } from './Icon';

interface Props {
  item: MenuItem;
  onAdd(item: MenuItem): void;
}

/** Un platillo del menú con su botón para agregarlo. */
export function ItemCard({ item, onAdd }: Props) {
  const { lang, t } = useLanguage();
  const description = itemDescription(item, lang);
  const { amount, hasSizes } = startingPrice(item);
  const price = hasSizes ? t.menu.priceFrom(formatColones(amount)) : formatColones(amount);

  return (
    <article className="item-card">
      <div>
        <h3 className="item-card__name">{item.name}</h3>
        {description && <p className="item-card__description">{description}</p>}
      </div>
      <div className="item-card__side">
        <span className="price-pill">{price}</span>
        {item.pending && <span className="price-pending">{t.menu.pricePending}</span>}
        <button type="button" className="add-btn" onClick={() => onAdd(item)} aria-label={t.menu.add(item.name)}>
          <Icon name="plus" />
        </button>
      </div>
    </article>
  );
}
