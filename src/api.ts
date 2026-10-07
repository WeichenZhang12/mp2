import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.artic.edu/api/v1',
});

export interface Artwork {
  id: number;
  title: string;
  artist_title: string | null;
  date_end: number | null;
  image_id: string | null;
  department_title: string | null;
  artwork_type_title: string | null;
  medium_display: string | null;
  place_of_origin: string | null;
}

export interface ArtworkDetail extends Artwork {
  artist_display: string | null;
  date_display: string | null;
  dimensions: string | null;
  credit_line: string | null;
  short_description: string | null;
}

const LIST_FIELDS =
  'id,title,artist_title,date_end,image_id,department_title,artwork_type_title,medium_display,place_of_origin';
const DETAIL_FIELDS =
  LIST_FIELDS + ',artist_display,date_display,dimensions,credit_line,short_description';

const CACHE_KEY = 'aic-artworks-v2';

export async function fetchArtworks(): Promise<Artwork[]> {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached) as Artwork[];
  }

  const res = await api.get('/artworks/search', {
    params: {
      'query[term][is_public_domain]': true,
      limit: 100,
      fields: LIST_FIELDS,
    },
  });
  const artworks = (res.data.data as Artwork[]).filter((a) => a.image_id);
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(artworks));
  return artworks;
}

export async function fetchArtwork(id: number): Promise<ArtworkDetail> {
  const res = await api.get(`/artworks/${id}`, {
    params: { fields: DETAIL_FIELDS },
  });
  return res.data.data as ArtworkDetail;
}

export function imageUrl(imageId: string, width = 400): string {
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}
