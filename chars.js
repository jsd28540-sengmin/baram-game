// ═══════════════════════════════════════════
//  캐릭터 v2 — 큰 머리 치비 도트 (따뜻한 색, 3단 음영, 갈색 외곽선)
//  28x40 논리 픽셀 → 56x80 화면. 탈것 탑승 모습은 기존 그림 사용.
// ═══════════════════════════════════════════
const _charOld = charSprite;
const charCache2 = new Map();
charSprite = function (ap, dir, frame) {
  if (ap.mt) return _charOld(ap, dir, frame);
  const key = JSON.stringify(ap) + '|' + dir + '|' + frame;
  let c = charCache2.get(key); if (c) return c;
  if (charCache2.size > 700) charCache2.clear();
  const flip = dir === 1, d = flip ? 2 : dir;
  const base = GD.JOBS[ap.job] ? GD.JOBS[ap.job].base : 'warrior';
  const eq = ap.eq || {}; const tier = s => eq[s] ? eq[s][0] : -1; const tcol = s => eq[s] ? GD.TIER_COLOR[eq[s][0]] : null;
  const fem = ap.g === 'f';
  const skin = SKIN[ap.sk || 0], skD = shade(skin, -0.2), skL = shade(skin, 0.15);
  const hair = HAIRC[ap.hc || 0], hD = shade(hair, -0.32), hL = shade(hair, 0.28);
  let hs = ap.h || 0; if (fem && hs === 0) hs = 2;
  const eyeC = ['#3a4ab0', '#6a3a18', '#2a7a5a', '#7a2a5a', '#3a3a4a', '#a03a2a', '#2a5ad0', '#6a2ab0'][ap.hc || 0];
  // 옷 색
  const DEF = { warrior: '#b8402e', mage: '#2f4a8a', healer: '#4f8a34' };
  const armorT = tier('armor'); const cloth = armorT >= 0 ? (base === 'warrior' ? GD.TIER_COLOR[armorT] : shade(GD.TIER_COLOR[armorT], base === 'mage' ? -0.15 : -0.05)) : DEF[base];
  const cD = shade(cloth, -0.3), cL = shade(cloth, 0.22);
  const plate = base === 'warrior' && armorT >= 0;
  const robe = base === 'mage' || (fem && base === 'healer' && armorT < 0);
  const boots = tcol('boots') || '#5a3a24', bootsL = shade(boots, 0.25);
  const gloves = tcol('gloves') || skin;
  const pants = base === 'mage' ? '#2a2a3a' : '#5a3f2c';
  const GOLD = '#e8b830';
  const helmT = tier('helmet');
  const wt = eq.weapon ? eq.weapon[3] : (base === 'warrior' ? 'sword' : base === 'mage' ? 'staff' : 'bow');
  const W_ = GD.TIER_COLOR[eq.weapon ? eq.weapon[0] : 3], Wd = shade(W_, -0.35), Wl = shade(W_, 0.45);
  const step = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const s = lowres(28, 40, A => {
    const { P, px, circ, ell, poly } = A;
    const bob = step ? -0.5 : 0;
    // ── 무기 (등 뒤: 뒷모습) ──
    const weapon = (hx, hy) => {
      switch (wt) {
        case 'sword': P(hx, hy - 11, 1.6, 11, Wl); P(hx + 0.8, hy - 11, 0.8, 11, W_); P(hx, hy - 12, 1.6, 1, Wl); P(hx - 1.4, hy, 4.4, 1, '#c89a30'); P(hx + 0.2, hy + 1, 1.2, 2, '#5a3418'); break;
        case 'axe': P(hx, hy - 9, 1.2, 13, '#7a4a22'); poly([[hx + 1, hy - 9], [hx + 4.5, hy - 10.5], [hx + 5, hy - 4], [hx + 1, hy - 5]], W_); P(hx + 4, hy - 10, 1, 6, Wl); break;
        case 'spear': P(hx, hy - 15, 1.1, 20, '#7a4a22'); poly([[hx - 0.8, hy - 15], [hx + 0.55, hy - 19.5], [hx + 1.9, hy - 15]], Wl); P(hx - 0.4, hy - 14.5, 1.9, 1, '#c89a30'); break;
        case 'staff': P(hx, hy - 14, 1.3, 19, '#7a4a22'); P(hx, hy - 14, 0.5, 19, '#9a6a3a'); circ(hx + 0.65, hy - 16, 2.3, W_); circ(hx, hy - 16.8, 0.9, '#ffffff'); break;
        case 'wand': P(hx, hy - 6, 1, 8, '#4a2a14'); circ(hx + 0.5, hy - 7, 1.6, W_); px(hx, hy - 8, '#fff'); break;
        case 'bow': for (let i = 0; i <= 14; i++) { const t = i / 14; P(hx + 1 + Math.sin(t * Math.PI) * 3, hy - 10 + t * 14, 1.2, 1.2, i % 4 ? '#8a5a2a' : W_); } P(hx + 1, hy - 10, 0.5, 14, '#f0ece0'); break;
        case 'crossbow': P(hx - 3, hy - 1, 8, 1.4, '#7a4a22'); for (let i = 0; i <= 8; i++) P(hx + 3 + Math.sin(i / 8 * Math.PI) * 1.5, hy - 5 + i, 1, 1, W_); break;
      }
    };
    if (d === 3) weapon(19, 26);
    // ── 긴 머리 뒷부분 (얼굴 뒤) ──
    const helmCovers = helmT >= 0 && base !== 'mage';
    if (!helmCovers && (hs === 2) && d !== 3) { if (d === 2) { ell(9.5, 18 + bob, 3.6, 7, hair); ell(9, 19 + bob, 2, 5, hD); } else { ell(14, 17 + bob, 8.4, 8, hair); P(7, 22 + bob, 3, 3, hD); P(18, 22 + bob, 3, 3, hD); } }
    if (!helmCovers && hs === 3 && d !== 3) { ell(d === 2 ? 7 : 22, 15 + bob, 2.2, 5.5, hair); ell(d === 2 ? 7 : 22, 16 + bob, 1.2, 4, hD); }
    if (helmT >= 0 && base === 'healer' && d !== 3) { ell(14, 14 + bob, 9.2, 8.6, shade(GD.TIER_COLOR[helmT], -0.38)); }
    // ── 다리 / 치마 ──
    if (robe) {
      poly([[9, 28], [19, 28], [21, 36], [7, 36]], cloth); poly([[16, 28], [19, 28], [21, 36], [17, 36]], cD); P(7, 35, 14, 1, cD);
      if (base === 'mage') { P(13.5, 29, 1, 7, GOLD); P(7, 35.2, 14, 0.6, GOLD); }
      P(9 + (step > 0 ? -1 : 0), 36, 4, 2, boots); P(15 + (step < 0 ? 1 : 0), 36, 4, 2, boots);
    } else if (d === 2) {
      const a = step * 2;
      P(11 - a * 0.5, 30, 3, 5, pants); P(14 + a * 0.5, 30, 3, 5, shade(pants, -0.15));
      P(10.5 - a * 0.5, 34, 4, 3, boots); P(14 + a * 0.5, 34, 4.5, 3, boots); P(10.5 - a * 0.5, 34, 4, 1, bootsL);
    } else {
      P(10, 30, 3, 5 - (step > 0 ? 1 : 0), pants); P(15, 30, 3, 5 - (step < 0 ? 1 : 0), pants); P(12, 30, 1, 3, shade(pants, -0.2));
      P(9.5, 34 - (step > 0 ? 1 : 0), 4, 3, boots); P(14.5, 34 - (step < 0 ? 1 : 0), 4, 3, boots); P(9.5, 34 - (step > 0 ? 1 : 0), 4, 1, bootsL); P(14.5, 34 - (step < 0 ? 1 : 0), 4, 1, bootsL);
    }
    // ── 몸통 ──
    const tx = d === 2 ? 10 : 9, tw = d === 2 ? 8 : 10, ty = 20 + bob;
    P(tx, ty, tw, 10, cloth); P(tx, ty, 1, 10, cL); P(tx + tw - 2, ty, 2, 10, cD); P(tx, ty, tw, 1, cL);
    if (d !== 3) {
      if (plate) { P(tx + 2, ty + 2, tw - 4, 4, cL); P(tx + (tw >> 1) - 0.5, ty + 1, 1, 6, cD); P(tx, ty + 7, tw, 1, cD); }
      else if (base === 'warrior') { P(tx + 1, ty + 1, tw - 2, 6, '#7a4a2a'); P(tx + 2, ty + 1, tw - 4, 5, '#8a5a34'); P(tx + 3, ty, tw - 6, 2, '#d84a3a'); }
      else if (base === 'mage') { poly([[tx + 2, ty], [tx + tw / 2, ty + 4], [tx + tw - 2, ty]], skin); P(tx + tw / 2 - 0.5, ty + 4, 1, 6, GOLD); P(tx + 1, ty, 1, 3, GOLD); P(tx + tw - 2, ty, 1, 3, GOLD); }
      else { P(tx + 1, ty + 1, 3, 3, '#8a5a34'); poly([[tx + 3, ty], [tx + tw / 2, ty + 3], [tx + tw - 3, ty]], skD); P(tx + 2, ty + 4, tw - 4, 0.6, cL); }
    }
    P(tx, ty + 8, tw, 1.5, '#4a2e1c'); if (d === 0) P(13, ty + 8, 2, 1.5, GOLD);
    // 어깨 보호대
    if (plate && d !== 2) { circ(8.5, ty + 1.5, 2.6, cloth); circ(19.5, ty + 1.5, 2.6, cD); circ(8, ty + 0.8, 1.2, cL); }
    if (plate && d === 2) { circ(14, ty + 1.5, 2.6, cloth); circ(13.4, ty + 0.8, 1.2, cL); }
    // ── 팔 ──
    const sw = step;
    if (d === 2) { P(13 + sw, ty + 1, 3, 6, cD); circ(14.5 + sw, ty + 8, 1.5, gloves); }
    else { P(7, ty + 1 + (sw > 0 ? -0.5 : 0), 2, 6, cD); P(19, ty + 1 + (sw < 0 ? -0.5 : 0), 2, 6, shade(cloth, -0.4)); circ(8, ty + 8, 1.4, gloves); circ(20, ty + 8, 1.4, gloves); }
    // 방패
    if (eq.shield && d === 0) { const sc = tcol('shield'); poly([[3.5, 22], [9, 22], [9, 28], [6.25, 31], [3.5, 28]], sc); P(5.5, 23, 1.5, 6, shade(sc, -0.4)); P(3.5, 22, 5.5, 1, shade(sc, 0.4)); }
    if (eq.shield && d === 3) { const sc = tcol('shield'); poly([[9, 21], [15, 21], [15, 27], [12, 30], [9, 27]], sc); }
    // ── 머리 ──
    const hy = 13 + bob, hx = d === 2 ? 14.5 : 14;
    ell(hx, hy, 7.2, 6.8, skD); ell(hx - 0.4, hy - 0.4, 6.8, 6.4, skin); ell(hx - 3, hy - 2.5, 2.2, 1.6, skL);
    if (d === 0) {
      px(6.6, hy, skD); px(21, hy, skD);
      P(10, hy - 1, 2, 3, '#2a1c18'); P(16, hy - 1, 2, 3, '#2a1c18'); px(11, hy + 1, eyeC); px(17, hy + 1, eyeC); px(10, hy - 1, '#ffffff'); px(16, hy - 1, '#ffffff');
      if (fem) { px(9.4, hy - 1.4, '#2a1c18'); px(18, hy - 1.4, '#2a1c18'); }
      P(13, hy + 3.2, 2, 0.8, fem ? '#c0504a' : '#9a4a3a');
      px(9, hy + 2, '#f4a0a0'); px(18.4, hy + 2, '#f4a0a0');
    } else if (d === 2) {
      P(17.5, hy - 1, 2, 3, '#2a1c18'); px(18.5, hy + 1, eyeC); px(17.5, hy - 1, '#ffffff'); if (fem) px(19.5, hy - 1.4, '#2a1c18');
      px(21.2, hy + 1, skD); P(18.6, hy + 3.2, 1.6, 0.8, '#9a4a3a'); px(19.4, hy + 2, '#f4a0a0');
      ell(12.2, hy + 0.5, 1.2, 1.6, skD);
    }
    // ── 머리카락 ──
    if (!helmCovers || base === 'mage') {
      if (d === 3) { ell(14, hy - 0.5, 7.8, 7.4, hair); ell(12, hy - 3.5, 3, 1.6, hL); P(7, hy + 4, 14, 1, hD); if (hs === 2) { ell(14, hy + 5, 7.6, 7, hair); ell(14, hy + 9, 5, 2.4, hD); } if (hs === 3) { P(12.5, hy + 4, 3, 8, hair); px(13.5, hy + 4, '#d03040'); } }
      else {
        ell(d === 2 ? 13 : 14, hy - 4, 8, 4.6, hair);
        if (d === 0) {
          P(6.5, hy - 4, 2, 7, hair); P(19.5, hy - 4, 2, 7, hD);
          poly([[7, hy - 4], [21, hy - 4], [20.5, hy - 1], [18.5, hy - 2.6], [17, hy - 1.4], [15, hy - 3], [13.5, hy - 1.8], [11.5, hy - 3], [10, hy - 1.4], [8.5, hy - 2.6], [7, hy]], hair);
          P(9, hy - 4, 1, 1.5, hD); P(14.5, hy - 4, 1, 1.5, hD); P(18, hy - 4, 1, 1.5, hD);
          ell(11, hy - 7, 2.6, 1, hL); px(16, hy - 7, hL);
        } else {
          P(6, hy - 5, 7, 9, hair); P(6, hy + 3, 7, 1, hD);
          poly([[13, hy - 4.5], [21.5, hy - 4.5], [21, hy - 2], [19.5, hy - 3.2], [18, hy - 1.6], [16.5, hy - 3], [14.5, hy - 1.5]], hair);
          ell(11, hy - 7, 2.6, 1, hL);
        }
        if (hs === 1) { poly([[8, hy - 6], [9, hy - 10.5], [11, hy - 7]], hair); poly([[12, hy - 7], [14, hy - 11.5], [16, hy - 7]], hair); poly([[17, hy - 7], [19.5, hy - 10], [20, hy - 5]], hair); }
        if (hs === 3) { px(d === 2 ? 8 : 21, hy - 5, '#d03040'); px(d === 2 ? 8 : 21, hy - 4, '#d03040'); }
      }
    }
    // ── 투구 / 모자 / 두건 ──
    if (helmT >= 0) {
      const H = GD.TIER_COLOR[helmT], Hd = shade(H, -0.38), Hl = shade(H, 0.45);
      if (base === 'warrior') {
        if (d === 3) { ell(14, hy - 0.5, 8.2, 7.6, Hd); ell(13.6, hy - 1, 7.8, 7.2, H); ell(11, hy - 4, 2.6, 1.6, Hl); }
        else {
          ell(hx, hy - 5.6, 8.4, 5, Hd); ell(hx - 0.4, hy - 6, 8, 4.6, H); P(hx - 8.4, hy - 3.6, 16.8, 1.6, Hd); P(hx - 8.4, hy - 4, 16.8, 0.6, Hl); ell(hx - 3.5, hy - 8, 2.4, 1.3, Hl);
          if (d === 0) { P(6, hy - 3, 2.2, 7, H); P(19.8, hy - 3, 2.2, 7, Hd); P(13.2, hy - 3.5, 1.6, 3, H); px(13.2, hy - 3.5, Hl); }
          else { P(10, hy - 3, 3.5, 7, H); P(12.8, hy - 3, 0.8, 7, Hd); }
        }
        if (helmT >= 3) { const cr = helmT >= 6 ? '#e02a2a' : Hl; P(hx - 1, hy - 13.5, 2, 3.5, cr); px(hx - 0.5, hy - 14, shade(cr, 0.4)); }
        if (helmT >= 6 && d !== 3) { P(hx - 9.4, hy - 6, 1.2, 4, GOLD); P(hx + 8.2, hy - 6, 1.2, 4, GOLD); }
      } else if (base === 'mage') {
        const bx = d === 2 ? 14.5 : 14;
        ell(bx, hy - 3.2, 11, 2.4, Hd); ell(bx, hy - 3.8, 10.4, 1.9, H);
        poly([[bx - 6, hy - 4], [bx + 6, hy - 4], [bx + 2.5, hy - 11], [bx + 6, hy - 14], [bx - 0.5, hy - 12]], H);
        poly([[bx + 1, hy - 4], [bx + 6, hy - 4], [bx + 2.5, hy - 11], [bx + 6, hy - 14], [bx + 1.8, hy - 11.4]], Hd);
        P(bx - 6, hy - 5.6, 12, 1.4, helmT >= 4 ? GOLD : shade(H, 0.25)); if (helmT >= 4) circ(bx, hy - 5, 1, '#ffe86a');
        ell(bx - 3, hy - 8, 1, 2, Hl);
      } else {
        const H2 = H;
        if (d === 3) { ell(14, hy, 8.8, 8.2, Hd); ell(13.6, hy - 0.5, 8.4, 7.8, H2); ell(11, hy - 4, 2.6, 1.6, Hl); P(6, hy + 6, 16, 1, Hd); }
        else {
          ell(hx, hy - 5.8, 8.8, 4.6, H2); P(hx - 8.8, hy - 5, 2.6, 11, H2); P(hx + 6.2, hy - 5, 2.6, 11, Hd);
          if (d === 2) P(hx - 8.8, hy - 5, 5.5, 11, H2);
          P(hx - 6.5, hy - 2.6, 13, 0.8, helmT >= 5 ? '#7affb0' : Hl); ell(hx - 3.5, hy - 7.5, 2.6, 1.3, Hl);
        }
      }
    }
    // ── 앞쪽 무기 ──
    if (d === 0) weapon(20.3, ty + 8);
    if (d === 2) weapon(15 + sw, ty + 8);
  });
  crisp(s, 100);
  if (flip) { const f = mk(28, 40), fg = f.getContext('2d'); fg.translate(28, 0); fg.scale(-1, 1); fg.drawImage(s, 0, 0); s.getContext('2d').clearRect(0, 0, 28, 40); s.getContext('2d').drawImage(f, 0, 0); }
  outline1(s, '#2a1810');
  c = up2(s);
  const glow = Object.values(eq).some(e => e && (e[1] >= 3 || e[2] >= 7));
  if (glow) { const g = c.getContext('2d'), gc = g.globalCompositeOperation; g.globalCompositeOperation = 'destination-over'; g.fillStyle = Object.values(eq).some(e => e && e[1] >= 4) ? '#ff6a3a38' : '#ffd04a30'; g.beginPath(); g.ellipse(28, 50, 19, 27, 0, 0, 7); g.fill(); g.globalCompositeOperation = gc; }
  charCache2.set(key, c); return c;
};

// ═══════ 캐릭터 v3: 시안 캐릭터 시트 그대로 + 머리색·갑옷 등급 색·투구 덧입히기 ═══════
const CH3 = { img: new Image(), ok: false, A: window.CHAR_ATLAS };
CH3.img.onload = () => { CH3.ok = true; charCache3.clear(); };
CH3.img.src = 'gfx/chars.png?v=' + (window.BUILDV || 1);
const charCache3 = new Map();
const _charV2 = charSprite;
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2rgb(h, s, l) { h /= 360; const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; if (!s) return [l * 255, l * 255, l * 255]; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]; }
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// 원래 밝기 비율을 지키며 목표 색으로 칠하기
function tintPx(d, i, target, baseL) { const [r, g, b] = [d[i], d[i + 1], d[i + 2]]; const [, , l] = rgb2hsl(r, g, b); const [th, ts, tl] = rgb2hsl(...target); const nl = Math.max(0.04, Math.min(0.96, tl * (l / baseL))); const [nr, ng, nb] = hsl2rgb(th, Math.min(1, ts * 1.05), nl); d[i] = nr; d[i + 1] = ng; d[i + 2] = nb; }
const isSkin = (h, s, l) => h >= 12 && h <= 42 && s > 0.25 && l > 0.55;
charSprite = function (ap, dir, frame) {
  if (!CH3.ok || ap.mt) return _charV2(ap, dir, frame);
  const key = JSON.stringify(ap) + '|' + dir + '|' + frame; let c = charCache3.get(key); if (c) return c;
  if (charCache3.size > 700) charCache3.clear();
  const base = GD.JOBS[ap.job] ? GD.JOBS[ap.job].base : 'warrior'; const bk = base + '_' + (ap.g === 'f' ? 'f' : 'm');
  const FR = CH3.A.frames[bk]; const row = FR[[0, 2, 1, 3][dir] ?? 0]; const n = row.length;
  // 시안 0번 칸은 소품이 달라 깜빡여 보이므로 1번 칸부터 사용
  const col = n >= 3 ? (frame === 1 ? 2 : frame === 3 ? (n === 4 ? 3 : 1) : 1) : 0;
  const R = CH3.A.rects[row[Math.min(col, n - 1)]];
  const S2 = 2, s = 0.78 * S2; // 2배 해상도로 그린 뒤 표시는 56x80
  c = mk(56 * S2, 80 * S2); const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  const ri = row[Math.min(col, n - 1)], AX = CH3.A.ax ? CH3.A.ax[ri] : R[2] / 2;
  const dw = R[2] * s, dh = R[3] * s, dx = 28 * S2 - AX * s, dy = 77 * S2 - dh;
  g.drawImage(CH3.img, R[0], R[1], R[2], R[3], dx, dy, dw, dh);
  // 머리색 · 갑옷 색
  const eq = ap.eq || {}; const hairPal = CH3.A.hairpal[bk]; const hairT = hex2rgb(HAIRC[ap.hc || 0]);
  const armorT = eq.armor ? hex2rgb(GD.TIER_COLOR[eq.armor[0]]) : null;
  const def = { warrior_m: 1, warrior_f: 1, mage_m: 0, mage_f: 2, healer_m: 1, healer_f: 3 }[bk];
  const wantHair = hairPal && (ap.hc || 0) !== def;
  if (wantHair || armorT) {
    const id = g.getImageData(0, 0, c.width, c.height), d = id.data, W2 = c.width;
    const hp = hairPal ? hairPal.filter(p => p[0] + p[1] + p[2] > 150) : []; const hairL = hp.length ? rgb2hsl(...hp[0])[2] : 0.4;
    const armL = { warrior: 0.45, mage: 0.4, healer: 0.38 }[base];
    for (let y = Math.floor(dy); y < c.height; y++) { const yr = (y - dy) / dh; for (let x = 0; x < W2; x++) { const i = (y * W2 + x) * 4; if (d[i + 3] < 30) continue; const r = d[i], gg = d[i + 1], b = d[i + 2]; const [h, sat, l] = rgb2hsl(r, gg, b); if (l < 0.12) continue;
      if (wantHair && yr < 0.5 && !isSkin(h, sat, l)) { let md = 1e9; for (const p of hp) { const dd = (p[0] - r) ** 2 + (p[1] - gg) ** 2 + (p[2] - b) ** 2; if (dd < md) md = dd; } if (md < 34 * 34) { tintPx(d, i, hairT, hairL); continue; } }
      if (armorT && yr > 0.42) { const hit = base === 'warrior' ? ((h < 18 || h > 335) && sat > 0.35) : base === 'mage' ? (h > 195 && h < 265 && sat > 0.2) : (h > 55 && h < 140 && sat > 0.18); if (hit) tintPx(d, i, armorT, armL); }
    } }
    g.putImageData(id, 0, 0);
  }
  // 투구 · 모자 · 두건
  if (eq.helmet) {
    const t = eq.helmet[0]; const hk = base === 'warrior' ? 'helm' : base === 'mage' ? 'hat' : 'hood';
    const rowIdx = t === 9 ? 1 : t === 7 ? 2 : 0; const view = dir === 0 ? 0 : dir === 3 ? 4 : 2; const HR = CH3.A.rects[CH3.A.helms[hk][rowIdx][view]];
    const hw = HR[2] * s, hh = HR[3] * s; const hc = mk(Math.ceil(hw), Math.ceil(hh)), hg = hc.getContext('2d'); hg.imageSmoothingEnabled = true;
    if (dir === 2) { hg.translate(hw, 0); hg.scale(-1, 1); }
    hg.drawImage(CH3.img, HR[0], HR[1], HR[2], HR[3], 0, 0, hw, hh); hg.setTransform(1, 0, 0, 1, 0, 0);
    if (rowIdx === 0) { const T2 = hex2rgb(GD.TIER_COLOR[t]); const id = hg.getImageData(0, 0, hc.width, hc.height), d = id.data; const bl = hk === 'helm' ? 0.62 : hk === 'hat' ? 0.42 : 0.38;
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 30) continue; const [h, sat, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]); if (l < 0.12 || isSkin(h, sat, l)) continue; const hit = hk === 'helm' ? sat < 0.2 && l < 0.97 : hk === 'hat' ? (h > 210 && h < 300) : (h > 55 && h < 140 && sat > 0.15); if (hit) tintPx(d, i, T2, bl); }
      hg.putImageData(id, 0, 0); }
    g.drawImage(hc, 28 * S2 - hw / 2 + (dir === 2 ? 1 : dir === 1 ? -1 : 0) * S2, dy - 3 * S2);
  }
  // 영웅·전설 광채
  if (Object.values(eq).some(e => e && (e[1] >= 3 || e[2] >= 7))) { const gc = g.globalCompositeOperation; g.globalCompositeOperation = 'destination-over'; g.fillStyle = Object.values(eq).some(e => e && e[1] >= 4) ? '#ff6a3a38' : '#ffd04a30'; g.beginPath(); g.ellipse(28 * S2, 50 * S2, 19 * S2, 27 * S2, 0, 0, 7); g.fill(); g.globalCompositeOperation = gc; }
  // 표시 크기 56x80 로 축소 (선명하게 2배 캔버스 유지)
  c.dispW = 56; c.dispH = 80;
  charCache3.set(key, c); return c;
};
