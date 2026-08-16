/* ============================================================
   EduQuest · candcrush.js  —  糖果传奇（真实三消）
   8×8 糖果网格 · 相邻交换成 3 连消除 · 下落连锁 · 目标分数。
   英语题作为「🌟魔法糖果」：答对获得锤子，点任意糖果直接消除。
   ============================================================ */
'use strict';

const CandyCrush = (() => {
  const N = 8;
  const EMOJI = ['🍬', '🍭', '🍫', '🍩', '🍪', '🍒'];
  let unit = null, grid = [], cells = [], sel = null, busy = false;
  let score = 0, goal = 0, moves = 0, hammer = false, running = false;

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; busy = false; sel = null; hammer = false;
    score = 0; goal = 150 + Math.min(unit.vocab.length, 12) * 30; moves = 22;
    grid = [];
    for (let r = 0; r < N; r++) {
      grid[r] = [];
      for (let c = 0; c < N; c++) grid[r][c] = rand(r, c);
    }
    render(0);
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="CandyCrush.quit()">← 返回</button>
        <div class="topbar-title">🍬 ${unit.icon} ${unit.name} · 糖果传奇</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="cc-hud">
        <span class="cc-score" id="ccScore">⭐ ${score}/${goal}</span>
        <span class="cc-moves" id="ccMoves">🔄 ${moves} 步</span>
        <span class="cc-energy" id="ccEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="cc-grid" id="ccGrid"></div>
      <div class="cc-bar">
        <button class="cc-magic" id="ccMagic">🌟 魔法糖果</button>
      </div>
      <p class="hint cc-tip">交换相邻的糖果，连成 3 个以上就能消除得分！凑够 ⭐目标分 就赢。卡住时点🌟魔法糖果，答对英语拿锤子，点哪消哪。</p>
    `, 'cc-screen');
    const g = document.getElementById('ccGrid');
    g.style.setProperty('--n', N);
    cells = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const el = document.createElement('div');
      el.className = 'cc-cell'; el.dataset.r = r; el.dataset.c = c;
      el.onclick = () => onCell(r, c);
      g.appendChild(el); cells.push(el);
    }
    paint();
    document.getElementById('ccMagic').onclick = () => { if (running && !busy) magic(); };
  }

  function rand(r, c) {
    let v;
    do { v = Math.floor(Math.random() * EMOJI.length); }
    while ((c >= 2 && grid[r][c - 1] === v && grid[r][c - 2] === v) ||
           (r >= 2 && grid[r - 1] && grid[r - 1][c] === v && grid[r - 2][c] === v));
    return v;
  }
  function render() {}
  function paint() {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const el = cells[r * N + c];
      const v = grid[r][c];
      el.textContent = v == null ? '' : EMOJI[v];
      el.dataset.c = v == null ? '' : v;
      el.classList.toggle('sel', sel && sel.r === r && sel.c === c);
    }
  }

  function onCell(r, c) {
    if (busy || !running) return;
    if (hammer) { clearAt(r, c); return; }
    if (!sel) { sel = { r, c }; paint(); return; }
    if (sel.r === r && sel.c === c) { sel = null; paint(); return; }
    const adj = Math.abs(sel.r - r) + Math.abs(sel.c - c) === 1;
    if (!adj) { sel = { r, c }; paint(); return; }
    const a = sel; sel = null;
    swap(a.r, a.c, r, c);
    const m = findMatches();
    if (m.size === 0) { swap(a.r, a.c, r, c); paint(); Audio2.bad(); UI.toast('这两颗连不成线哦'); }
    else { moves--; updateHud(); resolve(m); }
  }

  function swap(r1, c1, r2, c2) {
    const t = grid[r1][c1]; grid[r1][c1] = grid[r2][c2]; grid[r2][c2] = t;
  }
  function clearAt(r, c) {
    hammer = false; busy = true;
    const m = new Set([r * N + c]);
    score += 20; updateHud();
    resolve(m);
  }

  function findMatches() {
    const m = new Set();
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const v = grid[r][c]; if (v == null) continue;
      if (c <= N - 3 && grid[r][c + 1] === v && grid[r][c + 2] === v) {
        let k = c; while (k < N && grid[r][k] === v) { m.add(r * N + k); k++; }
      }
      if (r <= N - 3 && grid[r + 1][c] === v && grid[r + 2][c] === v) {
        let k = r; while (k < N && grid[k][c] === v) { m.add(k * N + c); k++; }
      }
    }
    return m;
  }

  function resolve(initial) {
    busy = true;
    let set = initial;
    const step = () => {
      if (set.size === 0) { afterResolve(); return; }
      score += set.size * 10; updateHud();
      Audio2.pop();
      set.forEach(i => { const el = cells[i]; el.classList.add('cc-clear'); grid[Math.floor(i / N)][i % N] = null; });
      paint();
      setTimeout(() => {
        gravity();
        set.forEach(i => cells[i].classList.remove('cc-clear'));
        paint();
        setTimeout(() => {
          set = findMatches();
          if (set.size) step();
          else afterResolve();
        }, 180);
      }, 220);
    };
    step();
  }

  function gravity() {
    for (let c = 0; c < N; c++) {
      const col = [];
      for (let r = N - 1; r >= 0; r--) if (grid[r][c] != null) col.push(grid[r][c]);
      for (let r = N - 1; r >= 0; r--) grid[r][c] = col.length ? col.shift() : Math.floor(Math.random() * EMOJI.length);
    }
  }

  function afterResolve() {
    busy = false;
    if (score >= goal) { win(); return; }
    if (moves <= 0) { fail(); return; }
  }

  function updateHud() {
    document.getElementById('ccScore').textContent = `⭐ ${score}/${goal}`;
    document.getElementById('ccMoves').textContent = `🔄 ${moves} 步`;
  }

  function magic() {
    busy = true;
    GameKit.quizGate(unit, {
      title: '🌟 魔法糖果！答对拿锤子',
      sub: '答对后可点任意糖果直接消除（不消耗步数）',
      cls: 'cc-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      hammer = true; busy = false;
      GameKit.setEnergy(unit.id, 'ccEnergy');
      UI.toast('锤子到手！点一颗糖果消除它 🔨', 1600);
    });
  }

  function win() {
    if (!running) return;
    running = false;
    GameKit.win(unit, { head: '🏆 甜蜜通关！', text: `你把糖果连成了 ${score} 分，超过目标 ${goal} 分！`, replay: `CandyCrush.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function fail() {
    if (!running) return;
    running = false;
    GameKit.fail(unit, { head: '🔄 步数用完啦', text: `还差 ${goal - score} 分就达成目标，再试一次吧！`, replay: `CandyCrush.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  return { play, quit };
})();

window.CandyCrush = CandyCrush;
