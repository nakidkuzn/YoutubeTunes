import React, { useState, useEffect } from 'react';
import { X, Youtube, Play, ExternalLink } from 'lucide-react';
import { Track, YouTubeVideo } from '../types';
import { getYouTubeVideos } from '../services/api';

interface YouTubeVersionsModalProps {
  track: Track | null;
  onClose: () => void;
  onSelectVideo: (track: Track, video: YouTubeVideo) => void;
}

export const YouTubeVersionsModal: React.FC<YouTubeVersionsModalProps> = ({
  track,
  onClose,
  onSelectVideo,
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!track) {
      setVideos([]);
      return;
    }

    let isMounted = true;
    const fetchAlternatives = async () => {
      setIsLoading(true);
      const query = `${track.artist} ${track.title}`;
      const results = await getYouTubeVideos(query);
      if (isMounted) {
        setVideos(results);
        setIsLoading(false);
      }
    };

    fetchAlternatives();
    return () => {
      isMounted = false;
    };
  }, [track]);

  if (!track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl bg-[#11131A] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <Youtube className="h-5 w-5 text-red-500 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                YouTube Versions for &quot;{track.title}&quot;
              </h3>
              <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              <span className="text-xs font-medium">Finding YouTube matches...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No additional video versions found. You can still stream via the primary player!
            </div>
          ) : (
            videos.map((vid) => (
              <div
                key={vid.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 transition-all group"
              >
                <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {vid.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-mono text-white">
                      {vid.duration}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                    {vid.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 truncate">{vid.channel}</p>
                  {vid.views && (
                    <p className="text-[10px] text-zinc-500 mt-0.5">{vid.views}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onSelectVideo(track, vid);
                      onClose();
                    }}
                    className="flex items-center gap-1 h-8 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Play</span>
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${vid.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
