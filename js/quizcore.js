/* ============================================================
   EduQuest · quizcore.js
   共享问答内核：从单元生成美式英语题目 + 阻塞式答题弹窗（答错卡关）
   供 pvz / mario / coop 三个主题世界复用
   ============================================================ */
'use strict';

const Quiz = (() => {

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function otherWords(unit, correct, n, field) {
    return shuffle(unit.vocab.filter(v => v.en !== correct.en)).slice(0, n).map(v => v[field]);
  }

  /* 生成一个题目，返回 {item, vi}；vi 为对应 vocab 下标（-1 表示语法题） */
  function makeItem(unit) {
    const v = unit.vocab[Math.floor(Math.random() * unit.vocab.length)];
    const vi = unit.vocab.indexOf(v);
    const r = Math.random();
    if (r < 0.55) {
      return { vi, item: {
        type: 'zh2en', q: `「${v.zh}」用英语怎么说？`,
        options: shuffle([v.en, ...otherWords(unit, v, 3, 'en')]), a: v.en
      } };
    } else if (r < 0.75) {
      return { vi, item: {
        type: 'listen', q: '仔细听，你听到了哪个单词？', speak: v.en,
        options: shuffle([v.en, ...otherWords(unit, v, 3, 'en')]), a: v.en
      } };
    } else if (r < 0.9 && unit.vocab.length > 3) {
      return { vi, item: {
        type: 'pic', q: '这是哪个单词？', icon: v.icon,
        options: shuffle([v.en, ...otherWords(unit, v, 3, 'en')]), a: v.en
      } };
    } else if (unit.grammar && unit.grammar.length) {
      const rec = unit.grammar[Math.floor(Math.random() * unit.grammar.length)];
      const keyIdx = rec.tokens.findIndex(t => !rec.distract.includes(t) && /^[a-z']/i.test(t));
      const bi = Math.max(1, keyIdx >= 0 ? keyIdx : 1);
      const blanked = rec.tokens.map((t, i) => i === bi ? '＿＿＿' : t).join(' ');
      const opts = shuffle([rec.tokens[bi], ...rec.distract, ...shuffle(rec.tokens.filter((t, i) => i !== bi)).slice(0, 1)]).slice(0, 4);
      return { vi: -1, item: { type: 'cloze', q: blanked, sub: rec.explain, options: opts.slice(0, 4), a: rec.tokens[bi] } };
    }
    return { vi, item: {
      type: 'zh2en', q: `「${v.zh}」用英语怎么说？`,
      options: shuffle([v.en, ...otherWords(unit, v, 3, 'en')]), a: v.en
    } };
  }

  /* 播放题目朗读（美式英语） */
  function read(item) {
    Speech2.cancelAll();
    if (item.speak) Speech2.say(item.speak).then(() => Speech2.quizRead(item.q, item.options));
    else if (item.type === 'pic' || item.type === 'zh2en') Speech2.quizRead(item.q, item.options);
    else Speech2.sayAuto(item.q);
  }

  function speakBtn(text) {
    return `<button class="btn btn-speak" onclick="Audio2.click();Speech2.say('${String(text).replace(/'/g, "\\'")}')">🔊 听</button>`;
  }

  /* 阻塞式答题：答错无法继续，必须答对才 resolve */
  function ask(item, { title = '🤔 回答正确才能继续', sub = '', cls = '' } = {}) {
    return new Promise(resolve => {
      const body = `
        ${item.icon ? `<div class="q-icon">${item.icon}</div>` : ''}
        <div class="q-q ${item.type === 'listen' ? 'speakable' : ''}">${UI.esc(item.q)}</div>
        ${item.sub ? `<div class="craft-hint">💡 ${UI.esc(item.sub)}</div>` : ''}
        ${item.speak ? speakBtn(item.speak, 'btn-big') : ''}
        <div class="q-opts">${item.options.map((op, idx) => `<button class="btn btn-opt" data-op="${UI.esc(op)}">${idx + 1}. ${UI.esc(op)}</button>`).join('')}</div>
        <p class="hint2">答错就要再试一次，答对才能继续游戏哦！</p>`;
      const o = UI.overlay(`
        <div class="modal q-modal ${cls}">
          <h3>${title}</h3>
          ${sub ? `<p class="q-sub">${UI.esc(sub)}</p>` : ''}
          ${body}
        </div>`);
      const qEl = o.querySelector('.q-q');
      if (qEl) { qEl.title = '点我再听一遍'; qEl.onclick = () => read(item); }
      read(item);
      o.querySelectorAll('.btn-opt').forEach(b => b.onclick = () => {
        if (b.dataset.op === item.a) {
          Audio2.good();
          Speech2.say(item.a);
          UI.closeOverlay(o);
          resolve(true);
        } else {
          Audio2.bad();
          b.classList.add('btn-wrong');
          UI.toast('还不对，再试试！');
          setTimeout(() => { b.classList.remove('btn-wrong'); read(item); }, 800);
        }
      });
    });
  }

  return { makeItem, ask, read, shuffle };
})();

window.Quiz = Quiz;
