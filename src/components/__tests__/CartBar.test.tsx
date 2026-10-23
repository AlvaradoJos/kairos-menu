// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CartBar } from '../CartBar';

afterEach(cleanup);

describe('CartBar', () => {
  it('muestra cantidad y total', () => {
    render(<CartBar count={2} total={6800} hasPending={false} onOpen={() => {}} />);
    expect(screen.getByRole('button').textContent).toBe('2 platillos · ₡6.800Ver pedido');
  });

  it('marca el total como aproximado si hay precios por confirmar', () => {
    render(<CartBar count={1} total={3800} hasPending onOpen={() => {}} />);
    expect(screen.getByRole('button').textContent).toBe('1 platillo · aprox. ₡3.800Ver pedido');
  });
});
