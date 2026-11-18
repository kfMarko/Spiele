// Aufnehmen, Stille abschneiden, rückwärts abspielen
const AR = (() => {
  let src = null;
  const ac = () => SA.audio();
  async function decode(blob) {
    const arr = await blob.arrayBuffer();
    return new Promise((res, rej) => { const p = ac().decodeAudioData(arr, res, rej); if (p && p.then) p.then(res, rej); });
  }
  // Mono + Stille vorne/hinten weg
  function prep(buf) {
    const len = buf.length, chs = buf.numberOfChannels, m = new Float32Array(len);
    for (let c = 0; c < chs; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) m[i] += d[i] / chs; }
    let peak = 0; for (let i = 0; i < len; i++) { const v = Math.abs(m[i]); if (v > peak) peak = v; }
    const thr = Math.max(.01, peak * .08), pad = Math.floor(buf.sampleRate * .08);
    let s = 0, e = len - 1; while (s < len && Math.abs(m[s]) < thr) s++; while (e > s && Math.abs(m[e]) < thr) e--;
    s = Math.max(0, s - pad); e = Math.min(len - 1, e + pad);
    if (e - s < buf.sampleRate * .1) { s = 0; e = len - 1; }
    const out = ac().createBuffer(1, e - s + 1, buf.sampleRate); out.getChannelData(0).set(m.subarray(s, e + 1)); return out;
  }
  function reverse(buf) { const out = ac().createBuffer(1, buf.length, buf.sampleRate); const d = buf.getChannelData(0), o = out.getChannelData(0), n = d.length; for (let i = 0; i < n; i++) o[i] = d[n - 1 - i]; return out; }
  function stop() { if (src) { try { src.stop(); } catch (e) {} src = null; } }
  function play(buf, rate = 1) {
    stop(); if (!buf) return Promise.resolve();
    const s = ac().createBufferSource(); s.buffer = buf; s.playbackRate.value = rate; s.connect(ac().destination);
    return new Promise(res => { s.onended = res; s.start(); src = s; });
  }
  function drawWave(cv, buf) {
    const g = cv.getContext("2d"), W = cv.width, H = cv.height; g.clearRect(0, 0, W, H); if (!buf) return;
    const d = buf.getChannelData(0), bars = 60, step = Math.floor(d.length / bars) || 1; let mx = 0; const pk = [];
    for (let b = 0; b < bars; b++) { let m = 0; for (let i = b * step; i < (b + 1) * step && i < d.length; i++) { const v = Math.abs(d[i]); if (v > m) m = v; } pk.push(m); if (m > mx) mx = m; }
    g.fillStyle = "#ff5a3c"; const bw = W / bars;
    pk.forEach((m, b) => { const h = Math.max(3, (m / (mx || 1)) * (H - 12)); g.fillRect(b * bw + bw * .2, (H - h) / 2, bw * .6, h); });
  }
  let micOk = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  try { if (document.featurePolicy && !document.featurePolicy.allowsFeature("microphone")) micOk = false; } catch (e) {}

  function recorder(host, onDone) {
    host.innerHTML = '<div style="display:flex;flex-direction:column;gap:10px"><button class="rec" type="button"></button><button class="ghost alt" type="button" hidden style="min-height:44px;padding:8px 14px;font-size:.9rem">Oder Sprachnotiz / Datei wählen</button><input type="file" class="cam" accept="video/*" capture="user" hidden><input type="file" class="any" accept="audio/*,video/*" hidden><canvas class="wave" width="600" height="112"></canvas><div class="status"></div></div>';
    const btn = host.querySelector("button.rec"), alt = host.querySelector("button.alt"), cam = host.querySelector("input.cam"), file = host.querySelector("input.any"), cv = host.querySelector("canvas"), st = host.querySelector(".status");
    let rec = null, stream = null, chunks = [];
    function label() { btn.classList.remove("on"); btn.textContent = micOk ? "● Aufnehmen" : "🎥 Mit Selfie-Video aufnehmen"; alt.hidden = micOk; }
    function reset() { label(); st.textContent = micOk ? "Tippen zum Starten, nochmal tippen zum Stoppen." : "Kamera öffnet sich. Sprechen, stoppen, „Video verwenden“ – nur der Ton zählt."; drawWave(cv, null); }
    async function handle(blob) {
      st.textContent = "Wird verarbeitet …";
      try { const b = prep(await decode(blob)); drawWave(cv, b); st.textContent = "Gespeichert (" + b.duration.toFixed(1) + " s). Nochmal tippen = neu aufnehmen."; onDone(b); }
      catch (e) { st.textContent = "Konnte die Aufnahme nicht lesen. Versuch es nochmal."; }
    }
    [cam, file].forEach(inp => inp.addEventListener("change", () => { const f = inp.files && inp.files[0]; inp.value = ""; if (f) handle(f); }));
    alt.onclick = () => { ac(); stop(); file.click(); };
    btn.onclick = async () => {
      ac(); stop();
      if (!micOk) { cam.click(); return; }
      if (rec && rec.state === "recording") { rec.stop(); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = []; rec = new MediaRecorder(stream);
        rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); label(); handle(new Blob(chunks, { type: rec.mimeType || "audio/webm" })); };
        rec.start(); btn.classList.add("on"); btn.textContent = "■ Stopp"; st.textContent = "Aufnahme läuft …";
      } catch (e) { micOk = false; label(); st.textContent = "Mikrofon nicht erlaubt. Tipp nochmal – dann öffnet sich die Kamera."; }
    };
    reset();
    return { reset };
  }
  return { decode, prep, reverse, play, stop, drawWave, recorder };
})();
