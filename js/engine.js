/* ============================================================
   EduQuest · engine.js
   Save(存档/备份·按教材隔离) · Audio(WebAudio音效) · Speech(美式TTS+麦克风) · UI
   全局状态 Cur = { bookId, world } 由 textbooks.js / main.js 维护
   ============================================================ */
'use strict';

/* 当前选中的教材(bookId)与游戏世界(world)，由 main.js 在选教材/选世界时赋值 */
var Cur = { bookId: 0, world: 'mc' };

/* ---------- Save（按教材隔离单元进度；货币/工具为全局） ---------- */
const Save = (() => {
  const KEY = 'eduquest_save_v1';
  const BAK = 'eduquest_save_v1_bak';

  const freshBook = () => ({
    unlocked: [1],            // 已解锁单元 id
    energy: {},               // unitId -> 知识能量
    collected: {},            // unitId -> [vocabIndex]
    boss: {},                 // unitId -> {score,total,passed,attempts,weak,typeStats,date}
    wrong: [],                // [{unit,type,q,options,answer,left,tag}]
    grammarStats: {},         // unitId -> {recipeName:{ok,bad}}
    builds: [],               // [{x,y,block}]
    quests: {},               // unitId -> [npcIndex]
    edits: {},                // unitId -> {x,y:block}
    seeds: {},                // unitId -> seed
    inv: {}                   // blockId -> count
  });

  const fresh = () => ({
    v: 1,
    emeralds: 0, xp: 0, level: 1, tool: 0,
    adv: [], wolf: false, fortuneUntil: 0, musicOff: false,
    playSeconds: 0, startedAt: Date.now(),
    selBook: 0, selWorld: 'mc',
    books: {}                 // bookId -> freshBook()
  });

  let data = fresh();

  function book() {
    const id = Cur.bookId;
    if (!data.books[id]) data.books[id] = freshBook();
    return data.books[id];
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return data;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== 1) throw new Error('bad save');
      data = Object.assign(fresh(), parsed);
      Cur.bookId = data.selBook || 0;
      Cur.world = data.selWorld || 'mc';
      // 补全缺字段：以 freshBook 为底，叠加已存数据（保留存档），再写回
      Object.keys(data.books).forEach(id => { data.books[id] = Object.assign(freshBook(), data.books[id]); });
    } catch (e) {
      try {
        const bak = JSON.parse(localStorage.getItem(BAK));
        data = bak && bak.v === 1 ? Object.assign(fresh(), bak) : fresh();
      } catch { data = fresh(); }
    }
    return data;
  }

  function save() {
    try {
      const prev = localStorage.getItem(KEY);
      if (prev) localStorage.setItem(BAK, prev);
      data.selBook = Cur.bookId; data.selWorld = Cur.world;
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* 存储满时静默失败 */ }
  }

  function addEmeralds(n) { data.emeralds = Math.max(0, data.emeralds + n); save(); }
  function addEnergy(unitId, n) { book().energy[unitId] = (book().energy[unitId] || 0) + n; save(); }
  function unlock(unitId) { if (!book().unlocked.includes(unitId)) { book().unlocked.push(unitId); save(); } }
  function collect(unitId, idx) {
    const b = book();
    if (!b.collected[unitId]) b.collected[unitId] = [];
    if (!b.collected[unitId].includes(idx)) { b.collected[unitId].push(idx); save(); return true; }
    return false;
  }
  function addWrong(item) {
    const b = book();
    const dup = b.wrong.find(w => w.q === item.q && w.answer === item.answer);
    if (dup) { dup.left = 3; } else b.wrong.push(Object.assign({ left: 3 }, item));
    save();
  }
  function reviewHit(i) {
    const b = book(); const w = b.wrong[i]; if (!w) return;
    w.left -= 1; if (w.left <= 0) b.wrong.splice(i, 1); save();
  }
  function grammarHit(unitId, name, ok) {
    const b = book();
    if (!b.grammarStats[unitId]) b.grammarStats[unitId] = {};
    const g = b.grammarStats[unitId][name] || { ok: 0, bad: 0 };
    ok ? g.ok++ : g.bad++;
    b.grammarStats[unitId][name] = g; save();
  }
  function tick(seconds) { data.playSeconds += seconds; save(); }

  return {
    get data() { return data; },
    get book() { return book(); },
    load, save, addEmeralds, addEnergy, unlock, collect, addWrong, reviewHit, grammarHit, tick
  };
})();

/* ---------- Audio（Web Audio 合成芯片音效） ---------- */
const Audio2 = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur = 0.12, type = 'square', vol = 0.06, when = 0) {
    try {
      const c = ac();
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
      o.connect(g); g.connect(c.destination);
      o.start(c.currentTime + when); o.stop(c.currentTime + when + dur);
    } catch (e) { /* 无声设备降级 */ }
  }
  return {
    click:  () => tone(660, 0.06),
    dig:    () => { tone(180, 0.08, 'sawtooth'); tone(120, 0.1, 'sawtooth', 0.05, 0.06); },
    pop:    () => { tone(523, 0.08); tone(784, 0.1, 'square', 0.06, 0.07); },
    good:   () => { tone(523, 0.1); tone(659, 0.1, 'square', 0.06, 0.09); tone(784, 0.16, 'square', 0.06, 0.18); },
    bad:    () => { tone(220, 0.2, 'sawtooth', 0.05); tone(160, 0.25, 'sawtooth', 0.05, 0.12); },
    win:    () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'square', 0.07, i * 0.14)); },
    coin:   () => { tone(988, 0.07); tone(1319, 0.12, 'square', 0.05, 0.06); },
    unlock: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.15, 'triangle', 0.08, i * 0.1)); },
    place:  () => tone(330, 0.07, 'triangle', 0.08),
    hit:    () => tone(90, 0.15, 'sawtooth', 0.09)
  };
})();

/* ---------- Speech（强制美式英语 TTS + 麦克风音量检测） ---------- */
const Speech2 = (() => {
  let voice = null, zhVoice = null;
  let _u = null;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    // 强制优先美式英语 en-US
    voice = vs.find(v => /en[-_]US/i.test(v.lang)) ||
            vs.find(v => /en[-_]GB/i.test(v.lang)) ||
            vs.find(v => /^en/i.test(v.lang)) || null;
    zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) ||
              vs.find(v => /^zh/i.test(v.lang)) || null;
  }

  function ensureVoices() {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      const vs = speechSynthesis.getVoices();
      if (vs && vs.length > 0) { loadVoices(); resolve(); return; }
      const onChanged = () => { speechSynthesis.removeEventListener('voiceschanged', onChanged); loadVoices(); resolve(); };
      speechSynthesis.addEventListener('voiceschanged', onChanged);
      setTimeout(() => { speechSynthesis.removeEventListener('voiceschanged', onChanged); resolve(); }, 500);
    });
  }

  loadVoices();
  if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', loadVoices);

  function cancelAll() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  function speakRaw(text, { zh = false, rate = 0.9, pitch = 1.0 } = {}) {
    return ensureVoices().then(() => new Promise(resolve => {
      if (!('speechSynthesis' in window)) { resolve(false); return; }
      try {
        const u = new SpeechSynthesisUtterance(text);
        _u = u;
        if (zh) {
          if (zhVoice) u.voice = zhVoice;
          u.lang = 'zh-CN';
        } else {
          if (voice) u.voice = voice;       // 美式英语 voice
          u.lang = voice ? voice.lang : 'en-US';
        }
        u.rate = rate; u.pitch = pitch;
        let done = false;
        u.onend = () => { if (!done) { done = true; resolve(true); } };
        u.onerror = (e) => {
          if (!done) { done = true; resolve(e.error === 'interrupted' || e.error === 'canceled' ? false : true); }
        };
        speechSynthesis.speak(u);
        setTimeout(() => { if (!done) { done = true; resolve(true); } }, Math.max(3000, text.length * 170));
      } catch (e) { resolve(false); }
    })).catch(() => false);
  }
  function say(text, rate = 0.9) { return speakRaw(text, { zh: false, rate }); }
  function sayAuto(text, rate = 0.88) {
    text = String(text).replace(/＿+/g, ' blank ').replace(/\s*\|\s*/g, '. ');
    const zh = /[一-鿿]/.test(text);
    return speakRaw(text, { zh, rate: zh ? 0.85 : rate });
  }
  // 整题朗读：先读题干，再依次读选项（美式英语）
  function quizRead(q, options = [], withZh = false) {
    let p = sayAuto(q);
    options.forEach((op, idx) => {
      p = p.then(() => new Promise(r => setTimeout(r, 420))).then(() => sayAuto((idx + 1) + '. ' + String(op)));
    });
    return p;
  }
  async function listenOnce(ms = 3500) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const c = new (window.AudioContext || window.webkitAudioContext)();
      const src = c.createMediaStreamSource(stream);
      const an = c.createAnalyser(); an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const end = Date.now() + ms;
      return await new Promise(resolve => {
        (function check() {
          an.getByteFrequencyData(buf);
          const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
          if (avg > 18) { cleanup(); resolve(true); }
          else if (Date.now() > end) { cleanup(); resolve(false); }
          else requestAnimationFrame(check);
        })();
        function cleanup() { stream.getTracks().forEach(t => t.stop()); c.close().catch(() => {}); }
      });
    } catch (e) { return null; }
  }
  return { cancelAll, say, sayAuto, quizRead, listenOnce, get supported() { return 'speechSynthesis' in window; } };
})();

/* ---------- UI（场景切换 / 弹窗 / 通用部件） ---------- */
const UI = (() => {
  const app = () => document.getElementById('app');
  function screen(html, cls = '') {
    app().innerHTML = `<div class="screen ${cls}">${html}</div>`;
    window.scrollTo(0, 0);
  }
  function overlay(html, cls = '') {
    const o = document.createElement('div');
    o.className = 'overlay ' + cls;
    o.innerHTML = html;
    document.body.appendChild(o);
    return o;
  }
  function closeOverlay(o) { if (o && o.parentNode) o.parentNode.removeChild(o); }
  function toast(msg, ms = 1800) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
    const spoken = String(msg).replace(/[🀀-🿿\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{2600}-\u{27BF}]/gu, '').trim();
    if (spoken.length >= 4 && window.Speech2) Speech2.sayAuto(spoken, 0.92);
  }
  function emeraldBadge() { return `<div class="emerald-badge">💎 <b>${Save.data.emeralds}</b></div>`; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  return { screen, overlay, closeOverlay, toast, emeraldBadge, esc };
})();

window.Speech2 = Speech2;
