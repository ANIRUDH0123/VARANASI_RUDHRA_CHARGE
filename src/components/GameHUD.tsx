import React from 'react';
import { Shield, Zap, Flame, Wind } from 'lucide-react';
import { PowerUpType } from '../game/types';

interface GameHUDProps {
  score: number;
  highScore: number;
  milestoneFlash: string | null;
  activePowerUp: PowerUpType | null;
  powerUpTimeRemaining: number;
  speed: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  milestoneFlash,
  activePowerUp,
  powerUpTimeRemaining,
  speed,
}) => {
  // Format score with leading zeroes (5 digits)
  const formatScore = (num: number) => Math.floor(num).toString().padStart(5, '0');

  // Determine current biome name based on score
  const getBiomeName = (s: number) => {
    const location = Math.floor(s / 560) % 5;
    return [
      'Ganga Dawn Ghats',
      'Ross Ice Shelf',
      'Blue Ice Cavern',
      'Amboseli Wilderness',
      'Kaal Bhairav Sanctum',
    ][location];
  };

  const powerUpIcons: Record<PowerUpType, { label: string; icon: React.ReactNode; color: string; maxTime: number }> = {
    SHIELD: { label: 'SHIVA KAVACH', icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />, color: 'bg-cyan-400', maxTime: 12 },
    SLOW_MO: { label: 'KAAL GATI', icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, color: 'bg-amber-400', maxTime: 6 },
    DOUBLE_JUMP: { label: 'ANJANEYA LEAP', icon: <Wind className="w-3.5 h-3.5 text-emerald-400" />, color: 'bg-emerald-400', maxTime: 10 },
    CHOMP: { label: 'TRISHUL ASTRA', icon: <Flame className="w-3.5 h-3.5 text-rose-400" />, color: 'bg-rose-400', maxTime: 8 },
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 pointer-events-none flex flex-col justify-between select-none">
      <div className="flex items-start justify-between">
        {/* Left: Environment metadata and speed */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-300 drop-shadow-md">
          <span className="text-amber-400 font-bold">{getBiomeName(score)}</span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="font-mono-numbers text-slate-300">{speed.toFixed(1)}x Velocity</span>
        </div>

        {/* Right: Scores adhering to zero-pill rule */}
        <div className="flex items-center gap-4 text-right">
          {highScore > 0 && (
            <div className="flex items-baseline gap-1 text-slate-400 font-mono-numbers text-sm sm:text-base tracking-widest drop-shadow-md">
              <span className="text-xs uppercase text-slate-500 font-sans font-bold">HI</span>
              <span className="text-slate-300">{formatScore(highScore)}</span>
            </div>
          )}

          <div className="flex items-baseline gap-1 font-mono-numbers text-xl sm:text-2xl font-bold tracking-widest text-white drop-shadow-lg">
            <span className="text-amber-400">{formatScore(score)}</span>
          </div>
        </div>
      </div>

      {/* Center: Milestone Flash Notification */}
      {milestoneFlash && (
        <div className="self-center mt-3 animate-bounce">
          <div className="text-xs sm:text-sm font-display font-extrabold tracking-widest text-amber-300 uppercase drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
            ★ {milestoneFlash} ★
          </div>
        </div>
      )}

      {/* Active Power-Up Timer HUD */}
      {activePowerUp && (
        <div className="self-start mt-2 pointer-events-auto">
          {(() => {
            const config = powerUpIcons[activePowerUp];
            const max = config.maxTime;
            const progress = Math.min(100, Math.max(0, (powerUpTimeRemaining / max) * 100));
            return (
              <div className="flex flex-col gap-1 bg-slate-950/80 border border-slate-800 rounded-md px-3 py-1.5 backdrop-blur-md shadow-lg min-w-[130px]">
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold tracking-wider text-slate-200">
                  <div className="flex items-center gap-1.5">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                  <span className="font-mono-numbers text-slate-400">{Math.ceil(powerUpTimeRemaining)}s</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.color} transition-all duration-100 rounded-full`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
