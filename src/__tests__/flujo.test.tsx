// @vitest-environment jsdom
// Pruebas funcionales de la app completa: el recorrido de punta a punta como lo hace un cliente.
// Número sintético: nunca usar el número real del negocio en pruebas.
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY } from '../features/cart/storage';

const TEST_NUMBER = '50600000000';

async function renderApp(number = TEST_NUMBER) {
  vi.resetModules();
  vi.stubEnv('VITE_WHATSAPP_NUMBER', number);
  const { default: App } = await import('../App');
  return render(<App />);
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

async function armarPedido(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Agregar Bacon & Chesse' }));
  const sheet = screen.getByRole('dialog', { name: 'Bacon & Chesse' });
  await user.click(within(sheet).getByLabelText('Pechuga de pollo'));
  await user.click(within(sheet).getByLabelText(/Papas fritas/));
  await user.click(within(sheet).getByRole('button', { name: 'Agregar · ₡5.000' }));

  await user.click(screen.getByRole('button', { name: 'Agregar Taco sencillo' }));
  await user.click(screen.getByRole('button', { name: 'Sumar uno' }));
  await user.click(screen.getByRole('button', { name: 'Agregar · ₡2.000' }));
}

// Recorridos largos sobre la app entera: escribir tecla por tecla tarda ~4 s solo y más con la suite en paralelo.
// El límite de 5 s de Vitest los hacía fallar de forma intermitente (D-05).
describe('Flujo completo', { timeout: 20_000 }, () => {
  it('menú → opciones → carrito → formulario → WhatsApp → vaciar', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    await renderApp();

    await armarPedido(user);
    const cartBar = screen.getByRole('button', { name: /Ver pedido/ });
    expect(cartBar.textContent).toContain('3 platillos');
    expect(cartBar.textContent).toContain('₡7.000');

    await user.click(cartBar);
    const order = screen.getByRole('dialog', { name: 'Tu pedido' });
    await user.type(within(order).getByLabelText('Nombre'), 'Ana');
    await user.click(within(order).getByLabelText('Express'));
    await user.type(within(order).getByLabelText('Dirección'), 'Barrio X, 200 m sur de la iglesia');
    await user.click(within(order).getByLabelText('SINPE Móvil'));
    await user.click(within(order).getByRole('button', { name: 'Enviar por WhatsApp' }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = new URL(open.mock.calls[0][0] as string);
    expect(url.searchParams.get('phone')).toBe(TEST_NUMBER);
    expect(url.searchParams.get('text')).toBe(
      [
        "¡Hola Kairos Food's! Quiero hacer un pedido",
        '',
        '1× Bacon & Chesse (Pechuga de pollo) — ₡3.800',
        '   + Papas fritas — ₡1.200',
        '2× Taco sencillo (Carne) — ₡2.000',
        '',
        'Total: ₡7.000',
        '',
        'Nombre: Ana',
        'Tipo: Express',
        'Dirección: Barrio X, 200 m sur de la iglesia',
        'Pago: SINPE Móvil',
        '',
        'Costo de envío por confirmar',
      ].join('\n'),
    );

    await user.click(screen.getByRole('button', { name: 'Sí, vaciar carrito' }));
    expect(screen.queryByRole('dialog', { name: 'Tu pedido' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Ver pedido/ })).toBeNull();
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null')).toEqual([]);
  });

  it('el carrito sigue ahí al volver a abrir el sitio', async () => {
    const user = userEvent.setup();
    const first = await renderApp();
    await user.click(screen.getByRole('button', { name: 'Agregar Típico' }));
    first.unmount();

    await renderApp();
    expect(screen.getByRole('button', { name: /Ver pedido/ }).textContent).toContain('1 platillo · ₡1.800');
  });

  it('un carrito guardado con un platillo que ya no existe se descarta sin romper la página', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { itemId: 'platillo-borrado', extraIds: [], quantity: 1 },
        { itemId: 'tipico', extraIds: [], quantity: 2 },
      ]),
    );
    await renderApp();
    expect(screen.getByRole('button', { name: /Ver pedido/ }).textContent).toContain('2 platillos · ₡3.600');
  });

  it('sin número configurado se puede armar el pedido pero no enviarlo', async () => {
    const user = userEvent.setup();
    await renderApp('');
    expect(screen.queryByRole('link', { name: 'Pedir por WhatsApp' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Agregar Típico' }));
    await user.click(screen.getByRole('button', { name: /Ver pedido/ }));
    const send = screen.getByRole('button', { name: 'Número pendiente' }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
  });
});

describe('Accesibilidad básica', () => {
  function sinNombre(root: HTMLElement): string[] {
    const problems: string[] = [];
    for (const el of root.querySelectorAll<HTMLElement>('button, a[href]')) {
      const name = el.getAttribute('aria-label') ?? el.textContent ?? '';
      if (!name.trim()) problems.push(el.outerHTML.slice(0, 80));
    }
    for (const el of root.querySelectorAll<HTMLInputElement>('input, textarea, select')) {
      if (!el.labels?.length && !el.getAttribute('aria-label')) problems.push(el.outerHTML.slice(0, 80));
    }
    for (const img of root.querySelectorAll('img')) {
      if (!img.hasAttribute('alt')) problems.push(img.outerHTML.slice(0, 80));
    }
    return problems;
  }

  it('en el menú, cada botón, enlace e imagen tiene nombre o texto alternativo, y hay un solo h1', async () => {
    await renderApp();
    expect(sinNombre(document.body)).toEqual([]);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Secciones del menú' })).toBeTruthy();
  });

  it('en la ventana de opciones y en el pedido, todo control tiene nombre y cada ventana tiene título', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole('button', { name: 'Agregar Bacon & Chesse' }));
    const sheet = screen.getByRole('dialog', { name: 'Bacon & Chesse' });
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    expect(sinNombre(sheet)).toEqual([]);
    await user.click(within(sheet).getByRole('button', { name: /^Agregar · / }));

    await user.click(screen.getByRole('button', { name: /Ver pedido/ }));
    const order = screen.getByRole('dialog', { name: 'Tu pedido' });
    expect(order.getAttribute('aria-modal')).toBe('true');
    expect(sinNombre(order)).toEqual([]);
  });

  it('los errores del formulario quedan asociados a su campo', async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole('button', { name: 'Agregar Típico' }));
    await user.click(screen.getByRole('button', { name: /Ver pedido/ }));
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));

    const name = screen.getByLabelText('Nombre');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    const errorId = name.getAttribute('aria-describedby');
    expect(errorId && document.getElementById(errorId)?.textContent).toBe('Falta el nombre');
    expect(document.activeElement).toBe(name);
  });
});
