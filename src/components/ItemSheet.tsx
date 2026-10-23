import { useEffect, useId, useState } from 'react';
import { lineTotal, type CartLine } from '../features/cart/cart';
import { formatColones } from '../features/menu/price';
import type { MenuItem, MenuSection } from '../features/menu/types';
import { useLockBodyScroll } from './useLockBodyScroll';

interface Props {
  menu: MenuSection[];
  item: MenuItem;
  onAdd(line: CartLine): void;
  onClose(): void;
}

export function ItemSheet({ menu, item, onAdd, onClose }: Props) {
  const titleId = useId();
  const noteId = useId();
  const [sizeId, setSizeId] = useState(item.sizes?.[0]?.id);
  const [choice, setChoice] = useState(item.choice?.options[0]);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  useLockBodyScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const line: CartLine = { itemId: item.id, sizeId, choice, extraIds, note, quantity };
  const total = lineTotal(menu, line);

  function toggleExtra(id: string) {
    setExtraIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="sheet"
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
            {item.description && <p className="item-card__description">{item.description}</p>}
            {item.pending && <p className="price-pending price-pending--block">Precio por confirmar con el restaurante</p>}
          </div>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {item.sizes && (
          <fieldset className="option-group">
            <legend>Tamaño</legend>
            {item.sizes.map((size) => (
              <label key={size.id} className="option">
                <input
                  type="radio"
                  name="size"
                  checked={sizeId === size.id}
                  onChange={() => setSizeId(size.id)}
                />
                <span className="option__label">{size.label}</span>
                <span className="option__price">{formatColones(size.price)}</span>
              </label>
            ))}
          </fieldset>
        )}

        {item.choice && (
          <fieldset className="option-group">
            <legend>{item.choice.label}</legend>
            {item.choice.options.map((option) => (
              <label key={option} className="option">
                <input type="radio" name="choice" checked={choice === option} onChange={() => setChoice(option)} />
                <span className="option__label">{option}</span>
              </label>
            ))}
          </fieldset>
        )}

        {item.extras && item.extras.length > 0 && (
          <fieldset className="option-group">
            <legend>Adicionales</legend>
            {item.extras.map((extra) => (
              <label key={extra.id} className="option">
                <input type="checkbox" checked={extraIds.includes(extra.id)} onChange={() => toggleExtra(extra.id)} />
                <span className="option__label">{extra.label}</span>
                <span className="option__price">+{formatColones(extra.price)}</span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="field">
          <label className="field__label" htmlFor={noteId}>
            Notas
          </label>
          <textarea
            id={noteId}
            rows={2}
            placeholder="Ej.: sin cebolla"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="sheet__footer">
          <div className="qty">
            <button
              type="button"
              aria-label="Restar uno"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" aria-label="Sumar uno" onClick={() => setQuantity((q) => q + 1)}>
              +
            </button>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => onAdd(line)}>
            Agregar · {formatColones(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
