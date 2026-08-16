/* ============================================================
   EduQuest · mario.js  —  超级马里奥（横版平台跳跃）
   自动奔跑 · 点击/空格跳跃 · 踩怪 · 顶?砖 · 吃金币 · 跨坑。
   英语题在旗点作为关卡门（答错卡关必须答对）。3 条命。
   ============================================================ */
'use strict';

const Mario = (() => {
  let unit = null, g = null, paused = false, running = false;
  let player, goombas, coins, blocks, pits, cps, lv;
  let score = 0, lives = 3, camera = 0, goalX = 0, lastCp = 0;
  let asking = false;

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false;
    score = 0; lives = 3; camera = 0; lastCp = 0;
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Mario.quit()">← 返回</button>
        <div class="topbar-title">🍄 ${unit.icon} ${unit.name} · 马里奥闯关</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-lives" id="marioLives">❤️ ${lives}</span>
        <span class="gh-score" id="marioScore">🪙 ${score}</span>
        <span class="gh-energy" id="marioEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="marioStage"></div>
      <p class="hint game-tip">自动向右跑！点屏幕或按空格跳，跨过深坑、踩扁👾、顶❓砖吃金币。到🚩旗点要答对英语才能继续冲终点！</p>
    `, 'mario-screen');
    g = GameKit.canvas('marioStage');
    buildLevel();
    player = { wx: 60, y: g.H * 0.78 - 42, vy: 0, w: 34, h: 42, onGround: false };
    bind();
    GameKit.loop(update);
  }

  function buildLevel() {
    const LEN = 3400;
    goalX = LEN - 120;
    pits = []; coins = []; blocks = []; goombas = []; cps = [];
    let x = 360;
    while (x < LEN - 300) {
      const w = 90 + Math.random() * 60;
      pits.push({ a: x, b: x + w });
      // ? 砖在坑前/后（高度在跳跃可命中范围内）
      blocks.push({ x: x - 120, y: gH() - 130, used: false });
      blocks.push({ x: x + w + 60, y: gH() - 130, used: false });
      // 金币弧线（跳跃可达）
      for (let i = 0; i < 5; i++) coins.push({ x: x - 40 + i * 26, y: gH() - 120 - Math.sin(i / 4 * Math.PI) * 38, taken: false });
      // 板栗怪
      if (Math.random() < 0.8) goombas.push({ x: x + w + 160, y: gH() - 36, w: 34, h: 34, vx: -50, alive: true });
      x += w + 280 + Math.random() * 160;
    }
    // 旗点检查站
    cps.push({ x: LEN * 0.4, done: false });
    cps.push({ x: LEN * 0.72, done: false });
    // 沿途散落金币（跳跃可达）
    for (let i = 0; i < 14; i++) coins.push({ x: 200 + i * 220, y: gH() - 90 - (i % 3) * 22, taken: false });
    lv = { LEN };
  }
  function gH() { return (g ? g.H : 480) * 0.78; }

  function bind() {
    GameKit.bindInput(g.cv, { down: () => jump() });
    GameKit.bindKeys({ ' ': jump, 'ArrowUp': jump, 'Spacebar': jump });
  }
  function jump() {
    if (!running || paused || asking) return;
    if (player.onGround) { player.vy = -560; player.onGround = false; Audio2.pop(); }
  }

  function update(dt) {
    if (!running || paused || asking) return;
    const G = 1500, SPEED = 175, groundY = gH();
    // 自动前进
    player.wx += SPEED * dt;
    // 重力
    player.vy += G * dt;
    player.y += player.vy * dt;
    // 是否在坑上（决定能否落地）
    const overPit = pits.some(p => player.wx > p.a && player.wx < p.b);
    if (!overPit && player.y + player.h >= groundY) {
      player.y = groundY - player.h; player.vy = 0; player.onGround = true;
    } else {
      player.onGround = false;
      if (player.y + player.h < groundY) player.onGround = false;
    }
    // 掉出屏幕
    if (player.y > g.H + 60) { die(); return; }
    // 顶 ? 砖
    blocks.forEach(b => {
      if (b.used) return;
      if (player.vy < 0 && player.wx + player.w > b.x && player.wx < b.x + 36 &&
          player.y <= b.y + 36 && player.y > b.y - 30) {
        b.used = true; player.vy = 200; Audio2.coin(); score += 50; upScore();
        UI.toast('+50 🪙', 700);
      }
    });
    // 金币
    coins.forEach(c => {
      if (c.taken) return;
      if (Math.abs(player.wx - c.x) < 26 && Math.abs((player.y + player.h / 2) - c.y) < 34) {
        c.taken = true; score += 20; Audio2.coin(); upScore();
      }
    });
    // 板栗怪
    goombas.forEach(o => {
      if (!o.alive) return;
      o.x += o.vx * dt;
      // 转向（遇到坑或边界）
      if (o.x < 40 || o.x > lv.LEN - 40) o.vx *= -1;
      pits.forEach(p => { if (o.x > p.a - 10 && o.x < p.b + 10) o.vx = o.x < (p.a + p.b) / 2 ? Math.abs(o.vx) : -Math.abs(o.vx); });
      const px = player.wx, py = player.y;
      if (px + player.w > o.x && px < o.x + o.w && py + player.h > o.y && py < o.y + o.h) {
        if (player.vy > 0 && (py + player.h) - o.y < 22) { o.alive = false; Audio2.good(); score += 30; player.vy = -380; upScore(); }
        else { die(); }
      }
    });
    // 检查站旗点
    cps.forEach(cp => {
      if (!cp.done && player.wx >= cp.x) { cp.done = true; lastCp = cp.x; gate(cp); }
    });
    // 终点
    if (player.wx >= goalX) { win(); return; }
    camera = player.wx - g.W * 0.28;
    render(groundY);
  }

  function gate(cp) {
    asking = true; paused = true;
    GameKit.quizGate(unit, {
      title: '🚩 旗点关卡！答对用英语冲下一段',
      sub: '答错要重听重答，答对才能继续前进',
      cls: 'mario-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      GameKit.setEnergy(unit.id, 'marioEnergy');
      asking = false; paused = false;
      UI.toast('答对啦，继续冲！🎉', 1200);
    });
  }

  function die() {
    lives--; Audio2.bad();
    document.getElementById('marioLives').textContent = '❤️ ' + Math.max(0, lives);
    if (lives <= 0) { running = false; GameKit.fail(unit, { head: '💥 闯关失败', text: '三条命用完啦，注意跳过深坑、踩扁怪物，再试一次！', replay: `Mario.play(UNITS.find(u=>u.id===${unit.id}))` }); return; }
    player.wx = lastCp || 60; player.y = gH() - player.h; player.vy = 0;
    UI.toast('💔 掉队了，回到检查站！', 1200);
  }
  function upScore() { const e = document.getElementById('marioScore'); if (e) e.textContent = '🪙 ' + score; }

  function render(groundY) {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    // 天空
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#7ec8ff'); grd.addColorStop(1, '#cdeffd');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    // 云
    ctx.font = '28px serif'; ctx.textAlign = 'center';
    for (let i = 0; i < 4; i++) { const cx = ((i * 260 - camera * 0.3) % (W + 200) + W + 200) % (W + 200) - 100; ctx.fillText('☁️', cx, 60 + (i % 2) * 40); }
    // 地面（带坑）
    ctx.fillStyle = '#7a4a1e';
    for (let x = 0; x < lv.LEN; x += 10) {
      const sx = x - camera;
      if (sx < -20 || sx > W + 20) continue;
      const inPit = pits.some(p => x > p.a && x < p.b);
      if (!inPit) ctx.fillRect(sx, groundY, 12, H - groundY);
    }
    ctx.fillStyle = '#3fa34d';
    for (let x = 0; x < lv.LEN; x += 10) {
      const sx = x - camera;
      if (sx < -20 || sx > W + 20) continue;
      const inPit = pits.some(p => x > p.a && x < p.b);
      if (!inPit) ctx.fillRect(sx, groundY, 12, 8);
    }
    // ? 砖
    ctx.font = '30px serif';
    blocks.forEach(b => { const sx = b.x - camera; if (sx > -40 && sx < W + 40) ctx.fillText(b.used ? '🟫' : '❓', sx + 16, b.y + 28); });
    // 金币
    ctx.font = '22px serif';
    coins.forEach(c => { if (c.taken) return; const sx = c.x - camera; if (sx > -30 && sx < W + 30) ctx.fillText('🪙', sx, c.y); });
    // 板栗怪
    ctx.font = '30px serif';
    goombas.forEach(o => { if (!o.alive) return; const sx = o.x - camera; if (sx > -40 && sx < W + 40) ctx.fillText('👾', sx + 16, o.y + 30); });
    // 检查站旗
    cps.forEach(cp => { const sx = cp.x - camera; if (sx > -30 && sx < W + 30) ctx.fillText(cp.done ? '✅' : '🚩', sx, groundY - 40); });
    // 终点旗
    ctx.fillText('🏁', goalX - camera, groundY - 50);
    // 玩家
    ctx.font = '34px serif';
    ctx.fillText('🏃', player.wx - camera, player.y + player.h - 2);
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 到达终点！', text: `你跨过深坑、踩扁怪物、收集了 ${score} 金币，冲到了旗帜！`, replay: `Mario.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  return { play, quit };
})();

window.Mario = Mario;
