import { Track, YouTubeVideo, SavedTrack } from '../types';

const SEARCH_HISTORY_KEY = 'trackforge_recent_searches';
const WISHLIST_KEY = 'trackforge_saved_tracks';

export async function searchSongs(query: string, limit = 24): Promise<Track[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Search error: ${res.statusText}`);
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('searchSongs error:', err);
    // Direct client fallback to iTunes API if backend proxy encounters an issue
    try {
      const directRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=${limit}&explicit=Yes`
      );
      if (!directRes.ok) return [];
      const directData = await directRes.json();
      return (directData.results || []).map((item: any) => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        artwork: item.artworkUrl100 || '',
        artworkLarge: (item.artworkUrl100 || '').replace(/\/\d+x\d+bb\./, '/600x600bb.'),
        previewUrl: item.previewUrl || null,
        itunesUrl: item.trackViewUrl,
        appleMusicUrl: item.trackViewUrl,
        trackPrice: typeof item.trackPrice === 'number' ? item.trackPrice : undefined,
        collectionPrice: typeof item.collectionPrice === 'number' ? item.collectionPrice : undefined,
        currency: item.currency || 'USD',
        genre: item.primaryGenreName || 'Music',
        releaseDate: item.releaseDate,
        durationMs: item.trackTimeMillis,
        explicit: item.trackExplicitness === 'explicit',
      }));
    } catch (fallbackErr) {
      console.error('Direct iTunes fallback error:', fallbackErr);
      return [];
    }
  }
}

export async function getYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(`/api/youtube?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.status}`);
    }
    const data = await res.json();
    return data.videos || [];
  } catch (err) {
    console.error('getYouTubeVideos error:', err);
    return [];
  }
}

export async function getCuratedCategory(category: string): Promise<Track[]> {
  try {
    const res = await fetch(`/api/curated?category=${encodeURIComponent(category)}`);
    if (!res.ok) {
      throw new Error(`Curated API error: ${res.status}`);
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('getCuratedCategory error:', err);
    return [];
  }
}

// Local storage management
export function getSavedSearches(): string[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addSavedSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return getSavedSearches();
  try {
    const current = getSavedSearches().filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSavedSearches(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {}
}

export function getSavedTracks(): SavedTrack[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTrack(track: Track): SavedTrack[] {
  try {
    const current = getSavedTracks();
    if (current.some((t) => t.id === track.id)) {
      return current;
    }
    const updated: SavedTrack[] = [{ ...track, savedAt: Date.now() }, ...current];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeSavedTrack(trackId: number): SavedTrack[] {
  try {
    const current = getSavedTracks();
    const updated = current.filter((t) => t.id !== trackId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function isTrackSaved(trackId: number): boolean {
  const current = getSavedTracks();
  return current.some((t) => t.id === trackId);
}
