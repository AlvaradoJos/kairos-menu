import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MenuSectionView } from './components/MenuSectionView';
import { SectionNav } from './components/SectionNav';
import { config } from './config';
import { MENU } from './data/menu';

export default function App() {
  return (
    <>
      <Header whatsappNumber={config.whatsappNumber} />
      <SectionNav sections={MENU} />
      <main className="menu" id="menu">
        {MENU.map((section) => (
          <MenuSectionView key={section.id} section={section} onAdd={() => {}} />
        ))}
      </main>
      <Footer config={config} />
    </>
  );
}
