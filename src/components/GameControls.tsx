import React, { useState } from 'react';
import { ChevronsUp, ChevronsDown } from 'lucide-react';

interface GameControlsProps {
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onDuckStart: () => void;
  onDuckEnd: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onJumpStart,
  onJumpEnd,
  onDuckStart,
  onDuckEnd,
}) => {
  const [isJumpPressed, setIsJumpPressed] = useState(false);
  const [isBendPressed, setIsBendPressed] = useState(false);

  const handleBendStart = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsBendPressed(true);
    onDuckStart();
  };

  const handleBendEnd = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsBendPressed(false);
    onDuckEnd();
  };

  const handleJumpStart = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsJumpPressed(true);
    onJumpStart();
  };

  const handleJumpEnd = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsJumpPressed(false);
    onJumpEnd();
  };

  return (
    <div className="w-full bg-slate-950/35 backdrop-blur-md border-t border-white/10 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-6 select-none shrink-0 z-10">
      {/* BEND BUTTON (Horn Charge / Low Duck) */}
      <button
        type="button"
        onPointerDown={handleBendStart}
        onPointerUp={handleBendEnd}
        onPointerLeave={handleBendEnd}
        onPointerCancel={handleBendEnd}
        onTouchStart={handleBendStart}
        onTouchEnd={handleBendEnd}
        aria-label="Bend and charge low under obstacles"
        className={`flex-1 group relative overflow-hidden rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 transition-all duration-150 cursor-pointer touch-none select-none border flex items-center justify-between backdrop-blur-xl shadow-lg ${
          isBendPressed
            ? 'bg-amber-300/25 border-amber-200/70 scale-[0.98] shadow-amber-500/20'
            : 'bg-white/10 border-white/25 hover:bg-white/15 hover:border-amber-200/60 shadow-black/30'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 rounded-lg border transition-colors ${
            isBendPressed
              ? 'bg-amber-200/80 text-slate-950 border-white/60'
              : 'bg-white/10 text-amber-200 border-white/20 group-hover:border-amber-200/50'
          }`}>
            <ChevronsDown className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="font-display font-black text-xs sm:text-sm uppercase text-white">
            Bend
          </div>
        </div>

        {/* Keyboard hint badge */}
        <span className="inline-flex items-center justify-center font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-black/20 border border-white/15 text-white/80">
          ↓
        </span>
      </button>

      {/* JUMP BUTTON (Sacred Bull Leap) */}
      <button
        type="button"
        onPointerDown={handleJumpStart}
        onPointerUp={handleJumpEnd}
        onPointerLeave={handleJumpEnd}
        onPointerCancel={handleJumpEnd}
        onTouchStart={handleJumpStart}
        onTouchEnd={handleJumpEnd}
        aria-label="Jump over holy obstacles and monoliths"
        className={`flex-1 group relative overflow-hidden rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 transition-all duration-150 cursor-pointer touch-none select-none border flex items-center justify-between backdrop-blur-xl shadow-xl ${
          isJumpPressed
            ? 'bg-amber-200/70 border-white/80 scale-[0.98] shadow-amber-400/30 text-slate-950'
            : 'bg-amber-100/15 border-amber-100/45 hover:bg-amber-100/25 hover:border-amber-100/70 text-white'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 rounded-lg border transition-colors ${
            isJumpPressed
              ? 'bg-slate-950/80 text-amber-200 border-white/50'
              : 'bg-black/20 text-amber-100 border-white/20 group-hover:border-amber-100/50'
          }`}>
            <ChevronsUp className="w-5 h-5 stroke-[3]" />
          </div>

          <div className="font-display font-black text-xs sm:text-sm uppercase text-white">
            Jump
          </div>
        </div>

        {/* Keyboard hint badge */}
        <span className="inline-flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-black/20 border border-white/15 text-white/85">
          SPACE
        </span>
      </button>
    </div>
  );
};
