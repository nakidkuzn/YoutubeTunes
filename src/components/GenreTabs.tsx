import React from 'react';

interface GenreTabsProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  isSearching: boolean;
}

export const GenreTabs: React.FC<GenreTabsProps> = ({
  activeCategory,
  onSelectCategory,
  isSearching,
}) => {
  const categories = [
    { id: 'trending', label: 'Global Top Hits' },
    { id: 'electronic', label: 'Electronic & Dance' },
    { id: 'hiphop', label: 'Hip-Hop & Rap' },
    { id: 'pop', label: 'Pop Essentials' },
    { id: 'rock', label: 'Rock & Alternative' },
    { id: 'rnb', label: 'R&B & Soul' },
    { id: 'indie', label: 'Indie & Bedroom' },
  ];

  if (isSearching) {
    return null;
  }

  return (
    <div className="flex items-center justify-start overflow-x-auto py-2 scrollbar-none gap-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-white text-zinc-950 shadow-md'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
