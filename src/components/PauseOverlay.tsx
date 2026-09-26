import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-30">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-center max-w-xs w-full flex flex-col items-center">
        <h3 className="font-display text-xl font-extrabold text-white tracking-tight">
          Game Paused
        </h3>
        <p className="text-xs text-slate-400 mt-1">Take a breath, your run is safe.</p>

        <div className="w-full flex flex-col gap-2.5 mt-5">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume (P)</span>
          </button>
          <button
            onClick={onRestart}
            className="w-full py-2 px-4 font-medium text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
