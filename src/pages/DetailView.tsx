import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useArtworks } from '../ArtworksContext';
import { fetchArtwork, imageUrl } from '../api';
import type { ArtworkDetail } from '../api';
import styles from './DetailView.module.css';

function toPlainText(html: string): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
}

function DetailView() {
  const id = Number(useParams().id);
  const { artworks, navIds } = useArtworks();
  const [result, setResult] = useState<{
    id: number;
    artwork?: ArtworkDetail;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchArtwork(id)
      .then((artwork) => {
        if (!ignore) setResult({ id, artwork });
      })
      .catch(() => {
        if (!ignore) setResult({ id, error: 'Could not load this artwork.' });
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const current = result?.id === id ? result : null;
  const artwork = current?.artwork;
  const error = current?.error;

  const ids = navIds.includes(id) ? navIds : artworks.map((a) => a.id);
  const index = ids.indexOf(id);
  const prevId = index >= 0 ? ids[(index - 1 + ids.length) % ids.length] : null;
  const nextId = index >= 0 ? ids[(index + 1) % ids.length] : null;

  const fields: [string, string | null][] = artwork
    ? [
        ['Date', artwork.date_display],
        ['Type', artwork.artwork_type_title],
        ['Medium', artwork.medium_display],
        ['Dimensions', artwork.dimensions],
        ['Place of origin', artwork.place_of_origin],
        ['Department', artwork.department_title],
        ['Credit', artwork.credit_line],
      ]
    : [];

  return (
    <article>
      <div className={styles.nav}>
        {prevId !== null && (
          <Link to={`/artworks/${prevId}`} className={styles.navButton}>
            ‹ Previous
          </Link>
        )}
        {index >= 0 && (
          <span className={styles.position}>
            {index + 1} of {ids.length}
          </span>
        )}
        {nextId !== null && (
          <Link to={`/artworks/${nextId}`} className={styles.navButton}>
            Next ›
          </Link>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {!error && !artwork && <p className={styles.status}>Loading…</p>}

      {artwork && (
        <div className={styles.content}>
          <div className={styles.imageWrap}>
            {artwork.image_id ? (
              <img
                className={styles.image}
                src={imageUrl(artwork.image_id, 843)}
                alt={artwork.title}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.noImage}>No image available</div>
            )}
          </div>
          <div>
            <p className={styles.eyebrow}>{artwork.artwork_type_title ?? 'Artwork'}</p>
            <h2 className={styles.title}>{artwork.title}</h2>
            <p className={styles.artist}>
              {artwork.artist_display ? toPlainText(artwork.artist_display) : 'Unknown artist'}
            </p>
            {artwork.short_description && (
              <p className={styles.description}>{toPlainText(artwork.short_description)}</p>
            )}
            <dl className={styles.fields}>
              {fields.map(([label, value]) => (
                <div key={label} className={styles.row}>
                  <dt>{label}</dt>
                  <dd>{value ? toPlainText(value) : '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </article>
  );
}

export default DetailView;
