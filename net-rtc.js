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
        const dc = ev.channel; r.dc = dc;
        dc.onmessage = e => { r.seen = Date.now(); let d; try { d = JSON.parse(e.data); } catch (x) { return; } if (d && d.m && r.conn.onmsg) { try { r.conn.onmsg(JSON.stringify(d.m)); } catch (x) { } } };
        dc.onclose = () => { if (r.dc === dc) r.dc = null; };
      };
      await pc.setRemoteDescription(sig); const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); await gather(pc);
      reply({ rtc: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } });
    } catch (e) { r.dc = null; }
  };
  window.rtcSend = function (r, z) {
    const dc = r.dc; if (!dc || dc.readyState !== 'open') return false;
    try { const s = JSON.stringify(z); if (s.length > 60000 || dc.bufferedAmount > 1e6) return false; dc.send(s); return true; } catch (e) { return false; }
  };
  // ── 참가자 쪽 ──
  let pc = null, dc = null, pub = null, tries = 0, wait = null;
  async function start() {
    if (!pub) return; try { if (pc) pc.close(); } catch (e) { }
    pc = new RTCPeerConnection(CFG); dc = pc.createDataChannel('g', { ordered: true });
    dc.onopen = () => { tries = 0; NET.rtc = 1; if (window.S && S.me) log('⚡ 방장 기기와 직접 연결됨 (빠른 모드)', '#9fe8ff'); };
    dc.onmessage = e => { let z; try { z = JSON.parse(e.data); } catch (x) { return; } if (Array.isArray(z)) z.forEach(m => onMsg(m)); };
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
