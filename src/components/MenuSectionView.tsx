import type { MenuItem, MenuSection } from '../features/menu/types';
import { ItemCard } from './ItemCard';

interface Props {
  section: MenuSection;
  onAdd(item: MenuItem): void;
}

export function MenuSectionView({ section, onAdd }: Props) {
  return (
    <section className="menu-section" id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2 className="menu-section__title" id={`${section.id}-title`}>
        {section.title}
      </h2>
      <div className="menu-section__items">
        {section.items.map((item) => (
          <ItemCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
      {section.note && <p className="menu-section__note">{section.note}</p>}
    </section>
  );
}
