// Ventana para escoger tamaño, opción, adicionales, notas y cantidad antes de agregar un platillo.
// La abre App al tocar "+" en un platillo con opciones. El total lo calcula lineTotal (carrito).

import { useId, useRef, useState } from 'react';
import { lineTotal, type CartLine } from '../features/cart/cart';
import { formatColones } from '../features/menu/price';
import type { MenuItem, MenuSection } from '../features/menu/types';
import { useLanguage } from '../i18n/LanguageContext';
import { choiceLabel, choiceOption, extraLabel, itemDescription, sizeLabel } from '../i18n/menuText';
import { Icon } from './Icon';
import { useDialogFocus } from './useDialogFocus';
import { useLockBodyScroll } from './useLockBodyScroll';

interface Props {
  menu: MenuSection[];
  item: MenuItem;
  onAdd(line: CartLine): void;
  onClose(): void;
}

/** Hoja que sube desde abajo con las opciones del platillo. Escape o tocar afuera la cierran. */
export function ItemSheet({ menu, item, onAdd, onClose }: Props) {
  const { lang, t } = useLanguage();
  const description = itemDescription(item, lang);
  const itemChoice = item.choice;
  const titleId = useId();
  const noteId = useId();
  const [sizeId, setSizeId] = useState(item.sizes?.[0]?.id);
  const [choice, setChoice] = useState(item.choice?.options[0]);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const sheetRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll();
  useDialogFocus(sheetRef, onClose);

  const line: CartLine = { itemId: item.id, sizeId, choice, extraIds, note, quantity };
  const total = lineTotal(menu, line);

  function toggleExtra(id: string) {
    setExtraIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__header">
          <div>
            <h2 className="sheet__title" id={titleId}>
              {item.name}
            </h2>
            {description && <p className="item-card__description">{description}</p>}
            {item.pending && <p className="price-pending price-pending--block">{t.sheet.pricePending}</p>}
          </div>
          <button type="button" className="sheet__close" onClick={onClose} aria-label={t.sheet.close}>
            <Icon name="close" />
          </button>
        </div>

        {item.sizes && (
          <fieldset className="option-group">
            <legend>{t.sheet.size}</legend>
            {item.sizes.map((size) => (
              <label key={size.id} className="option">
                <input
                  type="radio"
                  name="size"
                  checked={sizeId === size.id}
                  onChange={() => setSizeId(size.id)}
                />
                <span className="option__label">{sizeLabel(size, lang)}</span>
                <span className="option__price">{formatColones(size.price)}</span>
              </label>
            ))}
          </fieldset>
        )}

        {itemChoice && (
          <fieldset className="option-group">
            <legend>{choiceLabel(itemChoice, lang)}</legend>
            {/* Se guarda la opción en español (va así en el mensaje); solo se muestra traducida. */}
            {itemChoice.options.map((option) => (
              <label key={option} className="option">
                <input type="radio" name="choice" checked={choice === option} onChange={() => setChoice(option)} />
                <span className="option__label">{choiceOption(itemChoice, option, lang)}</span>
              </label>
            ))}
          </fieldset>
        )}

        {item.extras && item.extras.length > 0 && (
          <fieldset className="option-group">
            <legend>{t.sheet.extras}</legend>
            {item.extras.map((extra) => (
              <label key={extra.id} className="option">
                <input type="checkbox" checked={extraIds.includes(extra.id)} onChange={() => toggleExtra(extra.id)} />
                <span className="option__label">{extraLabel(extra, lang)}</span>
                <span className="option__price">+{formatColones(extra.price)}</span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="field">
          <label className="field__label" htmlFor={noteId}>
            {t.sheet.notes}
          </label>
          <textarea
            id={noteId}
            rows={2}
            placeholder={t.sheet.notesPlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="sheet__footer">
          <div className="qty">
            <button
              type="button"
              aria-label={t.sheet.minusOne}
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Icon name="minus" />
            </button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" aria-label={t.sheet.plusOne} onClick={() => setQuantity((q) => q + 1)}>
              <Icon name="plus" />
            </button>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => onAdd(line)}>
            {t.sheet.add(formatColones(total))}
          </button>
        </div>
      </div>
    </div>
  );
}
