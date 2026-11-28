// ═══════ 전직 외형: 전직하면 직업 전용 그림으로 바뀜 (탈것·변신보다 아래 단계) ═══════
(function () {
  const CA = window.CLASS_ATLAS; if (!CA) return;
  const CI = new Image(); CI.onload = () => { CI.ok = true; cc.clear(); }; CI.src = 'gfx/classes.png?v=' + (window.BUILDV || 1);
  const T = { warrior: 75, mage: 76, healer: 75, guardian: 70, berserker: 78, elementalist: 78, summoner: 73, ranger: 70, priest: 74, paladin: 76, fortress: 76, blademaster: 76, destroyer: 78, archmage: 80, chronomancer: 80, lichking: 80, hexer: 78, sniper: 76, arcaneArcher: 76, saint: 80, inquisitor: 78 };
  const _csC = charSprite, cc = new Map();
  /* 초기 직업 머리색: 머리 꼭대기에서 시작해 비슷한 색으로 이어진 머리카락만 골라 명암은 살리고 색만 바꿈 */
  function hairTint(im, W, H, t, hc, dir) {
    const D = im.data, hex = HAIRC[hc] || HAIRC[0], tr = parseInt(hex.slice(1, 3), 16), tg = parseInt(hex.slice(3, 5), 16), tb = parseInt(hex.slice(5, 7), 16), tl = 0.3 * tr + 0.59 * tg + 0.11 * tb;
    let bot = t; for (let y = H - 1; y > t; y--) { let any = false; for (let x = 0; x < W; x++) if (D[(y * W + x) * 4 + 3] > 90) { any = true; break; } if (any) { bot = y; break; } }
    const lim = t + (bot - t) * (dir === 3 ? 0.5 : 0.42); let sr = 0, sg = 0, sb = 0, n = 0; const seeds = [];
    for (let y = t; y < t + (bot - t) * 0.1 && n < 60; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (D[i + 3] < 120) continue; const R = D[i], G = D[i + 1], B = D[i + 2]; if (R > 170 && G > 130 && B < 90) continue; if (0.3 * R + 0.59 * G + 0.11 * B < 40) continue; /* 테두리(검은 선)는 씨앗에서 뺌 */ sr += R; sg += G; sb += B; n++; seeds.push(y * W + x); }
    if (!n) return; sr /= n; sg /= n; sb /= n; const rl = Math.max(20, 0.3 * sr + 0.59 * sg + 0.11 * sb);
    const D0 = new Uint8ClampedArray(D), seen = new Uint8Array(W * H);
    /* 머리띠·끈으로 끊긴 머리카락도 잡도록: 머리 윗부분(25%)에서 머리색과 아주 비슷한 픽셀도 씨앗으로 */
    for (let y = t; y < t + (bot - t) * 0.25; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (D[i + 3] < 120) continue; const R = D[i], G = D[i + 1], B = D[i + 2]; if (0.3 * R + 0.59 * G + 0.11 * B < 40) continue; if (Math.abs(R - sr) + Math.abs(G - sg) + Math.abs(B - sb) < 50) seeds.push(y * W + x); }
    const q = seeds.slice(); for (const p of q) seen[p] = 1;
    const ok = p => { const i = p * 4; if (D0[i + 3] < 60) return false; const R = D0[i], G = D0[i + 1], B = D0[i + 2]; if (R > 170 && G > 130 && B < 90) return false; const L = 0.3 * R + 0.59 * G + 0.11 * B; if (L < 28) return true; return Math.abs(R - sr) + Math.abs(G - sg) + Math.abs(B - sb) < 125 && !(R > 190 && G > 150) && !(R > 200 && G > 140 && B > 100); /* 피부색 제외 */ };
    while (q.length) { const p = q.pop(), x = p % W, y = (p / W) | 0; const i = p * 4; const L = 0.3 * D0[i] + 0.59 * D0[i + 1] + 0.11 * D0[i + 2]; if (L >= 28) { const k = Math.min(1.9, L / rl); D[i] = Math.min(255, tr * k + (k > 1 ? (k - 1) * 60 : 0)); D[i + 1] = Math.min(255, tg * k + (k > 1 ? (k - 1) * 60 : 0)); D[i + 2] = Math.min(255, tb * k + (k > 1 ? (k - 1) * 60 : 0)); }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < t || nx >= W || ny > lim) continue; const np = ny * W + nx; if (seen[np]) continue; const j = np * 4; if (L >= 28 && 0.3 * D[j] + 0.59 * D[j + 1] + 0.11 * D[j + 2] >= 28 && Math.abs(D[j] - D0[i]) + Math.abs(D[j + 1] - D0[i + 1]) + Math.abs(D[j + 2] - D0[i + 2]) > 75) continue; /* 이웃끼리 색이 확 바뀌면 머리 경계 */ seen[np] = 1; if (ok(np) && (0.3 * D0[j] + 0.59 * D0[j + 1] + 0.11 * D0[j + 2] >= 28 || L >= 28)) q.push(np); } }
  }
  charSprite = function (ap, dir, frame) {
    const cj = ap && (CA[ap.job] ? ap.job : GD.JOBS[ap.job] && GD.JOBS[ap.job].from); const A = ap && !ap.mt && CI.ok && cj && CA[cj]; if (!A) return _csC(ap, dir, frame);
    const WD = ap.wide ? 110 : 70; /* 탈것용: 넓은 캔버스(큰 무기·날개가 옆에서 잘리지 않게) */ const BASEJ = !GD.JOBS[ap.job] || !GD.JOBS[ap.job].tier, HC = BASEJ ? (ap.hc | 0) : 0; const key = ap.job + ap.g + dir + '|' + frame + (ap.wide ? 'w' : '') + '|' + HC; let c = cc.get(key); if (c) return c;
    const r = (A[ap.g === 'f' ? 'f' : 'm'] || A.m)[['down', 'left', 'right', 'up'][dir] || 'down'];
    const K = 2, s = (T[ap.job] || T[cj] || 74) * (GD.JOBS[ap.job] && GD.JOBS[ap.job].tier === 2 ? 1.06 : 1) / A.m.down[3]; c = document.createElement('canvas'); c.width = WD * K; c.height = 100 * K; const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    const bob = frame === 1 || frame === 3 ? 1.5 : 0, w = r[2] * s, h = r[3] * s;
    g.drawImage(CI, r[0], r[1], r[2], r[3], (WD / 2 - r[4] * s) * K, (94 - h - bob) * K, w * K, h * K);
    c.dw = WD * 0.8; c.dh = 80; /* 탄 모습과 같은 크기(0.8배)로 맞춤 */
    try { const W = c.width, H = c.height, im = g.getImageData(0, 0, W, H), D = im.data; let t = 0; outer: for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (D[(y * W + x) * 4 + 3] > 90) { t = y; break outer; }
      c.headT = t * c.dh / H; /* 머리 꼭대기 위치 → 체력바를 캐릭터 키에 맞춤 */
      if (HC > 0) hairTint(im, W, H, t, HC, dir); g.putImageData(im, 0, 0); } catch (e) { }
    cc.set(key, c); return c;
  };
})();
// ═══════ GPT 아이템·가구·텐트·이펙트·말·버튼 ═══════
(function () {
  const V = '?v=' + (window.BUILDV || 1);
  const L = src => { const i = new Image(); i.onload = () => { i.ok = 1; if (window.S && S.panel && typeof renderPanel === 'function') try { renderPanel(); } catch (e) { } }; i.src = src + V; return i; };
  const IT = L('gfx/items.png'), FXI = L('gfx/fx.png'), HO = L('gfx/horse.png'), TOUT = L('gfx/tent_out.png'), TIN = L('gfx/tent_in.png');
  const IA = window.ITEM_ATLAS || {}, FA = window.FX_ATLAS || {}, HA = window.HORSE_ATLAS || {}, NA = window.NPC_ATLAS || {}; const NPI = L('gfx/npcs.png');
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // ── 아이템 아이콘 (64px) ──
  const _icon = itemIcon, cache = new Map();
  function iconKey(it) {
    if (!it) return null;
    if (it.k === 'gear') {
      if (it.legend && IA['l_' + it.legend]) return ['l_' + it.legend];
      const t0 = it.tier | 0, t = Math.max(0, Math.min(9, t0)), hc = t0 >= 10 ? GD.TIER_COLOR[t0] : null; // 60~100 등급은 최상위 그림 + 등급 색
      if (it.slot === 'weapon') return hc ? ['w_' + it.wt + '_' + t, hc] : ['w_' + it.wt + '_' + t];
      if (IA['a_' + it.slot + '_' + t]) return hc ? ['a_' + it.slot + '_' + t, hc] : ['a_' + it.slot + '_' + t];
      return ['a_' + it.slot + '_' + (t >= 7 ? 4 : 3), GD.TIER_COLOR[t]];
    }
    if (it.k === 'use') return ['u:' + it.id];
    if (it.k === 'mat') return ['m:' + it.id];
    return null;
  }
  itemIcon = function (it) {
    if (it && it.k === 'use' && (it.id === 'hp3' || it.id === 'mp3')) { const ck = 'big|' + it.id + '|' + (IT.ok ? 1 : 0); let c = cache.get(ck); if (c) return c; c = mkc(64, 64); const g = c.getContext('2d'); const base = itemIcon({ k: 'use', id: it.id === 'hp3' ? 'hp2' : 'mp2' });
      const gl = g.createRadialGradient(32, 36, 4, 32, 36, 32); gl.addColorStop(0, it.id === 'hp3' ? '#ffd34daa' : '#9fe8ffaa'); gl.addColorStop(1, '#0000'); g.fillStyle = gl; g.fillRect(0, 0, 64, 64);
      g.drawImage(base, -4, -6, 72, 72); g.fillStyle = '#ffd34d'; g.strokeStyle = '#5a3a00'; g.lineWidth = 1.5; const star = (x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); }; star(50, 14, 9);
      c._ic64 = 1; cache.set(ck, c); return c; }
    if (it && it.k === 'mount') { const ck = 'mt|' + it.id + '|' + (HO.ok ? 1 : 0); let c = cache.get(ck); if (c) return c; c = mkc(64, 64); const MD = GD.MOUNTS[it.id] || {}; const MK = HA[it.id] ? it.id : 'horse';
      if (HO.ok && HA[MK]) { const r = HA[MK].right[0]; const k = Math.min(60 / r[2], 60 / r[3]); const w = r[2] * k, h = r[3] * k; const t = mkc(64, 64), tg = t.getContext('2d'); tg.drawImage(HO, r[0], r[1], r[2], r[3], 32 - w / 2, 62 - h, w, h);
        if (!HA[it.id] && (MD.tint || it.id === 'whiteHorse')) { tg.globalCompositeOperation = 'color'; tg.fillStyle = MD.tint || '#e8e8f0'; tg.fillRect(0, 0, 64, 64); tg.globalCompositeOperation = 'destination-in'; tg.drawImage(HO, r[0], r[1], r[2], r[3], 32 - w / 2, 62 - h, w, h); }
        c.getContext('2d').drawImage(t, 0, 0); } else { const g = c.getContext('2d'); g.font = '40px serif'; g.textAlign = 'center'; g.fillText('🐎', 32, 48); }
      c._ic64 = 1; if (HO.ok) cache.set(ck, c); return c; }
    const k = iconKey(it); if (!k || !IT.ok || !IA[k[0]]) return _icon(it);
    const ck = k.join('|'); let c = cache.get(ck); if (c) return c;
    c = mkc(64, 64); const g = c.getContext('2d'); const [x, y] = IA[k[0]];
    g.drawImage(IT, x, y, 64, 64, 0, 0, 64, 64);
    if (k[1]) { // 상위 등급 방어구: 색 입히기
      const t = mkc(64, 64), tg = t.getContext('2d'); tg.drawImage(c, 0, 0); tg.globalCompositeOperation = 'color'; tg.fillStyle = k[1]; tg.fillRect(0, 0, 64, 64);
      tg.globalCompositeOperation = 'destination-in'; tg.drawImage(c, 0, 0); g.clearRect(0, 0, 64, 64); g.drawImage(t, 0, 0);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18; g.drawImage(t, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    c._ic64 = 1; cache.set(ck, c); return c;
  };
  // 32px 캔버스에 (0,0)으로 그리던 곳 → 캔버스를 64로 키워 선명하게
  const _di = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (img, a, b) {
    if (img && img._ic64 && arguments.length === 3) {
      const cv = this.canvas;
      if (cv.width === 32 && cv.height === 32 && a === 0 && b === 0 && cv.isConnected) {
        if (!cv.style.width) { const cs = getComputedStyle(cv); cv.style.width = cs.width; cv.style.height = cs.height; }
        cv.width = 64; cv.height = 64; this.imageSmoothingEnabled = true; this.imageSmoothingQuality = 'high';
        return _di.call(this, img, 0, 0);
      }
      return _di.call(this, img, a, b, 32, 32);
    }
    return _di.apply(this, arguments);
  };

  // ── 가구 ──
  const _df = drawFurn;
  drawFurn = function (g, k, x, y, t, owner) {
    const r = IA['f:' + k]; if (!IT.ok || !r) return _df(g, k, x, y, t, owner);
    const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true;
    const big = k === 'bed' || k === 'shelf' || k === 'stove' || k === 'door' ? 36 : 32;
    _di.call(g, IT, r[0], r[1], 64, 64, x + 16 - big / 2, y + 32 - big + 2, big, big);
    if (k === 'campfire' || k === 'torch' || k === 'lantern' || k === 'stove') { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 + Math.sin((t || 0) / 110 + x) * 0.06; g.fillStyle = '#ffb040'; g.beginPath(); g.arc(x + 16, y + 12, 14, 0, 7); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    g.imageSmoothingEnabled = sm;
  };

  // ── 텐트 외관/실내 (GPT 그림) ──
  const _to = window.drawTentOut, _ti = window.drawTentInside;
  window.drawTentOut = function (t, sx, sy, now) {
    if (!TOUT.ok) return _to(t, sx, sy, now);
    const w = 10.2 * TS, h = w * TOUT.height / TOUT.width; const cx = (t.x + 4.5) * TS - sx, by = (t.y + 7.1) * TS - sy;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(TOUT, Math.round(cx - w / 2), Math.round(by - h), w, h); ctx.imageSmoothingEnabled = false;
    const nl = S.nl || 0; if (nl > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(0.45, nl * 0.55); for (const [dx, r] of [[-2.7, 1.1], [2.7, 1.1], [0, 1.4]]) { const px = cx + dx * TS, py = by - 1.6 * TS; const gg = ctx.createRadialGradient(px, py, 0, px, py, r * TS); gg.addColorStop(0, 'rgba(255,200,110,.9)'); gg.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = gg; ctx.fillRect(px - r * TS, py - r * TS, 2 * r * TS, 2 * r * TS); } ctx.restore(); }
    drawText('⛺ ' + t.owner + '의 텐트', cx, by - h - 6, '#ffe0a0', 12);
  };
  window.drawTentInside = function (t, sx, sy, now) {
    if (!TIN.ok) return _ti(t, sx, sy, now);
    const tw = t.w || GD.TENT_W, th = t.h || GD.TENT_H; const w = 11 * TS * tw / 9, h = w * TIN.height / TIN.width; const cx = (t.x + tw / 2) * TS - sx, by = (t.y + th - 0.75) * TS - sy;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(TIN, Math.round(cx - w / 2), Math.round(by - h), w, h); ctx.imageSmoothingEnabled = false;
    // 전구 반짝임
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.07 + Math.sin(now / 260) * 0.03; const gg = ctx.createRadialGradient(cx, by - h * 0.62, 0, cx, by - h * 0.62, w * 0.45); gg.addColorStop(0, 'rgba(255,190,90,.9)'); gg.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = gg; ctx.fillRect(cx - w / 2, by - h, w, h); ctx.restore();
    for (const f of t.furn) drawFurn(ctx, f.k, (t.x + f.x) * TS - sx, (t.y + f.y) * TS - sy, now);
    drawText('⛺ ' + t.owner + '의 텐트 안', cx, by - h - 6, '#ffe0a0', 12);
  };

  // ── 스킬 이펙트 ──
  const FXMAP = { slash: 'slash', slash3: 'slash', spin: 'whirl', ring: 'whirl', quake: 'whirl', flame: 'fire', meteor: 'fire', ice: 'ice', bolt: 'bolt', holy: 'heal', bless: 'heal', heal: 'heal', bigheal: 'heal', buff: 'heal' };
  function fxFrame(g, name, k, x, y, size, ground, flipX) {
    const fr = FA[name]; if (!fr) return false;
    const i = Math.min(fr.length - 1, Math.floor(k * fr.length)); const r = fr[i];
    const s = size / 96; const w = r[2] * s, h = r[3] * s;
    g.save(); g.globalAlpha = Math.min(1, (1 - k) * 2.2); g.imageSmoothingEnabled = true; g.translate(x, y); if (flipX) g.scale(-1, 1);
    _di.call(g, FXI, r[0], r[1], r[2], r[3], -w / 2, ground ? -h + 6 : -h / 2, w, h); g.restore(); return true;
  }
  const _dsf = drawSkillFx;
  drawSkillFx = function (g, f, k, x, y) {
    const nm = FXMAP[f.f]; if (!FXI.ok || !nm) return _dsf(g, f, k, x, y);
    const R = (f.r || 1) * TS;
    if (nm === 'fire' && f.f === 'meteor') { if (k < 0.35) { const kk = k / 0.35; fxFrame(g, 'fire', 0.1, x + (1 - kk) * 120, y - (1 - kk) * 200, 70, 0); return; } fxFrame(g, 'fire', 0.4 + (k - 0.35) / 0.65 * 0.6, x, y, Math.max(96, R * 1.6), 0); return; }
    if (nm === 'fire') { fxFrame(g, 'fire', 0.4 + k * 0.6, x, y, Math.max(80, R * 1.6), 0); return; }
    if (nm === 'slash') { fxFrame(g, 'slash', k, x, y - 12, Math.max(70, R * 1.3), 0, f.d === 1); if (f.f === 'slash3') fxFrame(g, 'slash', Math.min(0.99, k + 0.2), x + 6, y - 4, 60, 0, f.d !== 1); return; }
    if (nm === 'whirl') { fxFrame(g, 'whirl', k, x, y, Math.max(80, R * 1.5), 1); return; }
    if (nm === 'ice') { fxFrame(g, 'ice', k, x, y, Math.max(70, R * 1.2), 1); if (R > 40) { fxFrame(g, 'ice', Math.min(0.99, k + 0.15), x - R * 0.5, y + 6, 50, 1); fxFrame(g, 'ice', Math.min(0.99, k + 0.3), x + R * 0.5, y - 4, 50, 1); } return; }
    if (nm === 'bolt') { fxFrame(g, 'bolt', k, x, y, Math.max(90, R * 1.3), 1); return; }
    if (nm === 'heal') { fxFrame(g, 'heal', k, x, y + 4, Math.max(70, R * 1.2), 1); return; }
    return _dsf(g, f, k, x, y);
  };

  // ── 말 탑승 (갈색 말 / 천리 백마) ──
  const _cs = charSprite, hc = new Map();
  charSprite = function (ap, dir, frame) {
    const MD = GD.MOUNTS[ap.mt] || {}; const MK = HA[ap.mt] ? ap.mt : (ap.mt === 'whiteHorse' || MD.tint) ? 'horse' : ap.mt; if (!ap.mt || !HO.ok || !HA[MK]) return _cs(ap, dir, frame);
    const key = JSON.stringify(ap) + dir + frame; let c = hc.get(key); if (c) return c; if (hc.size > 300) hc.clear();
    const rider = (window.formRider && window.formRider(ap, dir)) || _cs(Object.assign({}, ap, { mt: null, wide: 1 }), dir, frame === 1 || frame === 3 ? 0 : frame);
    const d = ['down', 'left', 'right', 'up'][dir] || 'down'; const col = frame === 1 ? 1 : frame === 3 ? 2 : 0; const r = HA[MK][d][col]; const SEAT = ({ horse: [0.42, 0.12], camel: [0.36, 0.06], ostrich: [0.44, 0.0], battleBear: [0.40, 0.10], whiteHorse: [0.44, 0.14], qilin: [0.40, 0.12], phoenix: [0.42, 0.10], skyWhale: [0.30, 0.06], obsidianDragon: [0.40, 0.10], goldScorpion: [0.42, 0.24], frostWolf: [0.42, 0.14], boneDrake: [0.40, 0.14], nightmare: [0.42, 0.12] })[MK] || [0.42, 0.12];
    /* 캔버스를 키워(300) 탈것은 같은 크기, 캐릭터는 내렸을 때와 같은 크기(1:1)로 — 타면 작아지던 문제 */
    c = mkc(380, 470); /* 위로 공간을 더 줘 큰 탈것 위 캐릭터 머리가 잘리지 않게 */ const g = c.getContext('2d'); g.imageSmoothingEnabled = true;
    const HK = Math.min(2.45, 300 / r[2], 300 / r[3]); const hw = r[2] * HK, hh = r[3] * HK; const hx = 190 - hw / 2, hy = 468 - hh; /* 탈것 약 1.4배 크게 */
    let hor = mkc(r[2], r[3]); hor.getContext('2d').drawImage(HO, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
    if (MD.tint && !HA[ap.mt]) { const hg = hor.getContext('2d'); hg.globalCompositeOperation = 'color'; hg.fillStyle = MD.tint; hg.fillRect(0, 0, r[2], r[3]); hg.globalCompositeOperation = 'destination-in'; hg.drawImage(HO, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]); hg.globalCompositeOperation = 'source-over'; }
    if (ap.mt === 'whiteHorse' && !MD.tint && !HA[ap.mt]) { const hg = hor.getContext('2d'); hg.globalCompositeOperation = 'saturation'; hg.fillStyle = '#888'; hg.fillRect(0, 0, r[2], r[3]); hg.globalCompositeOperation = 'screen'; hg.fillStyle = 'rgba(150,150,160,1)'; hg.fillRect(0, 0, r[2], r[3]); hg.globalCompositeOperation = 'destination-in'; hg.drawImage(HO, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]); }
    const seatY = hy + hh * (d === 'left' || d === 'right' ? SEAT[0] : SEAT[0] - 0.04), seatX = 190 + (d === 'left' ? hw * 0.08 : d === 'right' ? -hw * 0.08 : 0);
    // 라이더: 실제 그림 영역(bbox)을 찾아 머리~허리(위 68%)만 잘라 안장 위에 앉힘
    const rb = riderBox(rider); /* 몸 중심 = 그림 가운데(발 기준으로 맞춰 그려짐). 무기·지팡이가 한쪽으로 튀어나와도 몸이 탈것 가운데 오도록 */ const rH = rb.h * 0.68, RS = 1.0; const rw = rb.w * RS, rh = rH * RS;
    const drawRiderAt = (cx, by) => g.drawImage(rider, rb.x, rb.y, rb.w, rH, cx - rw / 2, by - rh, rw, rh);
    const drawRider = () => drawRiderAt(seatX, seatY + 10);
    // 앉은 자세: 옆모습은 상체(위 60%) + 무릎을 굽힌 다리(아래 40%를 짧게·앞으로), 앞/뒤는 탈것 몸통 뒤에 앉아 상체만 보이게
    /* 등 위에 올라탄 모습: 탈것 그림에서 실제 등선(가운데 띠의 맨 윗부분)을 찾아 허리를 그 위에 둔다 */
    const S2 = rider.dw ? rider.dw / rider.width / 0.4 : rider.width === 112 ? 1.25 : 1, /* 기본 직업(옛 그림 112px)은 걸을 때 크기에 맞춰 1.25배 */ rw2 = rb.w * S2, up = rb.h * 0.64, lo = rb.h - up, uh = up * S2, lh = lo * S2 * 0.8;
    const bt = mountBack(hor, d); const topY = hy + bt.top * HK, botY = hy + bt.bot * HK, cxM = hx + bt.cx * HK, span = botY - topY;
    const FR = (MOUNT_SEAT[MK] && MOUNT_SEAT[MK][d]) != null ? MOUNT_SEAT[MK][d] : (d === 'down' ? 0.1 : d === 'up' ? 0.14 : 0.06);
    if (d === 'left' || d === 'right') { // 옆모습: 엉덩이는 등선 위, 다리는 옆구리로
      const fw = d === 'left' ? -1 : 1, waist = Math.max(uh + 2, topY + span * FR + 13), sx0 = cxM - fw * hw * 0.04;
      g.drawImage(hor, hx, hy, hw, hh);
      /* 몸 전체를 한 번에 그림: 엉덩이는 안장 위, 다리는 옆구리로 늘어뜨림 (허리에서 잘려 보이던 문제) */
      const cut = rb.h * 0.6, ux = sx0 - (rider.width / 2 - rb.x) * S2; /* 상체 + 이어지는 하체(다리를 접어 앞으로) — 같은 폭·같은 경계로 이어 잘린 선이 없게 */
      g.drawImage(rider, rb.x, rb.y + cut - 1, rb.w, rb.h - cut + 1, ux + fw * 4, waist - 1, rw2, (rb.h - cut) * S2 * 0.52);
      g.drawImage(rider, rb.x, rb.y, rb.w, cut, ux, waist - cut * S2, rw2, cut * S2);
    } else { // 앞/뒤: 탈것 몸(머리·엉덩이)이 허리 아래를 가리고, 상체만 위로
      /* 앞/뒤: 몸통 높이(안장)에 허리를 두고, 상체(머리~허리)를 탈것 위에 덧그려 '올라탄' 모습으로 — 탈것 머리 뒤에 몸이 숨어 얼굴만 떠 보이던 문제 */
      const sideY = hy + Math.min(bt.side, bt.top + (bt.bot - bt.top) * 0.45) * HK;
      const waist = Math.max(uh + 2, d === 'up' ? Math.max(sideY + 2, topY + uh * 0.6) : topY + uh * 0.42 /* 앞모습: 탈것 머리 바로 뒤에 허리 — 상체는 다 보이고 탈것 얼굴도 보임 */);
      g.drawImage(rider, rb.x, rb.y, rb.w, rb.h, cxM - (rider.width / 2 - rb.x) * S2, waist - uh, rw2, rb.h * S2 * 0.82); // 다리는 탈것 뒤
      g.drawImage(hor, hx, hy, hw, hh);
      { const tc = mkc(Math.ceil(rw2), Math.ceil(uh)), tg = tc.getContext('2d'); tg.drawImage(rider, rb.x, rb.y, rb.w, up, 0, 0, rw2, uh); tg.globalCompositeOperation = 'destination-in'; const gr = tg.createLinearGradient(0, uh * 0.9, 0, uh); gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); tg.fillStyle = gr; tg.fillRect(0, 0, rw2, uh);
        g.drawImage(tc, cxM - (rider.width / 2 - rb.x) * S2, waist - uh); } // 상체는 탈것 위 (허리 아래는 부드럽게 사라져 잘린 선이 안 보임)
    }
    c.dw = 152; c.dh = 188; /* 비율 유지, 전체 0.8배 */ try { const D = g.getImageData(0, 0, 380, 470).data; let t = 0; outer: for (let y = 0; y < 470; y++) for (let x = 80; x < 300; x++) if (D[(y * 380 + x) * 4 + 3] > 80) { t = y; break outer; } c.topOff = (470 - t) * 0.4; } catch (e) { } hc.set(key, c); return c; /* 머리 위치 → 체력바 위치 */
  };

  /* 탈것별 앉는 높이(등선~바닥 사이 비율) 미세 조정 */
  const MOUNT_SEAT = { goldScorpion: { down: 0.3, up: 0.38, left: 0.33, right: 0.33 }, skyWhale: { down: 0.24, up: 0.22 }, phoenix: { down: 0.26, up: 0.28 }, obsidianDragon: { down: 0.24, up: 0.24 }, ostrich: { down: 0.04, left: 0.02, right: 0.02 } };
  const mbCache = new WeakMap();
  function mountBack(cv, d) { let o = mbCache.get(cv); if (o) return o; const w = cv.width, h = cv.height; let top = h, bot = 0, cx = w / 2, side = h * 0.4;
    try { const D = cv.getContext('2d').getImageData(0, 0, w, h).data; const a0 = Math.floor(w * (d === 'left' || d === 'right' ? 0.38 : 0.4)), a1 = Math.ceil(w * (d === 'left' || d === 'right' ? 0.6 : 0.6)); let sx = 0, n = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (D[(y * w + x) * 4 + 3] > 60) { if (y > bot) bot = y; if (x >= a0 && x <= a1 && y < top) top = y; if (y > h * 0.3 && y < h * 0.7) { sx += x; n++; } }
      if (n) cx = sx / n; if (d === 'left' || d === 'right') cx = (a0 + a1) / 2;
      /* 앞/뒤 모습: 머리·뿔이 아니라 몸통 양옆(어깨·안장 높이)을 등선으로 */ const colTop = (f0, f1) => { let t = h; for (let x = Math.floor(w * f0); x <= Math.ceil(w * f1); x++) for (let y = 0; y < t; y++) if (D[(y * w + x) * 4 + 3] > 60) { t = y; break; } return t; };
      side = Math.max(colTop(0.27, 0.33), colTop(0.67, 0.73)); } catch (e) { top = h * 0.3; bot = h; }
    o = { top, bot, cx, side }; mbCache.set(cv, o); return o; }
  const rbCache = new WeakMap();
  function riderBox(cv) { let b = rbCache.get(cv); if (b) return b; const w = cv.width, h = cv.height; let x0 = w, y0 = h, x1 = 0, y1 = 0; try { const d = cv.getContext('2d').getImageData(0, 0, w, h).data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } catch (e) { } if (x1 < x0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; } b = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }; rbCache.set(cv, b); return b; }
  // ── NPC (GPT 그림, 가까우면 플레이어 쪽을 봄) ──
  const _dn = drawNpc;
  drawNpc = function (n, sx, sy, now) {
    const fr = NA[n.kind] || NA.guide; if (!NPI.ok || !fr) return _dn(n, sx, sy, now);
    const x = n.x * TS + 16 - sx, y = n.y * TS + 32 - sy; if (x < -60 || x > W + 60 || y < -100 || y > H + 80) return;
    let d = 0; const dx = pos.x - n.x, dy = pos.y - n.y; if (Math.abs(dx) + Math.abs(dy) <= 5 && (dx || dy)) d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
    const r = fr[d]; const s = 0.47, w = r[2] * s, h = r[3] * s; const br = Math.sin(now / 600 + n.x) > 0.6 ? 1 : 0;
    shadowAt(x, y, 12); ctx.imageSmoothingEnabled = true; _di.call(ctx, NPI, r[0], r[1], r[2], r[3], Math.round(x - w / 2), Math.round(y - h + 3 - br), w, h + br); ctx.imageSmoothingEnabled = false;
    NAMEQ.push(() => { drawText(n.name, x, y + 15, '#ffe08a', 13);
    const bob = Math.sin(now / 250) * 3; drawText(n.kind === 'guide' ? '?' : '!', x, y - h - 4 + bob, '#ffd000', 18); });
  };

  // ── 스킬/공격 버튼 (아트 아이콘) ──
  const artCache = {};
  function skillArt(sk) {
    let nm = null, item = null; const b = sk.jobs[0];
    if (sk.form) { const k = 'form' + sk.id; if (artCache[k]) return artCache[k]; const ik = { gKnight: 'a_helmet_6', gKing: 'a_helmet_9', bKnight: 'a_helmet_5', bKing: 'a_helmet_7' }[sk.form]; const c = mkc(96, 96), g = c.getContext('2d'); if (IA[ik]) { const gr = g.createRadialGradient(48, 48, 4, 48, 48, 46); gr.addColorStop(0, sk.col + 'cc'); gr.addColorStop(1, sk.col + '00'); g.fillStyle = gr; g.fillRect(0, 0, 96, 96); _di.call(g, IT, IA[ik][0], IA[ik][1], 64, 64, 10, 10, 76, 76); } return (artCache[k] = c.toDataURL()); }
    switch (sk.kind) {
      case 'melee': nm = 'slash'; break; case 'aoeSelf': case 'taunt': nm = 'whirl'; break;
      case 'proj': if (b === 'healer') item = 'w_bow_6'; else nm = 'fire'; break;
      case 'multi': nm = 'bolt'; break; case 'aoeTarget': nm = sk.fx === 'ice' ? 'ice' : sk.fx === 'rain' ? null : 'fire'; if (sk.fx === 'rain') item = 'w_crossbow_7'; break;
      case 'line': item = b === 'healer' ? 'w_bow_8' : 'w_spear_7'; break; case 'heal': nm = 'heal'; break;
      case 'buff': case 'partyBuff': nm = 'heal'; break; case 'summon': item = 'w_staff_8'; break;
    }
    const k = (nm || item || 'x') + sk.name; if (artCache[k]) return artCache[k];
    const c = mkc(96, 96), g = c.getContext('2d'); g.imageSmoothingEnabled = true;
    if (nm && FA[nm]) { const fr = FA[nm][nm === 'fire' ? 1 : nm === 'slash' ? 3 : 3]; const s = 84 / Math.max(fr[2], fr[3]); _di.call(g, FXI, fr[0], fr[1], fr[2], fr[3], 48 - fr[2] * s / 2, 48 - fr[3] * s / 2, fr[2] * s, fr[3] * s); }
    else if (item && IA[item]) _di.call(g, IT, IA[item][0], IA[item][1], 64, 64, 8, 8, 80, 80);
    else return null;
    return (artCache[k] = c.toDataURL());
  }
  function paintSkillBtns() {
    if (!S.touchCd || !S.me || !FXI.ok || !IT.ok) return;
    const n8 = S.me.skills.length > 6, n10 = S.me.skills.length > 8; const gr = $('skillgrid'); if (gr) { if (n10) gr.style.setProperty('grid-template-columns', 'repeat(5,50px)', 'important'); else if (n8) gr.style.setProperty('grid-template-columns', 'repeat(4,56px)', 'important'); else gr.style.removeProperty('grid-template-columns'); }
    S.touchCd.forEach((d, i) => {
      d.style.display = i >= 6 && !S.me.skills[i] ? 'none' : '';
      const sk = GD.SKILL[S.me.skills[i]]; const si = d.querySelector('.si'); if (!si) return;
      const on = sk && S.me.lv >= sk.lv; const key = (sk ? sk.name : '') + on;
      if (si.dataset.k === key && si.innerHTML === si._h) return; si.dataset.k = key;
      const url = on && skillArt(sk); d.classList.toggle('lockd', !on);
      si.innerHTML = url ? `<img src="${url}" alt="">` : ic('lock'); si._h = si.innerHTML;
    });
    const atk = document.querySelector('#acts .tb.atk');
    if (atk) { const w = S.me.eq && S.me.eq.weapon; const k = w ? iconKey(w) : ['w_' + ({ warrior: 'sword', mage: 'staff', healer: 'bow' }[GD.JOBS[S.me.job] ? GD.JOBS[S.me.job].base : 'warrior']) + '_0'];
      const kk = k && k.join('|'); if ((atk.dataset.k !== kk || !atk.querySelector('img.wpn')) && k && IA[k[0]]) { atk.dataset.k = kk; const c = itemIcon(w || { k: 'gear', slot: 'weapon', wt: k[0].split('_')[1], tier: 0 }); atk.innerHTML = `<img class="wpn" src="${c.toDataURL()}" alt=""><span class="sn">공격</span>`; } }
  }
  const _rh = refreshHud; refreshHud = function (full) { _rh(full); try { paintSkillBtns(); } catch (e) { } };
  const st = document.createElement('style'); st.textContent = `
#skillgrid .tb{background:linear-gradient(#1c2630,#121820)!important;border:2px solid #3c8a3e!important;border-radius:7px!important;box-shadow:inset 0 0 0 2px #0b1208,0 2px 0 #0008,0 0 6px #3c8a3e55!important;overflow:hidden}
#skillgrid .tb .si{position:absolute;inset:3px 3px 12px 3px;margin:0!important;display:flex;align-items:center;justify-content:center}
#skillgrid .tb .si img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 1px #000)}
#skillgrid .tb .sn{position:absolute;left:0;right:0;bottom:1px;text-align:center;max-width:none!important;font-size:9px!important;text-shadow:0 0 2px #000,0 1px 2px #000,1px 0 2px #000}
#skillgrid .tb .kn{z-index:2;color:#ffe9a8;text-shadow:0 1px 2px #000;font-weight:800}
#skillgrid .tb.lockd{border-color:#4a4f58!important;box-shadow:inset 0 0 0 2px #0b0d10!important;opacity:.75}
#skillgrid .tb .cdm{z-index:3;background:rgba(0,0,0,.62)!important}
#acts .tb.atk{border-radius:50%!important;width:108px!important;height:108px!important;background:radial-gradient(circle at 50% 40%,#2b3f66,#14203a 70%)!important;border:3px solid #c99a3a!important;box-shadow:inset 0 0 0 3px #0c1424,inset 0 0 0 6px #3e5a8a,0 3px 0 #0009,0 0 10px #c99a3a55!important}
#acts .tb.atk img.wpn{width:66px;height:66px;filter:drop-shadow(0 2px 2px #000);transform:rotate(0deg)}
#acts .tb.atk .sn{position:absolute;bottom:12px;font-size:11px!important;color:#ffe9b0;text-shadow:0 0 3px #000,0 1px 2px #000}
#acts .tb.atk.held{background:radial-gradient(circle at 50% 40%,#3e5a8a,#1c2a48 70%)!important;transform:scale(.94)}
#skillgrid .tb.pressed{transform:scale(.9);filter:brightness(1.35)}
`; document.head.appendChild(st);
})();
// 창이 열리면 캐릭터 메뉴 팝업 닫기
(function () { const _op = openPanel; openPanel = function () { try { closePM(); } catch (e) { } return _op.apply(this, arguments); }; })();
// ═══════ 타격감: 화면 흔들림 · 피격 번쩍임 · 넉백 · 타격 불꽃 · 진동 ═══════
(function () {
  const SP = []; let shk = 0, shkT = 0, shkD = 1;
  function shake(a, d) { if (a >= shk * Math.max(0, 1 - (performance.now() - shkT) / shkD)) { shk = a; shkT = performance.now(); shkD = d; } }
  const _af2 = addFx;
  addFx = function (f) {
    const r = _af2(f);
    if (f.k === 'dmg' && !f.p && f.by && f.by === S.myId) {
      const now = performance.now(); const mo = f.i != null ? S.M.get(f.i) : null;
      if (mo) { mo.hitT = now; const dx = mo.x - pos.x, dy = mo.y - pos.y, L = Math.hypot(dx, dy) || 1; mo.kx = dx / L; mo.ky = dy / L; }
      const big = f.c || f.b;
      shake(f.c ? 5 : f.b ? 3.5 : 2.2, f.c ? 200 : 140);
      const n = f.c ? 12 : big ? 9 : 6, cx = f.x, cy = f.y;
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = (f.c ? 2.6 : 1.8) + Math.random() * 1.6; SP.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, t0: now, life: 220 + Math.random() * 120, c: f.c ? (i % 2 ? '#ffb020' : '#fff3a0') : (i % 3 ? '#ffffff' : '#ffe08a') }); }
      SP.push({ ring: 1, x: cx, y: cy, t0: now, life: f.c ? 260 : 180, c: f.c ? '#ffb020' : '#ffffff' });
      try { navigator.vibrate && navigator.vibrate(f.c ? 30 : 12); } catch (e) { }
    } else if (f.k === 'dmg' && f.p && f.x === pos.x && f.y === pos.y) { shake(4, 180); try { navigator.vibrate && navigator.vibrate(25); } catch (e) { } }
    return r;
  };
  const _dfx = drawFx;
  drawFx = function (now, sx, sy, layer) {
    _dfx(now, sx, sy, layer);
    if (layer !== 'mid' || !SP.length) return;
    const g = ctx; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = SP.length - 1; i >= 0; i--) {
      const p = SP[i], k = (now - p.t0) / p.life; if (k >= 1) { SP.splice(i, 1); continue; }
      const X = p.x * TS + 16 - sx, Y = p.y * TS + 16 - sy - 14;
      g.globalAlpha = 1 - k;
      if (p.ring) { g.strokeStyle = p.c; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.ellipse(X, Y, 6 + k * 20, 4 + k * 14, 0, 0, 7); g.stroke(); continue; }
      const d = k * 14, x1 = X + p.vx * d, y1 = Y + p.vy * d + k * k * 6, x0 = X + p.vx * d * 0.4, y0 = Y + p.vy * d * 0.4;
      g.strokeStyle = p.c; g.lineWidth = 2.4 * (1 - k) + 0.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.restore();
  };
  // 카메라 흔들기 (월드만, HUD는 그대로)
  window.shakeOff = function () { const e = performance.now() - shkT; if (!shk || e >= shkD) { shk = 0; return null; } const a = shk * (1 - e / shkD); return [Math.round((Math.random() * 2 - 1) * a), Math.round((Math.random() * 2 - 1) * a)]; };
})();
// ═══════ 조이스틱 v4: 안드로이드 대응 (터치 이벤트 직접 처리 + 브라우저 제스처 차단) ═══════
(function () {
  const st = document.createElement('style'); st.textContent = '#dpad,#dpad *,#touch,#acts,#acts *,#skillgrid,#skillgrid *,#utilbar,#utilbar *{touch-action:none!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}html,body{overscroll-behavior:none}';
  document.head.appendChild(st);
  const _bt4 = buildTouch;
  buildTouch = function () {
    _bt4();
    const dp = $('dpad'), knob = $('knob'); if (!dp || !knob) return;
    let active = null, ox = 0, oy = 0, cur = null;
    const VEC = { E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1], N: [0, -1], NE: [1, -1] };
    const sec = [['E', 0], ['SE', 45], ['S', 90], ['SW', 135], ['W', 180], ['NW', 225], ['N', 270], ['NE', 315]];
    const half = n => n.length === 1 ? 27 : 18, diff = (x, y) => Math.abs(((x - y + 540) % 360) - 180);
    const pickDir = deg => { const a = (deg + 360) % 360; if (cur) { const c = sec.find(s => s[0] === cur); if (diff(a, c[1]) <= half(cur) + 5) return cur; } let best = 'E', bd = 999; for (const [n, c] of sec) { const d = diff(a, c) - half(n); if (d < bd) { bd = d; best = n; } } return best; };
    const start = (id, x, y) => { active = id; ox = x; oy = y; cur = null; window.touchFace = null; };
    const move = (x, y) => {
      const r = dp.getBoundingClientRect(), sc = 120 / (r.width || 120);
      const dx = (x - ox) * sc, dy = (y - oy) * sc, dist = Math.hypot(dx, dy), lim = 38;
      const k = dist > lim ? lim / dist : 1; knob.style.transform = `translate(${dx * k}px,${dy * k}px)`;
      if (dist < 13) { if (dist < 9) { cur = null; touchVec = null; touchDir = -1; } return; }
      if (dist > 70) { ox += (x - ox) * (1 - 70 / dist); oy += (y - oy) * (1 - 70 / dist); }
      cur = pickDir(Math.atan2(dy, dx) * 180 / Math.PI); touchVec = VEC[cur]; touchDir = dirOf(touchVec[0], touchVec[1]);
      const tf = Math.abs(dx) > Math.abs(dy) * 1.15 ? (dx > 0 ? 2 : 1) : Math.abs(dy) > Math.abs(dx) * 1.15 ? (dy > 0 ? 0 : 3) : window.touchFace; window.touchFace = tf != null ? tf : (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 2 : 1) : (dy > 0 ? 0 : 3));
    };
    const end = () => { active = null; cur = null; touchVec = null; touchDir = -1; window.touchFace = null; knob.style.transform = ''; };
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // 마우스·펜용 포인터 (터치는 아래 터치 이벤트가 담당)
    dp.onpointerdown = e => { if (e.pointerType === 'touch' && hasTouch) return; active = e.pointerId; try { dp.setPointerCapture(e.pointerId); } catch (_) { } start(e.pointerId, e.clientX, e.clientY); e.preventDefault(); };
    dp.onpointermove = e => { if (e.pointerType === 'touch' && hasTouch) return; if (active === e.pointerId) move(e.clientX, e.clientY); };
    dp.onpointerup = dp.onpointercancel = e => { if (e.pointerType === 'touch' && hasTouch) return; end(); };
    dp._jh = { start, move, end, get active() { return active; } };
    if (hasTouch && !dp._t4) {
      dp._t4 = 1; const o = { passive: false }; const H = () => dp._jh;
      const find = (list) => { const a = H().active; for (const t of list) if (t.identifier === a) return t; return null; };
      dp.addEventListener('touchstart', e => { e.preventDefault(); if (H().active !== null && find(e.touches)) return; const t = e.changedTouches[0]; H().start(t.identifier, t.clientX, t.clientY); }, o);
      // 손가락이 조이스틱 밖으로 나가도 계속 따라감
      window.addEventListener('touchmove', e => { if (H().active === null) return; const t = find(e.changedTouches); if (t) { H().move(t.clientX, t.clientY); if (e.cancelable) e.preventDefault(); } }, o);
      const fin = e => { if (H().active === null) return; if (find(e.changedTouches)) H().end(); };
      window.addEventListener('touchend', fin, o); window.addEventListener('touchcancel', fin, o);
    }
  };
})();
// ═══════ 서버 아이패드: 꺼짐 방지 ═══════
(function () {
  let vid = null;
  function awakeVideo() {
    if (!vid) { vid = document.createElement('video'); vid.src = 'sfx/awake.mp4'; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.setAttribute('muted', ''); vid.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1'; document.body.appendChild(vid); }
    const p = vid.play(); if (p && p.catch) p.catch(() => { });
  }
  let wl = null;
  async function lock() { try { if ('wakeLock' in navigator && document.visibilityState === 'visible' && (!wl || wl.released)) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { } }
  function keep() { lock(); awakeVideo(); }
  const _sd = showServerDash;
  showServerDash = function (code, restored) {
    _sd(code, restored);
    // 새로고침·탭 복구 시 자동으로 같은 방을 다시 엶
    try { history.replaceState(null, '', location.pathname + location.search + '#server' + code); } catch (e) { }
    keep(); setInterval(keep, 20000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keep(); });
    document.addEventListener('pointerdown', keep, { passive: true });
    const info = document.createElement('div'); info.id = 'svkeep'; info.className = 'mut'; info.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:71;font-size:12px;text-align:center;line-height:1.5;color:#9fb0c0';
    info.innerHTML = '화면 꺼짐 방지 켜짐 · 꺼지거나 새로고침돼도 같은 방으로 자동 복구돼요<br>더 확실하게: 설정 › 디스플레이 및 밝기 › 자동 잠금 › <b style="color:#ffe08a">안 함</b> · 충전기 연결';
    document.body.appendChild(info);
  };
  // 새 버전: 접속자가 0명일 때만 저장 후 자동 적용 (접속 중이면 기다림)
  let pend = false;
  window.serverUpdate = function () {
    if (pend) return; pend = true;
    const tryApply = () => {
      let n = 1; try { n = ENGINE.online().length; } catch (e) { }
      const msg = $('svmsg');
      if (n > 0 && !window.__svCount) { // 접속자가 있어도 1분 예고 후 업데이트 (오래된 서버로 계속 돌지 않게)
        window.__svCount = Date.now();
        try { ENGINE.announce('🔧 1분 뒤 서버가 새 버전으로 업데이트돼요. 잠깐 끊겼다가 자동으로 다시 접속돼요. (저장됨)', '#ffd166'); } catch (e) { }
        if (msg) msg.textContent = '새 버전 적용 예정: 1분 뒤 저장 후 업데이트';
        setTimeout(() => { try { ENGINE.announce('🔧 서버 업데이트 중… 잠시만 기다려 주세요.', '#ffd166'); } catch (e) { } tryApply(); }, 60000); return;
      }
      if (n > 0 && Date.now() - window.__svCount < 59000) return;
      try { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); } catch (e) { }
      setTimeout(() => { try { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); } catch (e) { } /* 새로고침 직전에 한 번 더 저장 */ try { history.replaceState(null, '', location.pathname + '#server' + NET.code); } catch (e) { } location.reload(); }, 1500);
    };
    tryApply();
  };
})();

// ═══════ 캐릭터 선택: 게임 중 나가기 + 로비에서 내 캐릭터 목록 ═══════
(function () {
  const KEY = 'baram_chars';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const save = l => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 3))); } catch (e) { } };
  setInterval(() => {
    if (!S.me || !NET.code || NET.serverOnly) return;
    let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
    const role = mem.role === 'host' && mem.code === NET.code ? 'host' : 'join';
    const l = load().filter(c => !(c.name === S.me.name && c.code === NET.code));
    const old = load().findIndex(c => c.name === S.me.name && c.code === NET.code); const ent = { name: S.me.name, code: NET.code, job: S.me.job, lv: S.me.lv, role, g: S.me.gender, h: S.me.hair, hc: S.me.hairColor, sk: S.me.skin, t: Date.now() }; if (old >= 0) l.splice(old, 0, ent); else l.push(ent); save(l);
  }, 5000);
  // 게임 메뉴에 [캐릭터] 버튼
  function addBtn() {
    if ($('charsel') || !$('menu')) return;
    const b = document.createElement('div'); b.className = 'mbtn'; b.id = 'charsel'; b.innerHTML = `${ic('users')}<span>캐릭터</span>`;
    b.onclick = () => {
      let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
      const iAmHost = mem.role === 'host' && mem.code === NET.code;
      const q = iAmHost ? '캐릭터 선택 화면으로 갈까요?\n지금 방장이라 나가면 이 방이 잠시 닫혀요 (저장은 돼요).' : '캐릭터 선택 화면으로 갈까요? (저장은 자동으로 돼요)';
      if (!confirm(q)) return;
      try { if (iAmHost) { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); } } catch (e) { }
      setTimeout(() => { try { history.replaceState(null, '', location.pathname + (NET.code ? '#' + NET.code : '')); } catch (e) { } location.reload(); }, 600);
    };
    $('menu').appendChild(b);
  }
  addBtn(); setTimeout(addBtn, 1500);
  // 로비: 캐릭터 선택 (최대 3명)
  const MAXC = 3;
  if (typeof webLobby === 'function') {
    const _wl = webLobby;
    webLobby = function () {
      _wl();
      const L = $('lobby'); if (!L) return;
      const JN = { warrior: '전사', mage: '마법사', healer: '치유사' };
      const jobName = j => (GD.JOBS[j] && GD.JOBS[j].name) || JN[(GD.JOBS[j] || {}).base] || '';
      const box = document.createElement('div'); box.id = 'mychars'; L.insertBefore(box, L.firstChild);
      const st = document.createElement('style'); st.textContent = `#mychars{margin:0 0 8px}#mychars .cslots{display:flex;gap:6px}#mychars .cs{flex:1;min-width:0;height:64px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);display:flex;align-items:center;gap:6px;padding:4px 6px;position:relative;cursor:pointer;color:#fff}#mychars .cs.sel{border-color:#ffd166;box-shadow:0 0 0 2px #ffd16655;background:rgba(255,209,102,.08)}#mychars .cs canvas{width:34px;height:48px;flex:none;image-rendering:auto}#mychars .cs .ci{display:flex;flex-direction:column;min-width:0;line-height:1.2;text-align:left}#mychars .cs b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mychars .cs small{font-size:10px;color:#9fb0c0;white-space:nowrap}#mychars .cs.empty{justify-content:center;color:#9fb0c0;border-style:dashed}#mychars .cs .del{position:absolute;right:2px;top:2px;width:20px;height:20px;border-radius:5px;background:rgba(0,0,0,.35);color:#f88;font-size:12px;display:flex;align-items:center;justify-content:center}#mychars .ch{display:flex;align-items:center;font-size:12px;color:#9fb0c0;margin-bottom:4px}`;
      document.head.appendChild(st);
      let sel = -1;
      const render = () => {
        const list = load().slice(0, MAXC);
        let h = `<div class="ch"><b style="color:#fff;font-size:13px">캐릭터 선택</b><span style="margin-left:6px">(${list.length}/${MAXC}) · 고르면 바로 접속</span></div><div class="cslots">`;
        for (let k = 0; k < MAXC; k++) {
          const c = list[k];
          if (c) h += `<div class="cs${sel === k ? ' sel' : ''}" data-k="${k}"><canvas width="56" height="80"></canvas><div class="ci"><b>${esc(c.name)}</b><small>Lv${c.lv} ${jobName(c.job)}</small><small>방 ${c.code}</small></div><div class="del" data-del="${k}">✕</div></div>`;
          else h += `<div class="cs empty${sel === k ? ' sel' : ''}" data-k="${k}">＋ 새 캐릭터</div>`;
        }
        box.innerHTML = h + '</div>';
        box.querySelectorAll('.cs').forEach(el => {
          const k = +el.dataset.k, c = list[k];
          if (c) { const cv = el.querySelector('canvas'); try { const im = charSprite({ job: c.job, g: c.g || 'm', h: c.h || 0, hc: c.hc || 0, sk: c.sk || 0, eq: {} }, 0, 0); cv.getContext('2d').drawImage(im, 0, 0, 56, 80); } catch (e) { } }
          el.onclick = e => {
            if (e.target.dataset.del != null) {
              if (!confirm(`'${c.name}' 캐릭터를 완전히 삭제할까요?\n레벨·아이템·텐트가 모두 사라지고 되돌릴 수 없어요.\n(다음에 방 ${c.code}에 들어갈 때 서버에서도 삭제돼요)`)) return;
              const l = load(); l.splice(k, 1); save(l);
              try { const dl = JSON.parse(localStorage.getItem('baram_del') || '[]').filter(d => !(d.name === c.name && d.code === c.code)); dl.push({ name: c.name, code: c.code }); localStorage.setItem('baram_del', JSON.stringify(dl)); } catch (e2) { }
              try { const mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); if (mem.name === c.name) { delete mem.name; localStorage.setItem('baram_last', JSON.stringify(mem)); } } catch (e2) { }
              if ($('nm').value === c.name) $('nm').value = '';
              sel = -1; render(); return;
            }
            sel = k; render();
            if (c) { $('nm').value = c.name; $('lcode').value = c.code; if ($('ljoin')) $('ljoin').click(); /* 플레이어 폰은 항상 참가 (두 번째 방이 몰래 열려 저장이 갈라지는 것 방지) */ }
            else { $('nm').value = ''; $('nm').placeholder = '새 캐릭터 이름 (최대 10자)'; $('nm').focus(); }
          };
        });
      };
      render();
      // 예전 [이어하기] 버튼은 캐릭터 칸으로 대체 (서버 기기용만 유지) · 지운 캐릭터 이름이 남지 않게
      { let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
        const lc = $('lcont'); if (lc && mem.role !== 'server') lc.remove();
        const names = load().map(c => c.name); if ($('nm').value && !names.includes($('nm').value)) $('nm').value = ''; }
      // 4번째 캐릭터는 만들 수 없음
      L.addEventListener('click', e => {
        const b = e.target.closest('#lhost,#ljoin,#lsolo'); if (!b) return;
        const n = ($('nm').value || '').trim(); if (!n) return;
        const list = load(); if (list.some(c => c.name === n)) return;
        if (list.length >= MAXC) { e.stopImmediatePropagation(); e.preventDefault(); const er = $('lerr'); if (er) er.textContent = `캐릭터는 ${MAXC}개까지 만들 수 있어요. 위 목록에서 하나를 지우고 만들어 주세요.`; }
      }, true);
    };
  }
})();

// 접속 성공 시: 서버에 보낸 삭제 요청 정리, 삭제했던 이름이 다시 목록에 들어오지 않게
(function () { const _om = onMsg; onMsg = function (m) { const r = _om(m); if (m && m.t === 'welcome') { try { const dl = JSON.parse(localStorage.getItem('baram_del') || '[]').filter(d => d.code !== NET.code); localStorage.setItem('baram_del', JSON.stringify(dl)); } catch (e) { } } return r; }; })();
// ═══════ 파티·교환 신청: 눈에 띄는 수락/거절 팝업 (20초 후 자동 거절) ═══════
(function () {
  const st = document.createElement('style'); st.textContent = `#askcard{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:95;min-width:300px;max-width:92vw;background:linear-gradient(#26303c,#1a2129);border:2px solid #ffd166;border-radius:12px;box-shadow:0 8px 30px #000a,0 0 0 4px #ffd16633;padding:12px 14px;color:#fff;animation:askin .25s ease-out}@keyframes askin{from{transform:translate(-50%,-20px);opacity:0}}#askcard .at{font-size:15px;font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:6px}#askcard .ad{font-size:12px;color:#b8c4d0;margin-bottom:10px}#askcard .ab{display:flex;gap:8px}#askcard .ab button{flex:1;height:44px;font-size:15px;font-weight:800;border-radius:8px;border:0;color:#fff}#askcard .yes{background:#22a35a}#askcard .no{background:#4a5260}#askcard .bar{height:3px;background:#ffd166;border-radius:2px;margin-top:8px;transition:width 20s linear}`;
  document.head.appendChild(st);
  let tm = null;
  function ask(kind, from) {
    const old = $('askcard'); if (old) old.remove(); clearTimeout(tm);
    const isP = kind === 'party';
    const d = document.createElement('div'); d.id = 'askcard';
    d.innerHTML = `<div class="at">${ic(isP ? 'users' : 'swap')} ${esc(from)}님의 ${isP ? '파티' : '교환'} 신청</div><div class="ad">${isP ? '수락하면 근처(12칸)에서 경험치를 함께 얻어요.' : '수락하면 교환 창이 열려요.'}</div><div class="ab"><button class="yes">수락</button><button class="no">거절</button></div><div class="bar" style="width:100%"></div>`;
    document.body.appendChild(d); requestAnimationFrame(() => { const b = d.querySelector('.bar'); if (b) b.style.width = '0%'; });
    const done = yes => { clearTimeout(tm); d.remove(); send({ t: isP ? (yes ? 'partyYes' : 'partyNo') : (yes ? 'tradeYes' : 'tradeNo') }); };
    const yb = d.querySelector('.yes'), nb = d.querySelector('.no');
    yb.addEventListener('pointerup', e => { e.preventDefault(); e.stopPropagation(); done(true); }); nb.addEventListener('pointerup', e => { e.preventDefault(); e.stopPropagation(); done(false); });
    d.addEventListener('pointerdown', e => e.stopPropagation());
    tm = setTimeout(() => { if (d.isConnected) done(false); }, 20000);
    try { SND.play('rare'); } catch (e) { } try { navigator.vibrate && navigator.vibrate([60, 60, 60]); } catch (e) { }
  }
  const _om = onMsg;
  onMsg = function (m) {
    if (m && m.t === 'partyAsk') { ask('party', m.from); return; }
    if (m && m.t === 'tradeAsk') { ask('trade', m.from); return; }
    return _om(m);
  };
})();
// ═══════ 화려한 스킬 이펙트: 빛 번짐 · 충격파 고리 · 불꽃 입자 · 투사체 꼬리 ═══════
(function () {
  const COL = { slash: '#ffd34d', slash3: '#ffe27a', spin: '#ffffff', ring: '#ffffff', quake: '#ffb060', flame: '#ff7a1a', meteor: '#ff3d00', ice: '#8fe3ff', bolt: '#fff36b', holy: '#fff6c0', bless: '#ffe9a0', heal: '#7dff9a', bigheal: '#7dff9a', buff: '#ff8a5a', rain: '#f0e6b0', pierce: '#fff8c8', summon: '#c98aff' };
  const rnd = s => { s = Math.sin(s * 12.9898) * 43758.5453; return s - Math.floor(s); };
  function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(0.35, col + 'aa'); gr.addColorStop(1, col + '00'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  const _dsf2 = drawSkillFx;
  drawSkillFx = function (g, f, k, x, y) {
    const col = f.c && /^#[0-9a-f]{6}$/i.test(f.c) ? f.c : (COL[f.f] || '#ffffff');
    const R = Math.max(1, f.r || 1) * TS; const big = (f.r || 1) >= 2.5 || f.f === 'meteor';
    g.save(); g.globalCompositeOperation = 'lighter';
    // 바닥 빛 + 충격파 고리 2겹
    glow(g, x, y, R * (0.6 + k * 0.9), col, (1 - k) * 0.55);
    for (const off of [0, 0.18]) { const kk = k - off; if (kk <= 0) continue; g.globalAlpha = Math.max(0, 1 - kk) * 0.9; g.strokeStyle = col; g.lineWidth = (1 - kk) * (big ? 7 : 4) + 1; g.beginPath(); g.ellipse(x, y + 4, R * (0.3 + kk * 1.1), R * (0.3 + kk * 1.1) * 0.45, 0, 0, 7); g.stroke(); }
    // 튀는 입자
    const n = big ? 26 : 14, seed = (f.t0 || 1) * 0.001;
    for (let i = 0; i < n; i++) {
      const a = rnd(seed + i) * Math.PI * 2, sp = (0.4 + rnd(seed + i + 50) * 0.9) * R * 1.1, up = (f.f === 'heal' || f.f === 'bigheal' || f.f === 'bless' || f.f === 'buff') ? 1 : 0;
      const px = x + Math.cos(a) * sp * (up ? 0.35 : k), py = y + (up ? -k * (30 + rnd(seed + i + 9) * 40) + Math.sin(a) * 8 : Math.sin(a) * sp * k * 0.55 - k * k * 10);
      const s = (1 - k) * (big ? 3.4 : 2.6) + 0.6; g.globalAlpha = (1 - k);
      g.fillStyle = i % 3 ? col : '#ffffff'; g.fillRect(px - s / 2, py - s / 2, s, s);
    }
    // 큰 기술: 순간 섬광
    if (big && k < 0.18) { g.globalAlpha = (0.18 - k) / 0.18 * 0.35; g.fillStyle = col; g.fillRect(x - W, y - H, W * 2, H * 2); }
    g.restore();
    return _dsf2(g, f, k, x, y);
  };
  // 투사체: 빛나는 머리 + 꼬리
  const _dfx2 = drawFx;
  drawFx = function (now, sx, sy, layer) {
    if (layer === 'mid') {
      const g = ctx; g.save(); g.globalCompositeOperation = 'lighter';
      for (const f of S.fx) {
        if (f.k !== 'proj') continue; const k = (now - f.t0) / f.dur; if (k < 0 || k > 1) continue;
        const col = f.c && /^#[0-9a-f]{6}$/i.test(f.c) ? f.c : '#ffd27a';
        for (let j = 0; j < 7; j++) { const kk = Math.max(0, k - j * 0.035); const X = (f.fx + (f.tx - f.fx) * kk) * TS + 16 - sx, Y = (f.fy + (f.ty - f.fy) * kk) * TS + 16 - sy - 12;
          glow(g, X, Y, (j ? 9 : 16) - j, col, (1 - j / 7) * 0.7); }
      }
      g.restore();
    }
    return _dfx2(now, sx, sy, layer);
  };
})();
// ═══════ 닫기(X) 누른 손가락이 아래에 있는 미니맵·화면을 다시 누르는 문제 방지 ═══════
(function () {
  let until = 0;
  const mark = e => { if (e.target.closest && e.target.closest('.xbtn,#bmx,[data-close],.pclose')) until = performance.now() + 500; };
  document.addEventListener('pointerup', mark, true); document.addEventListener('touchend', mark, true); document.addEventListener('pointerdown', mark, true);
  const block = e => { if (performance.now() < until && !(e.target.closest && e.target.closest('.xbtn,#bmx'))) { e.stopImmediatePropagation(); e.preventDefault(); } };
  ['click', 'pointerdown', 'touchstart'].forEach(ev => document.addEventListener(ev, e => { if (e.type !== 'click' && e.target.closest && e.target.closest('.xbtn,#bmx')) return; if (e.type === 'click' || (e.target.closest && e.target.closest('#mini,#game'))) block(e); }, true));
})();
// ═══════ 판매: 희귀 이상은 한 번 더 확인 ═══════
(function () {
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-a="sell"]'); if (!b || b._ok) return;
    const it = S.me && S.me.inv[+b.dataset.i]; if (!it) return;
    const rare = it.k === 'gear' && (it.rar >= 2 || it.legend);
    if (!rare) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const nm = (GD.RARITY[it.rar] || {}).n || '희귀'; const idx = +b.dataset.i; try { hideTip(); } catch (x) { }
    uiAsk(`[${nm}] ${it.name}\n정말 판매할까요? 판매하면 되돌릴 수 없어요.\n판매가: ${fmt(sellPrice(it))} 코인`, () => send({ t: 'sell', i: idx }));
  }, true);
})();
// ═══════ 화면 밀림 자동 복구 + [새로고침] 버튼 ═══════
(function () {
  const st = document.createElement('style'); st.textContent = 'html,body{position:fixed;inset:0;overflow:hidden;width:100%;height:100%}';
  document.head.appendChild(st);
  const fix = () => { try { if (window.scrollX || window.scrollY) window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch (e) { } try { resize(); } catch (e) { } };
  ['resize', 'orientationchange', 'fullscreenchange', 'webkitfullscreenchange', 'focusout'].forEach(ev => addEventListener(ev, () => { fix(); setTimeout(fix, 300); setTimeout(fix, 900); }));
  if (window.visualViewport) visualViewport.addEventListener('resize', () => setTimeout(fix, 100));
  setInterval(() => { if (window.scrollX || window.scrollY) fix(); }, 1000);
  function addBtn() {
    if ($('reloadbtn') || !$('menu')) return;
    const b = document.createElement('div'); b.className = 'mbtn'; b.id = 'reloadbtn'; ICP.refresh = ICP.refresh || '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>'; b.innerHTML = `${ic('refresh')}<span>새로고침</span>`;
    b.onclick = () => {
      let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
      const iAmHost = mem.role === 'host' && mem.code === NET.code;
      if (!confirm(iAmHost ? '새로고침할까요?\n방장이라 잠깐 방이 닫혔다가 다시 열려요 (저장은 돼요).' : '새로고침할까요? (저장은 자동으로 돼요)')) return;
      try { if (iAmHost) ENGINE.saveAll(); } catch (e) { }
      setTimeout(() => location.reload(), 300);
    };
    const cs = $('charsel'); if (cs) $('menu').insertBefore(b, cs); else $('menu').appendChild(b);
  }
  addBtn(); setTimeout(addBtn, 1600);
})();
// ═══════ 검은 화면 대비: 맵이 안 오면 [마을로 이동] 버튼 + 화면에 오류 표시(제보용) ═══════
(function () {
  let shown = 0;
  setInterval(() => {
    const stuck = S.me && (!S.map || !S.map.t);
    let b = $('unstuckbtn');
    if (stuck) { shown++; if (shown >= 3 && !b) { b = document.createElement('button'); b.id = 'unstuckbtn'; b.className = 'btn pri'; b.style.cssText = 'position:fixed;left:50%;top:45%;transform:translate(-50%,-50%);z-index:96;height:52px;padding:0 22px;font-size:16px'; b.textContent = '화면이 안 보이나요? 마을로 이동'; b.onclick = () => { send({ t: 'unstuck' }); b.remove(); shown = 0; }; document.body.appendChild(b); } }
    else { shown = 0; if (b) b.remove(); }
  }, 1000);
  let errBox = null, errN = 0;
  window.addEventListener('error', e => {
    if (errN++ > 20) return; const msg = (e.message || '') + ' @' + String(e.filename || '').split('/').pop().split('?')[0] + ':' + e.lineno;
    if (!errBox) { errBox = document.createElement('div'); errBox.style.cssText = 'position:fixed;left:6px;bottom:4px;z-index:99;font:10px monospace;color:#ff8a8a;background:#000a;padding:2px 5px;border-radius:4px;max-width:70vw;pointer-events:none'; document.body.appendChild(errBox); }
    errBox.textContent = '오류: ' + msg; clearTimeout(errBox._t); errBox._t = setTimeout(() => { errBox.remove(); errBox = null; }, 15000);
  });
})();

// 탈것 버튼: 타기/내리기 표시
(function () { setInterval(() => { if (!S.me) return; const b = [...document.querySelectorAll('#menu .mbtn')].find(e => /탈것|타기|내리기/.test(e.textContent)); if (!b) return; const sp = b.querySelector('span'); const t = !S.me.mounts || !S.me.mounts.length ? '탈것' : S.me.riding ? '내리기' : '타기'; if (sp && sp.textContent !== t) sp.textContent = t; }, 500); })();

// 서버 기기: 페이지가 닫히거나 숨겨질 때 저장 + 관리자 지급 버튼
(function () {
  addEventListener('pagehide', () => { try { if (window.ENGINE && NET.mode === 'host') ENGINE.saveAll(); } catch (e) { } });
  const _sd2 = showServerDash;
  showServerDash = function (code, restored) {
    _sd2(code, restored);
    const b = document.createElement('button'); b.className = 'btn'; b.textContent = '관리자: 탈것·코인 지급 / 직업 변경';
    b.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:72;height:36px;font-size:12px';
    b.onclick = () => {
      const name = prompt('플레이어 이름'); if (!name) return;
      const what = prompt('지급할 것\n탈것: ' + Object.entries(GD.MOUNTS).map(([k, v]) => k + '(' + v.name + ')').join(', ') + '\n코인: coin:숫자\n직업 변경: 직업 이름 (예: 시공술사)'); if (!what) return;
      const r = ENGINE.adminGive(name.trim(), what.trim()); alert(r);
    };
    document.body.appendChild(b);
  };
})();

// ═══════ 변신 모습: 크기 커짐 + 직업색 갑옷 빛 + 오라 (전용 그림이 오면 교체) ═══════
(function () {
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const _cs3 = charSprite, fc = new Map(); const FA = window.FORM_ATLAS || {};
  window.formRider = (ap, dir) => { if (!ap || !ap.fm || !FI.ok || !FA[ap.fm]) return null; const k = 'R' + ap.fm + dir; let c = fc.get(k); if (c) return c; const r = FA[ap.fm][['down', 'left', 'right', 'up'][dir] || 'down']; c = mkc(r[2], r[3]); c.getContext('2d').drawImage(FI, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]); fc.set(k, c); return c; }; const FI = new Image(); FI.onload = () => { FI.ok = true; fc.clear(); }; FI.src = 'gfx/forms.png?v=' + (window.BUILDV || 1);
  charSprite = function (ap, dir, frame) {
    if (!ap || !ap.fm || !GD.FORMS[ap.fm]) return _cs3(ap, dir, frame);
    const F = GD.FORMS[ap.fm]; const key = JSON.stringify(ap) + dir + frame; let c = fc.get(key); if (c) return c; if (fc.size > 200) fc.clear();
    if (ap.mt && FI.ok && FA[ap.fm]) return _cs3(ap, dir, frame); // 탈것 위에서도 변신 모습 (라이더 = 변신 그림)
    if (!ap.mt && FI.ok && FA[ap.fm]) { const r = FA[ap.fm][['down', 'left', 'right', 'up'][dir] || 'down']; const bob = frame === 1 || frame === 3 ? 2 : 0; c = mkc(r[2], r[3] + 3); const g = c.getContext('2d'); g.drawImage(FI, r[0], r[1], r[2], r[3], 0, 3 - bob, r[2], r[3]); const dh = 84 * F.scale; c.dh = dh * (r[3] + 3) / r[3]; c.dw = r[2] * dh / r[3]; c._form = F; fc.set(key, c); return c; }
    const base = _cs3(Object.assign({}, ap, { fm: 0 }), dir, frame); const bw = base.dw || 56, bh = base.dh || 80, W2 = base.width, H2 = base.height;
    c = mkc(W2, H2); const g = c.getContext('2d'); g.drawImage(base, 0, 0);
    // 갑옷 색 입히기 (얼굴은 살짝만)
    const t = mkc(W2, H2), tg = t.getContext('2d'); tg.drawImage(base, 0, 0); tg.globalCompositeOperation = 'source-atop'; tg.fillStyle = F.col; tg.globalAlpha = ap.fm.endsWith('King') ? 0.38 : 0.3; tg.fillRect(0, Math.round(H2 * 0.38), W2, H2);
    g.drawImage(t, 0, 0);
    // 왕: 금관
    if (ap.fm.endsWith('King')) { const cx = W2 / 2, cy = H2 * 0.08; g.fillStyle = '#3a2216'; g.fillRect(cx - 21, cy + 1, 42, 15); g.fillStyle = '#ffd34d'; g.fillRect(cx - 19, cy + 6, 38, 8); for (const dx of [-17, -6, 5, 16]) { g.fillStyle = '#3a2216'; g.fillRect(cx + dx - 3, cy - 6, 8, 12); g.fillStyle = '#ffd34d'; g.fillRect(cx + dx - 1, cy - 4, 4, 10); } g.fillStyle = '#ff3b3b'; g.fillRect(cx - 3, cy + 8, 6, 4); }
    c.dw = bw * F.scale; c.dh = bh * F.scale; c._form = F; fc.set(key, c); return c;
  };
  // 발밑 오라
  const _dp = drawPlayer;
  drawPlayer = function (p, rx, ry, dir, walking, sx, sy, now, isMe) {
    if (p.a && p.a.fm && GD.FORMS[p.a.fm]) { const F = GD.FORMS[p.a.fm]; const x = rx * TS + 16 - sx, y = ry * TS + 30 - sy; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + Math.sin(now / 220) * 0.12; const gr = ctx.createRadialGradient(x, y, 2, x, y, 30 * F.scale); gr.addColorStop(0, F.col); gr.addColorStop(1, F.col + '00'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, y, 30 * F.scale, 11 * F.scale, 0, 0, 7); ctx.fill(); ctx.restore(); }
    // 변신 상태 공격 모션: 무기를 휘두르듯 몸을 크게 기울였다 돌아오고, 큰 베기 궤적
    const F = p.a && p.a.fm && !p.a.mt && GD.FORMS[p.a.fm], at = p.atkT ? now - p.atkT : 1e9;
    if (F && at < 260 && !p.dd && !p.sl) {
      const k = at / 260, sw = Math.sin(k * Math.PI), x = rx * TS + 16 - sx, y = ry * TS + 32 - sy, side = dir === 1 ? -1 : dir === 2 ? 1 : 0;
      ctx.save(); ctx.translate(x, y);
      if (side) ctx.rotate(side * (0.42 * sw - 0.12 * (1 - k)));
      else ctx.scale(1 + 0.08 * sw, 1 - 0.1 * sw);
      ctx.translate(-x, -y + (dir === 0 ? -4 * sw : dir === 3 ? 4 * sw : 0));
      _dp(p, rx, ry, dir, walking, sx, sy, now, isMe); ctx.restore();
      const a0 = [Math.PI / 2, Math.PI, 0, -Math.PI / 2][dir] || 0, R = 34 * F.scale, cy = y - 34 * F.scale, col = F.col || '#ffd34d';
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = i ? col : '#ffffff'; ctx.globalAlpha = (1 - k) * (i ? 0.55 : 0.9); ctx.lineWidth = (i ? 10 : 4) - i * 2; ctx.beginPath(); ctx.arc(x, cy, R + i * 5, a0 - 1.5 + k * 0.8, a0 - 1.5 + k * 0.8 + 2.4 * Math.min(1, k * 1.6)); ctx.stroke(); }
      ctx.restore(); return;
    }
    return _dp(p, rx, ry, dir, walking, sx, sy, now, isMe);
  };
})();

// ═══════ 탈것 아이템 설명 ═══════
(function () { const _d = itemDesc; itemDesc = function (it) { if (it && it.k === 'mount') { const mt = GD.MOUNTS[it.id] || {}; const on = S.me && S.me.mount === it.id; const mb = GD.mountBonus(it.id) || {}; const opt = [mb.atk && `공격 +${Math.round(mb.atk * 100)}%`, mb.def && `방어 +${Math.round(mb.def * 100)}%`, mb.hp && `체력 +${Math.round(mb.hp * 100)}%`, mb.crit && `치명 +${mb.crit}`].filter(Boolean).join(' · ');
      return `<div class="nm" style="color:${mt.rare ? '#ffe066' : '#ffd27a'}">${esc(mt.name || it.id)}${it.n > 1 ? ' x' + it.n : ''}</div><div style="color:#a7b0bf">${mt.rare ? '★ 초희귀 탈것' : mt.boss ? '보스 탈것' : '탈것'} · 이동속도 x${mt.spd || 1}</div><div style="color:#7dffb0">[${mb.tier}] ${opt} (장착 시)</div><div>${on ? '장착 중 — 탈것 버튼·R로 타고 내려요.' : '장착하면 장비창 탈것 칸에 들어가요. 교환 가능 · 판매·버리기 불가'}</div>`; } return _d(it); }; })();

// ═══════ 보스 경고 장판: 빨간 원이 차오르면 피하세요 ═══════
(function () {
  const W = [];
  const _af = addFx; addFx = function (f) { if (f && f.k === 'warn') { W.push({ x: f.x, y: f.y, r: f.r || 2, t0: performance.now(), ms: f.ms || 1200 }); return; } return _af(f); };
  const _df = drawFx; drawFx = function (now, sx, sy, layer) {
    if (layer === 'mid' && W.length) { const t = performance.now();
      for (let i = W.length - 1; i >= 0; i--) { const w = W[i], k = (t - w.t0) / w.ms; if (k >= 1) { W.splice(i, 1); continue; }
        const x = w.x * TS + TS / 2 - sx, y = w.y * TS + TS / 2 - sy, R = (w.r + 0.4) * TS; const g = ctx; g.save();
        g.globalAlpha = 0.18 + 0.1 * Math.sin(t / 70); g.fillStyle = '#ff1a1a'; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
        g.globalAlpha = 0.42; g.fillStyle = '#ff3a1a'; g.beginPath(); g.arc(x, y, R * k, 0, 7); g.fill();
        g.globalAlpha = 0.95; g.strokeStyle = '#ff2a2a'; g.lineWidth = 3; g.setLineDash([8, 6]); g.lineDashOffset = -t / 30; g.beginPath(); g.arc(x, y, R, 0, 7); g.stroke();
        if (k > 0.55) { g.globalAlpha = 1; g.font = '900 20px sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.setLineDash([]); g.strokeStyle = '#000'; g.strokeText('!', x, y + 7); g.fillStyle = '#ffdd33'; g.fillText('!', x, y + 7); }
        g.restore(); } }
    return _df(now, sx, sy, layer);
  };
})();

// ═══════ 버튼 잘 눌리게: ① 누르는 중엔 창을 다시 그리지 않음 ② 손 뗄 때 바로 클릭 처리 ═══════
(function () {
  const st = document.createElement('style');
  st.textContent = 'button,.btn,.mbtn,.cell,.tb,.ubt,.xbtn,.pclose,[data-a],[data-qe],[data-pm]{touch-action:manipulation;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}';
  document.head.appendChild(st);
  let down = null, upT = 0, synthT = 0, pending = 0;
  const CLK = 'button,.btn,.mbtn,.cell,.card,.xbtn,.pclose,.tab,[data-pf],[data-pd],[data-pj],[data-pouch],[data-bt],[data-bb],[data-eq],[data-ck],[data-qi],[data-a],[data-k],[data-i],[data-bi],[data-eqs],[data-eqm],[data-qe],[data-pm],[data-ck],[data-sm],[data-glv],[data-fl],[data-close],[onclick],a';
  // 손가락 탭 처리: 브라우저가 '살짝 움직였다'며 클릭을 버려도(스크롤로 판단·pointercancel) 손 뗄 때 직접 클릭을 보냄
  const fire = (tgt, x, y) => {
    if (!tgt || !tgt.isConnected || !tgt.closest) return false;
    if (tgt.closest('#touch,#game,#dpad,input,select,textarea,#chatin')) return false; // 조이스틱·스킬·공격은 누르는 즉시 반응
    let el = tgt.closest(CLK); if (!el) { for (let q = tgt; q && q !== document.body; q = q.parentElement) if (q.onclick) { el = q; break; } } if (!el) return false;
    synthT = performance.now();
    try { tgt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window })); } catch (x2) { } // 원래 누른 요소에 클릭 → 위임 처리도 그대로 동작
    return true;
  };
  const HAS_TOUCH = 'ontouchstart' in window;
  if (HAS_TOUCH) {
    let td = null;
    document.addEventListener('touchstart', e => { const t = e.changedTouches[0]; down = { t: performance.now() }; td = e.touches.length === 1 ? { t: performance.now(), x: t.clientX, y: t.clientY, id: t.identifier, el: e.target } : null; }, { capture: true, passive: true });
    document.addEventListener('touchend', e => {
      down = null; upT = performance.now(); const d = td; td = null; if (!d) return;
      const t = [...e.changedTouches].find(q => q.identifier === d.id); if (!t) return;
      if (upT - d.t > 900 || Math.hypot(t.clientX - d.x, t.clientY - d.y) > 28) return;
      if (fire(d.el, t.clientX, t.clientY) && e.cancelable) e.preventDefault(); // 진짜 클릭(지연·중복) 막기
    }, { capture: true, passive: false });
    document.addEventListener('touchcancel', () => { down = null; td = null; upT = performance.now(); }, { capture: true, passive: true });
  } else {
    document.addEventListener('pointerdown', e => { down = { t: performance.now(), x: e.clientX, y: e.clientY, id: e.pointerId, el: e.target, type: e.pointerType }; }, true);
    document.addEventListener('pointercancel', () => { down = null; upT = performance.now(); }, true);
    document.addEventListener('pointerup', e => { const d = down; down = null; upT = performance.now(); if (!d || d.id !== e.pointerId || d.type === 'mouse') return; if (upT - d.t > 800 || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 18) return; fire(d.el, e.clientX, e.clientY); }, true);
  }
  // 손 뗀 직후 브라우저가 늦게 보내는 진짜 클릭은 무시 (두 번 눌림 방지)
  document.addEventListener('click', e => { if (e.isTrusted && performance.now() - synthT < 600) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  // 누르는 중(그리고 손 뗀 직후)엔 창을 다시 그리지 않음 → 버튼이 바뀌어 탭이 사라지는 문제 방지
  const _rr = rerenderPanel;
  rerenderPanel = function () {
    const now = performance.now();
    if (down || now - upT < 350) { if (!pending) pending = setTimeout(() => { pending = 0; rerenderPanel(); }, 250); return; }
    // 자동 갱신 때는 열린 설명창(사용·착용 버튼)을 닫지 않음 — 가방 내용이 실제로 바뀐 경우만 닫음
    const tip = $('tip'), open = tip && !tip.classList.contains('hidden'); const sig = S.me ? JSON.stringify([(S.me.inv || []).map(o => o.id + (o.n || 0)), S.me.eq && Object.keys(S.me.eq).map(k => S.me.eq[k] && S.me.eq[k].id), S.me.mount]) : '';
    if (open && sig === lastSig) { const _h = hideTip; hideTip = function () { }; try { return _rr(); } finally { hideTip = _h; } }
    lastSig = sig; return _rr();
  };
  let lastSig = '';
  document.addEventListener('pointerdown', () => { try { lastSig = S.me ? JSON.stringify([(S.me.inv || []).map(o => o.id + (o.n || 0)), S.me.eq && Object.keys(S.me.eq).map(k => S.me.eq[k] && S.me.eq[k].id), S.me.mount]) : ''; } catch (e) { } }, true);
})();

// ═══════ 그래픽 품질: 캐릭터·몬스터·NPC·탈것·드랍은 고품질 축소(부드러운 외곽), 바닥 타일은 선명하게 + 은은한 비네트 ═══════
(function () {
  const wrap = name => { const f = window[name]; if (typeof f !== 'function') return; window[name] = function () { const a = ctx.imageSmoothingEnabled, q = ctx.imageSmoothingQuality; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; try { return f.apply(this, arguments); } finally { ctx.imageSmoothingEnabled = a; ctx.imageSmoothingQuality = q; } }; };
  ['drawPlayer', 'drawMon', 'drawNpc', 'drawDrop'].forEach(wrap);
  try { drawPlayer = window.drawPlayer; drawMon = window.drawMon; drawNpc = window.drawNpc; drawDrop = window.drawDrop; } catch (e) { }
  const v = document.createElement('div'); v.id = 'vignette';
  v.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 62%,rgba(10,6,20,.22) 100%)';
  (document.getElementById('game') || document.body).insertAdjacentElement('afterend', v);
})();

// ═══════ 집 실내: 벽지·바닥 꾸미기 + 캐릭터 크기에 맞춘 큰 가구 + 새 꾸미기 가구 ═══════
(function () {
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const OL = '#2a1a10', cache = {};
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const box = (g, x, y, w, h, c, hi, sh) => { R(g, x - 2, y - 2, w + 4, h + 4, OL); R(g, x, y, w, h, c); if (hi) R(g, x, y, w, Math.max(2, h * 0.18), hi); if (sh) R(g, x, y + h - Math.max(2, h * 0.16), w, Math.max(2, h * 0.16), sh); };
  const circ = (g, x, y, r, c) => { g.fillStyle = OL; g.beginPath(); g.arc(x, y, r + 2, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const DRAW = {
    sofa(g) { box(g, 6, 20, 52, 22, '#c0504a', '#d8706a', '#9a3a36'); box(g, 4, 30, 10, 22, '#a8403c'); box(g, 50, 30, 10, 22, '#a8403c'); box(g, 12, 36, 40, 14, '#d0605a', '#e0807a'); R(g, 31, 38, 2, 12, '#a8403c'); R(g, 8, 52, 4, 6, OL); R(g, 52, 52, 4, 6, OL); },
    fireplace(g, t) { box(g, 6, 10, 52, 48, '#8a8478', '#a8a296', '#6a665c'); for (let y = 14; y < 56; y += 8) for (let x = (y / 8 % 2) * 6 + 8; x < 56; x += 12) R(g, x, y, 1, 6, '#6a665c'); box(g, 4, 8, 56, 6, '#6a4a2a', '#8a6a3a'); box(g, 18, 30, 28, 26, '#1a0e08'); const f = Math.sin(t / 90) * 2; g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(22, 56); g.quadraticCurveTo(32, 30 + f, 42, 56); g.fill(); g.fillStyle = '#ffd34d'; g.beginPath(); g.moveTo(26, 56); g.quadraticCurveTo(32, 40 - f, 38, 56); g.fill(); },
    piano(g) { box(g, 4, 14, 56, 30, '#2a2228', '#4a3e46', '#1a141a'); R(g, 8, 34, 48, 10, '#f4f0e8'); for (let x = 10; x < 56; x += 6) R(g, x, 34, 1, 10, '#8a8478'); for (let x = 12; x < 54; x += 12) { R(g, x, 34, 3, 6, '#111'); R(g, x + 6, 34, 3, 6, '#111'); } R(g, 8, 44, 4, 14, OL); R(g, 52, 44, 4, 14, OL); box(g, 20, 18, 24, 10, '#f4ecd8'); R(g, 23, 21, 18, 1, '#555'); R(g, 23, 24, 14, 1, '#555'); },
    aquarium(g, t) { box(g, 6, 18, 52, 34, '#6ac8f0', '#a8e8ff', '#3a8ac0'); R(g, 8, 44, 48, 6, '#d8c890'); const fx = 14 + (Math.sin(t / 600) * 0.5 + 0.5) * 30; g.fillStyle = '#ff8a2a'; g.beginPath(); g.ellipse(fx, 32, 5, 3, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(fx - 5, 32); g.lineTo(fx - 9, 29); g.lineTo(fx - 9, 35); g.fill(); g.fillStyle = '#ffe14a'; g.beginPath(); g.ellipse(64 - fx, 38, 4, 2.5, 0, 0, 7); g.fill(); R(g, 46, 30, 2, 14, '#3a9a4a'); R(g, 50, 34, 2, 10, '#3a9a4a'); box(g, 10, 52, 44, 6, '#6a4a2a'); },
    floorlamp(g, t) { R(g, 30, 22, 4, 32, OL); R(g, 31, 22, 2, 32, '#c8a060'); box(g, 22, 52, 20, 5, '#6a4a2a'); g.fillStyle = OL; g.beginPath(); g.moveTo(18, 24); g.lineTo(46, 24); g.lineTo(40, 6); g.lineTo(24, 6); g.closePath(); g.fill(); g.fillStyle = '#ffe8a8'; g.beginPath(); g.moveTo(21, 22); g.lineTo(43, 22); g.lineTo(38, 8); g.lineTo(26, 8); g.closePath(); g.fill(); g.globalAlpha = 0.25 + Math.sin(t / 300) * 0.05; g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(32, 18, 18, 0, 7); g.fill(); g.globalAlpha = 1; },
    vase(g) { g.fillStyle = OL; g.beginPath(); g.ellipse(32, 46, 13, 12, 0, 0, 7); g.fill(); g.fillStyle = '#5a8ad0'; g.beginPath(); g.ellipse(32, 46, 11, 10, 0, 0, 7); g.fill(); box(g, 27, 30, 10, 8, '#5a8ad0', '#8ab0e8'); R(g, 24, 46, 16, 2, '#f4f0e8'); R(g, 30, 14, 2, 18, '#3a9a4a'); R(g, 24, 18, 2, 14, '#3a9a4a'); R(g, 38, 16, 2, 16, '#3a9a4a'); circ(g, 31, 12, 5, '#ff6a8a'); circ(g, 25, 16, 4, '#ffd34d'); circ(g, 39, 14, 4, '#ffffff'); },
    doll(g) { circ(g, 32, 40, 13, '#b07a46'); circ(g, 32, 22, 11, '#b07a46'); circ(g, 23, 13, 4, '#b07a46'); circ(g, 41, 13, 4, '#b07a46'); circ(g, 32, 26, 4, '#e8c8a0'); R(g, 28, 20, 2, 3, OL); R(g, 35, 20, 2, 3, OL); R(g, 31, 25, 3, 2, OL); circ(g, 20, 44, 5, '#b07a46'); circ(g, 44, 44, 5, '#b07a46'); R(g, 26, 34, 12, 4, '#e0405a'); },
    clock(g, t) { circ(g, 32, 30, 18, '#8a5a30'); circ(g, 32, 30, 14, '#f8f2e4'); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; R(g, 32 + Math.cos(a) * 11 - 1, 30 + Math.sin(a) * 11 - 1, 2, 2, '#555'); } const s = t / 1000; g.strokeStyle = OL; g.lineWidth = 2.5; g.beginPath(); g.moveTo(32, 30); g.lineTo(32 + Math.cos(s / 60 - 1.57) * 7, 30 + Math.sin(s / 60 - 1.57) * 7); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(32, 30); g.lineTo(32 + Math.cos(s - 1.57) * 11, 30 + Math.sin(s - 1.57) * 11); g.stroke(); },
    curtain(g) { box(g, 4, 6, 56, 5, '#8a5a30', '#b07a46'); for (const x0 of [6, 36]) { g.fillStyle = OL; g.fillRect(x0 - 1, 11, 24, 46); g.fillStyle = '#c04a6a'; g.fillRect(x0, 11, 22, 44); g.fillStyle = '#d86a8a'; for (let x = x0 + 3; x < x0 + 22; x += 6) g.fillRect(x, 11, 2, 44); } R(g, 6, 34, 22, 3, '#ffd34d'); R(g, 36, 34, 22, 3, '#ffd34d'); },
    wreath(g) { g.strokeStyle = OL; g.lineWidth = 12; g.beginPath(); g.arc(32, 30, 16, 0, 7); g.stroke(); g.strokeStyle = '#2a8a3a'; g.lineWidth = 8; g.beginPath(); g.arc(32, 30, 16, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; circ(g, 32 + Math.cos(a) * 16, 30 + Math.sin(a) * 16, 2.5, i % 2 ? '#ff4a4a' : '#ffd34d'); } box(g, 26, 44, 12, 6, '#d83a3a'); },
  };
  const ANIM = { fireplace: 1, aquarium: 1, floorlamp: 1, clock: 1 };
  const _df = drawFurn;
  drawFurn = function (g, k, x, y, t, owner) {
    const d = DRAW[k]; if (!d) return _df(g, k, x, y, t, owner);
    const key = k + (ANIM[k] ? '|' + Math.floor((t || 0) / 120) % 50 : ''); let c = cache[key]; if (!c) { c = mkc(64, 64); d(c.getContext('2d'), t || 0); if (Object.keys(cache).length > 400) for (const q in cache) delete cache[q]; cache[key] = c; }
    const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true; g.drawImage(c, x, y, 32, 32); g.imageSmoothingEnabled = sm;
  };
  // ── 집 실내 그리기 ──
  const _dti = window.drawTentInside;
  window.drawTentInside = function (t, sx, sy, now) {
    if (t.kind !== 'house') return _dti(t, sx, sy, now);
    const dc = t.deco || {}, WP = GD.WALLPAPERS[dc.wall | 0] || GD.WALLPAPERS[0], FL = GD.FLOORS[dc.floor | 0] || GD.FLOORS[0];
    const x0 = t.x * TS - sx, y0 = t.y * TS - sy, w = t.w, h = t.h, g = ctx;
    // 바닥
    for (let ly = 1; ly < h - 1; ly++) for (let lx = 1; lx < w - 1; lx++) { const X = x0 + lx * TS, Y = y0 + ly * TS, f = dc.floor | 0;
      if (f === 1 || f === 5) { R(g, X, Y, TS, TS, (lx + ly) % 2 ? FL.a : FL.b); if (f === 5) { R(g, X, Y + TS - 1, TS, 1, '#8a8448'); R(g, X + TS - 1, Y, 1, TS, '#8a8448'); } }
      else if (f === 3) { R(g, X, Y, TS, TS, FL.a); R(g, X + ((ly % 2) ? 0 : 16), Y, 1, TS, FL.b); R(g, X, Y + TS - 1, TS, 1, FL.b); }
      else if (f === 2 || f === 4) { R(g, X, Y, TS, TS, FL.a); if ((lx + ly) % 3 === 0) R(g, X + 12, Y + 12, 8, 8, FL.b); }
      else { R(g, X, Y, TS, TS, FL.a); for (let i = 0; i < 4; i++) R(g, X, Y + i * 8 + 7, TS, 1, FL.b); R(g, X + ((lx * 7 + ly * 3) % 3) * 10 + 4, Y, 1, TS, FL.b); } }
    // 바닥 가장자리 그림자
    { const gr = g.createLinearGradient(0, y0 + TS, 0, y0 + TS * 2); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x0 + TS, y0 + TS, (w - 2) * TS, TS); }
    // 뒷벽 (벽지) — 위로 1.6칸 높게
    const wt = y0 - 1.6 * TS, wb = y0 + TS;
    R(g, x0, wt, w * TS, wb - wt, WP.a); for (let x = x0 + 6; x < x0 + w * TS; x += 16) R(g, x, wt, 6, wb - wt, WP.b);
    R(g, x0, wt, w * TS, 6, '#6a4a2a'); R(g, x0, wt + 6, w * TS, 2, '#8a6a3a'); R(g, x0, wb - 8, w * TS, 8, '#7a5230'); R(g, x0, wb - 8, w * TS, 2, '#9a7248');
    // 옆벽·앞벽 (문 자리 비움)
    const side = '#5a3a22'; R(g, x0, wt, TS * 0.55, (h + 1.6) * TS, side); R(g, x0 + (w - 0.55) * TS, wt, TS * 0.55, (h + 1.6) * TS, side);
    const dx = w >> 1, by = y0 + (h - 1) * TS; R(g, x0, by + TS * 0.35, dx * TS, TS * 0.65, side); R(g, x0 + (dx + 1) * TS, by + TS * 0.35, (w - dx - 1) * TS, TS * 0.65, side);
    R(g, x0 + dx * TS - 3, by + TS * 0.2, 3, TS * 0.8, '#3a2412'); R(g, x0 + (dx + 1) * TS, by + TS * 0.2, 3, TS * 0.8, '#3a2412');
    R(g, x0 + dx * TS, by + TS * 0.7, TS, TS * 0.3, '#8a6a3a');
    // 가구: 벽에 거는 것은 벽지 위, 나머지는 캐릭터 크기에 맞게 크게
    const K = 1.45, fs = [...t.furn].sort((a, b) => a.y - b.y);
    for (const f of fs) { const FD = GD.FURNITURE[f.k] || {}; let X = x0 + f.x * TS, Y = y0 + f.y * TS;
      if (f.y === 0 && FD.wall) Y -= TS * 0.55;
      const ax = X + 16, ay = Y + 32; g.save(); g.translate(ax, ay); g.scale(K, K); g.translate(-ax, -ay); drawFurn(g, f.k, X, Y, now); g.restore(); }
    drawText(t.owner + '의 집', x0 + w * TS / 2, wt - 6, '#ffe0a0', 12);
  };
})();

// ═══════ 스킬 이펙트 그림 (GPT 시트 15장, 4프레임) ═══════
(function () {
  // [시트, 줄, 방식, 크기(칸), 바닥기준(0~1)]  방식: area 대상/자기 위치, proj 날아가며+명중, impact 대상마다 명중, line 직선, once 시전자 1회
  const M = {
    w_smash: ['w1', 0, 'area', 2.4, .75], w_spin: ['w1', 1, 'area', 0, .6], w_roar: ['w1', 2, 'area', 2.6, .8], g_wall: ['w1', 3, 'area', 2.6, .82],
    g_taunt: ['w2', 0, 'area', 0, .55], g_quake: ['w2', 1, 'area', 0, .72], b_rage: ['w2', 2, 'area', 2.6, .8], b_combo: ['w2', 3, 'area', 2.4, .6],
    b_storm: ['w3', 0, 'area', 0, .78], pa_wall: ['w3', 1, 'area', 0, .8], pa_hammer: ['w3', 2, 'area', 0, .78], fo_iron: ['w3', 3, 'area', 2.8, .85],
    g_knight: ['w5', 0, 'area', 2.8, .85], g_king: ['w5', 1, 'area', 3, .85], b_knight: ['w5', 2, 'area', 2.8, .85], b_king: ['w5', 3, 'area', 3, .85],
    fo_taunt: ['w4', 0, 'area', 0, .72], bm_dance: ['w4', 1, 'impact', 2.2, .55], de_crush: ['h6', 1, 'area', 0, .75], de_end: ['w4', 3, 'area', 0, .78], hx_soul: ['m6', 0, 'impact', 2.2, .55],
    m_fire: ['m1', 0, 'proj', 1.9, .6], m_frost: ['m1', 1, 'area', 0, .75], m_chain: ['m1', 2, 'impact', 2.2, .6], e_meteor: ['m1', 3, 'area', 0, .78],
    e_bliz: ['m2', 0, 'area', 0, .78], e_hell: ['m2', 1, 'area', 0, .75], e_aura: ['m2', 2, 'area', 2.8, .7], e_cata: ['m2', 3, 'area', 0, .72],
    s_wolf: ['m3', 0, 'area', 2.2, .75], s_golem: ['m3', 1, 'area', 2.6, .8], s_spirit: ['m3', 2, 'area', 2.4, .78], s_prison: ['m3', 3, 'area', 0, .82],
    s_lich: ['m4', 0, 'area', 2.8, .8], am_surge: ['m4', 1, 'area', 2.8, .8], am_rain: ['m4', 2, 'area', 0, .78], cm_slow: ['m4', 3, 'area', 0, .78],
    cm_haste: ['m5', 0, 'area', 0, .78], lk_legion: ['m5', 1, 'area', 2.4, .75], lk_dk: ['m5', 2, 'area', 2.8, .8], hx_plague: ['m5', 3, 'area', 0, .8],
    h_shot: ['h1', 0, 'proj', 1.7, .5], h_heal: ['h1', 1, 'area', 0, .75], h_multi: ['h1', 2, 'once', 2.4, .5], r_rain: ['h1', 3, 'area', 0, .8],
    r_pierce: ['h2', 0, 'line', 0, .5], r_aid: ['h2', 1, 'area', 0, .75], r_eye: ['h2', 2, 'area', 2.6, .7], r_snipe: ['h2', 3, 'proj', 2.6, .8],
    p_great: ['h3', 0, 'area', 0, .78], p_bless: ['h3', 1, 'area', 0, .78], p_holy: ['h3', 2, 'area', 0, .6], p_revive: ['h3', 3, 'area', 0, .82],
    p_angel: ['h4', 0, 'area', 0, .82], sn_head: ['h4', 1, 'proj', 1.8, .5], sn_focus: ['h4', 2, 'area', 2.6, .65], aa_rain: ['h4', 3, 'area', 0, .82],
    aa_storm: ['h5', 0, 'once', 3, .78], st_light: ['h5', 1, 'area', 0, .72], st_miracle: ['h5', 2, 'area', 0, .82], iq_bolt: ['h5', 3, 'area', 0, .82],
    iq_judge: ['h6', 0, 'area', 0, .8], bm_flash: ['w4', 2, 'line', 0, .5],
  };
  const SH = {}, CEL = 192;
  const sheet = n => { let o = SH[n]; if (!o) { o = SH[n] = new Image(); o.src = 'gfx/sfx/' + n + '.webp'; } return o.complete && o.naturalWidth ? o : null; };
  // 처음 화면에 들어올 때 내 직업 시트를 미리 받아둠
  setTimeout(() => { try { const used = new Set(Object.values(M).map(v => v[0])); for (const n of used) sheet(n); } catch (e) { } }, 6000);
  const L = []; const lastOnce = {};
  const _add = addFx; const RING = [];
  addFx = function (f) {
    { const sk = f && f.s && GD.SKILL[f.s]; if (sk && f.k === 'skill' && (sk.kind === 'heal' || sk.kind === 'partyBuff') && sk.r) RING.push({ x: f.x, y: f.y, r: sk.r, c: sk.col || '#7dff9a', t0: performance.now() }); } /* 치유 범위 표시 */
    const mp = f && f.s && M[f.s];
    if (mp && (f.k === 'skill' || f.k === 'proj')) {
      const [sn, row, mode, size, by] = mp; const now = performance.now();
      if (!sheet(sn)) return _add(f); // 그림 아직 못 받음 → 기존 이펙트
      if (mode === 'proj' && f.k === 'proj') { _add(f); f.hide = 1; L.push({ sn, row, f0: 0, f1: 1, t0: now, dur: f.dur, fx: f.fx, fy: f.fy, tx: f.tx, ty: f.ty, sz: size, by, rot: 1 }); L.push({ sn, row, f0: 2, f1: 3, t0: now + f.dur, dur: 380, x: f.tx, y: f.ty, sz: size * 1.25, by }); return; }
      if (mode === 'impact' && f.k === 'proj') { _add(f); L.push({ sn, row, f0: 0, f1: 3, t0: now + f.dur * 0.8, dur: 520, x: f.tx, y: f.ty, sz: size, by }); return; }
      if (mode === 'once' && f.k === 'proj') { _add(f); if (now - (lastOnce[f.s] || 0) > 300) { lastOnce[f.s] = now; L.push({ sn, row, f0: 0, f1: 3, t0: now, dur: 600, x: f.fx, y: f.fy, sz: size, by, ang: mp[2] === 'once' && f.s === 'h_multi' ? Math.atan2(f.ty - f.fy, f.tx - f.fx) : null }); } return; }
      if (f.k === 'skill') { _add(f); f.hide = 1;
        let sz = size || Math.min(/meteor|rain/.test(f.f) ? 7 : 5.2, Math.max(2.6, (f.r || 1.5) * 2 + 0.8)), dur = Math.max(f.dur || 650, mode === 'area' && /meteor|rain/.test(f.f) ? 950 : 720);
        if (mode === 'line') { const d = [[0, 1], [-1, 0], [1, 0], [0, -1]][f.d | 0], r = f.r || 5; L.push({ sn, row, f0: 0, f1: 3, t0: now, dur: 520, x: f.x + d[0] * r / 2, y: f.y + d[1] * r / 2, sz: r + 1, by, ang: Math.atan2(d[1], d[0]) }); return; }
        L.push({ sn, row, f0: 0, f1: 3, t0: now, dur, x: f.x, y: f.y, sz, by, id: f.id }); return; }
    }
    return _add(f);
  };
  const _dfx = drawFx;
  drawFx = function (now, sx, sy, layer) {
    _dfx(now, sx, sy, layer); if (layer === 'top') return;
    const g = ctx;
    for (let i = RING.length - 1; i >= 0; i--) { const e = RING[i], k = (now - e.t0) / 1100; if (k >= 1) { RING.splice(i, 1); continue; } /* 바닥에 치유 범위 원: 퍼지며 나타났다 서서히 사라짐 */
      const cx = e.x * TS + TS / 2 - sx, cy = e.y * TS + TS / 2 - sy, R0 = (e.r + 0.5) * TS * Math.min(1, 0.35 + k * 2.2), a = k < 0.6 ? 1 : (1 - k) / 0.4;
      g.save(); g.globalAlpha = 0.22 * a; g.fillStyle = e.c; g.beginPath(); g.ellipse(cx, cy + 8, R0, R0 * 0.62, 0, 0, 7); g.fill();
      g.globalAlpha = 0.9 * a; g.strokeStyle = e.c; g.lineWidth = 3; g.setLineDash([10, 6]); g.lineDashOffset = -now / 40; g.beginPath(); g.ellipse(cx, cy + 8, R0, R0 * 0.62, 0, 0, 7); g.stroke();
      g.setLineDash([]); g.globalAlpha = 0.5 * a; g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy + 8, R0 - 4, R0 * 0.62 - 3, 0, 0, 7); g.stroke(); g.restore(); }
    if (!L.length) return;
    for (let i = L.length - 1; i >= 0; i--) { const e = L[i]; const k = (now - e.t0) / e.dur; if (k >= 1) { L.splice(i, 1); continue; } if (k < 0) continue;
      const im = sheet(e.sn); if (!im) continue;
      const fr = Math.min(e.f1, e.f0 + Math.floor(k * (e.f1 - e.f0 + 1)));
      let x = e.x, y = e.y, ang = e.ang;
      if (e.rot) { x = e.fx + (e.tx - e.fx) * k; y = e.fy + (e.ty - e.fy) * k; ang = Math.atan2(e.ty - e.fy, e.tx - e.fx); }
      const px = x * TS + TS / 2 - sx, py = y * TS + TS / 2 - sy - (e.rot || ang != null ? 12 : 0);
      const W = e.sz * TS / 0.86; const a = k > 0.82 ? (1 - k) / 0.18 : 1;
      g.save(); g.globalAlpha = a; g.translate(px, py); if (ang != null) g.rotate(ang);
      g.drawImage(im, fr * CEL, e.row * CEL, CEL, CEL, -W / 2, ang != null ? -W / 2 : -W * e.by, W, W);
      g.restore(); }
  };
  window.SKFX = { M, L };
})();
