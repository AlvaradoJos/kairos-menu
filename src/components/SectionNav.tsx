import { useEffect, useRef, useState } from 'react';
import type { MenuSection } from '../features/menu/types';

interface Props {
  sections: MenuSection[];
}

export function SectionNav({ sections }: Props) {
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
    nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav className="section-nav" aria-label="Secciones del menú" ref={navRef}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={section.id === active ? 'is-active' : undefined}
          aria-current={section.id === active ? 'true' : undefined}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
