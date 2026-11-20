// ═══════════════════════════════════════════════════════════
//  바람의 대륙 - 게임 엔진 (Node 서버 / 브라우저 호스트 공용)
// ═══════════════════════════════════════════════════════════
(function () {
const D = typeof GD !== 'undefined' ? GD : require('./data.js');
const T = D.T;
const ENV = (typeof process !== 'undefined' && process.env) || {};
function b64(u8) { if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64'); let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = Math.random;
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const DIRS = [[0, 1], [-1, 0], [1, 0], [0, -1]]; // 0아래 1왼 2오 3위
let UID = 1; const uid = () => (UID++).toString(36) + Math.floor(R() * 1e6).toString(36);

// ═══════════════ 월드 생성 ═══════════════
const MAPS = {};
const PLOTS = [];
function newMap(id, name, w, h, fill, o = {}) {
  const m = Object.assign({ id, name, w, h, t: new Uint8Array(w * h).fill(fill), portals: {}, npcs: [], labels: [], lights: [], towns: [], zones: [], mons: new Map(), drops: new Map(), occ: new Map(), tents: [], fx: [], dark: 0, bossPts: [] }, o);
  MAPS[id] = m; return m;
}
const gt = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? T.ROCK : m.t[y * m.w + x];
const st = (m, x, y, v) => { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.t[y * m.w + x] = v; };
function fillRect(m, x0, y0, x1, y1, v) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) st(m, x, y, v); }

// 부드러운 노이즈
function noise2(seed) {
  const r = rng(seed); const P = []; for (let i = 0; i < 4096; i++) P.push(r());
  const h = (x, y) => P[((x * 73856093) ^ (y * 19349663)) & 4095];
  const sm = t => t * t * (3 - 2 * t);
  return (x, y, s) => { x /= s; y /= s; const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
}

const WW = 240, WH = 240;
const DUNGEONS = [
  { id: 'bat', name: '박쥐동굴', type: 'cave', ent: [196, 124], lv: '8~16', floors: [['bat', 'caveSpider'], ['caveSpider', 'snake', 'bat'], ['snake', 'vampBat']], boss: 'spiderQueen', every: 15, off: 0, pal: 0 },
  { id: 'skull', name: '해골굴', type: 'cave', ent: [30, 110], lv: '17~26', floors: [['skeleton', 'skelArcher'], ['skelArcher', 'ghoul', 'skeleton'], ['ghoul', 'skelKnight']], boss: 'skelKing', every: 15, off: 5, pal: 1 },
  { id: 'mine', name: '망령광산', type: 'cave', ent: [196, 206], lv: '24~34', floors: [['zombie', 'minerZombie'], ['minerZombie', 'wraith'], ['wraith', 'rotGolem']], boss: 'corpseLord', every: 20, off: 10, pal: 2 },
  { id: 'dok', name: '도깨비굴', type: 'cave', ent: [52, 40], lv: '31~41', floors: [['dokkaebi', 'oneEye'], ['oneEye', 'gumiho'], ['gumiho', 'fireDokkaebi']], boss: 'dokkaebiKing', every: 20, off: 0, pal: 3 },
  { id: 'obs', name: '흑요성', type: 'castle', ent: [196, 30], lv: '38~48', floors: [['darkKnight', 'gargoyle'], ['gargoyle', 'lich'], ['lich', 'darkMage'], ['darkMage', 'deathKnight']], boss: 'blackCommander', every: 30, off: 15, pal: 0 },
  { id: 'demon', name: '마왕성', type: 'castle', ent: [30, 214], lv: '45~55', floors: [['imp', 'demon'], ['demon', 'hellhound'], ['hellhound', 'wyvern'], ['wyvern', 'demonGeneral'], ['demonGeneral', 'ancientDragon']], boss: 'demonLord', every: 30, off: 0, pal: 1 },
];
const FIELD_BOSSES = [
  { mon: 'bearKing', map: 'world', x: 208, y: 152, every: 10, off: 2, where: '늑대숲 깊은 곳' },
  { mon: 'scorpionKing', map: 'world', x: 150, y: 226, every: 10, off: 7, where: '남쪽 사막' },
  { mon: 'yetiKing', map: 'world', x: 86, y: 22, every: 15, off: 8, where: '북쪽 설원' },
];
const BOSSES = [...FIELD_BOSSES];

function biomeAt(n, x, y) {
  const px = x + (n(x, y, 18) - 0.5) * 20, py = y + (n(x + 999, y + 333, 18) - 0.5) * 20;
  if (py < 62) return 'snow';
  if (py > 182 && px < 72) return 'volcano';
  if (py > 182) return 'desert';
  if (px < 62) return 'swamp';
  if (px > 172) return 'forest';
  return 'grass';
}

function genWorld() {
  const m = newMap('world', '바람의 대륙', WW, WH, T.GRASS);
  const r = rng(20261119), n = noise2(77);
  m.biome = new Array(WW * WH);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    const b = biomeAt(n, x, y); m.biome[y * WW + x] = b;
    const v = r(), nn = n(x, y, 7);
    let t = T.GRASS;
    if (b === 'grass') t = v < 0.035 ? T.TREE : v < 0.09 ? T.FLOWER : T.GRASS;
    else if (b === 'forest') t = (nn > 0.45 && v < 0.33) || v < 0.08 ? T.TREE : v < 0.14 ? T.FLOWER : T.FOREST;
    else if (b === 'desert') t = v < 0.025 ? T.CACTUS : v < 0.035 ? T.ROCK : T.SAND;
    else if (b === 'snow') t = (nn > 0.55 && v < 0.3) || v < 0.04 ? T.PINE : T.SNOW;
    else if (b === 'swamp') t = nn > 0.68 ? T.WATER : v < 0.06 ? T.DEADTREE : T.SWAMP;
    else if (b === 'volcano') t = nn > 0.7 ? T.LAVA : v < 0.05 ? T.ROCK : T.ASH;
    m.t[y * WW + x] = t;
  }
  // 강
  let rx = 150;
  for (let y = 62; y < 185; y++) { rx += Math.round((n(5, y, 9) - 0.5) * 2.2); rx = clamp(rx, 140, 165); for (let k = -1; k <= 1; k++) st(m, rx + k, y, T.WATER); }
  // 테두리
  for (let i = 0; i < WW; i++) for (let k = 0; k < 3; k++) { st(m, i, k, T.ROCK); st(m, i, WH - 1 - k, T.ROCK); st(m, k, i, T.ROCK); st(m, WW - 1 - k, i, T.ROCK); }

  // 마을
  const t1 = makeTown(m, 116, 124, 34, 26, '청풍마을', 0);
  const t2 = makeTown(m, 128, 214, 26, 18, '모래바람촌', 1);
  const t3 = makeTown(m, 122, 30, 28, 20, '백설성', 2);
  // 길
  const road = (a, b) => {
    let [x, y] = a;
    const step = (tx, ty) => { while (x !== tx || y !== ty) { if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y); for (let k = 0; k < 2; k++) { const xx = x + (y === ty ? 0 : k), yy = y + (y === ty ? k : 0); const c = gt(m, xx, yy); if (c === T.WATER || c === T.LAVA) st(m, xx, yy, T.BRIDGE); else if (c !== T.STONE && c !== T.WALL && c !== T.HOUSE && c !== T.ROOF && c !== T.CAVEDOOR && c !== T.GATE) st(m, xx, yy, T.ROAD); } } };
    step(b[0], a[1]); step(b[0], b[1]);
  };
  road(t1.gates.s, t2.gates.n); road(t1.gates.n, t3.gates.s);
  road(t1.gates.e, [196, 128]); road(t1.gates.w, [30, 114]);
  road(t2.gates.e, [196, 210]); road(t3.gates.w, [52, 44]); road(t3.gates.e, [196, 34]); road(t2.gates.w, [30, 218]);
  // 던전 입구
  for (const d of DUNGEONS) {
    const [ex, ey] = d.ent;
    fillRect(m, ex - 3, ey - 3, ex + 3, ey + 1, T.ROCK);
    fillRect(m, ex - 2, ey + 2, ex + 2, ey + 3, d.type === 'cave' ? T.ROAD : T.STONE);
    if (d.type === 'castle') { fillRect(m, ex - 4, ey - 4, ex + 4, ey + 1, T.CASTLEWALL); }
    st(m, ex, ey + 1, d.type === 'cave' ? T.CAVEDOOR : T.GATE);
    m.labels.push({ x: ex, y: ey - (d.type === 'castle' ? 5 : 4), text: `${d.name} (Lv${d.lv})`, c: d.type === 'castle' ? '#ff8a8a' : '#ffd27a' });
    m.lights.push({ x: ex - 2, y: ey + 2, r: 4 }, { x: ex + 2, y: ey + 2, r: 4 });
    d.entPos = { x: ex, y: ey + 2 };
  }
  // 사냥터 표지
  const signs = [[100, 104, '초원 (Lv1~6)'], [190, 90, '늑대숲 (Lv6~14)'], [130, 196, '사막 (Lv14~18)'], [36, 140, '독안개 늪 (Lv19~24)'], [80, 52, '설원 (Lv20~25)'], [45, 190, '화산지대 (Lv42~49)']];
  signs.forEach(([x, y, s]) => m.labels.push({ x, y, text: s, c: '#e8ffd0' }));
  // 사냥터 구역
  m.zones = [
    { x0: 80, y0: 96, x1: 98, y1: 152, mons: ['squirrel', 'rabbit', 'rat'], cap: 26 },
    { x0: 134, y0: 96, x1: 148, y1: 152, mons: ['rabbit', 'rat', 'sheep'], cap: 20 },
    { x0: 84, y0: 140, x1: 168, y1: 180, mons: ['sheep', 'fox', 'rat', 'rabbit'], cap: 34 },
    { x0: 84, y0: 64, x1: 168, y1: 108, mons: ['squirrel', 'sheep', 'fox'], cap: 30 },
    { x0: 172, y0: 64, x1: 236, y1: 118, mons: ['fox', 'wolf', 'boar'], cap: 40 },
    { x0: 172, y0: 120, x1: 236, y1: 180, mons: ['wolf', 'boar', 'treant', 'bear'], cap: 46 },
    { x0: 84, y0: 186, x1: 236, y1: 236, mons: ['scorpion', 'lizard', 'sandGolem'], cap: 46 },
    { x0: 4, y0: 64, x1: 60, y1: 180, mons: ['toad', 'swampSlime', 'lizardman'], cap: 46 },
    { x0: 4, y0: 4, x1: 100, y1: 58, mons: ['snowWolf', 'iceSlime', 'yeti'], cap: 40 },
    { x0: 144, y0: 4, x1: 236, y1: 58, mons: ['snowWolf', 'yeti', 'iceSlime'], cap: 34 },
    { x0: 4, y0: 186, x1: 70, y1: 236, mons: ['fireSlime', 'imp', 'hellhound'], cap: 36 },
  ];
  m.spawn = t1.spawn;
  // 필드 보스 자리 정리
  FIELD_BOSSES.forEach(b => { fillRect(m, b.x - 2, b.y - 2, b.x + 2, b.y + 2, m.biome[b.y * WW + b.x] === 'desert' ? T.SAND : m.biome[b.y * WW + b.x] === 'snow' ? T.SNOW : T.FOREST); });
}

function makeTown(m, cx, cy, w, h, name, style) {
  const x0 = cx - (w >> 1), y0 = cy - (h >> 1), x1 = x0 + w - 1, y1 = y0 + h - 1;
  fillRect(m, x0 - 2, y0 - 2, x1 + 2, y1 + 2, style === 1 ? T.SAND : style === 2 ? T.SNOW : T.GRASS);
  fillRect(m, x0, y0, x1, y1, T.STONE);
  for (let x = x0; x <= x1; x++) { st(m, x, y0, T.WALL); st(m, x, y1, T.WALL); }
  for (let y = y0; y <= y1; y++) { st(m, x0, y, T.WALL); st(m, x1, y, T.WALL); }
  const gates = { n: [cx, y0 - 3], s: [cx, y1 + 3], w: [x0 - 3, cy], e: [x1 + 3, cy] };
  for (let k = -1; k <= 1; k++) { st(m, cx + k, y0, T.ROAD); st(m, cx + k, y1, T.ROAD); st(m, x0, cy + k, T.ROAD); st(m, x1, cy + k, T.ROAD); }
  // 중앙 십자 길
  fillRect(m, cx - 1, y0 + 1, cx + 1, y1 - 1, T.ROAD); fillRect(m, x0 + 1, cy - 1, x1 - 1, cy + 1, T.ROAD);
  // 분수
  fillRect(m, cx - 1, cy - 1, cx + 1, cy + 1, T.STONE); st(m, cx, cy, T.WATER);
  // 건물 + NPC
  const B = [
    { npc: 'shop', name: '잡화상 옥분', label: '잡화상', dx: -11, dy: -9, c: '#d9534f' },
    { npc: 'gear', name: '장비상 철수', label: '장비상', dx: -4, dy: -9, c: '#5b8fd9' },
    { npc: 'smith', name: '대장장이 강쇠', label: '대장간', dx: 5, dy: -9, c: '#c97a2a' },
    { npc: 'stable', name: '마구간지기 돌이', label: '마구간', dx: -11, dy: 4, c: '#8a6a3a' },
    { npc: 'master', name: '전직교관 무영', label: '전직관', dx: 5, dy: 4, c: '#9a5ad9' },
  ];
  const sx = (w - 4) / 34, sy = (h - 4) / 26;
  for (const b of B) {
    const bx = cx + Math.round(b.dx * sx), by = cy + Math.round(b.dy * sy);
    fillRect(m, bx, by, bx + 4, by + 1, T.ROOF); fillRect(m, bx, by + 2, bx + 4, by + 3, T.HOUSE);
    const nx = bx + 2, ny = by + 4;
    st(m, nx, ny, T.STONE);
    m.npcs.push({ id: m.npcs.length + 1, kind: b.npc, name: b.name, x: nx, y: ny, c: b.c, style });
    m.labels.push({ x: bx + 2, y: by - 1, text: b.label, c: '#fff3c4', roofC: b.c, bx, by });
    m.lights.push({ x: nx - 1, y: ny, r: 4 });
  }
  m.npcs.push({ id: m.npcs.length + 1, kind: 'guide', name: '안내원 바람이', x: cx + 3, y: cy + 3, c: '#3aa86a', style });
  m.labels.push({ x: cx, y: y0 - 2, text: name, c: '#ffffff', big: 1 });
  m.lights.push({ x: cx, y: cy, r: 6 }, { x: cx - 2, y: y0 + 1, r: 3 }, { x: cx + 2, y: y1 - 1, r: 3 });
  const town = { name, x0, y0, x1, y1, spawn: { x: cx + 2, y: cy + 2 }, gates };
  m.towns.push(town);
  // 주택가 (공터를 사서 집을 지음) — 마을 서쪽
  const dx0 = x0 - 3 - 31, dy1 = cy - 3, dy0 = dy1 - 18;
  fillRect(m, dx0, dy0, dx0 + 31, dy1, T.ROAD);
  for (let x = dx0; x <= dx0 + 31; x++) { if (x % 6) { st(m, x, dy0, T.FENCE); } }
  for (let y = dy0; y <= dy1; y++) st(m, dx0, y, T.FENCE);
  m.towns.push({ name: name + ' 주택가', x0: dx0, y0: dy0, x1: dx0 + 31, y1: dy1, district: 1 });
  m.labels.push({ x: dx0 + 15, y: dy0 - 1, text: name + ' 주택가', c: '#d8ffd0' });
  const price = [8000, 12000, 15000][style];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const px = dx0 + 2 + c * 10, py = dy0 + 1 + r * 9;
    fillRect(m, px, py, px + 8, py + 6, T.GRASS);
    PLOTS.push({ id: PLOTS.length + 1, map: m.id, x: px, y: py, sx: px + 4, sy: py + 7, price, town: name, owner: null });
    m.lights.push({ x: px + 4, y: py + 7, r: 3 });
  }
  return town;
}

// 동굴 층 생성
function genCave(id, name, seed, pal) {
  const W = 66, H = 66, r = rng(seed);
  const m = newMap(id, name, W, H, T.CAVEWALL, { dark: 1, pal });
  let x = 8, y = 8; const target = W * H * 0.42; let open = 0;
  const carve = (a, b) => { for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) { const xx = a + dx, yy = b + dy; if (xx > 1 && yy > 1 && xx < W - 2 && yy < H - 2 && gt(m, xx, yy) === T.CAVEWALL) { st(m, xx, yy, T.CAVE); open++; } } };
  let guard = 0;
  while (open < target && guard++ < 200000) { carve(x, y); const d = DIRS[Math.floor(r() * 4)]; x = clamp(x + d[0], 2, W - 4); y = clamp(y + d[1], 2, H - 4); if (r() < 0.004) { x = 8 + Math.floor(r() * (W - 16)); y = 8 + Math.floor(r() * (H - 16)); carve(x, y); } }
  // 연결성: 시작점 BFS
  const reach = bfs(m, 8, 8);
  for (let i = 0; i < W * H; i++) if (m.t[i] === T.CAVE && !reach.has(i)) m.t[i] = T.CAVEWALL;
  // 가장 먼 지점
  let far = 8 * W + 8, fd = 0; for (const [k, v] of reach) if (v > fd) { fd = v; far = k; }
  m.up = { x: 8, y: 8 }; m.down = { x: far % W, y: Math.floor(far / W) };
  return m;
}
// 성 층 생성
function genCastle(id, name, seed, pal) {
  const W = 64, H = 64, r = rng(seed);
  const m = newMap(id, name, W, H, T.CASTLEWALL, { dark: 0.6, pal, castle: 1 });
  const rooms = [];
  for (let i = 0; i < 300 && rooms.length < 13; i++) {
    const w = 7 + Math.floor(r() * 8), h = 6 + Math.floor(r() * 7), x = 2 + Math.floor(r() * (W - w - 4)), y = 2 + Math.floor(r() * (H - h - 4));
    if (rooms.some(o => x < o.x + o.w + 2 && x + w + 2 > o.x && y < o.y + o.h + 2 && y + h + 2 > o.y)) continue;
    rooms.push({ x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) });
  }
  rooms.sort((a, b) => (a.cx + a.cy) - (b.cx + b.cy));
  rooms.forEach((o, i) => { fillRect(m, o.x, o.y, o.x + o.w - 1, o.y + o.h - 1, T.CASTLE); if (i % 2 === 0) fillRect(m, o.cx - 1, o.y + 1, o.cx + 1, o.y + o.h - 2, T.CARPET); m.lights.push({ x: o.x + 1, y: o.y + 1, r: 4 }, { x: o.x + o.w - 2, y: o.y + 1, r: 4 }); });
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1], b = rooms[i];
    let x = a.cx, y = a.cy;
    while (x !== b.cx) { fillRect(m, x, y, x, y + 1, gt(m, x, y) === T.CARPET ? T.CARPET : T.CASTLE); x += Math.sign(b.cx - x); }
    while (y !== b.cy) { fillRect(m, x, y, x + 1, y, gt(m, x, y) === T.CARPET ? T.CARPET : T.CASTLE); y += Math.sign(b.cy - y); }
  }
  m.rooms = rooms;
  m.up = { x: rooms[0].cx, y: rooms[0].cy }; const last = rooms[rooms.length - 1]; m.down = { x: last.cx, y: last.cy };
  return m;
}
function bfs(m, sx, sy) {
  const seen = new Map(); const q = [sy * m.w + sx]; seen.set(q[0], 0);
  for (let i = 0; i < q.length; i++) { const k = q[i], x = k % m.w, y = Math.floor(k / m.w), d = seen.get(k);
    for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, nk = ny * m.w + nx; if (!seen.has(nk) && !D.BLOCK.has(gt(m, nx, ny)) && gt(m, nx, ny) !== T.CAVEWALL) { seen.set(nk, d + 1); q.push(nk); } } }
  return seen;
}
function nearFree(m, x, y, avoidPortal = true) {
  for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const nx = x + dx, ny = y + dy; if (walkable(m, nx, ny) && !(avoidPortal && m.portals[nx + ',' + ny])) return { x: nx, y: ny };
  }
  return { x, y };
}

function genDungeons() {
  const world = MAPS.world;
  DUNGEONS.forEach((d, di) => {
    const floors = [];
    d.floors.forEach((mons, fi) => {
      const id = d.id + (fi + 1), nm = `${d.name} ${fi + 1}층`;
      const m = d.type === 'cave' ? genCave(id, nm, 1000 + di * 50 + fi, d.pal) : genCastle(id, nm, 2000 + di * 50 + fi, d.pal);
      m.zones = [{ x0: 2, y0: 2, x1: m.w - 3, y1: m.h - 3, mons, cap: 26 + fi * 3 }];
      m.dungeon = d.id; m.floor = fi; m.exitTown = d.id;
      floors.push(m);
    });
    // 포탈 연결
    floors.forEach((m, fi) => {
      st(m, m.up.x, m.up.y, T.UP);
      if (fi === 0) m.portals[m.up.x + ',' + m.up.y] = { to: 'world', x: d.entPos.x, y: d.entPos.y + 1, label: '바깥으로' };
      else { const p = floors[fi - 1]; m.portals[m.up.x + ',' + m.up.y] = { to: p.id, x: p.down.x, y: p.down.y, near: 1, label: `${fi}층으로` }; }
      if (fi < floors.length - 1) { st(m, m.down.x, m.down.y, T.DOWN); const nx = floors[fi + 1]; m.portals[m.down.x + ',' + m.down.y] = { to: nx.id, x: nx.up.x, y: nx.up.y, near: 1, label: `${fi + 2}층으로` }; }
      else {
        // 보스방
        const bx = m.down.x, by = m.down.y;
        for (let yy = -5; yy <= 5; yy++) for (let xx = -5; xx <= 5; xx++) if (xx * xx + yy * yy <= 26) { const tx = clamp(bx + xx, 2, m.w - 3), ty = clamp(by + yy, 2, m.h - 3); st(m, tx, ty, d.type === 'cave' ? T.CAVE : T.CARPET); }
        m.bossPts.push({ x: bx, y: by }); m.lights.push({ x: bx, y: by, r: 7 });
        m.labels.push({ x: bx, y: by - 6, text: '☠ 보스 출현지', c: '#ff5a5a' });
        BOSSES.push({ mon: d.boss, map: m.id, x: bx, y: by, every: d.every, off: d.off, where: `${d.name} ${fi + 1}층` });
      }
      m.lights.push({ x: m.up.x, y: m.up.y, r: 4 });
    });
    const f1 = floors[0];
    world.portals[d.ent[0] + ',' + (d.ent[1] + 1)] = { to: f1.id, x: f1.up.x, y: f1.up.y, near: 1, label: d.name };
  });
}

genWorld(); genDungeons();
// ───── 지도(아틀라스) 정보 ─────
const ZONE_NAMES = ['초원 서쪽', '초원 동쪽', '남쪽 초원', '북쪽 초원', '늑대숲 북부', '늑대숲 남부', '남쪽 사막', '독안개 늪', '서쪽 설원', '동쪽 설원', '화산지대'];
MAPS.world.zones.forEach((z, i) => { z.name = ZONE_NAMES[i]; const lv = z.mons.map(k => D.MONS[k].lv); z.lv = Math.min(...lv) + '~' + Math.max(...lv); });
const ATLAS = {
  zones: MAPS.world.zones.map(z => ({ name: z.name, lv: z.lv, x0: z.x0, y0: z.y0, x1: z.x1, y1: z.y1, mons: z.mons })),
  dungeons: DUNGEONS.map(d => ({ name: d.name, type: d.type, lv: d.lv, x: d.ent[0], y: d.ent[1], floors: d.floors, boss: d.boss, every: d.every, off: d.off })),
  fieldBosses: FIELD_BOSSES.map(b => ({ mon: b.mon, x: b.x, y: b.y, where: b.where, every: b.every, off: b.off })),
  towns: MAPS.world.towns.filter(t => !t.district).map(t => ({ name: t.name, x: (t.x0 + t.x1) >> 1, y: (t.y0 + t.y1) >> 1 })),
  tiles: b64(MAPS.world.t),
};

// ═══════════════ 이동 가능 판정 ═══════════════
function tentAt(m, x, y) { for (const t of m.tents) if (x >= t.x && x < t.x + D.TENT_W && y >= t.y && y < t.y + D.TENT_H) return t; return null; }
function tentBlock(t, x, y) {
  const lx = x - t.x, ly = y - t.y;
  const f = t.furn.find(f => f.x === lx && f.y === ly);
  const wall = lx === 0 || lx === D.TENT_W - 1 || ly === 0 || ly === D.TENT_H - 1;
  if (wall) { if (f && f.k === 'door') return false; if (t.kind !== 'house' && ly === D.TENT_H - 1 && lx === (D.TENT_W >> 1)) return false; return true; }
  if (f && !D.WALK_FURN.has(f.k)) return true;
  return false;
}
function walkable(m, x, y) {
  const v = gt(m, x, y);
  const t = m.tents.length ? tentAt(m, x, y) : null;
  if (t) return !tentBlock(t, x, y) && (!D.BLOCK.has(v) || D.TENT_OVER.has(v));
  return !D.BLOCK.has(v);
}
function inTown(m, x, y) { return m.towns.some(t => x >= t.x0 && x <= t.x1 && y >= t.y0 && y <= t.y1); }
function safeTile(m, x, y) { return inTown(m, x, y) || !!tentAt(m, x, y); }
const occKey = (x, y) => x + ',' + y;
function occAdd(m, x, y) { const k = occKey(x, y); m.occ.set(k, (m.occ.get(k) || 0) + 1); }
function occDel(m, x, y) { const k = occKey(x, y); const v = (m.occ.get(k) || 1) - 1; if (v <= 0) m.occ.delete(k); else m.occ.set(k, v); }

// ═══════════════ 아이템 ═══════════════
function makeGear(job, slot, lvl, opts = {}) {
  lvl = clamp(Math.round(lvl), 1, 50);
  const tier = D.tierOf(lvl);
  let wt = null, name;
  if (slot === 'weapon') { wt = opts.wt || pick(Object.keys(D.WEAPONS).filter(k => D.WEAPONS[k].job === job)); name = D.TIER_PREFIX[tier] + ' ' + D.WEAPONS[wt].name; }
  else name = D.TIER_PREFIX[tier] + ' ' + D.GEAR[job][slot];
  const it = { k: 'gear', uid: uid(), job, slot, lvl, tier, wt, name, rar: 0, plus: 0, st: {}, shop: !!opts.shop };
  const q = opts.shop ? 0.85 : 1;
  if (slot === 'weapon') { it.st.atk = Math.round((5 + lvl * 2.3) * (D.WEAPONS[wt].m || 1) * q); if (D.WEAPONS[wt].mp) it.st.mp = Math.round(lvl * 1.5); }
  else { it.st.def = Math.max(1, Math.round((2 + lvl * 1.15) * D.SLOT_DEF_MUL[slot] * q)); if (slot === 'armor') it.st.hp = Math.round(lvl * 2.5 * q); }
  if (!opts.shop) {
    const luck = opts.luck || 0; let roll = R() * 100 - luck * 0.5 - (opts.bonus || 0);
    it.rar = roll < 2.5 ? 3 : roll < 12 ? 2 : roll < 38 ? 1 : 0;
    if (opts.minRar) it.rar = Math.max(it.rar, opts.minRar);
    const nOpt = [0, 1, 2, 3][it.rar];
    const pool = ['atk', 'def', 'hp', 'mp', 'crit', 'luck'];
    for (let i = 0; i < nOpt; i++) {
      const o = pick(pool); const pw = it.rar === 3 ? 1.8 : 1;
      const v = o === 'atk' ? Math.round((2 + lvl * 0.7) * pw) : o === 'def' ? Math.round((1 + lvl * 0.45) * pw) : o === 'hp' ? Math.round((10 + lvl * 4) * pw) : o === 'mp' ? Math.round((8 + lvl * 3) * pw) : o === 'crit' ? Math.round((2 + lvl / 12) * pw) : Math.round((3 + lvl / 8) * pw);
      it.st[o] = (it.st[o] || 0) + v;
    }
    if (it.rar) it.name = ['', '고급 ', '희귀 ', '전설의 '][it.rar] + it.name;
  }
  return it;
}
function gearPower(it) { // 강화 반영 최종 스탯
  const s = Object.assign({}, it.st); const p = it.plus || 0;
  if (s.atk) s.atk = Math.round(s.atk * (1 + 0.1 * p) + p * 2);
  if (s.def) s.def = Math.round(s.def * (1 + 0.1 * p) + p);
  return s;
}
function gearSell(it) { return Math.floor((it.lvl * it.lvl * 4 + 30) * (1 + it.rar * 0.8) * (it.shop ? 0.5 : 1)); }

// ═══════════════ 플레이어 ═══════════════
let SAVES = {};
const PLAYERS = new Map(); // id -> p
const SAVE_KEYS = ['plot', 'house', 'name', 'gender', 'hair', 'hairColor', 'skin', 'job', 'lv', 'exp', 'hp', 'mp', 'coins', 'map', 'x', 'y', 'dir', 'inv', 'eq', 'mounts', 'mount', 'storage', 'tent', 'hot', 'kills'];
let IO = { save() { } };
function saveAll() {
  for (const p of PLAYERS.values()) SAVES[p.name] = snapshotSave(p);
  try { IO.save(SAVES); } catch (e) { console.log('저장 실패', e.message); }
}
function snapshotSave(p) { const o = {}; SAVE_KEYS.forEach(k => o[k] = p[k]); return JSON.parse(JSON.stringify(o)); }
function loadSaves(saves) {
  SAVES = saves || {};
  for (const nm in SAVES) {
    const s = SAVES[nm];
    if (s.tent && MAPS[s.tent.map]) MAPS[s.tent.map].tents.push(Object.assign(s.tent, { owner: nm }));
    if (s.house && MAPS[s.house.map]) MAPS[s.house.map].tents.push(Object.assign(s.house, { owner: nm, kind: 'house' }));
    if (s.plot) { const pl = PLOTS.find(q => q.id === s.plot); if (pl) pl.owner = nm; }
  }
}

function newPlayer(o) {
  const job = ['warrior', 'mage', 'healer'].includes(o.job) ? o.job : 'warrior';
  const w = MAPS.world;
  const p = {
    name: o.name, gender: o.gender === 'f' ? 'f' : 'm', hair: clamp(+o.hair || 0, 0, 3), hairColor: clamp(+o.hairColor || 0, 0, 7), skin: clamp(+o.skin || 0, 0, 3),
    job, lv: 1, exp: 0, hp: 1, mp: 1, coins: 300, map: 'world', x: w.spawn.x, y: w.spawn.y, dir: 0,
    inv: [], eq: {}, mounts: [], mount: null, storage: [], tent: null, hot: ['hp1', 'mp1'], kills: 0,
  };
  const wt = { warrior: 'sword', mage: 'staff', healer: 'bow' }[job];
  p.eq.weapon = makeGear(job, 'weapon', 1, { shop: true, wt }); p.eq.weapon.name = '수련용 ' + D.WEAPONS[wt].name;
  p.eq.armor = makeGear(job, 'armor', 1, { shop: true }); p.eq.armor.name = '수련용 ' + D.GEAR[job].armor;
  addItem(p, { k: 'use', id: 'hp1', n: 15 }); addItem(p, { k: 'use', id: 'mp1', n: 10 }); addItem(p, { k: 'use', id: 'recall', n: 2 });
  addItem(p, { k: 'mat', id: '나무', n: 10 }); addItem(p, { k: 'mat', id: '양털', n: 6 }); addItem(p, { k: 'mat', id: '솜', n: 4 });
  return p;
}
const INV_MAX = 36, STORE_MAX = 24;
function addItem(p, it, list = 'inv') {
  const arr = p[list]; const max = list === 'inv' ? INV_MAX : STORE_MAX;
  if (it.k !== 'gear') {
    const ex = arr.find(o => o.k === it.k && o.id === it.id && o.n < 999);
    if (ex) { ex.n += it.n; return true; }
  }
  if (arr.length >= max) return false;
  arr.push(it); return true;
}
function countMat(p, id) { return p.inv.filter(o => o.k === 'mat' && o.id === id).reduce((a, o) => a + o.n, 0); }
function hasMats(p, need) { return Object.entries(need).every(([k, v]) => countMat(p, k) >= v); }
function takeMats(p, need) {
  for (const [k, v0] of Object.entries(need)) { let v = v0; for (const o of p.inv) if (o.k === 'mat' && o.id === k && v > 0) { const t = Math.min(o.n, v); o.n -= t; v -= t; } }
  p.inv = p.inv.filter(o => o.k === 'gear' || o.n > 0);
}
function calc(p) {
  const J = D.JOBS[p.job], B = D.JOBS[J.base]; const L = p.lv - 1;
  let maxHp = B.hp0 + B.hpL * L, maxMp = B.mp0 + B.mpL * L, atk = B.atk0 + B.atkL * L, def = B.def0 + B.defL * L, crit = J.crit || 5, luck = 0;
  if (J.tier) { maxHp *= J.mHp || 1; def *= J.mDef || 1; atk *= J.mAtk || 1; maxMp *= J.mMp || 1; }
  for (const s of D.SLOTS) { const it = p.eq[s]; if (!it) continue; const g = gearPower(it); atk += g.atk || 0; def += g.def || 0; maxHp += g.hp || 0; maxMp += g.mp || 0; crit += g.crit || 0; luck += g.luck || 0; }
  let ba = 0, bd = 0; const now = Date.now();
  p.buffs = (p.buffs || []).filter(b => b.until > now);
  for (const b of p.buffs) { ba += b.atk || 0; bd += b.def || 0; }
  atk *= 1 + ba; def *= Math.max(0.2, 1 + bd);
  let spd = D.BASE_SPEED; if (p.riding && p.mount) spd /= D.MOUNTS[p.mount].spd;
  p.st = { maxHp: Math.round(maxHp), maxMp: Math.round(maxMp), atk: Math.round(atk), def: Math.round(def), crit: Math.min(60, crit), luck, spd: Math.round(spd), heal: J.heal || 1 };
  p.hp = Math.min(p.hp, p.st.maxHp); p.mp = Math.min(p.mp, p.st.maxMp);
}
function canEquip(p, it) {
  const base = D.JOBS[p.job].base;
  if (it.slot === 'shield') return base === 'warrior';
  return it.job === base;
}
function appear(p) {
  const eq = {};
  for (const s of D.SLOTS) { const it = p.eq[s]; if (it) eq[s] = [it.tier, it.rar, it.plus, it.wt || 0]; }
  return { job: p.job, g: p.gender, h: p.hair, hc: p.hairColor, sk: p.skin, eq, mt: p.riding && p.mount ? p.mount : 0 };
}
function meData(p) {
  calc(p);
  return { t: 'me', name: p.name, job: p.job, lv: p.lv, exp: p.exp, need: D.expNeed(p.lv), hp: p.hp, mp: p.mp, st: p.st, coins: p.coins, inv: p.inv, eq: p.eq, mounts: p.mounts, mount: p.mount, riding: !!p.riding, storage: p.storage, tent: p.tent ? { map: p.tent.map, x: p.tent.x, y: p.tent.y } : null, house: p.house ? { map: p.house.map, x: p.house.x, y: p.house.y } : null, plot: p.plot || null, skills: D.skillsFor(p.job).map(s => s.id), cds: p.cds, gender: p.gender, hair: p.hair, hairColor: p.hairColor, skin: p.skin, kills: p.kills, hot: Array.isArray(p.hot) && p.hot.length ? p.hot : ['hp1', 'mp1'] };
}
const dirty = p => { p.dirty = true; };
function sysMsg(p, text, c = '#ffe28a') { if (p.ws) p.ws.send({ t: 'msg', text, c }); }
function broadcast(o, mapId) { const s = JSON.stringify(o); for (const p of PLAYERS.values()) if (!mapId || p.map === mapId) p.ws.send(s); }
function announce(text, c = '#ffb84d') { broadcast({ t: 'msg', text, c, big: 1 }); }
function fx(m, o) { m.fx.push(o); }

function sendMap(p) {
  const m = MAPS[p.map];
  p.ws.send({ t: 'map', id: m.id, name: m.name, w: m.w, h: m.h, tiles: b64(m.t), portals: m.portals, npcs: m.npcs, labels: m.labels, lights: m.lights, towns: m.towns.map(t => ({ name: t.name, x0: t.x0, y0: t.y0, x1: t.x1, y1: t.y1 })), dark: m.dark, pal: m.pal || 0, castle: m.castle || 0, biome: m.id === 'world' ? biomeStr(m) : null });
  sendTents(m);
}
let _bs = null;
function biomeStr(m) { if (_bs) return _bs; const k = { grass: 'g', forest: 'f', desert: 'd', snow: 's', swamp: 'w', volcano: 'v' }; _bs = m.biome.map(b => k[b]).join(''); return _bs; }
function sendTents(m) { broadcast({ t: 'tents', map: m.id, list: m.tents.map(t => ({ owner: t.owner, kind: t.kind || 'tent', x: t.x, y: t.y, furn: t.furn })), plots: PLOTS.filter(q => q.map === m.id).map(q => ({ id: q.id, x: q.x, y: q.y, sx: q.sx, sy: q.sy, owner: q.owner, price: q.price })) }, m.id); }

function teleport(p, mapId, x, y, near) {
  const old = MAPS[p.map];
  if (p.summons) for (const s of p.summons) { old.mons.delete(s.id); occDel(old, s.x, s.y); }
  p.map = mapId; const m = MAPS[mapId];
  const pos = near ? nearFree(m, x, y) : { x, y };
  p.x = pos.x; p.y = pos.y; p.lastMove = Date.now(); p.sleeping = false; p.target = null;
  if (p.summons) for (const s of p.summons) { const q = nearFree(m, p.x, p.y); s.x = q.x; s.y = q.y; s.map = mapId; m.mons.set(s.id, s); occAdd(m, s.x, s.y); }
  sendMap(p); p.ws.send({ t: 'pos', x: p.x, y: p.y, snap: 1 });
  if (m.dungeon && m.floor === DUNGEONS.find(d => d.id === m.dungeon).floors.length - 1) sysMsg(p, '⚠ 이곳은 보스가 출현하는 마지막 층입니다!', '#ff7a7a');
}
function nearestTown(p) {
  const w = MAPS.world; let ref = { x: p.x, y: p.y };
  const m = MAPS[p.map]; if (m.dungeon) { const d = DUNGEONS.find(d => d.id === m.dungeon); ref = d.entPos; }
  const tl = w.towns.filter(t => t.spawn); let best = tl[0], bd = 1e9; for (const t of tl) { const dd = Math.hypot(t.spawn.x - ref.x, t.spawn.y - ref.y); if (dd < bd) { bd = dd; best = t; } }
  return best;
}

// ═══════════════ 몬스터 ═══════════════
let nightNow = false;
function spawnMon(m, type, x, y, o = {}) {
  const def = D.MONS[type]; if (!def) return null;
  const mutant = !!o.mutant;
  const s = D.monStats(def, nightNow, mutant);
  const mon = { id: 'm' + uid(), type, map: m.id, x, y, hx: x, hy: y, dir: 0, hp: s.hp, maxHp: s.hp, atk: s.atk, def: s.def, exp: s.exp, coin: s.coin, lv: def.lv + (mutant ? 3 : 0), boss: !!def.boss, mutant, zone: o.zone, nextMove: Date.now() + ri(0, 1500), nextAtk: 0, target: null, dmgBy: {} };
  m.mons.set(mon.id, mon); occAdd(m, x, y);
  return mon;
}
function killMon(m, mon, killer) {
  m.mons.delete(mon.id); occDel(m, mon.x, mon.y);
  if (mon.summon) return;
  const def = D.MONS[mon.type];
  fx(m, { k: 'die', x: mon.x, y: mon.y, b: mon.boss ? 1 : 0 });
  if (mon.zone) mon.zone.count--;
  // 경험치 (주변 동료도 60% 획득)
  const ps = [...PLAYERS.values()].filter(p => p.map === m.id && !p.dead && dist(p, mon) < 11);
  for (const p of ps) { gainExp(p, p === killer ? mon.exp : Math.floor(mon.exp * 0.6)); }
  if (killer) killer.kills = (killer.kills || 0) + 1;
  const luck = killer ? killer.st.luck : 0;
  // 코인 (항상)
  const coin = Math.floor(mon.coin * (0.8 + R() * 0.5) * (1 + luck / 100) * (mon.boss ? 15 : mon.mutant ? 2.5 : 1));
  dropAt(m, mon.x, mon.y, { k: 'coin', n: coin }, killer);
  // 장비 (낮은 확률)
  const itemChance = (mon.boss ? 100 : mon.mutant ? 12 : 4.2) * (1 + luck / 100);
  const nItems = mon.boss ? 2 + ri(0, 2) : (R() * 100 < itemChance ? 1 : 0);
  for (let i = 0; i < nItems; i++) {
    const job = pick(['warrior', 'mage', 'healer']); // 일반 몬스터는 직업 무관 랜덤 → 교환으로 해결
    const slots = job === 'warrior' ? D.SLOTS : D.SLOTS.filter(s => s !== 'shield');
    const lvl = clamp(def.lv + ri(-2, 2) + (mon.mutant ? 2 : 0), 1, 50);
    dropAt(m, mon.x, mon.y, makeGear(job, pick(slots), lvl, { luck, bonus: mon.boss ? 20 : mon.mutant ? 8 : 0, minRar: mon.boss ? 1 : 0 }), killer);
  }
  // 강화 재료
  const ore = D.oreFor(def.lv);
  if (R() < (mon.boss ? 1 : 0.075 * (1 + luck / 100))) dropAt(m, mon.x, mon.y, { k: 'mat', id: ore, n: mon.boss ? ri(4, 8) : 1 }, killer);
  if ((def.lv >= 45 && R() < 0.04) || mon.boss && def.lv >= 30) dropAt(m, mon.x, mon.y, { k: 'mat', id: '용의비늘', n: mon.boss ? ri(1, 3) : 1 }, killer);
  // 집짓기 재료
  if (def.mats && R() < 0.32) dropAt(m, mon.x, mon.y, { k: 'mat', id: pick(def.mats), n: ri(1, 2) }, killer);
  if (def.meat && R() < 0.4) dropAt(m, mon.x, mon.y, { k: 'mat', id: '고기', n: 1 }, killer);
  if (R() < 0.05) dropAt(m, mon.x, mon.y, { k: 'use', id: pick(['hp1', 'mp1', 'hp1']), n: 1 }, killer);
  if (mon.boss) bossReward(m, mon, killer);
  if (mon.boss) { announce(`🏆 ${killer ? killer.name : '누군가'}님 일행이 [${def.name}]을(를) 쓰러뜨렸습니다!`, '#ffd84a'); for (let i = 0; i < 4; i++) dropAt(m, mon.x, mon.y, { k: 'mat', id: pick(['나무', '돌', '양털', '솜', '횃불']), n: ri(3, 6) }, killer); }
}
function bossReward(m, mon, killer) {
  const loot = D.BOSS_LOOT[mon.type]; if (!loot) return;
  const def = D.MONS[mon.type];
  // 협력자 = 데미지를 준 사람 + 근처에서 함께 싸운(치유 등) 사람
  const helpers = new Set(Object.keys(mon.dmgBy || {}));
  for (const p of PLAYERS.values()) if (p.map === m.id && dist(p, mon) <= 13) helpers.add(p.id);
  for (const id of helpers) {
    const p = PLAYERS.get(id); if (!p || p.map !== m.id) continue;
    const base = D.JOBS[p.job].base;
    const slots = loot.slots.filter(s => s !== 'shield' || base === 'warrior');
    const slot = pick(slots.length ? slots : ['weapon']);
    const it = makeGear(base, slot, clamp(def.lv, 1, 50), { minRar: 3 });
    const noun = slot === 'weapon' ? D.WEAPONS[it.wt].name : D.GEAR[base][slot];
    it.name = loot.set + ' ' + noun; it.boss = mon.type; it.rar = 3;
    for (const k in loot.opt) it.st[k] = Math.round((it.st[k] || (k === 'crit' || k === 'luck' ? 4 : k === 'hp' ? 40 : 6)) * (1 + loot.opt[k] * 0.4) + (k === 'hp' ? def.lv * 3 : k === 'crit' || k === 'luck' ? 3 : def.lv * 0.6));
    if (addItem(p, it)) sysMsg(p, `👑 보스 협력 보상: [${it.name}] 획득! (${D.JOBS[base].name}용)`, '#ffb020');
    else { dropAt(m, p.x, p.y, it, p); sysMsg(p, `👑 보스 보상 [${it.name}]이(가) 가방이 꽉 차 발밑에 떨어졌습니다!`, '#ffb020'); }
    gainExp(p, Math.floor(mon.exp * 0.3));
    dirty(p);
  }
}
function dropAt(m, x, y, item, owner) {
  // 겹치지 않게 주변 칸에 흩뿌림
  let pos = { x, y };
  for (let i = 0; i < 9; i++) { const dx = i === 0 ? 0 : ri(-1, 1), dy = i === 0 ? 0 : ri(-1, 1); const nx = x + dx, ny = y + dy; if (walkable(m, nx, ny) && ![...m.drops.values()].some(d => d.x === nx && d.y === ny)) { pos = { x: nx, y: ny }; break; } }
  const d = { id: 'd' + uid(), x: pos.x, y: pos.y, item, owner: owner ? owner.name : null, until: Date.now() + 15000, expire: Date.now() + 150000 };
  m.drops.set(d.id, d);
}
function gainExp(p, e) {
  if (p.lv >= D.MAX_LEVEL) return;
  p.exp += e; let up = false;
  while (p.lv < D.MAX_LEVEL && p.exp >= D.expNeed(p.lv)) { p.exp -= D.expNeed(p.lv); p.lv++; up = true; }
  if (up) {
    calc(p); p.hp = p.st.maxHp; p.mp = p.st.maxMp;
    fx(MAPS[p.map], { k: 'lvl', x: p.x, y: p.y });
    sysMsg(p, `✨ 레벨 업! Lv.${p.lv}`, '#7dffb0');
    const nsk = D.SKILLS.filter(s => s.jobs.includes(p.job) && s.lv === p.lv); nsk.forEach(s => sysMsg(p, `새 스킬 [${s.name}] 습득!`, '#9ad7ff'));
    if (p.lv === D.PROMO_LEVEL && D.JOBS[p.job].tier === 0) sysMsg(p, `🎖 전직이 가능합니다! 마을의 [전직교관 무영]을 찾아가세요.`, '#e0a8ff');
  }
  dirty(p);
}

function monCanStep(m, x, y) {
  if (!walkable(m, x, y)) return false;
  if (m.occ.has(occKey(x, y))) return false;
  if (safeTile(m, x, y)) return false;
  if (m.portals[x + ',' + y]) return false;
  for (const p of PLAYERS.values()) if (p.map === m.id && !p.dead && p.x === x && p.y === y) return false;
  return true;
}
function moveMon(m, mon, nx, ny) {
  occDel(m, mon.x, mon.y); mon.dir = nx > mon.x ? 2 : nx < mon.x ? 1 : ny > mon.y ? 0 : 3; mon.x = nx; mon.y = ny; occAdd(m, nx, ny);
}
function stepToward(m, mon, tx, ty) {
  const dx = tx - mon.x, dy = ty - mon.y;
  const opts = [];
  if (Math.abs(dx) >= Math.abs(dy)) { if (dx) opts.push([Math.sign(dx), 0]); if (dy) opts.push([0, Math.sign(dy)]); }
  else { if (dy) opts.push([0, Math.sign(dy)]); if (dx) opts.push([Math.sign(dx), 0]); }
  for (const [ax, ay] of opts) if (monCanStep(m, mon.x + ax, mon.y + ay)) { moveMon(m, mon, mon.x + ax, mon.y + ay); return true; }
  // 막히면 옆으로 우회
  const side = pick(DIRS); if (monCanStep(m, mon.x + side[0], mon.y + side[1])) { moveMon(m, mon, mon.x + side[0], mon.y + side[1]); return true; }
  return false;
}
function los(m, a, b) {
  let x0 = a.x, y0 = a.y; const x1 = b.x, y1 = b.y; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (let i = 0; i < 40; i++) { if (x0 === x1 && y0 === y1) return true; if (!(x0 === a.x && y0 === a.y)) { const v = gt(m, x0, y0); if (v === T.TREE || v === T.CAVEWALL || v === T.CASTLEWALL || v === T.WALL || v === T.ROCK || v === T.HOUSE || v === T.ROOF) return false; } const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  return true;
}
function getEnt(m, id) { if (!id) return null; if (id[0] === 'm') return m.mons.get(id) || null; const p = PLAYERS.get(id); return p && p.map === m.id && !p.dead ? p : null; }
function adjacent(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1 || (Math.abs(a.x - b.x) === 1 && Math.abs(a.y - b.y) === 1); }

function monAI(m, mon, now) {
  const def = mon.summon ? D.SUMMONS[mon.type] : D.MONS[mon.type];
  if (mon.summon) return summonAI(m, mon, now, def);
  // 타겟 유효성
  let tg = getEnt(m, mon.target);
  if (tg && (dist(tg, mon) > 15 || safeTile(m, tg.x, tg.y))) { tg = null; mon.target = null; }
  if (!tg && !def.p) {
    const ag = nightNow ? 7 : 5;
    let best = null, bd = ag + (mon.boss ? 3 : 0);
    for (const p of PLAYERS.values()) if (p.map === m.id && !p.dead && !safeTile(m, p.x, p.y)) { const d = dist(p, mon); if (d < bd) { bd = d; best = p; } }
    for (const s of m.mons.values()) if (s.summon) { const d = dist(s, mon); if (d < bd) { bd = d; best = s; } }
    if (best) { mon.target = best.id; tg = best; }
  }
  const slow = mon.slowUntil > now ? 1.7 : 1;
  const moveInt = (mon.boss ? 520 : def.kind === 'bat' || def.kind === 'quad' ? 520 : def.kind === 'golem' || def.kind === 'zombie' || def.kind === 'slime' ? 900 : 700) * slow;
  if (tg) {
    const rng2 = def.rng || 1;
    const inRange = rng2 > 1 ? (dist(tg, mon) <= rng2 && los(m, mon, tg)) : adjacent(mon, tg);
    if (inRange) {
      mon.dir = Math.abs(tg.x - mon.x) > Math.abs(tg.y - mon.y) ? (tg.x > mon.x ? 2 : 1) : (tg.y > mon.y ? 0 : 3);
      if (now >= mon.nextAtk) {
        mon.nextAtk = now + (mon.boss ? 1150 : 1350);
        if (rng2 > 1) fx(m, { k: 'proj', f: 'mshot', fx: mon.x, fy: mon.y, tx: tg.x, ty: tg.y, c: def.c[2] });
        else fx(m, { k: 'mhit', x: mon.x, y: mon.y, tx: tg.x, ty: tg.y });
        hurt(m, tg, mon.atk, mon);
        // 보스 광역 공격
        if (mon.boss && R() < 0.3) {
          fx(m, { k: 'skill', f: 'quake', x: mon.x, y: mon.y, r: 3, c: def.aura });
          for (const p of PLAYERS.values()) if (p.map === m.id && !p.dead && p !== tg && dist(p, mon) <= 3.2) hurt(m, p, Math.floor(mon.atk * 0.7), mon);
        }
      }
    } else if (now >= mon.nextMove) { mon.nextMove = now + moveInt; stepToward(m, mon, tg.x, tg.y); }
  } else if (now >= mon.nextMove) {
    mon.nextMove = now + moveInt * (1.5 + R() * 2);
    if (R() < 0.6) {
      const d = pick(DIRS); const nx = mon.x + d[0], ny = mon.y + d[1];
      if (Math.abs(nx - mon.hx) <= 7 && Math.abs(ny - mon.hy) <= 7 && monCanStep(m, nx, ny)) moveMon(m, mon, nx, ny);
    }
  }
}
function summonAI(m, s, now, def) {
  const owner = PLAYERS.get(s.owner);
  if (!owner || owner.map !== m.id || owner.dead || now > s.until || s.hp <= 0) { killMon(m, s); if (owner) owner.summons = (owner.summons || []).filter(x => x !== s); return; }
  let tg = s.target && m.mons.get(s.target);
  if (!tg || tg.summon || dist(tg, owner) > 10) {
    tg = null; let bd = 7;
    for (const mon of m.mons.values()) if (!mon.summon) { const d = dist(mon, s); if (d < bd) { bd = d; tg = mon; } }
    s.target = tg ? tg.id : null;
  }
  const moveInt = 380;
  if (tg) {
    const inRange = def.range > 1 ? dist(tg, s) <= def.range : adjacent(s, tg);
    if (inRange) { if (now >= s.nextAtk) { s.nextAtk = now + 1000; if (def.range > 1) fx(m, { k: 'proj', f: 'fireball', fx: s.x, fy: s.y, tx: tg.x, ty: tg.y, c: '#ff7a1a' }); hitMon(m, tg, owner, s.atk, 1, true); if (def.taunt && tg.target !== s.id) tg.target = s.id; } }
    else if (now >= s.nextMove) { s.nextMove = now + moveInt; stepToward(m, s, tg.x, tg.y); }
  } else if (now >= s.nextMove && dist(s, owner) > 2.5) { s.nextMove = now + moveInt; stepToward(m, s, owner.x, owner.y); }
}

function hurt(m, tg, raw, src) {
  if (tg.summon) { const d = Math.max(1, Math.round(raw * (0.85 + R() * 0.3) - tg.def * 0.5)); tg.hp -= d; fx(m, { k: 'dmg', x: tg.x, y: tg.y, v: d, p: 1 }); return; }
  const p = tg; if (p.dead) return;
  calc(p);
  let d = Math.max(1, Math.round(raw * (0.85 + R() * 0.3) - p.st.def * 0.55));
  if (p.sleeping) { p.sleeping = false; }
  p.hp -= d; fx(m, { k: 'dmg', x: p.x, y: p.y, v: d, p: 1 });
  if (p.hp <= 0) {
    p.hp = 0; p.dead = true; p.riding = false; dirty(p);
    sysMsg(p, `💀 ${src && D.MONS[src.type] ? D.MONS[src.type].name : '적'}에게 쓰러졌습니다...`, '#ff6a6a');
    for (const mon of m.mons.values()) if (mon.target === p.id) mon.target = null;
  }
}
function hitMon(m, mon, p, atk, mul, fromSummon) {
  if (!mon || mon.summon || mon.hp <= 0) return 0;
  calc(p);
  let raw = atk * mul * (0.9 + R() * 0.2);
  const crit = R() * 100 < p.st.crit; if (crit) raw *= 1.8;
  const d = Math.max(1, Math.round(raw - mon.def * 0.6));
  mon.hp -= d; mon.dmgBy[p.id] = (mon.dmgBy[p.id] || 0) + d;
  if (!mon.target || R() < 0.15) mon.target = p.id;
  if (!fromSummon && mon.target && mon.target[0] === 'm' && R() < 0.3) mon.target = p.id;
  fx(m, { k: 'dmg', x: mon.x, y: mon.y, v: d, c: crit ? 1 : 0 });
  if (mon.hp <= 0) killMon(m, mon, p);
  return d;
}

// 스폰 관리
function spawnTick() {
  const now = Date.now();
  for (const m of Object.values(MAPS)) {
    const active = [...PLAYERS.values()].some(p => p.map === m.id);
    for (const z of m.zones) {
      if (z.count === undefined) z.count = 0;
      const cap = Math.round(z.cap * (nightNow ? 1.6 : 1) * (active ? 1 : 0.6));
      let tries = 0;
      while (z.count < cap && tries++ < (active ? 3 : 8)) {
        const x = ri(z.x0, z.x1), y = ri(z.y0, z.y1);
        if (!monCanStep(m, x, y)) continue;
        if (m.towns.some(t => x >= t.x0 - 4 && x <= t.x1 + 4 && y >= t.y0 - 4 && y <= t.y1 + 4)) continue;
        if (Object.keys(m.portals).some(k => { const [px, py] = k.split(',').map(Number); return Math.abs(px - x) + Math.abs(py - y) < 5; })) continue;
        if (active && [...PLAYERS.values()].some(p => p.map === m.id && Math.abs(p.x - x) < 9 && Math.abs(p.y - y) < 7)) continue; // 화면 안에서 갑자기 생성 방지
        const type = pick(z.mons);
        const mutant = nightNow && R() < 0.13;
        const mon = spawnMon(m, type, x, y, { zone: z, mutant }); if (mon) z.count++;
      }
    }
  }
}

// ═══════════════ 낮/밤 + 보스 ═══════════════
const EPOCH = ENV.NIGHT ? Date.now() - D.DAY_MS - 5000 : Date.now() - 60000;
function dayInfo() { const c = D.DAY_MS + D.NIGHT_MS; const t = (Date.now() - EPOCH) % c; return { night: t >= D.DAY_MS, t, c }; }
function nightLevel() { const { t } = dayInfo(); const fade = 40000; if (t < D.DAY_MS - fade) return t < fade ? 1 - t / fade : 0; if (t < D.DAY_MS) return (t - (D.DAY_MS - fade)) / fade; return 1; }
let lastBossMin = -1;
function bossTick() {
  const di = dayInfo();
  if (di.night !== nightNow) {
    nightNow = di.night;
    if (nightNow) announce('🌙 밤이 찾아왔습니다. 몬스터가 늘어나고 강해지며, 돌연변이 몬스터가 출현합니다!', '#b9a8ff');
    else { announce('☀ 날이 밝았습니다. 돌연변이 몬스터들이 사라집니다.', '#ffe48a'); for (const m of Object.values(MAPS)) for (const mon of [...m.mons.values()]) if (mon.mutant && !mon.target) killMonSilent(m, mon); }
  }
  const d = new Date(); const mi = d.getHours() * 60 + d.getMinutes();
  if (mi === lastBossMin) return; lastBossMin = mi;
  for (const b of BOSSES) {
    const mm = d.getMinutes();
    if ((mm + 1) % b.every === b.off % b.every && !bossAlive(b)) announce(`⏰ 1분 뒤 ${b.where}에 [${D.MONS[b.mon].name}]이(가) 나타납니다!`, '#ffa04d');
    if (mm % b.every === b.off % b.every && !bossAlive(b)) {
      const m = MAPS[b.map]; const pos = nearFreeMon(m, b.x, b.y);
      const mon = spawnMon(m, b.mon, pos.x, pos.y); if (mon) { b.live = mon.id; announce(`☠ ${b.where}에 보스 [${D.MONS[b.mon].name}]이(가) 출현했습니다!`, '#ff5a5a'); }
    }
  }
}
function nearFreeMon(m, x, y) { for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (monCanStep(m, x + dx, y + dy)) return { x: x + dx, y: y + dy }; return { x, y }; }
function bossAlive(b) { return b.live && MAPS[b.map].mons.has(b.live); }
function killMonSilent(m, mon) { m.mons.delete(mon.id); occDel(m, mon.x, mon.y); if (mon.zone) mon.zone.count--; }
function bossSchedule() {
  const d = new Date(); const mm = d.getMinutes();
  return BOSSES.map(b => { let wait = ((b.off % b.every) - mm % b.every + b.every) % b.every; const alive = bossAlive(b); return { name: D.MONS[b.mon].name, lv: D.MONS[b.mon].lv, where: b.where, alive, inMin: alive ? 0 : (wait === 0 ? b.every : wait) - d.getSeconds() / 60 }; });
}

// ═══════════════ 전투 (플레이어) ═══════════════
function nearestMon(m, p, range, needLos = true) {
  let best = null, bd = range + 0.01;
  for (const mon of m.mons.values()) if (!mon.summon) { const d = dist(mon, p); if (d < bd && (!needLos || los(m, p, mon))) { bd = d; best = mon; } }
  return best;
}
function frontMon(m, p) {
  const [dx, dy] = DIRS[p.dir];
  for (const mon of m.mons.values()) if (!mon.summon && mon.x === p.x + dx && mon.y === p.y + dy) return mon;
  // 주변(대각 포함) 몬스터 자동 조준
  const t = p.target && m.mons.get(p.target); if (t && !t.summon && adjacent(t, p)) return t;
  for (const mon of m.mons.values()) if (!mon.summon && adjacent(mon, p)) return mon;
  return null;
}
function faceTo(p, t) { const dx = t.x - p.x, dy = t.y - p.y; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 1) : (dy > 0 ? 0 : 3); }
function pickTarget(m, p, range) {
  let t = p.target && m.mons.get(p.target);
  if (t && !t.summon && dist(t, p) <= range && los(m, p, t)) return t;
  t = nearestMon(m, p, range); if (t) p.target = t.id; return t;
}
function basicAttack(p) {
  const m = MAPS[p.map]; const now = Date.now();
  if (p.dead || inTown(m, p.x, p.y)) return;
  const base = D.JOBS[p.job].base; const w = p.eq.weapon; const spdMul = w && w.wt ? (D.WEAPONS[w.wt].spd || 1) : 1;
  const cd = (base === 'warrior' ? 520 : 680) / spdMul;
  if (now < (p.nextAtk || 0)) return; p.nextAtk = now + cd; p.sleeping = false;
  calc(p);
  if (base === 'warrior') {
    const t = frontMon(m, p);
    fx(m, { k: 'swing', id: p.id, x: p.x, y: p.y, d: t ? (faceTo(p, t), p.dir) : p.dir });
    if (t) hitMon(m, t, p, p.st.atk, 1);
  } else {
    const t = pickTarget(m, p, base === 'mage' ? 6 : 7); if (!t) { fx(m, { k: 'swing', id: p.id, x: p.x, y: p.y, d: p.dir }); return; }
    faceTo(p, t);
    fx(m, { k: 'proj', f: base === 'mage' ? 'mbolt' : 'arrow', fx: p.x, fy: p.y, tx: t.x, ty: t.y, c: base === 'mage' ? '#b48cff' : '#e8e0c0' });
    hitMon(m, t, p, p.st.atk, base === 'mage' ? 0.95 : 1);
  }
}
function useSkill(p, sid) {
  const sk = D.SKILL[sid]; const m = MAPS[p.map]; const now = Date.now();
  if (!sk || p.dead || !sk.jobs.includes(p.job) || p.lv < sk.lv) return;
  if (inTown(m, p.x, p.y) && !['heal', 'buff', 'partyBuff'].includes(sk.kind)) return sysMsg(p, '마을 안에서는 공격 스킬을 쓸 수 없습니다.');
  p.cds = p.cds || {};
  if ((p.cds[sid] || 0) > now) return;
  calc(p);
  if (p.mp < sk.mp) return sysMsg(p, '마나가 부족합니다. (파란 물약!)', '#7ab4ff');
  let ok = true; const A = p.st.atk;
  switch (sk.kind) {
    case 'melee': { const t = frontMon(m, p) || (p.target && m.mons.get(p.target) && dist(m.mons.get(p.target), p) < 1.6 ? m.mons.get(p.target) : null); if (!t) { ok = false; sysMsg(p, '앞에 적이 없습니다.', '#bbb'); break; } faceTo(p, t); fx(m, { k: 'skill', f: sk.fx, x: t.x, y: t.y, c: sk.col, id: p.id }); hitMon(m, t, p, A, sk.mul); if (sk.fx === 'slash3') { setTimeout(() => m.mons.has(t.id) && hitMon(m, t, p, A, sk.mul * 0.25), 180); } break; }
    case 'proj': { const t = pickTarget(m, p, sk.range); if (!t) { ok = false; sysMsg(p, '사거리 안에 적이 없습니다.', '#bbb'); break; } faceTo(p, t); fx(m, { k: 'proj', f: sk.fx, fx: p.x, fy: p.y, tx: t.x, ty: t.y, c: sk.col }); hitMon(m, t, p, A, sk.mul); break; }
    case 'multi': { const ts = [...m.mons.values()].filter(x => !x.summon && dist(x, p) <= sk.range && los(m, p, x)).sort((a, b) => dist(a, p) - dist(b, p)).slice(0, sk.n); if (!ts.length) { ok = false; sysMsg(p, '사거리 안에 적이 없습니다.', '#bbb'); break; } faceTo(p, ts[0]); let prev = p; ts.forEach(t => { fx(m, { k: 'proj', f: sk.fx, fx: prev.x, fy: prev.y, tx: t.x, ty: t.y, c: sk.col }); if (sk.fx === 'bolt') prev = t; hitMon(m, t, p, A, sk.mul); }); break; }
    case 'aoeSelf': case 'taunt': { fx(m, { k: 'skill', f: sk.fx, x: p.x, y: p.y, r: sk.r, c: sk.col, id: p.id }); let healed = false; for (const t of [...m.mons.values()]) if (!t.summon && dist(t, p) <= sk.r + 0.3) { hitMon(m, t, p, A, sk.mul); if (sk.kind === 'taunt' && m.mons.has(t.id)) t.target = p.id; } if (sk.healToo) healAround(m, p, sk.r + 1, sk.healToo); break; }
    case 'aoeTarget': { const t = pickTarget(m, p, sk.range); if (!t) { ok = false; sysMsg(p, '사거리 안에 적이 없습니다.', '#bbb'); break; } faceTo(p, t); const c = { x: t.x, y: t.y }; fx(m, { k: 'skill', f: sk.fx, x: c.x, y: c.y, r: sk.r, c: sk.col, id: p.id }); for (const x of [...m.mons.values()]) if (!x.summon && dist(x, c) <= sk.r + 0.3) { hitMon(m, x, p, A, sk.mul); if (sk.slow && m.mons.has(x.id)) x.slowUntil = now + 4000; } break; }
    case 'line': { const [dx, dy] = DIRS[p.dir]; fx(m, { k: 'skill', f: 'pierce', x: p.x, y: p.y, d: p.dir, r: sk.range, c: sk.col }); for (const x of [...m.mons.values()]) { if (x.summon) continue; const rx = x.x - p.x, ry = x.y - p.y; const along = rx * dx + ry * dy, across = Math.abs(rx * dy - ry * dx); if (along > 0 && along <= sk.range && across <= 0.6) hitMon(m, x, p, A, sk.mul); } break; }
    case 'heal': { fx(m, { k: 'skill', f: sk.fx, x: p.x, y: p.y, r: sk.r, c: sk.col }); healAround(m, p, sk.r, sk.mul); break; }
    case 'buff': { addBuff(p, sk.name, sk.buff, sk.dur); fx(m, { k: 'skill', f: 'buff', x: p.x, y: p.y, c: sk.col }); break; }
    case 'partyBuff': { fx(m, { k: 'skill', f: 'bless', x: p.x, y: p.y, r: sk.r, c: sk.col }); for (const q of PLAYERS.values()) if (q.map === p.map && !q.dead && dist(q, p) <= sk.r) { addBuff(q, sk.name, sk.buff, sk.dur); if (q !== p) sysMsg(q, `${p.name}님의 [${sk.name}]!`, '#ffe98a'); } break; }
    case 'summon': {
      p.summons = (p.summons || []).filter(s => m.mons.has(s.id));
      while (p.summons.length + sk.count > 4) { const old = p.summons.shift(); m.mons.delete(old.id); occDel(m, old.x, old.y); }
      const def = D.SUMMONS[sk.summon];
      for (let i = 0; i < sk.count; i++) {
        const pos = nearFreeMon(m, p.x + ri(-1, 1), p.y + ri(-1, 1));
        const s = { id: 'm' + uid(), type: sk.summon, summon: 1, owner: p.id, map: m.id, x: pos.x, y: pos.y, dir: 0, hp: Math.round(p.st.maxHp * def.hp * 0.6), maxHp: Math.round(p.st.maxHp * def.hp * 0.6), atk: Math.round(A * def.atk), def: Math.round(p.st.def * 0.8), until: now + sk.dur, nextMove: 0, nextAtk: 0 };
        m.mons.set(s.id, s); occAdd(m, s.x, s.y); p.summons.push(s);
        fx(m, { k: 'skill', f: 'summon', x: s.x, y: s.y, c: sk.col });
      }
      break;
    }
  }
  if (!ok) return;
  p.mp -= sk.mp; p.cds[sid] = now + sk.cd; p.sleeping = false; dirty(p);
}
function healAround(m, p, r, mul) {
  calc(p);
  const amt = Math.round((p.st.atk * mul * 0.9 + 12 + p.lv * 3) * p.st.heal);
  for (const q of PLAYERS.values()) if (q.map === p.map && !q.dead && dist(q, p) <= r) { calc(q); const h = Math.min(amt, q.st.maxHp - q.hp); q.hp += h; if (h > 0) fx(m, { k: 'heal', x: q.x, y: q.y, v: h }); }
  for (const s of (p.summons || [])) s.hp = Math.min(s.maxHp, s.hp + amt);
}
function addBuff(p, name, b, dur) { p.buffs = (p.buffs || []).filter(x => x.name !== name); p.buffs.push(Object.assign({ name, until: Date.now() + dur, dur }, b)); calc(p); dirty(p); }

// ═══════════════ NPC/상점/대장간 ═══════════════
function npcNear(p) { const m = MAPS[p.map]; return m.npcs.find(n => Math.abs(n.x - p.x) + Math.abs(n.y - p.y) <= 2); }
function openNpc(p, n) {
  const base = D.JOBS[p.job].base;
  switch (n.kind) {
    case 'shop': return p.ws.send({ t: 'dlg', kind: 'shop', npc: n.name, text: '어서 오게! 사냥에 필요한 물약은 다 있다네. 필요 없는 물건은 내가 사 주지.', items: D.SHOP_CONSUMES.map(id => ({ id, ...D.CONSUMES[id] })) });
    case 'gear': {
      const list = [];
      for (const lv of D.SHOP_GEAR_LEVELS) {
        const job = base;
        const ws = Object.keys(D.WEAPONS).filter(k => D.WEAPONS[k].job === job);
        ws.forEach(wt => list.push(shopGear(job, 'weapon', lv, wt)));
        (job === 'warrior' ? D.SLOTS : D.SLOTS.filter(s => s !== 'shield')).filter(s => s !== 'weapon').forEach(s => list.push(shopGear(job, s, lv)));
      }
      return p.ws.send({ t: 'dlg', kind: 'gear', npc: n.name, text: `${D.JOBS[base].name}용 장비라네. 쓸 만은 하지만... 진짜 좋은 옵션 장비는 몬스터가 갖고 있지.`, items: list });
    }
    case 'smith': return p.ws.send({ t: 'dlg', kind: 'smith', npc: n.name, text: '쇠는 두드려야 강해지는 법! 장비를 +10까지 강화해 주지.\n\n[강화 재료] 몬스터를 사냥하면 떨어진다네.\n· 철광석 : 장비 1~15등급 (초원·숲·박쥐동굴·해골굴)\n· 은광석 : 장비 16~30등급 (사막·늪·설원·해골굴·광산)\n· 마력석 : 장비 31~45등급 (도깨비굴·흑요성·마왕성)\n· 용의비늘 : 장비 46~50등급 (마왕성·고레벨 보스)\n\n강화 단계가 높을수록 재료가 많이 들고 성공률이 떨어진다네. 실패하면 재료와 돈만 날아가고 장비는 무사하니 걱정 말게.', rates: D.UPG_RATE });
    case 'stable': return p.ws.send({ t: 'dlg', kind: 'stable', npc: n.name, text: '탈것은 비싸지만 한번 사면 평생 함께라네. [R]키로 타고 내릴 수 있지.', items: Object.entries(D.MOUNTS).map(([id, v]) => ({ id, ...v, owned: p.mounts.includes(id) })) });
    case 'master': {
      const J = D.JOBS[p.job];
      if (J.tier) return p.ws.send({ t: 'dlg', kind: 'talk', npc: n.name, text: `이미 [${J.name}]의 길을 걷고 있구나. 정진하거라.` });
      return p.ws.send({ t: 'dlg', kind: 'master', npc: n.name, text: p.lv < D.PROMO_LEVEL ? `레벨 ${D.PROMO_LEVEL}이 되면 다시 찾아오게. 그때 너의 길을 정해주지.\n\n${J.name}의 전직 갈래:` : '때가 되었구나. 너의 길을 선택하거라. (한 번 선택하면 되돌릴 수 없다)', can: p.lv >= D.PROMO_LEVEL, opts: D.PROMOS[p.job].map(id => ({ id, name: D.JOBS[id].name, desc: D.JOBS[id].desc, skills: D.SKILLS.filter(s => s.jobs.length === 1 && s.jobs[0] === id).map(s => `${s.name}(Lv${s.lv})`) })) });
    }
    case 'guide': return p.ws.send({ t: 'dlg', kind: 'guide', npc: n.name, text: '바람의 대륙에 온 걸 환영해요!\n\n· 이동: 방향키/WASD  · 공격: 스페이스  · 스킬: 1~6\n· 물약: 7 빨강 / 8 파랑 / 9 보라 / 0 노랑\n· E: NPC·가구 상호작용  · Z: 줍기  · R: 탈것  · B: 집짓기\n· I: 가방  · Tab: 대상 변경  · Enter: 채팅\n· 다른 플레이어를 클릭하면 교환 신청!\n\n밤이 되면 몬스터가 많아지고 돌연변이가 나와요. 지치면 재료로 텐트를 지어 쉬세요!', bosses: bossSchedule() });
  }
}
function shopGear(job, slot, lv, wt) { const it = makeGear(job, slot, lv, { shop: true, wt }); delete it.uid; it.price = D.gearPrice(lv) * (slot === 'weapon' ? 1.4 : 1) | 0; return it; }

// ═══════════════ 교환 ═══════════════
const TRADES = new Map(); // name -> trade
function tradeOf(p) { return TRADES.get(p.name); }
function tradeSend(tr) {
  for (const side of ['a', 'b']) {
    const me = tr[side], other = tr[side === 'a' ? 'b' : 'a'];
    const view = s => ({ items: tr.off[s].items.map(o => { const it = tr[s].inv[o.i]; return it ? Object.assign({}, it, it.k === 'gear' ? {} : { n: o.n }) : null; }).filter(Boolean), coins: tr.off[s].coins, lock: tr.lock[s], ok: tr.ok[s] });
    me.ws.send({ t: 'trade', with: other.name, mine: view(side), theirs: view(side === 'a' ? 'b' : 'a'), myIdx: tr.off[side].items.map(o => o.i) });
  }
}
function tradeEnd(tr, msg) { TRADES.delete(tr.a.name); TRADES.delete(tr.b.name); for (const p of [tr.a, tr.b]) { p.ws.send({ t: 'trade', close: 1 }); if (msg) sysMsg(p, msg); } }
function tradeExec(tr) {
  const A = tr.a, B = tr.b;
  if (A.coins < tr.off.a.coins || B.coins < tr.off.b.coins) return tradeEnd(tr, '코인이 부족해 교환이 취소되었습니다.');
  const takeOut = (P, offs) => { const out = []; for (const o of offs) { const it = P.inv[o.i]; if (!it) continue; if (it.k === 'gear' || o.n >= it.n) { out.push(it); it._rm = 1; } else { it.n -= o.n; out.push(Object.assign({}, it, { n: o.n })); } } P.inv = P.inv.filter(x => !x._rm); return out; };
  if (A.inv.length + tr.off.b.items.length > INV_MAX + tr.off.a.items.length || B.inv.length + tr.off.a.items.length > INV_MAX + tr.off.b.items.length) return tradeEnd(tr, '가방이 가득 차 교환이 취소되었습니다.');
  const ia = takeOut(A, tr.off.a.items), ib = takeOut(B, tr.off.b.items);
  ia.forEach(x => addItem(B, x)); ib.forEach(x => addItem(A, x));
  A.coins += tr.off.b.coins - tr.off.a.coins; B.coins += tr.off.a.coins - tr.off.b.coins;
  dirty(A); dirty(B); tradeEnd(tr, '🤝 교환이 완료되었습니다!');
}

// ═══════════════ 접속/메시지 ═══════════════
function onConnect(ws) {
  let p = null;
  ws.onmsg = raw => {
    let msg; try { msg = JSON.parse(raw); } catch (e) { return; }
    try {
      if (!p) {
        if (msg.t === 'login') {
          const name = String(msg.name || '').trim().slice(0, 10);
          if (!name) return ws.send({ t: 'err', text: '이름을 입력하세요.' });
          if ([...PLAYERS.values()].some(q => q.name === name)) return ws.send({ t: 'err', text: '이미 접속 중인 이름입니다.' });
          if (!SAVES[name]) return ws.send({ t: 'needCreate', name });
          p = Object.assign({}, JSON.parse(JSON.stringify(SAVES[name])));
          p.tent = SAVES[name].tent; p.house = SAVES[name].house; // 맵의 구조물 객체 공유
          enter(p, ws);
        } else if (msg.t === 'create') {
          const name = String(msg.name || '').trim().slice(0, 10);
          if (!name || SAVES[name] || [...PLAYERS.values()].some(q => q.name === name)) return ws.send({ t: 'err', text: '사용할 수 없는 이름입니다.' });
          p = newPlayer(Object.assign({}, msg, { name })); calc(p); p.hp = p.st.maxHp; p.mp = p.st.maxMp;
          SAVES[name] = snapshotSave(p);
          enter(p, ws);
        }
        return;
      }
      handle(p, msg);
    } catch (e) { console.log('오류', e); }
  };
  ws.onclose = () => {
    if (!p) return;
    const tr = tradeOf(p); if (tr) tradeEnd(tr, '상대가 접속을 종료해 교환이 취소되었습니다.');
    const m = MAPS[p.map]; if (p.summons) for (const s of p.summons) { m.mons.delete(s.id); occDel(m, s.x, s.y); }
    p.summons = [];
    SAVES[p.name] = snapshotSave(p); PLAYERS.delete(p.id);
    announce(`${p.name}님이 떠났습니다.`, '#aaa'); saveAll();
  };
}
function enter(p, ws) {
  p.id = 'p' + uid(); p.ws = ws; p.buffs = []; p.cds = {}; p.summons = []; p.dead = false; p.riding = false; p.lastMove = 0;
  p.inv = p.inv || []; p.eq = p.eq || {}; p.mounts = p.mounts || []; p.storage = p.storage || [];
  if (!MAPS[p.map]) { p.map = 'world'; const s = MAPS.world.spawn; p.x = s.x; p.y = s.y; }
  if (!walkable(MAPS[p.map], p.x, p.y)) { const q = nearFree(MAPS[p.map], p.x, p.y); p.x = q.x; p.y = q.y; }
  calc(p); if (p.hp <= 0) p.hp = Math.round(p.st.maxHp * 0.5);
  PLAYERS.set(p.id, p);
  ws.send({ t: 'welcome', id: p.id, atlas: ATLAS });
  sendMap(p); ws.send(meData(p)); ws.send({ t: 'pos', x: p.x, y: p.y, snap: 1 });
  announce(`🌬 ${p.name}님(${D.JOBS[p.job].name} Lv.${p.lv})이 바람의 대륙에 들어왔습니다!`, '#9fe8ff');
  sysMsg(p, '안내원 바람이에게 말을 걸면 조작법과 보스 시간표를 볼 수 있어요. (E키)', '#cfe');
}

function handle(p, msg) {
  const m = MAPS[p.map]; const now = Date.now();
  switch (msg.t) {
    case 'mv': {
      if (p.dead) return;
      const x = msg.x | 0, y = msg.y | 0; calc(p);
      const timeOk = msg.ct ? msg.ct - (p.lastCt || 0) >= p.st.spd * 0.6 : now - (p.lastMove || 0) >= p.st.spd * 0.45;
      const ok = Math.abs(x - p.x) + Math.abs(y - p.y) === 1 && timeOk && walkable(m, x, y) && !m.occ.has(occKey(x, y));
      p.dir = clamp(msg.d | 0, 0, 3);
      if (!ok) { p.ws.send({ t: 'pos', x: p.x, y: p.y }); return; }
      p.x = x; p.y = y; p.lastMove = now; if (msg.ct) p.lastCt = msg.ct; p.sleeping = false;
      // 자동 줍기
      for (const d of [...m.drops.values()]) if (d.x === x && d.y === y) pickup(p, m, d);
      const pt = m.portals[x + ',' + y]; if (pt) teleport(p, pt.to, pt.x, pt.y, pt.near);
      break;
    }
    case 'dbg': if (!ENV.DEBUG) return; if (msg.lv) { p.lv = msg.lv; } if (msg.coins) p.coins += msg.coins; if (msg.give) for (const [k, v] of Object.entries(msg.give)) addItem(p, { k: 'mat', id: k, n: v }); if (msg.boss) { const b = BOSSES.find(b => b.mon === msg.boss); const bm = MAPS[b.map]; const q = nearFreeMon(bm, b.x, b.y); const mo = spawnMon(bm, b.mon, q.x, q.y); b.live = mo.id; } if (msg.map) teleport(p, msg.map, msg.x, msg.y, 1); calc(p); dirty(p); break;
    case 'face': p.dir = clamp(msg.d | 0, 0, 3); break;
    case 'atk': basicAttack(p); break;
    case 'skill': useSkill(p, msg.id); break;
    case 'target': p.target = msg.id; break;
    case 'pick': for (const d of [...m.drops.values()]) if (Math.abs(d.x - p.x) <= 1 && Math.abs(d.y - p.y) <= 1) pickup(p, m, d); break;
    case 'chat': { const text = String(msg.text || '').slice(0, 80); if (!text) return; broadcast({ t: 'chat', id: p.id, name: p.name, text, map: p.map }); break; }
    case 'use': useItem(p, msg.i | 0); break;
    case 'useId': { const i = p.inv.findIndex(o => o.k === 'use' && o.id === msg.id); if (i >= 0) useItem(p, i); else sysMsg(p, `${D.CONSUMES[msg.id].name}이(가) 없습니다.`, '#bbb'); break; }
    case 'unequip': { const it = p.eq[msg.slot]; if (!it) return; if (p.inv.length >= INV_MAX) return sysMsg(p, '가방이 가득 찼습니다.'); delete p.eq[msg.slot]; p.inv.push(it); calc(p); dirty(p); break; }
    case 'drop': { const it = p.inv[msg.i | 0]; if (!it) return; p.inv.splice(msg.i | 0, 1); dropAt(m, p.x, p.y, it, null); dirty(p); break; }
    case 'interact': interact(p); break;
    case 'npc': { const n = npcNear(p); if (n) openNpc(p, n); break; }
    case 'buy': buy(p, msg); break;
    case 'sell': { const it = p.inv[msg.i | 0]; const n = npcNear(p); if (!it || !n || n.kind !== 'shop') return; const price = it.k === 'gear' ? gearSell(it) : it.k === 'use' ? Math.floor((D.CONSUMES[it.id].price || 40) * 0.3) * it.n : 5 * it.n; p.inv.splice(msg.i | 0, 1); p.coins += price; sysMsg(p, `${it.name || it.id} 판매 +${price} 코인`); dirty(p); break; }
    case 'upgrade': upgrade(p, msg); break;
    case 'promote': {
      const n = npcNear(p); if (!n || n.kind !== 'master') return;
      if (p.lv < D.PROMO_LEVEL || D.JOBS[p.job].tier || !D.PROMOS[p.job].includes(msg.id)) return;
      p.job = msg.id; calc(p); p.hp = p.st.maxHp; p.mp = p.st.maxMp; dirty(p);
      fx(m, { k: 'lvl', x: p.x, y: p.y }); announce(`🎖 ${p.name}님이 [${D.JOBS[p.job].name}](으)로 전직했습니다!`, '#e0a8ff');
      p.ws.send({ t: 'dlg', close: 1 }); break;
    }
    case 'ride': {
      if (!p.mount) return sysMsg(p, '탈것이 없습니다. 마을의 마구간에서 구매하세요.', '#bbb');
      p.riding = !p.riding; calc(p); dirty(p); sysMsg(p, p.riding ? `${D.MOUNTS[p.mount].name}에 올라탔습니다. (이동속도 x${D.MOUNTS[p.mount].spd})` : '탈것에서 내렸습니다.'); break;
    }
    case 'setMount': if (p.mounts.includes(msg.id)) { p.mount = msg.id; p.riding = true; calc(p); dirty(p); } break;
    case 'build': buildTent(p); break;
    case 'plotBuy': {
      const pl = plotNear(p); if (!pl || pl.owner) return; if (p.plot) return sysMsg(p, '이미 땅을 갖고 있습니다. (1인 1채)');
      if (p.coins < pl.price) return sysMsg(p, `코인이 부족합니다. (${pl.price.toLocaleString()} 필요)`, '#ff9a9a');
      p.coins -= pl.price; pl.owner = p.name; p.plot = pl.id; dirty(p); sendTents(m); announce(`🏡 ${p.name}님이 ${pl.town}에 땅을 샀습니다!`, '#d8ffd0'); openPlot(p, pl); break;
    }
    case 'houseBuild': {
      const pl = plotNear(p); if (!pl || pl.owner !== p.name || p.house) return;
      if (!hasMats(p, D.HOUSE_COST)) return sysMsg(p, `재료 부족! 집: ${Object.entries(D.HOUSE_COST).map(([k, v]) => `${k} ${v}(보유 ${countMat(p, k)})`).join(', ')}`, '#ffb4b4');
      if ([...PLAYERS.values()].some(q => q.map === m.id && q.x >= pl.x && q.x < pl.x + D.TENT_W && q.y >= pl.y && q.y < pl.y + D.TENT_H)) return sysMsg(p, '공터 안에 사람이 있습니다. 비켜달라고 해주세요!');
      takeMats(p, D.HOUSE_COST);
      const h = { owner: p.name, kind: 'house', map: m.id, x: pl.x, y: pl.y, plot: pl.id, furn: [{ k: 'door', x: D.TENT_W >> 1, y: D.TENT_H - 1 }, { k: 'window', x: 2, y: 0 }, { k: 'window', x: 6, y: 0 }] };
      p.house = h; m.tents.push(h); sendTents(m); dirty(p);
      fx(m, { k: 'lvl', x: pl.sx, y: pl.sy }); announce(`🏠 ${p.name}님의 집이 ${pl.town}에 완성되었습니다!`, '#d8ffd0');
      p.ws.send({ t: 'dlg', close: 1 }); p.ws.send({ t: 'tentOpen', s: 'house' }); break;
    }
    case 'plotSell': {
      const pl = PLOTS.find(q => q.id === p.plot); if (!pl) return;
      if (p.house) { const hm = MAPS[p.house.map]; hm.tents = hm.tents.filter(t => t !== p.house); p.house = null; sendTents(hm); }
      pl.owner = null; p.plot = null; p.coins += Math.floor(pl.price / 2); dirty(p); sendTents(m); sysMsg(p, `땅을 팔았습니다. (+${Math.floor(pl.price / 2)} 코인)`); p.ws.send({ t: 'dlg', close: 1 }); break;
    }
    case 'furn': placeFurn(p, msg); break;
    case 'furnDel': { const t = msg.s === 'house' ? p.house : p.tent; if (!t || t.map !== p.map) return; if (t.kind === 'house' && t.furn.filter(f => f.k === 'door').length <= 1 && (t.furn.find(f => f.x === msg.x && f.y === msg.y) || {}).k === 'door') return sysMsg(p, '문은 최소 1개 있어야 합니다.'); const i = t.furn.findIndex(f => f.x === msg.x && f.y === msg.y); if (i >= 0) { const f = t.furn[i]; t.furn.splice(i, 1); const need = D.FURNITURE[f.k].need; for (const k in need) addItem(p, { k: 'mat', id: k, n: Math.floor(need[k] / 2) }); sysMsg(p, `${D.FURNITURE[f.k].name} 철거 (재료 절반 회수)`); sendTents(m); dirty(p); } break; }
    case 'tentDel': { if (!p.tent) return; const tm = MAPS[p.tent.map]; tm.tents = tm.tents.filter(t => t !== p.tent); p.tent = null; if (p.storage.length) sysMsg(p, '보관상자의 물건은 다음 텐트로 옮겨집니다.'); sendTents(tm); dirty(p); sysMsg(p, '텐트를 철거했습니다.'); break; }
    case 'store': { if (!p.tent && !p.house) return; if (msg.dir === 'in') { const it = p.inv[msg.i | 0]; if (!it) return; if (p.storage.length >= STORE_MAX && it.k === 'gear') return sysMsg(p, '보관상자가 가득 찼습니다.'); p.inv.splice(msg.i | 0, 1); if (!addItem(p, it, 'storage')) p.inv.push(it); } else { const it = p.storage[msg.i | 0]; if (!it) return; if (p.inv.length >= INV_MAX && it.k === 'gear') return sysMsg(p, '가방이 가득 찼습니다.'); p.storage.splice(msg.i | 0, 1); if (!addItem(p, it)) p.storage.push(it); } dirty(p); break; }
    case 'cook': cook(p, msg.id); break;
    case 'sleep': p.sleeping = !p.sleeping && !p.dead; break;
    case 'respawn': if (p.dead) { const t = nearestTown(p); p.dead = false; calc(p); p.hp = Math.round(p.st.maxHp * 0.5); p.mp = Math.round(p.st.maxMp * 0.5); p.exp = Math.max(0, p.exp - Math.floor(D.expNeed(p.lv) * 0.05)); teleport(p, 'world', t.spawn.x, t.spawn.y, 1); dirty(p); sysMsg(p, `${t.name}에서 부활했습니다. (경험치 -5%)`, '#ffb4b4'); } break;
    case 'hot': p.hot = Array.isArray(msg.hot) ? msg.hot.slice(0, 5).map(x => typeof x === 'string' && D.CONSUMES[x] ? x : null) : []; dirty(p); break;
    case 'boss': p.ws.send({ t: 'boss', list: bossSchedule() }); break;
    // 교환
    case 'tradeReq': {
      const q = PLAYERS.get(msg.id); if (!q || q === p || q.map !== p.map || dist(q, p) > 8) return sysMsg(p, '교환하려면 가까이 있어야 합니다.');
      if (tradeOf(p) || tradeOf(q)) return sysMsg(p, '이미 교환 중입니다.');
      q.tradeFrom = p.name; q.ws.send({ t: 'tradeAsk', from: p.name, id: p.id }); sysMsg(p, `${q.name}님에게 교환을 신청했습니다.`); break;
    }
    case 'tradeYes': {
      const q = [...PLAYERS.values()].find(x => x.name === p.tradeFrom); p.tradeFrom = null;
      if (!q || q.map !== p.map || tradeOf(q) || tradeOf(p)) return sysMsg(p, '교환을 시작할 수 없습니다.');
      const tr = { a: q, b: p, off: { a: { items: [], coins: 0 }, b: { items: [], coins: 0 } }, lock: { a: 0, b: 0 }, ok: { a: 0, b: 0 } };
      TRADES.set(q.name, tr); TRADES.set(p.name, tr); tradeSend(tr); break;
    }
    case 'tradeNo': { const q = [...PLAYERS.values()].find(x => x.name === p.tradeFrom); p.tradeFrom = null; if (q) sysMsg(q, `${p.name}님이 교환을 거절했습니다.`); break; }
    case 'tradeItem': case 'tradeCoin': case 'tradeLock': case 'tradeOk': case 'tradeCancel': {
      const tr = tradeOf(p); if (!tr) return; const side = tr.a === p ? 'a' : 'b';
      if (msg.t === 'tradeCancel') return tradeEnd(tr, '교환이 취소되었습니다.');
      if (msg.t === 'tradeItem') { if (tr.lock[side]) return; const i = msg.i | 0; const it = p.inv[i]; if (!it) return; const arr = tr.off[side].items; const k = arr.findIndex(o => o.i === i); if (k >= 0) arr.splice(k, 1); if (!msg.remove && arr.length < 10) arr.push({ i, n: it.k === 'gear' ? 1 : clamp(msg.n | 0 || it.n, 1, it.n) }); tr.lock = { a: 0, b: 0 }; tr.ok = { a: 0, b: 0 }; }
      if (msg.t === 'tradeCoin') { if (tr.lock[side]) return; tr.off[side].coins = clamp(msg.n | 0, 0, p.coins); tr.lock = { a: 0, b: 0 }; tr.ok = { a: 0, b: 0 }; }
      if (msg.t === 'tradeLock') tr.lock[side] = 1;
      if (msg.t === 'tradeOk') { if (!tr.lock.a || !tr.lock.b) return; tr.ok[side] = 1; if (tr.ok.a && tr.ok.b) return tradeExec(tr); }
      tradeSend(tr); break;
    }
  }
}
function pickup(p, m, d) {
  if (d.owner && d.owner !== p.name && Date.now() < d.until) return;
  const it = d.item;
  if (it.k === 'coin') { p.coins += it.n; fx(m, { k: 'coin', x: d.x, y: d.y, v: it.n, id: p.id }); m.drops.delete(d.id); dirty(p); return; }
  if (!addItem(p, it)) { sysMsg(p, '가방이 가득 찼습니다!', '#ff9a9a'); return; }
  m.drops.delete(d.id); dirty(p);
  const nm = it.k === 'gear' ? it.name : it.k === 'use' ? D.CONSUMES[it.id].name + ' x' + it.n : it.id + ' x' + it.n;
  sysMsg(p, `획득: ${nm}`, it.k === 'gear' ? D.RARITY[it.rar].c : '#d8f0d0');
}
function useItem(p, i) {
  const it = p.inv[i]; if (!it || p.dead) return; const now = Date.now();
  if (it.k === 'gear') {
    if (!canEquip(p, it)) return sysMsg(p, `${D.JOBS[it.job] ? D.JOBS[it.job].name : ''} 전용 장비입니다. 다른 직업 플레이어와 교환해 보세요!`, '#ffb4b4');
    if (it.lvl > p.lv + 3) return sysMsg(p, `레벨 ${it.lvl - 3} 이상부터 착용 가능합니다.`, '#ffb4b4');
    if (it.slot === 'shield' && p.eq.weapon && false) return;
    p.inv.splice(i, 1); const old = p.eq[it.slot]; p.eq[it.slot] = it; if (old) p.inv.splice(i, 0, old);
    calc(p); dirty(p); return;
  }
  if (it.k === 'mat') {
    if (it.id === '횃불') return sysMsg(p, '횃불은 텐트 안에 설치할 수 있습니다. (B: 집짓기 메뉴)', '#ddd');
    return sysMsg(p, D.MATS[it.id] ? D.MATS[it.id].desc : '재료', '#ddd');
  }
  const c = D.CONSUMES[it.id]; if (!c) return;
  if (now < (p.potCd || 0)) return; p.potCd = now + 350;
  calc(p);
  if (c.recall) { const t = nearestTown(p); teleport(p, 'world', t.spawn.x, t.spawn.y, 1); sysMsg(p, `${t.name}(으)로 귀환했습니다.`); }
  if (c.hp) { const h = Math.min(c.hp, p.st.maxHp - p.hp); p.hp += h; fx(MAPS[p.map], { k: 'heal', x: p.x, y: p.y, v: h }); }
  if (c.mp) { p.mp = Math.min(p.st.maxMp, p.mp + c.mp); fx(MAPS[p.map], { k: 'mana', x: p.x, y: p.y, v: c.mp }); }
  if (c.buff) addBuff(p, c.name, c.buff, c.dur);
  it.n--; if (it.n <= 0) p.inv.splice(i, 1);
  dirty(p);
}
function buy(p, msg) {
  const n = npcNear(p); if (!n) return;
  if (n.kind === 'shop') {
    const c = D.CONSUMES[msg.id]; if (!c || !D.SHOP_CONSUMES.includes(msg.id)) return;
    const q = clamp(msg.n | 0 || 1, 1, 100); const cost = c.price * q;
    if (p.coins < cost) return sysMsg(p, '코인이 부족합니다.', '#ff9a9a');
    if (!addItem(p, { k: 'use', id: msg.id, n: q })) return sysMsg(p, '가방이 가득 찼습니다.');
    p.coins -= cost; dirty(p); sysMsg(p, `${c.name} x${q} 구매 (-${cost})`);
  } else if (n.kind === 'gear') {
    const lv = msg.lv | 0; if (!D.SHOP_GEAR_LEVELS.includes(lv)) return;
    const base = D.JOBS[p.job].base; if (msg.slot === 'shield' && base !== 'warrior') return;
    const it = makeGear(base, msg.slot, lv, { shop: true, wt: msg.wt && D.WEAPONS[msg.wt] && D.WEAPONS[msg.wt].job === base ? msg.wt : undefined });
    const price = D.gearPrice(lv) * (msg.slot === 'weapon' ? 1.4 : 1) | 0;
    if (p.coins < price) return sysMsg(p, '코인이 부족합니다.', '#ff9a9a');
    if (p.inv.length >= INV_MAX) return sysMsg(p, '가방이 가득 찼습니다.');
    p.coins -= price; p.inv.push(it); dirty(p); sysMsg(p, `${it.name} 구매 (-${price})`);
  } else if (n.kind === 'stable') {
    const mt = D.MOUNTS[msg.id]; if (!mt || p.mounts.includes(msg.id)) return;
    if (p.coins < mt.price) return sysMsg(p, `코인이 부족합니다. (${mt.price.toLocaleString()} 필요)`, '#ff9a9a');
    p.coins -= mt.price; p.mounts.push(msg.id); p.mount = msg.id; p.riding = true; calc(p); dirty(p);
    announce(`🐎 ${p.name}님이 [${mt.name}]을(를) 구입했습니다!`, '#ffd27a'); openNpc(p, n);
  }
}
function upgrade(p, msg) {
  const n = npcNear(p); if (!n || n.kind !== 'smith') return;
  const it = msg.eq ? p.eq[msg.eq] : p.inv[msg.i | 0]; if (!it || it.k !== 'gear') return;
  if (it.plus >= 10) return sysMsg(p, '이미 최대 강화(+10)입니다.');
  const c = D.upgradeCost(it);
  if (countMat(p, c.mat) < c.n) return sysMsg(p, `재료 부족: ${c.mat} ${c.n}개 필요 (보유 ${countMat(p, c.mat)})`, '#ff9a9a');
  if (p.coins < c.coin) return sysMsg(p, `코인 부족: ${c.coin} 필요`, '#ff9a9a');
  takeMats(p, { [c.mat]: c.n }); p.coins -= c.coin;
  const ok = R() * 100 < D.UPG_RATE[it.plus];
  if (ok) { it.plus++; sysMsg(p, `🔨 강화 성공! ${it.name} +${it.plus}`, '#7dffb0'); if (it.plus >= 7) announce(`🔨 ${p.name}님이 [${it.name}] +${it.plus} 강화에 성공했습니다!`, '#ffd27a'); }
  else sysMsg(p, `💥 강화 실패... (장비는 무사합니다)`, '#ff9a9a');
  p.ws.send({ t: 'upgRes', ok }); calc(p); dirty(p);
}

// ═══════════════ 집짓기 ═══════════════
function buildTent(p) {
  const m = MAPS[p.map];
  if (p.dead) return;
  if (inTown(m, p.x, p.y) || m.towns.some(t => p.x >= t.x0 - 6 && p.x <= t.x1 + 6 && p.y >= t.y0 - 8 && p.y <= t.y1 + 6)) return sysMsg(p, '마을 근처에는 텐트를 지을 수 없습니다.', '#ffb4b4');
  if (!hasMats(p, D.TENT_COST)) return sysMsg(p, `재료 부족! 텐트: 나무 ${D.TENT_COST['나무']}, 양털 ${D.TENT_COST['양털']}, 솜 ${D.TENT_COST['솜']} (보유 나무 ${countMat(p, '나무')}, 양털 ${countMat(p, '양털')}, 솜 ${countMat(p, '솜')})`, '#ffb4b4');
  const x0 = p.x - (D.TENT_W >> 1), y0 = p.y - (D.TENT_H - 1);
  for (let y = y0; y < y0 + D.TENT_H; y++) for (let x = x0; x < x0 + D.TENT_W; x++) {
    const v = gt(m, x, y);
    if ((D.BLOCK.has(v) && !D.TENT_OVER.has(v)) || v === T.UP || v === T.DOWN || v === T.CAVEDOOR || v === T.GATE || m.portals[x + ',' + y]) return sysMsg(p, '이곳은 텐트를 칠 공간이 부족합니다. (위쪽으로 9x7칸의 빈 땅 필요)', '#ffb4b4');
    if (m.tents.some(t => t !== p.tent && x >= t.x && x < t.x + D.TENT_W && y >= t.y && y < t.y + D.TENT_H)) return sysMsg(p, '다른 텐트와 겹칩니다.', '#ffb4b4');
  }
  takeMats(p, D.TENT_COST);
  let furn = [];
  if (p.tent) { const om = MAPS[p.tent.map]; om.tents = om.tents.filter(t => t !== p.tent); furn = p.tent.furn; if (om !== m) sendTents(om); }
  const tent = { owner: p.name, map: m.id, x: x0, y: y0, furn };
  p.tent = tent; m.tents.push(tent);
  // 텐트 안 몬스터 밀어내기
  for (const mon of [...m.mons.values()]) if (tentAt(m, mon.x, mon.y) === tent) { const q = nearFreeMon(m, mon.x, y0 + D.TENT_H + 2); occDel(m, mon.x, mon.y); mon.x = q.x; mon.y = q.y; occAdd(m, q.x, q.y); mon.target = null; }
  for (const d of [...m.drops.values()]) if (tentAt(m, d.x, d.y) === tent && tentBlock(tent, d.x, d.y)) { d.x = p.x; d.y = p.y; }
  sendTents(m); dirty(p);
  fx(m, { k: 'skill', f: 'summon', x: p.x, y: p.y - 3, c: '#ffe0a0' });
  sysMsg(p, '⛺ 텐트를 지었습니다! 안쪽은 몬스터가 들어오지 못하는 안전지대입니다. 집짓기 메뉴(B)에서 가구를 배치하세요.', '#ffe0a0');
  // 가구 배치 모드 진입
  p.ws.send({ t: 'tentOpen' });
}
function placeFurn(p, msg) {
  const t = msg.s === 'house' ? p.house : p.tent; if (!t || t.map !== p.map) return sysMsg(p, msg.s === 'house' ? '먼저 집을 지어야 합니다.' : '먼저 텐트를 지어야 합니다.');
  const f = D.FURNITURE[msg.k]; if (!f) return;
  if (f.house && t.kind !== 'house') return sysMsg(p, `${f.name}은(는) 마을의 집에만 설치할 수 있습니다.`);
  const lx = msg.x | 0, ly = msg.y | 0;
  const corner = (lx === 0 || lx === D.TENT_W - 1) && (ly === 0 || ly === D.TENT_H - 1);
  const onWall = lx === 0 || lx === D.TENT_W - 1 || ly === 0 || ly === D.TENT_H - 1;
  if (lx < 0 || ly < 0 || lx >= D.TENT_W || ly >= D.TENT_H) return;
  if (f.wall) { if (!onWall || corner) return sysMsg(p, `${f.name}은(는) 벽(모서리 제외)에 설치합니다.`); }
  else if (onWall) return sysMsg(p, '가구는 실내에 설치합니다.');
  if (t.furn.some(o => o.x === lx && o.y === ly)) return sysMsg(p, '이미 무언가 있는 자리입니다.');
  if (!f.wall && t.kind !== 'house' && lx === (D.TENT_W >> 1) && ly === D.TENT_H - 2 && msg.k !== 'rug') return sysMsg(p, '문 앞은 비워두세요.');
  const m = MAPS[p.map];
  if (msg.k !== 'rug' && ([...PLAYERS.values()].some(q => q.map === m.id && q.x === t.x + lx && q.y === t.y + ly))) return sysMsg(p, '사람이 서 있는 자리에는 놓을 수 없습니다.');
  if (!hasMats(p, f.need)) return sysMsg(p, `재료 부족: ${Object.entries(f.need).map(([k, v]) => `${k} ${v}`).join(', ')}`, '#ffb4b4');
  takeMats(p, f.need); t.furn.push({ k: msg.k, x: lx, y: ly });
  sendTents(m); dirty(p);
}
function furnFront(p) {
  const m = MAPS[p.map]; const [dx, dy] = DIRS[p.dir]; const fx_ = p.x + dx, fy = p.y + dy;
  const useful = new Set(['bed', 'chest', 'campfire', 'stove', 'torch']);
  for (const t of m.tents) { const f = t.furn.find(f => t.x + f.x === fx_ && t.y + f.y === fy && useful.has(f.k)) || t.furn.find(f => Math.abs(t.x + f.x - p.x) + Math.abs(t.y + f.y - p.y) === 1 && useful.has(f.k)); if (f) return { t, f }; }
  return null;
}
function plotNear(p) { return PLOTS.find(q => q.map === p.map && Math.abs(q.sx - p.x) + Math.abs(q.sy - p.y) <= 2); }
function openPlot(p, pl) {
  const mine = pl.owner === p.name;
  p.ws.send({ t: 'dlg', kind: 'plot', id: pl.id, town: pl.town, price: pl.price, owner: pl.owner, mine, hasHouse: !!(mine && p.house), myPlot: p.plot || null, cost: D.HOUSE_COST,
    text: pl.owner ? (mine ? (p.house ? '당신의 집입니다. 문으로 들어가 [B] 집짓기 메뉴에서 가구·창문·문을 배치하세요.' : '당신의 땅입니다. 가진 건축 재료로 집을 지을 수 있습니다.') : `${pl.owner}님의 땅입니다.`) : `${pl.town}의 공터입니다. 땅을 사서 나만의 집을 지어보세요! (1인 1채)` });
}
function interact(p) {
  const n = npcNear(p); if (n) return openNpc(p, n);
  const pl = plotNear(p); if (pl && !furnFront(p)) return openPlot(p, pl);
  const ff = furnFront(p); if (!ff) return;
  const { t, f } = ff;
  if (f.k === 'bed') { p.sleeping = true; sysMsg(p, '💤 침대에 누웠습니다. 체력과 마나가 빠르게 회복됩니다. (움직이면 일어남)', '#c8d8ff'); }
  else if (f.k === 'chest') { if (t.owner !== p.name) return sysMsg(p, '다른 사람의 보관상자입니다.'); p.ws.send({ t: 'dlg', kind: 'chest' }); }
  else if (f.k === 'campfire' || f.k === 'stove') p.ws.send({ t: 'dlg', kind: 'cook', at: f.k, recipes: Object.entries(D.RECIPES).filter(([, r]) => r.at === f.k || (f.k === 'stove' && r.at === 'campfire')).map(([id, r]) => ({ id, ...r, desc: D.CONSUMES[id].desc })) });
  else if (f.k === 'torch') sysMsg(p, '횃불이 따뜻하게 타오릅니다.', '#ffd27a');
}
function cook(p, id) {
  const r = D.RECIPES[id]; if (!r) return;
  const ff = furnFront(p); if (!ff || !(ff.f.k === r.at || (ff.f.k === 'stove'))) return sysMsg(p, '모닥불이나 조리대 앞에서 요리하세요.');
  if (!hasMats(p, r.need)) return sysMsg(p, `재료 부족: ${Object.entries(r.need).map(([k, v]) => `${k} ${v}`).join(', ')}`, '#ffb4b4');
  takeMats(p, r.need); addItem(p, { k: 'use', id, n: 1 }); dirty(p); sysMsg(p, `🍖 ${r.name} 완성!`, '#ffd8a0');
  fx(MAPS[p.map], { k: 'skill', f: 'buff', x: p.x, y: p.y, c: '#ffb060' });
}

// ═══════════════ 메인 루프 ═══════════════
let tickN = 0;
function tick() {
  const now = Date.now(); tickN++;
  const nl = nightLevel();
  const activeMaps = new Set([...PLAYERS.values()].map(p => p.map));
  for (const id of activeMaps) {
    const m = MAPS[id];
    for (const mon of [...m.mons.values()]) {
      // 플레이어 근처만 AI
      if (!mon.summon && ![...PLAYERS.values()].some(p => p.map === id && Math.abs(p.x - mon.x) < 26 && Math.abs(p.y - mon.y) < 20)) continue;
      monAI(m, mon, now);
    }
    for (const d of [...m.drops.values()]) if (now > d.expire) m.drops.delete(d.id);
  }
  // 플레이어 재생/버프
  if (tickN % 10 === 0) for (const p of PLAYERS.values()) {
    if (p.dead) continue; calc(p); const m = MAPS[p.map];
    const inT = tentAt(m, p.x, p.y); const town = inTown(m, p.x, p.y);
    const rate = p.sleeping ? 0.09 : (inT || town) ? 0.03 : 0.008;
    p.hp = Math.min(p.st.maxHp, p.hp + Math.ceil(p.st.maxHp * rate)); p.mp = Math.min(p.st.maxMp, p.mp + Math.ceil(p.st.maxMp * (rate + 0.006)));
  }
  // 스냅샷 전송
  for (const p of PLAYERS.values()) {
    const m = MAPS[p.map];
    if (p.dirty) { p.dirty = false; p.ws.send(meData(p)); }
    const VX = 20, VY = 15;
    const P = [], M = [], Dr = [];
    for (const q of PLAYERS.values()) if (q.map === p.map && Math.abs(q.x - p.x) <= VX && Math.abs(q.y - p.y) <= VY) P.push({ i: q.id, n: q.name, x: q.x, y: q.y, d: q.dir, h: Math.round(100 * q.hp / (q.st ? q.st.maxHp : 1)), lv: q.lv, a: appear(q), sl: q.sleeping ? 1 : 0, dd: q.dead ? 1 : 0, bf: (q.buffs || []).length ? 1 : 0 });
    for (const mon of m.mons.values()) if (Math.abs(mon.x - p.x) <= VX && Math.abs(mon.y - p.y) <= VY) M.push({ i: mon.id, t: mon.type, x: mon.x, y: mon.y, d: mon.dir, h: Math.round(100 * mon.hp / mon.maxHp), mu: mon.mutant ? 1 : 0, s: mon.summon ? 1 : 0, lv: mon.lv });
    for (const d of m.drops.values()) if (Math.abs(d.x - p.x) <= VX && Math.abs(d.y - p.y) <= VY) { const it = d.item; Dr.push({ i: d.id, x: d.x, y: d.y, k: it.k, id: it.id, tr: it.tier, c: it.k === 'gear' ? D.TIER_COLOR[it.tier] : it.k === 'use' ? D.CONSUMES[it.id].col : it.k === 'mat' ? (D.MATS[it.id] || {}).c : '#ffd700', r: it.rar || 0, sl: it.slot, wt: it.wt, n: it.k === 'gear' ? it.name : it.k === 'coin' ? it.n + '코인' : (it.k === 'use' ? D.CONSUMES[it.id].name : it.id) + (it.n > 1 ? ' x' + it.n : '') }); }
    const fxs = m.fx.filter(f => Math.abs((f.x ?? f.fx) - p.x) <= VX + 2 && Math.abs((f.y ?? f.fy) - p.y) <= VY + 2);
    p.ws.send({ t: 's', tm: now, nl, P, M, D: Dr, fx: fxs, you: { hp: p.hp, mp: p.mp, mhp: p.st.maxHp, mmp: p.st.maxMp, dead: p.dead ? 1 : 0, sl: p.sleeping ? 1 : 0, buffs: (p.buffs || []).map(b => ({ n: b.name, r: b.until - now, d: b.dur })), tg: p.target } });
  }
  for (const id of activeMaps) MAPS[id].fx = [];
}
let started = false;
const API = {
  MAPS, ATLAS, PLOTS, D,
  biomeStr: () => biomeStr(MAPS.world),
  start(saves, io) {
    if (started) return; started = true;
    if (io) IO = io; loadSaves(saves);
    setInterval(tick, 100); setInterval(spawnTick, 1500); setInterval(bossTick, 1000); setInterval(saveAll, 30000);
    spawnTick(); spawnTick(); spawnTick();
  },
  connect: onConnect, saveAll,
  online: () => [...PLAYERS.values()].map(p => p.name),
};
if (typeof module !== 'undefined' && module.exports) module.exports = API; else window.ENGINE = API;
})();
