/* ============================================================
   EduQuest · angrybirds.js  —  愤怒的小鸟（弹弓物理）
   拖拽瞄准+抛物线预览 · 发射小鸟 · 木/石/冰方块堆叠 · 命中绿猪爆破。
   英语题作为「💣炸弹鸟」：答对换上炸弹鸟，命中范围爆炸清场。
   ============================================================ */
'use strict';

const AngryBirds = (() => {
  let unit = null, g = null, paused = false, running = false, asking = false;
  let groundY, slingX, slingY, bird = null, blocks = [], pigs = [], trail = [];
  let birdsLeft = 4, dragging = false, dragPt = null, bombNext = false, settleT = 0;

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false; bombNext = false;
    birdsLeft = 4; dragging = false; settleT = 0;
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="AngryBirds.quit()">← 返回</button>
        <div class="topbar-title">🐦 ${unit.icon} ${unit.name} · 愤怒的小鸟</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-lives" id="abBirds">🐦 ${birdsLeft}</span>
        <span class="gh-score" id="abPigs">🐷 ${0}/${1}</span>
        <span class="gh-energy" id="abEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="abStage"></div>
      <div class="ab-bar">
        <button class="ab-bomb" id="abBomb">💣 炸弹鸟</button>
      </div>
      <p class="hint game-tip">按住小鸟往后拉再松手发射，瞄准绿猪🐷把城堡砸塌！卡关时点💣炸弹鸟，答对英语换上会爆炸的鸟，一击清场。</p>
    `, 'ab-screen');
    g = GameKit.canvas('abStage');
    groundY = g.H * 0.86; slingX = g.W * 0.14; slingY = groundY - 60;
    build();
    bind();
    updatePigs();
    GameKit.loop(update);
  }

  function build() {
    const total = Math.min(unit.vocab.length, 4);
    pigs = []; blocks = [];
    const baseX = g.W * 0.62;
    // 两座结构
    for (let s = 0; s < 2; s++) {
      const bx = baseX + s * g.W * 0.18;
      const mats = ['wood', 'stone', 'ice'];
      for (let row = 0; row < 3; row++) for (let col = 0; col < 2; col++) {
        blocks.push({ x: bx + col * 42, y: groundY - 42 - row * 42, w: 40, h: 40, mat: mats[(row + col) % 3], vx: 0, vy: 0, settled: true });
      }
      pigs.push({ x: bx + 42, y: groundY - 22, r: 20, alive: true });
    }
    // 额外空中猪
    pigs.push({ x: baseX + g.W * 0.36, y: groundY - 150, r: 20, alive: true });
    total && pigs.push(pigs[0]);
  }

  function bind() {
    GameKit.bindInput(g.cv, {
      down: p => { if (asking || !running || bird) return; const d = Math.hypot(p.x - slingX, p.y - slingY); if (d < 70) { dragging = true; dragPt = p; } },
      move: p => { if (dragging) dragPt = p; },
      up: p => { if (dragging) { launch(p); dragging = false; } }
    });
  }
  function launch(p) {
    let dx = slingX - p.x, dy = slingY - p.y;
    const d = Math.hypot(dx, dy); const max = 90;
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    bird = { x: slingX, y: slingY, vx: dx * 6, vy: dy * 6, r: 15, bomb: bombNext, alive: true, rest: 0 };
    bombNext = false;
    birdsLeft--; document.getElementById('abBirds').textContent = '🐦 ' + Math.max(0, birdsLeft);
    Audio2.pop();
  }

  function update(dt) {
    if (!running || paused || asking) return;
    const G = 1300;
    if (bird && bird.alive) {
      bird.vy += G * dt;
      bird.x += bird.vx * dt; bird.y += bird.vy * dt;
      // 地面
      if (bird.y + bird.r > groundY) { bird.y = groundY - bird.r; bird.vy *= -0.4; bird.vx *= 0.6; if (Math.abs(bird.vy) < 40) bird.vy = 0; }
      // 墙体
      if (bird.x < bird.r) { bird.x = bird.r; bird.vx *= -0.5; }
      // 碰撞方块
      blocks.forEach(b => {
        if (b.dead) return;
        const cx = GameKit.clamp(bird.x, b.x, b.x + b.w), cy = GameKit.clamp(bird.y, b.y, b.y + b.h);
        const ddx = bird.x - cx, ddy = bird.y - cy, d2 = ddx * ddx + ddy * ddy;
        if (d2 < bird.r * bird.r) {
          const nx = ddx / (Math.hypot(ddx, ddy) || 1), ny = ddy / (Math.hypot(ddx, ddy) || 1);
          const sp = Math.hypot(bird.vx, bird.vy);
          bird.vx = bird.vx * 0.4 - nx * sp * 0.5; bird.vy = bird.vy * 0.4 - ny * sp * 0.5;
          b.vx += -nx * sp * 0.5; b.vy += -ny * sp * 0.5 - 60; b.settled = false;
          Audio2.hit();
          if (bird.bomb) { explode(bird.x, bird.y); bird.alive = false; }
        }
      });
      // 碰猪
      pigs.forEach(pg => {
        if (!pg.alive) return;
        if (Math.hypot(bird.x - pg.x, bird.y - pg.y) < bird.r + pg.r) {
          if (bird.bomb) explode(bird.x, bird.y);
          pg.alive = false; Audio2.good(); updatePigs();
        }
      });
      // 出界/停下
      if (bird.x > g.W + 60 || bird.x < -60) bird.alive = false;
      if (Math.abs(bird.vx) < 18 && Math.abs(bird.vy) < 30 && bird.y + bird.r >= groundY - 2) { bird.rest += dt; if (bird.rest > 0.7) bird.alive = false; }
      if (!bird.alive && bird.bomb && false) {}
    } else if (bird && !bird.alive) {
      bird = null; settleT = 0;
      if (pigs.some(p => p.alive)) {
        if (birdsLeft <= 0) { running = false; GameKit.fail(unit, { head: '🐷 绿猪还在！', text: '小鸟用完啦，瞄准猪正上方的结构再发射，再试一次！', replay: `AngryBirds.play(UNITS.find(u=>u.id===${unit.id}))` }); return; }
        else if (!bombNext) { /* 等待玩家拉弓 */ }
      }
    }
    // 方块动态
    blocks.forEach(b => {
      if (b.dead || b.settled) return;
      b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.98;
      if (b.y + b.h > groundY) { b.y = groundY - b.h; b.vy = 0; b.vx *= 0.7; if (Math.abs(b.vx) < 6) b.settled = true; }
      // 压到猪
      pigs.forEach(pg => { if (pg.alive && Math.abs((b.x + b.w / 2) - pg.x) < 28 && Math.abs((b.y + b.h) - pg.y) < 30 && Math.hypot(b.vx, b.vy) > 40) { pg.alive = false; Audio2.good(); updatePigs(); } });
      // 砸到其他方块
      blocks.forEach(o => { if (o !== b && !o.dead && Math.abs(b.x - o.x) < 44 && Math.abs(b.y - o.y) < 44) { o.vx += b.vx * 0.3; o.vy += b.vy * 0.3; o.settled = false; } });
    });
    // 胜利
    if (pigs.length && !pigs.some(p => p.alive)) { win(); return; }
    render();
  }

  function explode(x, y) {
    Audio2.bad();
    blocks.forEach(b => { if (Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < 75) b.dead = true; });
    pigs.forEach(pg => { if (pg.alive && Math.hypot(pg.x - x, pg.y - y) < 75) { pg.alive = false; } });
    updatePigs();
  }
  function updatePigs() {
    const alive = pigs.filter(p => p.alive).length;
    const e = document.getElementById('abPigs'); if (e) e.textContent = `🐷 ${pigs.length - alive}/${pigs.length}`;
  }

  function bomb() {
    if (asking || !running || bird) return;
    if (birdsLeft <= 0) { UI.toast('小鸟用完啦'); return; }
    asking = true; paused = true;
    GameKit.quizGate(unit, {
      title: '💣 炸弹鸟！答对换上爆炸鸟',
      sub: '答对后下一发小鸟命中即爆炸，清掉一片',
      cls: 'ab-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      GameKit.setEnergy(unit.id, 'abEnergy');
      bombNext = true; asking = false; paused = false;
      UI.toast('💣 炸弹鸟已装填！', 1400);
    });
  }

  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#bfe9ff'; ctx.fillRect(0, 0, W, H);
    // 远山
    ctx.fillStyle = '#9fd6a0'; ctx.fillRect(0, groundY - 30, W, 30);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(0, groundY, W, H - groundY);
    // 弹弓
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(slingX, slingY); ctx.lineTo(slingX, groundY); ctx.stroke();
    // 方块
    const col = { wood: '#c8924a', stone: '#9aa0a6', ice: '#9fd8ff' };
    blocks.forEach(b => { if (b.dead) return; ctx.fillStyle = col[b.mat]; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.strokeRect(b.x, b.y, b.w, b.h); });
    // 猪
    ctx.font = '34px serif'; ctx.textAlign = 'center';
    pigs.forEach(pg => { if (pg.alive) ctx.fillText('🐷', pg.x, pg.y + 12); });
    // 瞄准轨迹
    if (dragging && dragPt) {
      let dx = slingX - dragPt.x, dy = slingY - dragPt.y; const d = Math.hypot(dx, dy); const max = 90;
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      let px = slingX, py = slingY, vx = dx * 6, vy = dy * 6;
      ctx.fillStyle = 'rgba(255,80,80,0.7)';
      for (let i = 0; i < 28; i++) { vy += 1300 * 0.03; px += vx * 0.03; py += vy * 0.03; if (i % 2 === 0) { ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill(); } }
    }
    // 小鸟
    if (bird && bird.alive) { ctx.font = '30px serif'; ctx.fillText(bird.bomb ? '💣' : '🐦', bird.x, bird.y + 12); }
    else { ctx.font = '30px serif'; ctx.fillText('🐦', slingX, slingY + 12); } // 待发
    // 弹弓皮筋
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(slingX - 6, slingY); ctx.lineTo(bird && bird.alive ? bird.x : slingX, bird && bird.alive ? bird.y : slingY); ctx.lineTo(slingX + 6, slingY); ctx.stroke();
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 绿猪全灭！', text: '你用弹弓把猪城堡砸塌了，干得漂亮！', replay: `AngryBirds.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  // 绑定炸弹按钮（在 play 之后由 DOM 注册）
  function afterPlay() { const b = document.getElementById('abBomb'); if (b) b.onclick = () => bomb(); }

  // 用 setTimeout 确保 DOM 已渲染后绑定
  const _play = play;
  function playWrap(u) { _play(u); setTimeout(afterPlay, 0); }
  return { play: playWrap, quit };
})();

window.AngryBirds = AngryBirds;
