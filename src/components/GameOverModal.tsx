import React from 'react';
import { RotateCcw } from 'lucide-react';
import rudhraAvatar from '../assets/images/avatar.png';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6">
      <div className="relative isolate w-full max-w-3xl py-5 text-center sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-[min(90vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/15 blur-[90px]"
        />

        <div className="grid items-center gap-7 sm:gap-9 md:grid-cols-[0.8fr_1.2fr] md:gap-12 md:text-left">
          <div className="relative mx-auto">
            <div className="rounded-full border border-amber-200/40 bg-amber-200/5 p-2 shadow-[0_0_55px_rgba(245,158,11,0.2)]">
              <img
                src={rudhraAvatar}
                alt="Rudhra & Sacred Bull"
                referrerPolicy="no-referrer"
                className="h-28 w-28 rounded-full border border-white/20 object-cover shadow-2xl sm:h-40 sm:w-40"
              />
            </div>
            {isNewHighScore && (
              <span className="absolute -right-5 top-2 rounded-full border border-amber-100/60 bg-amber-300/90 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-950 shadow-lg shadow-amber-500/25 backdrop-blur-md sm:-right-8">
                New Record!
              </span>
            )}
          </div>

          <div className="flex flex-col items-center md:items-start">
            <div aria-hidden="true" className="mb-3 h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent md:from-amber-300 md:to-transparent" />
            <h2 className="font-display text-3xl font-extrabold uppercase text-white drop-shadow-[0_2px_18px_rgba(251,191,36,0.25)] sm:text-4xl">
              Charge Concluded
            </h2>

            <div className="mt-6 flex flex-col items-center md:items-start">
              <span className="text-xs font-semibold uppercase text-amber-100/65">Final Score</span>
              <span className="font-mono-numbers text-6xl font-black leading-none text-amber-300 drop-shadow-[0_0_28px_rgba(245,158,11,0.4)] sm:text-7xl">
                {Math.floor(score).toString().padStart(5, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 grid w-full max-w-xl grid-cols-2 divide-x divide-amber-100/20 border-y border-amber-100/20 bg-slate-950/25 py-4 backdrop-blur-md sm:mt-9 sm:py-5">
          <div className="px-2 text-center">
            <span className="block text-xs text-slate-300/75">Best:</span>
            <strong className="font-mono-numbers text-base font-bold text-white sm:text-lg">
              {highScore.toString().padStart(5, '0')}
            </strong>
          </div>
          <div className="px-2 text-center">
            <span className="block text-xs text-slate-300/75">Ghats Covered:</span>
            <strong className="font-mono-numbers text-base font-bold text-white sm:text-lg">
              {(score * 1.5).toFixed(0)}m
            </strong>
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-sm sm:mt-7">
          <button
            onClick={onRestart}
            autoFocus
            className="w-full rounded-xl border border-amber-100/60 bg-amber-200/20 py-3.5 px-5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(245,158,11,0.18)] backdrop-blur-xl transition-all hover:border-amber-100 hover:bg-amber-200/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ride Again</span>
            <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono text-white/85">SPACE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

