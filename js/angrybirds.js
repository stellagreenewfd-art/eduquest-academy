/* ============================================================
   EduQuest · angrybirds.js
   愤怒的小鸟主题：拉动弹弓把小鸟射向绿猪城堡，先自由发射几发，
   到检查点用英语答题，答对推倒城堡前进。复用 playquiz.js（siege 皮肤）。
   ============================================================ */
'use strict';

const AngryBirds = (() => {
  const THEME = {
    id: 'angrybirds', icon: '🐦', name: '愤怒的小鸟', trail: 'siege',
    bg: 'linear-gradient(#bfe9a0 0%, #8ed06a 18%, #6abe30 19%, #57a024 100%)',
    player: '🐦', goal: '🏰',
    tip: '拉动弹弓把小鸟射向绿猪城堡！先玩几发，到检查点用英语答题，答对推倒城堡前进。',
    qTitle: '🐦 射门！用英语击退绿猪', qSub: '答对才能推倒城堡继续',
    checkLabel: (c, t) => '🐷 ' + c + '/' + t,
    passText: '城堡被推倒了！',
    winTitle: '绿猪败退！', winText: '你用英语攻下了所有城堡！'
  };
  function play(u) {
    Audio2.click();
    PlayQuiz.run({ unit: u, theme: THEME, total: Math.max(4, Math.min(u.vocab.length, 7)), cfg: { freeMs: 12000 } });
  }
  function quit() { PlayQuiz.quit(); }
  return { play, quit };
})();

window.AngryBirds = AngryBirds;
