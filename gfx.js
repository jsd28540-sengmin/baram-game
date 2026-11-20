// ═══════════════════════════════════════════
//  그래픽 아틀라스 (GPT 시안 그대로) — gfx/tiles.png, gfx/sprites.png
// ═══════════════════════════════════════════
const GFX = { ok: false, tiles: new Image(), spr: new Image(), A: window.GFX_ATLAS };
(function () { let n = 0; const done = () => { if (++n === 2) { GFX.ok = true; tileCache.clear(); } }; GFX.tiles.onload = done; GFX.spr.onload = done; GFX.tiles.src = 'gfx/tiles.png?v=' + (window.BUILDV || 1); GFX.spr.src = 'gfx/sprites.png?v=' + (window.BUILDV || 1); })();
const gTile = (name, i) => { const L = GFX.A.tiles[name]; return L[((i % L.length) + L.length) % L.length]; };
function gfxCellCanvas(idx, extra) {
  const c = mk(64, 64), g = c.getContext('2d'); g.drawImage(GFX.tiles, (idx % 16) * 64, Math.floor(idx / 16) * 64, 64, 64, 0, 0, 64, 64); if (extra) extra(g); return c;
}
function sprRect(k) { return GFX.A.sprites[k]; }
function drawSpr(k, dx, dy, dw, dh, g = ctx) { const r = sprRect(k); if (!r) return; g.drawImage(GFX.spr, r[0], r[1], r[2], r[3], dx, dy, dw, dh); }
// 땅 종류 → 타일
const UNDER_TILE = { g: ['grass'], f: ['forest'], d: ['sand'], s: ['snow'], w: ['swamp'], v: ['volc', 1] };
function groundCell(u, v) { const t = UNDER_TILE[u] || UNDER_TILE.g; return t[1] != null ? GFX.A.tiles[t[0]][t[1]] : gTile(t[0], v); }
// 벽 조각: 원본 벽 그림의 가운데 한 칸을 잘라 씀
function wallSlice(key, v, full) {
  const r = sprRect(key); if (!r) return null; const sw = Math.min(r[2], 54); const sx = r[0] + Math.floor(((r[2] - sw) * ((v % 3) / 2))) ;
  const c = mk(64, full ? 84 : 64), g = c.getContext('2d'); g.imageSmoothingEnabled = true;
  if (full) g.drawImage(GFX.spr, sx, r[1], sw, r[3], 0, 0, 64, 84); else g.drawImage(GFX.spr, sx, r[1] + r[3] - Math.round(sw * 0.98), sw, Math.round(sw * 0.98), 0, 0, 64, 64);
  return c;
}
const _tileImgEnv = tileImg;
tileImg = function (id, v, pal, castle, frame, under) {
  if (!GFX.ok) return _tileImgEnv(id, v, pal, castle, frame, under);
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
    case T.CARPET: cell = GFX.A.tiles.castle[1 + (v % 2)]; break;
    case T.CAVE: cell = gTile('dirt', v); extra = g => { g.fillStyle = 'rgba(38,26,44,0.5)'; g.fillRect(0, 0, 64, 64); }; break;
    case T.TREE: case T.PINE: case T.DEADTREE: case T.CACTUS: case T.ROCK: cell = groundCell(under || (id === T.PINE ? 's' : id === T.CACTUS ? 'd' : id === T.DEADTREE ? 'w' : id === T.ROCK && castle ? 'v' : 'g'), v); if (id === T.ROCK && under === 'c') cell = GFX.A.tiles.volc[2]; break;
    case T.FENCE: cell = groundCell(under || 'g', v); extra = g => { const r = sprRect('fence'); g.drawImage(GFX.spr, r[0] + 20, r[1], 54, r[3], 0, 24, 64, 40); }; break;
    case T.WALL: case T.CASTLEWALL: case T.CAVEWALL: case T.RUINWALL: { const k = id === T.WALL ? 'wall' : id === T.CASTLEWALL ? 'castlewall' : id === T.RUINWALL ? 'ruinwall' : (v % 4 === 1 ? 'cavewall2' : 'cavewall'); c = wallSlice(k, v, false); break; }
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
  const r = sprRect(k); const sc = id === T.ROCK ? 0.42 : k === 'cactus' ? 0.6 : 0.64; const w = r[2] * sc, h = r[3] * sc;
  const bx = x * TS + 16 - sx, by = (y + 1) * TS - sy - (id === T.ROCK ? 3 : 2);
  ctx.fillStyle = 'rgba(20,40,10,.25)'; ctx.beginPath(); ctx.ellipse(bx, by - 2, w * 0.36, 5, 0, 0, 7); ctx.fill();
  drawSpr(k, Math.round(bx - w / 2), Math.round(by - h), Math.round(w), Math.round(h));
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
  let c = chestGfx.get(k); if (c) return c; const r = sprRect(k); c = mk(32, 32); const g = c.getContext('2d'); const sc = Math.min(30 / r[2], 30 / r[3]); const w = r[2] * sc, h = r[3] * sc; g.drawImage(GFX.spr, r[0], r[1], r[2], r[3], (32 - w) / 2, 32 - h, w, h); chestGfx.set(k, c); return c;
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
  if (!GFX.ok || m.id !== 'world') return;
  for (const k in m.portals) { const p = m.portals[k]; if (!p.label || !/\d$/.test(p.to)) continue; const [x, y] = k.split(',').map(Number);
    const castle = /^(obs|demon|ruin|abyss|prison)/.test(p.to); const key = castle ? 'gate' : 'cave'; const r = sprRect(key); const w = (castle ? 4.6 : 3.8) * TS, h = w * r[3] / r[2];
    ents.push({ y: y + 0.5, f: () => drawSpr(key, Math.round(x * TS + 16 - w / 2 - sx), Math.round((y + 1) * TS - h - sy), Math.round(w), Math.round(h)) }); }
}
