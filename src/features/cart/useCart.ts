// Hook del carrito para React. Lo usa App. La lógica vive en cart.ts y el guardado en storage.ts.

import { useEffect, useState } from 'react';
import type { MenuSection } from '../menu/types';
import { addLine, cartTotal, itemCount, setNote, setQuantity, type CartLine } from './cart';
import { browserStore, loadCart, saveCart } from './storage';

/** Estado del carrito, guardado en localStorage en cada cambio, con sus acciones y totales. */
export function useCart(menu: MenuSection[]) {
  // useState con función: el almacenamiento se abre y el carrito se lee una sola vez, al montar.
  const [store] = useState(browserStore);
  const [lines, setLines] = useState(() => loadCart(store, menu));

  useEffect(() => {
    saveCart(store, lines);
  }, [store, lines]);

  return {
    lines,
    total: cartTotal(menu, lines),
    count: itemCount(lines),
    add: (line: CartLine) => setLines((current) => addLine(current, line)),
    setQuantity: (index: number, quantity: number) => setLines((current) => setQuantity(current, index, quantity)),
    setNote: (index: number, note: string) => setLines((current) => setNote(current, index, note)),
    clear: () => setLines([]),
  };
}
