// ═══════ 도트 그래픽 (모든 그림을 코드로 그림) ═══════
const TS = 32; // 화면 타일 크기
const T = GD.T;
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function srand(s) { return function () { s = (s * 16807) % 2147483647; if (s <= 0) s += 2147483646; return (s - 1) / 2147483646; }; }
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1); };

// ───── 타일 ─────
const CAVE_PAL = [['#5a4636', '#3a2c20', '#2a1e14', '#7a6050'], ['#4a5048', '#30352f', '#1e221e', '#6a7266'], ['#4a3a4a', '#2e2230', '#1c141e', '#6a5670'], ['#36465e', '#222c3e', '#141a28', '#50648a']];
const CASTLE_PAL = [['#3a3a48', '#2a2a36', '#15151d', '#5a5a70', '#4a1a5a'], ['#4a2a2a', '#331a1a', '#1a0a0a', '#6a3a3a', '#8a1010']];
const tileCache = new Map();
function tileImg(id, v, pal, castle, frame, under) {
  const key = id + '|' + v + '|' + pal + '|' + castle + '|' + frame + '|' + under;
  let c = tileCache.get(key); if (c) return c;
  c = mk(TS, TS); const g = c.getContext('2d'); const r = srand(id * 977 + v * 131 + pal * 17 + 7 + frame * 3);
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x * 2, y * 2, w * 2, h * 2); };
  const base = (col, spk, n) => { P(0, 0, 16, 16, col); for (let i = 0; i < n; i++) P(r() * 16 | 0, r() * 16 | 0, 1 + (r() < 0.3 ? 1 : 0), 1, spk[i % spk.length]); };
  const nz = (pal, x0 = 0, y0 = 0, w = 16, h = 16) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) P(x, y, 1, 1, pal[r() * pal.length | 0]); };
  const GP = { g: ['#5fa13b', '#559533', '#6aad44', '#4f8c30', '#63a63f'], f: ['#3f7a2a', '#386f25', '#478532', '#326522'], d: ['#dbd097', '#d2c68a', '#e4daa5', '#cbbd80'], s: ['#f4f8fa', '#e6eef2', '#ffffff', '#dde7ec'], w: ['#4a5a30', '#3f4e28', '#566838', '#344222', '#4d6a3a'], v: ['#4a3c38', '#3e322e', '#574843', '#5a2a1a'], t: ['#8a8a8a', '#7c7c7c', '#969696', '#6e6e6e'] };
  const ground = u => {
    if (GP[u]) nz(GP[u]);
    else if (u === 'c') { const p = CAVE_PAL[pal]; nz([p[0], p[1], p[3], p[0]]); }
    else if (u === 'k') { const p = CASTLE_PAL[pal]; nz([p[0], p[1], p[0], shade(p[0], 0.08)]); P(0, 0, 16, 1, p[2]); P(0, 8, 16, 1, p[2]); P(0, 0, 1, 16, p[2]); P(8, 0, 1, 8, p[2]); P(4, 8, 1, 8, p[2]); P(12, 8, 1, 8, p[2]); }
    else nz(GP.g);
  };
  const cobble = (base) => { nz([shade(base, -0.45), shade(base, -0.4)]); for (const [x, y, w, h] of [[1, 1, 5, 4], [7, 0, 4, 3], [12, 1, 4, 5], [0, 6, 4, 4], [5, 5, 6, 5], [12, 7, 4, 3], [1, 11, 5, 4], [7, 11, 4, 5], [12, 11, 4, 4]]) { nz([base, shade(base, 0.1), shade(base, -0.08)], x, y, w, h); P(x, y, w, 1, shade(base, 0.25)); } };
  const planks = (base) => { for (let i = 0; i < 4; i++) { nz([base, shade(base, -0.06), shade(base, 0.06)], 0, i * 4, 16, 4); P(0, i * 4 + 3, 16, 1, shade(base, -0.35)); P((i % 2) * 8 + 3, i * 4, 1, 3, shade(base, -0.35)); } };
  const leaves = (pal, x0, y0, w, h) => { nz(pal, x0, y0, w, h); P(x0, y0 + h - 1, w, 1, shade(pal[0], -0.35)); P(x0 + w - 1, y0, 1, h, shade(pal[0], -0.25)); P(x0, y0, w, 1, shade(pal[0], 0.25)); };
  const cv = CAVE_PAL[pal], kv = CASTLE_PAL[pal] || CASTLE_PAL[0];
  switch (id) {
    case T.GRASS: ground('g'); break;
    case T.FLOWER: ground(under || 'g'); { const fc = ['#ffef5a', '#ff7aa8', '#ffffff', '#b07aff']; for (let i = 0; i < 4; i++) { const x = 2 + r() * 12 | 0, y = 2 + r() * 12 | 0; P(x, y + 1, 1, 1, '#2a6a20'); P(x, y, 1, 1, fc[(v + i) % 4]); } } break;
    case T.FOREST: ground('f'); break;
    case T.TREE: ground(under || 'g'); P(6, 11, 4, 5, '#6b5132'); P(7, 11, 1, 5, '#4f3a22'); P(2, 15, 12, 1, '#0003'); leaves(['#3c8a26', '#357c22', '#45972e', '#2f6e1c', '#4fa236'], 1, 0, 14, 12); break;
    case T.PINE: ground('s'); P(6, 12, 4, 4, '#4a3420'); leaves(['#2a5a3a', '#244f33', '#306444', '#1f4630'], 2, 1, 12, 11); P(3, 1, 4, 1, '#fff'); P(9, 4, 3, 1, '#fff'); P(4, 7, 3, 1, '#fff'); break;
    case T.DEADTREE: ground('w'); P(7, 5, 2, 10, '#4a3a2a'); P(4, 4, 3, 1, '#4a3a2a'); P(4, 2, 1, 2, '#4a3a2a'); P(9, 6, 4, 1, '#4a3a2a'); P(12, 3, 1, 3, '#4a3a2a'); break;
    case T.CACTUS: ground('d'); nz(['#2f7a2f', '#287028', '#358535'], 3, 1, 10, 14); for (let y = 2; y < 15; y += 3) { P(3, y, 1, 1, '#111'); P(12, y + 1, 1, 1, '#111'); } P(3, 1, 10, 1, '#4a9a4a'); P(3, 14, 10, 1, '#1a4a1a'); break;
    case T.WATER: { nz(['#3f76e4', '#3a6bd6', '#4580ee', '#3568cc']); for (let i = 0; i < 4; i++) { const x = r() * 12 | 0, y = (r() * 15 + frame * 3) % 15 | 0; P(x, y, 4, 1, '#7aa8ff'); } break; }
    case T.LAVA: { nz(['#e0560e', '#d84a0a', '#f06a14', '#ffa020', '#c43a06']); for (let i = 0; i < 4; i++) P(r() * 13 | 0, (r() * 14 + frame * 3) % 14 | 0, 3, 2, '#ffd040'); break; }
    case T.SAND: ground('d'); break;
    case T.SNOW: ground('s'); break;
    case T.SWAMP: ground('w'); if (v === 1) { P(4, 6, 6, 3, '#2a3a2a'); P(5, 6, 3, 1, '#4a6a5a'); } break;
    case T.ASH: ground('v'); break;
    case T.ROAD: nz(['#9b7653', '#8a6845', '#a8835e', '#7d5d3c', '#94704d']); break;
    case T.STONE: cobble('#8f8f8f'); break;
    case T.WALL: { nz(['#7f7f7f', '#767676', '#888888']); for (let yy = 0; yy < 16; yy += 4) { P(0, yy + 3, 16, 1, '#4a4a4a'); for (let xx = (yy / 4 % 2) * 4; xx < 16; xx += 8) P(xx, yy, 1, 3, '#4a4a4a'); } P(0, 0, 16, 1, '#a8a8a8'); break; }
    case T.FENCE: { ground(under || 'g'); P(0, 6, 16, 2, '#8a5a2a'); P(0, 11, 16, 2, '#8a5a2a'); P(2, 3, 2, 12, '#a06a32'); P(12, 3, 2, 12, '#a06a32'); P(2, 3, 2, 1, '#c8904a'); P(12, 3, 2, 1, '#c8904a'); break; }
    case T.ROCK: { ground(under || 'g'); nz(['#8a8a8a', '#7e7e7e', '#949494', '#747474'], 1, 1, 14, 9); P(1, 1, 14, 1, '#a8a8a8'); nz(['#5e5e5e', '#555555', '#666666'], 1, 10, 14, 5); P(1, 15, 14, 1, '#0004'); break; }
    case T.CAVE: nz([cv[0], cv[1], cv[0], cv[3], shade(cv[0], 0.06)]); break;
    case T.CAVEWALL: { nz([cv[2], cv[1], cv[2], shade(cv[2], -0.2)]); if (v === 1) { P(4, 5, 2, 2, '#c8c8d0'); P(9, 9, 2, 1, '#c8c8d0'); } if (v === 3) { P(6, 3, 2, 2, '#e0b030'); P(11, 10, 1, 2, '#e0b030'); } P(0, 15, 16, 1, '#0006'); break; }
    case T.CASTLE: ground('k'); break;
    case T.CASTLEWALL: { P(0, 0, 16, 16, kv[2]); for (let y = 0; y < 16; y += 4) { P(0, y + 3, 16, 1, '#000'); for (let x = (y / 4 % 2) * 4; x < 16; x += 8) P(x, y, 1, 3, '#000'); } P(0, 0, 16, 1, kv[3]); P(0, 14, 16, 2, '#0008'); break; }
    case T.CARPET: { P(0, 0, 16, 16, kv[4]); P(1, 0, 1, 16, '#d8b040'); P(14, 0, 1, 16, '#d8b040'); P(6, 6, 4, 4, shade(kv[4], 0.25)); break; }
    case T.BRIDGE: planks('#a2824e'); break;
    case T.HOUSE: { planks('#b8945a'); P(0, 0, 1, 16, '#5a3e22'); P(15, 0, 1, 16, '#5a3e22'); if (v % 3 === 0) { P(5, 4, 6, 5, '#4a7ab0'); P(5, 4, 6, 1, '#7a5a3a'); P(7, 4, 1, 5, '#7a5a3a'); P(5, 6, 6, 1, '#7a5a3a'); } else if (v % 3 === 1) { P(5, 5, 6, 11, '#6a4020'); P(6, 6, 4, 9, '#8a5a30'); P(9, 10, 1, 1, '#ffd040'); } break; }
    case T.ROOF: { const rc = under || '#b04030'; P(0, 0, 16, 16, rc); for (let y = 1; y < 16; y += 3) P(0, y, 16, 1, shade(rc, -0.3)); for (let y = 0; y < 16; y += 3) for (let x = (y % 2) * 3; x < 16; x += 6) P(x, y, 1, 2, shade(rc, -0.2)); P(0, 0, 16, 1, shade(rc, 0.3)); break; }
    case T.UP: case T.DOWN: { const castle2 = castle; const fl = castle2 ? kv[0] : cv[0]; P(0, 0, 16, 16, fl); for (let i = 0; i < 5; i++) { const w = id === T.DOWN ? 14 - i * 2 : 6 + i * 2; P(8 - w / 2, 2 + i * 3, w, 2, id === T.DOWN ? shade(fl, -0.2 - i * 0.15) : shade(fl, 0.4 - i * 0.07)); } P(6, 0, 4, 2, id === T.DOWN ? '#000' : '#ffe88a'); break; }
    case T.CAVEDOOR: { P(0, 0, 16, 16, '#7a7a80'); P(2, 2, 12, 14, '#111'); P(3, 1, 10, 2, '#111'); P(2, 2, 1, 14, '#55555a'); P(13, 2, 1, 14, '#55555a'); P(5, 6, 1, 1, '#ff3030'); P(10, 6, 1, 1, '#ff3030'); break; }
    case T.GATE: { P(0, 0, 16, 16, '#2a2a36'); P(2, 1, 12, 15, '#3a1a10'); for (let x = 3; x < 14; x += 3) P(x, 1, 1, 15, '#1a0a05'); P(2, 6, 12, 1, '#8a8a90'); P(2, 11, 12, 1, '#8a8a90'); P(7, 8, 2, 2, '#d8b040'); break; }
    default: P(0, 0, 16, 16, '#f0f');
  }
  // HD 미세 질감: 화면 픽셀 단위 밝기 변화로 해상도감 향상
  if (id !== T.WATER && id !== T.LAVA) {
    const d = g.getImageData(0, 0, TS, TS), a = d.data; const rr = srand(id * 131 + v * 17 + pal * 7 + 11 + (under ? under.length * 3 : 0));
    for (let i = 0; i < a.length; i += 4) { if (!a[i + 3]) continue; const f = 1 + (rr() - 0.5) * 0.13; a[i] = Math.min(255, a[i] * f); a[i + 1] = Math.min(255, a[i + 1] * f); a[i + 2] = Math.min(255, a[i + 2] * f); }
    g.putImageData(d, 0, 0);
  }
  tileCache.set(key, c); return c;
}
// ── 입체감 오버레이 (그림자·앞면·물가 거품) ──
const FX_IMG = (() => {
  const grad = (fn) => { const c = mk(TS, TS), g = c.getContext('2d'); fn(g); return c; };
  return {
    aoN: grad(g => { const gr = g.createLinearGradient(0, 0, 0, 14); gr.addColorStop(0, 'rgba(0,0,0,.38)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, TS, 14); }),
    aoW: grad(g => { const gr = g.createLinearGradient(0, 0, 10, 0); gr.addColorStop(0, 'rgba(0,0,0,.24)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 10, TS); }),
    aoE: grad(g => { const gr = g.createLinearGradient(TS, 0, TS - 8, 0); gr.addColorStop(0, 'rgba(0,0,0,.14)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(TS - 8, 0, 8, TS); }),
    face: grad(g => { const gr = g.createLinearGradient(0, 14, 0, TS); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)'); g.fillStyle = gr; g.fillRect(0, 14, TS, TS - 14); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, TS - 2, TS, 2); }),
    top: grad(g => { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(0, 0, TS, 2); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, 2, TS, 2); }),
    foam: grad(g => { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(0, 0, TS, 2); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 2, TS, 3); for (let x = 0; x < TS; x += 6) g.fillRect(x, 5, 3, 1); }),
    treeSh: grad(g => { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(20, 29, 13, 4, 0, 0, 7); g.fill(); }),
  };
})();
// 넓은 범위 색 변화 (반복 무늬 제거)
function vnoise(x, y) {
  const h = (a, b) => { let n = a * 374761393 + b * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };
  const s = 7, X = x / s, Y = y / s, xi = Math.floor(X), yi = Math.floor(Y), xf = X - xi, yf = Y - yi, sm = t => t * t * (3 - 2 * t);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1), u = sm(xf), w = sm(yf);
  return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
}
const TALL = new Set([T.WALL, T.CASTLEWALL, T.CAVEWALL, T.ROCK, T.HOUSE]);
const AO_SRC = t => GD.BLOCK.has(t) && t !== T.WATER && t !== T.LAVA && t !== T.FENCE;
const MINI_COL = { 0: '#4c9a3c', 1: '#5aaa48', 2: '#1e5a1a', 3: '#2f6fc0', 4: '#e0c27a', 5: '#eef3f8', 6: '#a8865a', 7: '#b8b0a0', 8: '#5a4c3e', 9: '#4a5a32', 10: '#6a6a70', 11: '#6a5040', 12: '#1a1410', 13: '#5a5a70', 14: '#111118', 15: '#2f6a2a', 16: '#ff5a10', 17: '#8a5a2a', 18: '#e8dcc0', 19: '#3a8a3a', 20: '#1f5a3a', 21: '#8a1010', 22: '#ff3030', 23: '#ffe060', 24: '#ff3030', 25: '#ff3030', 26: '#4a3a36', 27: '#3a2a1a', 28: '#8a5a2a', 29: '#b04030' };

// ───── 외곽선 (도트 느낌의 핵심) ─────
function outline(c, col = [26, 16, 24]) {
  const g = c.getContext('2d'); const w = c.width, h = c.height; const id = g.getImageData(0, 0, w, h), a = id.data; const src = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) src[i] = a[i * 4 + 3] >= 140 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (src[i] || a[i * 4 + 3] >= 100) continue;
    let hit = false;
    for (let k = 1; k <= 2 && !hit; k++) { if ((x >= k && src[i - k]) || (x < w - k && src[i + k]) || (y >= k && src[i - k * w]) || (y < h - k && src[i + k * w])) hit = true; }
    if (hit) { a[i * 4] = col[0]; a[i * 4 + 1] = col[1]; a[i * 4 + 2] = col[2]; a[i * 4 + 3] = 235; }
  }
  g.putImageData(id, 0, 0);
}
// ───── 캐릭터 ─────
const SKIN = ['#ffd8b0', '#f0c090', '#d09a6a', '#9a6a44'];
const HAIRC = ['#2a1a10', '#6a3a1a', '#c08a3a', '#f0d070', '#d8d8e0', '#b02a2a', '#3a5ab0', '#7a3ab0'];
const JOB_CLOTH = { warrior: '#8a5a32', mage: '#3a4a9a', healer: '#3a7a4a' };
const charCache = new Map();
// 아트 좌표: 28 x 40, 발 끝 y=38, 중앙 x=14
function charSprite(ap, dir, frame) {
  const key = JSON.stringify(ap) + dir + frame;
  let c = charCache.get(key); if (c) return c;
  if (charCache.size > 600) charCache.clear();
  c = mk(56, 80); const g = c.getContext('2d');
  const flip = dir === 1; const d = flip ? 2 : dir;
  if (flip) { g.translate(56, 0); g.scale(-1, 1); }
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x * 2), Math.round(y * 2), Math.round(w * 2), Math.round(h * 2)); };
  const base = GD.JOBS[ap.job] ? GD.JOBS[ap.job].base : 'warrior';
  const eq = ap.eq || {}; const tc = s => eq[s] ? GD.TIER_COLOR[eq[s][0]] : null;
  const skin = SKIN[ap.sk || 0], hair = HAIRC[ap.hc || 0], fem = ap.g === 'f';
  const cloth = tc('armor') || JOB_CLOTH[base]; const clothD = shade(cloth, -0.3), clothL = shade(cloth, 0.25);
  const boots = tc('boots') || '#4a3020', gloves = tc('gloves') || skin;
  const mounted = ap.mt; const oy = mounted ? -1 : 8, ox = 2;
  // 탈것
  if (mounted) drawMount(P, GD.MOUNTS[mounted], d, frame);
  const X = (x) => x + ox, Y = (y) => y + oy;
  if (!mounted) { g.fillStyle = '#0005'; g.beginPath(); g.ellipse(28, 76, 14, 4, 0, 0, 7); g.fill(); }
  const robe = base === 'mage' || (fem && base === 'healer');
  const step = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  // 다리
  if (!mounted) {
    if (d === 2) { P(X(9), Y(21), 2, 6 - Math.max(0, step), '#3a2a20'); P(X(12), Y(21), 2, 6 - Math.max(0, -step), '#3a2a20'); P(X(8 + step), Y(26), 4, 2, boots); P(X(11 - step), Y(26), 4, 2, boots); }
    else { P(X(8), Y(21), 3, 6 - (step > 0 ? 1 : 0), '#3a2a20'); P(X(13), Y(21), 3, 6 - (step < 0 ? 1 : 0), '#3a2a20'); P(X(8), Y(25 - (step > 0 ? 1 : 0)), 3, 3, boots); P(X(13), Y(25 - (step < 0 ? 1 : 0)), 3, 3, boots); }
  } else { P(X(d === 2 ? 11 : 6), Y(20), 3, 4, boots); if (d !== 2) P(X(15), Y(20), 3, 4, boots); }
  const weapon = eq.weapon ? eq.weapon[3] : (base === 'warrior' ? 'sword' : base === 'mage' ? 'staff' : 'bow');
  const wc = tc('weapon') || '#9a9aa8';
  const drawWeapon = (hx, hy, back) => {
    const W = GD.TIER_COLOR[eq.weapon ? eq.weapon[0] : 0], Wd = shade(W, -0.35), Wl = shade(W, 0.4);
    switch (weapon) {
      case 'sword': P(hx, hy - 10, 2, 10, Wl); P(hx + 1, hy - 10, 1, 10, W); P(hx - 1, hy, 4, 1, '#d8b040'); P(hx, hy + 1, 2, 2, '#5a3a1a'); break;
      case 'axe': P(hx, hy - 9, 1, 12, '#6a4a2a'); P(hx + 1, hy - 9, 4, 5, W); P(hx + 4, hy - 10, 1, 7, Wl); break;
      case 'spear': P(hx, hy - 14, 1, 18, '#6a4a2a'); P(hx - 1, hy - 17, 3, 3, Wl); P(hx, hy - 18, 1, 1, Wl); break;
      case 'staff': P(hx, hy - 13, 1, 17, '#6a4a2a'); P(hx - 1, hy - 16, 3, 3, W); P(hx, hy - 15, 1, 1, '#fff'); break;
      case 'wand': P(hx, hy - 6, 1, 7, '#5a3a1a'); P(hx - 1, hy - 8, 3, 2, W); break;
      case 'bow': P(hx + 1, hy - 7, 1, 2, W); P(hx + 2, hy - 5, 1, 10, W); P(hx + 1, hy + 5, 1, 2, W); P(hx + 1, hy - 5, 1, 10, '#eee8'); break;
      case 'crossbow': P(hx - 2, hy - 1, 7, 1, W); P(hx, hy - 3, 1, 5, '#5a3a1a'); P(hx + 4, hy - 3, 1, 5, Wd); break;
    }
  };
  // 등 뒤 무기 (위쪽 방향)
  if (d === 3) drawWeapon(X(17), Y(16), 1);
  // 몸통
  const tw = d === 2 ? 6 : 8, tx = d === 2 ? 9 : 8;
  P(X(tx), Y(13), tw, 8, cloth); P(X(tx), Y(13), tw, 1, clothL); P(X(tx), Y(14), 1, 5, clothL); P(X(tx + tw - 1), Y(14), 1, 6, clothD); P(X(tx), Y(19), tw, 1, '#3a2a1a'); P(X(tx + (tw >> 1) - 1), Y(19), 2, 1, '#d8b040'); if (d !== 3) P(X(tx + (tw >> 1) - 1), Y(14), 2, 1, clothD);
  if (robe) { P(X(tx - 1), Y(19), tw + 2, (mounted ? 3 : 7), cloth); P(X(tx - 1), Y(mounted ? 21 : 25), tw + 2, 1, clothD); }
  if (base === 'warrior' && eq.armor && d !== 3) { P(X(tx + 1), Y(14), tw - 2, 1, clothL); P(X(tx + (tw >> 1) - 1), Y(15), 2, 3, clothD); }
  if (fem && !robe) P(X(tx - 1), Y(19), tw + 2, 3, clothD);
  // 방패 (뒤)
  if (eq.shield && d === 3) { const sc = tc('shield'); P(X(5), Y(13), 6, 7, sc); P(X(7), Y(15), 2, 3, shade(sc, -0.4)); }
  // 팔
  if (d === 2) { P(X(11), Y(14), 3, 5, clothD); P(X(11), Y(19), 3, 2, gloves); }
  else { P(X(6), Y(14), 2, 5, clothD); P(X(16), Y(14), 2, 5, clothD); P(X(6), Y(19), 2, 2, gloves); P(X(16), Y(19), 2, 2, gloves); }
  // 머리 (블록형 네모 머리)
  const hx0 = d === 2 ? 8 : 7;
  const skD = shade(skin, -0.15), skL = shade(skin, 0.08);
  P(X(hx0), Y(3), 10, 10, skin); P(X(hx0), Y(3), 10, 1, skL); P(X(hx0 + 9), Y(4), 1, 9, skD); P(X(hx0), Y(12), 10, 1, skD);
  const eyeC = ['#3a4ab0', '#5a3418', '#2a7a5a', '#7a2a5a', '#3a3a3a', '#a03a2a', '#2a5ad0', '#6a2ab0'][ap.hc || 0];
  if (d === 0) {
    P(X(hx0 + 1), Y(8), 2, 1, '#ffffff'); P(X(hx0 + 3), Y(8), 1, 1, eyeC);
    P(X(hx0 + 6), Y(8), 1, 1, eyeC); P(X(hx0 + 7), Y(8), 2, 1, '#ffffff');
    P(X(hx0 + 4), Y(9), 2, 1, skD);
    P(X(hx0 + 3), Y(11), 4, 1, fem ? '#c05050' : shade(skin, -0.35));
    if (fem) { P(X(hx0 + 1), Y(10), 1, 1, '#f0a0a0'); P(X(hx0 + 8), Y(10), 1, 1, '#f0a0a0'); }
  }
  if (d === 2) { P(X(hx0 + 7), Y(8), 1, 1, '#ffffff'); P(X(hx0 + 8), Y(8), 1, 1, eyeC); P(X(hx0 + 9), Y(9), 1, 1, skD); P(X(hx0 + 7), Y(11), 2, 1, shade(skin, -0.35)); P(X(hx0 + 3), Y(8), 2, 2, skD); }
  // 머리카락 (블록형)
  const hs = ap.h || 0; const hl = shade(hair, 0.18), hd = shade(hair, -0.25);
  const helm = eq.helmet;
  if (!helm || base === 'healer') {
    P(X(hx0), Y(2), 10, 4, hair); P(X(hx0), Y(2), 10, 1, hl); P(X(hx0 + 2), Y(3), 3, 1, hl);
    if (d === 0) { P(X(hx0), Y(6), 1, 3, hair); P(X(hx0 + 9), Y(6), 1, 3, hair); P(X(hx0 + 1), Y(6), 2, 1, hair); P(X(hx0 + 6), Y(6), 3, 1, hair); if (hs === 1) { P(X(hx0 + 4), Y(6), 1, 1, hair); P(X(hx0 + 1), Y(1), 2, 1, hair); P(X(hx0 + 5), Y(1), 3, 1, hair); } }
    if (d === 2) { P(X(hx0), Y(2), 5, 9, hair); P(X(hx0 + 5), Y(6), 4, 1, hair); P(X(hx0), Y(10), 5, 1, hd); }
    if (d === 3) { P(X(hx0), Y(2), 10, 11, hair); P(X(hx0), Y(12), 10, 1, hd); P(X(hx0 + 9), Y(3), 1, 9, hd); }
    if (hs === 1 && d !== 0) { P(X(hx0 + 1), Y(1), 2, 1, hair); P(X(hx0 + 5), Y(1), 3, 1, hair); }
    if (hs === 2 || (fem && hs === 0)) { if (d === 0) { P(X(hx0 - 1), Y(4), 2, 12, hair); P(X(hx0 + 9), Y(4), 2, 12, hair); P(X(hx0 - 1), Y(15), 2, 1, hd); P(X(hx0 + 9), Y(15), 2, 1, hd); } else if (d === 2) { P(X(hx0), Y(2), 5, 14, hair); P(X(hx0), Y(15), 5, 1, hd); } else { P(X(hx0), Y(2), 10, 14, hair); P(X(hx0), Y(15), 10, 1, hd); } }
    if (hs === 3) { const rb = '#d03040'; if (d === 0) { P(X(hx0 + 3), Y(0), 4, 2, hair); P(X(hx0 + 2), Y(1), 1, 1, rb); P(X(hx0 + 7), Y(1), 1, 1, rb); } else if (d === 2) { P(X(hx0 - 3), Y(4), 3, 3, hair); P(X(hx0 - 3), Y(7), 2, 7, hair); P(X(hx0 - 1), Y(4), 1, 2, rb); } else { P(X(hx0 + 3), Y(0), 4, 2, hair); P(X(hx0 + 4), Y(2), 2, 12, hd); P(X(hx0 + 3), Y(2), 4, 1, rb); } }
  }
  // 투구 (직업·등급별 외형)
  if (helm) {
    const H = GD.TIER_COLOR[helm[0]], Hd = shade(H, -0.35), Hl = shade(H, 0.4);
    if (base === 'warrior') {
      P(X(hx0 - 1), Y(2), 10, 5, H); P(X(hx0), Y(1), 8, 1, Hl); P(X(hx0 - 1), Y(6), 10, 1, Hd);
      if (d === 0) { P(X(hx0 + 3), Y(7), 2, 3, H); P(X(hx0 - 1), Y(7), 1, 4, Hd); P(X(hx0 + 8), Y(7), 1, 4, Hd); }
      if (d === 3) P(X(hx0 - 1), Y(2), 10, 9, H);
      if (helm[0] >= 3) { P(X(hx0 + 3), Y(-2), 2, 3, helm[0] >= 6 ? '#e02a2a' : Hl); }
      if (helm[0] >= 6) { P(X(hx0 - 2), Y(2), 1, 3, Hl); P(X(hx0 + 9), Y(2), 1, 3, Hl); }
    } else if (base === 'mage') {
      P(X(hx0 - 2), Y(4), 12, 2, H); P(X(hx0), Y(1), 8, 3, H); P(X(hx0 + 2), Y(-2), 4, 3, H); P(X(hx0 + 3), Y(-4), 3, 2, H); P(X(hx0 + 5), Y(-5), 2, 1, H); P(X(hx0), Y(3), 8, 1, Hd);
      if (helm[0] >= 4) P(X(hx0 + 3), Y(1), 2, 2, '#ffe04a');
      if (d === 3) P(X(hx0 - 1), Y(6), 10, 6, hair);
    } else {
      P(X(hx0 - 1), Y(2), 10, 4, H); P(X(hx0 - 1), Y(2), 1, 9, H); P(X(hx0 + 8), Y(2), 1, 9, H); P(X(hx0), Y(1), 8, 1, Hl);
      if (d === 3) P(X(hx0 - 1), Y(2), 10, 11, H);
      if (helm[0] >= 5) P(X(hx0 + 3), Y(2), 2, 1, '#7affb0');
    }
  }
  // 앞쪽 무기/방패
  if (d === 0) { drawWeapon(X(17), Y(18)); if (eq.shield) { const sc = tc('shield'); P(X(4), Y(14), 5, 7, sc); P(X(4), Y(14), 5, 1, shade(sc, 0.4)); P(X(6), Y(16), 1, 3, shade(sc, -0.4)); } }
  if (d === 2) { drawWeapon(X(13), Y(18)); if (eq.shield) { const sc = tc('shield'); P(X(7), Y(14), 3, 7, shade(sc, -0.2)); } }
  g.setTransform(1, 0, 0, 1, 0, 0); outline(c);
  // 등급 광채
  const glow = Object.values(eq).some(e => e[1] === 3 || e[2] >= 7);
  if (glow) { const gc = g.globalCompositeOperation; g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#ffd04a30'; g.beginPath(); g.ellipse(28, 50 - (mounted ? 18 : 0), 18, 26, 0, 0, 7); g.fill(); g.globalCompositeOperation = gc; }
  charCache.set(key, c); return c;
}
function drawMount(P, mt, d, frame) {
  if (!mt) return;
  const [c1, c2] = mt.c; const k = mt.kind; const leg = frame % 2;
  if (d === 2) {
    if (k === 'ostrich') { P(8, 20, 12, 7, c1); P(7, 18, 4, 4, c1); P(19, 9, 2, 13, c2); P(19, 7, 5, 3, c2); P(23, 8, 2, 1, '#ffb040'); P(12, 27, 1, 10, '#d8a070'); P(16, 27, 1, 10, '#d8a070'); P(10 + leg * 2, 36, 3, 1, '#d8a070'); return; }
    P(5, 20, 17, 8, c1); P(5, 27, 17, 1, shade(c1, -0.3));
    if (k === 'camel') { P(9, 16, 4, 4, c1); P(15, 17, 3, 3, c1); }
    P(19, 13, 4, 9, c1); P(21, 11, 6, 4, c1); P(26, 13, 1, 2, shade(c1, -0.3)); P(23, 12, 1, 1, '#000'); P(19, 12, 2, 5, c2); P(3, 21, 2, 7, c2);
    P(6 + leg, 28, 2, 9, shade(c1, -0.2)); P(10 - leg, 28, 2, 9, c1); P(17 + leg, 28, 2, 9, shade(c1, -0.2)); P(20 - leg, 28, 2, 9, c1);
    P(6 + leg, 36, 2, 1, '#222'); P(10 - leg, 36, 2, 1, '#222'); P(17 + leg, 36, 2, 1, '#222'); P(20 - leg, 36, 2, 1, '#222');
    P(10, 19, 7, 3, '#8a2a1a');
  } else {
    P(8, 20, 12, 10, c1); P(8, 29, 12, 1, shade(c1, -0.3)); P(9, 30 - leg, 3, 7, c1); P(16, 30 + leg - 1, 3, 7, c1);
    if (d === 0) { P(11, 24, 6, 9, shade(c1, -0.1)); P(12, 32, 4, 3, shade(c1, -0.2)); P(11, 26, 1, 1, '#000'); P(16, 26, 1, 1, '#000'); P(12, 21, 4, 3, c2); }
    else { P(13, 30, 2, 6, c2); }
    if (k === 'camel') P(11, 16, 6, 4, c1);
    P(8, 19, 12, 3, '#8a2a1a');
  }
}

// ───── 몬스터 ─────
const monCache = new Map();
function monSprite(type, flip, frame, mutant, summonDef) {
  const def = summonDef || GD.MONS[type];
  const key = type + flip + frame + mutant;
  let c = monCache.get(key); if (c) return c;
  const s = 2 * def.size; const W = Math.ceil(28 * s), H = Math.ceil(30 * s);
  c = mk(W, H); const g = c.getContext('2d');
  if (flip) { g.translate(W, 0); g.scale(-1, 1); }
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
  const [c1, c2, c3] = def.c; const d1 = shade(c1, -0.3), l1 = shade(c1, 0.3);
  const b = frame % 2;
  // 기준: 28x30, 발 y=28
  const quad = (o = {}) => { // 옆모습 네발 짐승 (오른쪽 보기)
    const by = 16 + (o.low || 0);
    P(6, by, 15, 7, c1); P(6, by + 5, 15, 2, d1); P(8, by + 5, 10, 1, c2);
    P(18, by - 4, 7, 7, c1); P(24, by - 1, 3, 3, c1); P(26, by - 1, 1, 1, '#111'); P(21, by - 2, 1, 1, c3 === '#111' || c3 === '#2a1a10' ? '#111' : c3);
    if (!o.noears) { P(19, by - 6, 2, 3, c1); P(22, by - 6, 2, 3, c1); P(20, by - 5, 1, 1, c2); }
    P(7 + b, by + 7, 2, 5, d1); P(10 - b, by + 7, 2, 5, c1); P(16 + b, by + 7, 2, 5, d1); P(19 - b, by + 7, 2, 5, c1);
    if (o.tails) for (let i = 0; i < o.tails; i++) P(1 + (i % 3), by - 4 + i, 5, 2, i % 2 ? c2 : c1); else P(2, by - 1 - b, 5, 2, c1);
    if (o.fire) { P(7, by - 2, 2, 2, '#ffb020'); P(11, by - 3, 2, 3, '#ff6010'); P(15, by - 2, 2, 2, '#ffb020'); }
  };
  const humanoid = (o = {}) => { // 정면 인간형
    const bob = b;
    P(9, 20, 3, 8, o.leg || d1); P(16, 20, 3, 8, o.leg || d1);
    P(8, 11 + bob, 12, 10, o.body || c1); P(8, 11 + bob, 12, 1, l1);
    P(5, 12 + bob, 3, 8, o.arm || c1); P(20, 12 + bob, 3, 8, o.arm || c1);
    P(9, 2 + bob, 10, 9, o.head || c2);
    if (o.oneEye) { P(12, 5 + bob, 4, 3, '#fff'); P(13, 6 + bob, 2, 2, c3); }
    else { P(11, 5 + bob, 2, 2, c3); P(15, 5 + bob, 2, 2, c3); }
    if (o.mouth) P(12, 8 + bob, 4, 1, o.mouth);
    if (o.horns) { P(9, 0 + bob, 2, 3, '#e8e0c0'); P(17, 0 + bob, 2, 3, '#e8e0c0'); }
    if (def.helmet) { P(8, 1 + bob, 12, 3, '#d8a020'); P(13, 0 + bob, 2, 2, '#fff070'); }
    if (def.crown) { P(9, -2 + bob, 10, 2, '#ffd000'); P(9, -4 + bob, 2, 2, '#ffd000'); P(13, -5 + bob, 2, 3, '#ffd000'); P(17, -4 + bob, 2, 2, '#ffd000'); P(13, -3 + bob, 2, 1, '#ff2020'); }
    const wpn = def.weapon;
    if (wpn === 'sword') { P(23, 3 + bob, 2, 13, '#d8d8e0'); P(22, 15 + bob, 4, 1, '#8a6a20'); }
    if (wpn === 'axe') { P(23, 2 + bob, 1, 18, '#6a4a2a'); P(24, 2 + bob, 4, 6, '#a0a0a8'); }
    if (wpn === 'spear') { P(23, -2 + bob, 1, 22, '#6a4a2a'); P(22, -4 + bob, 3, 3, '#d8d8e0'); }
    if (wpn === 'club') { P(22, 4 + bob, 3, 14, '#8a5a2a'); P(21, 2 + bob, 5, 6, '#6a4020'); P(21, 3 + bob, 1, 1, '#ccc'); P(25, 5 + bob, 1, 1, '#ccc'); }
    if (wpn === 'bow') { P(23, 6 + bob, 1, 12, '#8a6a3a'); P(22, 5 + bob, 1, 2, '#8a6a3a'); P(22, 17 + bob, 1, 2, '#8a6a3a'); }
    if (def.shield) { P(2, 12 + bob, 6, 9, c2); P(4, 14 + bob, 2, 4, c3); }
  };
  switch (def.kind) {
    case 'rodent': P(6, 18, 12, 8, c1); P(15, 15, 7, 7, c1); P(20, 18, 2, 1, c3); P(18, 17, 1, 1, '#111'); P(16, 13, 2, 3, c1); P(7, 19, 8, 4, c2); P(1, 10 - b, 6, 10, c1); P(2, 11 - b, 3, 7, c2); P(8 + b, 26, 2, 2, d1); P(15 - b, 26, 2, 2, d1); break;
    case 'rabbit': P(6, 17, 13, 9, c1); P(15, 13, 8, 8, c1); P(16, 4, 2, 10, c1); P(19, 5, 2, 9, c1); P(17, 6, 1, 6, c2); P(20, 7, 1, 5, c2); P(21, 16, 1, 1, '#c03040'); P(4, 18, 3, 3, '#fff'); P(8 + b, 25, 3, 2, d1); P(15 - b, 25, 3, 2, d1); break;
    case 'sheep': P(4, 13, 18, 11, c1); for (let i = 0; i < 6; i++) P(4 + i * 3, 12 + (i % 2), 3, 2, '#fff'); P(19, 13, 6, 7, c2); P(23, 15, 1, 1, '#fff'); P(18, 12, 2, 2, c2); P(6 + b, 24, 2, 5, c2); P(10 - b, 24, 2, 5, c2); P(16 + b, 24, 2, 5, c2); P(19 - b, 24, 2, 5, c2); break;
    case 'quad': quad({ tails: def.tails, fire: def.fire }); break;
    case 'boar': quad({ noears: 1 }); P(24, 18, 1, 3, c3); P(19, 13, 1, 2, c1); P(8, 14, 10, 1, d1); break;
    case 'bear': P(3, 10, 19, 13, c1); P(3, 20, 19, 3, d1); P(18, 7, 9, 9, c1); P(19, 5, 3, 3, c1); P(24, 5, 3, 3, c1); P(25, 11, 3, 3, c2); P(27, 11, 1, 1, '#111'); P(22, 9, 1, 1, '#111'); P(5 + b, 23, 4, 6, d1); P(10 - b, 23, 4, 6, c1); P(15 + b, 23, 4, 6, d1); if (def.crown) { P(19, 2, 7, 2, '#ffd000'); P(19, 0, 2, 2, '#ffd000'); P(22, -1, 2, 3, '#ffd000'); P(25, 0, 1, 2, '#ffd000'); } break;
    case 'bat': { const w = b ? 4 : 0; P(10, 12, 8, 7, c1); P(11, 9, 2, 3, c1); P(15, 9, 2, 3, c1); P(11, 13, 2, 1, c3); P(15, 13, 2, 1, c3); P(1, 10 + w, 9, 3, c2); P(18, 10 + w, 9, 3, c2); P(2, 13 + w, 2, 2, c2); P(6, 13 + w, 2, 2, c2); P(20, 13 + w, 2, 2, c2); P(24, 13 + w, 2, 2, c2); break; }
    case 'spider': P(9, 12, 10, 8, c1); P(4, 14, 8, 8, c1); P(10, 13, 2, 2, c3); P(14, 13, 2, 2, c3); P(12, 16, 1, 1, c3); P(5, 16, 2, 2, c2); for (let i = 0; i < 4; i++) { P(17, 13 + i * 2, 6, 1, d1); P(22 + (i + b) % 2, 14 + i * 2, 1, 6, d1); P(1, 15 + i * 2, 4, 1, d1); P(0 + (i + b) % 2, 16 + i * 2, 1, 6, d1); } if (def.boss) { P(6, 12, 3, 2, '#ffef3b'); P(8, 6, 12, 2, '#ff2aa0'); } break;
    case 'snake': for (let i = 0; i < 6; i++) P(2 + i * 3, 22 - ((i + b) % 2) * 2, 4, 4, i % 2 ? c1 : c2); P(19, 14, 6, 6, c1); P(21, 16, 1, 1, '#ff0'); P(24, 18, 3, 1, c3); break;
    case 'slime': { const h = b ? 1 : 0; P(5, 12 + h, 18, 14 - h, c1); P(7, 10 + h, 14, 3, c1); P(8, 13 + h, 4, 3, c2); P(10, 17 + h, 2, 3, c3); P(16, 17 + h, 2, 3, c3); P(4, 25, 20, 2, d1); break; }
    case 'skeleton': humanoid({ body: '#0000', head: c1, arm: c1, leg: c1 }); P(10, 12 + b, 8, 1, c1); P(10, 14 + b, 8, 1, c1); P(10, 16 + b, 8, 1, c1); P(13, 11 + b, 2, 9, c1); P(11, 8 + b, 6, 1, '#222'); break;
    case 'zombie': humanoid({ body: c2, head: c1, arm: c1, mouth: '#300' }); P(10, 18, 3, 3, d1); P(16, 13, 2, 2, '#5a2020'); break;
    case 'ghost': { const h = b; P(7, 6 + h, 14, 16, c1); P(8, 4 + h, 12, 3, c1); P(7, 22 + h, 3, 3, c1); P(12, 22 + h, 3, 4, c1); P(17, 22 + h, 3, 3, c1); P(10, 10 + h, 2, 3, c3); P(16, 10 + h, 2, 3, c3); P(12, 15 + h, 4, 2, '#0006'); P(8, 6 + h, 3, 4, c2); break; }
    case 'golem': P(6, 8, 16, 14, c1); P(8, 3, 12, 6, c2); P(11, 5, 2, 2, c3); P(15, 5, 2, 2, c3); P(2, 9 + b, 4, 11, c2); P(22, 9 - b + 1, 4, 11, c2); P(8, 22, 5, 6, d1); P(15, 22, 5, 6, d1); P(9, 12, 3, 3, d1); P(16, 15, 4, 2, d1); break;
    case 'humanoid': humanoid({ head: c1, body: shade(c1, -0.15), arm: c1 }); P(18, 6 + b, 4, 2, c1); P(11, 13 + b, 6, 6, c2); break;
    case 'ogre': humanoid({ head: c1, body: '#e8d090', arm: c1, oneEye: def.oneEye, mouth: '#fff', horns: 1 }); P(8, 17 + b, 12, 4, c2); for (let i = 0; i < 4; i++) P(9 + i * 3, 18 + b, 1, 2, '#222'); if (def.fire) { P(8, -1 + b, 3, 3, '#ffb000'); P(17, -1 + b, 3, 3, '#ffb000'); } break;
    case 'knight': humanoid({ head: c1, body: c1, arm: c2, leg: c1, horns: def.horns }); P(9, 5 + b, 10, 2, '#000'); P(11, 5 + b, 2, 1, c3); P(15, 5 + b, 2, 1, c3); P(13, 0 + b, 2, 3, c3); P(8, 11 + b, 12, 2, c2); break;
    case 'mage': P(7, 10 + b, 14, 18 - b, c1); P(6, 24, 16, 4, c1); P(9, 3 + b, 10, 8, c2); P(8, 1 + b, 12, 4, c1); P(11, 6 + b, 2, 2, c3); P(15, 6 + b, 2, 2, c3); P(22, 2, 1, 22, '#5a3a1a'); P(20, 0, 5, 4, c3); P(4, 14 + b, 3, 6, c1); break;
    case 'gargoyle': { const w = b * 2; P(1, 6 + w, 7, 10, c2); P(20, 6 + w, 7, 10, c2); humanoid({ head: c1, body: c1, arm: c1, horns: 1 }); P(11, 5 + b, 2, 2, c3); P(15, 5 + b, 2, 2, c3); break; }
    case 'demon': { const w = b * 2; P(0, 5 + w, 8, 12, c2); P(20, 5 + w, 8, 12, c2); humanoid({ head: c1, body: c1, arm: c1, horns: 1, mouth: '#ffd000' }); P(3, 24, 6, 2, c1); break; }
    case 'dragon': { const w = b * 3; P(4, 14, 16, 9, c1); P(4, 20, 16, 2, d1); P(18, 7, 4, 10, c1); P(19, 4, 8, 5, c1); P(25, 6, 1, 1, '#fff'); P(23, 5, 1, 1, c3); P(19, 2, 2, 3, c2); P(8, 3 + w, 10, 3, c2); P(6, 6 + w, 12, 6, c2); P(0, 16, 5, 3, c1); P(5 + b, 23, 3, 5, d1); P(14 - b, 23, 3, 5, d1); P(8, 16, 8, 3, c2); break; }
    case 'scorpion': P(5, 18, 14, 6, c1); P(6, 23, 12, 1, d1); P(18, 17, 4, 5, c1); P(22, 14, 4, 3, c1); P(25, 12, 2, 3, c2); P(22, 20, 4, 2, c1); P(25, 19, 2, 2, c2); P(2, 14 - b, 4, 5, c1); P(1, 9 - b, 3, 6, c1); P(2, 7 - b, 4, 3, c1); P(5, 8 - b, 2, 2, c3); for (let i = 0; i < 3; i++) P(7 + i * 4 + b, 24, 1, 4, d1); P(19, 18, 1, 1, '#111'); break;
    case 'lizard': P(4, 18, 15, 6, c1); P(17, 16, 8, 6, c1); P(23, 18, 3, 1, c3); P(21, 17, 1, 1, '#111'); P(0, 20, 5, 2, c1); P(7, 18, 9, 2, c2); P(6 + b, 24, 2, 4, d1); P(15 - b, 24, 2, 4, d1); break;
    case 'toad': { const h = b * 2; P(5, 14 - h, 18, 12, c1); P(6, 20 - h, 16, 6, c2); P(7, 11 - h, 4, 4, c1); P(17, 11 - h, 4, 4, c1); P(8, 12 - h, 2, 2, c3); P(18, 12 - h, 2, 2, c3); P(9, 19 - h, 10, 1, d1); P(4, 24, 5, 3, c1); P(19, 24, 5, 3, c1); P(10, 15 - h, 2, 2, d1); P(16, 17 - h, 2, 2, d1); break; }
    case 'yeti': humanoid({ head: c1, body: c1, arm: c1, leg: c1, mouth: '#334' }); P(10, 4 + b, 8, 5, c2); P(11, 5 + b, 2, 2, c3); P(15, 5 + b, 2, 2, c3); P(4, 18 + b, 4, 3, c1); P(20, 18 + b, 4, 3, c1); break;
    default: P(6, 10, 16, 16, c1);
  }
  g.setTransform(1, 0, 0, 1, 0, 0); outline(c, [20, 12, 16]);
  if (mutant) { const id = g.getImageData(0, 0, W, H); const a = id.data; for (let i = 0; i < a.length; i += 4) if (a[i + 3]) { a[i] = a[i] * 0.6 + 60; a[i + 1] = a[i + 1] * 0.5; a[i + 2] = a[i + 2] * 0.6 + 90; } g.putImageData(id, 0, 0); }
  monCache.set(key, c); return c;
}

// ───── 아이템 아이콘 ─────
const iconCache = new Map();
function itemIcon(it) {
  const key = it.k === 'gear' ? `g${it.slot}${it.wt}${it.tier}${it.job}` : it.k + (it.id || '');
  let c = iconCache.get(key); if (c) return c;
  c = mk(22, 22); const g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  if (it.k === 'gear') {
    const C = GD.TIER_COLOR[it.tier], Cd = shade(C, -0.4), Cl = shade(C, 0.45);
    switch (it.slot) {
      case 'weapon': switch (it.wt) {
        case 'sword': for (let i = 0; i < 12; i++) { P(14 - i, 3 + i, 3, 2, i < 2 ? Cl : C); } P(4, 13, 6, 2, '#d8b040'); P(2, 16, 3, 3, '#5a3a1a'); break;
        case 'axe': for (let i = 0; i < 15; i++) P(5 + i * 0.8, 18 - i, 2, 2, '#6a4a2a'); P(11, 2, 8, 8, C); P(17, 2, 2, 8, Cl); break;
        case 'spear': for (let i = 0; i < 16; i++) P(3 + i, 18 - i, 2, 2, '#6a4a2a'); P(16, 1, 5, 5, Cl); break;
        case 'staff': for (let i = 0; i < 15; i++) P(4 + i * 0.7, 20 - i, 2, 2, '#6a4a2a'); P(13, 1, 7, 7, C); P(15, 3, 2, 2, '#fff'); break;
        case 'wand': for (let i = 0; i < 10; i++) P(5 + i, 17 - i, 2, 2, '#5a3a1a'); P(14, 3, 6, 6, C); break;
        case 'bow': for (let i = 0; i < 16; i++) P(6 + Math.sin(i / 15 * Math.PI) * 8, 3 + i, 2, 1, C); P(7, 3, 1, 16, '#eee'); break;
        case 'crossbow': P(3, 9, 16, 3, '#6a4a2a'); P(9, 3, 3, 15, C); P(3, 10, 2, 1, Cl); break;
      } break;
      case 'helmet': P(4, 6, 14, 9, C); P(6, 4, 10, 2, C); P(4, 13, 14, 2, Cd); P(7, 6, 3, 2, Cl); P(10, 15, 2, 4, C); break;
      case 'armor': P(4, 4, 14, 14, C); P(1, 5, 4, 6, Cd); P(17, 5, 4, 6, Cd); P(9, 4, 4, 3, '#0004'); P(5, 5, 4, 2, Cl); P(4, 16, 14, 2, Cd); break;
      case 'gloves': P(4, 6, 6, 10, C); P(12, 6, 6, 10, C); P(4, 14, 6, 3, Cd); P(12, 14, 6, 3, Cd); P(4, 4, 2, 3, C); P(16, 4, 2, 3, C); break;
      case 'boots': P(3, 4, 6, 12, C); P(3, 14, 9, 4, Cd); P(12, 4, 6, 12, C); P(12, 14, 9, 4, Cd); break;
      case 'shield': P(4, 3, 14, 12, C); P(6, 15, 10, 3, C); P(8, 18, 6, 2, C); P(9, 6, 4, 8, Cd); P(5, 4, 12, 2, Cl); break;
    }
  } else if (it.k === 'use') {
    const cs = GD.CONSUMES[it.id];
    if (it.id === 'recall') { P(4, 3, 14, 16, '#e8d8a0'); P(4, 3, 14, 2, '#a88a50'); P(4, 17, 14, 2, '#a88a50'); P(7, 7, 8, 1, '#6a4a2a'); P(7, 10, 8, 1, '#6a4a2a'); P(7, 13, 5, 1, '#6a4a2a'); }
    else if (['meatCooked', 'stew', 'feast'].includes(it.id)) { if (it.id === 'meatCooked') { P(4, 7, 12, 9, cs.col); P(14, 4, 3, 6, '#f0e8d8'); P(6, 9, 4, 2, shade(cs.col, 0.3)); } else { P(3, 10, 16, 8, '#8a5a2a'); P(4, 8, 14, 4, cs.col); P(6, 6, 2, 3, '#fff8'); P(12, 5, 2, 3, '#fff8'); if (it.id === 'feast') { P(8, 3, 6, 5, '#c0504a'); } } }
    else { P(8, 2, 6, 4, '#c8b080'); P(9, 6, 4, 2, '#ddd'); P(5, 8, 12, 12, cs.col); P(6, 9, 3, 4, '#fff8'); P(5, 18, 12, 2, shade(cs.col, -0.4)); }
  } else if (it.k === 'mat') {
    const mc = (GD.MATS[it.id] || {}).c || '#aaa';
    switch (it.id) {
      case '나무': P(2, 8, 18, 6, '#8a5a2a'); P(2, 8, 4, 6, '#c8904a'); P(3, 10, 2, 2, '#8a5a2a'); P(4, 14, 16, 5, '#7a4a1a'); P(4, 14, 4, 5, '#c8904a'); break;
      case '돌': P(3, 7, 16, 12, '#8a8a90'); P(5, 5, 10, 3, '#9a9aa0'); P(6, 8, 5, 3, '#b0b0b8'); P(3, 17, 16, 2, '#606068'); break;
      case '양털': P(3, 6, 16, 12, '#f4f0e6'); P(5, 4, 5, 4, '#fff'); P(12, 4, 5, 4, '#fff'); P(4, 15, 14, 3, '#d8d0c0'); break;
      case '솜': P(5, 5, 12, 12, '#fff'); P(3, 8, 4, 6, '#fff'); P(15, 8, 4, 6, '#fff'); P(8, 15, 6, 4, '#7a9a5a'); break;
      case '횃불': P(9, 9, 4, 12, '#6a4a2a'); P(8, 4, 6, 6, '#ff7a10'); P(9, 2, 4, 4, '#ffd040'); P(10, 1, 2, 2, '#fff'); break;
      case '고기': P(4, 6, 12, 10, '#c0504a'); P(6, 8, 6, 3, '#e08080'); P(14, 4, 4, 6, '#f0e8d8'); break;
      default: P(5, 6, 12, 11, mc); P(7, 4, 8, 3, shade(mc, 0.3)); P(8, 8, 3, 3, '#fff8'); P(5, 15, 12, 2, shade(mc, -0.4));
    }
  } else if (it.k === 'coin') { P(5, 6, 12, 12, '#ffd700'); P(7, 4, 8, 2, '#ffe860'); P(9, 9, 4, 6, '#c8a000'); }
  iconCache.set(key, c); return c;
}

// ───── 가구 ─────
function drawFurn(g, k, x, y, t, owner) {
  const P = (ax, ay, w, h, col) => { g.fillStyle = col; g.fillRect(x + ax * 2, y + ay * 2, w * 2, h * 2); };
  switch (k) {
    case 'bed': P(1, 1, 14, 14, '#7a4a20'); P(2, 2, 12, 12, '#c83a3a'); P(2, 2, 12, 4, '#f4f0e6'); P(4, 3, 8, 2, '#fff'); P(2, 7, 12, 1, '#a02a2a'); break;
    case 'chest': P(2, 4, 12, 10, '#8a5a2a'); P(2, 4, 12, 3, '#a87a42'); P(2, 7, 12, 1, '#4a2a10'); P(7, 7, 2, 3, '#ffd040'); P(2, 13, 12, 1, '#4a2a10'); break;
    case 'torch': { P(7, 6, 2, 9, '#6a4a2a'); const fl = Math.sin(t / 90) > 0; P(6, 2 + (fl ? 0 : 1), 4, 4, '#ff7a10'); P(7, 1 + (fl ? 0 : 1), 2, 3, '#ffd040'); break; }
    case 'lantern': { P(6, 4, 4, 10, '#3a3a40'); P(7, 6, 2, 6, Math.sin(t / 150) > 0 ? '#ffe070' : '#ffd040'); P(5, 3, 6, 1, '#3a3a40'); P(5, 14, 6, 1, '#3a3a40'); break; }
    case 'campfire': { P(3, 11, 10, 3, '#6a4a2a'); P(4, 10, 2, 2, '#888'); P(10, 10, 2, 2, '#888'); const f = (t / 120 | 0) % 3; P(5, 5 + f % 2, 6, 6, '#ff5a10'); P(6, 3 + (f === 1 ? 1 : 0), 4, 5, '#ffb020'); P(7, 6, 2, 3, '#fff3a0'); break; }
    case 'stove': P(2, 3, 12, 12, '#7a7a80'); P(2, 3, 12, 2, '#9a9aa0'); P(4, 7, 8, 5, '#2a2a2a'); P(5, 9, 6, 2, (t / 200 | 0) % 2 ? '#ff7a10' : '#ffb020'); P(10, 1, 3, 3, '#5a5a60'); break;
    case 'table': P(2, 4, 12, 7, '#a87a42'); P(2, 4, 12, 1, '#c8984a'); P(3, 11, 2, 4, '#6a4a2a'); P(11, 11, 2, 4, '#6a4a2a'); P(6, 5, 4, 2, '#e8e0d0'); break;
    case 'chair': P(4, 2, 8, 2, '#8a5a2a'); P(4, 2, 2, 12, '#8a5a2a'); P(10, 2, 2, 12, '#8a5a2a'); P(4, 8, 8, 2, '#a87a42'); break;
    case 'shelf': P(1, 1, 14, 14, '#6a4020'); for (let r = 0; r < 3; r++) { P(2, 2 + r * 4, 12, 3, '#3a2010'); for (let i = 0; i < 5; i++) P(2 + i * 2.4, 2 + r * 4, 2, 3, ['#c83a3a', '#3a6ad8', '#3a9a4a', '#d8b040', '#8a3ab0'][(i + r) % 5]); } break;
    case 'rug': P(1, 2, 14, 12, '#d8c8a0'); P(2, 3, 12, 10, '#b84a3a'); P(4, 5, 8, 6, '#e8d090'); P(6, 7, 4, 2, '#b84a3a'); break;
    case 'plant': P(5, 10, 6, 5, '#b05a2a'); P(5, 10, 6, 1, '#d07a4a'); P(7, 4, 2, 6, '#2a7a2a'); P(4, 3, 4, 4, '#3a9a3a'); P(8, 2, 4, 4, '#3a9a3a'); P(6, 1, 2, 2, '#ff7aa8'); break;
    case 'window': P(0, 0, 16, 16, '#c8b8a0'); P(3, 3, 10, 10, '#8ad0ff'); P(3, 3, 10, 1, '#5a3a1a'); P(7, 3, 2, 10, '#5a3a1a'); P(3, 7, 10, 2, '#5a3a1a'); P(4, 4, 2, 2, '#fff'); break;
    case 'door': P(0, 0, 16, 16, '#c8b8a0'); P(3, 0, 10, 16, '#7a4a20'); P(4, 1, 8, 14, '#9a6a30'); P(10, 8, 1, 2, '#ffd040'); break;
    case 'painting': P(0, 0, 16, 16, '#c8b8a0'); P(2, 3, 12, 9, '#d8b040'); P(3, 4, 10, 7, '#5ab0e0'); P(3, 8, 10, 3, '#4a9a3a'); P(9, 5, 2, 2, '#fff070'); break;
  }
}
