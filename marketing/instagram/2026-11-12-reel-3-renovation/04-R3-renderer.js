// R3 v3 «Վերանորոգում · Առաջ → Հետո» renovation reel — art-director renderer (frame-stepped HTML, light theme).
// f0–179: the L02 v4 logo intro, IDENTICAL frames — delegated to marketing/instagram/tools/render_l02_frames.js
//   and renamed L02_%03d.png → R3_%03d.png (same mechanism as R2 v2 / R3 v2).
// f180–779: this page. The gold piece of the finished L02 lockup grows into the 3:4 window and opens on the first RAW
//   room; then 3 fast geometry-matched sequences RAW → PROGRESS → FINISHED (stock photos of different real rooms,
//   aligned by 04-R3-prep.py so windows / openings / floor lines stay in place), transformed with R2 gold slider wipes,
//   dissolves through light with dust / light motes, and masked material wipes (floor from the bottom, walls from the
//   top, gold level lines); 1-beat detail inserts; hero living room + final R2 slider over a matched RAW|FINISHED pair;
//   end card = R2 v2. No line art.
// Reads items.R3 of 04-render-spec.json next to this file. If code and spec disagree, the spec wins.
// usage: NODE_PATH=$(npm root -g) node 04-R3-renderer.js <repo_root> <out_dir> [all|cover|0,30,105,...]
//   (runs `python3 04-R3-prep.py <repo_root> <out_dir>/_prep` first if <out_dir>/_prep/manifest.json is missing)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || 'R3_frames');
const WHICH = process.argv[4] || 'all';
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, '04-render-spec.json'), 'utf8'));
const IT = SPEC.items.R3;
const TH = IT.theme;
const IN = IT.intro;
const INTRO_END = IN.frames[1];
const FONTSRC = path.join(ROOT, 'marketing/instagram/tools/node_modules/@fontsource');

function fontLinks() {
  const sets = { montserrat: [400, 500, 600], 'noto-sans-armenian': [400, 500, 600], 'cormorant-garamond': [300, 400, 500], 'noto-serif-armenian': [300, 400, 500] };
  return Object.entries(sets).flatMap(([p, ws]) => ws.map((w) => `<link rel="stylesheet" href="file://${FONTSRC}/${p}/${w}.css">`)).join('\n');
}
const STACK = SPEC.brand.fonts;

const html = `<!doctype html><html><head><meta charset="utf-8">${fontLinks()}
<style>
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:${TH.bg};-webkit-font-smoothing:antialiased}
</style></head><body>
<div id="app" style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden"></div>
</body></html>`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const PREP = path.join(OUT, '_prep');
  if (!fs.existsSync(path.join(PREP, 'manifest.json'))) execFileSync('python3', [path.join(__dirname, '04-R3-prep.py'), ROOT, PREP], { stdio: 'inherit' });
  const MAN = JSON.parse(fs.readFileSync(path.join(PREP, 'manifest.json'), 'utf8'));
  for (const s of IT.shots) {
    const m = MAN[s.id];
    if (!m) throw new Error('prep manifest lacks ' + s.id);
    if (m.coverage < 0.9999 || m.max_screen_upscale > 1.35) throw new Error(`${s.id}: coverage ${m.coverage} upscale ${m.max_screen_upscale}`);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const tmp = path.join(OUT, '_r3.html');
  fs.writeFileSync(tmp, html);
  await page.goto('file://' + tmp);
  await page.evaluate(setup, { IT, ROOT, PREP, STACK: { display: STACK.display.stack, text: STACK.text.stack } });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (const i of document.images) await i.decode(); });
  const fams = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
  if (!fams.some((f) => /Armenian/.test(f))) throw new Error('Armenian font not loaded: ' + fams.join(','));
  let frames;
  if (WHICH === 'all') frames = [...Array(IT.frames).keys()];
  else if (WHICH === 'cover') frames = [];
  else frames = WHICH.split(',').map(Number);
  const intro = frames.filter((f) => f <= INTRO_END);
  if (intro.length) {
    const tmpd = path.join(OUT, '_l02');
    fs.rmSync(tmpd, { recursive: true, force: true });
    execFileSync('node', [path.join(ROOT, IN.l02_renderer), ROOT, tmpd, intro.join(','), IN.l02_batch], { stdio: 'inherit' });
    for (const f of intro) { const n = String(f).padStart(3, '0'); fs.renameSync(path.join(tmpd, `L02_${n}.png`), path.join(OUT, `R3_${n}.png`)); }
    fs.rmSync(tmpd, { recursive: true, force: true });
  }
  for (const f of frames.filter((f) => f > INTRO_END)) {
    await page.evaluate((f) => window.setFrame(f), f);
    await page.screenshot({ path: path.join(OUT, `R3_${String(f).padStart(3, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  if (WHICH === 'cover' || WHICH === 'all') {
    await page.evaluate(() => window.setCover());
    await page.screenshot({ path: path.join(OUT, 'R3_cover.png'), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  const meas = await page.evaluate(() => window.measure());
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(meas, null, 1));
  await browser.close();
}

// ------------------------------------------------------------------ in-page code
function setup({ IT, ROOT, PREP, STACK }) {
  const TH = IT.theme;
  function bez([x1, y1, x2, y2]) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (p) => {
      if (p <= 0) return 0; if (p >= 1) return 1;
      let t = p;
      for (let i = 0; i < 8; i++) { const e = X(t) - p, d = dX(t); if (Math.abs(e) < 1e-7) break; if (Math.abs(d) < 1e-6) break; t -= e / d; }
      let lo = 0, hi = 1;
      if (Math.abs(X(t) - p) > 1e-6) { t = p; for (let i = 0; i < 40; i++) { if (X(t) < p) lo = t; else hi = t; t = (lo + hi) / 2; } }
      return Y(t);
    };
  }
  const EZ = {}; for (const k in IT.easings) if (Array.isArray(IT.easings[k])) EZ[k] = bez(IT.easings[k]);
  const lerp = (a, b, t) => (typeof a === 'number' ? a + (b - a) * t : Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * t) : Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t])));
  function kf(keys, f) {
    if (keys === undefined || keys === null) return 1;
    if (typeof keys === 'number') return keys;
    if (f <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [f0, v0, ez] = keys[i], [f1, v1] = keys[i + 1];
      if (f < f1) { if (ez === 'hold') return v0; return lerp(v0, v1, EZ[ez]((f - f0) / (f1 - f0))); }
    }
    return keys[keys.length - 1][1];
  }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const ramp = (f, s, e, ez = 'outCubic') => EZ[ez](clamp01((f - s) / (e - s)));
  const app = document.getElementById('app');
  const div = (css, parent = app) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; parent.appendChild(d); return d; };
  const file = (rel) => 'file://' + ROOT + '/' + rel;
  const vis = (el, o) => { el.style.opacity = o; el.style.visibility = o <= 0.0005 ? 'hidden' : 'visible'; };
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
  const NONE = 'polygon(0 0,0 0,0 0)';
  const W = IT.window.rect;
  const IN = IT.intro;
  let seed = 1; const srand = (s) => { seed = s >>> 0; }; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  // ---- background (paper + vlines), finished lockup (exit 180–198) — = R2 v2
  div(`left:0;top:0;width:1080px;height:1920px;background:${TH.bg}`);
  const bp = div('left:0;top:0;width:1080px;height:1920px;' + IT.blueprint.css.replace(/; /g, ';')); // cover only
  const vl = div('left:0;top:0;width:1080px;height:1920px');
  for (const x of IT.vlines.xs) div(`left:${x - IT.vlines.w / 2}px;top:0;width:${IT.vlines.w}px;height:1920px;background:${IT.vlines.color}`, vl);
  const SB = IN.stage_box_px, TO = IN.transform_origin_px;
  const cam = div(`left:${SB.x}px;top:${SB.y}px;width:${SB.w}px;height:${SB.h}px;transform-origin:${TO[0]}px ${TO[1]}px`);
  const logoImg = document.createElement('img'); logoImg.src = file(IN.logo_file); logoImg.style.cssText = `position:absolute;left:0;top:0;width:${SB.w}px;height:${SB.h}px`; cam.appendChild(logoImg);

  // ================================================================ SHOTS (window-local, 940×1253)
  const win = div(`left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px;overflow:hidden;background:${TH.bg}`);
  const BYID = {};
  const SHOTS = IT.shots.map((sh) => {
    const root = div(`left:0;top:0;width:${W.w}px;height:${W.h}px;overflow:hidden`, win);
    const camW = div(`left:0;top:0;width:${W.w}px;height:${W.h}px;transform-origin:${W.w / 2}px ${W.h / 2}px`, root);
    const ext = sh.extent || [0, 0, W.w, W.h];
    const img = document.createElement('img'); img.src = 'file://' + PREP + '/' + sh.id + '.jpg';
    img.style.cssText = `position:absolute;left:${ext[0]}px;top:${ext[1]}px;width:${ext[2] - ext[0]}px;height:${ext[3] - ext[1]}px`;
    camW.appendChild(img);
    const S = { sh, root, camW, img };
    BYID[sh.id] = S;
    return S;
  });
  // light veil, particles, level lines (inside the window, above the shots)
  const veilL = div(`left:0;top:0;width:${W.w}px;height:${W.h}px;background:rgba(255,246,232,1)`, win);
  const pcv = document.createElement('canvas'); pcv.width = W.w; pcv.height = W.h; pcv.style.cssText = 'position:absolute;left:0;top:0'; win.appendChild(pcv);
  const pctx = pcv.getContext('2d');
  const lvl = [0, 1].map(() => div(`left:0;width:${W.w}px;height:1.5px;background:${TH.wipe_edge};box-shadow:0 0 6px rgba(201,169,106,0.7)`, win));
  // particle systems (deterministic)
  const PS = {};
  for (const [name, P] of Object.entries(IT.particles)) {
    srand(P.seed); const arr = [];
    for (let i = 0; i < P.n; i++) {
      const r = rnd();
      arr.push({ x: rnd() * W.w, y: (rnd() * 1.1 - 0.2) * W.h, s: P.size_px[0] + (P.size_px[1] - P.size_px[0]) * r * r, v: P.v0_px_per_f[0] + (P.v0_px_per_f[1] - P.v0_px_per_f[0]) * rnd(),
        d: P.drift_px_per_f[0] + (P.drift_px_per_f[1] - P.drift_px_per_f[0]) * rnd(), ph: rnd() * 6.283, born: Math.floor(rnd() * 6), life: 0.75 + 0.25 * rnd() });
    }
    PS[name] = { P, arr };
  }
  function drawParticles(f) {
    pctx.clearRect(0, 0, W.w, W.h);
    if (coverMode) return;
    for (const S of SHOTS) {
      const T = S.sh.in; if (!T || T.type !== 'light' || !T.particles) continue;
      const a = T.frames[0] - 2, b = T.frames[1] + 22;
      if (f < a || f > b) continue;
      const { P, arr } = PS[T.particles];
      const C = cameraOf(S.sh, f);
      for (const p of arr) {
        const t = f - a - p.born; if (t < 0) continue;
        const span = (b - a - p.born) * p.life; if (t > span) continue;
        const u = t / span, env = Math.min(1, u / 0.18) * Math.pow(1 - u, 1.3);
        const k = P.drag, yy = p.y + p.v * (1 - Math.exp(-k * t)) / k, xx = p.x + p.d * t + 3 * Math.sin(p.ph + t / 9);
        // particles live in front of the room: a slight parallax vs the camera
        const sx = (xx - W.w / 2) * C.s * 1.05 + W.w / 2 + C.tx * 1.1, sy = (yy - W.h / 2) * C.s * 1.05 + W.h / 2 + C.ty * 1.1;
        const o = P.peak_opacity * env;
        if (o < 0.01) continue;
        const [r, g, bl] = P.color;
        const R = p.s * (P.blur_big && p.s > 3 ? 1.8 : 1);
        const gr = pctx.createRadialGradient(sx, sy, 0, sx, sy, R);
        gr.addColorStop(0, `rgba(${r},${g},${bl},${o.toFixed(3)})`);
        gr.addColorStop(P.blur_big && p.s > 3 ? 0.35 : 0.6, `rgba(${r},${g},${bl},${(o * 0.7).toFixed(3)})`);
        gr.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        pctx.fillStyle = gr; pctx.beginPath(); pctx.arc(sx, sy, R, 0, 6.2832); pctx.fill();
      }
    }
  }

  // ================================================================ overlays (screen space) — = R2 v2
  const goldFill = div('left:0;top:0;width:1080px;height:1920px;background:linear-gradient(135deg,#d4b57a,#b8955c)');
  const divLine = div(`top:${W.y}px;width:2px;height:${W.h}px;background:${TH.wipe_edge};box-shadow:${TH.divider_shadow}`);
  const SL_ = IT.slider, HY = SL_.handle_y;
  function handleEl(d, ring, chev, shadow) {
    const h = div(`width:${d}px;height:${d}px;border-radius:50%;box-sizing:border-box;background:${TH.handle_fill};border:1.5px solid ${ring};${shadow ? 'box-shadow:' + shadow : ''}`);
    const k = d / 64;
    h.innerHTML = `<svg width="${d}" height="${d}" viewBox="0 0 64 64" style="position:absolute;left:-1.5px;top:-1.5px"><polyline points="25.5,26 19.5,32 25.5,38" fill="none" stroke="${chev}" stroke-width="${2 / k}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="38.5,26 44.5,32 38.5,38" fill="none" stroke="${chev}" stroke-width="${2 / k}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return h;
  }
  const handle = handleEl(72, TH.wipe_edge, TH.gold_on_light, TH.handle_shadow); handle.style.top = HY - 36 + 'px';
  const wipeLine = div(`top:${W.y}px;width:2px;height:${W.h}px;background:${TH.wipe_edge};box-shadow:${TH.divider_shadow}`);
  const wipeHandle = handleEl(56, TH.wipe_edge, TH.gold_on_light, TH.handle_shadow); wipeHandle.style.top = HY - 28 + 'px';
  const styleCss = (s) => `font-family:${STACK[s.font]};font-weight:${s.weight};font-size:${s.size}px;line-height:${s.line_height || 1.2};color:${s.color};` +
    (s.letter_spacing ? `letter-spacing:${s.letter_spacing};` : '') + (s.transform ? `text-transform:${s.transform};` : '');
  const SL = IT.styles_local;
  const chipsG = div('left:0;top:0;width:1080px;height:1920px');
  for (const c of SL_.chips.items) { const s = SL.chip; const d = div(`top:${c.y}px;${c.align === 'right' ? `right:${1080 - c.x_right}px` : `left:${c.x}px`};background:${s.bg};padding:${s.padding};white-space:nowrap;${styleCss(s)}`, chipsG); d.textContent = c.text; }
  const frameLine = div(`box-sizing:border-box;left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px;border:${IT.window.frame_line.css}`);
  const leak = div('width:900px;height:900px;mix-blend-mode:screen;background:radial-gradient(closest-side, rgba(255,214,150,0.9), rgba(201,169,106,0.35) 45%, rgba(201,169,106,0) 100%)');
  const EC = IT.end_card;
  const veil = div(`left:0;top:0;width:1080px;height:1920px;background:${EC.veil.color}`);
  const CL = IT.corner_logo;
  const corner = document.createElement('img'); corner.src = file(CL.file); corner.style.cssText = `position:absolute;left:${CL.x}px;top:${CL.y}px;width:${CL.w}px;height:${CL.h}px`; app.appendChild(corner);
  const ind = div('left:0;top:0;width:1080px;height:1920px');
  div('left:874px;top:352px;width:136px;height:2px;background:rgba(23,25,28,0.16)', ind);
  const indLit = div(`left:874px;top:352px;width:136px;height:2px;background:${TH.gold_on_light};transform-origin:0 50%`, ind);
  const indDot = div(`top:349px;width:8px;height:8px;border-radius:50%;background:${TH.gold_on_light}`, ind);
  const texts = [];
  function textEl(t, s, parent = app) {
    const d = div(`left:${t.x}px;top:${t.y}px;width:${t.w}px;text-align:${t.align};white-space:nowrap;${styleCss(s)}`, parent);
    const ls = s.letter_spacing || '0';
    const h = t.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    d.innerHTML = `<span class="in" style="${t.align === 'center' ? `padding-left:${ls}` : t.align === 'right' ? `margin-right:-${ls}` : ''}">${h}</span>`;
    texts.push({ t, d }); return d;
  }
  const labels = IT.labels.map((l) => textEl(l, SL[l.style]));
  const endEls = EC.layers.map((L) => {
    if (L.layer === 'text') return { L, d: textEl(L, SL[L.style]) };
    if (L.layer === 'logo') { const i = document.createElement('img'); i.src = file(L.file); i.style.cssText = `position:absolute;left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px`; app.appendChild(i); return { L, d: i }; }
    const origin = L.origin === 'left' ? '0 50%' : '50% 50%';
    return { L, d: div(`left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px;background:${L.color};transform-origin:${origin}`) };
  });
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const cx2 = cv.getContext('2d'); const id = cx2.createImageData(256, 256);
  srand(7);
  for (let i = 0; i < 256 * 256; i++) { const v = Math.round(128 + (rnd() + rnd() - 1) * 40); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  cx2.putImageData(id, 0, 0);
  const grain = div(`left:0;top:0;width:1080px;height:1920px;mix-blend-mode:overlay;opacity:0.05;background-image:url(${cv.toDataURL()})`);

  // ---- gold piece entry (= R2 v2)
  const GP = IT.gold_piece, EN = IT.entry;
  function clipPoly(subject, rect) {
    let out = subject;
    const E = [[(p) => p[0] >= rect.x, (a, b) => { const t = (rect.x - a[0]) / (b[0] - a[0]); return [rect.x, a[1] + t * (b[1] - a[1])]; }],
      [(p) => p[0] <= rect.x + rect.w, (a, b) => { const t = (rect.x + rect.w - a[0]) / (b[0] - a[0]); return [rect.x + rect.w, a[1] + t * (b[1] - a[1])]; }],
      [(p) => p[1] >= rect.y, (a, b) => { const t = (rect.y - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), rect.y]; }],
      [(p) => p[1] <= rect.y + rect.h, (a, b) => { const t = (rect.y + rect.h - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), rect.y + rect.h]; }]];
    for (const [inside, inter] of E) {
      const inp = out; out = [];
      for (let i = 0; i < inp.length; i++) { const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
        if (inside(b)) { if (!inside(a)) out.push(inter(a, b)); out.push(b); } else if (inside(a)) out.push(inter(a, b)); }
      if (!out.length) break;
    }
    return out;
  }
  const goldPts = (f) => {
    const e = EN.frame, u = clamp01((f - e) / 12), g = f <= e ? 1.6 : 1.6 * Math.pow(32, EZ.inOutCubic(u));
    const an = lerp(EN.anchor_from_px, EN.anchor_to_px, EZ[EN.anchor_ease](u));
    return GP.shape_units.map(([x, y]) => [an[0] + g * x, an[1] + g * y]);
  };

  // ================================================================ per-frame
  let coverMode = false;
  function cameraOf(sh, f) {
    const C = IT.cameras[sh.camera];
    return { s: kf(C.scale, f), tx: kf(C.tx, f) + 2.0 * Math.sin(f / 41), ty: kf(C.ty, f) + 1.6 * Math.sin(f / 53 + 1) };
  }
  // returns {o: opacity, clip, mask, wipeX (window-local px or null), levels: [y...], veil, lvlO}
  function transitionState(sh, f) {
    const T = sh.in;
    const st = { o: 1, clip: 'none', mask: '', wipeX: null, wipeO: 0, levels: [], lvlO: 0, veil: 0 };
    if (!T || coverMode) return st;
    const [a, b] = T.frames;
    if (f >= b) return st;
    const u = clamp01((f - a) / (b - a));
    if (T.type === 'slider') {
      const e = EZ[T.ease || 'inOutCubic'](u), X = W.w * (1 - e);
      st.clip = `inset(0px 0px 0px ${X.toFixed(2)}px)`; st.wipeX = X;
      st.wipeO = Math.min(clamp01((f - a + 1) / 3), clamp01((b - f) / 4));
    } else if (T.type === 'light') {
      st.o = EZ.inOutSine(clamp01((u - 0.3) / 0.4));
      st.veil = 0.58 * Math.pow(Math.sin(Math.PI * u), 1.4);
    } else if (T.type === 'material') {
      const e = EZ.inOutCubic(u), L = T.line_frac * W.h, soft = 46;
      const yb = W.h + soft - (W.h + soft - L) * e; // floor edge, moving up
      const layers = [`linear-gradient(to bottom, transparent ${(yb - soft).toFixed(1)}px, #000 ${yb.toFixed(1)}px)`];
      st.levels.push(yb - soft / 2);
      if (T.walls === 'top') {
        const yt = -soft + (L + soft) * e;
        layers.push(`linear-gradient(to bottom, #000 ${yt.toFixed(1)}px, transparent ${(yt + soft).toFixed(1)}px)`);
        st.levels.push(yt + soft / 2);
      }
      st.mask = layers.join(',');
      st.lvlO = Math.min(clamp01((f - a) / 3), clamp01((b - f) / 5)) * 0.9;
    }
    return st;
  }
  function wallFade(sh, f) { // material with walls:"fade" → after the floor wipe the rest of the frame cross-fades
    const T = sh.in; if (!T || T.walls !== 'fade' || coverMode) return null;
    const [a, b] = T.walls_frames; if (f >= b) return null;
    return EZ.inOutSine(clamp01((f - a) / (b - a)));
  }
  window.setFrame = function (f) {
    const CXk = IN.camera_exit;
    cam.style.transform = `translate(0px, 0px) scale(${kf(CXk.exit_scale_mul, f)})`; vis(cam, coverMode ? 0 : kf(CXk.exit_opacity, f));
    vis(bp, coverMode ? 0.55 : 0);
    vis(vl, coverMode ? 1 : kf(IT.vlines.opacity, f));
    // entry clip
    let clip = 'none'; vis(goldFill, 0);
    if (!coverMode && f < EN.frame + 12) { const cp = clipPoly(goldPts(f), W); clip = cp.length ? poly(cp) : NONE; }
    if (!coverMode && f <= EN.frame + 11) { const go = kf(EN.gold_fill_opacity, f); if (go > 0) { goldFill.style.clipPath = clip; vis(goldFill, go); } }
    win.style.clipPath = clip === 'none' || clip === NONE ? clip : poly(clipPoly(goldPts(f), W).map(([x, y]) => [x - W.x, y - W.y])); vis(win, f >= 180 || coverMode ? 1 : 0);
    // shots
    let veilO = 0, wipe = null, lv = [], lvO = 0;
    const p = coverMode ? 0.5 : kf(SL_.p, f);
    for (const S of SHOTS) {
      const sh = S.sh;
      let on = f >= sh.frames[0] && f <= sh.frames[1];
      if (sh.slider_side === 'left') on = on && p > 0.0005;
      vis(S.root, on ? 1 : 0);
      if (!on) continue;
      const C = cameraOf(sh, f);
      S.camW.style.transform = `translate(${C.tx.toFixed(2)}px,${C.ty.toFixed(2)}px) scale(${C.s.toFixed(5)})`;
      const st = transitionState(sh, f);
      let o = st.o; const wf = wallFade(sh, f);
      if (sh.slider_side === 'left') S.root.style.clipPath = `inset(0px ${(W.w * (1 - p)).toFixed(2)}px 0px 0px)`;
      else S.root.style.clipPath = st.clip;
      if (wf !== null) { // floor wipe (mask) ∪ walls fade: CSS can't union an opacity with a mask → mask with the walls band at alpha wf
        const T = sh.in, [a, b] = T.frames, e = EZ.inOutCubic(clamp01((f - a) / (b - a))), L = T.line_frac * W.h, soft = 46;
        const yb = W.h + soft - (W.h + soft - L) * e, al = wf.toFixed(3);
        S.root.style.webkitMaskImage = `linear-gradient(to bottom, rgba(0,0,0,${al}) ${(yb - soft).toFixed(1)}px, #000 ${yb.toFixed(1)}px)`;
        if (st.levels.length) { lv = st.levels; lvO = st.lvlO; }
      } else {
        S.root.style.webkitMaskImage = st.mask || '';
        if (st.levels.length) { lv = st.levels; lvO = st.lvlO; }
      }
      vis(S.root, o);
      if (st.wipeX !== null) wipe = st;
      veilO = Math.max(veilO, st.veil);
    }
    vis(veilL, veilO);
    lvl.forEach((d, i) => { if (i < lv.length && lvO > 0) { d.style.top = lv[i].toFixed(1) + 'px'; vis(d, lvO); } else vis(d, 0); });
    drawParticles(f);
    // transition wipe divider
    if (wipe) { const xd = W.x + wipe.wipeX; wipeLine.style.left = xd - 1 + 'px'; vis(wipeLine, 1); wipeHandle.style.left = xd - 28 + 'px'; vis(wipeHandle, wipe.wipeO); }
    else { vis(wipeLine, 0); vis(wipeHandle, 0); }
    // final slider
    const ho = coverMode ? 1 : kf(SL_.handle_opacity, f);
    const xd = W.x + W.w * p;
    divLine.style.left = xd - 1 + 'px'; vis(divLine, Math.max(ho, p > 0.001 && p < 0.999 ? 1 : 0) * (f >= 540 || coverMode ? 1 : 0));
    handle.style.left = xd - 36 + 'px'; handle.style.transform = `scale(${coverMode ? 1 : kf(SL_.handle_grab, f)})`; vis(handle, ho);
    vis(chipsG, coverMode ? 1 : kf(SL_.chips.opacity, f));
    // indicator
    const ip = coverMode ? 1 / 3 + 2 / 3 * 0.5 : f >= IT.indicator.slider_from && f < 666 ? 1 / 3 + 2 / 3 * (1 - p) : kf(IT.indicator.steps, f);
    indLit.style.transform = `scaleX(${ip})`; indDot.style.left = 874 + 136 * ip - 4 + 'px';
    // leaks
    let lo = 0, lx = 540, ly = 1016;
    if (!coverMode) for (const L of IT.light_leaks.events) { const v = kf(L.opacity, f); if (v > lo) { lo = v; lx = kf(L.cx, f); ly = L.cy; } }
    leak.style.left = lx - 450 + 'px'; leak.style.top = ly - 450 + 'px'; vis(leak, lo);
    vis(frameLine, coverMode ? 1 : kf(IT.window.frame_line.opacity, f));
    vis(veil, coverMode ? 0 : kf(EC.veil.opacity, f));
    win.style.filter = !coverMode && kf(EC.veil.blur_px_on_triptych, f) > 0.01 ? `blur(${kf(EC.veil.blur_px_on_triptych, f)}px)` : '';
    vis(corner, coverMode ? 0.92 : kf(CL.opacity, f));
    let secO = 0;
    IT.labels.forEach((l, i) => {
      let o = kf(l.opacity, f);
      if (coverMode) o = l.kind === 'section' ? 1 : l.text === IT.cover.stage_text ? 1 : 0;
      vis(labels[i], o); labels[i].style.transform = `translateY(${coverMode ? 0 : kf(l.translate_y, f)}px)`; if (l.kind === 'section') secO = Math.max(secO, o);
    });
    vis(ind, secO);
    for (const { L, d } of endEls) {
      const o = coverMode ? 0 : L.opacity ? kf(L.opacity, f) : L.scale_x ? (f >= L.scale_x[0][0] ? 1 : 0) : 1;
      vis(d, o);
      const tfs = []; if (L.translate_y) tfs.push(`translateY(${kf(L.translate_y, f)}px)`); if (L.scale_x) tfs.push(`scaleX(${kf(L.scale_x, f)})`);
      d.style.transform = tfs.join(' ');
    }
    vis(grain, coverMode ? 0.05 : f < IT.grain.active_from ? 0 : kf(IT.grain.opacity, f));
    const k = Math.floor((coverMode ? 0 : f) / 2); grain.style.backgroundPosition = `${(37 * k) % 256}px ${(91 * k) % 256}px`;
  };
  window.setCover = function () { coverMode = true; window.setFrame(IT.cover.base_frame_index); };
  window.measure = function () {
    coverMode = false;
    const out = [];
    for (const fr of [200, 230, 260, 300, 340, 365, 400, 440, 480, 520, 590, 625, 655, 760]) {
      window.setFrame(fr);
      for (const { t, d } of texts) { if (getComputedStyle(d).visibility === 'hidden' || +d.style.opacity < 0.5) continue; const r = d.querySelector('.in').getBoundingClientRect(); out.push({ f: fr, text: t.text, x0: Math.round(r.left), x1: Math.round(r.right), y0: Math.round(r.top), y1: Math.round(r.bottom), font: getComputedStyle(d).fontFamily }); }
    }
    return out;
  };
}

main().catch((e) => { console.error(e); process.exit(1); });
