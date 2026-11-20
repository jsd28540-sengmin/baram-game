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
