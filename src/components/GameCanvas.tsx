import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { GameStatus, PowerUpType, GameStats } from '../game/types';
import { loadGameStats } from '../game/stats';
import { GameHUD } from './GameHUD';
import { GameOverModal } from './GameOverModal';
import { TitleScreen } from './TitleScreen';
import { PauseOverlay } from './PauseOverlay';
import { GameControls } from './GameControls';

interface GameCanvasProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStats: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isMuted,
  onToggleMute,
  onOpenStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // React State for HUD & Modals
  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(7.5);
  const [milestoneFlash, setMilestoneFlash] = useState<string | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [powerUpTimeRemaining, setPowerUpTimeRemaining] = useState<number>(0);

  // Game over state
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [, setStats] = useState<GameStats>(() => loadGameStats());

  // Milestone flash effect
  const triggerMilestone = useCallback((mScore: number) => {
    setMilestoneFlash(`${mScore} POINTS!`);
    setTimeout(() => {
      setMilestoneFlash(null);
    }, 1800);
  }, []);

  // Initialize engine
  useEffect(() => {
    const engine = new GameEngine({
      onScoreUpdate: (newScore, newHighScore) => {
        setScore(newScore);
        setHighScore(newHighScore);
      },
      onMilestone: (mScore) => {
        triggerMilestone(mScore);
      },
      onGameOver: (finalScore, isHigh) => {
        setIsNewHighScore(isHigh);
        setStats(loadGameStats());
      },
      onStateChange: (state) => {
        setGameStatus(state);
      },
      onPowerUpUpdate: (type, timeLeft) => {
        setActivePowerUp(type);
        setPowerUpTimeRemaining(timeLeft);
      },
    });

    engineRef.current = engine;
    setHighScore(engine.highScore);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [triggerMilestone]);

  // Resize handler for responsive high-DPI canvas
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const controlsHeight = gameStatus === 'PLAYING' ? 76 : 0;
    const height = Math.max(240, container.clientHeight - controlsHeight);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }

    if (rendererRef.current) {
      rendererRef.current.resize(width, height, dpr);
    } else if (ctx) {
      rendererRef.current = new GameRenderer(ctx, width, height);
    }

    if (engineRef.current) {
      engineRef.current.setDimensions(width, height);
    }
  }, [gameStatus]);

  // Main Animation Loop
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(ctx, canvas.clientWidth, canvas.clientHeight);
    }

    let running = true;

    const renderLoop = (time: number) => {
      if (!running) return;

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.05); // cap at 50ms to prevent huge jumps
      lastTimeRef.current = time;

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer && ctx) {
        // Update physics if playing
        engine.update(deltaTime);
        setSpeed(engine.speed);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // 1. Render Background, Day/Night progression, parallax temples & ghats
        renderer.renderBackground(engine.score, engine.groundOffset, engine.speed, time / 1000);

        // 2. Render Power-Up items on track
        engine.powerUps.forEach((item) => {
          renderer.renderPowerUp(item, time / 1000);
        });

        // 3. Render Obstacles
        engine.obstacles.forEach((obs) => {
          renderer.renderObstacle(obs, time / 1000);
        });

        // 4. Render Rudhra and Sacred Bull
        renderer.renderRudhraAndBull(engine.dino, engine.state === 'GAME_OVER', time / 1000);

        // 5. Render Particle System
        renderer.renderParticles(engine.particles);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      running = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling on Space and Arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.handleJumpPress();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.handleDuckPress();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        engine.togglePause();
      } else if (e.code === 'Enter') {
        if (engine.state === 'GAME_OVER' || engine.state === 'MENU') {
          engine.start();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.handleJumpRelease();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.handleDuckRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Canvas direct touch / click handlers
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.state === 'MENU' || engine.state === 'GAME_OVER') {
      engine.start();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const height = rect.height;

    // If tapped lower 30%, duck; otherwise jump
    if (clickY > height * 0.7) {
      engine.handleDuckPress();
    } else {
      engine.handleJumpPress();
    }
  };

  const handleCanvasPointerUp = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.handleJumpRelease();
    engine.handleDuckRelease();
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950"
      >
        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            className="block w-full cursor-pointer select-none"
          />

          {/* HUD Display (Scores & Active Power-Ups) */}
          {gameStatus === 'PLAYING' && (
            <GameHUD
              score={score}
              highScore={highScore}
              milestoneFlash={milestoneFlash}
              activePowerUp={activePowerUp}
              powerUpTimeRemaining={powerUpTimeRemaining}
              speed={speed}
            />
          )}

          {/* Title Screen Overlay */}
          {gameStatus === 'MENU' && (
            <TitleScreen
              onStart={() => engineRef.current?.start()}
              highScore={highScore}
              onOpenStats={onOpenStats}
            />
          )}

          {/* Pause Overlay */}
          {gameStatus === 'PAUSED' && (
            <PauseOverlay
              onResume={() => engineRef.current?.togglePause()}
              onRestart={() => engineRef.current?.start()}
            />
          )}

          {/* Game Over Modal */}
          {gameStatus === 'GAME_OVER' && (
            <GameOverModal
              score={score}
              highScore={highScore}
              isNewHighScore={isNewHighScore}
              onRestart={() => engineRef.current?.start()}
            />
          )}
        </div>

        {gameStatus === 'PLAYING' && (
          <GameControls
            onJumpStart={() => engineRef.current?.handleJumpPress()}
            onJumpEnd={() => engineRef.current?.handleJumpRelease()}
            onDuckStart={() => engineRef.current?.handleDuckPress()}
            onDuckEnd={() => engineRef.current?.handleDuckRelease()}
          />
        )}
      </div>
    </div>
  );
};
