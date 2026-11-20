// ═══════ 텐트 v2: 닫힌 외관 + 아늑한 실내 ═══════
(function () {
  const U = 64; // 타일당 64px로 그려서 32로 축소 (선명)
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const OUTL = '#3a2216';
  // ── 타일: 실내 바닥/바깥 어둠 ──
  const tcache = {};
  function tentTile(id, v) {
    const k = id + '|' + (v & 3); if (tcache[k]) return tcache[k];
    const c = mkc(64, 64), g = c.getContext('2d');
    if (id === T.TWALL) { g.fillStyle = '#120a07'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#1a100b'; for (let i = 0; i < 6; i++) g.fillRect((v * 13 + i * 23) % 60, (v * 7 + i * 17) % 60, 3, 3); }
    else { g.fillStyle = '#4a3322'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#5a3f2a'; for (let i = 0; i < 9; i++) g.fillRect((v * 11 + i * 19) % 58, (v * 5 + i * 13) % 58, 6, 4); g.fillStyle = '#3a2618'; for (let i = 0; i < 5; i++) g.fillRect((v * 17 + i * 29) % 60, (v * 3 + i * 23) % 60, 4, 3); }
    return (tcache[k] = c);
  }
  const _ti = tileImg;
  tileImg = function (id, v, pal, castle, frame, under) { if (id === T.TFLOOR || id === T.TWALL) return tentTile(id, v | 0); return _ti(id, v, pal, castle, frame, under); };
  if (typeof MINI_COL !== 'undefined') { MINI_COL[T.TFLOOR] = '#a9733f'; MINI_COL[T.TWALL] = '#140c08'; }

  // ── 바깥 텐트 (9x7 전체를 덮는 닫힌 텐트) ──
  const OX = 0.7, OY = 2.2, CW = 10.4, CH = 9.6;
  let outImg = null;
  function poly(g, pts, fill, stroke, lw) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo((x + OX) * U, (y + OY) * U) : g.moveTo((x + OX) * U, (y + OY) * U)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 4; g.lineJoin = 'round'; g.stroke(); } }
  const P = (x, y) => [(x + OX) * U, (y + OY) * U];
  function buildOut() {
    const c = mkc(CW * U, CH * U), g = c.getContext('2d');
    // 그림자
    g.fillStyle = 'rgba(20,10,0,0.30)'; g.beginPath(); g.ellipse(...P(4.5, 6.9), 4.9 * U, 0.6 * U, 0, 0, 7); g.fill();
    // 줄과 말뚝
    g.strokeStyle = '#d9c8a0'; g.lineWidth = 3;
    for (const [a, b] of [[[0.3, 4.4], [-0.5, 6.7]], [[8.7, 4.4], [9.5, 6.7]], [[1.4, 1.0], [-0.4, 3.0]], [[7.6, 1.0], [9.4, 3.0]]]) { g.beginPath(); g.moveTo(...P(...a)); g.lineTo(...P(...b)); g.stroke(); }
    g.fillStyle = '#6a4224'; for (const [x, y] of [[-0.5, 6.7], [9.5, 6.7], [-0.4, 3.0], [9.4, 3.0]]) { const [px, py] = P(x, y); g.fillRect(px - 5, py - 10, 10, 14); g.fillStyle = '#8a5a30'; g.fillRect(px - 5, py - 10, 10, 4); g.fillStyle = '#6a4224'; }
    // 기둥 (지붕 위로 솟음)
    for (const x of [1.4, 7.6]) { const [px, py] = P(x, -0.35); g.fillStyle = OUTL; g.fillRect(px - 7, py - 4, 14, 1.2 * U); g.fillStyle = '#8a5a30'; g.fillRect(px - 4, py, 8, 1.1 * U); g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(px, py - 2, 8, 0, 7); g.fill(); g.strokeStyle = OUTL; g.lineWidth = 3; g.stroke(); }
    // 지붕 (줄무늬 캔버스)
    const L0 = 0.12, R0 = 8.88, Lt = 1.4, Rt = 7.6, top = 0.75, eave = 4.55, N = 12;
    g.save(); poly(g, [[Lt, top], [Rt, top], [R0, eave], [L0, eave]]); g.clip();
    for (let i = 0; i < N; i++) {
      const b0 = L0 + (R0 - L0) * i / N, b1 = L0 + (R0 - L0) * (i + 1) / N, t0 = Lt + (Rt - Lt) * i / N, t1 = Lt + (Rt - Lt) * (i + 1) / N;
      poly(g, [[t0, top], [t1, top], [b1, eave], [b0, eave]], i % 2 ? '#f3e6c8' : '#c8443a');
    }
    const gr = g.createLinearGradient(0, P(0, top)[1], 0, P(0, eave)[1]); gr.addColorStop(0, 'rgba(255,245,210,0.22)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(70,25,10,0.28)');
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    // 오른쪽 그늘
    const gs = g.createLinearGradient(P(3, 0)[0], 0, P(9, 0)[0], 0); gs.addColorStop(0, 'rgba(0,0,0,0)'); gs.addColorStop(1, 'rgba(40,15,5,0.22)'); g.fillStyle = gs; g.fillRect(0, 0, c.width, c.height);
    // 천 주름 하이라이트
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2; for (let i = 1; i < N; i += 2) { const b = L0 + (R0 - L0) * i / N, t = Lt + (Rt - Lt) * i / N; g.beginPath(); g.moveTo(...P(t + 0.05, top)); g.lineTo(...P(b + 0.06, eave)); g.stroke(); }
    g.restore();
    poly(g, [[Lt, top], [Rt, top], [R0, eave], [L0, eave]], null, OUTL, 5);
    // 용마루
    { const [a, b] = P(Lt - 0.1, top - 0.12); const [cx] = P(Rt + 0.1, 0); g.fillStyle = OUTL; g.fillRect(a, b - 3, cx - a, 0.26 * U + 6); g.fillStyle = '#8a2e26'; g.fillRect(a + 3, b, cx - a - 6, 0.26 * U); g.fillStyle = '#b84a3c'; g.fillRect(a + 3, b, cx - a - 6, 5); }
    // 앞벽
    const fw0 = 0.45, fw1 = 8.55, fy0 = eave - 0.05, fy1 = 6.95;
    poly(g, [[fw0, fy0], [fw1, fy0], [fw1, fy1], [fw0, fy1]], '#eadcbe');
    g.save(); poly(g, [[fw0, fy0], [fw1, fy0], [fw1, fy1], [fw0, fy1]]); g.clip();
    g.fillStyle = '#d6c6a2'; for (let x = 1; x < 9; x++) { const [px, py] = P(x - 0.02, fy0); g.fillRect(px, py, 3, 2.6 * U); }
    g.fillStyle = 'rgba(90,55,25,0.25)'; { const [px, py] = P(fw0, fy1 - 0.28); g.fillRect(px, py, 9 * U, 0.3 * U); }
    const gw = g.createLinearGradient(P(4.5, 0)[0], 0, P(8.6, 0)[0], 0); gw.addColorStop(0, 'rgba(0,0,0,0)'); gw.addColorStop(1, 'rgba(60,30,10,0.2)'); g.fillStyle = gw; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = 'rgba(60,25,10,0.25)'; { const [px, py] = P(fw0, fy0); g.fillRect(px, py, 9 * U, 0.22 * U); }
    g.restore();
    poly(g, [[fw0, fy0], [fw1, fy0], [fw1, fy1], [fw0, fy1]], null, OUTL, 5);
    // 처마 장식 (물결 테두리)
    for (let i = 0; i < 16; i++) { const x = L0 + 0.28 + i * (R0 - L0 - 0.56) / 15; const [px, py] = P(x, eave); g.beginPath(); g.arc(px, py, 0.27 * U, 0, Math.PI); g.closePath(); g.fillStyle = i % 2 ? '#f3e6c8' : '#c8443a'; g.fill(); g.strokeStyle = OUTL; g.lineWidth = 3; g.stroke(); }
    // 창문
    for (const wx of [1.9, 7.1]) { const [px, py] = P(wx - 0.42, 5.35); const w = 0.84 * U, h = 0.62 * U; g.fillStyle = OUTL; g.fillRect(px - 4, py - 4, w + 8, h + 8); g.fillStyle = '#7a4a26'; g.fillRect(px - 1, py - 1, w + 2, h + 2); g.fillStyle = '#ffcf6e'; g.fillRect(px + 3, py + 3, w - 6, h - 6); g.fillStyle = '#ffe9a8'; g.fillRect(px + 3, py + 3, w - 6, 6); g.fillStyle = '#7a4a26'; g.fillRect(px + w / 2 - 2, py, 4, h); g.fillRect(px, py + h / 2 - 2, w, 4); g.fillStyle = '#c8443a'; g.fillRect(px - 6, py - 10, w + 12, 8); g.fillStyle = OUTL; g.fillRect(px - 6, py - 2, w + 12, 2); }
    // 입구 (어두운 안쪽 + 걷어 묶은 천)
    const dl = 3.82, dr = 5.18, dt = 4.95;
    poly(g, [[dl, fy1], [4.5, dt], [dr, fy1]], '#2a160e');
    { const gg = g.createRadialGradient(...P(4.5, 6.7), 4, ...P(4.5, 6.7), 1.3 * U); gg.addColorStop(0, 'rgba(255,190,90,0.75)'); gg.addColorStop(1, 'rgba(255,150,60,0)'); g.save(); poly(g, [[dl, fy1], [4.5, dt], [dr, fy1]]); g.clip(); g.fillStyle = gg; g.fillRect(0, 0, c.width, c.height); g.restore(); }
    poly(g, [[dl, fy1], [4.5, dt], [dr, fy1]], null, OUTL, 4);
    poly(g, [[dl + 0.02, fy1], [4.48, dt + 0.05], [3.55, 5.75], [3.3, fy1]], '#b63a30', OUTL, 4);
    poly(g, [[dr - 0.02, fy1], [4.52, dt + 0.05], [5.45, 5.75], [5.7, fy1]], '#b63a30', OUTL, 4);
    g.fillStyle = '#f2c14e'; for (const x of [3.5, 5.5]) { const [px, py] = P(x, 5.95); g.fillRect(px - 8, py - 3, 16, 6); }
    // 발판
    { const [px, py] = P(3.95, 6.92); g.fillStyle = OUTL; g.fillRect(px - 3, py - 2, 1.1 * U + 6, 0.24 * U + 4); g.fillStyle = '#8a5a30'; g.fillRect(px, py, 1.1 * U, 0.24 * U); g.fillStyle = '#a9733f'; g.fillRect(px, py, 1.1 * U, 4); }
    // 랜턴 걸이
    { const [px, py] = P(5.55, 5.1); g.strokeStyle = OUTL; g.lineWidth = 3; g.beginPath(); g.moveTo(px, py - 14); g.lineTo(px, py); g.stroke(); g.fillStyle = OUTL; g.fillRect(px - 9, py, 18, 22); g.fillStyle = '#ffd27a'; g.fillRect(px - 6, py + 3, 12, 16); g.fillStyle = '#5a3a20'; g.fillRect(px - 10, py - 2, 20, 4); }
    return c;
  }
  window.drawTentOut = function (t, sx, sy, now) {
    if (!outImg) outImg = buildOut();
    const dx = Math.round(t.x * TS - sx - OX * TS), dy = Math.round(t.y * TS - sy - OY * TS);
    ctx.drawImage(outImg, dx, dy, CW * TS, CH * TS);
    // 깃발 (펄럭임)
    const [fx, fy] = [dx + (7.6 + OX) * TS, dy + (OY - 0.35) * TS]; const wv = Math.sin(now / 220) * 3;
    ctx.fillStyle = OUTL; ctx.beginPath(); ctx.moveTo(fx + 2, fy - 2); ctx.lineTo(fx + 28, fy + 5 + wv); ctx.lineTo(fx + 2, fy + 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.moveTo(fx + 3, fy); ctx.lineTo(fx + 24, fy + 5 + wv); ctx.lineTo(fx + 3, fy + 10); ctx.closePath(); ctx.fill();
    // 밤에 창문/입구 불빛
    const nl = S.nl || 0; if (nl > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(0.5, nl * 0.6) * (1 + Math.sin(now / 150) * 0.05);
      for (const [x, y, r] of [[1.9, 5.65, 1.1], [7.1, 5.65, 1.1], [4.5, 6.5, 1.5], [5.55, 5.5, 0.9]]) { const px = dx + (x + OX) * TS, py = dy + (y + OY) * TS; const gg = ctx.createRadialGradient(px, py, 0, px, py, r * TS); gg.addColorStop(0, 'rgba(255,200,110,0.9)'); gg.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = gg; ctx.fillRect(px - r * TS, py - r * TS, r * TS * 2, r * TS * 2); }
      ctx.restore(); }
    drawText('⛺ ' + t.owner + '의 텐트', dx + (4.5 + OX) * TS, dy + (OY - 0.9) * TS, '#ffe0a0', 12);
  };

  // ── 실내 ──
  const IH = 1.7; // 뒷벽 위로 솟는 높이(타일)
  let inImg = null;
  function buildIn() {
    const Wt = GD.TENT_W, Ht = GD.TENT_H, c = mkc(Wt * U, (Ht + IH) * U), g = c.getContext('2d');
    const Q = (x, y) => [x * U, (y + IH) * U];
    const pl = (pts, fill, stroke, lw) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(...Q(x, y)) : g.moveTo(...Q(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 4; g.lineJoin = 'round'; g.stroke(); } };
    // 나무 바닥
    { const [x0, y0] = Q(0.6, 0.9); const w = 7.8 * U, h = 5.4 * U; g.fillStyle = '#9c6836'; g.fillRect(x0, y0, w, h); const ph = U / 2;
      for (let r = 0; r * ph < h; r++) { g.fillStyle = r % 2 ? '#a9733f' : '#a06a37'; g.fillRect(x0, y0 + r * ph, w, ph - 3); g.fillStyle = '#6e4522'; g.fillRect(x0, y0 + r * ph + ph - 3, w, 3); g.fillStyle = 'rgba(255,230,180,0.12)'; g.fillRect(x0, y0 + r * ph, w, 3);
        for (let k = 0; k < 4; k++) { const jx = x0 + ((r * 97 + k * 131) % 7 + k * 2.1) * U; if (jx < x0 + w - 4) { g.fillStyle = '#6e4522'; g.fillRect(jx, y0 + r * ph, 3, ph - 3); } }
        g.fillStyle = 'rgba(80,45,20,0.25)'; for (let k = 0; k < 6; k++) g.fillRect(x0 + ((r * 53 + k * 71) % 120) / 120 * w, y0 + r * ph + 10, 10, 2); } }
    // 뒷벽 (줄무늬 캔버스, 위로 경사)
    const bw = [[1.5, -IH + 0.15], [7.5, -IH + 0.15], [9, 1.0], [0, 1.0]];
    g.save(); pl(bw); g.clip();
    for (let i = 0; i < 14; i++) { const b0 = 9 * i / 14, b1 = 9 * (i + 1) / 14, t0 = 1.5 + 6 * i / 14, t1 = 1.5 + 6 * (i + 1) / 14; pl([[t0, -IH], [t1, -IH], [b1, 1.0], [b0, 1.0]], i % 2 ? '#e6d4b0' : '#a8443a'); }
    { const gg = g.createLinearGradient(0, Q(0, -IH)[1], 0, Q(0, 1)[1]); gg.addColorStop(0, 'rgba(30,10,5,0.45)'); gg.addColorStop(1, 'rgba(255,220,160,0.08)'); g.fillStyle = gg; g.fillRect(0, 0, c.width, c.height); }
    g.restore(); pl(bw, null, OUTL, 5);
    // 옆벽 (안쪽으로 드리운 천)
    for (const side of [0, 1]) {
      const pts = side ? [[9, 1.0], [8.35, 1.0], [8.35, 6.3], [9, 7]] : [[0, 1.0], [0.65, 1.0], [0.65, 6.3], [0, 7]];
      pl(pts, '#cbb994'); g.save(); pl(pts); g.clip();
      for (let y = 1; y < 7; y += 0.5) { g.fillStyle = (y * 2) % 2 ? '#93392f' : '#c9b48c'; const [px, py] = Q(side ? 8.35 : 0, y); g.fillRect(px, py, 0.65 * U, 0.5 * U); }
      const gg = g.createLinearGradient(Q(side ? 9 : 0, 0)[0], 0, Q(side ? 8.35 : 0.65, 0)[0], 0); gg.addColorStop(0, 'rgba(20,8,4,0.55)'); gg.addColorStop(1, 'rgba(0,0,0,0.05)'); g.fillStyle = gg; g.fillRect(0, 0, c.width, c.height);
      g.restore(); pl(pts, null, OUTL, 4);
    }
    // 앞쪽 천 (입구 양옆)
    pl([[0, 6.3], [3.85, 6.3], [3.85, 7], [0, 7]], '#b8a27a', OUTL, 4); pl([[5.15, 6.3], [9, 6.3], [9, 7], [5.15, 7]], '#b8a27a', OUTL, 4);
    g.fillStyle = 'rgba(40,15,5,0.35)'; g.fillRect(...Q(0, 6.75), 9 * U, 0.25 * U);
    // 입구 - 묶은 천
    pl([[3.85, 6.3], [4.15, 6.3], [3.85, 7]], '#a8443a', OUTL, 3); pl([[5.15, 6.3], [4.85, 6.3], [5.15, 7]], '#a8443a', OUTL, 3);
    // 문 앞 매트
    { const [px, py] = Q(4.08, 5.25); g.fillStyle = OUTL; g.fillRect(px - 3, py - 3, 0.84 * U + 6, 0.62 * U + 6); g.fillStyle = '#7a8a4a'; g.fillRect(px, py, 0.84 * U, 0.62 * U); g.fillStyle = '#9aaa5a'; for (let i = 0; i < 4; i++) g.fillRect(px + 4, py + 6 + i * 9, 0.84 * U - 8, 3); }
    // 중앙 기둥 + 용마루
    { const [px, py] = Q(4.5, -IH + 0.05); g.fillStyle = OUTL; g.fillRect(px - 9, py, 18, (IH + 0.9) * U); g.fillStyle = '#8a5a30'; g.fillRect(px - 6, py, 12, (IH + 0.9) * U - 3); g.fillStyle = '#a9733f'; g.fillRect(px - 6, py, 4, (IH + 0.9) * U - 3); }
    { const [a, b] = Q(1.4, -IH); g.fillStyle = OUTL; g.fillRect(a, b - 2, 6.2 * U, 16); g.fillStyle = '#7a4f2a'; g.fillRect(a + 3, b + 1, 6.2 * U - 6, 10); }
    return c;
  }
  window.drawTentInside = function (t, sx, sy, now) {
    if (!inImg) inImg = buildIn();
    const x0 = Math.round(t.x * TS - sx), y0 = Math.round(t.y * TS - sy);
    ctx.drawImage(inImg, x0, y0 - IH * TS, GD.TENT_W * TS, (GD.TENT_H + IH) * TS);
    // 줄전구 (반짝반짝)
    const cols = ['#ffd27a', '#ff8a7a', '#9fe8ff', '#b8ff9a', '#ffb8f0'];
    ctx.strokeStyle = '#3a2216'; ctx.lineWidth = 1.5; ctx.beginPath();
    const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16, x = x0 + (0.5 + u * 8) * TS, sag = Math.sin(u * Math.PI * 2) ** 2 * 10; const y = y0 + (-IH + 0.55 + Math.abs(u - 0.5) * 2.1) * TS + sag; pts.push([x, y]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    pts.forEach(([x, y], i) => { if (i % 1) return; const on = 0.6 + 0.4 * Math.sin(now / 300 + i * 1.7); ctx.globalAlpha = on; ctx.fillStyle = cols[i % 5]; ctx.fillRect(x - 2.5, y, 5, 6); ctx.globalAlpha = on * 0.35; ctx.beginPath(); ctx.arc(x, y + 3, 7, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
    // 중앙 랜턴
    { const px = x0 + 4.5 * TS, py = y0 + 0.15 * TS; ctx.fillStyle = '#3a2216'; ctx.fillRect(px - 6, py, 12, 14); ctx.fillStyle = '#ffd27a'; ctx.fillRect(px - 4, py + 2, 8, 10); ctx.globalAlpha = 0.25 + Math.sin(now / 130) * 0.04; ctx.fillStyle = '#ffcf6e'; ctx.beginPath(); ctx.arc(px, py + 7, 16, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    for (const f of t.furn) drawFurn(ctx, f.k, x0 + f.x * TS, y0 + f.y * TS, now);
    drawText('⛺ ' + t.owner + '의 텐트 안', x0 + GD.TENT_W * TS / 2, y0 - IH * TS - 8, '#ffe0a0', 12);
  };

  // ── 화면 전환 페이드 ──
  const FD = { t: 0, title: '', last: null, lastIn: 0 };
  window.drawMapFade = function () {
    const m = S.map; if (m && m.id !== FD.last) { if (FD.last && (m.inner || FD.lastIn)) { FD.t = performance.now(); FD.title = m.inner ? '⛺ ' + m.name : ''; } FD.last = m.id; FD.lastIn = m.inner ? 1 : 0; }
    if (!FD.t) return; const e = performance.now() - FD.t; if (e > 1400) { FD.t = 0; return; }
    const a = e < 600 ? 1 - e / 600 * 0.15 : Math.max(0, 0.85 - (e - 600) / 800 * 0.85);
    ctx.fillStyle = `rgba(10,5,2,${a})`; ctx.fillRect(0, 0, W, H);
    if (FD.title && e < 1200) { ctx.globalAlpha = Math.min(1, (1200 - e) / 400); drawText(FD.title, W / 2, H / 2, '#ffe0a0', 20); ctx.globalAlpha = 1; }
  };
})();
