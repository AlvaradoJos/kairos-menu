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
import { resolveLine } from './features/cart/cart';
import { useCart } from './features/cart/useCart';
import { hasOptions } from './features/menu/price';
import type { MenuItem } from './features/menu/types';
import { EMPTY_FORM, type OrderForm } from './features/order-form/validation';

export default function App() {
  const cart = useCart(MENU);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [announcement, setAnnouncement] = useState('');
  const hasPending = cart.lines.some((line) => resolveLine(MENU, line)?.item.pending);

  // Un espacio duro alterno hace que el lector de pantalla repita el aviso del mismo platillo.
  function announce(name: string) {
    setAnnouncement((previous) => `Agregado: ${name}${previous.endsWith('\u00A0') ? '' : '\u00A0'}`);
  }

  function handleAdd(item: MenuItem) {
    if (hasOptions(item)) {
      setSelected(item);
    } else {
      cart.add({ itemId: item.id, extraIds: [], quantity: 1 });
      announce(item.name);
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
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      {cart.count > 0 && !orderOpen && (
        <CartBar count={cart.count} total={cart.total} hasPending={hasPending} onOpen={() => setOrderOpen(true)} />
      )}
      {selected && (
        <ItemSheet
          menu={MENU}
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={(line) => {
            cart.add(line);
            announce(selected.name);
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
