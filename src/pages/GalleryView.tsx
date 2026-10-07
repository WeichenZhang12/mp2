import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useArtworks } from '../ArtworksContext';
import { imageUrl } from '../api';
import styles from './GalleryView.module.css';

function GalleryView() {
  const { artworks, loading, error, setNav } = useArtworks();
  const location = useLocation();

  const [params, setParams] = useSearchParams();
  const selected = params.getAll('dept');

  const departments = [
    ...new Set(artworks.map((a) => a.department_title).filter((d): d is string => !!d)),
  ].sort();

  function toggle(dept: string) {
    const next = selected.includes(dept)
      ? selected.filter((d) => d !== dept)
      : [...selected, dept];
    setParams({ dept: next }, { replace: true });
  }

  const results =
    selected.length === 0
      ? artworks
      : artworks.filter((a) => a.department_title && selected.includes(a.department_title));

  if (loading) return <p className={styles.status}>Loading artworks…</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <section>
      <h2 className={styles.heading}>Gallery</h2>
      <p className={styles.subheading}>Filter by one or more departments.</p>

      <div className={styles.filters}>
        {departments.map((d) => (
          <button
            key={d}
            className={selected.includes(d) ? `${styles.chip} ${styles.on}` : styles.chip}
            onClick={() => toggle(d)}
          >
            {d}
          </button>
        ))}
        {selected.length > 0 && (
          <button className={styles.clear} onClick={() => setParams({}, { replace: true })}>
            Clear
          </button>
        )}
      </div>

      <p className={styles.count}>{results.length} artworks</p>

      <div className={styles.grid}>
        {results.map((a) => (
          <Link
            key={a.id}
            to={`/artworks/${a.id}`}
            className={styles.card}
            onClick={() =>
              setNav(
                results.map((r) => r.id),
                location.pathname + location.search,
              )
            }
          >
            <div className={styles.imageWrap}>
              <img
                src={imageUrl(a.image_id!)}
                alt={a.title}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className={styles.caption}>{a.title}</span>
            <span className={styles.artist}>{a.artist_title ?? 'Unknown artist'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default GalleryView;
