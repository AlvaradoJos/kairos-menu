// @vitest-environment jsdom
// Pruebas de los dos idiomas sobre la app completa: cambiar, recordar al recargar y mensaje siempre en español.
// Número sintético: nunca usar el número real del negocio en pruebas.
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANG_STORAGE_KEY } from '../i18n/language';

const TEST_NUMBER = '50600000000';

/** Monta la app como main.tsx: con LanguageProvider. Recargar = volver a llamar esto. */
async function renderApp() {
  vi.resetModules();
  vi.stubEnv('VITE_WHATSAPP_NUMBER', TEST_NUMBER);
  const { default: App } = await import('../App');
  const { LanguageProvider } = await import('../i18n/LanguageContext');
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
}

// jsdom dice que el navegador está en "en-US"; aquí se simula un celular en español de Costa Rica.
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-CR');
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Idiomas', { timeout: 20_000 }, () => {
  it('empieza en español y el botón EN cambia toda la página a inglés', async () => {
    const user = userEvent.setup();
    await renderApp();
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('button', { name: 'Español' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Desayunos' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('button', { name: 'English' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('group', { name: 'Language' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Breakfast' })).toBeTruthy();
    expect(screen.getByText('Gallo pinto, egg, sweet plantain, bread and coffee')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Menu sections' })).toBeTruthy();
    // El nombre del platillo no se traduce; el precio se ve igual.
    expect(screen.getByRole('button', { name: 'Add Típico' })).toBeTruthy();
    expect(screen.getAllByText('from ₡3.500').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₡3.800').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Español' }));
    expect(screen.getByRole('heading', { name: 'Desayunos' })).toBeTruthy();
  });

  it('sin idioma guardado, abre en inglés si el navegador está en inglés', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    await renderApp();
    expect(screen.getByRole('heading', { name: 'Breakfast' })).toBeTruthy();
  });

  it('el idioma del navegador no se guarda como si el cliente lo hubiera elegido', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    await renderApp();
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBeNull();
  });

  it('recuerda el idioma al recargar la página', async () => {
    const user = userEvent.setup();
    const first = await renderApp();
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    first.unmount();

    await renderApp();
    expect(screen.getByRole('heading', { name: 'Breakfast' })).toBeTruthy();
    expect(document.documentElement.lang).toBe('en');
  });

  it('en inglés, el pedido se arma en inglés pero el mensaje de WhatsApp sale en español', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    localStorage.setItem(LANG_STORAGE_KEY, 'en');
    await renderApp();

    await user.click(screen.getByRole('button', { name: 'Add Bacon & Chesse' }));
    const sheet = screen.getByRole('dialog', { name: 'Bacon & Chesse' });
    await user.click(within(sheet).getByLabelText('Chicken breast'));
    await user.click(within(sheet).getByLabelText(/Fries/));
    await user.click(within(sheet).getByRole('button', { name: 'Add · ₡5.000' }));

    await user.click(screen.getByRole('button', { name: /View order/ }));
    const order = screen.getByRole('dialog', { name: 'Your order' });
    expect(within(order).getByText('Chicken breast · + Fries')).toBeTruthy();
    // "One less" y "Remove" no se parecen: con lector de pantalla no se borra la línea por error.
    expect(within(order).getByRole('button', { name: 'One less Bacon & Chesse' })).toBeTruthy();
    expect(within(order).getByRole('button', { name: 'Remove Bacon & Chesse' })).toBeTruthy();

    // Sin datos, los errores salen en inglés.
    await user.click(within(order).getByRole('button', { name: 'Send on WhatsApp' }));
    expect(within(order).getByText('Name is missing')).toBeTruthy();

    await user.type(within(order).getByLabelText('Name'), 'Ann');
    await user.click(within(order).getByLabelText('Pickup'));
    await user.click(within(order).getByLabelText('Cash'));
    await user.click(within(order).getByRole('button', { name: 'Send on WhatsApp' }));

    const text = new URL(open.mock.calls[0][0] as string).searchParams.get('text');
    expect(text).toBe(
      [
        "¡Hola Kairos Food's! Quiero hacer un pedido",
        '',
        '1× Bacon & Chesse (Pechuga de pollo) — ₡3.800',
        '   + Papas fritas — ₡1.200',
        '',
        'Total: ₡5.000',
        '',
        'Nombre: Ann',
        'Tipo: Para recoger',
        'Pago: Efectivo',
        'Idioma del cliente: inglés',
      ].join('\n'),
    );
    expect(screen.getByRole('alertdialog', { name: 'Did you send your order?' })).toBeTruthy();
  });
});
