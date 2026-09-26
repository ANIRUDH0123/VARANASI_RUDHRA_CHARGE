import React from 'react';
import { Play, Trophy } from 'lucide-react';
import landingBackground from '../assets/images/varanasi_edited_pic.png';

interface TitleScreenProps {
  onStart: () => void;
  highScore: number;
  onOpenStats: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  highScore,
  onOpenStats,
}) => {
  return (
    <div
      className="absolute inset-0 z-20 p-4 sm:p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(7, 10, 17, 0.08), rgba(7, 10, 17, 0.2)), url(${landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute left-1/2 top-3/4 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-center">
        <button
          onClick={onStart}
          autoFocus
          className="w-full max-w-xs py-3.5 px-6 font-display text-base font-black text-white bg-amber-300/20 hover:bg-amber-200/30 border border-amber-100/50 hover:border-amber-100/80 backdrop-blur-xl active:scale-[0.98] rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-black/25 cursor-pointer uppercase tracking-wider"
        >
          <Play className="w-5 h-5 fill-white text-white" />
          <span>Charge Forward</span>
        </button>

        <button
          onClick={onOpenStats}
          className="w-full max-w-xs py-3 px-5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 backdrop-blur-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-black/20 transition-colors cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Sacred Scores</span>
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-1/2 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 text-center text-[10px] leading-relaxed text-white/75 drop-shadow-md sm:text-xs">
        Fan-made for entertainment &amp; appreciation only. Unofficial and not affiliated with or endorsed by Mahesh Babu or his representatives.
      </p>
    </div>
  );
};
