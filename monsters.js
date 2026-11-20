// ═══════ GPT 몬스터 아틀라스 ═══════
(function () {
  const A = window.MON_ATLAS; if (!A) return;
  const img = new Image(); let ok = false; img.onload = () => ok = true; img.src = 'gfx/mons.png?v=' + (window.BUILDV || 1);
  const SC = 1.5, cache = new Map(), atk = new Map();
  // 몬스터 공격 순간 기록 (mhit fx)
  const _af = addFx; addFx = function (f) { if (f.k === 'mhit') for (const mo of S.M.values()) if (mo.x === f.x && mo.y === f.y) { atk.set(mo.i, performance.now()); mo.flip = f.tx < f.x ? true : f.tx > f.x ? false : mo.flip; } return _af(f); };
  function frameCanvas(t, fi, flip, mu) {
    const k = t + '|' + fi + '|' + flip + '|' + mu; let c = cache.get(k); if (c) return c;
    const r = A[t][fi]; c = document.createElement('canvas'); c.width = r[2]; c.height = r[3]; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    if (flip) { g.translate(r[2], 0); g.scale(-1, 1); }
    g.drawImage(img, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
    if (mu) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(170,60,255,0.38)'; g.fillRect(0, 0, r[2], r[3]); }
    c.dw = r[2] / SC; c.dh = r[3] / SC; cache.set(k, c); return c;
  }
  window.monAtlasImg = function (mo, now, walking) {
    const fr = A[mo.t]; if (!ok || !fr) return null;
    const boss = fr.length === 3, pn = performance.now();
    let fi; const at = atk.get(mo.i);
    if (at && pn - at < 320) fi = boss ? 2 : 3;
    else if (walking) fi = boss ? ((now / 200 | 0) % 2 ? 1 : 0) : ((now / 160 | 0) % 2 ? 1 : 2);
    else fi = 0;
    const faceRight = !mo.flip; // 원본은 왼쪽을 봄
    const c = frameCanvas(mo.t, fi, faceRight, mo.mu ? 1 : 0);
    // 공격 프레임: 이펙트 쪽으로 늘어난 만큼 몸 위치 고정
    const idleW = fr[0][2] / SC; let ox = 0;
    if (fi === (boss ? 2 : 3)) { const d = c.dw - idleW; ox = faceRight ? d / 2 : -d / 2; }
    c.ox = ox; c.bob = fi === 0 ? Math.round(Math.sin(now / 380 + mo.i) * 1) : 0;
    return c;
  };
})();
