/* ============================================================
   EduQuest · planewar.js  —  飞机大战（纵向卷轴射击）
   手指/鼠标拖动战机 · 自动开火 · 敌机下坠并反击 · 击落计分。
   英语「💥大招」：答对英语清屏并奖励能量（答错循环、必须答对）。
   原创素材（蓝战机 vs 红敌机），不侵权。
   ============================================================ */
'use strict';

const PlaneWar = (() => {
  let unit = null, g = null, paused = false, running = false, asking = false;
  let player, bullets, enemies, ebullets, booms, stars;
  let lives, score, target, fireT, spawnT, invuln, bombtip;

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false;
    lives = 3; score = 0; target = 30; fireT = 0; spawnT = 0.6; invuln = 0;
    bullets = []; enemies = []; ebullets = []; booms = [];
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="PlaneWar.quit()">← 返回</button>
        <div class="topbar-title">✈️ ${unit.icon} ${unit.name} · 飞机大战</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-lives" id="pwLives">❤️ ${lives}</span>
        <span class="gh-score" id="pwScore">🎯 ${score}/${target}</span>
        <span class="gh-energy" id="pwEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="pwStage"></div>
      <div class="ab-bar">
        <button class="ab-bomb" id="pwBomb">💥 英语大招</button>
        <span class="ab-hint">拖动屏幕操控战机，自动开火！</span>
      </div>
      <p class="hint game-tip">手指按住屏幕拖动，蓝色战机跟随移动并自动开火击落红色敌机。被撞或中弹会扣❤️。卡关时点💥英语大招，答对英语就能清屏突围！</p>
    `, 'pw-screen');
    g = GameKit.canvas('pwStage');
    player = { x: g.W / 2, y: g.H - 70, r: 16, tx: g.W / 2, ty: g.H - 70, cd: 0 };
    stars = Array.from({ length: 40 }, () => ({ x: Math.random() * g.W, y: Math.random() * g.H, s: 1 + Math.random() * 2 }));
    bind();
    GameKit.loop(update);
  }

  function bind() {
    GameKit.bindInput(g.cv, {
      down: p => { player.tx = p.x; player.ty = p.y; },
      move: p => { player.tx = p.x; player.ty = p.y; },
      up: p => { player.tx = p.x; player.ty = p.y; }
    });
    // 空格 = 英语大招（键盘辅助）；方向键持续移动由底部 IIFE 的 keys 状态处理
    GameKit.bindKeys({ ' ': () => bomb() });
  }

  function update(dt) {
    if (!running || paused || asking) return;
    if (invuln > 0) invuln -= dt;
    // 背景星移动
    stars.forEach(s => { s.y += (20 + s.s * 12) * dt; if (s.y > g.H) { s.y = 0; s.x = Math.random() * g.W; } });
    // 玩家移动（指针跟随 + 键盘）
    const ksp = 260;
    if (keys.left) player.tx -= ksp * dt;
    if (keys.right) player.tx += ksp * dt;
    if (keys.up) player.ty -= ksp * dt;
    if (keys.down) player.ty += ksp * dt;
    player.x += (player.tx - player.x) * Math.min(1, dt * 12);
    player.y += (player.ty - player.y) * Math.min(1, dt * 12);
    player.x = GameKit.clamp(player.x, player.r + 4, g.W - player.r - 4);
    player.y = GameKit.clamp(player.y, g.H * 0.28, g.H - player.r - 6);
    // 自动开火
    player.cd -= dt;
    if (player.cd <= 0) { bullets.push({ x: player.x, y: player.y - player.r, vy: -560 }); player.cd = 0.2; Audio2.shoot && Audio2.shoot(); }
    // 敌机生成
    spawnT -= dt;
    if (spawnT <= 0) { spawnEnemy(); spawnT = Math.max(0.45, 1.1 - score * 0.012); }
    // 子弹
    for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.y += b.vy * dt; if (b.y < -10) bullets.splice(i, 1); }
    // 敌机
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.vy * dt; e.x += Math.sin((e.y + e.seed) * 0.02) * e.sway * dt;
      e.shootT -= dt;
      if (e.type === 'b' && e.shootT <= 0) { ebullets.push({ x: e.x, y: e.y + e.r, vy: 240 }); e.shootT = 1.6 + Math.random(); }
      if (e.y > g.H + 20) { enemies.splice(i, 1); loseLife(); continue; }
    }
    // 敌弹
    for (let i = ebullets.length - 1; i >= 0; i--) { const b = ebullets[i]; b.y += b.vy * dt; if (b.y > g.H + 10) ebullets.splice(i, 1); }
    // 碰撞：子弹×敌机
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + 4) {
          bullets.splice(i, 1); e.hp--; Audio2.pop();
          if (e.hp <= 0) { enemies.splice(j, 1); score++; booms.push({ x: e.x, y: e.y, t: 0 }); Audio2.good(); updateScore(); }
          break;
        }
      }
    }
    // 碰撞：敌机/敌弹 × 玩家
    if (invuln <= 0) {
      const hit = (x, y, r) => Math.hypot(x - player.x, y - player.y) < r + player.r;
      for (let j = enemies.length - 1; j >= 0; j--) { if (hit(enemies[j].x, enemies[j].y, enemies[j].r)) { enemies.splice(j, 1); booms.push({ x: player.x, y: player.y, t: 0 }); loseLife(); break; } }
      for (let i = ebullets.length - 1; i >= 0; i--) { if (hit(ebullets[i].x, ebullets[i].y, 4)) { ebullets.splice(i, 1); booms.push({ x: player.x, y: player.y, t: 0 }); loseLife(); break; } }
    }
    // 爆炸动画
    for (let i = booms.length - 1; i >= 0; i--) { booms[i].t += dt * 2.4; if (booms[i].t >= 1) booms.splice(i, 1); }
    // 胜负
    if (score >= target) { win(); return; }
    if (lives <= 0 && running) { running = false; GameKit.fail(unit, { head: '💥 战机坠毁', text: `你击落了 ${score} 架敌机！多用💥英语大招清屏突围，再试一次吧。`, replay: `PlaneWar.play(UNITS.find(u=>u.id===${unit.id}))` }); return; }
    render();
  }

  function spawnEnemy() {
    const type = Math.random() < 0.35 ? 'b' : 'a';
    enemies.push({
      x: 30 + Math.random() * (g.W - 60), y: -20,
      r: type === 'b' ? 15 : 13, vy: type === 'b' ? 55 + Math.random() * 25 : 80 + Math.random() * 50,
      hp: type === 'b' ? 2 : 1, type, sway: 20 + Math.random() * 30, seed: Math.random() * 1000,
      shootT: 1 + Math.random()
    });
  }
  function loseLife() {
    if (invuln > 0) return;
    lives--; invuln = 1.2; Audio2.bad();
    document.getElementById('pwLives').textContent = lives > 0 ? '❤️ '.repeat(lives).trim() : '💀';
  }
  function updateScore() { const e = document.getElementById('pwScore'); if (e) e.textContent = `🎯 ${score}/${target}`; }

  function bomb() {
    if (asking || !running) return;
    asking = true; paused = true;
    GameKit.quizGate(unit, {
      title: '💥 英语大招！答对清屏突围',
      sub: '答对后全屏敌机被清空，奖励能量',
      cls: 'pw-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      GameKit.setEnergy(unit.id, 'pwEnergy');
      enemies.forEach(e => booms.push({ x: e.x, y: e.y, t: 0 }));
      enemies = []; ebullets = []; invuln = 1.5;
      asking = false; paused = false;
      UI.toast('💥 清屏！', 1200);
    });
  }

  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0b1f4a'); sky.addColorStop(1, '#1d3b73');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    stars.forEach(s => { ctx.fillRect(s.x, s.y, s.s, s.s); });
    // 子弹
    bullets.forEach(b => Sprites.bullet(ctx, b.x, b.y, 5));
    ebullets.forEach(b => Sprites.enemyBullet(ctx, b.x, b.y, 5));
    // 敌机
    enemies.forEach(e => Sprites.enemyPlane(ctx, e.x, e.y, e.r, e.type === 'b' ? '#c0443a' : '#ff5a4d'));
    // 爆炸
    booms.forEach(b => Sprites.boom(ctx, b.x, b.y, 26, b.t));
    // 玩家
    if (invuln <= 0 || Math.floor(invuln * 12) % 2 === 0) Sprites.plane(ctx, player.x, player.y, player.r, '#3aa0ff');
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 空战胜利！', text: `你击落了全部 ${target} 架敌机，守住了天空！`, replay: `PlaneWar.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  // 键盘持续状态
  const keys = { left: false, right: false, up: false, down: false };
  (function () {
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    window.addEventListener('keydown', e => { if (map[e.key]) { keys[map[e.key]] = true; } });
    window.addEventListener('keyup', e => { if (map[e.key]) { keys[map[e.key]] = false; } });
  })();

  function afterPlay() {
    const b = document.getElementById('pwBomb'); if (b) b.onclick = () => bomb();
    // 首次也走 playWrap 的 setTimeout 绑定
  }
  const _play = play;
  function playWrap(u) { _play(u); setTimeout(afterPlay, 0); }
  return { play: playWrap, quit };
})();

window.PlaneWar = PlaneWar;
