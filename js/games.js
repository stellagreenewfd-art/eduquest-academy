/* ============================================================
   EduQuest · games.js
   学习活动：挖矿学单词 / 单词图鉴 / 合成台造句 / NPC任务 / 故事 / Boss战 /
   错题矿洞 / 建造区 / 家长中心
   进度统一走 Save.book（按教材隔离）；货币(绿宝石)走 Save.data
   ============================================================ */
'use strict';

const Games = (() => {

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr, n) { return shuffle(arr).slice(0, n); }
  function speakBtn(text, cls = '') {
    return `<button class="btn btn-speak ${cls}" onclick="Audio2.click();Speech2.say('${String(text).replace(/'/g, "\\'")}')">🔊 听</button>`;
  }
  const TIER_ORE = { common: "🪨 煤矿", core: "⛏️ 铁矿", challenge: "🟡 金矿", diamond: "💎 钻石矿" };

  /* ============ 挖矿学单词 ============ */
  function mining(unit) {
    const ores = shuffle(unit.vocab.map((v, i) => ({ v, i })));
    let grid = `<div class="mine-grid">` + ores.map(({ v, i }) => {
      const got = (Save.book.collected[unit.id] || []).includes(i);
      return `<div class="ore ${got ? 'ore-got' : ''}" data-i="${i}">
        <div class="ore-face">${got ? '✅' : '🧱'}</div>
        <div class="ore-tier">${TIER_ORE[v.tier]}</div>
      </div>`;
    }).join('') + `</div>`;

    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.biome(${unit.id})">← 返回</button>
        <div class="topbar-title">⛏️ ${unit.biome} · 挖矿学单词</div>
        ${UI.emeraldBadge()}
      </div>
      <p class="hint">敲开矿石收集单词卡！当前：${MC.TOOLS[Save.data.tool].name}（新矿石 +${1 + Save.data.tool} 💎）· 🟡金矿需石镐 · 💎钻石矿需铁镐 · <a class="hint-link" onclick="Audio2.click();MC.shop()">去升级 →</a></p>
      ${grid}
      <div class="bottombar">
        <button class="btn" onclick="Games.dex(${unit.id})">📖 单词图鉴 (${(Save.book.collected[unit.id] || []).length}/${unit.vocab.length})</button>
      </div>
    `, 'mine');

    document.querySelectorAll('.ore').forEach(el => {
      el.addEventListener('click', () => {
        const i = Number(el.dataset.i);
        const v = unit.vocab[i];
        if (el.classList.contains('ore-got')) { showCard(unit, i, false); return; }
        if (!MC.canMine(v.tier)) {
          Audio2.bad(); el.classList.add('ore-hit');
          setTimeout(() => el.classList.remove('ore-hit'), 350);
          UI.toast(`这块矿石太硬了！需要${MC.needToolName(v.tier)}，去商店升级镐子吧 🏪`);
          return;
        }
        Audio2.dig(); el.classList.add('ore-hit');
        setTimeout(() => {
          el.classList.remove('ore-hit');
          const isNew = Save.collect(unit.id, i);
          let gems = 0;
          if (isNew) { Save.addEnergy(unit.id, 2); gems = MC.oreReward(unit.id, v, el); Audio2.pop(); }
          el.querySelector('.ore-face').textContent = '✅';
          el.classList.add('ore-got');
          showCard(unit, i, isNew, gems);
        }, 350);
      });
    });
  }

  function showCard(unit, idx, isNew, gems = 1) {
    const v = unit.vocab[idx];
    const o = UI.overlay(`
      <div class="modal word-card">
        <div class="wc-icon">${v.icon}</div>
        <div class="wc-en">${UI.esc(v.en)}</div>
        <div class="wc-zh">${UI.esc(v.zh)}</div>
        <div class="wc-tier">${TIER_ORE[v.tier]}</div>
        <div class="wc-ex">💬 ${UI.esc(v.ex)}</div>
        <div class="wc-btns">
          ${speakBtn(v.en + '. ' + v.ex, 'btn-big')}
          <button class="btn btn-big btn-mic" id="wcMic">🎤 跟读打卡</button>
        </div>
        ${isNew ? `<div class="wc-new">+${gems} 💎 &nbsp;+2 ⚡知识能量</div>` : ''}
        <button class="btn btn-close" id="wcClose">继续挖矿 →</button>
      </div>
    `);
    Speech2.say(v.en).then(() => Speech2.sayAuto(v.zh)).then(() => Speech2.say(v.ex));
    o.querySelector('#wcClose').onclick = () => UI.closeOverlay(o);
    o.querySelector('#wcMic').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = '🎤 大声读出来…';
      await Speech2.say(v.en);
      const heard = await Speech2.listenOnce(3500);
      if (heard === true) { Audio2.good(); Save.addEmeralds(1); if (window.MC) MC.adv('speak'); UI.toast('读得真棒！+1 💎'); e.target.textContent = '✅ 跟读成功'; }
      else if (heard === null) { UI.toast('麦克风不可用，大声跟读一遍吧！'); Save.addEmeralds(1); e.target.textContent = '✅ 跟读完成'; }
      else { Audio2.bad(); UI.toast('没听到声音，再来一次！'); e.target.disabled = false; e.target.textContent = '🎤 再试一次'; }
    };
  }

  /* ============ 单词图鉴 ============ */
  function dex(unitId) {
    const unit = UNITS.find(u => u.id === unitId);
    const got = Save.book.collected[unit.id] || [];
    const cards = unit.vocab.map((v, i) => got.includes(i)
      ? `<div class="dex-card" onclick="Audio2.click();Speech2.cancelAll();Speech2.say('${v.en.replace(/'/g, "\\'")}').then(()=>Speech2.sayAuto('${v.zh.replace(/'/g, "\\'")}'))">
           <div class="dex-icon">${v.icon}</div><div class="dex-en">${UI.esc(v.en)}</div><div class="dex-zh">${UI.esc(v.zh)}</div>
         </div>`
      : `<div class="dex-card dex-unknown"><div class="dex-icon">❓</div><div class="dex-en">???</div><div class="dex-zh">未收集</div></div>`
    ).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.biome(${unit.id})">← 返回</button>
        <div class="topbar-title">📖 ${unit.biome} · 单词图鉴 ${got.length}/${unit.vocab.length}</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="dex-grid">${cards}</div>
    `);
  }

  /* ============ 合成台造句 ============ */
  function crafting(unit) {
    const recipes = unit.grammar;
    const list = recipes.map((r, i) => {
      const st = (Save.book.grammarStats[unit.id] || {})[r.name] || { ok: 0, bad: 0 };
      const mark = st.ok > 0 ? '✅' : (st.bad > 0 ? '🔴' : '◻️');
      return `<button class="recipe-btn" data-i="${i}">${mark} ${UI.esc(r.name)} <span class="recipe-zh">${UI.esc(r.point)}</span></button>`;
    }).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.biome(${unit.id})">← 返回</button>
        <div class="topbar-title">🛠️ ${unit.biome} · 合成台造句</div>
        ${UI.emeraldBadge()}
      </div>
      <p class="hint">选一个配方，把单词方块放进合成台，造出正确的句子！</p>
      <div class="recipe-list">${list}</div>
    `);
    document.querySelectorAll('.recipe-btn').forEach(el => {
      el.addEventListener('click', () => { Audio2.click(); craftGame(unit, Number(el.dataset.i)); });
    });
  }

  function craftGame(unit, ri) {
    const r = unit.grammar[ri];
    const blocks = shuffle(r.tokens.concat(r.distract));
    const o = UI.overlay(`
      <div class="modal craft-modal">
        <div class="craft-title">🛠️ 配方：${UI.esc(r.name)}</div>
        <div class="craft-hint">💡 ${UI.esc(r.explain)}</div>
        <div class="craft-bench">
          <div class="craft-slots" id="slots"></div>
          <div class="craft-arrow">➡️</div>
          <div class="craft-result" id="result">❔</div>
        </div>
        <div class="craft-blocks" id="blocks"></div>
        <div class="craft-actions">
          <button class="btn btn-big" id="craftCheck">合成！</button>
          <button class="btn" id="craftClear">清空</button>
          <button class="btn" id="craftQuit">退出</button>
        </div>
      </div>
    `);
    const slotsEl = o.querySelector('#slots'), blocksEl = o.querySelector('#blocks');
    let placedCount = 0;
    function render2() {
      slotsEl.innerHTML = blocks.slice(0, placedCount).map((w, k) =>
        `<button class="slot slot-filled" data-k="${k}">${UI.esc(w)}</button>`).join('') +
        Array(Math.max(0, r.tokens.length - placedCount)).fill('<div class="slot slot-empty"></div>').join('');
      blocksEl.innerHTML = blocks.slice(placedCount).map((w, k) =>
        `<button class="block-btn" data-k="${k + placedCount}">${UI.esc(w)}</button>`).join('');
      o.querySelectorAll('.slot-filled').forEach(el => el.onclick = () => {
        Audio2.click();
        const k = Number(el.dataset.k);
        const [w] = blocks.splice(k, 1); blocks.push(w); placedCount--; render2();
      });
      o.querySelectorAll('.block-btn').forEach(el => el.onclick = () => {
        Audio2.click();
        const k = Number(el.dataset.k);
        const [w] = blocks.splice(k, 1); blocks.splice(placedCount, 0, w); placedCount++; render2();
      });
    }
    render2();
    Speech2.sayAuto('配方：' + r.name + '。' + r.explain);
    o.querySelector('#craftClear').onclick = () => { Audio2.click(); render2(); };
    o.querySelector('#craftQuit').onclick = () => { UI.closeOverlay(o); crafting(unit); };
    o.querySelector('#craftCheck').onclick = () => {
      const answer = blocks.slice(0, r.tokens.length);
      const ok = answer.join(' ') === r.tokens.join(' ');
      const res = o.querySelector('#result');
      if (ok && placedCount === r.tokens.length) {
        Audio2.good(); Save.addEnergy(unit.id, 3); Save.addEmeralds(2); Save.grammarHit(unit.id, r.name, true);
        if (window.MC) MC.adv('craft');
        res.textContent = '✨'; res.classList.add('craft-success');
        const sentence = r.tokens.join(' ');
        UI.toast('合成成功！+3 ⚡ +2 💎');
        Speech2.say(sentence);
        setTimeout(() => { UI.closeOverlay(o); crafting(unit); }, 1800);
      } else {
        Audio2.bad(); Save.grammarHit(unit.id, r.name, false);
        res.textContent = '❌'; UI.toast('还不对，看看提示再试试');
        setTimeout(() => { res.textContent = '❔'; }, 900);
      }
    };
  }

  /* ============ NPC 任务 ============ */
  function npc(unit) {
    Save.book.quests = Save.book.quests || {};
    const done = Save.book.quests[unit.id] || [];
    const list = unit.npc.map((n, i) => `
      <button class="npc-btn" data-i="${i}">
        <div class="npc-avatar">${n.avatar}</div>
        <div class="npc-info"><b>${UI.esc(n.name)}</b><span>${done.includes(i) ? '✅ 已完成' : UI.esc(n.intro)}</span></div>
      </button>`).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.biome(${unit.id})">← 返回</button>
        <div class="topbar-title">🧑‍🤝‍🧑 ${unit.biome} · NPC 任务</div>
        ${UI.emeraldBadge()}
      </div>
      <p class="hint">帮助村民完成任务，练习本单元的句子！</p>
      <div class="npc-list">${list}</div>
    `);
    document.querySelectorAll('.npc-btn').forEach(el => {
      el.addEventListener('click', () => { Audio2.click(); npcQuest(unit, Number(el.dataset.i)); });
    });
  }

  function npcQuest(unit, ni) {
    const n = unit.npc[ni];
    if (Audio2.villager) Audio2.villager();
    let step = 0;
    function showStep() {
      const s = n.steps[step];
      const o = UI.overlay(`
        <div class="modal npc-modal">
          <div class="npc-head"><span class="npc-big">${n.avatar}</span><b>${UI.esc(n.name)}</b></div>
          <div class="npc-say">${UI.esc(s.say)} ${speakBtn(s.say)}</div>
          <div class="npc-q">${UI.esc(s.q)}</div>
          <div class="npc-opts">${s.options.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
          <div class="npc-progress">${step + 1} / ${n.steps.length}</div>
        </div>
      `);
      Speech2.say(s.say).then(() => Speech2.quizRead(s.q, s.options));
      const nqEl = o.querySelector('.npc-q');
      if (nqEl) { nqEl.classList.add('speakable'); nqEl.title = '点我再听一遍'; nqEl.onclick = () => { Speech2.cancelAll(); Speech2.quizRead(s.q, s.options); }; }
      o.querySelectorAll('.btn-opt').forEach(el => el.onclick = () => {
        if (el.dataset.op === s.a) {
          Audio2.good(); Save.addEnergy(unit.id, 2); step++; UI.closeOverlay(o);
          if (step < n.steps.length) showStep();
          else {
            Save.book.quests[unit.id] = Save.book.quests[unit.id] || [];
            if (!Save.book.quests[unit.id].includes(ni)) {
              Save.book.quests[unit.id].push(ni); Save.addEnergy(unit.id, 5); Save.addEmeralds(3); Save.save();
            }
            Audio2.win(); UI.toast(`任务完成！+5 ⚡ +3 💎`); npc(unit);
          }
        } else {
          Audio2.bad(); el.classList.add('btn-wrong'); UI.toast('再想一想～');
          setTimeout(() => { el.classList.remove('btn-wrong'); Speech2.quizRead(s.q, s.options); }, 800);
        }
      });
    }
    showStep();
  }

  /* ============ 故事卷轴 ============ */
  function story(unit) {
    const st = unit.story;
    const paras = st.paras.map(p => `<p class="story-p">${UI.esc(p)}</p>`).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.biome(${unit.id})">← 返回</button>
        <div class="topbar-title">📜 故事卷轴</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="story-scroll">
        <div class="story-head">${st.icon} <b>${UI.esc(st.title)}</b>
          <button class="btn btn-speak" onclick="Audio2.click();Speech2.say('${st.paras.join(' ').replace(/'/g, "\\'")}', 0.82)">🔊 全文朗读</button>
        </div>
        ${paras}
        <button class="btn btn-big btn-primary" id="storyQuiz">读完啦，回答问题 →</button>
      </div>
    `);
    document.getElementById('storyQuiz').onclick = () => { Audio2.click(); storyQuiz(unit, 0); };
  }

  function storyQuiz(unit, qi) {
    const q = unit.story.questions[qi];
    const o = UI.overlay(`
      <div class="modal npc-modal">
        <div class="npc-q"><b>${UI.esc(q.q)}</b></div>
        <div class="npc-opts">${q.options.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
        <div class="npc-progress">${qi + 1} / ${unit.story.questions.length}</div>
      </div>
    `);
    const readSQ = () => { Speech2.cancelAll(); Speech2.quizRead(q.q, q.options); };
    readSQ();
    const sqEl = o.querySelector('.npc-q');
    if (sqEl) { sqEl.classList.add('speakable'); sqEl.title = '点我再听一遍'; sqEl.onclick = readSQ; }
    o.querySelectorAll('.btn-opt').forEach(el => el.onclick = () => {
      if (el.dataset.op === q.a) {
        Audio2.good(); Save.addEnergy(unit.id, 2); UI.closeOverlay(o);
        if (qi + 1 < unit.story.questions.length) storyQuiz(unit, qi + 1);
        else { Save.addEmeralds(3); Audio2.win(); UI.toast('故事完成！+3 💎'); Main.biome(unit.id); }
      } else {
        Audio2.bad(); el.classList.add('btn-wrong');
        setTimeout(() => { el.classList.remove('btn-wrong'); readSQ(); }, 800);
      }
    });
  }

  /* ============ Boss 战（单元测试） ============ */
  const BOSS_AVATARS = { 1: "🐫", 2: "🦖", 3: "🎭", 4: "🧊", 5: "🤖", 6: "👑", 7: "👾", 8: "🧁", 9: "🐉" };
  const BOSS_NAMES = { 1: "沙漠骆驼王", 2: "丛林霸王龙", 3: "狂欢面具人", 4: "冰雪巨人", 5: "失控机器人", 6: "法老王", 7: "外星领主", 8: "蛋糕魔王", 9: "时光巨龙" };

  function otherWords(unit, correct, n, field) {
    return pick(unit.vocab.filter(v => v.en !== correct.en), n).map(v => v[field]);
  }

  function buildQuiz(unit) {
    const deep = unit.id <= 3;
    const quota = deep ? { pic: 5, zh2en: 3, listen: 4, cloze: 5, read: 2, mc: 1 }
                       : { pic: 3, zh2en: 2, listen: 2, cloze: 3, read: 1, mc: 1 };
    const items = [];
    pick(unit.vocab, quota.pic).forEach(v => {
      items.push({ type: "pic", q: "这是哪个单词？", icon: v.icon, options: shuffle([v.en, ...otherWords(unit, v, 3, "en")]), a: v.en });
    });
    pick(unit.vocab, quota.zh2en).forEach(v => {
      items.push({ type: "zh2en", q: `「${v.zh}」用英语怎么说？`, options: shuffle([v.en, ...otherWords(unit, v, 3, "en")]), a: v.en });
    });
    pick(unit.vocab, quota.listen).forEach(v => {
      items.push({ type: "listen", q: "仔细听，你听到了哪个单词？", speak: v.en, options: shuffle([v.en, ...otherWords(unit, v, 3, "en")]), a: v.en });
    });
    pick(unit.grammar, Math.min(quota.cloze, unit.grammar.length)).forEach(r => {
      const keyIdx = r.tokens.findIndex(t => !r.distract.includes(t) && /^[a-z']/i.test(t));
      const bi = Math.max(1, keyIdx >= 0 ? keyIdx : 1);
      const blanked = r.tokens.map((t, i) => i === bi ? "＿＿＿" : t).join(" ");
      const opts = shuffle([r.tokens[bi], ...r.distract, ...pick(r.tokens.filter((t, i) => i !== bi), 1)].slice(0, 4));
      items.push({ type: "cloze", q: blanked, sub: r.explain, options: opts.slice(0, 4), a: r.tokens[bi] });
    });
    const reads = (unit.bossExtra || []).filter(b => b.type === "read");
    const mcs = (unit.bossExtra || []).filter(b => b.type === "mc");
    pick(reads, quota.read).forEach(b => items.push({ type: "read", passage: b.passage, q: b.q, options: shuffle(b.options), a: b.a }));
    pick(mcs, quota.mc).forEach(b => items.push({ type: "mc", q: b.q, options: shuffle(b.options), a: b.a }));
    while (items.length < (deep ? 20 : 12)) {
      const v = pick(unit.vocab, 1)[0];
      items.push({ type: "zh2en", q: `「${v.zh}」用英语怎么说？`, options: shuffle([v.en, ...otherWords(unit, v, 3, "en")]), a: v.en });
    }
    return shuffle(items);
  }

  function boss(unit) {
    const energy = Save.book.energy[unit.id] || 0;
    if (energy < 15) { UI.toast(`知识能量不足（${energy}/15）！先去收集单词吧`); return; }
    const intro = UI.overlay(`
      <div class="modal boss-intro">
        <div class="boss-big">${BOSS_AVATARS[unit.id] || '🐉'}</div>
        <h2>${BOSS_NAMES[unit.id] || '单元守护者'} 出现了！</h2>
        <p>单元测试 · ${unit.id <= 3 ? 20 : 12} 题 · 首次答对 70% 即可过关</p>
        <p class="hint">答错了要再试试，直到答对才能继续！错题会进入错题矿洞等你消灭~</p>
        <button class="btn btn-big btn-primary" id="bossGo">⚔️ 开始挑战</button>
        <button class="btn" id="bossBack">再准备一下</button>
      </div>
    `);
    intro.querySelector('#bossGo').onclick = () => { UI.closeOverlay(intro); bossRun(unit, buildQuiz(unit), 0, { ok: 0, firstTryCorrect: 0, types: {}, wrongs: [], quizTotal: 0 }); };
    intro.querySelector('#bossBack').onclick = () => UI.closeOverlay(intro);
  }

  function bossRun(unit, quiz, i, st) {
    if (i >= quiz.length) return bossReport(unit, quiz, st);
    const q = quiz[i];
    if (!st.quizTotal) st.quizTotal = quiz.length;
    let firstAttempt = true;
    const hp = Math.round(((quiz.length - i) / quiz.length) * 100);
    const body = `
      ${q.passage ? `<div class="boss-passage">${UI.esc(q.passage)}</div>` : ''}
      ${q.icon ? `<div class="boss-icon">${q.icon}</div>` : ''}
      <div class="boss-q">${UI.esc(q.q)}</div>
      ${q.sub ? `<div class="craft-hint">💡 ${UI.esc(q.sub)}</div>` : ''}
      ${q.speak ? speakBtn(q.speak, 'btn-big') : ''}
      <div class="boss-opts">${q.options.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>`;
    UI.screen(`
      <div class="topbar boss-top">
        <div class="boss-hp"><span>${BOSS_AVATARS[unit.id] || '🐉'}</span><div class="hp-bar"><div class="hp-fill" style="width:${hp}%"></div></div></div>
        <div class="topbar-title">第 ${i + 1} / ${quiz.length} 题</div>
        <div class="boss-score">✅ ${st.ok}</div>
      </div>
      <div class="boss-arena">${body}</div>
    `, 'boss-screen');
    const readQ = () => {
      Speech2.cancelAll();
      if (q.speak) Speech2.say(q.speak).then(() => Speech2.quizRead(q.q, q.options));
      else if (q.type === 'pic' || q.type === 'zh2en') Speech2.quizRead(q.q, q.options);
      else Speech2.sayAuto(q.q);
    };
    readQ();
    const bqEl = document.querySelector('.boss-q');
    if (bqEl) { bqEl.classList.add('speakable'); bqEl.title = '点我再听一遍'; bqEl.onclick = readQ; }
    document.querySelectorAll('.btn-opt').forEach(el => el.onclick = () => {
      const right = el.dataset.op === q.a;
      const t = st.types[q.type] = st.types[q.type] || { ok: 0, total: 0 };
      t.total++;
      if (right) {
        Audio2.hit(); Audio2.pop(); st.ok++; t.ok++;
        if (firstAttempt) st.firstTryCorrect++;
        el.classList.add('btn-right');
        setTimeout(() => bossRun(unit, quiz, i + 1, st), 450);
      } else {
        Audio2.bad(); el.classList.add('btn-wrong');
        if (firstAttempt) { firstAttempt = false; st.wrongs.push(q); Save.addWrong({ unit: unit.id, type: q.type, q: (q.passage ? q.passage + ' | ' : '') + q.q, options: q.options, answer: q.a }); }
        Speech2.sayAuto('还不对，再试试吧！'); UI.toast('还不对，再试试！');
        setTimeout(() => { el.classList.remove('btn-wrong'); readQ(); }, 800);
      }
    });
  }

  function bossReport(unit, quiz, st) {
    const total = st.quizTotal || quiz.length;
    const pct = Math.round((st.firstTryCorrect / total) * 100);
    const passed = pct >= 70;
    const TYPE_ZH = { pic: "看图选词", zh2en: "词义选择", listen: "听力", cloze: "语法填空", read: "阅读", mc: "综合" };
    const typeRows = Object.entries(st.types).map(([t, s]) => {
      const p = Math.round((s.ok / s.total) * 100);
      return `<tr><td>${TYPE_ZH[t] || t}</td><td>${s.ok}/${s.total}</td><td><div class="mini-bar"><div style="width:${p}%"></div></div></td></tr>`;
    }).join('');
    const weakest = Object.entries(st.types).sort((a, b) => (a[1].ok / a[1].total) - (b[1].ok / b[1].total))[0];
    const prev = Save.book.boss[unit.id];
    Save.book.boss[unit.id] = {
      score: st.firstTryCorrect, total, pct, passed: passed || (prev && prev.passed),
      attempts: (prev ? prev.attempts : 0) + 1,
      weak: weakest ? (TYPE_ZH[weakest[0]] || weakest[0]) : '-',
      types: st.types, date: new Date().toLocaleDateString('zh-CN')
    };
    Save.save();
    if (passed) {
      Audio2.win();
      const bonus = 20 + Math.round(pct / 10);
      Save.addEmeralds(bonus);
      if (unit.id < UNITS.length) Save.unlock(unit.id + 1);
      confetti(); if (window.MC) MC.adv('boss');
    } else Audio2.bad();
    const wrongList = st.wrongs.slice(0, 5).map(w => `<li>${UI.esc(w.q)} → <b>${UI.esc(w.a)}</b></li>`).join('');
    UI.screen(`
      <div class="report">
        <div class="report-head">${passed ? '🏆 挑战成功！' : '💪 再接再厉！'}</div>
        <div class="report-score">${pct}<span>%</span></div>
        <p>${st.firstTryCorrect} / ${total} 题一次答对 · 共答对 ${st.ok} 次 ${passed ? (unit.id < UNITS.length ? `· 解锁了【${UNITS.find(u => u.id === unit.id + 1).biome}】！` : '· 全部通关，太厉害了！') : `· 最弱项：${weakest ? (TYPE_ZH[weakest[0]] || '') : ''}，去补补课再战吧！`}</p>
        ${passed ? `<p class="report-bonus">+${20 + Math.round(pct / 10)} 💎</p>` : ''}
        <table class="report-table"><tr><th>题型</th><th>正确</th><th>掌握度</th></tr>${typeRows}</table>
        ${wrongList ? `<div class="report-wrong"><b>本次错题（已进错题矿洞）：</b><ul>${wrongList}</ul></div>` : ''}
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="Audio2.click();Games.boss(UNITS.find(u=>u.id===${unit.id}))">⚔️ 再战一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回群系</button>
          ${!passed && st.wrongs.length ? `<button class="btn btn-big btn-cave" onclick="Games.reviewCave()">🕳️ 去错题矿洞</button>` : ''}
        </div>
      </div>
    `, 'boss-screen');
  }

  function confetti() {
    for (let i = 0; i < 30; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.textContent = ['🎉', '⭐', '💎', '✨', '🎊'][i % 5];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.animationDelay = (Math.random() * 1.2) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }

  /* ============ 错题矿洞 ============ */
  function reviewCave() {
    const wrongs = Save.book.wrong;
    const ores = wrongs.map((w, i) => `
      <div class="ore cave-ore" data-i="${i}">
        <div class="ore-face">🪨</div>
        <div class="ore-tier">剩 ${w.left} 次</div>
      </div>`).join('');
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.map()">← 返回地图</button>
        <div class="topbar-title">🕳️ 错题矿洞（${wrongs.length}）</div>
        ${UI.emeraldBadge()}
      </div>
      <p class="hint">错题变成了矿石！答对 3 次才能彻底消灭它</p>
      ${wrongs.length ? `<div class="mine-grid">${ores}</div>` : '<div class="cave-empty">✨ 矿洞空空如也，没有错题！去挑战 Boss 吧</div>'}
    `, 'mine');
    document.querySelectorAll('.cave-ore').forEach(el => el.onclick = () => { Audio2.dig(); reviewQ(Number(el.dataset.i)); });
  }

  function reviewQ(i) {
    const w = Save.book.wrong[i];
    if (!w) return reviewCave();
    const o = UI.overlay(`
      <div class="modal npc-modal">
        <div class="boss-q">${UI.esc(w.q)}</div>
        <div class="npc-opts">${w.options.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
        <button class="btn" id="rqBack">← 回矿洞</button>
      </div>
    `);
    o.querySelector('#rqBack').onclick = () => { UI.closeOverlay(o); reviewCave(); };
    const rqEl = o.querySelector('.boss-q');
    if (rqEl) { rqEl.classList.add('speakable'); rqEl.title = '点我再听一遍'; Speech2.sayAuto(w.q); rqEl.onclick = () => { Speech2.cancelAll(); Speech2.quizRead(w.q, w.options); }; }
    o.querySelectorAll('.btn-opt').forEach(el => el.onclick = () => {
      if (el.dataset.op === w.answer) {
        Audio2.pop(); Save.reviewHit(i); Save.addEmeralds(1);
        UI.toast(`答对了！${Save.book.wrong[i] ? '还剩 ' + Save.book.wrong[i].left + ' 次' : '这块矿石被消灭了！'} +1 💎`);
        UI.closeOverlay(o); reviewCave();
      } else {
        Audio2.bad(); el.classList.add('btn-wrong');
        setTimeout(() => { el.classList.remove('btn-wrong'); Speech2.quizRead(w.q, w.options); }, 800);
      }
    });
  }

  /* ============ 建造区 ============ */
  const BLOCKS = [
    { id: "grass", icon: "🟩", name: "草地" }, { id: "dirt", icon: "🟫", name: "泥土" },
    { id: "brick", icon: "🧱", name: "砖块" }, { id: "wood", icon: "🪵", name: "木板" },
    { id: "glass", icon: "🪟", name: "玻璃" }, { id: "gold", icon: "🟨", name: "金块" },
    { id: "diamond", icon: "💠", name: "钻石块" }, { id: "torch", icon: "🔥", name: "火把" },
    { id: "flower", icon: "🌸", name: "花" }, { id: "water", icon: "🌊", name: "水" }
  ];
  const GRID_W = 12, GRID_H = 7;

  function buildZone() {
    let selected = "brick", mode = "place";
    const cellMap = {};
    Save.book.builds.forEach(b => cellMap[b.x + ',' + b.y] = b.block);
    const cells = [];
    for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) {
      const key = x + ',' + y;
      const blk = cellMap[key];
      const icon = blk ? (BLOCKS.find(b => b.id === blk) || {}).icon || '❔' : '';
      cells.push(`<div class="bz-cell" data-x="${x}" data-y="${y}">${icon}</div>`);
    }
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.map()">← 返回地图</button>
        <div class="topbar-title">🏗️ 我的建造基地</div>
        ${UI.emeraldBadge()}
      </div>
      <p class="hint">每放一个方块花 1 💎——宝石要靠学习赚哦！</p>
      <div class="bz-palette">${BLOCKS.map(b =>
        `<button class="bz-block ${b.id === selected ? 'bz-sel' : ''}" data-b="${b.id}">${b.icon}<span>${b.name}</span></button>`).join('')}
        <button class="bz-block bz-erase" data-b="__erase">⛏️<span>拆除</span></button>
      </div>
      <div class="bz-grid" style="grid-template-columns:repeat(${GRID_W},1fr)">${cells.join('')}</div>
    `, 'buildzone');
    document.querySelectorAll('.bz-block').forEach(el => el.onclick = () => {
      Audio2.click();
      document.querySelectorAll('.bz-block').forEach(e2 => e2.classList.remove('bz-sel'));
      el.classList.add('bz-sel'); selected = el.dataset.b; mode = selected === '__erase' ? 'erase' : 'place';
    });
    document.querySelectorAll('.bz-cell').forEach(el => el.onclick = () => {
      const x = Number(el.dataset.x), y = Number(el.dataset.y);
      const idx = Save.book.builds.findIndex(b => b.x === x && b.y === y);
      if (mode === 'erase') { if (idx >= 0) { Save.book.builds.splice(idx, 1); Save.save(); Audio2.dig(); el.textContent = ''; } return; }
      if (idx >= 0) { UI.toast('这里已经有方块了，先拆除吧'); return; }
      if (Save.data.emeralds < 1) { Audio2.bad(); UI.toast('宝石不够啦！去学习赚宝石吧 💎'); return; }
      Save.addEmeralds(-1); Save.book.builds.push({ x, y, block: selected }); Save.save();
      Audio2.place(); el.textContent = BLOCKS.find(b => b.id === selected).icon;
      el.classList.add('bz-pop');
      document.querySelector('.emerald-badge').innerHTML = `💎 <b>${Save.data.emeralds}</b>`;
    });
  }

  /* ============ 家长中心 ============ */
  function parentCenter() {
    const d = Save.book;
    const TYPE_ZH = { pic: "看图选词", zh2en: "词义选择", listen: "听力", cloze: "语法填空", read: "阅读", mc: "综合" };
    const rows = UNITS.map(u => {
      const b = d.boss[u.id];
      const words = (d.collected[u.id] || []).length;
      if (!b) return `<tr><td>${u.icon} U${u.id} ${u.biome}</td><td colspan="4">未挑战 · 单词 ${words}/${u.vocab.length}</td></tr>`;
      return `<tr>
        <td>${u.icon} U${u.id} ${u.biome}</td>
        <td>${b.passed ? '✅' : '❌'} ${b.pct}%</td>
        <td>${b.attempts} 次</td>
        <td>${b.weak}</td>
        <td>${words}/${u.vocab.length}</td>
      </tr>`;
    }).join('');
    const hours = Math.floor(Save.data.playSeconds / 3600), mins = Math.round((Save.data.playSeconds % 3600) / 60);
    UI.screen(`
      <div class="topbar">
        <button class="btn btn-back" onclick="Main.map()">← 返回地图</button>
        <div class="topbar-title">👨‍👩‍👧 家长中心</div>
        ${UI.emeraldBadge()}
      </div>
      <div class="parent-body">
        <div class="parent-cards">
          <div class="p-card"><b>${hours}h ${mins}m</b><span>累计学习时长</span></div>
          <div class="p-card"><b>${Object.values(d.boss).filter(b => b.passed).length} / ${UNITS.length}</b><span>已通过单元</span></div>
          <div class="p-card"><b>${d.wrong.length}</b><span>待消灭错题</span></div>
        </div>
        <h3>当前教材：${getBook().name}（${getBook().publisher}）</h3>
        <table class="report-table parent-table">
          <tr><th>单元</th><th>最好成绩</th><th>挑战次数</th><th>最弱项</th><th>单词收集</th></tr>
          ${rows}
        </table>
        <h3>学习建议</h3>
        <div class="parent-advice">${parentAdvice()}</div>
        <button class="btn" onclick="Main.changeBook()">🔄 更换教材 / 游戏</button>
        <button class="btn" onclick="Audio2.click();Main.voiceSettings()">🎤 声音设置</button>
        <p class="hint">数据仅保存在本设备浏览器中，不会上传。清除浏览器数据会重置进度。</p>
      </div>
    `);
  }

  function parentAdvice() {
    const d = Save.book;
    const tips = [];
    const failed = UNITS.filter(u => d.boss[u.id] && !d.boss[u.id].passed);
    if (failed.length) tips.push(`📌 第 ${failed.map(u => u.id).join('、')} 单元 Boss 战尚未通过，建议陪孩子先玩对应群系的收集任务。`);
    const typeCount = {};
    Object.values(d.boss).forEach(b => Object.entries(b.types || {}).forEach(([t, s]) => {
      typeCount[t] = typeCount[t] || { ok: 0, total: 0 }; typeCount[t].ok += s.ok; typeCount[t].total += s.total;
    }));
    const weakType = Object.entries(typeCount).filter(([, s]) => s.total >= 3).sort((a, b) => (a[1].ok / a[1].total) - (b[1].ok / b[1].total))[0];
    if (weakType && weakType[1].ok / weakType[1].total < 0.7) {
      const map = { pic: "词汇认知", zh2en: "词义理解", listen: "听力", cloze: "语法", read: "阅读", mc: "综合运用" };
      tips.push(`📌 ${map[weakType[0]]}是目前的薄弱环节（正确率 ${Math.round(weakType[1].ok / weakType[1].total * 100)}%），可以多用单词图鉴复习。`);
    }
    if (d.wrong.length > 5) tips.push(`📌 错题矿洞里有 ${d.wrong.length} 道错题，建议每天玩 5 分钟错题矿洞。`);
    if (!tips.length) tips.push('🎉 目前学习状态很好！继续保持，可以挑战下一个单元了。');
    return tips.map(t => `<p>${t}</p>`).join('');
  }

  return { mining, dex, crafting, npc, story, boss, reviewCave, buildZone, parentCenter };
})();
