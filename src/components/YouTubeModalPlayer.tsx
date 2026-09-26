import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Youtube,
  ShoppingBag,
  Minimize2,
  Maximize2,
  Share2,
  Check,
  Disc,
} from 'lucide-react';
import { Track, YouTubeVideo } from '../types';
import { getYouTubeVideos } from '../services/api';

interface YouTubeModalPlayerProps {
  track: Track | null;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const YouTubeModalPlayer: React.FC<YouTubeModalPlayerProps> = ({
  track,
  onClose,
  isMinimized,
  onToggleMinimize,
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!track) {
      setVideos([]);
      setSelectedVideo(null);
      return;
    }

    let isMounted = true;
    const fetchVideos = async () => {
      setIsLoading(true);
      const query = `${track.artist} ${track.title} official audio video`;
      const results = await getYouTubeVideos(query);
      if (isMounted) {
        setVideos(results);
        if (results.length > 0) {
          setSelectedVideo(results[0]);
        } else {
          // If no specific parsed results, create a search-based placeholder
          setSelectedVideo({
            id: '',
            title: `${track.artist} - ${track.title}`,
            channel: 'YouTube',
            thumbnail: track.artworkLarge || track.artwork,
          });
        }
        setIsLoading(false);
      }
    };

    fetchVideos();
    return () => {
      isMounted = false;
    };
  }, [track]);

  if (!track) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(track.appleMusicUrl || track.itunesUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const embedSrc = selectedVideo?.id
    ? `https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
        `${track.artist} ${track.title}`
      )}&autoplay=1`;

  const youtubeWatchUrl = selectedVideo?.id
    ? `https://www.youtube.com/watch?v=${selectedVideo.id}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${track.artist} ${track.title}`
      )}`;

  const youtubeMusicUrl = selectedVideo?.id
    ? `https://music.youtube.com/watch?v=${selectedVideo.id}`
    : `https://music.youtube.com/search?q=${encodeURIComponent(
        `${track.artist} ${track.title}`
      )}`;

  // Minimized floating player in bottom-right corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 w-80 rounded-xl bg-zinc-900 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedSrc}
            title={track.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-3 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleMinimize}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Expand player"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded theater modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#11131A] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 mr-4">
            <div className="h-9 w-9 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
              <img
                src={track.artwork}
                alt={track.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500 shrink-0" />
                <h2 className="text-sm font-bold text-white truncate">{track.title}</h2>
              </div>
              <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleMinimize}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Minimize to picture-in-picture"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main 16:9 YouTube Video Embed */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl border border-white/5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                <span className="text-xs font-medium">Loading YouTube stream...</span>
              </div>
            ) : (
              <iframe
                src={embedSrc}
                title={`${track.artist} - ${track.title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Action Row: Direct Links to YouTube & Apple Music Store */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Apple Music & iTunes purchase station */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Purchase & Own Song</span>
                  </span>
                  {track.trackPrice && (
                    <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      ${track.trackPrice.toFixed(2)} {track.currency || 'USD'}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-300">
                  Instant high-resolution purchase via Apple Music & iTunes Store.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={track.appleMusicUrl || track.itunesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  <span>Open iTunes / Apple Music</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={handleCopyLink}
                  title="Copy store link"
                  className="h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* YouTube Direct Links */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                    <Youtube className="h-4 w-4" />
                    <span>YouTube Platforms</span>
                  </span>
                  <span className="text-[11px] text-zinc-400">Stream & Video</span>
                </div>
                <p className="mt-1 text-xs text-zinc-300">
                  Listen directly on YouTube or open the official YouTube Music streaming player.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <span>YouTube</span>
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>
                <a
                  href={youtubeMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors border border-white/10"
                >
                  <Disc className="h-3.5 w-3.5 text-red-400" />
                  <span>YT Music</span>
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>
              </div>
            </div>
          </div>

          {/* YouTube Alternative Versions Selector */}
          {videos.length > 1 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Available YouTube Versions ({videos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {videos.map((vid) => {
                  const isCurrent = selectedVideo?.id === vid.id;
                  return (
                    <button
                      key={vid.id}
                      onClick={() => setSelectedVideo(vid)}
                      className={`flex items-start gap-3 p-2.5 rounded-lg text-left transition-all border ${
                        isCurrent
                          ? 'bg-red-950/40 border-red-500/50 text-white'
                          : 'bg-zinc-900/50 border-white/5 hover:border-white/15 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="relative w-20 aspect-video rounded overflow-hidden bg-black shrink-0">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="h-full w-full object-cover"
                        />
                        {vid.duration && (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 rounded text-[9px] font-mono text-white">
                            {vid.duration}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium line-clamp-2 leading-tight">
                          {vid.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                          <span className="truncate">{vid.channel}</span>
                          {vid.views && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{vid.views}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
