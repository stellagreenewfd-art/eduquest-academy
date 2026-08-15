/* ============================================================
   EduQuest · coop.js
   双人成行主题协作闯关：Cody 和 May 一起冒险，自由走动一段后，
   每到一扇门两人各答一道英语题，都答对才开门前进。题目不再密集。
   ============================================================ */
'use strict';

const Coop = (() => {
  const THEME = {
    id: 'coop', icon: '👫', name: '双人成行', trail: 'coop',
    bg: 'linear-gradient(#caa6e8 0%, #e6d2f5 60%, #6abe30 61%, #57a024 100%)',
    player: '🧑', goal: '🚪',
    tip: 'Cody 和 May 一起冒险！自由走动一会儿，每到一扇门两人各答一题，都答对才开门前进。',
    qTitle: '🤝 合作过关', qSub: '两人各答一道题，都答对才能开门',
    checkLabel: (c, t) => '🚪 ' + c + '/' + t,
    passText: '门开了，一起前进！',
    winTitle: '合作成功！', winText: 'Cody 和 May 一起打开了所有门，配合得太棒了！'
  };
  function play(u) {
    Audio2.click();
    PlayQuiz.run({ unit: u, theme: THEME, total: Math.max(4, Math.min(u.vocab.length, 6)), cfg: { freeMs: 11000, coop: true } });
  }
  function quit() { PlayQuiz.quit(); }
  return { play, quit };
})();

window.Coop = Coop;
