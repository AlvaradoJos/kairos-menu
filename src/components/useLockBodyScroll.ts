// Bloquea el scroll de la página mientras hay una ventana abierta. Lo usan ItemSheet y OrderView.

import { useEffect } from 'react';

/** Evita que la página de atrás se desplace mientras hay una ventana abierta. */
export function useLockBodyScroll(): void {
  useEffect(() => {
    // En el celular, sin esto, al deslizar dentro de la ventana se movía también el menú de atrás.
    // Se guarda el valor anterior para devolverlo tal cual al cerrar.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}
