export interface Track {
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

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration?: string;
  views?: string;
  thumbnail: string;
}

export interface SavedTrack extends Track {
  savedAt: number;
  notes?: string;
}

export type PlayMode = 'audio-preview' | 'youtube' | 'idle';

export interface ActivePlayerState {
  track: Track | null;
  playMode: PlayMode;
  youtubeVideo: YouTubeVideo | null;
  isPlaying: boolean;
}
