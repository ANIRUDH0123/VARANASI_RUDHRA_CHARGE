import React from 'react';
import { X, Trophy, Flame, Compass, Wind, Footprints, ShieldCheck } from 'lucide-react';
import { GameStats } from '../game/types';
import rudhraAvatar from '../assets/images/avatar.png';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const statItems = [
    { label: 'Highest Record Score', value: stats.highScore.toLocaleString(), icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { label: 'Total Charges Made', value: stats.totalGames.toLocaleString(), icon: <Compass className="w-4 h-4 text-amber-500" /> },
    { label: 'Bull Leaps Over Hazards', value: stats.totalJumps.toLocaleString(), icon: <Wind className="w-4 h-4 text-sky-400" /> },
    { label: 'Air Dives & Horn Charges', value: stats.totalDucks.toLocaleString(), icon: <Footprints className="w-4 h-4 text-purple-400" /> },
    { label: 'Pillars & Braziers Cleared', value: stats.cactiCleared.toLocaleString(), icon: <Flame className="w-4 h-4 text-rose-400" /> },
    { label: 'Sky Raptors Dodged', value: stats.pteroDodged.toLocaleString(), icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> },
  ];

  const totalDistanceKm = (stats.totalDistanceRun * 0.0015).toFixed(2);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-lg sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-amber-200/20 bg-slate-950/90 shadow-[0_25px_100px_rgba(0,0,0,0.65)]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-28 -top-32 h-80 w-80 rounded-full bg-amber-700/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 border-b border-amber-100/15 px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-7">
          <div className="flex items-center gap-4">
            <img
              src={rudhraAvatar}
              alt="Rudhra & Sacred Bull"
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-full border border-amber-200/45 object-cover shadow-[0_0_28px_rgba(245,158,11,0.18)] sm:h-16 sm:w-16"
            />
            <div>
              <h3 className="font-display text-xl font-extrabold uppercase text-white sm:text-3xl">
                Varanasi Charge Records
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300/70 sm:text-sm">
                Lifetime expedition stats across the sacred ghats of Varanasi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:border-amber-200/40 hover:bg-amber-200/10 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 border-b border-amber-100/15 sm:grid-cols-[1.1fr_0.9fr] sm:divide-x sm:divide-amber-100/15">
            <div className="py-5 sm:py-7 sm:pr-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-100/65">Total Ghats Traversed</span>
              <div className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">
                {totalDistanceKm} <span className="font-sans text-sm font-medium text-amber-300 sm:text-base">kilometers</span>
              </div>
            </div>
            <div className="border-t border-amber-100/15 py-5 sm:border-l-0 sm:border-t-0 sm:py-7 sm:pl-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-200/75">Personal Record</span>
              <div className="mt-1 font-mono-numbers text-3xl font-black text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] sm:text-4xl">
                {stats.highScore.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {statItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 border-b border-amber-100/10 py-4 sm:py-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center border border-amber-100/15 bg-amber-100/5">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium leading-snug text-slate-300/80 sm:text-sm">{item.label}</span>
                </div>
                <div className="font-mono-numbers text-xl font-bold text-amber-100 sm:text-2xl">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-amber-100/15 bg-slate-950/70 px-5 py-4 sm:px-8">
          <button
            onClick={onClose}
            className="border border-amber-100/45 bg-amber-300/15 px-6 py-2.5 text-xs font-bold uppercase text-amber-50 shadow-lg shadow-amber-950/20 backdrop-blur-md transition-colors hover:bg-amber-300/25 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
