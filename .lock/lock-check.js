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
must('ui.js', "const order = ['helmet', null, 'weapon', 'gloves', 'armor', 'shield', 'prev', 'boots', 'mount'];", '장비창 미리보기는 빈칸 안에(주머니 밀림 방지)');
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
// 7) 실제 그림 검사: 왼쪽 줄 캐릭터의 얼굴이 왼쪽을 보는지 (피부색 픽셀이 머리 중심보다 왼쪽에 많아야 함)
try {
  const { execSync } = require('child_process');
  const out = execSync(`python3 -I ${__dirname}/face-check.py`, { encoding: 'utf8' }).trim();
  if (out !== 'OK') fail.push('캐릭터 그림 방향 검사: ' + out);
} catch (e) { fail.push('캐릭터 그림 방향 검사 실행 실패: ' + e.message.split('\n')[0]); }
if (fail.length) { console.error('\n⛔ 고정 규칙 위반 — 배포 중단\n - ' + fail.join('\n - ') + '\n'); process.exit(1); }
console.log('✔ 고정 규칙 검사 통과');
