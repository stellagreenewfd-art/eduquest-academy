/* ============================================================
   EduQuest · pvz.js  —  植物大战僵尸（真实塔防 lite）
   5×9 草坪 · 阳光经济 · 种向日葵/豌豆射手/坚果墙 · 僵尸分路进攻
   豌豆射手自动射击。英语题作为「🌟魔法豌豆」必答关卡门（答错卡关）。
   ============================================================ */
'use strict';

const PVZ = (() => {
  const ROWS = 5, COLS = 9;
  let unit = null, timer = null, paused = false, running = false;
  let sun = 50, lives = 3, total = 0, spawned = 0, killed = 0;
  let plants = [], zombies = [], peas = [], suns = [];
  let selected = 'sunflower', nextSpawn = 0, dead = false;
  const PLANTS = {
    sunflower:  { cost: 50, hp: 4, icon: '🌻', name: '向日葵' },
    peashooter: { cost: 100, hp: 4, icon: '🌱', name: '豌豆射手' },
    wallnut:    { cost: 50, hp: 12, icon: '🥥', name: '坚果墙' }
  };

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; dead = false;
    sun = 50; lives = 3; spawned = 0; killed = 0; selected = 'sunflower';
    total = Math.min(unit.vocab.length, 8);
    plants = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    zombies = []; peas = []; suns = [];
    nextSpawn = 4;

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
      <p class="hint pvz-tip">☀️点天上掉落的阳光攒能量 → 种🌻产阳光、🌱打僵尸、🥥挡路。僵尸到家会扣❤️。卡关时用🌟魔法豌豆，答对英语直接消灭最前的僵尸！</p>
    `, 'pvz-screen');

    const lawn = document.getElementById('pvzLawn');
    lawn.style.setProperty('--rows', ROWS); lawn.style.setProperty('--cols', COLS);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'pvz-cell'; cell.dataset.r = r; cell.dataset.c = c;
      lawn.appendChild(cell);
    }
    lawn.onclick = (e) => {
      const cell = e.target.closest('.pvz-cell'); if (!cell || paused || !running) return;
      const r = +cell.dataset.r, c = +cell.dataset.c;
      placePlant(r, c);
    };

    document.querySelectorAll('.pvz-seed').forEach(b => b.onclick = () => {
      Audio2.click(); selected = b.dataset.p;
      document.querySelectorAll('.pvz-seed').forEach(x => x.classList.toggle('sel', x === b));
    });
    document.getElementById('pvzMagic').onclick = () => { if (running && !paused) magicPea(); };

    let last = performance.now();
    timer = setInterval(() => {
      if (!running || paused || dead) return;
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      tick(dt, now);
    }, 50);
    GameKit.defer(() => clearInterval(timer));
  }

  function placePlant(r, c) {
    if (plants[r][c]) { UI.toast('这里已经有植物啦'); return; }
    const def = PLANTS[selected];
    if (sun < def.cost) { UI.toast('☀️阳光不够，先种🌻或捡阳光'); Audio2.bad(); return; }
    sun -= def.cost; updateSun();
    const el = document.createElement('div');
    el.className = 'pvz-plant'; el.textContent = def.icon;
    setCell(el, r, c);
    document.getElementById('pvzLawn').appendChild(el);
    plants[r][c] = { type: selected, hp: def.hp, el, cd: 0 };
    Audio2.place();
  }

  function setCell(el, r, c) {
    el.style.left = (c / COLS * 100) + '%';
    el.style.top = (r / ROWS * 100) + '%';
  }

  function tick(dt, now) {
    // 阳光掉落
    if (Math.random() < dt * 0.18) dropSun();
    // 向日葵产阳光
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = plants[r][c]; if (!p) continue;
      if (p.type === 'sunflower') { p.cd -= dt; if (p.cd <= 0) { p.cd = 7; gainSun(25, r, c); } }
      if (p.type === 'peashooter') { p.cd -= dt; if (p.cd <= 0) {
        const z = frontZombie(r, c); if (z) { p.cd = 1.4; shootPea(r, c); }
      } }
    }
    // 僵尸生成
    if (spawned < total && now / 1000 >= nextSpawn) {
      spawnZombie(); nextSpawn += 5 + Math.random() * 2;
    }
    // 僵尸移动 / 吃植物
    zombies.forEach(z => {
      if (z.dead) return;
      const cc = Math.floor(z.col);
      const plant = cc >= 0 && cc < COLS ? plants[z.row][cc] : null;
      if (plant && z.col - cc < 0.55) {
        z.eating = true; plant.hp -= dt * 0.8;
        if (plant.hp <= 0) { plant.el.remove(); plants[z.row][cc] = null; }
      } else { z.eating = false; z.col -= dt * 0.22; }
      if (z.col <= 0.15) { loseLife(z); return; }
      positionZ(z);
    });
    // 豌豆移动
    for (let i = peas.length - 1; i >= 0; i--) {
      const p = peas[i]; p.col += dt * 4.5;
      const hit = zombies.find(z => !z.dead && z.row === p.row && z.col >= p.col - 0.3 && z.col <= p.col + 0.6);
      if (hit) { hit.hp -= 1; Audio2.pop(); p.el.remove(); peas.splice(i, 1); if (hit.hp <= 0) killZ(hit); continue; }
      if (p.col > COLS) { p.el.remove(); peas.splice(i, 1); }
      else positionPea(p);
    }
    // 清理死亡僵尸
    zombies = zombies.filter(z => !z.dead);
    if (spawned >= total && zombies.length === 0 && !dead) win();
  }

  function frontZombie(row, col) {
    let best = null;
    zombies.forEach(z => { if (!z.dead && z.row === row && z.col > col) { if (!best || z.col < best.col) best = z; } });
    return best;
  }
  function shootPea(row, col) {
    const el = document.createElement('div'); el.className = 'pvz-pea'; el.textContent = '🟢';
    document.getElementById('pvzLawn').appendChild(el);
    const p = { row, col: col + 0.6, el };
    positionPea(p); peas.push(p);
  }
  function positionPea(p) {
    p.el.style.left = (p.col / COLS * 100) + '%';
    p.el.style.top = (p.row / ROWS * 100 + ROWS > 0 ? (p.row + 0.35) / ROWS * 100 : 0) + '%';
  }
  function spawnZombie() {
    const row = Math.floor(Math.random() * ROWS);
    const el = document.createElement('div'); el.className = 'pvz-zombie';
    el.textContent = ['🧟', '🧟‍♂️', '🧟‍♀️', '🦴', '👻'][spawned % 5];
    document.getElementById('pvzLawn').appendChild(el);
    const z = { id: spawned, row, col: COLS - 0.5, hp: 3, el, dead: false, eating: false };
    positionZ(z); zombies.push(z); spawned++;
    Audio2.hit();
  }
  function positionZ(z) {
    z.el.style.left = (z.col / COLS * 100) + '%';
    z.el.style.top = (z.row / ROWS * 100 + 8) + '%';
    z.el.style.filter = z.eating ? 'brightness(1.3)' : '';
  }
  function killZ(z) {
    z.dead = true; z.el.classList.add('pvz-die');
    setTimeout(() => z.el.remove(), 500);
    killed++; Audio2.good();
    document.getElementById('pvzProg').textContent = `🌱 ${killed}/${total}`;
  }
  function loseLife(z) {
    z.dead = true; z.el.remove();
    lives--; Audio2.bad();
    document.getElementById('pvzLives').textContent = lives > 0 ? '🏠'.repeat(lives) : '💥';
    if (lives <= 0 && !dead) { dead = true; GameKit.fail(unit, { head: '🧟 房子被攻破了', text: `僵尸闯进了家门！用🌻多攒阳光、早点种🌱防守，再试一次吧。`, replay: `PVZ.play(UNITS.find(u=>u.id===${unit.id}))` }); }
  }

  function dropSun() {
    if (suns.length > 4) return;
    const el = document.createElement('div'); el.className = 'pvz-sunfall'; el.textContent = '☀️';
    const x = 8 + Math.random() * 84;
    el.style.left = x + '%'; el.style.top = '4%';
    document.getElementById('pvzLawn').appendChild(el);
    const s = { el, x, y: 4, vy: 6 };
    el.onclick = () => { gainSun(25); el.remove(); suns = suns.filter(o => o !== s); };
    suns.push(s);
    const iv = setInterval(() => { if (s.dead) { clearInterval(iv); return; } s.y += s.vy * 0.05; s.el.style.top = Math.min(88, s.y) + '%'; }, 50);
    GameKit.defer(() => { s.dead = true; clearInterval(iv); });
  }
  function gainSun(n, r, c) {
    sun += n; updateSun(); Audio2.coin();
    if (r != null) { /* 向日葵产出，可在植物处冒个+ */ }
  }
  function updateSun() { const e = document.getElementById('pvzSun'); if (e) e.textContent = '☀️ ' + sun; }

  function magicPea() {
    const front = zombies.filter(z => !z.dead).sort((a, b) => b.col - a.col)[0];
    if (!front) { UI.toast('现在没有僵尸，魔法豌豆先留着～'); return; }
    paused = true;
    GameKit.quizGate(unit, {
      title: '🌟 魔法豌豆！用英语消灭最前的僵尸',
      sub: '答对发射超级豌豆，答错僵尸会继续逼近哦',
      cls: 'pvz-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      killZ(front); sun += 25; updateSun();
      GameKit.setEnergy(unit.id, 'pvzEnergy');
      paused = false;
    });
  }

  function quit() {
    running = false; dead = true; if (timer) clearInterval(timer);
    GameKit.cleanup();
    Main.biome(unit.id);
  }
  function win() {
    dead = true; running = false; if (timer) clearInterval(timer);
    GameKit.win(unit, { head: '🏆 守卫成功！', text: `你用植物和英语击退了全部 ${total} 只僵尸，守住了房子！`, replay: `PVZ.play(UNITS.find(u=>u.id===${unit.id}))` });
  }

  return { play, quit };
})();

window.PVZ = PVZ;
