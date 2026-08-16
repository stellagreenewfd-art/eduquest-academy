/* ============================================================
   EduQuest · pvz.js  —  植物保卫战（原创塔防 lite，canvas 绘制）
   5×9 草坪 · 阳光经济 · 8 种植物（向日葵/豌豆/双发/寒冰/坚果/樱桃炸弹/
   土豆地雷/大嘴花）· 僵尸分路缓慢进攻 · 豌豆自动射击。
   英语题作为「🌟魔法豌豆」必答关卡门（答错卡关）。精灵全部原创绘制。
   ============================================================ */
'use strict';

const PVZ = (() => {
  const ROWS = 5, COLS = 9;
  let unit = null, g = null, paused = false, running = false;
  let sun = 75, lives = 3, total = 0, spawned = 0, killed = 0;
  let plants = [], zombies = [], peas = [], suns = [];
  let selected = 'sunflower', nextSpawn = 0, dead = false;
  const PLANTS = {
    sunflower:  { cost: 50,  hp: 4,  kind: 'sun',     name: '向日葵',   icon: '🌻' },
    peashooter: { cost: 100, hp: 4,  kind: 'shoot',   name: '豌豆射手', icon: '🌱' },
    repeater:   { cost: 175, hp: 4,  kind: 'repeater', name: '双发豌豆', icon: '🌿' },
    icepea:     { cost: 175, hp: 4,  kind: 'ice',     name: '寒冰射手', icon: '❄️' },
    wallnut:    { cost: 50,  hp: 14, kind: 'block',   name: '坚果墙',   icon: '🥥' },
    cherry:     { cost: 150, hp: 1,  kind: 'bomb',    name: '樱桃炸弹', icon: '🍒' },
    potatomine: { cost: 25,  hp: 1,  kind: 'mine',    name: '土豆地雷', icon: '🥔' },
    chomper:    { cost: 150, hp: 8,  kind: 'chomp',   name: '大嘴花',   icon: '🌺' }
  };

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; dead = false;
    sun = 75; lives = 3; spawned = 0; killed = 0; selected = 'sunflower';
    total = Math.min(unit.vocab.length, 8);
    plants = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    zombies = []; peas = []; suns = [];
    nextSpawn = 5;

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="PVZ.quit()">← 返回</button>
        <div class="topbar-title">🧟 ${unit.icon} ${unit.name} · 植物保卫战</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="pvz-hud">
        <span class="pvz-sun" id="pvzSun">☀️ ${sun}</span>
        <span class="pvz-lives" id="pvzLives">${'🏠'.repeat(lives)}</span>
        <span class="pvz-prog" id="pvzProg">🌱 ${killed}/${total}</span>
        <span class="pvz-energy" id="pvzEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="pvz-palette" id="pvzPalette">
        ${Object.keys(PLANTS).map(k => `<button class="pvz-seed ${k === selected ? 'sel' : ''}" data-p="${k}">${PLANTS[k].icon}<small>${PLANTS[k].cost}</small></button>`).join('')}
        <button class="pvz-magic" id="pvzMagic">🌟 魔法豌豆</button>
      </div>
      <div class="pvz-lawn" id="pvzLawn"></div>
      <p class="hint pvz-tip">☀️点天上掉落的阳光攒能量 → 种🌻产阳光、🌱打僵尸、🥥挡路。僵尸慢慢走来，到家会扣❤️。卡关时用🌟魔法豌豆，答对英语直接消灭最前的僵尸！</p>
    `, 'pvz-screen');

    g = GameKit.canvas('pvzLawn');
    GameKit.bindInput(g.cv, { down: onDown });
    document.querySelectorAll('.pvz-seed').forEach(b => b.onclick = () => {
      Audio2.click(); selected = b.dataset.p;
      document.querySelectorAll('.pvz-seed').forEach(x => x.classList.toggle('sel', x === b));
    });
    document.getElementById('pvzMagic').onclick = () => { if (running && !paused) magicPea(); };

    GameKit.loop(update);
  }

  function cellW() { return g.W / COLS; }
  function cellH() { return g.H / ROWS; }
  function cx(c) { return (c + 0.5) * cellW(); }
  function cy(r) { return (r + 1) * cellH(); }

  function onDown(p) {
    if (paused || !running || dead) return;
    // 先判定是否点到阳光
    for (const s of suns) {
      if (s.dead) continue;
      if (Math.hypot(p.x - s.x, p.y - s.y) < 22) { gainSun(25); s.dead = true; Audio2.coin(); return; }
    }
    const c = Math.floor(p.x / cellW()), r = Math.floor(p.y / cellH());
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    placePlant(r, c);
  }

  function placePlant(r, c) {
    if (plants[r][c]) { UI.toast('这里已经有植物啦'); return; }
    const def = PLANTS[selected];
    if (sun < def.cost) { UI.toast('☀️阳光不够，先种🌻或捡阳光'); Audio2.bad(); return; }
    sun -= def.cost; updateSun();
    plants[r][c] = { type: selected, kind: def.kind, hp: def.hp, cd: def.kind === 'sun' ? 3 : 0, chompCd: 0 };
    Audio2.place();
  }

  function update(dt) {
    if (!running || paused || dead) return;
    if (Math.random() < dt * 0.22) dropSun();
    // 植物行为
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = plants[r][c]; if (!p) continue;
      if (p.kind === 'sun') { p.cd -= dt; if (p.cd <= 0) { p.cd = 7; gainSun(25); } }
      else if (p.kind === 'shoot' || p.kind === 'repeater' || p.kind === 'ice') {
        p.cd -= dt;
        if (p.cd <= 0 && frontZombie(r, c)) {
          p.cd = p.kind === 'repeater' ? 1.4 : 1.7;
          spawnPea(r, c + 0.62, p.kind === 'ice' ? 'ice' : 'normal');
          if (p.kind === 'repeater') spawnPea(r, c + 0.42, 'normal');
        }
      }
      else if (p.kind === 'bomb') {
        const near = zombies.find(z => !z.dead && z.row === r && Math.abs(z.col - c) <= 1.2 && z.col > c - 0.6);
        if (near) { explode(r, c, 1.6); }
      }
      else if (p.kind === 'mine') {
        const on = zombies.find(z => !z.dead && z.row === r && Math.abs(z.col - c) < 0.45);
        if (on) { explode(r, c, 0.6); }
      }
      else if (p.kind === 'chomp') {
        if (p.chompCd > 0) p.chompCd -= dt;
        else {
          const z = zombies.find(z => !z.dead && z.row === r && z.col > c + 0.3 && z.col < c + 1.9);
          if (z) { killZ(z); p.chompCd = 8; }
        }
      }
    }
    // 僵尸生成（更慢更稀疏）
    if (spawned < total && !dead) {
      nextSpawn -= dt;
      if (nextSpawn <= 0) { spawnZombie(); nextSpawn = 9 + Math.random() * 4; }
    }
    // 僵尸移动 / 吃植物
    zombies.forEach(z => {
      if (z.dead) return;
      if (z.slow > 0) z.slow -= dt;
      const cc = Math.floor(z.col);
      const p = cc >= 0 && cc < COLS ? plants[z.row][cc] : null;
      if (p && (p.kind === 'block' || p.kind === 'sun' || p.kind === 'shoot' || p.kind === 'ice' || p.kind === 'repeater') && z.col - cc < 0.55) {
        z.eating = true; p.hp -= dt * 0.8;
        if (p.hp <= 0) { plants[z.row][cc] = null; }
      } else { z.eating = false; z.col -= dt * (z.slow > 0 ? 0.06 : 0.12); }
      if (z.col <= 0.15) { loseLife(z); return; }
    });
    // 豌豆移动 / 命中
    for (let i = peas.length - 1; i >= 0; i--) {
      const pe = peas[i]; pe.col += dt * 4.5;
      const hit = zombies.find(z => !z.dead && z.row === pe.row && z.col >= pe.col - 0.4 && z.col <= pe.col + 0.6);
      if (hit) {
        hit.hp -= pe.type === 'ice' ? 2 : 1;
        if (pe.type === 'ice') hit.slow = 4;
        Audio2.pop(); peas.splice(i, 1);
        if (hit.hp <= 0) killZ(hit);
        continue;
      }
      if (pe.col > COLS) peas.splice(i, 1);
    }
    zombies = zombies.filter(z => !z.dead);
    suns = suns.filter(s => !s.dead);
    if (spawned >= total && zombies.length === 0 && !dead) win();
    render();
  }

  function frontZombie(row, col) {
    let best = null;
    zombies.forEach(z => { if (!z.dead && z.row === row && z.col > col) { if (!best || z.col < best.col) best = z; } });
    return best;
  }
  function spawnPea(row, col, type) { peas.push({ row, col, type }); }
  function spawnZombie() {
    const row = Math.floor(Math.random() * ROWS);
    const z = { row, col: COLS - 0.4, hp: 4, slow: 0, dead: false, eating: false };
    zombies.push(z); spawned++;
    Audio2.hit();
  }
  function explode(r, c, rad) {
    zombies.forEach(z => { if (!z.dead && z.row === r && Math.abs(z.col - c) <= rad + 0.4) killZ(z); });
    plants[r][c] = null;
    Audio2.bad();
  }
  function killZ(z) {
    if (z.dead) return;
    z.dead = true; killed++; Audio2.good();
    document.getElementById('pvzProg').textContent = `🌱 ${killed}/${total}`;
  }
  function loseLife(z) {
    z.dead = true; lives--; Audio2.bad();
    document.getElementById('pvzLives').textContent = lives > 0 ? '🏠'.repeat(lives) : '💥';
    if (lives <= 0 && !dead) { dead = true; GameKit.fail(unit, { head: '🧟 房子被攻破了', text: `僵尸闯进了家门！多用🌻攒阳光、早点种🌱防守，再试一次吧。`, replay: `PVZ.play(UNITS.find(u=>u.id===${unit.id}))` }); }
  }
  function dropSun() {
    if (suns.length > 4) return;
    const s = { x: (0.1 + Math.random() * 0.8) * g.W, y: -20, vy: g.H * 0.05, dead: false };
    suns.push(s);
  }
  function gainSun(n) { sun += n; updateSun(); }
  function updateSun() { const e = document.getElementById('pvzSun'); if (e) e.textContent = '☀️ ' + sun; }

  function magicPea() {
    const front = zombies.filter(z => !z.dead).sort((a, b) => a.col - b.col)[0];
    if (!front) { UI.toast('现在没有僵尸，魔法豌豆先留着～'); return; }
    paused = true;
    GameKit.quizGate(unit, {
      title: '🌟 魔法豌豆！用英语消灭最前的僵尸',
      sub: '答对发射超级豌豆，答错僵尸会继续逼近哦',
      cls: 'pvz-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      killZ(front); gainSun(25); GameKit.setEnergy(unit.id, 'pvzEnergy');
      paused = false;
    });
  }

  /* ----------------------- 渲染（canvas 精灵） ----------------------- */
  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    // 草坪棋盘
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#9bce5a' : '#8cc24f';
      ctx.fillRect(c * cellW(), r * cellH(), cellW() + 1, cellH() + 1);
    }
    // 左侧房子（守护目标）
    ctx.fillStyle = '#caa46a'; ctx.fillRect(-2, H * 0.18, W * 0.07, H * 0.82);
    ctx.fillStyle = '#b5651d'; ctx.beginPath(); ctx.moveTo(-4, H * 0.18); ctx.lineTo(W * 0.035, H * 0.06); ctx.lineTo(W * 0.075, H * 0.18); ctx.fill();
    ctx.fillStyle = '#7a4a1e'; ctx.fillRect(W * 0.02, H * 0.5, W * 0.03, H * 0.3);
    // 植物
    const ph = cellH() * 0.98;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = plants[r][c]; if (!p) continue;
      Sprites.plant(ctx, p.type, cx(c), cy(r), ph);
    }
    // 豌豆
    peas.forEach(pe => {
      const x = pe.col / COLS * W, y = cy(pe.row) - cellH() * 0.55;
      ctx.fillStyle = pe.type === 'ice' ? '#7fd0e8' : '#5bbf3a';
      ctx.beginPath(); ctx.arc(x, y, cellH() * 0.12, 0, 7); ctx.fill();
      ctx.fillStyle = pe.type === 'ice' ? '#cdeffb' : '#9fe07a';
      ctx.beginPath(); ctx.arc(x - 1, y - 1, cellH() * 0.05, 0, 7); ctx.fill();
    });
    // 僵尸（朝左）
    const zh = cellH() * 0.98;
    zombies.forEach(z => {
      Sprites.zombie(ctx, z.col / COLS * W, cy(z.row), zh);
      if (z.slow > 0) { ctx.fillStyle = 'rgba(120,200,255,0.4)'; ctx.beginPath(); ctx.arc(z.col / COLS * W, cy(z.row) - zh * 0.55, zh * 0.4, 0, 7); ctx.fill(); }
    });
    // 阳光（带光晕）
    suns.forEach(s => {
      s.y += s.vy * 0.05; if (s.y > H * 0.82) s.y = H * 0.82;
      ctx.save();
      ctx.fillStyle = 'rgba(255,220,80,0.35)';
      ctx.beginPath(); ctx.arc(s.x, s.y, 20, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, 7); ctx.fill();
      ctx.strokeStyle = '#ffb627'; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(s.x + Math.cos(a) * 13, s.y + Math.sin(a) * 13); ctx.lineTo(s.x + Math.cos(a) * 18, s.y + Math.sin(a) * 18); ctx.stroke(); }
      ctx.restore();
    });
  }

  function quit() { running = false; dead = true; GameKit.cleanup(); Main.biome(unit.id); }
  function win() {
    dead = true; running = false;
    GameKit.win(unit, { head: '🏆 守卫成功！', text: `你用植物和英语击退了全部 ${total} 只僵尸，守住了房子！`, replay: `PVZ.play(UNITS.find(u=>u.id===${unit.id}))` });
  }

  return { play, quit };
})();

window.PVZ = PVZ;
