// ═══════ 직접 연결(WebRTC): 같은 와이파이에서는 방장 기기와 직접 통신 → 중계 서버 거치지 않아 빠르고 안 끊김 ═══════
// 중계 서버(MQTT)는 처음 연결 신호 교환과, 직접 연결이 안 될 때 예비로만 사용
(function () {
  if (!window.RTCPeerConnection) return;
  const CFG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }] };
  const gather = pc => new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 2500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); });
  // ── 방장(서버) 쪽 ──
  window.rtcHostSignal = async function (r, sig, reply) {
    try {
      if (r.pc) { try { r.pc.close(); } catch (e) { } }
      const pc = r.pc = new RTCPeerConnection(CFG); r.dc = null;
      pc.ondatachannel = ev => {
        const dc = ev.channel; if (dc.label === 'u') { r.du = dc; dc.onclose = () => { if (r.du === dc) r.du = null; }; return; } r.dc = dc;
        dc.onmessage = e => { r.seen = Date.now(); let d; try { d = JSON.parse(e.data); } catch (x) { return; } if (d && d.m && r.conn.onmsg) { try { r.conn.onmsg(JSON.stringify(d.m)); } catch (x) { } } };
        dc.onclose = () => { if (r.dc === dc) r.dc = null; };
      };
      await pc.setRemoteDescription(sig); const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); await gather(pc);
      reply({ rtc: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } });
    } catch (e) { r.dc = null; }
  };
  // 위치 정보: 잃어버려도 다시 보내지 않는 채널 (늦은 정보가 새 정보를 막지 않음)
  window.rtcSendU = function (r, z) { const dc = r.du; if (!dc || dc.readyState !== 'open') return false; try { const s = JSON.stringify(z); if (s.length > 12000 || dc.bufferedAmount > 64000) return false; dc.send(s); return true; } catch (e) { return false; } };
  window.rtcSend = function (r, z) {
    const dc = r.dc; if (!dc || dc.readyState !== 'open') return false;
    try {
      const s = JSON.stringify(z); if (dc.bufferedAmount > 4e6) return false;
      if (s.length <= 14000) { dc.send(s); return true; }
      // 큰 메시지(맵 등)도 같은 통로로 잘라서 보냄 → 순서가 뒤섞이지 않음 (예전엔 중계서버로 보내서 늦게 도착)
      const id = (r._ck = (r._ck || 0) + 1), n = Math.ceil(s.length / 14000);
      for (let i = 0; i < n; i++) dc.send(JSON.stringify({ ck: id, i, n, d: s.slice(i * 14000, (i + 1) * 14000) }));
      return true;
    } catch (e) { return false; }
  };
  // ── 참가자 쪽 ──
  let pc = null, dc = null, pub = null, tries = 0, wait = null;
  async function start() {
    if (!pub) return; try { if (pc) pc.close(); } catch (e) { }
    pc = new RTCPeerConnection(CFG); dc = pc.createDataChannel('g', { ordered: true });
    const du = pc.createDataChannel('u', { ordered: false, maxRetransmits: 0 }); du.onmessage = e => { let z; try { z = JSON.parse(e.data); } catch (x) { return; } if (Array.isArray(z)) z.forEach(m => onMsg(m)); };
    dc.onopen = () => { tries = 0; NET.rtc = 1; if (window.S && S.me) log('⚡ 방장 기기와 직접 연결됨 (빠른 모드)', '#9fe8ff'); };
    const parts = {};
    dc.onmessage = e => { let z; try { z = JSON.parse(e.data); } catch (x) { return; }
      if (z && z.ck) { const b = parts[z.ck] || (parts[z.ck] = []); b[z.i] = z.d; if (b.filter(v => v != null).length === z.n) { delete parts[z.ck]; try { z = JSON.parse(b.join('')); } catch (x) { return; } } else return; }
      if (Array.isArray(z)) z.forEach(m => onMsg(m)); };
    dc.onclose = () => { NET.rtc = 0; retry(); };
    pc.onconnectionstatechange = () => { if (pc && (pc.connectionState === 'failed')) retry(); };
    try { const off = await pc.createOffer(); await pc.setLocalDescription(off); await gather(pc); pub({ rtc: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } }); } catch (e) { retry(); }
    clearTimeout(wait); wait = setTimeout(() => { if (!dc || dc.readyState !== 'open') retry(); }, 12000);
  }
  function retry() { if (tries++ > 6) return; clearTimeout(wait); setTimeout(start, Math.min(30000, 3000 * tries)); }
  window.rtcClientStart = function (publish) { pub = publish; tries = 0; start(); };
  window.rtcClientAnswer = async function (sig) { try { if (pc && pc.signalingState === 'have-local-offer') await pc.setRemoteDescription(sig); } catch (e) { } };
  window.rtcClientSend = function (o) { if (!dc || dc.readyState !== 'open') return false; try { dc.send(JSON.stringify({ m: o })); return true; } catch (e) { return false; } };
  // 방장이 다시 열리면 재연결
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && pub && (!dc || dc.readyState !== 'open')) { tries = 0; start(); } });
})();
