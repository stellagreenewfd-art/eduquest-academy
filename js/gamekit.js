/* ============================================================
   EduQuest · gamekit.js
   非 MC 游戏的共享内核：canvas 自适应 / rAF 循环(可暂停) /
   指针+键盘输入 / 英语问答关卡门(quizGate) / 奖励与结算屏。
   让每个游戏专注「自己的机制」，问答与结算统一处理。
   原则：先自由玩，只在关卡点用英语题（答错卡关、必须答对）。
   ============================================================ */
'use strict';

const GameKit = (() => {
  let loopStop = null;        // 当前运行的主循环停止函数
  let onCleanup = [];         // quit 时统一清理（计时器/监听）

  /* 停掉当前循环并清理监听 */
  function cleanup() {
    if (loopStop) { loopStop(); loopStop = null; }
    onCleanup.forEach(fn => { try { fn(); } catch (e) {} });
    onCleanup = [];
  }

  /* 注册清理回调（如 setTimeout 句柄） */
  function defer(fn) { onCleanup.push(fn); }

  /* ---------- 英语问答关卡门：答错循环、必须答对才 resolve ---------- */
  function quizGate(unit, opts = {}) {
    const m = Quiz.makeItem(unit);
    return Quiz.ask(m.item, opts).then(() => m);   // m = {item, vi}
  }

  /* 答对后的奖励：收集单词 + 能量 + 绿宝石 */
  function award(unit, vi, em = 2) {
    if (vi >= 0) {
      const isNew = Save.collect(unit.id, vi);
      Save.addEnergy(unit.id, isNew ? 2 : 1);
      if (isNew) Speech2.say(unit.vocab[vi].en);   // 念出新学的词
    } else {
      Save.addEnergy(unit.id, 1);
    }
    Save.addEmeralds(em);
  }
  function setEnergy(unitId, elId) {
    const e = document.getElementById(elId);
    if (e) e.textContent = '⚡ ' + (Save.book.energy[unitId] || 0);
  }

  /* ---------- 通用胜利 / 失败结算屏 ---------- */
  function win(unit, o = {}) {
    cleanup();
    Save.addEmeralds(10);
    if (unit.id < UNITS.length) Save.unlock(unit.id + 1);
    Audio2.win();
    const next = unit.id < UNITS.length ? UNITS.find(x => x.id === unit.id + 1) : null;
    UI.screen(`
      <div class="report">
        <div class="report-head">🏆 ${o.head || '通关啦！'}</div>
        <p>${o.text || ''}</p>
        <p class="report-bonus">+10 💎 &nbsp; 每答对 +2⚡</p>
        ${next ? `<p>解锁了下一单元【${UI.esc(next.name)}】！</p>` : '<p>全部单元通关，太厉害了！</p>'}
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="${o.replay || ('GameKit.replay()')}">🔁 再玩一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>`, 'game-screen');
  }
  function fail(unit, o = {}) {
    cleanup();
    Audio2.bad();
    UI.screen(`
      <div class="report report-fail">
        <div class="report-head">💥 ${o.head || '再试一次'}</div>
        <p>${o.text || ''}</p>
        <div class="report-btns">
          <button class="btn btn-big btn-primary" onclick="${o.replay || ('GameKit.replay()')}">🔁 再试一次</button>
          <button class="btn btn-big" onclick="Main.biome(${unit.id})">回营地</button>
        </div>
      </div>`, 'game-screen');
  }

  /* 记录当前关卡以便「再玩一次」 */
  let _replay = null;
  function setReplay(fn) { _replay = fn; }
  function replay() { if (_replay) _replay(); }

  /* ---------- canvas：自适应填满舞台 ---------- */
  function canvas(stageId) {
    const stage = document.getElementById(stageId);
    const cv = document.createElement('canvas');
    cv.className = 'game-canvas';
    stage.appendChild(cv);
    const ctx = cv.getContext('2d');
    function resize() {
      const r = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      cv.style.width = r.width + 'px';
      cv.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cv._w = r.width; cv._h = r.height;
    }
    resize();
    window.addEventListener('resize', resize);
    onCleanup.push(() => window.removeEventListener('resize', resize));
    return {
      cv, ctx, stage,
      get W() { return cv._w; }, get H() { return cv._h; },
      resize
    };
  }

  /* ---------- rAF 主循环（update(dt, now)，可暂停） ---------- */
  function loop(update) {
    let last = performance.now(), stopped = false, id = null;
    function frame(now) {
      if (stopped) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      update(dt, now);
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
    const stop = () => { stopped = true; cancelAnimationFrame(id); };
    loopStop = stop;
    return stop;
  }

  /* ---------- 输入：指针（归一化坐标） + 键盘状态 ---------- */
  function bindInput(cv, handlers) {
    const rect = () => cv.getBoundingClientRect();
    function pos(e) {
      const r = rect();
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
      return { x: (t.clientX - r.left), y: (t.clientY - r.top) };
    }
    const down = e => { e.preventDefault(); handlers.down && handlers.down(pos(e)); };
    const move = e => { if (handlers.move) handlers.move(pos(e)); };
    const up = e => { if (handlers.up) handlers.up(pos(e)); };
    cv.addEventListener('pointerdown', down);
    if (handlers.move) cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    onCleanup.push(() => {
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
    });
  }
  function bindKeys(map) {
    const fn = e => { if (map[e.key] || map[e.code]) { e.preventDefault(); map[e.key] || map[e.code]; (map[e.key] || map[e.code])(); } };
    window.addEventListener('keydown', fn);
    onCleanup.push(() => window.removeEventListener('keydown', fn));
  }

  /* 暂停时停止逻辑用的小工具 */
  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  return {
    cleanup, defer, quizGate, award, setEnergy, win, fail,
    setReplay, replay, canvas, loop, bindInput, bindKeys, aabb, clamp
  };
})();

window.GameKit = GameKit;
