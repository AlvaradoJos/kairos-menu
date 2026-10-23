// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MENU } from '../../data/menu';
import type { MenuItem } from '../../features/menu/types';
import { ItemSheet } from '../ItemSheet';

afterEach(cleanup);

function item(id: string): MenuItem {
  const found = MENU.flatMap((s) => s.items).find((i) => i.id === id);
  if (!found) throw new Error(`no existe ${id}`);
  return found;
}

describe('ItemSheet', () => {
  it('actualiza el precio con el tamaño y la cantidad, y agrega la línea', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemSheet menu={MENU} item={item('papipollo')} onAdd={onAdd} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Agregar · ₡3.000' })).toBeTruthy();
    await user.click(screen.getByLabelText(/Grande/));
    await user.click(screen.getByRole('button', { name: 'Sumar uno' }));
    await user.click(screen.getByRole('button', { name: 'Agregar · ₡10.000' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: 'papipollo', sizeId: 'grande', extraIds: [], quantity: 2 }),
    );
  });

  it('elige proteína y suma adicionales', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemSheet menu={MENU} item={item('bacon-cheese')} onAdd={onAdd} onClose={() => {}} />);

    await user.click(screen.getByLabelText('Pechuga de pollo'));
    await user.click(screen.getByLabelText(/Papas fritas/));
    await user.type(screen.getByLabelText('Notas'), 'sin tomate');
    await user.click(screen.getByRole('button', { name: 'Agregar · ₡5.000' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 'bacon-cheese',
        choice: 'Pechuga de pollo',
        extraIds: ['papas'],
        note: 'sin tomate',
        quantity: 1,
      }),
    );
  });

  it('no deja bajar la cantidad de 1', async () => {
    const user = userEvent.setup();
    render(<ItemSheet menu={MENU} item={item('papipollo')} onAdd={() => {}} onClose={() => {}} />);
    const minus = screen.getByRole('button', { name: 'Restar uno' }) as HTMLButtonElement;
    expect(minus.disabled).toBe(true);
    await user.click(minus);
    expect(screen.getByRole('button', { name: 'Agregar · ₡3.000' })).toBeTruthy();
  });

  it('se cierra con Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ItemSheet menu={MENU} item={item('papipollo')} onAdd={() => {}} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('avisa cuando el precio está por confirmar', () => {
    render(<ItemSheet menu={MENU} item={item('la-rascacielos')} onAdd={() => {}} onClose={() => {}} />);
    expect(screen.getByText('Precio por confirmar con el restaurante')).toBeTruthy();
  });
});
