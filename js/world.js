/* ============================================================
   EduQuest · world.js
   2D 方块世界：跑跳 / 挖矿(单词矿石) / 自由建造 / 昼夜 / 怪物战斗
   英语长在玩法里：矿石=单词，打怪=说英语
   进度走 Save.book（按教材隔离）
   ============================================================ */
'use strict';

const World = (() => {
  const TS = 30;                 // 方块像素
  const WW = 120, WH = 44;       // 世界尺寸（格）
  const B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, WOOD: 4, LEAF: 5, BEDROCK: 6, COAL: 10, IRON: 11, GOLD: 12, DIAMOND: 13 };
  const SOLID = new Set([1, 2, 3, 4, 5, 6, 10, 11, 12, 13]);
  const PLACEABLE = [B.GRASS, B.DIRT, B.STONE, B.WOOD, B.LEAF];
  const BLOCK_ICON = { 1: '🟩', 2: '🟫', 3: '🪨', 4: '🪵', 5: '🌿' };
  const ORE_TIER = { 10: 'common', 11: 'core', 12: 'challenge', 13: 'diamond' };
  const TIER_ORE_ID = { common: 10, core: 11, challenge: 12, diamond: 13 };
  const TIER_REQ = { 10: 0, 11: 0, 12: 1, 13: 2 };

  let active = false, raf = null;
  let canvas, cx, camX = 0, camY = 0, shake = 0;
  let unit = null, tiles = null, surface = null, oreWord = {};
  let player, mobs = [], parts = [];
  let inv = {}, sel = 0;
  let hotbar = [];
  let dayT = 0.2;
  let spawnT = 0, regenT = 0, energyToastShown = false;
  const keys = {};
  const spawn = { x: 0, y: 0 };

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function ensureFields() {
    const b = Save.book;
    if (!b.edits) b.edits = {};
    if (!b.seeds) b.seeds = {};
    if (!b.inv) b.inv = {};
  }

  /* ---------- 世界生成 ---------- */
  function gen() {
    const seed = (Save.book.seeds[unit.id] || 1) * 977 + unit.id * 131;
    const rand = mulberry32(seed);
    tiles = new Uint8Array(WW * WH);
    surface = new Int16Array(WW);
    oreWord = {};
    let h = 15;
    for (let x = 0; x < WW; x++) {
      if (rand() < 0.35) h += rand() < 0.5 ? 1 : -1;
      h = Math.max(11, Math.min(19, h));
      surface[x] = h;
      for (let y = 0; y < WH; y++) {
        let b = B.AIR;
        if (y === WH - 1) b = B.BEDROCK;
        else if (y === h) b = B.GRASS;
        else if (y > h && y <= h + 3) b = B.DIRT;
        else if (y > h + 3) b = B.STONE;
        tiles[y * WW + x] = b;
      }
    }
    for (let x = 4; x < WW - 4; x++) {
      if (x >= 3 && x <= 10) continue;
      if (rand() < 0.14) {
        const y = surface[x], th = 3 + Math.floor(rand() * 2);
        for (let i = 1; i <= th; i++) tiles[(y - i) * WW + x] = B.WOOD;
        for (let dy = 0; dy < 3; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (dy === 2 && Math.abs(dx) === 1 && rand() < 0.5) continue;
          const lx = x + dx, ly = y - th - dy;
          if (lx >= 0 && lx < WW && ly >= 0 && tiles[ly * WW + lx] === B.AIR) tiles[ly * WW + lx] = B.LEAF;
        }
      }
    }
    unit.vocab.forEach((v, vi) => {
      const oreId = TIER_ORE_ID[v.tier] || 10;
      const depthMin = { 10: 4, 11: 9, 12: 15, 13: 21 }[oreId];
      const depthMax = { 10: 9, 11: 15, 12: 21, 13: 27 }[oreId];
      for (let tries = 0; tries < 60; tries++) {
        const x = 2 + Math.floor(rand() * (WW - 4));
        const y = surface[x] + depthMin + Math.floor(rand() * (depthMax - depthMin + 1));
        if (y < WH - 1 && tiles[y * WW + x] === B.STONE) {
          tiles[y * WW + x] = oreId;
          oreWord[x + ',' + y] = vi;
          break;
        }
      }
    });
    const edits = Save.book.edits[unit.id] || {};
    Object.entries(edits).forEach(([k, b]) => {
      const [x, y] = k.split(',').map(Number);
      if (x >= 0 && x < WW && y >= 0 && y < WH) tiles[y * WW + x] = b;
    });
    spawn.x = 6 * TS;
    spawn.y = (surface[6] - 2) * TS;
  }

  const tileAt = (x, y) => (x < 0 || x >= WW || y < 0 || y >= WH) ? B.BEDROCK : tiles[y * WW + x];
  const solidAt = (x, y) => SOLID.has(tileAt(x, y));
  function setTile(x, y, b) {
    tiles[y * WW + x] = b;
    if (!Save.book.edits[unit.id]) Save.book.edits[unit.id] = {};
    Save.book.edits[unit.id][x + ',' + y] = b;
    Save.save();
  }

  /* ---------- 进入 / 退出 ---------- */
  function enter(unitId) {
    ensureFields();
    unit = UNITS.find(u => u.id === unitId);
    inv = Object.assign({}, Save.book.inv);
    sel = 0; mobs = []; parts = []; dayT = 0.2; spawnT = 0; energyToastShown = false;
    gen();
    player = { x: spawn.x, y: spawn.y, vx: 0, vy: 0, hp: 10, face: 1, onGround: false, hurtT: 0 };
    active = true;
    document.body.classList.add('world-on');
    UI.screen(`
      <canvas id="wcv"></canvas>
      <div class="w-topbar">
        <button class="btn btn-back" id="wExit">🚪 回村</button>
        <div class="w-title">${unit.icon} ${unit.biome}</div>
        <div class="w-energy" id="wEnergy">⚡ ${Save.book.energy[unit.id] || 0}/15</div>
        <button class="btn btn-back" id="wRegen" title="重新生成世界">🔄</button>
      </div>
      <div class="w-hearts" id="wHearts"></div>
      <div class="w-banner" id="wBanner"></div>
      <div class="w-controls">
        <div class="w-move">
          <button class="w-btn" id="wLeft">◀</button>
          <button class="w-btn" id="wRight">▶</button>
        </div>
        <button class="w-btn w-jump" id="wJump">⬆</button>
      </div>
      <div class="w-hotbar" id="wHotbar"></div>
    `, 'world-screen');
    canvas = document.getElementById('wcv');
    cx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    bindControls();
    refreshHotbar();
    updateHearts();
    document.getElementById('wExit').onclick = () => exit();
    document.getElementById('wRegen').onclick = () => {
      if (confirm('重新生成世界会清除你在这个世界的建筑，确定吗？')) {
        Save.book.seeds[unit.id] = (Save.book.seeds[unit.id] || 1) + 1;
        Save.book.edits[unit.id] = {};
        Save.save();
        exit(true);
        enter(unitId);
      }
    };
    UI.toast('⛏️ 点方块挖矿 · 点怪物用英语攻击 · 盖房子随便玩！', 3000);
    let last = performance.now();
    const frame = t => {
      if (!active) return;
      const dt = Math.min(50, t - last); last = t;
      if (!document.querySelector('.overlay')) update(dt);
      render();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  function exit(silent) {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    Save.book.inv = Object.assign({}, inv);
    Save.save();
    document.body.classList.remove('world-on');
    if (!silent) Main.biome(unit.id);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ---------- 控制 ---------- */
  function bindControls() {
    const hold = (id, key) => {
      const el = document.getElementById(id);
      const on = e => { e.preventDefault(); keys[key] = true; };
      const off = e => { e.preventDefault(); keys[key] = false; };
      el.addEventListener('touchstart', on, { passive: false });
      el.addEventListener('touchend', off, { passive: false });
      el.addEventListener('touchcancel', off, { passive: false });
      el.addEventListener('mousedown', on);
      el.addEventListener('mouseup', off);
      el.addEventListener('mouseleave', off);
    };
    hold('wLeft', 'left'); hold('wRight', 'right');
    const jump = e => { e.preventDefault(); keys.jump = true; setTimeout(() => keys.jump = false, 120); };
    document.getElementById('wJump').addEventListener('touchstart', jump, { passive: false });
    document.getElementById('wJump').addEventListener('mousedown', jump);
    window.addEventListener('keydown', keyDn);
    window.addEventListener('keyup', keyUp);
    canvas.addEventListener('pointerdown', onTap);
  }
  function keyDn(e) {
    if (!active) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') keys.jump = true;
  }
  function keyUp(e) {
    if (!active) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') keys.jump = false;
  }

  /* ---------- 点击：挖 / 放 / 打怪 ---------- */
  function onTap(e) {
    if (!active || document.querySelector('.overlay')) return;
    const wx = e.clientX + camX, wy = e.clientY + camY;
    const mob = mobs.find(m => Math.abs(wx - (m.x + TS / 2)) < TS && wy > m.y - TS * 0.4 && wy < m.y + TS * 1.8);
    if (mob) { attackMob(mob); return; }
    const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
    const pcx = player.x + TS * 0.35, pcy = player.y + TS * 0.85;
    if (Math.max(Math.abs(tx * TS + TS / 2 - pcx), Math.abs(ty * TS + TS / 2 - pcy)) > TS * 4.2) return;
    const b = tileAt(tx, ty);
    if (SOLID.has(b)) mine(tx, ty, b);
    else place(tx, ty);
  }

  function mine(tx, ty, b) {
    if (b === B.BEDROCK) { Audio2.bad(); UI.toast('基岩挖不动！'); return; }
    if (b >= 10) {
      const req = TIER_REQ[b] || 0;
      if (Save.data.tool < req) {
        Audio2.bad();
        UI.toast(`这矿石太硬了！需要${MC.TOOLS[req].name}（🏪 商店升级）`);
        return;
      }
    }
    Audio2.dig();
    burstAt(tx * TS + TS / 2, ty * TS + TS / 2, ['🟫', '⬜', '🟩']);
    const key = tx + ',' + ty;
    if (b >= 10 && oreWord[key] !== undefined) {
      const vi = oreWord[key];
      const v = unit.vocab[vi];
      const isNew = Save.collect(unit.id, vi);
      if (isNew) {
        Save.addEnergy(unit.id, 2);
        const gems = MC.oreReward(unit.id, v, null);
        showBanner(`${v.icon} <b>${UI.esc(v.en)}</b> · ${UI.esc(v.zh)} <span>+${gems}💎 +2⚡</span>`);
        checkEnergyMilestone();
      } else {
        Save.addEnergy(unit.id, 1);
        showBanner(`${v.icon} <b>${UI.esc(v.en)}</b> · ${UI.esc(v.zh)} <span>复习 +1⚡</span>`);
      }
      Speech2.cancelAll(); Speech2.say(v.en).then(() => Speech2.sayAuto(v.zh));
      updateEnergy();
    } else if (PLACEABLE.includes(b)) {
      inv[b] = (inv[b] || 0) + 1;
      refreshHotbar();
    }
    setTile(tx, ty, B.AIR);
    if (b >= 10) delete oreWord[key];
  }

  function place(tx, ty) {
    if (sel === 0) return;
    const b = hotbar[sel - 1];
    if (!b || !inv[b]) return;
    const nearSolid = solidAt(tx + 1, ty) || solidAt(tx - 1, ty) || solidAt(tx, ty + 1) || solidAt(tx, ty - 1);
    if (!nearSolid) return;
    const px1 = player.x, px2 = player.x + TS * 0.7, py1 = player.y, py2 = player.y + TS * 1.7;
    if (tx * TS < px2 && tx * TS + TS > px1 && ty * TS < py2 && ty * TS + TS > py1) return;
    inv[b]--;
    Audio2.place();
    setTile(tx, ty, b);
    burstAt(tx * TS + TS / 2, ty * TS + TS / 2, ['✨']);
    refreshHotbar();
  }

  /* ---------- 战斗 ---------- */
  function askWord(cb) {
    const v = unit.vocab[Math.floor(Math.random() * unit.vocab.length)];
    const others = unit.vocab.filter(x => x.en !== v.en);
    const opts = [v.en];
    while (opts.length < 4 && others.length) opts.push(others.splice(Math.floor(Math.random() * others.length), 1)[0].en);
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    const qText = `「${v.zh}」用英语怎么说？`;
    const o = UI.overlay(`
      <div class="modal mc-mob-modal">
        <div class="mc-mob-face">⚔️</div>
        <h3>喊出正确的英语发动攻击！</h3>
        <p class="hint2">${UI.esc(qText)}</p>
        <div class="npc-opts">${opts.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
      </div>`, 'mc-mob-ov');
    const readW = () => { Speech2.cancelAll(); Speech2.quizRead(qText, opts); };
    readW();
    const h2 = o.querySelector('.hint2');
    if (h2) { h2.classList.add('speakable'); h2.title = '点我再听一遍'; h2.onclick = readW; }
    o.querySelectorAll('.btn-opt').forEach(el => el.onclick = () => {
      const right = el.dataset.op === v.en;
      if (right) {
        Speech2.say(v.en);
        UI.closeOverlay(o);
        cb(true);
      } else {
        Audio2.bad();
        el.classList.add('btn-wrong');
        UI.toast('还不对，再试试！');
        setTimeout(() => { el.classList.remove('btn-wrong'); readW(); }, 800);
      }
    });
  }

  function attackMob(m) {
    if (m.quizzing) return;
    m.quizzing = true;
    askWord(right => {
      m.quizzing = false;
      if (!active) return;
      if (right) {
        Audio2.hit(); Audio2.pop();
        burstAt(m.x + TS / 2, m.y + TS / 2, ['💥', '✨', '🟥']);
        if (m.type === 'creeper') { m.fuse = -1; }
        m.hp -= 1;
        if (m.hp <= 0) killMob(m);
        else UI.toast('命中！怪物还有 ' + m.hp + ' ❤️');
      } else {
        hurtPlayer(1);
        UI.toast('答错了，怪物咬了你一口！');
      }
    });
  }

  function killMob(m) {
    mobs = mobs.filter(x => x !== m);
    burstAt(m.x + TS / 2, m.y + TS / 2, ['💨', '⭐', '💎']);
    Save.addEmeralds(2);
    if (window.MC) MC.adv('hunter');
    UI.toast('🗡️ 怪物被消灭了！+2 💎');
  }

  function hurtPlayer(n) {
    if (player.hurtT > 0) return;
    player.hp -= n;
    player.hurtT = 60;
    shake = 12;
    if (window.MC) MC.sfx.hurt(); else Audio2.bad();
    updateHearts();
    if (player.hp <= 0) die();
  }

  function die() {
    Audio2.bad();
    const o = UI.overlay(`
      <div class="modal">
        <div style="font-size:3.5rem">💀</div>
        <h2>你被击败了！</h2>
        <p class="hint2">别灰心，单词和建筑都还在！</p>
        <button class="btn btn-big btn-primary" id="wRespawn">✨ 重生</button>
      </div>`);
    o.querySelector('#wRespawn').onclick = () => {
      UI.closeOverlay(o);
      player.hp = 10; player.x = spawn.x; player.y = spawn.y; player.vy = 0;
      updateHearts();
    };
  }

  function explode(m) {
    if (window.MC) MC.sfx.explode(); else Audio2.hit();
    shake = 20;
    const ecx = m.x + TS / 2, ecy = m.y + TS / 2;
    burstAt(ecx, ecy, ['🔥', '💥', '🟧', '⬛']);
    const tx0 = Math.floor(ecx / TS), ty0 = Math.floor(ecy / TS);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy > 5) continue;
      const b = tileAt(tx0 + dx, ty0 + dy);
      if (b !== B.AIR && b !== B.BEDROCK) setTile(tx0 + dx, ty0 + dy, B.AIR);
    }
    const dist = Math.hypot(player.x + TS * 0.35 - ecx, player.y + TS * 0.85 - ecy);
    if (dist < TS * 3.2) { player.hurtT = 0; hurtPlayer(4); }
    mobs = mobs.filter(x => x !== m);
  }

  /* ---------- 更新 ---------- */
  function update(dt) {
    const f = dt / 16.7;
    const wasNight = dayT > 0.55;
    dayT = (dayT + dt / 120000) % 1;
    const night = dayT > 0.55;
    if (night && !wasNight) { UI.toast('🌙 天黑了，怪物要出来了！', 2400); if (window.MC) MC.sfx.groan(); }
    if (!night && wasNight && mobs.length) {
      mobs.forEach(m => burstAt(m.x + TS / 2, m.y + TS / 2, ['🔥', '💨']));
      mobs = [];
      UI.toast('☀️ 天亮了，怪物被烧掉了！');
    }
    if (night) {
      spawnT -= dt;
      if (spawnT <= 0 && mobs.length < 3) {
        spawnT = 5000 + Math.random() * 4000;
        spawnMob();
      }
    }
    regenT += dt;
    if (regenT > 15000) { regenT = 0; if (player.hp < 10) { player.hp++; updateHearts(); } }
    const speed = 2.5;
    player.vx = (keys.right ? speed : 0) - (keys.left ? speed : 0);
    if (player.vx) player.face = player.vx > 0 ? 1 : -1;
    if (keys.jump && player.onGround) { player.vy = -10.2; player.onGround = false; Audio2.click(); }
    player.vy = Math.min(13, player.vy + 0.55 * f);
    moveBody(player, player.vx * f, player.vy * f);
    if (player.hurtT > 0) player.hurtT -= f;
    mobs.forEach(m => {
      if (m.fuse > 0) {
        m.fuse -= f;
        if (m.fuse <= 0) explode(m);
        return;
      }
      const dir = Math.sign(player.x - m.x) || 1;
      m.vx = dir * (m.type === 'creeper' ? 1.15 : 0.8);
      m.vy = Math.min(13, (m.vy || 0) + 0.55 * f);
      const blocked = !moveBody(m, m.vx * f, m.vy * f);
      if (blocked && m.onGround) m.vy = -9.5;
      if (m.type === 'creeper' && m.fuse === 0 && Math.abs(player.x - m.x) < TS * 1.6 && Math.abs(player.y - m.y) < TS * 1.6) {
        m.fuse = 70;
        if (window.MC) MC.sfx.hiss();
        UI.toast('💚 苦力怕要炸了！快点它答题拆除！', 2000);
      }
      if (m.type === 'zombie' && Math.abs(player.x - m.x) < TS * 0.8 && Math.abs(player.y - m.y) < TS * 1.2) hurtPlayer(1);
    });
    parts.forEach(p => { p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.3 * f; p.t -= f; });
    parts = parts.filter(p => p.t > 0);
    camX = Math.max(0, Math.min(WW * TS - canvas.width, player.x + TS / 2 - canvas.width / 2));
    camY = Math.max(0, Math.min(WH * TS - canvas.height, player.y - canvas.height / 2));
    if (shake > 0) shake -= f;
  }

  function moveBody(b, dx, dy) {
    const w = TS * 0.7, h = TS * 1.7;
    b.onGround = false;
    b.y += dy;
    if (dy > 0) {
      const y2 = Math.floor((b.y + h) / TS);
      if (solidAt(Math.floor((b.x + 2) / TS), y2) || solidAt(Math.floor((b.x + w - 2) / TS), y2)) {
        b.y = y2 * TS - h; b.vy = 0; b.onGround = true;
      }
    } else if (dy < 0) {
      const y1 = Math.floor(b.y / TS);
      if (solidAt(Math.floor((b.x + 2) / TS), y1) || solidAt(Math.floor((b.x + w - 2) / TS), y1)) {
        b.y = (y1 + 1) * TS; b.vy = 0;
      }
    }
    let free = true;
    b.x += dx;
    if (dx > 0) {
      const x2 = Math.floor((b.x + w) / TS);
      if (solidAt(x2, Math.floor((b.y + 2) / TS)) || solidAt(x2, Math.floor((b.y + h - 2) / TS))) { b.x = x2 * TS - w - 0.01; free = false; }
    } else if (dx < 0) {
      const x1 = Math.floor(b.x / TS);
      if (solidAt(x1, Math.floor((b.y + 2) / TS)) || solidAt(x1, Math.floor((b.y + h - 2) / TS))) { b.x = (x1 + 1) * TS + 0.01; free = false; }
    }
    b.x = Math.max(0, Math.min(WW * TS - w, b.x));
    return free;
  }

  function spawnMob() {
    const dir = Math.random() < 0.5 ? -1 : 1;
    const tx = Math.max(2, Math.min(WW - 3, Math.floor(player.x / TS) + dir * (9 + Math.floor(Math.random() * 8))));
    const type = Math.random() < 0.3 ? 'creeper' : 'zombie';
    mobs.push({ type, x: tx * TS, y: (surface[tx] - 2) * TS, vx: 0, vy: 0, hp: type === 'creeper' ? 1 : 2, fuse: 0, quizzing: false });
    if (window.MC) MC.sfx.groan();
  }

  function burstAt(x, y, chars) {
    for (let i = 0; i < 10; i++) {
      parts.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5, t: 30 + Math.random() * 20, ch: chars[i % chars.length] });
    }
  }

  /* ---------- HUD ---------- */
  function updateHearts() {
    const el = document.getElementById('wHearts');
    if (!el) return;
    let s = '';
    for (let i = 0; i < 5; i++) {
      const v = player.hp - i * 2;
      s += v >= 2 ? '❤️' : v === 1 ? '💗' : '🖤';
    }
    el.textContent = s;
  }
  function updateEnergy() {
    const el = document.getElementById('wEnergy');
    if (el) el.textContent = `⚡ ${Save.book.energy[unit.id] || 0}/15`;
  }
  function checkEnergyMilestone() {
    if (!energyToastShown && (Save.book.energy[unit.id] || 0) >= 15) {
      energyToastShown = true;
      Audio2.unlock();
      UI.toast('⚡ 能量满了！回村可以挑战 Boss 试炼！', 3000);
    }
  }
  function showBanner(html) {
    const el = document.getElementById('wBanner');
    if (!el) return;
    el.innerHTML = html;
    el.classList.add('show');
    clearTimeout(showBanner.t);
    showBanner.t = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function refreshHotbar() {
    hotbar = PLACEABLE.filter(b => inv[b] > 0);
    if (sel > hotbar.length) sel = 0;
    const el = document.getElementById('wHotbar');
    if (!el) return;
    el.innerHTML = `<button class="w-slot ${sel === 0 ? 'w-sel' : ''}" data-s="0">✋</button>` +
      hotbar.map((b, i) => `<button class="w-slot ${sel === i + 1 ? 'w-sel' : ''}" data-s="${i + 1}">${BLOCK_ICON[b]}<i>${inv[b]}</i></button>`).join('');
    el.querySelectorAll('.w-slot').forEach(s => s.onclick = () => { sel = Number(s.dataset.s); Audio2.click(); refreshHotbar(); });
  }

  /* ---------- 渲染 ---------- */
  const SKINS = {
    grass: '#6abe30', dirt: '#8a5a2b', stone: '#7d7d7d', wood: '#6b4c22', leaf: '#3d8a1f', bedrock: '#2b2b2b'
  };
  function render() {
    const W = canvas.width, H = canvas.height;
    const night = dayT > 0.55;
    const dk = night ? 0.55 : 0;
    const sky = cx.createLinearGradient(0, 0, 0, H);
    if (night) { sky.addColorStop(0, '#0b1026'); sky.addColorStop(1, '#1c2547'); }
    else { sky.addColorStop(0, '#7ec8f7'); sky.addColorStop(1, '#b8e4fb'); }
    cx.fillStyle = sky;
    cx.fillRect(0, 0, W, H);
    const t = dayT;
    const cxp = W * 0.85 - W * 0.7 * t, cyp = H * 0.12 + H * 0.25 * Math.sin(t * Math.PI);
    cx.font = '30px serif';
    cx.fillText(night ? '🌙' : '☀️', cxp, cyp);
    if (night) {
      cx.fillStyle = 'rgba(255,255,255,.8)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 97.3) % W, sy = (i * 57.7) % (H * 0.5);
        cx.fillRect(sx, sy, 2, 2);
      }
    }
    const ox = -camX + (shake > 0 ? (Math.random() - 0.5) * shake : 0);
    const oy = -camY + (shake > 0 ? (Math.random() - 0.5) * shake : 0);
    const x0 = Math.max(0, Math.floor(camX / TS)), x1 = Math.min(WW - 1, Math.ceil((camX + W) / TS));
    const y0 = Math.max(0, Math.floor(camY / TS)), y1 = Math.min(WH - 1, Math.ceil((camY + H) / TS));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const b = tiles[y * WW + x];
      if (b === B.AIR) continue;
      const px = x * TS + ox, py = y * TS + oy;
      drawBlock(b, px, py);
    }
    mobs.forEach(m => drawMob(m, m.x + ox, m.y + oy));
    drawPlayer(player.x + ox, player.y + oy);
    cx.font = '16px serif';
    parts.forEach(p => cx.fillText(p.ch, p.x + ox, p.y + oy));
    if (dk) { cx.fillStyle = `rgba(4,8,30,${dk * 0.45})`; cx.fillRect(0, 0, W, H); }
  }

  function drawBlock(b, px, py) {
    if (b === B.GRASS) {
      cx.fillStyle = SKINS.dirt; cx.fillRect(px, py, TS, TS);
      cx.fillStyle = SKINS.grass; cx.fillRect(px, py, TS, TS * 0.35);
    } else if (b >= 10) {
      cx.fillStyle = SKINS.stone; cx.fillRect(px, py, TS, TS);
      cx.fillStyle = { 10: '#1c1c1c', 11: '#d8b89a', 12: '#ffd63d', 13: '#5ce8e8' }[b];
      cx.fillRect(px + TS * 0.2, py + TS * 0.2, TS * 0.22, TS * 0.22);
      cx.fillRect(px + TS * 0.58, py + TS * 0.5, TS * 0.22, TS * 0.22);
      cx.fillRect(px + TS * 0.25, py + TS * 0.62, TS * 0.18, TS * 0.18);
    } else {
      cx.fillStyle = SKINS[{ 2: 'dirt', 3: 'stone', 4: 'wood', 5: 'leaf', 6: 'bedrock' }[b]] || '#888';
      cx.fillRect(px, py, TS, TS);
      if (b === B.WOOD) { cx.fillStyle = 'rgba(0,0,0,.2)'; cx.fillRect(px + TS * 0.4, py, TS * 0.2, TS); }
    }
    cx.strokeStyle = 'rgba(0,0,0,.12)';
    cx.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
  }

  function drawPlayer(px, py) {
    const w = TS * 0.7, h = TS * 1.7;
    if (player.hurtT > 0 && Math.floor(player.hurtT / 6) % 2) return;
    cx.fillStyle = '#3a4a8c';
    cx.fillRect(px + w * 0.1, py + h * 0.62, w * 0.35, h * 0.38);
    cx.fillRect(px + w * 0.55, py + h * 0.62, w * 0.35, h * 0.38);
    cx.fillStyle = '#2aa198';
    cx.fillRect(px, py + h * 0.28, w, h * 0.36);
    cx.fillStyle = '#e8b98a';
    cx.fillRect(px + w * 0.05, py, w * 0.9, h * 0.3);
    cx.fillStyle = '#222';
    const ex = player.face > 0 ? px + w * 0.62 : px + w * 0.16;
    cx.fillRect(ex, py + h * 0.1, w * 0.14, h * 0.07);
  }

  function drawMob(m, px, py) {
    const w = TS * 0.8, h = TS * 1.7;
    if (m.type === 'zombie') {
      cx.fillStyle = '#2e6b34';
      cx.fillRect(px, py + h * 0.28, w, h * 0.72);
      cx.fillStyle = '#54a04b';
      cx.fillRect(px, py, w, h * 0.3);
      cx.fillStyle = '#111';
      cx.fillRect(px + w * 0.18, py + h * 0.1, w * 0.16, h * 0.07);
      cx.fillRect(px + w * 0.6, py + h * 0.1, w * 0.16, h * 0.07);
    } else {
      const flash = m.fuse > 0 && Math.floor(m.fuse / 8) % 2;
      cx.fillStyle = flash ? '#e8ffe8' : '#43a047';
      cx.fillRect(px, py, w, h);
      cx.fillStyle = '#111';
      cx.fillRect(px + w * 0.15, py + h * 0.12, w * 0.18, h * 0.12);
      cx.fillRect(px + w * 0.62, py + h * 0.12, w * 0.18, h * 0.12);
      cx.fillRect(px + w * 0.36, py + h * 0.28, w * 0.28, h * 0.3);
      cx.fillRect(px + w * 0.22, py + h * 0.42, w * 0.14, h * 0.18);
      cx.fillRect(px + w * 0.64, py + h * 0.42, w * 0.14, h * 0.18);
    }
    if (m.hp < 2) {
      cx.fillStyle = '#000'; cx.fillRect(px, py - 8, w, 4);
      cx.fillStyle = '#e74c3c'; cx.fillRect(px, py - 8, w * (m.hp / 2), 4);
    }
  }

  return {
    enter, exit, tileAt,
    get active() { return active; },
    state: () => ({ px: player && player.x, py: player && player.y, hp: player && player.hp, inv, mobs: mobs.length, mobList: mobs.map(m => ({ x: m.x, y: m.y, type: m.type, hp: m.hp })), dayT, energy: unit ? (Save.book.energy[unit.id] || 0) : 0 }),
    forceNight: () => { dayT = 0.6; },
    debugSpawn: type => { mobs.push({ type: type || 'zombie', x: player.x + TS * 3, y: player.y, vx: 0, vy: 0, hp: 2, fuse: 0, quizzing: false }); },
    debugTeleportToOre: () => {
      const key = Object.keys(oreWord)[0];
      if (!key) return false;
      const [x, y] = key.split(',').map(Number);
      player.x = x * TS - TS; player.y = (y - 2) * TS; player.vy = 0;
      return { x, y, id: tileAt(x, y) };
    }
  };
})();

window.World = World;
