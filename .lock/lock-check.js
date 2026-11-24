// 고정 규칙 검사: 이미 고친 것이 다시 바뀌면 배포(빌드)를 멈춘다.
const fs = require('fs'); const P = __dirname + '/../public/';
const src = f => fs.readFileSync(P + f, 'utf8');
const fail = [];
const must = (f, s, why) => { if (!src(f).includes(s)) fail.push(`${f}: ${why}`); };
// 1) 캐릭터 좌우 방향: 시트 줄 = 방향(0아래 1왼쪽 2오른쪽 3위) 그대로, 투구는 왼쪽(1)에서만 뒤집기
must('chars.js', 'const row = FR[dir] || FR[0];', '캐릭터 시트 줄 순서(좌우) 변경 금지');
must('chars.js', 'if (dir === 2) { hg.translate(hw, 0); hg.scale(-1, 1); }', '투구·모자 좌우 뒤집기(오른쪽일 때만) 변경 금지');
if (/\[0,\s*2,\s*1,\s*3\]\[dir\]/.test(src('chars.js'))) fail.push('chars.js: 좌우를 뒤바꾸는 [0,2,1,3] 매핑 금지');
// 2) 방향 번호: 1=왼쪽, 2=오른쪽
must('ui.js', 'const dirOf = (dx, dy) => dx < 0 ? 1 : dx > 0 ? 2 : dy < 0 ? 3 : 0;', '방향 번호 규칙 변경 금지');
// 3) 큰 지도 닫기 후 다시 열림 방지
must('ui.js', "performance.now() - (S._bmClosed || 0) < 600", '지도 닫기 무한반복 방지 유지');
// 4) 안드로이드 조이스틱 터치 처리
must('assets.js', "dp.addEventListener('touchstart'", '안드로이드 조이스틱 터치 처리 유지');
// 5) 렉 방지 바닥 캐시
must('game.js', 'drawGroundChunks(m, sx, sy, x0, y0, x1, y1, fr);', '바닥 묶음 캐시 유지');
// 6) 서버 아이패드는 접속자 있을 때 자동 새로고침 금지
must('ui.js', "NET.serverOnly) { if (typeof serverUpdate === 'function') serverUpdate(); }", '서버 기기 자동 새로고침 방지 유지');
must('engine.js', 'function delChar(name, key, ws)', '캐릭터 삭제 기능 유지');
must('game.js', 'function loginMsg(n)', '접속 시 삭제 요청 전달 유지');
must('game.js', 'rtcHostSignal(r, d.rtc', '직접 연결(WebRTC) 유지');
must('engine.js', 'if (msg.ep != null && p.ep && msg.ep !== p.ep) return;', '위치 되돌림 연쇄 방지 유지');
must('assets.js', "if (m && m.t === 'partyAsk') { ask('party', m.from); return; }", '파티 신청 팝업 유지');
must('engine.js', "if (msg.t === 'tradeOk') { tr.lock[side] = 1; tr.ok[side] = 1;", '간단 교환(교환하기 한 번) 유지');
must('game.js', 'smoothPos(p, now', '부드러운 움직임(보간) 유지');
must('net-rtc.js', "createDataChannel('u', { ordered: false, maxRetransmits: 0 })", '위치 정보 비신뢰 채널 유지');
must('assets.js', '닫기(X) 누른 손가락이 아래에 있는 미니맵', '닫기 후 미니맵 눌림 방지 유지');
must('engine.js', 'const takeOut = (P, offs) => { const out = []; const rm = new Set();', '교환 아이템 사라짐 버그 수정 유지');
must('index.html', 'z-index:30;pointer-events:none;', '아이폰 안내문이 버튼을 가리지 않게 유지');
must('engine.js', 'const K = 50 + aLv * 14;', '비율 방어 공식 유지(피해 1 고정 방지)');
must('game.js', 'if (m.x === x && m.y === y && !m.s) return false; // 소환수는 통과 가능', '소환수 통과 유지');
must('engine.js', "p.coins -= mt.price; giveMount(p, msg.id);", '탈것 구매 시 가방으로 들어감 유지');
must('engine.js', "if (it.k === 'mount') return sysMsg(p, '탈것은 버릴 수 없어요.'", '탈것 버리기 차단 유지(분실 방지)');
must('ui.js', "if (s === 'mount') { eq += me.mount ?", '장비창 탈것 칸 유지');
must('index.html', '.touchmode #qs{left:auto!important;right:12px!important;bottom:198px!important}', '퀵슬롯은 보조버튼 줄 위 유지');
must('ui.js', "st.insertAdjacentHTML('afterend', pouchesH());", '장비창 주머니 표시 유지');
must('ui.js', "const order = ['necklace', 'helmet', 'cape', 'weapon', 'gloves', 'prev', 'armor', 'shield', 'ring', 'boots', 'mount', null];", '장비창 미리보기는 빈칸 안에(주머니 밀림 방지) + 장신구 칸');
must('engine.js', "t = v < 0.012 ? T.TREE : v < 0.09 ? T.FLOWER : T.GRASS;", '나무 개수 줄인 상태 유지');
must('game.js', "setTimeout(() => location.reload(), 50); };", '캐릭터 만들기 뒤로가기 = 새로고침 (먹통 방지)');
must('chars.js', "// 치유사 두건은 머리색을 따라감", '치유사 외형 색 변경 유지');
must('ui.js', "function qsEditTap(i)", '가방 안 퀵슬롯 순서 편집 유지');
must('game.js', "} else if (backup && backup.solo) backup = null; // 서버는 혼자 하기 백업을 가져오지 않음", '서버 방·혼자 하기 저장 분리 유지');
must('game.js', "saves: S, srv: NET.serverOnly ? 1 : 0, solo: NET.serverOnly ? 0 : 1 }", '백업에 서버/혼자 표시 유지');
must('ui.js', "if (u === 'talk') talkBtn();", '말걸기 버튼: NPC/플레이어/안내');
must('ui.js', 'function placePartyBox()', '모바일 파티창은 미니맵 왼쪽');
must('assets.js', '// 변신 상태 공격 모션', '변신 공격 모션 유지');
must('assets.js', "const S2 = Math.min(1.25, 139 / Math.max(60, rb.h)), rw2 = rb.w * S2, up = rb.h * 0.68", '탈것 탑승 자세(상체+다리) 유지');
must('assets.js', '// ═══════ 버튼 잘 눌리게', '버튼 터치 안정화(누르는 중 재그리기 보류·즉시 클릭) 유지');
must('engine.js', "w: t.w, h: t.h, furn: t.furn", '텐트 실내 크기 전달(출구 막힘 방지)');
must('engine.js', 'function tentExit(t)', '텐트 출구 안전 위치');
must('engine.js', 'function clearTentGround(m, t)', '텐트 자리 나무 정리');
must('assets.js', 'window.formRider', '변신+탈것 외형 유지');
must('data.js', 'D.PROMOS2 = {', '3차 전직 유지');
must('assets.js', '// 몸 전체(다리 포함)를 탈것 뒤에 그려 잘린 선이 안 보이게', '탈것 정면 잘림 방지 유지');
must('data.js', 'D.bossGearLv = ', '50등급 이상 장비는 보스 전용');
must('engine.js', 'D.bossGearLv(def.lv, R) : clamp(def.lv + ri(-2, 2) + (mon.mutant ? 2 : 0), 1, 49)', '일반 몬스터 장비 50 상한');
must('ui.js', '// 몬스터 그림이 아직 안 불러와졌으면 불러와질 때까지 다시 그림', '보스 시간표 실제 그림 유지');
must('engine.js', 'function midBossTick(m, z, now)', 'Lv40+ 사냥터 중보스 유지');
must('data.js', 'coin: Math.floor(3 + l * 2.1) };', '코인 경제 조정 유지');
must('data.js', 'D.skillMp = ', '레벨 비례 마나 소모 유지');
must('game.js', "if (m.t === 'map' && !m.inner && !String(m.id).startsWith('tent_')", '손님 텐트 입장 오류 방지');
must('engine.js', "if (p.house && !(MAPS[p.house.map] && MAPS[p.house.map].tents.includes(p.house))) p.house = null;", '집 짓기 먹통 방지');
must('assets.js', 'const HK = Math.min(1.75, 216 / r[2], 214 / r[3]);', '큰 탈것 잘림 방지');
must('engine.js', '// 코인은 바닥에 떨어뜨리지 않고 기여도(준 피해)만큼 나눠 바로 지갑으로', '코인 기여도 분배 유지');
must('engine.js', '// 자동 줍기 없음: [줍기] 버튼(스페이스)으로만 가방에 들어옴', '자동 줍기 없음 유지');
must('data.js', 'D.mountBonus = ', '탈것 전투 옵션 유지');
must('game.js', 'VH / (19.5 * TS)', '시점 거리 유지');
must('assets.js', "['drawPlayer', 'drawMon', 'drawNpc', 'drawDrop'].forEach(wrap);", '그래픽 고품질 축소 유지');
must('game.js', "/* 조금 작게 */ ctx.imageSmoothingEnabled = true; ctx.drawImage(dropIcon(d)", '드랍 아이템 아이콘 그리기 유지');
must('engine.js', 'function houseInterior(h)', '집 입장 시 실내 맵으로 화면 전환');
must('engine.js', "case 'hdeco'", '집 벽지·바닥 꾸미기');
must('engine.js', 'furn: t.furn, deco: t.deco }', '꾸미기 정보 전송');
must('engine.js', "(t.kind !== 'house' || t.inner) && ly === SH(t) - 1", '집 실내 출입문 통과(서버)');
must('game.js', "(t.kind !== 'house' || t.inner) && ly === SH_(t) - 1", '집 실내 출입문 통과(폰)');
must('game.js', 'function camC()', '집 안 카메라 방 중앙 고정');
must('game.js', 'let _inH = false; try {', '집 안 확대 (시작 시 S 미초기화 오류 방지)');
must('assets.js', 'const K = 1.45, fs = [...t.furn]', '집 실내 가구 캐릭터 크기 확대');
must('data.js', 'WALLPAPERS', '벽지 목록');
must('ui.js', 'data-hw=', '벽지 선택 버튼');
must('game.js', 'function groundGrade(g, px, m)', '배경 색감 보정(캐릭터와 어울림)');
must('game.js', 'if (!m.inner) groundGrade(g, px, m);', '바닥 묶음에 색감 보정 적용');
must('gfx.js', 'function seamCell(idx)', '바닥 타일 이음매(격자 줄) 제거');
must('gfx.js', 'function cleanTrees(c)', '나무 흰 테두리·회색 원판 제거');
must('gfx.js', '/* 새 그림은 색 보정 없이 원본 색 그대로', '새 소품 원본 색(칙칙함 방지)');
must('game.js', "g.globalAlpha = m.dark ? 0.06 : 0.14; g.fillStyle = '#fff4d8';", '바닥 밝은 톤(칙칙함 방지)');
must('index.html', 'filter:saturate(1.04) contrast(1.06) brightness(1.03)', '화면 선명도');
must('gfx.js', "g.imageSmoothingQuality = 'high'; g.drawImage(GFX.spr", '소품 매끈하게 줄이기');
must('gfx.js', 'function texMat(id, under, castle)', '새 바닥 그림(이음매 없는 큰 그림) 적용');
must('gfx.js', "GFX.spr.src = 'gfx/sprites2x.webp", '새 나무·건물·소품 그림');
must('engine.js', 'function surpriseTick(now)', '깜짝 보스 무작위 등장');
must('engine.js', 'const SB_TIME = 10 * 60000;', '깜짝 보스 제한시간 10분');
must('engine.js', 'function sbKilled(m, mon, killer)', '깜짝 보스 특별 아이템·좋은 옵션 장비');
must('engine.js', 'try { surpriseTick(now); }', '깜짝 보스 틱 연결');
must('game.js', 'function sbTint(img, hu)', '깜짝 보스 외형 변형(색)');
must('game.js', 'const MBK = mo.sb ? 2.1', '깜짝 보스 크게');
must('game.js', 'function sbBanner()', '깜짝 보스 화면 알림 띠');
must('data.js', "'necklace', 'ring', 'cape'", '장신구 장착 칸(목걸이·반지·망토)');
must('sprites.js', "case 'necklace':", '장신구 아이콘');
must('data.js', 'if (m.boss) { hp *= 50; atk *= 2.3;', '보스 난이도 상향');
must('engine.js', 'mon.maxHp * 17); mon.atk = Math.round(mon.atk * 1.75)', '중보스 난이도 상향');
must('engine.js', 'let FX_SID = null;', '스킬 이펙트에 스킬 id 전달');
must('assets.js', "const SH = {}, CEL = 192;", '스킬 이펙트 그림 시트');
must('assets.js', 'if (!sheet(sn)) return _add(f);', '그림 못 받으면 기존 이펙트로');
must('game.js', 'if (f.hide) continue;', '그림 이펙트로 대체된 기존 이펙트 숨김');
must('gfx.js', "if (id === T.CASTLE) return 'castle'; if (id === T.LAVA) return 'lava';", '새 바닥 그림 9종(사막·설원·늪·화산·성·동굴·물·용암)');
must('gfx.js', 'function blendTile(mt, wx, wy, dir)', '지형 경계 자연스럽게 스며들기');
must('gfx.js', 'function fenceVert(x, y)', '세로 울타리 바르게');
must('gfx.js', "/* 붉은 융단: 칸마다 격자선이", '융단 이어 그리기');
must('gfx.js', '/* 줄 맞춰 똑같이 찍힌 것처럼', '나무·바위 크기·위치 변화');
// 7) 실제 그림 검사: 왼쪽 줄 캐릭터의 얼굴이 왼쪽을 보는지 (피부색 픽셀이 머리 중심보다 왼쪽에 많아야 함)
try {
  const { execSync } = require('child_process');
  const out = execSync(`python3 -I ${__dirname}/face-check.py`, { encoding: 'utf8' }).trim();
  if (out !== 'OK') fail.push('캐릭터 그림 방향 검사: ' + out);
} catch (e) { fail.push('캐릭터 그림 방향 검사 실행 실패: ' + e.message.split('\n')[0]); }
if (fail.length) { console.error('\n⛔ 고정 규칙 위반 — 배포 중단\n - ' + fail.join('\n - ') + '\n'); process.exit(1); }
console.log('✔ 고정 규칙 검사 통과');
