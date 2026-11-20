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
// 7) 실제 그림 검사: 왼쪽 줄 캐릭터의 얼굴이 왼쪽을 보는지 (피부색 픽셀이 머리 중심보다 왼쪽에 많아야 함)
try {
  const { execSync } = require('child_process');
  const out = execSync(`python3 -I ${__dirname}/face-check.py`, { encoding: 'utf8' }).trim();
  if (out !== 'OK') fail.push('캐릭터 그림 방향 검사: ' + out);
} catch (e) { fail.push('캐릭터 그림 방향 검사 실행 실패: ' + e.message.split('\n')[0]); }
if (fail.length) { console.error('\n⛔ 고정 규칙 위반 — 배포 중단\n - ' + fail.join('\n - ') + '\n'); process.exit(1); }
console.log('✔ 고정 규칙 검사 통과');
