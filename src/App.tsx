/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GameCanvas } from './components/GameCanvas';
import { StatsModal } from './components/StatsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { loadGameStats } from './game/stats';
import { sounds } from './game/audio';

export default function App() {
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [stats, setStats] = useState(() => loadGameStats());

  // Modals & Screen sizing
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-100 select-none">
      <Header
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenStats={() => {
          sounds.playButtonClick();
          setStats(loadGameStats());
          setShowStats(true);
        }}
        onOpenHelp={() => {
          sounds.playButtonClick();
          setShowHelp(true);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      <main className="absolute inset-0 w-full overflow-hidden">
        <GameCanvas
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenStats={() => {
            setStats(loadGameStats());
            setShowStats(true);
          }}
        />
      </main>

      {/* Statistics & Records Modal */}
      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* How to Play Modal */}
      {showHelp && (
        <HowToPlayModal
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
