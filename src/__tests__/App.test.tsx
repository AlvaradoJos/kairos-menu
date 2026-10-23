// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('App', () => {
  it('anuncia el platillo agregado con el botón +', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Agregar Típico' }));
    expect(screen.getByRole('status').textContent).toBe('Agregado: Típico');
  });

  it('marca el total del carrito como aproximado con un precio por confirmar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Agregar La Rascacielos' }));
    await user.click(screen.getByRole('button', { name: /^Agregar · / }));
    expect(screen.getByRole('button', { name: /Ver pedido/ }).textContent).toContain('aprox. ₡3.800');
    expect(screen.getByRole('status').textContent).toBe('Agregado: La Rascacielos');
  });
});
