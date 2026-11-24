// ═══════════════════════════════════════════
//  그래픽 아틀라스 (GPT 시안 그대로) — gfx/tiles.png, gfx/sprites.png
// ═══════════════════════════════════════════
const GFX = { ok: false, tiles: new Image(), spr: new Image(), A: window.GFX_ATLAS, SS: 2 }; /* 소품 그림: 새 GPT 시트(2배 해상도) */
/* 스프라이트(나무·건물·소품) 색감 보정: 바닥과 같은 톤으로 채도·밝기 살짝 낮춤 → 캐릭터와 어울림 */
function gradeSheet(img, sat, mul) { try { const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'saturation'; g.globalAlpha = sat; g.fillStyle = '#808080'; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1; g.fillStyle = mul; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0); return c; } catch (e) { return img; } }
/* 나무 테두리의 흰 테가 배경에서 붕 떠 보이던 원인 제거 + 밑동의 회색 원판을 자연스러운 그림자로 */
function cleanTrees(c) { try { if (!c.getContext) return c; const g = c.getContext('2d');
  for (const k of ['oak', 'apple', 'cherry', 'pine', 'snowpine', 'cactus']) { const r = GFX.A.sprites[k]; if (!r) continue; const [x0, y0, w, h] = r; const im = g.getImageData(x0, y0, w, h), d = im.data;
    const A = (x, y) => x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3];
    for (let pass = 0; pass < 2; pass++) { const kill = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 10) continue; const R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B);
        const edge = A(x - 1, y) < 40 || A(x + 1, y) < 40 || A(x, y - 1) < 40 || A(x, y + 1) < 40; if (edge && mx > 150 && mx - mn < 40 && k !== 'snowpine') kill.push(i); }
      for (const i of kill) d[i + 3] = 0; }
    for (let y = Math.floor(h * 0.72); y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 10) continue; const R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (mx > 110 && mx - mn < 34) { d[i] = 18; d[i + 1] = 26; d[i + 2] = 12; d[i + 3] = 80; } }
    g.putImageData(im, x0, y0); }
  return c; } catch (e) { return c; } }
(function () { let n = 0; const done = () => { if (++n === 2) { GFX.GROUND = new Set(['grass', 'forest', 'dirt', 'sand', 'snow', 'swamp', 'volc'].flatMap(k => GFX.A.tiles[k] || [])); /* 새 그림은 색 보정 없이 원본 색 그대로 (보정하면 칙칙해짐) */ GFX.ok = true; tileCache.clear(); } }; GFX.tiles.onload = done; GFX.spr.onload = done; GFX.tiles.src = 'gfx/tiles.png?v=' + (window.BUILDV || 1); GFX.spr.onerror = () => { GFX.SS = 1; GFX.spr.onerror = null; GFX.spr.src = 'gfx/sprites.png?v=' + (window.BUILDV || 1); }; GFX.spr.src = 'gfx/sprites2x.webp?v=' + (window.BUILDV || 1); })();
const gTile = (name, i) => { const L = GFX.A.tiles[name]; return L[((i % L.length) + L.length) % L.length]; };
/* 바닥 타일 이음매 제거: 원본 타일 가장자리에 어두운 띠가 있어 화면에 가로줄·격자가 보였음 → 반 칸 밀린 그림과 가운데 기준으로 섞어 가장자리를 매끈하게 */
const SEAM = new Map();
function seamCell(idx) {
  let c = SEAM.get(idx); if (c) return c;
  const ox = (idx % 16) * 64, oy = Math.floor(idx / 16) * 64;
  const a = mk(64, 64), ag = a.getContext('2d'); ag.drawImage(GFX.tiles, ox, oy, 64, 64, 0, 0, 64, 64);
  const b = mk(64, 64), bg = b.getContext('2d'); for (const dx of [-48, 16]) for (const dy of [-48, 16]) bg.drawImage(a, dx, dy); /* 원본 타일은 32px 조각 4개 → 16px 밀어 조각 경계를 조각 가운데 그림으로 덮음 */
  try { const A = ag.getImageData(0, 0, 64, 64), B = bg.getImageData(0, 0, 64, 64), d = A.data, e = B.data;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const fx = (x + 0.5) % 32, fy = (y + 0.5) % 32; const w = Math.min(1, Math.min(fx, 32 - fx, fy, 32 - fy) / 6); const i = (y * 64 + x) * 4; for (let k = 0; k < 3; k++) d[i + k] = d[i + k] * w + e[i + k] * (1 - w); d[i + 3] = 255; }
    ag.putImageData(A, 0, 0); } catch (err) { }
  SEAM.set(idx, a); return a;
}
function gfxCellCanvas(idx, extra) {
  const c = mk(64, 64), g = c.getContext('2d');
  if (GFX.GROUND && GFX.GROUND.has(idx)) g.drawImage(seamCell(idx), 0, 0); else g.drawImage(GFX.tiles, (idx % 16) * 64, Math.floor(idx / 16) * 64, 64, 64, 0, 0, 64, 64); if (extra) extra(g); return c;
}
function sprRect(k) { return GFX.A.sprites[k]; }
function drawSpr(k, dx, dy, dw, dh, g = ctx) { const r = sprRect(k); if (!r) return; const S = GFX.SS, sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(GFX.spr, r[0] * S, r[1] * S, r[2] * S, r[3] * S, dx, dy, dw, dh); g.imageSmoothingEnabled = sm; } /* 2배 그림을 줄여 그릴 때 계단 깨짐 방지 */
// 땅 종류 → 타일
const UNDER_TILE = { g: ['grass'], f: ['forest'], d: ['sand'], s: ['snow'], w: ['swamp'], v: ['volc', 1] };
function groundCell(u, v) { const t = UNDER_TILE[u] || UNDER_TILE.g; return t[1] != null ? GFX.A.tiles[t[0]][t[1]] : gTile(t[0], v); }
// 벽 조각: 원본 벽 그림의 가운데 한 칸을 잘라 씀
function wallSlice(key, v, full) {
  const r = sprRect(key); if (!r) return null; const sw = Math.min(r[2], 54); const sx = r[0] + Math.floor(((r[2] - sw) * ((v % 3) / 2))) ;
  const c = mk(64, full ? 84 : 64), g = c.getContext('2d'); g.imageSmoothingEnabled = true;
  const S = GFX.SS; if (full) g.drawImage(GFX.spr, sx * S, r[1] * S, sw * S, r[3] * S, 0, 0, 64, 84); else g.drawImage(GFX.spr, sx * S, (r[1] + r[3] - Math.round(sw * 0.98)) * S, sw * S, Math.round(sw * 0.98) * S, 0, 0, 64, 64);
  return c;
}
const _tileImgEnv = tileImg;
/* 새 바닥 그림(이음매 없는 큰 그림 한 장, 10칸 주기): 칸의 실제 위치로 잘라 써서 이음매·격자가 생기지 않음 */
const TEXPOS = { x: 0, y: 0 }, GTEX = {}, GTP = 10;
const GPER = { castle: 20, lava: 20 }; /* 나머지는 10칸 주기 */
for (const n of ['grass', 'forest', 'dirt', 'cobble', 'sand', 'snow', 'swamp', 'ash', 'cave', 'water', 'lava', 'castle']) { const im = new Image(); im.onload = () => { im.ok = 1; tileCache.clear(); if (typeof gChunks !== 'undefined') gChunks.clear(); }; im.src = 'gfx/ground_' + n + '.webp?v=' + (window.BUILDV || 1); GTEX[n] = im; }
function texMat(id, under, castle) {
  if ((id === T.ROOF || id === T.HOUSE) && bldCovered(TEXPOS.x, TEXPOS.y)) return 'cobble'; /* 새 건물 그림 아래 옛 지붕 칸이 비쳐 보이던 문제 */
  if (id === T.CASTLE) return 'castle'; if (id === T.LAVA) return 'lava'; if (id === T.WATER) return 'water'; if (id === T.CAVE) return 'cave';
  if (castle) return null;
  if (id === T.SAND) return 'sand'; if (id === T.SNOW) return 'snow'; if (id === T.SWAMP) return 'swamp'; if (id === T.ASH) return 'ash';
  if (id === T.TREE || id === T.FENCE || id === T.ROCK || id === T.PINE || id === T.CACTUS || id === T.DEADTREE) { const u = under || (id === T.PINE ? 's' : id === T.CACTUS ? 'd' : id === T.DEADTREE ? 'w' : id === T.ROCK ? '' : 'g'); const M = { g: 'grass', f: 'forest', d: 'sand', s: 'snow', w: 'swamp', v: 'ash' }; return M[u] || null; }
  if (id === T.GRASS || id === T.FLOWER) return 'grass'; if (id === T.FOREST) return 'forest'; if (id === T.ROAD) return 'dirt'; if (id === T.STONE) return 'cobble';
  if (id === T.TREE || id === T.FENCE || id === T.ROCK) { const u = under || (id === T.ROCK ? '' : 'g'); return u === 'g' ? 'grass' : u === 'f' ? 'forest' : null; }
  return null;
}
tileImg = function (id, v, pal, castle, frame, under) {
  if (!GFX.ok) return _tileImgEnv(id, v, pal, castle, frame, under);
  { const mt = texMat(id, under, castle), tx = mt && GTEX[mt]; if (tx && tx.ok) {
    const P = GPER[mt] || GTP, an = mt === 'water' || mt === 'lava' ? (frame | 0) : 0; /* 물·용암은 프레임마다 그림을 살짝 흘려 움직임 */
    const gx = ((TEXPOS.x % P) + P) % P, gy = ((TEXPOS.y % P) + P) % P, key = 'T|' + mt + '|' + gx + '|' + gy + '|' + an + '|' + (id === T.FENCE ? (fenceVert(TEXPOS.x, TEXPOS.y) ? 'fv' : 'f') : '') + (id === T.CAVE ? 'c' : '');
    let c = tileCache.get(key); if (c) return c; c = mk(64, 64); const g = c.getContext('2d');
    if (an) { const W = P * 64, ox = (gx * 64 + an * 6) % W, oy = (gy * 64 + an * 3) % W; for (const dx of [0, W]) for (const dy of [0, W]) g.drawImage(tx, dx - ox, dy - oy); } else g.drawImage(tx, gx * 64, gy * 64, 64, 64, 0, 0, 64, 64);
    if (id === T.FENCE) { const vert = fenceVert(TEXPOS.x, TEXPOS.y), SS = GFX.SS;
      if (vert) { /* 세로 울타리: 기둥 + 세로 난간 (가로 울타리를 쌓아 사다리처럼 보이던 문제) */ g.fillStyle = '#3a2412'; g.fillRect(27, 0, 10, 64); g.fillStyle = '#8a5a2e'; g.fillRect(29, 0, 6, 64); g.fillStyle = '#a8743e'; g.fillRect(29, 0, 2, 64); const r = sprRect('fencepost'); g.drawImage(GFX.spr, r[0] * SS, r[1] * SS, r[2] * SS, r[3] * SS, 18, 8, 28, 50); }
      else { const r = sprRect('fence'); g.drawImage(GFX.spr, (r[0] + 20) * SS, r[1] * SS, 54 * SS, r[3] * SS, 0, 24, 64, 40); } }
    tileCache.set(key, c); return c; } }
  const key = 'G|' + id + '|' + v + '|' + frame + '|' + under + '|' + castle + '|' + pal;
  let c = tileCache.get(key); if (c) return c;
  let cell = null, extra = null;
  switch (id) {
    case T.GRASS: cell = gTile('grass', v); break;
    case T.FLOWER: cell = gTile('grass', v); extra = g => { g.save(); g.scale(4, 4); const A = { P: (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); }, px: (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); } }; drawFlowers(A, v * 31 + 7); g.restore(); }; break;
    case T.FOREST: cell = gTile('forest', v); break;
    case T.ROAD: cell = gTile('dirt', v); break;
    case T.STONE: cell = gTile('cobble', v); break;
    case T.SAND: cell = gTile('sand', v); break;
    case T.SNOW: cell = gTile('snow', v % 2); break;
    case T.SWAMP: cell = gTile('swamp', v % 2); break;
    case T.ASH: cell = GFX.A.tiles.volc[1]; break;
    case T.LAVA: cell = gTile('lava', v + frame * 2); break;
    case T.WATER: cell = gTile('water', v + frame); break;
    case T.CASTLE: cell = castle ? GFX.A.tiles.flag2[v % 3] : GFX.A.tiles.castle[0]; break;
    case T.CARPET: { /* 붉은 융단: 칸마다 격자선이 보이던 것을 이어진 융단 + 바깥 테두리만 금색으로 */
      const C = T.CARPET, x = TEXPOS.x, y = TEXPOS.y, n = [tileAt(x, y - 1) === C, tileAt(x + 1, y) === C, tileAt(x, y + 1) === C, tileAt(x - 1, y) === C];
      const ck = 'CARPET|' + n.map(b => b ? 1 : 0).join('') + '|' + ((x + y) & 1); let cc = tileCache.get(ck); if (cc) return cc;
      cc = mk(64, 64); const g = cc.getContext('2d'); if (GTEX.castle && GTEX.castle.ok) g.drawImage(GTEX.castle, ((x % 20) + 20) % 20 * 64, ((y % 20) + 20) % 20 * 64, 64, 64, 0, 0, 64, 64);
      const L = n[3] ? 0 : 6, R = n[1] ? 64 : 58, U = n[0] ? 0 : 6, D = n[2] ? 64 : 58;
      g.fillStyle = '#6a1418'; g.fillRect(L, U, R - L, D - U); g.fillStyle = '#8a2026'; g.fillRect(L + (n[3] ? 0 : 4), U + (n[0] ? 0 : 4), R - L - (n[3] ? 0 : 4) - (n[1] ? 0 : 4), D - U - (n[0] ? 0 : 4) - (n[2] ? 0 : 4));
      g.fillStyle = 'rgba(255,200,120,.06)'; for (let i = 0; i < 64; i += 8) g.fillRect(0, i + ((x + y) & 1) * 4, 64, 2);
      g.fillStyle = '#d0a040'; if (!n[0]) g.fillRect(L, U, R - L, 3); if (!n[2]) g.fillRect(L, D - 3, R - L, 3); if (!n[3]) g.fillRect(L, U, 3, D - U); if (!n[1]) g.fillRect(R - 3, U, 3, D - U);
      tileCache.set(ck, cc); return cc; }
    case T.CAVE: cell = gTile('dirt', v); extra = g => { g.fillStyle = 'rgba(38,26,44,0.5)'; g.fillRect(0, 0, 64, 64); }; break;
    case T.TREE: case T.PINE: case T.DEADTREE: case T.CACTUS: case T.ROCK: cell = groundCell(under || (id === T.PINE ? 's' : id === T.CACTUS ? 'd' : id === T.DEADTREE ? 'w' : id === T.ROCK && castle ? 'v' : 'g'), v); if (id === T.ROCK && under === 'c') cell = GFX.A.tiles.volc[2]; break;
    case T.FENCE: cell = groundCell(under || 'g', v); extra = g => { const r = sprRect('fence'); const S = GFX.SS; g.drawImage(GFX.spr, (r[0] + 20) * S, r[1] * S, 54 * S, r[3] * S, 0, 24, 64, 40); }; break;
    case T.WALL: if (GTEX.cobble && GTEX.cobble.ok) { c = townWall(TEXPOS.x, TEXPOS.y); break; } /* falls through */
    case T.CASTLEWALL: case T.CAVEWALL: case T.RUINWALL: { const k = id === T.WALL ? 'wall' : id === T.CASTLEWALL ? 'castlewall' : id === T.RUINWALL ? 'ruinwall' : (v % 4 === 1 ? 'cavewall2' : 'cavewall'); c = wallSlice(k, v, false); break; }
    case T.BARS: { const fl = mk(64, 64), g = fl.getContext('2d'); g.drawImage(gfxCellCanvas(GFX.A.tiles.flag2[0]), 0, 0); drawSpr('bars', 2, 0, 60, 64, g); c = fl; break; }
    case T.UP: case T.DOWN: { const fl = gfxCellCanvas(castle ? GFX.A.tiles.flag2[0] : GFX.A.tiles.volc[2]); drawSpr(id === T.UP ? 'stairs' : 'stairs2', 6, 2, 52, 60, fl.getContext('2d')); if (id === T.DOWN) { const g = fl.getContext('2d'); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, 64, 64); } c = fl; break; }
  }
  if (!c && cell == null) return _tileImgEnv(id, v, pal, castle, frame, under);
  if (!c) c = gfxCellCanvas(cell, extra);
  if (castle && (id === T.CASTLE || id === T.CARPET)) { const g = c.getContext('2d'); g.fillStyle = 'rgba(20,10,30,.25)'; g.fillRect(0, 0, 64, 64); }
  tileCache.set(key, c); return c;
};
// 나무·바위
TREEISH.add(T.ROCK);
const _dtEnv = drawTreeAt;
drawTreeAt = function (id, x, y, sx, sy, under) {
  if (!GFX.ok) { if (id === T.ROCK) return; return _dtEnv(id, x, y, sx, sy, under); }
  const v = ((x * 7 + y * 13) ^ (x * y)) & 3;
  let k;
  if (id === T.ROCK) k = 'boulder';
  else if (id === T.PINE || under === 's') k = under === 's' || id === T.PINE ? 'snowpine' : 'pine';
  else if (id === T.CACTUS || under === 'd') k = 'cactus';
  else if (id === T.DEADTREE || under === 'w' || under === 'v') k = 'dead';
  else if (under === 'f') k = v === 1 ? 'pine' : 'oak';
  else k = v === 2 ? 'apple' : v === 3 ? 'cherry' : 'oak';
  /* 줄 맞춰 똑같이 찍힌 것처럼 보이던 문제: 칸마다 크기·위치·좌우를 조금씩 다르게 */
  let hh = Math.imul(x * 374761393 + y * 668265263, 1274126177); hh ^= hh >>> 13; const q1 = ((hh >>> 0) % 1000) / 1000, q2 = ((hh >>> 10) % 1000) / 1000, q3 = ((hh >>> 20) % 1000) / 1000;
  const r = sprRect(k); const sc = (id === T.ROCK ? 0.42 : k === 'cactus' ? 0.6 : 0.64) * (0.86 + q1 * 0.26); const w = r[2] * sc, h = r[3] * sc;
  const bx = x * TS + 16 - sx + (q2 - 0.5) * 12, by = (y + 1) * TS - sy - (id === T.ROCK ? 3 : 2) + (q3 - 0.5) * 6;
  ctx.fillStyle = 'rgba(20,40,10,.25)'; ctx.beginPath(); ctx.ellipse(bx, by - 2, w * 0.36, 5, 0, 0, 7); ctx.fill();
  if (q3 > 0.5) { ctx.save(); ctx.translate(Math.round(bx), 0); ctx.scale(-1, 1); drawSpr(k, Math.round(-w / 2), Math.round(by - h), Math.round(w), Math.round(h)); ctx.restore(); }
  else drawSpr(k, Math.round(bx - w / 2), Math.round(by - h), Math.round(w), Math.round(h));
};
// 건물
const BLD_SPR = { shop: 'b_shop', gear: 'b_gear', smith: 'b_smith', stable: 'b_stable', master: 'b_master', bank: 'b_bank' };
const _dbEnv = drawBuilding;
drawBuilding = function (l, sx, sy, now) {
  if (!GFX.ok) return _dbEnv(l, sx, sy, now);
  const kind = BLD_KIND[l.text]; if (!kind) return; const r = sprRect(BLD_SPR[kind]);
  const w = 5.7 * TS, h = w * r[3] / r[2]; const cx = (l.bx + 2.5) * TS - sx, by = (l.by + 4) * TS - sy + 2;
  if (cx < -w || cx > W + w || by < -20 || by - h > H + 20) return;
  drawSpr(BLD_SPR[kind], Math.round(cx - w / 2), Math.round(by - h), Math.round(w), Math.round(h));
};
const _dfEnv = drawFountain;
drawFountain = function (x, y, sx, sy, now) {
  if (!GFX.ok) return _dfEnv(x, y, sx, sy, now);
  const r = sprRect('fountain'); const w = 3.4 * TS, h = w * r[3] / r[2];
  drawSpr('fountain', Math.round(x * TS + 16 - w / 2 - sx), Math.round((y + 2) * TS - h - sy + 4), Math.round(w), Math.round(h));
  for (let i = 0; i < 4; i++) { const k = ((now / 900) + i / 4) % 1; ctx.globalAlpha = 0.6 * (1 - k); ctx.fillStyle = '#e8f6ff'; ctx.fillRect(x * TS + 16 - sx + Math.sin(i * 2 + k * 3) * 10 * k, (y + 2) * TS - h - sy + 14 + k * 18, 2, 2); } ctx.globalAlpha = 1;
};
// 보물상자
const _csEnv = chestSprite;
const chestGfx = new Map();
chestSprite = function (t, open) {
  if (!GFX.ok) return _csEnv(t, open);
  const k = (t >= 5 ? 'c5' : t === 4 ? 'c4' : t === 3 ? 'c3' : 'c1') + (open ? 'o' : '');
  let c = chestGfx.get(k); if (c) return c; const r = sprRect(k); c = mk(32, 32); const g = c.getContext('2d'); const sc = Math.min(30 / r[2], 30 / r[3]); const w = r[2] * sc, h = r[3] * sc; const S = GFX.SS; g.drawImage(GFX.spr, r[0] * S, r[1] * S, r[2] * S, r[3] * S, (32 - w) / 2, 32 - h, w, h); chestGfx.set(k, c); return c;
};
// 장식: 풀숲·꽃덤불·버섯·그루터기·수련
function decorAt(id, x, y) {
  const h = ((Math.imul(x, 2654435761) ^ Math.imul(y, 40503)) >>> 0) % 100;
  if (id === T.GRASS) return h < 3 ? 'bush1' : h < 5 ? 'bush2' : h < 9 ? 'grass1' : h < 12 ? 'grass2' : h < 13 ? 'mush' : h < 14 ? 'stump1' : null;
  if (id === T.FOREST) return h < 6 ? 'grass2' : h < 9 ? 'mush' : h < 12 ? 'stump2' : h < 15 ? 'bush1' : null;
  if (id === T.SWAMP) return h < 8 ? 'reed' : h < 11 ? 'mush' : null;
  if (id === T.WATER) return h < 5 ? 'lily' : null;
  if (id === T.SAND) return h < 2 ? 'grass1' : null;
  return null;
}
function drawDecor(id, x, y, X0, Y0) {
  if (!GFX.ok) return; const k = decorAt(id, x, y); if (!k) return; const r = sprRect(k); const sc = k === 'lily' ? 0.42 : k.startsWith('bush') ? 0.5 : 0.45; const w = r[2] * sc, h = r[3] * sc;
  drawSpr(k, Math.round(X0 + 16 - w / 2), Math.round(Y0 + 30 - h), Math.round(w), Math.round(h));
}
// 던전 입구 (동굴 / 성문)
function drawEntrances(m, sx, sy, ents) {
  if (!GFX.ok || !/^world/.test(m.id)) return;
  for (const k in m.portals) { const p = m.portals[k]; if (!p.label || !/\d$/.test(p.to)) continue; const [x, y] = k.split(',').map(Number);
    const castle = /^(obs|demon|ruin|abyss|prison)/.test(p.to); const key = castle ? 'gate' : 'cave'; const r = sprRect(key); const w = (castle ? 4.6 : 3.8) * TS, h = w * r[3] / r[2];
    ents.push({ y: y + 0.5, f: () => drawSpr(key, Math.round(x * TS + 16 - w / 2 - sx), Math.round((y + 1) * TS - h - sy), Math.round(w), Math.round(h)) }); }
}

// ═══ 지형 경계 자연스럽게: 계단처럼 딱 끊기던 경계를, 이웃 지형 그림이 들쭉날쭉 스며들게 ═══
function fenceVert(x, y) { try { const F = T.FENCE; if (tileAt(x - 1, y) === F || tileAt(x + 1, y) === F) return false; return tileAt(x, y - 1) === F || tileAt(x, y + 1) === F; } catch (e) { return false; } }
const MATPRI = { grass: 8, forest: 7, snow: 6, sand: 5, swamp: 4, ash: 4, dirt: 3, cobble: 2, cave: 1, castle: 1, water: 0, lava: 0 };
function matAt(x, y) { const m = S.map; if (!m || x < 0 || y < 0 || x >= m.w || y >= m.h) return null; const id = m.t[y * m.w + x]; const under = m.biome && (id === T.TREE || id === T.FLOWER || id === T.ROCK || id === T.FENCE) ? biomeChar(x, y) : ''; return texMat(id, under, m.castle); }
const BLEND = new Map();
const hsh = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
function blendTile(mt, wx, wy, dir) { /* dir 0위 1오 2아래 3왼 4~7 모서리 */
  const P = GPER[mt] || GTP, gx = ((wx % P) + P) % P, gy = ((wy % P) + P) % P, key = mt + '|' + gx + '|' + gy + '|' + dir;
  let c = BLEND.get(key); if (c) return c; if (BLEND.size > 3000) BLEND.clear();
  c = mk(64, 64); const g = c.getContext('2d'); g.drawImage(GTEX[mt], gx * 64, gy * 64, 64, 64, 0, 0, 64, 64);
  try { const im = g.getImageData(0, 0, 64, 64), d = im.data;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      let dist; if (dir === 0) dist = y; else if (dir === 1) dist = 63 - x; else if (dir === 2) dist = 63 - y; else if (dir === 3) dist = x;
      else { const cx = dir === 4 || dir === 7 ? 0 : 63, cy = dir === 4 || dir === 5 ? 0 : 63; dist = Math.hypot(x - cx, y - cy) - 4; }
      const along = dir === 0 || dir === 2 ? wx * 64 + x : dir === 1 || dir === 3 ? wy * 64 + y : wx * 64 + x + wy * 64 + y;
      const wob = Math.sin(along * 0.11) * 4 + Math.sin(along * 0.037 + 1.7) * 5 + (hsh(wx * 64 + x, wy * 64 + y) - 0.5) * 5;
      const edge = (dir >= 4 ? 20 : 23) + wob, a = Math.max(0, Math.min(1, (edge - dist) / 5));
      d[(y * 64 + x) * 4 + 3] = Math.round(a * 255); }
    g.putImageData(im, 0, 0); } catch (e) { }
  BLEND.set(key, c); return c;
}
const _edgesOld = drawEdges;
drawEdges = function (id, x, y, X0, Y0) {
  const m = S.map; const me = GFX.ok && m && !m.castle ? matAt(x, y) : null;
  if (!me || !GTEX[me] || !GTEX[me].ok) return _edgesOld(id, x, y, X0, Y0);
  const pm = MATPRI[me]; const side = [];
  for (let k = 0; k < 4; k++) { const n = matAt(x + NB[k][0], y + NB[k][1]); side[k] = n; if (n && n !== me && MATPRI[n] > pm && GTEX[n] && GTEX[n].ok) ctx.drawImage(blendTile(n, x, y, k), X0, Y0, TS, TS); }
  const DG = [[1, -1, 0, 1, 5], [1, 1, 1, 2, 6], [-1, 1, 2, 3, 7], [-1, -1, 3, 0, 4]];
  for (const [dx, dy, a, b, dir] of DG) { const n = matAt(x + dx, y + dy); if (n && n !== me && MATPRI[n] > pm && side[a] !== n && side[b] !== n && GTEX[n] && GTEX[n].ok) ctx.drawImage(blendTile(n, x, y, dir), X0, Y0, TS, TS); }
  if (me === 'water') { /* 물가: 젖은 테두리 그늘 */ for (let k = 0; k < 4; k++) { const n = side[k]; if (n && n !== 'water' && n !== 'lava') { const t = tileAt(x + NB[k][0], y + NB[k][1]); if (t === T.BRIDGE) continue; const gr = k === 0 ? ctx.createLinearGradient(0, Y0, 0, Y0 + TS * 0.35) : k === 2 ? ctx.createLinearGradient(0, Y0 + TS, 0, Y0 + TS * 0.65) : k === 1 ? ctx.createLinearGradient(X0 + TS, 0, X0 + TS * 0.65, 0) : ctx.createLinearGradient(X0, 0, X0 + TS * 0.35, 0); gr.addColorStop(0, 'rgba(20,40,40,.35)'); gr.addColorStop(1, 'rgba(20,40,40,0)'); ctx.fillStyle = gr; ctx.fillRect(X0, Y0, TS, TS); } } }
};

// ═══ 새 건물 그림이 덮는 칸 (옛 지붕·벽 칸은 바닥으로) ═══
function bldCovered(x, y) { const m = S.map; if (!m || !m.labels) return false; if (m._bc === undefined || m._bcL !== m.labels) { m._bcL = m.labels; m._bc = new Set(); for (const l of m.labels) if (l.roofC && BLD_KIND[l.text]) for (let yy = l.by - 1; yy <= l.by + 3; yy++) for (let xx = l.bx; xx <= l.bx + 4; xx++) m._bc.add(xx + ',' + yy); } return m._bc.has(x + ',' + y); }
// ═══ 마을 성벽: 칸마다 탑 조각이 반복되던 것을 이어진 성벽으로 (가로=성벽 정면, 세로=성벽 윗면) ═══
function townWall(x, y) {
  const W_ = T.WALL, up = tileAt(x, y - 1) === W_, dn = tileAt(x, y + 1) === W_, lf = tileAt(x - 1, y) === W_, rt = tileAt(x + 1, y) === W_;
  const vert = (up || dn) && !(lf || rt), post = (up || dn) && (lf || rt);
  const gm = ['cobble', 'grass', 'sand', 'snow', 'dirt', 'forest'].find(n => [matAt(x, y + 1), matAt(x, y - 1), matAt(x - 1, y), matAt(x + 1, y)].includes(n)) || 'cobble';
  const key = 'TW|' + (vert ? 'v' : post ? 'p' : 'h') + '|' + (up ? 1 : 0) + (dn ? 1 : 0) + (lf ? 1 : 0) + (rt ? 1 : 0) + '|' + gm + '|' + ((x + y * 3) & 3);
  let c = tileCache.get(key); if (c) return c; c = mk(64, 64); const g = c.getContext('2d');
  const gt = GTEX[gm]; if (gt && gt.ok) g.drawImage(gt, ((x % 10) + 10) % 10 * 64, ((y % 10) + 10) % 10 * 64, 64, 64, 0, 0, 64, 64);
  const OL = '#2e2824', ST = '#a39687', ST2 = '#8f8274', MO = '#6b6056', CAP = '#c2b6a6', CAPD = '#9a8e80';
  const bricks = (X, Y, w, h, rowH, colW, off) => { g.fillStyle = ST; g.fillRect(X, Y, w, h); for (let r = 0, yy = Y; yy < Y + h; r++, yy += rowH) { g.fillStyle = MO; g.fillRect(X, yy, w, 1); const o = (r & 1) ? colW / 2 : 0; for (let xx = X - o + off; xx < X + w; xx += colW) if (xx > X) g.fillRect(xx, yy, 1, Math.min(rowH, Y + h - yy)); g.fillStyle = ST2; for (let xx = X - o + off + 3; xx < X + w - 3; xx += colW) if (((xx + r * 7 + x * 5) & 15) < 5) g.fillRect(Math.max(X, xx), yy + 2, 6, rowH - 3); } };
  if (vert) { /* 세로: 위에서 본 성벽 윗길 */
    const L = 14, R = 50, T0 = up ? 0 : 6, B0 = dn ? 64 : 58;
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(R, T0 + 4, 6, B0 - T0); g.fillRect(L - 4, T0 + 4, 4, B0 - T0);
    g.fillStyle = OL; g.fillRect(L - 2, T0, R - L + 4, B0 - T0);
    bricks(L, T0, R - L, B0 - T0, 10, 18, x * 7);
    g.fillStyle = CAP; g.fillRect(L, T0, 5, B0 - T0); g.fillRect(R - 5, T0, 5, B0 - T0); g.fillStyle = CAPD; g.fillRect(L + 4, T0, 1, B0 - T0); g.fillRect(R - 5, T0, 1, B0 - T0);
    for (let yy = T0 + 4; yy < B0 - 6; yy += 16) { g.fillStyle = OL; g.fillRect(L - 2, yy - 1, 8, 9); g.fillRect(R - 6, yy - 1, 8, 9); g.fillStyle = CAP; g.fillRect(L - 1, yy, 6, 7); g.fillRect(R - 5, yy, 6, 7); }
  } else { /* 가로(또는 모서리 기둥): 성벽 정면 + 윗부분 총안 */
    const L = lf ? 0 : 4, R = rt ? 64 : 60, top = 10, bot = 60;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(L, bot, R - L, 4);
    g.fillStyle = OL; g.fillRect(L - (lf ? 0 : 2), top - 2, R - L + (lf ? 0 : 2) + (rt ? 0 : 2), bot - top + 2);
    bricks(L, top + 8, R - L, bot - top - 8, 9, 20, x * 64);
    g.fillStyle = CAP; g.fillRect(L, top, R - L, 8); g.fillStyle = CAPD; g.fillRect(L, top + 6, R - L, 2);
    for (let xx = (lf ? -((x * 64) % 24) : L); xx < R; xx += 24) { const a = Math.max(L, xx), b = Math.min(R, xx + 12); if (b <= a) continue; g.fillStyle = OL; g.fillRect(a - 1, top - 9, b - a + 2, 10); g.fillStyle = CAP; g.fillRect(a, top - 8, b - a, 8); g.fillStyle = '#d6cbbb'; g.fillRect(a, top - 8, b - a, 2); }
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(L, bot - 10, R - L, 10);
    if (post || up || dn) { /* 세로 성벽과 만나는 곳: 굵은 기둥 */ g.fillStyle = OL; g.fillRect(18, 0, 28, 64); bricks(20, 0, 24, 62, 10, 12, 0); g.fillStyle = CAP; g.fillRect(20, 0, 24, 6); }
  }
  tileCache.set(key, c); return c;
}
