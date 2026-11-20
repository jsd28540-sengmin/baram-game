// ═══════════════════════════════════════════
//  환경 그래픽 v2 — 따뜻한 색감의 아늑한 농장 RPG 도트 스타일
//  (땅 질감, 풀 가장자리, 물가, 큰 나무, 집, 울타리)
// ═══════════════════════════════════════════
const ENV_SUBTILE = 2; // 논리 픽셀 → 화면 2배
// 땅 팔레트
const GPAL = {
  g: { b: '#76a030', d: '#5e8a26', dd: '#4a7220', l: '#92bc44', h: '#aed060' },
  f: { b: '#5e6a28', d: '#4c5820', dd: '#3c4618', l: '#768636', h: '#8a9c44' },
  d: { b: '#ecd59a', d: '#dcc083', dd: '#c9a86a', l: '#f8e8b8', h: '#fff4d2' },
  s: { b: '#eef4f9', d: '#d6e3ee', dd: '#bccfdf', l: '#ffffff', h: '#ffffff' },
  w: { b: '#62803e', d: '#506c33', dd: '#40582a', l: '#7a9850', h: '#90ac62' },
  v: { b: '#5c4b45', d: '#4a3c37', dd: '#3a2f2b', l: '#715e56', h: '#86706a' },
};
const ROADP = { b: '#c49a62', d: '#ad8350', dd: '#93693e', l: '#d8b37c', h: '#e8c894' };
function _hash(a, b, c) { let n = a * 374761393 + b * 668265263 + c * 2147483647; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
// 논리 해상도 캔버스에 그리고 2배로 확대
function lowres(w, h, draw) {
  const s = mk(w, h), g = s.getContext('2d');
  const api = {
    g,
    P: (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, ww, hh); },
    px: (x, y, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); },
    circ: (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); },
    ell: (x, y, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); },
    poly: (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); },
  };
  draw(api);
  return s;
}
function crisp(c, th = 110) { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), a = d.data; for (let i = 3; i < a.length; i += 4) a[i] = a[i] >= th ? 255 : 0; g.putImageData(d, 0, 0); return c; }
function outline1(c, col) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h), a = d.data, op = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) op[i] = a[i * 4 + 3] > 0 ? 1 : 0;
  const [r, gg, b] = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (op[i]) continue; if ((x > 0 && op[i - 1]) || (x < w - 1 && op[i + 1]) || (y > 0 && op[i - w]) || (y < h - 1 && op[i + w])) { a[i * 4] = r; a[i * 4 + 1] = gg; a[i * 4 + 2] = b; a[i * 4 + 3] = 255; } }
  g.putImageData(d, 0, 0); return c;
}
function up2(src) { const c = mk(src.width * 2, src.height * 2), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, c.width, c.height); return c; }

// ── 땅 ──
function drawGround(A, u, seed) {
  const p = GPAL[u] || GPAL.g, r = srand(seed), { P, px } = A;
  P(0, 0, 16, 16, p.b);
  // 큰 얼룩 (부드러운 명암)
  for (let i = 0; i < 3; i++) { const x = r() * 14 | 0, y = r() * 14 | 0; P(x, y, 3, 2, r() < 0.5 ? p.d : p.l); P(x + 1, y - 1, 1, 1, r() < 0.5 ? p.d : p.l); }
  if (u === 'g' || u === 'f' || u === 'w') {
    const n = u === 'f' ? 6 : 5;
    for (let i = 0; i < n; i++) { const x = 1 + r() * 12 | 0, y = 1 + r() * 12 | 0; px(x, y + 2, p.dd); px(x + 1, y + 1, p.dd); px(x + 1, y + 2, p.dd); px(x + 2, y + 2, p.d); px(x + 1, y, p.l); px(x + 3, y + 1, p.l); }
    for (let i = 0; i < 4; i++) px(r() * 16 | 0, r() * 16 | 0, p.h);
    if (u === 'g' && r() < 0.5) { const fc = ['#ffffff', '#ffe14a', '#ff9ac0', '#b48aff'][r() * 4 | 0]; px(2 + r() * 12 | 0, 2 + r() * 12 | 0, fc); }
    if (u === 'g' && seed % 9 === 0) { const { ell } = A; ell(8, 10, 4.5, 3.2, '#3e7a2a'); ell(7.5, 9.2, 4, 2.6, '#5aa83a'); ell(6.5, 8.5, 1.8, 1, '#86c856'); px(6, 9, '#ff7a9a'); px(10, 8, '#ffe14a'); }
    if (u === 'g' && seed % 11 === 0) { for (let i = 0; i < 5; i++) { P(5 + i * 1.4, 7 + (i % 2), 0.8, 5 - (i % 2), i % 2 ? '#4a9a34' : '#6cbc48'); } }
    if (u === 'f' && r() < 0.6) { const x = 2 + r() * 11 | 0, y = 2 + r() * 11 | 0; P(x, y, 2, 1, '#9a7a3a'); px(x + 1, y + 1, '#7a5a2a'); } // 낙엽
    if (u === 'w' && r() < 0.3) { const x = 2 + r() * 9 | 0, y = 3 + r() * 9 | 0; P(x, y, 5, 2, '#566e44'); P(x + 1, y, 3, 1, '#6a8456'); }
  } else if (u === 'd') {
    for (let i = 0; i < 2; i++) { const y = 2 + r() * 12 | 0, x = r() * 8 | 0; P(x, y, 6, 1, p.l); P(x + 2, y + 1, 4, 1, p.d); }
    for (let i = 0; i < 3; i++) { const x = r() * 15 | 0, y = r() * 15 | 0; px(x, y, p.dd); px(x + 1, y, p.d); }
  } else if (u === 's') {
    for (let i = 0; i < 2; i++) { const y = 2 + r() * 12 | 0, x = r() * 9 | 0; P(x, y, 6, 1, p.d); P(x + 1, y + 1, 4, 1, p.dd); }
    for (let i = 0; i < 4; i++) px(r() * 16 | 0, r() * 16 | 0, i % 2 ? '#cfe6ff' : '#fff');
  } else if (u === 'v') {
    for (let i = 0; i < 2; i++) { let x = r() * 14 | 0, y = r() * 14 | 0; for (let k = 0; k < 4; k++) { px(x, y, p.dd); x += r() < 0.5 ? 1 : 0; y += 1; } }
    if (r() < 0.5) { const x = r() * 14 | 0, y = r() * 14 | 0; px(x, y, '#e0602a'); px(x + 1, y, '#ffa040'); }
  }
}
function drawRoad(A, seed) {
  const p = ROADP, r = srand(seed), { P, px } = A;
  P(0, 0, 16, 16, p.b);
  for (let i = 0; i < 4; i++) { const x = r() * 14 | 0, y = r() * 14 | 0; P(x, y, 3, 2, r() < 0.5 ? p.d : p.l); }
  for (let i = 0; i < 4; i++) { const x = 1 + r() * 13 | 0, y = 1 + r() * 13 | 0; px(x, y, p.dd); px(x + 1, y, '#bfa07a'); px(x, y - 1, p.h); }
  for (let i = 0; i < 3; i++) px(r() * 16 | 0, r() * 16 | 0, p.h);
}
function drawFlag(A, seed) { // 마을 바닥: 둥근 자갈
  const r = srand(seed), { P, ell } = A;
  P(0, 0, 16, 16, '#7e766a');
  const rows = [[0, 0], [1, 4], [0, 8], [1, 12]];
  for (const [o, y] of rows) for (let x = -2 + o * 2.5; x < 16; x += 5) { const c = ['#b8ae9c', '#aca290', '#c4baa8', '#a49a88'][r() * 4 | 0]; ell(x + 2.4, y + 2, 2.3, 1.8, c); ell(x + 1.8, y + 1.4, 1.2, 0.7, shade(c, 0.18)); }
}
function drawWater(A, seed, frame) {
  const r = srand(seed), { P, px } = A;
  P(0, 0, 16, 16, '#4a94dc');
  for (let i = 0; i < 2; i++) { const y = (3 + i * 7 + frame) % 16, x = (r() * 9 + frame * 2) % 11 | 0; P(x, y, 5, 1, '#6cb2f0'); P(x + 1, y + 1, 3, 1, '#3f88d0'); }
  if ((seed + frame) % 4 === 0) { const x = 2 + r() * 12 | 0, y = 2 + r() * 12 | 0; px(x, y, '#e8f6ff'); }
  if ((seed >> 2) % 5 === 0) { const { circ } = A; const x = 4 + (seed % 7), y = 5 + (seed % 5); circ(x, y, 2.6, '#3e8a34'); circ(x, y, 2, '#5ab84a'); P(x, y - 2.6, 2.6, 2, '#4a94dc'); px(x - 1, y - 1, '#86d070'); if (seed % 2) { circ(x + 4, y + 3, 1.2, '#ff9ac0'); px(x + 4, y + 3, '#fff'); } }
}
function drawFlowers(A, seed) {
  const r = srand(seed), { P, px } = A; const cols = [['#ffffff', '#ffd84a'], ['#ffe14a', '#e08a20'], ['#ff8ab8', '#ffe0ec'], ['#b48aff', '#fff3a0'], ['#ff6a5a', '#ffd84a']];
  for (let i = 0; i < 3; i++) { const x = 2 + r() * 11 | 0, y = 2 + r() * 11 | 0, [pc, cc] = cols[r() * cols.length | 0]; px(x, y + 2, '#3e7a2a'); px(x, y - 1, pc); px(x - 1, y, pc); px(x + 1, y, pc); px(x, y + 1, pc); px(x, y, cc); }
}
// ── 집 ──
function drawHouseWall(A, v) {
  const { P, px } = A; const W = '#c99a62', Wd = '#a97c48', Wl = '#ddb27a';
  for (let y = 0; y < 16; y += 4) { P(0, y, 16, 4, W); P(0, y, 16, 1, Wl); P(0, y + 3, 16, 1, Wd); }
  P(0, 0, 1, 16, '#6e4a2a'); P(15, 0, 1, 16, '#6e4a2a');
  if (v % 3 === 0) { // 창문 + 화분
    P(3, 3, 10, 8, '#f2e6c8'); P(4, 4, 8, 6, '#5a9ad6'); P(4, 4, 8, 2, '#7ab6ea'); P(7.5, 4, 1, 6, '#f2e6c8'); P(4, 6.5, 8, 1, '#f2e6c8'); px(5, 5, '#d8f0ff');
    P(3, 11, 10, 2, '#8a5a30'); P(3, 11, 10, 0.5, '#a87040');
    [[4, '#ff6a8a'], [6, '#ffe14a'], [8, '#ff6a8a'], [10, '#ffffff'], [11, '#ffe14a']].forEach(([x, c]) => { px(x, 10, c); px(x, 11, '#3e7a2a'); });
  } else if (v % 3 === 1) { // 문
    P(4, 3, 8, 13, '#6e4424'); P(5, 4, 6, 12, '#9a6234'); P(5, 4, 6, 1, '#b07a44'); P(7.5, 4, 1, 12, '#7a4a26'); px(9, 10, '#ffd84a'); P(4, 15, 8, 1, '#8a8276'); P(3, 3, 10, 1, '#5a3a1e');
  }
}
function drawRoof(A, rc, v) {
  const { P, px } = A; const d1 = shade(rc, -0.22), d2 = shade(rc, -0.4), l1 = shade(rc, 0.18);
  P(0, 0, 16, 16, rc);
  for (let y = 0; y < 16; y += 4) {
    P(0, y + 3, 16, 1, d2);
    for (let x = (y / 4 % 2) * 2; x < 16; x += 4) { P(x, y + 2, 3, 1, d1); px(x + 1, y + 3, d1); P(x, y, 3, 1, l1); }
  }
}
function drawFence(A) {
  const { P, px } = A; const w = '#b07a42', wd = '#7a5028', wl = '#d09a5a';
  P(0, 6, 16, 2, w); P(0, 6, 16, 0.5, wl); P(0, 7.5, 16, 0.5, wd); P(0, 11, 16, 2, w); P(0, 11, 16, 0.5, wl); P(0, 12.5, 16, 0.5, wd);
  for (const x of [1, 12]) { P(x, 3, 3, 12, w); P(x, 3, 1, 12, wl); P(x + 2, 3, 1, 12, wd); P(x, 2, 3, 1, wl); P(x, 14, 3, 1, '#0003'); }
}
function drawBoulder(A, u, seed) {
  const r = srand(seed), { ell, P, px } = A; const c = u === 'v' ? '#5a4e4a' : u === 's' ? '#a8b4c0' : u === 'd' ? '#b49470' : '#9a968e';
  ell(8, 14.5, 7, 1.6, '#0003');
  ell(8, 9.5, 6.5, 5.5, shade(c, -0.3)); ell(7.3, 8.8, 6, 5, c); ell(6, 7, 3.2, 2.2, shade(c, 0.22)); px(5, 6, shade(c, 0.4));
  P(9, 10, 3, 1, shade(c, -0.18)); px(10, 9, shade(c, -0.18));
  if (u === 'g' || u === 'f' || u === 'w') { P(4, 4, 5, 1, '#5e9a3a'); P(5, 3.5, 3, 1, '#78b450'); }
  if (u === 's') { P(3, 4, 8, 1.5, '#ffffff'); }
}
function drawBridge(A) {
  const { P, px } = A;
  for (let x = 0; x < 16; x += 4) { P(x, 0, 4, 16, '#b08a56'); P(x, 0, 1, 16, '#c8a06a'); P(x + 3, 0, 1, 16, '#7a5a34'); px(x + 2, 3, '#6a4a2a'); px(x + 2, 12, '#6a4a2a'); }
  P(0, 0, 16, 1.5, '#6a4a2a'); P(0, 14.5, 16, 1.5, '#6a4a2a');
}

function drawTownWall(A, v) {
  const { P, px } = A; P(0, 0, 16, 16, '#7e786e');
  const rows = [[0, 5], [5, 5], [10, 6]];
  rows.forEach(([y, h], i) => { const off = i % 2 ? 4 : 0; for (let x = -off; x < 16; x += 8) { const c = ['#b4ac9c', '#a8a090', '#bcb4a4'][(x + i + v) & 1 ? 0 : (i % 3)]; P(x + 0.5, y + 0.5, 7, h - 1, c); P(x + 0.5, y + 0.5, 7, 0.5, '#d0c8b8'); P(x + 0.5, y + h - 1, 7, 0.5, '#8a8274'); } });
  if (v % 4 === 1) { P(2, 11, 3, 2, '#6a9a4a'); px(3, 10, '#86b860'); }
}
function drawCaveFloor(A, seed, pal) {
  const r = srand(seed), { P, px } = A; const cp = CAVE_PAL[pal] || CAVE_PAL[0];
  P(0, 0, 16, 16, cp[0]);
  for (let i = 0; i < 3; i++) { const x = r() * 13 | 0, y = r() * 13 | 0; P(x, y, 3, 2, shade(cp[0], r() < 0.5 ? -0.12 : 0.08)); }
  for (let i = 0; i < 3; i++) { const x = 1 + r() * 13 | 0, y = 1 + r() * 13 | 0; px(x, y, shade(cp[0], -0.3)); px(x, y - 1, shade(cp[0], 0.2)); }
}
function drawCaveWall(A, seed, pal, v) {
  const r = srand(seed), { P, px } = A; const cp = CAVE_PAL[pal] || CAVE_PAL[0]; const base = cp[2], hi = shade(cp[1], 0.1);
  P(0, 0, 16, 16, base);
  for (let i = 0; i < 4; i++) { const x = r() * 12 | 0, y = r() * 12 | 0, w = 3 + (r() * 3 | 0); P(x, y, w, 3, cp[1]); P(x, y, w, 1, hi); P(x, y + 3, w, 0.5, shade(base, -0.3)); }
  if (v === 1) { P(4, 5, 2, 2, '#c8c8d0'); px(4, 5, '#fff'); } if (v === 3) { P(10, 9, 2, 2, '#e0b030'); px(10, 9, '#fff4a0'); }
}
// 지면 계열(풀이 경계를 덮는 쪽)
const GRASSY = new Set([T.GRASS, T.FLOWER, T.FOREST, T.TREE, T.FENCE]);
const SOFT_LOW = new Set([T.ROAD, T.SAND, T.STONE, T.SWAMP, T.SNOW, T.BRIDGE]);
const TREEISH = new Set([T.TREE, T.PINE, T.DEADTREE, T.CACTUS]);

const _tileImgOld = tileImg;
tileImg = function (id, v, pal, castle, frame, under) {
  const NEW = id === T.WALL || ((id === T.CAVE || id === T.CAVEWALL) && !castle) || id === T.GRASS || id === T.FLOWER || id === T.FOREST || id === T.SAND || id === T.SNOW || id === T.SWAMP || id === T.ASH || id === T.ROAD || id === T.STONE || id === T.WATER || id === T.FENCE || id === T.ROCK || id === T.HOUSE || id === T.ROOF || id === T.BRIDGE || TREEISH.has(id);
  if (id === T.BARS || id === T.RUINWALL) {
    const key2 = 'v2|' + id + '|' + v + '|' + pal + '|' + castle; let c2 = tileCache.get(key2); if (c2) return c2;
    const small2 = lowres(16, 16, A => {
      const { P, px } = A;
      if (id === T.BARS) { const fl = castle ? (CASTLE_PAL[pal] || CASTLE_PAL[0])[0] : '#7a7066'; P(0, 0, 16, 16, fl); P(0, 13, 16, 3, '#0004'); P(0, 1, 16, 2, '#3a3a42'); P(0, 1, 16, 0.5, '#7a7a86'); P(0, 12, 16, 2, '#3a3a42'); for (let x = 1; x < 16; x += 3) { P(x, 0, 1.5, 15, '#4a4a54'); P(x, 0, 0.5, 15, '#9a9aa8'); } }
      else { const r = srand(v * 31 + 5); P(0, 0, 16, 16, '#8a8478'); for (let y = 0; y < 16; y += 4) { P(0, y + 3, 16, 1, '#5e584e'); for (let x = (y / 4 % 2) * 4; x < 16; x += 8) P(x, y, 1, 3, '#5e584e'); P(0, y, 16, 0.5, '#a49e92'); } for (let i = 0; i < 4; i++) { const x = r() * 14 | 0, y = r() * 14 | 0; P(x, y, 3, 2, '#5e8a3a'); px(x + 1, y - 1, '#78a850'); } if (v % 2) { P(4 + (v & 6), 0, 4, 3, '#6cb043'); P(5 + (v & 6), 3, 2, 2, '#5a4e42'); } P(0, 14, 16, 2, '#0003'); }
    });
    c2 = up2(small2); tileCache.set(key2, c2); return c2;
  }
  if (!NEW || castle || (id === T.ROCK && under === 'c')) return _tileImgOld(id, v, pal, castle, frame, under);
  const key = 'v2|' + id + '|' + v + '|' + frame + '|' + under + '|' + pal;
  let c = tileCache.get(key); if (c) return c;
  const seed = id * 977 + v * 131 + 7 + frame * 3 + (under ? under.charCodeAt(under.length - 1) * 31 : 0);
  const small = lowres(16, 16, A => {
    const ug = id === T.FOREST ? 'f' : id === T.SAND ? 'd' : id === T.SNOW ? 's' : id === T.SWAMP ? 'w' : id === T.ASH ? 'v' : (under && GPAL[under] ? under : id === T.PINE ? 's' : id === T.CACTUS ? 'd' : id === T.DEADTREE ? 'w' : 'g');
    switch (id) {
      case T.ROAD: drawRoad(A, seed); break;
      case T.STONE: drawFlag(A, seed); break;
      case T.WATER: drawWater(A, seed, frame); break;
      case T.HOUSE: drawHouseWall(A, v); break;
      case T.ROOF: drawRoof(A, under || '#b04030', v); break;
      case T.BRIDGE: drawBridge(A); break;
      case T.WALL: drawTownWall(A, v); break;
      case T.CAVE: drawCaveFloor(A, seed, pal); break;
      case T.CAVEWALL: drawCaveWall(A, seed, pal, v); break;
      default:
        drawGround(A, ug, seed);
        if (id === T.FLOWER) drawFlowers(A, seed);
        if (id === T.FENCE) drawFence(A);
        if (id === T.ROCK) drawBoulder(A, ug, seed);
    }
  });
  c = up2(small); tileCache.set(key, c); return c;
};

// ── 가장자리 (풀 테두리 / 물가) ──
const EDGE = (() => {
  const rot = (src, k) => { if (!k) return src; const c = mk(src.width, src.height), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.translate(src.width / 2, src.height / 2); g.rotate(k * Math.PI / 2); g.drawImage(src, -src.width / 2, -src.height / 2); return c; };
  const lip = (u, seed) => lowres(16, 16, ({ P, px }) => {
    const p = GPAL[u] || GPAL.g, r = srand(seed);
    for (let x = 0; x < 16; x++) { const d = 1 + Math.round(_hash(x, seed, 3) * 2); P(x, 0, 1, d, p.b); px(x, d, 'rgba(40,60,20,.35)'); if (r() < 0.35) px(x, d, p.d); if (r() < 0.25) px(x, d + 1, p.dd); }
    for (let i = 0; i < 4; i++) px(r() * 16 | 0, 0, p.l);
  });
  const bank = (seed, top) => lowres(16, 16, ({ P, px }) => {
    for (let x = 0; x < 16; x++) {
      const d = top ? 2 + Math.round(_hash(x, seed, 5)) : 1;
      if (top) { P(x, 0, 1, d, '#8a6a44'); px(x, 0, '#a8845a'); }
      P(x, d, 1, 1, 'rgba(30,60,110,.3)');
      if (top && _hash(x, seed, 9) > 0.45) px(x, d + 1, 'rgba(235,248,255,.6)');
    }
  });
  const make = fn => [0, 1, 2, 3].map(k => up2(rot(fn(), k)));
  // 방향 순서: 0=위쪽 경계(N), 1=오른쪽(E), 2=아래(S), 3=왼쪽(W)
  return {
    lip: { g: make(() => lip('g', 11)), f: make(() => lip('f', 23)), w: make(() => lip('w', 37)) },
    bankN: [0, 1, 2, 3].map(k => up2(rot(bank(5, true), k))),
    foam: [0, 1, 2, 3].map(k => up2(rot(bank(9, false), k))),
  };
})();
const NB = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function grassKind(t, x, y) { if (t === T.FOREST) return 'f'; if (t === T.SWAMP) return 'w'; if (t === T.TREE || t === T.FLOWER || t === T.FENCE) { const b = S.map.biome ? biomeChar(x, y) : 'g'; return b === 'f' ? 'f' : b === 'g' ? 'g' : null; } if (t === T.GRASS) return 'g'; return null; }
function drawEdges(id, x, y, X0, Y0) {
  if (id === T.WATER) {
    for (let k = 0; k < 4; k++) { const n = tileAt(x + NB[k][0], y + NB[k][1]); if (n === T.WATER || n === T.BRIDGE || n === T.LAVA) continue; ctx.drawImage(k === 0 ? EDGE.bankN[0] : EDGE.foam[k], X0, Y0); if (k === 0) { const gk = grassKind(n, x, y - 1); if (gk) ctx.drawImage(EDGE.lip[gk][0], X0, Y0); } }
    return;
  }
  if (!SOFT_LOW.has(id) || id === T.SWAMP) return;
  for (let k = 0; k < 4; k++) { const nx = x + NB[k][0], ny = y + NB[k][1]; const gk = grassKind(tileAt(nx, ny), nx, ny); if (gk) ctx.drawImage(EDGE.lip[gk][k], X0, Y0); }
}

// ── 큰 나무 (캐릭터와 앞뒤로 겹침) ──
const treeCache = new Map();
function treeSprite(kind, v, u) {
  const key = kind + '|' + v + '|' + u; let c = treeCache.get(key); if (c) return c;
  const W = 30, H = 44; const r = srand(v * 97 + kind.length * 13 + 5);
  const s = lowres(W, H, A => {
    const { P, px, circ, ell, poly } = A; const cx = 15, by = 41;
    if (kind === 'oak' || kind === 'dark') {
      const pal = kind === 'dark' ? ['#2f6a26', '#3d8030', '#4f973a', '#68b04c'] : (kind === 'oak' && v === 3) ? ['#d0708e', '#e892ac', '#f6b4c8', '#ffd8e4'] : ['#3f7e2a', '#4f9a34', '#64b244', '#86cc5c'];
      const tr = '#7a5232', trd = '#5a3a20', trl = '#9a6a40';
      P(cx - 3, by - 16, 6, 16, tr); P(cx - 3, by - 16, 1.5, 16, trl); P(cx + 1.5, by - 16, 1.5, 16, trd);
      poly([[cx - 5, by], [cx - 3, by - 4], [cx + 3, by - 4], [cx + 5, by]], tr); P(cx - 1, by - 10, 1, 4, trd); P(cx + 1, by - 6, 1, 3, trd);
      const blobs = v % 2 ? [[15, 15, 11], [7, 20, 7], [23, 20, 7], [11, 9, 7], [20, 9, 6.5], [15, 23, 7]] : [[15, 14, 11.5], [6, 19, 6.5], [24, 18, 6.5], [10, 8, 7], [19, 7, 7], [14, 22, 7.5]];
      blobs.forEach(([x, y, rr]) => circ(x + 1, y + 1.5, rr, pal[0]));
      blobs.forEach(([x, y, rr]) => circ(x, y, rr - 0.6, pal[1]));
      blobs.forEach(([x, y, rr]) => circ(x - rr * 0.28, y - rr * 0.3, rr * 0.55, pal[2]));
      blobs.forEach(([x, y, rr]) => { circ(x - rr * 0.4, y - rr * 0.45, rr * 0.22, pal[3]); });
      for (let i = 0; i < 26; i++) { const x = 4 + r() * 22 | 0, y = 3 + r() * 24 | 0; const b = blobs.some(([bx, by2, rr]) => Math.hypot(x - bx, y - by2) < rr - 1.5); if (b) { px(x, y, i % 3 ? pal[0] : pal[3]); } }
      if (kind === 'oak' && v === 2) [[9, 13], [19, 11], [14, 19], [22, 17]].forEach(([x, y]) => { px(x, y, '#e8402a'); px(x, y - 1, '#ff8a6a'); });

    } else if (kind === 'pine') {
      P(cx - 2, by - 8, 4, 8, '#6a4628'); P(cx - 2, by - 8, 1, 8, '#8a5e36');
      const tiers = [[34, 12], [26, 10], [18, 8], [11, 5.5]];
      tiers.forEach(([y, w], i) => { poly([[cx - w - 1, y + 1], [cx, y - 12], [cx + w + 1, y + 1]], '#1f4f3a'); poly([[cx - w, y], [cx, y - 12], [cx + w, y]], '#2e6a4c'); poly([[cx - w, y], [cx, y - 12], [cx - 1, y]], '#3b7e5a'); poly([[cx - w * 0.7, y - 4], [cx, y - 12], [cx + w * 0.5, y - 5]], '#f4f8fc'); });
      px(cx, 1, '#fff');
    } else if (kind === 'dead') {
      P(cx - 2, by - 22, 4, 22, '#6a5a48'); P(cx - 2, by - 22, 1, 22, '#857360');
      const br = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 2, 2, '#6a5a48'); };
      br(cx, by - 18, cx - 9, by - 28); br(cx, by - 14, cx + 9, by - 24); br(cx - 6, by - 25, cx - 8, by - 34); br(cx + 6, by - 21, cx + 10, by - 30); br(cx, by - 22, cx + 1, by - 35);
      poly([[cx - 5, by], [cx - 2, by - 4], [cx + 2, by - 4], [cx + 5, by]], '#6a5a48');
    } else if (kind === 'cactus') {
      const C = '#4e9a46', Cd = '#3a7a34', Cl = '#6cb85e';
      P(cx - 3, by - 24, 6, 24, C); circ(cx, by - 24, 3, C); P(cx - 3, by - 24, 1.5, 24, Cl); P(cx + 1.5, by - 24, 1.5, 24, Cd);
      P(cx - 9, by - 16, 3, 9, C); circ(cx - 7.5, by - 16, 1.5, C); P(cx - 9, by - 8, 7, 3, C); P(cx - 9, by - 16, 1, 9, Cl);
      P(cx + 6, by - 20, 3, 8, C); circ(cx + 7.5, by - 20, 1.5, C); P(cx + 2, by - 13, 7, 3, C); P(cx + 8, by - 20, 1, 8, Cd);
      for (let y = by - 22; y < by; y += 3) { px(cx - 1, y, '#e8f0c0'); px(cx + 1, y + 1, '#e8f0c0'); }
      if (v % 2) { circ(cx, by - 27, 1.8, '#ff6a9a'); px(cx, by - 27, '#ffe14a'); }
    }
  });
  crisp(s); outline1(s, kind === 'pine' ? '#16302a' : kind === 'cactus' ? '#22401e' : kind === 'dead' ? '#2a2420' : '#22401a');
  // 그림자 (나무 뒤 바닥)
  const sh = mk(W, H), sg = sh.getContext('2d'); sg.fillStyle = 'rgba(20,40,10,.28)'; sg.fillRect(0, 0, 0, 0);
  const rx = kind === 'oak' || kind === 'dark' ? 11 : 7; for (let y = -2; y <= 2; y++) { const w = Math.round(rx * Math.sqrt(1 - (y / 2.6) ** 2)); sg.fillRect(15 - w, 41 + y, w * 2, 1); }
  sg.drawImage(s, 0, 0);
  c = up2(sh); treeCache.set(key, c); return c;
}
function treeKindOf(id, under) { return id === T.PINE ? 'pine' : id === T.DEADTREE ? 'dead' : id === T.CACTUS ? 'cactus' : under === 'f' ? 'dark' : under === 's' ? 'pine' : under === 'd' ? 'cactus' : under === 'w' || under === 'v' ? 'dead' : 'oak'; }
function drawTreeAt(id, x, y, sx, sy, under) {
  const v = ((x * 7 + y * 13) ^ (x * y)) & 3; const img = treeSprite(treeKindOf(id, under), v, under || 'g');
  ctx.drawImage(img, x * TS + 16 - 30 - sx, (y + 1) * TS - 82 - sy);
}

MINI_COL[T.BARS] = '#5a5a66'; MINI_COL[T.RUINWALL] = '#7a7468';
TALL.add(T.RUINWALL);

// ── 보물상자 ──
const chestCache = new Map();
function chestSprite(t, open) {
  const key = t + '|' + open; let c = chestCache.get(key); if (c) return c;
  const s = lowres(16, 16, ({ P, px }) => {
    const wood = t >= 5 ? '#4a2a6a' : t === 4 ? '#8a5a20' : '#8a5a2a', woodl = t >= 5 ? '#6a3a9a' : t === 4 ? '#b07a30' : '#b07a42', band = t >= 5 ? '#ffb84a' : t >= 4 ? '#ffd84a' : t === 3 ? '#9aa4b0' : '#5a3a1a';
    P(1, 14, 14, 2, '#0003');
    if (!open) {
      P(2, 6, 12, 9, wood); P(2, 6, 12, 1, woodl); P(2, 3, 12, 4, woodl); P(3, 2, 10, 1, woodl); P(2, 6.5, 12, 0.5, '#2a1a10');
      P(2, 3, 1.5, 12, band); P(12.5, 3, 1.5, 12, band); if (t >= 3) P(2, 10, 12, 1, band);
      P(7, 6, 2, 3, t >= 4 ? '#fff0a0' : '#d8b040'); px(7.5, 8, '#2a1a10');
    } else {
      P(2, 8, 12, 7, wood); P(2, 8, 12, 1, '#1a100a'); P(3, 9, 10, 2, '#2a1a10');
      P(2, 2, 12, 5, woodl); P(2, 2, 12, 1, wood); P(2, 2, 1.5, 5, band); P(12.5, 2, 1.5, 5, band);
      P(2, 8, 1.5, 7, band); P(12.5, 8, 1.5, 7, band);
    }
  });
  crisp(s); outline1(s, '#1a120c'); c = up2(s); chestCache.set(key, c); return c;
}
function drawChest(ch, sx, sy, now) {
  const x = ch.x * TS - sx, y = ch.y * TS - sy; if (x < -40 || y < -40 || x > W + 40 || y > H + 40) return;
  if (ch.L && !ch.o) { const pr = 0.35 + Math.sin(now / 300) * 0.2; const gr = ctx.createRadialGradient(x + 16, y + 18, 2, x + 16, y + 18, 30); gr.addColorStop(0, `rgba(255,120,60,${pr})`); gr.addColorStop(1, 'rgba(255,80,40,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 16, y - 14, 64, 64); }
  ctx.drawImage(chestSprite(ch.t, ch.o), x, y);
}
function drawChestSpark(ch, sx, sy, now) {
  const x = ch.x * TS - sx, y = ch.y * TS - sy; if (x < -40 || y < -40 || x > W + 40 || y > H + 40) return;
  if (!ch.o) { const d = Math.hypot(ch.x - pos.x, ch.y - pos.y); if (d < 7 || ch.t >= 4) { for (let i = 0; i < 3; i++) { const k = ((now / 700) + i / 3) % 1; const a = i * 2.1 + now / 900; const px_ = x + 16 + Math.cos(a) * 12, py_ = y + 10 - k * 18; ctx.globalAlpha = 1 - k; ctx.fillStyle = ch.L ? '#ffb070' : '#fff6c0'; ctx.fillRect(px_ - 1, py_ - 3, 2, 6); ctx.fillRect(px_ - 3, py_ - 1, 6, 2); } ctx.globalAlpha = 1; } }
}

// ═══════ 배경 v3: 마을 건물 · 분수 · 성벽 장식 ═══════
const bldCache = new Map();
const BLD_KIND = { '잡화상': 'shop', '장비상': 'gear', '대장간': 'smith', '마구간': 'stable', '전직관': 'master', '창고': 'bank' };
function buildingSprite(kind, rc) {
  const key = kind + rc; let c = bldCache.get(key); if (c) return c;
  const s = lowres(80, 82, A => {
    const { P, px, circ, ell, poly } = A;
    const rD = shade(rc, -0.3), rDD = shade(rc, -0.5), rL = shade(rc, 0.22);
    const wall = kind === 'smith' ? '#b8a890' : '#e4c890', wallD = shade(wall, -0.18), beam = '#6a4424', beamL = '#8a5a30';
    // 벽
    P(3, 44, 74, 33, wall); P(3, 44, 74, 4, wallD);
    for (const x of [3, 21, 39.5, 58, 75]) { P(x, 44, 2.5, 33, beam); P(x, 44, 0.8, 33, beamL); }
    P(3, 59, 74, 2, beam); P(3, 59, 74, 0.6, beamL);
    // 주춧돌
    for (let x = 2; x < 78; x += 6) { P(x, 76, 5.5, 5, (x / 6) % 2 ? '#9a948a' : '#8a847a'); P(x, 76, 5.5, 0.8, '#b8b2a6'); }
    // 창문 (따뜻한 불빛)
    const win = (x, y) => { P(x - 1, y - 1, 14, 13, '#5a3a1e'); P(x, y, 12, 11, '#ffd46a'); P(x, y, 12, 4, '#ffe8a0'); P(x + 5.5, y, 1, 11, '#7a4a24'); P(x, y + 5, 12, 1, '#7a4a24'); P(x - 2, y + 11, 16, 3, '#8a5a2a'); [[x, '#ff6a8a'], [x + 3, '#ffffff'], [x + 6, '#ffd84a'], [x + 9, '#ff6a8a'], [x + 11, '#b48aff']].forEach(([fx, fc]) => { circ(fx + 0.5, y + 11, 1.2, '#4a8a34'); px(fx, y + 10, fc); }); };
    if (kind === 'stable') {
      P(8, 50, 26, 26, '#3a2414'); P(9, 51, 24, 25, '#5a3a1e'); for (let x = 9; x < 33; x += 4) P(x, 51, 0.8, 25, '#4a2e18');
      ell(21, 70, 8, 5, '#e8c050'); ell(19, 67, 5, 3, '#f8d870'); P(13, 60, 5, 8, '#c8a070'); P(14, 56, 6, 5, '#d8b080'); px(16, 57, '#2a1a10');
      win(52, 50);
    } else if (kind === 'smith') {
      P(46, 50, 26, 24, '#3a2a24'); ell(59, 66, 9, 7, '#ff8a2a'); ell(59, 68, 6, 4, '#ffd04a'); P(48, 50, 22, 3, '#2a1a14');
      win(9, 50);
      P(26, 70, 10, 3, '#4a4a54'); P(28, 67, 6, 3, '#6a6a76'); P(24, 66, 14, 2, '#7a7a86');
    } else win(8, 50), win(58, 50);
    // 문
    if (kind !== 'stable') {
      P(33, 52, 14, 25, '#4a2e18'); ell(40, 53, 7, 4, '#4a2e18'); P(34.5, 53, 11, 24, '#8a5a30'); ell(40, 53.5, 5.5, 3, '#8a5a30');
      for (let x = 35; x < 45; x += 3) P(x, 53, 0.7, 24, '#6a4424'); circ(43.5, 66, 1, '#ffd84a'); P(31, 77, 18, 3, '#a8a296');
    }
    // 차양 (잡화상)
    if (kind === 'shop') { for (let i = 0; i < 8; i++) P(6 + i * 2, 47, 2, 4, i % 2 ? '#ffffff' : '#d8402a'); for (let i = 0; i < 8; i++) P(56 + i * 2, 47, 2, 4, i % 2 ? '#ffffff' : '#d8402a'); P(6, 51, 16, 1, '#a02a1a'); P(56, 51, 16, 1, '#a02a1a'); }
    if (kind === 'bank') { [[56, 60], [62, 58], [60, 64]].forEach(([x, y]) => { P(x, y, 6, 5, '#a87a42'); P(x, y, 6, 1, '#c89a5a'); P(x + 2.5, y, 1, 5, '#7a5228'); }); }
    // 지붕
    poly([[-1, 47], [81, 47], [71, 13], [9, 13]], rD);
    poly([[0, 45], [80, 45], [70, 14], [10, 14]], rc);
    for (let y = 16; y < 45; y += 4) { const t = (y - 14) / 31, x0 = 10 - t * 10, x1 = 70 + t * 10; P(x0, y + 2.6, x1 - x0, 1.2, rD); for (let x = x0 + ((y / 4) % 2) * 3; x < x1; x += 6) P(x, y, 1, 2.6, rDD); P(x0, y, x1 - x0, 0.6, rL); }
    P(9, 12, 62, 3, rDD); P(9, 12, 62, 1, rL);
    // 박공 (가운데 앞쪽 삼각 지붕)
    poly([[26, 47], [54, 47], [40, 27]], rDD); poly([[28, 45], [52, 45], [40, 29]], wall); P(39.2, 31, 1.6, 14, beam); P(30, 41, 20, 1.5, beam);
    poly([[24, 47.5], [27, 47.5], [41, 26], [39, 25]], rc); poly([[56, 47.5], [53, 47.5], [39, 26], [41, 25]], rD);
    // 간판
    P(32, 33, 16, 9, '#7a4a24'); P(33, 34, 14, 7, '#b88a54'); P(33, 34, 14, 1, '#d0a46a');
    const icx = 40, icy = 37.5;
    if (kind === 'shop') { P(icx - 1, icy - 3, 2, 1.5, '#c8b080'); ell(icx, icy + 0.5, 2.6, 2.4, '#e8303a'); px(icx - 1, icy, '#ffc0c0'); }
    if (kind === 'gear') { poly([[icx - 3, icy - 3], [icx + 3, icy - 3], [icx + 3, icy], [icx, icy + 3.5], [icx - 3, icy]], '#4a6ad8'); P(icx - 0.5, icy - 2.5, 1, 5, '#ffd84a'); P(icx - 2.5, icy - 1, 5, 1, '#ffd84a'); }
    if (kind === 'smith') { P(icx - 4, icy - 1, 8, 2, '#4a4a54'); P(icx - 2, icy + 1, 4, 2, '#4a4a54'); P(icx - 4, icy - 1, 8, 0.6, '#8a8a96'); }
    if (kind === 'stable') { ell(icx, icy, 3, 3.2, '#6a6a76'); ell(icx, icy + 0.8, 1.6, 2.4, '#b88a54'); }
    if (kind === 'master') { P(icx - 4, icy - 2.5, 3.8, 5, '#f4ecd8'); P(icx + 0.2, icy - 2.5, 3.8, 5, '#e8dcc0'); P(icx - 0.2, icy - 3, 0.6, 6, '#8a3ad8'); }
    if (kind === 'bank') { circ(icx, icy, 3, '#e8b830'); circ(icx, icy, 1.8, '#f8d860'); P(icx - 0.4, icy - 1.5, 0.8, 3, '#a87a20'); }
    // 굴뚝
    P(58, 2, 8, 16, '#8a7a6a'); P(58, 2, 8, 2, '#a89a8a'); P(57, 1, 10, 2, '#6a5a4a'); for (let y = 5; y < 17; y += 4) P(58, y, 8, 0.6, '#6a5a4a');
    // 처마 그림자
    P(3, 47, 74, 2, 'rgba(40,20,10,.35)');
  });
  crisp(s, 60); outline1(s, '#2a1810'); c = up2(s); bldCache.set(key, c); return c;
}
function drawBuilding(l, sx, sy, now) {
  const kind = BLD_KIND[l.text]; if (!kind) return;
  const x = l.bx * TS - sx, y = l.by * TS - sy;
  if (x < -200 || y < -220 || x > W + 40 || y > H + 40) return;
  ctx.drawImage(buildingSprite(kind, l.roofC), x, y - 36);
  if (kind === 'smith' || kind === 'bank' || kind === 'master') { for (let i = 0; i < 3; i++) { const k = ((now / 1800) + i / 3) % 1; ctx.globalAlpha = 0.45 * (1 - k); ctx.fillStyle = '#e8e8ee'; ctx.beginPath(); ctx.arc(x + 124 + Math.sin(k * 6 + i) * 6, y - 34 - k * 40, 4 + k * 8, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
}
// 분수 (마을 중앙)
const fountainImg = [0, 1].map(fr => { const s = lowres(48, 48, ({ P, px, circ, ell, poly }) => {
  poly([[12, 6], [36, 6], [44, 14], [44, 34], [36, 42], [12, 42], [4, 34], [4, 14]], '#8a847a');
  poly([[13, 9], [35, 9], [41, 15], [41, 33], [35, 39], [13, 39], [7, 33], [7, 15]], '#4a94dc');
  for (let i = 0; i < 5; i++) P(10 + i * 6 + fr * 2, 18 + (i % 2) * 10, 4, 1, '#8cc8f8');
  P(4, 14, 40, 1, '#b4ae a4'.replace(' ', '')); ell(24, 24, 5, 5, '#a8a296'); ell(24, 23, 4, 4, '#c8c2b6'); P(22.5, 12, 3, 12, '#b8b2a6'); ell(24, 12, 4, 2, '#c8c2b6');
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + fr * 0.5; px(24 + Math.cos(a) * (5 + fr), 9 + Math.sin(a) * 2 + fr, '#e8f6ff'); } circ(24, 8 - fr, 1.6, '#cfeaff');
}); crisp(s, 60); outline1(s, '#2a2420'); return up2(s); });
function drawFountain(x, y, sx, sy, now) { ctx.drawImage(fountainImg[(now / 400 | 0) % 2], x * TS + 16 - 48 - sx, y * TS + 16 - 48 - sy); }
// 성벽 위 총안
const crenImg = (() => { const s = lowres(16, 6, ({ P }) => { for (const x of [0, 8]) { P(x + 1, 0, 6, 6, '#b4ac9c'); P(x + 1, 0, 6, 1, '#d0c8b8'); P(x + 6, 0, 1, 6, '#8a8274'); } }); outline1(s, '#4a4438'); return up2(s); })();
