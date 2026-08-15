/* ============================================================
   EduQuest · candcrush.js
   糖果传奇主题：交换糖果连成三消，先自由玩一会儿，
   到检查点用英语答题，答对消除一大片前进。复用 playquiz.js（match 皮肤）。
   ============================================================ */
'use strict';

const CandyCrush = (() => {
  const THEME = {
    id: 'candcrush', icon: '🍬', name: '糖果传奇', trail: 'match',
    bg: 'linear-gradient(#ffd6f0 0%, #ffb3e6 50%, #c98aef 100%)',
    player: '🍬', goal: '🍭',
    tip: '交换糖果连成三消！先玩一会儿，到检查点用英语答题，答对消除一大片前进。',
    qTitle: '🍬 糖果消除 · 答对消除', qSub: '用英语让糖果连成线',
    checkLabel: (c, t) => '🍭 ' + c + '/' + t,
    passText: '甜蜜消除！',
    winTitle: '糖果通关！', winText: '你用英语消除了所有糖果关卡！'
  };
  function play(u) {
    Audio2.click();
    PlayQuiz.run({ unit: u, theme: THEME, total: Math.max(4, Math.min(u.vocab.length, 7)), cfg: { freeMs: 11000 } });
  }
  function quit() { PlayQuiz.quit(); }
  return { play, quit };
})();

window.CandyCrush = CandyCrush;
