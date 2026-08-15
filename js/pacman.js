/* ============================================================
   EduQuest · pacman.js
   吃豆人主题：在迷宫里吃豆子，先自由吃一会儿，到检查点用英语答题，
   答对继续吃豆前进。复用 playquiz.js（maze 皮肤）。
   ============================================================ */
'use strict';

const PacMan = (() => {
  const THEME = {
    id: 'pacman', icon: '🟡', name: '吃豆人', trail: 'maze',
    bg: 'linear-gradient(#000 0%, #0a0a2a 60%, #000 100%)',
    player: '🟡', goal: '🍒',
    tip: '在迷宫里吃豆子！先吃一会儿，到检查点用英语答题，答对继续吃豆前进。',
    qTitle: '🟡 吃豆人 · 答对继续吃', qSub: '用英语吃光豆子',
    checkLabel: (c, t) => '· ' + c + '/' + t,
    passText: '豆子吃完，前进！',
    winTitle: '迷宫通关！', winText: '你吃光了所有豆子，逃出了迷宫！'
  };
  function play(u) {
    Audio2.click();
    PlayQuiz.run({ unit: u, theme: THEME, total: Math.max(4, Math.min(u.vocab.length, 7)), cfg: { freeMs: 11000 } });
  }
  function quit() { PlayQuiz.quit(); }
  return { play, quit };
})();

window.PacMan = PacMan;
