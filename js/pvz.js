/* ============================================================
   EduQuest · pvz.js
   植物大战僵尸主题闯关：僵尸从右向左进攻，答对英语才能发射豌豆消灭它。
   答错必须再试（卡关）。清空本关所有僵尸 → 胜利，解锁下一单元。
   ============================================================ */
'use strict';

const PVZ = (() => {
  let timer = null, running = false, paused = false;
  let unit = null, zombies = [], total = 0, defeated = 0, lives = 3;
  let asking = false;

  function pickWords(u, n) {
    const items = [];
    for (let i = 0; i < n; i++) {
      const m = Quiz.makeItem(u);
      items.push(m);
    }
    return items;
  }

  function play(u) {
    unit = u;
    running = true; paused = false; asking = false; defeated = 0; lives = 3;
    total = Math.min(unit.vocab.length, 9);
    const items = pickWords(unit, total);
    zombies = items.map((m, i) => ({
      id: i, lane: i % 5, prog: Math.random() * 18,
      item: m.item, vi: m.vi, dead: false
    }));

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="PVZ.quit()">← 返回</button>
        <div class="topbar-title">🧟 ${unit.icon} ${unit.name} · 植物保卫战</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="pvz-hud">
        <span class="pvz-lives" id="pvzLives">${'🌻'.repeat(lives)}</span>
        <span class="pvz-prog" id="pvzProg">🌱 0/${total}</span>
        <span class="pvz-energy" id="pvzEnergy">⚡ ${Save.book.energy[unit.id] || 0}</span>
      </div>
      <div class="pvz-stage" id="pvzStage">
        <div class="pvz-house">🏠</div>
        <div class="pvz-shooter">🌻<br>🔫</div>
      </div>
      <p class="hint pvz-tip">僵尸来啦！用英语答对问题，发射豌豆把它们全部消灭，保护房子！答错要重来哦。</p>
    `, 'pvz-screen');

    const stage = document.getElementById('pvzStage');
    zombies.forEach(z => {
      const el = document.createElement('div');
      el.className = 'pvz-zombie';
      el.dataset.id = z.id;
      el.textContent = ['🧟', '🧟‍♂️', '🧟‍♀️', '🦴', '👻'][z.id % 5];
      el.style.top = (8 + z.lane * 17) + '%';
      el.style.left = '100%';
      stage.appendChild(el);
      z.el = el;
    });

    let last = performance.now();
    timer = setInterval(() => {
      if (!running) return;
      const now = performance.now();
      const dt = now - last; last = now;
      if (paused || asking) { return; }
      const speed = 100 / 16000; // 约 16 秒走完
      let closest = null;
      zombies.forEach(z => {
        if (z.dead) return;
        z.prog += speed * dt;
        if (z.el) z.el.style.left = Math.max(6, 100 - z.prog) + '%';
        if (!closest || z.prog > closest.prog) closest = z;
        if (z.prog >= 100) houseHit(z);
      });
      if (running && !asking && zombies.some(z => !z.dead)) {
        // 给最近僵尸出题
        askZombie(closest);
      }
    }, 120);
  }

  function askZombie(z) {
    if (!z || z.dead) return;
    asking = true; paused = true;
    Quiz.ask(z.item, {
      title: '🧟 僵尸进攻！用英语击退它',
      sub: '答对发射豌豆，答错僵尸继续逼近！',
      cls: 'pvz-q'
    }).then(() => {
      killZombie(z);
      asking = false; paused = false;
      maybeWin();
    });
  }

  function killZombie(z) {
    z.dead = true;
    if (z.el) {
      z.el.classList.add('pvz-die');
      const pea = document.createElement('div');
      pea.className = 'pvz-pea';
      pea.textContent = '🟢';
      z.el.parentNode.appendChild(pea);
      setTimeout(() => { if (z.el) z.el.remove(); pea.remove(); }, 500);
    }
    defeated++;
    if (z.vi >= 0) {
      const isNew = Save.collect(unit.id, z.vi);
      Save.addEnergy(unit.id, isNew ? 2 : 1);
      Speech2.say(unit.vocab[z.vi].en);
    } else {
      Save.addEnergy(unit.id, 1);
    }
    Save.addEmeralds(2);
    Audio2.pop();
    document.getElementById('pvzProg').textContent = `🌱 ${defeated}/${total}`;
    document.getElementById('pvzEnergy').textContent = `⚡ ${Save.book.energy[unit.id] || 0}`;
  }

  function houseHit(z) {
    if (z.dead) return;
    z.dead = true;
    if (z.el) z.el.remove();
    lives--;
    Audio2.bad();
    UI.toast('🧟 僵尸吃到房子了！少了一朵向日葵！', 2200);
    document.getElementById('pvzLives').textContent = lives > 0 ? '🌻'.repeat(lives) : '💀';
    if (lives <= 0) gameOver();
  }

  function maybeWin() {
    if (defeated >= total && lives > 0) win();
  }

  function win() {
    running = false; clearInterval(timer);
    Save.addEmeralds(10);
    if (unit.id < UNITS.length) Save.unlock(unit.id + 1);
    Audio2.win();
    UI.screen(`
      <div class="report">
        <div class="report-head">🏆 守卫成功！</div>
        <p>你用英语击退了全部 ${total} 只僵尸，保护了房子！</p>
        <p class="report-bonus">+10 💎 &nbsp; +2⚡/词</p>
        ${unit.id < UNITS.length ? `<p>解锁了下一单元【${UNITS.find(x => x.id === unit.id + 1).name}】！</p>` : '<p>全部通关，太厉害了！</p>'}
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="PVZ.play(UNITS.find(u=>u.id===${unit.id}))">🔁 再玩一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>
    `, 'pvz-screen');
  }

  function gameOver() {
    running = false; clearInterval(timer);
    UI.closeOverlay(document.querySelector('.overlay'));
    UI.screen(`
      <div class="report">
        <div class="report-head">🧟 房子被攻破了…</div>
        <p>别灰心！复习一下本单元的单词，再来守卫一次吧。</p>
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="PVZ.play(UNITS.find(u=>u.id===${unit.id}))">🔁 再来一次</button>
          <button class="btn btn-big" onclick="Games.dex(${unit.id})">📖 看单词图鉴</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>
    `, 'pvz-screen');
  }

  function quit() {
    running = false; clearInterval(timer);
    if (window.AskOverlay && document.querySelector('.overlay')) UI.closeOverlay(document.querySelector('.overlay'));
    Main.biome(unit.id);
  }

  return { play, quit };
})();

window.PVZ = PVZ;
