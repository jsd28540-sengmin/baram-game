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
  const m = Object.assign({ id, name, w, h, t: new Uint8Array(w * h).fill(fill), portals: {}, npcs: [], labels: [], lights: [], towns: [], zones: [], mons: new Map(), drops: new Map(), occ: new Map(), tents: [], fx: [], dark: 0, bossPts: [], chests: [] }, o);
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
  { id: 'ruin', name: '폐왕성', type: 'castle', ent: [160, 34], lv: '56~72', floors: [['ghostKnight', 'cursedMaid'], ['cursedMaid', 'emptyArmor', 'ghostKnight'], ['emptyArmor', 'shadowHound'], ['shadowHound', 'royalLich'], ['royalLich', 'emptyArmor', 'shadowHound']], boss: 'fallenKing', every: 30, off: 20, pal: 1, chests: 4, ctier: 4 },
  { id: 'prison', name: '잊혀진 감옥', type: 'prison', ent: [172, 226], lv: '64~82', floors: [['prisoner', 'jailer'], ['jailer', 'chainGhost', 'prisoner'], ['chainGhost', 'plagueHound'], ['plagueHound', 'torturer', 'chainGhost']], boss: 'prisonLord', every: 30, off: 10, pal: 0, chests: 6, ctier: 4 },
  { id: 'abyss', name: '심연의 성채', type: 'castle', ent: [18, 160], lv: '78~100', floors: [['abyssKnight', 'voidMage'], ['voidMage', 'boneDragon'], ['boneDragon', 'abyssKnight'], ['abyssDemon', 'voidMage'], ['abyssDemon', 'nightmare'], ['nightmare', 'boneDragon', 'abyssDemon']], boss: 'abyssKing', every: 45, off: 30, pal: 1, chests: 4, ctier: 5 },
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
    if (b === 'grass') t = v < 0.012 ? T.TREE : v < 0.09 ? T.FLOWER : T.GRASS;
    else if (b === 'forest') t = (nn > 0.6 && v < 0.16) || v < 0.025 ? T.TREE : v < 0.14 ? T.FLOWER : T.FOREST;
    else if (b === 'desert') t = v < 0.01 ? T.CACTUS : v < 0.016 ? T.ROCK : T.SAND;
    else if (b === 'snow') t = (nn > 0.65 && v < 0.15) || v < 0.015 ? T.PINE : T.SNOW;
    else if (b === 'swamp') t = nn > 0.68 ? T.WATER : v < 0.025 ? T.DEADTREE : T.SWAMP;
    else if (b === 'volcano') t = nn > 0.7 ? T.LAVA : v < 0.022 ? T.ROCK : T.ASH;
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
    if (d.type === 'prison') { for (let x = ex - 3; x <= ex + 3; x += 2) st(m, x, ey - 4, T.BARS); }
    if (d.type === 'castle' || d.type === 'prison') { fillRect(m, ex - 4, ey - 4, ex + 4, ey + 1, T.CASTLEWALL); }
    st(m, ex, ey + 1, d.type === 'cave' ? T.CAVEDOOR : T.GATE);
    m.labels.push({ x: ex, y: ey - (d.type === 'castle' ? 5 : 4), text: `${d.name} (Lv${d.lv})`, c: d.type === 'cave' ? '#ffd27a' : '#ff8a8a' });
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
    { npc: 'bank', name: '창고지기 곳간이', label: '창고', dx: -4, dy: 4, c: '#3a8a7a' },
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
// 감옥 층 생성: 복도 + 쇠창살 감방
function genPrison(id, name, seed) {
  const W = 64, H = 60, r = rng(seed);
  const m = newMap(id, name, W, H, T.CASTLEWALL, { dark: 0.62, pal: 0, castle: 1 });
  const rows = [9, 24, 39, 54]; const cells = [];
  rows.forEach((cy, ri_) => {
    fillRect(m, 3, cy - 1, W - 4, cy + 1, T.CASTLE);
    for (let x = 6; x + 5 < W - 4; x += 7) for (const side of [-1, 1]) {
      if (cy + side * 6 < 2 || cy + side * 6 > H - 3) continue;
      const y0 = side < 0 ? cy - 6 : cy + 3, y1 = side < 0 ? cy - 3 : cy + 6;
      fillRect(m, x, y0, x + 4, y1, T.CASTLE);
      const by = side < 0 ? cy - 2 : cy + 2; for (let bx = x; bx <= x + 4; bx++) st(m, bx, by, T.BARS);
      const open = r() < 0.55; if (open) st(m, x + 2, by, T.CASTLE);
      cells.push({ x: x + 2, y: side < 0 ? y0 + 1 : y1 - 1, open });
      if (r() < 0.3) m.lights.push({ x: x + 2, y: (y0 + y1) >> 1, r: 2 });
    }
    if (ri_ < rows.length - 1) { const vx = ri_ % 2 ? 4 : W - 6; fillRect(m, vx, cy, vx + 1, rows[ri_ + 1], T.CASTLE); }
    for (let x = 8; x < W - 6; x += 12) m.lights.push({ x, y: cy, r: 4 });
  });
  m.cells = cells.filter(c => c.open);
  m.up = { x: 4, y: rows[0] }; m.down = { x: rows.length % 2 ? 4 : W - 6, y: rows[rows.length - 1] };
  m.down = { x: (rows.length - 1) % 2 ? 5 : W - 6, y: rows[rows.length - 1] };
  return m;
}
function bfs(m, sx, sy) {
  const seen = new Map(); const q = [sy * m.w + sx]; seen.set(q[0], 0);
  for (let i = 0; i < q.length; i++) { const k = q[i], x = k % m.w, y = Math.floor(k / m.w), d = seen.get(k);
    for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, nk = ny * m.w + nx; if (!seen.has(nk) && !D.BLOCK.has(gt(m, nx, ny)) && gt(m, nx, ny) !== T.CAVEWALL) { seen.set(nk, d + 1); q.push(nk); } } }
  return seen;
}
function nearFreeBody(m, x, y, self) {
  if (walkable(m, x, y) && !bodyAt(m, x, y, self)) return { x, y };
  for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const nx = x + dx, ny = y + dy; if (walkable(m, nx, ny) && !m.portals[nx + ',' + ny] && !bodyAt(m, nx, ny, self) && !m.occ.has(occKey(nx, ny))) return { x: nx, y: ny };
  }
  return { x, y };
}
function nearFree(m, x, y, avoidPortal = true) {
  for (let r = 0; r < 40; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const nx = x + dx, ny = y + dy; if (walkable(m, nx, ny) && !(avoidPortal && m.portals[nx + ',' + ny])) return { x: nx, y: ny };
  }
  for (let i = 0; i < m.w * m.h; i++) { const nx = i % m.w, ny = (i / m.w) | 0; if (walkable(m, nx, ny) && !m.portals[nx + ',' + ny]) return { x: nx, y: ny }; }
  return { x, y };
}

function genDungeons() {
  const world = MAPS.world;
  DUNGEONS.forEach((d, di) => {
    const floors = [];
    d.floors.forEach((mons, fi) => {
      const id = d.id + (fi + 1), nm = `${d.name} ${fi + 1}층`;
      const m = d.type === 'cave' ? genCave(id, nm, 1000 + di * 50 + fi, d.pal) : d.type === 'prison' ? genPrison(id, nm, 3000 + di * 50 + fi) : genCastle(id, nm, 2000 + di * 50 + fi, d.pal);
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
// ═══════════════ 탐험: 연못 · 버려진 집 · 보물상자 · 전설 ═══════════════
const CHESTS = new Map(); let CHEST_N = 1;
const BIOME_K = { grass: 'g', forest: 'f', swamp: 'w', snow: 's', desert: 'd', volcano: 'v' };
const BIOME_TIER = { g: 1, f: 2, w: 3, s: 3, d: 3, v: 4 };
const BIOME_NAME = { g: '초원', f: '늑대숲', w: '독안개 늪', s: '설원', d: '남쪽 사막', v: '화산지대' };
const biomeKey = (m, x, y) => m.biome ? BIOME_K[m.biome[y * m.w + x]] || 'g' : 'g';
function nearTownOrGate(m, x, y, pad) { return m.towns.some(t => x >= t.x0 - pad && x <= t.x1 + pad && y >= t.y0 - pad && y <= t.y1 + pad) || Object.keys(m.portals).some(k => { const [px, py] = k.split(',').map(Number); return Math.abs(px - x) <= pad && Math.abs(py - y) <= pad; }); }
function areaClear(m, x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = gt(m, x, y); if (x < 2 || y < 2 || x >= m.w - 2 || y >= m.h - 2) return false; if ([T.WALL, T.STONE, T.ROAD, T.HOUSE, T.ROOF, T.CASTLEWALL, T.GATE, T.CAVEDOOR, T.BRIDGE, T.FENCE].includes(t)) return false; } return true; }
function addChest(m, x, y, tier, o = {}) { const c = Object.assign({ id: 'c' + (CHEST_N++), map: m.id, x, y, tier }, o); m.chests.push(c); CHESTS.set(c.id, c); st(m, x, y, m.castle ? (gt(m, x, y) === T.CARPET ? T.CARPET : T.CASTLE) : m.dark ? T.CAVE : gt(m, x, y)); return c; }
(function explore() {
  const w = MAPS.world, r = rng(4242);
  // 연못
  const PONDS = [[118, 154, '청풍'], [150, 84, '버들'], [210, 104, '늑대숲'], [28, 150, '안개'], [58, 34, '얼음'], [176, 196, '오아시스'], [36, 204, '온천'], [100, 70, '갈대']];
  w.ponds = [];
  for (const [tx, ty, nm] of PONDS) {
    let done = false;
    for (let k = 0; k < 200 && !done; k++) {
      const cx = tx + ri(-12, 12), cy = ty + ri(-12, 12), rx = 4 + (k % 3), ry = 3 + (k % 2);
      if (!areaClear(w, cx - rx - 2, cy - ry - 2, cx + rx + 2, cy + ry + 2) || nearTownOrGate(w, cx, cy, rx + 6)) continue;
      const b = biomeKey(w, cx, cy); const rim = b === 'd' ? T.SAND : b === 's' ? T.SNOW : b === 'v' ? T.ASH : b === 'w' ? T.SWAMP : T.GRASS;
      for (let y = -ry - 2; y <= ry + 2; y++) for (let x = -rx - 2; x <= rx + 2; x++) { const d = (x * x) / ((rx + 1.6) ** 2) + (y * y) / ((ry + 1.6) ** 2); if (d <= 1) st(w, cx + x, cy + y, rim); }
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) st(w, cx + x, cy + y, T.WATER);
      if (b !== 'd' && b !== 'v') for (let i = 0; i < 6; i++) { const a = r() * 6.28, x = Math.round(cx + Math.cos(a) * (rx + 1.4)), y = Math.round(cy + Math.sin(a) * (ry + 1.4)); if (gt(w, x, y) !== T.WATER) st(w, x, y, b === 's' ? T.SNOW : T.FLOWER); }
      w.labels.push({ x: cx, y: cy - ry - 2, text: `${nm} ${b === 'd' ? '' : b === 'v' ? '' : '연못'}`.trim() + ' · 낚시터', c: '#9fe8ff' });
      w.ponds.push({ name: nm, x: cx, y: cy, b }); done = true;
    }
  }
  // 버려진 집 (무너진 벽 + 보물상자)
  w.ruins = [];
  const RUINS = [[70, 140], [160, 120], [220, 70], [200, 160], [20, 80], [45, 130], [30, 30], [130, 10], [100, 200], [220, 210], [60, 220], [150, 150]];
  for (const [tx, ty] of RUINS) {
    for (let k = 0; k < 120; k++) {
      const x0 = tx + ri(-10, 10), y0 = ty + ri(-10, 10), ww = 6 + ri(0, 3), hh = 5 + ri(0, 2);
      if (!areaClear(w, x0 - 1, y0 - 1, x0 + ww + 1, y0 + hh + 1) || nearTownOrGate(w, x0, y0, 10) || [...Array(hh + 3)].some((_, yy) => [...Array(ww + 3)].some((_, xx) => gt(w, x0 - 1 + xx, y0 - 1 + yy) === T.WATER))) continue;
      fillRect(w, x0, y0, x0 + ww, y0 + hh, T.BRIDGE);
      for (let x = x0; x <= x0 + ww; x++) { if (r() > 0.22) st(w, x, y0, T.RUINWALL); if (r() > 0.3) st(w, x, y0 + hh, T.RUINWALL); }
      for (let y = y0; y <= y0 + hh; y++) { if (r() > 0.22) st(w, x0, y, T.RUINWALL); if (r() > 0.22) st(w, x0 + ww, y, T.RUINWALL); }
      const dx = x0 + (ww >> 1); st(w, dx, y0 + hh, T.BRIDGE); st(w, dx - 1, y0 + hh, T.BRIDGE);
      if (ww > 6) for (let y = y0 + 1; y < y0 + hh - 1; y++) if (r() > 0.4) st(w, x0 + 3, y, T.RUINWALL);
      const b = biomeKey(w, x0, y0), tier = Math.min(4, BIOME_TIER[b] + 1);
      addChest(w, x0 + ww - 1, y0 + 1, tier); if (r() < 0.6) addChest(w, x0 + 1, y0 + hh - 1, Math.max(1, tier - 1));
      w.ruins.push({ x: x0, y: y0, w: ww, h: hh, b }); break;
    }
  }
  // 숨겨진 보물상자: 나무·바위에 둘러싸인 구석
  const hidden = []; const far = (x, y, d) => hidden.every(c => Math.hypot(c.x - x, c.y - y) > d);
  for (let k = 0; k < 40000 && hidden.length < 60; k++) {
    const x = ri(4, w.w - 5), y = ri(4, w.h - 5); const t = gt(w, x, y);
    if (D.BLOCK.has(t) || t === T.ROAD || t === T.STONE || t === T.BRIDGE || nearTownOrGate(w, x, y, 6)) continue;
    let blk = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = gt(w, x + dx, y + dy); if (n === T.TREE || n === T.PINE || n === T.ROCK || n === T.CACTUS || n === T.DEADTREE || n === T.WATER) blk++; }
    if (blk < 3 || blk > 6 || !far(x, y, 13)) continue;
    // 갈 수 있는지: 4방향 중 하나는 열려 있어야
    if (![[0, 1], [1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => !D.BLOCK.has(gt(w, x + dx, y + dy)))) continue;
    hidden.push({ x, y });
  }
  const legendIds = Object.keys(D.LEGENDS);
  hidden.forEach((h, i) => { const b = biomeKey(w, h.x, h.y); if (i < 6) addChest(w, h.x, h.y, 5, { legend: legendIds[i], hidden: 1 }); else addChest(w, h.x, h.y, Math.min(4, BIOME_TIER[b] + (r() < 0.25 ? 1 : 0)), { hidden: 1 }); });
  // 던전 보물상자 (층마다) + 마지막 층 전설상자
  const DT = { bat: 2, skull: 2, mine: 3, dok: 3, obs: 4, demon: 4 };
  let li = 6;
  DUNGEONS.forEach(d => {
    const nF = d.floors.length;
    d.floors.forEach((_, fi) => {
      const m = MAPS[d.id + (fi + 1)]; const n = d.chests || 2; const tier = d.ctier || DT[d.id] || 3;
      const spots = [];
      if (m.cells) m.cells.forEach(c => spots.push([c.x, c.y]));
      else if (m.rooms) m.rooms.slice(1).forEach(o => spots.push([o.x + 1 + ri(0, o.w - 3), o.y + 1 + ri(0, o.h - 3)]));
      else { const reach = bfs(m, m.up.x, m.up.y); for (const [k2, dd] of reach) if (dd > 25 && r() < 0.03) spots.push([k2 % m.w, Math.floor(k2 / m.w)]); }
      for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
      let placed = 0;
      for (const [x, y] of spots) { if (placed >= n) break; if (m.portals[x + ',' + y] || D.BLOCK.has(gt(m, x, y)) || Math.hypot(x - m.up.x, y - m.up.y) < 4 || Math.hypot(x - m.down.x, y - m.down.y) < 4) continue; addChest(m, x, y, Math.min(5, tier + (fi >= nF - 1 && r() < 0.5 ? 1 : 0)) === 5 ? 4 : tier, {}); placed++; }
      if (fi === nF - 1 && ['ruin', 'prison', 'abyss', 'obs', 'demon', 'dok'].includes(d.id) && li < legendIds.length) {
        const sp = spots.find(([x, y]) => !m.chests.some(c => c.x === x && c.y === y) && !m.portals[x + ',' + y] && !D.BLOCK.has(gt(m, x, y)));
        if (sp) addChest(m, sp[0], sp[1], 5, { legend: legendIds[li++] });
      }
    });
  });
})();
function makeLegend(lid) {
  const L = D.LEGENDS[lid]; if (!L) return null;
  const it = makeGear(L.job, L.slot, 50, { wt: L.wt, minRar: 3, bonus: 60 });
  it.rar = 4; it.name = L.name; it.legend = lid;
  for (const k in it.st) it.st[k] = Math.round(it.st[k] * L.mul);
  for (const [k, v] of Object.entries(L.extra || {})) it.st[k] = (it.st[k] || 0) + v;
  return it;
}
const CHEST_RESPAWN = 2 * 3600 * 1000;
function chestOpened(p, c) { const t = (p.opened || {})[c.id]; if (!t) return false; if (c.legend) return true; return Date.now() - t < CHEST_RESPAWN; }
function chestList(p, m) { return m.chests.map(c => ({ i: c.id, x: c.x, y: c.y, t: c.tier, L: c.legend ? 1 : 0, h: c.hidden ? 1 : 0, o: chestOpened(p, c) ? 1 : 0 })); }
function openChest(p, c) {
  const m = MAPS[p.map]; if (!c || c.map !== p.map || Math.max(Math.abs(c.x - p.x), Math.abs(c.y - p.y)) > 1) return;
  if (chestOpened(p, c)) return sysMsg(p, c.legend ? '이미 열어 본 전설의 보물상자입니다.' : '텅 빈 상자입니다. (2시간 뒤 다시 채워져요)', '#bbb');
  p.opened = p.opened || {}; p.opened[c.id] = Date.now();
  const t = c.tier, luck = (p.st && p.st.luck) || 0, got = [];
  const give = it => { if (!addItem(p, it)) dropAt(m, p.x, p.y, it, p); got.push(it.k === 'gear' ? it.name : `${it.k === 'use' ? D.CONSUMES[it.id].name : it.id} x${it.n}`); };
  const coins = Math.floor(ri(60, 160) * Math.pow(t, 2.3) * (1 + luck / 100)); p.coins += coins; got.push(`${coins} 코인`);
  const ores = ['철광석', '은광석', '마력석', '용의비늘']; give({ k: 'mat', id: ores[Math.min(3, Math.max(0, t - 2))] || '철광석', n: ri(2, 3 + t * 2) });
  if (t >= 4 && R() < 0.5) give({ k: 'mat', id: '용의비늘', n: ri(1, t - 2) });
  give({ k: 'mat', id: pick(['나무', '돌', '양털', '솜', '횃불']), n: ri(3, 8) });
  const ings = ['약초', '버섯', '사과', '꿀', '향신료', '얼음꽃', '용암고추', '달걀', '밀가루']; for (let i = 0; i < 1 + (t >> 1); i++) give({ k: 'mat', id: pick(ings), n: ri(1, 3) });
  give({ k: 'use', id: pick(t >= 5 ? ['hp3', 'mp3', 'hp2', 'mp2', 'buffAtk', 'buffDef'] : t >= 3 ? ['hp2', 'mp2', 'buffAtk', 'buffDef', 'recall', 'back'] : ['hp1', 'mp1', 'recall', 'hp1']), n: ri(2, 5) });
  if (R() < 0.12 + t * 0.06) give({ k: 'mat', id: '보물지도 조각', n: 1 });
  const nGear = t >= 4 ? (R() < 0.35 ? 2 : 1) : R() < 0.22 + t * 0.08 ? 1 : 0;
  for (let i = 0; i < nGear; i++) { const job = pick(['warrior', 'mage', 'healer']); const slots = job === 'warrior' ? D.SLOTS : D.SLOTS.filter(s => s !== 'shield'); give(makeGear(job, pick(slots), clamp(t * 11 + ri(-4, 6), 1, 50), { luck, bonus: t * 3, minRar: t >= 4 ? 1 : 0 })); }
  if (c.legend) { const L = makeLegend(c.legend); if (L) { give(L); announce(`✨ ${p.name}님이 전설의 보물상자에서 [${L.name}]을(를) 발견했습니다!`, '#ff7a4a'); } }
  else if (t >= 4 && R() < 0.0015 * (1 + luck / 100)) { const lid = pick(Object.keys(D.LEGENDS)); const L = makeLegend(lid); give(L); announce(`✨ ${p.name}님이 보물상자에서 전설의 [${L.name}]을(를) 발견했습니다!`, '#ff7a4a'); }
  fx(m, { k: 'coin', x: c.x, y: c.y, v: coins }); fx(m, { k: 'chest', x: c.x, y: c.y, t });
  sysMsg(p, `${D.TREASURE_TIER[t]}을(를) 열었다! ${got.join(', ')}`, t >= 4 ? '#ffb84d' : '#ffe28a');
  p.ws.send({ t: 'chestUp', i: c.id, o: 1 }); dirty(p);
  if (p.tmapTarget === c.id) { p.tmapTarget = null; dirty(p); }
}
// 보물지도: 아직 못 찾은 전설상자 위치
function useTreasureMap(p) {
  const list = [...CHESTS.values()].filter(c => c.legend && c.hidden && !chestOpened(p, c));
  if (!list.length) return sysMsg(p, '이 지도가 가리키던 보물은 모두 찾았습니다!', '#ffe28a'), false;
  const c = pick(list); p.tmapTarget = c.id; const b = BIOME_NAME[biomeKey(MAPS.world, c.x, c.y)];
  sysMsg(p, `보물지도가 빛난다... [${b}] 좌표 (${c.x}, ${c.y}) 근처에 전설의 보물이 잠들어 있다! (미니맵에 X 표시)`, '#ff9a5a'); dirty(p); return true;
}
// 낚시
function startFishing(p, rod) {
  const m = MAPS[p.map]; const [dx, dy] = DIRS[p.dir]; let tx = p.x + dx, ty = p.y + dy;
  if (gt(m, tx, ty) !== T.WATER) { const n = [[0, 1], [-1, 0], [1, 0], [0, -1]].findIndex(([a, b]) => gt(m, p.x + a, p.y + b) === T.WATER); if (n < 0) return sysMsg(p, '물가에서 물을 바라보고 낚싯대를 사용하세요.', '#ffb4b4'); p.dir = n; tx = p.x + DIRS[n][0]; ty = p.y + DIRS[n][1]; }
  if (inTown(m, p.x, p.y) && false) return;
  p.fishing = { x: tx, y: ty, px: p.x, py: p.y, rod, next: Date.now() + fishWait(rod) };
  sysMsg(p, '낚싯대를 드리웠다... (자동으로 낚여요. 움직이면 멈춤)', '#9fe8ff'); dirty(p);
}
const fishWait = rod => Math.round(ri(6500, 11000) / (rod === 2 ? 1.6 : 1));
function fishTick(p, now) {
  const f = p.fishing; if (!f) return;
  if (p.dead || p.x !== f.px || p.y !== f.py || p.map === undefined) { p.fishing = null; return; }
  if (now < f.next) return; f.next = now + fishWait(f.rod);
  const m = MAPS[p.map]; const b = m.biome ? biomeKey(m, f.x, f.y) : 'w'; const rare = f.rod === 2 ? 2.2 : 1; const luck = (p.st && p.st.luck) || 0; const x = R() * 100;
  let it;
  if (x < 0.5 * rare * (1 + luck / 100)) it = { k: 'use', id: 'fGold', n: 1 };
  else if (x < 2.2 * rare) it = { k: 'mat', id: '보물지도 조각', n: 1 };
  else if (x < 3.4 * rare) it = { k: 'mat', id: '진주', n: 1 };
  else if (x < 3.6 * rare) { const job = pick(['warrior', 'mage', 'healer']); it = makeGear(job, pick(job === 'warrior' ? D.SLOTS : D.SLOTS.filter(s => s !== 'shield')), clamp(p.lv - ri(0, 6), 1, 50), { luck, minRar: 1 }); }
  else if (x < 7.5) it = { k: 'mat', id: '낡은 장화', n: 1 };
  else if (x < 10) { const c = ri(30, 120) + p.lv * 4; p.coins += c; sysMsg(p, `동전 주머니를 낚았다! +${c} 코인`, '#ffe28a'); fx(m, { k: 'fishc', x: f.x, y: f.y }); dirty(p); return; }
  else { const tb = D.FISH[b] || D.FISH.g; const tot = tb.reduce((a, [, w_]) => a + w_, 0); let q = R() * tot; let id = tb[0][0]; for (const [fid, w_] of tb) { q -= w_; if (q <= 0) { id = fid; break; } } it = { k: 'use', id, n: 1 }; }
  if (!addItem(p, it)) { p.fishing = null; return sysMsg(p, '가방이 가득 차서 낚시를 멈췄습니다.', '#ffb4b4'); }
  const nm = it.k === 'gear' ? it.name : it.k === 'use' ? D.CONSUMES[it.id].name : it.id;
  sysMsg(p, `${nm}을(를) 낚았다!`, it.id === 'fGold' || it.k === 'gear' || it.id === '진주' ? '#ffb84d' : '#9fe8ff');
  if (it.id === 'fGold') announce(`${p.name}님이 황금잉어를 낚았습니다!`, '#ffd84a');
  fx(m, { k: 'fishc', x: f.x, y: f.y }); dirty(p);
}
// 밤의 추적자: 밤에 마을·텐트 밖에 있으면 쫓아온다
function nightHunt() {
  if (!nightNow) return; const w = MAPS.world;
  for (const p of PLAYERS.values()) {
    if (p.map !== 'world' || p.dead || p.lv < 3 || safeTile(w, p.x, p.y) || R() > 0.4) continue;
    const near = [...w.mons.values()].filter(mo => mo.stalker && mo.target === p.id).length; if (near >= 2) continue;
    const type = p.lv <= 22 ? 'stalker1' : p.lv <= 45 ? 'stalker2' : p.lv <= 70 ? 'stalker3' : 'stalker4';
    for (let k = 0; k < 20; k++) { const a = R() * 6.28, d = 6 + R() * 3; const x = Math.round(p.x + Math.cos(a) * d), y = Math.round(p.y + Math.sin(a) * d); if (!monCanStep(w, x, y) || safeTile(w, x, y)) continue; const mo = spawnMon(w, type, x, y); if (mo) { mo.stalker = 1; mo.target = p.id; sysMsg(p, '어둠 속에서 무언가가 쫓아온다... 텐트나 마을로 피하세요!', '#c8a0ff'); } break; }
  }
}
function clearStalkers() { const w = MAPS.world; for (const mo of [...w.mons.values()]) if (mo.stalker) killMonSilent(w, mo); }
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
const SW = t => t.w || D.TENT_W, SH = t => t.h || D.TENT_H; // 실내는 더 작은 크기(w,h)
function tentAt(m, x, y) { for (const t of m.tents) if (x >= t.x && x < t.x + SW(t) && y >= t.y && y < t.y + SH(t)) return t; return null; }
// ── 텐트 실내: 밖에서는 닫힌 텐트, 입구로 들어가면 별도 실내 공간 ──
const TW = D.TENT_W, TH = D.TENT_H, TDX = TW >> 1;
const IW = 7, IHT = 6, IDX = IW >> 1; // 텐트 실내: 바닥 5x4칸 (아늑하게)
const tentInId = owner => 'tent_' + owner;
function isTentOut(t, m) { return t && (t.kind || 'tent') === 'tent' && !t.inner && m && m.id === t.map; }
function tentInterior(t) {
  const id = tentInId(t.owner); let m = MAPS[id];
  if (!m) {
    m = newMap(id, `${t.owner}의 텐트`, IW + 2, IHT + 3, T.TWALL, { inner: 1 });
    for (let y = 2; y < IHT; y++) for (let x = 2; x < IW; x++) st(m, x, y, T.TFLOOR);
    st(m, 1 + IDX, IHT, T.TFLOOR); st(m, 1 + IDX, IHT + 1, T.TFLOOR);
    m.lights.push({ x: 1 + IDX, y: 3, r: 4 });
    m.tents.push({ owner: t.owner, kind: 'tent', inner: 1, map: id, x: 1, y: 1, w: IW, h: IHT, furn: t.furn });
  }
  // 예전(큰 실내)에 놓은 가구 중 새 크기 밖은 정리
  { const keep = t.furn.filter(f => f.x >= 0 && f.y >= 0 && f.x < IW && f.y < IHT); if (keep.length !== t.furn.length) { t.furn.length = 0; keep.forEach(f => t.furn.push(f)); } }
  m.tents[0].furn = t.furn; m.tentRef = t; return m;
}
// 텐트 자리·입구 앞의 나무·바위 등을 걷어내 맨땅으로 (막힘 방지)
function tentGround(m, x0, y0) { const cnt = new Map(); for (let y = y0 - 2; y <= y0 + TH + 2; y++) for (let x = x0 - 2; x <= x0 + TW + 1; x++) { if (y >= y0 && y < y0 + TH && x >= x0 && x < x0 + TW) continue; const v = gt(m, x, y); if (v != null && !D.BLOCK.has(v) && v !== T.WATER) cnt.set(v, (cnt.get(v) || 0) + 1); } let best = T.GRASS, bn = -1; for (const [v, n] of cnt) if (n > bn) { bn = n; best = v; } return best; }
function clearTentGround(m, t) {
  const g = tentGround(m, t.x, t.y), ch = [];
  const cl = (x, y) => { const v = gt(m, x, y); if (v != null && D.TENT_OVER.has(v)) { st(m, x, y, g); ch.push([x, y, g]); } };
  for (let y = t.y; y < t.y + TH; y++) for (let x = t.x; x < t.x + TW; x++) cl(x, y);
  for (let y = t.y + TH; y <= t.y + TH + 1; y++) for (let x = t.x + TDX - 1; x <= t.x + TDX + 1; x++) cl(x, y); // 입구 앞 3x2
  if (ch.length) broadcast({ t: 'tset', map: m.id, l: ch });
}
function tentExit(t) { const m = MAPS[t.map]; let x = t.x + TDX, y = t.y + TH; if (m && !walkable(m, x, y)) { outer: for (let r = 1; r <= 5; r++) for (let dy = 0; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const nx = t.x + TDX + dx, ny = t.y + TH + dy; if (walkable(m, nx, ny) && !tentAt(m, nx, ny)) { x = nx; y = ny; break outer; } } } return { x, y }; }
function closeTentInterior(t) { const im = MAPS[tentInId(t.owner)]; if (!im) return; const ex = tentExit(t); for (const q of PLAYERS.values()) if (q.map === im.id) teleport(q, t.map, ex.x, ex.y, 1); delete MAPS[im.id]; }
function ensureTentMap(id) { if (MAPS[id] || !id.startsWith('tent_')) return; const owner = id.slice(5); for (const m of Object.values(MAPS)) for (const t of m.tents) if (t.owner === owner && (t.kind || 'tent') === 'tent' && !t.inner) { tentInterior(t); return; } }
function tentDoorCheck(p) {
  const m = MAPS[p.map];
  if (m.inner) { if (p.y >= 1 + IHT) { const t = m.tentRef; if (t && MAPS[t.map]) { const ex = tentExit(t); teleport(p, t.map, ex.x, ex.y, 1); sysMsg(p, '텐트 밖으로 나왔습니다.', '#ccc'); } } return; }
  for (const t of m.tents) if (isTentOut(t, m) && p.x === t.x + TDX && p.y === t.y + TH - 1) { const im = tentInterior(t); teleport(p, im.id, 1 + IDX, IHT - 1); sysMsg(p, t.owner === p.name ? '내 텐트에 들어왔습니다. [집짓기]에서 가구를 배치하세요. 아래 입구로 나가요.' : `${t.owner}님의 텐트에 들어왔습니다.`, '#ffd27a'); sendTents(im); return; }
}
function tentBlock(t, x, y) {
  const lx = x - t.x, ly = y - t.y;
  if (!t.inner && (t.kind || 'tent') === 'tent') return !(lx === TDX && ly === TH - 1); // 밖: 입구만 통과
  const f = t.furn.find(f => f.x === lx && f.y === ly);
  const wall = lx === 0 || lx === SW(t) - 1 || ly === 0 || ly === SH(t) - 1;
  if (wall) { if (f && f.k === 'door') return false; if (t.kind !== 'house' && ly === SH(t) - 1 && lx === (SW(t) >> 1)) return false; return true; }
  if (f && !D.WALK_FURN.has(f.k)) return true;
  return false;
}
// 다른 플레이어·NPC가 서 있는 칸 (겹쳐 지나갈 수 없음)
function bodyAt(m, x, y, self) {
  for (const n of m.npcs) if (n.x === x && n.y === y) return true;
  for (const c of m.chests) if (c.x === x && c.y === y) return true;
  for (const o of PLAYERS.values()) if (o !== self && o.map === m.id && !o.dead && o.x === x && o.y === y) return true;
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
  lvl = clamp(Math.round(lvl), 1, 100);
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
    if (it.rar && lvl < 100) it.name = ['', '고급 ', '희귀 ', '영웅의 ', ''][it.rar] + it.name;
  }
  if (lvl >= 100) { it.rar = 3; it.legendTier = 1; for (const k of ['atk', 'def', 'hp']) if (it.st[k]) it.st[k] = Math.round(it.st[k] * 1.25); it.st.crit = (it.st.crit || 0) + 5; } // 100 전설 등급
  return it;
}
function gearPower(it, lv) { // 강화 + 레벨 효력 반영 최종 스탯
  const s = Object.assign({}, it.st); const p = it.plus || 0;
  if (s.atk) s.atk = Math.round(s.atk * (1 + 0.1 * p) + p * 2);
  if (s.def) s.def = Math.round(s.def * (1 + 0.1 * p) + p);
  if (lv != null) { const e = D.gearEff(lv, it); if (e.main < 1) for (const k in s) s[k] = Math.round(s[k] * (D.isMainStat(it, k) ? e.main : e.extra)); }
  return s;
}
function gearSell(it) { return Math.floor((it.lvl * it.lvl * 4 + 30) * (1 + it.rar * 0.8) * (it.shop ? 0.5 : 1)); }

// ═══════════════ 플레이어 ═══════════════
let SAVES = {};
const PLAYERS = new Map(); // id -> p
const PARTIES = new Map(); let PARTY_N = 1; const PARTY_MAX = 6;
function partyOf(p) { return p.party ? PARTIES.get(p.party) : null; }
function partyMsg(pt, text, c) { for (const id of pt.members) { const q = PLAYERS.get(id); if (q) sysMsg(q, text, c || '#9fe8ff'); } }
function partyLeave(p, why) {
  const pt = partyOf(p); p.party = null; if (!pt) return;
  pt.members.delete(p.id); partyMsg(pt, `${p.name}님이 파티를 ${why || '떠났습니다'}.`, '#ccc');
  if (pt.members.size <= 1) { for (const id of pt.members) { const q = PLAYERS.get(id); if (q) { q.party = null; sysMsg(q, '파티가 해산되었습니다.', '#ccc'); } } PARTIES.delete(pt.id); }
  else if (pt.leader === p.id) { pt.leader = [...pt.members][0]; const L = PLAYERS.get(pt.leader); if (L) partyMsg(pt, `${L.name}님이 파티장이 되었습니다.`); }
}
const SAVE_KEYS = ['plot', 'house', 'name', 'gender', 'hair', 'hairColor', 'skin', 'job', 'lv', 'exp', 'hp', 'mp', 'coins', 'map', 'x', 'y', 'dir', 'inv', 'eq', 'mounts', 'mount', 'storage', 'tent', 'hot', 'kills', 'backPos', 'opened', 'tmapTarget', 'pouches', 'ownKey'];
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
    if (s.tent && MAPS[s.tent.map]) { MAPS[s.tent.map].tents.push(Object.assign(s.tent, { owner: nm })); try { clearTentGround(MAPS[s.tent.map], s.tent); } catch (e) { } }
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
const INV_MAX = 36, STORE_MAX = 48, POUCH_MAX = 16, POUCH_N = 4;
function addItem(p, it, list = 'inv') {
  const arr = p[list]; const max = list === 'inv' ? INV_MAX : STORE_MAX;
  if (it.k !== 'gear') {
    const ex = arr.find(o => o.k === it.k && o.id === it.id && o.n < 999);
    if (ex) { ex.n += it.n; return true; }
  }
  if (arr.length >= max) return false;
  arr.push(it); return true;
}
function mountItems(p) { return [p.inv || [], p.storage || [], ...(p.pouches || [])].flat().filter(o => o && o.k === 'mount'); }
function ownsMount(p, id) { return p.mount === id || mountItems(p).some(o => o.id === id); }
function ownedMounts(p) { const s = new Set(mountItems(p).map(o => o.id)); if (p.mount) s.add(p.mount); return [...s]; }
function giveMount(p, id) { if (!addItem(p, { k: 'mount', id, n: 1 }) && !addItem(p, { k: 'mount', id, n: 1 }, 'storage')) p.inv.push({ k: 'mount', id, n: 1 }); }
function equipMount(p, i) {
  const it = p.inv[i]; if (!it || it.k !== 'mount' || !D.MOUNTS[it.id]) return; const id = it.id;
  if (p.mount === id) { p.riding = true; calc(p); dirty(p); return; }
  if (--it.n <= 0) p.inv.splice(i, 1);
  if (p.mount && D.MOUNTS[p.mount]) giveMount(p, p.mount);
  p.mount = id; p.riding = true; calc(p); dirty(p);
  sysMsg(p, `[${D.MOUNTS[id].name}] 장착! 장비창 탈것 칸에 들어갔어요. (탈것 버튼·R로 타고 내리기)`, '#ffd27a');
}
function countMat(p, id) { return p.inv.filter(o => (o.k === 'mat' || o.k === 'use') && o.id === id).reduce((a, o) => a + o.n, 0); }
function hasMats(p, need) { return Object.entries(need).every(([k, v]) => countMat(p, k) >= v); }
function takeMats(p, need) {
  for (const [k, v0] of Object.entries(need)) { let v = v0; for (const o of p.inv) if ((o.k === 'mat' || o.k === 'use') && o.id === k && v > 0) { const t = Math.min(o.n, v); o.n -= t; v -= t; } }
  p.inv = p.inv.filter(o => o.k === 'gear' || o.n > 0);
}
function calc(p) {
  const J = D.JOBS[p.job], B = D.JOBS[J.base]; const L = p.lv - 1;
  let maxHp = B.hp0 + B.hpL * L, maxMp = B.mp0 + B.mpL * L, atk = B.atk0 + B.atkL * L, def = B.def0 + B.defL * L, crit = J.crit || 5, luck = 0;
  if (J.tier) { maxHp *= J.mHp || 1; def *= J.mDef || 1; atk *= J.mAtk || 1; maxMp *= J.mMp || 1; }
  for (const s of D.SLOTS) { const it = p.eq[s]; if (!it) continue; const g = gearPower(it, p.lv); atk += g.atk || 0; def += g.def || 0; maxHp += g.hp || 0; maxMp += g.mp || 0; crit += g.crit || 0; luck += g.luck || 0; }
  let ba = 0, bd = 0, bc = 0, bl = 0, bs = 0, be = 0, bh = 0; const now = Date.now();
  p.buffs = (p.buffs || []).filter(b => b.until > now);
  for (const b of p.buffs) { ba += b.atk || 0; bd += b.def || 0; bc += b.crit || 0; bl += b.luck || 0; bs += b.spd || 0; be += b.exp || 0; bh += b.hp || 0; }
  maxHp *= 1 + bh;
  atk *= 1 + ba; def *= Math.max(0.2, 1 + bd);
  let spd = D.BASE_SPEED; if (p.riding && p.mount) spd /= D.MOUNTS[p.mount].spd; spd /= 1 + bs; crit += bc; luck += bl;
  p.st = { maxHp: Math.round(maxHp), maxMp: Math.round(maxMp), atk: Math.round(atk), def: Math.round(def), crit: Math.min(60, crit), luck, spd: Math.round(spd), heal: J.heal || 1, expB: be };
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
  const fb = (p.buffs || []).find(b => b.form && b.until > Date.now());
  return { job: p.job, g: p.gender, h: p.hair, hc: p.hairColor, sk: p.skin, eq, mt: p.riding && p.mount ? p.mount : 0, fm: fb ? fb.form : 0 };
}
function meData(p) {
  calc(p);
  const tc = p.tmapTarget && CHESTS.get(p.tmapTarget); return { t: 'me', pouches: p.pouches, tmark: tc ? { map: tc.map, x: tc.x, y: tc.y } : null, name: p.name, job: p.job, lv: p.lv, exp: p.exp, need: D.expNeed(p.lv), hp: p.hp, mp: p.mp, st: p.st, coins: p.coins, inv: p.inv, eq: p.eq, mounts: ownedMounts(p), mount: p.mount, riding: !!p.riding, storage: p.storage, tent: p.tent ? { map: p.tent.map, x: p.tent.x, y: p.tent.y } : null, house: p.house ? { map: p.house.map, x: p.house.x, y: p.house.y } : null, plot: p.plot || null, skills: D.skillsFor(p.job).map(s => s.id), cds: p.cds, gender: p.gender, hair: p.hair, hairColor: p.hairColor, skin: p.skin, kills: p.kills, hot: Array.isArray(p.hot) && p.hot.length ? p.hot : ['hp1', 'mp1'] };
}
const dirty = p => { p.dirty = true; };
function sysMsg(p, text, c = '#ffe28a') { if (p.ws) p.ws.send({ t: 'msg', text, c }); }
function broadcast(o, mapId) { const s = JSON.stringify(o); for (const p of PLAYERS.values()) if (!mapId || p.map === mapId) p.ws.send(s); }
function announce(text, c = '#ffb84d') { broadcast({ t: 'msg', text, c, big: 1 }); }
function fx(m, o) { m.fx.push(o); }

function sendMap(p) {
  const m = MAPS[p.map];
  p.ws.send({ t: 'map', inner: m.inner || 0, chests: chestList(p, m), ponds: m.ponds || null, id: m.id, name: m.name, w: m.w, h: m.h, tiles: b64(m.t), portals: m.portals, npcs: m.npcs, labels: m.labels, lights: m.lights, towns: m.towns.map(t => ({ name: t.name, x0: t.x0, y0: t.y0, x1: t.x1, y1: t.y1 })), dark: m.dark, pal: m.pal || 0, castle: m.castle || 0, biome: m.id === 'world' ? biomeStr(m) : null });
  sendTents(m);
}
let _bs = null;
function biomeStr(m) { if (_bs) return _bs; const k = { grass: 'g', forest: 'f', desert: 'd', snow: 's', swamp: 'w', volcano: 'v' }; _bs = m.biome.map(b => k[b]).join(''); return _bs; }
function sendTents(m) { broadcast({ t: 'tents', map: m.id, list: m.tents.map(t => ({ owner: t.owner, kind: t.kind || 'tent', inner: t.inner ? 1 : 0, x: t.x, y: t.y, w: t.w, h: t.h, furn: t.furn })), plots: PLOTS.filter(q => q.map === m.id).map(q => ({ id: q.id, x: q.x, y: q.y, sx: q.sx, sy: q.sy, owner: q.owner, price: q.price })) }, m.id); }

function teleport(p, mapId, x, y, near) {
  const old = MAPS[p.map];
  if (old && p.summons) for (const s of p.summons) { old.mons.delete(s.id); occDel(old, s.x, s.y); }
  if (!MAPS[mapId]) { mapId = 'world'; x = MAPS.world.spawn.x; y = MAPS.world.spawn.y; near = 1; }
  p.map = mapId; const m = MAPS[mapId];
  const pos = near ? nearFree(m, x, y) : { x, y };
  { const q = nearFreeBody(m, pos.x, pos.y, p); pos.x = q.x; pos.y = q.y; }
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
// 경험치: 공격 기여도(데미지 비율)로 분배. 함께 싸우면 1인당 +10% 보너스.
// 파티원은 근처(12칸)에 있으면 파티 몫을 모아 똑같이 나눔 (+파티 인원당 10%).
function shareExp(m, mon, killer) {
  const by = mon.dmgBy || {}; const ids = Object.keys(by).filter(id => { const q = PLAYERS.get(id); return q && q.map === m.id && !q.dead; });
  if (!ids.length && killer) ids.push(killer.id), by[killer.id] = 1;
  const tot = ids.reduce((a, id) => a + by[id], 0) || 1;
  const pool = mon.exp * (1 + 0.1 * (ids.length - 1));
  const gain = new Map(); const add = (q, v) => gain.set(q, (gain.get(q) || 0) + v);
  const partyPool = new Map();
  for (const id of ids) {
    const q = PLAYERS.get(id), v = pool * by[id] / tot; const pt = q.party && PARTIES.get(q.party);
    if (pt) partyPool.set(pt, (partyPool.get(pt) || 0) + v); else add(q, v);
  }
  for (const [pt, v] of partyPool) {
    const mem = [...pt.members].map(id => PLAYERS.get(id)).filter(q => q && q.map === m.id && !q.dead && dist(q, mon) <= 12);
    if (!mem.length) continue; const each = v * (1 + 0.1 * (mem.length - 1)) / mem.length;
    for (const q of mem) add(q, each);
  }
  for (const [q, v] of gain) { const e = Math.max(1, Math.round(v)); gainExp(q, e); if (ids.length > 1) sysMsg(q, `경험치 +${fmtN(e)} (기여도 ${Math.round(100 * (by[q.id] || 0) / tot)}%${q.party ? ' · 파티 분배' : ''})`, '#a8e8ff'); }
}
const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function killMon(m, mon, killer) {
  m.mons.delete(mon.id); occDel(m, mon.x, mon.y);
  if (mon.summon) return;
  const def = D.MONS[mon.type];
  fx(m, { k: 'die', x: mon.x, y: mon.y, b: mon.boss ? 1 : 0 });
  if (mon.zone) mon.zone.count--;
  shareExp(m, mon, killer);
  if (killer) killer.kills = (killer.kills || 0) + 1;
  const luck = killer ? killer.st.luck : 0;
  // 코인 (항상)
  if (mon.stalker && R() < 0.12) dropAt(m, mon.x, mon.y, { k: 'mat', id: '보물지도 조각', n: 1 }, killer);
  // 보스 전용 탈것: 낮은 확률로 '탈것 증표' (교환 가능)
  if (mon.boss) { const BM = { bearKing: 'battleBear', scorpionKing: 'goldScorpion', yetiKing: 'frostWolf', spiderQueen: 'boneDrake', skelKing: 'boneDrake', corpseLord: 'boneDrake' }; const id = BM[mon.type] || (def.lv >= 60 ? 'nightmare' : null);
    if (id && R() < (mon.type === 'abyssKing' ? 0.25 : 0.1)) { dropAt(m, mon.x, mon.y, { k: 'use', id: 'mtk_' + id, n: 1 }, killer); announce(`✨ [${D.MOUNTS[id].name}] 탈것 증표가 떨어졌습니다!`, '#ffd27a'); } }
  if (def.lv >= 56 && !mon.boss && R() < 0.015) dropAt(m, mon.x, mon.y, { k: 'mat', id: '보물지도 조각', n: 1 }, killer);
  if (['fallenKing', 'prisonLord', 'abyssKing'].includes(mon.type) && R() < (mon.type === 'abyssKing' ? 0.06 : 0.02)) { const L = makeLegend(pick(Object.keys(D.LEGENDS))); dropAt(m, mon.x, mon.y, L, killer); announce(`전설의 [${L.name}]이(가) 떨어졌습니다!`, '#ff7a4a'); }
  const coin = Math.floor(mon.coin * (0.8 + R() * 0.5) * (1 + luck / 100) * (mon.boss ? 15 : mon.mutant ? 2.5 : 1));
  dropAt(m, mon.x, mon.y, { k: 'coin', n: coin }, killer);
  // 장비 (낮은 확률)
  const itemChance = (mon.boss ? 100 : mon.mutant ? 12 : 4.2) * (1 + luck / 100);
  const crew = mon.boss ? (() => { const ids = new Set(Object.keys(mon.dmgBy || {})); for (const q of PLAYERS.values()) if (q.map === m.id && !q.dead && dist(q, mon) <= 13) ids.add(q.id); if (killer) { const pt = killer.party && PARTIES.get(killer.party); if (pt) for (const id of pt.members) { const q = PLAYERS.get(id); if (q && q.map === m.id && dist(q, mon) <= 20) ids.add(id); } } return [...ids].map(id => PLAYERS.get(id)).filter(Boolean).slice(0, 8); })() : [];
  const nItems = mon.boss ? Math.max(2 + ri(0, 1), crew.length + 1) : (R() * 100 < itemChance ? 1 : 0);
  for (let i = 0; i < nItems; i++) {
    const who = crew[i]; const job = who ? D.JOBS[who.job].base : crew.length ? D.JOBS[pick(crew).job].base : pick(['warrior', 'mage', 'healer']); // 보스: 참여자마다 자기 직업 장비 1개 + 1개 더 // 일반 몬스터는 직업 무관 랜덤 → 교환으로 해결
    const slots = job === 'warrior' ? D.SLOTS : D.SLOTS.filter(s => s !== 'shield');
    const lvl = mon.boss ? D.bossGearLv(def.lv, R) : clamp(def.lv + ri(-2, 2) + (mon.mutant ? 2 : 0), 1, 50); // 50등급 이상은 보스만
    dropAt(m, mon.x, mon.y, makeGear(job, pick(slots), lvl, { luck, bonus: mon.boss ? 20 : mon.mutant ? 8 : 0, minRar: mon.boss ? 1 : 0 }), who || killer);
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
    const it = makeGear(base, slot, D.bossGearLv(def.lv, R), { minRar: 3 });
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
  if (p.lv >= D.MAX_LEVEL) return; e = Math.round(e * (1 + ((p.st && p.st.expB) || 0)));
  p.exp += e; let up = false;
  while (p.lv < D.MAX_LEVEL && p.exp >= D.expNeed(p.lv)) { p.exp -= D.expNeed(p.lv); p.lv++; up = true; }
  if (up) {
    calc(p); p.hp = p.st.maxHp; p.mp = p.st.maxMp;
    fx(MAPS[p.map], { k: 'lvl', x: p.x, y: p.y });
    sysMsg(p, `✨ 레벨 업! Lv.${p.lv}`, '#7dffb0');
    const nsk = D.SKILLS.filter(s => D.canSkill(s, p.job) && s.lv === p.lv); nsk.forEach(s => sysMsg(p, `새 스킬 [${s.name}] 습득!`, '#9ad7ff'));
    if (p.lv === D.PROMO_LEVEL && D.JOBS[p.job].tier === 0) sysMsg(p, `🎖 전직이 가능합니다! 마을의 [전직교관 무영]을 찾아가세요.`, '#e0a8ff');
    if (p.lv === D.PROMO2_LEVEL && D.JOBS[p.job].tier === 1) sysMsg(p, `👑 3차 전직이 가능합니다! 마을의 [전직교관 무영]을 찾아가세요.`, '#ffd27a');
  }
  dirty(p);
}

function monCanStep(m, x, y) {
  if (!walkable(m, x, y)) return false;
  if (m.chests.length && m.chests.some(c => c.x === x && c.y === y)) return false;
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
  if (mon.boss) { if (tg) { mon.lastFight = now; bossPattern(m, mon, def, now); } else if (mon.hp < mon.maxHp && now - (mon.lastFight || 0) > 8000 && now > (mon.regenT || 0)) { mon.regenT = now + 1000; mon.hp = Math.min(mon.maxHp, mon.hp + Math.round(mon.maxHp * 0.03)); if (mon.hp >= mon.maxHp) { mon.enraged = 0; mon.called = 0; mon.atk = mon.baseAtk || mon.atk; mon.dmgBy = {}; } } }
  const moveInt = (mon.boss ? 520 : def.kind === 'bat' || def.kind === 'quad' ? 520 : def.kind === 'golem' || def.kind === 'zombie' || def.kind === 'slime' ? 900 : 700) * slow;
  if (tg) {
    const rng2 = def.rng || 1;
    const inRange = rng2 > 1 ? (dist(tg, mon) <= rng2 && los(m, mon, tg)) : adjacent(mon, tg);
    if (!mon.boss && monSkill(m, mon, def, tg, now)) { /* 특성 스킬 사용 */ }
    else if (inRange) {
      mon.dir = Math.abs(tg.x - mon.x) > Math.abs(tg.y - mon.y) ? (tg.x > mon.x ? 2 : 1) : (tg.y > mon.y ? 0 : 3);
      if (now >= mon.nextAtk) {
        mon.nextAtk = now + (mon.boss ? (mon.enraged ? 850 : 1050) : 1350);
        if (rng2 > 1) fx(m, { k: 'proj', f: 'mshot', fx: mon.x, fy: mon.y, tx: tg.x, ty: tg.y, c: def.c[2] });
        else fx(m, { k: 'mhit', x: mon.x, y: mon.y, tx: tg.x, ty: tg.y });
        hurt(m, tg, mon.atk, mon);
        // 보스 광역 공격
        if (mon.boss && R() < 0.15) {
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
  // 주인과 너무 멀어지면 주인 곁으로 순간이동
  if (dist(s, owner) > 14) { const q = nearFree(m, owner.x, owner.y); occDel(m, s.x, s.y); s.x = q.x; s.y = q.y; occAdd(m, s.x, s.y); s.target = null; }
  // 목표: 주인 주변(5칸)의 몬스터만. 목표가 주인에게서 7칸 이상 멀어지면 포기하고 돌아옴
  let tg = s.target && m.mons.get(s.target);
  if (!tg || tg.summon || tg.hp <= 0 || dist(tg, owner) > 10 || dist(s, owner) > 11) {
    tg = null; let bd = 99;
    for (const mon of m.mons.values()) if (!mon.summon && mon.hp > 0 && dist(mon, owner) <= 7) { const d = dist(mon, s) + dist(mon, owner) * 0.5; if (d < bd) { bd = d; tg = mon; } }
    // 주인을 공격 중인 몬스터 우선
    for (const mon of m.mons.values()) if (!mon.summon && mon.target === owner.id && dist(mon, owner) <= 6) { tg = mon; break; }
    s.target = tg ? tg.id : null;
  }
  const moveInt = Math.max(180, Math.min(380, (owner.st && owner.st.spd) || 300)); // 주인 속도에 맞춰 따라감
  if (tg) {
    const inRange = def.range > 1 ? dist(tg, s) <= def.range : adjacent(s, tg);
    if (inRange) { if (now >= s.nextAtk) { s.nextAtk = now + 1000; fx(m, { k: 'satk', x: s.x, y: s.y, tx: tg.x }); if (def.range > 1) fx(m, { k: 'proj', f: 'fireball', fx: s.x, fy: s.y, tx: tg.x, ty: tg.y, c: '#a050ff' }); hitMon(m, tg, owner, s.atk, 1, true); if (def.taunt && tg.target !== s.id) tg.target = s.id; } }
    else if (now >= s.nextMove) { s.nextMove = now + moveInt; stepToward(m, s, tg.x, tg.y); }
  } else if (now >= s.nextMove && dist(s, owner) > 1.5) { s.nextMove = now + moveInt; if (!stepToward(m, s, owner.x, owner.y) && dist(s, owner) > 4) { const q = nearFree(m, owner.x, owner.y); occDel(m, s.x, s.y); s.x = q.x; s.y = q.y; occAdd(m, s.x, s.y); } }
}

// ═══ 몬스터 특성 스킬 (레벨이 높을수록 많아짐) ═══
function monSkill(m, mon, def, tg, now) {
  const sk = mon.sk || (mon.sk = D.monSkills(def, mon.mutant)); if (!sk.length) return false;
  const A = mon.atk, d = dist(tg, mon); const live = () => m.mons.has(mon.id) && mon.hp > 0; mon.scd = mon.scd || {};
  const ready = (k, cd) => { if ((mon.scd[k] || 0) > now) return false; mon.scd[k] = now + cd + ri(0, 1500); return true; };
  const isP = tg.ws !== undefined || PLAYERS.has(tg.id);
  for (const k of sk) {
    if (k === 'frenzy') { if (!mon.fz && mon.hp < mon.maxHp * 0.4) { mon.fz = 1; mon.atk = Math.round(mon.atk * 1.4); fx(m, { k: 'skill', f: 'buff', x: mon.x, y: mon.y, c: '#ff3020' }); } continue; }
    if (k === 'heal' && mon.hp < mon.maxHp * 0.7 && ready(k, 9000)) { fx(m, { k: 'skill', f: 'heal', x: mon.x, y: mon.y, r: 3, c: '#7dff9a' }); for (const o of m.mons.values()) if (!o.summon && dist(o, mon) <= 3.5) { const h = Math.round(o.maxHp * 0.18); o.hp = Math.min(o.maxHp, o.hp + h); fx(m, { k: 'heal', x: o.x, y: o.y, v: h }); } return true; }
    if (k === 'charge' && d >= 2 && d <= 5 && ready(k, 7000)) { const q = nearFreeMon(m, tg.x - Math.sign(tg.x - mon.x), tg.y - Math.sign(tg.y - mon.y)); if (dist(q, tg) > 1.5) continue; fx(m, { k: 'warn', x: tg.x, y: tg.y, r: 0.6, ms: 600 }); setTimeout(() => { if (!live()) return; moveMon(m, mon, q.x, q.y); fx(m, { k: 'skill', f: 'slash', x: tg.x, y: tg.y, c: '#ffd34d' }); if (dist(tg, mon) <= 1.6) hurt(m, tg, Math.round(A * 1.5), mon); }, 600); return true; }
    if (k === 'blink' && d >= 2.5 && d <= 7 && ready(k, 8000)) { const q = nearFreeMon(m, tg.x + Math.sign(tg.x - mon.x), tg.y + Math.sign(tg.y - mon.y)); fx(m, { k: 'skill', f: 'summon', x: mon.x, y: mon.y, c: '#b07cff' }); moveMon(m, mon, q.x, q.y); fx(m, { k: 'skill', f: 'summon', x: q.x, y: q.y, c: '#b07cff' }); mon.nextAtk = now + 400; return true; }
    if (k === 'slam' && d <= 1.6 && ready(k, 8000)) { const r = 1.6; fx(m, { k: 'warn', x: mon.x, y: mon.y, r, ms: 900 }); setTimeout(() => { if (!live()) return; fx(m, { k: 'skill', f: 'quake', x: mon.x, y: mon.y, r, c: '#c9a26b' }); for (const p of PLAYERS.values()) if (p.map === m.id && !p.dead && dist(p, mon) <= r + 0.4) hurt(m, p, Math.round(A * 1.4), mon); }, 900); mon.nextAtk = now + 1500; return true; }
    if (k === 'breath' && d <= 5 && ready(k, 9000)) { const c = { x: tg.x, y: tg.y }; fx(m, { k: 'warn', x: c.x, y: c.y, r: 1.8, ms: 1100 }); setTimeout(() => { if (!live()) return; fx(m, { k: 'proj', f: 'fireball', fx: mon.x, fy: mon.y, tx: c.x, ty: c.y, c: '#ff5a00' }); fx(m, { k: 'skill', f: 'flame', x: c.x, y: c.y, r: 1.8, c: '#ff5a00' }); for (const p of PLAYERS.values()) if (p.map === m.id && !p.dead && dist(p, c) <= 2.1) hurt(m, p, Math.round(A * 1.7), mon); }, 1100); return true; }
    if (k === 'summon' && !mon.called && mon.hp < mon.maxHp * 0.7 && ready(k, 60000)) { mon.called = 1; const pool = Object.keys(D.MONS).filter(t => { const v = D.MONS[t]; return !v.boss && !v.p && v.lv <= def.lv - 8 && v.lv >= def.lv - 22; }); if (!pool.length) continue; const t = pick(pool); for (let i = 0; i < 2; i++) { const q = nearFreeMon(m, mon.x + ri(-1, 1), mon.y + ri(-1, 1)); const mo = spawnMon(m, t, q.x, q.y); if (mo) { mo.target = mon.target; fx(m, { k: 'skill', f: 'summon', x: q.x, y: q.y, c: '#b07cff' }); } } return true; }
    if (!isP) continue;
    if (k === 'curse' && d <= 5 && ready(k, 12000)) { fx(m, { k: 'proj', f: 'mshot', fx: mon.x, fy: mon.y, tx: tg.x, ty: tg.y, c: '#a050ff' }); fx(m, { k: 'skill', f: 'ring', x: tg.x, y: tg.y, r: 1, c: '#a050ff' }); addBuff(tg, '저주', { def: -0.3, atk: -0.15 }, 8000); sysMsg(tg, `☠ ${def.name}의 저주! 8초간 방어 -30% 공격 -15%`, '#d08aff'); return true; }
    if (k === 'poison' && d <= 1.6 && ready(k, 9000)) { fx(m, { k: 'skill', f: 'ring', x: tg.x, y: tg.y, r: 0.8, c: '#7aff3b' }); hurt(m, tg, Math.round(A * 0.8), mon); const pd = Math.max(1, Math.round(A * 0.22)); sysMsg(tg, `🟢 ${def.name}의 독! 4초간 체력이 줄어요`, '#9aff6a'); for (let i = 1; i <= 4; i++) setTimeout(() => { if (!tg.dead && tg.map === m.id) hurt(m, tg, pd, mon); }, i * 1000); mon.nextAtk = now + 1200; return true; }
    if (k === 'drain' && d <= 1.6 && ready(k, 8000)) { fx(m, { k: 'skill', f: 'ring', x: tg.x, y: tg.y, r: 0.8, c: '#ff2a5a' }); const before = tg.hp; hurt(m, tg, Math.round(A * 1.3), mon); const got = Math.max(0, before - tg.hp); const h = Math.round(got * 0.8 + mon.maxHp * 0.04); mon.hp = Math.min(mon.maxHp, mon.hp + h); fx(m, { k: 'heal', x: mon.x, y: mon.y, v: h }); mon.nextAtk = now + 1200; return true; }
  }
  return false;
}
// ═══ 보스 패턴: 경고 장판 → 피할 수 있는 광역기 · 체력 60% 졸개 소환 · 30% 분노 ═══
function bossPattern(m, mon, def, now) {
  if (!mon.baseAtk) mon.baseAtk = mon.atk;
  const live = () => m.mons.has(mon.id) && mon.hp > 0;
  const near = r => [...PLAYERS.values()].filter(p => p.map === m.id && !p.dead && dist(p, mon) <= r);
  if (!mon.enraged && mon.hp < mon.maxHp * 0.3) { mon.enraged = 1; mon.atk = Math.round(mon.baseAtk * 1.35); fx(m, { k: 'skill', f: 'flame', x: mon.x, y: mon.y, r: 3.5, c: '#ff3020' }); announce(`🔥 [${def.name}]이(가) 분노했습니다! 공격이 더 빠르고 강해집니다!`, '#ff5a3a'); }
  if (!mon.called && mon.hp < mon.maxHp * 0.6) {
    mon.called = 1; const pool = Object.keys(D.MONS).filter(k => { const v = D.MONS[k]; return !v.boss && !v.p && v.lv <= def.lv && v.lv >= def.lv - 18; });
    if (pool.length) { const t = pick(pool); for (let i = 0; i < 3 + (near(10).length > 2 ? 1 : 0); i++) { const q = nearFreeMon(m, mon.x + ri(-2, 2), mon.y + ri(-2, 2)); const mo = spawnMon(m, t, q.x, q.y); if (mo) { mo.target = mon.target; fx(m, { k: 'skill', f: 'summon', x: q.x, y: q.y, c: def.aura }); } } announce(`⚠ [${def.name}]이(가) 부하를 불렀습니다!`, '#ffb020'); }
  }
  if (!mon.nextSkill) { mon.nextSkill = now + 2500; return; }
  if (now < mon.nextSkill) return;
  const ps = near(9); if (!ps.length) return;
  mon.nextSkill = now + (mon.enraged ? 4200 : 6000) + ri(0, 1500);
  const roll = R(), A = mon.atk;
  if (roll < 0.4) { // 대지 강타: 보스 주변, 1.2초 뒤 (밖으로 피하면 안 맞음)
    const r = 3.5; fx(m, { k: 'warn', x: mon.x, y: mon.y, r, ms: 1200 });
    setTimeout(() => { if (!live()) return; fx(m, { k: 'skill', f: 'quake', x: mon.x, y: mon.y, r, c: def.aura }); for (const p of near(r + 0.4)) hurt(m, p, Math.round(A * 1.6), mon); }, 1200);
  } else if (roll < 0.8) { // 낙하 폭발: 플레이어 발밑 최대 3곳, 1.3초 뒤
    for (const t of ps.sort(() => R() - 0.5).slice(0, 3)) { const c = { x: t.x, y: t.y }; fx(m, { k: 'warn', x: c.x, y: c.y, r: 1.5, ms: 1300 });
      setTimeout(() => { if (!live()) return; fx(m, { k: 'skill', f: 'meteor', x: c.x, y: c.y, r: 1.5, c: def.aura }); for (const p of PLAYERS.values()) if (p.map === m.id && !p.dead && dist(p, c) <= 1.8) hurt(m, p, Math.round(A * 1.9), mon); }, 1300); }
  } else { // 포효: 주변 모두 피해 (피할 수 없음 → 치유가 필요)
    fx(m, { k: 'skill', f: 'ring', x: mon.x, y: mon.y, r: 7, c: def.aura }); for (const p of near(7)) { hurt(m, p, Math.round(A * 0.75), mon); }
  }
}
function hurt(m, tg, raw, src) {
  if (tg.summon) { const K = 50 + ((src && src.lv) || 10) * 14; const d = Math.max(1, Math.round(raw * (0.85 + R() * 0.3) * K / (K + (tg.def || 0)))); tg.hp -= d; fx(m, { k: 'dmg', x: tg.x, y: tg.y, v: d, p: 1 }); return; }
  const p = tg; if (p.dead) return;
  calc(p);
  // 방어력은 '빼기'가 아니라 '비율'로 줄임 → 방어력이 아무리 높아도 공격 레벨에 맞는 피해는 들어옴(1 고정 없음)
  const aLv = (src && src.lv) || p.lv; const K = 50 + aLv * 14;
  let d = Math.max(1, Math.round(raw * (0.85 + R() * 0.3) * K / (K + p.st.def)));
  if (D.JOBS[p.job] && D.JOBS[p.job].base === 'warrior') d = Math.max(1, Math.round(d * 0.88)); // 전사 기본 피해 감소 12%
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
  fx(m, { k: 'dmg', x: mon.x, y: mon.y, v: d, c: crit ? 1 : 0, by: fromSummon ? 0 : p.id, i: mon.id, b: mul >= 1.3 ? 1 : 0 });
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
    if (nightNow) announce('🌙 밤이 찾아왔습니다! 들판에 어둠 추적자가 나타납니다. 텐트나 마을 안으로 피하세요!', '#b9a8ff');
    else { clearStalkers(); announce('☀ 날이 밝았습니다. 돌연변이 몬스터와 어둠 추적자들이 사라집니다.', '#ffe48a'); for (const m of Object.values(MAPS)) for (const mon of [...m.mons.values()]) if (mon.mutant && !mon.target) killMonSilent(m, mon); }
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
  if (!sk || p.dead || !D.canSkill(sk, p.job) || p.lv < sk.lv) return;
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
    case 'heal': { fx(m, { k: 'skill', f: sk.fx, x: p.x, y: p.y, r: sk.r, c: sk.col }); healAround(m, p, sk.r, sk.mul); if (sk.revive) for (const q of PLAYERS.values()) if (q.map === p.map && q.dead && dist(q, p) <= sk.r) { q.dead = false; calc(q); q.hp = Math.round(q.st.maxHp * sk.revive); q.mp = Math.max(q.mp || 0, Math.round(q.st.maxMp * 0.2)); dirty(q); fx(m, { k: 'skill', f: 'buff', x: q.x, y: q.y, c: sk.col }); sysMsg(q, `✨ ${p.name}님의 [${sk.name}]으로 되살아났습니다!`, '#fffbd0'); if (q !== p) sysMsg(p, `${q.name}님을 되살렸습니다.`, '#fffbd0'); } break; }
    case 'buff': { if (sk.form) { p.buffs = (p.buffs || []).filter(b => !b.form); p.riding = false; } addBuff(p, sk.name, sk.form ? Object.assign({ form: sk.form }, sk.buff) : sk.buff, sk.dur); if (sk.form) { p.hp = Math.min(p.st.maxHp, p.hp + Math.round(p.st.maxHp * (sk.buff.hp || 0))); announce(`✨ ${p.name}님이 [${D.FORMS[sk.form].name}](으)로 변신했습니다!`, D.FORMS[sk.form].col); } fx(m, { k: 'skill', f: 'buff', x: p.x, y: p.y, c: sk.col }); break; }
    case 'partyBuff': { fx(m, { k: 'skill', f: 'bless', x: p.x, y: p.y, r: sk.r, c: sk.col }); for (const q of PLAYERS.values()) if (q.map === p.map && !q.dead && dist(q, p) <= sk.r) { addBuff(q, sk.name, sk.buff, sk.dur); if (q !== p) sysMsg(q, `${p.name}님의 [${sk.name}]!`, '#ffe98a'); } if (sk.healToo) healAround(m, p, sk.r, sk.healToo); break; }
    case 'summon': {
      p.summons = (p.summons || []).filter(s => m.mons.has(s.id));
      while (p.summons.length + sk.count > (D.JOBS[p.job].from === 'summoner' ? 6 : 4)) { const old = p.summons.shift(); m.mons.delete(old.id); occDel(m, old.x, old.y); }
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
function npcNear(p) { const m = MAPS[p.map]; let b = null, bd = 9; for (const n of m.npcs) { const d = Math.max(Math.abs(n.x - p.x), Math.abs(n.y - p.y)); if (d <= 2 && d < bd) { bd = d; b = n; } } return b; }
function openNpc(p, n) {
  const base = D.JOBS[p.job].base;
  switch (n.kind) {
    case 'shop': return p.ws.send({ t: 'dlg', kind: 'shop', npc: n.name, text: '어서 오게! 사냥에 필요한 물약은 다 있다네. 필요 없는 물건은 내가 사 주지.', items: D.SHOP_CONSUMES.map(id => ({ id, ...D.CONSUMES[id] })).concat(D.SHOP_MATS.map(id => ({ id, name: id, mat: 1, price: D.MATS[id].price, desc: '요리 재료' }))) });
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
    case 'stable': return p.ws.send({ t: 'dlg', kind: 'stable', npc: n.name, text: '탈것은 비싸지만 한번 사면 평생 함께라네. [R]키로 타고 내릴 수 있지.', items: Object.entries(D.MOUNTS).map(([id, v]) => ({ id, ...v, owned: ownsMount(p, id) })) });
    case 'bank': return p.ws.send({ t: 'dlg', kind: 'chest', bank: 1, npc: n.name, text: '맡길 물건이 있으면 언제든 오게. 마을 창고와 내 집 보관상자는 같은 창고라네.' });
    case 'master': {
      const J = D.JOBS[p.job];
      if (J.tier === 2) return p.ws.send({ t: 'dlg', kind: 'talk', npc: n.name, text: `[${J.name}]... 이제 더 가르칠 것이 없구나. 대륙을 지켜다오.` });
      if (J.tier === 1) { const opts = (D.PROMOS2[p.job] || []).map(id => ({ id, name: D.JOBS[id].name, desc: D.JOBS[id].desc, skills: D.SKILLS.filter(s => s.jobs.length === 1 && s.jobs[0] === id).map(s => `${s.name}(Lv${s.lv})`) })); return p.ws.send({ t: 'dlg', kind: 'master', npc: n.name, text: p.lv < D.PROMO2_LEVEL ? `[${J.name}]의 길을 잘 걷고 있구나. 레벨 ${D.PROMO2_LEVEL}이 되면 마지막 전직을 해주지.\n\n${J.name}의 3차 전직 갈래:` : '마지막 관문이다. 너의 마지막 길을 선택하거라. (되돌릴 수 없다)', can: p.lv >= D.PROMO2_LEVEL, opts }); }
      return p.ws.send({ t: 'dlg', kind: 'master', npc: n.name, text: p.lv < D.PROMO_LEVEL ? `레벨 ${D.PROMO_LEVEL}이 되면 다시 찾아오게. 그때 너의 길을 정해주지.\n\n${J.name}의 전직 갈래:` : '때가 되었구나. 너의 길을 선택하거라. (한 번 선택하면 되돌릴 수 없다)', can: p.lv >= D.PROMO_LEVEL, opts: D.PROMOS[p.job].map(id => ({ id, name: D.JOBS[id].name, desc: D.JOBS[id].desc, skills: D.SKILLS.filter(s => s.jobs.length === 1 && s.jobs[0] === id).map(s => `${s.name}(Lv${s.lv})`) })) });
    }
    case 'guide': return p.ws.send({ t: 'dlg', kind: 'guide', npc: n.name, text: '바람의 대륙에 온 걸 환영해요!\n\n· 이동: 방향키/WASD  · 공격: 스페이스  · 스킬: 1~6\n· 물약: 7 빨강 / 8 파랑 / 9 보라 / 0 노랑\n· E: NPC·가구 상호작용  · Z: 줍기  · R: 탈것  · B: 집짓기\n· I: 가방  · Tab: 대상 변경  · Enter: 채팅\n· 다른 플레이어를 클릭하면 교환 신청!\n\n· 밤에는 들판에 어둠 추적자가 나타나요. 텐트나 마을 안에 숨으세요!\n· 대륙 곳곳 나무·바위 사이, 버려진 집, 던전·성·감옥 안에 보물상자가 숨겨져 있어요. 전설의 보물상자도 있대요!\n· 보물지도 조각 4개를 모아 사용하면 전설의 보물 위치가 보여요.\n· 잡화상에서 낚싯대를 사서 연못에서 낚시를 해 보세요.\n· 메뉴의 [요리책]에서 모든 레시피와 재료 얻는 곳을 볼 수 있어요.', bosses: bossSchedule() });
  }
}
function shopGear(job, slot, lv, wt) { const it = makeGear(job, slot, lv, { shop: true, wt }); delete it.uid; it.price = D.gearPrice(lv) * (slot === 'weapon' ? 1.4 : 1) | 0; return it; }

// ═══════════════ 교환 ═══════════════
const TRADES = new Map(); // name -> trade
function tradeOf(p) { return TRADES.get(p.name); }
function tradeSend(tr) {
  for (const side of ['a', 'b']) {
    const me = tr[side], other = tr[side === 'a' ? 'b' : 'a'];
    // 아이템은 '가방 몇 번째 칸'이 아니라 아이템 자체로 기억 → 교환 중 가방이 바뀌어도 엉뚱한 것이 가지 않음
    tr.off[side].items = tr.off[side].items.filter(o => tr[side].inv.includes(o.ref));
    const view = s => ({ items: tr.off[s].items.map(o => Object.assign({}, o.ref, o.ref.k === 'gear' ? {} : { n: Math.min(o.n, o.ref.n) })), coins: tr.off[s].coins, lock: tr.lock[s], ok: tr.ok[s] });
    me.ws.send({ t: 'trade', with: other.name, mine: view(side), theirs: view(side === 'a' ? 'b' : 'a'), myIdx: tr.off[side].items.map(o => tr[side].inv.indexOf(o.ref)) });
  }
}
function tradeEnd(tr, msg) { TRADES.delete(tr.a.name); TRADES.delete(tr.b.name); for (const p of [tr.a, tr.b]) { p.ws.send({ t: 'trade', close: 1 }); if (msg) sysMsg(p, msg); } }
function tradeExec(tr) {
  const A = tr.a, B = tr.b;
  if (A.coins < tr.off.a.coins || B.coins < tr.off.b.coins) return tradeEnd(tr, '코인이 부족해 교환이 취소되었습니다.');
  // 올린 아이템이 그대로 있는지 확인 (없거나 개수가 줄었으면 취소)
  for (const [P, s] of [[A, 'a'], [B, 'b']]) for (const o of tr.off[s].items) if (!P.inv.includes(o.ref) || (o.ref.k !== 'gear' && o.ref.n < o.n)) return tradeEnd(tr, '올린 아이템이 바뀌어 교환이 취소되었습니다. 다시 시도해 주세요.');
  const takeOut = (P, offs) => { const out = []; const rm = new Set(); for (const o of offs) { const it = o.ref; if (it.k === 'gear' || o.n >= it.n) { out.push(it); rm.add(it); } else { it.n -= o.n; out.push(Object.assign({}, it, { n: o.n })); } } P.inv = P.inv.filter(x => !rm.has(x)); return out; };
  if (A.inv.length + tr.off.b.items.length > INV_MAX + tr.off.a.items.length || B.inv.length + tr.off.a.items.length > INV_MAX + tr.off.b.items.length) return tradeEnd(tr, '가방이 가득 차 교환이 취소되었습니다.');
  const ia = takeOut(A, tr.off.a.items), ib = takeOut(B, tr.off.b.items);
  // 받는 쪽 가방이 차면: 창고 → 그래도 없으면 발밑에 떨어뜨림 (절대 사라지지 않게)
  const give = (P, x) => { delete x._rm; if (addItem(P, x)) return; if (addItem(P, x, 'storage')) return sysMsg(P, `가방이 가득 차서 [${x.name || x.id}]은(는) 마을 창고로 보냈습니다.`, '#ffd166'); dropAt(MAPS[P.map], P.x, P.y, x, P.name); sysMsg(P, `가방이 가득 차서 [${x.name || x.id}]을(를) 발밑에 내려놓았습니다.`, '#ffd166'); };
  ia.forEach(x => give(B, x)); ib.forEach(x => give(A, x));
  A.coins += tr.off.b.coins - tr.off.a.coins; B.coins += tr.off.a.coins - tr.off.b.coins;
  dirty(A); dirty(B); tradeEnd(tr, '🤝 교환이 완료되었습니다!');
}

// ═══════════════ 접속/메시지 ═══════════════
// 캐릭터 삭제: 만든 기기(ownKey)만 가능. 접속 중이면 불가
function delChar(name, key, ws) {
  const sv = SAVES[name]; if (!sv) return;
  if ([...PLAYERS.values()].some(q => q.name === name)) return ws.send({ t: 'err', text: `${name}: 접속 중이라 삭제할 수 없어요.` });
  if (sv.ownKey && sv.ownKey !== key) return ws.send({ t: 'err', text: `${name}: 다른 기기에서 만든 캐릭터라 삭제할 수 없어요.` });
  for (const m of Object.values(MAPS)) {
    if (m.tents && m.tents.length) { const before = m.tents.length; m.tents = m.tents.filter(t => t.owner !== name || t.inner); if (m.tents.length !== before) sendTents(m); }
  }
  for (const pl of PLOTS) if (pl.owner === name) pl.owner = null;
  {
  }
  if (MAPS[tentInId(name)]) delete MAPS[tentInId(name)];
  delete SAVES[name]; try { saveAll(); } catch (e) { }
}
function onConnect(ws) {
  let p = null;
  ws.onmsg = raw => {
    let msg; try { msg = JSON.parse(raw); } catch (e) { return; }
    try {
      if (!p) {
        if (msg.t === 'delChar' || (msg.del && Array.isArray(msg.del))) { for (const dn of (msg.t === 'delChar' ? [msg.name] : msg.del)) delChar(String(dn || '').slice(0, 10), msg.key, ws); if (msg.t === 'delChar') return; }
        if (msg.t === 'login') {
          const name = String(msg.name || '').trim().slice(0, 10);
          if (!name) return ws.send({ t: 'err', text: '이름을 입력하세요.' });
          if ([...PLAYERS.values()].some(q => q.name === name)) return ws.send({ t: 'err', text: '이미 접속 중인 이름입니다.' });
          if (!SAVES[name]) return ws.send({ t: 'needCreate', name });
          p = Object.assign({}, JSON.parse(JSON.stringify(SAVES[name])));
          p.tent = SAVES[name].tent; p.house = SAVES[name].house; // 맵의 구조물 객체 공유
          if (!p.ownKey && msg.key) p.ownKey = String(msg.key).slice(0, 40); // 예전 캐릭터: 처음 접속한 기기가 주인
          enter(p, ws);
        } else if (msg.t === 'create') {
          const name = String(msg.name || '').trim().slice(0, 10);
          if (!name || SAVES[name] || [...PLAYERS.values()].some(q => q.name === name)) return ws.send({ t: 'err', text: '사용할 수 없는 이름입니다.' });
          p = newPlayer(Object.assign({}, msg, { name })); p.ownKey = msg.key ? String(msg.key).slice(0, 40) : null; calc(p); p.hp = p.st.maxHp; p.mp = p.st.maxMp;
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
    partyLeave(p, '떠났습니다(접속 종료)');
    const m = MAPS[p.map]; if (p.summons) for (const s of p.summons) { m.mons.delete(s.id); occDel(m, s.x, s.y); }
    p.summons = [];
    SAVES[p.name] = snapshotSave(p); PLAYERS.delete(p.id);
    announce(`${p.name}님이 떠났습니다.`, '#aaa'); saveAll();
  };
}
function enter(p, ws) {
  p.id = 'p' + uid(); p.ws = ws; p.buffs = []; p.cds = {}; p.summons = []; p.dead = false; p.riding = false; p.lastMove = 0;
  p.inv = p.inv || []; p.pouches = Array.isArray(p.pouches) ? p.pouches : [[], []]; p.eq = p.eq || {}; p.mounts = p.mounts || []; p.storage = p.storage || []; if (p.mount && !D.MOUNTS[p.mount]) p.mount = null; if (p.mounts.length) { for (const id of p.mounts) if (D.MOUNTS[id] && id !== p.mount && !mountItems(p).some(o => o.id === id)) giveMount(p, id); p.mounts = []; }
  for (const it of p.inv) if (it && it._rm) delete it._rm; // 예전 교환 버그 표시 정리
  // 텐트 안에서 접속이 끊겼으면: 텐트 입구 밖에서 시작 (실내는 그때그때 만드는 임시 공간)
  if (String(p.map || '').startsWith('tent_')) { let out = null; const owner = p.map.slice(5); for (const mm of Object.values(MAPS)) for (const t of mm.tents || []) if (t.owner === owner && !t.inner && (t.kind || 'tent') === 'tent') out = { map: mm.id, x: t.x + (D.TENT_W >> 1), y: t.y + D.TENT_H }; if (out && MAPS[out.map]) { p.map = out.map; p.x = out.x; p.y = out.y; } else { p.map = 'world'; const s = MAPS.world.spawn; p.x = s.x; p.y = s.y; } }
  if (!MAPS[p.map]) { p.map = 'world'; const s = MAPS.world.spawn; p.x = s.x; p.y = s.y; }
  if (!walkable(MAPS[p.map], p.x, p.y)) { const q = nearFree(MAPS[p.map], p.x, p.y); p.x = q.x; p.y = q.y; }
  { const q = nearFreeBody(MAPS[p.map], p.x, p.y, p); p.x = q.x; p.y = q.y; }
  calc(p); if (p.hp <= 0) p.hp = Math.round(p.st.maxHp * 0.5);
  PLAYERS.set(p.id, p);
  ws.send({ t: 'welcome', id: p.id, atlas: ATLAS });
  try { sendMap(p); } catch (e) { console.error('sendMap 실패', e); p.map = 'world'; const s = MAPS.world.spawn; p.x = s.x; p.y = s.y; sendMap(p); }
  ws.send(meData(p)); ws.send({ t: 'pos', x: p.x, y: p.y, snap: 1 });
  announce(`🌬 ${p.name}님(${D.JOBS[p.job].name} Lv.${p.lv})이 바람의 대륙에 들어왔습니다!`, '#9fe8ff');
  sysMsg(p, '안내원 바람이에게 말을 걸면 조작법과 보스 시간표를 볼 수 있어요. (E키)', '#cfe');
}

function handle(p, msg) {
  const m = MAPS[p.map]; const now = Date.now();
  switch (msg.t) {
    case 'mv': {
      if (p.dead) return;
      const x = msg.x | 0, y = msg.y | 0; calc(p);
      // 위치 보정 이후에 도착한 '예전 기준' 이동은 조용히 버림 → 되돌림이 연쇄적으로 반복(화면 덜덜)되지 않음
      if (msg.ep != null && p.ep && msg.ep !== p.ep) return;
      // 속도 검사: 토큰 방식 (네트워크 지연으로 이동이 몰려 와도 허용, 장기 평균 속도만 제한)
      { const per = p.st.spd * 0.8; p.mvTok = Math.min(5, (p.mvTok == null ? 5 : p.mvTok) + (now - (p.mvT || now)) / per); p.mvT = now; }
      const timeOk = p.mvTok >= 1;
      const ddx = x - p.x, ddy = y - p.y, diag = Math.abs(ddx) === 1 && Math.abs(ddy) === 1;
      // 이동은 폰 쪽을 믿음: 벽·NPC·상자 같은 고정물만 서버가 막음 (몬스터·다른 플레이어는 위치가 잠깐 어긋날 수 있어 막지 않음 → 되돌림 없음)
      const staticBody = (xx, yy) => m.npcs.some(n => n.x === xx && n.y === yy) || m.chests.some(c => c.x === xx && c.y === yy) || [...PLAYERS.values()].some(o => o !== p && o.map === m.id && !o.dead && o.x === xx && o.y === yy && now - (o.lastMove || 0) > 700); // 가만히 서 있는 플레이어는 통과 불가
      const step = Math.max(Math.abs(ddx), Math.abs(ddy));
      const ok = step >= 1 && step <= 2 && (step === 1 ? (Math.abs(ddx) + Math.abs(ddy) === 1 || (diag && walkable(m, p.x + ddx, p.y) && walkable(m, p.x, p.y + ddy))) : walkable(m, p.x + Math.sign(ddx), p.y + Math.sign(ddy))) && timeOk && walkable(m, x, y) && !staticBody(x, y);
      p.dir = clamp(msg.d | 0, 0, 3);
      if (!ok) { p.ep = (p.ep || 0) + 1; p.ws.send({ t: 'pos', x: p.x, y: p.y, ep: p.ep }); return; }
      p.mvTok -= 1; p.x = x; p.y = y; p.lastMove = now; if (msg.ct) p.lastCt = msg.ct; p.sleeping = false; if (p.fishing) { p.fishing = null; sysMsg(p, '낚시를 멈췄습니다.', '#ccc'); }
      // 자동 줍기
      for (const d of [...m.drops.values()]) if (d.x === x && d.y === y) pickup(p, m, d);
      const pt = m.portals[x + ',' + y]; if (pt) teleport(p, pt.to, pt.x, pt.y, pt.near); else tentDoorCheck(p);
      break;
    }
    case 'dbg': if (!ENV.DEBUG) return; if (msg.spawnMon && D.MONS[msg.spawnMon]) { const q = nearFreeMon(m, p.x + ri(-3, 3), p.y + ri(-3, 3)); const mo = spawnMon(m, msg.spawnMon, q.x, q.y); if (mo) mo.target = p.id; } if (msg.lv) { p.lv = msg.lv; } if (msg.coins) p.coins += msg.coins; if (msg.item) addItem(p, msg.item); if (msg.give) for (const [k, v] of Object.entries(msg.give)) addItem(p, { k: 'mat', id: k, n: v }); if (msg.boss) { const b = BOSSES.find(b => b.mon === msg.boss); const bm = MAPS[b.map]; const q = nearFreeMon(bm, b.x, b.y); const mo = spawnMon(bm, b.mon, q.x, q.y); b.live = mo.id; } if (msg.map && MAPS[msg.map]) teleport(p, msg.map, msg.x, msg.y, 1); calc(p); dirty(p); break;
    case 'face': p.dir = clamp(msg.d | 0, 0, 3); break;
    case 'atk': basicAttack(p); break;
    case 'skill': useSkill(p, msg.id); break;
    case 'target': p.target = msg.id; break;
    case 'pick': { const near = [...m.drops.values()].filter(d => Math.abs(d.x - p.x) <= 1 && Math.abs(d.y - p.y) <= 1); near.forEach(d => pickup(p, m, d)); if (!near.length) { const [dx, dy] = DIRS[p.dir]; const c = m.chests.find(c => c.x === p.x + dx && c.y === p.y + dy) || m.chests.find(c => Math.max(Math.abs(c.x - p.x), Math.abs(c.y - p.y)) <= 1); if (c) openChest(p, c); else sysMsg(p, '주울 것이 없습니다.', '#aaa'); } break; }
    case 'chat': { const text = String(msg.text || '').slice(0, 80); if (!text) return; broadcast({ t: 'chat', id: p.id, name: p.name, text, map: p.map }); break; }
    case 'use': useItem(p, msg.i | 0); break;
    case 'useId': { const i = p.inv.findIndex(o => o.k === 'use' && o.id === msg.id); if (i >= 0) useItem(p, i); else sysMsg(p, `${D.CONSUMES[msg.id].name}이(가) 없습니다.`, '#bbb'); break; }
    case 'unequip': { if (msg.slot === 'mount') { if (!p.mount) return; if (p.inv.length >= INV_MAX && !p.inv.some(o => o.k === 'mount' && o.id === p.mount)) return sysMsg(p, '가방이 가득 찼습니다.'); giveMount(p, p.mount); p.mount = null; p.riding = false; calc(p); dirty(p); break; } const it = p.eq[msg.slot]; if (!it) return; if (p.inv.length >= INV_MAX) return sysMsg(p, '가방이 가득 찼습니다.'); delete p.eq[msg.slot]; p.inv.push(it); calc(p); dirty(p); break; }
    case 'drop': { const it = p.inv[msg.i | 0]; if (!it) return; if (it.k === 'mount') return sysMsg(p, '탈것은 버릴 수 없어요.', '#bbb'); p.inv.splice(msg.i | 0, 1); dropAt(m, p.x, p.y, it, null); dirty(p); break; }
    case 'interact': interact(p); break;
    case 'openChest': openChest(p, CHESTS.get(msg.id)); break;
    case 'npc': { const n = npcNear(p); if (n) openNpc(p, n); break; }
    case 'buy': buy(p, msg); break;
    case 'sell': { const it = p.inv[msg.i | 0]; const n = npcNear(p); if (!it || !n || !['shop', 'gear'].includes(n.kind)) return; if (it.k === 'mount') return sysMsg(p, '탈것은 팔 수 없어요. (교환은 가능)', '#bbb'); const price = it.k === 'use' && D.CONSUMES[it.id] && D.CONSUMES[it.id].sell ? D.CONSUMES[it.id].sell * it.n : it.k === 'gear' ? gearSell(it) : it.k === 'use' ? Math.floor((D.CONSUMES[it.id].price || 40) * 0.3) * it.n : ((D.MATS[it.id] && D.MATS[it.id].sell) || 5) * it.n; p.inv.splice(msg.i | 0, 1); p.coins += price; sysMsg(p, `${it.name || it.id} 판매 +${price} 코인`); dirty(p); break; }
    case 'upgrade': upgrade(p, msg); break;
    case 'promote': {
      const n = npcNear(p); if (!n || n.kind !== 'master') return;
      const J0 = D.JOBS[p.job]; const ok1 = !J0.tier && p.lv >= D.PROMO_LEVEL && (D.PROMOS[p.job] || []).includes(msg.id), ok2 = J0.tier === 1 && p.lv >= D.PROMO2_LEVEL && (D.PROMOS2[p.job] || []).includes(msg.id); if (!ok1 && !ok2) return;
      p.job = msg.id; calc(p); p.hp = p.st.maxHp; p.mp = p.st.maxMp; dirty(p);
      fx(m, { k: 'lvl', x: p.x, y: p.y }); announce(D.JOBS[p.job].tier === 2 ? `👑 ${p.name}님이 3차 전직 [${D.JOBS[p.job].name}](으)로 거듭났습니다!` : `🎖 ${p.name}님이 [${D.JOBS[p.job].name}](으)로 전직했습니다!`, '#e0a8ff');
      p.ws.send({ t: 'dlg', close: 1 }); break;
    }
    case 'ride': {
      if (!p.mount) { const mi = p.inv.findIndex(o => o.k === 'mount'); if (mi >= 0) { equipMount(p, mi); return; } return sysMsg(p, '장착한 탈것이 없습니다. 마구간에서 구매하거나 가방에서 장착하세요.', '#bbb'); }
      if (p.dead) return; p.riding = !p.riding; calc(p); dirty(p); sysMsg(p, p.riding ? `${D.MOUNTS[p.mount].name}에 올라탔습니다. (이동속도 x${D.MOUNTS[p.mount].spd}) · 탄 채로 공격·스킬 가능` : '탈것에서 내렸습니다.'); break;
    }
    case 'setMount': { if (p.mount === msg.id) { p.riding = true; calc(p); dirty(p); break; } const mi = p.inv.findIndex(o => o.k === 'mount' && o.id === msg.id); if (mi >= 0) equipMount(p, mi); else if (ownsMount(p, msg.id)) sysMsg(p, '그 탈것은 보관함·주머니에 있어요. 가방으로 꺼낸 뒤 장착하세요.', '#ffd166'); break; }
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
    case 'furnDel': { let t = msg.s === 'house' ? p.house : p.tent; if (!t) return; if (msg.s !== 'house') { if (p.map !== tentInId(p.name)) return sysMsg(p, '텐트 안에서 철거하세요.'); t = MAPS[p.map].tents[0]; } else if (t.map !== p.map) return; if (t.kind === 'house' && t.furn.filter(f => f.k === 'door').length <= 1 && (t.furn.find(f => f.x === msg.x && f.y === msg.y) || {}).k === 'door') return sysMsg(p, '문은 최소 1개 있어야 합니다.'); const i = t.furn.findIndex(f => f.x === msg.x && f.y === msg.y); if (i >= 0) { const f = t.furn[i]; t.furn.splice(i, 1); const need = D.FURNITURE[f.k].need; for (const k in need) addItem(p, { k: 'mat', id: k, n: Math.floor(need[k] / 2) }); sysMsg(p, `${D.FURNITURE[f.k].name} 철거 (재료 절반 회수)`); sendTents(m); dirty(p); } break; }
    case 'tentDel': { if (!p.tent) return; closeTentInterior(p.tent); const tm = MAPS[p.tent.map]; tm.tents = tm.tents.filter(t => t !== p.tent); p.tent = null; if (p.storage.length) sysMsg(p, '보관상자의 물건은 다음 텐트로 옮겨집니다.'); sendTents(tm); dirty(p); sysMsg(p, '텐트를 철거했습니다.'); break; }
    case 'store': { const nb = npcNear(p); if (!(nb && nb.kind === 'bank') && !p.tent && !p.house) return; if (msg.dir === 'in') { const it = p.inv[msg.i | 0]; if (!it) return; if (p.storage.length >= STORE_MAX && it.k === 'gear') return sysMsg(p, '보관상자가 가득 찼습니다.'); p.inv.splice(msg.i | 0, 1); if (!addItem(p, it, 'storage')) p.inv.push(it); } else { const it = p.storage[msg.i | 0]; if (!it) return; if (p.inv.length >= INV_MAX && it.k === 'gear') return sysMsg(p, '가방이 가득 찼습니다.'); p.storage.splice(msg.i | 0, 1); if (!addItem(p, it)) p.storage.push(it); } dirty(p); break; }
    case 'cook': cook(p, msg.id); break;
    case 'unstuck': { if (Date.now() - (p.unstuckT || 0) < 20000) return sysMsg(p, '잠시 후 다시 시도하세요.'); p.unstuckT = Date.now(); const s = MAPS.world.spawn; teleport(p, 'world', s.x, s.y, 1); sysMsg(p, '마을로 이동했습니다.', '#9fe8ff'); break; }
    // 주머니 (가방 안 정리)
    case 'pouchPut': {
      const pi = msg.pi | 0, i = msg.i | 0; const po = p.pouches[pi], it = p.inv[i]; if (!po || !it) return;
      if (it.k !== 'gear') { const ex = po.find(o => o.k === it.k && o.id === it.id && o.n + it.n <= 999); if (ex) { ex.n += it.n; p.inv.splice(i, 1); dirty(p); break; } }
      if (po.length >= POUCH_MAX) return sysMsg(p, `${pi + 1}번 주머니가 가득 찼습니다. (${POUCH_MAX}칸)`, '#ffb4b4');
      p.inv.splice(i, 1); po.push(it); dirty(p); break;
    }
    case 'pouchTake': {
      const po = p.pouches[msg.pi | 0]; const j = msg.j | 0; const it = po && po[j]; if (!it) return;
      po.splice(j, 1); if (!addItem(p, it)) { po.splice(j, 0, it); return sysMsg(p, '가방이 가득 찼습니다.', '#ffb4b4'); } dirty(p); break;
    }
    case 'pouchAll': { // 같은 종류 한 번에 넣기
      const po = p.pouches[msg.pi | 0]; const k = msg.k; if (!po || !['use', 'mat', 'gear'].includes(k)) return;
      for (let i = p.inv.length - 1; i >= 0; i--) { const it = p.inv[i]; if (it.k !== k) continue; if (it.k !== 'gear') { const ex = po.find(o => o.k === it.k && o.id === it.id); if (ex) { ex.n += it.n; p.inv.splice(i, 1); continue; } } if (po.length >= POUCH_MAX) break; p.inv.splice(i, 1); po.push(it); }
      dirty(p); break;
    }
    case 'sleep': p.sleeping = !p.sleeping && !p.dead; break;
    case 'respawn': if (p.dead) { const t = nearestTown(p); p.dead = false; calc(p); p.hp = Math.round(p.st.maxHp * 0.5); p.mp = Math.round(p.st.maxMp * 0.5); p.exp = Math.max(0, p.exp - Math.floor(D.expNeed(p.lv) * 0.05)); teleport(p, 'world', t.spawn.x, t.spawn.y, 1); dirty(p); sysMsg(p, `${t.name}에서 부활했습니다. (경험치 -5%)`, '#ffb4b4'); } break;
    case 'hot': p.hot = Array.isArray(msg.hot) ? msg.hot.slice(0, 5).map(x => typeof x === 'string' && D.CONSUMES[x] ? x : null) : []; dirty(p); break;
    case 'boss': p.ws.send({ t: 'boss', list: bossSchedule() }); break;
    // 교환
    // 파티
    case 'partyInv': {
      const q = PLAYERS.get(msg.id); if (!q || q === p) return;
      if (q.party && q.party === p.party) return sysMsg(p, '이미 같은 파티입니다.');
      if (q.party) return sysMsg(p, `${q.name}님은 다른 파티에 있습니다.`);
      const pt = partyOf(p); if (pt && pt.members.size >= PARTY_MAX) return sysMsg(p, `파티는 최대 ${PARTY_MAX}명입니다.`);
      q.partyFrom = p.id; q.ws.send({ t: 'partyAsk', from: p.name, id: p.id }); sysMsg(p, `${q.name}님에게 파티를 신청했습니다.`); break;
    }
    case 'partyYes': {
      const q = PLAYERS.get(p.partyFrom); p.partyFrom = null; if (!q) return sysMsg(p, '신청한 사람이 없습니다.');
      if (p.party) partyLeave(p);
      let pt = partyOf(q); if (!pt) { pt = { id: PARTY_N++, leader: q.id, members: new Set([q.id]) }; PARTIES.set(pt.id, pt); q.party = pt.id; }
      if (pt.members.size >= PARTY_MAX) return sysMsg(p, '파티가 가득 찼습니다.');
      pt.members.add(p.id); p.party = pt.id; partyMsg(pt, `${p.name}님이 파티에 들어왔습니다. 경험치를 함께 얻어요!`); break;
    }
    case 'partyNo': { const q = PLAYERS.get(p.partyFrom); p.partyFrom = null; if (q) sysMsg(q, `${p.name}님이 파티를 거절했습니다.`, '#ccc'); break; }
    case 'partyLeave': partyLeave(p); break;
    case 'partyKick': { const pt = partyOf(p); const q = PLAYERS.get(msg.id); if (!pt || pt.leader !== p.id || !q || q.party !== pt.id) return; sysMsg(q, '파티에서 내보내졌습니다.', '#ccc'); partyLeave(q, '나갔습니다'); break; }
    // 장비 보기
    case 'inspect': {
      const q = PLAYERS.get(msg.id); if (!q) return; calc(q);
      p.ws.send({ t: 'insp', id: q.id, name: q.name, lv: q.lv, job: q.job, eq: q.eq, st: { maxHp: q.st.maxHp, maxMp: q.st.maxMp, atk: q.st.atk, def: q.st.def, crit: q.st.crit }, kills: q.kills || 0, a: appear(q) }); break;
    }
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
      if (msg.t === 'tradeItem') { const i = msg.i | 0; const it = p.inv[i]; if (!it) return; const arr = tr.off[side].items; const k = arr.findIndex(o => o.ref === it); if (k >= 0) arr.splice(k, 1); if (!msg.remove && arr.length < 10) arr.push({ ref: it, n: it.k === 'gear' ? 1 : clamp(msg.n | 0 || it.n, 1, it.n) }); tr.lock = { a: 0, b: 0 }; tr.ok = { a: 0, b: 0 }; }
      if (msg.t === 'tradeCoin') { tr.off[side].coins = clamp(msg.n | 0, 0, p.coins); tr.lock = { a: 0, b: 0 }; tr.ok = { a: 0, b: 0 }; }
      if (msg.t === 'tradeLock') tr.lock[side] = 1;
      if (msg.t === 'tradeOk') { tr.lock[side] = 1; tr.ok[side] = 1; if (tr.ok.a && tr.ok.b) return tradeExec(tr); }
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
  if (it.k === 'use' && String(it.id).startsWith('mtk_')) { const id = it.id.slice(4); const mt = D.MOUNTS[id]; if (!mt) return; if (ownsMount(p, id)) return sysMsg(p, `이미 [${mt.name}]을(를) 갖고 있어요. 친구에게 교환해 보세요!`, '#ffd166'); if (p.inv.length >= INV_MAX && it.n > 1) return sysMsg(p, '가방이 가득 찼습니다.');
    if (--it.n <= 0) p.inv.splice(i, 1); giveMount(p, id); dirty(p); sysMsg(p, `[${mt.name}]이(가) 가방에 들어왔어요. 가방에서 눌러 장착하세요!`, '#ffd27a'); announce(`🐾 ${p.name}님이 보스 탈것 [${mt.name}]을(를) 얻었습니다!`, '#ffd27a'); return; }
  if (it.k === 'mount') return equipMount(p, i);
  if (it.k === 'gear') {
    if (!canEquip(p, it)) return sysMsg(p, `${D.JOBS[it.job] ? D.JOBS[it.job].name : ''} 전용 장비입니다. 다른 직업 플레이어와 교환해 보세요!`, '#ffb4b4');
    if (it.slot === 'shield' && p.eq.weapon && false) return;
    p.inv.splice(i, 1); const old = p.eq[it.slot]; p.eq[it.slot] = it; if (old) p.inv.splice(i, 0, old);
    calc(p); dirty(p); { const e = D.gearEff(p.lv, it); if (e.main < 1) sysMsg(p, `요구 레벨 ${e.req} 미달 — 지금은 효력 ${Math.round(e.main * 100)}%, 추가 옵션 ${Math.round(e.extra * 100)}%만 적용돼요. 레벨이 오를수록 강해져요.`, '#ffd27a'); } return;
  }
  if (it.k === 'mat' && it.id === '보물지도 조각') {
    if (countMat(p, '보물지도 조각') < 4) return sysMsg(p, `보물지도 조각 ${countMat(p, '보물지도 조각')}/4 — 4조각을 모으면 보물지도가 됩니다.`, '#e8d8a0');
    takeMats(p, { '보물지도 조각': 4 }); addItem(p, { k: 'use', id: 'tmap', n: 1 }); dirty(p); return sysMsg(p, '조각을 맞추자 보물지도가 완성되었다! 가방에서 사용해 보세요.', '#ffb84d');
  }
  if (it.k === 'mat') {
    if (D.MATS[it.id] && D.MATS[it.id].ing) return sysMsg(p, `${it.id}: 요리 재료 — 얻는 곳: ${D.MATS[it.id].where}`, '#ddd');
    if (it.id === '횃불') return sysMsg(p, '횃불은 텐트 안에 설치할 수 있습니다. (B: 집짓기 메뉴)', '#ddd');
    return sysMsg(p, D.MATS[it.id] ? D.MATS[it.id].desc : '재료', '#ddd');
  }
  const c = D.CONSUMES[it.id]; if (!c) return;
  if (c.rod) return startFishing(p, c.rod);
  if (c.pouch) { if (p.pouches.length >= POUCH_N) return sysMsg(p, `주머니는 최대 ${POUCH_N}개까지 쓸 수 있습니다.`); p.pouches.push([]); it.n--; if (it.n <= 0) p.inv.splice(i, 1); dirty(p); return sysMsg(p, `새 주머니를 달았습니다! (주머니 ${p.pouches.length}개)`, '#9fe8ff'); }
  if (c.tmap) { if (useTreasureMap(p)) { it.n--; if (it.n <= 0) p.inv.splice(i, 1); dirty(p); } return; }
  if (now < (p.potCd || 0)) return; p.potCd = now + 350;
  if (c.back && !p.backPos) return sysMsg(p, '돌아갈 위치가 없습니다. 귀환 주문서로 마을에 온 뒤 사용하세요.', '#ffb0b0');
  if ((c.recall || c.back) && p.dead) return;
  calc(p);
  if (c.back) { const b = p.backPos; p.backPos = null; teleport(p, MAPS[b.map] ? b.map : 'world', b.x, b.y, 1); sysMsg(p, '귀환 전 위치로 돌아왔습니다.'); }
  if (c.recall) { const cm = MAPS[p.map]; if (!inTown(cm, p.x, p.y)) p.backPos = { map: p.map, x: p.x, y: p.y };
    const t = nearestTown(p); teleport(p, 'world', t.spawn.x, t.spawn.y, 1); sysMsg(p, `${t.name}(으)로 귀환했습니다.`); }
  if (c.hp) { const h = Math.min(c.hp, p.st.maxHp - p.hp); p.hp += h; fx(MAPS[p.map], { k: 'heal', x: p.x, y: p.y, v: h }); }
  if (c.mp) { p.mp = Math.min(p.st.maxMp, p.mp + c.mp); fx(MAPS[p.map], { k: 'mana', x: p.x, y: p.y, v: c.mp }); }
  if (c.buff) addBuff(p, c.name, c.buff, c.dur);
  it.n--; if (it.n <= 0) p.inv.splice(i, 1);
  dirty(p);
}
function buy(p, msg) {
  const n = npcNear(p); if (!n) return;
  if (n.kind === 'shop') {
    if (D.SHOP_MATS.includes(msg.id)) { const q = clamp(msg.n | 0 || 1, 1, 100), cost = D.MATS[msg.id].price * q; if (p.coins < cost) return sysMsg(p, '코인이 부족합니다.', '#ff9a9a'); if (!addItem(p, { k: 'mat', id: msg.id, n: q })) return sysMsg(p, '가방이 가득 찼습니다.'); p.coins -= cost; dirty(p); return sysMsg(p, `${msg.id} x${q} 구매 (-${cost})`); }
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
    const mt = D.MOUNTS[msg.id]; if (!mt || mt.boss) return; if (ownsMount(p, msg.id)) return sysMsg(p, '이미 갖고 있는 탈것입니다.', '#bbb'); if (p.inv.length >= INV_MAX) return sysMsg(p, '가방이 가득 찼습니다.');
    if (p.coins < mt.price) return sysMsg(p, `코인이 부족합니다. (${mt.price.toLocaleString()} 필요)`, '#ff9a9a');
    p.coins -= mt.price; giveMount(p, msg.id); dirty(p); sysMsg(p, `[${mt.name}]이(가) 가방에 들어왔어요. 가방에서 눌러 장착하세요!`, '#ffd27a');
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
  // 내 위치 기준으로 가까운 빈 자리를 찾아 자동으로 맞춤 (나무·바위는 걷어냄)
  const bad = (x0, y0) => { for (let y = y0; y < y0 + D.TENT_H; y++) for (let x = x0; x < x0 + D.TENT_W; x++) { const v = gt(m, x, y); if (v == null || (D.BLOCK.has(v) && !D.TENT_OVER.has(v)) || v === T.UP || v === T.DOWN || v === T.CAVEDOOR || v === T.GATE || m.portals[x + ',' + y] || m.npcs.some(n => n.x === x && n.y === y)) return 'space'; if (m.tents.some(t => t !== p.tent && x >= t.x - 1 && x < t.x + SW(t) + 1 && y >= t.y - 1 && y < t.y + SH(t) + 2)) return 'tent'; } const ev = gt(m, x0 + TDX, y0 + D.TENT_H); if (ev == null || (D.BLOCK.has(ev) && !D.TENT_OVER.has(ev))) return 'space'; return null; };
  let x0 = p.x - (D.TENT_W >> 1), y0 = p.y - (D.TENT_H - 1), why = bad(x0, y0);
  if (why) { search: for (let r = 1; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const w2 = bad(x0 + dx, y0 + dy); if (!w2) { x0 += dx; y0 += dy; why = null; break search; } } }
  if (why) return sysMsg(p, why === 'tent' ? '근처에 다른 텐트가 있어요. 조금 떨어진 곳에서 지어 주세요.' : '근처에 텐트를 칠 땅이 없어요. 물·벽·입구에서 조금 떨어진 곳에서 지어 주세요.', '#ffb4b4');
  takeMats(p, D.TENT_COST);
  let furn = [];
  if (p.tent) { const om = MAPS[p.tent.map]; om.tents = om.tents.filter(t => t !== p.tent); furn = p.tent.furn; if (om !== m) sendTents(om); }
  const tent = { owner: p.name, kind: 'tent', map: m.id, x: x0, y: y0, furn };
  p.tent = tent; m.tents.push(tent); clearTentGround(m, tent); if (MAPS[tentInId(p.name)]) tentInterior(tent);
  for (const q of PLAYERS.values()) if (q.map === m.id && tentAt(m, q.x, q.y) === tent && tentBlock(tent, q.x, q.y)) { const ex = tentExit(tent); teleport(q, m.id, ex.x, ex.y, 1); }
  // 텐트 안 몬스터 밀어내기
  for (const mon of [...m.mons.values()]) if (tentAt(m, mon.x, mon.y) === tent) { const q = nearFreeMon(m, mon.x, y0 + D.TENT_H + 2); occDel(m, mon.x, mon.y); mon.x = q.x; mon.y = q.y; occAdd(m, q.x, q.y); mon.target = null; }
  for (const d of [...m.drops.values()]) if (tentAt(m, d.x, d.y) === tent && tentBlock(tent, d.x, d.y)) { d.x = p.x; d.y = p.y; }
  sendTents(m); dirty(p);
  fx(m, { k: 'skill', f: 'summon', x: p.x, y: p.y - 3, c: '#ffe0a0' });
  sysMsg(p, '⛺ 텐트를 지었습니다! 아래쪽 입구로 들어가면 아늑한 실내가 나옵니다. 안에서 집짓기 메뉴(B)로 가구를 자유롭게 배치하세요. 밤에는 안이 안전합니다.', '#ffe0a0');
}
function placeFurn(p, msg) {
  const t0 = msg.s === 'house' ? p.house : p.tent; if (!t0) return sysMsg(p, msg.s === 'house' ? '먼저 집을 지어야 합니다.' : '먼저 텐트를 지어야 합니다.');
  const inside = msg.s !== 'house' && p.map === tentInId(p.name); if (msg.s !== 'house' && !inside) return sysMsg(p, '텐트 안에 들어가서 가구를 배치하세요. (텐트 입구로 들어가기)', '#ffd27a'); if (msg.s === 'house' && t0.map !== p.map) return sysMsg(p, '집에서 배치하세요.');
  const t = inside ? MAPS[p.map].tents[0] : t0;
  const f = D.FURNITURE[msg.k]; if (!f) return;
  if (f.house && t.kind !== 'house') return sysMsg(p, `${f.name}은(는) 마을의 집에만 설치할 수 있습니다.`);
  const lx = msg.x | 0, ly = msg.y | 0;
  const corner = (lx === 0 || lx === SW(t) - 1) && (ly === 0 || ly === SH(t) - 1);
  const onWall = lx === 0 || lx === SW(t) - 1 || ly === 0 || ly === SH(t) - 1;
  if (lx < 0 || ly < 0 || lx >= SW(t) || ly >= SH(t)) return;
  if (f.wall) { if (!onWall || corner) return sysMsg(p, `${f.name}은(는) 벽(모서리 제외)에 설치합니다.`); }
  else if (onWall) return sysMsg(p, '가구는 실내에 설치합니다.');
  if (t.furn.some(o => o.x === lx && o.y === ly)) return sysMsg(p, '이미 무언가 있는 자리입니다.');
  if (!f.wall && t.kind !== 'house' && lx === (SW(t) >> 1) && ly === SH(t) - 2 && msg.k !== 'rug') return sysMsg(p, '문 앞은 비워두세요.');
  const m = MAPS[p.map];
  if (msg.k !== 'rug' && ([...PLAYERS.values()].some(q => q.map === m.id && q.x === t.x + lx && q.y === t.y + ly))) return sysMsg(p, '사람이 서 있는 자리에는 놓을 수 없습니다.');
  if (!hasMats(p, f.need)) return sysMsg(p, `재료 부족: ${Object.entries(f.need).map(([k, v]) => `${k} ${v}`).join(', ')}`, '#ffb4b4');
  takeMats(p, f.need); t.furn.push({ k: msg.k, x: lx, y: ly });
  sendTents(m); dirty(p);
}
function furnFront(p) {
  const m = MAPS[p.map]; const [dx, dy] = DIRS[p.dir]; const fx_ = p.x + dx, fy = p.y + dy;
  const useful = new Set(['bed', 'chest', 'campfire', 'stove', 'torch']);
  for (const t of m.tents) { if (isTentOut(t, m)) continue; const f = t.furn.find(f => t.x + f.x === fx_ && t.y + f.y === fy && useful.has(f.k)) || t.furn.find(f => Math.abs(t.x + f.x - p.x) + Math.abs(t.y + f.y - p.y) === 1 && useful.has(f.k)); if (f) return { t, f }; }
  return null;
}
function plotNear(p) { return PLOTS.find(q => q.map === p.map && Math.abs(q.sx - p.x) + Math.abs(q.sy - p.y) <= 2); }
function openPlot(p, pl) {
  const mine = pl.owner === p.name;
  p.ws.send({ t: 'dlg', kind: 'plot', id: pl.id, town: pl.town, price: pl.price, owner: pl.owner, mine, hasHouse: !!(mine && p.house), myPlot: p.plot || null, cost: D.HOUSE_COST,
    text: pl.owner ? (mine ? (p.house ? '당신의 집입니다. 문으로 들어가 [B] 집짓기 메뉴에서 가구·창문·문을 배치하세요.' : '당신의 땅입니다. 가진 건축 재료로 집을 지을 수 있습니다.') : `${pl.owner}님의 땅입니다.`) : `${pl.town}의 공터입니다. 땅을 사서 나만의 집을 지어보세요! (1인 1채)` });
}
function interact(p) {
  { const m = MAPS[p.map]; const [dx, dy] = DIRS[p.dir]; if (gt(m, p.x + dx, p.y + dy) === T.WATER) { const rod = p.inv.find(o => o.k === 'use' && D.CONSUMES[o.id] && D.CONSUMES[o.id].rod); if (rod) return startFishing(p, D.CONSUMES[rod.id].rod); } }
  const n = npcNear(p); if (n) return openNpc(p, n);
  const pl = plotNear(p); if (pl && !furnFront(p)) return openPlot(p, pl);
  const ff = furnFront(p); if (!ff) { const now = Date.now(); if (!p._talkHint || now - p._talkHint > 2500) { p._talkHint = now; sysMsg(p, '주변에 말을 걸 대상이 없어요. NPC·플레이어 가까이(2칸 이내)에서 눌러 주세요.', '#bbb'); } return; }
  const { t, f } = ff;
  if (f.k === 'bed') { p.sleeping = true; sysMsg(p, '💤 침대에 누웠습니다. 체력과 마나가 빠르게 회복됩니다. (움직이면 일어남)', '#c8d8ff'); }
  else if (f.k === 'chest') { if (t.owner !== p.name) return sysMsg(p, '다른 사람의 보관상자입니다.'); p.ws.send({ t: 'dlg', kind: 'chest' }); }
  else if (f.k === 'campfire' || f.k === 'stove') p.ws.send({ t: 'dlg', kind: 'cook', at: f.k, recipes: Object.entries(D.RECIPES).filter(([, r]) => r.at === f.k || (f.k === 'stove' && r.at === 'campfire')).map(([id, r]) => ({ id, ...r, desc: D.CONSUMES[id].desc })) });
  else if (f.k === 'torch') sysMsg(p, '횃불이 따뜻하게 타오릅니다.', '#ffd27a');
}
function cook(p, id) {
  const r = D.RECIPES[id]; if (!r) return;
  const ff = furnFront(p); const inT = inTown(MAPS[p.map], p.x, p.y); if (!inT && (!ff || !(ff.f.k === r.at || (ff.f.k === 'stove')))) return sysMsg(p, '마을 안이나, 모닥불·조리대 앞에서 요리할 수 있어요.');
  if (!hasMats(p, r.need)) return sysMsg(p, `재료 부족: ${Object.entries(r.need).map(([k, v]) => `${k} ${v}`).join(', ')}`, '#ffb4b4');
  if (!addItem(p, { k: 'use', id, n: 1 })) return sysMsg(p, '가방이 가득 찼습니다.'); takeMats(p, r.need); dirty(p); sysMsg(p, `${r.name} 완성!`, '#ffd8a0'); fx(MAPS[p.map], { k: 'cooked', x: p.x, y: p.y });
  fx(MAPS[p.map], { k: 'skill', f: 'buff', x: p.x, y: p.y, c: '#ffb060' });
}

// ═══════════════ 메인 루프 ═══════════════
let tickN = 0;
function tick() {
  const now = Date.now(); tickN++;
  for (const p of PLAYERS.values()) if (p.fishing) fishTick(p, now);
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
    for (const q of PLAYERS.values()) if (q.map === p.map && Math.abs(q.x - p.x) <= VX && Math.abs(q.y - p.y) <= VY) P.push({ i: q.id, n: q.name, x: q.x, y: q.y, d: q.dir, h: Math.round(100 * q.hp / (q.st ? q.st.maxHp : 1)), lv: q.lv, a: appear(q), sl: q.sleeping ? 1 : 0, dd: q.dead ? 1 : 0, fs: q.fishing ? [q.fishing.x, q.fishing.y] : 0, bf: (q.buffs || []).length ? 1 : 0 });
    for (const mon of m.mons.values()) if (Math.abs(mon.x - p.x) <= VX && Math.abs(mon.y - p.y) <= VY) M.push({ i: mon.id, t: mon.type, x: mon.x, y: mon.y, d: mon.dir, h: Math.round(100 * mon.hp / mon.maxHp), mu: mon.mutant ? 1 : 0, s: mon.summon ? 1 : 0, lv: mon.lv });
    for (const d of m.drops.values()) if (Math.abs(d.x - p.x) <= VX && Math.abs(d.y - p.y) <= VY) { const it = d.item; Dr.push({ i: d.id, x: d.x, y: d.y, k: it.k, id: it.id, tr: it.tier, c: it.k === 'gear' ? D.TIER_COLOR[it.tier] : it.k === 'use' ? D.CONSUMES[it.id].col : it.k === 'mat' ? (D.MATS[it.id] || {}).c : '#ffd700', r: it.rar || 0, sl: it.slot, wt: it.wt, n: it.k === 'gear' ? it.name : it.k === 'coin' ? it.n + '코인' : (it.k === 'use' ? D.CONSUMES[it.id].name : it.id) + (it.n > 1 ? ' x' + it.n : '') }); }
    const fxs = m.fx.filter(f => Math.abs((f.x ?? f.fx) - p.x) <= VX + 2 && Math.abs((f.y ?? f.fy) - p.y) <= VY + 2);
    { const fb = (p.buffs || []).find(b => b.form && b.until > now); const f = fb ? fb.form : 0; if (f !== (p._fm || 0)) { p._fm = f; calc(p); if (p.hp > p.st.maxHp) p.hp = p.st.maxHp; dirty(p); if (!f) sysMsg(p, '변신이 풀렸습니다.', '#bbb'); } }
    const ptI = partyOf(p); p.ws.send({ t: 's', tm: now, nl, P, M, D: Dr, fx: fxs, pt: ptI ? [...ptI.members].map(id => PLAYERS.get(id)).filter(Boolean).map(q => ({ i: q.id, n: q.name, lv: q.lv, j: q.job, h: Math.round(100 * q.hp / (q.st ? q.st.maxHp : 1)), L: ptI.leader === q.id ? 1 : 0, x: q.x, y: q.y, m: q.map, far: q.map !== p.map || dist(q, p) > 12 ? 1 : 0 })) : null, you: { hp: p.hp, mp: p.mp, mhp: p.st.maxHp, mmp: p.st.maxMp, dead: p.dead ? 1 : 0, sl: p.sleeping ? 1 : 0, buffs: (p.buffs || []).map(b => ({ n: b.name, r: b.until - now, d: b.dur })), tg: p.target } });
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
    setInterval(tick, 100); setInterval(nightHunt, 12000); setInterval(spawnTick, 1500); setInterval(bossTick, 1000); setInterval(saveAll, 30000);
    spawnTick(); spawnTick(); spawnTick();
  },
  connect: onConnect, saveAll,
  online: () => [...PLAYERS.values()].map(p => p.name),
  _p: n => [...PLAYERS.values()].find(p => p.name === n),
  announce: (t, c) => announce(t, c),
  adminGive(name, what) {
    const live = [...PLAYERS.values()].find(p => p.name === name); const p = live || SAVES[name]; if (!p) return '그런 이름의 캐릭터가 없어요.';
    if (/^coin:\d+$/.test(what)) { p.coins = (p.coins || 0) + parseInt(what.slice(5)); }
    else if (D.MOUNTS[what]) { if (!p.mount) p.mount = what; else if (!ownsMount(p, what)) giveMount(p, what); }
    else return '알 수 없는 항목이에요.';
    if (live) { calc(live); dirty(live); sysMsg(live, '관리자가 지급했어요: ' + (D.MOUNTS[what] ? D.MOUNTS[what].name : what), '#ffd166'); } saveAll();
    return name + '에게 지급 완료' + (live ? '' : ' (다음 접속 때 적용)');
  },
};
if (typeof module !== 'undefined' && module.exports) module.exports = API; else window.ENGINE = API;
})();
