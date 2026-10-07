import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchArtworks } from './api';
import type { Artwork } from './api';

interface ArtworksState {
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  navIds: number[];
  navFrom: string;
  setNav: (ids: number[], from: string) => void;
}

const ArtworksContext = createContext<ArtworksState | null>(null);

export function ArtworksProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navIds, setNavIds] = useState<number[]>([]);
  const [navFrom, setNavFrom] = useState('/');

  function setNav(ids: number[], from: string) {
    setNavIds(ids);
    setNavFrom(from);
  }

  useEffect(() => {
    fetchArtworks()
      .then(setArtworks)
      .catch(() => setError('Could not load artworks. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ArtworksContext.Provider value={{ artworks, loading, error, navIds, navFrom, setNav }}>
      {children}
    </ArtworksContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useArtworks(): ArtworksState {
  const ctx = useContext(ArtworksContext);
  if (!ctx) {
    throw new Error('useArtworks must be used inside ArtworksProvider');
  }
  return ctx;
}
