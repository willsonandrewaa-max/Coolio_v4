/* =====================================================================
   COOLIO — script.js
   - Botol 3D (CSS 3D murni, tanpa library) mengikuti mockup terbaru:
     tutup kubah transparan, bahu putih, label biru dengan logo asli
   - Efek semprotan kabut putih, animasi scroll, counter angka
   Teks pada label botol bisa diubah di CONFIG di bawah.
   ===================================================================== */

const CONFIG = {
  label: {
    line1: "2in1",
    line2: "Cooling Spray",
    line3: "Green Apple",
    line4: "Scent",
    volume: "100ML",
    backTitle: "HOW TO USE",
    backLines: ["1. Shake before use", "2. Spray from 15–20 cm", "onto body / clothes", "3. Cool in, Move On!"],
    netto: "Net 100 ml",
  },
  colors: {
    labelTop: "#72d4fa",
    labelBottom: "#3dbaf3",
    blob: "rgba(18, 128, 222, 0.22)",
    scallop: "#7fd8fb",
    outline: "#1b86d6",
    pink: "#ff2e93",
    blue: "#2b9bf0",
    greenA: "#a5e35f",
    greenB: "#3cb043",
    flower: "#ffd43b",
  },
  autoRotateSpeed: 18,   // derajat per detik
  sprayMessage: "Ahh… so fresh! 🍏",
};

/* ---------------- Util ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const norm = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
function rng(seed) { // mulberry32 — acak tapi selalu sama
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* =====================================================================
   1. TEKSTUR LABEL (canvas) — mengikuti desain label mockup
   ===================================================================== */
function drawSnow(ctx, x, y, s, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(255,255,255,${a})`;
  ctx.lineWidth = Math.max(1, s * 0.13);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    ctx.rotate(Math.PI / 3);
    ctx.moveTo(0, 0); ctx.lineTo(0, -s);
    ctx.moveTo(0, -s * 0.5); ctx.lineTo(s * 0.28, -s * 0.78);
    ctx.moveTo(0, -s * 0.5); ctx.lineTo(-s * 0.28, -s * 0.78);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(0, 0, s, 0);
  ctx.quadraticCurveTo(0, 0, 0, s);
  ctx.quadraticCurveTo(0, 0, -s, 0);
  ctx.quadraticCurveTo(0, 0, 0, -s);
  ctx.fill();
  ctx.restore();
}

function drawFlower(ctx, x, y, r, outline) {
  const C = CONFIG.colors;
  const petal = (lw, color, fill) => {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 0.58, y + Math.sin(a) * r * 0.58, r * 0.46, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke(); }
    }
  };
  if (outline) petal(outline, "#ffffff", false);
  petal(0, C.flower, true);
  ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, Math.PI * 2); ctx.fillStyle = C.flower; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 0.24, 0, Math.PI * 2); ctx.fillStyle = "#7fd0fb"; ctx.fill();
}

function outlinedText(ctx, text, x, y, font, fill, stroke, lw) {
  ctx.font = font;
  ctx.lineJoin = "round";
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(text, x, y); }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

// ukuran font otomatis agar teks pas di lebar tertentu
function fitFont(ctx, text, weight, family, maxW, maxSize) {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) size = Math.floor((size * maxW) / w);
  return `${weight} ${size}px ${family}`;
}

function drawLabelTexture(W, H, logo) {
  const S = 2;
  const cv = document.createElement("canvas");
  cv.width = Math.round(W * S); cv.height = H * S;
  const ctx = cv.getContext("2d");
  ctx.scale(S, S);
  const C = CONFIG.colors, L = CONFIG.label, R = rng(5);
  const FD = "Fredoka, 'Arial Rounded MT Bold', sans-serif";
  const cx = W / 2;

  // area di atas tepi label: cairan bening
  ctx.fillStyle = "#dff3fd";
  ctx.fillRect(0, 0, W, H);

  // bentuk label: tepi atas bergelombang besar (seperti awan)
  const top = 26;
  const shape = new Path2D();
  shape.rect(0, top, W, H - top);
  const step = W / Math.round(W / 58);
  for (let x = 0; x <= W + 1; x += step) {
    shape.moveTo(x + 31, top);
    shape.arc(x, top + 2, 31, 0, Math.PI * 2);
  }
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.labelTop); g.addColorStop(1, C.labelBottom);
  ctx.fillStyle = g;
  ctx.fill(shape);

  ctx.save();
  ctx.clip(shape);
  // pita gelombang yang lebih terang di bagian atas
  ctx.fillStyle = C.scallop;
  ctx.globalAlpha = 0.55;
  for (let x = 0; x <= W + 1; x += step) { ctx.beginPath(); ctx.arc(x, top + 2, 27, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  // blob biru tua besar (seperti mockup)
  const blobs = [[0.12, 150, 70], [0.36, 300, 80], [0.62, 120, 60], [0.88, 330, 85], [0.5, 420, 70], [0.2, 400, 60], [0.75, 230, 55]];
  ctx.fillStyle = C.blob;
  blobs.forEach(([fx, y, r]) => {
    const x = fx * W;
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r * 0.35, y, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
  });
  // gelembung samar
  for (let i = 0; i < 26; i++) {
    ctx.beginPath();
    ctx.arc(R() * W, 60 + R() * (H - 60), 10 + R() * 26, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.05 + R() * 0.08})`;
    ctx.fill();
  }
  ctx.restore();

  // kilau bintang di gelombang atas
  for (let x = step / 2; x < W; x += step) drawSparkle(ctx, x, top + 14 + (R() - 0.5) * 6, 4 + R() * 2.5);

  // kepingan salju & titik kuning di sisi
  [[-96, 128, 11], [96, 330, 12], [-100, 250, 9], [104, 196, 7], [-150, 360, 10], [150, 120, 9]].forEach(([dx, y, s]) => drawSnow(ctx, cx + dx, y, s, 0.95));
  ctx.fillStyle = "#ffe66d";
  [[-102, 232, 4], [100, 210, 4.5], [-140, 180, 3], [140, 300, 3]].forEach(([dx, y, r]) => { ctx.beginPath(); ctx.arc(cx + dx, y, r, 0, Math.PI * 2); ctx.fill(); });
  // salju di area lain
  for (let i = 0; i < 14; i++) {
    const x = R() * W, y = 90 + R() * (H - 120);
    if (Math.abs(x - cx) < 170 || x < 60 || x > W - 60) continue;
    drawSnow(ctx, x, y, 6 + R() * 6, 0.7);
  }

  // ---------- sisi depan ----------
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (logo) {
    const lw = 156, lh = (lw * logo.height) / logo.width;
    ctx.drawImage(logo, cx - lw / 2, 172 - lh, lw, lh);
  } else {
    // cadangan jika logo belum dimuat
    outlinedText(ctx, "Cool in, Move On with", cx, 100, `700 12px ${FD}`, C.pink, "#fff", 3.5);
    outlinedText(ctx, "Coolio", cx, 150, `700 44px ${FD}`, "#ffffff", C.outline, 7);
  }

  outlinedText(ctx, L.line1, cx, 244, fitFont(ctx, L.line1, 700, FD, 60, 21), C.pink, "#fff", 4.5);
  outlinedText(ctx, L.line2, cx, 270, fitFont(ctx, L.line2, 700, FD, 146, 26), C.blue, "#fff", 5.5);
  const gg = ctx.createLinearGradient(0, 278, 0, 300);
  gg.addColorStop(0, C.greenA); gg.addColorStop(1, C.greenB);
  outlinedText(ctx, L.line3, cx, 298, fitFont(ctx, L.line3, 700, FD, 128, 23), gg, "#fff", 5.5);
  outlinedText(ctx, L.line4, cx, 314, `600 12px ${FD}`, C.greenB, "#fff", 3.5);
  outlinedText(ctx, L.volume, cx, 414, "600 13px 'Plus Jakarta Sans', sans-serif", "#ffffff", null, 0);

  // ---------- sisi belakang (digambar dua kali agar menyambung) ----------
  [0, W].forEach((bx) => {
    outlinedText(ctx, L.backTitle, bx, 120, "700 12px 'Plus Jakarta Sans', sans-serif", "#ffffff", null, 0);
    L.backLines.forEach((t, i) => outlinedText(ctx, t, bx, 142 + i * 15, "500 9.5px 'Plus Jakarta Sans', sans-serif", "rgba(255,255,255,.95)", null, 0));
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx - 34, 250, 68, 48, 6) : ctx.rect(bx - 34, 250, 68, 48); ctx.fill();
    const br = rng(3);
    ctx.fillStyle = "#0b2f55";
    for (let bxx = bx - 28; bxx < bx + 28; ) { const w = 0.8 + br() * 2.2; ctx.fillRect(bxx, 256, w, 28); bxx += w + 0.8 + br() * 1.6; }
    outlinedText(ctx, "8 99 000 000 001", bx, 293, "500 6px 'Plus Jakarta Sans', sans-serif", "#0b2f55", null, 0);
    outlinedText(ctx, L.netto, bx, 330, "600 10px 'Plus Jakarta Sans', sans-serif", "#ffffff", null, 0);
  });

  return cv.toDataURL("image/png");
}

/* =====================================================================
   2. BOTOL 3D
   Profil botol (y = jarak dari atas, r = jari-jari) dalam px sebelum
   diskalakan. Diukur dari mockup: lebar badan 180px, tinggi 700px.
   ===================================================================== */
// Jumlah potongan 3D: dikurangi otomatis di HP / perangkat ringan
const LOW_END = matchMedia("(max-width: 900px)").matches || (navigator.hardwareConcurrency || 8) <= 4;
const Q = (n) => Math.max(16, Math.round(n * (LOW_END ? 0.75 : 1) / 2) * 2);

const GEO = {
  height: 700,
  // tutup transparan berbentuk kubah
  cap: { n: Q(24), profile: [[0, 36], [5, 54], [13, 64], [27, 67], [63, 60], [120, 69]] },
  // tombol semprot putih di dalam tutup: [y1, y2, r]
  act: [[12, 78, 33], [78, 102, 40], [102, 120, 54]],
  // bahu putih yang melebar
  shoulder: { n: Q(28), profile: [[120, 69], [147, 78], [177, 87], [201, 90]] },
  band: { y1: 201, y2: 216, r: 90, n: Q(32) },        // kaca bening di atas label
  label: { y1: 216, y2: 660, r: 90.6, n: Q(44) },      // label
  lower: { n: Q(32), profile: [[660, 90], [690, 90], [700, 83]] }, // kaca bawah + dasar membulat
};

const BG = {
  cap: "linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.06))",
  glass: "linear-gradient(180deg, rgba(196,232,252,.32), rgba(176,222,250,.42))",
  lower: "linear-gradient(180deg, rgba(176,222,250,.42) 0%, rgba(150,206,242,.5) 80%, rgba(255,255,255,.6) 100%)",
  white: "linear-gradient(180deg, #ffffff 0%, #f6f9fc 60%, #e9f0f6 100%)",
  act: "linear-gradient(180deg, #ffffff 0%, #f4f8fc 100%)",
};

let LABEL_URL = null;
let LOGO_IMG = null;
const bottles = [];

class Bottle {
  constructor(host) {
    this.host = host;
    this.strips = [];
    this.rot = -20;
    this.vel = 0;
    this.tilt = -8; this.tiltTarget = -8;
    this.dragging = false;
    this.visible = true;
    this.pause = 0;
    this.build();
    this.bind();
    this.resize();
    bottles.push(this);
  }

  el(cls, parent, css = {}) {
    const d = document.createElement("div");
    d.className = cls;
    Object.assign(d.style, css);
    parent.appendChild(d);
    return d;
  }

  // satu potongan kerucut (frustum) dari (y1,r1) ke (y2,r2) dari n strip
  frustum(parent, y1, r1, y2, r2, n, kind, bg, isLabel) {
    const h = y2 - y1, dr = r2 - r1;
    const L = Math.hypot(h, dr);
    const tilt = deg(Math.atan2(dr, h));
    const t = Math.tan(Math.PI / n);
    const w1 = 2 * r1 * t + 0.8, w2 = 2 * r2 * t + 0.8;
    // lebar rata-rata (tanpa clip-path agar ringan di semua browser)
    const w = (w1 + w2) / 2;
    const sec = this.el("b-sec", parent, { top: (y1 + y2) / 2 + "px", height: "0px" });
    const rm = (r1 + r2) / 2;
    const unit = 2 * rm * t;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n - 0.5) * 360;
      const s = this.el("b-strip" + (kind === "glass" ? " both" : ""), sec, {
        width: w + "px",
        height: L + "px",
        left: -w / 2 + "px",
        top: -L / 2 + "px",
        transform: `rotateY(${a}deg) translateZ(${rm}px) rotateX(${tilt}deg)`,
        background: bg || "",
      });
      if (isLabel) {
        s.style.backgroundSize = `${unit * n}px ${L}px`;
        s.style.backgroundPosition = `${-i * unit + (w - unit) / 2}px 0`;
      }
      const lt = this.el("lt", s);
      this.strips.push({ s, lt, a, kind: isLabel ? "label" : kind, up: dr / (L || 1), cosPrev: 9, light: false, op: -1 });
    }
    return sec;
  }

  lathe(parent, prof, n, kind, bg) {
    for (let k = 0; k < prof.length - 1; k++) {
      const [y1, r1] = prof[k], [y2, r2] = prof[k + 1];
      this.frustum(parent, y1, r1, y2, r2, n, kind, bg);
    }
  }

  disc(parent, y, r, bg, extra = {}) {
    const sec = this.el("b-sec", parent, { top: y + "px", height: "0px" });
    this.el("b-disc", sec, Object.assign({ left: -r + "px", top: -r + "px", width: 2 * r + "px", height: 2 * r + "px", background: bg, transform: "rotateX(90deg)" }, extra));
    return sec;
  }

  build() {
    const h = this.host;
    h.innerHTML = "";
    this.scale = this.el("b-scale", h);
    this.el("b-shadow", this.scale);
    const fl = this.el("b-float", this.scale);
    const stage = this.el("b-stage", fl);
    this.rotEl = this.el("b-rot", stage);
    const R = this.rotEl, G = GEO;

    // badan botol
    const b = G.band, l = G.label;
    this.frustum(R, b.y1, b.r, b.y2, b.r, b.n, "glass", BG.glass);
    this.frustum(R, l.y1, l.r, l.y2, l.r, l.n, "label", "", true);
    this.lathe(R, G.lower.profile, G.lower.n, "glass", BG.lower);
    this.disc(R, G.height, 83, "radial-gradient(circle, rgba(170,215,245,.55), rgba(140,195,235,.7))");

    // selang pompa (dip tube)
    [0, 90].forEach((ry) => {
      const t = this.el("b-sec", R, { top: b.y1 + "px", height: G.height - 10 - b.y1 + "px" });
      this.el("b-strip both", t, { width: "4px", height: "100%", left: "-2px", transform: `rotateY(${ry}deg)`, background: "rgba(255,255,255,.85)", boxShadow: "0 0 0 .5px rgba(120,170,210,.5)" });
    });

    // bahu putih
    this.lathe(R, G.shoulder.profile, G.shoulder.n, "white", BG.white);
    this.disc(R, G.shoulder.profile[0][0], 69, "radial-gradient(circle, #ffffff 0%, #eef5fb 70%, #dbe8f3 100%)");

    // tombol semprot (aktuator) di dalam tutup
    this.act = this.el("b-grp b-act", R);
    G.act.forEach(([y1, y2, r], i) => {
      this.frustum(this.act, y1, r, y2, r, Q(i === 2 ? 20 : 16), "white", BG.act);
      this.disc(this.act, y1, r, "radial-gradient(circle, #fff 0%, #f3f8fc 80%, #e1ecf5 100%)");
    });
    const nz = this.el("b-sec", this.act, { top: "34px", height: "0px" });
    this.el("b-disc", nz, { left: "-4px", top: "-4px", width: "8px", height: "8px", background: "#9fb7cc", transform: `translateZ(${G.act[0][2] + 0.6}px)` });
    this.nozzle = this.el("b-nozzle", nz, { transform: `translateZ(${G.act[0][2] + 2}px)` });

    // tutup transparan berbentuk kubah
    this.cap = this.el("b-grp b-cap", R);
    this.lathe(this.cap, G.cap.profile, G.cap.n, "glass", BG.cap);
    this.disc(this.cap, 0, 36, "radial-gradient(circle, rgba(255,255,255,.45) 0%, rgba(255,255,255,.2) 75%, rgba(255,255,255,.55) 100%)");

    if (LABEL_URL) this.setTexture(LABEL_URL);
  }

  setTexture(url) {
    this.strips.forEach((st) => { if (st.kind === "label") st.s.style.backgroundImage = `url(${url})`; });
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.s = Math.max(0.33, Math.min(r.height / 840, r.width / 330));
    this.scale.style.transform = `scale(${this.s})`;
  }

  bind() {
    const h = this.host;
    let lastX = 0, moved = 0;
    h.addEventListener("pointerdown", (e) => {
      this.dragging = true; moved = 0; lastX = e.clientX;
      h.classList.add("dragging");
      h.setPointerCapture?.(e.pointerId);
    });
    h.addEventListener("pointermove", (e) => {
      const r = h.getBoundingClientRect();
      const py = (e.clientY - r.top) / r.height - 0.5;
      this.tiltTarget = -8 - py * 14;
      if (!this.dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      moved += Math.abs(dx);
      this.rot += dx * 0.55;
      this.vel = dx * 0.55 * 60;
    });
    const up = () => {
      if (!this.dragging) return;
      this.dragging = false; h.classList.remove("dragging");
      if (moved < 4) this.spray();
    };
    h.addEventListener("pointerup", up);
    h.addEventListener("pointercancel", up);
    h.addEventListener("pointerleave", () => { this.tiltTarget = -8; });
    new IntersectionObserver(([en]) => (this.visible = en.isIntersecting)).observe(h);
  }

  spray() {
    if (this.host.classList.contains("spraying")) return;
    this.host.classList.add("spraying");
    // putar agar nozzle menghadap kanan
    this.sprayTarget = this.rot + norm(55 - this.rot);
    this.pause = 2.2;
    setTimeout(() => {
      const p = this.nozzle.getBoundingClientRect();
      Mist.burst(p.left, p.top, this.s);
      const b = document.createElement("div");
      b.className = "mist-bubble";
      b.textContent = CONFIG.sprayMessage;
      b.style.left = p.left + 150 * this.s + "px";
      b.style.top = p.top - 70 * this.s + "px";
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1900);
    }, 650);
    setTimeout(() => { this.host.classList.remove("spraying"); this.sprayTarget = null; }, 2100);
  }

  update(dt) {
    if (!this.visible) return;
    if (this.sprayTarget != null) {
      this.rot += (this.sprayTarget - this.rot) * Math.min(1, dt * 7);
      this.vel = 0;
    } else if (!this.dragging) {
      this.vel *= Math.pow(0.04, dt);
      this.rot += this.vel * dt;
      if (this.pause > 0) this.pause -= dt;
      else if (Math.abs(this.vel) < 30) this.rot += CONFIG.autoRotateSpeed * dt;
    }
    this.tilt += (this.tiltTarget - this.tilt) * Math.min(1, dt * 4);
    this.rotEl.style.transform = `rotateX(${this.tilt}deg) rotateY(${this.rot}deg)`;
    this.shade();
  }

  // pencahayaan per-strip: satu lapisan per strip (putih = kilap, navy = bayangan)
  shade() {
    const L = -38;
    for (const st of this.strips) {
      const rel = norm(st.a + this.rot);
      const c = Math.cos(rad(rel));
      if (st.kind !== "glass" && c < -0.05) continue;
      if (Math.abs(c - st.cosPrev) < 0.01) continue;
      st.cosPrev = c;
      const spec = Math.exp(-(((rel + 30) / 11) ** 2));
      const rim = Math.exp(-(((rel - 72) / 10) ** 2));
      const upLight = Math.max(0, st.up) * 0.35;
      let hl, sh;
      if (st.kind === "glass") {
        const f = Math.pow(1 - Math.abs(c), 2.2);
        hl = 0.04 + 0.55 * f + upLight + (c > 0 ? spec * 0.75 + rim * 0.35 : spec * 0.18);
        sh = 0;
      } else {
        const diff = Math.max(0, Math.cos(rad(rel - L)));
        sh = Math.max(0, (1 - (0.3 + 0.7 * diff)) * 0.45 + Math.pow(1 - Math.max(c, 0), 4) * 0.22 - upLight);
        hl = spec * (st.kind === "label" ? 0.45 : 0.7) + rim * 0.25 + upLight;
      }
      const v = hl - sh;
      const light = v > 0;
      if (light !== st.light) { st.light = light; st.lt.style.background = light ? "#ffffff" : "#06213f"; }
      const op = Math.min(1, Math.abs(v)).toFixed(2);
      if (op !== st.op) { st.op = op; st.lt.style.opacity = op; }
    }
  }
}

/* =====================================================================
   3. KABUT SEMPROTAN (putih)
   ===================================================================== */
const Mist = (() => {
  const cv = $("#mist-canvas");
  const ctx = cv.getContext("2d");
  let parts = [], dpr = 1, running = false, last = 0;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const sc = sprite.getContext("2d");
  const sg = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
  sg.addColorStop(0, "rgba(255,255,255,.75)"); sg.addColorStop(0.5, "rgba(255,255,255,.4)"); sg.addColorStop(1, "rgba(255,255,255,0)");
  sc.fillStyle = sg; sc.fillRect(0, 0, 64, 64);
  const fit = () => { dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  fit(); addEventListener("resize", fit);

  function burst(x, y, s = 1) {
    let n = 0;
    const iv = setInterval(() => {
      // kabut putih: campuran awan lembut + titik-titik embun halus
      for (let i = 0; i < 10; i++) {
        const fine = Math.random() < 0.45;
        parts.push({
          x, y,
          vx: (240 + Math.random() * 420) * s,
          vy: (-110 + Math.random() * 150) * s,
          r: (fine ? 1 + Math.random() * 1.6 : 3 + Math.random() * 5) * s,
          g: (fine ? 1 : 16 + Math.random() * 24) * s,
          life: 1,
          d: fine ? 0.9 + Math.random() * 0.6 : 0.5 + Math.random() * 0.5,
          fine,
        });
      }
      if (++n > 34) clearInterval(iv);
    }, 16);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.pow(0.12, dt); p.vy = p.vy * Math.pow(0.3, dt) - 18 * dt;
      p.r += p.g * dt; p.life -= p.d * dt;
      const a = Math.max(0, p.life);
      if (p.fine) {
        ctx.globalAlpha = a * 0.95;
        ctx.fillStyle = "#fff";
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      } else {
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
    }
    ctx.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  return { burst };
})();

/* =====================================================================
   4. INISIALISASI
   ===================================================================== */
function redrawLabel() {
  const l = GEO.label;
  LABEL_URL = drawLabelTexture(2 * l.r * Math.tan(Math.PI / l.n) * l.n, l.y2 - l.y1, LOGO_IMG);
  bottles.forEach((b) => b.setTexture(LABEL_URL));
}

function initBottles() {
  redrawLabel();
  $$(".bottle-host").forEach((h) => new Bottle(h));
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    bottles.forEach((b) => b.update(dt));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  addEventListener("resize", () => bottles.forEach((b) => b.resize()));

  // gambar ulang label setelah font & logo selesai dimuat
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("700 40px Fredoka"), document.fonts.load("600 12px 'Plus Jakarta Sans'")])
      .then(redrawLabel).catch(() => {});
  }
  if (window.COOLIO_LOGO_DATA) {
    const img = new Image();
    img.onload = () => { LOGO_IMG = img; redrawLabel(); };
    img.src = window.COOLIO_LOGO_DATA;
  }

  const sprayBtn = $("#sprayBtn");
  if (sprayBtn) sprayBtn.addEventListener("click", () => bottles[0] && bottles[0].spray());

  // hover spesifikasi → angkat tutup botol anatomi
  const anat = $("#anatomyBottle");
  $$(".spec").forEach((sp) => {
    sp.addEventListener("mouseenter", () => { sp.classList.add("active"); if (sp.dataset.spot === "cap" || sp.dataset.spot === "pump") anat.classList.add("lift"); });
    sp.addEventListener("mouseleave", () => { sp.classList.remove("active"); anat.classList.remove("lift"); });
  });
}

function initUI() {
  // navbar
  const nav = $("#nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });
  $("#navToggle").addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  // gelembung naik di hero
  const bub = $("#bubbles");
  const R = rng(11);
  for (let i = 0; i < (LOW_END ? 6 : 10); i++) {
    const s = document.createElement("span");
    const size = 10 + R() * 46;
    Object.assign(s.style, { left: R() * 100 + "%", width: size + "px", height: size + "px", animationDuration: 12 + R() * 16 + "s", animationDelay: -R() * 20 + "s" });
    bub.appendChild(s);
  }

  // grafik batang: tinggi dari data-value
  $$(".chart").forEach((ch) => {
    const bars = $$(".col", ch);
    const max = Math.max(...bars.map((b) => +b.dataset.value));
    bars.forEach((b) => b.style.setProperty("--h", (+b.dataset.value / max) * 100 + "%"));
  });

  // animasi muncul saat scroll + counter + bar
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      $$("[data-count]", el).forEach(countUp);
      $$(".bar i", el).forEach((b) => (b.style.width = b.dataset.value + "%"));
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });

  // kartu foto 3D tilt
  const card = $("#tiltCard");
  if (card) {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  }
}

function countUp(el) {
  const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
  const t0 = performance.now(), dur = 1600;
  const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(end * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => { initUI(); initBottles(); });
