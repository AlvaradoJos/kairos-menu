import { useEffect } from 'react';

/** Evita que la página de atrás se desplace mientras hay una ventana abierta. */
export function useLockBodyScroll(): void {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}
