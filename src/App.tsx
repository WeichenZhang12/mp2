import { Link, NavLink, Route, Routes, useMatch } from 'react-router-dom';
import { useArtworks } from './ArtworksContext';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import styles from './App.module.css';

function navClass(isActive: boolean) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

function App() {
  const { navFrom } = useArtworks();
  const onDetail = useMatch('/artworks/:id') !== null;
  const fromGallery = navFrom.startsWith('/gallery');

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>
            <Link to={onDetail ? navFrom : '/'} className={styles.home}>
              Art Explorer
            </Link>
          </h1>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              end
              className={({ isActive }) => navClass(isActive || (onDetail && !fromGallery))}
            >
              List
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) => navClass(isActive || (onDetail && fromGallery))}
            >
              Gallery
            </NavLink>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/artworks/:id" element={<DetailView />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
      <footer className={styles.footer}>
        Data from the Art Institute of Chicago API
      </footer>
    </>
  );
}

export default App;
