// Barra de secciones del menú que se queda arriba al bajar. Marca la sección que se está viendo.
// La usa App con las secciones de MENU.

import { useEffect, useRef, useState } from 'react';
import type { MenuSection } from '../features/menu/types';
import { useLanguage } from '../i18n/LanguageContext';
import { sectionTitle } from '../i18n/menuText';

interface Props {
  sections: MenuSection[];
}

/** Enlaces a cada sección; el activo se centra solo en la barra. */
export function SectionNav({ sections }: Props) {
  const { lang, t } = useLanguage();
  const [active, setActive] = useState(sections[0]?.id);
  const navRef = useRef<HTMLElement>(null);

  // Marca la sección que está en el centro de la pantalla.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  // Centra el botón activo en la barra sin mover la página.
  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>('.is-active');
    if (!nav || !chip) return;
    // El smooth de JavaScript no respeta prefers-reduced-motion por sí solo: si la persona pidió menos
    // movimiento en su sistema (mareo, vértigo), el salto es inmediato.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    nav.scrollTo?.({
      left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [active]);

  return (
    <nav className="section-nav" aria-label={t.nav.label} ref={navRef}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={section.id === active ? 'is-active' : undefined}
          aria-current={section.id === active ? 'true' : undefined}
        >
          {sectionTitle(section, lang)}
        </a>
      ))}
    </nav>
  );
}
