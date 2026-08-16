/* ============================================================
   EduQuest · templerun.js  —  神庙逃亡（三跑道极速跑酷）
   自动前进 · 三跑道切换 · 跳/滑躲障碍 · 吃金币 · 距离计分。
   英语题在关卡门作为冲刺门（答错卡关）。3 条命。
   ============================================================ */
'use strict';

const TempleRun = (() => {
  let unit = null, g = null, paused = false, running = false, asking = false;
  let lane = 1, dist = 0, speed = 250, score = 0, lives = 3, goal = 2400;
  let obstacles = [], coins = [], invuln = 0, jumpT = 0, slideT = 0;
  let pStart = null;
  const LANES = 3;

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false;
    lane = 1; dist = 0; speed = 250; score = 0; lives = 3; invuln = 0; jumpT = 0; slideT = 0;
    obstacles = []; coins = [];
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="TempleRun.quit()">← 返回</button>
        <div class="topbar-title">🏃 ${unit.icon} ${unit.name} · 神庙逃亡</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-lives" id="trLives">❤️ ${lives}</span>
        <span class="gh-score" id="trScore">📏 ${Math.floor(dist)}m</span>
        <span class="gh-energy" id="trEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="trStage"></div>
      <p class="hint game-tip">自动向前冲！左右滑动切跑道，上滑跳、下滑滑铲，躲开🌿木桩/🔥火焰。到🚩关卡门要答对英语才能冲刺，冲到终点就赢！</p>
    `, 'tr-screen');
    g = GameKit.canvas('trStage');
    bind();
    GameKit.loop(update);
  }

  function bind() {
    GameKit.bindInput(g.cv, {
      down: p => { pStart = p; },
      up: p => {
        if (!pStart) return;
        const dx = p.x - pStart.x, dy = p.y - pStart.y; pStart = null;
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) { lane = GameKit.clamp(lane + (dx > 0 ? 1 : -1), 0, LANES - 1); Audio2.click(); }
        else if (dy < -25) doJump();
        else if (dy > 25) doSlide();
        else doJump();
      }
    });
    GameKit.bindKeys({
      'ArrowLeft': () => lane = GameKit.clamp(lane - 1, 0, LANES - 1),
      'ArrowRight': () => lane = GameKit.clamp(lane + 1, 0, LANES - 1),
      'ArrowUp': doJump, ' ': doJump, 'Spacebar': doJump, 'ArrowDown': doSlide
    });
  }
  function doJump() { if (running && !paused && asking === false && jumpT <= 0 && slideT <= 0) { jumpT = 0.6; Audio2.pop(); } }
  function doSlide() { if (running && !paused && asking === false && jumpT <= 0) { slideT = 0.5; Audio2.pop(); } }

  function update(dt) {
    if (!running || paused || asking) return;
    speed = Math.min(420, speed + dt * 6);
    dist += speed * dt;
    if (jumpT > 0) jumpT -= dt;
    if (slideT > 0) slideT -= dt;
    if (invuln > 0) invuln -= dt;

    // 生成障碍/金币
    if (!obstacles.length || obstacles[obstacles.length - 1].d < dist + g.W + 260) {
      if (Math.random() < 0.6) {
        const ln = Math.floor(Math.random() * LANES);
        const type = ['log', 'fire', 'gap'][Math.floor(Math.random() * 3)];
        obstacles.push({ d: dist + g.W + 120 + Math.random() * 200, lane: ln, type, hit: false });
      }
    }
    if (!coins.length || coins[coins.length - 1].d < dist + g.W + 200) {
      if (Math.random() < 0.8) {
        const ln = Math.floor(Math.random() * LANES);
        coins.push({ d: dist + g.W + 100, lane: ln, taken: false });
      }
    }

    const playerD = dist, playerScreenX = g.W * 0.26;
    // 障碍碰撞
    obstacles.forEach(o => {
      if (o.hit) return;
      const rel = o.d - playerD;
      if (rel <= 6 && rel > -40) {
        if (o.lane === lane) {
          const jumping = jumpT > 0.18;
          const sliding = slideT > 0;
          let safe = false;
          if (o.type === 'log' || o.type === 'gap') safe = jumping;
          else if (o.type === 'fire') safe = false; // 必须换道
          if (!safe && invuln <= 0) { hit(); o.hit = true; }
          else if (safe) o.hit = true;
        } else o.hit = true;
      }
    });
    // 金币
    coins.forEach(c => {
      if (c.taken) return;
      const rel = c.d - playerD;
      if (rel <= 6 && rel > -30 && c.lane === lane) { c.taken = true; score += 15; Audio2.coin(); upScore(); }
    });
    // 清理
    obstacles = obstacles.filter(o => o.d > dist - 80);
    coins = coins.filter(c => c.d > dist - 80);

    // 关卡门
    if (Math.floor(dist) % 600 < speed * dt && Math.floor(dist) >= 600 && !cpsDone(dist)) { gate(); }

    if (dist >= goal) { win(); return; }
    render();
  }

  let _cps = new Set();
  function cpsDone(d) { const k = Math.floor(d / 600); if (_cps.has(k)) return true; _cps.add(k); return false; }

  function gate() {
    asking = true; paused = true;
    GameKit.quizGate(unit, {
      title: '🚩 冲刺关卡！答对英语加速冲',
      sub: '答错要重听重答，答对才能继续冲刺',
      cls: 'tr-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      GameKit.setEnergy(unit.id, 'trEnergy');
      speed = Math.min(420, speed + 30);
      asking = false; paused = false;
      UI.toast('答对啦，加速！⚡', 1200);
    });
  }

  function hit() {
    lives--; Audio2.bad(); invuln = 1.2;
    document.getElementById('trLives').textContent = '❤️ ' + Math.max(0, lives);
    if (lives <= 0) { running = false; GameKit.fail(unit, { head: '💥 摔了一跤', text: '三条命用完啦，注意左右切道躲🌿🔥，再试一次！', replay: `TempleRun.play(UNITS.find(u=>u.id===${unit.id}))` }); }
    else UI.toast('💔 撞到障碍，小心！', 1000);
  }
  function upScore() { const e = document.getElementById('trScore'); if (e) e.textContent = '📏 ' + Math.floor(dist) + 'm'; }

  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#3a2a5a'); grd.addColorStop(1, '#7a5a9a');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    const groundY = H * 0.82;
    const laneX = i => W * (0.18 + i * 0.32);
    // 跑道
    for (let i = 0; i < LANES; i++) {
      ctx.fillStyle = i === lane ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)';
      ctx.fillRect(laneX(i) - W * 0.14, groundY, W * 0.28, H - groundY);
    }
    ctx.fillStyle = '#caa46a'; ctx.fillRect(0, groundY, W, H - groundY);
    // 障碍
    ctx.font = '30px serif'; ctx.textAlign = 'center';
    obstacles.forEach(o => {
      const sx = g.W * 0.26 + (o.d - dist);
      if (sx < -40 || sx > W + 40) return;
      ctx.fillText(o.type === 'log' ? '🌿' : o.type === 'fire' ? '🔥' : '🕳️', laneX(o.lane), groundY - 6);
    });
    // 金币
    ctx.font = '22px serif';
    coins.forEach(c => { if (c.taken) return; const sx = g.W * 0.26 + (c.d - dist); if (sx < -30 || sx > W + 30) return; ctx.fillText('🪙', laneX(c.lane), groundY - 40); });
    // 玩家
    const px = laneX(lane);
    let py = groundY;
    if (jumpT > 0) py = groundY - 60 * Math.sin((0.6 - jumpT) / 0.6 * Math.PI);
    const icon = slideT > 0 ? '🛡️' : invuln > 0 && Math.floor(invuln * 10) % 2 ? '💫' : '🏃';
    ctx.font = '34px serif';
    ctx.fillText(icon, px, py - 6);
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 逃出生天！', text: `你冲过了 ${Math.floor(goal)} 米神庙跑道，躲开了所有陷阱！`, replay: `TempleRun.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  return { play, quit };
})();

window.TempleRun = TempleRun;
