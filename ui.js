// ═══════════════════════════════════════════
//  가로 전용 UI (한 화면 고정 · 스크롤 없음 · 아이콘)
// ═══════════════════════════════════════════
const ICP = {
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 1 2-2h13v3H6a2 2 0 0 1-2-1z"/>',
  tent: '<path d="M12 4L2 20h20z"/><path d="M12 4v16M9 20l3-6 3 6"/>',
  horse: '<path d="M5 20v-5l2-4 5-1 3-5 2 1-1 3 3 3-1 2-3-1-1 2v5"/><path d="M9 20v-4"/>',
  skull: '<path d="M12 3a7 7 0 0 0-7 7c0 2.6 1.3 4.2 3 5v3h8v-3c1.7-.8 3-2.4 3-5a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="11" r="1.2"/><circle cx="14.5" cy="11" r="1.2"/><path d="M10 18v3M14 18v3"/>',
  coin: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  sword: '<path d="M14 4h6v6L9 21l-3-3L17 7"/><path d="M5 15l4 4M3 21l3-3"/>',
  staff: '<path d="M6 21L16 8"/><circle cx="17" cy="6" r="3"/>',
  bow: '<path d="M6 3c7 2 13 8 15 15"/><path d="M6 3l15 15M3 21l8-8"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  flask: '<path d="M9 3h6M10 3v5l-5 10a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3L14 8V3"/><path d="M7 15h10"/>',
  heart: '<path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  talk: '<path d="M4 5h16v11H9l-5 4z"/><path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01"/>',
  grab: '<path d="M8 12V6a2 2 0 0 1 4 0v5M12 10V5a2 2 0 0 1 4 0v6M16 9a2 2 0 0 1 4 0v4a8 8 0 0 1-8 8h-1a6 6 0 0 1-5-3l-2.5-4a2 2 0 0 1 3.4-2L8 14"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-7z"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>',
  door: '<path d="M5 21V4h10v17M15 4l4 2v15M11 12h.01M3 21h18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
  hammer: '<path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L3 15l3 3 8-8"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  swap: '<path d="M7 7h13l-3-3M17 17H4l3 3"/>',
  crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5 6"/>',
  bed: '<path d="M3 18V6M3 13h18v5M21 18v-5a3 3 0 0 0-3-3h-8v3"/><circle cx="7" cy="10.5" r="1.5"/>',
  cave: '<path d="M2 20l5-9 3 3 4-8 8 14z"/><path d="M10 20v-3a2 2 0 0 1 4 0v3"/>',
  castle: '<path d="M4 21V8h3V5h2v3h2V5h2v3h2V5h2v3h3v13z"/><path d="M10 21v-5h4v5"/>',
  phone: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M17 12h.01"/><path d="M8 3h8M16 3l-2-1M16 3l-2 1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  pick: '<path d="M14 6c3-1 6 0 7 2-3-.5-5 0-7 1M10 6C7 5 4 6 3 8c3-.5 5 0 7 1"/><path d="M12 7v14"/>',
  wool: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 10h16M4 14h16"/>',
};
const ic = (n, s) => `<svg class="ic" viewBox="0 0 24 24"${s ? ` style="width:${s}px;height:${s}px"` : ''}>${ICP[n] || ICP.info}</svg>`;
const EMO = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{20E3}]/gu;
const strip = t => String(t).replace(EMO, '').replace(/^\s+/, '');

// ── 화면 맞춤 배율 ──
function fitUI() {
  const w = innerWidth, h = innerHeight;
  const uis = Math.min((w - 12) / 780, (h - 12) / 350, 1.6);
  const hz = Math.max(0.62, Math.min(1.7, Math.min(w / 844, h / 390)));
  document.documentElement.style.setProperty('--uis', uis.toFixed(4));
  document.documentElement.style.setProperty('--hz', hz.toFixed(4));
  window.UIS = uis;
}
addEventListener('resize', fitUI); addEventListener('orientationchange', () => setTimeout(fitUI, 300)); fitUI();

// ── 정적 요소 아이콘 ──
$('px').innerHTML = ic('x'); $('px2').innerHTML = ic('x'); $('rotic').innerHTML = ic('phone'); $('coinic').innerHTML = ic('coin');
const MENU = [['i', 'bag', '가방'], ['m', 'map', '지도'], ['k', 'book', '스킬'], ['b', 'tent', '집짓기'], ['r', 'horse', '탈것'], ['h', 'skull', '보스']];
$('menu').innerHTML = MENU.map(([k, i, t]) => `<div class="mbtn" data-k="${k}" title="${t} (${k.toUpperCase()})">${ic(i)}</div>`).join('');
$('menu').querySelectorAll('.mbtn').forEach(b => b.onclick = () => hotkey(b.dataset.k));

// ── 이모지 제거 래퍼 ──
const _log = log; log = function (text, c, html) { return _log(html ? text : strip(text), c, html); };
const _ann = announce; announce = function (t, c) { return _ann(strip(t), c); };
const _dt = drawText; const _dtc = new Map();
drawText = function (t, x, y, col, size, bold) { let s = _dtc.get(t); if (s === undefined) { s = strip(t); if (_dtc.size > 500) _dtc.clear(); _dtc.set(t, s); } return _dt(s, x, y, col, size, bold); };
const _sns = setNetStatus; setNetStatus = function (t, c) { return _sns(strip(t), c); };

// ── 주소창 숨기기 (전체화면 / 홈 화면 추가 안내) ──
function tryFullscreen() {
  const d = document.documentElement;
  const rq = d.requestFullscreen || d.webkitRequestFullscreen;
  if (rq && !document.fullscreenElement && !document.webkitFullscreenElement) { try { const p = rq.call(d, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => { }); } catch (e) { } }
}
function fsHint() {
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
  const ios = /iPhone|iPod/.test(navigator.userAgent);
  if (!ios || standalone) return;
  try { if (localStorage.getItem('baram_fshint')) return; } catch (e) { }
  const d = document.createElement('div'); d.id = 'fshint'; d.className = 'win';
  d.innerHTML = `${ic('info')}<span>주소창 없이 하려면: 아래 <b>공유</b> 버튼 → <b>홈 화면에 추가</b> → 홈 화면의 <b>바람의 대륙</b> 아이콘으로 실행하세요.</span><button class="btn sm" id="fsok">확인</button>`;
  document.body.appendChild(d);
  $('fsok').onclick = () => { d.remove(); try { localStorage.setItem('baram_fshint', '1'); } catch (e) { } };
  setTimeout(() => d.remove(), 20000);
}
addEventListener('pointerdown', function once() { if (S.me) { tryFullscreen(); removeEventListener('pointerdown', once); } });
const _onMsg = onMsg; onMsg = function (m) { const r = _onMsg(m); if (m.t === 'welcome') { setTimeout(() => { tryFullscreen(); fsHint(); scrollTo(0, 1); }, 300); } return r; };

// ── 로그인 화면 ──
const _webLobby = webLobby;
webLobby = function () {
  _webLobby();
  const L = $('lobby'); if (!L) return;
  L.querySelectorAll('.sub').forEach(e => e.remove());
  L.style.marginTop = '8px';
  $('lhost').className = 'btn pri'; $('lhost').innerHTML = ic('home') + '방 만들기'; $('lhost').style.cssText = 'flex:1;height:34px';
  $('ljoin').className = 'btn'; $('ljoin').innerHTML = ic('door') + '참가하기'; $('ljoin').style.cssText = 'flex:1;height:34px';
  $('lcode').style.cssText = 'width:110px;height:34px;text-align:center;font-size:15px;font-weight:700'; $('lcode').placeholder = '방 코드';
  $('lsolo').className = 'btn sm'; $('lsolo').innerHTML = ic('users') + '혼자 하기';
  L.querySelectorAll('.row').forEach(r => r.style.marginTop = '6px');
  let mem = null; try { mem = JSON.parse(localStorage.getItem('baram_last') || 'null'); } catch (e) { }
  if (mem && mem.code && mem.name) {
    $('nm').value = mem.name; if (mem.role === 'guest' && !$('lcode').value) $('lcode').value = mem.code;
    const cont = document.createElement('button'); cont.className = 'btn pri'; cont.id = 'lcont'; cont.style.cssText = 'width:100%;height:42px;font-size:14px;margin-bottom:4px;background:#16a34a;border-color:#16a34a';
    cont.innerHTML = `${ic('check')}이어하기 · ${esc(mem.name)} · 방 ${mem.code} (${mem.role === 'host' ? '방장' : '참가'})`;
    L.insertBefore(cont, L.firstChild);
    cont.onclick = () => { $('nm').value = mem.name; if (mem.role === 'host') NET.hostRoom(mem.name, mem.code); else { $('lcode').value = mem.code; $('ljoin').click(); } };
  }
  const note = document.createElement('div'); note.className = 'mut'; note.style.cssText = 'text-align:center;margin-top:8px';
  note.textContent = '방장이 [방 만들기]를 누르면 4자리 코드가 나와요 (한 번 만든 방은 계속 유지). 친구는 코드를 넣고 [참가하기]. 다음부터는 [이어하기]만 누르면 돼요.'; L.appendChild(note);
};
function opts(el, list, key) {
  el.innerHTML = list.map((o, i) => `<div class="opt ${CR[key] === o.v ? 'on' : ''}" data-v="${i}">${o.html}</div>`).join('');
  el.querySelectorAll('.opt').forEach(d => d.onclick = () => { CR[key] = list[+d.dataset.v].v; buildCreate(); });
}
function buildCreate() {
  opts($('gsel'), [{ v: 'm', html: '남자' }, { v: 'f', html: '여자' }], 'g');
  opts($('hsel'), ['기본', '삐죽', '긴머리', '묶음'].map((n, i) => ({ v: i, html: n })), 'h');
  opts($('hcsel'), HAIRC.map((c, i) => ({ v: i, html: `<span class="sw" style="background:${c}"></span>` })), 'hc');
  opts($('sksel'), SKIN.map((c, i) => ({ v: i, html: `<span class="sw" style="background:${c}"></span>` })), 'sk');
  const J3 = [['warrior', 'sword', '근접 · 탱커'], ['mage', 'staff', '마법 · 광역'], ['healer', 'bow', '치유 · 원거리']];
  $('jsel').innerHTML = J3.map(([j, i, s]) => `<div class="job ${CR.job === j ? 'on' : ''}" data-j="${j}">${ic(i)}<b>${GD.JOBS[j].name}</b><small>${s}</small></div>`).join('');
  $('jsel').querySelectorAll('.job').forEach(d => d.onclick = () => { CR.job = d.dataset.j; buildCreate(); });
  const J = GD.JOBS[CR.job];
  $('jdesc').innerHTML = `<b style="color:#fff">${J.name}</b> — ${J.desc}<br><span class="mut">Lv${GD.PROMO_LEVEL} 전직</span><br>` + GD.PROMOS[CR.job].map(p => `<b style="color:#c4b5fd">${GD.JOBS[p].name}</b> <span class="mut">${GD.JOBS[p].desc}</span>`).join('<br>');
  const pc = $('preview').getContext('2d'); pc.imageSmoothingEnabled = false; pc.clearRect(0, 0, 112, 160);
  pc.drawImage(charSprite({ job: CR.job, g: CR.g, h: CR.h, hc: CR.hc, sk: CR.sk, eq: { weapon: [0, 0, 0, { warrior: 'sword', mage: 'staff', healer: 'bow' }[CR.job]] } }, 0, 0), 0, 0, 112, 160);
}

// ── 터치 컨트롤 (사각형 정렬) ──
function buildTouch() {
  const dp = $('dpad');
  dp.innerHTML = `<div data-d="3" style="left:46px;top:0">${ic('up')}</div><div data-d="1" style="left:0;top:46px">${ic('left')}</div><div data-d="2" style="left:92px;top:46px">${ic('right')}</div><div data-d="0" style="left:46px;top:92px">${ic('down')}</div>`;
  const setD = e => { const r = dp.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 136 - 68, y = (e.clientY - r.top) / r.height * 136 - 68; if (Math.hypot(x, y) < 10) { touchDir = -1; return; } touchDir = Math.abs(x) > Math.abs(y) ? (x > 0 ? 2 : 1) : (y > 0 ? 0 : 3); };
  dp.onpointerdown = e => { dp.setPointerCapture(e.pointerId); setD(e); e.preventDefault(); };
  dp.onpointermove = e => { if (e.buttons || e.pressure) setD(e); };
  dp.onpointerup = dp.onpointercancel = () => { touchDir = -1; };
  const acts = $('acts'); acts.innerHTML = '<div id="skillgrid"></div>'; S.touchBtns = []; S.touchCd = [];
  const g = $('skillgrid');
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div'); d.className = 'tb'; d.innerHTML = `${ic('zap')}<span>-</span><div class="cdm"></div>`;
    d.addEventListener('pointerdown', e => { e.preventDefault(); castSkill(i); });
    g.appendChild(d); S.touchBtns[i] = d.querySelector('span'); S.touchCd[i] = d;
  }
  const atk = document.createElement('div'); atk.className = 'tb atk'; atk.innerHTML = `${ic('sword')}<span>공격</span>`;
  atk.addEventListener('pointerdown', e => { e.preventDefault(); touchAtk = true; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => atk.addEventListener(ev, () => touchAtk = false));
  acts.appendChild(atk);
  const util = $('util'); util.innerHTML = '';
  [['heart', '체력', () => usePot('hp'), '#f87171'], ['drop', '마나', () => usePot('mp'), '#60a5fa'], ['talk', '대화', () => send({ t: 'interact' })], ['grab', '줍기', () => send({ t: 'pick' })], ['target', '대상', () => cycleTarget()], ['chat', '채팅', () => { chatin.classList.remove('hidden'); chatin.focus(); }]].forEach(([i, l, f, c]) => {
    const d = document.createElement('div'); d.className = 'tb'; d.innerHTML = `<span style="color:${c || '#fff'}">${ic(i)}</span><span>${l}</span>`;
    d.addEventListener('pointerdown', e => { e.preventDefault(); f(); }); util.appendChild(d);
  });
  S.touchBtns.forEach(() => { });
}

// ── HUD 보정 (시계 아이콘, 터치 스킬 쿨타임) ──
const _rh = refreshHud;
refreshHud = function (full) {
  _rh(full);
  if (!S.me || !S.map) return;
  const di = S.nl;
  const [icn, lb] = S.map.dark ? ['flame', '던전'] : di > 0.5 ? ['moon', '밤'] : di > 0 ? ['moon', '해질녘'] : ['sun', '낮'];
  const key = icn + lb + pos.x + ',' + pos.y;
  if (S._clk !== key) { S._clk = key; $('clock').innerHTML = `${ic(icn)}${lb} · ${pos.x},${pos.y}`; }
  if (S.touchCd) { const sn = Date.now() + S.off; S.touchCd.forEach((d, i) => { const id = S.me.skills[i]; const sk = id && GD.SKILL[id]; const r = sk ? (S.me.cds && S.me.cds[id] || 0) - sn : 0; d.querySelector('.cdm').style.height = r > 0 ? Math.min(100, 100 * r / sk.cd) + '%' : '0'; d.classList.toggle('lock', !sk || S.me.lv < sk.lv); }); }
};
const _sc = showCode;
showCode = function (code) {
  const d = document.createElement('div'); d.id = 'roomcode'; d.innerHTML = `${ic('key')}방 ${code}`; d.title = '눌러서 참가 링크 복사';
  d.onclick = () => { const url = location.href.split('#')[0] + '#' + code; try { navigator.clipboard.writeText(url).then(() => log('참가 링크를 복사했어요: ' + url, '#9fe8ff')); } catch (e) { log('참가 링크: ' + url, '#9fe8ff'); } };
  $('mini').appendChild(d);
};

// ── 확인창 / 작은 창 ──
function small(title, iconName, html) { $('ptitle2').innerHTML = ic(iconName) + esc(title); $('pbody2').innerHTML = html; $('panel2').classList.remove('hidden'); }
function uiAsk(text, onYes, opt = {}) {
  small('확인', 'info', `<div class="txt" style="margin-bottom:10px">${esc(text)}</div>${opt.num ? `<input type="number" id="asknum" min="1" max="${opt.max}" value="${opt.max}" style="width:100%;margin-bottom:10px">` : ''}<div class="row" style="justify-content:flex-end"><button class="btn" id="askno">취소</button><button class="btn pri" id="askyes">확인</button></div>`);
  $('askyes').onclick = () => { const v = opt.num ? Math.max(1, Math.min(opt.max, parseInt($('asknum').value) || 0)) : true; closePanel2(); onYes(v); };
  $('askno').onclick = closePanel2;
}
function openPlayerMenu(p) {
  small(p.n, 'users', `<div class="mut" style="margin-bottom:10px">Lv${p.lv} ${GD.JOBS[p.a.job] ? GD.JOBS[p.a.job].name : ''}</div><button class="btn pri" id="treq" style="width:100%">${ic('swap')}교환 신청</button>`);
  $('treq').onclick = () => { send({ t: 'tradeReq', id: p.i }); closePanel2(); };
}
function openAsk(m) {
  small('교환 요청', 'swap', `<div class="txt" style="margin-bottom:10px">${esc(m.from)}님이 교환을 신청했습니다.</div><div class="row" style="justify-content:flex-end"><button class="btn red" id="tn">거절</button><button class="btn pri" id="ty">수락</button></div>`);
  $('ty').onclick = () => { send({ t: 'tradeYes' }); closePanel2(); }; $('tn').onclick = () => { send({ t: 'tradeNo' }); closePanel2(); };
}
function showTip(html, ev) {
  const t = $('tip'); t.innerHTML = html; t.classList.remove('hidden');
  const x = Math.min(innerWidth - t.offsetWidth - 6, (ev.clientX || 100) + 8), y = Math.min(innerHeight - t.offsetHeight - 6, (ev.clientY || 100) + 8);
  t.style.left = Math.max(6, x) + 'px'; t.style.top = Math.max(6, y) + 'px';
}

// ── 공통 조각 ──
const CS = 36;
function cellH(it, i, cls = '', attr = 'data-i') {
  if (!it) return `<div class="cell empty"></div>`;
  return `<div class="cell ${it.k === 'gear' ? 'r' + it.rar : ''} ${cls}" ${attr}="${i}"><canvas width="22" height="22" data-ic="${attr}:${i}"></canvas>${it.k !== 'gear' && it.n > 1 ? `<span class="n">${it.n}</span>` : ''}${it.plus ? `<span class="pl">+${it.plus}</span>` : ''}</div>`;
}
function gridH(list, n, cols, cls = '', attr = 'data-i', size = CS, offFn) {
  let h = `<div class="grid" style="grid-template-columns:repeat(${cols},${size}px)">`;
  for (let i = 0; i < n; i++) h += cellH(list[i], i, offFn && offFn(i) ? 'off' : '', attr).replace('class="cell', `style="width:${size}px;height:${size}px" class="cell`);
  return h + '</div>';
}
function paint(root, attr, list) {
  root.querySelectorAll(`canvas[data-ic^="${attr}:"]`).forEach(c => { const it = list[+c.dataset.ic.split(':')[1]]; if (!it) return; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 22, 22); g.drawImage(itemIcon(it), 0, 0); });
}
function iconCanvas(it, size = 26) { return `<canvas width="22" height="22" data-one='${JSON.stringify({ k: it.k, id: it.id, slot: it.slot, wt: it.wt, tier: it.tier, job: it.job })}' style="width:${size}px;height:${size}px"></canvas>`; }
function paintOne(root) { root.querySelectorAll('canvas[data-one]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon(JSON.parse(c.dataset.one)), 0, 0); }); }
const coinH = n => `<span class="cost">${ic('coin')}${fmt(n)}</span>`;
function haveMat(k) { return S.me.inv.filter(o => o.k === 'mat' && o.id === k).reduce((a, o) => a + o.n, 0); }
function needH(need) { return Object.entries(need).map(([k, v]) => `<span class="${haveMat(k) >= v ? 'gl' : 'rl'}">${k} ${v}<span class="mut">(${haveMat(k)})</span></span>`).join(' · '); }
function bindBag(root, mode) { const g = root.querySelector('[data-bag]'); if (!g) return; paint(g, 'data-i', S.me.inv); g.querySelectorAll('.cell[data-i]').forEach(c => c.onclick = e => { e.stopPropagation(); invClick(+c.dataset.i, e, mode); }); }
const bagH = (mode, cols = 9, size = CS) => `<div data-bag="${mode}">${gridH(S.me.inv, 36, cols, '', 'data-i', size, mode === 'trade' && S.trade ? i => S.trade.myIdx.includes(i) : null)}</div>`;

// ═══════ 패널 렌더 ═══════
function renderPanel() {
  const P = S.panel; if (!P || !S.me) return; const me = S.me; const d = P.data || {};
  const body = $('pbody'); const T = (i, t, extra = '') => { $('ptitle').innerHTML = ic(i) + `<span>${esc(t)}</span>` + extra; };
  hideTip();
  let h = '';
  switch (P.kind) {
    case 'inv': {
      T('bag', '가방과 장비', `<div style="flex:1"></div>${coinH(me.coins)}`);
      const order = ['helmet', null, 'weapon', 'gloves', 'armor', 'shield', null, 'boots', null];
      let eq = '<div class="grid" style="grid-template-columns:repeat(3,46px)">';
      order.forEach(s => { if (!s) { eq += '<div></div>'; return; } const it = me.eq[s]; eq += it ? `<div class="cell r${it.rar}" style="width:46px;height:46px" data-eq="${s}"><canvas width="22" height="22" data-ic="eq:${s}" style="width:38px;height:38px"></canvas>${it.plus ? `<span class="pl">+${it.plus}</span>` : ''}</div>` : `<div class="cell empty" style="width:46px;height:46px"><span class="lb">${GD.SLOT_NAME[s]}</span></div>`; });
      eq += '</div>';
      const st = me.st;
      h = `<div class="col" style="width:150px">${eq}<div class="box stat"><span>체력</span><b>${st.maxHp}</b><span>마나</span><b>${st.maxMp}</b><span>공격력</span><b>${st.atk}</b><span>방어력</span><b>${st.def}</b><span>치명타</span><b>${st.crit}%</b><span>행운</span><b>${st.luck}%</b></div></div>
        <div class="col" style="flex:1">${bagH('inv', 10, 38)}<div class="mut">${me.inv.length}/36칸 · Lv${me.lv} ${GD.JOBS[me.job].name} · 처치 ${fmt(me.kills || 0)} · 아이템을 눌러 착용/사용. 다른 직업 장비는 교환하세요.</div></div>`;
      body.innerHTML = h; bindBag(body, 'inv');
      body.querySelectorAll('canvas[data-ic^="eq:"]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon(me.eq[c.dataset.ic.slice(3)]), 0, 0); });
      body.querySelectorAll('[data-eq]').forEach(c => c.onclick = e => { e.stopPropagation(); const it = me.eq[c.dataset.eq]; showTip(itemDesc(it) + `<div style="margin-top:6px"><button class="btn sm" data-a="uneq" data-s="${c.dataset.eq}">해제</button></div>`, e); });
      return;
    }
    case 'shop': {
      T('flask', d.npc || '잡화상');
      h = `<div class="col" style="flex:1"><div class="mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(strip(d.text))}</div><div class="grid" style="grid-template-columns:1fr 1fr;gap:5px">` +
        d.items.map(it => `<div class="card" style="flex-direction:row;align-items:center;gap:6px;padding:5px"><div class="icn">${iconCanvas({ k: 'use', id: it.id })}</div><div style="flex:1;min-width:0"><div class="nm">${it.name}</div><small>${it.desc}</small><div>${coinH(it.price)}</div></div><div class="col" style="gap:3px"><button class="btn sm" data-buy="${it.id}" data-n="1">1개</button><button class="btn sm" data-buy="${it.id}" data-n="10">10개</button></div></div>`).join('') +
        `</div></div><div class="col"><div class="lbl">판매 — 아이템을 누르세요</div>${bagH('shop', 9, 34)}<div class="row">${coinH(me.coins)}</div></div>`;
      body.innerHTML = h; paintOne(body); bindBag(body, 'shop');
      body.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => send({ t: 'buy', id: b.dataset.buy, n: +b.dataset.n }));
      return;
    }
    case 'gear': {
      T('sword', d.npc || '장비상', `<div style="flex:1"></div>${coinH(me.coins)}`);
      const lvs = [...new Set(d.items.map(i => i.lvl))]; S.gearLv = lvs.includes(S.gearLv) ? S.gearLv : lvs[0];
      const list = d.items.filter(i => i.lvl === S.gearLv);
      h = `<div class="col" style="flex:1"><div class="tabs">${lvs.map(l => `<div class="tab ${l === S.gearLv ? 'on' : ''}" data-glv="${l}">${l}등급</div>`).join('')}<div class="mut" style="margin-left:8px;align-self:center">상점 장비는 옵션이 낮아요. 좋은 옵션은 몬스터가 떨어뜨립니다.</div></div>
        <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:6px">` + list.map(it => `<div class="card"><div class="row"><div class="icn">${iconCanvas(it)}</div><div style="min-width:0"><div class="nm">${esc(it.name)}</div><small>${GD.SLOT_NAME[it.slot]}</small></div></div><small>${Object.entries(it.st).map(([k, v]) => GD.OPT_NAME[k] + ' +' + v).join(' · ')}</small><div class="row">${coinH(it.price)}<div style="flex:1"></div><button class="btn sm pri" data-gb="${it.lvl}|${it.slot}|${it.wt || ''}" ${me.coins < it.price ? 'disabled' : ''}>구매</button></div></div>`).join('') + `</div></div>`;
      body.innerHTML = h; paintOne(body);
      body.querySelectorAll('[data-glv]').forEach(t => t.onclick = () => { S.gearLv = +t.dataset.glv; renderPanel(); });
      body.querySelectorAll('[data-gb]').forEach(b => b.onclick = () => { const [lv, slot, wt] = b.dataset.gb.split('|'); send({ t: 'buy', lv: +lv, slot, wt }); });
      return;
    }
    case 'smith': {
      T('hammer', d.npc || '대장간', `<div style="flex:1"></div>${coinH(me.coins)}`);
      const items = [...GD.SLOTS.filter(s => me.eq[s]).map(s => ({ it: me.eq[s], ref: { eq: s } })), ...me.inv.map((it, i) => ({ it, ref: { i } })).filter(o => o.it.k === 'gear')];
      if (!S.smithSel || !items.some(o => JSON.stringify(o.ref) === JSON.stringify(S.smithSel))) S.smithSel = items[0] && items[0].ref;
      const sel = items.find(o => JSON.stringify(o.ref) === JSON.stringify(S.smithSel));
      let g = '<div class="grid" style="grid-template-columns:repeat(8,38px)">';
      items.slice(0, 32).forEach((o, k) => { const on = o === sel; g += `<div class="cell r${o.it.rar} ${on ? 'sel' : ''}" style="width:38px;height:38px" data-sm="${k}"><canvas width="22" height="22" data-sm-ic="${k}"></canvas>${o.it.plus ? `<span class="pl">+${o.it.plus}</span>` : ''}${o.ref.eq ? '<span class="n" style="color:#60a5fa">E</span>' : ''}</div>`; });
      g += '</div>';
      let right = '<div class="box txt">강화할 장비가 없습니다.</div>';
      if (sel) {
        const it = sel.it, c = GD.upgradeCost(it), have = haveMat(c.mat), p = it.plus || 0;
        const cur = Object.assign({}, it.st), nx = Object.assign({}, it.st);
        if (cur.atk) { cur.atk = Math.round(cur.atk * (1 + 0.1 * p) + p * 2); nx.atk = Math.round(nx.atk * (1 + 0.1 * (p + 1)) + (p + 1) * 2); }
        if (cur.def) { cur.def = Math.round(cur.def * (1 + 0.1 * p) + p); nx.def = Math.round(nx.def * (1 + 0.1 * (p + 1)) + p + 1); }
        right = `<div class="card" style="flex:1"><div class="row"><div class="icn" style="width:40px;height:40px">${iconCanvas(it, 34)}</div><div><div class="nm" style="color:${GD.RARITY[it.rar].c}">${esc(it.name)} ${p ? '+' + p : ''}</div><small>${it.lvl}등급 · ${GD.SLOT_NAME[it.slot]}</small></div></div>
          ${p >= 10 ? '<div class="yl">최대 강화(+10) 완료</div>' : `<div class="stat" style="grid-template-columns:auto auto auto">${['atk', 'def'].filter(k => cur[k]).map(k => `<span>${GD.OPT_NAME[k]}</span><b>${cur[k]}</b><b class="gl">→ ${nx[k]}</b>`).join('')}</div>
          <div>필요: <span class="${have >= c.n ? 'gl' : 'rl'}">${c.mat} ${c.n}개 (보유 ${have})</span> + ${coinH(c.coin)}</div>
          <div class="row"><span>성공률 <b class="yl" style="font-size:16px">${GD.UPG_RATE[p]}%</b></span><div style="flex:1"></div><button class="btn pri" id="doupg" style="width:120px">${ic('hammer')}강화 +${p + 1}</button></div>`}</div>`;
      }
      h = `<div class="col" style="width:330px">${g}</div><div class="col" style="flex:1">${right}<div class="box txt mut" style="font-size:10px">강화 재료는 사냥으로 얻어요 · 철광석: 1~15등급 · 은광석: 16~30등급 · 마력석: 31~45등급 · 용의비늘: 46~50등급 · 실패해도 장비는 무사합니다</div></div>`;
      body.innerHTML = h; paintOne(body);
      body.querySelectorAll('canvas[data-sm-ic]').forEach(cv => { const o = items[+cv.dataset.smIc]; const gg = cv.getContext('2d'); gg.imageSmoothingEnabled = false; gg.drawImage(itemIcon(o.it), 0, 0); });
      body.querySelectorAll('[data-sm]').forEach(c => c.onclick = () => { S.smithSel = items[+c.dataset.sm].ref; renderPanel(); });
      if ($('doupg')) $('doupg').onclick = () => send(Object.assign({ t: 'upgrade' }, S.smithSel));
      return;
    }
    case 'stable': {
      T('horse', d.npc || '마구간', `<div style="flex:1"></div>${coinH(me.coins)}`);
      h = `<div class="col" style="flex:1"><div class="mut">탈것은 비싸지만 평생 함께합니다. R키(데스크톱) 또는 메뉴의 탈것 버튼으로 타고 내려요.</div><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:8px;flex:1">` +
        Object.entries(GD.MOUNTS).map(([id, mt]) => { const own = me.mounts.includes(id); return `<div class="card" style="align-items:center;text-align:center"><canvas width="56" height="80" data-mt="${id}" style="width:84px;height:120px"></canvas><div class="nm">${mt.name}</div><small>이동속도 x${mt.spd}</small>${coinH(mt.price)}${own ? `<button class="btn sm pri" data-ride="${id}" style="width:100%">${ic('check')}타기</button>` : `<button class="btn sm" data-bm="${id}" style="width:100%" ${me.coins < mt.price ? 'disabled' : ''}>구매</button>`}</div>`; }).join('') + '</div></div>';
      body.innerHTML = h;
      body.querySelectorAll('[data-mt]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(charSprite({ job: me.job, g: me.gender, h: me.hair, hc: me.hairColor, sk: me.skin, eq: {}, mt: c.dataset.mt }, 2, 0), 0, 0); });
      body.querySelectorAll('[data-ride]').forEach(b => b.onclick = () => send({ t: 'setMount', id: b.dataset.ride }));
      body.querySelectorAll('[data-bm]').forEach(b => b.onclick = () => uiAsk(`${GD.MOUNTS[b.dataset.bm].name}을(를) ${fmt(GD.MOUNTS[b.dataset.bm].price)}코인에 구매할까요?`, () => send({ t: 'buy', id: b.dataset.bm })));
      return;
    }
    case 'master': {
      T('crown', d.npc || '전직관');
      h = `<div class="col" style="flex:1"><div class="box txt">${esc(strip(d.text))}</div><div class="grid" style="grid-template-columns:1fr 1fr;gap:10px;flex:1">` +
        d.opts.map(o => `<div class="card" style="padding:12px"><div class="nm" style="font-size:16px;color:#c4b5fd">${o.name}</div><small style="font-size:11px">${o.desc}</small><div class="mut">전용 스킬</div><div class="row" style="flex-wrap:wrap">${o.skills.map(s => `<span class="tab">${ic('zap')}&nbsp;${s}</span>`).join('')}</div><div style="flex:1"></div>${d.can ? `<button class="btn pri" data-pro="${o.id}">${ic('star')}전직하기</button>` : `<div class="mut">Lv${GD.PROMO_LEVEL}에 전직 가능</div>`}</div>`).join('') + '</div></div>';
      body.innerHTML = h;
      body.querySelectorAll('[data-pro]').forEach(b => b.onclick = () => uiAsk(`[${GD.JOBS[b.dataset.pro].name}](으)로 전직합니다. 되돌릴 수 없습니다.`, () => send({ t: 'promote', id: b.dataset.pro })));
      return;
    }
    case 'guide': case 'talk': {
      T('talk', d.npc || '안내');
      const text = d.kind === 'guide' || P.kind === 'guide' ? `조작 (PC)\n이동: 방향키/WASD   공격: 스페이스   스킬: 1~6\n물약: 7 체력 / 8 마나 / 9 보라 / 0 노랑\nE: 대화·가구   Z: 줍기   R: 탈것   B: 집짓기\nI: 가방   M: 지도   K: 스킬   Tab: 대상   Enter: 채팅\n\n폰: 왼쪽 방향키, 오른쪽 공격·스킬 버튼\n다른 플레이어를 누르면 교환 신청\n\n밤이 되면 몬스터가 늘고 돌연변이가 나와요.\n지치면 재료로 텐트를 지어 쉬세요!` : strip(d.text);
      h = `<div class="col" style="flex:1"><div class="box txt" style="flex:1">${esc(text)}</div></div>` + (d.bosses ? `<div class="col" style="width:330px"><div class="lbl">보스 출현 시간</div>${bossRows(d.bosses)}</div>` : '');
      body.innerHTML = h; return;
    }
    case 'boss': {
      T('skull', '보스 출현 시간표', `<div style="flex:1"></div><span class="mut">협력한 모두에게 직업별 보스 전용 장비</span>`);
      const L = S.bossList || [];
      h = `<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:6px;flex:1;align-content:start">` + L.map(b => `<div class="card" style="flex-direction:row;align-items:center;gap:8px"><canvas width="40" height="40" data-bm2="${b.name}" style="width:40px;height:40px;background:var(--bg3);border-radius:3px"></canvas><div style="flex:1;min-width:0"><div class="nm">${b.name} <span class="mut">Lv${b.lv}</span></div><small>${b.where}</small><div>${b.alive ? '<b class="rl">출현 중!</b>' : `<span class="yl">${Math.max(0, Math.ceil(b.inMin))}분 후</span>`}</div></div></div>`).join('') + '</div>';
      body.innerHTML = h; paintBossFaces(body); return;
    }
    case 'chest': {
      T('bag', '보관상자');
      h = `<div class="col"><div class="lbl">보관상자 (눌러서 꺼내기)</div><div data-store>${gridH(me.storage, 24, 8, '', 'data-s', 38)}</div></div><div class="col" style="flex:1"><div class="lbl">가방 (눌러서 넣기)</div>${bagH('chest', 9, 38)}</div>`;
      body.innerHTML = h; bindBag(body, 'chest');
      const g = body.querySelector('[data-store]'); paint(g, 'data-s', me.storage);
      g.querySelectorAll('.cell[data-s]').forEach(c => c.onclick = e => { e.stopPropagation(); const it = me.storage[+c.dataset.s]; showTip(itemDesc(it) + `<div style="margin-top:6px"><button class="btn sm" data-a="take" data-i="${c.dataset.s}">꺼내기</button></div>`, e); });
      return;
    }
    case 'cook': {
      T('flame', d.at === 'campfire' ? '모닥불 요리' : '조리대 요리');
      h = `<div class="col" style="flex:1"><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px">` + d.recipes.map(r => `<div class="card" style="padding:10px"><div class="row"><div class="icn" style="width:40px;height:40px">${iconCanvas({ k: 'use', id: r.id }, 34)}</div><div class="nm">${r.name}</div></div><small>${r.desc}</small><small>${needH(r.need)}</small><button class="btn pri" data-cook="${r.id}">${ic('flame')}요리하기</button></div>`).join('') + `</div><div class="mut">요리한 음식은 체력 회복 버튼으로 먹거나, 다른 플레이어와 교환할 수 있어요.</div></div>`;
      body.innerHTML = h; paintOne(body);
      body.querySelectorAll('[data-cook]').forEach(b => b.onclick = () => send({ t: 'cook', id: b.dataset.cook }));
      return;
    }
    case 'plot': {
      T('home', `${d.town} 공터`);
      let act = '';
      if (!d.owner) act = d.myPlot ? '<div class="mut">이미 다른 땅을 갖고 있어요 (1인 1채).</div>' : `<button class="btn pri" data-plot="buy" ${me.coins < d.price ? 'disabled' : ''}>${ic('coin')}땅 구입 ${fmt(d.price)}</button>`;
      else if (d.mine) act = (!d.hasHouse ? `<div>집 재료: ${needH(d.cost)}</div><button class="btn pri" data-plot="build">${ic('home')}집 짓기</button>` : `<button class="btn pri" data-plot="deco">${ic('bed')}집 꾸미기</button>`) + `<button class="btn red sm" data-plot="sell">땅 팔기 (절반 환불)</button>`;
      h = `<div class="col" style="flex:1"><div class="box txt" style="flex:1">${esc(strip(d.text))}</div></div><div class="col" style="width:300px;justify-content:center">${act}</div>`;
      body.innerHTML = h;
      body.querySelectorAll('[data-plot]').forEach(b => b.onclick = () => { const a = b.dataset.plot; if (a === 'buy') send({ t: 'plotBuy' }); if (a === 'build') send({ t: 'houseBuild' }); if (a === 'deco') openBuild('house'); if (a === 'sell') uiAsk('땅과 집을 팔까요? (가구는 사라집니다)', () => send({ t: 'plotSell' })); });
      return;
    }
    case 'trade': {
      const tr = S.trade; if (!tr) return;
      T('swap', `교환 — ${tr.with}`);
      const side = (v, mine) => `<div class="col box" style="width:200px;${v.lock ? 'outline:2px solid var(--acc)' : ''}"><div class="row"><b>${mine ? '내 제안' : esc(tr.with)}</b><div style="flex:1"></div>${v.ok ? `<span class="gl">${ic('check')}</span>` : v.lock ? `<span class="yl">${ic('lock')}</span>` : ''}</div><div data-tg="${mine ? 'm' : 't'}">${gridH(v.items, 10, 5, '', 'data-t', 34)}</div><div class="row">${ic('coin')}${mine ? `<input type="number" id="tcoin" value="${v.coins}" min="0" style="width:110px;height:26px" ${v.lock ? 'disabled' : ''}>` : `<b class="yl">${fmt(v.coins)}</b>`}</div></div>`;
      h = `<div class="col">${side(tr.mine, 1)}</div><div class="col">${side(tr.theirs, 0)}<div class="row"><button class="btn" data-tr="lock" ${tr.mine.lock ? 'disabled' : ''}>${ic('lock')}확정</button><button class="btn pri" data-tr="ok" ${!(tr.mine.lock && tr.theirs.lock) || tr.mine.ok ? 'disabled' : ''}>${ic('check')}교환</button><button class="btn red" data-tr="cancel">취소</button></div></div><div class="col" style="flex:1"><div class="lbl">내 가방 — 눌러서 올리기</div>${bagH('trade', 9, 32)}</div>`;
      body.innerHTML = h; bindBag(body, 'trade');
      ['m', 't'].forEach(k => { const g = body.querySelector(`[data-tg="${k}"]`); const list = k === 'm' ? tr.mine.items : tr.theirs.items; paint(g, 'data-t', list); g.querySelectorAll('.cell[data-t]').forEach(c => c.onclick = e => { e.stopPropagation(); showTip(itemDesc(list[+c.dataset.t]), e); }); });
      const tc = $('tcoin'); if (tc) tc.onchange = () => send({ t: 'tradeCoin', n: +tc.value });
      body.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => { const a = b.dataset.tr; if (a === 'cancel') send({ t: 'tradeCancel' }); else send({ t: a === 'lock' ? 'tradeLock' : 'tradeOk' }); });
      return;
    }
    case 'skills': {
      T('book', `스킬 — ${GD.JOBS[me.job].name}`, `<div style="flex:1"></div><span class="mut">${GD.JOBS[me.job].tier ? '' : `Lv${GD.PROMO_LEVEL} 전직 시 전용 스킬 3개 추가`}</span>`);
      const all = GD.skillsFor(me.job);
      h = `<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:6px;flex:1;align-content:start">` + all.map((s, i) => `<div class="card" style="opacity:${me.lv >= s.lv ? 1 : 0.45}"><div class="row"><span class="tab on" style="height:20px;padding:0 6px">${i + 1}</span><div class="nm">${s.name}</div><div style="flex:1"></div>${me.lv >= s.lv ? '' : ic('lock')}</div><small>Lv${s.lv} · MP ${s.mp || 0} · ${(s.cd / 1000).toFixed(1)}초</small><small>${s.desc}</small></div>`).join('') + '</div>';
      body.innerHTML = h; return;
    }
    case 'map': { T('map', '바람의 대륙 지도', `<div style="flex:1"></div><span class="mut"><span style="color:#22c55e">■</span> 적정 <span style="color:#eab308">■</span> 도전 <span style="color:#ef4444">■</span> 위험 <span style="color:#9a9a9a">■</span> 쉬움</span>`); renderAtlas(body); return; }
    case 'build': { renderBuild(body, T); return; }
  }
}
function bossRows(list) { return '<div class="col" style="gap:2px">' + list.map(b => `<div class="row box" style="padding:3px 7px"><span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><b>${b.name}</b> <span class="mut">${b.where}</span></span>${b.alive ? '<b class="rl">출현 중</b>' : `<span class="yl">${Math.max(0, Math.ceil(b.inMin))}분</span>`}</div>`).join('') + '</div>'; }
function paintBossFaces(root) {
  const byName = {}; for (const k in GD.MONS) byName[GD.MONS[k].name] = k;
  root.querySelectorAll('canvas[data-bm2]').forEach(c => { const key = byName[c.dataset.bm2]; if (!key) return; const img = monSprite(key, false, 0, false); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const s = Math.min(38 / img.width, 38 / img.height); g.drawImage(img, (40 - img.width * s) / 2, 40 - img.height * s, img.width * s, img.height * s); });
}
function bossTable(list) { return bossRows(list); }

// ── 집짓기 ──
function openBuild(s) { openPanel('build', { s: s || (S.me.house && S.map && S.me.house.map === S.map.id && Math.abs(S.me.house.x + 4 - pos.x) < 10 && Math.abs(S.me.house.y + 3 - pos.y) < 8 ? 'house' : 'tent') }); }
function renderBuild(body, T) {
  const me = S.me; const s = S.panel.data.s;
  T('tent', '집짓기', `<div style="flex:1"></div><div class="tabs"><div class="tab ${s === 'tent' ? 'on' : ''}" data-bt="tent">텐트 (야외)</div><div class="tab ${s === 'house' ? 'on' : ''}" data-bt="house">마을 집</div></div>`);
  const mats = ['나무', '돌', '양털', '솜', '횃불', '고기'].map(k => `${k} <b>${haveMat(k)}</b>`).join(' · ');
  const have = s === 'tent' ? me.tent : me.house;
  let top = s === 'tent'
    ? `<div class="row"><button class="btn pri" data-bb="tent">${ic('tent')}${me.tent ? '여기로 텐트 옮기기' : '여기에 텐트 짓기'}</button><span>${needH(GD.TENT_COST)}</span><div style="flex:1"></div>${me.tent ? `<button class="btn red sm" data-bb="tentDel">${ic('trash')}텐트 철거</button>` : ''}</div><div class="mut">내 위치가 텐트 문이 되고 위쪽으로 9x7칸이 필요해요. 텐트 안은 몬스터가 못 들어오는 안전지대!</div>`
    : `<div class="mut">${me.house ? '집 안 칸을 눌러 가구를 놓으세요. 창문·문·그림은 벽에 설치합니다.' : '아직 집이 없어요. 마을 서쪽 주택가 공터 표지판에서 땅을 사고 집을 지으세요.'}</div>`;
  let grid = '';
  if (have) {
    const list = Object.entries(GD.FURNITURE).filter(([, f]) => s === 'house' || !f.house);
    grid = `<div class="grid" style="grid-template-columns:repeat(7,1fr);gap:5px">` + list.map(([k, f]) => `<div class="card" data-pf="${k}" style="align-items:center;text-align:center;padding:5px;cursor:pointer"><canvas width="32" height="32" data-fu="${k}" style="width:32px;height:32px"></canvas><div class="nm" style="font-size:11px">${f.name}</div><small style="font-size:9px">${needH(f.need)}</small></div>`).join('') + `</div><div class="row"><span class="mut">가구를 누른 뒤 ${s === 'house' ? '집' : '텐트'} 안의 칸을 누르세요.</span><div style="flex:1"></div><button class="btn red sm" data-pd="1">${ic('trash')}가구 철거 모드</button></div>`;
  }
  body.innerHTML = `<div class="col" style="flex:1"><div class="mut">보유 재료: ${mats}</div>${top}${grid}</div>`;
  body.querySelectorAll('[data-bt]').forEach(b => b.onclick = () => openPanel('build', { s: b.dataset.bt }));
  $('ptitle').querySelectorAll('[data-bt]').forEach(b => b.onclick = () => openPanel('build', { s: b.dataset.bt }));
  body.querySelectorAll('[data-bb]').forEach(b => b.onclick = () => { if (b.dataset.bb === 'tent') send({ t: 'build' }); else uiAsk('텐트를 철거할까요? (가구는 사라집니다)', () => send({ t: 'tentDel' })); });
  body.querySelectorAll('[data-fu]').forEach(c => drawFurn(c.getContext('2d'), c.dataset.fu, 0, 0, 0));
  body.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { if (!myStruct(s)) return log('지금 이 지역에 내 ' + (s === 'house' ? '집' : '텐트') + '이 없습니다.', '#f99'); S.place = { s, k: b.dataset.pf }; $('panel').classList.add('hidden'); S.panel = null; log('설치할 칸을 누르세요. 여러 개 연속 설치 가능, 빈 곳을 누르면 종료.', '#ffe08a'); });
  body.querySelectorAll('[data-pd]').forEach(b => b.onclick = () => { if (!myStruct(s)) return; S.place = { s, del: 1 }; $('panel').classList.add('hidden'); S.panel = null; });
}

// ── 지도 ──
function renderAtlas(body) {
  const A = S.atlas; const sel = atlasSel;
  body.innerHTML = `<div class="col"><canvas id="atc" width="480" height="480" style="width:270px;height:270px;border-radius:4px;cursor:pointer"></canvas></div><div class="col" style="flex:1" id="atinfo"></div>`;
  const c = $('atc'), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  if (atlasBase) g.drawImage(atlasBase, 0, 0, 480, 480);
  g.textAlign = 'center';
  const label = (t, x, y, col, size = 12) => { g.font = `bold ${size}px Pretendard, sans-serif`; g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y); };
  const mark = (x, y, col, kind) => { g.fillStyle = '#000'; g.fillRect(x - 8, y - 8, 16, 16); g.fillStyle = col; if (kind === 'cave') { g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 6, y + 5); g.lineTo(x - 6, y + 5); g.fill(); } else if (kind === 'castle') { g.fillRect(x - 6, y - 2, 12, 8); g.fillRect(x - 6, y - 6, 3, 4); g.fillRect(x - 1, y - 6, 3, 4); g.fillRect(x + 4, y - 6, 3, 4); } else if (kind === 'boss') { g.fillStyle = '#ef4444'; g.fillRect(x - 6, y - 6, 12, 12); g.fillStyle = '#fff'; g.fillRect(x - 3, y - 3, 2, 2); g.fillRect(x + 1, y - 3, 2, 2); } else { g.fillRect(x - 6, y - 1, 12, 7); g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x, y - 7); g.lineTo(x + 7, y); g.fill(); } };
  for (const z of A.zones) { const [a] = lvRange(z.lv); const col = diffColor(a); g.fillStyle = col + '33'; g.fillRect(z.x0 * 2, z.y0 * 2, (z.x1 - z.x0) * 2, (z.y1 - z.y0) * 2); g.strokeStyle = col; g.lineWidth = sel && sel.z === z ? 4 : 1; g.strokeRect(z.x0 * 2, z.y0 * 2, (z.x1 - z.x0) * 2, (z.y1 - z.y0) * 2); }
  for (const z of A.zones) { const [a] = lvRange(z.lv); label(`${z.name} ${z.lv}`, z.x0 + z.x1, z.y0 + z.y1, diffColor(a), 13); }
  for (const d of A.dungeons) { const [a] = lvRange(d.lv); mark(d.x * 2, d.y * 2, diffColor(a), d.type); label(d.name, d.x * 2, d.y * 2 - 13, '#fff', 13); }
  for (const b of A.fieldBosses) mark(b.x * 2, b.y * 2, '#ef4444', 'boss');
  for (const t of A.towns) { mark(t.x * 2, t.y * 2, '#fbbf24', 'town'); label(t.name, t.x * 2, t.y * 2 + 22, '#fbbf24', 14); }
  let mx = pos.x, my = pos.y; if (S.map.id !== 'world') { const dg = A.dungeons.find(d => d.name === DG_ID[S.map.id.replace(/\d+$/, '')]); if (dg) { mx = dg.x; my = dg.y; } }
  g.fillStyle = '#fff'; g.fillRect(mx * 2 - 6, my * 2 - 6, 12, 12); g.fillStyle = '#3b82f6'; g.fillRect(mx * 2 - 4, my * 2 - 4, 8, 8);
  c.onclick = e => {
    const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 240, y = (e.clientY - r.top) / r.height * 240;
    let s = null;
    for (const b of A.fieldBosses) if (Math.hypot(b.x - x, b.y - y) < 7) s = { b };
    if (!s) for (const d of A.dungeons) if (Math.hypot(d.x - x, d.y - y) < 9) s = { d, f: 0 };
    if (!s) for (const z of A.zones) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) s = { z };
    atlasSel = s; renderPanel();
  };
  const info = $('atinfo');
  const monCard = key => {
    const d = GD.MONS[key]; const lv = d.lv;
    let dr;
    if (d.boss) { const L = GD.BOSS_LOOT[key]; dr = [`<span class="yl">보스 전용 [${L.set}] 장비</span> — ${L.desc}`, `${L.slots.map(s => GD.SLOT_NAME[s]).join('/')} · 협력한 모두에게 직업별 1개`, `무작위 장비 2~4개 · ${GD.oreFor(lv)}${lv >= 30 ? ' · 용의비늘' : ''}`]; }
    else { dr = [`장비 Lv${Math.max(1, lv - 2)}~${Math.min(50, lv + 2)} (무작위 직업, 약 4%)`, `${GD.oreFor(lv)} 7.5%${lv >= 45 ? ' · 용의비늘 4%' : ''}`]; if (d.mats) dr.push(`재료: ${[...new Set(d.mats)].join(', ')}${d.meat ? ', 고기' : ''}`); }
    return `<div class="card" style="flex-direction:row;gap:7px"><canvas width="40" height="40" data-mon="${key}" style="width:40px;height:40px;background:var(--bg3);border-radius:3px;flex:0 0 40px"></canvas><div style="min-width:0"><div class="nm" style="${d.boss ? 'color:#f87171' : ''}">${d.name} <span class="mut">Lv${lv}${d.p ? ' 비선공' : ''}${d.rng ? ' 원거리' : ''}</span></div><small>${dr.join('<br>')}</small><small class="yl">코인 항상</small></div></div>`;
  };
  if (!sel) {
    const rec = [...A.zones.map(z => ({ n: z.name, lv: z.lv })), ...A.dungeons.map(d => ({ n: d.name, lv: d.lv }))].sort((a, b) => lvRange(a.lv)[0] - lvRange(b.lv)[0]);
    info.innerHTML = `<div class="box txt">지도에서 사냥터·던전·보스를 누르면 몬스터와 드랍 아이템을 볼 수 있어요. 내 레벨 ${S.me.lv} / ${GD.MAX_LEVEL}\n일반 몬스터는 직업 무관 무작위 장비 → 교환으로 해결 · 보스는 협력한 모두에게 직업별 전용 장비</div><div class="lbl">추천 사냥터</div><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:2px 8px">${rec.map(o => `<div style="color:${diffColor(lvRange(o.lv)[0])};font-size:11px;white-space:nowrap">${o.n} <span class="mut">Lv${o.lv}</span></div>`).join('')}</div>`;
  } else if (sel.z) {
    info.innerHTML = `<div class="lbl" style="font-size:13px;color:#fff">${sel.z.name} <span class="mut">Lv${sel.z.lv}</span></div><div class="grid" style="grid-template-columns:1fr 1fr;gap:5px">${sel.z.mons.map(monCard).join('')}</div>`;
  } else if (sel.d) {
    const d = sel.d; const tabs = d.floors.map((_, i) => `<div class="tab ${sel.f === i ? 'on' : ''}" data-fl="${i}">${i + 1}층</div>`).join('') + `<div class="tab ${sel.f === -1 ? 'on' : ''}" data-fl="-1">보스</div>`;
    const content = sel.f === -1 ? `<div class="mut">${d.floors.length}층 · ${minutesStr(d.every, d.off)} 출현</div><div class="grid" style="grid-template-columns:1fr;gap:5px">${monCard(d.boss)}</div>` : `<div class="grid" style="grid-template-columns:1fr 1fr;gap:5px">${d.floors[sel.f].map(monCard).join('')}</div>`;
    info.innerHTML = `<div class="row"><span class="lbl" style="font-size:13px;color:#fff">${d.name} <span class="mut">Lv${d.lv}</span></span><div style="flex:1"></div><div class="tabs">${tabs}</div></div>${content}`;
    info.querySelectorAll('[data-fl]').forEach(t => t.onclick = () => { atlasSel = Object.assign({}, sel, { f: +t.dataset.fl }); renderPanel(); });
  } else if (sel.b) {
    info.innerHTML = `<div class="lbl" style="font-size:13px;color:#fff">필드 보스 — ${sel.b.where}</div><div class="mut">${minutesStr(sel.b.every, sel.b.off)} 출현</div>${monCard(sel.b.mon)}`;
  }
  info.querySelectorAll('canvas[data-mon]').forEach(cc => { const img = monSprite(cc.dataset.mon, false, 0, false); const gg = cc.getContext('2d'); gg.imageSmoothingEnabled = false; const s = Math.min(38 / img.width, 38 / img.height); gg.drawImage(img, (40 - img.width * s) / 2, 40 - img.height * s, img.width * s, img.height * s); });
}
// 배치 모드: 구조물 밖을 누르면 종료 (ESC 대신)

// ═══════════════════════════════════════════
//  v3: 말풍선 · 퀵슬롯 창 · 아이콘 스킬 · NPC 전체화면 분할
// ═══════════════════════════════════════════
// ── 채팅 = 머리 위 말풍선 (로그에 남기지 않음) ──
const _onMsg2 = onMsg;
onMsg = function (m) {
  if (m.t === 'chat') { S.bubbles.set(m.id, { text: String(m.text), until: performance.now() + 6000 }); return; }
  return _onMsg2(m);
};
function drawBubble(id, x, y, now) {
  const b = S.bubbles.get(id); if (!b) return; if (now > b.until) { S.bubbles.delete(id); return; }
  const tileTop = y + 30; const bottom = tileTop - 24; // 머리 위 체력바 바로 위
  ctx.font = '600 12px Pretendard, sans-serif';
  const words = [...b.text]; const lines = []; let cur = '';
  for (const ch of words) { if (ctx.measureText(cur + ch).width > 150) { lines.push(cur); cur = ch; if (lines.length >= 3) break; } else cur += ch; }
  if (lines.length < 3 && cur) lines.push(cur);
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 14, h = lines.length * 15 + 8;
  const left = x - w / 2, top = bottom - h - 6;
  ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.strokeStyle = '#1c2026'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.rect(left, top, w, h); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 5, top + h); ctx.lineTo(x, top + h + 6); ctx.lineTo(x + 5, top + h); ctx.fill(); ctx.stroke();
  ctx.fillRect(x - 4, top + h - 2, 8, 3);
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, x, top + 5 + i * 15)); ctx.textBaseline = 'alphabetic';
}

// ── 스킬/공격 아이콘 ──
function skillIcon(sk) {
  if (!sk) return 'lock';
  const base = sk.jobs[0];
  switch (sk.kind) {
    case 'melee': return 'sword'; case 'aoeSelf': case 'taunt': return 'target'; case 'buff': case 'partyBuff': return 'star';
    case 'proj': return base === 'healer' ? 'bow' : 'flame'; case 'multi': return 'zap'; case 'aoeTarget': return sk.fx === 'ice' ? 'drop' : sk.fx === 'rain' ? 'bow' : 'flame';
    case 'line': return 'bow'; case 'heal': return 'heart'; case 'summon': return 'users';
  }
  return 'zap';
}
function buildTouch() {
  const dp = $('dpad');
  dp.innerHTML = `<div data-d="3" style="left:46px;top:0">${ic('up')}</div><div data-d="1" style="left:0;top:46px">${ic('left')}</div><div data-d="2" style="left:92px;top:46px">${ic('right')}</div><div data-d="0" style="left:46px;top:92px">${ic('down')}</div>`;
  const setD = e => { const r = dp.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * 136 - 68, y = (e.clientY - r.top) / r.height * 136 - 68; if (Math.hypot(x, y) < 10) { touchDir = -1; return; } touchDir = Math.abs(x) > Math.abs(y) ? (x > 0 ? 2 : 1) : (y > 0 ? 0 : 3); };
  dp.onpointerdown = e => { dp.setPointerCapture(e.pointerId); setD(e); e.preventDefault(); };
  dp.onpointermove = e => { if (e.buttons || e.pressure) setD(e); };
  dp.onpointerup = dp.onpointercancel = () => { touchDir = -1; };
  const acts = $('acts'); acts.innerHTML = '<div id="skillgrid"></div>'; S.touchCd = []; S.touchBtns = null; S._skKey = '';
  const g = $('skillgrid');
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div'); d.className = 'tb'; d.innerHTML = `<span class="kn">${i + 1}</span><span class="si">${ic('lock')}</span><div class="cdm"></div>`;
    d.addEventListener('pointerdown', e => { e.preventDefault(); castSkill(i); });
    g.appendChild(d); S.touchCd[i] = d;
  }
  const atk = document.createElement('div'); atk.className = 'tb atk'; atk.innerHTML = ic('sword');
  atk.addEventListener('pointerdown', e => { e.preventDefault(); touchAtk = true; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => atk.addEventListener(ev, () => touchAtk = false));
  acts.appendChild(atk);
  renderQS(true);
}

// ── 퀵슬롯 창 (소모품 등록 → 터치 사용) ──
const QN = 5;
function hotList() { const h = (S.me && Array.isArray(S.me.hot)) ? S.me.hot.slice(0, QN) : ['hp1', 'mp1']; while (h.length < QN) h.push(null); return h; }
function useCount(id) { return S.me ? S.me.inv.filter(o => o.k === 'use' && o.id === id).reduce((a, o) => a + o.n, 0) : 0; }
function renderQS(force) {
  if (!S.me) return; const hot = hotList();
  const key = JSON.stringify(hot.map(id => id ? id + useCount(id) : '-'));
  if (!force && key === S._qsKey) return; S._qsKey = key;
  const q = $('qs');
  q.innerHTML = hot.map((id, i) => id ? `<div class="qsl ${useCount(id) ? '' : 'zero'}" data-q="${i}" title="${GD.CONSUMES[id].name}"><span class="k">${[7, 8, 9, 0, '-'][i]}</span><canvas width="22" height="22" data-qi="${id}"></canvas><span class="n">${useCount(id)}</span></div>` : `<div class="qsl empty" data-q="${i}" title="가방에서 소모품을 눌러 등록"><span class="k">${[7, 8, 9, 0, '-'][i]}</span>${ic('plus', 14)}</div>`).join('') +
    `<div class="qsdiv"></div><div class="qut" data-u="talk" title="대화">${ic('talk')}</div><div class="qut" data-u="grab" title="줍기">${ic('grab')}</div><div class="qut" data-u="target" title="대상">${ic('target')}</div><div class="qut" data-u="chat" title="채팅">${ic('chat')}</div>`;
  q.querySelectorAll('canvas[data-qi]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon({ k: 'use', id: c.dataset.qi }), 0, 0); });
  q.querySelectorAll('[data-q]').forEach(d => d.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); const id = hot[+d.dataset.q]; if (id) { if (useCount(id)) send({ t: 'useId', id }); else log(`${GD.CONSUMES[id].name}이(가) 없습니다.`, '#bbb'); } else { openPanel('inv'); log('가방에서 물약·음식을 눌러 [퀵슬롯 등록]을 하세요.', '#9fe8ff'); } });
  q.querySelectorAll('[data-u]').forEach(d => d.onpointerdown = e => { e.preventDefault(); const u = d.dataset.u; if (u === 'talk') send({ t: 'interact' }); if (u === 'grab') send({ t: 'pick' }); if (u === 'target') cycleTarget(); if (u === 'chat') { chatin.classList.remove('hidden'); chatin.focus(); } });
}
function setHot(i, id) { const h = hotList(); if (id) { const ex = h.indexOf(id); if (ex >= 0) h[ex] = null; } h[i] = id; S.me.hot = h; send({ t: 'hot', hot: h }); renderQS(true); }
function addHot(id) { const h = hotList(); if (h.includes(id)) return log('이미 퀵슬롯에 있어요.', '#bbb'); let i = h.indexOf(null); if (i < 0) i = QN - 1; setHot(i, id); log(`[${GD.CONSUMES[id].name}] 퀵슬롯 ${i + 1}번에 등록`, '#9fe8ff'); }
usePot = function (kind) { const idx = { hp: 0, mp: 1, buffAtk: 2, buffDef: 3 }[kind]; const id = hotList()[idx]; if (id && useCount(id)) send({ t: 'useId', id }); else if (id) log(`${GD.CONSUMES[id].name}이(가) 없습니다.`, '#bbb'); };

// ── HUD 보정 ──
const _rh2 = refreshHud;
refreshHud = function (full) {
  _rh2(full);
  if (!S.me) return;
  renderQS(full);
  if (S.touchCd) {
    const key = S.me.skills.join() + S.me.lv;
    if (key !== S._skKey) { S._skKey = key; S.touchCd.forEach((d, i) => { const sk = GD.SKILL[S.me.skills[i]]; d.querySelector('.si').innerHTML = ic(sk && S.me.lv >= sk.lv ? skillIcon(sk) : 'lock'); d.title = sk ? sk.name : ''; }); }
  }
};
showCode = function (code) {
  const d = document.createElement('div'); d.id = 'roomcode'; d.className = 'win'; d.innerHTML = `${ic('key')}방 코드 ${code}`; d.title = '눌러서 참가 링크 복사';
  d.onclick = () => { const url = location.href.split('#')[0] + '#' + code; try { navigator.clipboard.writeText(url).then(() => log('참가 링크를 복사했어요: ' + url, '#9fe8ff')); } catch (e) { log('참가 링크: ' + url, '#9fe8ff'); } };
  $('hud').appendChild(d);
};

// ── 가방 클릭 (모든 창 공통) ──
function sellPrice(it) { return it.k === 'gear' ? Math.floor((it.lvl * it.lvl * 4 + 30) * (1 + it.rar * 0.8) * (it.shop ? 0.5 : 1)) : it.k === 'use' ? Math.floor((GD.CONSUMES[it.id].price || 40) * 0.3) * it.n : 5 * it.n; }
function invClick(i, ev, mode) {
  const it = S.me.inv[i]; if (!it) return;
  let btns = '';
  if (mode === 'shop') btns = `<button class="btn sm pri" data-a="sell" data-i="${i}">${ic('coin')}판매 ${fmt(sellPrice(it))}</button>`;
  else if (mode === 'chest') btns = `<button class="btn sm pri" data-a="store" data-i="${i}">보관상자에 넣기</button>`;
  else if (mode === 'trade') btns = S.trade && S.trade.myIdx.includes(i) ? `<button class="btn sm red" data-a="untrade" data-i="${i}">교환에서 빼기</button>` : `<button class="btn sm pri" data-a="trade" data-i="${i}">${ic('swap')}교환에 올리기</button>`;
  else {
    if (it.k !== 'mat') btns += `<button class="btn sm pri" data-a="use" data-i="${i}">${it.k === 'gear' ? '착용' : '사용'}</button> `;
    if (it.k === 'use') btns += hotList().includes(it.id) ? `<button class="btn sm" data-qrm="${it.id}">퀵슬롯 해제</button> ` : `<button class="btn sm" data-qadd="${it.id}">${ic('plus')}퀵슬롯 등록</button> `;
    btns += `<button class="btn sm red" data-a="drop" data-i="${i}">${ic('trash')}</button>`;
  }
  showTip(itemDesc(it) + `<div class="row" style="margin-top:7px;flex-wrap:wrap">${btns}</div>`, ev);
}
$('tip').addEventListener('click', e => {
  const a = e.target.closest('[data-qadd],[data-qrm],[data-buy2],[data-gbuy]'); if (!a) return;
  if (a.dataset.qadd) addHot(a.dataset.qadd);
  if (a.dataset.qrm) { const h = hotList(); const i = h.indexOf(a.dataset.qrm); if (i >= 0) setHot(i, null); }
  if (a.dataset.buy2) send({ t: 'buy', id: a.dataset.buy2, n: +a.dataset.n });
  if (a.dataset.gbuy) { const [lv, slot, wt] = a.dataset.gbuy.split('|'); send({ t: 'buy', lv: +lv, slot, wt }); }
  hideTip();
});

// ── NPC 전체화면 (왼쪽 NPC · 오른쪽 내 가방) ──
const FULL = new Set(['shop', 'gear', 'smith', 'stable', 'master', 'guide', 'talk', 'chest', 'cook', 'plot', 'trade']);
const NPC_KIND_AP = { shop: 'shop', gear: 'gear', smith: 'smith', stable: 'stable', master: 'master', guide: 'guide', talk: 'guide' };
const _rp = renderPanel;
renderPanel = function () {
  const P = S.panel; if (!P || !S.me) return;
  const full = FULL.has(P.kind);
  $('panel').classList.toggle('full', full);
  if (!full) return _rp();
  hideTip(); renderNpc(P);
};
const _cp = closePanel; closePanel = function () { $('panel').classList.remove('full'); return _cp(); };
function npcHeadH(d, kind) {
  const say = strip(d.text || '');
  return `<div class="npchead">${NPC_KIND_AP[kind] ? `<canvas width="56" height="80" data-npcap="${NPC_KIND_AP[kind]}"></canvas>` : ''}<div class="say">${esc(say.split('\n').filter(Boolean).slice(0, 3).join(' '))}</div></div>`;
}
function bagColH(mode) {
  const me = S.me; const sel = S.smithSel;
  const eqr = GD.SLOTS.map(s => { const it = me.eq[s]; const on = mode === 'smith' && sel && sel.eq === s; return it ? `<div class="cell r${it.rar} ${on ? 'sel' : ''}" style="width:42px;height:42px" data-eqs="${s}" title="${GD.SLOT_NAME[s]}"><canvas width="22" height="22" data-ic="eqs:${s}" style="width:34px;height:34px"></canvas>${it.plus ? `<span class="pl">+${it.plus}</span>` : ''}</div>` : `<div class="cell empty" style="width:42px;height:42px"><span class="lb">${GD.SLOT_NAME[s]}</span></div>`; }).join('');
  let g = '<div class="grid" style="grid-template-columns:repeat(9,40px)">';
  for (let i = 0; i < 36; i++) { const it = me.inv[i]; const on = (mode === 'smith' && sel && sel.i === i) || (mode === 'trade' && S.trade && S.trade.myIdx.includes(i)); g += it ? `<div class="cell r${it.k === 'gear' ? it.rar : 0} ${on ? (mode === 'trade' ? 'off' : 'sel') : ''}" style="width:40px;height:40px" data-bi="${i}"><canvas width="22" height="22" data-ic="bi:${i}" style="width:32px;height:32px"></canvas>${it.k !== 'gear' && it.n > 1 ? `<span class="n">${it.n}</span>` : ''}${it.plus ? `<span class="pl">+${it.plus}</span>` : ''}</div>` : `<div class="cell empty" style="width:40px;height:40px"></div>`; }
  g += '</div>';
  const hint = { shop: '팔 아이템을 누르세요', smith: '강화할 장비를 누르세요', chest: '넣을 아이템을 누르세요', trade: '교환할 아이템을 누르세요' }[mode] || '아이템을 눌러 사용·착용';
  return `<div class="npcr"><div class="row"><b style="color:#fff">${ic('bag')} 내 가방</b><span class="mut">${hint}</span><div style="flex:1"></div>${coinH(me.coins)}</div><div class="eqrow">${eqr}</div>${g}<div class="mut">${me.inv.length}/36칸</div></div>`;
}
function bindBagCol(body, mode) {
  const me = S.me;
  body.querySelectorAll('canvas[data-ic^="eqs:"]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon(me.eq[c.dataset.ic.slice(4)]), 0, 0); });
  body.querySelectorAll('canvas[data-ic^="bi:"]').forEach(c => { const it = me.inv[+c.dataset.ic.slice(3)]; if (!it) return; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon(it), 0, 0); });
  body.querySelectorAll('[data-eqs]').forEach(c => c.onclick = e => { e.stopPropagation(); const s = c.dataset.eqs; if (mode === 'smith') { S.smithSel = { eq: s }; renderPanel(); return; } showTip(itemDesc(me.eq[s]) + `<div style="margin-top:6px"><button class="btn sm" data-a="uneq" data-s="${s}">해제</button></div>`, e); });
  body.querySelectorAll('[data-bi]').forEach(c => c.onclick = e => { e.stopPropagation(); const i = +c.dataset.bi; const it = me.inv[i]; if (mode === 'smith') { if (it.k === 'gear') { S.smithSel = { i }; renderPanel(); } else showTip(itemDesc(it), e); return; } invClick(i, e, mode); });
  body.querySelectorAll('canvas[data-npcap]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(charSprite(NPC_AP[c.dataset.npcap] || NPC_AP.guide, 0, 0), 0, 0); });
}
function renderNpc(P) {
  const me = S.me, d = P.data || {}, body = $('pbody');
  const T = (i, t, extra = '') => { $('ptitle').innerHTML = ic(i) + `<span>${esc(t)}</span>` + extra; };
  let L = '', mode = 'inv';
  switch (P.kind) {
    case 'shop': {
      T('flask', d.npc || '잡화상'); mode = 'shop';
      L = npcHeadH(d, 'shop') + `<div class="tiles" style="grid-template-columns:repeat(4,1fr)">` + d.items.map(it => `<div class="tile" data-si="${it.id}"><canvas width="22" height="22" data-one='{"k":"use","id":"${it.id}"}'></canvas><div class="nm">${it.name}</div>${coinH(it.price)}</div>`).join('') + `</div><div class="mut">물건을 누르면 구매, 오른쪽 가방의 물건을 누르면 판매</div>`;
      break;
    }
    case 'gear': {
      T('sword', d.npc || '장비상');
      const lvs = [...new Set(d.items.map(i => i.lvl))]; S.gearLv = lvs.includes(S.gearLv) ? S.gearLv : lvs[0];
      const list = d.items.filter(i => i.lvl === S.gearLv); S._gearList = list;
      L = npcHeadH(d, 'gear') + `<div class="tabs">${lvs.map(l => `<div class="tab ${l === S.gearLv ? 'on' : ''}" data-glv="${l}">${l}등급</div>`).join('')}</div><div class="tiles" style="grid-template-columns:repeat(4,1fr)">` + list.map((it, k) => `<div class="tile" data-gi="${k}"><canvas width="22" height="22" data-one='${JSON.stringify({ k: 'gear', slot: it.slot, wt: it.wt, tier: it.tier, job: it.job })}'></canvas><div class="nm">${esc(it.name)}</div>${coinH(it.price)}</div>`).join('') + `</div><div class="mut">상점 장비는 옵션이 낮아요. 좋은 옵션은 몬스터가 떨어뜨립니다.</div>`;
      break;
    }
    case 'smith': {
      T('hammer', d.npc || '대장간'); mode = 'smith';
      let it = null; const sel = S.smithSel;
      if (sel) it = sel.eq ? me.eq[sel.eq] : me.inv[sel.i];
      if (!it || it.k !== 'gear') { S.smithSel = null; it = null; }
      let anvil;
      if (!it) anvil = `<div class="anvil"><div class="bigslot">장비를<br>올려주세요</div><div class="txt">오른쪽 가방이나 착용 장비에서<br><b style="color:#fff">강화할 장비를 누르면</b> 모루 위에 올라갑니다.\n\n강화 재료는 사냥으로 얻어요.\n철광석 1~15등급 · 은광석 16~30등급\n마력석 31~45등급 · 용의비늘 46~50등급</div></div>`;
      else {
        const c = GD.upgradeCost(it), have = haveMat(c.mat), p = it.plus || 0;
        const cur = Object.assign({}, it.st), nx = Object.assign({}, it.st);
        if (cur.atk) { cur.atk = Math.round(cur.atk * (1 + 0.1 * p) + p * 2); nx.atk = Math.round(nx.atk * (1 + 0.1 * (p + 1)) + (p + 1) * 2); }
        if (cur.def) { cur.def = Math.round(cur.def * (1 + 0.1 * p) + p); nx.def = Math.round(nx.def * (1 + 0.1 * (p + 1)) + p + 1); }
        const ok = have >= c.n && me.coins >= c.coin && p < 10;
        anvil = `<div class="anvil"><div class="bigslot" style="border-style:solid;border-color:${GD.RARITY[it.rar].c}"><canvas width="22" height="22" id="anvilic"></canvas></div><div class="col" style="flex:1;gap:5px">
          <div class="nm" style="font-size:14px;font-weight:800;color:${GD.RARITY[it.rar].c}">${esc(it.name)} <span style="color:#fff">+${p}</span>${p < 10 ? ` <span class="gl">→ +${p + 1}</span>` : ''}</div>
          ${p >= 10 ? '<div class="yl">최대 강화 완료</div>' : `<div class="row" style="gap:14px">${['atk', 'def'].filter(k => cur[k]).map(k => `<span>${GD.OPT_NAME[k]} <b>${cur[k]}</b> <span class="gl">→ ${nx[k]}</span></span>`).join('')}</div>
          <div class="row" style="gap:10px"><span class="row" style="gap:4px"><canvas width="22" height="22" data-one='{"k":"mat","id":"${c.mat}"}' style="width:24px;height:24px"></canvas><b class="${have >= c.n ? 'gl' : 'rl'}">${have}/${c.n}</b><span class="mut">${c.mat}</span></span>${coinH(c.coin)}</div>
          <div class="row"><span>성공률</span><div style="flex:1;height:8px;background:#1b1f24;border-radius:2px;overflow:hidden"><div style="width:${GD.UPG_RATE[p]}%;height:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24)"></div></div><b class="yl">${GD.UPG_RATE[p]}%</b></div>
          <button class="btn pri" id="doupg" style="height:36px;font-size:14px" ${ok ? '' : 'disabled'}>${ic('hammer')}강화하기</button>`}</div></div>`;
      }
      L = npcHeadH({ text: '쇠는 두드려야 강해지는 법! 장비를 +10까지 강화해 주지. 실패해도 장비는 무사하다네.' }, 'smith') + anvil;
      break;
    }
    case 'stable': {
      T('horse', d.npc || '마구간');
      L = npcHeadH(d, 'stable') + `<div class="tiles" style="grid-template-columns:repeat(4,1fr);flex:1">` + Object.entries(GD.MOUNTS).map(([id, mt]) => { const own = me.mounts.includes(id); return `<div class="tile" style="justify-content:space-between"><canvas width="56" height="80" data-mt="${id}" style="width:56px;height:80px"></canvas><div class="nm">${mt.name}</div><small class="mut">속도 x${mt.spd}</small>${own ? `<button class="btn sm pri" data-ride="${id}" style="width:100%">${ic('check')}타기</button>` : `${coinH(mt.price)}<button class="btn sm" data-bm="${id}" style="width:100%" ${me.coins < mt.price ? 'disabled' : ''}>구매</button>`}</div>`; }).join('') + '</div>';
      break;
    }
    case 'master': {
      T('crown', d.npc || '전직관');
      L = npcHeadH(d, 'master') + `<div class="tiles" style="grid-template-columns:1fr 1fr;flex:1">` + d.opts.map(o => `<div class="card" style="padding:10px"><div class="nm" style="font-size:15px;color:#c4b5fd">${o.name}</div><small style="font-size:11px">${o.desc}</small><div class="row" style="flex-wrap:wrap;gap:3px">${o.skills.map(s => `<span class="tab" style="height:22px">${ic('zap')}&nbsp;${s}</span>`).join('')}</div><div style="flex:1"></div>${d.can ? `<button class="btn pri" data-pro="${o.id}">${ic('star')}전직하기</button>` : `<div class="mut">Lv${GD.PROMO_LEVEL}에 전직 가능</div>`}</div>`).join('') + '</div>';
      break;
    }
    case 'guide': case 'talk': {
      T('talk', d.npc || '안내');
      const guide = P.kind === 'guide';
      L = npcHeadH({ text: guide ? '바람의 대륙에 온 걸 환영해요! 밤이 되면 몬스터가 늘고 돌연변이가 나와요. 지치면 재료로 텐트를 지어 쉬세요!' : d.text }, 'guide') +
        (guide ? `<div class="row" style="gap:8px;flex:1;align-items:stretch"><div class="box txt" style="flex:1">${esc('PC 조작\n이동 방향키/WASD · 공격 스페이스\n스킬 1~6 · 퀵슬롯 7·8·9·0\nE 대화 · Z 줍기 · R 탈것 · B 집짓기\nI 가방 · M 지도 · K 스킬 · Tab 대상\n\n폰: 왼쪽 방향키 · 오른쪽 공격/스킬\n아래 퀵슬롯에 물약을 등록해 사용\n다른 플레이어를 누르면 교환 신청')}</div><div class="col" style="width:240px"><div class="lbl">보스 출현 시간</div>${bossRows(d.bosses || [])}</div></div>` : '');
      break;
    }
    case 'chest': {
      T('bag', '보관상자'); mode = 'chest';
      L = `<div class="lbl">보관상자 — 눌러서 꺼내기</div><div data-store>${gridH(me.storage, 24, 8, '', 'data-s', 44)}</div><div class="mut">오른쪽 가방의 아이템을 누르면 보관상자에 넣어요.</div>`;
      break;
    }
    case 'cook': {
      T('flame', d.at === 'campfire' ? '모닥불 요리' : '조리대 요리');
      L = `<div class="tiles" style="grid-template-columns:repeat(3,1fr)">` + d.recipes.map(r => `<div class="tile" style="padding:10px"><canvas width="22" height="22" data-one='{"k":"use","id":"${r.id}"}' style="width:44px;height:44px"></canvas><div class="nm">${r.name}</div><small class="mut">${r.desc}</small><small>${needH(r.need)}</small><button class="btn pri sm" data-cook="${r.id}" style="width:100%">${ic('flame')}요리</button></div>`).join('') + `</div><div class="mut">요리한 음식은 가방에서 눌러 퀵슬롯에 등록할 수 있어요.</div>`;
      break;
    }
    case 'plot': {
      T('home', `${d.town} 공터`);
      let act = '';
      if (!d.owner) act = d.myPlot ? '<div class="mut">이미 다른 땅을 갖고 있어요 (1인 1채).</div>' : `<button class="btn pri" data-plot="buy" ${me.coins < d.price ? 'disabled' : ''}>${ic('coin')}땅 구입 ${fmt(d.price)}</button>`;
      else if (d.mine) act = (!d.hasHouse ? `<div>집 재료: ${needH(d.cost)}</div><button class="btn pri" data-plot="build">${ic('home')}집 짓기</button>` : `<button class="btn pri" data-plot="deco">${ic('bed')}집 꾸미기</button>`) + `<button class="btn red sm" data-plot="sell">땅 팔기 (절반 환불)</button>`;
      L = `<div class="box txt">${esc(strip(d.text))}</div><div class="col">${act}</div>`;
      break;
    }
    case 'trade': {
      const tr = S.trade; if (!tr) return; mode = 'trade';
      T('swap', `교환 — ${tr.with}`);
      const side = (v, mine) => `<div class="col box" style="flex:1;${v.lock ? 'outline:2px solid var(--acc)' : ''}"><div class="row"><b>${mine ? '내 제안' : esc(tr.with)}</b><div style="flex:1"></div>${v.ok ? `<span class="gl">${ic('check')}</span>` : v.lock ? `<span class="yl">${ic('lock')}</span>` : ''}</div><div data-tg="${mine ? 'm' : 't'}">${gridH(v.items, 10, 5, '', 'data-t', 34)}</div><div class="row">${ic('coin')}${mine ? `<input type="number" id="tcoin" value="${v.coins}" min="0" style="width:100px;height:26px" ${v.lock ? 'disabled' : ''}>` : `<b class="yl">${fmt(v.coins)}</b>`}</div></div>`;
      L = `<div class="row" style="align-items:stretch;gap:8px">${side(tr.mine, 1)}${side(tr.theirs, 0)}</div><div class="row"><button class="btn" data-tr="lock" ${tr.mine.lock ? 'disabled' : ''}>${ic('lock')}확정</button><button class="btn pri" data-tr="ok" ${!(tr.mine.lock && tr.theirs.lock) || tr.mine.ok ? 'disabled' : ''}>${ic('check')}교환하기</button><div style="flex:1"></div><button class="btn red" data-tr="cancel">취소</button></div><div class="mut">모든 아이템(장비·재료·요리·물약) 교환 가능 · 둘 다 확정 후 교환하기</div>`;
      break;
    }
  }
  body.innerHTML = `<div class="npcl">${L}</div>${bagColH(mode)}`;
  paintOne(body); bindBagCol(body, mode);
  // 공통 바인딩
  body.querySelectorAll('[data-si]').forEach(t => t.onclick = e => { e.stopPropagation(); const it = d.items.find(x => x.id === t.dataset.si); showTip(`<div class="nm">${it.name}</div><div>${it.desc}</div><div style="margin:4px 0">${coinH(it.price)} / 개</div><div class="row"><button class="btn sm pri" data-buy2="${it.id}" data-n="1">1개 구매</button><button class="btn sm" data-buy2="${it.id}" data-n="10">10개</button></div>`, e); });
  body.querySelectorAll('[data-glv]').forEach(t => t.onclick = () => { S.gearLv = +t.dataset.glv; renderPanel(); });
  body.querySelectorAll('[data-gi]').forEach(t => t.onclick = e => { e.stopPropagation(); const it = S._gearList[+t.dataset.gi]; showTip(`<div class="nm">${esc(it.name)}</div><div class="mut">${it.lvl}등급 · ${GD.SLOT_NAME[it.slot]}</div>${Object.entries(it.st).map(([k, v]) => `<div>${GD.OPT_NAME[k]} <b>+${v}</b></div>`).join('')}<div style="margin:4px 0">${coinH(it.price)}</div><button class="btn sm pri" data-gbuy="${it.lvl}|${it.slot}|${it.wt || ''}" ${me.coins < it.price ? 'disabled' : ''}>구매</button>`, e); });
  const ai = $('anvilic'); if (ai) { const it = S.smithSel && (S.smithSel.eq ? me.eq[S.smithSel.eq] : me.inv[S.smithSel.i]); if (it) { const g = ai.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(itemIcon(it), 0, 0); } }
  if ($('doupg')) $('doupg').onclick = () => send(Object.assign({ t: 'upgrade' }, S.smithSel));
  body.querySelectorAll('[data-mt]').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(charSprite({ job: me.job, g: me.gender, h: me.hair, hc: me.hairColor, sk: me.skin, eq: {}, mt: c.dataset.mt }, 2, 0), 0, 0); });
  body.querySelectorAll('[data-ride]').forEach(b => b.onclick = () => send({ t: 'setMount', id: b.dataset.ride }));
  body.querySelectorAll('[data-bm]').forEach(b => b.onclick = () => uiAsk(`${GD.MOUNTS[b.dataset.bm].name}을(를) ${fmt(GD.MOUNTS[b.dataset.bm].price)}코인에 구매할까요?`, () => send({ t: 'buy', id: b.dataset.bm })));
  body.querySelectorAll('[data-pro]').forEach(b => b.onclick = () => uiAsk(`[${GD.JOBS[b.dataset.pro].name}](으)로 전직합니다. 되돌릴 수 없습니다.`, () => send({ t: 'promote', id: b.dataset.pro })));
  body.querySelectorAll('[data-cook]').forEach(b => b.onclick = () => send({ t: 'cook', id: b.dataset.cook }));
  body.querySelectorAll('[data-plot]').forEach(b => b.onclick = () => { const a = b.dataset.plot; if (a === 'buy') send({ t: 'plotBuy' }); if (a === 'build') send({ t: 'houseBuild' }); if (a === 'deco') openBuild('house'); if (a === 'sell') uiAsk('땅과 집을 팔까요? (가구는 사라집니다)', () => send({ t: 'plotSell' })); });
  const st = body.querySelector('[data-store]'); if (st) { paint(st, 'data-s', me.storage); st.querySelectorAll('.cell[data-s]').forEach(c => c.onclick = e => { e.stopPropagation(); showTip(itemDesc(me.storage[+c.dataset.s]) + `<div style="margin-top:6px"><button class="btn sm pri" data-a="take" data-i="${c.dataset.s}">꺼내기</button></div>`, e); }); }
  if (P.kind === 'trade' && S.trade) {
    ['m', 't'].forEach(k => { const g = body.querySelector(`[data-tg="${k}"]`); const list = k === 'm' ? S.trade.mine.items : S.trade.theirs.items; paint(g, 'data-t', list); g.querySelectorAll('.cell[data-t]').forEach(c => c.onclick = e => { e.stopPropagation(); showTip(itemDesc(list[+c.dataset.t]), e); }); });
    const tc = $('tcoin'); if (tc) tc.onchange = () => send({ t: 'tradeCoin', n: +tc.value });
    body.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => { const a = b.dataset.tr; if (a === 'cancel') send({ t: 'tradeCancel' }); else send({ t: a === 'lock' ? 'tradeLock' : 'tradeOk' }); });
  }
}
// 이동 시 NPC 창 닫기는 game.js가 처리 (전체화면에서도 동일)

// ═══════ v4: 실제 화면 높이 · 조이스틱 · 메뉴 이름 · 알림 가독성 ═══════
function setVP() { const r = document.documentElement.style; r.setProperty('--vwp', innerWidth + 'px'); r.setProperty('--vhp', innerHeight + 'px'); }
const _fit = fitUI; fitUI = function () { setVP(); _fit(); }; setVP(); fitUI();
addEventListener('resize', () => { setVP(); fitUI(); });
if (window.visualViewport) visualViewport.addEventListener('resize', () => { setVP(); fitUI(); });
// 메뉴 아이콘 + 이름
$('menu').innerHTML = MENU.map(([k, i, t]) => `<div class="mbtn" data-k="${k}">${ic(i)}<span>${t}</span></div>`).join('');
$('menu').querySelectorAll('.mbtn').forEach(b => b.onclick = () => hotkey(b.dataset.k));
// 알림: 진한 배경 + 12초 뒤 사라짐
log = function (text, c = '#fff', html) {
  const d = document.createElement('div'); d.style.color = c; if (html) d.innerHTML = text; else d.textContent = strip(text);
  const L = $('log'); L.appendChild(d); while (L.children.length > 5) L.removeChild(L.firstChild);
  setTimeout(() => { d.style.transition = 'opacity .6s'; d.style.opacity = 0; setTimeout(() => d.remove(), 600); }, 12000);
};
let _annT2 = null;
announce = function (t, c) { const a = $('announce'); a.innerHTML = `<span style="color:${c || '#fff'}">${esc(strip(t))}</span>`; a.style.transition = ''; a.style.opacity = 1; clearTimeout(_annT2); _annT2 = setTimeout(() => { a.style.transition = 'opacity 1s'; a.style.opacity = 0; }, 4000); };
// 조이스틱
const _bt = buildTouch;
buildTouch = function () {
  _bt();
  const dp = $('dpad'); dp.innerHTML = '<div id="joy"></div><div id="knob"></div>';
  const knob = $('knob'); let active = null;
  const upd = e => {
    const r = dp.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy; const R = r.width / 2; const dist = Math.hypot(dx, dy);
    const k = dist > R * 0.6 ? R * 0.6 / dist : 1; const sc = 120 / r.width;
    knob.style.transform = `translate(${dx * k * sc}px,${dy * k * sc}px)`;
    if (dist < R * 0.18) { touchDir = -1; return; }
    touchDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 1) : (dy > 0 ? 0 : 3);
  };
  const end = () => { active = null; touchDir = -1; knob.style.transform = ''; };
  dp.onpointerdown = e => { active = e.pointerId; dp.setPointerCapture(e.pointerId); upd(e); e.preventDefault(); };
  dp.onpointermove = e => { if (active === e.pointerId) upd(e); };
  dp.onpointerup = dp.onpointercancel = end;
};

// ═══════ 방장 전용(서버) 모드: 캐릭터 없이 방만 열어 둠 ═══════
const _webLobby3 = webLobby;
webLobby = function () {
  _webLobby3();
  const L = $('lobby'); if (!L) return;
  const sv = document.createElement('button'); sv.className = 'btn'; sv.id = 'lserver'; sv.style.cssText = 'flex:1;height:30px';
  sv.innerHTML = `${ic('castle')}방만 열기 (서버 기기)`;
  const row = $('lsolo').parentElement; row.insertBefore(sv, $('lsolo')); row.style.gap = '6px';
  sv.onclick = () => { const typed = $('lcode').value.trim(); NET.serverOnly = true; NET.hostRoom(null, /^\d{4}$/.test(typed) ? typed : null); };
  // 이어하기 버튼이 서버 기록이면 서버 모드로
  let mem = null; try { mem = JSON.parse(localStorage.getItem('baram_last') || 'null'); } catch (e) { }
  const cont = $('lcont');
  if (mem && mem.role === 'server') {
    if (cont) { cont.innerHTML = `${ic('castle')}이어하기 · 서버 기기 · 방 ${mem.code}`; cont.onclick = () => { NET.serverOnly = true; NET.hostRoom(null, mem.code); }; }
    else { const c2 = document.createElement('button'); c2.className = 'btn pri'; c2.id = 'lcont'; c2.style.cssText = 'width:100%;height:42px;font-size:14px;margin-bottom:4px;background:#16a34a;border-color:#16a34a'; c2.innerHTML = `${ic('castle')}이어하기 · 서버 기기 · 방 ${mem.code}`; L.insertBefore(c2, L.firstChild); c2.onclick = () => { NET.serverOnly = true; NET.hostRoom(null, mem.code); }; }
    $('nm').value = '';
  }
};
let wakeLock = null;
async function keepAwake() { try { if ('wakeLock' in navigator && document.visibilityState === 'visible') wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { } }
function showServerDash(code, restored) {
  $('login').classList.add('hidden');
  keepAwake(); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
  const d = document.createElement('div'); d.id = 'srvdash';
  d.style.cssText = 'position:fixed;inset:0;z-index:70;background:linear-gradient(160deg,#1a1e24,#262b33);display:flex;align-items:center;justify-content:center';
  d.innerHTML = `<div class="win lcard" style="width:780px;height:340px;padding:18px 22px;display:flex;gap:20px">
    <div class="col" style="width:300px;gap:10px">
      <div class="row" style="gap:8px;color:var(--gold)">${ic('castle', 22)}<b style="font-size:18px;color:#fff">서버 기기 (방장 전용)</b></div>
      <div class="mut">이 기기는 게임 세계만 돌려요. 화면을 켠 채로 두세요.</div>
      <div class="box" style="text-align:center;padding:14px"><div class="mut">방 코드</div><div style="font-size:54px;font-weight:900;letter-spacing:8px;color:#fff;line-height:1.1">${code}</div><div class="mut" style="margin-top:4px">친구들은 이 코드로 [참가하기]</div></div>
      <div class="row"><button class="btn" id="svcopy" style="flex:1">${ic('key')}참가 링크 복사</button><button class="btn" id="svsave" style="flex:1">${ic('check')}지금 백업</button></div>
      <div class="mut" id="svmsg">${restored ? '인터넷 백업에서 저장 데이터를 불러왔어요.' : '저장: 10초마다 이 기기 + 인터넷 백업'}</div>
    </div>
    <div class="col" style="flex:1;gap:8px;min-width:0">
      <div class="row"><b style="color:#fff">${ic('users')} 접속 중</b><span class="mut" id="svcount"></span><div style="flex:1"></div><span class="mut" id="svup"></span></div>
      <div id="svlist" class="box" style="flex:1;overflow:hidden;display:flex;flex-direction:column;gap:4px"></div>
      <div class="box mut" style="font-size:11px;line-height:1.5">본인도 플레이하려면 아이폰에서 같은 방 코드로 [참가하기] 하세요.\n홈 화면 앱으로 실행하면 주소창 없이 켜 둘 수 있어요. 자동 잠금은 [설정 › 디스플레이 › 자동 잠금 › 안 함] 권장.</div>
    </div></div>`;
  document.body.appendChild(d);
  $('svcopy').onclick = () => { const url = location.href.split('#')[0] + '#' + code; try { navigator.clipboard.writeText(url).then(() => { $('svmsg').textContent = '참가 링크를 복사했어요: ' + url; }); } catch (e) { $('svmsg').textContent = url; } };
  $('svsave').onclick = () => { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); $('svmsg').textContent = '백업 완료 · ' + new Date().toLocaleTimeString('ko-KR'); };
  const t0 = Date.now();
  const tick = () => {
    const names = ENGINE.online();
    $('svcount').textContent = `${names.length}명`;
    $('svlist').innerHTML = names.length ? names.map(n => `<div class="row" style="gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:#4ade80;display:inline-block"></span><b>${esc(n)}</b></div>`).join('') : '<div class="mut">아직 접속한 사람이 없어요.</div>';
    const m = Math.floor((Date.now() - t0) / 60000); $('svup').textContent = `켜진 지 ${Math.floor(m / 60)}시간 ${m % 60}분`;
  };
  tick(); setInterval(tick, 2000);
}
