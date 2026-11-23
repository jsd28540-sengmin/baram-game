// ═══════════════════════════════════════════
//  바람의 대륙 - 클라이언트
// ═══════════════════════════════════════════
const $ = id => document.getElementById(id);
const DIRS = [[0, 1], [-1, 0], [1, 0], [0, -1]];
const cv = $('game'); let ctx = cv.getContext('2d'); const MAINCTX = ctx;
let W = 0, H = 0;
let DPR = 1;
let ZOOM = 1, VW = 0, VH = 0;
function resize() {
  DPR = Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1))); // 3배는 무거워서 2배로 제한
  const r = cv.getBoundingClientRect(); VW = Math.round(r.width) || innerWidth; VH = Math.round(r.height) || innerHeight;
  ZOOM = Math.max(0.52, Math.min(0.9, VH / (19.5 * TS))); // 시점: 세로로 약 19.5칸 (조금 더 멀리)
  let _inH = false; try { _inH = !!(S.map && S.map.inner && String(S.map.id).startsWith('tent_h_')); } catch (e) { }
  if (_inH) ZOOM = Math.min(1.3, VH / (13.8 * TS), VW / (19 * TS)); // 집 안: 방 전체(벽지 포함)가 화면에 꽉 차게 가까이
  W = Math.round(VW / ZOOM); H = Math.round(VH / ZOOM);
  cv.width = VW * DPR; cv.height = VH * DPR; ctx.setTransform(DPR * ZOOM, 0, 0, DPR * ZOOM, 0, 0); ctx.imageSmoothingEnabled = false; lc.width = W; lc.height = H;
}
const lc = mk(10, 10), lcx = lc.getContext('2d');
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 300)); if (window.visualViewport) visualViewport.addEventListener('resize', resize); resize();
// 블록 테마 텍스처 (돌판·흙·하트·물방울)
(function blockTextures() {
  const tex = (w, pal, fn) => { const c = document.createElement('canvas'); c.width = c.height = w; const g = c.getContext('2d'); for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { g.fillStyle = fn ? fn(x, y) : pal[Math.random() * pal.length | 0]; g.fillRect(x, y, 1, 1); } return 'url(' + c.toDataURL() + ')'; };
  const root = document.documentElement.style;
  root.setProperty('--stone', tex(16, ['#7a7a7a', '#727272', '#6b6b6b', '#808080', '#666666']));
  root.setProperty('--dirt', tex(16, ['#866043', '#79553a', '#966c4a', '#6c4b30', '#9a7350']));
  const icon = (rows, map) => { const c = document.createElement('canvas'); c.width = c.height = 9; const g = c.getContext('2d'); rows.forEach((r, y) => [...r].forEach((ch, x) => { if (map[ch]) { g.fillStyle = map[ch]; g.fillRect(x, y, 1, 1); } })); const b = document.createElement('canvas'); b.width = b.height = 16; const bg = b.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, 9, 9, 1, 1, 14, 14); return 'url(' + b.toDataURL() + ')'; };
  const H = ['.kk...kk.', 'krrk.krwk', 'krrrkrrwk', 'krrrrrrrk', '.krrrrrk.', '..krrrk..', '...krk...', '....k....', '.........'];
  const Dp = ['....k....', '...kbk...', '..kbbwk..', '.kbbbwbk.', '.kbbbbbk.', '.kbbbbbk.', '..kbbbk..', '...kkk...', '.........'];
  root.setProperty('--heart1', icon(H, { k: '#1a0000', r: '#e01818', w: '#ffb0b0' }));
  root.setProperty('--heart0', icon(H, { k: '#1a0000', r: '#3a1010', w: '#3a1010' }));
  root.setProperty('--drop1', icon(Dp, { k: '#000a20', b: '#2a6aff', w: '#b0d0ff' }));
  root.setProperty('--drop0', icon(Dp, { k: '#000a20', b: '#16203a', w: '#16203a' }));
})();
const TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const S = { myId: null, me: null, map: null, P: new Map(), M: new Map(), D: [], tents: [], plots: [], fx: [], nl: 0, you: {}, atlas: null, target: null, bubbles: new Map(), off: 0, panel: null, place: null, trade: null, roof: new Map(), mini: null };
const pos = { x: 0, y: 0, rx: 0, ry: 0, fx: 0, fy: 0, moving: false, t0: 0, dur: 200, dir: 0, step: 0 };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => Math.floor(n).toLocaleString();
// ═══════ 네트워크 (PC서버=웹소켓 / 아티팩트=방(room) / 혼자) ═══════
const NET = { mode: null, room: null, myPeer: null, hostPeer: null, seq: 0, q: [], chunks: new Map(), remotes: new Map() };
let send = () => { };
const ART = window.BUILD === 'artifact';
function setNetStatus(t, c) { const e = $('netst'); if (e) { e.textContent = t; e.style.setProperty('color', c && /8a8a|f99|ff8/.test(c) ? '#f87171' : c && /e08a|d77a/.test(c) ? '#fbbf24' : '#60a5fa', 'important'); } }
function connect() {
  if (window.BUILD === 'web') { webLobby(); return; }
  if (!ART) {
    const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
    send = o => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
    ws.onmessage = e => onMsg(JSON.parse(e.data));
    ws.onclose = () => { log('⚠ 서버와 연결이 끊어졌습니다. 새로고침 해주세요.', '#ff7a7a'); announce('서버 연결 끊김 — 새로고침 하세요', '#ff7a7a'); };
    ws.onopen = () => setNetStatus('서버 연결됨');
    return;
  }
  artConnect();
}
function remember() { try { const n = localStorage.getItem('baram_name'); if (n) $('nm').value = n; } catch (e) { } }
remember();
// ── 아티팩트: 방장(호스트) 폰이 게임 엔진을 돌리고, 친구들은 room 으로 접속 ──
async function artConnect() {
  setNetStatus('연결 확인 중...');
  let room = null, user = null, db = null;
  const use = n => window.claude && claude.use ? Promise.race([claude.use(n).catch(() => null), new Promise(r => setTimeout(() => r(null), 11000))]) : Promise.resolve(null);
  [room, user, db] = await Promise.all([use('room'), use('user'), use('db')]);
  NET.room = room; NET.db = db; NET.user = user;
  if (!room) { startHost(db, '🎮 혼자 플레이 중 (멀티 연결 불가 — claude.ai에 로그인한 상태로 열어주세요)'); return; }
  const isOwner = user ? !!user.isOwner() : false;
  let decided = false;
  room.onPeers(ch => {
    const me = ch.peers.find(p => p.sameTab); if (me) NET.myPeer = me.peer;
    const host = ch.peers.find(p => !p.sameTab && p.presence && p.presence.host);
    if (NET.mode === 'host') return hostPeers(ch);
    if (NET.mode === 'client') {
      if (!host) { setNetStatus('⚠ 방장이 나갔습니다', '#ff8a8a'); if (S.me) announce('방장(호스트)이 게임을 닫았습니다', '#ff8a8a'); NET.hostPeer = null; }
      else if (host.peer !== NET.hostPeer) { const wasNone = !NET.hostPeer; NET.hostPeer = host.peer; setNetStatus(`✅ ${host.presence.hn || '방장'}의 게임에 연결됨`); if (!wasNone && S.me) { announce('방장이 다시 열었습니다. 새로고침 하세요.', '#ffe08a'); } }
      return;
    }
    if (host && !decided) { decided = true; startClient(room, host); }
  });
  room.on('g', msg => { if (NET.mode === 'client' && msg.data && msg.data.to === NET.myPeer) recvChunk(msg.data); });
  // 다른 방장이 있는지 잠깐 기다림
  await new Promise(r => setTimeout(r, 2500));
  if (decided) return;
  decided = true;
  if (isOwner || (user && user.canEdit && user.canEdit())) startHost(db, '🏠 내가 방장(호스트)입니다 — 친구들이 이 링크로 들어오면 함께 플레이!');
  else { NET.mode = 'client'; setNetStatus('⏳ 방장이 아직 게임을 열지 않았어요. 방장이 이 페이지를 열면 자동 연결됩니다.', '#ffe08a'); }
}
function startClient(room, host) {
  NET.mode = 'client'; NET.hostPeer = host.peer;
  setNetStatus(`✅ ${host.presence.hn || '방장'}의 게임에 연결됨`);
  room.presence({ c: 1, q: [] }).catch(() => { });
  send = o => {
    if (!NET.hostPeer) return;
    if (o.t === 'mv') o.ct = Math.round(performance.now());
    NET.q.push([++NET.seq, o]); while (NET.q.length > 14) NET.q.shift();
    NET.room.presence({ q: NET.q }).catch(() => { });
  };
}
function recvChunk(d) {
  let c = NET.chunks.get(d.k); if (!c) { c = { parts: [], got: 0, t: Date.now() }; NET.chunks.set(d.k, c); }
  if (!c.parts[d.i]) { c.parts[d.i] = d.s; c.got++; }
  if (c.got === d.n) { NET.chunks.delete(d.k); let z; try { z = JSON.parse(c.parts.join('')); } catch (e) { return; } z.forEach(m => onMsg(m)); }
  if (NET.chunks.size > 30) { const now = Date.now(); for (const [k, v] of NET.chunks) if (now - v.t > 4000) NET.chunks.delete(k); }
}
// ── 방장(호스트) ──
const hexName = n => 'p_' + Array.from(new TextEncoder().encode(n)).map(b => b.toString(16).padStart(2, '0')).join('');
async function loadSaves(db) {
  if (NET.preSaves) return NET.preSaves;
  const saves = {};
  if (db) {
    try { const snap = await Promise.race([db.collection('saves').get(), new Promise((_, j) => setTimeout(() => j('timeout'), 10000))]); snap.docs.forEach(d => { const v = d.data(); if (v && v.name && v.s) saves[v.name] = v.s; }); }
    catch (e) { log('⚠ 저장 데이터를 불러오지 못했습니다. (새로 시작)', '#ffb4b4'); }
  } else { try { const o = JSON.parse(localStorage.getItem('baram_saves') || '{}'); Object.assign(saves, o && o.saves ? o.saves : o); } catch (e) { } }
  return saves;
}
function makeSaver(db) {
  const last = {}; let busy = false;
  return { save(S) {
    if (!db) {
      const pack = JSON.stringify({ t: Date.now(), saves: S, srv: NET.serverOnly ? 1 : 0, solo: NET.serverOnly ? 0 : 1 });
      try { localStorage.setItem(NET.code ? 'baram_saves_' + NET.code : 'baram_saves', pack); } catch (e) { }
      // 인터넷 백업 (중계 서버에 보관) — 방장 폰 데이터가 지워져도 복구 가능
      if (NET.mq && NET.code) { const j = JSON.stringify(S); const now = Date.now(); if (j !== NET._lastBk && (!NET._bkT || now - NET._bkT > 20000)) { NET._lastBk = j; NET._bkT = now; try { NET.mq.publish(TP + NET.code + '/save', pack, { retain: true, qos: 1 }); } catch (e) { } } }
      return;
    }
    if (busy) return; busy = true;
    (async () => { for (const name in S) { const j = JSON.stringify(S[name]); if (last[name] === j) continue; try { await db.doc('saves/' + hexName(name)).set({ name, s: S[name] }); last[name] = j; } catch (e) { } } busy = false; })();
  } };
}
async function startHost(db, status, after) {
  NET.mode = 'host'; setNetStatus('게임 세계를 여는 중...');
  const saves = await loadSaves(db);
  ENGINE.start(saves, makeSaver(db));
  addEventListener('visibilitychange', () => { if (document.hidden) ENGINE.saveAll(); });
  const local = { send(o) { const m = typeof o === 'string' ? JSON.parse(o) : JSON.parse(JSON.stringify(o)); queueMicrotask(() => onMsg(m)); } };
  ENGINE.connect(local);
  send = o => { if (local.onmsg) local.onmsg(JSON.stringify(o)); };
  setNetStatus(status);
  if (NET.room) { NET.room.presence({ host: 1, hn: '' }).catch(() => { }); setInterval(flushRemotes, 200); }
  if (after) after();
}
function hostPeers(ch) {
  for (const p of ch.left) { const r = NET.remotes.get(p.peer); if (r) { NET.remotes.delete(p.peer); if (r.conn.onclose) r.conn.onclose(); } }
  for (const p of ch.peers) {
    if (p.sameTab || p.isMe && p.sameTab) continue;
    const q = p.presence && p.presence.q; if (!Array.isArray(q)) continue;
    let r = NET.remotes.get(p.peer);
    if (!r) { r = makeRemote(p.peer); NET.remotes.set(p.peer, r); ENGINE.connect(r.conn); }
    for (const it of q) { if (!Array.isArray(it) || typeof it[0] !== 'number') continue; if (it[0] > r.last) { r.last = it[0]; try { if (r.conn.onmsg) r.conn.onmsg(JSON.stringify(it[1])); } catch (e) { } } }
  }
}
function makeRemote(peer, emit) {
  const r = { peer, last: 0, out: [], snap: null, me: null, meT: 0, ap: {}, seen: Date.now(), emit: emit || (z => artEmit(peer, z)) };
  r.conn = { send(o) {
    const m = typeof o === 'string' ? JSON.parse(o) : JSON.parse(JSON.stringify(o));
    if (m.t === 's') { r.snap = m; return; }
    if (m.t === 'me') { r.me = m; return; }
    if (m.t === 'map' && !m.inner && !String(m.id).startsWith('tent_') && m.id !== 'house') { delete m.tiles; delete m.biome; } // 텐트·실내 지도는 손님 폰에 없으니 타일을 그대로 보냄
    if (m.t === 'welcome' && m.atlas) { m.atlas = Object.assign({}, m.atlas); delete m.atlas.tiles; }
    r.out.push(m);
  } };
  return r;
}
let chunkId = 0;
function flushRemotes() {
  const now = Date.now();
  for (const r of NET.remotes.values()) {
    const z = r.out.splice(0);
    if (r.me && now - r.meT > 450) { z.push(r.me); r.me = null; r.meT = now; }
    const viaRtc = r.dc && r.dc.readyState === 'open'; r._tg = !r._tg;
    if (r.snap && (viaRtc || r._tg)) {
      const s = r.snap; r.snap = null;
      for (const p of s.P) { const j = JSON.stringify(p.a); if (r.ap[p.i] === j) delete p.a; else r.ap[p.i] = j; }
      if (s.fx.length > 30) s.fx = s.fx.slice(-30);
      s.q = r.sq = (r.sq || 0) + 1;
      if (!(viaRtc && !s.P.some(p => p.a) && window.rtcSendU && rtcSendU(r, [s]))) z.push(s);
    }
    if (!z.length) continue;
    r.emit(z);
  }
}
function artEmit(peer, z) {
  const str = JSON.stringify(z); const n = Math.ceil(str.length / 1100); const k = (++chunkId).toString(36);
  for (let i = 0; i < n; i++) NET.room.emit('g', { to: peer, k, i, n, s: str.slice(i * 1100, (i + 1) * 1100) }).catch(() => { });
}
// ── 웹(공개 사이트) 버전: 공개 MQTT 중계 서버로 방 코드 접속 (로그인 불필요) ──
const BROKERS = window.TEST_BROKERS || ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
const TP = 'baramdaeryuk/v1/';
function mqConnect() {
  return new Promise((res, rej) => {
    let i = 0;
    const tryNext = () => {
      if (i >= BROKERS.length) return rej('fail');
      const url = BROKERS[i++]; let done = false;
      const c = mqtt.connect(url, { clientId: 'bd' + Math.random().toString(36).slice(2, 12), clean: true, connectTimeout: 6000, reconnectPeriod: 2000, keepalive: 20, will: NET.will || undefined });
      const to = setTimeout(() => { if (!done) { done = true; c.end(true); tryNext(); } }, 7000);
      c.once('connect', () => { if (done) return; done = true; clearTimeout(to); res(c); });
      c.once('error', () => { if (done) return; done = true; clearTimeout(to); c.end(true); tryNext(); });
    };
    tryNext();
  });
}
function webLobby() {
  $('step1').insertAdjacentHTML('beforeend', `<div id="lobby" style="margin-top:10px">
    <div class="row"><button class="btn green" id="lhost" style="flex:1">🏠 방 만들기 (방장)</button></div>
    <div class="row"><input id="lcode" placeholder="방 코드 4자리" maxlength="4" inputmode="numeric" style="width:120px;text-align:center;font-size:18px;letter-spacing:4px"><button class="btn blue" id="ljoin" style="flex:1">🚪 참가하기</button></div>
    <div class="row"><button class="btn sm" id="lsolo">🎮 혼자 하기</button></div>
    <div class="sub" style="font-size:11px;margin-top:6px">방장이 [방 만들기]를 누르면 4자리 코드가 나옵니다. 친구들은 코드를 넣고 [참가하기]. 로그인은 필요 없어요.</div></div>`);
  $('go').style.display = 'none';
  setNetStatus('이름을 적고 방을 만들거나 참가하세요.');
  const h = (location.hash || '').replace('#', ''); if (/^\d{4}$/.test(h)) $('lcode').value = h;
  const needName = () => { const n = $('nm').value.trim(); if (!n) { $('lerr').textContent = '먼저 캐릭터 이름을 입력하세요.'; return null; } $('lerr').textContent = ''; return n; };
  const lock = () => { $('lobby').querySelectorAll('button').forEach(b => b.disabled = true); };
  const unlock = () => { $('lobby').querySelectorAll('button').forEach(b => b.disabled = false); };
  $('lsolo').onclick = () => { const n = needName(); if (!n) return; lock(); startHost(null, '🎮 혼자 플레이', () => { NET.hostName = n; send(loginMsg(n)); }); };
  // ── 방장: 방 열기 (한 번 만든 방 코드는 계속 유지 → 이어하기) ──
  const hostRoom = async (n, wantCode) => {
    lock(); setNetStatus('중계 서버에 연결하는 중...');
    let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
    const code = wantCode || ((mem.role === 'host' || mem.role === 'server') && mem.code) || String(1000 + Math.floor(Math.random() * 9000));
    NET.code = code; NET.will = { topic: TP + code + '/host', payload: '', retain: true, qos: 0 };
    let c; try { c = await mqConnect(); } catch (e) { unlock(); setNetStatus('⚠ 중계 서버 연결 실패. 인터넷을 확인하거나 [혼자 하기]를 이용하세요.', '#ff8a8a'); return; }
    // 같은 코드로 이미 방장이 있으면 참가로 전환
    setNetStatus('방 정보를 확인하는 중...');
    let otherHost = null, backup = null;
    const onPre = (topic, buf) => { const str = buf.toString(); if (topic.endsWith('/host')) { if (str) { try { const d = JSON.parse(str); if (Date.now() - d.t < 60000) otherHost = d; } catch (e) { } } } else if (topic.endsWith('/save')) { try { backup = JSON.parse(str); } catch (e) { } } };
    c.on('message', onPre); c.subscribe([TP + code + '/host', TP + code + '/save']);
    await new Promise(r => setTimeout(r, 2200));
    c.removeListener('message', onPre); c.unsubscribe([TP + code + '/host', TP + code + '/save']);
    // 서버(아이패드) 방과 혼자 하는 방은 저장을 절대 섞지 않음
    if (!NET.serverOnly) {
      let lastG = false; try { lastG = (mem.role === 'guest' && mem.code === code) || JSON.parse(localStorage.getItem('baram_srvcodes') || '[]').includes(code); } catch (e) { }
      if ((backup && backup.srv) || (otherHost && otherHost.srv) || lastG) {
        if (!(otherHost && otherHost.sid !== NET.sid)) {
          c.end(true); unlock(); let solo = null; try { solo = localStorage.getItem('baram_solo'); } catch (e) { }
          if (!solo || solo === code) { solo = String(1000 + Math.floor(Math.random() * 9000)); if (solo === code) solo = String((+solo % 9000) + 1000); try { localStorage.setItem('baram_solo', solo); } catch (e) { } }
          setNetStatus(`${code}번은 아이패드 서버 방이라 혼자 하기는 따로 ${solo}번 방으로 열어요. (서버 캐릭터와 별개)`, '#ffe08a'); $('lcode').value = '';
          return hostRoom(n, solo);
        }
      }
    } else if (backup && backup.solo) backup = null; // 서버는 혼자 하기 백업을 가져오지 않음
    if (otherHost && otherHost.sid !== NET.sid) { c.end(true); unlock(); setNetStatus(`${otherHost.n}님이 이미 ${code}번 방을 열어 두었어요. [참가하기]로 들어가세요.`, '#ffe08a'); $('lcode').value = code; return; }
    // 저장 데이터: 이 폰의 저장 vs 인터넷 백업 중 최신 것
    let local = null; try { local = JSON.parse(localStorage.getItem('baram_saves_' + code) || 'null'); } catch (e) { }
    if (!local && mem.code === code) { try { const old = JSON.parse(localStorage.getItem('baram_saves') || 'null'); if (old) local = old.saves ? old : { t: 0, saves: old }; } catch (e) { } }
    const pickB = backup && backup.saves && (!local || (backup.t || 0) > (local.t || 0));
    NET.preSaves = (pickB ? backup.saves : local && local.saves) || {};
    NET.mq = c; NET.sid = NET.sid || Math.random().toString(36).slice(2, 9);
    try { localStorage.setItem('baram_last', JSON.stringify(NET.serverOnly ? { role: 'server', code, name: '서버' } : { role: 'host', code, name: n })); } catch (e) { }
    startHost(null, '', () => {
      c.subscribe(TP + code + '/h');
      const pubHost = () => c.publish(TP + code + '/host', JSON.stringify({ n: NET.hostName || n || '서버', t: Date.now(), sid: NET.sid, srv: NET.serverOnly ? 1 : 0 }), { retain: true });
      pubHost(); setInterval(pubHost, 5000);
      c.on('connect', () => { c.subscribe(TP + code + '/h'); pubHost(); });
      c.on('message', (topic, buf) => {
        if (!topic.endsWith('/h')) return;
        let d; try { d = JSON.parse(buf.toString()); } catch (e) { return; }
        if (!d || typeof d.cid !== 'string') return;
        let r = NET.remotes.get(d.cid);
        if (d.bye) { if (r) { NET.remotes.delete(d.cid); if (r.conn.onclose) r.conn.onclose(); } return; }
        if (!r) { const rr = r = makeRemote(d.cid, z => { if (!(window.rtcSend && rtcSend(rr, z))) c.publish(TP + code + '/c/' + d.cid, JSON.stringify(z)); }); NET.remotes.set(d.cid, r); ENGINE.connect(r.conn); }
        r.seen = Date.now();
        if (d.rtc && window.rtcHostSignal) { rtcHostSignal(r, d.rtc, o => c.publish(TP + code + '/c/' + d.cid, JSON.stringify(o))); return; }
        if (d.m && r.conn.onmsg) { try { r.conn.onmsg(JSON.stringify(d.m)); } catch (e) { } }
      });
      setInterval(flushRemotes, 100);
      setInterval(() => { const now = Date.now(); for (const [k, r] of NET.remotes) if (now - r.seen > 25000) { NET.remotes.delete(k); if (r.conn.onclose) r.conn.onclose(); } }, 5000);
      setInterval(() => ENGINE.saveAll(), 10000);
      const bye = () => { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); }; addEventListener('pagehide', () => { bye(); try { c.publish(TP + code + '/host', '', { retain: true }); } catch (e) { } }); addEventListener('visibilitychange', () => { if (document.hidden) bye(); });
      if (NET.serverOnly) { NET.hostName = '서버'; showServerDash(code, pickB); }
      else { NET.hostName = n; send(loginMsg(n)); showCode(code); }
      if (pickB) log('인터넷 백업에서 저장 데이터를 불러왔어요.', '#9fe8ff');
    });
  };
  $('lhost').onclick = () => { const n = needName(); if (!n) return; const typed = $('lcode').value.trim(); hostRoom(n, /^\d{4}$/.test(typed) ? typed : null); };
  NET.hostRoom = hostRoom;
  $('ljoin').onclick = async () => {
    const n = needName(); if (!n) return; const code = $('lcode').value.trim(); if (!/^\d{4}$/.test(code)) { $('lerr').textContent = '방 코드 4자리를 입력하세요.'; return; }
    lock(); setNetStatus('방을 찾는 중...');
    let c; try { c = await mqConnect(); } catch (e) { unlock(); setNetStatus('⚠ 중계 서버 연결 실패. 인터넷을 확인하세요.', '#ff8a8a'); return; }
    NET.mq = c; NET.mode = 'client'; NET.code = code;
    let cid; try { cid = sessionStorage.getItem('baram_cid'); } catch (e) { } if (!cid) { cid = 'c' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('baram_cid', cid); } catch (e) { } }
    NET.cid = cid; let lastHost = 0; let found = false;
    c.subscribe([TP + code + '/host', TP + code + '/c/' + cid]);
    c.on('connect', () => c.subscribe([TP + code + '/host', TP + code + '/c/' + cid]));
    c.on('message', (topic, buf) => {
      if (topic.endsWith('/host')) {
        const str = buf.toString(); if (!str) { NET.hostPeer = null; setNetStatus('⚠ 방장이 나갔습니다', '#ff8a8a'); if (S.me) announce('방장(호스트)이 게임을 닫았습니다', '#ff8a8a'); return; }
        let d; try { d = JSON.parse(str); } catch (e) { return; }
        if (d.t && Date.now() - d.t > 60000) return; // 오래된 방장 정보는 무시
        lastHost = Date.now(); NET.hostPeer = 'host'; if (d.srv) { try { const sc = JSON.parse(localStorage.getItem('baram_srvcodes') || '[]'); if (!sc.includes(code)) { sc.push(code); localStorage.setItem('baram_srvcodes', JSON.stringify(sc.slice(-10))); } } catch (e) { } }
        if (!found || (d.sid && NET.hostSid && d.sid !== NET.hostSid)) {
          const re = found; found = true; NET.hostSid = d.sid; setNetStatus(`✅ ${d.n}님의 방(${code})에 연결됨`);
          try { localStorage.setItem('baram_last', JSON.stringify({ role: 'guest', code, name: n })); const sc = JSON.parse(localStorage.getItem('baram_srvcodes') || '[]'); if (!sc.includes(code)) { sc.push(code); localStorage.setItem('baram_srvcodes', JSON.stringify(sc.slice(-10))); } } catch (e) { }
          send(loginMsg(n)); if (re) { announce('방장이 다시 방을 열었어요. 이어서 플레이합니다!', '#9fe8ff'); if (window.rtcClientStart) setTimeout(() => rtcClientStart(o => c.publish(TP + code + '/h', JSON.stringify(Object.assign({ cid }, o)))), 1500); }
        } else NET.hostSid = d.sid;
        return;
      }
      let z; try { z = JSON.parse(buf.toString()); } catch (e) { return; } if (!Array.isArray(z)) { if (z && z.rtc && window.rtcClientAnswer) rtcClientAnswer(z.rtc); return; } z.forEach(m => onMsg(m));
    });
    send = o => { if (o.t === 'mv') o.ct = Math.round(performance.now()); if (window.rtcClientSend && rtcClientSend(o)) return; if (!NET.mq) return; c.publish(TP + code + '/h', JSON.stringify({ cid, m: o })); };
    if (window.rtcClientStart) setTimeout(() => rtcClientStart(o => c.publish(TP + code + '/h', JSON.stringify(Object.assign({ cid }, o)))), 1500);
    setInterval(() => c.publish(TP + code + '/h', JSON.stringify({ cid })), 5000);
    addEventListener('pagehide', () => { try { c.publish(TP + code + '/h', JSON.stringify({ cid, bye: 1 })); } catch (e) { } });
    setTimeout(() => { if (!found) setNetStatus(`${code}번 방장이 아직 방을 열지 않았어요. 방장이 열면 자동으로 들어갑니다.`, '#ffe08a'); }, 6000);
    setInterval(() => { if (found && Date.now() - lastHost > 16000) { setNetStatus('⚠ 방장과 연결이 끊겼습니다', '#ff8a8a'); if (S.me) announce('방장과 연결이 끊겼습니다 (방장 화면이 꺼졌을 수 있어요)', '#ff8a8a'); lastHost = Date.now(); } }, 4000);
  };
}
function showCode(code) {
  const d = document.createElement('div'); d.id = 'roomcode';
  d.style.cssText = 'margin-top:4px;padding:3px 6px;font-weight:bold;font-size:14px;color:#1a1008;background:#ffd04a;border-radius:4px;text-align:center;cursor:pointer';
  d.textContent = `🔑 방 코드 ${code}`; d.title = '친구에게 이 코드를 알려주세요';
  d.onclick = () => { const url = location.href.split('#')[0] + '#' + code; try { navigator.clipboard.writeText(url).then(() => log('참가 링크를 복사했어요: ' + url, '#9fe8ff')); } catch (e) { log('참가 링크: ' + url, '#9fe8ff'); } };
  $('mini').appendChild(d);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(connect, 0)); else setTimeout(connect, 0); // 모든 스크립트(ui.js 등) 로드 후 실행

// ── 페이지 안 확인창 (confirm/prompt 대신) ──
function uiAsk(text, onYes, opt = {}) {
  let d = $('askbox'); if (!d) { d = document.createElement('div'); d.id = 'askbox'; d.className = 'panel win'; d.style.zIndex = 60; document.body.appendChild(d); }
  d.innerHTML = `<div class="dtext" style="max-width:320px">${esc(text)}</div>${opt.num ? `<input type="number" id="asknum" min="1" max="${opt.max}" value="${opt.max}" style="width:120px;margin-bottom:8px">` : ''}<div class="row"><button class="btn green" id="askyes">확인</button><button class="btn red" id="askno">취소</button></div>`;
  d.classList.remove('hidden');
  $('askyes').onclick = () => { const v = opt.num ? Math.max(1, Math.min(opt.max, parseInt($('asknum').value) || 0)) : true; d.classList.add('hidden'); onYes(v); };
  $('askno').onclick = () => d.classList.add('hidden');
}

// ═══════ 로그인 / 캐릭터 생성 ═══════
const CR = { g: 'm', h: 0, hc: 0, sk: 0, job: 'warrior' };
$('go').onclick = () => { const n = $('nm').value.trim(); if (!n) return; if ((ART || window.BUILD === 'web') && NET.mode !== 'host' && !NET.hostPeer) { $('lerr').textContent = '아직 방장의 게임에 연결되지 않았어요.'; return; } try { localStorage.setItem('baram_name', n); } catch (e) { } if (NET.mode === 'host' && NET.room) NET.room.presence({ host: 1, hn: n }).catch(() => { }); if (NET.mode === 'host') NET.hostName = n; send(loginMsg(n)); };
$('nm').onkeydown = e => { if (e.key === 'Enter') $('go').click(); };
$('back').onclick = () => { /* 이미 방에 연결된 상태라 첫 화면만 다시 보여주면 버튼이 먹통 → 깨끗하게 다시 시작 */ $('back').disabled = true; $('back').textContent = '돌아가는 중…'; setTimeout(() => location.reload(), 50); };
$('make').onclick = () => send({ t: 'create', key: devKey(), name: $('nm').value.trim(), gender: CR.g, hair: CR.h, hairColor: CR.hc, skin: CR.sk, job: CR.job });
function opts(el, list, key) {
  el.innerHTML = list.map((o, i) => `<div class="opt ${CR[key] === o.v ? 'on' : ''}" data-v="${i}">${o.html}</div>`).join('');
  el.querySelectorAll('.opt').forEach(d => d.onclick = () => { CR[key] = list[+d.dataset.v].v; buildCreate(); });
}
function buildCreate() {
  opts($('gsel'), [{ v: 'm', html: '<b>남자</b>' }, { v: 'f', html: '<b>여자</b>' }], 'g');
  opts($('hsel'), ['기본', '삐죽', '긴머리', '묶음'].map((n, i) => ({ v: i, html: n })), 'h');
  opts($('hcsel'), HAIRC.map((c, i) => ({ v: i, html: `<span style="display:inline-block;width:16px;height:16px;background:${c};border:1px solid #000"></span>` })), 'hc');
  opts($('sksel'), SKIN.map((c, i) => ({ v: i, html: `<span style="display:inline-block;width:16px;height:16px;background:${c};border:1px solid #000"></span>` })), 'sk');
  opts($('jsel'), ['warrior', 'mage', 'healer'].map(j => ({ v: j, html: `<b>${GD.JOBS[j].name}</b><small>${j === 'warrior' ? '근접·탱커' : j === 'mage' ? '마법·광역' : '치유·원거리'}</small>` })), 'job');
  const J = GD.JOBS[CR.job];
  $('jdesc').innerHTML = `<b>${J.name}</b> — ${J.desc}<br><br>Lv${GD.PROMO_LEVEL} 전직: ` + GD.PROMOS[CR.job].map(p => `<b style="color:#c4b5fd">${GD.JOBS[p].name}</b> (${GD.JOBS[p].desc})`).join(' / ');
  const pc = $('preview').getContext('2d'); pc.imageSmoothingEnabled = false; pc.clearRect(0, 0, 112, 160);
  const ap = { job: CR.job, g: CR.g, h: CR.h, hc: CR.hc, sk: CR.sk, eq: { weapon: [0, 0, 0, { warrior: 'sword', mage: 'staff', healer: 'bow' }[CR.job]] } };
  pc.drawImage(charSprite(ap, 0, 0), 0, 0, 112, 160);
}

// ═══════ 메시지 처리 ═══════
function onMsg(m) {
  switch (m.t) {
    case 'err': $('lerr').textContent = m.text; break;
    case 'needCreate': $('step1').classList.add('hidden'); $('step2').classList.remove('hidden'); $('cnm').textContent = m.name; buildCreate(); break;
    case 'welcome':
      S.myId = m.id; S.atlas = m.atlas; buildAtlasBase();
      $('login').classList.add('hidden'); $('hud').classList.remove('hidden');
      if (TOUCH) { $('touch').classList.remove('hidden'); document.body.classList.add('touchmode'); buildTouch(); }
      break;
    case 'map': loadMap(m); break;
    case 'tents': if (S.map && m.map === S.map.id) { S.tents = m.list; S.plots = m.plots || []; } break;
    case 'tset': if (S.map && m.map === S.map.id) { for (const [x, y, v] of m.l) S.map.t[y * S.map.w + x] = v; gChunks.clear(); try { S.miniBase = null; } catch (e) { } } break;
    case 'me': S.me = m; refreshHud(true); rerenderPanel(); break;
    case 'pos': { if (m.ep != null) pos.ep = m.ep; if (pos.x === m.x && pos.y === m.y) break; const near = Math.abs(pos.rx - m.x) + Math.abs(pos.ry - m.y) <= 4; pos.x = m.x; pos.y = m.y; if (near) { pos.fx = pos.rx; pos.fy = pos.ry; pos.t0 = performance.now(); pos.dur = 140; pos.moving = true; } else { pos.rx = m.x; pos.ry = m.y; pos.moving = false; } break; } // 가까우면 미끄러지듯 보정
    case 's': snapshot(m); break;
    case 'msg': log(m.text, m.c); if (m.big) announce(m.text, m.c); break;
    case 'chat': log(`<b>${esc(m.name)}</b>: ${esc(m.text)}`, '#fff', true); S.bubbles.set(m.id, { text: m.text, until: performance.now() + 5000 }); break;
    case 'dlg': if (m.close) closePanel(); else openDlg(m); break;
    case 'tentOpen': openBuild(m.s || 'tent'); break;
    case 'trade': if (m.close) { S.trade = null; if (S.panel && S.panel.kind === 'trade') closePanel(); } else { S.trade = m; openPanel('trade'); } break;
    case 'tradeAsk': openAsk(m); break;
    case 'sboss': S.sb = m.off ? null : Object.assign(m, { end: Date.now() + (m.left || 0) }); sbBanner(); break;
    case 'boss': S.bossList = m.list; if ('sb' in m) { S.sb = m.sb ? Object.assign(m.sb, { end: Date.now() + (m.sb.left || 0) }) : null; sbBanner(); } if (S.panel && S.panel.kind === 'boss') rerenderPanel(); break;
    case 'upgRes': flash(m.ok ? '#7dffb0' : '#ff5a5a'); break;
  }
}
function loadMap(m) {
  let t; if (m.tiles) { const bin = atob(m.tiles); t = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) t[i] = bin.charCodeAt(i); }
  else if (window.ENGINE && ENGINE.MAPS[m.id]) { t = ENGINE.MAPS[m.id].t.slice(); if (m.id === 'world') m.biome = ENGINE.biomeStr(); }
  else { t = new Uint8Array(m.w * m.h); }
  S.map = Object.assign({}, m, { t }); S.P.clear(); S.M.clear(); S.D = []; S.fx = []; S.tents = []; S.plots = [];
  S.roof = new Map(); for (const l of m.labels) if (l.roofC) for (let y = l.by; y < l.by + 2; y++) for (let x = l.bx; x < l.bx + 5; x++) S.roof.set(x + ',' + y, l.roofC);
  // 미니맵
  const mc = mk(m.w, m.h), g = mc.getContext('2d'); const id = g.createImageData(m.w, m.h);
  for (let i = 0; i < t.length; i++) { let col = MINI_COL[t[i]] || '#000'; const n = parseInt(col.slice(1), 16); id.data[i * 4] = n >> 16; id.data[i * 4 + 1] = n >> 8 & 255; id.data[i * 4 + 2] = n & 255; id.data[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0); S.mini = mc;
  $('mapname').textContent = m.name;
  try { resize(); } catch (e) { } // 집 안/밖 전환 시 시점 다시 맞춤
}
function snapshot(m) {
  if (m.q) { if (S._sq && m.q <= S._sq && S._sq - m.q < 50) return; S._sq = m.q; } // 늦게 온 옛 위치 정보는 버림
  const now = performance.now();
  if (m.tm) S.off = m.tm - Date.now();
  S.nl = m.nl; S.you = m.you;
  const seen = new Set();
  S.apc = S.apc || {};
  for (const p of m.P) {
    seen.add(p.i);
    if (p.a) S.apc[p.i] = p.a; else p.a = S.apc[p.i] || { job: 'warrior', eq: {} };
    let e = S.P.get(p.i);
    if (!e) { e = Object.assign({ rx: p.x, ry: p.y, fx: p.x, fy: p.y, t0: 0, dur: 1 }, p); S.P.set(p.i, e); }
    else if (e.x !== p.x || e.y !== p.y) { const far = Math.abs(e.x - p.x) + Math.abs(e.y - p.y) > 2; e.fx = far ? p.x : e.rx; e.fy = far ? p.y : e.ry; e.t0 = now; e.dur = (p.a.mt ? 140 : 210) * (Math.abs(e.x - p.x) === 1 && Math.abs(e.y - p.y) === 1 ? 1.41 : 1); e.walkUntil = now + 260; }
    Object.assign(e, p);
  }
  for (const k of [...S.P.keys()]) if (!seen.has(k)) S.P.delete(k);
  const seenM = new Set();
  for (const o of m.M) {
    seenM.add(o.i);
    let e = S.M.get(o.i);
    if (!e) { e = Object.assign({ rx: o.x, ry: o.y, fx: o.x, fy: o.y, t0: 0, dur: 1, flip: false }, o); S.M.set(o.i, e); }
    else if (e.x !== o.x || e.y !== o.y) { e.fx = e.rx; e.fy = e.ry; e.t0 = now; e.dur = 320; e.walkUntil = now + 360; }
    if (o.d === 1) e.flip = true; else if (o.d === 2) e.flip = false;
    Object.assign(e, o);
  }
  for (const k of [...S.M.keys()]) if (!seenM.has(k)) S.M.delete(k);
  S.D = m.D;
  for (const f of m.fx) addFx(f);
  if (S.target && !S.M.has(S.target)) S.target = null;
  if (m.you.tg && S.M.has(m.you.tg) && !S.target) S.target = m.you.tg;
}

// ═══════ 입력 ═══════
const keys = {}; const held = []; let lastFace = 0, lastAtk = 0, touchDir = -1, touchAtk = false;
const KEYDIR = { ArrowDown: 0, s: 0, S: 0, ArrowLeft: 1, a: 1, A: 1, ArrowRight: 2, d: 2, D: 2, ArrowUp: 3, w: 3, W: 3 };
const chatin = $('chatin');
addEventListener('keydown', e => {
  if (!S.me) return;
  if (document.activeElement === chatin) {
    if (e.key === 'Enter') { const t = chatin.value.trim(); if (t) send({ t: 'chat', text: t }); chatin.value = ''; chatin.blur(); chatin.classList.add('hidden'); }
    if (e.key === 'Escape') { chatin.blur(); chatin.classList.add('hidden'); }
    return;
  }
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  const k = e.key;
  if (k in KEYDIR) { const d = KEYDIR[k]; if (!held.includes(d)) held.push(d); if (!e.repeat) S.tapDir = d; e.preventDefault(); return; }
  if (k === ' ') { keys.space = true; e.preventDefault(); return; }
  if (e.repeat) return;
  if (k === 'Enter') { chatin.classList.remove('hidden'); chatin.focus(); e.preventDefault(); return; }
  if (k === 'Escape') { if (S.place) { S.place = null; return; } closePanel(); closePanel2(); hideTip(); return; }
  if (k >= '1' && k <= '8') { castSkill(+k - 1); return; }
  if (k === 'f' || k === 'F') { castSkill(8); return; } if (k === 'g' || k === 'G') { castSkill(9); return; } // 3차 전직 9·10번 스킬
  const pot = { '7': 'hp', '8': 'mp', '9': 'buffAtk', '0': 'buffDef' }[k]; if (pot) { usePot(pot); return; }
  hotkey(k.toLowerCase());
});
addEventListener('keyup', e => { if (e.key in KEYDIR) { const d = KEYDIR[e.key]; const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); } if (e.key === ' ') keys.space = false; });
addEventListener('blur', () => { held.length = 0; keys.space = false; });
function hotkey(k) {
  switch (k) {
    case 'i': togglePanel('inv'); break;
    case 'm': togglePanel('map'); break;
    case 'k': togglePanel('skills'); break;
    case 'b': if (S.panel && S.panel.kind === 'build') closePanel(); else openBuild(); break;
    case 'r': send({ t: 'ride' }); break;
    case 'h': send({ t: 'boss' }); togglePanel('boss'); break;
    case 'e': send({ t: 'interact' }); break;
    case 'z': send({ t: 'pick' }); break;
    case 'tab': cycleTarget(); break;
  }
}
addEventListener('keydown', e => { if (e.key === 'Tab' && S.me && document.activeElement !== chatin) { e.preventDefault(); cycleTarget(); } });
document.querySelectorAll('#menu .btn').forEach(b => b.onclick = () => { hotkey(b.dataset.k); });
function heldDir() { if (touchDir >= 0) return touchDir; if (held.length) return held[held.length - 1]; if (S.tapDir >= 0) { const d = S.tapDir; S.tapDir = -1; return d; } return -1; }
function castSkill(i) { if (!S.me) return; const id = S.me.skills[i]; if (!id) return; const sk = GD.SKILL[id]; if (S.me.lv < sk.lv) return log(`[${sk.name}]은(는) Lv${sk.lv}에 배웁니다.`, '#bbb'); send({ t: 'skill', id }); }
function usePot(kind) {
  if (!S.me) return;
  const pref = kind === 'hp' ? ['stew', 'meatCooked', 'hp3', 'hp2', 'hp1', 'feast'] : kind === 'mp' ? ['mp3', 'mp2', 'mp1', 'stew'] : [kind];
  const st = S.me.st, you = S.you;
  let order = pref;
  if (kind === 'hp') { const miss = st.maxHp - (you.hp || 0); order = miss > 1000 ? ['hp3', 'hp2', 'stew', 'meatCooked', 'hp1', 'feast'] : miss > 300 ? ['hp2', 'hp3', 'stew', 'meatCooked', 'hp1', 'feast'] : ['hp1', 'meatCooked', 'hp2', 'stew', 'feast', 'hp3']; }
  if (kind === 'mp') { const miss = st.maxMp - (you.mp || 0); order = miss > 200 ? ['mp2', 'mp1', 'stew'] : ['mp1', 'mp2', 'stew']; }
  for (const id of order) if (S.me.inv.some(o => o.k === 'use' && o.id === id)) return send({ t: 'useId', id });
  log(`${kind === 'hp' ? '체력 회복 아이템' : kind === 'mp' ? '마나 물약' : GD.CONSUMES[kind].name}이(가) 없습니다.`, '#bbb');
}
function cycleTarget() {
  const list = [...S.M.values()].filter(m => !m.s).sort((a, b) => Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y)).slice(0, 6);
  if (!list.length) { log('주변에 타겟으로 잡을 몬스터가 없어요.', '#bbb'); return; } const i = list.findIndex(m => m.i === S.target); const t = list[(i + 1) % list.length]; setTarget(t.i);
}
function setTarget(id) { S.target = id; send({ t: 'target', id }); }

// 캔버스 클릭/탭
cv.addEventListener('pointerdown', e => {
  if (!S.map || !S.me) return; hideTip();
  const [crx, cry] = camC(); const camX = Math.floor(crx * TS + TS / 2 - W / 2), camY = Math.floor(cry * TS + TS / 2 - H / 2);
  const wx = (e.clientX / ZOOM + camX) / TS, wy = (e.clientY / ZOOM + camY) / TS; const tx = Math.floor(wx), ty = Math.floor(wy);
  if (S.place) { placeAt(tx, ty); return; }
  // 몬스터
  let best = null, bd = 1.2;
  for (const m of S.M.values()) { if (m.s) continue; const sz = (GD.MONS[m.t] || {}).size || 1; const d = Math.hypot(m.rx + 0.5 - wx, m.ry + 0.4 - wy + (sz > 1.5 ? 0.6 : 0)); if (d < bd * Math.max(1, sz * 0.7)) { bd = d; best = m; } }
  if (best) { setTarget(best.i); return; }
  for (const p of S.P.values()) if (p.i !== S.myId && Math.abs(p.rx + 0.5 - wx) < 0.7 && wy > p.ry - 0.8 && wy < p.ry + 1.1) return openPlayerMenu(p);
  for (const n of S.map.npcs) if (Math.abs(n.x + 0.5 - wx) < 0.8 && wy > n.y - 0.8 && wy < n.y + 1.1) { if (Math.abs(n.x - pos.x) + Math.abs(n.y - pos.y) <= 2) send({ t: 'npc' }); else log(`${n.name}에게 가까이 가서 말을 거세요.`, '#ccc'); return; }
  for (const pl of S.plots) if (Math.abs(pl.sx - tx) <= 0 && Math.abs(pl.sy - ty) <= 0) { if (Math.abs(pl.sx - pos.x) + Math.abs(pl.sy - pos.y) <= 2) send({ t: 'interact' }); else log('표지판에 가까이 가세요.', '#ccc'); return; }
});

// 모바일 컨트롤
function buildTouch() {
  const dp = $('dpad');
  const setD = e => { const r = dp.getBoundingClientRect(); const x = e.clientX - r.left - 75, y = e.clientY - r.top - 75; if (Math.hypot(x, y) < 12) { touchDir = -1; return; } touchDir = Math.abs(x) > Math.abs(y) ? (x > 0 ? 2 : 1) : (y > 0 ? 0 : 3); };
  dp.addEventListener('pointerdown', e => { dp.setPointerCapture(e.pointerId); setD(e); e.preventDefault(); });
  dp.addEventListener('pointermove', e => { if (e.buttons || e.pressure) setD(e); });
  const up = () => { touchDir = -1; }; dp.addEventListener('pointerup', up); dp.addEventListener('pointercancel', up);
  const acts = $('acts'); acts.innerHTML = ''; S.touchBtns = [];
  const mkBtn = (parent, label, css, down, up) => { const d = document.createElement('div'); d.style.cssText = css; d.textContent = label; d.addEventListener('pointerdown', e => { e.preventDefault(); down(); }); if (up) ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => d.addEventListener(ev, up)); parent.appendChild(d); return d; };
  mkBtn(acts, '공격', 'right:8px;bottom:8px;width:84px;height:84px;font-size:17px;background:#6a1a10cc;border-color:#ffb07a', () => touchAtk = true, () => touchAtk = false);
  const cx = 240 - 50, cy = 240 - 50;
  for (let i = 0; i < 6; i++) { const ang = Math.PI * (1 + i * 0.105); const R = 98; const x = cx + Math.cos(ang) * R - 24, y = cy + Math.sin(ang) * R - 24 + (i > 3 ? 0 : 0); S.touchBtns[i] = mkBtn(acts, String(i + 1), `left:${x}px;top:${y}px;width:48px;height:48px`, () => castSkill(i)); }
  const util = $('util'); util.innerHTML = '';
  [['빨강', () => usePot('hp'), '#a02020cc'], ['파랑', () => usePot('mp'), '#2040a0cc'], ['대화', () => send({ t: 'interact' })], ['줍기', () => send({ t: 'pick' })], ['대상', () => cycleTarget()], ['채팅', () => { chatin.classList.remove('hidden'); chatin.focus(); }]].forEach(([l, f, bg]) => mkBtn(util, l, bg ? `background:${bg}` : '', f));
  document.querySelectorAll('#menu .btn').forEach(b => b.textContent = b.textContent.split(' ')[0]);
}

// ═══════ 이동 ═══════
function tileAt(x, y) { const m = S.map; if (!m || x < 0 || y < 0 || x >= m.w || y >= m.h) return T.ROCK; return m.t[y * m.w + x]; }
const SW_ = t => t.w || GD.TENT_W, SH_ = t => t.h || GD.TENT_H;
function structAt(x, y) { for (const t of S.tents) if (x >= t.x && x < t.x + SW_(t) && y >= t.y && y < t.y + SH_(t)) return t; return null; }
function isOuterTent(t) { return (t.kind || 'tent') === 'tent' && !t.inner; }
function structBlock(t, x, y) {
  const lx = x - t.x, ly = y - t.y;
  if (isOuterTent(t)) return !(lx === (GD.TENT_W >> 1) && ly === GD.TENT_H - 1); // 바깥 텐트 크기는 고정
  const f = t.furn.find(f => f.x === lx && f.y === ly);
  const wall = lx === 0 || lx === SW_(t) - 1 || ly === 0 || ly === SH_(t) - 1;
  if (wall) { if (f && f.k === 'door') return false; if ((t.kind !== 'house' || t.inner) && ly === SH_(t) - 1 && lx === (SW_(t) >> 1)) return false; return true; }
  return !!(f && !GD.WALK_FURN.has(f.k));
}
function canWalk(x, y) {
  const v = tileAt(x, y); const t = structAt(x, y);
  if (t) { if (structBlock(t, x, y) || (GD.BLOCK.has(v) && !GD.TENT_OVER.has(v))) return false; }
  else if (GD.BLOCK.has(v)) return false;
  for (const m of S.M.values()) if (m.x === x && m.y === y && !m.s) return false; // 소환수는 통과 가능
  return true;
}
function updateMove(now) {
  if (pos.moving) {
    const k = (now - pos.t0) / pos.dur;
    if (k >= 1) { pos.moving = false; pos.rx = pos.x; pos.ry = pos.y; }
    else { pos.rx = pos.fx + (pos.x - pos.fx) * k; pos.ry = pos.fy + (pos.y - pos.fy) * k; }
  }
  if (!pos.moving && S.me && !S.you.dead) {
    const d = heldDir();
    if (d >= 0) {
      if (S.panel && S.panel.kind && ['shop', 'gear', 'smith', 'stable', 'master', 'cook', 'chest', 'plot', 'guide', 'talk'].includes(S.panel.kind)) closePanel();
      pos.dir = d; const nx = pos.x + DIRS[d][0], ny = pos.y + DIRS[d][1];
      if (canWalk(nx, ny)) { pos.moving = true; pos.fx = pos.x; pos.fy = pos.y; pos.x = nx; pos.y = ny; pos.t0 = now; pos.dur = S.me.st.spd; pos.step++; send({ t: 'mv', x: nx, y: ny, d, ep: pos.ep || 0 }); }
      else if (now - lastFace > 150) { lastFace = now; send({ t: 'face', d }); }
    }
  }
  if ((keys.space || touchAtk) && now - lastAtk > 130 && !S.you.dead) { lastAtk = now; send({ t: 'atk' }); }
}

// ═══════ 이펙트 ═══════
function addFx(f) {
  if (f.k === 'coin' && f.id && f.id !== S.myId) return; // 내 코인만 표시
  const now = performance.now(); f.t0 = now;
  const durs = { dmg: 900, heal: 1000, mana: 900, coin: 900, proj: 0, skill: 650, swing: 200, mhit: 220, die: 600, lvl: 1400 };
  f.dur = durs[f.k] || 500;
  if (f.k === 'proj') f.dur = 120 + Math.hypot(f.tx - f.fx, f.ty - f.fy) * 30;
  if (f.k === 'skill' && (f.f === 'meteor' || f.f === 'rain')) f.dur = 900;
  if (f.k === 'swing' && f.id === S.myId) pos.atkT = now;
  if (f.k === 'swing') { const p = S.P.get(f.id); if (p) p.atkT = now; }
  if (f.k === 'dmg' && f.p && f.x === pos.x && f.y === pos.y) flash('#ff000040');
  S.fx.push(f);
}
let flashC = null, flashT = 0;
function flash(c) { flashC = c; flashT = performance.now(); }
function drawFx(now, sx, sy, layer) {
  const g = ctx;
  S.fx = S.fx.filter(f => now - f.t0 < f.dur);
  for (const f of S.fx) {
    const k = (now - f.t0) / f.dur;
    const X = (x) => x * TS + TS / 2 - sx, Y = (y) => y * TS + TS / 2 - sy;
    const text = ['dmg', 'heal', 'mana', 'coin'].includes(f.k);
    if ((layer === 'top') !== text) continue;
    g.save();
    switch (f.k) {
      case 'dmg': case 'heal': case 'mana': case 'coin': {
        const txt = f.k === 'heal' ? '+' + f.v : f.k === 'mana' ? '+' + f.v : f.k === 'coin' ? '+' + f.v + '💰' : (f.c ? f.v + '!' : f.v);
        const col = f.k === 'heal' ? '#5aff7a' : f.k === 'mana' ? '#6ab4ff' : f.k === 'coin' ? '#ffd700' : f.p ? '#ff4a4a' : f.c ? '#ffb020' : '#ffffff';
        g.globalAlpha = 1 - k * k; const pop = f.k === 'dmg' && f.by === S.myId ? (k < 0.12 ? 1 + (0.12 - k) / 0.12 * 0.7 : 1) : 1; g.font = `900 ${Math.round((f.c ? 24 : f.by === S.myId ? 18 : 16) * pop)}px sans-serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#000';
        const y = Y(f.y) - 30 - k * 34, x = X(f.x) + ((f.v * 7) % 13 - 6);
        g.strokeText(txt, x, y); g.fillStyle = col; g.fillText(txt, x, y); break;
      }
      case 'proj': {
        const x = X(f.fx + (f.tx - f.fx) * k), y = Y(f.fy + (f.ty - f.fy) * k) - 12;
        const ang = Math.atan2(f.ty - f.fy, f.tx - f.fx);
        if (f.f === 'arrow' || f.f === 'pierce') { g.translate(x, y); g.rotate(ang); g.fillStyle = '#8a6a3a'; g.fillRect(-10, -1, 16, 2); g.fillStyle = f.c; g.fillRect(6, -2, 4, 4); g.fillStyle = '#fff'; g.fillRect(-12, -3, 3, 6); }
        else if (f.f === 'bolt') { g.strokeStyle = f.c; g.lineWidth = 3; g.shadowColor = f.c; g.shadowBlur = 12; g.beginPath(); const x0 = X(f.fx), y0 = Y(f.fy) - 12, x1 = X(f.tx), y1 = Y(f.ty) - 12; g.moveTo(x0, y0); for (let i = 1; i < 6; i++) g.lineTo(x0 + (x1 - x0) * i / 6 + (Math.random() - 0.5) * 16, y0 + (y1 - y0) * i / 6 + (Math.random() - 0.5) * 16); g.lineTo(x1, y1); g.stroke(); }
        else { const r = f.f === 'fireball' ? 8 : 6; g.shadowColor = f.c; g.shadowBlur = 16; g.fillStyle = f.c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r / 2.5, 0, 7); g.fill(); g.globalAlpha = 0.4; g.fillStyle = f.c; g.beginPath(); g.arc(x - Math.cos(ang) * 10, y - Math.sin(ang) * 10, r * 0.7, 0, 7); g.fill(); }
        break;
      }
      case 'skill': drawSkillFx(g, f, k, X(f.x), Y(f.y)); break;
      case 'swing': {
        const p = f.id === S.myId ? { rx: pos.rx, ry: pos.ry } : S.P.get(f.id); if (!p) break;
        const cx = X(p.rx), cy = Y(p.ry) - 10; const a0 = [Math.PI / 2, Math.PI, 0, -Math.PI / 2][f.d];
        g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 24, a0 - 1.1 + k * 0.5, a0 + 1.1 * (k * 2 - 1)); g.stroke(); break;
      }
      case 'mhit': { const x = X(f.tx), y = Y(f.ty) - 12; g.strokeStyle = `rgba(255,60,60,${1 - k})`; g.lineWidth = 3; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x - 10 + i * 6, y - 10); g.lineTo(x + 6 + i * 6, y + 10); g.stroke(); } break; }
      case 'die': { const r = (f.b ? 50 : 18) * (0.4 + k); g.globalAlpha = 1 - k; g.fillStyle = '#ddd'; for (let i = 0; i < 6; i++) { const a = i * 1.05; g.beginPath(); g.arc(X(f.x) + Math.cos(a) * r, Y(f.y) - 10 + Math.sin(a) * r * 0.6, 7 * (1 - k) + 3, 0, 7); g.fill(); } break; }
      case 'lvl': { const x = X(f.x), y = Y(f.y); g.globalAlpha = 1 - k; const gr = g.createLinearGradient(0, y - 120, 0, y); gr.addColorStop(0, '#ffe08a00'); gr.addColorStop(1, '#ffe08a'); g.fillStyle = gr; g.fillRect(x - 22, y - 120, 44, 120); g.fillStyle = '#fff'; for (let i = 0; i < 8; i++) g.fillRect(x - 20 + (i * 37 % 40), y - k * 120 - i * 10, 3, 3); break; }
    }
    g.restore();
  }
}
function drawSkillFx(g, f, k, x, y) {
  const R = (f.r || 1) * TS; g.globalAlpha = Math.max(0, 1 - k);
  switch (f.f) {
    case 'slash': case 'slash3': g.strokeStyle = f.c; g.lineWidth = 5; g.shadowColor = f.c; g.shadowBlur = 10; for (let i = 0; i < (f.f === 'slash3' ? 3 : 1); i++) { g.beginPath(); g.moveTo(x - 18 + i * 8, y - 30 + k * 10); g.lineTo(x + 18 + i * 4 - 8, y + 2 - k * 4 + i * 6); g.stroke(); } break;
    case 'spin': g.strokeStyle = f.c; g.lineWidth = 6; g.shadowColor = f.c; g.shadowBlur = 12; g.beginPath(); g.arc(x, y - 8, R * (0.5 + k * 0.5), k * 12, k * 12 + 4.5); g.stroke(); break;
    case 'ring': case 'quake': g.strokeStyle = f.c; g.lineWidth = 8 * (1 - k) + 2; g.beginPath(); g.ellipse(x, y, R * k + 10, (R * k + 10) * 0.6, 0, 0, 7); g.stroke(); if (f.f === 'quake') { g.fillStyle = f.c; for (let i = 0; i < 10; i++) { const a = i * 0.63; g.fillRect(x + Math.cos(a) * R * k, y + Math.sin(a) * R * k * 0.6 - 10 * Math.sin(k * 3), 5, 5); } } break;
    case 'ice': case 'flame': case 'holy': case 'bless': {
      g.fillStyle = f.c + '44'; g.beginPath(); g.ellipse(x, y, R, R * 0.6, 0, 0, 7); g.fill();
      g.fillStyle = f.c; for (let i = 0; i < 18; i++) { const a = i * 2.39, rr = R * ((i * 0.37) % 1); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.6; const h = f.f === 'flame' ? 14 * Math.sin(k * 3 + i) : 10; if (f.f === 'ice') { g.fillRect(px - 2, py - 16 + k * 10, 4, 12); } else g.fillRect(px - 2, py - h - k * 20, 4, Math.abs(h)); }
      break;
    }
    case 'meteor': { if (k < 0.45) { const kk = k / 0.45; g.globalAlpha = 1; g.fillStyle = '#ff5a00'; g.shadowColor = '#ff3d00'; g.shadowBlur = 25; g.beginPath(); g.arc(x - 120 * (1 - kk), y - 260 * (1 - kk), 22, 0, 7); g.fill(); g.fillStyle = '#ffd040'; g.beginPath(); g.arc(x - 120 * (1 - kk), y - 260 * (1 - kk), 10, 0, 7); g.fill(); } else { const kk = (k - 0.45) / 0.55; g.globalAlpha = 1 - kk; g.fillStyle = '#ff7a10aa'; g.beginPath(); g.ellipse(x, y, R * (0.4 + kk * 0.6), R * 0.6 * (0.4 + kk * 0.6), 0, 0, 7); g.fill(); g.fillStyle = '#ffe080'; g.beginPath(); g.ellipse(x, y, R * 0.4 * (1 - kk), R * 0.25, 0, 0, 7); g.fill(); } break; }
    case 'rain': { g.globalAlpha = 1 - k * 0.5; g.fillStyle = f.c; for (let i = 0; i < 26; i++) { const a = i * 2.39, rr = R * ((i * 0.41) % 1); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.6; const fall = ((k * 3 + i * 0.13) % 1); g.fillRect(px, py - 80 * (1 - fall), 2, 14); } break; }
    case 'pierce': { const [dx, dy] = DIRS[f.d]; g.strokeStyle = f.c; g.lineWidth = 8 * (1 - k) + 2; g.shadowColor = f.c; g.shadowBlur = 14; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + dx * R, y - 12 + dy * R); g.stroke(); break; }
    case 'heal': case 'bigheal': { g.strokeStyle = f.c; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, R * Math.min(1, k * 2), R * 0.6 * Math.min(1, k * 2), 0, 0, 7); g.stroke(); g.fillStyle = f.c; for (let i = 0; i < 12; i++) { const a = i * 0.52, px = x + Math.cos(a) * R * 0.6, py = y + Math.sin(a) * R * 0.36 - k * 40; g.fillRect(px - 1, py - 4, 3, 9); g.fillRect(px - 4, py - 1, 9, 3); } break; }
    case 'buff': { g.fillStyle = f.c; for (let i = 0; i < 10; i++) { const a = i * 0.63 + k * 4; g.fillRect(x + Math.cos(a) * 16, y - 10 - k * 50 + Math.sin(a) * 6, 4, 4); } break; }
    case 'summon': { g.strokeStyle = f.c; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x, y, 20 + i * 6, (20 + i * 6) * 0.5, k * 5 + i, 0, 4); g.stroke(); } break; }
    default: g.fillStyle = f.c + '66'; g.beginPath(); g.arc(x, y, R * k, 0, 7); g.fill();
  }
}

// 기기 키(캐릭터 주인 확인용) + 삭제 대기 목록을 접속 때 함께 보냄
function devKey() { let k = null; try { k = localStorage.getItem('baram_dev'); if (!k) { k = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('baram_dev', k); } } catch (e) { k = 'nokey'; } return k; }
function loginMsg(n) { let del = []; try { del = (JSON.parse(localStorage.getItem('baram_del') || '[]')).filter(d => !NET.code || d.code === NET.code).map(d => d.name); } catch (e) { } return { t: 'login', name: n, key: devKey(), del }; }
// ═══════ 렌더링 ═══════
const NPC_AP = {
  shop: { job: 'healer', g: 'f', h: 3, hc: 1, sk: 0, eq: { armor: [1, 0, 0, 0] } },
  gear: { job: 'warrior', g: 'm', h: 0, hc: 0, sk: 1, eq: { armor: [3, 0, 0, 0], weapon: [3, 0, 0, 'sword'], shield: [3, 0, 0, 0] } },
  smith: { job: 'warrior', g: 'm', h: 1, hc: 0, sk: 2, eq: { gloves: [5, 0, 0, 0], weapon: [5, 0, 0, 'axe'] } },
  stable: { job: 'healer', g: 'm', h: 0, hc: 2, sk: 1, eq: { helmet: [1, 0, 0, 0] } },
  master: { job: 'mage', g: 'm', h: 2, hc: 4, sk: 0, eq: { helmet: [8, 0, 0, 0], armor: [8, 0, 0, 0], weapon: [8, 0, 0, 'staff'] } },
  guide: { job: 'healer', g: 'f', h: 2, hc: 3, sk: 0, eq: { armor: [6, 0, 0, 0] } },
};
const AO2 = t => AO_SRC(t) && !TREEISH.has(t) && t !== T.ROCK;
function biomeChar(x, y) { const b = S.map.biome; return b ? b[y * S.map.w + x] : (S.map.castle ? 'k' : 'c'); }
function shadowAt(x, y, rx) { ctx.fillStyle = 'rgba(20,30,10,.28)'; ctx.beginPath(); ctx.ellipse(x, y - 2, rx, rx * 0.32, 0, 0, 7); ctx.fill(); }
function drawText(t, x, y, col, size = 12, bold = true) { size = Math.round(size / Math.max(0.75, ZOOM) * 10) / 10; ctx.font = `${bold ? '800 ' : '600 '}${size}px -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size * 0.32); ctx.strokeStyle = 'rgba(0,0,0,.92)'; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); }
function drawGroundTile(m, x, y, X0, Y0, fr) {
    const id = m.t[y * m.w + x]; const v = TREEISH.has(id) || id === T.HOUSE || id === T.ROOF ? (((x * 7 + y * 13) ^ (x * y)) & 3) : (((Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0) % 12);
    let under = '';
    if (id === T.ROOF) under = S.roof.get(x + ',' + y) || '#b04030';
    else if (m.biome && (id === T.TREE || id === T.FLOWER || id === T.ROCK || id === T.FENCE)) under = biomeChar(x, y);
    else if (!m.biome && id === T.ROCK) under = 'c';
    const anim = id === T.WATER || id === T.LAVA ? fr : 0;
    { const ti = tileImg(id, v, m.pal, m.castle, anim, under); if (ti.height > 64) ctx.drawImage(ti, X0, Y0 - 10, TS, ti.height * TS / 64); else ctx.drawImage(ti, X0, Y0, TS, TS); }
    if (m.dark && GD.BLOCK.has(id) && id !== T.WATER && id !== T.LAVA) { ctx.fillStyle = m.castle ? 'rgba(10,6,20,.22)' : 'rgba(8,6,14,.52)'; ctx.fillRect(X0, Y0, TS, TS); }
    drawDecor(id, x, y, X0, Y0);
    if (!m.castle) drawEdges(id, x, y, X0, Y0);
    const blk = GD.BLOCK.has(id);
    if (m.biome && !blk) { const n = vnoise(x, y); if (n > 0.56) { ctx.fillStyle = `rgba(255,236,150,${((n - 0.56) * 0.18).toFixed(3)})`; ctx.fillRect(X0, Y0, TS, TS); } else if (n < 0.44) { ctx.fillStyle = `rgba(0,25,10,${((0.44 - n) * 0.2).toFixed(3)})`; ctx.fillRect(X0, Y0, TS, TS); } }
    if (id === T.WATER) { }
    else if (!blk) {
      if (AO2(tileAt(x, y - 1))) ctx.drawImage(FX_IMG.aoN, X0, Y0);
      if (AO2(tileAt(x - 1, y))) ctx.drawImage(FX_IMG.aoW, X0, Y0);
      if (AO2(tileAt(x + 1, y))) ctx.drawImage(FX_IMG.aoE, X0, Y0);
    } else if (id === T.HOUSE && tileAt(x, y - 1) === T.ROOF) { ctx.drawImage(FX_IMG.aoN, X0, Y0); ctx.drawImage(FX_IMG.aoN, X0, Y0);
    } else if (id === T.WALL && !m.dark) { if (!GD.BLOCK.has(tileAt(x, y + 1))) ctx.drawImage(FX_IMG.face, X0, Y0); if (tileAt(x, y - 1) !== T.WALL) ctx.drawImage(crenImg, X0, Y0 - 10);
    } else if (TALL.has(id)) {
      if (!GD.BLOCK.has(tileAt(x, y + 1))) ctx.drawImage(FX_IMG.face, X0, Y0);
      if (!GD.BLOCK.has(tileAt(x, y - 1))) ctx.drawImage(FX_IMG.top, X0, Y0);
    }
  }
/* 배경 색감 보정 — 원인: 바닥(형광 연두·주황, 고채도·고대비 잔무늬)이 캐릭터(차분한 갈색·회색 도트)보다 훨씬 진하고 밝아서 캐릭터가 '붙여넣은' 것처럼 떠 보임.
   해결: 바닥 묶음 그림을 만들 때 한 번만 채도 ↓ · 밝기 ↓ · 따뜻한 톤으로 맞춤 (매 프레임 비용 없음) */
function groundGrade(g, px, m) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'saturation'; g.globalAlpha = m.dark ? 0.22 : 0.34; g.fillStyle = '#808080'; g.fillRect(0, 0, px, px);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = m.dark ? 0.5 : 0.9; g.fillStyle = m.castle ? '#e6e0ec' : '#e2dccb'; g.fillRect(0, 0, px, px);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.18; g.fillStyle = '#7a6a50'; g.fillRect(0, 0, px, px);
  g.restore();
}
const GCH = 8, gChunks = new Map(); let gKey = '';
function drawGroundChunks(m, sx, sy, x0, y0, x1, y1, fr) {
  const k = DPR * ZOOM, key = (m.id || '') + '|' + (window.GFX && GFX.ok ? 1 : 0) + '|' + k.toFixed(3);
  if (key !== gKey || gChunks._m !== m) { gChunks.clear(); gKey = key; gChunks._m = m; }
  const cx0 = Math.floor(x0 / GCH), cy0 = Math.floor(y0 / GCH), cx1 = Math.floor(x1 / GCH), cy1 = Math.floor(y1 / GCH);
  const CW = GCH * TS, px = Math.ceil(CW * k);
  MAINCTX.setTransform(1, 0, 0, 1, 0, 0); MAINCTX.imageSmoothingEnabled = false;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    let ch = gChunks.get(cx + ',' + cy);
    if (!ch) { ch = { anim: false, c: [] }; const ax0 = cx * GCH, ay0 = cy * GCH; for (let y = ay0; y < ay0 + GCH && !ch.anim; y++) for (let x = ax0; x < ax0 + GCH; x++) { if (x >= m.w || y >= m.h) continue; const id = m.t[y * m.w + x]; if (id === T.WATER || id === T.LAVA) { ch.anim = true; break; } } gChunks.set(cx + ',' + cy, ch); }
    const fi = ch.anim ? fr : 0; let c = ch.c[fi];
    if (!c) {
      c = document.createElement('canvas'); c.width = px; c.height = px; const g = c.getContext('2d');
      g.setTransform(k, 0, 0, k, 0, 0); g.imageSmoothingEnabled = false;
      const saved = ctx; ctx = g;
      try { const ax0 = cx * GCH, ay0 = cy * GCH; for (let y = ay0; y <= Math.min(m.h - 1, ay0 + GCH); y++) for (let x = ax0; x < Math.min(m.w, ax0 + GCH); x++) drawGroundTile(m, x, y, (x - ax0) * TS, (y - ay0) * TS, fi); } finally { ctx = saved; }
      if (!m.inner) groundGrade(g, px, m); /* 배경 색감 보정: 캐릭터와 어울리게 채도·밝기·대비 낮춤 */
      ch.c[fi] = c;
      if (gChunks.size > 60) { for (const kk of gChunks.keys()) { const [a, b] = kk.split(',').map(Number); if (Math.abs(a - cx) > 4 || Math.abs(b - cy) > 4) gChunks.delete(kk); } }
    }
    const dx = Math.round((cx * CW - sx) * k), dy = Math.round((cy * CW - sy) * k), dx2 = Math.round(((cx + 1) * CW - sx) * k), dy2 = Math.round(((cy + 1) * CW - sy) * k);
    MAINCTX.drawImage(c, 0, 0, CW * k, CW * k, dx, dy, dx2 - dx, dy2 - dy);
  }
  MAINCTX.setTransform(DPR * ZOOM, 0, 0, DPR * ZOOM, 0, 0); MAINCTX.imageSmoothingEnabled = false;
}
// 바닥 아이템: 크게 · 그림자 · 테두리 빛 · 등급별 빛기둥 · 반짝임
const dropOut = new Map();
function dropIcon(d) {
  const key = d.k === 'coin' ? 'coin' : [d.k, d.sl, d.wt, d.tr, d.id].join('|'); let c = dropOut.get(key); if (c) return c;
  const ic = d.k === 'coin' ? (window.ITEM_ATLAS && ITEM_ATLAS['m:coin'] ? itemIcon({ k: 'mat', id: 'coin' }) : null) : itemIcon({ k: d.k, slot: d.sl, wt: d.wt, tier: d.tr, id: d.id });
  c = document.createElement('canvas'); c.width = c.height = 76; const g = c.getContext('2d');
  if (ic) { // 흰 테두리 (아이콘을 8방향으로 살짝 밀어 그린 뒤 흰색으로)
    const t = document.createElement('canvas'); t.width = t.height = 76; const tg = t.getContext('2d');
    for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3], [-2, -2], [2, 2], [-2, 2], [2, -2]]) tg.drawImage(ic, 6 + dx, 6 + dy, 64, 64);
    tg.globalCompositeOperation = 'source-in'; tg.fillStyle = '#fff'; tg.fillRect(0, 0, 76, 76);
    g.globalAlpha = 0.9; g.drawImage(t, 0, 0); g.globalAlpha = 1; g.drawImage(ic, 6, 6, 64, 64);
  } else { g.fillStyle = '#ffd700'; g.beginPath(); g.arc(38, 40, 18, 0, 7); g.fill(); g.strokeStyle = '#8a6a00'; g.lineWidth = 4; g.stroke(); }
  dropOut.set(key, c); return c;
}
function drawDrop(d, sx, sy, now) {
  const bx = d.x * TS - sx + 16, by = d.y * TS - sy + 26; if (bx < -60 || by < -80 || bx > W + 60 || by > H + 40) return;
  const ph = now / 300 + d.x * 1.7 + d.y; const bob = Math.sin(ph) * 3 - 4;
  const col = d.r ? GD.RARITY[d.r].c : d.k === 'coin' ? '#ffd700' : '#ffffff';
  // 빛기둥 (고급 이상)
  if (d.r >= 1) { const hgt = 60 + d.r * 22; const gr = ctx.createLinearGradient(0, by - hgt, 0, by); gr.addColorStop(0, col + '00'); gr.addColorStop(1, col + (d.r >= 3 ? 'dd' : 'aa')); ctx.fillStyle = gr; const w = 14 + d.r * 3 + Math.sin(now / 200) * 3; ctx.fillRect(bx - w / 2, by - hgt, w, hgt); }
  // 바닥 그림자 + 빛 고리
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(bx, by + 2, 14 - bob * 0.3, 5, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + Math.sin(ph * 1.3) * 0.15; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by + 2, 17, 6, 0, 0, 7); ctx.stroke(); ctx.restore();
  // 아이콘 (38px)
  const sz = d.r >= 3 ? 46 : d.r >= 1 ? 42 : 38; /* 조금 작게 */ ctx.imageSmoothingEnabled = true; ctx.drawImage(dropIcon(d), bx - sz / 2, by - sz + bob, sz, sz); ctx.imageSmoothingEnabled = false;
  // 반짝임
  const tw = (now / 700 + d.x * 0.37 + d.y * 0.71) % 1; if (tw < 0.35) { const a = Math.sin(tw / 0.35 * Math.PI); const px = bx + 9, py = by - sz + 8 + bob; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.fillRect(px - 0.75, py - 5, 1.5, 10); ctx.fillRect(px - 5, py - 0.75, 10, 1.5); ctx.restore(); }
}
function frame(nowMs) {
  requestAnimationFrame(frame);
  if ((frame._n = (frame._n || 0) + 1) % 30 === 0) { const r = cv.getBoundingClientRect(); if (Math.round(r.width) !== VW || Math.round(r.height) !== VH) resize(); }
  const now = performance.now();
  if (!S.map || !S.me) { return; }
  updateMove(now);
  const m = S.map;
  const SHK = window.shakeOff ? shakeOff() : null;
  const [crx, cry] = camC(); const sx = Math.floor(crx * TS + TS / 2 - W / 2) + (SHK ? SHK[0] : 0), sy = Math.floor(cry * TS + TS / 2 - H / 2) + (SHK ? SHK[1] : 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const x0 = Math.max(0, Math.floor(sx / TS)), y0 = Math.max(0, Math.floor(sy / TS)), x1 = Math.min(m.w - 1, Math.ceil((sx + W) / TS)), y1 = Math.min(m.h - 1, Math.ceil((sy + H) / TS));
  const fr = (now / 600 | 0) % 2;
  const trees = [];
  // 바닥은 8x8칸 묶음으로 미리 그려 둔 그림을 재사용 (렉 감소)
  drawGroundChunks(m, sx, sy, x0, y0, x1, y1, fr);
  for (let y = y0; y <= Math.min(m.h - 1, y1 + 2); y++) for (let x = x0; x <= x1; x++) {
    const id = m.t[y * m.w + x]; if (!TREEISH.has(id)) continue;
    if (S.tents.length) { const st_ = structAt(x, y); if (st_ && isOuterTent(st_)) continue; } // 텐트 자리의 나무는 그리지 않음
    if (y > y1) { trees.push([id, x, y, m.biome ? biomeChar(x, y) : '']); continue; }
    if (m.castle) continue;
    let under = ''; if (m.biome && (id === T.TREE || id === T.FLOWER || id === T.ROCK || id === T.FENCE)) under = biomeChar(x, y); else if (!m.biome && id === T.ROCK) under = 'c';
    trees.push([id, x, y, under]);
  }
  // 텐트/집/공터
  for (const pl of S.plots) drawPlot(pl, sx, sy);
  for (const t of S.tents) drawStruct(t, sx, sy, now);
  // 배치 모드 하이라이트
  if (S.place) drawPlaceHint(sx, sy);
  // 드랍
  for (const d of S.D) drawDrop(d, sx, sy, now);
  // 엔티티 y-정렬
  const ents = [];
  for (const n of m.npcs) ents.push({ y: n.y, f: () => drawNpc(n, sx, sy, now) });
  for (const p of S.P.values()) {
    if (p.i === S.myId) continue;
    if (!(window.smoothPos && smoothPos(p, now, p.a && p.a.mt ? 160 : 230))) { const k = Math.min(1, (now - p.t0) / p.dur); p.rx = p.fx + (p.x - p.fx) * k; p.ry = p.fy + (p.y - p.fy) * k; }
    ents.push({ y: p.ry, f: () => drawPlayer(p, p.rx, p.ry, p.d, now < (p.walkUntil || 0), sx, sy, now) });
  }
  const meP = S.P.get(S.myId) || { n: S.me.name, a: { job: S.me.job, g: S.me.gender, h: S.me.hair, hc: S.me.hairColor, sk: S.me.skin, eq: {} }, lv: S.me.lv };
  ents.push({ y: pos.ry, f: () => drawPlayer(Object.assign({}, meP, { i: S.myId, sl: S.you.sl, dd: S.you.dead, h: 100 * S.you.hp / S.you.mhp, atkT: pos.atkT }), pos.rx, pos.ry, pos.dir, pos.moving, sx, sy, now, true) });
  for (const mo of S.M.values()) {
    if (!(window.smoothPos && smoothPos(mo, now, 330))) { const k = Math.min(1, (now - mo.t0) / mo.dur); mo.rx = mo.fx + (mo.x - mo.fx) * k; mo.ry = mo.fy + (mo.y - mo.fy) * k; }
    ents.push({ y: mo.ry, f: () => drawMon(mo, sx, sy, now) });
  }
  for (const [id, x, y, u] of trees) ents.push({ y: y - 0.01, f: () => drawTreeAt(id, x, y, sx, sy, u) });
  if (!m.dark) for (const l of m.labels) if (l.roofC && BLD_KIND[l.text] && l.bx + 5 >= x0 - 1 && l.bx <= x1 + 1 && l.by >= y0 - 5 && l.by <= y1 + 2) ents.push({ y: l.by + 3.4, f: () => drawBuilding(l, sx, sy, now) });
  if (m.id === 'world') for (const t of m.towns || []) { if (/주택가/.test(t.name)) continue; const fx = (t.x0 + t.x1) >> 1, fy = (t.y0 + t.y1) >> 1; for (let yy = fy - 1; yy <= fy + 1; yy++) for (let xx = fx - 1; xx <= fx + 1; xx++) if (tileAt(xx, yy) === T.WATER && tileAt(xx - 1, yy) === T.STONE && tileAt(xx + 1, yy) === T.STONE) ents.push({ y: yy + 0.6, f: () => drawFountain(xx, yy, sx, sy, now) }); }
  drawEntrances(m, sx, sy, ents);
  for (const c of (m.chests || [])) if (c.x >= x0 - 1 && c.x <= x1 + 1 && c.y >= y0 - 1 && c.y <= y1 + 2) ents.push({ y: c.y - 0.02, f: () => drawChest(c, sx, sy, now) });
  for (const t of S.tents) if (isOuterTent(t) && t.x + 10 >= x0 && t.x - 1 <= x1 && t.y + 8 >= y0 && t.y - 3 <= y1) ents.push({ y: t.y + 6.4, f: () => drawTentOut(t, sx, sy, now) });
  ents.sort((a, b) => a.y - b.y); ents.forEach(e => e.f()); NAMEQ.splice(0).forEach(f => f());
  for (const c of (m.chests || [])) if (!c.o) drawChestSpark(c, sx, sy, now);
  drawFx(now, sx, sy, 'mid');
  // 맵 표지
  for (const l of m.labels) { const x = l.x * TS + 16 - sx, y = l.y * TS + 20 - sy; if (x < -200 || x > W + 200 || y < -40 || y > H + 40) continue; if (l.roofC) continue; ctx.font = `bold ${l.big ? 18 : 13}px sans-serif`; const w = ctx.measureText(l.text).width + 12; ctx.fillStyle = '#000a'; ctx.fillRect(x - w / 2, y - (l.big ? 18 : 14), w, l.big ? 24 : 19); drawText(l.text, x, y, l.c, l.big ? 18 : 13); }
  for (const l of m.labels) if (l.roofC) { const x = l.x * TS + 16 - sx, y = (l.by + 1) * TS - sy; drawText(l.text, x, y, '#fff3c4', 14); }
  // 조명
  drawLight(sx, sy, now);
  drawFx(now, sx, sy, 'top');
  // 이름/말풍선 (조명 위)
  for (const p of S.P.values()) drawBubble(p.i, (p.i === S.myId ? pos.rx : p.rx) * TS + 16 - sx, (p.i === S.myId ? pos.ry : p.ry) * TS - sy - 30, now);
  if (flashC && now - flashT < 200) { ctx.fillStyle = flashC; ctx.globalAlpha = 1 - (now - flashT) / 200; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (typeof drawMapFade === 'function') drawMapFade();
  if (S.place) { ctx.font = 'bold 15px sans-serif'; const t = S.place.del ? '철거할 가구를 클릭하세요 (ESC 취소)' : `[${GD.FURNITURE[S.place.k].name}] 놓을 칸을 클릭하세요 — ${GD.FURNITURE[S.place.k].wall ? '벽' : '실내'} (ESC 취소)`; const w = ctx.measureText(t).width + 20; ctx.fillStyle = '#000c'; ctx.fillRect(W / 2 - w / 2, H - 120, w, 28); drawText(t, W / 2, H - 100, '#ffe08a', 15); }
  if (now - (S.hudT || 0) > 100) { S.hudT = now; refreshHud(); drawMini(); }
}
requestAnimationFrame(frame);

const NAMEQ = [];
function drawPlayer(p, rx, ry, dir, walking, sx, sy, now, isMe) {
  const x = rx * TS + 16 - sx, y = ry * TS + 32 - sy;
  if (p.dd) { ctx.globalAlpha = 0.5; }
  const fr = walking ? 1 + ((now / 130 | 0) % 4) : 0;
  const ap = p.a; let img = charSprite(ap, p.sl ? 0 : dir, p.sl ? 0 : fr === 4 ? 0 : fr === 2 ? 0 : fr);
  if (p.sl || p.dd) { ctx.save(); ctx.translate(x, y - 10); ctx.rotate(-Math.PI / 2); ctx.drawImage(img, -40, -28, 56, 80); ctx.restore(); if (p.sl) drawText('Z z z', x + 14, y - 34 - Math.sin(now / 300) * 4, '#c8d8ff', 12); }
  else {
    const lunge = p.atkT && now - p.atkT < 150 ? 4 : 0; const [dx, dy] = DIRS[dir];
    shadowAt(x, y, ap.mt ? 18 : 12); if (img.dw) ctx.drawImage(img, Math.round(x - img.dw / 2 + dx * lunge), Math.round(y - img.dh + 6 + dy * lunge), img.dw, img.dh); else ctx.drawImage(img, Math.round(x - 28 + dx * lunge), Math.round(y - 76 + dy * lunge), 56, 80);
  }
  ctx.globalAlpha = 1;
  NAMEQ.push(() => {
  if (p.bf) { ctx.strokeStyle = `rgba(255,220,120,${0.4 + Math.sin(now / 200) * 0.2})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 2, 16, 6, 0, 0, 7); ctx.stroke(); }
  const jn = GD.JOBS[ap.job] ? GD.JOBS[ap.job].name : '';
  drawText(`${p.n}`, x, y + 15, isMe ? '#ffe86a' : '#9fe8ff', 13);
  drawText(`Lv${p.lv} ${jn}`, x, y + 29, '#f0f2f5', 11, false);
  if (isMe && !p.dd) {
    const by = y - 84 + (ap.mt ? -12 : 0), bw = 36; const yv = S.you;
    const hr = Math.max(0, Math.min(1, (yv.hp || 0) / (yv.mhp || 1))), mr = Math.max(0, Math.min(1, (yv.mp || 0) / (yv.mmp || 1)));
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 9);
    ctx.fillStyle = '#3a1418'; ctx.fillRect(x - bw / 2, by, bw, 4); ctx.fillStyle = hr < 0.3 ? '#ff2a2a' : '#ef4444'; ctx.fillRect(x - bw / 2, by, bw * hr, 4);
    ctx.fillStyle = '#141e3a'; ctx.fillRect(x - bw / 2, by + 4, bw, 3); ctx.fillStyle = '#3b82f6'; ctx.fillRect(x - bw / 2, by + 4, bw * mr, 3);
  }
  if (!isMe && p.h < 100) { ctx.fillStyle = '#000'; ctx.fillRect(x - 16, y - 80 + (ap.mt ? -10 : 0), 32, 4); ctx.fillStyle = '#4aff6a'; ctx.fillRect(x - 16, y - 80 + (ap.mt ? -10 : 0), 32 * p.h / 100, 4); }
  });
}
function drawNpc(n, sx, sy, now) {
  const x = n.x * TS + 16 - sx, y = n.y * TS + 32 - sy; if (x < -60 || x > W + 60 || y < -80 || y > H + 80) return;
  shadowAt(x, y, 12); ctx.drawImage(charSprite(NPC_AP[n.kind] || NPC_AP.guide, 0, 0), x - 28, y - 76, 56, 80);
  drawText(n.name, x, y + 15, '#ffe08a', 13);
  const bob = Math.sin(now / 250) * 3; drawText(n.kind === 'guide' ? '?' : '!', x, y - 76 + bob, '#ffd000', 18);
}
/* 깜짝 보스: 필드 몬스터 그림을 색을 바꿔 변형 (+ 붉은 눈빛 테두리) */
const SBT = new Map();
function sbTint(img, hu) {
  const key = img; let byH = SBT.get(key); if (!byH) { byH = new Map(); SBT.set(key, byH); if (SBT.size > 200) SBT.clear(); }
  let c = byH.get(hu); if (c) return c;
  const w = img.width, h = img.height; c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.drawImage(img, 0, 0); g.globalCompositeOperation = 'color'; g.globalAlpha = 0.55; g.fillStyle = `hsl(${hu},85%,50%)`; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.25; g.fillStyle = '#5a2040'; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in'; g.globalAlpha = 1; g.drawImage(img, 0, 0);
  c.dw = img.dw; c.dh = img.dh; c.ox = img.ox; c.bob = img.bob; byH.set(hu, c); return c;
}
/* 깜짝 보스 알림 띠: 남은 시간 + 방향 */
function sbBanner() {
  let el = document.getElementById('sbBan');
  if (!S.sb) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'sbBan'; el.style.cssText = 'position:fixed;left:calc(50% + 94px);transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 12px);max-width:calc(100% - 500px);overflow:hidden;text-overflow:ellipsis;z-index:15;padding:4px 11px;border-radius:13px;background:linear-gradient(90deg,#3a1a00e8,#5a2a00e8);border:1.5px solid #ffdf4a;color:#ffe9a0;font-weight:800;font-size:12px;box-shadow:0 0 14px #ffb02088;pointer-events:none;white-space:nowrap;animation:sbPulse 1.2s infinite alternate';
    document.body.appendChild(el); if (!document.getElementById('sbCss')) { const st = document.createElement('style'); st.id = 'sbCss'; st.textContent = '@keyframes sbPulse{from{box-shadow:0 0 6px #ffb02066}to{box-shadow:0 0 18px #ffdf4acc}}'; document.head.appendChild(st); } }
  const upd = () => { if (!S.sb || !document.getElementById('sbBan')) return; const left = Math.max(0, S.sb.end - Date.now()); const mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60;
    let where = S.sb.mapName || ''; if (S.map && S.sb.map === S.map.id) { const dx = S.sb.x - pos.x, dy = S.sb.y - pos.y, d = Math.round(Math.hypot(dx, dy)); const ar = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8]; where = d <= 3 ? '바로 근처!' : `${ar} ${d}칸`; }
    el.textContent = `⚡ ${S.sb.name} · ${where} · ${mm}:${String(ss).padStart(2, '0')}`; };
  upd(); clearInterval(sbBanner._t); sbBanner._t = setInterval(() => { if (!S.sb) { clearInterval(sbBanner._t); const e = document.getElementById('sbBan'); if (e) e.remove(); return; } upd(); }, 1000);
}
function drawMon(mo, sx, sy, now) {
  const def = mo.s ? GD.SUMMONS[mo.t] : GD.MONS[mo.t]; if (!def) return;
  const x = mo.rx * TS + 16 - sx, y = mo.ry * TS + 32 - sy; if (x < -150 || x > W + 150 || y < -150 || y > H + 150) return;
  const walking = now < (mo.walkUntil || 0); const fr = walking ? (now / 140 | 0) % 2 : (now / 500 | 0) % 2;
  const img = ((!mo.s || (window.MON_ATLAS && MON_ATLAS[mo.t])) && window.monAtlasImg && monAtlasImg(mo, now, walking)) || monSprite(mo.t, mo.flip, fr, mo.mu, mo.s ? def : null); let img2 = img; if (mo.sb) { img2 = sbTint(img, mo.hu || 0); if (S.sb && S.sb.map === S.map.id) { S.sb.x = mo.x; S.sb.y = mo.y; } } const MBK = mo.sb ? 2.1 : mo.mb ? 1.7 : 1, IW = (img.dw || img.width) * MBK, IH = (img.dh || img.height) * MBK, OXX = (img.ox || 0) * MBK;
  // 보스/돌연변이 오라
  if (def.boss || mo.mu || mo.s || mo.mb || mo.sb) {
    const ac = mo.sb ? (mo.ac || '#ffdf4a') : def.boss ? def.aura : mo.mb ? '#ff9a1a' : mo.s ? '#b47cff' : '#b040ff'; const pr = 0.5 + Math.sin(now / 200) * 0.25;
    const gr = ctx.createRadialGradient(x, y - IH / 2, 4, x, y - IH / 2, IW * 0.7);
    gr.addColorStop(0, ac + (def.boss || mo.sb ? 'aa' : '66')); gr.addColorStop(1, ac + '00'); ctx.globalAlpha = pr; ctx.fillStyle = gr; ctx.fillRect(x - IW, y - IH * 1.3, IW * 2, IH * 1.6); ctx.globalAlpha = 1;
    if (mo.sb) { ctx.strokeStyle = ac; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y - 2, IW * 0.48, IW * 0.16, 0, 0, 7); ctx.stroke(); if ((now / 90 | 0) % 7 === 0) { ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 2; ctx.beginPath(); let bx = x + (Math.random() - 0.5) * IW * 0.6, by = y - IH * 1.05; ctx.moveTo(bx, by); for (let i = 0; i < 4; i++) { bx += (Math.random() - 0.5) * 16; by += IH * 0.22; ctx.lineTo(bx, by); } ctx.stroke(); } }
    if (def.boss) { ctx.strokeStyle = def.aura; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 2, IW * 0.45, IW * 0.15, 0, 0, 7); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = now / 400 + i * 1.05; ctx.fillStyle = def.aura; ctx.fillRect(x + Math.cos(a) * IW * 0.45, y - 2 + Math.sin(a) * IW * 0.15 - ((now / 10 + i * 20) % 40), 3, 3); } }
  }
  ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(x, y - 2, IW * 0.3, 5 * def.size, 0, 0, 7); ctx.fill();
  if (!def.fly && def.kind !== 'bat' && def.kind !== 'ghost') shadowAt(x, y, Math.max(8, IW * 0.28)); else shadowAt(x, y + 4, Math.max(6, IW * 0.2));
  ctx.drawImage(img2, Math.round(x - IW / 2 + OXX), Math.round(y - IH + (img.bob || 0)), IW, IH);
  NAMEQ.push(() => {
  const top = y - IH - 4;
  if (S.target === mo.i) { ctx.strokeStyle = '#ff4040'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 2, Math.max(16, IW * 0.35), 7, 0, 0, 7); ctx.stroke(); }
  if (mo.sb) { drawText(`⚡ 깜짝 보스 ${mo.sn || def.name} Lv${mo.lv}`, x, top - 10, mo.ac || '#ffdf4a', 15); ctx.fillStyle = '#000'; ctx.fillRect(x - 50, top - 5, 100, 7); ctx.fillStyle = mo.ac || '#ffdf4a'; ctx.fillRect(x - 50, top - 5, mo.h, 7); }
  else if (mo.mb) { drawText(`⚔ 중보스 ${def.name} Lv${mo.lv}`, x, top - 10, '#ffb040', 14); ctx.fillStyle = '#000'; ctx.fillRect(x - 40, top - 5, 80, 6); ctx.fillStyle = '#ff9a1a'; ctx.fillRect(x - 40, top - 5, 0.8 * mo.h, 6); }
  else if (def.boss) { drawText(`☠ ${def.name} Lv${def.lv}`, x, top - 10, '#ff4a4a', 15); ctx.fillStyle = '#000'; ctx.fillRect(x - 50, top - 5, 100, 7); ctx.fillStyle = '#ff2a2a'; ctx.fillRect(x - 50, top - 5, mo.h, 7); }
  else {
    if (mo.h < 100 || S.target === mo.i) { ctx.fillStyle = '#000'; ctx.fillRect(x - 16, top, 32, 4); ctx.fillStyle = mo.s ? '#b47cff' : '#ff4a4a'; ctx.fillRect(x - 16, top, 32 * mo.h / 100, 4); }
    if (S.target === mo.i || mo.mu || mo.s) drawText((mo.mu ? '돌연변이 ' : '') + def.name + (mo.s ? '' : ` Lv${mo.lv}`) + (mo.s ? '' : (sk => sk.length ? ' [' + sk.map(k => GD.MSK[k]).join('·') + ']' : '')(GD.monSkills ? GD.monSkills(def, mo.mu) : [])), x, top - 4, mo.mu ? '#d08aff' : mo.s ? '#d8c0ff' : '#ffb0b0', 11);
  }
  });
}
function drawBubble(id, x, y, now) {
  const b = S.bubbles.get(id); if (!b) return; if (now > b.until) { S.bubbles.delete(id); return; }
  ctx.font = '12px sans-serif'; const w = Math.min(200, ctx.measureText(b.text).width + 14);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.fillRect(x - w / 2, y - 62, w, 20); ctx.strokeRect(x - w / 2, y - 62, w, 20);
  ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.fillText(b.text.slice(0, 28), x, y - 48);
}
function drawPlot(pl, sx, sy) {
  const x = pl.x * TS - sx, y = pl.y * TS - sy;
  if (!S.tents.some(t => t.x === pl.x && t.y === pl.y)) { ctx.strokeStyle = pl.owner ? '#ffe08a88' : '#ffffff55'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, GD.TENT_W * TS - 4, GD.TENT_H * TS - 4); ctx.setLineDash([]); }
  const px = pl.sx * TS - sx, py = pl.sy * TS - sy;
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(px + 14, py + 10, 4, 20); ctx.fillStyle = '#c8a060'; ctx.fillRect(px + 2, py + 2, 28, 14); ctx.fillStyle = '#6a4a2a'; ctx.fillRect(px + 2, py + 15, 28, 2);
  drawText(pl.owner ? `${pl.owner}의 집` : `공터 ${fmt(pl.price)}💰`, px + 16, py - 2, pl.owner ? '#ffe08a' : '#d8ffd0', 11);
}
function drawStruct(t, sx, sy, now) {
  if (isOuterTent(t)) return; // 바깥 텐트는 엔티티 패스에서 통째로 그림
  if (t.inner) return drawTentInside(t, sx, sy, now);
  const x0 = t.x * TS - sx, y0 = t.y * TS - sy, Wt = GD.TENT_W, Ht = GD.TENT_H;
  if (x0 > W + 50 || y0 > H + 50 || x0 + Wt * TS < -50 || y0 + Ht * TS < -50) return;
  const house = t.kind === 'house';
  for (let ly = 0; ly < Ht; ly++) for (let lx = 0; lx < Wt; lx++) {
    const x = x0 + lx * TS, y = y0 + ly * TS;
    const wall = lx === 0 || lx === Wt - 1 || ly === 0 || ly === Ht - 1;
    if (!wall) {
      if (house) { ctx.fillStyle = '#b8864a'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = '#9a6a36'; for (let i = 0; i < 4; i++) ctx.fillRect(x, y + i * 8 + 7, TS, 1); ctx.fillRect(x + ((lx + ly) % 2 ? 10 : 22), y, 1, TS); }
      else { ctx.fillStyle = '#d8c8a0'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = '#c8b890'; ctx.fillRect(x, y + 15, TS, 2); }
    } else {
      const door = (house && t.furn.some(f => f.k === 'door' && f.x === lx && f.y === ly)) || (!house && ly === Ht - 1 && lx === (Wt >> 1));
      if (house) {
        ctx.fillStyle = '#d8c8a8'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = '#9a8a70'; for (let i = 0; i < 4; i++) ctx.fillRect(x, y + i * 8, TS, 1); ctx.fillRect(x + (ly % 2 ? 0 : 16), y, 1, TS);
        if (ly === 0) { ctx.fillStyle = '#8a3a2a'; ctx.fillRect(x, y - 10, TS, 12); ctx.fillStyle = '#6a2a1a'; ctx.fillRect(x, y, TS, 2); }
      } else {
        ctx.fillStyle = (lx + ly) % 2 ? '#c83a3a' : '#f0e8d8'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = '#0003'; ctx.fillRect(x, y + TS - 6, TS, 6);
        if (ly === 0) { ctx.fillStyle = '#a02a2a'; ctx.fillRect(x, y - 8, TS, 10); }
      }
      if (door && !house) { ctx.fillStyle = '#d8c8a0'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = '#c83a3a'; ctx.fillRect(x, y, 6, TS); ctx.fillRect(x + TS - 6, y, 6, TS); }
      if ((lx === 0 || lx === Wt - 1) && (ly === 0 || ly === Ht - 1)) { ctx.fillStyle = house ? '#6a4a2a' : '#7a5a3a'; ctx.fillRect(x + 12, y - (ly === 0 ? 16 : 0), 8, TS + (ly === 0 ? 16 : 0)); }
    }
  }
  for (const f of t.furn) drawFurn(ctx, f.k, x0 + f.x * TS, y0 + f.y * TS, now);
  drawText((house ? '🏠 ' : '⛺ ') + t.owner + (house ? '의 집' : '의 텐트'), x0 + Wt * TS / 2, y0 - 14, '#ffe0a0', 12);
}
/* 집 안에서는 카메라를 방 한가운데에 고정 (방 전체가 한눈에) */
function camC() { if (S.map && S.map.inner && String(S.map.id).startsWith('tent_h_')) return [(S.map.w - 1) / 2, (S.map.h - 1) / 2 - 0.9]; return [pos.rx, pos.ry]; }
function myStruct(kind) { return S.tents.find(t => t.owner === S.me.name && (t.kind || 'tent') === kind); }
function drawPlaceHint(sx, sy) {
  const t = myStruct(S.place.s); if (!t || isOuterTent(t)) return;
  const f = S.place.k && GD.FURNITURE[S.place.k];
  for (let ly = 0; ly < SH_(t); ly++) for (let lx = 0; lx < SW_(t); lx++) {
    const wall = lx === 0 || lx === SW_(t) - 1 || ly === 0 || ly === SH_(t) - 1; const corner = (lx === 0 || lx === SW_(t) - 1) && (ly === 0 || ly === SH_(t) - 1);
    const occ = t.furn.some(o => o.x === lx && o.y === ly);
    let ok = S.place.del ? occ : (f.wall ? wall && !corner && !occ : !wall && !occ);
    if (!ok) continue;
    ctx.fillStyle = S.place.del ? '#ff404055' : '#40ff6a44'; ctx.fillRect((t.x + lx) * TS - sx + 2, (t.y + ly) * TS - sy + 2, TS - 4, TS - 4);
  }
}
function placeAt(tx, ty) {
  const t = myStruct(S.place.s); if (!t) { S.place = null; return; }
  if (isOuterTent(t)) { log('텐트 안에 들어가서 가구를 배치하세요. (텐트 아래 입구로 들어가기)', '#ffd27a'); S.place = null; return; }
  const lx = tx - t.x, ly = ty - t.y; if (lx < 0 || ly < 0 || lx >= SW_(t) || ly >= SH_(t)) { S.place = null; return; }
  if (S.place.del) send({ t: 'furnDel', s: S.place.s, x: lx, y: ly }); else send({ t: 'furn', s: S.place.s, k: S.place.k, x: lx, y: ly });
}
function drawLight(sx, sy, now) {
  const m = S.map; let a = m.dark ? (m.castle ? 0.42 : 0.66) : S.nl * 0.7;
  if (m.dark && S.nl > 0) a = Math.min(0.92, a + S.nl * 0.05);
  if (m.inner) a = String(m.id).startsWith('tent_h_') ? 0.12 : 0.5;
  if (a < 0.02) return;
  lcx.globalCompositeOperation = 'source-over'; lcx.clearRect(0, 0, W, H); lcx.fillStyle = m.inner ? `rgba(20,10,4,${a})` : `rgba(6,8,28,${a})`; lcx.fillRect(0, 0, W, H);
  lcx.globalCompositeOperation = 'destination-out';
  const L = (x, y, r, i = 1) => { const px = x * TS + 16 - sx, py = y * TS + 10 - sy, R = r * TS; if (px < -R || px > W + R || py < -R || py > H + R) return; const gr = lcx.createRadialGradient(px, py, 0, px, py, R); gr.addColorStop(0, `rgba(0,0,0,${i})`); gr.addColorStop(0.5, `rgba(0,0,0,${i * 0.7})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); lcx.fillStyle = gr; lcx.fillRect(px - R, py - R, R * 2, R * 2); };
  const fl = 1 + Math.sin(now / 120) * 0.04;
  L(pos.rx, pos.ry, m.dark ? 6.5 : 5);
  if (m.inner) { L(4.5, 2.6, 3.6, 0.75); }
  for (const p of S.P.values()) if (p.i !== S.myId) L(p.rx, p.ry, 3.2, 0.8);
  for (const l of m.lights) L(l.x, l.y, l.r * fl);
  for (const t of S.tents) { L(t.x + 4, t.y + 3, 3, 0.5); for (const f of t.furn) if (['torch', 'campfire', 'lantern', 'stove'].includes(f.k)) L(t.x + f.x, t.y + f.y, (f.k === 'lantern' ? 6 : f.k === 'campfire' ? 5.5 : 4.5) * fl); }
  for (const mo of S.M.values()) { const d = GD.MONS[mo.t]; if (d && (d.boss || d.fire)) L(mo.rx, mo.ry, d.boss ? 4 : 2.5, 0.8); }
  for (const pl of S.plots) L(pl.sx, pl.sy, 3, 0.6);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(lc, 0, 0, W, H); ctx.imageSmoothingEnabled = false;
  // 횃불 따뜻한 빛
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.14 * a;
  for (const t of S.tents) for (const f of t.furn) if (['torch', 'campfire', 'lantern'].includes(f.k)) { const px = (t.x + f.x) * TS + 16 - sx, py = (t.y + f.y) * TS + 16 - sy; const gr = ctx.createRadialGradient(px, py, 0, px, py, 120); gr.addColorStop(0, '#ff9a30'); gr.addColorStop(1, '#ff9a3000'); ctx.fillStyle = gr; ctx.fillRect(px - 120, py - 120, 240, 240); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}

// ═══════ HUD ═══════
let hudSkillsKey = '';
function refreshHud(full) {
  const me = S.me; if (!me) return; const y = S.you; const st = me.st;
  const hp = y.hp ?? me.hp, mp = y.mp ?? me.mp, mhp = y.mhp || st.maxHp, mmp = y.mmp || st.maxMp;
  $('sname').textContent = me.name; $('slv').textContent = 'Lv.' + me.lv; $('sjob').textContent = GD.JOBS[me.job].name + (me.riding ? ' 🐎' : '') + ` · 공 ${st.atk} 방 ${st.def}`;
  const bar = (id, v, mx, t) => { const e = $(id); e.querySelector('i').style.width = Math.max(0, Math.min(100, 100 * v / mx)) + '%'; e.querySelector('span').textContent = t; };
  bar('hpb', hp, mhp, `HP ${hp}/${mhp}`); bar('mpb', mp, mmp, `MP ${mp}/${mmp}`);
  bar('xpb', me.exp, me.need, me.lv >= GD.MAX_LEVEL ? 'MAX' : `EXP ${(100 * me.exp / me.need).toFixed(1)}%`);
  $('scoin').textContent = fmt(me.coins); $('scoin2').textContent = fmt(me.coins);
  $('expline').firstElementChild.style.width = (me.lv >= GD.MAX_LEVEL ? 100 : 100 * me.exp / me.need) + '%';
  $('buffs2').innerHTML = (y.buffs || []).map(b => `<span class="buff">${esc(b.n)} ${Math.ceil(b.r / 1000)}s</span>`).join('');
  $('buffs').innerHTML = (y.buffs || []).map(b => `<span class="buff">${esc(b.n)} ${Math.ceil(b.r / 1000)}s</span>`).join('');
  $('deathbox').classList.toggle('hidden', !y.dead);
  const di = S.nl; $('clock').textContent = (S.map && S.map.dark ? '🕯 어두운 던전' : di > 0.5 ? '🌙 밤 (몬스터 강화)' : di > 0 ? '🌆 해질녘' : '☀ 낮') + `  (${pos.x},${pos.y})`;
  // 타겟
  const tg = S.target && S.M.get(S.target);
  if (tg) { const d = GD.MONS[tg.t]; $('target').classList.remove('hidden'); $('tname').innerHTML = `<b style="color:${d.boss ? '#f87171' : tg.mu ? '#c4b5fd' : '#f3f4f6'}">${tg.mu ? '돌연변이 ' : ''}${d.name}</b> Lv${tg.lv}`; $('target').querySelector('i').style.width = tg.h + '%'; $('target').querySelector('span').textContent = tg.h + '%'; }
  else $('target').classList.add('hidden');
  // 스킬바
  const key = me.skills.join() + me.lv + me.job + JSON.stringify(me.inv.filter(o => o.k === 'use').map(o => o.id + o.n));
  if (key !== hudSkillsKey || full) {
    hudSkillsKey = key;
    const b = $('bar'); let h = '';
    for (let i = 0; i < 6; i++) { const id = me.skills[i]; const sk = id && GD.SKILL[id]; h += `<div class="slot ${!sk || me.lv < sk.lv ? 'lock' : ''}" data-s="${i}" title="${sk ? esc(sk.name + ' — ' + sk.desc) : ''}"><span class="k">${i + 1}</span>${sk ? sk.name : '-'}<div class="cd" id="cd${i}"></div></div>`; }
    const cnt = ids => me.inv.filter(o => o.k === 'use' && ids.includes(o.id)).reduce((a, o) => a + o.n, 0);
    [['7', 'hp', ['hp1', 'hp2', 'hp3', 'meatCooked', 'stew', 'feast'], '#e8303a'], ['8', 'mp', ['mp1', 'mp2', 'mp3'], '#2f6bff'], ['9', 'buffAtk', ['buffAtk'], '#a040ff'], ['0', 'buffDef', ['buffDef'], '#ffd020']].forEach(([k, kind, ids, c]) => { h += `<div class="slot" data-p="${kind}"><span class="k">${k}</span><div class="pot" style="background:${c}"></div><span class="n">${cnt(ids)}</span></div>`; });
    b.innerHTML = h;
    b.querySelectorAll('[data-s]').forEach(d => d.onclick = () => castSkill(+d.dataset.s));
    b.querySelectorAll('[data-p]').forEach(d => d.onclick = () => usePot(d.dataset.p));
    if (S.touchBtns) S.touchBtns.forEach((d, i) => { const sk = GD.SKILL[me.skills[i]]; if (d) { d.textContent = sk ? sk.name : '-'; d.style.opacity = sk && me.lv >= sk.lv ? 1 : 0.35; } });
  }
  const sn = Date.now() + S.off;
  for (let i = 0; i < 6; i++) { const id = me.skills[i]; const el = $('cd' + i); if (!el || !id) continue; const r = (me.cds && me.cds[id] || 0) - sn; el.style.height = r > 0 ? Math.min(100, 100 * r / GD.SKILL[id].cd) + '%' : '0'; }
}
function drawMini() {
  const c = $('minic'), g = c.getContext('2d'); g.imageSmoothingEnabled = false; const m = S.map; if (!S.mini) return;
  g.fillStyle = '#000'; g.fillRect(0, 0, 150, 150);
  const sc = m.w > 100 ? 2 : 150 / Math.max(m.w, m.h); const span = 150 / sc;
  const ox = m.w > 100 ? Math.max(0, Math.min(m.w - span, pos.x - span / 2)) : 0, oy = m.w > 100 ? Math.max(0, Math.min(m.h - span, pos.y - span / 2)) : 0;
  g.drawImage(S.mini, ox, oy, span, span, 0, 0, 150, 150);
  const dot = (x, y, c, r = 2) => { g.fillStyle = c; g.fillRect((x - ox) * sc - r / 2, (y - oy) * sc - r / 2, r, r); };
  for (const n of m.npcs) dot(n.x, n.y, '#ffd000', 3);
  for (const t of S.tents) dot(t.x + 4, t.y + 3, '#ffa040', 4);
  for (const mo of S.M.values()) dot(mo.x, mo.y, GD.MONS[mo.t] && GD.MONS[mo.t].boss ? '#ff00ff' : '#ff4a4a', GD.MONS[mo.t] && GD.MONS[mo.t].boss ? 6 : 2);
  for (const p of S.P.values()) if (p.i !== S.myId) dot(p.x, p.y, '#5af0ff', 4);
  for (const k in m.portals) { const [x, y] = k.split(',').map(Number); dot(x, y, '#ff3030', 4); }
  if ((performance.now() / 300 | 0) % 2) dot(pos.x, pos.y, '#ffffff', 5);
}
function log(text, c = '#fff', html) {
  const d = document.createElement('div'); d.style.color = c; if (html) d.innerHTML = text; else d.textContent = text;
  const L = $('log'); L.appendChild(d); while (L.children.length > 9) L.removeChild(L.firstChild);
  setTimeout(() => { d.style.transition = 'opacity 1s'; d.style.opacity = 0.35; }, 15000);
}
let annT = null;
function announce(t, c) { const a = $('announce'); a.textContent = t; a.style.color = c || '#fff'; a.style.opacity = 1; clearTimeout(annT); annT = setTimeout(() => { a.style.transition = 'opacity 1s'; a.style.opacity = 0; setTimeout(() => a.style.transition = '', 1000); }, 4000); }
$('respawn').onclick = () => send({ t: 'respawn' });

// ═══════ 패널 ═══════
function openPanel(kind, data) { S.panel = { kind, data }; $('panel').classList.remove('hidden'); renderPanel(); }
function togglePanel(kind) { if (S.panel && S.panel.kind === kind) closePanel(); else openPanel(kind); }
function closePanel() { if (S.panel && S.panel.kind === 'trade' && S.trade) send({ t: 'tradeCancel' }); S.panel = null; $('panel').classList.add('hidden'); hideTip(); if (S.place) S.place = null; }
function closePanel2() { $('panel2').classList.add('hidden'); }
$('px').onclick = closePanel; $('px2').onclick = closePanel2;
function rerenderPanel() { if (S.panel) renderPanel(); }
function openDlg(m) { openPanel(m.kind, m); }
function cellHTML(it, i, extra = '', cls = '') {
  return `<div class="cell ${it.k === 'gear' ? 'r' + it.rar : ''} ${cls}" data-i="${i}" ${extra}><canvas width="32" height="32" data-icon="${i}"></canvas>${it.k !== 'gear' && it.n > 1 ? `<span class="n">${it.n}</span>` : ''}${it.plus ? `<span class="pl">+${it.plus}</span>` : ''}</div>`;
}
function paintIcons(root, list) { root.querySelectorAll('canvas[data-icon]').forEach(c => { const it = list[+c.dataset.icon]; if (!it) return; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 32, 32); g.drawImage(itemIcon(it), 0, 0); c.style.width = '44px'; c.style.height = '44px'; }); }
function itemName(it) { return it.k === 'gear' ? it.name + (it.plus ? ` +${it.plus}` : '') : it.k === 'use' ? GD.CONSUMES[it.id].name : it.id; }
function itemDesc(it) {
  if (it.k === 'gear') {
    const p = it.plus || 0; const st = Object.assign({}, it.st); if (st.atk) st.atk = Math.round(st.atk * (1 + 0.1 * p) + p * 2); if (st.def) st.def = Math.round(st.def * (1 + 0.1 * p) + p);
    const job = GD.JOBS[it.job].name; const can = S.me && (it.slot === 'shield' ? GD.JOBS[S.me.job].base === 'warrior' : GD.JOBS[S.me.job].base === it.job);
    return `<div class="nm" style="color:${GD.RARITY[it.rar].c}">${esc(itemName(it))}</div><div style="color:#a7b0bf">${it.boss ? '👑 보스 전용 · ' : ''}${GD.RARITY[it.rar].n} · ${it.lvl}등급 · <span style="color:${can ? '#4ade80' : '#f87171'}">${it.slot === 'shield' ? '전사' : job} 전용</span> ${GD.SLOT_NAME[it.slot]}${it.shop ? ' (상점)' : ''}</div>` +
      Object.entries(st).map(([k, v]) => `<div>${GD.OPT_NAME[k]} <b>+${v}</b></div>`).join('') + (() => { const e = GD.gearEff(S.me ? S.me.lv : 1, it); return e.main < 1 ? `<div style="color:#fbbf24;font-size:11px">요구 레벨 ${e.req} (내 레벨 ${S.me.lv}) — 착용 가능, 효력 ${Math.round(e.main * 100)}% · 추가옵션 ${Math.round(e.extra * 100)}%</div>` : `<div style="color:#4ade80;font-size:11px">요구 레벨 ${e.req} — 효력 100%</div>`; })();
  }
  if (it.k === 'use') return `<div class="nm">${GD.CONSUMES[it.id].name} x${it.n}</div><div>${GD.CONSUMES[it.id].desc}</div>`;
  return `<div class="nm">${esc(it.id)} x${it.n}</div><div>${(GD.MATS[it.id] || {}).desc || ''}</div>${(GD.MATS[it.id] || {}).where ? `<div style="color:#9fe8ff;font-size:11px">얻는 곳: ${esc(GD.MATS[it.id].where)}</div>` : ''}`;
}
function showTip(html, ev) { const t = $('tip'); t.innerHTML = html; t.classList.remove('hidden'); const x = Math.min(innerWidth - 290, (ev.clientX || 100) + 10), y = Math.min(innerHeight - t.offsetHeight - 10, (ev.clientY || 100) + 10); t.style.left = Math.max(4, x) + 'px'; t.style.top = Math.max(4, y) + 'px'; }
function hideTip() { $('tip').classList.add('hidden'); }
$('tip').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, i = +b.dataset.i;
  if (a === 'use') send({ t: 'use', i }); if (a === 'drop') uiAsk('정말 버리시겠습니까?', () => send({ t: 'drop', i }));
  if (a === 'sell') send({ t: 'sell', i }); if (a === 'upg') send({ t: 'upgrade', i }); if (a === 'upgEq') send({ t: 'upgrade', eq: b.dataset.s }); if (a === 'uneq') send({ t: 'unequip', slot: b.dataset.s }); if (a === 'ride') { send({ t: 'ride' }); hideTip(); }
  if (a === 'store') send({ t: 'store', dir: 'in', i }); if (a === 'take') send({ t: 'store', dir: 'out', i });
  if (a === 'trade') { const it = S.me.inv[i]; if (it.k !== 'gear' && it.n > 1) uiAsk(`몇 개를 교환에 올릴까요? (최대 ${it.n})`, n => send({ t: 'tradeItem', i, n }), { num: 1, max: it.n }); else send({ t: 'tradeItem', i, n: 1 }); }
  if (a === 'untrade') send({ t: 'tradeItem', i, remove: 1 });
  hideTip(); });
function invClick(i, ev, mode) {
  const it = S.me.inv[i]; if (!it) return;
  let btns = '';
  if (mode === 'shop') btns += `<button class="btn sm" data-a="sell" data-i="${i}">판매</button> `;
  else if (mode === 'smith') { if (it.k === 'gear') btns += `<button class="btn sm" data-a="upg" data-i="${i}">강화</button> `; }
  else if (mode === 'chest') btns += `<button class="btn sm" data-a="store" data-i="${i}">보관상자에 넣기</button> `;
  else if (mode === 'trade') btns += S.trade && S.trade.myIdx.includes(i) ? `<button class="btn sm red" data-a="untrade" data-i="${i}">교환에서 빼기</button>` : `<button class="btn sm green" data-a="trade" data-i="${i}">교환에 올리기</button>`;
  else { if (it.k !== 'mat') btns += `<button class="btn sm green" data-a="use" data-i="${i}">${it.k === 'gear' ? '착용' : '사용'}</button> `; btns += `<button class="btn sm red" data-a="drop" data-i="${i}">버리기</button>`; }
  const sell = mode === 'shop' ? `<div style="color:#fbbf24">판매가: ${it.k === 'gear' ? fmt(Math.floor((it.lvl * it.lvl * 4 + 30) * (1 + it.rar * 0.8) * (it.shop ? 0.5 : 1))) : it.k === 'use' ? fmt(Math.floor((GD.CONSUMES[it.id].price || 40) * 0.3) * it.n) : fmt(5 * it.n)} 코인</div>` : '';
  showTip(itemDesc(it) + sell + `<div style="margin-top:6px">${btns}</div>`, ev);
}
function invGrid(mode) {
  const me = S.me; let h = `<div class="grid" data-grid="${mode}">`;
  for (let i = 0; i < 36; i++) { const it = me.inv[i]; h += it ? cellHTML(it, i, '', mode === 'trade' && S.trade && S.trade.myIdx.includes(i) ? 'off' : '') : `<div class="cell" style="opacity:.4"></div>`; }
  return h + '</div>';
}
function bindInv(root, mode) { const g = root.querySelector(`[data-grid="${mode}"]`); if (!g) return; paintIcons(g, S.me.inv); g.querySelectorAll('.cell[data-i]').forEach(c => c.onclick = e => { e.stopPropagation(); invClick(+c.dataset.i, e, mode); }); }
function matLine(need) { return Object.entries(need).map(([k, v]) => { const have = S.me.inv.filter(o => o.k === 'mat' && o.id === k).reduce((a, o) => a + o.n, 0); return `<span style="color:${have >= v ? '#4ade80' : '#f87171'}">${k} ${v}(${have})</span>`; }).join(' · '); }
function renderPanel() {
  const P = S.panel; if (!P || !S.me) return; const me = S.me; const d = P.data || {}; const body = $('pbody');
  let h = ''; let mode = null;
  switch (P.kind) {
    case 'inv': {
      mode = 'inv';
      h = `<h2>🎒 가방과 장비</h2><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start"><div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap"><div class="eqgrid">`;
      const order = ['helmet', 'necklace', 'weapon', 'gloves', 'armor', 'shield', 'ring', 'boots', 'cape'];
      order.forEach(s => { if (!s) { h += '<div></div>'; return; } const it = me.eq[s]; h += it ? `<div class="cell eqs r${it.rar}" data-eq="${s}"><canvas width="32" height="32" data-eqi="${s}"></canvas>${it.plus ? `<span class="pl">+${it.plus}</span>` : ''}</div>` : `<div class="cell eqs" data-eq="${s}"><span class="lbl">${GD.SLOT_NAME[s]}</span></div>`; });
      const st = me.st;
      h += `</div><div class="stat" style="min-width:120px"><span>체력</span><b>${st.maxHp}</b><span>마나</span><b>${st.maxMp}</b><span>공격력</span><b>${st.atk}</b><span>방어력</span><b>${st.def}</b><span>치명타</span><b>${st.crit}%</b><span>행운</span><b>${st.luck}%</b><span>처치 수</span><b>${fmt(me.kills || 0)}</b></div></div><div>${invGrid('inv')}<div style="font-size:11px;color:#a7b0bf;margin-top:4px">${me.inv.length}/36칸 · 아이템을 눌러 착용/사용. 다른 직업 장비는 플레이어끼리 교환하세요!</div></div></div>`;
      break;
    }
    case 'shop': mode = 'shop';
      h = `<h2>🧪 ${esc(d.npc)}</h2><div class="dtext">${esc(d.text)}</div><div class="list">` + d.items.map(it => `<div class="li"><canvas width="32" height="32" data-ci="${it.id}"></canvas><div class="grow"><b>${it.name}</b><br><small>${it.desc}</small></div><span class="cost">${fmt(it.price)}</span><button class="btn sm" data-buy="${it.id}" data-n="1">1개</button><button class="btn sm" data-buy="${it.id}" data-n="10">10개</button></div>`).join('') + `</div><h3>판매하기 (아이템을 누르세요)</h3>${invGrid('shop')}`;
      break;
    case 'gear': {
      const byLv = {}; d.items.forEach(it => (byLv[it.lvl] = byLv[it.lvl] || []).push(it));
      h = `<h2>⚔ ${esc(d.npc)}</h2><div class="dtext">${esc(d.text)}</div>` + Object.entries(byLv).map(([lv, list]) => `<h3>${lv}등급 장비</h3><div class="list">` + list.map((it, j) => `<div class="li"><canvas width="32" height="32" data-gi="${lv}_${j}"></canvas><div class="grow"><b>${esc(it.name)}</b> <small>(${GD.SLOT_NAME[it.slot]})</small><br><small>${Object.entries(it.st).map(([k, v]) => GD.OPT_NAME[k] + ' +' + v).join(', ')}</small></div><span class="cost">${fmt(it.price)}</span><button class="btn sm" data-gb="${lv}|${it.slot}|${it.wt || ''}">구매</button></div>`).join('') + '</div>').join('');
      break;
    }
    case 'smith': {
      mode = 'smith';
      const row = (it, attr) => { const c = GD.upgradeCost(it); const have = me.inv.filter(o => o.k === 'mat' && o.id === c.mat).reduce((a, o) => a + o.n, 0); return `<div class="li"><div class="grow"><b style="color:${GD.RARITY[it.rar].c}">${esc(itemName(it))}</b><br><small>${it.plus >= 10 ? '최대 강화' : `필요: <span style="color:${have >= c.n ? '#4ade80' : '#f87171'}">${c.mat} ${c.n}개 (보유 ${have})</span> + ${fmt(c.coin)}코인 · 성공률 ${GD.UPG_RATE[it.plus]}%`}</small></div>${it.plus < 10 ? `<button class="btn sm" ${attr}>강화 +${it.plus + 1}</button>` : ''}</div>`; };
      h = `<h2>🔨 ${esc(d.npc)}</h2><div class="dtext">${esc(d.text)}</div><h3>착용 장비</h3><div class="list">` + GD.SLOTS.filter(s => me.eq[s]).map(s => row(me.eq[s], `data-ue="${s}"`)).join('') + `</div><h3>가방 속 장비</h3><div class="list">` + me.inv.map((it, i) => it.k === 'gear' ? row(it, `data-ui="${i}"`) : '').join('') + '</div>';
      break;
    }
    case 'stable':
      h = `<h2>🐎 ${esc(d.npc)}</h2><div class="dtext">${esc(d.text)}</div><div class="list">` + Object.entries(GD.MOUNTS).map(([id, mt]) => { const own = me.mounts.includes(id); return `<div class="li"><canvas width="56" height="80" data-mt="${id}" style="width:42px;height:60px"></canvas><div class="grow"><b>${mt.name}</b><br><small>이동속도 x${mt.spd}</small></div><span class="cost">${fmt(mt.price)}</span>${own ? `<button class="btn sm green" data-ride="${id}">타기</button>` : `<button class="btn sm" data-bm="${id}" ${me.coins < mt.price ? 'disabled' : ''}>구매</button>`}</div>`; }).join('') + '</div>';
      break;
    case 'master':
      h = `<h2>🎖 ${esc(d.npc)}</h2><div class="dtext">${esc(d.text)}</div><div class="list">` + d.opts.map(o => `<div class="li"><div class="grow"><b style="color:#c4b5fd;font-size:15px">${o.name}</b><br>${o.desc}<br><small>전용 스킬: ${o.skills.join(', ')}</small></div>${d.can ? `<button class="btn" data-pro="${o.id}">전직</button>` : ''}</div>`).join('') + '</div>';
      break;
    case 'guide': case 'talk':
      h = `<h2>💬 ${esc(d.npc)}</h2><div class="dtext">${esc(d.text)}</div>` + (d.bosses ? bossTable(d.bosses) : '');
      break;
    case 'boss': h = `<h2>☠ 보스 출현 시간표</h2><div class="dtext">보스는 정해진 시간에만 나타납니다. 혼자서는 어렵습니다 — 친구들과 협력하세요!\n협력한 모두가 각자 직업에 맞는 보스 전용 장비를 받습니다.</div>` + (S.bossList ? bossTable(S.bossList) : '불러오는 중...'); break;
    case 'chest': mode = 'chest';
      h = `<h2>📦 보관상자</h2><div class="grid" data-grid="store">` + Array.from({ length: 24 }, (_, i) => me.storage[i] ? cellHTML(me.storage[i], i) : '<div class="cell" style="opacity:.4"></div>').join('') + `</div><div style="font-size:11px;color:#a7b0bf;margin:4px 0">상자 아이템을 누르면 꺼냅니다.</div><h3>가방</h3>${invGrid('chest')}`;
      break;
    case 'cook':
      h = `<h2>🍖 요리 (${d.at === 'campfire' ? '모닥불' : '조리대'})</h2><div class="list">` + d.recipes.map(r => `<div class="li"><canvas width="32" height="32" data-ci="${r.id}"></canvas><div class="grow"><b>${r.name}</b><br><small>${r.desc}</small><br><small>${matLine(r.need)}</small></div><button class="btn sm" data-cook="${r.id}">요리</button></div>`).join('') + '</div><div style="font-size:11px;color:#a7b0bf;margin-top:6px">요리한 음식은 7번(체력) 단축키로 먹거나 다른 플레이어와 교환할 수 있습니다.</div>';
      break;
    case 'plot':
      h = `<h2>🏡 ${esc(d.town)} 공터</h2><div class="dtext">${esc(d.text)}</div>`;
      if (!d.owner) h += d.myPlot ? '<div>이미 다른 땅을 갖고 있습니다.</div>' : `<button class="btn green" data-plot="buy" ${me.coins < d.price ? 'disabled' : ''}>땅 구입 (${fmt(d.price)} 코인)</button>`;
      else if (d.mine) { if (!d.hasHouse) h += `<div style="margin-bottom:6px">집 짓기 재료: ${matLine(d.cost)}</div><button class="btn green" data-plot="build">🏠 집 짓기</button> `; else h += `<button class="btn" data-plot="deco">🪑 집 꾸미기</button> `; h += `<button class="btn red sm" data-plot="sell">땅 팔기 (절반 환불)</button>`; }
      break;
    case 'trade': mode = 'trade'; {
      const tr = S.trade; if (!tr) { h = '...'; break; }
      const side = (v, mine) => `<div style="flex:1;min-width:150px;background:#30353d;border-radius:12px;padding:8px;${v.lock ? 'outline:2px solid #2f6bff' : ''}"><b>${mine ? '내 제안' : esc(tr.with) + '의 제안'}</b> ${v.ok ? '✅' : v.lock ? '🔒' : ''}<div class="grid" style="grid-template-columns:repeat(4,48px);margin:6px 0" data-tg="${mine ? 'm' : 't'}">${v.items.map((it, i) => cellHTML(it, i)).join('') || '<small>없음</small>'}</div>💰 ${mine ? `<input type="number" id="tcoin" value="${v.coins}" min="0" style="width:100px" ${v.lock ? 'disabled' : ''}>` : fmt(v.coins)}</div>`;
      h = `<h2>🤝 교환 — ${esc(tr.with)}</h2><div style="display:flex;gap:8px;flex-wrap:wrap">${side(tr.mine, 1)}${side(tr.theirs, 0)}</div><div class="row"><button class="btn" data-tr="lock" ${tr.mine.lock ? 'disabled' : ''}>🔒 확정</button><button class="btn green" data-tr="ok" ${!(tr.mine.lock && tr.theirs.lock) || tr.mine.ok ? 'disabled' : ''}>✅ 교환하기</button><button class="btn red" data-tr="cancel">취소</button></div><div style="font-size:11px;color:#a7b0bf">모든 아이템(장비·재료·요리·물약)을 교환할 수 있어요. 아이템을 눌러 올리세요 → 둘 다 확정 → 교환하기</div><h3>내 가방</h3>${invGrid('trade')}`;
      break;
    }
    case 'skills': {
      const all = GD.skillsFor(me.job);
      h = `<h2>📜 스킬 — ${GD.JOBS[me.job].name}</h2><div class="dtext">${GD.JOBS[me.job].desc}${GD.JOBS[me.job].tier ? '' : `\nLv${GD.PROMO_LEVEL}에 전직하면 전용 스킬 3개가 추가됩니다: ` + GD.PROMOS[me.job].map(p => GD.JOBS[p].name).join(' / ')}</div><div class="list">` + all.map((s, i) => `<div class="li" style="opacity:${me.lv >= s.lv ? 1 : 0.45}"><span class="cost">[${i + 1}]</span><div class="grow"><b>${s.name}</b> <small>Lv${s.lv} · MP ${s.mp || 0} · 재사용 ${(s.cd / 1000).toFixed(1)}초</small><br><small>${s.desc}</small></div></div>`).join('') + '</div>';
      break;
    }
    case 'map': h = atlasHTML(); break;
    case 'build': h = buildHTML(); break;
  }
  body.innerHTML = h;
  // 바인딩
  if (mode) bindInv(body, mode);
  if (P.kind === 'inv') { body.querySelectorAll('[data-eqi]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon(me.eq[c.dataset.eqi]), 0, 0); c.style.width = '46px'; c.style.height = '46px'; }); body.querySelectorAll('[data-eq]').forEach(c => c.onclick = e => { const it = me.eq[c.dataset.eq]; if (!it) return; e.stopPropagation(); showTip(itemDesc(it) + `<div style="margin-top:6px"><button class="btn sm" data-a="uneq" data-s="${c.dataset.eq}">해제</button></div>`, e); }); }
  body.querySelectorAll('[data-ci]').forEach(c => { const g = c.getContext('2d'); g.drawImage(itemIcon({ k: 'use', id: c.dataset.ci }), 0, 0); c.style.width = '36px'; c.style.height = '36px'; });
  if (P.kind === 'gear') body.querySelectorAll('[data-gi]').forEach(c => { const [lv, j] = c.dataset.gi.split('_'); const it = d.items.filter(x => x.lvl == lv)[j]; const g = c.getContext('2d'); g.drawImage(itemIcon(it), 0, 0); c.style.width = '36px'; c.style.height = '36px'; });
  body.querySelectorAll('[data-mt]').forEach(c => { const g = c.getContext('2d'); g.drawImage(charSprite({ job: me.job, g: me.gender, h: me.hair, hc: me.hairColor, sk: me.skin, eq: {}, mt: c.dataset.mt }, 2, 0), 0, 0, 56, 80); });
  body.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => send({ t: 'buy', id: b.dataset.buy, n: +b.dataset.n }));
  body.querySelectorAll('[data-gb]').forEach(b => b.onclick = () => { const [lv, slot, wt] = b.dataset.gb.split('|'); send({ t: 'buy', lv: +lv, slot, wt }); });
  body.querySelectorAll('[data-ue]').forEach(b => b.onclick = () => send({ t: 'upgrade', eq: b.dataset.ue }));
  body.querySelectorAll('[data-ui]').forEach(b => b.onclick = () => send({ t: 'upgrade', i: +b.dataset.ui }));
  body.querySelectorAll('[data-bm]').forEach(b => b.onclick = () => uiAsk(`${GD.MOUNTS[b.dataset.bm].name}을(를) ${fmt(GD.MOUNTS[b.dataset.bm].price)}코인에 구매할까요?`, () => send({ t: 'buy', id: b.dataset.bm })));
  body.querySelectorAll('[data-ride]').forEach(b => b.onclick = () => send({ t: 'setMount', id: b.dataset.ride }));
  body.querySelectorAll('[data-pro]').forEach(b => b.onclick = () => uiAsk(`[${GD.JOBS[b.dataset.pro].name}](으)로 전직합니다. 되돌릴 수 없습니다.`, () => send({ t: 'promote', id: b.dataset.pro })));
  body.querySelectorAll('[data-cook]').forEach(b => b.onclick = () => send({ t: 'cook', id: b.dataset.cook }));
  body.querySelectorAll('[data-plot]').forEach(b => b.onclick = () => { const a = b.dataset.plot; if (a === 'buy') send({ t: 'plotBuy' }); if (a === 'build') send({ t: 'houseBuild' }); if (a === 'deco') openBuild('house'); if (a === 'sell') uiAsk('땅과 집을 팔까요? (가구는 사라집니다)', () => send({ t: 'plotSell' })); });
  if (P.kind === 'chest') { const g = body.querySelector('[data-grid="store"]'); paintIcons(g, me.storage); g.querySelectorAll('.cell[data-i]').forEach(c => c.onclick = e => { e.stopPropagation(); const it = me.storage[+c.dataset.i]; showTip(itemDesc(it) + `<div style="margin-top:6px"><button class="btn sm" data-a="take" data-i="${c.dataset.i}">꺼내기</button></div>`, e); }); }
  if (P.kind === 'trade' && S.trade) {
    ['m', 't'].forEach(k => { const g = body.querySelector(`[data-tg="${k}"]`); const list = k === 'm' ? S.trade.mine.items : S.trade.theirs.items; paintIcons(g, list); g.querySelectorAll('.cell[data-i]').forEach(c => c.onclick = e => { e.stopPropagation(); showTip(itemDesc(list[+c.dataset.i]), e); }); });
    const tc = $('tcoin'); if (tc) tc.onchange = () => send({ t: 'tradeCoin', n: +tc.value });
    body.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => { const a = b.dataset.tr; if (a === 'cancel') { send({ t: 'tradeCancel' }); } else send({ t: a === 'lock' ? 'tradeLock' : 'tradeOk' }); });
  }
  if (P.kind === 'map') bindAtlas(body);
  if (P.kind === 'build') bindBuild(body);
}
function bossTable(list) { return '<div class="list">' + list.map(b => `<div class="li"><div class="grow"><b style="color:#f87171">☠ ${b.name}</b> <small>Lv${b.lv}</small><br><small>${b.where}</small></div>${b.alive ? '<b style="color:#f87171">출현 중!</b>' : `<span>${Math.max(0, Math.ceil(b.inMin))}분 후</span>`}</div>`).join('') + '</div>'; }
function openPlayerMenu(p) {
  $('pbody2').innerHTML = `<h2>${esc(p.n)}</h2><div>Lv${p.lv} ${GD.JOBS[p.a.job].name}</div><div class="row" style="margin-top:8px"><button class="btn green" id="treq">🤝 교환 신청</button></div>`;
  $('panel2').classList.remove('hidden'); $('treq').onclick = () => { send({ t: 'tradeReq', id: p.i }); closePanel2(); };
}
function openAsk(m) {
  $('pbody2').innerHTML = `<h2>🤝 교환 요청</h2><div>${esc(m.from)}님이 교환을 신청했습니다.</div><div class="row" style="margin-top:8px"><button class="btn green" id="ty">수락</button><button class="btn red" id="tn">거절</button></div>`;
  $('panel2').classList.remove('hidden'); $('ty').onclick = () => { send({ t: 'tradeYes' }); closePanel2(); }; $('tn').onclick = () => { send({ t: 'tradeNo' }); closePanel2(); };
}

// ═══════ 집짓기 메뉴 ═══════
function openBuild(s) { openPanel('build', { s: s || (S.me.house && S.map && S.me.house.map === S.map.id && Math.abs(S.me.house.x + 4 - pos.x) < 10 && Math.abs(S.me.house.y + 3 - pos.y) < 8 ? 'house' : 'tent') }); }
function buildHTML() {
  const me = S.me; const s = S.panel.data.s;
  let h = `<h2>⛺ 집짓기</h2><div class="tabs"><button class="btn sm ${s === 'tent' ? 'green' : ''}" data-bt="tent">텐트 (야외)</button><button class="btn sm ${s === 'house' ? 'green' : ''}" data-bt="house">마을 집</button></div>`;
  const mats = ['나무', '돌', '양털', '솜', '횃불', '고기'].map(k => `${k} <b>${me.inv.filter(o => o.k === 'mat' && o.id === k).reduce((a, o) => a + o.n, 0)}</b>`).join(' · ');
  h += `<div style="font-size:12px;margin-bottom:6px">보유 재료: ${mats}</div>`;
  if (s === 'tent') {
    h += `<div class="dtext">사냥터 어디서든 텐트를 칠 수 있습니다 (마을 근처 제외). 내 위치가 텐트 문이 되고, 위쪽으로 9x7칸이 필요합니다.\n텐트 안은 몬스터가 들어오지 못하는 안전지대! 밤을 보내거나 쉬어가세요.</div>`;
    h += `<div class="row"><button class="btn green" data-bb="tent">⛺ ${me.tent ? '여기로 텐트 옮겨 짓기' : '여기에 텐트 짓기'}</button><span>${matLine(GD.TENT_COST)}</span></div>`;
    if (me.tent) h += `<div style="font-size:12px;color:#a7b0bf">현재 텐트: ${me.tent.map === 'world' ? '바깥 세계' : '던전'} (${me.tent.x},${me.tent.y}) <button class="btn sm red" data-bb="tentDel">철거</button></div>`;
  } else {
    h += `<div class="dtext">마을 주택가의 공터 표지판에서 땅을 사고, 건축 재료로 집을 지으세요.\n집에는 문·창문·그림(벽)과 침대·탁자·횃불·책장 등을 자유롭게 배치할 수 있습니다.</div>`;
    if (!me.house) h += `<div style="color:#f87171">아직 집이 없습니다. 마을 서쪽 주택가로 가보세요!</div>`;
  }
  const have = s === 'tent' ? me.tent : me.house;
  if (have) {
    h += `<h3>가구 배치 — 고른 뒤 ${s === 'house' ? '집' : '텐트'} 안의 칸을 클릭</h3><div class="list">` + Object.entries(GD.FURNITURE).filter(([, f]) => s === 'house' || !f.house).map(([k, f]) => `<div class="li"><canvas width="32" height="32" data-fu="${k}"></canvas><div class="grow"><b>${f.name}</b> <small>${f.desc}</small><br><small>${matLine(f.need)}</small></div><button class="btn sm" data-pf="${k}">배치</button></div>`).join('') + `</div><div class="row"><button class="btn sm red" data-pd="1">🗑 가구 철거 모드 (재료 절반 회수)</button></div>`;
  }
  return h;
}
function bindBuild(body) {
  const s = S.panel.data.s;
  body.querySelectorAll('[data-bt]').forEach(b => b.onclick = () => openPanel('build', { s: b.dataset.bt }));
  body.querySelectorAll('[data-bb]').forEach(b => b.onclick = () => { if (b.dataset.bb === 'tent') send({ t: 'build' }); else uiAsk('텐트를 철거할까요? (가구는 사라집니다)', () => send({ t: 'tentDel' })); });
  body.querySelectorAll('[data-fu]').forEach(c => { const g = c.getContext('2d'); drawFurn(g, c.dataset.fu, 0, 0, 0); });
  body.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { if (!myStruct(s)) return log('지금 이 지역에 내 ' + (s === 'house' ? '집' : '텐트') + '이 없습니다.', '#f99'); S.place = { s, k: b.dataset.pf }; $('panel').classList.add('hidden'); S.panel = null; log('설치할 칸을 클릭/터치하세요. 여러 개 연속 설치 가능, ESC로 종료.', '#ffe08a'); });
  body.querySelectorAll('[data-pd]').forEach(b => b.onclick = () => { if (!myStruct(s)) return; S.place = { s, del: 1 }; $('panel').classList.add('hidden'); S.panel = null; });
}

// ═══════ 지도 (아틀라스) ═══════
let atlasBase = null, atlasSel = null;
function buildAtlasBase() {
  const A = S.atlas; if (A && !A.tiles && window.ENGINE) A.tiles = ENGINE.ATLAS.tiles; if (!A || !A.tiles) return;
  const bin = atob(A.tiles); const w = 240; const c = mk(w, w), g = c.getContext('2d'); const id = g.createImageData(w, w);
  for (let i = 0; i < bin.length; i++) { const n = parseInt((MINI_COL[bin.charCodeAt(i)] || '#000').slice(1), 16); id.data[i * 4] = n >> 16; id.data[i * 4 + 1] = n >> 8 & 255; id.data[i * 4 + 2] = n & 255; id.data[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0); atlasBase = c;
}
function lvRange(s) { const [a, b] = String(s).split('~').map(Number); return [a, b || a]; }
function diffColor(lvMin) { const d = lvMin - S.me.lv; return d <= -8 ? '#9a9a9a' : d <= 2 ? '#22c55e' : d <= 8 ? '#eab308' : '#ef4444'; }
function atlasHTML() {
  const sz = Math.min(480, innerWidth - 40);
  return `<h2>🗺 바람의 대륙 지도</h2><div style="font-size:11px;margin-bottom:4px"><span style="color:#4ade80">■ 적정</span> <span style="color:#ffd04a">■ 도전</span> <span style="color:#f87171">■ 위험</span> <span style="color:#9a9a9a">■ 쉬움</span> · ⌂ 마을 · ▲ 동굴 · ♜ 성 · ☠ 필드보스 · 지역을 누르면 몬스터와 드랍 아이템을 볼 수 있습니다</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap"><div id="atlas"><canvas id="atc" width="480" height="480" style="width:${sz}px;height:${sz}px"></canvas></div><div id="atinfo" style="flex:1;min-width:260px;max-height:70vh;overflow:auto">${atlasInfo()}</div></div>`;
}
function bindAtlas(body) {
  const c = $('atc'); if (!c) return; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const A = S.atlas; if (atlasBase) g.drawImage(atlasBase, 0, 0, 480, 480);
  g.font = 'bold 11px sans-serif'; g.textAlign = 'center';
  for (const z of A.zones) { const [a] = lvRange(z.lv); const col = diffColor(a); g.fillStyle = col + '33'; g.fillRect(z.x0 * 2, z.y0 * 2, (z.x1 - z.x0) * 2, (z.y1 - z.y0) * 2); g.strokeStyle = col; g.lineWidth = atlasSel && atlasSel.z === z ? 3 : 1; g.strokeRect(z.x0 * 2, z.y0 * 2, (z.x1 - z.x0) * 2, (z.y1 - z.y0) * 2); const cx = (z.x0 + z.x1), cy = (z.y0 + z.y1); g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(`${z.name} Lv${z.lv}`, cx, cy); g.fillStyle = col; g.fillText(`${z.name} Lv${z.lv}`, cx, cy); }
  for (const d of A.dungeons) { const [a] = lvRange(d.lv); const col = diffColor(a); const x = d.x * 2, y = d.y * 2; g.fillStyle = '#000'; g.fillRect(x - 9, y - 9, 18, 18); g.fillStyle = col; g.fillText(d.type === 'cave' ? '▲' : '♜', x, y + 4); g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(`${d.name} Lv${d.lv}`, x, y - 12); g.fillStyle = '#fff'; g.fillText(`${d.name} Lv${d.lv}`, x, y - 12); }
  for (const b of A.fieldBosses) { g.font = 'bold 16px sans-serif'; g.fillStyle = '#ff3a3a'; g.fillText('☠', b.x * 2, b.y * 2 + 5); }
  g.font = 'bold 12px sans-serif';
  for (const t of A.towns) { g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText('⌂ ' + t.name, t.x * 2, t.y * 2 + 4); g.fillStyle = '#ffe08a'; g.fillText('⌂ ' + t.name, t.x * 2, t.y * 2 + 4); }
  // 내 위치
  let mx = pos.x, my = pos.y; if (S.map.id !== 'world') { const dg = A.dungeons.find(d => d.name === DG_ID[S.map.id.replace(/\d+$/, '')]); if (dg) { mx = dg.x; my = dg.y; } }
  g.fillStyle = '#fff'; g.beginPath(); g.arc(mx * 2, my * 2, 6, 0, 7); g.fill(); g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(mx * 2, my * 2, 4, 0, 7); g.fill();
  c.onclick = e => {
    const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 240, y = (e.clientY - r.top) / r.height * 240;
    let sel = null;
    for (const b of A.fieldBosses) if (Math.hypot(b.x - x, b.y - y) < 6) sel = { b };
    if (!sel) for (const d of A.dungeons) if (Math.hypot(d.x - x, d.y - y) < 8) sel = { d };
    if (!sel) for (const z of A.zones) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) sel = { z };
    atlasSel = sel; renderPanel();
  };
  body.querySelectorAll('canvas[data-mon]').forEach(cc => { const def = GD.MONS[cc.dataset.mon]; const img = monSprite(cc.dataset.mon, false, 0, false); const gg = cc.getContext('2d'); gg.imageSmoothingEnabled = false; const s = Math.min(40 / img.width, 40 / img.height) * (def.boss ? 1 : 1); gg.drawImage(img, (40 - img.width * s) / 2, 40 - img.height * s, img.width * s, img.height * s); });
}
const DG_ID = { bat: '박쥐동굴', skull: '해골굴', mine: '망령광산', dok: '도깨비굴', obs: '흑요성', demon: '마왕성' };
function minutesStr(every, off) { const a = []; for (let m = off % every; m < 60; m += every) a.push(String(m).padStart(2, '0')); return '매시 ' + a.join('·') + '분'; }
function monEntry(key) {
  const d = GD.MONS[key]; const lv = d.lv;
  let dr = [`💰 코인 (항상)`];
  if (d.boss) {
    const L = GD.BOSS_LOOT[key];
    dr.push(`<b style="color:#fbbf24">👑 보스 전용 [${L.set}] 장비</b> — ${L.desc}`, `부위: ${L.slots.map(s => GD.SLOT_NAME[s]).join('/')} · 전설 등급 · <b>협력한 모두에게 각자 직업에 맞게 1개씩</b>`, `🛡 무작위 장비 2~4개 (Lv${Math.max(1, lv - 2)}~${Math.min(50, lv + 2)})`, `⛏ ${GD.oreFor(lv)} 4~8개${lv >= 30 ? ' · 용의비늘' : ''} · 건축재료 다수`);
  } else {
    dr.push(`🛡 장비: 무작위 직업·부위 Lv${Math.max(1, lv - 2)}~${Math.min(50, lv + 2)} (낮은 확률 약 4%, 돌연변이 12%)`, `⛏ 강화재료: ${GD.oreFor(lv)} (7.5%)${lv >= 45 ? ' · 용의비늘 (4%)' : ''}`);
    if (d.mats) dr.push(`🪵 건축재료: ${[...new Set(d.mats)].join(', ')} (32%)`);
    if (d.meat) dr.push(`🍖 고기 (40%)`);
    dr.push(`🧪 물약 (5%)`);
  }
  return `<div class="mon"><canvas width="40" height="40" data-mon="${key}"></canvas><div><b style="color:${d.boss ? '#f87171' : '#f3f4f6'}">${d.name}</b> <small>Lv${lv}${d.p ? ' · 비선공' : ' · 선공'}${d.rng ? ' · 원거리' : ''}</small><div class="dr">${dr.join('<br>')}</div></div></div>`;
}
function atlasInfo() {
  const sel = atlasSel; const A = S.atlas;
  if (!sel) return `<div class="dtext">지도에서 사냥터·던전·보스(☠)를 눌러보세요.\n\n현재 내 레벨: ${S.me.lv} (최대 ${GD.MAX_LEVEL})\n\n· 일반 몬스터는 직업과 상관없이 무작위 장비를 떨어뜨립니다 → 다른 직업 장비는 친구와 교환!\n· 보스는 정해진 시간에만 출현하며, 협력한 모두가 각자 직업용 보스 전용 장비를 받습니다.\n· 밤에는 돌연변이 몬스터가 나와 더 좋은 장비를 떨어뜨립니다.</div>` +
    '<h3>추천 사냥터</h3>' + [...A.zones.map(z => ({ n: z.name, lv: z.lv })), ...A.dungeons.map(d => ({ n: d.name, lv: d.lv }))].sort((a, b) => lvRange(a.lv)[0] - lvRange(b.lv)[0]).map(o => `<div style="color:${diffColor(lvRange(o.lv)[0])}">· ${o.n} — Lv${o.lv}</div>`).join('');
  if (sel.z) { const z = sel.z; return `<h3>${z.name} <small>Lv${z.lv}</small></h3>` + z.mons.map(monEntry).join(''); }
  if (sel.d) { const d = sel.d; return `<h3>${d.type === 'cave' ? '▲' : '♜'} ${d.name} <small>Lv${d.lv} · ${d.floors.length}층</small></h3>` + d.floors.map((f, i) => `<div style="color:#fbbf24;margin-top:6px">${i + 1}층</div>` + f.map(monEntry).join('')).join('') + `<div style="color:#f87171;margin-top:8px">☠ ${d.floors.length}층 보스 — ${minutesStr(d.every, d.off)} 출현</div>` + monEntry(d.boss); }
  if (sel.b) { const b = sel.b; return `<h3>☠ 필드 보스 — ${b.where}</h3><div>${minutesStr(b.every, b.off)} 출현</div>` + monEntry(b.mon); }
}
