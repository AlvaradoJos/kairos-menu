// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MENU } from '../../data/menu';
import { setNote, setQuantity, type CartLine } from '../../features/cart/cart';
import { EMPTY_FORM, type OrderForm } from '../../features/order-form/validation';
import { OrderView } from '../OrderView';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const LINES: CartLine[] = [{ itemId: 'bacon-cheese', choice: 'Pechuga de pollo', extraIds: ['papas'], quantity: 1 }];

interface HarnessProps {
  whatsappNumber?: string;
  deliveryFee?: number;
  onClear?: () => void;
  onClose?: () => void;
}

function Harness({ whatsappNumber, deliveryFee, onClear = () => {}, onClose = () => {} }: HarnessProps) {
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [lines, setLines] = useState<CartLine[]>(LINES);
  return (
    <OrderView
      menu={MENU}
      lines={lines}
      form={form}
      onFormChange={setForm}
      whatsappNumber={whatsappNumber}
      deliveryFee={deliveryFee}
      onSetQuantity={(i, q) => setLines((c) => setQuantity(c, i, q))}
      onSetNote={(i, n) => setLines((c) => setNote(c, i, n))}
      onClear={onClear}
      onClose={onClose}
    />
  );
}

describe('OrderView', () => {
  it('muestra el platillo y el total', () => {
    render(<Harness whatsappNumber="50688887777" />);
    expect(screen.getByText('Bacon & Chesse')).toBeTruthy();
    expect(screen.getByText('Total').nextSibling?.textContent).toBe('₡5.000');
  });

  it('marca los campos faltantes y no abre WhatsApp', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Harness whatsappNumber="50688887777" />);

    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));

    expect(screen.getByText('Falta el nombre')).toBeTruthy();
    expect(screen.getByText('Falta el tipo de pedido')).toBeTruthy();
    expect(screen.getByText('Falta el método de pago')).toBeTruthy();
    expect(open).not.toHaveBeenCalled();
  });

  it('pide dirección solo si es express', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" />);
    expect(screen.queryByLabelText('Dirección')).toBeNull();
    await user.click(screen.getByLabelText('Express'));
    expect(screen.getByLabelText('Dirección')).toBeTruthy();
    expect(screen.getByText('Costo de envío por confirmar')).toBeTruthy();
    await user.click(screen.getByLabelText('Para recoger'));
    expect(screen.queryByLabelText('Dirección')).toBeNull();
    expect(screen.getByLabelText('Hora a la que pasas (opcional)')).toBeTruthy();
  });

  it('abre WhatsApp con el pedido y pregunta si se envió', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClear = vi.fn();
    const onClose = vi.fn();
    render(<Harness whatsappNumber="+506 8888-7777" onClear={onClear} onClose={onClose} />);

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByLabelText('Para recoger'));
    await user.click(screen.getByLabelText('Efectivo'));
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = open.mock.calls[0][0] as string;
    expect(url.startsWith('https://wa.me/50688887777?text=')).toBe(true);
    const text = decodeURIComponent(url.split('?text=')[1]);
    expect(text).toContain('1× Bacon & Chesse (Pechuga de pollo) — ₡3.800');
    expect(text).toContain('Nombre: Ana');
    expect(text).toContain('Pago: Efectivo');

    expect(screen.getByText('¿Ya enviaste tu pedido?')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sí, vaciar carrito' }));
    expect(onClear).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('"No, volver al pedido" no vacía el carrito', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClear = vi.fn();
    render(<Harness whatsappNumber="50688887777" onClear={onClear} />);

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByLabelText('Para recoger'));
    await user.click(screen.getByLabelText('Efectivo'));
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));
    await user.click(screen.getByRole('button', { name: 'No, volver al pedido' }));

    expect(onClear).not.toHaveBeenCalled();
    expect(screen.queryByText('¿Ya enviaste tu pedido?')).toBeNull();
    expect(screen.getByText('Bacon & Chesse')).toBeTruthy();
  });

  it('pone el foco dentro al abrir y se cierra con Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness whatsappNumber="50688887777" onClose={onClose} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cerrar' }));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('anuncia los datos que faltan y lleva el foco al primer campo', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" />);
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));
    expect(screen.getByRole('alert').textContent).toBe('Faltan datos. Revisa lo marcado en rojo.');
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre'));
    expect(screen.getByRole('group', { name: 'Tipo de pedido' }).getAttribute('aria-describedby')).toBeTruthy();
  });

  it('la pregunta de envío recibe el foco y Escape la cierra sin vaciar', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClear = vi.fn();
    const onClose = vi.fn();
    render(<Harness whatsappNumber="50688887777" onClear={onClear} onClose={onClose} />);
    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByLabelText('Para recoger'));
    await user.click(screen.getByLabelText('Efectivo'));
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'No, volver al pedido' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByText('¿Ya enviaste tu pedido?')).toBeNull();
    expect(onClear).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sin número de WhatsApp el botón queda desactivado', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Número pendiente' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('suma el envío al total cuando hay costo y es express', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" deliveryFee={1000} />);
    await user.click(screen.getByLabelText('Express'));
    expect(screen.getByText('Envío').nextSibling?.textContent).toBe('₡1.000');
    expect(screen.getByText('Total').nextSibling?.textContent).toBe('₡6.000');
  });

  it('quitar el único platillo muestra el pedido vacío', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" />);
    await user.click(screen.getByRole('button', { name: 'Quitar Bacon & Chesse' }));
    expect(screen.getByText('Tu pedido está vacío.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Enviar por WhatsApp' })).toBeNull();
  });
});
