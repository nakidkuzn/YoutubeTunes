import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory cache for YouTube searches
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const ytCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

interface YouTubeVideoResult {
  id: string;
  title: string;
  channel: string;
  duration?: string;
  views?: string;
  thumbnail: string;
}

// Helper to query YouTube for video matches
async function searchYouTubeVideos(query: string): Promise<YouTubeVideoResult[]> {
  const cacheKey = query.toLowerCase().trim();
  const cached = ytCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`YouTube fetch error: ${res.status}`);
    }

    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);

    const results: YouTubeVideoResult[] = [];

    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

        for (const section of contents) {
          const items = section.itemSectionRenderer?.contents || [];
          for (const item of items) {
            if (item.videoRenderer && item.videoRenderer.videoId) {
              const vr = item.videoRenderer;
              const thumbnails = vr.thumbnail?.thumbnails || [];
              const bestThumb =
                thumbnails.length > 0
                  ? thumbnails[thumbnails.length - 1].url
                  : `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`;

              results.push({
                id: vr.videoId,
                title: vr.title?.runs?.[0]?.text || query,
                channel: vr.ownerText?.runs?.[0]?.text || 'YouTube Channel',
                duration: vr.lengthText?.simpleText || undefined,
                views: vr.viewCountText?.simpleText || undefined,
                thumbnail: bestThumb,
              });

              if (results.length >= 8) break;
            }
          }
          if (results.length >= 8) break;
        }
      } catch (err) {
        console.error('Error parsing ytInitialData:', err);
      }
    }

    // Fallback: extract video IDs via regex if primary parser yields fewer than 2
    if (results.length === 0) {
      const videoIdMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
      const uniqueIds = [...new Set(videoIdMatches)].slice(0, 5);
      for (const id of uniqueIds) {
        results.push({
          id,
          title: query,
          channel: 'YouTube',
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        });
      }
    }

    if (results.length > 0) {
      ytCache.set(cacheKey, { data: results, timestamp: Date.now() });
    }

    return results;
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

// iTunes track interface
export interface TrackItem {
  id: number;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  artworkLarge: string;
  previewUrl: string | null;
  itunesUrl: string;
  appleMusicUrl: string;
  trackPrice?: number;
  collectionPrice?: number;
  currency: string;
  genre: string;
  releaseDate?: string;
  durationMs?: number;
  explicit: boolean;
  youtubeId?: string;
}

// Helper to format high-res artwork from iTunes
function getArtwork(url: string | undefined, size = 600): string {
  if (!url) return '';
  return url.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

// API endpoint: search iTunes songs
app.get('/api/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  const limit = Math.min(parseInt(req.query.limit as string || '24', 10), 50);

  if (!query) {
    return res.json({ results: [], total: 0 });
  }

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=${limit}&explicit=Yes`;

    const response = await fetch(itunesUrl);
    if (!response.ok) {
      throw new Error(`iTunes API responded with status ${response.status}`);
    }

    const data = await response.json();
    const tracks: TrackItem[] = (data.results || []).map((item: any) => ({
      id: item.trackId,
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName || 'Single',
      artwork: item.artworkUrl100 || '',
      artworkLarge: getArtwork(item.artworkUrl100, 600),
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

    return res.json({ results: tracks, total: tracks.length });
  } catch (error: any) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Failed to search iTunes catalogue', details: error.message });
  }
});

// API endpoint: find YouTube matches for track
app.get('/api/youtube', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.json({ videos: [] });
  }

  const videos = await searchYouTubeVideos(query);
  return res.json({ videos });
});

// Curated category artists
const CURATED_LISTS: Record<string, string[]> = {
  trending: ['Kendrick Lamar', 'Sabrina Carpenter', 'Daft Punk', 'Billie Eilish', 'The Weeknd', 'Taylor Swift'],
  electronic: ['Daft Punk', 'Justice', 'Fred again..', 'Deadmau5', 'Disclosure', 'Avicii'],
  pop: ['Chappell Roan', 'Sabrina Carpenter', 'Dua Lipa', 'Harry Styles', 'Olivia Rodrigo', 'Billie Eilish'],
  rock: ['Arctic Monkeys', 'The Strokes', 'Radiohead', 'Fleetwood Mac', 'Queen', 'Nirvana'],
  hiphop: ['Kendrick Lamar', 'Travis Scott', 'Drake', 'J. Cole', 'Tyler The Creator', 'Future'],
  rnb: ['SZA', 'Frank Ocean', 'The Weeknd', 'Daniel Caesar', 'Steve Lacy', 'Brent Faiyaz'],
  indie: ['Phoebe Bridgers', 'boygenius', 'Clairo', 'Mac DeMarco', 'Tame Impala', 'Beach House'],
};

const curatedCache = new Map<string, CacheEntry<TrackItem[]>>();

app.get('/api/curated', async (req: Request, res: Response) => {
  const category = (req.query.category as string || 'trending').toLowerCase();
  const artists = CURATED_LISTS[category] || CURATED_LISTS['trending'];

  const cached = curatedCache.get(category);
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
    return res.json({ results: cached.data, total: cached.data.length, category });
  }

  try {
    const fetchPromises = artists.map(async (artist) => {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
          artist
        )}&entity=song&limit=3&explicit=Yes`;
        const resp = await fetch(itunesUrl);
        if (!resp.ok) return [];
        const json = await resp.json();
        return (json.results || []).map((item: any): TrackItem => ({
          id: item.trackId,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || 'Single',
          artwork: item.artworkUrl100 || '',
          artworkLarge: getArtwork(item.artworkUrl100, 600),
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
      } catch {
        return [];
      }
    });

    const resultsByArtist = await Promise.all(fetchPromises);
    const combinedTracks = resultsByArtist.flat();

    // Deduplicate by track ID
    const uniqueMap = new Map<number, TrackItem>();
    for (const t of combinedTracks) {
      if (!uniqueMap.has(t.id)) {
        uniqueMap.set(t.id, t);
      }
    }
    const finalTracks = Array.from(uniqueMap.values());

    if (finalTracks.length > 0) {
      curatedCache.set(category, { data: finalTracks, timestamp: Date.now() });
    }

    return res.json({ results: finalTracks, total: finalTracks.length, category });
  } catch (error: any) {
    console.error('Curated tracks error:', error);
    return res.status(500).json({ error: 'Failed to fetch curated songs' });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrackForge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
