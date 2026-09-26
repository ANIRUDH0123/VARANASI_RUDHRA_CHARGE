import { DinoState, Obstacle, Particle, Cloud, Star, PowerUpItem } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 960;
  private height: number = 360;
  private groundY: number = 290;
  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  private ghatSteps: { x: number; width: number; height: number }[] = [];
  private dpr: number = 1;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.groundY = height - 65;
    this.initEnvironment();
  }

  public resize(width: number, height: number, dpr: number = 1) {
    const prevWidth = this.width;
    this.width = width;
    this.height = height;
    this.groundY = height - 65;
    this.dpr = dpr;
    if (Math.abs(prevWidth - width) > 80 || this.clouds.length === 0) {
      this.initEnvironment();
    }
  }

  private initEnvironment() {
    // Generate atmospheric sky clouds scaled to canvas width
    this.clouds = [];
    const numClouds = Math.max(7, Math.round(this.width / 150));
    for (let i = 0; i < numClouds; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: 20 + Math.random() * Math.min(140, this.groundY * 0.35),
        scale: 0.6 + Math.random() * 0.7,
        speed: 0.2 + Math.random() * 0.35,
        opacity: 0.35 + Math.random() * 0.35,
      });
    }

    // Generate night stars / twilight floating lanterns scaled to canvas width
    this.stars = [];
    const numStars = Math.max(50, Math.round(this.width / 20));
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.groundY - 70),
        radius: 0.8 + Math.random() * 1.5,
        twinkleSpeed: 1 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Varanasi day cycle: Holy Dawn -> Sacred Noon -> Ganga Aarti Twilight -> Kashi Midnight.
   */
  public getDayCycle(score: number): {
    skyTop: string;
    skyBottom: string;
    templeSilhouette: string;
    gangaWaterColor: string;
    groundColor: string;
    groundLineColor: string;
    sunMoonProgress: number;
    isNight: boolean;
    nightAlpha: number;
    sunColor: string;
    atmosphereHaze: string;
  } {
    const cycleLength = 1600;
    const currentProg = (score % cycleLength) / cycleLength; // 0 to 1

    if (currentProg < 0.25) {
      // Holy Dawn at Varanasi Ghats (0 to 400)
      const t = currentProg / 0.25;
      return {
        skyTop: this.lerpColor('#1c1917', '#1e3a8a', t),
        skyBottom: this.lerpColor('#f97316', '#fed7aa', t),
        templeSilhouette: this.lerpColor('#292524', '#7c2d12', t),
        gangaWaterColor: '#c2410c',
        groundColor: '#451a03',
        groundLineColor: '#ea580c',
        sunMoonProgress: t,
        isNight: false,
        nightAlpha: Math.max(0, 1 - t * 2.5),
        sunColor: '#fbbf24',
        atmosphereHaze: 'rgba(251, 146, 60, 0.2)',
      };
    } else if (currentProg < 0.55) {
      // Sacred Golden Afternoon (400 to 880)
      return {
        skyTop: '#0369a1',
        skyBottom: '#fdba74',
        templeSilhouette: '#78350f',
        gangaWaterColor: '#0284c7',
        groundColor: '#78350f',
        groundLineColor: '#f59e0b',
        sunMoonProgress: (currentProg - 0.25) / 0.3,
        isNight: false,
        nightAlpha: 0,
        sunColor: '#fef08a',
        atmosphereHaze: 'rgba(253, 224, 71, 0.15)',
      };
    } else if (currentProg < 0.75) {
      // Grand Ganga Aarti Twilight (880 to 1200)
      const t = (currentProg - 0.55) / 0.2;
      return {
        skyTop: this.lerpColor('#0369a1', '#311042', t),
        skyBottom: this.lerpColor('#fdba74', '#e11d48', t),
        templeSilhouette: this.lerpColor('#78350f', '#4a044e', t),
        gangaWaterColor: '#701a75',
        groundColor: this.lerpColor('#78350f', '#2e1065', t),
        groundLineColor: '#f43f5e',
        sunMoonProgress: t,
        isNight: false,
        nightAlpha: t * 0.6,
        sunColor: '#f43f5e',
        atmosphereHaze: 'rgba(244, 63, 94, 0.22)',
      };
    } else {
      // Kashi Vishwanath Midnight (1200 to 1600)
      const t = (currentProg - 0.75) / 0.25;
      return {
        skyTop: '#050814',
        skyBottom: '#0f172a',
        templeSilhouette: '#1e1b4b',
        gangaWaterColor: '#030712',
        groundColor: '#0a0f1d',
        groundLineColor: '#38bdf8',
        sunMoonProgress: t,
        isNight: true,
        nightAlpha: 1,
        sunColor: '#f8fafc',
        atmosphereHaze: 'rgba(56, 189, 248, 0.1)',
      };
    }
  }

  private lerpColor(c1: string, c2: string, factor: number): string {
    const parse = (hex: string) => {
      const v = parseInt(hex.slice(1), 16);
      return [v >> 16, (v >> 8) & 255, v & 255];
    };
    const [r1, g1, b1] = parse(c1);
    const [r2, g2, b2] = parse(c2);
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Renders the cinematic Varanasi temple ghat backdrop, river Ganges, and sacred dust atmosphere.
   */
  public renderBackground(score: number, groundOffset: number, gameSpeed: number, time: number) {
    const ctx = this.ctx;
    const locationLength = 560;
    const locationCount = 5;
    const location = Math.floor(score / locationLength) % locationCount;
    const locationProgress = (score % locationLength) / locationLength;
    const transitionStart = 0.84;

    this.renderLocation(location, groundOffset, time);
    let palette = this.getLocationPalette(location);
    if (locationProgress > transitionStart) {
      const nextLocation = (location + 1) % locationCount;
      const fade = (locationProgress - transitionStart) / (1 - transitionStart);
      const blend = fade * fade * (3 - 2 * fade);
      ctx.save();
      ctx.globalAlpha = blend;
      this.renderLocation(nextLocation, groundOffset, time);
      ctx.restore();

      const nextPalette = this.getLocationPalette(nextLocation);
      palette = {
        groundColor: this.lerpColor(palette.groundColor, nextPalette.groundColor, blend),
        groundBottomColor: this.lerpColor(palette.groundBottomColor, nextPalette.groundBottomColor, blend),
        groundLineColor: this.lerpColor(palette.groundLineColor, nextPalette.groundLineColor, blend),
      };
    }

    this.renderAtmosphere(location, groundOffset, time);
    this.renderGround(groundOffset, palette);
  }

  private renderAtmosphere(location: number, groundOffset: number, time: number) {
    const ctx = this.ctx;
    const particleColors = ['#ffd28c', '#e5fbff', '#54e7ee', '#ffe6a2', '#a3ff99'];
    const tintColors = ['rgba(255, 173, 88, 0.08)', 'rgba(179, 236, 247, 0.12)', 'rgba(0, 205, 214, 0.12)', 'rgba(255, 209, 112, 0.1)', 'rgba(76, 206, 112, 0.1)'];

    const haze = ctx.createLinearGradient(0, this.groundY * 0.34, 0, this.groundY * 0.92);
    haze.addColorStop(0, 'rgba(255, 255, 255, 0)');
    haze.addColorStop(1, tintColors[location]);
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, this.width, this.groundY);

    const vignette = ctx.createRadialGradient(
      this.width * 0.5,
      this.groundY * 0.48,
      this.width * 0.18,
      this.width * 0.5,
      this.groundY * 0.48,
      this.width * 0.76
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.groundY);

    ctx.save();
    ctx.fillStyle = particleColors[location];
    for (let i = 0; i < 26; i++) {
      const x = ((i * 173 - groundOffset * (0.07 + (i % 3) * 0.025)) % (this.width + 20) + this.width + 20) % (this.width + 20) - 10;
      const y = (i * 53 + Math.sin(time * (0.5 + (i % 4) * 0.12) + i) * 13 + this.groundY * 0.16) % (this.groundY * 0.72);
      const pulse = 0.35 + (Math.sin(time * 2 + i * 1.7) + 1) * 0.25;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(x, y, i % 7 === 0 ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private getLocationPalette(location: number) {
    const palettes = [
      { groundColor: '#51331f', groundBottomColor: '#201812', groundLineColor: '#f4a34b' },
      { groundColor: '#b9e5ec', groundBottomColor: '#6194a0', groundLineColor: '#f4ffff' },
      { groundColor: '#073949', groundBottomColor: '#031e2d', groundLineColor: '#28c7d2' },
      { groundColor: '#96702f', groundBottomColor: '#55431f', groundLineColor: '#e6bd5b' },
      { groundColor: '#27251f', groundBottomColor: '#0c1412', groundLineColor: '#74d576' },
    ];
    return palettes[location];
  }

  private renderLocation(location: number, groundOffset: number, time: number) {
    if (location === 0) this.renderVaranasiScene(groundOffset, time);
    else if (location === 1) this.renderAntarcticaScene(groundOffset, time);
    else if (location === 2) this.renderIceCaveScene(groundOffset, time);
    else if (location === 3) this.renderSavannahScene(groundOffset, time);
    else this.renderTempleCaveScene(groundOffset, time);
  }

  private renderVaranasiScene(groundOffset: number, time: number) {
    const ctx = this.ctx;
    const horizon = this.groundY * 0.48;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#324b63');
    sky.addColorStop(0.58, '#d99a59');
    sky.addColorStop(1, '#ffe0a0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    const sunGlow = ctx.createRadialGradient(this.width * 0.49, horizon * 0.75, 4, this.width * 0.49, horizon * 0.75, this.width * 0.42);
    sunGlow.addColorStop(0, 'rgba(255, 221, 145, 0.95)');
    sunGlow.addColorStop(1, 'rgba(255, 177, 78, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, this.width, horizon * 1.7);
    ctx.fillStyle = '#fff1bd';
    ctx.beginPath();
    ctx.arc(this.width * 0.49, horizon * 0.76, Math.max(16, this.width * 0.035), 0, Math.PI * 2);
    ctx.fill();

    const water = ctx.createLinearGradient(0, horizon, 0, this.groundY);
    water.addColorStop(0, '#647a77');
    water.addColorStop(1, '#142f35');
    ctx.fillStyle = water;
    ctx.fillRect(0, horizon, this.width, this.groundY - horizon);
    ctx.fillStyle = 'rgba(255, 205, 122, 0.35)';
    for (let i = 0; i < 48; i++) {
      const x = ((i * 97 - groundOffset * 0.16) % (this.width + 40) + this.width + 40) % (this.width + 40) - 20;
      const y = horizon + 12 + ((i * 31) % Math.max(1, this.groundY - horizon - 20));
      ctx.fillRect(x, y, 12 + (i % 5) * 5, 1 + (i % 2));
    }

    ctx.save();
    ctx.fillStyle = '#302c27';
    const bankX = -((groundOffset * 0.12) % 150);
    for (let x = bankX - 150; x < this.width * 0.57; x += 150) {
      const height = 24 + ((Math.floor(x / 150) + 5) % 3) * 12;
      ctx.fillRect(x, horizon - height, 150, height + 2);
      ctx.fillRect(x + 24, horizon - height - 12, 28, 13);
      ctx.fillRect(x + 98, horizon - height - 19, 22, 20);
      this.drawShikhara(ctx, x + 76, horizon + 2, 24, height + 36, time, true);
      ctx.fillStyle = '#f7a94e';
      for (let windowX = x + 12; windowX < x + 145; windowX += 32) {
        ctx.fillRect(windowX, horizon - 11, 5, 7);
      }
      ctx.fillStyle = '#302c27';
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 171, 75, 0.58)';
    for (let i = 0; i < 7; i++) {
      const x = ((time * 15 + i * 153) % this.width);
      ctx.fillRect(x, this.groundY - 17 - (i % 3) * 8, 3, 3);
    }
  }

  private renderAntarcticaScene(groundOffset: number, time: number) {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, this.groundY);
    sky.addColorStop(0, '#a9d5e7');
    sky.addColorStop(0.62, '#e5f5f6');
    sky.addColorStop(1, '#83bdc9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    const base = this.groundY * 0.77;
    ctx.fillStyle = '#c4e5e8';
    ctx.beginPath();
    ctx.moveTo(0, base + 4);
    ctx.lineTo(0, base - 105);
    ctx.lineTo(this.width * 0.18, base - 90);
    ctx.lineTo(this.width * 0.31, base - 135);
    ctx.lineTo(this.width * 0.43, base - 112);
    ctx.lineTo(this.width * 0.56, base - 180);
    ctx.lineTo(this.width * 0.7, base - 150);
    ctx.lineTo(this.width * 0.83, base - 105);
    ctx.lineTo(this.width, base - 116);
    ctx.lineTo(this.width, base + 5);
    ctx.closePath();
    ctx.fill();

    const icebergX = this.width * 0.49 - (groundOffset * 0.025) % 18;
    ctx.fillStyle = '#e9f7f7';
    ctx.beginPath();
    ctx.moveTo(icebergX - this.width * 0.19, base);
    ctx.lineTo(icebergX - this.width * 0.16, base - this.height * 0.29);
    ctx.lineTo(icebergX - this.width * 0.09, base - this.height * 0.58);
    ctx.lineTo(icebergX - this.width * 0.065, base - this.height * 0.83);
    ctx.lineTo(icebergX - this.width * 0.02, base - this.height * 0.98);
    ctx.lineTo(icebergX + this.width * 0.025, base - this.height * 0.89);
    ctx.lineTo(icebergX + this.width * 0.095, base - this.height * 0.72);
    ctx.lineTo(icebergX + this.width * 0.14, base - this.height * 0.43);
    ctx.lineTo(icebergX + this.width * 0.19, base - this.height * 0.27);
    ctx.lineTo(icebergX + this.width * 0.22, base);
    ctx.closePath();
    ctx.fill();

    const iceShade = ctx.createLinearGradient(icebergX - this.width * 0.18, 0, icebergX + this.width * 0.2, 0);
    iceShade.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
    iceShade.addColorStop(0.52, 'rgba(175, 224, 237, 0.12)');
    iceShade.addColorStop(1, 'rgba(31, 105, 135, 0.3)');
    ctx.fillStyle = iceShade;
    ctx.beginPath();
    ctx.moveTo(icebergX - this.width * 0.16, base - this.height * 0.29);
    ctx.lineTo(icebergX - this.width * 0.09, base - this.height * 0.58);
    ctx.lineTo(icebergX - this.width * 0.02, base - this.height * 0.49);
    ctx.lineTo(icebergX + this.width * 0.025, base - this.height * 0.13);
    ctx.lineTo(icebergX - this.width * 0.03, base);
    ctx.lineTo(icebergX - this.width * 0.19, base);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7bb8ca';
    ctx.beginPath();
    ctx.moveTo(icebergX + this.width * 0.025, base - this.height * 0.89);
    ctx.lineTo(icebergX + this.width * 0.14, base - this.height * 0.43);
    ctx.lineTo(icebergX + this.width * 0.19, base - this.height * 0.27);
    ctx.lineTo(icebergX + this.width * 0.22, base);
    ctx.lineTo(icebergX + this.width * 0.025, base);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(icebergX - this.width * 0.07, base - this.height * 0.58);
    ctx.lineTo(icebergX - this.width * 0.055, base - this.height * 0.44);
    ctx.lineTo(icebergX - this.width * 0.08, base - this.height * 0.35);
    ctx.moveTo(icebergX + this.width * 0.075, base - this.height * 0.68);
    ctx.lineTo(icebergX + this.width * 0.05, base - this.height * 0.53);
    ctx.lineTo(icebergX + this.width * 0.1, base - this.height * 0.41);
    ctx.stroke();
    ctx.fillStyle = '#f3fbf9';
    ctx.beginPath();
    ctx.moveTo(0, base);
    ctx.lineTo(this.width, base);
    ctx.lineTo(this.width, this.groundY);
    ctx.lineTo(0, this.groundY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(38, 125, 151, 0.28)';
    for (let i = 0; i < 26; i++) {
      const x = ((i * 73 - groundOffset * 0.3) % (this.width + 30) + this.width + 30) % (this.width + 30) - 15;
      const y = base + 8 + (i * 17) % Math.max(1, this.groundY - base - 12);
      ctx.fillRect(x, y + Math.sin(time + i) * 2, 18 + i % 27, 2);
    }
  }

  private renderIceCaveScene(groundOffset: number, time: number) {
    const ctx = this.ctx;
    const glow = ctx.createRadialGradient(this.width * 0.54, this.groundY * 0.52, 10, this.width * 0.54, this.groundY * 0.52, this.width * 0.65);
    glow.addColorStop(0, '#087d91');
    glow.addColorStop(0.5, '#06465e');
    glow.addColorStop(1, '#031725');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#03141f';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.width, 0);
    ctx.lineTo(this.width, this.groundY * 0.67);
    ctx.lineTo(this.width * 0.85, this.groundY * 0.59);
    ctx.lineTo(this.width * 0.78, this.groundY * 0.3);
    ctx.lineTo(this.width * 0.67, this.groundY * 0.18);
    ctx.lineTo(this.width * 0.51, this.groundY * 0.13);
    ctx.lineTo(this.width * 0.34, this.groundY * 0.2);
    ctx.lineTo(this.width * 0.2, this.groundY * 0.35);
    ctx.lineTo(this.width * 0.11, this.groundY * 0.63);
    ctx.lineTo(0, this.groundY * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#07516a';
    ctx.beginPath();
    ctx.moveTo(this.width * 0.24, this.groundY * 0.58);
    ctx.lineTo(this.width * 0.33, this.groundY * 0.26);
    ctx.lineTo(this.width * 0.47, this.groundY * 0.17);
    ctx.lineTo(this.width * 0.6, this.groundY * 0.23);
    ctx.lineTo(this.width * 0.76, this.groundY * 0.58);
    ctx.lineTo(this.width * 0.63, this.groundY * 0.7);
    ctx.lineTo(this.width * 0.39, this.groundY * 0.7);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = 'rgba(79, 222, 225, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const x = this.width * (0.29 + i * 0.045);
      const tipY = this.groundY * (0.28 + (i % 4) * 0.055);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(i * 4) * 7, tipY);
      ctx.lineTo(x + 6, tipY + 9);
      ctx.stroke();
    }
    ctx.restore();

    const water = ctx.createLinearGradient(0, this.groundY * 0.7, 0, this.height);
    water.addColorStop(0, '#08778a');
    water.addColorStop(1, '#021d2a');
    ctx.fillStyle = water;
    ctx.fillRect(0, this.groundY * 0.7, this.width, this.height - this.groundY * 0.7);
    ctx.fillStyle = 'rgba(50, 228, 219, 0.72)';
    for (let i = 0; i < 30; i++) {
      const x = ((i * 89 - groundOffset * 0.22) % (this.width + 24) + this.width + 24) % (this.width + 24) - 12;
      const y = this.groundY * 0.75 + (i * 13) % Math.max(1, this.height - this.groundY * 0.75);
      ctx.fillRect(x, y + Math.sin(time * 1.5 + i) * 2, 12 + (i % 4) * 8, 2);
    }
    ctx.fillStyle = 'rgba(27, 228, 217, 0.55)';
    for (let i = 0; i < 14; i++) {
      const x = i * (this.width / 13);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 12, 0);
      ctx.lineTo(x + 4, this.groundY * (0.22 + (i % 4) * 0.045));
      ctx.lineTo(x - 4, this.groundY * 0.08);
      ctx.closePath();
      ctx.fill();
    }
  }

  private renderSavannahScene(groundOffset: number, time: number) {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, this.groundY);
    sky.addColorStop(0, '#4a9cb8');
    sky.addColorStop(0.65, '#b9d5cf');
    sky.addColorStop(1, '#e4c46b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#627d83';
    ctx.beginPath();
    ctx.moveTo(0, this.groundY * 0.61);
    ctx.lineTo(this.width * 0.16, this.groundY * 0.43);
    ctx.lineTo(this.width * 0.31, this.groundY * 0.48);
    ctx.lineTo(this.width * 0.48, this.groundY * 0.13);
    ctx.lineTo(this.width * 0.56, this.groundY * 0.16);
    ctx.lineTo(this.width * 0.74, this.groundY * 0.31);
    ctx.lineTo(this.width, this.groundY * 0.4);
    ctx.lineTo(this.width, this.groundY * 0.68);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(242, 247, 232, 0.52)';
    ctx.beginPath();
    ctx.moveTo(this.width * 0.32, this.groundY * 0.48);
    ctx.lineTo(this.width * 0.48, this.groundY * 0.13);
    ctx.lineTo(this.width * 0.56, this.groundY * 0.16);
    ctx.lineTo(this.width * 0.61, this.groundY * 0.34);
    ctx.lineTo(this.width * 0.54, this.groundY * 0.28);
    ctx.lineTo(this.width * 0.47, this.groundY * 0.38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(226, 239, 224, 0.38)';
    ctx.beginPath();
    ctx.ellipse(this.width * 0.17, this.groundY * 0.28, 57, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(this.width * 0.78, this.groundY * 0.36, 82, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d5d5c2';
    ctx.beginPath();
    ctx.moveTo(this.width * 0.31, this.groundY * 0.48);
    ctx.lineTo(this.width * 0.48, this.groundY * 0.13);
    ctx.lineTo(this.width * 0.56, this.groundY * 0.16);
    ctx.lineTo(this.width * 0.61, this.groundY * 0.34);
    ctx.lineTo(this.width * 0.52, this.groundY * 0.29);
    ctx.lineTo(this.width * 0.45, this.groundY * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d0ac55';
    ctx.fillRect(0, this.groundY * 0.63, this.width, this.groundY * 0.37);
    ctx.fillStyle = '#a8873c';
    ctx.beginPath();
    ctx.moveTo(0, this.groundY * 0.77);
    ctx.quadraticCurveTo(this.width * 0.35, this.groundY * 0.57, this.width * 0.6, this.groundY * 0.75);
    ctx.quadraticCurveTo(this.width * 0.83, this.groundY * 0.88, this.width, this.groundY * 0.68);
    ctx.lineTo(this.width, this.groundY);
    ctx.lineTo(0, this.groundY);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.fillStyle = '#29382b';
    for (let i = 0; i < 5; i++) {
      const x = ((i * 255 - groundOffset * 0.16) % (this.width + 260) + this.width + 260) % (this.width + 260) - 130;
      const y = this.groundY * (0.62 + (i % 2) * 0.09);
      const scale = i === 1 ? 1.15 : 0.65;
      ctx.fillRect(x - 3 * scale, y - 55 * scale, 6 * scale, 58 * scale);
      ctx.beginPath();
      ctx.ellipse(x, y - 57 * scale, 42 * scale, 15 * scale, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 42 * scale, y - 60 * scale, 84 * scale, 5 * scale);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(54, 53, 39, 0.72)';
    for (let i = 0; i < 30; i++) {
      const x = ((i * 67 - groundOffset * 0.26) % (this.width + 30) + this.width + 30) % (this.width + 30) - 15;
      const y = this.groundY * (0.72 + (i % 4) * 0.045);
      const size = 2 + (i % 4);
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.7, size, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 222, 143, 0.45)';
    for (let i = 0; i < 70; i++) {
      const x = ((i * 37 - groundOffset * 0.35) % (this.width + 20) + this.width + 20) % (this.width + 20) - 10;
      const y = this.groundY * 0.83 + (i * 19) % Math.max(1, this.groundY * 0.17);
      ctx.fillRect(x, y, 1, 4 + (i % 6));
    }
    void time;
  }

  private renderTempleCaveScene(groundOffset: number, time: number) {
    const ctx = this.ctx;
    const backdrop = ctx.createLinearGradient(0, 0, 0, this.groundY);
    backdrop.addColorStop(0, '#061319');
    backdrop.addColorStop(0.56, '#172624');
    backdrop.addColorStop(1, '#241c15');
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, this.width, this.height);

    const shaft = ctx.createRadialGradient(this.width * 0.56, this.groundY * 0.46, 4, this.width * 0.56, this.groundY * 0.46, this.width * 0.32);
    shaft.addColorStop(0, 'rgba(110, 232, 170, 0.27)');
    shaft.addColorStop(1, 'rgba(54, 168, 129, 0)');
    ctx.fillStyle = shaft;
    ctx.fillRect(0, 0, this.width, this.groundY);

    ctx.fillStyle = '#080f11';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.width, 0);
    ctx.lineTo(this.width, this.groundY * 0.44);
    ctx.lineTo(this.width * 0.89, this.groundY * 0.36);
    ctx.lineTo(this.width * 0.84, this.groundY * 0.19);
    ctx.lineTo(this.width * 0.76, this.groundY * 0.39);
    ctx.lineTo(this.width * 0.68, this.groundY * 0.26);
    ctx.lineTo(this.width * 0.62, this.groundY * 0.47);
    ctx.lineTo(this.width * 0.55, this.groundY * 0.14);
    ctx.lineTo(this.width * 0.48, this.groundY * 0.42);
    ctx.lineTo(this.width * 0.4, this.groundY * 0.24);
    ctx.lineTo(this.width * 0.3, this.groundY * 0.44);
    ctx.lineTo(this.width * 0.23, this.groundY * 0.25);
    ctx.lineTo(this.width * 0.16, this.groundY * 0.47);
    ctx.lineTo(0, this.groundY * 0.4);
    ctx.closePath();
    ctx.fill();

    const lightBeam = ctx.createLinearGradient(this.width * 0.55, 0, this.width * 0.52, this.groundY * 0.72);
    lightBeam.addColorStop(0, 'rgba(191, 246, 202, 0.34)');
    lightBeam.addColorStop(1, 'rgba(103, 224, 147, 0)');
    ctx.fillStyle = lightBeam;
    ctx.beginPath();
    ctx.moveTo(this.width * 0.51, 0);
    ctx.lineTo(this.width * 0.6, 0);
    ctx.lineTo(this.width * 0.73, this.groundY * 0.73);
    ctx.lineTo(this.width * 0.42, this.groundY * 0.73);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#18211e';
    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? 0 : this.width * 0.82;
      const w = this.width * 0.18;
      ctx.fillRect(x, this.groundY * 0.42, w, this.groundY * 0.55);
      for (let i = 0; i < 5; i++) {
        const blockY = this.groundY * 0.49 + i * 18;
        ctx.fillStyle = i % 2 ? '#30291f' : '#211f19';
        ctx.fillRect(x + (side === 0 ? 8 : 0), blockY, w - 8, 15);
      }
      ctx.fillStyle = '#18211e';
    }

    ctx.strokeStyle = 'rgba(165, 157, 111, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      const x = ((i * 79 - groundOffset * 0.11) % this.width + this.width) % this.width;
      const y = this.groundY * (0.51 + (i % 4) * 0.085);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 11 + (i % 5) * 3, y - 3 - (i % 3) * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#111a17';
    for (let i = 0; i < 8; i++) {
      const x = ((i * 147 - groundOffset * 0.09) % (this.width + 80) + this.width + 80) % (this.width + 80) - 40;
      const y = this.groundY * (0.91 + (i % 2) * 0.035);
      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x - 5, y - 16 - (i % 3) * 4);
      ctx.lineTo(x, y - 4);
      ctx.lineTo(x + 9, y - 13);
      ctx.lineTo(x + 16, y);
      ctx.closePath();
      ctx.fill();
    }

    const altarX = this.width * 0.56;
    ctx.fillStyle = 'rgba(44, 255, 118, 0.2)';
    ctx.beginPath();
    ctx.ellipse(altarX, this.groundY * 0.82, 75, 24 + Math.sin(time * 3) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3c5544';
    ctx.fillRect(altarX - 44, this.groundY * 0.73, 88, this.groundY * 0.18);
    ctx.fillStyle = '#52dc75';
    ctx.fillRect(altarX - 32, this.groundY * 0.7, 64, 5);
    ctx.fillStyle = '#b8ff81';
    ctx.beginPath();
    ctx.arc(altarX, this.groundY * 0.67, 7 + Math.sin(time * 4) * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff9a42';
    for (let i = 0; i < 9; i++) {
      const x = ((i * 133 - groundOffset * 0.17) % (this.width + 100) + this.width + 100) % (this.width + 100) - 50;
      const y = this.groundY * (0.57 + (i % 3) * 0.1);
      ctx.beginPath();
      ctx.ellipse(x, y, 3, 7 + Math.sin(time * 5 + i) * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawVaranasiTempleSkyline(ctx: CanvasRenderingContext2D, baseX: number, groundY: number, time: number) {
    // Grand Shikhara 1 (Main Temple Tower)
    this.drawShikhara(ctx, baseX + 140, groundY, 44, 150, time, true);
    // Medium Shikhara 2
    this.drawShikhara(ctx, baseX + 260, groundY, 36, 110, time + 1, false);
    // Huge Central Vishwanath Spire
    this.drawShikhara(ctx, baseX + 450, groundY, 56, 175, time + 2, true);
    // Secondary Mandapa
    this.drawShikhara(ctx, baseX + 620, groundY, 40, 125, time + 3, true);
    // Distant Spire
    this.drawShikhara(ctx, baseX + 780, groundY, 48, 140, time + 4, true);
  }

  private drawShikhara(
    ctx: CanvasRenderingContext2D,
    x: number,
    baseY: number,
    width: number,
    height: number,
    time: number,
    hasFlag: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(x - width / 2, baseY);
    // Base Mandapa pavilion
    ctx.lineTo(x - width / 2, baseY - height * 0.3);
    // Tiered stepped shikhara curve
    ctx.quadraticCurveTo(x - width * 0.35, baseY - height * 0.7, x, baseY - height);
    ctx.quadraticCurveTo(x + width * 0.35, baseY - height * 0.7, x + width / 2, baseY - height * 0.3);
    ctx.lineTo(x + width / 2, baseY);
    ctx.closePath();
    ctx.fill();

    // Golden Kalasha (spire pinnacle urn)
    const topY = baseY - height;
    ctx.beginPath();
    ctx.arc(x, topY - 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, topY - 9);
    ctx.lineTo(x - 2, topY - 14);
    ctx.lineTo(x + 2, topY - 14);
    ctx.closePath();
    ctx.fill();

    // Saffron Temple Flag fluttering dynamically
    if (hasFlag) {
      const flagBaseX = x;
      const flagBaseY = topY - 14;
      const wave = Math.sin(time * 6 + x * 0.05) * 5;

      ctx.save();
      ctx.fillStyle = '#ea580c'; // Vibrant saffron flag
      ctx.beginPath();
      ctx.moveTo(flagBaseX, flagBaseY);
      ctx.lineTo(flagBaseX - 22 + wave, flagBaseY - 6 + wave * 0.5);
      ctx.lineTo(flagBaseX - 16 + wave, flagBaseY - 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  private drawGhatStepsLayer(ctx: CanvasRenderingContext2D, baseX: number, groundY: number, time: number) {
    // Stepped stone river ghat structures in midground
    ctx.beginPath();
    ctx.moveTo(baseX, groundY);
    ctx.lineTo(baseX + 60, groundY - 35);
    ctx.lineTo(baseX + 120, groundY - 35);
    ctx.lineTo(baseX + 180, groundY - 15);
    ctx.lineTo(baseX + 320, groundY - 50);
    ctx.lineTo(baseX + 440, groundY - 50);
    ctx.lineTo(baseX + 560, groundY - 25);
    ctx.lineTo(baseX + 700, groundY - 45);
    ctx.lineTo(baseX + 820, groundY - 20);
    ctx.lineTo(baseX + 960, groundY);
    ctx.closePath();
    ctx.fill();

    // Stone Chhatri (pillared dome gazebo on the ghat)
    const chhatriX = baseX + 380;
    const chhatriY = groundY - 50;
    // Pillars
    ctx.fillRect(chhatriX - 12, chhatriY - 22, 2.5, 22);
    ctx.fillRect(chhatriX + 10, chhatriY - 22, 2.5, 22);
    // Dome
    ctx.beginPath();
    ctx.arc(chhatriX, chhatriY - 22, 14, Math.PI, 0);
    ctx.fill();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(20, 20, 16, 0, Math.PI * 2);
    ctx.arc(42, 12, 22, 0, Math.PI * 2);
    ctx.arc(68, 16, 18, 0, Math.PI * 2);
    ctx.arc(84, 22, 14, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderGround(groundOffset: number, cycle: { groundColor: string; groundBottomColor: string; groundLineColor: string }) {
    const ctx = this.ctx;

    const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
    groundGrad.addColorStop(0, cycle.groundColor);
    groundGrad.addColorStop(1, cycle.groundBottomColor);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Primary polished stone track line
    ctx.strokeStyle = cycle.groundLineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(this.width, this.groundY);
    ctx.stroke();

    // Secondary hairline ridge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY - 1);
    ctx.lineTo(this.width, this.groundY - 1);
    ctx.stroke();

    ctx.save();
    const stride = 52;
    const offset = groundOffset % stride;
    ctx.fillStyle = cycle.groundLineColor;
    ctx.globalAlpha = 0.38;

    for (let x = -stride; x < this.width + stride; x += stride) {
      const realX = x - offset;
      ctx.fillRect(realX + 4, this.groundY + 7, 23, 2);
      ctx.fillRect(realX + 32, this.groundY + 17, 15, 2);
      ctx.fillRect(realX + 18, this.groundY + 31, 24, 1.5);
    }
    ctx.restore();
  }

  /**
   * Alias: maintains compatibility with existing engine calls while rendering Rudhra on the sacred Bull.
   */
  public renderDino(dino: DinoState, isDead: boolean) {
    this.renderRudhraAndBull(dino, isDead, Date.now() / 1000);
  }

  /**
   * Master Procedural Character Renderer:
   * MAHESH BABU AS RUDHRA CHARGING ON THE SACRED NANDI BULL WITH THE DIVINE TRISHUL!
   */
  public renderRudhraAndBull(dino: DinoState, isDead: boolean, time: number) {
    const ctx = this.ctx;
    ctx.save();

    const x = dino.x;
    const y = dino.y;
    const isDucking = dino.isDucking;
    const duckFactor = dino.duckProgress; // 0 (upright) to 1 (full forward charge)

    // Dynamic ground shadow
    const shadowWidth = isDucking ? 74 : 64;
    const shadowY = this.groundY + 2;
    const shadowScale = Math.max(0.4, 1 - (this.groundY - y) / 180);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.ellipse(x + 28, shadowY, (shadowWidth * shadowScale) / 2, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Translate to character position origin
    ctx.translate(x, y);

    if (isDead) {
      // Skid to a sudden halt, front hooves bracing, head tilted
      ctx.rotate(-0.1);
      ctx.translate(-4, 4);
    }

    // --- AURA EFFECTS ---
    // 1. Shiva Kavach Shield Aura (Shield Power-Up)
    if (dino.hasShield && !isDead) {
      ctx.save();
      const pulse = 1 + 0.08 * Math.sin(time * 8);
      const shieldGrad = ctx.createRadialGradient(28, -26, 12, 28, -26, 44 * pulse);
      shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      shieldGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.35)');
      shieldGrad.addColorStop(1, 'rgba(56, 189, 248, 0.9)');
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(28, -26, 44 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Trishul Astra (Chomp Power-Up) Blazing Golden Lightning
    if (dino.hasChomp && !isDead) {
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(32, -30, 42, 0, Math.PI * 2);
      ctx.stroke();

      // Golden solar sparks radiating
      for (let i = 0; i < 6; i++) {
        const angle = time * 6 + (i * Math.PI) / 3;
        const sparkDist = 38 + Math.sin(time * 12 + i) * 6;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(32 + Math.cos(angle) * sparkDist, -30 + Math.sin(angle) * sparkDist, 3, 3);
      }
      ctx.restore();
    }

    // Gallop Cycle Math
    const runPhase = dino.runCycle;
    const isGrounded = dino.isGrounded && !isDead;

    // Leg gallop articulation
    const legRearLeft = isGrounded ? Math.sin(runPhase) * 0.65 : 0.55;
    const legRearRight = isGrounded ? Math.sin(runPhase + 0.5) * 0.65 : 0.75;
    const legFrontLeft = isGrounded ? Math.sin(runPhase + Math.PI) * 0.7 : -0.5;
    const legFrontRight = isGrounded ? Math.sin(runPhase + Math.PI + 0.5) * 0.7 : -0.3;

    // Canonical Rudhra & Sacred Bull appearance (photo-inspired rider silhouette)
    const bullCoat = '#ffffff';
    const bullShade = '#cbd5e1';
    const hornColor = '#292524';
    const trishulGold = '#fbbf24';
    const flagOrange = '#ea580c';
    const tilakRed = '#dc2626';
    const safariShirt = '#9d6736';
    const safariShadow = '#78431b';

    // Body Bobbing with the gallop and rider lean matching the reference pose
    const bodyBob = isGrounded ? Math.sin(runPhase * 2) * 0.8 : 0;
    const riderLean = isGrounded ? Math.sin(runPhase * 2.2) * 0.07 : -0.05;
    const duckYOffset = duckFactor * 10;

    // Kicking up Varanasi temple dust & terracotta debris under galloping hooves
    if (isGrounded) {
      ctx.save();
      const dustX = 8 + Math.sin(runPhase) * 6;
      ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.beginPath();
      ctx.arc(dustX, -2, 7 + Math.random() * 4, 0, Math.PI * 2);
      ctx.arc(dustX - 10, -4, 5 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
      // Flying clay debris chip
      ctx.fillStyle = '#92400e';
      ctx.fillRect(dustX - 6 + Math.sin(time * 20) * 8, -6 - Math.abs(Math.sin(time * 15)) * 6, 2.5, 2.5);
      ctx.restore();
    }

    // --- 1. DRAW BACK LEGS (Far side of bull) ---
    this.drawBullLeg(ctx, 10, -8 + bodyBob + duckYOffset, legRearLeft, true);
    this.drawBullLeg(ctx, 46, -8 + bodyBob + duckYOffset, legFrontLeft, false);

    // --- 2. DRAW BULL TAIL ---
    ctx.save();
    ctx.fillStyle = bullCoat;
    const tailWiggle = isGrounded ? Math.sin(runPhase * 0.8) * 4 : -2;
    ctx.beginPath();
    ctx.moveTo(2, -22 + bodyBob + duckYOffset);
    ctx.quadraticCurveTo(-12, -28 + tailWiggle + bodyBob + duckYOffset, -22, -18 + tailWiggle + bodyBob + duckYOffset);
    ctx.lineTo(-21, -16 + tailWiggle + bodyBob + duckYOffset);
    ctx.quadraticCurveTo(-10, -24 + tailWiggle + bodyBob + duckYOffset, 4, -18 + bodyBob + duckYOffset);
    ctx.closePath();
    ctx.fill();

    // Dark brush tuft at tail tip
    ctx.fillStyle = hornColor;
    ctx.beginPath();
    ctx.ellipse(-23, -16 + tailWiggle + bodyBob + duckYOffset, 4.5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- 3. MAIN BULL TORSO & MUSCULAR ZEBU HUMP ---
    ctx.save();
    ctx.translate(0, bodyBob + duckYOffset);

    // Main Muscular Flank
    const bullGrad = ctx.createLinearGradient(0, -38, 0, -4);
    bullGrad.addColorStop(0, '#ffffff');
    bullGrad.addColorStop(0.65, '#f8fafc');
    bullGrad.addColorStop(1, bullShade);
    ctx.fillStyle = bullGrad;

    // Muscular body contour
    ctx.beginPath();
    ctx.moveTo(4, -18);
    // Hindquarters curve
    ctx.quadraticCurveTo(0, -28, 8, -32);
    // Back saddle line
    ctx.lineTo(24, -31);
    // SACRED ZEBU HUMP (Prominent muscular shoulder hump)
    ctx.quadraticCurveTo(34, -46, 42, -35);
    // Powerful Neck
    ctx.lineTo(50, -32);
    // Chest and Dewlap (hanging skin folds)
    ctx.quadraticCurveTo(56, -18, 50, -10);
    // Underbelly
    ctx.quadraticCurveTo(30, -6, 12, -10);
    ctx.closePath();
    ctx.fill();

    // Shaded muscular contour lines on flank
    ctx.strokeStyle = bullShade;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(16, -20, 9, 0.2, Math.PI * 0.8);
    ctx.stroke();

    // Sacred red braided halter harness around the bull flank
    ctx.strokeStyle = tilakRed;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(24, -30);
    ctx.lineTo(28, -8);
    ctx.stroke();

    // Brass Temple Bell hanging from dewlap
    const bellSwing = isGrounded ? Math.sin(runPhase) * 0.18 : 0.05;
    ctx.save();
    ctx.translate(48, -14);
    ctx.rotate(bellSwing);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.lineTo(4, 5);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    // Clapper dot
    ctx.beginPath();
    ctx.arc(0, 6, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- 4. BULL HEAD & CURVED HORNS ---
    const headAngle = duckFactor > 0.4 ? 0.35 : 0; // head tilts forward into charging ram
    ctx.save();
    ctx.translate(48, -28);
    ctx.rotate(headAngle);

    // Powerful Bull Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, -4);
    ctx.lineTo(22, 6);
    ctx.lineTo(14, 14);
    ctx.lineTo(-2, 10);
    ctx.closePath();
    ctx.fill();

    // Dark Muzzle / Snout
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(14, 3, 9, 10, [2, 4, 4, 2]);
    ctx.fill();

    // Flared Black Nostril
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(20, 7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Red Braided Bridle Rope (from poster)
    ctx.strokeStyle = tilakRed;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(15, 5);
    ctx.lineTo(14, 12);
    ctx.stroke();

    // BOLD SACRED RED TRISHUL TILAK ON FOREHEAD (exact from poster)
    ctx.save();
    ctx.fillStyle = tilakRed;
    ctx.strokeStyle = tilakRed;
    ctx.lineWidth = 1.2;
    // Central vertical spear of tilak
    ctx.fillRect(10, 0, 1.8, 7);
    // Left trident wing curve
    ctx.beginPath();
    ctx.moveTo(11, 3);
    ctx.quadraticCurveTo(7, 2, 7, 0);
    ctx.stroke();
    // Right trident wing curve
    ctx.beginPath();
    ctx.moveTo(11, 3);
    ctx.quadraticCurveTo(15, 2, 15, 0);
    ctx.stroke();
    ctx.restore();

    // Expressive Intense Bull Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -1, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -1.8, 1, 0, Math.PI * 2);
    ctx.fill();

    // Bull Ear
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(1, 2, 5, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // SWEEPING MAGNIFICENT CURVED HORNS (Ribbed, dark charcoal)
    ctx.save();
    ctx.strokeStyle = hornColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Far Horn (behind)
    ctx.beginPath();
    ctx.moveTo(4, -3);
    ctx.quadraticCurveTo(8, -18, 18, -22);
    ctx.stroke();

    // Near Horn (prominent in front)
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(6, -1);
    ctx.quadraticCurveTo(12, -20, 24, -22);
    ctx.stroke();

    // Horn sharp tips
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, -21);
    ctx.lineTo(26, -23);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // end head
    ctx.restore(); // end torso translate

    // --- 5. WARRIOR HERO RUDHRA (photo-inspired rider silhouette) ---
    ctx.save();
    ctx.translate(0, bodyBob + duckYOffset);
    ctx.rotate(riderLean);

    if (duckFactor > 0.4) {
      // Forward charging crouch, rider sunk low and leaning into the bull
      ctx.fillStyle = safariShirt;
      ctx.beginPath();
      ctx.roundRect(12, -34, 26, 12, 5);
      ctx.fill();

      ctx.fillStyle = '#3f2212';
      ctx.fillRect(26, -30, 10, 4);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(34, -30, 6, 4);

      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(36, -31, 5.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(36, -31, 6.2, -Math.PI * 0.8, Math.PI * 0.15);
      ctx.fill();
      ctx.fillRect(25, -36, 13, 3.5);

      this.drawTrishul(ctx, 38, -29, 0.45, trishulGold, flagOrange, time);
    } else {
      // Rider seated tall and naturally on the bull, with the visible profile and movement of the reference.
      ctx.fillStyle = safariShadow;
      ctx.beginPath();
      ctx.roundRect(18, -26, 10, 17, [4, 4, 2, 2]);
      ctx.fill();

      ctx.fillStyle = safariShirt;
      ctx.beginPath();
      ctx.roundRect(15, -42, 18, 18, [7, 7, 4, 4]);
      ctx.fill();

      // lean forward and weight into the bull
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(17, -40);
      ctx.lineTo(24, -29);
      ctx.lineTo(31, -40);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(17, -39);
      ctx.quadraticCurveTo(24, -32, 31, -39);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(24, -33, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = safariShirt;
      ctx.beginPath();
      ctx.moveTo(20, -40);
      ctx.lineTo(30, -32);
      ctx.lineTo(35, -30);
      ctx.lineTo(28, -27);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3f2212';
      ctx.fillRect(30, -31, 4, 5);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(34, -30, 4, 4);

      // Head and hair shaped to match the heroic profile.
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(25, -48, 6.2, 7.8, 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(25, -46, 5.2, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(27, -48, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.arc(27, -46, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, -47, 2.1, 0.7);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(27, -50, 1.2, 0, Math.PI * 2);
      ctx.fill();

      const hairFlutter = Math.sin(time * 8) * 0.8;
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(19, -56);
      ctx.quadraticCurveTo(10, -58 + hairFlutter, 5, -51 + hairFlutter);
      ctx.quadraticCurveTo(12, -45, 18, -47);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(23, -55, 3.2, 0, Math.PI * 2);
      ctx.arc(18, -52, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = safariShirt;
      ctx.beginPath();
      ctx.moveTo(19, -40);
      ctx.lineTo(31, -54);
      ctx.lineTo(35, -52);
      ctx.lineTo(27, -38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3f2212';
      ctx.fillRect(31, -53, 4, 4);

      this.drawTrishul(ctx, 35, -55, -0.28, trishulGold, flagOrange, time);
    }

    ctx.restore();

    // --- 6. DRAW FRONT LEGS (Near side of bull) ---
    this.drawBullLeg(ctx, 18, -8 + bodyBob + duckYOffset, legRearRight, true);
    this.drawBullLeg(ctx, 54, -8 + bodyBob + duckYOffset, legFrontRight, false);

    ctx.restore();
  }

  private drawBullLeg(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    angle: number,
    isHind: boolean
  ) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(angle);

    const legColor = isHind ? '#cbd5e1' : '#f8fafc';
    ctx.fillStyle = legColor;

    // Muscular Upper Thigh
    ctx.beginPath();
    ctx.roundRect(-4, 0, 9, 11, 4);
    ctx.fill();

    // Shin & Hock
    ctx.beginPath();
    ctx.roundRect(-3, 8, 6.5, 10, 2);
    ctx.fill();

    // Cloven Black Hoof
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(-3, 16, 8, 5, [2, 3, 1, 1]);
    ctx.fill();

    // Subtle hoof shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-2, 17, 4, 1.5);

    ctx.restore();
  }

  private drawTrishul(
    ctx: CanvasRenderingContext2D,
    handX: number,
    handY: number,
    rotation: number,
    goldColor: string,
    flagColor: string,
    time: number
  ) {
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(rotation);

    // Golden Staff Shaft
    const staffGrad = ctx.createLinearGradient(-1.5, 15, 1.5, -45);
    staffGrad.addColorStop(0, '#d97706');
    staffGrad.addColorStop(0.5, goldColor);
    staffGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = staffGrad;
    ctx.fillRect(-1.5, -35, 3, 50);

    // TRISHUL HEAD (Trident Prongs)
    ctx.fillStyle = goldColor;
    const tridentTopY = -35;

    // Center Spear Prong
    ctx.beginPath();
    ctx.moveTo(0, tridentTopY);
    ctx.lineTo(-2.5, tridentTopY - 14);
    ctx.lineTo(0, tridentTopY - 20);
    ctx.lineTo(2.5, tridentTopY - 14);
    ctx.closePath();
    ctx.fill();

    // Left Curved Wing Prong
    ctx.beginPath();
    ctx.moveTo(-1, tridentTopY);
    ctx.quadraticCurveTo(-10, tridentTopY - 6, -8, tridentTopY - 16);
    ctx.lineTo(-6, tridentTopY - 14);
    ctx.quadraticCurveTo(-6, tridentTopY - 4, 0, tridentTopY + 2);
    ctx.closePath();
    ctx.fill();

    // Right Curved Wing Prong
    ctx.beginPath();
    ctx.moveTo(1, tridentTopY);
    ctx.quadraticCurveTo(10, tridentTopY - 6, 8, tridentTopY - 16);
    ctx.lineTo(6, tridentTopY - 14);
    ctx.quadraticCurveTo(6, tridentTopY - 4, 0, tridentTopY + 2);
    ctx.closePath();
    ctx.fill();

    // Sacred Damru (Hourglass drum) on the Trishul
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-3, tridentTopY + 3);
    ctx.lineTo(3, tridentTopY + 3);
    ctx.lineTo(-3, tridentTopY + 8);
    ctx.lineTo(3, tridentTopY + 8);
    ctx.closePath();
    ctx.fill();

    // FLUTTERING SAFFRON PENNANT BANNER
    ctx.fillStyle = flagColor;
    const wave = Math.sin(time * 18) * 4;
    const wave2 = Math.cos(time * 22) * 5;
    ctx.beginPath();
    ctx.moveTo(0, tridentTopY + 2);
    ctx.quadraticCurveTo(-15, tridentTopY + 2 + wave, -30, tridentTopY - 2 + wave);
    ctx.lineTo(-26, tridentTopY + 6 + wave2);
    ctx.quadraticCurveTo(-12, tridentTopY + 7 + wave, 0, tridentTopY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Renders themed Varanasi obstacles:
   * - Ancient Carved Stone Pillar / Lingam
   * - Sacred Brass Havan Kund (Fire Brazier)
   * - Ruined Temple Steps Block
   * - Swooping Mountain Raptor / Vulture
   */
  public renderObstacle(obs: Obstacle, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(obs.x, obs.y);

    switch (obs.type) {
      case 'CACTUS_SMALL':
        this.drawStonePillar(ctx, obs.width, obs.height);
        break;
      case 'CACTUS_LARGE':
        this.drawHavanBrazier(ctx, obs.width, obs.height, time);
        break;
      case 'CACTUS_CLUSTER':
        this.drawTempleRuinsCluster(ctx, obs.width, obs.height, time);
        break;
      case 'PTERODACTYL':
        this.drawSwoopingRaptor(ctx, obs, time);
        break;
      case 'TUMBLEWEED':
        this.drawHolyChariotWheel(ctx, obs.width, time);
        break;
    }

    ctx.restore();
  }

  private drawStonePillar(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Ancient carved Varanasi stone monolith / pillar
    ctx.save();
    const pillarGrad = ctx.createLinearGradient(0, 0, width, 0);
    pillarGrad.addColorStop(0, '#94a3b8');
    pillarGrad.addColorStop(0.4, '#64748b');
    pillarGrad.addColorStop(1, '#334155');

    // Stone Column
    ctx.fillStyle = pillarGrad;
    ctx.beginPath();
    ctx.roundRect(3, 4, width - 6, height - 4, [6, 6, 2, 2]);
    ctx.fill();

    // Sacred Lingam dome cap
    ctx.beginPath();
    ctx.arc(width / 2, 6, (width - 6) / 2, Math.PI, 0);
    ctx.fill();

    // Sacred Vermillion Tripundra mark on the monolith
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(width * 0.25, height * 0.25, width * 0.5, 2);
    ctx.fillRect(width * 0.22, height * 0.25 + 3, width * 0.56, 2);
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.25 + 1.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Marigold floral garland draped around pillar
    ctx.fillStyle = '#f59e0b';
    for (let y = height * 0.45; y < height * 0.75; y += 6) {
      ctx.beginPath();
      ctx.arc(4, y, 3, 0, Math.PI * 2);
      ctx.arc(width - 4, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawHavanBrazier(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.save();
    // Sacred Brass Havan Kund (Fire altar)
    const brazierGrad = ctx.createLinearGradient(0, height * 0.35, width, height);
    brazierGrad.addColorStop(0, '#f59e0b');
    brazierGrad.addColorStop(0.5, '#b45309');
    brazierGrad.addColorStop(1, '#78350f');

    // Stepped square brass kund base
    ctx.fillStyle = brazierGrad;
    ctx.beginPath();
    ctx.moveTo(4, height);
    ctx.lineTo(width - 4, height);
    ctx.lineTo(width, height * 0.45);
    ctx.lineTo(0, height * 0.45);
    ctx.closePath();
    ctx.fill();

    // Lip & Handles
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, height * 0.42, width + 4, 4);

    // CRACKLING SACRED FIRE FLAMES (Dancing animated tongues)
    const flameBaseY = height * 0.42;
    const flameGrad = ctx.createLinearGradient(0, flameBaseY, 0, 0);
    flameGrad.addColorStop(0, '#ef4444');
    flameGrad.addColorStop(0.5, '#f97316');
    flameGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = flameGrad;

    const flicker = Math.sin(time * 14) * 4;
    const flicker2 = Math.cos(time * 18) * 5;

    // Center tall flame
    ctx.beginPath();
    ctx.moveTo(width * 0.2, flameBaseY);
    ctx.quadraticCurveTo(width * 0.35, flameBaseY * 0.5, width * 0.5 + flicker, 0);
    ctx.quadraticCurveTo(width * 0.65, flameBaseY * 0.5, width * 0.8, flameBaseY);
    ctx.closePath();
    ctx.fill();

    // Side flame tongues
    ctx.beginPath();
    ctx.moveTo(width * 0.1, flameBaseY);
    ctx.quadraticCurveTo(width * 0.25, flameBaseY * 0.6, width * 0.3 + flicker2, flameBaseY * 0.2);
    ctx.lineTo(width * 0.45, flameBaseY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.55, flameBaseY);
    ctx.quadraticCurveTo(width * 0.75, flameBaseY * 0.6, width * 0.7 - flicker2, flameBaseY * 0.25);
    ctx.lineTo(width * 0.9, flameBaseY);
    ctx.closePath();
    ctx.fill();

    // Floating fire sparks / embers
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(width * 0.4 + flicker, flameBaseY * 0.1, 2.5, 2.5);
    ctx.fillRect(width * 0.6 - flicker, flameBaseY * 0.25, 2, 2);

    ctx.restore();
  }

  private drawTempleRuinsCluster(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.save();
    // 3 Sacred Pillars & Steps Cluster
    ctx.translate(0, height * 0.2);
    this.drawStonePillar(ctx, width * 0.38, height * 0.8);
    ctx.restore();

    ctx.save();
    ctx.translate(width * 0.3, 0);
    this.drawHavanBrazier(ctx, width * 0.44, height, time);
    ctx.restore();

    ctx.save();
    ctx.translate(width * 0.65, height * 0.15);
    this.drawStonePillar(ctx, width * 0.35, height * 0.85);
    ctx.restore();
  }

  private drawSwoopingRaptor(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
    // Swooping Himalayan Raptor / Golden Royal Garuda Eagle
    const flapCycle = Math.sin((obs.flapFrame || 0) * 0.38);
    const wingY = flapCycle * 15;

    ctx.save();
    // Body & Sleek Beak
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(obs.width * 0.48, obs.height * 0.5, 15, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Golden Crest & Sharp Hooked Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(obs.width * 0.3, obs.height * 0.45);
    ctx.lineTo(obs.width * 0.05, obs.height * 0.52);
    ctx.lineTo(obs.width * 0.25, obs.height * 0.65);
    ctx.closePath();
    ctx.fill();

    // Piercing Eagle Eye
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(obs.width * 0.32, obs.height * 0.46, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(obs.width * 0.3, obs.height * 0.46, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Powerful Flapping Wings
    ctx.fillStyle = '#451a03';
    // Near Wing
    ctx.beginPath();
    ctx.moveTo(obs.width * 0.4, obs.height * 0.45);
    ctx.lineTo(obs.width * 0.55, obs.height * 0.45 - 20 + wingY);
    ctx.lineTo(obs.width * 0.8, obs.height * 0.45 - 26 + wingY);
    ctx.quadraticCurveTo(obs.width * 0.62, obs.height * 0.45, obs.width * 0.48, obs.height * 0.52);
    ctx.closePath();
    ctx.fill();

    // Golden Feather tips
    ctx.fillStyle = '#d97706';
    ctx.fillRect(obs.width * 0.72, obs.height * 0.45 - 25 + wingY, 6, 3);

    // Far Wing
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(obs.width * 0.42, obs.height * 0.55);
    ctx.lineTo(obs.width * 0.6, obs.height * 0.55 + 18 - wingY);
    ctx.lineTo(obs.width * 0.8, obs.height * 0.55 + 22 - wingY);
    ctx.quadraticCurveTo(obs.width * 0.58, obs.height * 0.55, obs.width * 0.46, obs.height * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawHolyChariotWheel(ctx: CanvasRenderingContext2D, size: number, time: number) {
    ctx.save();
    const radius = size / 2;
    ctx.translate(radius, radius);
    ctx.rotate(time * 6.5);

    // Carved stone / brass wheel of time
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes
    for (let i = 0; i < 8; i++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, radius * 0.88);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renders floating divine power-up gems:
   * - Trishul Astra
   * - Shiva Kavach
   * - Kaal Gati (Chrono)
   * - Anjaneya Flutter (Double Jump)
   */
  public renderPowerUp(item: PowerUpItem, time: number) {
    const ctx = this.ctx;
    ctx.save();
    const bobY = item.y + Math.sin(time * 4.5 + item.bobOffset) * 6;
    ctx.translate(item.x, bobY);

    const colorMap = {
      SHIELD: '#38bdf8', // Shiva Kavach Blue
      SLOW_MO: '#f59e0b', // Kaal Gati Amber
      DOUBLE_JUMP: '#10b981', // Celestial Leap Jade
      CHOMP: '#ef4444', // Trishul Astra Crimson
    };
    const primaryColor = colorMap[item.type];

    // Radiant Divine Glow
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, item.size * 1.3);
    glow.addColorStop(0, primaryColor);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, item.size * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Diamond Gem Icon
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, -item.size);
    ctx.lineTo(item.size, 0);
    ctx.lineTo(0, item.size);
    ctx.lineTo(-item.size, 0);
    ctx.closePath();
    ctx.fill();

    // Inner Trishul golden symbol
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -item.size * 0.6);
    ctx.lineTo(item.size * 0.35, 0);
    ctx.lineTo(0, item.size * 0.6);
    ctx.lineTo(-item.size * 0.35, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Renders particles (dust clouds, golden sparks, sacred kumkum, embers).
   */
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    ctx.save();
    particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      if (p.shape === 'square') {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (p.shape === 'spark') {
        ctx.fillRect(p.x, p.y, p.size * 2, p.size * 0.7);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }
}
