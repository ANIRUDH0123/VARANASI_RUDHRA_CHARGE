import { GameStats } from './types';

const STATS_STORAGE_KEY = 'varanasi_rudhra_stats_v1';

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY) || localStorage.getItem('apex_dino_stats_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        highScore: parsed.highScore || 0,
        totalGames: parsed.totalGames || 0,
        totalJumps: parsed.totalJumps || 0,
        totalDucks: parsed.totalDucks || 0,
        cactiCleared: parsed.cactiCleared || 0,
        pteroDodged: parsed.pteroDodged || 0,
        totalDistanceRun: parsed.totalDistanceRun || 0,
      };
    }
  } catch {
    // fallback
  }

  return {
    highScore: 0,
    totalGames: 0,
    totalJumps: 0,
    totalDucks: 0,
    cactiCleared: 0,
    pteroDodged: 0,
    totalDistanceRun: 0,
  };
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}
