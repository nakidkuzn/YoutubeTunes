import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Youtube,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Track } from '../types';

interface AudioPreviewBarProps {
  track: Track | null;
  onClose: () => void;
  onOpenYouTube: (track: Track) => void;
}

export const AudioPreviewBar: React.FC<AudioPreviewBarProps> = ({
  track,
  onClose,
  onOpenYouTube,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!track?.previewUrl) {
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = track.previewUrl;
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!track || !track.previewUrl) return null;

  const formatSecs = (sec: number) => {
    const s = Math.floor(sec);
    return `0:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0E1017]/95 backdrop-blur-lg px-4 py-2.5 shadow-2xl transition-all">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 w-1/4 sm:w-1/3">
          <img
            src={track.artwork}
            alt={track.title}
            className="h-10 w-10 rounded-md object-cover border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{track.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Center: Play controls & Scrubber */}
        <div className="flex-1 max-w-md flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
              title={isPlaying ? 'Pause sample' : 'Play sample'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>
            <span className="text-[10px] text-zinc-400 font-mono tabular-nums">
              {formatSecs(currentTime)} / {formatSecs(duration)}
            </span>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={duration || 30}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Right side: Volume & CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Volume slider */}
          <div className="hidden md:flex items-center gap-1.5 text-zinc-400">
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-300"
            />
          </div>

          {/* Watch on YouTube button */}
          <button
            onClick={() => onOpenYouTube(track)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
          >
            <Youtube className="h-3.5 w-3.5" />
            <span>YouTube</span>
          </button>

          {/* Buy on Apple Music button */}
          <a
            href={track.appleMusicUrl || track.itunesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">
              {track.trackPrice ? `$${track.trackPrice.toFixed(2)}` : 'Buy'}
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Close preview bar */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Dismiss preview player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
