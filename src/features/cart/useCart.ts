import { useEffect, useState } from 'react';
import type { MenuSection } from '../menu/types';
import * as Cart from './cart';
import { browserStore, loadCart, saveCart } from './storage';

export function useCart(menu: MenuSection[]) {
  const [store] = useState(browserStore);
  const [lines, setLines] = useState(() => loadCart(store, menu));

  useEffect(() => {
    saveCart(store, lines);
  }, [store, lines]);

  return {
    lines,
    total: Cart.cartTotal(menu, lines),
    count: Cart.itemCount(lines),
    add: (line: Cart.CartLine) => setLines((current) => Cart.addLine(current, line)),
    setQuantity: (index: number, quantity: number) => setLines((current) => Cart.setQuantity(current, index, quantity)),
    setNote: (index: number, note: string) => setLines((current) => Cart.setNote(current, index, note)),
    clear: () => setLines([]),
  };
}
