// Spieleabend – gemeinsame Hilfen für alle Spiele
const SA = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // Bildschirme: alle <section class="scr">, nur einer sichtbar
  function show(id) { document.querySelectorAll("section.scr").forEach(s => s.hidden = s.id !== id); window.scrollTo(0, 0); }

  // Ungesehene Einträge zuerst ziehen; erst wenn alle durch sind, zurücksetzen
  function fresh(key, pool, n = 1) {
    const k = "sa.seen." + key;
    let seen = new Set(store.get(k, []));
    let free = pool.map((_, i) => i).filter(i => !seen.has(i));
    if (free.length < n) { seen = new Set(); free = pool.map((_, i) => i); }
    shuffle(free);
    const got = free.slice(0, n);
    got.forEach(i => seen.add(i));
    store.set(k, [...seen]);
    return got.map(i => pool[i]);
  }

  // Spieler-Setup: Anzahl + Namen (gemerkt für alle Spiele)
  function setup(host, { min = 2, max = 6, onStart, extra = "" }) {
    const saved = store.get("sa.names", []);
    let n = Math.min(max, Math.max(min, store.get("sa.n", Math.max(min, Math.min(max, 3)))));
    const counts = []; for (let i = min; i <= max; i++) counts.push(i);
    host.innerHTML = `
      <span class="label">Wie viele spielen mit?</span>
      <div class="count" style="grid-template-columns:repeat(${counts.length},1fr)">${counts.map(c => `<button type="button" data-n="${c}">${c}</button>`).join("")}</div>
      <div class="names"></div>
      ${extra}
      <button class="primary" type="button" data-start>Los geht's</button>`;
    const box = host.querySelector(".names");
    function draw() {
      const cur = [...box.querySelectorAll("input")].map(i => i.value);
      host.querySelectorAll(".count button").forEach(b => b.classList.toggle("on", +b.dataset.n === n));
      box.innerHTML = Array.from({ length: n }, (_, i) =>
        `<label class="nm pc${i}"><input type="text" id="sa-name-${i}" autocomplete="off" placeholder="Spieler ${i + 1}" value="${esc(cur[i] ?? saved[i] ?? "")}"></label>`).join("");
    }
    host.querySelectorAll(".count button").forEach(b => b.onclick = () => { n = +b.dataset.n; draw(); });
    host.querySelector("[data-start]").onclick = () => {
      const names = [...box.querySelectorAll("input")].map((inp, i) => inp.value.trim() || "Spieler " + (i + 1));
      const all = store.get("sa.names", []); names.forEach((v, i) => all[i] = v);
      store.set("sa.names", all); store.set("sa.n", n);
      onStart(names);
    };
    draw();
  }

  // Punktestand oben
  function board(el, players, { active = -1, out = [], fmt = p => p.score } = {}) {
    el.hidden = false;
    el.innerHTML = players.map((p, i) =>
      `<div class="pl pc${i}${i === active ? " on" : ""}${out.includes(i) ? " out" : ""}"><span class="n">${esc(p.name)}</span><span class="s">${fmt(p, i)}</span></div>`).join("");
  }

  // Rangliste
  function rank(el, players, { key = "score", unit = "P." } = {}) {
    const idx = players.map((_, i) => i).sort((a, b) => players[b][key] - players[a][key]);
    let place = 0, last = null;
    el.innerHTML = idx.map((i, j) => {
      if (players[i][key] !== last) { place = j + 1; last = players[i][key]; }
      return `<div class="r pc${i}"><b>${place}.</b><span class="chip pc${i}">${esc(players[i].name)}</span><b>${players[i][key]} ${unit}</b></div>`;
    }).join("");
  }

  // Glücksrad
  const WHEEL_COLORS = ["#FFD12E", "#86D0FF", "#D9BBFF", "#9BE8B0", "#FFB07A", "#FF8FB8", "#f3e6d8", "#ff5a3c"];
  function wheel(host, labels) {
    const n = labels.length, seg = 360 / n, r = 100;
    const pt = a => [r + r * Math.sin(a * Math.PI / 180), r - r * Math.cos(a * Math.PI / 180)];
    let svg = `<div class="pin"></div><svg viewBox="0 0 200 200" aria-hidden="true">`;
    labels.forEach((l, i) => {
      const [x1, y1] = pt(i * seg), [x2, y2] = pt((i + 1) * seg), mid = i * seg + seg / 2;
      svg += `<path d="M100 100 L${x1} ${y1} A100 100 0 ${seg > 180 ? 1 : 0} 1 ${x2} ${y2} Z" fill="${WHEEL_COLORS[i % WHEEL_COLORS.length]}" stroke="#1c1418" stroke-width="1.5"/>`;
      svg += `<text x="100" y="24" text-anchor="middle" transform="rotate(${mid} 100 100)">${esc(l.length > 13 ? l.slice(0, 12) + "…" : l)}</text>`;
    });
    svg += `<circle cx="100" cy="100" r="10" fill="#1c1418"/></svg>`;
    host.className = "wheelbox"; host.innerHTML = svg;
    const s = host.querySelector("svg"); let rot = 0;
    return {
      spin() {
        const i = Math.floor(Math.random() * n);
        const target = 360 - (i * seg + seg / 2) + (Math.random() - .5) * seg * .6;
        rot += 360 * 5 + ((target - rot % 360) + 360) % 360;
        s.style.transform = `rotate(${rot}deg)`;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        return new Promise(res => setTimeout(() => res(i), reduced ? 100 : 4100));
      }
    };
  }

  // Bewegungssensor (iPhone braucht eine Erlaubnis per Tipp)
  async function motionPermission() {
    try {
      const reqs = [];
      if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") reqs.push(DeviceMotionEvent.requestPermission());
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") reqs.push(DeviceOrientationEvent.requestPermission());
      const r = await Promise.all(reqs);
      return r.every(x => x === "granted");
    } catch (e) { return false; }
  }

  // Bildschirm anlassen (wenn erlaubt)
  let lock = null;
  async function wake() { try { lock = await navigator.wakeLock.request("screen"); } catch (e) {} }

  // Kurze Töne ohne Audiodateien
  let ac = null;
  function audio() { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; }
  function beep(freq = 880, dur = .08, type = "square", vol = .15) {
    try {
      const c = audio(), o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = vol;
      g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur + .02);
    } catch (e) {}
  }
  function buzz(ms = 80) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

  return { $, esc, shuffle, pick, store, show, fresh, setup, board, rank, wheel, motionPermission, wake, audio, beep, buzz };
})();
