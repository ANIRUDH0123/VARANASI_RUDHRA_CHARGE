import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Trophy, HelpCircle } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  onOpenStats,
  onOpenHelp,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-slate-950/25 backdrop-blur-xl z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2 hover:text-amber-400 transition-colors">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          Varanasi: Rudhra's Charge
        </a>
      </div>

      {/* Zone 2: Clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
        <button
          onClick={onOpenHelp}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>How to Play</span>
        </button>
        <button
          onClick={onOpenStats}
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Trophy className="w-4 h-4 text-slate-400" />
          <span>Sacred Records</span>
        </button>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
          className="p-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl text-slate-200 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          aria-label="Toggle Fullscreen"
          className="hidden sm:flex p-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl text-slate-200 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
