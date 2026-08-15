/* ============================================================
   EduQuest · playquiz.js
   共享「先玩一段，再在检查点出题」引擎 —— 解决题目过密问题。
   核心节奏：每段自由游玩 freeMs（默认 12s）→ 检查点弹出阻塞答题（答错卡关）
            → 答对后继续下一段。共 total 段，全部通过即胜利。
   供 Mario / Coop / 愤怒小鸟 / 神庙逃亡 / 糖果传奇 / 吃豆人 复用，
   仅靠 theme 皮肤（背景/角色/装饰/文案）区分游戏，机制统一、稳健。
   ============================================================ */
'use strict';

const PlayQuiz = (() => {
  let timer = null, running = false, paused = false;
  let unit = null, theme = null, cfg = null;
  let legProgress = 0, legTime = 0, checkpoints = 0, total = 0;

  const TRAIL_DECOR = {
    race:  ['☁️', '🌸', '⭐', '🍄', '🌿', '🐤'],
    siege: ['🐷', '🧱', '🌳', '🪨', '💣'],
    match: ['🍬', '🍭', '🍫', '🍬', '⭐'],
    maze:  ['·', '·', '👻', '🍒', '·', '🌟'],
    coop:  ['💞', '🌟', '🤝', '✨', '💫']
  };

  function hop(el) {
    if (!el) return;
    el.classList.remove('pq-hop'); void el.offsetWidth; el.classList.add('pq-hop');
  }

  function run(opts) {
    unit = opts.unit; theme = opts.theme;
    running = true; paused = false; legProgress = 0; legTime = 0; checkpoints = 0;
    total = opts.total || Math.max(4, Math.min(unit.vocab.length, 7));
    cfg = Object.assign({ freeMs: 12000, coop: false }, opts.cfg || {});

    const decor = (TRAIL_DECOR[theme.trail] || TRAIL_DECOR.race);
    const flags = Array.from({ length: total }, (_, i) =>
      `<div class="pq-flag" data-f="${i}" style="left:${((i + 1) / total) * 90}%">🚩</div>`).join('');

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="PlayQuiz.quit()">← 返回</button>
        <div class="topbar-title">${theme.icon} ${unit.icon} ${unit.name} · ${theme.name}</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="pq-hud">
        <span class="pq-prog" id="pqProg">${theme.checkLabel ? theme.checkLabel(checkpoints, total) : ('🚩 ' + checkpoints + '/' + total)}</span>
        <span class="pq-energy" id="pqEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="pq-stage ${theme.trail}" id="pqStage" style="background:${theme.bg}">
        <div class="pq-track"></div>
        ${flags}
        <div class="pq-player" id="pqPlayer" style="left:4%">${theme.player}</div>
        <div class="pq-goal" id="pqGoal" style="left:94%">${theme.goal || '🏁'}</div>
        <div class="pq-decor" id="pqDecor"></div>
      </div>
      <p class="hint pq-tip">${theme.tip}</p>
    `, 'pq-screen');

    // 漂浮装饰
    const decorEl = document.getElementById('pqDecor');
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('div');
      d.className = 'pq-float';
      d.textContent = decor[i % decor.length];
      d.style.left = (5 + Math.random() * 88) + '%';
      d.style.top = (10 + Math.random() * 70) + '%';
      d.style.animationDelay = (Math.random() * 3) + 's';
      decorEl.appendChild(d);
    }
    // 点击舞台 = 自由游玩反馈
    const stage = document.getElementById('pqStage');
    stage.onclick = (e) => {
      if (paused || !running) return;
      if (theme.trail === 'siege') launchBird(stage, e);
      else if (theme.trail === 'match') popCandy(stage, e);
      else if (theme.trail === 'maze') eatDot(stage, e);
      else hop(document.getElementById('pqPlayer'));
    };

    startLeg();
  }

  function startLeg() {
    if (!running) return;
    legProgress = 0; legTime = 0; paused = false;
    const player = document.getElementById('pqPlayer');
    if (player) player.style.left = '4%';
    timer = setInterval(tick, 100);
  }

  function tick() {
    if (!running || paused) return;
    legTime += 100;
    legProgress = Math.min(1, legTime / cfg.freeMs);
    const player = document.getElementById('pqPlayer');
    if (player) player.style.left = (4 + legProgress * 86) + '%';
    if (legProgress >= 1) checkpoint();
  }

  async function checkpoint() {
    if (!running) return;
    paused = true; clearInterval(timer);
    const askOne = () => { const m = Quiz.makeItem(unit); return Quiz.ask(m.item, {
      title: theme.qTitle || '🤔 答对才能继续',
      sub: theme.qSub || '用英语答题，答对往前冲！',
      cls: 'pq-q'
    }).then(() => m.vi); };
    const vi1 = await askOne();
    let vi2 = -1;
    // 协作模式：第二人再答一题
    if (cfg.coop) vi2 = await askOne();

    checkpoints++;
    award(vi1, vi2);
    const flag = document.querySelector(`.pq-flag[data-f="${checkpoints - 1}"]`);
    if (flag) { flag.textContent = '✅'; }
    const progEl = document.getElementById('pqProg');
    if (progEl) progEl.textContent = theme.checkLabel ? theme.checkLabel(checkpoints, total) : ('🚩 ' + checkpoints + '/' + total);
    if (checkpoints >= total) { win(); return; }
    UI.toast(theme.passText || '答对啦！继续前进 🎉', 1200);
    await new Promise(r => setTimeout(r, 700));
    startLeg();
  }

  function award(vi1, vi2) {
    [vi1, vi2].forEach(vi => {
      if (vi >= 0) {
        const isNew = Save.collect(unit.id, vi);
        Save.addEnergy(unit.id, isNew ? 2 : 1);
        if (isNew) Speech2.say(unit.vocab[vi].en);
      } else {
        Save.addEnergy(unit.id, 1);
      }
    });
    Save.addEmeralds(2);
    const e = document.getElementById('pqEnergy');
    if (e) e.textContent = '⚡ ' + (Save.book.energy[unit.id] || 0);
  }

  function win() {
    running = false; clearInterval(timer);
    const player = document.getElementById('pqPlayer');
    if (player) { player.textContent = '🏆'; player.style.left = '90%'; }
    Save.addEmeralds(10);
    if (unit.id < UNITS.length) Save.unlock(unit.id + 1);
    Audio2.win();
    UI.screen(`
      <div class="report">
        <div class="report-head">🏆 ${theme.winTitle || '通关啦！'}</div>
        <p>${theme.winText || ('你完成了全部 ' + total + ' 个关卡，英语越来越棒！')}</p>
        <p class="report-bonus">+10 💎 &nbsp; +2⚡/关</p>
        ${unit.id < UNITS.length ? `<p>解锁了下一单元【${UNITS.find(x => x.id === unit.id + 1).name}】！</p>` : '<p>全部通关，太厉害了！</p>'}
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="PlayQuiz.replay()">🔁 再玩一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>
    `, 'pq-screen');
  }

  function launchBird(stage, e) {
    const b = document.createElement('div');
    b.className = 'pq-bird'; b.textContent = '🐦';
    b.style.left = '6%'; b.style.top = '60%';
    stage.appendChild(b);
    const tx = (e && e.offsetX) ? (e.offsetX / stage.clientWidth * 100) : 80;
    requestAnimationFrame(() => { b.style.left = tx + '%'; b.style.top = '20%'; });
    setTimeout(() => b.remove(), 600);
    Audio2.pop();
  }
  function popCandy(stage, e) {
    const c = document.createElement('div');
    c.className = 'pq-pop'; c.textContent = ['🍬', '✨', '⭐'][Math.floor(Math.random() * 3)];
    c.style.left = (e ? e.offsetX / stage.clientWidth * 100 : 50) + '%';
    c.style.top = (e ? e.offsetY / stage.clientHeight * 100 : 50) + '%';
    stage.appendChild(c);
    setTimeout(() => c.remove(), 500);
    Audio2.coin();
  }
  function eatDot(stage, e) {
    const p = document.getElementById('pqPlayer');
    if (p) { p.style.left = Math.min(90, (parseFloat(p.style.left) || 4) + 12) + '%'; }
    Audio2.pop();
  }

  function quit() {
    running = false; clearInterval(timer);
    if (document.querySelector('.overlay')) UI.closeOverlay(document.querySelector('.overlay'));
    Main.biome(unit.id);
  }
  function replay() { if (unit) run({ unit, theme, total, cfg }); }

  return { run, quit, replay };
})();

window.PlayQuiz = PlayQuiz;
