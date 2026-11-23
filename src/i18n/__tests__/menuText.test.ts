import { describe, expect, it } from 'vitest';
import type { Choice, MenuItem, MenuSection } from '../../features/menu/types';
import { choiceLabel, choiceOption, extraLabel, itemDescription, sectionNote, sectionTitle, sizeLabel } from '../menuText';

const section: MenuSection = { id: 's', title: 'Tacos', titleEn: 'Tacos EN', note: 'Nota', noteEn: 'Note', items: [] };
const bare: MenuSection = { id: 'b', title: 'Antojitos', note: 'Nota', items: [] };
const item: MenuItem = { id: 'i', name: 'Típico', description: 'Pinto', descriptionEn: 'Gallo pinto' };
const choice: Choice = { label: 'Proteína', labelEn: 'Protein', options: ['Carne', 'Pollo'], optionsEn: ['Beef', 'Chicken'] };

describe('textos del menú', () => {
  it('en español devuelve siempre el texto original', () => {
    expect(sectionTitle(section, 'es')).toBe('Tacos');
    expect(sectionNote(section, 'es')).toBe('Nota');
    expect(itemDescription(item, 'es')).toBe('Pinto');
    expect(choiceLabel(choice, 'es')).toBe('Proteína');
    expect(choiceOption(choice, 'Pollo', 'es')).toBe('Pollo');
  });

  it('en inglés devuelve la traducción', () => {
    expect(sectionTitle(section, 'en')).toBe('Tacos EN');
    expect(sectionNote(section, 'en')).toBe('Note');
    expect(itemDescription(item, 'en')).toBe('Gallo pinto');
    expect(sizeLabel({ id: 'r', label: 'Regulares', labelEn: 'Regular', price: 1 }, 'en')).toBe('Regular');
    expect(extraLabel({ id: 'p', label: 'Papas fritas', labelEn: 'Fries', price: 1 }, 'en')).toBe('Fries');
    expect(choiceLabel(choice, 'en')).toBe('Protein');
    expect(choiceOption(choice, 'Pollo', 'en')).toBe('Chicken');
  });

  it('si falta el inglés, muestra el español', () => {
    expect(sectionTitle(bare, 'en')).toBe('Antojitos');
    expect(sectionNote(bare, 'en')).toBe('Nota');
    expect(itemDescription({ id: 'x', name: 'X', description: 'Solo español' }, 'en')).toBe('Solo español');
    expect(sizeLabel({ id: 'r', label: 'Regulares', price: 1 }, 'en')).toBe('Regulares');
    expect(choiceOption({ label: 'Relleno', options: ['Carne', 'Queso'] }, 'Queso', 'en')).toBe('Queso');
    expect(choiceOption(choice, 'No existe', 'en')).toBe('No existe');
  });
});
