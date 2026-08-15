/* ============================================================
   EduQuest · templerun.js
   神庙逃亡主题：不停向前跑、躲障碍收集金币，先自由跑一段，
   到检查点用英语答题，答对继续冲刺。复用 playquiz.js（race 皮肤）。
   ============================================================ */
'use strict';

const TempleRun = (() => {
  const THEME = {
    id: 'templerun', icon: '🏃', name: '神庙逃亡', trail: 'race',
    bg: 'linear-gradient(#3a2a1a 0%, #6b4a2b 40%, #caa15a 70%, #8a5a2b 100%)',
    player: '🏃', goal: '🏆',
    tip: '不停向前跑，躲避障碍收集金币！跑一段后到检查点用英语答题，答对继续冲刺。',
    qTitle: '🏃 神庙逃亡 · 答对继续跑', qSub: '用英语闯过机关',
    checkLabel: (c, t) => '🪙 ' + c + '/' + t,
    passText: '金币到手，继续冲！',
    winTitle: '逃亡成功！', winText: '你带着宝藏冲出了神庙！'
  };
  function play(u) {
    Audio2.click();
    PlayQuiz.run({ unit: u, theme: THEME, total: Math.max(4, Math.min(u.vocab.length, 7)), cfg: { freeMs: 11000 } });
  }
  function quit() { PlayQuiz.quit(); }
  return { play, quit };
})();

window.TempleRun = TempleRun;
