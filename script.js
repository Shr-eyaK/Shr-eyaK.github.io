(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Pac-Man scroll progress ----
  var lane = document.getElementById('pellets');
  var pac = document.getElementById('pac');
  var COUNT = 28;
  var pellets = [];

  for (var i = 0; i < COUNT; i++) {
    var dot = document.createElement('i');
    lane.appendChild(dot);
    pellets.push(dot);
  }

  function updateProgress() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    var width = pac.parentElement.clientWidth - 20;
    pac.style.left = (p * width) + 'px';
    for (var i = 0; i < COUNT; i++) {
      var pelletX = (i + 0.5) / COUNT * width + 10;
      pellets[i].style.visibility = pelletX < p * width + 10 ? 'hidden' : 'visible';
    }
  }

  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  // ---- Starry night sky ----
  var canvas = document.getElementById('sky');
  var ctx = canvas.getContext('2d');
  var W, H, stars = [], shoot = null, t = 0;

  function resize() {
    var dpr = devicePixelRatio || 1;
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    var n = Math.min(220, Math.floor(W * H / 6500));
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        phase: Math.random() * 6.28,
        speed: Math.random() * 1.5 + 0.5,
        color: Math.random() < 0.15 ? '#ffd84d' : (Math.random() < 0.2 ? '#62e6ff' : '#e9edff')
      });
    }
  }

  // Van Gogh-style swirl: a slowly rotating spiral
  function swirl(cx, cy, radius, color) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    for (var k = 0; k < 4; k++) {
      ctx.beginPath();
      for (var a = 0; a < 9; a += 0.15) {
        var r = radius * (a / 9) + k * 10;
        var px = cx + Math.cos(a + t * 0.08 + k) * r;
        var py = cy + Math.sin(a + t * 0.08 + k) * r * 0.6;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  function draw() {
    t += 0.016;

    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#070a22');
    g.addColorStop(1, '#182060');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.12;
    swirl(W * 0.3, H * 0.55, Math.min(W, H) * 0.45, '#62e6ff');
    swirl(W * 0.75, H * 0.8, Math.min(W, H) * 0.3, '#ff7ac0');

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = reduce ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = s.color;
      var size = s.r > 1.4 ? 3 : 2;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), size, size);
    }
    ctx.globalAlpha = 1;

    if (!reduce) {
      if (!shoot && Math.random() < 0.004) {
        shoot = { x: Math.random() * W * 0.8 + W * 0.2, y: Math.random() * H * 0.4, life: 0 };
      }
      if (shoot) {
        shoot.x -= 9;
        shoot.y += 4;
        shoot.life++;
        var trail = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x + 60, shoot.y - 27);
        trail.addColorStop(0, '#ffd84d');
        trail.addColorStop(1, 'rgba(255,216,77,0)');
        ctx.strokeStyle = trail;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(shoot.x, shoot.y);
        ctx.lineTo(shoot.x + 60, shoot.y - 27);
        ctx.stroke();
        if (shoot.life > 60) shoot = null;
      }
      requestAnimationFrame(draw);
    }
  }

  addEventListener('resize', function () {
    resize();
    if (reduce) draw();
  });

  resize();
  draw();
})();