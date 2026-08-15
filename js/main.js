/* ============================================================
   EduQuest · main.js
   流程编排：标题 → 家长选教材 → 小孩选游戏世界 → 单元地图 → 关卡营地(按世界主题)
   ============================================================ */
'use strict';

const Main = (() => {

  const WORLDS = [
    { id: 'mc',    icon: '🟩', name: '我的世界', en: 'Minecraft',   desc: '方块沙盒：挖矿学单词、自由建造、打怪说英语' },
    { id: 'pvz',   icon: '🧟', name: '植物大战僵尸', en: 'Plants vs Zombies', desc: '塔防闯关：用英语发射豌豆，消灭僵尸守卫房子' },
    { id: 'mario', icon: '🍄', name: '超级马里奥', en: 'Super Mario', desc: '跑酷闯关：顶碎 ? 砖块学单词，冲向终点旗帜' },
    { id: 'coop',  icon: '👫', name: '双人成行', en: 'It Takes Two', desc: '协作闯关：Cody 和 May 一起答题开门前进' }
  ];

  function load() {
    Save.load();
    selectBook(Cur.bookId);
  }

  /* ---------- 标题 ---------- */
  function home() {
    const hasProgress = Save.data.selBook !== undefined && (Save.data.books && Object.keys(Save.data.books).length);
    UI.screen(`
      <div class="home">
        <div class="home-logo">📚⚔️</div>
        <h1 class="home-title">EduQuest</h1>
        <p class="home-sub">英语闯关学院</p>
        <p class="home-tag">选教材 · 选游戏 · 在冒险里把英语学扎实</p>
        <div class="home-btns">
          <button class="btn btn-big btn-primary" id="homeStart">▶ 开始冒险</button>
          ${hasProgress ? '<button class="btn btn-big" id="homeContinue">🔁 继续上次的进度</button>' : ''}
          <button class="btn btn-big" id="homeBooks">📚 家长：选择教材</button>
        </div>
        <p class="hint home-hint">所有声音用美式英语朗读，孩子听得到、跟得上。进度只存在本机。</p>
      </div>
    `, 'home-screen');
    document.getElementById('homeStart').onclick = () => { Audio2.click(); books(); };
    const cont = document.getElementById('homeContinue');
    if (cont) cont.onclick = () => { Audio2.click(); worlds(); };
    document.getElementById('homeBooks').onclick = () => { Audio2.click(); books(); };
  }

  /* ---------- 家长选教材 ---------- */
  function books() {
    const cards = TEXTBOOKS.map(b => `
      <button class="book-card" data-i="${b.id}" style="--bc:${b.color}">
        <div class="book-bar"></div>
        <div class="book-icon">${b.id === 0 ? '🟪' : b.id === 1 ? '📘' : b.id === 2 ? '🟢' : b.id === 3 ? '📗' : b.id === 4 ? '🔵' : '🟤'}</div>
        <div class="book-name">${UI.esc(b.name)}</div>
        <div class="book-pub">${UI.esc(b.publisher)} · ${UI.esc(b.grade)}</div>
        <div class="book-desc">${UI.esc(b.desc)}</div>
        <div class="book-units">${b.units.length} 个单元</div>
      </button>`).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.home()">← 返回</button>
        <div class="topbar-title">📚 家长选教材</div>
      </div>
      <p class="hint">请家长先为孩子选一套教材，不同教材进度分开保存。之后孩子可以自己选游戏世界。</p>
      <div class="book-grid">${cards}</div>
    `, 'book-screen');
    document.querySelectorAll('.book-card').forEach(el => el.onclick = () => {
      Audio2.click();
      selectBook(Number(el.dataset.i));
      UI.toast(`已选择：${TEXTBOOKS[Cur.bookId].name}`, 1600);
      setTimeout(worlds, 500);
    });
  }

  /* ---------- 小孩选游戏世界 ---------- */
  function worlds() {
    const b = getBook();
    const cards = WORLDS.map(w => `
      <button class="world-card" data-w="${w.id}">
        <div class="world-icon">${w.icon}</div>
        <div class="world-name">${w.name}</div>
        <div class="world-en">${w.en}</div>
        <div class="world-desc">${w.desc}</div>
      </button>`).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.books()">← 换教材</button>
        <div class="topbar-title">🎮 选游戏世界</div>
        ${UI.emeraldBadge()}
      </div>
      <p class="hint">当前教材：<b>${UI.esc(b.name)}</b>。挑一个你喜欢的游戏世界，开始闯关学英语！</p>
      <div class="world-grid">${cards}</div>
    `, 'world-screen');
    document.querySelectorAll('.world-card').forEach(el => el.onclick = () => {
      Audio2.click(); Speech2.say(getWorld(el.dataset.w).name + '!');
      Cur.world = el.dataset.w; Save.save();
      setTimeout(map, 350);
    });
  }

  function getWorld(id) { return WORLDS.find(w => w.id === id) || WORLDS[0]; }

  function hideMcAmbient() {
    const hud = document.getElementById('mc-hud'); if (hud) hud.remove();
    const wolf = document.getElementById('mc-wolf'); if (wolf) wolf.remove();
    document.querySelectorAll('.mc-monster, .mc-stars').forEach(e => e.remove());
    document.body.classList.remove('night');
  }

  /* ---------- 单元地图 ---------- */
  function map() {
    const b = getBook();
    if (Cur.world === 'mc') MC.onMap(); else hideMcAmbient();
    const unlocked = Save.book.unlocked || [1];
    const cards = UNITS.map(u => {
      const open = unlocked.includes(u.id);
      const boss = Save.book.boss[u.id];
      const got = (Save.book.collected[u.id] || []).length;
      const star = boss && boss.passed ? '✅' : (boss ? '❌' : '🔒');
      return `
        <button class="unit-card ${open ? '' : 'unit-locked'}" data-u="${u.id}">
          <div class="unit-icon">${u.icon}</div>
          <div class="unit-name">${UI.esc(u.name)}</div>
          <div class="unit-biome">${UI.esc(u.biome)}</div>
          <div class="unit-meta">${star} ${got}/${u.vocab.length} 词</div>
        </button>`;
    }).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.worlds()">← 换世界</button>
        <div class="topbar-title">🗺️ ${UI.esc(b.name)} · ${getWorld(Cur.world).icon}${getWorld(Cur.world).name}</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="map-menu">
        <button class="btn menu-btn" onclick="Audio2.click();Games.parentCenter()">👨‍👩‍👧 家长中心</button>
        <button class="btn menu-btn" onclick="Audio2.click();Main.changeBook()">🔄 换教材/世界</button>
      </div>
      <p class="hint">点亮全部单元，先收集单词 ⚡ 攒满 15 就能挑战 Boss 试炼！</p>
      <div class="unit-grid">${cards}</div>
    `, 'map-screen');
    document.querySelectorAll('.unit-card').forEach(el => el.onclick = () => {
      const id = Number(el.dataset.u);
      Audio2.click();
      if (!Save.book.unlocked.includes(id)) { UI.toast('🔒 先通关上一单元，才能解锁这里哦！'); return; }
      biome(id);
    });
  }

  /* ---------- 关卡营地（按世界主题） ---------- */
  function biome(unitId) {
    const unit = UNITS.find(u => u.id === unitId);
    if (!unit) return;
    if (Cur.world !== 'mc') hideMcAmbient();

    let activities;
    if (Cur.world === 'mc') {
      activities = [
        { icon: '⛏️', name: '挖矿学单词', act: `Games.mining(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '🌍', name: '进入我的世界', act: `World.enter(${unit.id})`, primary: true },
        { icon: '🛠️', name: '合成台造句', act: `Games.crafting(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '🧑‍🤝‍🧑', name: 'NPC 任务', act: `Games.npc(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '📜', name: '故事卷轴', act: `Games.story(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '🐉', name: 'Boss 战试炼', act: `Games.boss(UNITS.find(u=>u.id===${unit.id}))`, boss: true },
        { icon: '📖', name: '单词图鉴', act: `Games.dex(${unit.id})` },
        { icon: '🏗️', name: '建造基地', act: `Games.buildZone()` },
        { icon: '🕳️', name: '错题矿洞', act: `Games.reviewCave()` }
      ];
      MC.onBiome(unit);
    } else if (Cur.world === 'pvz') {
      activities = [
        { icon: '🧟', name: '开始植物保卫战', act: `PVZ.play(UNITS.find(u=>u.id===${unit.id}))`, primary: true },
        { icon: '📖', name: '单词图鉴', act: `Games.dex(${unit.id})` },
        { icon: '📜', name: '故事卷轴', act: `Games.story(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '🐉', name: 'Boss 战试炼', act: `Games.boss(UNITS.find(u=>u.id===${unit.id}))`, boss: true },
        { icon: '🕳️', name: '错题矿洞', act: `Games.reviewCave()` }
      ];
    } else if (Cur.world === 'mario') {
      activities = [
        { icon: '🍄', name: '开始马里奥闯关', act: `Mario.play(UNITS.find(u=>u.id===${unit.id}))`, primary: true },
        { icon: '📖', name: '单词图鉴', act: `Games.dex(${unit.id})` },
        { icon: '📜', name: '故事卷轴', act: `Games.story(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '🐉', name: 'Boss 战试炼', act: `Games.boss(UNITS.find(u=>u.id===${unit.id}))`, boss: true },
        { icon: '🕳️', name: '错题矿洞', act: `Games.reviewCave()` }
      ];
    } else { // coop
      activities = [
        { icon: '👫', name: '开始双人成行', act: `Coop.play(UNITS.find(u=>u.id===${unit.id}))`, primary: true },
        { icon: '📖', name: '单词图鉴', act: `Games.dex(${unit.id})` },
        { icon: '📜', name: '故事卷轴', act: `Games.story(UNITS.find(u=>u.id===${unit.id}))` },
        { icon: '🐉', name: 'Boss 战试炼', act: `Games.boss(UNITS.find(u=>u.id===${unit.id}))`, boss: true },
        { icon: '🕳️', name: '错题矿洞', act: `Games.reviewCave()` }
      ];
    }

    const btns = activities.map(a => `
      <button class="act-btn ${a.primary ? 'act-primary' : ''} ${a.boss ? 'act-boss' : ''}" onclick="Audio2.click();${a.act}">
        <span class="act-icon">${a.icon}</span>
        <span class="act-name">${a.name}</span>
      </button>`).join('');

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.map()">← 地图</button>
        <div class="topbar-title">${unit.icon} ${unit.biome} · ${unit.name}</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="biome-mission">🎯 ${UI.esc(unit.missionZh)} · <i>${UI.esc(unit.mission)}</i></div>
      <div class="biome-acts">${btns}</div>
    `, 'biome-screen');
  }

  function changeBook() {
    UI.screen(`
      <div class="topbar"><div class="topbar-title">🔄 更换</div></div>
      <p class="hint">要换什么？</p>
      <div class="center-btns">
        <button class="btn btn-big btn-primary" onclick="Audio2.click();Main.books()">📚 换教材</button>
        <button class="btn btn-big" onclick="Audio2.click();Main.worlds()">🎮 换游戏世界</button>
        <button class="btn btn-big" onclick="Audio2.click();Main.map()">↩️ 返回地图</button>
      </div>
    `);
  }

  return { home, books, worlds, map, biome, changeBook, load };
})();

window.Main = Main;

document.addEventListener('DOMContentLoaded', () => {
  Main.load();
  Main.home();
});
