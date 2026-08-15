/* ============================================================
   EduQuest · coop.js
   双人成行主题协作闯关：Cody 和 May 要一起过一扇扇门。
   每扇门需要两人各答对一道英语题才能打开，答错要重来（卡关）。
   全部通关 → 胜利，解锁下一单元。
   ============================================================ */
'use strict';

const Coop = (() => {
  let unit = null, total = 0, running = false;
  let codyWords = [], mayWords = [];

  function play(u) {
    unit = u; running = true;
    total = Math.min(unit.vocab.length, 8);
    codyWords = []; mayWords = [];
    for (let i = 0; i < total; i++) { codyWords.push(Quiz.makeItem(unit)); mayWords.push(Quiz.makeItem(unit)); }

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Coop.quit()">← 返回</button>
        <div class="topbar-title">👫 ${unit.icon} ${unit.name} · 双人成行</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="coop-hud">
        <span class="coop-prog" id="coopProg">🚪 0/${total}</span>
        <span class="coop-energy" id="coopEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="coop-stage" id="coopStage">
        <div class="coop-cody" id="coopCody">🧑<span>Cody</span></div>
        <div class="coop-may" id="coopMay">👩<span>May</span></div>
        <div class="coop-gates" id="coopGates"></div>
      </div>
      <p class="hint coop-tip">Cody 和 May 要合作！每扇门两人各答一道题，都答对才能打开一起前进。答错要重来哦。</p>
    `, 'coop-screen');

    const gates = document.getElementById('coopGates');
    for (let i = 0; i < total; i++) {
      const g = document.createElement('div');
      g.className = 'coop-gate';
      g.style.left = (14 + i * (72 / Math.max(1, total - 1))) + '%';
      g.dataset.i = i;
      g.textContent = '🚪';
      gates.appendChild(g);
    }

    runLoop();
  }

  async function runLoop() {
    for (let i = 0; i < total; i++) {
      if (!running) return;
      const gate = document.querySelector(`.coop-gate[data-i="${i}"]`);
      if (gate) { gate.classList.add('coop-active'); gate.textContent = '🔒'; }
      // 玩家 1：Cody
      if (!running) return;
      await Quiz.ask(codyWords[i].item, {
        title: '🧑 Cody 先来！', sub: '帮 Cody 答对，才能一起推门', cls: 'coop-q'
      });
      award(codyWords[i]);
      if (!running) return;
      // 玩家 2：May
      await Quiz.ask(mayWords[i].item, {
        title: '👩 轮到 May！', sub: 'May 也答对，门就打开啦', cls: 'coop-q'
      });
      award(mayWords[i]);
      if (!running) return;
      // 开门
      if (gate) { gate.classList.add('coop-open'); gate.textContent = '✅'; }
      Audio2.pop();
      const cody = document.getElementById('coopCody'), may = document.getElementById('coopMay');
      const pos = 8 + ((i + 1) / total) * 78;
      cody.style.left = pos + '%'; may.style.left = (pos + 6) + '%';
      document.getElementById('coopProg').textContent = `🚪 ${i + 1}/${total}`;
      document.getElementById('coopEnergy').textContent = `⚡ ${Save.book.energy[unit.id] || 0}`;
      await new Promise(r => setTimeout(r, 650));
    }
    if (running) finishWin();
  }

  function award(m) {
    const isNew = m.vi >= 0 ? Save.collect(unit.id, m.vi) : false;
    Save.addEnergy(unit.id, isNew ? 2 : 1);
    Save.addEmeralds(1);
    if (m.vi >= 0) Speech2.say(unit.vocab[m.vi].en);
  }

  function finishWin() {
    running = false;
    Save.addEmeralds(10);
    if (unit.id < UNITS.length) Save.unlock(unit.id + 1);
    Audio2.win();
    UI.screen(`
      <div class="report">
        <div class="report-head">🤝 合作成功！</div>
        <p>Cody 和 May 一起打开了全部 ${total} 扇门，配合得太棒了！</p>
        <p class="report-bonus">+10 💎 &nbsp; +2⚡/词</p>
        ${unit.id < UNITS.length ? `<p>解锁了下一单元【${UNITS.find(x => x.id === unit.id + 1).name}】！</p>` : '<p>全部通关，太厉害了！</p>'}
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="Coop.play(UNITS.find(u=>u.id===${unit.id}))">🔁 再玩一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>
    `, 'coop-screen');
  }

  function quit() {
    running = false;
    if (document.querySelector('.overlay')) UI.closeOverlay(document.querySelector('.overlay'));
    Main.biome(unit.id);
  }

  return { play, quit };
})();

window.Coop = Coop;
