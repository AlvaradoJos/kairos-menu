// Una categoría del menú (Desayunos, Tacos…): título, platillos y aviso final.
// La usa App, una por cada sección de MENU.

import type { MenuItem, MenuSection } from '../features/menu/types';
import { useLanguage } from '../i18n/LanguageContext';
import { sectionNote, sectionTitle } from '../i18n/menuText';
import { ItemCard } from './ItemCard';

interface Props {
  section: MenuSection;
  onAdd(item: MenuItem): void;
}

/** Sección del menú con sus tarjetas. El id de la sección es el ancla de la barra de secciones. */
export function MenuSectionView({ section, onAdd }: Props) {
  const { lang } = useLanguage();
  const note = sectionNote(section, lang);
  return (
    <section className="menu-section" id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2 className="menu-section__title" id={`${section.id}-title`}>
        {sectionTitle(section, lang)}
      </h2>
      <div className="menu-section__items">
        {section.items.map((item) => (
          <ItemCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
      {note && <p className="menu-section__note">{note}</p>}
    </section>
  );
}
