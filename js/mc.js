/* ============================================================
   EduQuest · mc.js
   Minecraft 趣味增强包：XP等级 / 成就 / 镐子升级 / 商店 / 附魔
   苦力怕突袭 / 昼夜怪物 / 狼伙伴 / 环境音乐 / 粒子 / HUD
   进度(解锁/能量)走 Save.book（按教材隔离）；货币(绿宝石)/工具为全局
   ============================================================ */
'use strict';

const MC = (() => {

  function ensureFields() {
    const d = Save.data;
    if (typeof d.xp !== 'number') d.xp = 0;
    if (typeof d.level !== 'number') d.level = 1;
    if (typeof d.tool !== 'number') d.tool = 0;
    if (!Array.isArray(d.adv)) d.adv = [];
    if (typeof d.wolf !== 'boolean') d.wolf = false;
    if (typeof d.fortuneUntil !== 'number') d.fortuneUntil = 0;
    if (typeof d.musicOff !== 'boolean') d.musicOff = false;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- 音效（Web Audio 合成，MC 风味） ---------- */
  let ctx = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur = 0.12, type = 'square', vol = 0.06, when = 0, slide = null) {
    try {
      const c = ac();
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime + when);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + when + dur);
      g.gain.setValueAtTime(vol, c.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
      o.connect(g); g.connect(c.destination);
      o.start(c.currentTime + when); o.stop(c.currentTime + when + dur);
    } catch (e) { /* 无声设备降级 */ }
  }
  function noise(dur = 0.5, freq = 800, vol = 0.15, when = 0, type = 'lowpass') {
    try {
      const c = ac();
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(vol, c.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(c.currentTime + when); src.stop(c.currentTime + when + dur);
    } catch (e) { /* 无声设备降级 */ }
  }

  const sfx = {
    orb:      () => tone(880, 0.07, 'sine', 0.05, 0, 1500),
    levelup:  () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.16, 'triangle', 0.07, i * 0.11)),
    villager: () => { tone(150, 0.16, 'sawtooth', 0.05, 0, 120); tone(140, 0.2, 'sawtooth', 0.05, 0.22, 110); },
    hiss:     () => noise(1.1, 4500, 0.1, 0, 'highpass'),
    explode:  () => { noise(0.7, 320, 0.28); tone(70, 0.5, 'sine', 0.22, 0, 35); },
    groan:    () => tone(110, 0.55, 'sawtooth', 0.06, 0, 85),
    bark:     () => { tone(420, 0.06, 'square', 0.08); tone(370, 0.08, 'square', 0.08, 0.09); },
    advance:  () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, 'square', 0.06, i * 0.09)); tone(2093, 0.3, 'sine', 0.03, 0.4); },
    enchant:  () => [880, 1108, 1318, 1760].forEach((f, i) => tone(f, 0.22, 'sine', 0.05, i * 0.12)),
    hurt:     () => tone(200, 0.15, 'square', 0.08, 0, 120),
    upgrade:  () => { noise(0.12, 2500, 0.12, 0, 'highpass'); tone(520, 0.12, 'square', 0.06, 0.05); }
  };

  /* ---------- 环境音乐（五声音阶随机拨弦，MC 氛围） ---------- */
  const PENTA = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
  let musicTimer = null;
  function pluck() {
    const f = PENTA[Math.floor(Math.random() * PENTA.length)];
    tone(f, 0.9, 'triangle', 0.026);
    if (Math.random() < 0.3) tone(f / 2, 1.3, 'sine', 0.018, 0.15);
  }
  function startMusic() {
    if (musicTimer) return;
    const loop = () => {
      musicTimer = setTimeout(() => {
        if (!Save.data.musicOff && document.visibilityState === 'visible') pluck();
        loop();
      }, 2600 + Math.random() * 3200);
    };
    loop();
  }
  function toggleMusic() {
    Save.data.musicOff = !Save.data.musicOff;
    Save.save();
    if (!Save.data.musicOff) { startMusic(); Audio2.click(); }
    refreshHUD();
  }

  /* ---------- XP / 等级 ---------- */
  const xpNeed = lvl => 20 + (lvl - 1) * 15;
  function addXp(n) {
    if (n <= 0) return;
    const d = Save.data;
    d.xp += n;
    while (d.xp >= xpNeed(d.level)) {
      d.xp -= xpNeed(d.level);
      d.level++;
      d.emeralds += 3;
      sfx.levelup();
      UI.toast(`🆙 升级！Lv.${d.level} · 奖励 +3 💎`, 2400);
      if (d.level >= 5) adv('level5');
    }
    Save.save();
    refreshHUD();
  }

  /* ---------- 成就 ---------- */
  const ADVS = {
    mine:    { icon: '⛏️', name: '挖矿时间！', desc: '挖到第一块知识矿石' },
    craft:   { icon: '🛠️', name: '合成大师', desc: '第一次合成句子成功' },
    speak:   { icon: '🎤', name: '鹦鹉学舌', desc: '第一次跟读打卡成功' },
    boss:    { icon: '🐉', name: '怪物猎人', desc: '第一次通过 Boss 战' },
    explore: { icon: '🗺️', name: '探险家', desc: '解锁新的群系' },
    tool:    { icon: '⚒️', name: '获得升级！', desc: '升级了一把镐子' },
    wolf:    { icon: '🐺', name: '最好的朋友', desc: '驯服了一只狼' },
    creeper: { icon: '💥', name: '拆弹专家', desc: '成功拆除苦力怕' },
    hunter:  { icon: '🗡️', name: '深夜守卫', desc: '击败夜晚的怪物' },
    rich:    { icon: '💎', name: '绿宝石富翁', desc: '攒到 50 颗绿宝石' },
    level5:  { icon: '🌟', name: '小学者', desc: '到达 Lv.5' },
    enchant: { icon: '🔮', name: '附魔师', desc: '第一次附魔' },
    cave:    { icon: '✨', name: '矿洞清道夫', desc: '清空了错题矿洞' }
  };
  function adv(id) {
    const d = Save.data, a = ADVS[id];
    if (!a || d.adv.includes(id)) return;
    d.adv.push(id);
    Save.save();
    sfx.advance();
    const t = document.createElement('div');
    t.className = 'mc-adv';
    t.innerHTML = `<div class="mc-adv-icon">${a.icon}</div>
      <div><div class="mc-adv-head">已达成进度！</div>
      <div class="mc-adv-name">${a.name}</div>
      <div class="mc-adv-desc">${a.desc}</div></div>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------- HUD（底部 MC 状态栏） ---------- */
  function ensureHUD() {
    if (document.getElementById('mc-hud')) return;
    const h = document.createElement('div');
    h.id = 'mc-hud';
    h.innerHTML = `
      <button id="mcMusicBtn" title="音乐开关">🎵</button>
      <span class="mc-hearts">❤️❤️❤️❤️❤️</span>
      <div class="mc-xp"><div class="mc-xp-fill" id="mcXpFill"></div></div>
      <span class="mc-lv" id="mcLv">Lv.1</span>
      <span class="mc-clock" id="mcClock">☀️</span>
      <span class="mc-tool" id="mcTool">⛏️</span>`;
    document.body.appendChild(h);
    h.querySelector('#mcMusicBtn').onclick = () => toggleMusic();
    refreshHUD();
  }
  function refreshHUD() {
    const h = document.getElementById('mc-hud');
    if (!h) return;
    const d = Save.data;
    h.querySelector('#mcXpFill').style.width = Math.min(100, Math.round(d.xp / xpNeed(d.level) * 100)) + '%';
    h.querySelector('#mcLv').textContent = 'Lv.' + d.level;
    h.querySelector('#mcTool').textContent = TOOLS[d.tool].icon + '⛏️';
    h.querySelector('#mcClock').textContent = isNight() ? '🌙' : '☀️';
    h.querySelector('#mcMusicBtn').textContent = d.musicOff ? '🔇' : '🎵';
  }

  /* ---------- 镐子 ---------- */
  const TOOLS = [
    { name: '木镐',       icon: '🪵', cost: 0 },
    { name: '石镐',       icon: '🪨', cost: 8 },
    { name: '铁镐',       icon: '⚙️', cost: 20 },
    { name: '钻石镐',     icon: '💎', cost: 40 },
    { name: '下界合金镐', icon: '🟪', cost: 80 }
  ];
  const TIER_REQ = { common: 0, core: 0, challenge: 1, diamond: 2 };
  function canMine(tier) { return Save.data.tool >= (TIER_REQ[tier] || 0); }
  function needToolName(tier) { return TOOLS[TIER_REQ[tier] || 0].name; }
  function oreReward(unitId, v, el) {
    const fortune = Date.now() < Save.data.fortuneUntil;
    const gems = (1 + Save.data.tool) * (fortune ? 2 : 1);
    Save.addEmeralds(gems);
    if (el) { burst(el); orbToHUD(el); }
    sfx.orb();
    return gems;
  }

  /* ---------- 粒子 & XP 绿球 ---------- */
  function burst(el, chars) {
    chars = chars || ['🟩', '🟫', '⬜', '🟨'];
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span');
      p.className = 'mc-particle';
      p.textContent = chars[i % chars.length];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--dx', (Math.random() * 130 - 65) + 'px');
      p.style.setProperty('--dy', (-30 - Math.random() * 90) + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }
  function orbToHUD(el) {
    const hud = document.getElementById('mc-hud');
    if (!hud || !el) return;
    const r = el.getBoundingClientRect();
    const t = hud.querySelector('.mc-xp').getBoundingClientRect();
    const orb = document.createElement('span');
    orb.className = 'mc-orb';
    orb.style.left = (r.left + r.width / 2) + 'px';
    orb.style.top = (r.top + r.height / 2) + 'px';
    document.body.appendChild(orb);
    requestAnimationFrame(() => {
      orb.style.transform = `translate(${t.left + t.width / 2 - r.left - r.width / 2}px, ${t.top - r.top - r.height / 2}px)`;
      orb.style.opacity = '0.2';
    });
    setTimeout(() => { orb.remove(); sfx.orb(); }, 680);
  }

  /* ---------- 昼夜 ---------- */
  let nightForce = null;
  function isNight() {
    if (nightForce !== null) return nightForce;
    return (Date.now() / 1000 % 120) >= 75; // 75s 白天 + 45s 夜晚
  }
  function ensureStars() {
    document.querySelectorAll('.mc-stars').forEach(e => e.remove());
    if (!isNight()) return;
    const s = document.createElement('div');
    s.className = 'mc-stars';
    for (let i = 0; i < 36; i++) {
      const st = document.createElement('i');
      st.style.left = Math.random() * 100 + 'vw';
      st.style.top = Math.random() * 52 + 'vh';
      st.style.animationDelay = (Math.random() * 2.4) + 's';
      s.appendChild(st);
    }
    document.body.appendChild(s);
  }

  /* ---------- 夜晚怪物 ---------- */
  function spawnMonsters() {
    if (!isNight()) return;
    const mobs = ['🧟', '🕷️', '💀'];
    const n = 2 + (Math.random() < 0.4 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const el = document.createElement('button');
      el.className = 'mc-monster';
      el.textContent = mobs[Math.floor(Math.random() * mobs.length)];
      el.style.left = (6 + Math.random() * 72) + 'vw';
      el.style.top = (16 + Math.random() * 44) + 'vh';
      el.style.animationDuration = (4.5 + Math.random() * 4) + 's';
      el.onclick = () => monsterQuiz(el);
      document.body.appendChild(el);
    }
    sfx.groan();
    UI.toast('🌙 夜晚降临，怪物出现了！点击怪物答题消灭它们！', 2600);
  }
  function monsterQuiz(el) {
    const unlocked = UNITS.filter(u => Save.book.unlocked.includes(u.id));
    if (!unlocked.length) { UI.toast('先去群系收集一些单词吧！'); return; }
    const unit = unlocked[Math.floor(Math.random() * unlocked.length)];
    const v = unit.vocab[Math.floor(Math.random() * unit.vocab.length)];
    const opts = shuffle([v.en, ...shuffle(unit.vocab.filter(x => x.en !== v.en)).slice(0, 3).map(x => x.en)]);
    sfx.groan();
    const qText = `「${v.zh}」用英语怎么说？`;
    const o = UI.overlay(`
      <div class="modal mc-mob-modal">
        <div class="mc-mob-face">${el.textContent}</div>
        <h3>怪物来袭！用英语击败它！</h3>
        <p class="hint2">${UI.esc(qText)}</p>
        <div class="npc-opts">${opts.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
      </div>`, 'mc-mob-ov');
    const readM = () => { Speech2.cancelAll(); Speech2.quizRead(qText, opts); };
    readM();
    const h2 = o.querySelector('.hint2');
    if (h2) { h2.classList.add('speakable'); h2.title = '点我再听一遍'; h2.onclick = readM; }
    o.querySelectorAll('.btn-opt').forEach(b => b.onclick = () => {
      if (b.dataset.op === v.en) {
        Audio2.hit(); Audio2.pop();
        Save.addEmeralds(3);
        burst(el, ['💥', '✨', '🟩']);
        el.remove();
        adv('hunter');
        UI.toast('🗡️ 怪物被击败了！+3 💎');
        UI.closeOverlay(o);
      } else {
        sfx.groan();
        b.classList.add('btn-wrong');
        UI.toast('怪物还没死，再攻击一次！');
        setTimeout(() => { b.classList.remove('btn-wrong'); readM(); }, 800);
      }
    });
  }

  /* ---------- 苦力怕突袭 ---------- */
  let currentUnit = null, ctxStamp = 0, creeperTimer = null;
  function scheduleCreeper() {
    clearTimeout(creeperTimer);
    const stamp = ctxStamp;
    creeperTimer = setTimeout(() => {
      if (stamp !== ctxStamp || !currentUnit) return;
      if (document.querySelector('.overlay')) { scheduleCreeper(); return; }
      spawnCreeper(currentUnit);
    }, 15000 + Math.random() * 25000);
  }
  function spawnCreeper(unit) {
    sfx.hiss();
    const v = unit.vocab[Math.floor(Math.random() * unit.vocab.length)];
    const opts = shuffle([v.en, ...shuffle(unit.vocab.filter(x => x.en !== v.en)).slice(0, 3).map(x => x.en)]);
    const qText = `「${v.zh}」用英语怎么说？`;
    const o = UI.overlay(`
      <div class="modal mc-creeper-modal">
        <div class="cface"><i class="ce1"></i><i class="ce2"></i><i class="cm"></i></div>
        <h3>嘶嘶嘶……苦力怕要爆炸了！</h3>
        <p class="hint2">快速答题拆除它！${UI.esc(qText)}</p>
        <div class="creeper-fuse"><div id="fuseBar"></div></div>
        <div class="npc-opts">${opts.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
      </div>`, 'mc-creeper-ov');
    const readC = () => { Speech2.cancelAll(); Speech2.quizRead(qText, opts); };
    readC();
    const h2 = o.querySelector('.hint2');
    if (h2) { h2.classList.add('speakable'); h2.title = '点我再听一遍'; h2.onclick = readC; }
    let done = false;
    const fuse = o.querySelector('#fuseBar');
    requestAnimationFrame(() => {
      fuse.style.transition = 'width 9s linear';
      fuse.style.width = '0%';
    });
    const boom = setTimeout(() => { if (!done) { done = true; finish(false); } }, 9100);
    function finish(defused) {
      clearTimeout(boom);
      if (defused) {
        Audio2.pop(); sfx.orb();
        Save.addEmeralds(3);
        addXp(10);
        adv('creeper');
        UI.toast('💨 成功拆除苦力怕！+3 💎');
        setTimeout(() => UI.closeOverlay(o), 250);
      } else {
        sfx.explode();
        const b = Save.book;
        b.energy[unit.id] = Math.max(0, (b.energy[unit.id] || 0) - 2);
        Save.save();
        o.classList.add('mc-shake');
        UI.toast('💥 砰！苦力怕爆炸了！-2 ⚡');
        setTimeout(() => UI.closeOverlay(o), 700);
      }
      scheduleCreeper();
    }
    o.querySelectorAll('.btn-opt').forEach(el => el.onclick = () => {
      if (done) return;
      const right = el.dataset.op === v.en;
      if (right) { done = true; finish(true); return; }
      el.classList.add('btn-wrong');
      UI.toast('还不对，快再试试，苦力怕要炸了！');
      setTimeout(() => { el.classList.remove('btn-wrong'); readC(); }, 800);
    });
  }

  /* ---------- 狼伙伴 ---------- */
  function showWolf() {
    if (!Save.data.wolf || document.getElementById('mc-wolf')) return;
    const w = document.createElement('div');
    w.id = 'mc-wolf';
    w.textContent = '🐺';
    w.title = '你的狼伙伴';
    w.onclick = () => { sfx.bark(); burst(w, ['❤️', '❤️', '🦴']); UI.toast('汪！🐺 很开心！'); };
    document.body.appendChild(w);
    scheduleBark();
  }
  let barkTimer = null;
  function scheduleBark() {
    clearTimeout(barkTimer);
    barkTimer = setTimeout(() => {
      if (Save.data.wolf && document.visibilityState === 'visible') sfx.bark();
      scheduleBark();
    }, 22000 + Math.random() * 30000);
  }

  /* ---------- 村庄商店 ---------- */
  function shop() {
    const d = Save.data;
    const t = TOOLS[d.tool], next = TOOLS[d.tool + 1];
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.map()">← 返回地图</button>
        <div class="topbar-title">🏪 村庄商店</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="shop-list">
        <div class="shop-item">
          <div class="shop-icon">${(next || t).icon}⛏️</div>
          <div class="shop-info">
            <b>${next ? `升级镐子：${t.name} → ${next.name}` : `${t.name} · 已是顶级！`}</b>
            <span>当前：${t.name} · 每块新矿石 +${1 + d.tool} 💎${next ? ` · 升级后 +${2 + d.tool} 💎` : ''}<br>🟡 金矿需要石镐 · 💎 钻石矿需要铁镐</span>
          </div>
          ${next ? `<button class="btn btn-primary" id="buyTool">${next.cost} 💎</button>` : '<span class="shop-max">MAX</span>'}
        </div>
        <div class="shop-item">
          <div class="shop-icon">🦴</div>
          <div class="shop-info">
            <b>${d.wolf ? '狼伙伴（已驯服）🐺' : '驯服一只狼'}</b>
            <span>${d.wolf ? '它会一直陪着你冒险，点它试试！' : '用一根骨头驯服狼，它会陪你一起冒险'}</span>
          </div>
          ${d.wolf ? '<span class="shop-max">🐺</span>' : '<button class="btn btn-primary" id="buyBone">10 💎</button>'}
        </div>
        <div class="shop-item">
          <div class="shop-icon">🔮</div>
          <div class="shop-info">
            <b>附魔台</b>
            <span>随机祝福：时运 III（10 分钟挖矿双倍💎）/ 经验 +40 / 全部群系能量 +2</span>
          </div>
          <button class="btn btn-primary" id="buyEnch">15 💎</button>
        </div>
      </div>
      <p class="hint">💡 绿宝石通过学习赚取：挖矿 · 合成 · NPC 任务 · Boss 战 · 打怪</p>
    `, 'shop-screen');
    const need = cost => {
      if (Save.data.emeralds < cost) { Audio2.bad(); UI.toast('绿宝石不够啦！去学习赚宝石吧 💎'); return false; }
      return true;
    };
    const buyTool = document.getElementById('buyTool');
    if (buyTool) buyTool.onclick = () => {
      if (!need(next.cost)) return;
      Save.addEmeralds(-next.cost);
      Save.data.tool++;
      Save.save();
      sfx.upgrade();
      adv('tool');
      UI.toast(`⚒️ 获得 ${next.name}！挖矿奖励提升！`);
      refreshHUD();
      shop();
    };
    const buyBone = document.getElementById('buyBone');
    if (buyBone) buyBone.onclick = () => {
      if (!need(10)) return;
      Save.addEmeralds(-10);
      Save.data.wolf = true;
      Save.save();
      sfx.bark();
      adv('wolf');
      UI.toast('🐺 驯服成功！狼成为了你的伙伴！');
      showWolf();
      shop();
    };
    document.getElementById('buyEnch').onclick = () => {
      if (!need(15)) return;
      Save.addEmeralds(-15);
      sfx.enchant();
      adv('enchant');
      const roll = Math.random();
      if (roll < 0.4) {
        Save.data.fortuneUntil = Date.now() + 10 * 60 * 1000;
        Save.save();
        UI.toast('🔮 附魔成功：时运 III！10 分钟内挖矿双倍 💎', 2600);
      } else if (roll < 0.75) {
        addXp(40);
        UI.toast('🔮 附魔成功：经验祝福 +40 XP！', 2400);
      } else {
        Save.book.unlocked.forEach(u => Save.addEnergy(u, 2));
        UI.toast('🔮 附魔成功：所有群系 +2 ⚡！', 2400);
      }
      shop();
    };
  }

  /* ---------- 场景装饰 & 包装 ---------- */
  function cleanupAmbient() {
    document.querySelectorAll('.mc-monster, .mc-stars').forEach(e => e.remove());
    document.body.classList.remove('night');
  }
  function decorateMap() {
    document.body.classList.toggle('night', isNight());
    const menu = document.querySelector('.map-menu');
    if (menu && !menu.querySelector('.shop-btn')) {
      const b = document.createElement('button');
      b.className = 'btn menu-btn shop-btn';
      b.innerHTML = '🏪 商店';
      b.onclick = () => { Audio2.click(); shop(); };
      menu.appendChild(b);
    }
    ensureHUD();
    ensureStars();
    spawnMonsters();
    showWolf();
    refreshHUD();
  }

  function wrapAll() {
    const oe = Save.addEmeralds, on = Save.addEnergy, oc = Save.collect,
          ou = Save.unlock, orv = Save.reviewHit;
    Save.addEmeralds = n => {
      oe(n);
      if (n > 0) addXp(n * 2);
      if (Save.data.emeralds >= 50) adv('rich');
      refreshHUD();
    };
    Save.addEnergy = (u, n) => { on(u, n); if (n > 0) addXp(n); };
    Save.collect = (u, i) => { const r = oc(u, i); if (r) adv('mine'); return r; };
    Save.unlock = u => {
      const had = Save.book.unlocked.includes(u);
      ou(u);
      if (!had) adv('explore');
    };
    Save.reviewHit = i => {
      orv(i);
      if (Save.book.wrong.length === 0) adv('cave');
    };
    const os = UI.screen;
    UI.screen = function (html, cls) {
      os(html, cls);
      cleanupAmbient();
      refreshHUD();
    };
    const oboss = Games.boss;
    Games.boss = function (u) { ctxStamp++; clearTimeout(creeperTimer); oboss(u); };
    Audio2.villager = sfx.villager;
  }

  /* ---------- 由 main.js 直接调用的导航钩子（仅 MC 世界启用氛围） ---------- */
  function onMap() {
    currentUnit = null; ctxStamp++; clearTimeout(creeperTimer);
    decorateMap();
    startMusic();
  }
  function onBiome(unit) {
    currentUnit = unit;
    ctxStamp++; scheduleCreeper();
    ensureHUD(); showWolf(); refreshHUD();
  }

  function init() {
    ensureFields();
    wrapAll();
  }
  document.addEventListener('DOMContentLoaded', init);

  return {
    adv, burst, orbToHUD, addXp, sfx, shop, onMap, onBiome,
    canMine, needToolName, oreReward,
    TOOLS, isNight,
    debugCreeper: id => spawnCreeper(UNITS.find(u => u.id === (id || 1))),
    forceNight: v => { nightForce = v; }
  };
})();

window.MC = MC;
