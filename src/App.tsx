import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Disc3,
  ExternalLink,
  ShoppingBag,
  Youtube,
  Radio,
  Music2,
  RefreshCw,
} from 'lucide-react';
import { Track, SavedTrack, YouTubeVideo } from './types';
import {
  searchSongs,
  getCuratedCategory,
  getSavedTracks,
  saveTrack,
  removeSavedTrack,
  getSavedSearches,
  addSavedSearch,
  clearSavedSearches,
} from './services/api';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { GenreTabs } from './components/GenreTabs';
import { TrackCard } from './components/TrackCard';
import { YouTubeModalPlayer } from './components/YouTubeModalPlayer';
import { AudioPreviewBar } from './components/AudioPreviewBar';
import { SavedCrateDrawer } from './components/SavedCrateDrawer';
import { YouTubeVersionsModal } from './components/YouTubeVersionsModal';

// Hero background image from generation turn
import studioHeroImg from './assets/images/music_studio_hero_1790466563293.jpg';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Recent searches and saved crate
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [isCrateOpen, setIsCrateOpen] = useState(false);

  // Active Players state
  const [previewTrack, setPreviewTrack] = useState<Track | null>(null);
  const [youtubeTrack, setYoutubeTrack] = useState<Track | null>(null);
  const [isYtMinimized, setIsYtMinimized] = useState(false);

  // YouTube Versions modal
  const [versionModalTrack, setVersionModalTrack] = useState<Track | null>(null);

  // Load initial saved tracks and recent searches
  useEffect(() => {
    setSavedTracks(getSavedTracks());
    setRecentSearches(getSavedSearches());
    loadCategory('trending');
  }, []);

  const loadCategory = async (cat: string) => {
    setIsLoading(true);
    setIsSearching(false);
    setSearchQuery('');
    setActiveCategory(cat);
    try {
      const results = await getCuratedCategory(cat);
      setTracks(results);
    } catch (err) {
      console.error('Failed to load category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setIsSearching(true);
    setSearchQuery(query);
    const updated = addSavedSearch(query);
    setRecentSearches(updated);

    try {
      const results = await searchSongs(query, 32);
      setTracks(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRecent = () => {
    clearSavedSearches();
    setRecentSearches([]);
  };

  const handleToggleSave = (track: Track) => {
    const isCurrentlySaved = savedTracks.some((t) => t.id === track.id);
    let updated: SavedTrack[];
    if (isCurrentlySaved) {
      updated = removeSavedTrack(track.id);
    } else {
      updated = saveTrack(track);
    }
    setSavedTracks(updated);
  };

  const handleTogglePreview = (track: Track) => {
    if (previewTrack?.id === track.id) {
      setPreviewTrack(null);
    } else {
      setPreviewTrack(track);
    }
  };

  const handlePlayYouTube = (track: Track) => {
    // If preview audio is playing, stop it so they don't overlap
    setPreviewTrack(null);
    setYoutubeTrack(track);
    setIsYtMinimized(false);
  };

  const handleClearSearch = () => {
    loadCategory(activeCategory || 'trending');
  };

  return (
    <div className="min-h-screen bg-[#0B0D13] text-[#F3F4F6] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Contract (3 zones) */}
      <Header
        savedCount={savedTracks.length}
        onOpenSaved={() => setIsCrateOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={loadCategory}
      />

      {/* Hero Visual Showcase */}
      <section className="relative overflow-hidden border-b border-white/5 pt-12 pb-16 md:pt-16 md:pb-20">
        {/* Background photo scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={studioHeroImg}
            alt="Audio recording studio"
            className="w-full h-full object-cover object-center opacity-25 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13] via-[#0B0D13]/85 to-[#0B0D13]/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Natural title-case headline with balanced wrapping */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white [text-wrap:balance] max-w-4xl mx-auto leading-tight">
            Stream on YouTube.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-amber-300">
              Own on Apple Music & iTunes.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-300 [text-wrap:balance] max-w-2xl mx-auto leading-relaxed">
            Search any song across millions of tracks. Stream full audio & video instantly on
            YouTube, sample 30-second lossless previews, and jump directly to official Apple Music
            and iTunes pages for seamless purchasing.
          </p>

          {/* Prominent Search Bar Component */}
          <div className="mt-8">
            <SearchBar
              onSearch={handleSearch}
              recentSearches={recentSearches}
              onSelectRecent={handleSearch}
              onClearRecent={handleClearRecent}
              isLoading={isLoading && isSearching}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation & Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isSearching ? (
                <>
                  <Disc3 className="h-5 w-5 text-rose-500" />
                  <span>Results for &quot;{searchQuery}&quot;</span>
                </>
              ) : (
                <>
                  <Radio className="h-5 w-5 text-rose-500" />
                  <span>Curated Charts & Discoveries</span>
                </>
              )}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isSearching
                ? `${tracks.length} matching songs ready for streaming and purchase`
                : 'Selected high-fidelity tracks with verified store links and YouTube streams'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSearching ? (
              <button
                onClick={handleClearSearch}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                Back to Curated
              </button>
            ) : (
              <GenreTabs
                activeCategory={activeCategory}
                onSelectCategory={loadCategory}
                isSearching={isSearching}
              />
            )}
          </div>
        </div>

        {/* Tracks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-zinc-900/40 border border-white/5 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-zinc-800/60" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-zinc-800/80 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                  <div className="h-8 bg-zinc-800/40 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Music2 className="h-16 w-16 text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-white">No songs found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              We couldn&apos;t locate any songs matching your query. Check the spelling or search
              with just the artist or song title.
            </p>
            <button
              onClick={() => handleSearch('Daft Punk')}
              className="mt-4 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
            >
              Try &quot;Daft Punk&quot;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlayingPreview={previewTrack?.id === track.id}
                onTogglePreview={handleTogglePreview}
                onPlayYouTube={handlePlayYouTube}
                isSaved={savedTracks.some((t) => t.id === track.id)}
                onToggleSave={handleToggleSave}
                onShowYouTubeVersions={(t) => setVersionModalTrack(t)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Audio Preview Bar (iTunes 30s AAC) */}
      <AudioPreviewBar
        track={previewTrack}
        onClose={() => setPreviewTrack(null)}
        onOpenYouTube={handlePlayYouTube}
      />

      {/* YouTube Modal Player (Theater or Docked) */}
      <YouTubeModalPlayer
        track={youtubeTrack}
        onClose={() => setYoutubeTrack(null)}
        isMinimized={isYtMinimized}
        onToggleMinimize={() => setIsYtMinimized(!isYtMinimized)}
      />

      {/* Alternative YouTube Versions Modal */}
      <YouTubeVersionsModal
        track={versionModalTrack}
        onClose={() => setVersionModalTrack(null)}
        onSelectVideo={(track, video) => {
          setPreviewTrack(null);
          setYoutubeTrack({ ...track, youtubeId: video.id });
          setIsYtMinimized(false);
        }}
      />

      {/* Saved Tracks / Wishlist Drawer */}
      <SavedCrateDrawer
        isOpen={isCrateOpen}
        onClose={() => setIsCrateOpen(false)}
        savedTracks={savedTracks}
        onRemoveTrack={(id) => {
          const updated = removeSavedTrack(id);
          setSavedTracks(updated);
        }}
        onPlayYouTube={(track) => {
          setIsCrateOpen(false);
          handlePlayYouTube(track);
        }}
        onClearAll={() => {
          localStorage.removeItem('trackforge_saved_tracks');
          setSavedTracks([]);
        }}
      />

      {/* Quiet, Human Editorial Footer */}
      <footer className="mt-16 border-t border-white/5 bg-[#08090D] py-8 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Disc3 className="h-4 w-4 text-rose-500" />
            <span className="font-semibold text-zinc-300">TrackForge</span>
            <span aria-hidden="true">·</span>
            <span>YouTube Audio/Video Player & iTunes Music Purchasing Bridge</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <a
              href="https://music.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Apple Music</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>YouTube</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-zinc-600">Official Store API Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
