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

  /* ---------- 僵尸（朝左行进，破衣绿皮、凹陷双眼、前伸手臂，原创贴近经典） ---------- */
  /* ---------- 僵尸（朝左行进，经典 PvZ 风：灰绿皮、深色西服、前伸手臂、歪嘴） ---------- */
  function zombie(ctx, cx, footY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // 影子
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, footY, 11 * s, 3 * s, 0, 0, 7); ctx.fill();
    // 腿 + 皮鞋
    ctx.fillStyle = '#3b3f4a';
    ctx.fillRect(cx - 5 * s, footY - 9 * s, 4 * s, 9 * s);
    ctx.fillRect(cx + 1 * s, footY - 9 * s, 4 * s, 9 * s);
    ctx.fillStyle = '#23262e';
    ctx.fillRect(cx - 6 * s, footY - 2 * s, 6 * s, 2.4 * s);
    ctx.fillRect(cx + 1 * s, footY - 2 * s, 6 * s, 2.4 * s);
    // 西服外套（深蓝灰）
    ctx.fillStyle = '#4a5160';
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, footY - 9 * s);
    ctx.lineTo(cx - 7 * s, footY - 15 * s);
    ctx.lineTo(cx + 7 * s, footY - 15 * s);
    ctx.lineTo(cx + 8 * s, footY - 9 * s);
    ctx.closePath(); ctx.fill();
    // 白衬衫 + 领带
    ctx.fillStyle = '#eef1f4';
    ctx.beginPath(); ctx.moveTo(cx - 3 * s, footY - 14 * s); ctx.lineTo(cx + 3 * s, footY - 14 * s); ctx.lineTo(cx + 1.4 * s, footY - 9 * s); ctx.lineTo(cx - 1.4 * s, footY - 9 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b23b3b';
    ctx.beginPath(); ctx.moveTo(cx - 1.3 * s, footY - 13.5 * s); ctx.lineTo(cx + 1.3 * s, footY - 13.5 * s); ctx.lineTo(cx + 0.7 * s, footY - 10 * s); ctx.lineTo(cx - 0.7 * s, footY - 10 * s); ctx.closePath(); ctx.fill();
    // 前伸手臂（朝左，绿手）
    ctx.strokeStyle = '#4a5160'; ctx.lineWidth = 3.4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 6 * s, footY - 12 * s); ctx.lineTo(cx - 13 * s, footY - 11 * s); ctx.stroke();
    ctx.fillStyle = '#8fbf72';
    ctx.beginPath(); ctx.arc(cx - 14 * s, footY - 11 * s, 2.6 * s, 0, 7); ctx.fill();
    // 脖颈 + 头（灰绿皮）
    const hy = footY - 19.5 * s;
    ctx.fillStyle = '#8fbf72';
    ctx.fillRect(cx - 2.6 * s, footY - 17 * s, 5.2 * s, 3 * s);
    ctx.fillStyle = '#9ecb7e';
    ctx.beginPath(); ctx.arc(cx, hy, 6.8 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#86b368';
    ctx.beginPath(); ctx.arc(cx + 3 * s, hy + 2 * s, 5 * s, 0, 7); ctx.fill();
    // 凹陷黑眼（朝左）
    ctx.fillStyle = '#2c3a26';
    ctx.beginPath(); ctx.ellipse(cx - 3.8 * s, hy - 1 * s, 2.1 * s, 2.6 * s, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 0.6 * s, hy - 1 * s, 2.1 * s, 2.6 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#d6eac2';
    ctx.beginPath(); ctx.arc(cx - 4.4 * s, hy - 1.8 * s, 0.8 * s, 0, 7); ctx.arc(cx, hy - 1.8 * s, 0.8 * s, 0, 7); ctx.fill();
    // 眉
    ctx.strokeStyle = '#5f7a48'; ctx.lineWidth = 1.4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 6.2 * s, hy - 3.8 * s); ctx.lineTo(cx - 1.4 * s, hy - 2.8 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 2.6 * s, hy - 2.8 * s); ctx.lineTo(cx - 1.4 * s, hy - 2.8 * s); ctx.stroke();
    // 歪张嘴（露牙）
    ctx.fillStyle = '#3a452f';
    ctx.beginPath(); ctx.ellipse(cx - 1.5 * s, hy + 4 * s, 3 * s, 2.1 * s, -0.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx - 1.5 * s + i * 2 * s, hy + 2.4 * s); ctx.lineTo(cx - 1.5 * s + i * 2 * s - 0.9 * s, hy + 4 * s); ctx.lineTo(cx - 1.5 * s + i * 2 * s + 0.9 * s, hy + 4 * s); ctx.fill(); }
    // 头顶乱发
    ctx.strokeStyle = '#5f7a48'; ctx.lineWidth = 1.4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 2 * s, hy - 6.2 * s); ctx.lineTo(cx - 3 * s, hy - 8 * s); ctx.moveTo(cx, hy - 6.4 * s); ctx.lineTo(cx, hy - 8.4 * s); ctx.moveTo(cx + 2 * s, hy - 6.2 * s); ctx.lineTo(cx + 3 * s, hy - 8 * s); ctx.stroke();
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

  /* ============================================================
  /* ============================================================
     植物系列（底部居中 cx, baseY）—— 原创、贴近经典 PvZ 形象、带描边
     ============================================================ */
  function _stem(ctx, cx, baseY, topY, w) {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#236b2c';
    ctx.fillStyle = '#46b34e';
    ctx.fillRect(cx - w / 2, topY, w, baseY - topY);
    ctx.strokeRect(cx - w / 2, topY, w, baseY - topY);
    ctx.fillStyle = '#2f8a36';
    ctx.fillRect(cx + w / 4, topY, w / 4, baseY - topY);
  }
  function _eyes(ctx, cx, y, s, look) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 2.4 * s, y, 1.9 * s, 0, 7); ctx.arc(cx + 2.4 * s, y, 1.9 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 2.4 * s + look * s, y, 1 * s, 0, 7); ctx.arc(cx + 2.4 * s + look * s, y, 1 * s, 0, 7); ctx.fill();
  }

  // 向日葵：双层黄花瓣 + 棕脸 + 笑脸
  function sunflower(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round';
    _stem(ctx, cx, baseY, baseY - 9 * s, 3 * s);
    const cy = baseY - 12 * s;
    for (let layer = 0; layer < 2; layer++) {
      const len = layer ? 6 * s : 8.5 * s, col = layer ? '#ffd23f' : '#ffb300';
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2 + layer * 0.26;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(0, -len, 3 * s, 5 * s, 0, 0, 7); ctx.fill();
        ctx.restore();
      }
    }
    ctx.fillStyle = '#caa23a'; ctx.beginPath(); ctx.arc(cx, cy, 6.4 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a4a14'; ctx.beginPath(); ctx.arc(cx, cy, 5.4 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a3410';
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 3 * s, cy + Math.sin(a) * 3 * s, 1 * s, 0, 7); ctx.fill(); }
    _eyes(ctx, cx, cy - 0.5 * s, s, 0);
    ctx.strokeStyle = '#5a3210'; ctx.lineWidth = 1.3 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy + 2 * s, 2.8 * s, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.restore();
  }

  // 豌豆射手：圆绿头 + 朝右炮管 + 眼 + 叶
  function peashooter(ctx, cx, baseY, h, color, headR) {
    const s = h / 16; headR = headR || 6 * s;
    ctx.save();
    ctx.lineJoin = 'round';
    _stem(ctx, cx, baseY, baseY - 9 * s, 3 * s);
    // 叶
    ctx.fillStyle = '#3fa34d';
    ctx.beginPath(); ctx.ellipse(cx - 3 * s, baseY - 6 * s, 4 * s, 2.2 * s, -0.4, 0, 7); ctx.fill();
    const cy = baseY - 12 * s;
    // 炮管（朝右）
    ctx.fillStyle = (color === '#7fd0e8') ? '#5bb6d6' : '#3a8f2a';
    ctx.beginPath(); ctx.ellipse(cx + headR * 0.9, cy, headR * 0.7, headR * 0.6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = (color === '#7fd0e8') ? '#cdeffb' : '#bff09a';
    ctx.beginPath(); ctx.arc(cx + headR * 1.45, cy, headR * 0.3, 0, 7); ctx.fill();
    // 头
    ctx.fillStyle = color || '#5bbf3a';
    ctx.beginPath(); ctx.arc(cx, cy, headR, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.arc(cx - headR * 0.3, cy - headR * 0.35, headR * 0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.arc(cx, cy, headR, 0, 7); ctx.stroke();
    _eyes(ctx, cx - headR * 0.25, cy - headR * 0.25, s, 1.4);
    ctx.restore();
  }
  function repeater(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round';
    _stem(ctx, cx, baseY, baseY - 9 * s, 3 * s);
    ctx.fillStyle = '#3fa34d';
    ctx.beginPath(); ctx.ellipse(cx - 3 * s, baseY - 6 * s, 4 * s, 2.2 * s, -0.4, 0, 7); ctx.fill();
    const cy = baseY - 12 * s;
    // 后头
    ctx.fillStyle = '#54b232';
    ctx.beginPath(); ctx.arc(cx - 3 * s, cy, 5 * s, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.arc(cx - 4 * s, cy - 2 * s, 2 * s, 0, 7); ctx.fill();
    // 前头 + 双炮管
    ctx.fillStyle = '#3a8f2a';
    ctx.beginPath(); ctx.ellipse(cx + 5 * s, cy, 3 * s, 2.6 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#bff09a'; ctx.beginPath(); ctx.arc(cx + 7.4 * s, cy, 1.3 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#5bbf3a';
    ctx.beginPath(); ctx.arc(cx + 2 * s, cy, 5.4 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(cx + 2 * s, cy, 5.4 * s, 0, 7); ctx.stroke();
    _eyes(ctx, cx + 2 * s, cy - 1.6 * s, s, 1.4);
    ctx.restore();
  }

  // 坚果墙：胖坚果 + 木纹 + 呆萌脸 + 裂纹
  function wallnut(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#c8924a';
    ctx.beginPath(); ctx.ellipse(cx, baseY - 8 * s, 7.8 * s, 9.8 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#a9742f';
    ctx.beginPath(); ctx.ellipse(cx + 2.5 * s, baseY - 8 * s, 5 * s, 7 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e3b878';
    ctx.beginPath(); ctx.ellipse(cx - 3 * s, baseY - 11 * s, 2.4 * s, 3.2 * s, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8a5a24'; ctx.lineWidth = 1.1 * s;
    ctx.beginPath(); ctx.moveTo(cx - 4 * s, baseY - 3 * s); ctx.lineTo(cx + 4 * s, baseY - 3 * s); ctx.stroke();
    ctx.strokeStyle = '#7a4a18'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(cx + 3 * s, baseY - 2 * s); ctx.quadraticCurveTo(cx + 5 * s, baseY - 6 * s, cx + 3 * s, baseY - 10 * s); ctx.stroke();
    ctx.fillStyle = '#5a3210';
    ctx.beginPath(); ctx.arc(cx - 3 * s, baseY - 11 * s, 1.3 * s, 0, 7); ctx.arc(cx + 3 * s, baseY - 11 * s, 1.3 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = '#5a3210'; ctx.lineWidth = 1.3 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, baseY - 6 * s, 2.4 * s, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  }

  // 樱桃炸弹：双红樱桃 + 怒脸 + 引线火花
  function cherry(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = '#3fa34d'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx - 5 * s, baseY - 7 * s); ctx.quadraticCurveTo(cx, baseY - 13 * s, cx + 5 * s, baseY - 7 * s); ctx.stroke();
    ctx.fillStyle = '#e8392e';
    ctx.beginPath(); ctx.arc(cx - 5 * s, baseY - 6 * s, 5.2 * s, 0, 7); ctx.arc(cx + 5 * s, baseY - 6 * s, 5.2 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff8a7a';
    ctx.beginPath(); ctx.arc(cx - 6.6 * s, baseY - 8.2 * s, 1.7 * s, 0, 7); ctx.arc(cx + 3.4 * s, baseY - 8.2 * s, 1.7 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.arc(cx - 5 * s, baseY - 6 * s, 5.2 * s, 0, 7); ctx.arc(cx + 5 * s, baseY - 6 * s, 5.2 * s, 0, 7); ctx.stroke();
    _eyes(ctx, cx - 5 * s, baseY - 7 * s, s, 0); _eyes(ctx, cx + 5 * s, baseY - 7 * s, s, 0);
    ctx.strokeStyle = '#5a1010'; ctx.lineWidth = 1.1 * s;
    ctx.beginPath(); ctx.arc(cx - 5 * s, baseY - 4 * s, 1.9 * s, 3.4, 6.0); ctx.arc(cx + 5 * s, baseY - 4 * s, 1.9 * s, 3.4, 6.0); ctx.stroke();
    ctx.restore();
  }

  // 土豆地雷：半埋土豆 + 触发器 + 眼
  function potatomine(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#9b8a5a';
    ctx.beginPath(); ctx.ellipse(cx, baseY - 1 * s, 7.8 * s, 4.8 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a6c40';
    ctx.beginPath(); ctx.ellipse(cx + 2 * s, baseY - 1 * s, 4.6 * s, 3.2 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#6b5e36';
    ctx.fillRect(cx - 4 * s, baseY - 1 * s, 8 * s, 1.4 * s);
    // 触发器按钮
    ctx.fillStyle = '#cf3b3b'; ctx.beginPath(); ctx.arc(cx, baseY - 8 * s, 2 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff9a9a'; ctx.beginPath(); ctx.arc(cx - 0.6 * s, baseY - 8.6 * s, 0.7 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3fa34d'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(cx, baseY - 2 * s); ctx.lineTo(cx, baseY - 6 * s); ctx.stroke();
    _eyes(ctx, cx, baseY - 2 * s, s, 0);
    ctx.restore();
  }

  // 大嘴花：紫红球茎 + 大嘴白牙 + 独眼
  function chomper(ctx, cx, baseY, h) {
    const s = h / 16;
    ctx.save();
    ctx.lineJoin = 'round';
    _stem(ctx, cx, baseY, baseY - 9 * s, 3 * s);
    const cy = baseY - 14 * s;
    // 下颚
    ctx.fillStyle = '#c84d6e';
    ctx.beginPath(); ctx.arc(cx, cy, 8 * s, 0, Math.PI); ctx.fill();
    // 口腔
    ctx.fillStyle = '#7a2440';
    ctx.beginPath(); ctx.ellipse(cx, cy, 6 * s, 3.4 * s, 0, 0, Math.PI); ctx.fill();
    // 上颚
    ctx.fillStyle = '#e36a88';
    ctx.beginPath(); ctx.arc(cx, cy, 8 * s, Math.PI, Math.PI * 2); ctx.fill();
    // 牙
    ctx.fillStyle = '#fff';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 2.8 * s, cy - 2.6 * s); ctx.lineTo(cx + i * 2.8 * s - 1.3 * s, cy + 1 * s); ctx.lineTo(cx + i * 2.8 * s + 1.3 * s, cy + 1 * s); ctx.fill(); }
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 3 * s, cy + 3 * s); ctx.lineTo(cx + i * 3 * s - 1 * s, cy + 0.4 * s); ctx.lineTo(cx + i * 3 * s + 1 * s, cy + 0.4 * s); ctx.fill(); }
    // 独眼（茎上）
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy - 9 * s, 2.6 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(cx + 0.8 * s, cy - 9 * s, 1.2 * s, 0, 7); ctx.fill();
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

  /* ============================================================
     飞机大战精灵（原创）
     ============================================================ */
  // 玩家战机（朝右绘制，game 内用 scale(-1,1) 镜像为朝上；此处画成朝右的喷气机便于复用）
  function plane(ctx, cx, cy, r, color) {
    const s = r / 14;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, cy + 13 * s, 12 * s, 3 * s, 0, 0, 7); ctx.fill();
    // 机身
    ctx.fillStyle = color || '#3aa0ff';
    ctx.beginPath(); ctx.ellipse(cx, cy, 6 * s, 14 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(cx - 2 * s, cy - 2 * s, 2.5 * s, 8 * s, 0, 0, 7); ctx.fill();
    // 机翼
    ctx.fillStyle = '#2b7fd0';
    ctx.beginPath(); ctx.moveTo(cx - 4 * s, cy); ctx.lineTo(cx - 16 * s, cy + 4 * s); ctx.lineTo(cx - 16 * s, cy + 8 * s); ctx.lineTo(cx - 3 * s, cy + 6 * s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 4 * s, cy); ctx.lineTo(cx + 16 * s, cy + 4 * s); ctx.lineTo(cx + 16 * s, cy + 8 * s); ctx.lineTo(cx + 3 * s, cy + 6 * s); ctx.fill();
    // 尾翼
    ctx.beginPath(); ctx.moveTo(cx - 3 * s, cy + 10 * s); ctx.lineTo(cx - 8 * s, cy + 16 * s); ctx.lineTo(cx + 8 * s, cy + 16 * s); ctx.lineTo(cx + 3 * s, cy + 10 * s); ctx.fill();
    // 座舱
    ctx.fillStyle = '#bfeaff'; ctx.beginPath(); ctx.arc(cx, cy - 5 * s, 3.4 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#1b4f80'; ctx.beginPath(); ctx.arc(cx, cy - 6 * s, 1.6 * s, 0, 7); ctx.fill();
    // 机头灯
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(cx, cy - 13 * s, 2 * s, 0, 7); ctx.fill();
    ctx.restore();
  }
  function enemyPlane(ctx, cx, cy, r, color) {
    const s = r / 13;
    ctx.save();
    ctx.fillStyle = color || '#ff5a4d';
    ctx.beginPath(); ctx.ellipse(cx, cy, 6 * s, 12 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#d6392f';
    ctx.beginPath(); ctx.moveTo(cx - 4 * s, cy); ctx.lineTo(cx - 15 * s, cy - 3 * s); ctx.lineTo(cx - 15 * s, cy - 7 * s); ctx.lineTo(cx - 3 * s, cy - 5 * s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 4 * s, cy); ctx.lineTo(cx + 15 * s, cy - 3 * s); ctx.lineTo(cx + 15 * s, cy - 7 * s); ctx.lineTo(cx + 3 * s, cy - 5 * s); ctx.fill();
    ctx.fillStyle = '#b32a22';
    ctx.beginPath(); ctx.moveTo(cx - 3 * s, cy - 9 * s); ctx.lineTo(cx - 8 * s, cy - 15 * s); ctx.lineTo(cx + 8 * s, cy - 15 * s); ctx.lineTo(cx + 3 * s, cy - 9 * s); ctx.fill();
    ctx.fillStyle = '#ffe2b0'; ctx.beginPath(); ctx.arc(cx, cy + 5 * s, 3 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a1c16'; ctx.beginPath(); ctx.arc(cx, cy + 6 * s, 1.4 * s, 0, 7); ctx.fill();
    ctx.restore();
  }
  function bullet(ctx, x, y, r, color) {
    ctx.save();
    ctx.fillStyle = color || '#ffe23d';
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.6, r * 1.2, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.4, r * 0.25, 0, 7); ctx.fill();
    ctx.restore();
  }
  function enemyBullet(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = '#ff8a3d';
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffd0a0'; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, 7); ctx.fill();
    ctx.restore();
  }
  function boom(ctx, x, y, r, t) {
    ctx.save();
    const a = Math.max(0, 1 - t);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(x, y, r * (0.4 + t * 0.9), 0, 7); ctx.fill();
    ctx.fillStyle = '#ff7a2d';
    ctx.beginPath(); ctx.arc(x, y, r * (0.2 + t * 0.5), 0, 7); ctx.fill();
    ctx.restore();
  }

  return { hero, explorer, kid, zombie, bird, pig, coin, goomba, pacman, ghost, plant, plane, enemyPlane, bullet, enemyBullet, boom };
})();

window.Sprites = Sprites;
