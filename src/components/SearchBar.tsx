import React, { useState } from 'react';
import { Search, X, History, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  recentSearches: string[];
  onSelectRecent: (query: string) => void;
  onClearRecent: () => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  recentSearches,
  onSelectRecent,
  onClearRecent,
  isLoading,
}) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term.trim());
    }
  };

  const handleClear = () => {
    setTerm('');
  };

  const popularSuggestions = [
    'Daft Punk Get Lucky',
    'Kendrick Lamar Not Like Us',
    'Chappell Roan Good Luck Babe',
    'Billie Eilish Birds of a Feather',
    'The Weeknd Blinding Lights',
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-zinc-400 group-focus-within:text-rose-400 transition-colors">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search any song, artist, or album (e.g. Daft Punk, Espresso, Fleetwood Mac)..."
            className="w-full h-14 pl-12 pr-28 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-base shadow-2xl backdrop-blur-md focus:outline-none focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/20 transition-all"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {term && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-zinc-400 hover:text-white rounded-md transition-colors"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !term.trim()}
              className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Searching</span>
                </span>
              ) : (
                <span>Search</span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested prompts / recent searches */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-500 font-medium">
          <Sparkles className="h-3 w-3 text-amber-400/80" />
          <span>Try:</span>
        </span>
        {popularSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setTerm(suggestion);
              onSearch(suggestion);
            }}
            className="px-2.5 py-1 rounded-md bg-zinc-900/60 border border-white/5 hover:border-white/20 hover:text-white transition-all text-left text-zinc-300"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="flex items-center gap-1 shrink-0 text-zinc-500 font-medium">
              <History className="h-3 w-3" />
              <span>Recent:</span>
            </span>
            {recentSearches.slice(0, 5).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setTerm(q);
                  onSelectRecent(q);
                }}
                className="shrink-0 px-2 py-0.5 rounded bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClearRecent}
            className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors ml-2 underline underline-offset-2"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
