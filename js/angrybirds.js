/* ============================================================
   EduQuest · angrybirds.js  —  愤怒的小鸟（弹弓物理，更好操作）
   全屏拖拽瞄准（手指/鼠标按住任意处往后拉，松手发射）· 清晰抛物线预览 ·
   砸塌猪城堡。英语题作为「💣炸弹鸟」：答对换上爆炸鸟，命中范围清场。
   贴近真实愤怒的小鸟玩法，但全部原创素材、不侵权。
   ============================================================ */
'use strict';

const AngryBirds = (() => {
  let unit = null, g = null, paused = false, running = false, asking = false;
  let groundY, slingX, slingY, bird = null, blocks = [], pigs = [], trail = [];
  let birdsLeft = 5, dragging = false, dragPt = null, bombNext = false;
  const MAXR = 160;         // 最大拉拽半径（更大更好发力）
  const POWER = 8;          // 发射力度系数（从弹弓发射）
  const G_STEP = 1000 * 0.028; // 轨迹预览每步重力增量（与 update 的 G 一致）
  const MIN_SPEED = 130;    // 最小出射速度，避免轻拉「不动」

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false; bombNext = false;
    birdsLeft = 5; dragging = false; dragPt = null;
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="AngryBirds.quit()">← 返回</button>
        <div class="topbar-title">🐦 ${unit.icon} ${unit.name} · 愤怒的小鸟</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-lives" id="abBirds">🐦 ${birdsLeft}</span>
        <span class="gh-score" id="abPigs">🐷 0/${1}</span>
        <span class="gh-energy" id="abEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="abStage"></div>
      <div class="ab-bar">
        <button class="ab-bomb" id="abBomb">💣 炸弹鸟</button>
        <span class="ab-hint" id="abHint">按住屏幕往后拉，松手发射！</span>
      </div>
      <p class="hint game-tip">像真实愤怒的小鸟一样：按住任意位置、把小鸟往左下后方拉，会看到黄色抛物线，松手就朝反方向飞出。砸中或压到绿猪🐷即可消灭。卡关时点💣炸弹鸟，答对英语换上会爆炸的鸟。</p>
    `, 'ab-screen');
    g = GameKit.canvas('abStage');
    groundY = g.H * 0.86; slingX = g.W * 0.16; slingY = groundY - 84;
    build();
    bind();
    updatePigs();
    GameKit.loop(update);
  }

  function build() {
    pigs = []; blocks = [];
    const bx = g.W * 0.66;            // 城堡中心
    // 底座两块木块
    blocks.push(block(bx - 46, groundY - 38, 38, 38, 'wood'));
    blocks.push(block(bx + 8, groundY - 38, 38, 38, 'wood'));
    // 上方石板
    blocks.push(block(bx - 33, groundY - 76, 66, 16, 'stone'));
    // 顶部冰柱 + 顶层猪
    blocks.push(block(bx - 10, groundY - 110, 20, 34, 'ice'));
    pigs.push(pig(bx + 26, groundY - 20, 20));          // 地面猪
    pigs.push(pig(bx, groundY - 92, 20));               // 顶层猪
    pigs.push(pig(bx + g.W * 0.2, groundY - 150, 18));  // 空中猪
  }
  function block(x, y, w, h, mat) { return { x, y, w, h, mat, vx: 0, vy: 0, settled: true, dead: false }; }
  function pig(x, y, r) { return { x, y, r, alive: true }; }

  function bind() {
    GameKit.bindInput(g.cv, {
      down: p => {
        if (asking || !running || bird) return;
        dragging = true; dragPt = clampPull(p);
        const h = document.getElementById('abHint'); if (h) h.textContent = '拉得越远，飞得越有力！';
      },
      move: p => { if (dragging) dragPt = clampPull(p); },
      up: p => { if (dragging) { if (p) dragPt = clampPull(p); launch(); dragging = false; } }
    });
    // 键盘辅助：方向键调角度，空格发射
    GameKit.bindKeys({
      ArrowUp: () => nudge(0, -8), ArrowDown: () => nudge(0, 8),
      ArrowLeft: () => nudge(-8, 0), ArrowRight: () => nudge(8, 0),
      ' ': () => { if (!bird && !dragging && running && !asking) { dragPt = clampPull({ x: slingX - 40, y: slingY + 30 }); launch(); } }
    });
  }
  function nudge(dx, dy) {
    if (bird || asking || !running) return;
    dragPt = clampPull({ x: (dragPt ? dragPt.x : slingX) + dx, y: (dragPt ? dragPt.y : slingY) + dy });
    dragging = true;
  }
  function clampPull(p) {
    // 真实 AB：小鸟永远在弹弓左侧，只能往「左下方」拉；禁止拉到地面以下或弹弓右侧（否则会向后飞/钻地）
    let dx = p.x - slingX;
    let dy = p.y - slingY;
    if (dx > 0) dx = 0;                 // 只能往左拉
    if (dy < 0) dy = 0;                 // 只能往下拉
    const d = Math.hypot(dx, dy);
    if (d > MAXR) { dx = dx / d * MAXR; dy = dy / d * MAXR; }
    const maxDy = (groundY - 18) - slingY; // 拉拽点不得低于地面
    if (dy > maxDy) dy = maxDy;
    return { x: slingX + dx, y: slingY + dy };
  }
  function launch() {
    if (!dragPt) return;
    // 发射点固定在弹弓，速度方向 = 弹弓指向「反拉拽方向」（永远朝右上）
    let vx = (slingX - dragPt.x) * POWER;
    let vy = (slingY - dragPt.y) * POWER;
    const sp = Math.hypot(vx, vy);
    if (sp < MIN_SPEED) { vx = MIN_SPEED; vy = -MIN_SPEED * 0.7; } // 轻拉也保证朝右上飞出，不会「不动」
    bird = { x: slingX, y: slingY, vx, vy, r: 18, bomb: bombNext, alive: true, rest: 0 };
    bombNext = false;
    birdsLeft--; document.getElementById('abBirds').textContent = '🐦 ' + Math.max(0, birdsLeft);
    Audio2.pop();
    const h = document.getElementById('abHint'); if (h) h.textContent = '发射！';
  }

  function update(dt) {
    if (!running || paused || asking) return;
    const G = 1000;
    if (bird && bird.alive) {
      bird.vy += G * dt;
      bird.x += bird.vx * dt; bird.y += bird.vy * dt;
      if (bird.y + bird.r > groundY) { bird.y = groundY - bird.r; bird.vy *= -0.4; bird.vx *= 0.6; if (Math.abs(bird.vy) < 40) bird.vy = 0; }
      if (bird.x < bird.r) { bird.x = bird.r; bird.vx *= -0.5; }
      if (bird.x > g.W - bird.r) { bird.x = g.W - bird.r; bird.vx *= -0.5; }
      // 方块碰撞
      blocks.forEach(b => {
        if (b.dead) return;
        const cx = GameKit.clamp(bird.x, b.x, b.x + b.w), cy = GameKit.clamp(bird.y, b.y, b.y + b.h);
        const ddx = bird.x - cx, ddy = bird.y - cy, d2 = ddx * ddx + ddy * ddy;
        if (d2 < bird.r * bird.r) {
          const nx = ddx / (Math.hypot(ddx, ddy) || 1), ny = ddy / (Math.hypot(ddx, ddy) || 1);
          const sp = Math.hypot(bird.vx, bird.vy);
          bird.vx = bird.vx * 0.4 - nx * sp * 0.45; bird.vy = bird.vy * 0.4 - ny * sp * 0.45;
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
      if (bird.x > g.W + 60 || bird.x < -60) bird.alive = false;
      if (Math.abs(bird.vx) < 16 && Math.abs(bird.vy) < 28 && bird.y + bird.r >= groundY - 2) { bird.rest += dt; if (bird.rest > 0.6) bird.alive = false; }
    } else if (bird && !bird.alive) {
      bird = null;
      if (pigs.some(p => p.alive)) {
        if (birdsLeft <= 0) { running = false; GameKit.fail(unit, { head: '🐷 绿猪还在！', text: '小鸟用完啦，瞄准猪正上方的结构或空中猪再发射，再试一次！', replay: `AngryBirds.play(UNITS.find(u=>u.id===${unit.id}))` }); return; }
      }
    }
    // 方块动态
    blocks.forEach(b => {
      if (b.dead || b.settled) return;
      b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.98;
      if (b.y + b.h > groundY) { b.y = groundY - b.h; b.vy = 0; b.vx *= 0.7; if (Math.abs(b.vx) < 6) b.settled = true; }
      pigs.forEach(pg => { if (pg.alive && Math.abs((b.x + b.w / 2) - pg.x) < 28 && Math.abs((b.y + b.h) - pg.y) < 30 && Math.hypot(b.vx, b.vy) > 40) { pg.alive = false; Audio2.good(); updatePigs(); } });
      blocks.forEach(o => { if (o !== b && !o.dead && Math.abs(b.x - o.x) < 44 && Math.abs(b.y - o.y) < 44) { o.vx += b.vx * 0.3; o.vy += b.vy * 0.3; o.settled = false; } });
    });
    if (pigs.length && !pigs.some(p => p.alive)) { win(); return; }
    render();
  }

  function explode(x, y) {
    Audio2.bad();
    blocks.forEach(b => { if (Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < 80) b.dead = true; });
    pigs.forEach(pg => { if (pg.alive && Math.hypot(pg.x - x, pg.y - y) < 80) pg.alive = false; });
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
      const h = document.getElementById('abHint'); if (h) h.textContent = '下一发是炸弹鸟，命中即爆！';
    });
  }

  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#bfe9ff'); sky.addColorStop(1, '#e8f7ff');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // 草地
    ctx.fillStyle = '#8fd06a'; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = '#7abc55'; ctx.fillRect(0, groundY, W, 8);
    // 弹弓（双叉 + 皮筋）
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(slingX, slingY); ctx.lineTo(slingX, groundY); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(slingX, slingY); ctx.lineTo(slingX - 9, slingY - 16); ctx.moveTo(slingX, slingY); ctx.lineTo(slingX + 9, slingY - 16); ctx.stroke();
    // 方块
    blocks.forEach(b => {
      if (b.dead) return;
      const x = b.x, y = b.y, w = b.w, h = b.h;
      if (b.mat === 'wood') {
        ctx.fillStyle = '#c8924a'; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(120,80,30,0.6)'; ctx.lineWidth = 1;
        for (let yy = y + 5; yy < y + h; yy += 7) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x + 3, y + 3, w - 6, 3);
      } else if (b.mat === 'stone') {
        ctx.fillStyle = '#9aa0a6'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#aeb4ba'; ctx.fillRect(x + 2, y + 2, w - 4, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 2, y + h - 5, w - 4, 3);
      } else {
        ctx.fillStyle = 'rgba(150,216,255,0.9)'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillRect(x + 3, y + 3, w - 6, 4);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.32)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    });
    // 猪
    pigs.forEach(pg => { if (pg.alive) Sprites.pig(ctx, pg.x, pg.y, 22); });
    // 瞄准轨迹（从弹弓出发，模拟真实飞行弧线）
    if (dragging && dragPt) {
      let dx = slingX - dragPt.x, dy = slingY - dragPt.y;
      let px = slingX, py = slingY, vx = dx * POWER, vy = dy * POWER;
      ctx.fillStyle = 'rgba(255,170,30,0.85)';
      for (let i = 0; i < 40; i++) { vy += G_STEP; px += vx * 0.028; py += vy * 0.028; if (i % 2 === 0) { ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill(); } if (py > groundY) break; }
      // 拉拽指示（弹弓连到被拉后的小鸟）
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(slingX, slingY); ctx.lineTo(dragPt.x, dragPt.y); ctx.stroke(); ctx.setLineDash([]);
    }
    // 小鸟（飞行中 / 待发 / 拖拽中）
    let bx, by;
    if (bird && bird.alive) { bx = bird.x; by = bird.y; }
    else if (dragging && dragPt) { bx = dragPt.x; by = dragPt.y; }
    else { bx = slingX; by = slingY; }
    if (bird && bird.alive) Sprites.bird(ctx, bx, by, 18, bird.bomb);
    else Sprites.bird(ctx, bx, by, 18, bombNext);
    // 皮筋连到鸟
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(slingX - 9, slingY - 16); ctx.lineTo(bx, by); ctx.lineTo(slingX + 9, slingY - 16); ctx.stroke();
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 绿猪全灭！', text: '你用弹弓把猪城堡砸塌了，干得漂亮！', replay: `AngryBirds.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  function afterPlay() { const b = document.getElementById('abBomb'); if (b) b.onclick = () => bomb(); }
  const _play = play;
  function playWrap(u) { _play(u); setTimeout(afterPlay, 0); }
  return { play: playWrap, quit };
})();

window.AngryBirds = AngryBirds;
