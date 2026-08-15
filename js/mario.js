/* ============================================================
   EduQuest · mario.js
   超级马里奥主题闯关：跑酷前进，先自由游玩一段，到 ? 检查点才用英语答题，
   答对顶碎砖块继续冲。题目不再密集 —— 全靠共享 playquiz.js 引擎。
   ============================================================ */
'use strict';

const Mario = (() => {
  const THEME = {
    id: 'mario', icon: '🍄', name: '超级马里奥', trail: 'race',
    bg: 'linear-gradient(#7ec8f7 0%, #a5ddf9 62%, #6abe30 63%, #57a024 100%)',
    player: '🏃', goal: '🚩',
    tip: '跑酷前进！先爽玩一会儿，撞到 🚩 检查点才用英语答题，答对顶碎砖块继续冲向旗帜！',
    qTitle: '🍄 顶碎 ? 砖块！', qSub: '用英语答对，马里奥才能继续前进',
    checkLabel: (c, t) => '🍄 ' + c + '/' + t,
    passText: '顶碎砖块，继续跑！',
    winTitle: '通关啦！', winText: '马里奥冲过终点旗帜，本关单词全部掌握！'
  };
  function play(u) {
    Audio2.click();
    PlayQuiz.run({ unit: u, theme: THEME, total: Math.max(4, Math.min(u.vocab.length, 7)), cfg: { freeMs: 12000 } });
  }
  function quit() { PlayQuiz.quit(); }
  return { play, quit };
})();

window.Mario = Mario;
