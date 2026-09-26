import React, { useState } from 'react';
import {
  Play,
  Pause,
  ExternalLink,
  Bookmark,
  Share2,
  Check,
  Disc,
  Youtube,
  ShoppingBag,
  ListMusic,
} from 'lucide-react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  isPlayingPreview: boolean;
  onTogglePreview: (track: Track) => void;
  onPlayYouTube: (track: Track) => void;
  isSaved: boolean;
  onToggleSave: (track: Track) => void;
  onShowYouTubeVersions: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlayingPreview,
  onTogglePreview,
  onPlayYouTube,
  isSaved,
  onToggleSave,
  onShowYouTubeVersions,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getReleaseYear = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear().toString();
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(track.appleMusicUrl || track.itunesUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const displayPrice = track.trackPrice !== undefined && track.trackPrice > 0
    ? `$${track.trackPrice.toFixed(2)} ${track.currency || 'USD'}`
    : 'View Store';

  return (
    <div className="group relative flex flex-col rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/15 transition-all duration-200 overflow-hidden hover:shadow-xl hover:shadow-black/40">
      {/* Artwork container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        {!imgError && (track.artworkLarge || track.artwork) ? (
          <img
            src={track.artworkLarge || track.artwork}
            alt={`${track.title} by ${track.artist}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
            <Disc className="h-16 w-16" />
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Quick action buttons on top of image */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(track);
            }}
            title={isSaved ? 'Remove from Crate' : 'Save to Crate'}
            className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
              isSaved
                ? 'bg-rose-600 text-white'
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Quick Audio Preview Play Button (Over Artwork) */}
        {track.previewUrl && (
          <div className="absolute bottom-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePreview(track);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
                isPlayingPreview
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-black/70 hover:bg-black/90 text-zinc-200 hover:text-white border border-white/10'
              }`}
              title="Play 30s audio sample from iTunes"
            >
              {isPlayingPreview ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Previewing</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Sample</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Price tag over artwork */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="font-mono text-xs font-semibold text-white/90 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 tabular-nums">
            {displayPrice}
          </span>
        </div>
      </div>

      {/* Content body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title and Artist */}
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-white truncate leading-snug group-hover:text-rose-400 transition-colors"
            title={track.title}
          >
            {track.title}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-zinc-400 truncate" title={track.artist}>
            {track.artist}
          </p>

          {/* Clean unboxed metadata with typographic separators */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 truncate">
            <span className="truncate max-w-[120px]">{track.album}</span>
            {track.releaseDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{getReleaseYear(track.releaseDate)}</span>
              </>
            )}
            {track.durationMs && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{formatDuration(track.durationMs)}</span>
              </>
            )}
            {track.genre && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{track.genre}</span>
              </>
            )}
          </div>
        </div>

        {/* Dual Action Station: 1) Listen on YouTube, 2) Buy on iTunes/Apple Music */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
          {/* Primary Action 1: YouTube Player */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPlayYouTube(track)}
              className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold tracking-wide transition-all shadow-sm group/yt"
              title="Stream full video/song on YouTube"
            >
              <Youtube className="h-4 w-4" />
              <span className="whitespace-nowrap truncate">Listen on YouTube</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowYouTubeVersions(track);
              }}
              title="View alternative YouTube versions (Live, Acoustic, Lyrics)"
              className="h-9 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <ListMusic className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Action 2: Apple Music / iTunes Store Link */}
          <div className="flex items-center gap-1.5">
            <a
              href={track.appleMusicUrl || track.itunesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-all border border-white/10 hover:border-white/20 group/apple"
              title="Open direct purchase page on Apple Music / iTunes Store"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-rose-400 group-hover/apple:scale-110 transition-transform" />
              <span className="whitespace-nowrap truncate">Buy on Apple Music</span>
              <ExternalLink className="h-3 w-3 text-zinc-400 shrink-0" />
            </a>

            <button
              onClick={handleCopyLink}
              title="Copy official iTunes store link"
              className="h-9 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-white/5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
