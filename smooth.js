// ═══════ 부드러운 움직임 (다른 플레이어·몬스터) ═══════
// 받은 위치들을 순서대로 '길'로 쌓아 두고, 걷는 속도로 따라감.
// 길이 쌓이면 조금 빨리, 거의 따라잡으면 조금 천천히 → 신호가 들쭉날쭉해도 멈칫·순간이동 없이 일정하게 보임
(function () {
  const _snap = snapshot;
  snapshot = function (m) {
    const r = _snap(m);
    const rec = e => {
      const q = e._q || (e._q = []); const L = q.length ? q[q.length - 1] : (e._last || null);
      if (!L) { e._last = { x: e.x, y: e.y }; e.rx = e.x; e.ry = e.y; return; }
      if (L.x === e.x && L.y === e.y) return;
      if (Math.abs(L.x - e.x) + Math.abs(L.y - e.y) > 3) { q.length = 0; e._last = { x: e.x, y: e.y }; e._snapTo = 1; return; } // 순간이동
      q.push({ x: e.x, y: e.y }); if (q.length > 6) { const k = q.shift(); e.rx = k.x; e.ry = k.y; } // 너무 밀리면 앞부분 건너뜀
      e._last = { x: e.x, y: e.y };
    };
    for (const e of S.P.values()) if (e.i !== S.myId) rec(e);
    for (const e of S.M.values()) rec(e);
    return r;
  };
  window.smoothPos = function (e, now, step) {
    if (!e._last) return false;
    const dt = Math.min(100, now - (e._t || now)); e._t = now;
    if (e._snapTo || e.rx == null) { e.rx = e._last.x; e.ry = e._last.y; e._snapTo = 0; e._q = []; return true; }
    const q = e._q || [];
    let rem = 0, px = e.rx, py = e.ry; for (const k of q) { rem += Math.hypot(k.x - px, k.y - py); px = k.x; py = k.y; }
    if (rem < 0.001) { e._mv = 0; return true; }
    const sp = (1 / step) * Math.min(1.7, Math.max(0.8, rem / 1.2)); // 남은 길이에 따라 속도 조절
    let go = sp * dt;
    while (go > 0 && q.length) {
      const k = q[0], d = Math.hypot(k.x - e.rx, k.y - e.ry);
      if (d <= go) { e.rx = k.x; e.ry = k.y; go -= d; q.shift(); }
      else { e.rx += (k.x - e.rx) / d * go; e.ry += (k.y - e.ry) / d * go; go = 0; }
    }
    e.walkUntil = now + 90; return true;
  };
})();
// 몬스터가 서 있는 칸으로는 폰에서도 못 들어가게 (서버는 더 이상 되돌리지 않으므로 겹침 방지)
(function () { const _cw = canWalk; canWalk = function (x, y) { for (const m of S.M.values()) if (m.x === x && m.y === y && !m.s) return false; return _cw(x, y); }; })();
