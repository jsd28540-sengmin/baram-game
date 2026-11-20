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
  const N = 32; c = mk(N, N); const g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const px = (x, y, col) => P(x, y, 1, 1, col);
  const L = (x0, y0, x1, y1, col, w = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) P(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w, col); };
  const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
  const circ = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const ell = (x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
  const arcS = (x, y, r, a0, a1, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke(); };
  const clip = (fn, draw) => { g.save(); g.beginPath(); fn(); g.clip(); draw(); g.restore(); };
  const WOOD = '#7a4a22', WOODL = '#a8703a', WOODD = '#4a2a12', GOLD = '#e8b830', GOLDL = '#fff0a0', GOLDD = '#9a6a10';
  if (it.k === 'gear') {
    const C = GD.TIER_COLOR[it.tier] || '#aab4c0', Cd = shade(C, -0.45), Cl = shade(C, 0.55), Cm = shade(C, -0.2);
    const job = it.job;
    switch (it.slot) {
      case 'weapon': switch (it.wt) {
        case 'sword':
          poly([[10, 20], [25, 5], [28, 3], [27, 7], [12, 22]], C); L(11, 20, 25, 6, Cl); L(13, 22, 26, 8, Cd); L(12, 21, 25, 7, Cm);
          L(5, 17, 15, 27, GOLD, 2); L(5, 17, 14, 26, GOLDL); px(6, 18, GOLDL);
          L(9, 23, 4, 28, '#5a3418', 2); [[8, 24], [6, 26]].forEach(([x, y]) => px(x, y, '#9a6a3a'));
          circ(3.5, 28.5, 2, GOLD); px(3, 28, GOLDL); break;
        case 'axe':
          L(5, 29, 20, 6, WOOD, 2); L(5, 28, 19, 6, WOODL); [[9, 23], [13, 17]].forEach(([x, y]) => px(x, y, WOODD));
          poly([[15, 6], [21, 3], [27, 3], [30, 9], [29, 16], [25, 18], [19, 13]], C);
          poly([[27, 3], [30, 9], [29, 16], [27, 15], [28, 9], [26, 5]], Cl);
          poly([[15, 6], [19, 13], [21, 11], [18, 6]], Cd); L(16, 9, 21, 7, '#2a2a30', 1); P(17, 8, 4, 3, Cd); px(18, 9, Cl);
          L(9, 25, 11, 22, '#3a2410', 2); break;
        case 'spear':
          L(3, 30, 21, 12, WOOD, 2); L(3, 29, 20, 12, WOODL); L(6, 26, 8, 24, '#b02a2a', 2);
          P(19, 11, 4, 4, GOLD); px(19, 11, GOLDL);
          poly([[21, 12], [23, 7], [29, 2], [27, 8], [23, 13]], C); L(22, 11, 28, 3, Cl); poly([[23, 13], [27, 8], [29, 2], [28, 7], [24, 13]], Cd); break;
        case 'staff':
          L(8, 30, 17, 12, WOOD, 3); L(8, 29, 16, 12, WOODL); [[11, 24], [14, 18]].forEach(([x, y]) => { P(x, y, 3, 2, WOODD); });
          L(16, 13, 13, 6, WOOD, 2); L(18, 12, 24, 9, WOOD, 2); L(15, 13, 20, 3, WOODD, 1);
          circ(19, 8, 5.5, C); circ(19, 8, 4, shade(C, 0.15)); circ(17.5, 6.5, 2, Cl); px(16, 5, '#fff'); px(17, 5, '#fff');
          px(26, 3, '#fff'); px(25, 4, Cl); px(27, 4, Cl); px(26, 5, Cl); px(12, 4, Cl); break;
        case 'wand':
          L(5, 28, 19, 14, '#2e1a0e', 2); L(5, 27, 18, 14, '#5a3418'); P(9, 22, 3, 3, GOLD); P(15, 16, 3, 3, GOLD); px(9, 22, GOLDL);
          poly([[22, 6], [27, 10], [22, 15], [18, 10]], C); poly([[22, 6], [22, 10], [18, 10]], Cl); poly([[22, 10], [27, 10], [22, 15]], Cd); px(21, 8, '#fff');
          [[27, 3], [29, 5], [14, 6]].forEach(([x, y]) => { px(x, y, '#fff'); px(x - 1, y, Cl); px(x + 1, y, Cl); px(x, y - 1, Cl); px(x, y + 1, Cl); }); break;
        case 'bow':
          L(9, 3, 9, 29, '#e8e2d0'); arcS(-3, 16, 18, -0.85, 0.85, WOOD, 3); arcS(-3, 16, 19, -0.8, 0.8, WOODL, 1);
          P(13, 13, 3, 6, '#3a2410'); px(14, 14, '#7a5a3a'); px(14, 16, '#7a5a3a');
          P(9, 1, 4, 3, C); P(9, 28, 4, 3, C); px(10, 1, Cl); px(10, 28, Cl);
          L(11, 16, 29, 16, '#8a6a3a'); poly([[27, 14], [31, 16], [27, 18]], C); P(9, 15, 3, 3, '#e8e2d0'); px(12, 15, '#d03a3a'); px(12, 17, '#d03a3a'); break;
        case 'crossbow':
          P(14, 12, 4, 19, WOOD); P(14, 12, 1, 19, WOODL); P(13, 24, 6, 3, WOODD);
          arcS(16, 22, 14, -2.55, -0.59, C, 3); arcS(16, 22, 15, -2.5, -0.64, Cl, 1);
          L(4, 14, 16, 14, '#e8e2d0'); L(28, 14, 16, 14, '#e8e2d0');
          L(16, 14, 16, 3, '#cfc8b8', 1); poly([[14, 4], [16, 0], [18, 4]], C); P(15, 13, 2, 2, '#c03030'); P(18, 20, 2, 3, '#2a2a2a'); break;
      } break;
      case 'helmet':
        if (job === 'mage') {
          ell(16, 25, 14, 4.5, Cd); ell(16, 24, 13, 3.5, Cm);
          poly([[8, 24], [24, 24], [20, 12], [23, 5], [28, 3], [24, 7], [16, 9]], C); poly([[8, 24], [16, 9], [14, 14], [11, 24]], Cl);
          P(9, 20, 15, 3, GOLD); P(9, 20, 15, 1, GOLDL); circ(16, 21.5, 1.8, '#4ad8ff'); px(15, 21, '#fff');
          px(19, 14, '#fff7b0'); px(13, 17, '#fff7b0');
        } else if (job === 'healer') {
          poly([[5, 28], [6, 14], [10, 6], [16, 4], [22, 6], [26, 14], [27, 28]], C); poly([[6, 14], [10, 6], [16, 4], [12, 8], [9, 15], [8, 27], [5, 28]], Cl);
          ell(16, 18, 6.5, 8, '#1e1a1e'); ell(16, 20, 5, 5.5, '#3a2a2a'); P(5, 26, 22, 3, Cd); L(6, 26, 26, 26, GOLD);
          L(16, 4, 16, 9, Cd);
        } else {
          ell(16, 14, 11, 10, C); P(5, 14, 22, 12, C); ell(13, 9, 5, 4, Cl); P(5, 23, 22, 3, Cd);
          P(7, 15, 18, 3, '#14141c'); P(15, 15, 2, 9, Cd); [[8, 21], [10, 21], [21, 21], [23, 21]].forEach(([x, y]) => px(x, y, '#14141c'));
          L(16, 4, 16, 13, Cl); [[7, 12], [25, 12], [7, 24], [25, 24]].forEach(([x, y]) => px(x, y, GOLD));
          poly([[16, 4], [19, 0], [24, 2], [20, 5]], '#c83a3a'); px(19, 1, '#ff7a6a');
        } break;
      case 'armor':
        if (job === 'mage') {
          poly([[11, 4], [21, 4], [25, 9], [28, 20], [24, 21], [23, 13], [24, 30], [8, 30], [9, 13], [8, 21], [4, 20], [7, 9]], C);
          poly([[11, 4], [7, 9], [4, 20], [6, 20], [9, 11], [12, 6]], Cl); poly([[24, 30], [23, 13], [22, 30]], Cd);
          poly([[12, 4], [16, 12], [20, 4]], '#2a1e30'); L(16, 12, 16, 30, GOLD); L(12, 5, 16, 12, GOLD); L(20, 5, 16, 12, GOLD);
          P(9, 16, 14, 2, Cd); circ(16, 17, 1.8, GOLD); P(8, 29, 16, 1, GOLD); P(4, 19, 3, 2, GOLD); P(25, 19, 3, 2, GOLD);
        } else if (job === 'healer') {
          poly([[10, 4], [22, 4], [27, 8], [26, 16], [23, 15], [23, 28], [9, 28], [9, 15], [6, 16], [5, 8]], C);
          poly([[10, 4], [5, 8], [6, 15], [8, 9], [12, 5]], Cl); P(9, 20, 14, 3, '#5a3418'); P(15, 20, 3, 3, GOLD);
          poly([[12, 4], [16, 10], [20, 4]], '#2a2020'); L(14, 11, 18, 13, '#e8dcc0'); L(18, 11, 14, 13, '#e8dcc0'); L(14, 15, 18, 17, '#e8dcc0'); L(18, 15, 14, 17, '#e8dcc0');
          for (let y = 6; y < 28; y += 3) { px(10, y, Cd); px(22, y, Cd); } L(23, 15, 23, 27, Cd);
        } else {
          poly([[9, 5], [23, 5], [26, 10], [25, 26], [16, 29], [7, 26], [6, 10]], C);
          ell(6, 9, 5.5, 4.5, Cm); ell(26, 9, 5.5, 4.5, Cm); ell(5.5, 8, 3.5, 2.2, Cl); ell(25.5, 8, 3.5, 2.2, shade(C, 0.25));
          poly([[11, 5], [16, 9], [21, 5]], '#1a1a22'); L(16, 10, 16, 27, Cl); poly([[9, 11], [15, 11], [15, 19], [9, 17]], shade(C, 0.25)); poly([[17, 11], [23, 11], [23, 17], [17, 19]], Cm);
          P(7, 21, 18, 3, '#5a3418'); P(14, 21, 4, 3, GOLD); px(15, 22, GOLDL); [[8, 12], [24, 12]].forEach(([x, y]) => px(x, y, GOLD));
        } break;
      case 'gloves': {
        const leather = job === 'healer', silk = job === 'mage';
        P(9, 21, 13, 9, silk ? Cm : Cd); P(9, 21, 13, 2, silk ? GOLD : Cl);
        poly([[9, 21], [8, 12], [10, 10], [22, 10], [23, 13], [22, 21]], C);
        [10, 13, 16, 19].forEach((x, i) => { const top = i === 0 || i === 3 ? 5 : 3; P(x, top, 3, 9, C); P(x, top, 1, 8, Cl); px(x + 1, top, Cl); if (!silk) { P(x, top + 3, 3, 1, Cd); P(x, top + 6, 3, 1, Cd); } });
        poly([[22, 14], [27, 11], [29, 13], [24, 19], [22, 19]], C); L(23, 15, 27, 12, Cl);
        if (leather) { [10, 13, 16, 19].forEach(x => P(x, 3 + (x === 10 || x === 19 ? 2 : 0), 3, 3, '#e8b896')); L(10, 16, 21, 16, Cd); }
        if (silk) circ(15.5, 25, 2, '#4ad8ff');
        if (!leather && !silk) { P(10, 13, 12, 2, Cl); [[11, 17], [20, 17]].forEach(([x, y]) => px(x, y, GOLD)); }
        break; }
      case 'boots': {
        const draw = (ox, oy, dark) => { const c1 = dark ? Cd : C, c2 = dark ? shade(C, -0.6) : Cl, sole = dark ? '#120e0a' : '#2e2016';
          poly([[ox + 6, oy + 3], [ox + 16, oy + 3], [ox + 16, oy + 18], [ox + 22, oy + 20], [ox + 26, oy + 23], [ox + 26, oy + 27], [ox + 6, oy + 27]], c1);
          P(ox + 6, oy + 26, 21, 3, sole); P(ox + 6, oy + 26, 6, 3, dark ? '#0a0806' : '#1e140c');
          P(ox + 5, oy + 3, 12, 4, c2); P(ox + 5, oy + 6, 12, 1, dark ? '#0006' : Cd); P(ox + 7, oy + 8, 1, 16, c2); L(ox + 17, oy + 19, ox + 24, oy + 22, c2);
          if (dark) return;
          if (job === 'healer') { for (let y = 9; y < 19; y += 3) { L(ox + 10, y + oy, ox + 14, y + oy + 1, '#e8dcc0'); } }
          else if (job === 'mage') { poly([[ox + 25, oy + 23], [ox + 29, oy + 18], [ox + 28, oy + 25]], c1); circ(ox + 29, oy + 18, 1.3, GOLD); P(ox + 5, oy + 3, 12, 1, GOLD); }
          else { P(ox + 6, oy + 12, 10, 2, c2); poly([[ox + 18, oy + 20], [ox + 25, oy + 23], [ox + 25, oy + 25], [ox + 17, oy + 23]], c2); px(ox + 9, oy + 16, GOLD); px(ox + 13, oy + 16, GOLD); } };
        draw(-4, -1, true); draw(2, 2, false); break; }
      case 'shield':
        poly([[4, 3], [28, 3], [28, 14], [25, 22], [16, 30], [7, 22], [4, 14]], Cl);
        poly([[6, 5], [26, 5], [26, 14], [23, 21], [16, 27], [9, 21], [6, 14]], C);
        poly([[6, 5], [16, 5], [16, 27], [9, 21], [6, 14]], shade(C, 0.18));
        P(14, 7, 4, 17, GOLD); P(9, 11, 14, 4, GOLD); P(14, 7, 1, 17, GOLDL); P(9, 11, 14, 1, GOLDL);
        circ(16, 13, 2.5, GOLDD); px(15, 12, GOLDL); [[6, 5], [26, 5], [6, 13], [26, 13]].forEach(([x, y]) => px(x, y, '#e8e8f0')); break;
    }
  } else if (it.k === 'use') {
    const cs = GD.CONSUMES[it.id] || {}, col = cs.col || '#e8303a', cl = shade(col, 0.45), cd = shade(col, -0.4);
    const GL = '#cfe6f2';
    if (it.id === 'recall') {
      P(7, 8, 18, 16, '#efe0b0'); P(7, 8, 2, 16, '#d8c490'); for (let y = 11; y < 22; y += 3) L(10, y, y === 20 ? 17 : 22, y, '#8a6a3a');
      ell(16, 7, 11, 3, '#d8c490'); ell(16, 6.5, 11, 2, '#f4e8c4'); ell(5, 7, 1.5, 3, '#b8a070'); ell(27, 7, 1.5, 3, '#b8a070');
      ell(16, 25, 11, 3, '#d8c490'); ell(16, 25.5, 11, 2, '#b8a070'); ell(5, 25, 1.5, 3, '#9a8050'); ell(27, 25, 1.5, 3, '#9a8050');
      poly([[20, 25], [22, 31], [23, 28], [25, 31], [24, 25]], '#b02020'); circ(22, 24, 3.3, '#c82828'); circ(22, 24, 2, '#e04a3a'); px(21, 23, '#ff9a8a');
    } else if (it.id === 'meatCooked') {
      L(19, 20, 27, 28, '#f2ead8', 3); circ(28, 26, 2.2, '#f2ead8'); circ(26, 29, 2.2, '#f2ead8'); L(19, 21, 26, 28, '#c8bca0');
      ell(13, 13, 10, 8, '#8a4a1e', -0.7); ell(12, 12, 8, 6, col, -0.7); ell(10, 9, 4, 2.5, shade(col, 0.35), -0.7);
      L(8, 15, 13, 10, '#5a2a0e'); L(11, 18, 17, 12, '#5a2a0e'); px(9, 9, '#ffe0b0');
    } else if (it.id === 'stew') {
      [[11, 2], [16, 1], [21, 3]].forEach(([x, y]) => { L(x, y + 7, x + 1, y + 4, '#ffffffaa'); L(x + 1, y + 4, x, y, '#ffffffaa'); });
      ell(16, 15, 13, 4.5, '#5a3418'); ell(16, 15, 11, 3.2, col); circ(12, 15, 1.6, '#e8702a'); circ(19, 14, 1.6, '#8a4a1e'); circ(16, 16, 1.3, '#5aa83a'); px(14, 14, '#fff3c0');
      poly([[3, 15], [29, 15], [26, 25], [20, 29], [12, 29], [6, 25]], '#8a5428'); poly([[3, 15], [8, 15], [9, 27], [6, 25]], '#b07a42'); L(6, 19, 26, 19, '#5a3418');
      L(22, 13, 29, 4, '#c8c8d0', 2);
    } else if (it.id === 'feast') {
      ell(16, 22, 15, 7, '#e8e8f0'); ell(16, 21, 13, 5.5, '#c8ccd8');
      ell(15, 17, 9, 6, '#a8581e'); ell(14, 15.5, 6, 3, '#d08a3a'); L(7, 18, 3, 13, '#f2ead8', 2); L(23, 18, 27, 13, '#f2ead8', 2); circ(3, 12, 1.5, '#f2ead8'); circ(27, 12, 1.5, '#f2ead8'); px(12, 14, '#ffe0a0');
      [[24, 22], [26, 23], [25, 25], [27, 21]].forEach(([x, y]) => circ(x, y, 1.6, '#7a3ab0')); px(24, 21, '#c8a0ff');
      circ(7, 23, 2.6, '#d82a2a'); px(6, 22, '#ff9a9a'); L(7, 20, 8, 19, '#5a3418');
    } else if (it.id === 'buffAtk' || it.id === 'buffDef') {
      P(13, 3, 6, 4, '#a07040'); P(13, 3, 6, 1, '#c89060'); P(14, 7, 4, 4, GL);
      poly([[14, 10], [18, 10], [27, 27], [26, 29], [6, 29], [5, 27]], GL);
      clip(() => { g.moveTo(14, 10); g.lineTo(18, 10); g.lineTo(27, 27); g.lineTo(26, 29); g.lineTo(6, 29); g.lineTo(5, 27); g.closePath(); }, () => { P(0, 17, 32, 15, col); P(0, 17, 32, 2, cl); P(0, 27, 32, 3, cd); });
      L(13, 12, 8, 24, '#ffffffcc'); circ(19, 22, 1, '#ffffffaa'); circ(21, 25, 0.8, '#ffffffaa');
      if (it.id === 'buffAtk') { L(20, 21, 22, 19, '#fff'); } else { P(18, 20, 4, 4, '#fff6'); }
    } else {
      const big = it.id === 'hp2' || it.id === 'mp2';
      const R = big ? 10.5 : 9, cy = big ? 20 : 21;
      P(12, 2, 8, 5, '#a07040'); P(12, 2, 8, 1, '#c89060'); P(13, 7, 6, 5, GL); P(11, 6, 10, 2, '#9ab8c8');
      circ(16, cy, R, GL);
      clip(() => g.arc(16, cy, R - 1, 0, 7), () => { P(0, cy - 3, 32, 20, col); P(0, cy - 3, 32, 2, cl); circ(16, cy + R + 3, R + 2, cd); });
      L(10, cy - 5, 8, cy + 2, '#ffffffdd'); px(11, cy - 6, '#fff'); circ(21, cy + 3, 1, '#ffffff88'); circ(19, cy + 6, 0.8, '#ffffff88');
      if (big) { P(10, cy - 1, 12, 4, '#efe0b0'); P(10, cy - 1, 12, 1, '#fff6d8'); circ(16, cy + 1, 1.3, col); }
    }
  } else if (it.k === 'mat') {
    switch (it.id) {
      case '철광석': case '은광석': {
        const silver = it.id === '은광석';
        poly([[4, 22], [7, 11], [14, 6], [23, 8], [28, 15], [27, 25], [17, 29], [8, 28]], silver ? '#5a5c66' : '#6a5a52');
        poly([[7, 11], [14, 6], [16, 13], [9, 17]], silver ? '#7a7c88' : '#8a786e'); poly([[16, 13], [23, 8], [28, 15], [20, 19]], silver ? '#6a6c78' : '#7a6a60'); poly([[4, 22], [9, 17], [8, 28]], silver ? '#40424a' : '#4a3e38');
        if (silver) { L(9, 20, 15, 15, '#f4f7fb'); L(15, 15, 22, 18, '#dfe6ef'); L(18, 24, 24, 21, '#f4f7fb'); [[12, 11], [24, 13], [14, 24]].forEach(([x, y]) => { px(x, y, '#fff'); px(x + 1, y, '#c8d0dc'); }); px(23, 20, '#fff'); }
        else { [[11, 13], [19, 12], [14, 20], [22, 21], [9, 23]].forEach(([x, y]) => { P(x, y, 2, 2, '#b8bcc4'); px(x, y, '#e8ecf0'); }); [[17, 24], [24, 16]].forEach(([x, y]) => P(x, y, 2, 1, '#a0522d')); }
        break; }
      case '마력석':
        ell(16, 26, 12, 4, '#3a3448');
        poly([[11, 26], [9, 12], [13, 4], [17, 12], [16, 26]], '#8a5cff'); poly([[13, 4], [17, 12], [16, 26], [13, 26]], '#5a30d0'); L(11, 12, 12, 24, '#c8b0ff');
        poly([[17, 27], [18, 14], [22, 9], [26, 15], [24, 27]], '#7a4cf0'); poly([[22, 9], [26, 15], [24, 27], [22, 27]], '#4a26b0'); L(19, 15, 19, 25, '#d8c8ff');
        poly([[4, 27], [5, 19], [8, 16], [10, 21], [9, 27]], '#6a3ce0'); px(6, 20, '#d8c8ff');
        px(14, 9, '#fff'); px(22, 13, '#fff'); [[27, 5], [6, 9]].forEach(([x, y]) => { px(x, y, '#fff'); px(x - 1, y, '#c8b0ff'); px(x + 1, y, '#c8b0ff'); px(x, y - 1, '#c8b0ff'); px(x, y + 1, '#c8b0ff'); }); break;
      case '용의비늘':
        poly([[8, 4], [20, 2], [24, 12], [18, 24], [8, 18]], '#8a2018');
        poly([[12, 6], [24, 6], [28, 16], [20, 30], [10, 20]], '#d8402a'); poly([[12, 6], [18, 6], [16, 26], [10, 20]], '#ff6a4a');
        L(18, 8, 18, 27, '#a82a1a'); L(14, 10, 15, 22, '#ff9a7a'); L(22, 10, 24, 18, '#a82a1a'); L(13, 7, 23, 7, '#ffb090'); px(14, 9, '#fff'); break;
      case '나무':
        [[9, 21], [23, 21], [16, 11]].forEach(([x, y]) => { circ(x, y, 7, '#5a3418'); circ(x, y, 6, '#d8a868'); circ(x, y, 4, '#c08848'); circ(x, y, 2, '#d8a868'); px(x, y, '#8a5a2a'); px(x - 4, y - 3, '#f0c890'); });
        L(16, 18, 16, 26, '#3a2010'); break;
      case '돌':
        ell(10, 22, 8, 6, '#7a7a82'); ell(9, 20, 5, 3, '#9a9aa2'); ell(22, 23, 7, 5.5, '#6a6a72'); ell(21, 21, 4, 2.5, '#8a8a92');
        ell(16, 13, 8, 6.5, '#8a8a92'); ell(14, 11, 5, 3, '#acacb4'); px(12, 10, '#d8d8e0'); L(18, 15, 21, 16, '#5a5a62'); L(6, 24, 9, 25, '#5a5a62'); break;
      case '양털':
        [[10, 18, 7], [22, 18, 7], [16, 12, 7], [16, 22, 7], [8, 12, 5], [24, 12, 5]].forEach(([x, y, r]) => circ(x, y, r, '#d8d0c0'));
        [[10, 17, 6], [22, 17, 6], [16, 11, 6], [16, 21, 6], [8, 11, 4], [24, 11, 4]].forEach(([x, y, r]) => circ(x, y, r, '#f4f0e6'));
        [[14, 8], [8, 9], [20, 14], [12, 18], [22, 21]].forEach(([x, y]) => { px(x, y, '#fff'); px(x + 1, y, '#fff'); });
        [[11, 14], [18, 17], [15, 24]].forEach(([x, y]) => L(x, y, x + 2, y + 1, '#c8c0b0')); break;
      case '솜':
        L(16, 24, 16, 31, '#6a5a2a', 2);
        poly([[6, 22], [16, 28], [26, 22], [22, 26], [16, 30], [10, 26]], '#7a5a2a');
        [[10, 15, 6], [22, 15, 6], [16, 9, 6], [16, 18, 6]].forEach(([x, y, r]) => circ(x, y, r, '#dcdce6')); [[10, 14, 5], [22, 14, 5], [16, 8, 5], [16, 17, 5]].forEach(([x, y, r]) => circ(x, y, r, '#fff'));
        px(13, 6, '#fff'); L(16, 12, 16, 14, '#dcdce6'); L(12, 17, 14, 18, '#dcdce6'); break;
      case '횃불':
        L(14, 31, 17, 13, WOOD, 3); L(14, 30, 16, 14, WOODL); P(13, 12, 7, 5, '#c8b890'); L(13, 14, 19, 14, '#8a7a5a');
        poly([[11, 13], [12, 6], [15, 8], [16, 1], [19, 7], [21, 4], [22, 13]], '#e8501a'); poly([[13, 13], [14, 8], [16, 9], [17, 4], [19, 9], [20, 13]], '#ffa020'); poly([[15, 13], [16, 9], [18, 13]], '#fff3a0'); break;
      case '고기':
        ell(15, 16, 12, 10, '#f0d8c8', 0.2); ell(15, 16, 10.5, 8.5, '#c0384a', 0.2); ell(13, 13, 5, 3, '#d85a6a', 0.2);
        L(8, 15, 14, 18, '#f4c8cc'); L(16, 11, 21, 14, '#f4c8cc'); L(12, 21, 18, 22, '#f4c8cc');
        L(20, 18, 28, 27, '#f2ead8', 3); circ(28.5, 26, 2, '#f2ead8'); circ(26.5, 29, 2, '#f2ead8'); circ(19, 18, 3, '#f2ead8'); circ(19, 18, 1.4, '#c8a888'); break;
      default: { const mc = (GD.MATS[it.id] || {}).c || '#aaa'; poly([[6, 22], [9, 10], [17, 6], [26, 11], [27, 23], [16, 28]], mc); poly([[9, 10], [17, 6], [16, 16]], shade(mc, 0.35)); px(13, 11, '#fff'); }
    }
  } else if (it.k === 'coin') {
    [[16, 25], [16, 21], [16, 17]].forEach(([x, y]) => { ell(x, y + 1.5, 10, 4, GOLDD); ell(x, y, 10, 4, GOLD); ell(x, y, 7, 2.5, '#f4d050'); });
    ell(14, 16, 3, 1, GOLDL); px(16, 17, GOLDD);
  }
  // 픽셀 정리(경계 선명화) + 외곽선
  const id = g.getImageData(0, 0, N, N), d = id.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 110 ? 255 : 0;
  const op = i => d[i * 4 + 3] === 255, out = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; if (op(i)) continue; if ((x > 0 && op(i - 1)) || (x < N - 1 && op(i + 1)) || (y > 0 && op(i - N)) || (y < N - 1 && op(i + N))) out.push(i); }
  out.forEach(i => { d[i * 4] = 22; d[i * 4 + 1] = 18; d[i * 4 + 2] = 26; d[i * 4 + 3] = 255; });
  g.putImageData(id, 0, 0);
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
