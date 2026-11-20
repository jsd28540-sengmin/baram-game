// ═══════ GPT 아이템·가구·텐트·이펙트·말·버튼 ═══════
(function () {
  const V = '?v=' + (window.BUILDV || 1);
  const L = src => { const i = new Image(); i.onload = () => { i.ok = 1; if (window.S && S.panel && typeof renderPanel === 'function') try { renderPanel(); } catch (e) { } }; i.src = src + V; return i; };
  const IT = L('gfx/items.png'), FXI = L('gfx/fx.png'), HO = L('gfx/horse.png'), TOUT = L('gfx/tent_out.png'), TIN = L('gfx/tent_in.png');
  const IA = window.ITEM_ATLAS || {}, FA = window.FX_ATLAS || {}, HA = window.HORSE_ATLAS || {}, NA = window.NPC_ATLAS || {}; const NPI = L('gfx/npcs.png');
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // ── 아이템 아이콘 (64px) ──
  const _icon = itemIcon, cache = new Map();
  function iconKey(it) {
    if (!it) return null;
    if (it.k === 'gear') {
      if (it.legend && IA['l_' + it.legend]) return ['l_' + it.legend];
      const t = Math.max(0, Math.min(9, it.tier | 0));
      if (it.slot === 'weapon') return ['w_' + it.wt + '_' + t];
      if (IA['a_' + it.slot + '_' + t]) return ['a_' + it.slot + '_' + t];
      return ['a_' + it.slot + '_' + (t >= 7 ? 4 : 3), GD.TIER_COLOR[t]];
    }
    if (it.k === 'use') return ['u:' + it.id];
    if (it.k === 'mat') return ['m:' + it.id];
    return null;
  }
  itemIcon = function (it) {
    const k = iconKey(it); if (!k || !IT.ok || !IA[k[0]]) return _icon(it);
    const ck = k.join('|'); let c = cache.get(ck); if (c) return c;
    c = mkc(64, 64); const g = c.getContext('2d'); const [x, y] = IA[k[0]];
    g.drawImage(IT, x, y, 64, 64, 0, 0, 64, 64);
    if (k[1]) { // 상위 등급 방어구: 색 입히기
      const t = mkc(64, 64), tg = t.getContext('2d'); tg.drawImage(c, 0, 0); tg.globalCompositeOperation = 'color'; tg.fillStyle = k[1]; tg.fillRect(0, 0, 64, 64);
      tg.globalCompositeOperation = 'destination-in'; tg.drawImage(c, 0, 0); g.clearRect(0, 0, 64, 64); g.drawImage(t, 0, 0);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18; g.drawImage(t, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    c._ic64 = 1; cache.set(ck, c); return c;
  };
  // 32px 캔버스에 (0,0)으로 그리던 곳 → 캔버스를 64로 키워 선명하게
  const _di = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (img, a, b) {
    if (img && img._ic64 && arguments.length === 3) {
      const cv = this.canvas;
      if (cv.width === 32 && cv.height === 32 && a === 0 && b === 0 && cv.isConnected) {
        if (!cv.style.width) { const cs = getComputedStyle(cv); cv.style.width = cs.width; cv.style.height = cs.height; }
        cv.width = 64; cv.height = 64; this.imageSmoothingEnabled = true; this.imageSmoothingQuality = 'high';
        return _di.call(this, img, 0, 0);
      }
      return _di.call(this, img, a, b, 32, 32);
    }
    return _di.apply(this, arguments);
  };

  // ── 가구 ──
  const _df = drawFurn;
  drawFurn = function (g, k, x, y, t, owner) {
    const r = IA['f:' + k]; if (!IT.ok || !r) return _df(g, k, x, y, t, owner);
    const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true;
    const big = k === 'bed' || k === 'shelf' || k === 'stove' || k === 'door' ? 36 : 32;
    _di.call(g, IT, r[0], r[1], 64, 64, x + 16 - big / 2, y + 32 - big + 2, big, big);
    if (k === 'campfire' || k === 'torch' || k === 'lantern' || k === 'stove') { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 + Math.sin((t || 0) / 110 + x) * 0.06; g.fillStyle = '#ffb040'; g.beginPath(); g.arc(x + 16, y + 12, 14, 0, 7); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    g.imageSmoothingEnabled = sm;
  };

  // ── 텐트 외관/실내 (GPT 그림) ──
  const _to = window.drawTentOut, _ti = window.drawTentInside;
  window.drawTentOut = function (t, sx, sy, now) {
    if (!TOUT.ok) return _to(t, sx, sy, now);
    const w = 10.2 * TS, h = w * TOUT.height / TOUT.width; const cx = (t.x + 4.5) * TS - sx, by = (t.y + 7.1) * TS - sy;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(TOUT, Math.round(cx - w / 2), Math.round(by - h), w, h); ctx.imageSmoothingEnabled = false;
    const nl = S.nl || 0; if (nl > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(0.45, nl * 0.55); for (const [dx, r] of [[-2.7, 1.1], [2.7, 1.1], [0, 1.4]]) { const px = cx + dx * TS, py = by - 1.6 * TS; const gg = ctx.createRadialGradient(px, py, 0, px, py, r * TS); gg.addColorStop(0, 'rgba(255,200,110,.9)'); gg.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = gg; ctx.fillRect(px - r * TS, py - r * TS, 2 * r * TS, 2 * r * TS); } ctx.restore(); }
    drawText('⛺ ' + t.owner + '의 텐트', cx, by - h - 6, '#ffe0a0', 12);
  };
  window.drawTentInside = function (t, sx, sy, now) {
    if (!TIN.ok) return _ti(t, sx, sy, now);
    const w = 11 * TS, h = w * TIN.height / TIN.width; const cx = (t.x + 4.5) * TS - sx, by = (t.y + 6.25) * TS - sy;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(TIN, Math.round(cx - w / 2), Math.round(by - h), w, h); ctx.imageSmoothingEnabled = false;
    // 전구 반짝임
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16 + Math.sin(now / 260) * 0.06; const gg = ctx.createRadialGradient(cx, by - h * 0.62, 0, cx, by - h * 0.62, w * 0.45); gg.addColorStop(0, 'rgba(255,190,90,.9)'); gg.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = gg; ctx.fillRect(cx - w / 2, by - h, w, h); ctx.restore();
    for (const f of t.furn) drawFurn(ctx, f.k, (t.x + f.x) * TS - sx, (t.y + f.y) * TS - sy, now);
    drawText('⛺ ' + t.owner + '의 텐트 안', cx, by - h - 6, '#ffe0a0', 12);
  };

  // ── 스킬 이펙트 ──
  const FXMAP = { slash: 'slash', slash3: 'slash', spin: 'whirl', ring: 'whirl', quake: 'whirl', flame: 'fire', meteor: 'fire', ice: 'ice', bolt: 'bolt', holy: 'heal', bless: 'heal', heal: 'heal', bigheal: 'heal', buff: 'heal' };
  function fxFrame(g, name, k, x, y, size, ground, flipX) {
    const fr = FA[name]; if (!fr) return false;
    const i = Math.min(fr.length - 1, Math.floor(k * fr.length)); const r = fr[i];
    const s = size / 96; const w = r[2] * s, h = r[3] * s;
    g.save(); g.globalAlpha = Math.min(1, (1 - k) * 2.2); g.imageSmoothingEnabled = true; g.translate(x, y); if (flipX) g.scale(-1, 1);
    _di.call(g, FXI, r[0], r[1], r[2], r[3], -w / 2, ground ? -h + 6 : -h / 2, w, h); g.restore(); return true;
  }
  const _dsf = drawSkillFx;
  drawSkillFx = function (g, f, k, x, y) {
    const nm = FXMAP[f.f]; if (!FXI.ok || !nm) return _dsf(g, f, k, x, y);
    const R = (f.r || 1) * TS;
    if (nm === 'fire' && f.f === 'meteor') { if (k < 0.35) { const kk = k / 0.35; fxFrame(g, 'fire', 0.1, x + (1 - kk) * 120, y - (1 - kk) * 200, 70, 0); return; } fxFrame(g, 'fire', 0.4 + (k - 0.35) / 0.65 * 0.6, x, y, Math.max(96, R * 1.6), 0); return; }
    if (nm === 'fire') { fxFrame(g, 'fire', 0.4 + k * 0.6, x, y, Math.max(80, R * 1.6), 0); return; }
    if (nm === 'slash') { fxFrame(g, 'slash', k, x, y - 12, Math.max(70, R * 1.3), 0, f.d === 1); if (f.f === 'slash3') fxFrame(g, 'slash', Math.min(0.99, k + 0.2), x + 6, y - 4, 60, 0, f.d !== 1); return; }
    if (nm === 'whirl') { fxFrame(g, 'whirl', k, x, y, Math.max(80, R * 1.5), 1); return; }
    if (nm === 'ice') { fxFrame(g, 'ice', k, x, y, Math.max(70, R * 1.2), 1); if (R > 40) { fxFrame(g, 'ice', Math.min(0.99, k + 0.15), x - R * 0.5, y + 6, 50, 1); fxFrame(g, 'ice', Math.min(0.99, k + 0.3), x + R * 0.5, y - 4, 50, 1); } return; }
    if (nm === 'bolt') { fxFrame(g, 'bolt', k, x, y, Math.max(90, R * 1.3), 1); return; }
    if (nm === 'heal') { fxFrame(g, 'heal', k, x, y + 4, Math.max(70, R * 1.2), 1); return; }
    return _dsf(g, f, k, x, y);
  };

  // ── 말 탑승 (갈색 말 / 천리 백마) ──
  const _cs = charSprite, hc = new Map();
  charSprite = function (ap, dir, frame) {
    const MK = ap.mt === 'whiteHorse' ? 'horse' : ap.mt; if (!ap.mt || !HO.ok || !HA[MK]) return _cs(ap, dir, frame);
    const key = JSON.stringify(ap) + dir + frame; let c = hc.get(key); if (c) return c; if (hc.size > 300) hc.clear();
    const rider = _cs(Object.assign({}, ap, { mt: null }), dir, frame === 1 || frame === 3 ? 0 : frame);
    const d = ['down', 'left', 'right', 'up'][dir] || 'down'; const col = frame === 1 ? 1 : frame === 3 ? 2 : 0; const r = HA[MK][d][col]; const SEAT = { horse: [0.42, 0.12], camel: [0.36, 0.06], ostrich: [0.44, 0.0] }[MK];
    c = mkc(220, 220); const g = c.getContext('2d'); g.imageSmoothingEnabled = true;
    const hw = r[2] * 1.75, hh = r[3] * 1.75; const hx = 110 - hw / 2, hy = 218 - hh;
    let hor = mkc(r[2], r[3]); hor.getContext('2d').drawImage(HO, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
    if (ap.mt === 'whiteHorse') { const hg = hor.getContext('2d'); hg.globalCompositeOperation = 'saturation'; hg.fillStyle = '#888'; hg.fillRect(0, 0, r[2], r[3]); hg.globalCompositeOperation = 'screen'; hg.fillStyle = 'rgba(150,150,160,1)'; hg.fillRect(0, 0, r[2], r[3]); hg.globalCompositeOperation = 'destination-in'; hg.drawImage(HO, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]); }
    const seatY = hy + hh * (d === 'left' || d === 'right' ? SEAT[0] : SEAT[0] - 0.04), seatX = 110 + (d === 'left' ? hw * 0.08 : d === 'right' ? -hw * 0.08 : 0);
    const cut = 96; // 라이더 상체 (112x160 중 위쪽)
    const drawRider = () => g.drawImage(rider, 0, 0, 112, cut, seatX - 56, seatY - cut + 22, 112, cut);
    if (d === 'down') { const sy2 = hy + hh * SEAT[1]; g.drawImage(rider, 0, 0, 112, cut, seatX - 56, sy2 - cut + 22, 112, cut); g.save(); g.beginPath(); g.rect(hx, hy + hh * 0.18, hw, hh); g.clip(); g.drawImage(hor, hx, hy, hw, hh); g.restore(); if (MK === 'ostrich') { g.save(); g.beginPath(); g.rect(hx + hw * 0.3, hy + hh * 0.12, hw * 0.4, hh * 0.3); g.clip(); g.drawImage(hor, hx, hy, hw, hh); g.restore(); } g.save(); g.beginPath(); g.rect(hx, hy, hw, hh * 0.18); g.clip(); g.globalAlpha = 1; g.restore(); }
    else { g.drawImage(hor, hx, hy, hw, hh); drawRider(); }
    c.dw = 110; c.dh = 110; hc.set(key, c); return c;
  };

  // ── NPC (GPT 그림, 가까우면 플레이어 쪽을 봄) ──
  const _dn = drawNpc;
  drawNpc = function (n, sx, sy, now) {
    const fr = NA[n.kind] || NA.guide; if (!NPI.ok || !fr) return _dn(n, sx, sy, now);
    const x = n.x * TS + 16 - sx, y = n.y * TS + 32 - sy; if (x < -60 || x > W + 60 || y < -100 || y > H + 80) return;
    let d = 0; const dx = pos.x - n.x, dy = pos.y - n.y; if (Math.abs(dx) + Math.abs(dy) <= 5 && (dx || dy)) d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
    const r = fr[d]; const s = 0.47, w = r[2] * s, h = r[3] * s; const br = Math.sin(now / 600 + n.x) > 0.6 ? 1 : 0;
    shadowAt(x, y, 12); ctx.imageSmoothingEnabled = true; _di.call(ctx, NPI, r[0], r[1], r[2], r[3], Math.round(x - w / 2), Math.round(y - h + 3 - br), w, h + br); ctx.imageSmoothingEnabled = false;
    NAMEQ.push(() => { drawText(n.name, x, y + 15, '#ffe08a', 13);
    const bob = Math.sin(now / 250) * 3; drawText(n.kind === 'guide' ? '?' : '!', x, y - h - 4 + bob, '#ffd000', 18); });
  };

  // ── 스킬/공격 버튼 (아트 아이콘) ──
  const artCache = {};
  function skillArt(sk) {
    let nm = null, item = null; const b = sk.jobs[0];
    switch (sk.kind) {
      case 'melee': nm = 'slash'; break; case 'aoeSelf': case 'taunt': nm = 'whirl'; break;
      case 'proj': if (b === 'healer') item = 'w_bow_6'; else nm = 'fire'; break;
      case 'multi': nm = 'bolt'; break; case 'aoeTarget': nm = sk.fx === 'ice' ? 'ice' : sk.fx === 'rain' ? null : 'fire'; if (sk.fx === 'rain') item = 'w_crossbow_7'; break;
      case 'line': item = b === 'healer' ? 'w_bow_8' : 'w_spear_7'; break; case 'heal': nm = 'heal'; break;
      case 'buff': case 'partyBuff': nm = 'heal'; break; case 'summon': item = 'w_staff_8'; break;
    }
    const k = (nm || item || 'x') + sk.name; if (artCache[k]) return artCache[k];
    const c = mkc(96, 96), g = c.getContext('2d'); g.imageSmoothingEnabled = true;
    if (nm && FA[nm]) { const fr = FA[nm][nm === 'fire' ? 1 : nm === 'slash' ? 3 : 3]; const s = 84 / Math.max(fr[2], fr[3]); _di.call(g, FXI, fr[0], fr[1], fr[2], fr[3], 48 - fr[2] * s / 2, 48 - fr[3] * s / 2, fr[2] * s, fr[3] * s); }
    else if (item && IA[item]) _di.call(g, IT, IA[item][0], IA[item][1], 64, 64, 8, 8, 80, 80);
    else return null;
    return (artCache[k] = c.toDataURL());
  }
  function paintSkillBtns() {
    if (!S.touchCd || !S.me || !FXI.ok || !IT.ok) return;
    S.touchCd.forEach((d, i) => {
      const sk = GD.SKILL[S.me.skills[i]]; const si = d.querySelector('.si'); if (!si) return;
      const on = sk && S.me.lv >= sk.lv; const key = (sk ? sk.name : '') + on;
      if (si.dataset.k === key && si.innerHTML === si._h) return; si.dataset.k = key;
      const url = on && skillArt(sk); d.classList.toggle('lockd', !on);
      si.innerHTML = url ? `<img src="${url}" alt="">` : ic('lock'); si._h = si.innerHTML;
    });
    const atk = document.querySelector('#acts .tb.atk');
    if (atk) { const w = S.me.eq && S.me.eq.weapon; const k = w ? iconKey(w) : ['w_' + ({ warrior: 'sword', mage: 'staff', healer: 'bow' }[GD.JOBS[S.me.job] ? GD.JOBS[S.me.job].base : 'warrior']) + '_0'];
      const kk = k && k.join('|'); if ((atk.dataset.k !== kk || !atk.querySelector('img.wpn')) && k && IA[k[0]]) { atk.dataset.k = kk; const c = itemIcon(w || { k: 'gear', slot: 'weapon', wt: k[0].split('_')[1], tier: 0 }); atk.innerHTML = `<img class="wpn" src="${c.toDataURL()}" alt=""><span class="sn">공격</span>`; } }
  }
  const _rh = refreshHud; refreshHud = function (full) { _rh(full); try { paintSkillBtns(); } catch (e) { } };
  const st = document.createElement('style'); st.textContent = `
#skillgrid .tb{background:linear-gradient(#1c2630,#121820)!important;border:2px solid #3c8a3e!important;border-radius:7px!important;box-shadow:inset 0 0 0 2px #0b1208,0 2px 0 #0008,0 0 6px #3c8a3e55!important;overflow:hidden}
#skillgrid .tb .si{position:absolute;inset:3px 3px 12px 3px;margin:0!important;display:flex;align-items:center;justify-content:center}
#skillgrid .tb .si img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 1px #000)}
#skillgrid .tb .sn{position:absolute;left:0;right:0;bottom:1px;text-align:center;max-width:none!important;font-size:9px!important;text-shadow:0 0 2px #000,0 1px 2px #000,1px 0 2px #000}
#skillgrid .tb .kn{z-index:2;color:#ffe9a8;text-shadow:0 1px 2px #000;font-weight:800}
#skillgrid .tb.lockd{border-color:#4a4f58!important;box-shadow:inset 0 0 0 2px #0b0d10!important;opacity:.75}
#skillgrid .tb .cdm{z-index:3;background:rgba(0,0,0,.62)!important}
#acts .tb.atk{border-radius:50%!important;width:108px!important;height:108px!important;background:radial-gradient(circle at 50% 40%,#2b3f66,#14203a 70%)!important;border:3px solid #c99a3a!important;box-shadow:inset 0 0 0 3px #0c1424,inset 0 0 0 6px #3e5a8a,0 3px 0 #0009,0 0 10px #c99a3a55!important}
#acts .tb.atk img.wpn{width:66px;height:66px;filter:drop-shadow(0 2px 2px #000);transform:rotate(0deg)}
#acts .tb.atk .sn{position:absolute;bottom:12px;font-size:11px!important;color:#ffe9b0;text-shadow:0 0 3px #000,0 1px 2px #000}
#acts .tb.atk.held{background:radial-gradient(circle at 50% 40%,#3e5a8a,#1c2a48 70%)!important;transform:scale(.94)}
#skillgrid .tb.pressed{transform:scale(.9);filter:brightness(1.35)}
`; document.head.appendChild(st);
})();
// 창이 열리면 캐릭터 메뉴 팝업 닫기
(function () { const _op = openPanel; openPanel = function () { try { closePM(); } catch (e) { } return _op.apply(this, arguments); }; })();
// ═══════ 타격감: 화면 흔들림 · 피격 번쩍임 · 넉백 · 타격 불꽃 · 진동 ═══════
(function () {
  const SP = []; let shk = 0, shkT = 0, shkD = 1;
  function shake(a, d) { if (a >= shk * Math.max(0, 1 - (performance.now() - shkT) / shkD)) { shk = a; shkT = performance.now(); shkD = d; } }
  const _af2 = addFx;
  addFx = function (f) {
    const r = _af2(f);
    if (f.k === 'dmg' && !f.p && f.by && f.by === S.myId) {
      const now = performance.now(); const mo = f.i != null ? S.M.get(f.i) : null;
      if (mo) { mo.hitT = now; const dx = mo.x - pos.x, dy = mo.y - pos.y, L = Math.hypot(dx, dy) || 1; mo.kx = dx / L; mo.ky = dy / L; }
      const big = f.c || f.b;
      shake(f.c ? 5 : f.b ? 3.5 : 2.2, f.c ? 200 : 140);
      const n = f.c ? 12 : big ? 9 : 6, cx = f.x, cy = f.y;
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = (f.c ? 2.6 : 1.8) + Math.random() * 1.6; SP.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, t0: now, life: 220 + Math.random() * 120, c: f.c ? (i % 2 ? '#ffb020' : '#fff3a0') : (i % 3 ? '#ffffff' : '#ffe08a') }); }
      SP.push({ ring: 1, x: cx, y: cy, t0: now, life: f.c ? 260 : 180, c: f.c ? '#ffb020' : '#ffffff' });
      try { navigator.vibrate && navigator.vibrate(f.c ? 30 : 12); } catch (e) { }
    } else if (f.k === 'dmg' && f.p && f.x === pos.x && f.y === pos.y) { shake(4, 180); try { navigator.vibrate && navigator.vibrate(25); } catch (e) { } }
    return r;
  };
  const _dfx = drawFx;
  drawFx = function (now, sx, sy, layer) {
    _dfx(now, sx, sy, layer);
    if (layer !== 'mid' || !SP.length) return;
    const g = ctx; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = SP.length - 1; i >= 0; i--) {
      const p = SP[i], k = (now - p.t0) / p.life; if (k >= 1) { SP.splice(i, 1); continue; }
      const X = p.x * TS + 16 - sx, Y = p.y * TS + 16 - sy - 14;
      g.globalAlpha = 1 - k;
      if (p.ring) { g.strokeStyle = p.c; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.ellipse(X, Y, 6 + k * 20, 4 + k * 14, 0, 0, 7); g.stroke(); continue; }
      const d = k * 14, x1 = X + p.vx * d, y1 = Y + p.vy * d + k * k * 6, x0 = X + p.vx * d * 0.4, y0 = Y + p.vy * d * 0.4;
      g.strokeStyle = p.c; g.lineWidth = 2.4 * (1 - k) + 0.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.restore();
  };
  // 카메라 흔들기 (월드만, HUD는 그대로)
  window.shakeOff = function () { const e = performance.now() - shkT; if (!shk || e >= shkD) { shk = 0; return null; } const a = shk * (1 - e / shkD); return [Math.round((Math.random() * 2 - 1) * a), Math.round((Math.random() * 2 - 1) * a)]; };
})();
// ═══════ 조이스틱 v4: 안드로이드 대응 (터치 이벤트 직접 처리 + 브라우저 제스처 차단) ═══════
(function () {
  const st = document.createElement('style'); st.textContent = '#dpad,#dpad *,#touch,#acts,#acts *,#skillgrid,#skillgrid *,#utilbar,#utilbar *{touch-action:none!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}html,body{overscroll-behavior:none}';
  document.head.appendChild(st);
  const _bt4 = buildTouch;
  buildTouch = function () {
    _bt4();
    const dp = $('dpad'), knob = $('knob'); if (!dp || !knob) return;
    let active = null, ox = 0, oy = 0, cur = null;
    const VEC = { E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1], N: [0, -1], NE: [1, -1] };
    const sec = [['E', 0], ['SE', 45], ['S', 90], ['SW', 135], ['W', 180], ['NW', 225], ['N', 270], ['NE', 315]];
    const half = n => n.length === 1 ? 27 : 18, diff = (x, y) => Math.abs(((x - y + 540) % 360) - 180);
    const pickDir = deg => { const a = (deg + 360) % 360; if (cur) { const c = sec.find(s => s[0] === cur); if (diff(a, c[1]) <= half(cur) + 5) return cur; } let best = 'E', bd = 999; for (const [n, c] of sec) { const d = diff(a, c) - half(n); if (d < bd) { bd = d; best = n; } } return best; };
    const start = (id, x, y) => { active = id; ox = x; oy = y; cur = null; window.touchFace = null; };
    const move = (x, y) => {
      const r = dp.getBoundingClientRect(), sc = 120 / (r.width || 120);
      const dx = (x - ox) * sc, dy = (y - oy) * sc, dist = Math.hypot(dx, dy), lim = 38;
      const k = dist > lim ? lim / dist : 1; knob.style.transform = `translate(${dx * k}px,${dy * k}px)`;
      if (dist < 13) { if (dist < 9) { cur = null; touchVec = null; touchDir = -1; } return; }
      if (dist > 70) { ox += (x - ox) * (1 - 70 / dist); oy += (y - oy) * (1 - 70 / dist); }
      cur = pickDir(Math.atan2(dy, dx) * 180 / Math.PI); touchVec = VEC[cur]; touchDir = dirOf(touchVec[0], touchVec[1]);
      const tf = Math.abs(dx) > Math.abs(dy) * 1.15 ? (dx > 0 ? 2 : 1) : Math.abs(dy) > Math.abs(dx) * 1.15 ? (dy > 0 ? 0 : 3) : window.touchFace; window.touchFace = tf != null ? tf : (Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 2 : 1) : (dy > 0 ? 0 : 3));
    };
    const end = () => { active = null; cur = null; touchVec = null; touchDir = -1; window.touchFace = null; knob.style.transform = ''; };
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    // 마우스·펜용 포인터 (터치는 아래 터치 이벤트가 담당)
    dp.onpointerdown = e => { if (e.pointerType === 'touch' && hasTouch) return; active = e.pointerId; try { dp.setPointerCapture(e.pointerId); } catch (_) { } start(e.pointerId, e.clientX, e.clientY); e.preventDefault(); };
    dp.onpointermove = e => { if (e.pointerType === 'touch' && hasTouch) return; if (active === e.pointerId) move(e.clientX, e.clientY); };
    dp.onpointerup = dp.onpointercancel = e => { if (e.pointerType === 'touch' && hasTouch) return; end(); };
    dp._jh = { start, move, end, get active() { return active; } };
    if (hasTouch && !dp._t4) {
      dp._t4 = 1; const o = { passive: false }; const H = () => dp._jh;
      const find = (list) => { const a = H().active; for (const t of list) if (t.identifier === a) return t; return null; };
      dp.addEventListener('touchstart', e => { e.preventDefault(); if (H().active !== null && find(e.touches)) return; const t = e.changedTouches[0]; H().start(t.identifier, t.clientX, t.clientY); }, o);
      // 손가락이 조이스틱 밖으로 나가도 계속 따라감
      window.addEventListener('touchmove', e => { if (H().active === null) return; const t = find(e.changedTouches); if (t) { H().move(t.clientX, t.clientY); if (e.cancelable) e.preventDefault(); } }, o);
      const fin = e => { if (H().active === null) return; if (find(e.changedTouches)) H().end(); };
      window.addEventListener('touchend', fin, o); window.addEventListener('touchcancel', fin, o);
    }
  };
})();
// ═══════ 서버 아이패드: 꺼짐 방지 ═══════
(function () {
  let vid = null;
  function awakeVideo() {
    if (!vid) { vid = document.createElement('video'); vid.src = 'sfx/awake.mp4'; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.setAttribute('muted', ''); vid.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1'; document.body.appendChild(vid); }
    const p = vid.play(); if (p && p.catch) p.catch(() => { });
  }
  let wl = null;
  async function lock() { try { if ('wakeLock' in navigator && document.visibilityState === 'visible' && (!wl || wl.released)) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { } }
  function keep() { lock(); awakeVideo(); }
  const _sd = showServerDash;
  showServerDash = function (code, restored) {
    _sd(code, restored);
    // 새로고침·탭 복구 시 자동으로 같은 방을 다시 엶
    try { history.replaceState(null, '', location.pathname + location.search + '#server' + code); } catch (e) { }
    keep(); setInterval(keep, 20000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keep(); });
    document.addEventListener('pointerdown', keep, { passive: true });
    const info = document.createElement('div'); info.id = 'svkeep'; info.className = 'mut'; info.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:71;font-size:12px;text-align:center;line-height:1.5;color:#9fb0c0';
    info.innerHTML = '화면 꺼짐 방지 켜짐 · 꺼지거나 새로고침돼도 같은 방으로 자동 복구돼요<br>더 확실하게: 설정 › 디스플레이 및 밝기 › 자동 잠금 › <b style="color:#ffe08a">안 함</b> · 충전기 연결';
    document.body.appendChild(info);
  };
  // 새 버전: 접속자가 0명일 때만 저장 후 자동 적용 (접속 중이면 기다림)
  let pend = false;
  window.serverUpdate = function () {
    if (pend) return; pend = true;
    const tryApply = () => {
      let n = 1; try { n = ENGINE.online().length; } catch (e) { }
      const msg = $('svmsg'); if (n > 0) { if (msg) msg.textContent = `새 버전이 있어요. 접속자가 모두 나가면 자동으로 적용돼요 (현재 ${n}명).`; setTimeout(tryApply, 30000); return; }
      try { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); } catch (e) { }
      setTimeout(() => { try { history.replaceState(null, '', location.pathname + '#server' + NET.code); } catch (e) { } location.reload(); }, 1500);
    };
    tryApply();
  };
})();

// ═══════ 캐릭터 선택: 게임 중 나가기 + 로비에서 내 캐릭터 목록 ═══════
(function () {
  const KEY = 'baram_chars';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const save = l => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 3))); } catch (e) { } };
  setInterval(() => {
    if (!S.me || !NET.code || NET.serverOnly) return;
    let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
    const role = mem.role === 'host' && mem.code === NET.code ? 'host' : 'join';
    const l = load().filter(c => !(c.name === S.me.name && c.code === NET.code));
    const old = load().findIndex(c => c.name === S.me.name && c.code === NET.code); const ent = { name: S.me.name, code: NET.code, job: S.me.job, lv: S.me.lv, role, g: S.me.gender, h: S.me.hair, hc: S.me.hairColor, sk: S.me.skin, t: Date.now() }; if (old >= 0) l.splice(old, 0, ent); else l.push(ent); save(l);
  }, 5000);
  // 게임 메뉴에 [캐릭터] 버튼
  function addBtn() {
    if ($('charsel') || !$('menu')) return;
    const b = document.createElement('div'); b.className = 'mbtn'; b.id = 'charsel'; b.innerHTML = `${ic('users')}<span>캐릭터</span>`;
    b.onclick = () => {
      let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
      const iAmHost = mem.role === 'host' && mem.code === NET.code;
      const q = iAmHost ? '캐릭터 선택 화면으로 갈까요?\n지금 방장이라 나가면 이 방이 잠시 닫혀요 (저장은 돼요).' : '캐릭터 선택 화면으로 갈까요? (저장은 자동으로 돼요)';
      if (!confirm(q)) return;
      try { if (iAmHost) { NET._bkT = 0; NET._lastBk = null; ENGINE.saveAll(); } } catch (e) { }
      setTimeout(() => { try { history.replaceState(null, '', location.pathname + (NET.code ? '#' + NET.code : '')); } catch (e) { } location.reload(); }, 600);
    };
    $('menu').appendChild(b);
  }
  addBtn(); setTimeout(addBtn, 1500);
  // 로비: 캐릭터 선택 (최대 3명)
  const MAXC = 3;
  if (typeof webLobby === 'function') {
    const _wl = webLobby;
    webLobby = function () {
      _wl();
      const L = $('lobby'); if (!L) return;
      const JN = { warrior: '전사', mage: '마법사', healer: '치유사' };
      const jobName = j => (GD.JOBS[j] && GD.JOBS[j].name) || JN[(GD.JOBS[j] || {}).base] || '';
      const box = document.createElement('div'); box.id = 'mychars'; L.insertBefore(box, L.firstChild);
      const st = document.createElement('style'); st.textContent = `#mychars{margin:0 0 8px}#mychars .cslots{display:flex;gap:6px}#mychars .cs{flex:1;min-width:0;height:64px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);display:flex;align-items:center;gap:6px;padding:4px 6px;position:relative;cursor:pointer;color:#fff}#mychars .cs.sel{border-color:#ffd166;box-shadow:0 0 0 2px #ffd16655;background:rgba(255,209,102,.08)}#mychars .cs canvas{width:34px;height:48px;flex:none;image-rendering:auto}#mychars .cs .ci{display:flex;flex-direction:column;min-width:0;line-height:1.2;text-align:left}#mychars .cs b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mychars .cs small{font-size:10px;color:#9fb0c0;white-space:nowrap}#mychars .cs.empty{justify-content:center;color:#9fb0c0;border-style:dashed}#mychars .cs .del{position:absolute;right:2px;top:2px;width:20px;height:20px;border-radius:5px;background:rgba(0,0,0,.35);color:#f88;font-size:12px;display:flex;align-items:center;justify-content:center}#mychars .ch{display:flex;align-items:center;font-size:12px;color:#9fb0c0;margin-bottom:4px}`;
      document.head.appendChild(st);
      let sel = -1;
      const render = () => {
        const list = load().slice(0, MAXC);
        let h = `<div class="ch"><b style="color:#fff;font-size:13px">캐릭터 선택</b><span style="margin-left:6px">(${list.length}/${MAXC}) · 고르면 바로 접속</span></div><div class="cslots">`;
        for (let k = 0; k < MAXC; k++) {
          const c = list[k];
          if (c) h += `<div class="cs${sel === k ? ' sel' : ''}" data-k="${k}"><canvas width="56" height="80"></canvas><div class="ci"><b>${esc(c.name)}</b><small>Lv${c.lv} ${jobName(c.job)}</small><small>방 ${c.code}</small></div><div class="del" data-del="${k}">✕</div></div>`;
          else h += `<div class="cs empty${sel === k ? ' sel' : ''}" data-k="${k}">＋ 새 캐릭터</div>`;
        }
        box.innerHTML = h + '</div>';
        box.querySelectorAll('.cs').forEach(el => {
          const k = +el.dataset.k, c = list[k];
          if (c) { const cv = el.querySelector('canvas'); try { const im = charSprite({ job: c.job, g: c.g || 'm', h: c.h || 0, hc: c.hc || 0, sk: c.sk || 0, eq: {} }, 0, 0); cv.getContext('2d').drawImage(im, 0, 0, 56, 80); } catch (e) { } }
          el.onclick = e => {
            if (e.target.dataset.del != null) {
              if (!confirm(`'${c.name}' 캐릭터를 완전히 삭제할까요?\n레벨·아이템·텐트가 모두 사라지고 되돌릴 수 없어요.\n(다음에 방 ${c.code}에 들어갈 때 서버에서도 삭제돼요)`)) return;
              const l = load(); l.splice(k, 1); save(l);
              try { const dl = JSON.parse(localStorage.getItem('baram_del') || '[]').filter(d => !(d.name === c.name && d.code === c.code)); dl.push({ name: c.name, code: c.code }); localStorage.setItem('baram_del', JSON.stringify(dl)); } catch (e2) { }
              try { const mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); if (mem.name === c.name) { delete mem.name; localStorage.setItem('baram_last', JSON.stringify(mem)); } } catch (e2) { }
              if ($('nm').value === c.name) $('nm').value = '';
              sel = -1; render(); return;
            }
            sel = k; render();
            if (c) { $('nm').value = c.name; $('lcode').value = c.code; if (c.role === 'host' && $('lhost')) $('lhost').click(); else if ($('ljoin')) $('ljoin').click(); }
            else { $('nm').value = ''; $('nm').placeholder = '새 캐릭터 이름 (최대 10자)'; $('nm').focus(); }
          };
        });
      };
      render();
      // 예전 [이어하기] 버튼은 캐릭터 칸으로 대체 (서버 기기용만 유지) · 지운 캐릭터 이름이 남지 않게
      { let mem = {}; try { mem = JSON.parse(localStorage.getItem('baram_last') || '{}'); } catch (e) { }
        const lc = $('lcont'); if (lc && mem.role !== 'server') lc.remove();
        const names = load().map(c => c.name); if ($('nm').value && !names.includes($('nm').value)) $('nm').value = ''; }
      // 4번째 캐릭터는 만들 수 없음
      L.addEventListener('click', e => {
        const b = e.target.closest('#lhost,#ljoin,#lsolo'); if (!b) return;
        const n = ($('nm').value || '').trim(); if (!n) return;
        const list = load(); if (list.some(c => c.name === n)) return;
        if (list.length >= MAXC) { e.stopImmediatePropagation(); e.preventDefault(); const er = $('lerr'); if (er) er.textContent = `캐릭터는 ${MAXC}개까지 만들 수 있어요. 위 목록에서 하나를 지우고 만들어 주세요.`; }
      }, true);
    };
  }
})();

// 접속 성공 시: 서버에 보낸 삭제 요청 정리, 삭제했던 이름이 다시 목록에 들어오지 않게
(function () { const _om = onMsg; onMsg = function (m) { const r = _om(m); if (m && m.t === 'welcome') { try { const dl = JSON.parse(localStorage.getItem('baram_del') || '[]').filter(d => d.code !== NET.code); localStorage.setItem('baram_del', JSON.stringify(dl)); } catch (e) { } } return r; }; })();
// ═══════ 파티·교환 신청: 눈에 띄는 수락/거절 팝업 (20초 후 자동 거절) ═══════
(function () {
  const st = document.createElement('style'); st.textContent = `#askcard{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:95;min-width:300px;max-width:92vw;background:linear-gradient(#26303c,#1a2129);border:2px solid #ffd166;border-radius:12px;box-shadow:0 8px 30px #000a,0 0 0 4px #ffd16633;padding:12px 14px;color:#fff;animation:askin .25s ease-out}@keyframes askin{from{transform:translate(-50%,-20px);opacity:0}}#askcard .at{font-size:15px;font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:6px}#askcard .ad{font-size:12px;color:#b8c4d0;margin-bottom:10px}#askcard .ab{display:flex;gap:8px}#askcard .ab button{flex:1;height:44px;font-size:15px;font-weight:800;border-radius:8px;border:0;color:#fff}#askcard .yes{background:#22a35a}#askcard .no{background:#4a5260}#askcard .bar{height:3px;background:#ffd166;border-radius:2px;margin-top:8px;transition:width 20s linear}`;
  document.head.appendChild(st);
  let tm = null;
  function ask(kind, from) {
    const old = $('askcard'); if (old) old.remove(); clearTimeout(tm);
    const isP = kind === 'party';
    const d = document.createElement('div'); d.id = 'askcard';
    d.innerHTML = `<div class="at">${ic(isP ? 'users' : 'swap')} ${esc(from)}님의 ${isP ? '파티' : '교환'} 신청</div><div class="ad">${isP ? '수락하면 근처(12칸)에서 경험치를 함께 얻어요.' : '수락하면 교환 창이 열려요.'}</div><div class="ab"><button class="yes">수락</button><button class="no">거절</button></div><div class="bar" style="width:100%"></div>`;
    document.body.appendChild(d); requestAnimationFrame(() => { const b = d.querySelector('.bar'); if (b) b.style.width = '0%'; });
    const done = yes => { clearTimeout(tm); d.remove(); send({ t: isP ? (yes ? 'partyYes' : 'partyNo') : (yes ? 'tradeYes' : 'tradeNo') }); };
    const yb = d.querySelector('.yes'), nb = d.querySelector('.no');
    yb.addEventListener('pointerup', e => { e.preventDefault(); e.stopPropagation(); done(true); }); nb.addEventListener('pointerup', e => { e.preventDefault(); e.stopPropagation(); done(false); });
    d.addEventListener('pointerdown', e => e.stopPropagation());
    tm = setTimeout(() => { if (d.isConnected) done(false); }, 20000);
    try { SND.play('rare'); } catch (e) { } try { navigator.vibrate && navigator.vibrate([60, 60, 60]); } catch (e) { }
  }
  const _om = onMsg;
  onMsg = function (m) {
    if (m && m.t === 'partyAsk') { ask('party', m.from); return; }
    if (m && m.t === 'tradeAsk') { ask('trade', m.from); return; }
    return _om(m);
  };
})();
// ═══════ 화려한 스킬 이펙트: 빛 번짐 · 충격파 고리 · 불꽃 입자 · 투사체 꼬리 ═══════
(function () {
  const COL = { slash: '#ffd34d', slash3: '#ffe27a', spin: '#ffffff', ring: '#ffffff', quake: '#ffb060', flame: '#ff7a1a', meteor: '#ff3d00', ice: '#8fe3ff', bolt: '#fff36b', holy: '#fff6c0', bless: '#ffe9a0', heal: '#7dff9a', bigheal: '#7dff9a', buff: '#ff8a5a', rain: '#f0e6b0', pierce: '#fff8c8', summon: '#c98aff' };
  const rnd = s => { s = Math.sin(s * 12.9898) * 43758.5453; return s - Math.floor(s); };
  function glow(g, x, y, r, col, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(0.35, col + 'aa'); gr.addColorStop(1, col + '00'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  const _dsf2 = drawSkillFx;
  drawSkillFx = function (g, f, k, x, y) {
    const col = f.c && /^#[0-9a-f]{6}$/i.test(f.c) ? f.c : (COL[f.f] || '#ffffff');
    const R = Math.max(1, f.r || 1) * TS; const big = (f.r || 1) >= 2.5 || f.f === 'meteor';
    g.save(); g.globalCompositeOperation = 'lighter';
    // 바닥 빛 + 충격파 고리 2겹
    glow(g, x, y, R * (0.6 + k * 0.9), col, (1 - k) * 0.55);
    for (const off of [0, 0.18]) { const kk = k - off; if (kk <= 0) continue; g.globalAlpha = Math.max(0, 1 - kk) * 0.9; g.strokeStyle = col; g.lineWidth = (1 - kk) * (big ? 7 : 4) + 1; g.beginPath(); g.ellipse(x, y + 4, R * (0.3 + kk * 1.1), R * (0.3 + kk * 1.1) * 0.45, 0, 0, 7); g.stroke(); }
    // 튀는 입자
    const n = big ? 26 : 14, seed = (f.t0 || 1) * 0.001;
    for (let i = 0; i < n; i++) {
      const a = rnd(seed + i) * Math.PI * 2, sp = (0.4 + rnd(seed + i + 50) * 0.9) * R * 1.1, up = (f.f === 'heal' || f.f === 'bigheal' || f.f === 'bless' || f.f === 'buff') ? 1 : 0;
      const px = x + Math.cos(a) * sp * (up ? 0.35 : k), py = y + (up ? -k * (30 + rnd(seed + i + 9) * 40) + Math.sin(a) * 8 : Math.sin(a) * sp * k * 0.55 - k * k * 10);
      const s = (1 - k) * (big ? 3.4 : 2.6) + 0.6; g.globalAlpha = (1 - k);
      g.fillStyle = i % 3 ? col : '#ffffff'; g.fillRect(px - s / 2, py - s / 2, s, s);
    }
    // 큰 기술: 순간 섬광
    if (big && k < 0.18) { g.globalAlpha = (0.18 - k) / 0.18 * 0.35; g.fillStyle = col; g.fillRect(x - W, y - H, W * 2, H * 2); }
    g.restore();
    return _dsf2(g, f, k, x, y);
  };
  // 투사체: 빛나는 머리 + 꼬리
  const _dfx2 = drawFx;
  drawFx = function (now, sx, sy, layer) {
    if (layer === 'mid') {
      const g = ctx; g.save(); g.globalCompositeOperation = 'lighter';
      for (const f of S.fx) {
        if (f.k !== 'proj') continue; const k = (now - f.t0) / f.dur; if (k < 0 || k > 1) continue;
        const col = f.c && /^#[0-9a-f]{6}$/i.test(f.c) ? f.c : '#ffd27a';
        for (let j = 0; j < 7; j++) { const kk = Math.max(0, k - j * 0.035); const X = (f.fx + (f.tx - f.fx) * kk) * TS + 16 - sx, Y = (f.fy + (f.ty - f.fy) * kk) * TS + 16 - sy - 12;
          glow(g, X, Y, (j ? 9 : 16) - j, col, (1 - j / 7) * 0.7); }
      }
      g.restore();
    }
    return _dfx2(now, sx, sy, layer);
  };
})();
