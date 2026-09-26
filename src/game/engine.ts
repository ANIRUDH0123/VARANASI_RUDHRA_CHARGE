import {
  GameStatus,
  GameMode,
  DinoState,
  Obstacle,
  Particle,
  PowerUpItem,
  PowerUpType,
  PterodactylHeight,
  GameStats,
} from './types';
import { sounds } from './audio';
import { loadGameStats, saveGameStats } from './stats';

export interface EngineCallbacks {
  onScoreUpdate: (score: number, highScore: number) => void;
  onMilestone: (score: number) => void;
  onGameOver: (score: number, isHighScore: boolean) => void;
  onStateChange: (state: GameStatus) => void;
  onPowerUpUpdate: (type: PowerUpType | null, timeLeft: number) => void;
}

export class GameEngine {
  public state: GameStatus = 'MENU';
  public mode: GameMode = 'CLASSIC';
  public score: number = 0;
  public highScore: number = 0;
  public speed: number = 7.5;
  public groundOffset: number = 0;
  public stats: GameStats;

  public dino: DinoState;
  public obstacles: Obstacle[] = [];
  public powerUps: PowerUpItem[] = [];
  public particles: Particle[] = [];

  private nextObstacleDistance: number = 280;
  private distanceSinceLastObstacle: number = 0;
  private obstacleIdCounter: number = 1;
  private powerUpIdCounter: number = 1;

  private canvasWidth: number = 960;
  private canvasHeight: number = 360;
  private groundY: number = 295;

  private gravity: number = 0.68;
  private jumpForce: number = -12.4;
  private isHoldingJump: boolean = false;
  private jumpHoldTimer: number = 0;
  private maxJumpHold: number = 14;

  private isDownPressed: boolean = false;
  private invulnerableTimer: number = 0; // invincibility frames after shield hit

  private lastMilestoneAwarded: number = 0;
  private callbacks: EngineCallbacks;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
    this.stats = loadGameStats();
    this.highScore = this.stats.highScore;

    this.dino = this.createInitialDino();
  }

  public setDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.groundY = height - 65;
    this.dino.x = Math.max(75, Math.min(125, Math.round(width * 0.08)));
    if (this.dino.isGrounded) {
      this.dino.y = this.groundY;
    }
  }

  private createInitialDino(): DinoState {
    const startX = Math.max(75, Math.min(125, Math.round(this.canvasWidth * 0.08)));
    return {
      x: startX,
      y: this.groundY,
      vy: 0,
      width: 44,
      height: 48,
      isGrounded: true,
      isJumping: false,
      isDucking: false,
      jumpCount: 0,
      maxJumps: 1,
      runCycle: 0,
      duckProgress: 0,
      hasShield: false,
      hasChomp: false,
      slowMoTimer: 0,
      activePowerUp: null,
      powerUpTimeRemaining: 0,
    };
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
  }

  public start() {
    this.state = 'PLAYING';
    this.score = 0;
    this.speed = 7.5;
    this.groundOffset = 0;
    this.distanceSinceLastObstacle = 0;
    this.nextObstacleDistance = 320;
    this.lastMilestoneAwarded = 0;
    this.invulnerableTimer = 0;

    this.obstacles = [];
    this.powerUps = [];
    this.particles = [];

    this.dino = this.createInitialDino();
    sounds.playGameStartCue();
    sounds.startBackgroundMusic();
    this.callbacks.onStateChange(this.state);
    this.callbacks.onScoreUpdate(0, this.highScore);
    this.callbacks.onPowerUpUpdate(null, 0);

    this.stats.totalGames += 1;
    saveGameStats(this.stats);
  }

  public restart() {
    this.start();
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange(this.state);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange(this.state);
    }
  }

  // --- CONTROLS ---

  public handleJumpPress() {
    if (this.state === 'MENU' || this.state === 'GAME_OVER') {
      this.start();
      return;
    }
    if (this.state !== 'PLAYING') return;

    const canJump = this.dino.isGrounded || (this.dino.jumpCount < this.dino.maxJumps);

    if (canJump) {
      const isSecondJump = !this.dino.isGrounded && this.dino.jumpCount > 0;
      this.dino.vy = this.jumpForce;
      this.dino.isGrounded = false;
      this.dino.isJumping = true;
      this.dino.jumpCount += 1;
      this.isHoldingJump = true;
      this.jumpHoldTimer = 0;

      // Sound & Particles
      sounds.playJump(isSecondJump);
      this.emitJumpParticles(this.dino.x + 20, this.dino.y);

      this.stats.totalJumps += 1;
    }
  }

  public handleJumpRelease() {
    this.isHoldingJump = false;
  }

  public handleDuckPress() {
    this.isDownPressed = true;
    if (this.state !== 'PLAYING') return;

    this.dino.isDucking = true;

    // Fast-drop if in mid-air
    if (!this.dino.isGrounded) {
      this.dino.vy += 6.5; // diving down
    } else {
      sounds.playDuck();
      this.stats.totalDucks += 1;
    }
  }

  public handleDuckRelease() {
    this.isDownPressed = false;
    this.dino.isDucking = false;
  }

  // --- CORE UPDATE LOOP ---

  public update(deltaTime: number) {
    if (this.state !== 'PLAYING') return;

    // Time scaling (if Slow-Mo power-up is active)
    let speedMod = 1.0;
    if (this.dino.slowMoTimer > 0) {
      speedMod = 0.55;
      this.dino.slowMoTimer -= deltaTime;
      if (this.dino.slowMoTimer <= 0) {
        this.dino.slowMoTimer = 0;
        if (this.dino.activePowerUp === 'SLOW_MO') {
          this.dino.activePowerUp = null;
          this.callbacks.onPowerUpUpdate(null, 0);
        }
      }
    }

    // Active power-up timer countdown
    if (this.dino.powerUpTimeRemaining > 0) {
      this.dino.powerUpTimeRemaining -= deltaTime;
      this.callbacks.onPowerUpUpdate(this.dino.activePowerUp, Math.max(0, this.dino.powerUpTimeRemaining));
      if (this.dino.powerUpTimeRemaining <= 0) {
        this.clearActivePowerUp();
      }
    }

    // Invulnerability timer countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaTime;
    }

    // Base speed progression: smoothly scales with score (from 7.5 to ~15.5)
    const targetSpeed = Math.min(15.5, 7.5 + Math.floor(this.score / 100) * 0.45);
    this.speed = targetSpeed * speedMod;

    // Update score based on distance run
    const distanceStep = this.speed * 0.12;
    this.groundOffset += this.speed;
    this.stats.totalDistanceRun += distanceStep;

    const previousScore = this.score;
    this.score += distanceStep;
    const currentScoreInt = Math.floor(this.score);

    // Score Milestone check (every 100 points)
    if (currentScoreInt > 0 && currentScoreInt % 100 === 0 && currentScoreInt !== this.lastMilestoneAwarded) {
      this.lastMilestoneAwarded = currentScoreInt;
      sounds.playMilestone();
      this.callbacks.onMilestone(currentScoreInt);
      this.emitConfetti(this.canvasWidth * 0.8, 60);
    }

    if (currentScoreInt !== Math.floor(previousScore)) {
      if (currentScoreInt > this.highScore) {
        this.highScore = currentScoreInt;
      }
      this.callbacks.onScoreUpdate(currentScoreInt, this.highScore);
    }

    // --- DINO PHYSICS ---
    this.updateDino(deltaTime);

    // --- OBSTACLES & SPAWNING ---
    this.updateObstacles(deltaTime);

    // --- POWER-UPS ---
    if (this.mode === 'ENHANCED') {
      this.updatePowerUps(deltaTime);
    }

    // --- PARTICLES ---
    this.updateParticles(deltaTime);

    // --- RUNNING DUST PUFFS & HOOFBEATS ---
    if (this.dino.isGrounded && Math.random() < 0.4) {
      this.emitFootstepDust(this.dino.x + 8, this.groundY);
      this.emitFootstepDust(this.dino.x + 46, this.groundY);
      if (Math.random() < 0.15) {
        sounds.playHoofStep();
      }
    }
  }

  private updateDino(deltaTime: number) {
    const dino = this.dino;

    // Duck progress animation interpolation
    const targetDuck = dino.isDucking ? 1 : 0;
    dino.duckProgress += (targetDuck - dino.duckProgress) * 0.3;

    // Variable jump holding (extends height when button held)
    if (this.isHoldingJump && dino.isJumping && this.jumpHoldTimer < this.maxJumpHold) {
      dino.vy -= 0.32;
      this.jumpHoldTimer += 1;
    }

    // Downward diving
    if (this.isDownPressed && !dino.isGrounded) {
      dino.vy += 1.2;
    }

    // Apply gravity
    dino.vy += this.gravity;
    dino.y += dino.vy;

    // Ground landing check
    if (dino.y >= this.groundY) {
      dino.y = this.groundY;
      dino.vy = 0;
      if (!dino.isGrounded) {
        // Just landed
        dino.isGrounded = true;
        dino.isJumping = false;
        dino.jumpCount = 0;
        this.emitLandingDust(dino.x + 20, this.groundY);
      }
    } else {
      dino.isGrounded = false;
    }

    // Running animation leg phase
    if (dino.isGrounded) {
      dino.runCycle += 0.05 * this.speed;
    }
  }

  private updateObstacles(deltaTime: number) {
    this.distanceSinceLastObstacle += this.speed;

    // Spawn new obstacle
    if (this.distanceSinceLastObstacle >= this.nextObstacleDistance) {
      this.spawnObstacle();
      this.distanceSinceLastObstacle = 0;
      // Dynamic minimum gap ensures obstacle is jumpable at high speeds
      const minGap = Math.max(220, 260 + this.speed * 8);
      const randomExtra = Math.random() * 200;
      this.nextObstacleDistance = minGap + randomExtra;
    }

    // Move and prune obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const speed = this.speed * (obs.speedMultiplier || 1);
      obs.x -= speed;

      // Flapping pterodactyl animation
      if (obs.type === 'PTERODACTYL') {
        obs.flapFrame = (obs.flapFrame || 0) + 1;
      }

      // Check if cleared
      if (!obs.passed && obs.x + obs.width < this.dino.x) {
        obs.passed = true;
        if (obs.type === 'PTERODACTYL') {
          this.stats.pteroDodged += 1;
        } else {
          this.stats.cactiCleared += 1;
        }
      }

      // Collision Detection
      if (this.checkCollision(this.dino, obs)) {
        if (this.invulnerableTimer > 0) {
          // In invincibility frames, pass through safely
          continue;
        }

        // Chomp power-up: smash right through
        if (this.dino.hasChomp) {
          sounds.playMilestone();
          this.emitExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#f59e0b');
          this.obstacles.splice(i, 1);
          continue;
        }

        // Shield power-up: absorb hit
        if (this.dino.hasShield) {
          sounds.playShieldBreak();
          this.dino.hasShield = false;
          this.dino.activePowerUp = null;
          this.invulnerableTimer = 1.2; // 1.2s invulnerability
          this.callbacks.onPowerUpUpdate(null, 0);
          this.emitExplosion(this.dino.x + 20, this.dino.y - 20, '#06b6d4');
          this.obstacles.splice(i, 1);
          continue;
        }

        // Fatal collision
        this.triggerGameOver();
        return;
      }

      // Remove off-screen obstacles
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private spawnObstacle() {
    const id = this.obstacleIdCounter++;
    const currentScore = Math.floor(this.score);

    // Pterodactyls unlock at score 120
    const allowPtero = currentScore >= 120 && Math.random() < 0.38;

    if (allowPtero) {
      // 3 Flying Heights:
      // LOW: requires jumping
      // MID: requires ducking
      // HIGH: can run under safely
      const heights: PterodactylHeight[] = ['LOW', 'MID', 'HIGH'];
      const pteroHeight = heights[Math.floor(Math.random() * heights.length)];

      let yPos = this.groundY - 38; // LOW
      if (pteroHeight === 'MID') {
        yPos = this.groundY - 60; // MID (hits standing dino, clears ducking dino)
      } else if (pteroHeight === 'HIGH') {
        yPos = this.groundY - 95; // HIGH (soars overhead)
      }

      this.obstacles.push({
        id,
        type: 'PTERODACTYL',
        x: this.canvasWidth + 20,
        y: yPos,
        width: 48,
        height: 36,
        pteroHeight,
        flapFrame: 0,
        speedMultiplier: 1.15, // Pterodactyls fly slightly faster than ground speed
      });
      return;
    }

    // Cacti Spawning
    const rand = Math.random();
    if (rand < 0.45) {
      // Small Saguaro
      this.obstacles.push({
        id,
        type: 'CACTUS_SMALL',
        x: this.canvasWidth + 20,
        y: this.groundY - 38,
        width: 24,
        height: 40,
      });
    } else if (rand < 0.8) {
      // Large Saguaro with arms
      this.obstacles.push({
        id,
        type: 'CACTUS_LARGE',
        x: this.canvasWidth + 20,
        y: this.groundY - 54,
        width: 38,
        height: 56,
      });
    } else {
      // Cactus Cluster
      this.obstacles.push({
        id,
        type: 'CACTUS_CLUSTER',
        x: this.canvasWidth + 20,
        y: this.groundY - 48,
        width: 60,
        height: 50,
      });
    }

    // Occasional power-up behind obstacle in Enhanced mode
    if (this.mode === 'ENHANCED' && Math.random() < 0.22 && this.powerUps.length === 0) {
      this.spawnPowerUp(this.canvasWidth + 180);
    }
  }

  private spawnPowerUp(spawnX: number) {
    const types: PowerUpType[] = ['SHIELD', 'SLOW_MO', 'DOUBLE_JUMP', 'CHOMP'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push({
      id: this.powerUpIdCounter++,
      type,
      x: spawnX,
      y: this.groundY - 50 - Math.random() * 45,
      size: 14,
      bobOffset: Math.random() * Math.PI,
    });
  }

  private updatePowerUps(deltaTime: number) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.x -= this.speed;

      // Collect check (bounding circle / box)
      const dinoCenterX = this.dino.x + 22;
      const dinoCenterY = this.dino.y - (this.dino.isDucking ? 14 : 26);
      const dist = Math.hypot(dinoCenterX - p.x, dinoCenterY - p.y);

      if (dist < 34) {
        // Collected!
        sounds.playPowerUpCollect();
        this.activatePowerUp(p.type);
        this.emitExplosion(p.x, p.y, '#38bdf8');
        this.powerUps.splice(i, 1);
        continue;
      }

      if (p.x < -50) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  private activatePowerUp(type: PowerUpType) {
    this.dino.activePowerUp = type;

    if (type === 'SHIELD') {
      this.dino.hasShield = true;
      this.dino.powerUpTimeRemaining = 12; // 12 seconds
    } else if (type === 'SLOW_MO') {
      this.dino.slowMoTimer = 6; // 6 seconds
      this.dino.powerUpTimeRemaining = 6;
    } else if (type === 'DOUBLE_JUMP') {
      this.dino.maxJumps = 2;
      this.dino.powerUpTimeRemaining = 10;
    } else if (type === 'CHOMP') {
      this.dino.hasChomp = true;
      this.dino.powerUpTimeRemaining = 8;
    }

    this.callbacks.onPowerUpUpdate(type, this.dino.powerUpTimeRemaining);
  }

  private clearActivePowerUp() {
    this.dino.hasShield = false;
    this.dino.hasChomp = false;
    this.dino.maxJumps = 1;
    this.dino.activePowerUp = null;
    this.dino.powerUpTimeRemaining = 0;
    this.callbacks.onPowerUpUpdate(null, 0);
  }

  // --- COLLISION DETECTION (Precise Sub-boxes) ---

  private checkCollision(dino: DinoState, obs: Obstacle): boolean {
    // Precise Bull & Rudhra hitbox calculation
    const isDuck = dino.isDucking && dino.duckProgress > 0.4;
    const dinoHitbox = {
      x: dino.x + (isDuck ? 6 : 10),
      y: dino.y - (isDuck ? 24 : 48),
      width: isDuck ? 54 : 42,
      height: isDuck ? 22 : 46,
    };

    // Obstacle tight sub-box (insetting needle margins so grazing is forgivable)
    const obsHitbox = {
      x: obs.x + 4,
      y: obs.y + 4,
      width: obs.width - 8,
      height: obs.height - 6,
    };

    // AABB intersection check
    return (
      dinoHitbox.x < obsHitbox.x + obsHitbox.width &&
      dinoHitbox.x + dinoHitbox.width > obsHitbox.x &&
      dinoHitbox.y < obsHitbox.y + obsHitbox.height &&
      dinoHitbox.y + dinoHitbox.height > obsHitbox.y
    );
  }

  // --- GAME OVER ---

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    sounds.stopBackgroundMusic();
    sounds.playGameOver();

    const finalScore = Math.floor(this.score);
    const isHighScore = finalScore > this.stats.highScore;
    if (isHighScore) {
      this.stats.highScore = finalScore;
    }

    saveGameStats(this.stats);

    // Crash particle effect
    this.emitExplosion(this.dino.x + 20, this.dino.y - 20, '#ef4444');

    this.callbacks.onStateChange(this.state);
    this.callbacks.onGameOver(finalScore, isHighScore);
  }

  // --- PARTICLES ---

  private updateParticles(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life += deltaTime;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.shape === 'smoke') {
        p.size += 0.15;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private emitFootstepDust(x: number, y: number) {
    this.particles.push({
      x: x + (Math.random() * 6 - 3),
      y: y - 2,
      vx: -(Math.random() * 2 + 1),
      vy: -(Math.random() * 1.5 + 0.2),
      size: 2.5 + Math.random() * 2,
      color: 'rgba(217, 119, 6, 0.45)',
      alpha: 0.6,
      life: 0,
      maxLife: 0.35,
      shape: 'smoke',
    });
  }

  private emitJumpParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() * 14 - 7),
        y: y,
        vx: (Math.random() - 0.5) * 4 - 2,
        vy: -(Math.random() * 2 + 1),
        size: 3 + Math.random() * 2.5,
        color: 'rgba(245, 158, 11, 0.6)',
        alpha: 0.8,
        life: 0,
        maxLife: 0.4,
        shape: 'smoke',
      });
    }
  }

  private emitLandingDust(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.particles.push({
        x: x,
        y: y - 2,
        vx: dir * (Math.random() * 3.5 + 1),
        vy: -(Math.random() * 2 + 0.5),
        size: 3 + Math.random() * 2,
        color: 'rgba(217, 119, 6, 0.5)',
        alpha: 0.8,
        life: 0,
        maxLife: 0.35,
        shape: 'smoke',
      });
    }
  }

  private emitExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.6,
        shape: 'spark',
      });
    }
  }

  private emitConfetti(x: number, y: number) {
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399', '#a855f7'];
    for (let i = 0; i < 28; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI / 2;
      const speed = Math.random() * 6 + 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 1.2,
        shape: 'square',
      });
    }
  }
}
