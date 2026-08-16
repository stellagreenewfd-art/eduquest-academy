/* ============================================================
   EduQuest · sprites.js  —  原创像素手绘精灵库（canvas 程序化绘制）
   风格贴近经典游戏，但全部为原创形象，避免侵权。
   锚点约定：
     · hero / explorer / kid / zombie / goomba / 植物 ：底部居中 (cx, footY)
     · bird / pig / coin / ghost / pacman             ：中心 (cx, cy)
   用法：Sprites.hero(ctx, cx, footY, h)  高度 h 以像素计（约 42）
   ============================================================ */
'use strict';

const Sprites = (() => {

  /* ---------- 平台跳跃英雄（朝右奔跑，红帽蓝背带裤，原创） ---------- */
  function hero(ctx, cx, footY, h) {
    const s = h / 16;
    ctx.save();
    // 影子
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, footY, 10 * s, 3 * s, 0, 0, 7); ctx.fill();
    // 鞋
    ctx.fillStyle = '#5a3217';
    ctx.fillRect(cx - 7 * s, footY - 3 * s, 6 * s, 3 * s);
    ctx.fillRect(cx + 1 * s, footY - 3 * s, 7 * s, 3 * s);
    // 腿
    ctx.fillStyle = '#1f4f9c';
    ctx.fillRect(cx - 6 * s, footY - 8 * s, 5 * s, 5 * s);
    ctx.fillRect(cx + 1 * s, footY - 8 * s, 5 * s, 5 * s);
    // 身体（背带裤）
    ctx.fillStyle = '#2f6fd0';
    ctx.fillRect(cx - 7 * s, footY - 13 * s, 14 * s, 6 * s);
    // 红衫手臂（前臂前伸）
    ctx.fillStyle = '#e23b2e';
    ctx.fillRect(cx - 9 * s, footY - 13 * s, 3 * s, 5 * s);
    ctx.fillRect(cx + 7 * s, footY - 13 * s, 4 * s, 5 * s);
    // 背带
    ctx.fillStyle = '#1f4f9c';
    ctx.fillRect(cx - 5 * s, footY - 16 * s, 2 * s, 3 * s);
    ctx.fillRect(cx + 3 * s, footY - 16 * s, 2 * s, 3 * s);
    // 脸
    ctx.fillStyle = '#ffc48a';
    ctx.beginPath(); ctx.arc(cx, footY - 17 * s, 6 * s, 0, 7); ctx.fill();
    // 鼻（朝右）
    ctx.beginPath(); ctx.arc(cx + 6 * s, footY - 16 * s, 2 * s, 0, 7); ctx.fill();
    // 帽
    ctx.fillStyle = '#e23b2e';
    ctx.fillRect(cx - 7 * s, footY - 22 * s, 14 * s, 4 * s);
    ctx.fillRect(cx + 3 * s, footY - 20 * s, 9 * s, 3 * s); // 帽檐朝右
    ctx.fillStyle = '#a01818';
    ctx.fillRect(cx - 7 * s, footY - 19 * s, 14 * s, 1 * s);
    // 眼（朝右）
    ctx.fillStyle = '#222';
    ctx.fillRect(cx + 2 * s, footY - 18 * s, 1.6 * s, 2 * s);
    // 腮红
    ctx.fillStyle = 'rgba(255,120,120,0.5)';
    ctx.beginPath(); ctx.arc(cx + 3 * s, footY - 14 * s, 1.6 * s, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* ---------- 探险者（神庙逃亡，朝右跑，宽檐帽+背包，原创） ---------- */
  function explorer(ctx, cx, footY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, footY, 10 * s, 3 * s, 0, 0, 7); ctx.fill();
    // 背包
    ctx.fillStyle = '#b9852f';
    ctx.fillRect(cx - 11 * s, footY - 14 * s, 6 * s, 9 * s);
    ctx.fillStyle = '#8a5a1f';
    ctx.fillRect(cx - 11 * s, footY - 11 * s, 6 * s, 2 * s);
    // 鞋
    ctx.fillStyle = '#5a3217';
    ctx.fillRect(cx - 5 * s, footY - 3 * s, 5 * s, 3 * s);
    ctx.fillRect(cx + 1 * s, footY - 3 * s, 5 * s, 3 * s);
    // 腿（卡其）
    ctx.fillStyle = '#caa46a';
    ctx.fillRect(cx - 5 * s, footY - 8 * s, 4 * s, 5 * s);
    ctx.fillRect(cx + 1 * s, footY - 8 * s, 4 * s, 5 * s);
    // 上衣（青绿）
    ctx.fillStyle = '#2fb6a8';
    ctx.fillRect(cx - 7 * s, footY - 13 * s, 14 * s, 6 * s);
    ctx.fillRect(cx + 6 * s, footY - 13 * s, 3 * s, 5 * s);
    // 头
    ctx.fillStyle = '#ffc48a';
    ctx.beginPath(); ctx.arc(cx + 1 * s, footY - 17 * s, 6 * s, 0, 7); ctx.fill();
    // 宽檐帽
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(cx - 8 * s, footY - 20 * s, 17 * s, 2 * s);
    ctx.fillRect(cx - 5 * s, footY - 25 * s, 11 * s, 5 * s);
    // 眼（朝右）
    ctx.fillStyle = '#222';
    ctx.fillRect(cx + 3 * s, footY - 18 * s, 1.6 * s, 2 * s);
    ctx.restore();
  }

  /* ---------- 双人成行：小孩（可指定上衣/帽子色） ---------- */
  function kid(ctx, cx, footY, h, shirt, hat) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, footY, 9 * s, 3 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a3217';
    ctx.fillRect(cx - 5 * s, footY - 3 * s, 5 * s, 3 * s);
    ctx.fillRect(cx + 1 * s, footY - 3 * s, 5 * s, 3 * s);
    ctx.fillStyle = shirt;
    ctx.fillRect(cx - 6 * s, footY - 13 * s, 12 * s, 6 * s);
    ctx.fillRect(cx + 6 * s, footY - 13 * s, 3 * s, 5 * s);
    ctx.fillStyle = '#ffc48a';
    ctx.beginPath(); ctx.arc(cx, footY - 17 * s, 6 * s, 0, 7); ctx.fill();
    ctx.fillStyle = hat;
    ctx.fillRect(cx - 7 * s, footY - 22 * s, 14 * s, 4 * s);
    ctx.fillRect(cx + 3 * s, footY - 20 * s, 7 * s, 3 * s);
    ctx.fillStyle = '#222';
    ctx.fillRect(cx + 2 * s, footY - 18 * s, 1.6 * s, 2 * s);
    ctx.restore();
  }

  /* ---------- 僵尸（朝左行进，破衣绿皮，原创） ---------- */
  function zombie(ctx, cx, footY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, footY, 10 * s, 3 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3f5a33';
    ctx.fillRect(cx - 5 * s, footY - 8 * s, 4 * s, 8 * s);
    ctx.fillRect(cx + 1 * s, footY - 8 * s, 4 * s, 8 * s);
    // 破上衣
    ctx.fillStyle = '#6b8e5a';
    ctx.fillRect(cx - 7 * s, footY - 13 * s, 14 * s, 6 * s);
    ctx.fillStyle = '#577a47';
    ctx.fillRect(cx - 7 * s, footY - 10 * s, 14 * s, 1 * s);
    // 前伸手臂（朝左）
    ctx.fillStyle = '#7aa869';
    ctx.fillRect(cx - 13 * s, footY - 12 * s, 7 * s, 3 * s);
    // 头
    ctx.fillStyle = '#8fbf72';
    ctx.beginPath(); ctx.arc(cx, footY - 16 * s, 6 * s, 0, 7); ctx.fill();
    // 眼（朝左）
    ctx.fillStyle = '#222';
    ctx.fillRect(cx - 6 * s, footY - 17 * s, 2 * s, 2 * s);
    // 嘴
    ctx.fillStyle = '#3a4a2a';
    ctx.fillRect(cx - 6 * s, footY - 13 * s, 5 * s, 1.5 * s);
    ctx.restore();
  }

  /* ---------- 愤怒小鸟（红色圆鸟，朝右，怒眉；bomb=炸弹鸟） ---------- */
  function bird(ctx, cx, cy, r, bomb) {
    ctx.save();
    const body = bomb ? '#3a3a3a' : '#e23b2e';
    const dk = bomb ? '#1c1c1c' : '#a01818';
    const belly = bomb ? '#5a5a5a' : '#f4a59b';
    // 身体
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    // 肚皮
    ctx.fillStyle = belly;
    ctx.beginPath(); ctx.arc(cx, cy + r * 0.35, r * 0.62, 0.15, Math.PI - 0.15); ctx.fill();
    // 怒眉
    ctx.strokeStyle = dk; ctx.lineWidth = r * 0.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - r * 0.55, cy - r * 0.45); ctx.lineTo(cx - r * 0.05, cy - r * 0.18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + r * 0.55, cy - r * 0.45); ctx.lineTo(cx + r * 0.05, cy - r * 0.18); ctx.stroke();
    // 眼白 + 瞳（朝右）
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.05, r * 0.24, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.26, cy - r * 0.05, r * 0.24, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - r * 0.16, cy - r * 0.02, r * 0.11, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.38, cy - r * 0.02, r * 0.11, 0, 7); ctx.fill();
    // 喙（朝右）
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.68, cy + r * 0.02);
    ctx.lineTo(cx + r * 1.08, cy - r * 0.06);
    ctx.lineTo(cx + r * 0.68, cy + r * 0.28);
    ctx.closePath(); ctx.fill();
    if (bomb) {
      ctx.strokeStyle = '#999'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.35, cy - r * 1.35); ctx.stroke();
      ctx.fillStyle = '#ff7a00'; ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 1.35, 3.5, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- 绿猪（圆润，朝前，原创） ---------- */
  function pig(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#7ac74f';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#5fae3a';
    ctx.beginPath(); ctx.arc(cx, cy + r * 0.5, r * 0.6, 0.2, Math.PI - 0.2); ctx.fill();
    // 耳
    ctx.fillStyle = '#7ac74f';
    ctx.beginPath(); ctx.moveTo(cx - r * 0.6, cy - r * 0.7); ctx.lineTo(cx - r * 0.3, cy - r * 0.95); ctx.lineTo(cx - r * 0.15, cy - r * 0.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + r * 0.6, cy - r * 0.7); ctx.lineTo(cx + r * 0.3, cy - r * 0.95); ctx.lineTo(cx + r * 0.15, cy - r * 0.5); ctx.fill();
    // 口鼻
    ctx.fillStyle = '#5fae3a';
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.15, r * 0.45, r * 0.32, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3d7a22';
    ctx.beginPath(); ctx.arc(cx - r * 0.15, cy + r * 0.15, r * 0.1, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.15, cy + r * 0.15, r * 0.1, 0, 7); ctx.fill();
    // 眼
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.1, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.2, r * 0.1, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* ---------- 金币 ---------- */
  function coin(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#ffcf3f';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#e0a91f';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.font = 'bold ' + (r * 1.3) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy + r * 0.05);
    ctx.restore();
  }

  /* ---------- 板栗怪（马里奥敌人，原创圆头） ---------- */
  function goomba(ctx, cx, footY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, footY, 9 * s, 3 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.ellipse(cx, footY - 7 * s, 9 * s, 8 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(cx - 9 * s, footY - 1 * s, 18 * s, 2 * s);
    // 眼
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 3.5 * s, footY - 9 * s, 3 * s, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3.5 * s, footY - 9 * s, 3 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 3.5 * s, footY - 9 * s, 1.4 * s, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3.5 * s, footY - 9 * s, 1.4 * s, 0, 7); ctx.fill();
    // 眉
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1.6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 6 * s, footY - 12 * s); ctx.lineTo(cx - 1 * s, footY - 11 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 6 * s, footY - 12 * s); ctx.lineTo(cx + 1 * s, footY - 11 * s); ctx.stroke();
    ctx.restore();
  }

  /* ---------- 吃豆人（开口朝运动方向） ---------- */
  function pacman(ctx, cx, cy, r, dx, dy) {
    const ang = Math.atan2(dy, dx);
    ctx.save();
    ctx.fillStyle = '#ffe23d';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, ang + 0.32, ang - Math.PI * 2 + 0.32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx + Math.cos(ang - 0.45) * r * 0.35, cy + Math.sin(ang - 0.45) * r * 0.35, r * 0.12, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* ---------- 幽灵（pacman，可受惊蓝脸） ---------- */
  function ghost(ctx, cx, cy, r, color, fright) {
    ctx.save();
    ctx.fillStyle = fright ? '#2b6cff' : color;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0);
    ctx.lineTo(cx + r, cy + r * 0.7);
    const n = 4;
    for (let i = 0; i < n; i++) {
      const x1 = cx + r - (i + 0.5) * (2 * r / n);
      const x2 = cx + r - (i + 1) * (2 * r / n);
      ctx.lineTo(x1, cy + r * 0.45);
      ctx.lineTo(x2, cy + r * 0.7);
    }
    ctx.closePath(); ctx.fill();
    if (fright) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx - r * 0.3, cy, r * 0.18, 0, 7); ctx.arc(cx + r * 0.3, cy, r * 0.18, 0, 7); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(cx - r * 0.3, cy + r * 0.12, r * 0.1, 0, 7); ctx.arc(cx + r * 0.3, cy + r * 0.12, r * 0.1, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx - r * 0.32, cy - r * 0.2, r * 0.3, 0, 7); ctx.arc(cx + r * 0.32, cy - r * 0.2, r * 0.3, 0, 7); ctx.fill();
      ctx.fillStyle = '#2233aa';
      ctx.beginPath(); ctx.arc(cx - r * 0.32, cy - r * 0.2, r * 0.15, 0, 7); ctx.arc(cx + r * 0.32, cy - r * 0.2, r * 0.15, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- 植物系列（底部居中 cx, baseY） ---------- */
  function sunflower(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = '#3fa34d';
    ctx.fillRect(cx - 1.5 * s, baseY - 9 * s, 3 * s, 9 * s);
    const cy = baseY - 12 * s;
    ctx.fillStyle = '#ffd23f';
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 6.5 * s, cy + Math.sin(a) * 6.5 * s, 3 * s, 2 * s, a, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = '#a9661f';
    ctx.beginPath(); ctx.arc(cx, cy, 5 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 2 * s, cy - 1 * s, 1.6 * s, 0, 7); ctx.arc(cx + 2 * s, cy - 1 * s, 1.6 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 2 * s, cy - 1 * s, 0.8 * s, 0, 7); ctx.arc(cx + 2 * s, cy - 1 * s, 0.8 * s, 0, 7); ctx.fill();
    ctx.restore();
  }

  function peashooter(ctx, cx, baseY, h, color) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = '#3fa34d';
    ctx.fillRect(cx - 1.5 * s, baseY - 9 * s, 3 * s, 9 * s);
    const cy = baseY - 12 * s;
    ctx.fillStyle = color || '#5bbf3a';
    ctx.beginPath(); ctx.arc(cx, cy, 6 * s, 0, 7); ctx.fill();
    ctx.fillStyle = (color === '#7fd0e8') ? '#5bb6d6' : '#3a8f2a';
    ctx.beginPath(); ctx.arc(cx + 5.5 * s, cy, 3 * s, -0.7, 0.7); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 2 * s, cy - 2 * s, 2 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 1 * s, cy - 2 * s, 1 * s, 0, 7); ctx.fill();
    ctx.restore();
  }

  function repeater(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = '#3fa34d';
    ctx.fillRect(cx - 1.5 * s, baseY - 9 * s, 3 * s, 9 * s);
    const cy = baseY - 12 * s;
    ctx.fillStyle = '#4fae33';
    ctx.beginPath(); ctx.arc(cx - 2 * s, cy, 5 * s, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3 * s, cy, 5 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a8f2a';
    ctx.beginPath(); ctx.arc(cx + 7 * s, cy, 2.6 * s, -0.7, 0.7); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx + 3 * s, cy - 2 * s, 1.8 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx + 4 * s, cy - 2 * s, 0.9 * s, 0, 7); ctx.fill();
    ctx.restore();
  }

  function wallnut(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = '#c8924a';
    ctx.beginPath(); ctx.ellipse(cx, baseY - 8 * s, 7 * s, 9 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#a9742f';
    ctx.fillRect(cx - 7 * s, baseY - 8 * s, 14 * s, 1.5 * s);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 3 * s, baseY - 10 * s, 2 * s, 0, 7); ctx.arc(cx + 3 * s, baseY - 10 * s, 2 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 3 * s, baseY - 10 * s, 1 * s, 0, 7); ctx.arc(cx + 3 * s, baseY - 10 * s, 1 * s, 0, 7); ctx.fill();
    ctx.restore();
  }

  function cherry(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.strokeStyle = '#3fa34d'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx - 1 * s, baseY - 11 * s, cx - 5 * s, baseY - 12 * s);
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + 1 * s, baseY - 11 * s, cx + 5 * s, baseY - 12 * s);
    ctx.stroke();
    ctx.fillStyle = '#e8392e';
    ctx.beginPath(); ctx.arc(cx - 5 * s, baseY - 7 * s, 4.5 * s, 0, 7); ctx.arc(cx + 5 * s, baseY - 7 * s, 4.5 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff8a7a';
    ctx.beginPath(); ctx.arc(cx - 6.5 * s, baseY - 9 * s, 1.4 * s, 0, 7); ctx.arc(cx + 3.5 * s, baseY - 9 * s, 1.4 * s, 0, 7); ctx.fill();
    ctx.restore();
  }

  function potatomine(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = '#9b8a5a';
    ctx.beginPath(); ctx.ellipse(cx, baseY - 2 * s, 7 * s, 4 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a6c40';
    ctx.fillRect(cx - 1 * s, baseY - 9 * s, 2 * s, 7 * s);
    ctx.fillStyle = '#6b5e36';
    ctx.fillRect(cx - 3 * s, baseY - 4 * s, 6 * s, 1.5 * s);
    ctx.restore();
  }

  function chomper(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.fillStyle = '#3fa34d';
    ctx.fillRect(cx - 1.5 * s, baseY - 9 * s, 3 * s, 9 * s);
    // 嘴（张开）
    ctx.fillStyle = '#c84d6e';
    ctx.beginPath(); ctx.arc(cx, baseY - 12 * s, 8 * s, 0.1, Math.PI - 0.1); ctx.fill();
    // 牙
    ctx.fillStyle = '#fff';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 2.8 * s, baseY - 19 * s);
      ctx.lineTo(cx + i * 2.8 * s - 1.3 * s, baseY - 14 * s);
      ctx.lineTo(cx + i * 2.8 * s + 1.3 * s, baseY - 14 * s);
      ctx.fill();
    }
    // 茎
    ctx.fillStyle = '#2f8a36';
    ctx.fillRect(cx - 1 * s, baseY - 20 * s, 2 * s, 3 * s);
    ctx.restore();
  }

  /* 按类型分发植物绘制 */
  function plant(ctx, type, cx, baseY, h) {
    switch (type) {
      case 'sunflower': return sunflower(ctx, cx, baseY, h);
      case 'peashooter': return peashooter(ctx, cx, baseY, h, '#5bbf3a');
      case 'repeater': return repeater(ctx, cx, baseY, h);
      case 'icepea': return peashooter(ctx, cx, baseY, h, '#7fd0e8');
      case 'wallnut': return wallnut(ctx, cx, baseY, h);
      case 'cherry': return cherry(ctx, cx, baseY, h);
      case 'potatomine': return potatomine(ctx, cx, baseY, h);
      case 'chomper': return chomper(ctx, cx, baseY, h);
      default: return peashooter(ctx, cx, baseY, h, '#5bbf3a');
    }
  }

  return { hero, explorer, kid, zombie, bird, pig, coin, goomba, pacman, ghost, plant };
})();

window.Sprites = Sprites;
