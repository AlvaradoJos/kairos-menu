// Una línea del carrito dentro de "Tu pedido": nombre, detalles, precio, cantidad y nota.
// La usa OrderView, una por cada línea. El precio lo calcula lineTotal (features/cart), no este componente.

import { useId } from 'react';
import { lineTotal, resolveLine, type CartLine } from '../../features/cart/cart';
import { formatColones } from '../../features/menu/price';
import type { MenuSection } from '../../features/menu/types';
import { useLanguage } from '../../i18n/LanguageContext';
import { choiceOption, extraLabel, sizeLabel } from '../../i18n/menuText';
import { Icon } from '../Icon';

interface Props {
  menu: MenuSection[];
  line: CartLine;
  onSetQuantity(quantity: number): void;
  onSetNote(note: string): void;
}

/** Línea editable del pedido. Si la línea ya no existe en el menú (resolveLine da null), no se dibuja. */
export function OrderLine({ menu, line, onSetQuantity, onSetNote }: Props) {
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
          {/* Bajar de 1 a 0 quita la línea (setQuantity en features/cart). */}
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
