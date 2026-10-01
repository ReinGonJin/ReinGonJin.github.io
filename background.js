/* =====================================================
   Black Hole Background — Spiral Particle Animation
   ===================================================== */
(function () {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  let width, height, centerX, centerY;
  let particles = [];
  let animationId;

  const PARTICLE_COUNT = 600;
  const CORE_RADIUS = 4;           // visual core size
  const GLOW_RADIUS = 60;          // glow around the core
  const SPAWN_MIN_RADIUS = 120;    // min spawn distance from center
  const SPAWN_MAX_FACTOR = 0.45;   // fraction of the smaller viewport dimension
  const SPIRAL_SPEED = 0.003;      // angular velocity base
  const INWARD_SPEED = 0.15;       // radial pull base
  const FADE_RADIUS = 30;          // particles start fading when closer than this

  /* ---------- Particle ---------- */
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      const maxR = Math.min(width, height) * SPAWN_MAX_FACTOR;
      this.radius = SPAWN_MIN_RADIUS + Math.random() * (maxR - SPAWN_MIN_RADIUS);
      this.angle = Math.random() * Math.PI * 2;
      this.speed = SPIRAL_SPEED + Math.random() * SPIRAL_SPEED * 2;
      this.inward = INWARD_SPEED + Math.random() * INWARD_SPEED;
      this.size = 0.5 + Math.random() * 1.8;
      this.brightness = 0.4 + Math.random() * 0.6;

      // subtle warm/cool color mix
      const hue = Math.random() < 0.3
        ? 220 + Math.random() * 40        // blue‑ish
        : 15 + Math.random() * 30;        // warm amber
      const sat = 30 + Math.random() * 50;
      const light = 65 + Math.random() * 30;
      this.color = `hsla(${hue}, ${sat}%, ${light}%, `;
    }

    update() {
      this.angle += this.speed;
      this.radius -= this.inward;

      // respawn when sucked in
      if (this.radius < CORE_RADIUS) {
        this.reset();
      }
    }

    draw() {
      const x = centerX + Math.cos(this.angle) * this.radius;
      const y = centerY + Math.sin(this.angle) * this.radius;

      // fade near core
      let alpha = this.brightness;
      if (this.radius < FADE_RADIUS) {
        alpha *= this.radius / FADE_RADIUS;
      }

      ctx.fillStyle = this.color + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------- Core glow ---------- */
  function drawCore() {
    // outer soft glow
    const g1 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, GLOW_RADIUS);
    g1.addColorStop(0, 'rgba(120, 80, 200, 0.15)');
    g1.addColorStop(0.4, 'rgba(80, 50, 160, 0.06)');
    g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, GLOW_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // bright inner dot
    const g2 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CORE_RADIUS * 3);
    g2.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    g2.addColorStop(0.3, 'rgba(180, 140, 255, 0.4)');
    g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, CORE_RADIUS * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ---------- Loop ---------- */
  function animate() {
    // semi‑transparent clear for motion trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, width, height);

    drawCore();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationId = requestAnimationFrame(animate);
  }

  /* ---------- Init / Resize ---------- */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth * dpr;
    height = window.innerHeight * dpr;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    // Use CSS pixels for center so scaling is handled by ctx.scale
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight / 2;
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
    // stagger starting positions so the spiral looks pre‑filled
    particles.forEach(p => {
      const steps = Math.floor(Math.random() * 400);
      for (let s = 0; s < steps; s++) p.update();
    });
    cancelAnimationFrame(animationId);
    animate();
  }

  window.addEventListener('resize', () => {
    init();
  });

  init();
})();
