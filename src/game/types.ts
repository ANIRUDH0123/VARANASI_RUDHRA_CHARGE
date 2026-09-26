export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type GameMode = 'ENHANCED' | 'CLASSIC';

export type BiomeType = 'JURASSIC_VALLEY' | 'CRIMSON_CANYON' | 'NEO_CYBER';

export type ObstacleType = 'CACTUS_SMALL' | 'CACTUS_LARGE' | 'CACTUS_CLUSTER' | 'PTERODACTYL' | 'TUMBLEWEED';

export type PterodactylHeight = 'LOW' | 'MID' | 'HIGH';

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  pteroHeight?: PterodactylHeight;
  flapFrame?: number;
  flapTimer?: number;
  speedMultiplier?: number;
  passed?: boolean;
}

export type PowerUpType = 'SHIELD' | 'SLOW_MO' | 'DOUBLE_JUMP' | 'CHOMP';

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
  collected?: boolean;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark' | 'smoke';
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export interface DinoState {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isJumping: boolean;
  isDucking: boolean;
  jumpCount: number;
  maxJumps: number;
  runCycle: number;
  duckProgress: number; // 0 to 1 smooth transition
  hasShield: boolean;
  hasChomp: boolean;
  slowMoTimer: number;
  activePowerUp: PowerUpType | null;
  powerUpTimeRemaining: number;
}

export interface GameStats {
  highScore: number;
  totalGames: number;
  totalJumps: number;
  totalDucks: number;
  cactiCleared: number;
  pteroDodged: number;
  totalDistanceRun: number;
}
