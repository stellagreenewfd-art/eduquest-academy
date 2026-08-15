/* ============================================================
   EduQuest · mario.js
   马里奥主题闯关：跑酷前进，撞上 ? 砖块用英语答题，答对顶碎砖块继续前进，
   答错要重来（卡关）。到达终点旗帜 → 胜利，解锁下一单元。
   ============================================================ */
'use strict';

const Mario = (() => {
  let unit = null, words = [], idx = 0, total = 0, running = false;

  function play(u) {
    unit = u; running = true; idx = 0;
    total = Math.min(unit.vocab.length, 10);
    words = [];
    for (let i = 0; i < total; i++) words.push(Quiz.makeItem(unit));

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Mario.quit()">← 返回</button>
        <div class="topbar-title">🍄 ${unit.icon} ${unit.name} · 超级玛丽闯关</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="mario-hud">
        <span class="mario-prog" id="marioProg">🍄 0/${total}</span>
        <span class="mario-energy" id="marioEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="mario-stage" id="marioStage">
        <div class="mario-sky"></div>
        <div class="mario-ground"></div>
        <div class="mario-flag" id="marioFlag" style="left:92%">🚩</div>
        <div class="mario-player" id="marioPlayer" style="left:4%">🏃</div>
        <div class="mario-blocks" id="marioBlocks"></div>
      </div>
      <p class="hint mario-tip">撞上 ? 砖块用英语答题，答对顶碎砖块继续跑，答错要重来！到达旗帜就通关！</p>
    `, 'mario-screen');

    const blocks = document.getElementById('marioBlocks');
    words.forEach((w, i) => {
      const b = document.createElement('div');
      b.className = 'mario-block';
      b.style.left = (12 + i * (78 / Math.max(1, total - 1))) + '%';
      b.textContent = '❓';
      b.dataset.i = i;
      blocks.appendChild(b);
    });

    setTimeout(nextBlock, 600);
  }

  function nextBlock() {
    if (!running) return;
    if (idx >= total) return finishWin();
    const w = words[idx];
    const blockEl = document.querySelector(`.mario-block[data-i="${idx}"]`);
    if (blockEl) { blockEl.textContent = '❗'; blockEl.classList.add('mario-bump'); }
    Quiz.ask(w.item, {
      title: '🍄 顶碎 ? 砖块！',
      sub: '用英语答对，马里奥才能继续前进',
      cls: 'mario-q'
    }).then(() => {
      // 顶碎砖块
      if (blockEl) { blockEl.textContent = '💥'; blockEl.classList.add('mario-break'); }
      Audio2.pop();
      const isNew = w.vi >= 0 ? Save.collect(unit.id, w.vi) : false;
      Save.addEnergy(unit.id, isNew ? 2 : 1);
      Save.addEmeralds(2);
      if (w.vi >= 0) Speech2.say(unit.vocab[w.vi].en);
      idx++;
      document.getElementById('marioProg').textContent = `🍄 ${idx}/${total}`;
      document.getElementById('marioEnergy').textContent = `⚡ ${Save.book.energy[unit.id] || 0}`;
      // 马里奥前进
      const player = document.getElementById('marioPlayer');
      player.style.left = (4 + (idx / total) * 84) + '%';
      player.textContent = '🏃';
      setTimeout(() => nextBlock(), 700);
    });
  }

  function finishWin() {
    running = false;
    const player = document.getElementById('marioPlayer');
    if (player) player.textContent = '🏆';
    Save.addEmeralds(10);
    if (unit.id < UNITS.length) Save.unlock(unit.id + 1);
    Audio2.win();
    UI.screen(`
      <div class="report">
        <div class="report-head">🏆 通关啦！</div>
        <p>马里奥冲过终点旗帜，本关 ${total} 个单词全部掌握！</p>
        <p class="report-bonus">+10 💎 &nbsp; +2⚡/词</p>
        ${unit.id < UNITS.length ? `<p>解锁了下一单元【${UNITS.find(x => x.id === unit.id + 1).name}】！</p>` : '<p>全部通关，太厉害了！</p>'}
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="Mario.play(UNITS.find(u=>u.id===${unit.id}))">🔁 再玩一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>
    `, 'mario-screen');
  }

  function quit() {
    running = false;
    if (document.querySelector('.overlay')) UI.closeOverlay(document.querySelector('.overlay'));
    Main.biome(unit.id);
  }

  return { play, quit };
})();

window.Mario = Mario;
