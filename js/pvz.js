/* ============================================================
   EduQuest · pvz.js
   植物大战僵尸主题闯关：僵尸缓慢从右向左进攻。孩子可以先自由「发射豌豆」
   攻击（纯游玩，无题目）把僵尸推回去；只有当僵尸逼近到攻击线（约 80%）时，
   才弹出英语答题，答对发射豌豆消灭它。答错循环重听、必须答对（卡关）。
   先玩后学，题目不再密集。清空本关所有僵尸 → 胜利。
   ============================================================ */
'use strict';

const PVZ = (() => {
  let timer = null, running = false, paused = false;
  let unit = null, zombies = [], total = 0, defeated = 0, lives = 3;
  let asking = false;
  const ATTACK = 80;          // 逼近到该进度才出题
  const CROSS = 26000;        // 从 0 到 100 约 26 秒（慢，给足游玩时间）

  function pickWords(u, n) {
    const items = [];
    for (let i = 0; i < n; i++) items.push(Quiz.makeItem(u));
    return items;
  }

  function play(u) {
    unit = u;
    running = true; paused = false; asking = false; defeated = 0; lives = 3;
    total = Math.min(unit.vocab.length, 9);
    zombies = pickWords(unit, total).map((m, i) => ({
      id: i, lane: i % 5, prog: Math.random() * 12,
      item: m.item, vi: m.vi, dead: false, hp: 3
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
        <div class="pvz-shooter" id="pvzShooter">🌻<br>🔫</div>
        <button class="pvz-fire" id="pvzFire">🌟 发射豌豆</button>
      </div>
      <p class="hint pvz-tip">僵尸慢慢走来啦！先点「发射豌豆」自由攻击把它们推回去；只有僵尸逼近房子时，才用英语答题消灭它。答错要重来哦。</p>
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

    document.getElementById('pvzFire').onclick = (e) => {
      Audio2.click();
      if (paused || !running) return;
      firePea(e);
    };
    stage.onclick = (e) => { if (!paused && running) firePea(e); };

    let last = performance.now();
    timer = setInterval(() => {
      if (!running) return;
      const now = performance.now();
      const dt = now - last; last = now;
      if (paused || asking) return;
      const speed = 100 / CROSS;
      let front = null;
      zombies.forEach(z => {
        if (z.dead) return;
        z.prog += speed * dt;
        if (z.el) z.el.style.left = Math.max(6, 100 - z.prog) + '%';
        if (!front || z.prog > front.prog) front = z;
      });
      // 有僵尸逼近攻击线 → 出题
      const near = zombies.find(z => !z.dead && z.prog >= ATTACK);
      if (near && running && !asking) askZombie(near);
    }, 120);
  }

  // 自由攻击：把最靠前僵尸推回一点（纯游玩，无题目）
  function firePea(e) {
    const front = zombies.filter(z => !z.dead).sort((a, b) => b.prog - a.prog)[0];
    if (!front) return;
    front.prog = Math.max(0, front.prog - 5);
    if (front.el) front.el.style.left = Math.max(6, 100 - front.prog) + '%';
    Audio2.pop();
    const stage = document.getElementById('pvzStage');
    const pea = document.createElement('div');
    pea.className = 'pvz-pea';
    pea.textContent = '🟢';
    pea.style.top = (8 + front.lane * 17 + 6) + '%';
    stage.appendChild(pea);
    setTimeout(() => pea.remove(), 500);
  }

  function askZombie(z) {
    if (!z || z.dead) return;
    asking = true; paused = true;
    Quiz.ask(z.item, {
      title: '🧟 僵尸逼近！用英语击退它',
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
      setTimeout(() => { if (z.el) z.el.remove(); }, 500);
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

  function quit() {
    running = false; clearInterval(timer);
    if (document.querySelector('.overlay')) UI.closeOverlay(document.querySelector('.overlay'));
    Main.biome(unit.id);
  }

  return { play, quit };
})();

window.PVZ = PVZ;
