import { useState } from 'react';
import { CartBar } from './components/CartBar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ItemSheet } from './components/ItemSheet';
import { MenuSectionView } from './components/MenuSectionView';
import { OrderView } from './components/OrderView';
import { SectionNav } from './components/SectionNav';
import { config } from './config';
import { MENU } from './data/menu';
import { useCart } from './features/cart/useCart';
import { hasOptions } from './features/menu/price';
import type { MenuItem } from './features/menu/types';
import { EMPTY_FORM, type OrderForm } from './features/order-form/validation';

export default function App() {
  const cart = useCart(MENU);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);

  function handleAdd(item: MenuItem) {
    if (hasOptions(item)) {
      setSelected(item);
    } else {
      cart.add({ itemId: item.id, extraIds: [], quantity: 1 });
    }
  }

  return (
    <>
      <Header whatsappNumber={config.whatsappNumber} />
      <SectionNav sections={MENU} />
      <main className="menu" id="menu">
        {MENU.map((section) => (
          <MenuSectionView key={section.id} section={section} onAdd={handleAdd} />
        ))}
      </main>
      <Footer config={config} />
      {cart.count > 0 && !orderOpen && (
        <CartBar count={cart.count} total={cart.total} onOpen={() => setOrderOpen(true)} />
      )}
      {selected && (
        <ItemSheet
          menu={MENU}
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={(line) => {
            cart.add(line);
            setSelected(null);
          }}
        />
      )}
      {orderOpen && (
        <OrderView
          menu={MENU}
          lines={cart.lines}
          form={form}
          onFormChange={setForm}
          whatsappNumber={config.whatsappNumber}
          deliveryFee={config.deliveryFee}
          onSetQuantity={cart.setQuantity}
          onSetNote={cart.setNote}
          onClear={cart.clear}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </>
  );
}
