import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useArtworks } from '../ArtworksContext';
import { imageUrl } from '../api';
import Highlight from '../components/Highlight';
import type { Artwork } from '../api';
import styles from './ListView.module.css';

type Order = 'asc' | 'desc';

const SORT_OPTIONS = {
  title: { label: 'Title', get: (a: Artwork) => a.title },
  artist: { label: 'Artist', get: (a: Artwork) => a.artist_title },
  date: { label: 'Date', get: (a: Artwork) => a.date_end },
  type: { label: 'Type', get: (a: Artwork) => a.artwork_type_title },
  medium: { label: 'Medium', get: (a: Artwork) => a.medium_display },
  place: { label: 'Place of origin', get: (a: Artwork) => a.place_of_origin },
  department: { label: 'Department', get: (a: Artwork) => a.department_title },
};
type SortKey = keyof typeof SORT_OPTIONS;

function formatYear(year: number): string {
  return year < 0 ? `${-year} BC` : String(year);
}

function compare(a: Artwork, b: Artwork, key: SortKey, order: Order): number {
  const x = SORT_OPTIONS[key].get(a);
  const y = SORT_OPTIONS[key].get(b);
  if (x === null || y === null) {
    return x === y ? 0 : x === null ? 1 : -1;
  }
  const result =
    typeof x === 'number' && typeof y === 'number'
      ? x - y
      : String(x).localeCompare(String(y));
  return order === 'asc' ? result : -result;
}

function ListView() {
  const { artworks, loading, error, setNav } = useArtworks();
  const location = useLocation();

  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const sortParam = params.get('sort') ?? '';
  const sortKey: SortKey = sortParam in SORT_OPTIONS ? (sortParam as SortKey) : 'title';
  const order = (params.get('order') as Order) ?? 'asc';

  function update(name: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(name, value);
    setParams(next, { replace: true });
  }

  const q = query.trim().toLowerCase();
  const results = artworks
    .filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.artist_title ?? '').toLowerCase().includes(q),
    )
    .sort((a, b) => compare(a, b, sortKey, order));

  const tagKey: SortKey = ['title', 'artist', 'date'].includes(sortKey) ? 'type' : sortKey;

  function rememberList() {
    setNav(
      results.map((r) => r.id),
      location.pathname + location.search,
    );
  }

  if (loading) return <p className={styles.status}>Loading artworks…</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <section>
      <h2 className={styles.heading}>Collection</h2>
      <p className={styles.subheading}>
        Search and sort public-domain works from the Art Institute of Chicago.
      </p>

      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search by title or artist"
          value={query}
          onChange={(e) => update('q', e.target.value)}
        />
        <label className={styles.label}>
          Sort by
          <select
            className={styles.select}
            value={sortKey}
            onChange={(e) => update('sort', e.target.value)}
          >
            {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.order}>
          <button
            className={order === 'asc' ? styles.selected : ''}
            onClick={() => update('order', 'asc')}
          >
            Ascending
          </button>
          <button
            className={order === 'desc' ? styles.selected : ''}
            onClick={() => update('order', 'desc')}
          >
            Descending
          </button>
        </div>
      </div>

      <p className={styles.count}>{results.length} results</p>

      {results.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No artworks match “{query.trim()}”</p>
          <p className={styles.emptyText}>Try a different title or artist name.</p>
          <button className={styles.clearButton} onClick={() => update('q', '')}>
            Clear search
          </button>
        </div>
      )}

      {results.length > 0 && (
        <ul className={styles.list}>
          {results.map((a) => (
            <li key={a.id}>
              <Link
                to={`/artworks/${a.id}`}
                className={styles.item}
                onClick={rememberList}
              >
                <img
                  src={imageUrl(a.image_id!, 200)}
                  alt={a.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className={styles.itemText}>
                  <h3 className={styles.itemTitle}>
                    <Highlight text={a.title} query={query} />
                  </h3>
                  <p className={styles.meta}>
                    <Highlight text={a.artist_title ?? 'Unknown artist'} query={query} />
                    {a.date_end !== null && ` · ${formatYear(a.date_end)}`}
                  </p>
                </div>
                <span className={styles.tag}>{SORT_OPTIONS[tagKey].get(a) ?? '—'}</span>
                <span className={styles.chevron}>›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ListView;
