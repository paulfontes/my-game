const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NUM_STARS = 120;
const SHOT_COOLDOWN = 300;
const RAPID_COOLDOWN = 100;
const INITIAL_SPAWN_INTERVAL = 1500;
const MIN_SPAWN_INTERVAL = 300;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;
const ENEMY_BASE_SPEED = 1.5;
const ENEMY_MAX_SPEED = 4.0;
const POWERUP_DROP_CHANCE = 0.3;
const POWERUP_DURATION = 8000;

function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

class Star {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.radius = Math.random() * 2 + 0.5;
    this.alpha = Math.random();
    this.delta = (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1);
  }

  update() {
    this.alpha += this.delta;
    if (this.alpha <= 0.1 || this.alpha >= 1.0) {
      this.delta = -this.delta;
      this.alpha = Math.max(0.1, Math.min(1.0, this.alpha));
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Player {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 60;
    this.width = 40;
    this.height = 40;
    this.speed = PLAYER_SPEED;
    this.canvasWidth = canvasWidth;
  }

  update(keys) {
    if (keys['ArrowLeft'] && this.x - this.width / 2 > 0) {
      this.x -= this.speed;
    }
    if (keys['ArrowRight'] && this.x + this.width / 2 < this.canvasWidth) {
      this.x += this.speed;
    }
  }

  draw(ctx) {
    const hw = this.width / 2;
    const hh = this.height / 2;

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - hh);
    ctx.lineTo(this.x - hw, this.y + hh);
    ctx.lineTo(this.x + hw, this.y + hh);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = '#ff6d00';
    ctx.fillStyle = '#ff6d00';
    ctx.fillRect(this.x - 10, this.y + hh, 6, 8);
    ctx.fillRect(this.x + 4, this.y + hh, 6, 8);
    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height,
    };
  }
}

class Bullet {
  constructor(x, y, vx = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.width = 4;
    this.height = 12;
    this.speed = BULLET_SPEED;
    this.active = true;
  }

  update() {
    this.x += this.vx;
    this.y -= this.speed;
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffeb3b';
    ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
    ctx.fillRect(this.x - this.width / 2 - 2, this.y - 2, this.width + 4, this.height + 4);
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    ctx.restore();
  }

  getHitbox() {
    return { x: this.x - this.width / 2, y: this.y, w: this.width, h: this.height };
  }

  isOffScreen() {
    return this.y + this.height < 0 || this.x < 0 || this.x > CANVAS_WIDTH;
  }
}

class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'rapid' | 'spread'
    this.width = 20;
    this.height = 24;
    this.speed = 1.5;
    this.active = true;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    const color = this.type === 'rapid' ? '#00e676' : '#ff9100';
    const label = this.type === 'rapid' ? 'R' : 'S';

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 12);
    ctx.lineTo(this.x + 10, this.y);
    ctx.lineTo(this.x, this.y + 12);
    ctx.lineTo(this.x - 10, this.y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, this.x, this.y);
    ctx.restore();
  }

  getHitbox() {
    return { x: this.x - 10, y: this.y - 12, w: 20, h: 24 };
  }

  isOffScreen(canvasHeight) {
    return this.y > canvasHeight;
  }
}

class Enemy {
  constructor(x, speed) {
    this.x = x;
    this.y = -40;
    this.width = 36;
    this.height = 28;
    this.speed = speed;
    this.active = true;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    const ex = this.x;
    const ey = this.y;

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#e040fb';
    ctx.fillStyle = '#e040fb';

    ctx.fillRect(ex - 14, ey + 8, 28, 16);

    ctx.beginPath();
    ctx.arc(ex, ey + 10, 10, Math.PI, 0);
    ctx.fill();

    ctx.fillRect(ex - 20, ey + 12, 8, 5);
    ctx.fillRect(ex - 22, ey + 16, 5, 8);

    ctx.fillRect(ex + 12, ey + 12, 8, 5);
    ctx.fillRect(ex + 17, ey + 16, 5, 8);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 5, ey + 11, 3, 0, Math.PI * 2);
    ctx.arc(ex + 5, ey + 11, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getHitbox() {
    return { x: this.x - this.width / 2, y: this.y, w: this.width, h: this.height };
  }

  isOffScreen(canvasHeight) {
    return this.y > canvasHeight;
  }
}

const Game = {
  canvas: null,
  ctx: null,
  state: 'START',
  stars: [],
  player: null,
  bullets: [],
  enemies: [],
  powerups: [],
  activePowerups: { rapid: 0, spread: 0 },
  score: 0,
  keys: {},
  lastShotTime: 0,
  lastEnemySpawnTime: 0,
  spawnInterval: INITIAL_SPAWN_INTERVAL,
  gameStartTime: 0,
  animFrameId: null,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    for (let i = 0; i < NUM_STARS; i++) {
      this.stars.push(new Star(CANVAS_WIDTH, CANVAS_HEIGHT));
    }

    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  },

  startGame() {
    this.player = new Player(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.bullets = [];
    this.enemies = [];
    this.powerups = [];
    this.activePowerups = { rapid: 0, spread: 0 };
    this.score = 0;
    this.spawnInterval = INITIAL_SPAWN_INTERVAL;
    this.gameStartTime = performance.now();
    this.lastEnemySpawnTime = this.gameStartTime;
    this.lastShotTime = 0;
    this.state = 'PLAYING';
  },

  gameOver() {
    this.state = 'GAME_OVER';
  },

  spawnEnemy() {
    const elapsed = performance.now() - this.gameStartTime;
    const speed = Math.min(ENEMY_MAX_SPEED, ENEMY_BASE_SPEED + elapsed / 30000);
    const hw = 18;
    const x = Math.random() * (CANVAS_WIDTH - hw * 2) + hw;
    this.enemies.push(new Enemy(x, speed));
  },

  updateSpawnRate(now) {
    const elapsed = now - this.gameStartTime;
    this.spawnInterval = Math.max(MIN_SPAWN_INTERVAL, INITIAL_SPAWN_INTERVAL - elapsed / 10);
  },

  checkCollisions(now) {
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;
      for (const enemy of this.enemies) {
        if (!enemy.active) continue;
        if (aabbOverlap(bullet.getHitbox(), enemy.getHitbox())) {
          bullet.active = false;
          enemy.active = false;
          this.score += 10;
          if (Math.random() < POWERUP_DROP_CHANCE) {
            const type = Math.random() < 0.5 ? 'rapid' : 'spread';
            this.powerups.push(new Powerup(enemy.x, enemy.y, type));
          }
          break;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => b.active);
    this.enemies = this.enemies.filter((e) => e.active);

    const playerHitbox = this.player.getHitbox();
    for (const p of this.powerups) {
      if (!p.active) continue;
      if (aabbOverlap(playerHitbox, p.getHitbox())) {
        p.active = false;
        this.activePowerups[p.type] = now + POWERUP_DURATION;
      }
    }
    this.powerups = this.powerups.filter((p) => p.active && !p.isOffScreen(CANVAS_HEIGHT));
  },

  handleKeyDown(e) {
    this.keys[e.key] = true;
    if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === ' ') {
      if (this.state === 'START' || this.state === 'GAME_OVER') {
        this.startGame();
      }
    }
  },

  handleKeyUp(e) {
    this.keys[e.key] = false;
  },

  update(now) {
    this.stars.forEach((s) => s.update());

    if (this.state !== 'PLAYING') return;

    this.player.update(this.keys);

    const cooldown = this.activePowerups.rapid > now ? RAPID_COOLDOWN : SHOT_COOLDOWN;
    if (this.keys[' '] && now - this.lastShotTime > cooldown) {
      const bx = this.player.x;
      const by = this.player.y - 20;
      if (this.activePowerups.spread > now) {
        this.bullets.push(new Bullet(bx, by, 0));
        this.bullets.push(new Bullet(bx, by, -3.5));
        this.bullets.push(new Bullet(bx, by, 3.5));
      } else {
        this.bullets.push(new Bullet(bx, by, 0));
      }
      this.lastShotTime = now;
    }

    if (now - this.lastEnemySpawnTime > this.spawnInterval) {
      this.spawnEnemy();
      this.lastEnemySpawnTime = now;
      this.updateSpawnRate(now);
    }

    this.bullets.forEach((b) => b.update());
    this.bullets = this.bullets.filter((b) => !b.isOffScreen());

    for (const enemy of this.enemies) {
      enemy.update();
      if (enemy.isOffScreen(CANVAS_HEIGHT)) {
        this.gameOver();
        return;
      }
    }

    this.powerups.forEach((p) => p.update());

    this.checkCollisions(now);
  },

  draw() {
    const ctx = this.ctx;

    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.stars.forEach((s) => s.draw(ctx));

    if (this.state === 'START') {
      this.drawStartScreen();
    } else if (this.state === 'PLAYING') {
      this.player.draw(ctx);
      this.bullets.forEach((b) => b.draw(ctx));
      this.enemies.forEach((e) => e.draw(ctx));
      this.powerups.forEach((p) => p.draw(ctx));
      this.drawScore();
      this.drawPowerupHUD();
    } else if (this.state === 'GAME_OVER') {
      this.enemies.forEach((e) => e.draw(ctx));
      this.drawGameOverScreen();
    }
  },

  drawScore() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCORE: ' + this.score, 16, 32);
    ctx.restore();
  },

  drawPowerupHUD() {
    const ctx = this.ctx;
    const now = performance.now();
    const defs = [
      { type: 'rapid', label: 'RAPID', color: '#00e676' },
      { type: 'spread', label: 'SPREAD', color: '#ff9100' },
    ];

    ctx.save();
    ctx.textBaseline = 'middle';

    let xRight = CANVAS_WIDTH - 16;
    for (const def of defs) {
      const expiry = this.activePowerups[def.type];
      if (expiry <= now) continue;

      const remaining = (expiry - now) / POWERUP_DURATION;
      const barW = 64;
      const barH = 10;
      const barX = xRight - barW;
      const barY = 16;

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.shadowBlur = 6;
      ctx.shadowColor = def.color;
      ctx.fillStyle = def.color;
      ctx.fillRect(barX, barY, barW * remaining, barH);
      ctx.shadowBlur = 0;

      ctx.fillStyle = def.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(def.label, barX - 6, barY + barH / 2);

      xRight -= barW + 72;
    }

    ctx.restore();
  },

  drawStartScreen() {
    const ctx = this.ctx;
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const pulse = Math.sin(performance.now() / 500) * 0.5 + 0.5;

    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 52px monospace';
    ctx.fillText('SPACE SHOOTER', cx, cy - 60);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aaaacc';
    ctx.font = '18px monospace';
    ctx.fillText('Destroy the invaders before they reach you!', cx, cy - 10);

    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText('Press SPACE to Start', cx, cy + 40);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#666688';
    ctx.font = '16px monospace';
    ctx.fillText('ARROW KEYS  move    SPACE  fire', cx, cy + 100);

    ctx.fillStyle = '#00e676';
    ctx.fillText('R = Rapid Fire', cx - 90, cy + 130);
    ctx.fillStyle = '#ff9100';
    ctx.fillText('S = Spread Shot', cx + 90, cy + 130);

    ctx.restore();
  },

  drawGameOverScreen() {
    const ctx = this.ctx;
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const pulse = Math.sin(performance.now() / 500) * 0.5 + 0.5;

    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowBlur = 16;
    ctx.shadowColor = '#e040fb';
    ctx.fillStyle = '#e040fb';
    ctx.font = 'bold 52px monospace';
    ctx.fillText('GAME OVER', cx, cy - 60);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px monospace';
    ctx.fillText('Score: ' + this.score, cx, cy);

    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText('Press SPACE to Restart', cx, cy + 60);

    ctx.restore();
  },

  loop(now) {
    this.update(now);
    this.draw();
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  },
};

window.addEventListener('load', () => Game.init());
