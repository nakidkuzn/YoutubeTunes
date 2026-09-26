import React, { useState } from 'react';
import {
  X,
  Trash2,
  ExternalLink,
  Youtube,
  ShoppingBag,
  Share2,
  Check,
  Disc3,
} from 'lucide-react';
import { SavedTrack, Track } from '../types';

interface SavedCrateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTracks: SavedTrack[];
  onRemoveTrack: (id: number) => void;
  onPlayYouTube: (track: Track) => void;
  onClearAll: () => void;
}

export const SavedCrateDrawer: React.FC<SavedCrateDrawerProps> = ({
  isOpen,
  onClose,
  savedTracks,
  onRemoveTrack,
  onPlayYouTube,
  onClearAll,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const totalEstimate = savedTracks.reduce((acc, t) => acc + (t.trackPrice || 1.29), 0);

  const handleCopyAllLinks = async () => {
    const text = savedTracks
      .map(
        (t) =>
          `🎵 ${t.title} - ${t.artist}\nBuy on iTunes/Apple Music: ${t.appleMusicUrl || t.itunesUrl}\n`
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#0F1118] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-zinc-900/50">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Disc3 className="h-5 w-5 text-rose-500" />
                <span>My Saved Crate</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {savedTracks.length} {savedTracks.length === 1 ? 'song' : 'songs'} saved for listening & purchase
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subtotal Summary */}
          {savedTracks.length > 0 && (
            <div className="px-6 py-3 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Total Purchase Value:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                ${totalEstimate.toFixed(2)} USD
              </span>
            </div>
          )}

          {/* Track List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {savedTracks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Disc3 className="h-12 w-12 text-zinc-700 mb-3" />
                <p className="text-sm font-semibold text-zinc-300">Your crate is empty</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Save tracks using the bookmark button on any song card to curate your buying wishlist.
                </p>
              </div>
            ) : (
              savedTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <img
                    src={track.artwork}
                    alt={track.title}
                    className="h-12 w-12 rounded-lg object-cover bg-zinc-800 shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-rose-300 tabular-nums">
                        {track.trackPrice ? `$${track.trackPrice.toFixed(2)}` : '$1.29'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onPlayYouTube(track)}
                      title="Play on YouTube"
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors"
                    >
                      <Youtube className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={track.appleMusicUrl || track.itunesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buy on Apple Music / iTunes"
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => onRemoveTrack(track.id)}
                      title="Remove from Crate"
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Actions */}
          {savedTracks.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-zinc-900/50 space-y-2">
              <button
                onClick={handleCopyAllLinks}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors border border-white/10"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Copied All Purchase Links!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>Export / Copy All Purchase Links</span>
                  </>
                )}
              </button>

              <button
                onClick={onClearAll}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-2 transition-colors"
              >
                Clear All Tracks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
