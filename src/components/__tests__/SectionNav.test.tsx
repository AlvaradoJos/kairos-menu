// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MENU } from '../../data/menu';
import { SectionNav } from '../SectionNav';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce && query.includes('reduce'), media: query }));
}

describe('SectionNav', () => {
  it('centra el botón activo sin animación si el usuario pide menos movimiento', () => {
    mockReducedMotion(true);
    const scrollTo = vi.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    render(<SectionNav sections={MENU} />);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  it('usa desplazamiento suave si no hay preferencia', () => {
    mockReducedMotion(false);
    const scrollTo = vi.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    render(<SectionNav sections={MENU} />);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });
});
