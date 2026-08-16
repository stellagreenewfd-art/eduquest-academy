/* ============================================================
   EduQuest · coop.js  —  双人成行（协作闯关）
   Cody(左半屏控制) 与 May(右半屏控制) 必须一起到中央平台，
   跷跷板才搭桥、门才开。到门后两人各答一题，都答对才通关。
   真实「配合」机制：单人再快也得把伙伴一起带过来。
   ============================================================ */
'use strict';

const Coop = (() => {
  let unit = null, g = null, paused = false, running = false, asking = false, done = false;
  let codyX, mayX, codyT, mayT, sx, groundY, bothOn = false, walking = false, note = '';

  function play(u) {
    GameKit.cleanup();
    unit = u; running = true; paused = false; asking = false; done = false; bothOn = false; walking = false; note = '点左边带 Cody、点右边带 May，一起到中间！';
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Coop.quit()">← 返回</button>
        <div class="topbar-title">👫 ${unit.icon} ${unit.name} · 双人成行</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="game-hud">
        <span class="gh-cody">🟦 Cody</span>
        <span class="gh-note" id="coopNote">${note}</span>
        <span class="gh-may">May 🟪</span>
        <span class="gh-energy" id="coopEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="game-stage" id="coopStage"></div>
      <p class="hint game-tip">左半屏点一下让 Cody 往中间走，右半屏点一下让 May 往中间走。两个人都要站上中央跷跷板，桥才会搭好、门才会开。然后两人各答一题，都答对才通关！</p>
    `, 'coop-screen');
    g = GameKit.canvas('coopStage');
    groundY = g.H * 0.78; sx = g.W * 0.5;
    codyX = g.W * 0.08; mayX = g.W * 0.92; codyT = codyX; mayT = mayX;
    GameKit.bindInput(g.cv, {
      down: p => {
        if (asking || !running || walking || done) return;
        if (bothOn) { goDoor(); return; }
        if (p.x < g.W / 2) codyT = Math.min(sx - 34, codyT + g.W * 0.12);
        else mayT = Math.max(sx + 34, mayT - g.W * 0.12);
      }
    });
    GameKit.loop(update);
  }

  function update(dt) {
    if (!running || paused || asking) return;
    const sp = g.W * 0.5;
    codyX += (codyT - codyX) * Math.min(1, dt * 6);
    mayX += (mayT - mayX) * Math.min(1, dt * 6);

    const cAt = Math.abs(codyX - (sx - 34)) < 6, mAt = Math.abs(mayX - (sx + 34)) < 6;
    if (!walking) {
      if (cAt && mAt) {
        if (!bothOn) { bothOn = true; note = '🤝 两人都到了！桥搭好了，点一下一起进门'; UI.toast('配合成功！点屏幕一起进门', 1500); }
      } else if (cAt || mAt) {
        note = (cAt ? 'Cody 到了，等 May' : 'May 到了，等 Cody') + ' 一起来！';
      } else note = '点左边带 Cody、点右边带 May，一起到中间！';
    }
    if (walking) {
      codyT = sx; mayT = sx;
      if (Math.abs(codyX - sx) < 5 && Math.abs(mayX - sx) < 5 && !done) { done = true; gate(); }
    }
    const n = document.getElementById('coopNote'); if (n) n.textContent = note;
    render();
  }

  function goDoor() { walking = true; note = '🚪 一起进门…'; }

  function gate() {
    asking = true; paused = true;
    GameKit.quizGate(unit, { title: '🟦 Cody 先答！', sub: '两人都要答对，门才开', cls: 'coop-q' })
      .then(m => { GameKit.award(unit, m.vi); return GameKit.quizGate(unit, { title: '🟪 May 来答！', sub: '两人都答对，门就开啦', cls: 'coop-q' }); })
      .then(m => { GameKit.award(unit, m.vi); GameKit.setEnergy(unit.id, 'coopEnergy'); asking = false; paused = false; win(); });
  }

  function render() {
    const ctx = g.ctx, W = g.W, H = g.H;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#2a2140'; ctx.fillRect(0, 0, W, H);
    // 左右平台色
    ctx.fillStyle = 'rgba(80,140,255,0.25)'; ctx.fillRect(0, groundY, W * 0.5, H - groundY);
    ctx.fillStyle = 'rgba(220,120,220,0.25)'; ctx.fillRect(W * 0.5, groundY, W * 0.5, H - groundY);
    ctx.fillStyle = '#5a4632'; ctx.fillRect(0, groundY, W, H - groundY);
    // 中央柱子 + 门
    ctx.fillStyle = '#6b5640'; ctx.fillRect(sx - 8, groundY - H * 0.42, 16, H * 0.42);
    ctx.fillStyle = bothOn ? '#ffd34d' : '#888';
    ctx.fillRect(sx - 26, groundY - H * 0.42, 52, H * 0.18);
    ctx.font = '26px serif'; ctx.textAlign = 'center';
    ctx.fillText(bothOn ? '🚪' : '🔒', sx, groundY - H * 0.42 + 26);
    // 跷跷板
    const tilt = !bothOn ? (codyX > sx - 120 ? -0.18 : mayX < sx + 120 ? 0.18 : 0) : 0;
    ctx.save(); ctx.translate(sx, groundY - 6); ctx.rotate(tilt);
    ctx.fillStyle = '#c98a3a'; ctx.fillRect(-70, -6, 140, 12); ctx.restore();
    // 桥（bothOn 时显示）
    if (bothOn) { ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, groundY - 12); ctx.lineTo(sx, groundY - H * 0.42); ctx.stroke(); }
    // 角色
    ctx.font = '34px serif';
    ctx.fillText('🧑‍🚀', codyX, groundY - 6);
    ctx.fillText('🧑‍🎤', mayX, groundY - 6);
    // 名字
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#9cf';
    ctx.fillText('Cody', codyX, groundY + 18);
    ctx.fillStyle = '#f9c'; ctx.fillText('May', mayX, groundY + 18);
  }

  function win() {
    running = false;
    GameKit.win(unit, { head: '🏆 携手通关！', text: 'Cody 和 May 配合打开了门，一起完成了闯关！', replay: `Coop.play(UNITS.find(u=>u.id===${unit.id}))` });
  }
  function quit() { running = false; GameKit.cleanup(); Main.biome(unit.id); }

  return { play, quit };
})();

window.Coop = Coop;
