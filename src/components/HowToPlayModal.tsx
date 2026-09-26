import React from 'react';
import { X, Keyboard, Smartphone } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-lg sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-amber-200/20 bg-slate-950/90 shadow-[0_25px_100px_rgba(0,0,0,0.65)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-amber-700/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 border-b border-amber-100/15 px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-7">
          <div>
            <h3 className="font-display text-2xl font-extrabold uppercase text-white sm:text-3xl">
              How to Play Varanasi: Rudhra's Charge
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/75">
              Command the sacred Nandi bull, wield the divine Trishul, and clear the holy ghats!
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:border-amber-200/40 hover:bg-amber-200/10 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-7 overflow-y-auto px-5 py-5 text-xs text-slate-300 sm:px-8 sm:py-6 sm:text-sm">
          <div>
            <h4 className="mb-4 flex items-center gap-2 border-b border-amber-100/15 pb-3 text-xs font-bold uppercase tracking-wider text-amber-300 sm:text-sm">
              <span className="flex items-center gap-1.5 text-amber-200">
                <Keyboard className="h-4 w-4" />
                <Smartphone className="h-4 w-4" />
              </span>
              Keyboard & Touch Controls
            </h4>
            <div className="grid grid-cols-1 border-y border-amber-100/15 sm:grid-cols-2 sm:divide-x sm:divide-amber-100/15">
              <div className="py-4 sm:pr-6 sm:py-5">
                <div className="flex flex-wrap items-center justify-between gap-3 font-semibold text-white">
                  <span>JUMP (Bull Leap)</span>
                  <div className="flex items-center gap-1">
                    <span className="border border-amber-200/45 bg-amber-300/15 px-2 py-1 text-[10px] font-black text-amber-100 font-mono">JUMP</span>
                    <span className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200 font-mono">SPACE</span>
                    <span className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200 font-mono">↑</span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300/75 sm:text-sm">
                  Click or tap the golden <strong>JUMP</strong> button, or press Space/↑. Hold down for a towering soaring leap to clear high stone pillars and havan altars.
                </p>
              </div>

              <div className="border-t border-amber-100/15 py-4 sm:border-l-0 sm:border-t-0 sm:py-5 sm:pl-6">
                <div className="flex flex-wrap items-center justify-between gap-3 font-semibold text-white">
                  <span>BEND (Horn Charge / Dive)</span>
                  <div className="flex items-center gap-1">
                    <span className="border border-amber-200/45 bg-amber-300/15 px-2 py-1 text-[10px] font-bold text-amber-100 font-mono">BEND</span>
                    <span className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200 font-mono">↓</span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300/75 sm:text-sm">
                  Click or tap the bronze <strong>BEND</strong> button, or press ↓. Hunker flat and lower horns to slide under swooping raptors. Tap mid-air to drop-dive.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 border-b border-amber-100/15 pb-3 text-xs font-bold uppercase tracking-wider text-amber-300 sm:text-sm">
              Hazards Across the Holy Ghats
            </h4>
            <ul className="space-y-4 border-l border-amber-300/25 pl-4 text-xs leading-relaxed text-slate-300/75 sm:pl-5 sm:text-sm">
              <li className="relative pl-2">
                <span className="absolute -left-[1.55rem] top-1.5 h-2 w-2 rounded-full border border-amber-200/70 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" aria-hidden="true" />
                <span><strong className="text-amber-100">Ancient Stone Pillars:</strong> Carved monolithic Lingam pillars with marigold garlands. Time your leap precisely.</span>
              </li>
              <li className="relative pl-2">
                <span className="absolute -left-[1.55rem] top-1.5 h-2 w-2 rounded-full border border-amber-200/70 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" aria-hidden="true" />
                <span><strong className="text-amber-100">Sacred Havan Braziers:</strong> Stepped brass altars with roaring flames and embers.</span>
              </li>
              <li className="relative pl-2">
                <span className="absolute -left-[1.55rem] top-1.5 h-2 w-2 rounded-full border border-amber-200/70 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" aria-hidden="true" />
                <span><strong className="text-amber-100">Swooping Raptors (Score 120+):</strong> Mountain eagles soaring at three heights. Low requires jumping, mid requires ducking, high passes overhead safely.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end border-t border-amber-100/15 bg-slate-950/70 px-5 py-4 sm:px-8">
          <button
            onClick={onClose}
            className="border border-amber-100/45 bg-amber-300/15 px-6 py-2.5 text-xs font-bold uppercase text-amber-50 shadow-lg shadow-amber-950/20 backdrop-blur-md transition-colors hover:bg-amber-300/25 cursor-pointer"
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
};
