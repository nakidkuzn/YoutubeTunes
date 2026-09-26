import React from 'react';
import { Bookmark, Disc3 } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  activeCategory,
  onSelectCategory,
}) => {
  const navCategories = [
    { id: 'trending', label: 'Top Hits' },
    { id: 'electronic', label: 'Electronic' },
    { id: 'hiphop', label: 'Hip-Hop' },
    { id: 'rock', label: 'Rock' },
    { id: 'pop', label: 'Pop' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0D13]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <Disc3 className="h-6 w-6 text-rose-500 animate-[spin_10s_linear_infinite]" />
          <span>TrackForge</span>
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`transition-colors hover:text-white ${
                activeCategory === cat.id ? 'text-white font-semibold' : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary action (Saved Wishlist Crate) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-2 rounded-lg bg-zinc-800/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white focus-visible:outline-2 focus-visible:outline-rose-500"
            title="View saved tracks and purchase wishlist"
          >
            <Bookmark className="h-3.5 w-3.5 text-rose-400" />
            <span className="whitespace-nowrap">My Crate</span>
            {savedCount > 0 && (
              <span className="font-mono text-[11px] text-rose-300">
                ({savedCount})
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
