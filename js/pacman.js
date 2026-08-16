/* ============================================================
   EduQuest · pacman.js  —  吃豆人（迷宫）
   瓦片迷宫 · 吃光豆子 · 4 幽灵 AI（追逐/受惊乱跑）· 能量豆吃幽灵。
   英语题作为「⚡能量冲刺」：答对变无敌加速清场。吃光豆子胜利。
   ============================================================ */
'use strict';

const PacMan = (() => {
  const LAYOUT = [
    '###################',
    '#........#........#',
    '#o##.###.#.###.##o#',
    '#.##.###.#.###.##.#',
    '#.................#',
    '#.##.#.#####.#.##.#',
    '#....#...#...#....#',
    '####.###.#.###.####',
    '#....#.......#....#',
    '####.#.#####.#.####',
    '#....#...#...#....#',
    '#.##.###.#.###.##.#',
    '#o...............o#',
    '#.##.###.#.###.##.#',
    '###################'
  ];
  const ROWS = LAYOUT.length, COLS = LAYOUT[0].length;
  let unit = null, g = null, paused = false, running = false, asking = false;
  let maze = [], TS = 24, offX = 0, offY = 0;
  let pac, ghosts = [], dots = 0, score = 0, lives = 3, fright = 0, pStart = null;

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false; fright = 0;
    score = 0; lives = 3; pStart = null;
    maze = LAYOUT.map(r => r.split(''));
    dots = 0; maze.forEach(r => r.forEach(c => { if (c === '.' || c === 'o') dots++; }));
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="PacMan.quit()">← 返回</button>
        <div class="topbar-title">🟡 ${unit.icon} ${unit.name} · 吃豆人</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-lives" id="pmLives">❤️ ${lives}</span>
        <span class="gh-score" id="pmScore">🟡 ${score}</span>
        <span class="gh-energy" id="pmEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="pmStage"></div>
      <div class="pm-bar">
        <button class="pm-rush" id="pmRush">⚡ 能量冲刺</button>
      </div>
      <p class="hint game-tip">方向键或滑动控制🟡吃豆人，吃光所有豆子就赢！被👻碰到会丢命，吃下⚡能量豆可反吃幽灵。卡关点⚡能量冲刺，答对英语变无敌清场。</p>
    `, 'pm-screen');
    g = GameKit.canvas('pmStage');
    TS = Math.floor(Math.min(g.W / COLS, g.H / ROWS));
    offX = (g.W - TS * COLS) / 2; offY = (g.H - TS * ROWS) / 2;
    pac = mkEnt(9, 12, 110);
    ghosts = [
      mkGhost(9, 8, '👻'), mkGhost(7, 8, '👾'), mkGhost(11, 8, '🤡'), mkGhost(9, 9, '💀')
    ];
    bind();
    setTimeout(() => { const b = document.getElementById('pmRush'); if (b) b.onclick = () => rush(); }, 0);
    GameKit.loop(update);
  }

  function mkEnt(col, row, speed) { return { col, row, x: 0, y: 0, dir: { x: 0, y: 0 }, want: { x: 0, y: 0 }, speed, start: { col, row } }; }
  function mkGhost(col, row, icon) { const e = mkEnt(col, row, 95); e.icon = icon; e.fright = false; return e; }
  function center(col, row) { return { x: offX + (col + 0.5) * TS, y: offY + (row + 0.5) * TS }; }
  function open(col, row) { if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return false; return maze[row][col] !== '#'; }
  function setPos(e) { const c = center(e.col, e.row); e.x = c.x; e.y = c.y; }

  function bind() {
    GameKit.bindInput(g.cv, {
      down: p => { pStart = p; },
      up: p => {
        if (!pStart) return; const dx = p.x - pStart.x, dy = p.y - pStart.y; pStart = null;
        if (Math.abs(dx) > Math.abs(dy)) pac.want = { x: dx > 0 ? 1 : -1, y: 0 };
        else pac.want = { x: 0, y: dy > 0 ? 1 : -1 };
      }
    });
    GameKit.bindKeys({
      'ArrowLeft': () => pac.want = { x: -1, y: 0 }, 'ArrowRight': () => pac.want = { x: 1, y: 0 },
      'ArrowUp': () => pac.want = { x: 0, y: -1 }, 'ArrowDown': () => pac.want = { x: 0, y: 1 }
    });
  }

  function move(e, dt) {
    const c = center(e.col, e.row);
    const atC = Math.abs(e.x - c.x) < 2 && Math.abs(e.y - c.y) < 2;
    if (atC) {
      e.x = c.x; e.y = c.y;
      if (e === pac) {
        if ((e.want.x || e.want.y) && open(e.col + e.want.x, e.row + e.want.y)) e.dir = e.want;
      } else {
        e.dir = ghostChoose(e);
      }
      if (!open(e.col + e.dir.x, e.row + e.dir.y)) e.dir = { x: 0, y: 0 };
    }
    e.x += e.dir.x * e.speed * dt; e.y += e.dir.y * e.speed * dt;
    e.col = GameKit.clamp(Math.round((e.x - offX) / TS - 0.5), 0, COLS - 1);
    e.row = GameKit.clamp(Math.round((e.y - offY) / TS - 0.5), 0, ROWS - 1);
  }

  function ghostChoose(e) {
    const opts = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
      .filter(d => open(e.col + d.x, e.row + d.y) && !(d.x === -e.dir.x && d.y === -e.dir.y && (e.dir.x || e.dir.y)));
    if (!opts.length) return { x: -e.dir.x, y: -e.dir.y };
    if (fright > 0) return opts[Math.floor(Math.random() * opts.length)];
    // 朝 pac 最接近
    let best = opts[0], bd = 1e9;
    opts.forEach(d => { const nc = e.col + d.x, nr = e.row + d.y; const dist = Math.abs(nc - pac.col) + Math.abs(nr - pac.row); if (dist < bd) { bd = dist; best = d; } });
    return best;
  }

  function update(dt) {
    if (!running || paused || asking) return;
    if (fright > 0) { fright -= dt; if (fright <= 0) ghosts.forEach(g1 => g1.fright = false); }
    move(pac, dt);
    ghosts.forEach(g1 => { g1.speed = fright > 0 ? 60 : 95; move(g1, dt); });

    // 吃豆
    const pc = maze[pac.row][pac.col];
    if (pc === '.') { maze[pac.row][pac.col] = ' '; dots--; score += 10; upScore(); Audio2.pop(); }
    else if (pc === 'o') { maze[pac.row][pac.col] = ' '; dots--; score += 50; fright = 7; ghosts.forEach(g1 => g1.fright = true); upScore(); Audio2.coin(); }

    // 幽灵碰撞
    ghosts.forEach(g1 => {
      if (Math.abs(g1.x - pac.x) < TS * 0.6 && Math.abs(g1.y - pac.y) < TS * 0.6) {
        if (fright > 0) { g1.col = g1.start.col; g1.row = g1.start.row; setPos(g1); score += 200; upScore(); Audio2.good(); }
        else hit();
      }
    });

    if (dots <= 0) { win(); return; }
    render();
  }

  function hit() {
    lives--; Audio2.bad();
    document.getElementById('pmLives').textContent = '❤️ ' + Math.max(0, lives);
    if (lives <= 0) { running = false; GameKit.fail(unit, { head: '💥 被幽灵抓到', text: '三条命用完啦，吃⚡能量豆反吃幽灵会更安全，再试一次！', replay: `PacMan.play(UNITS.find(u=>u.id===${unit.id}))` }); return; }
    pac.col = 9; pac.row = 12; setPos(pac); pac.dir = { x: 0, y: 0 };
    ghosts.forEach(g1 => { g1.col = g1.start.col; g1.row = g1.start.row; setPos(g1); });
    UI.toast('💔 被抓了，回到起点！', 1000);
  }
  function upScore() { const e = document.getElementById('pmScore'); if (e) e.textContent = '🟡 ' + score; }

  function rush() {
    if (asking || !running) return;
    asking = true; paused = true;
    GameKit.quizGate(unit, {
      title: '⚡ 能量冲刺！答对变无敌',
      sub: '答对后短暂无敌加速，幽灵也怕你',
      cls: 'pm-q'
    }).then(m => {
      GameKit.award(unit, m.vi);
      GameKit.setEnergy(unit.id, 'pmEnergy');
      fright = 8; ghosts.forEach(g1 => g1.fright = true); pac.speed = 150;
      setTimeout(() => { pac.speed = 110; }, 8000);
      asking = false; paused = false;
      UI.toast('⚡ 无敌冲刺！', 1400);
    });
  }

  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // 墙
    ctx.fillStyle = '#1b3aa0';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (maze[r][c] === '#') ctx.fillRect(offX + c * TS + 1, offY + r * TS + 1, TS - 2, TS - 2);
    }
    // 豆 / 能量
    ctx.fillStyle = '#ffd27a';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const t = maze[r][c]; if (t === '.') { ctx.beginPath(); ctx.arc(offX + (c + 0.5) * TS, offY + (r + 0.5) * TS, 3, 0, 7); ctx.fill(); }
      else if (t === 'o') { ctx.beginPath(); ctx.arc(offX + (c + 0.5) * TS, offY + (r + 0.5) * TS, 7, 0, 7); ctx.fill(); }
    }
    // 幽灵（原创，受惊变蓝脸）
    const gc = ['#ff5b5b', '#5bc8ff', '#ff9d5b', '#ff5bd0'];
    ghosts.forEach((g1, i) => { Sprites.ghost(ctx, g1.x, g1.y, TS * 0.42, gc[i % 4], fright > 0); });
    // 吃豆人（开口朝运动方向）
    Sprites.pacman(ctx, pac.x, pac.y, TS * 0.44, pac.dir.x, pac.dir.y);
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 豆子清空！', text: `你吃光了迷宫里所有豆子，得分 ${score}！`, replay: `PacMan.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  return { play, quit };
})();

window.PacMan = PacMan;
