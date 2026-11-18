// R2 «Առաջ / Հետո» reel — art-director renderer (frame-stepped HTML, light theme). v2 (owner feedback 2026-11-12).
// f0–179: the L02 v4 logo intro, IDENTICAL frames — delegated to marketing/instagram/tools/render_l02_frames.js
//   (items.L02 of 2026-11-11-launch/04-render-spec.json) and renamed L02_%03d.png → R2_%03d.png.
// f180–779: this page. The finished L02 lockup (logo <img>) pushes in/fades (L02 camera exit keys) while its gold piece
//   grows into the 3:4 window and opens on the night house (= L02 gold_piece_from_logo); then before/after slider pairs
//   with a handle, 2.5D foreground parallax, micro camera drift, triptych finale, light leaks, paper grain, end card.
// Reads EVERYTHING from items.R2 of 04-render-spec.json next to this file. If code and spec disagree, the spec wins.
// usage: NODE_PATH=$(npm root -g) node 04-R2-renderer.js <repo_root> <out_dir> [all|cover|0,30,105,...]
//   writes <out_dir>/R2_%03d.png, R2_cover.png (for all|cover) and measure.json.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || 'R2_frames');
const WHICH = process.argv[4] || 'all';
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, '04-render-spec.json'), 'utf8'));
const IT = SPEC.items.R2;
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
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const tmp = path.join(OUT, '_r2.html');
  fs.writeFileSync(tmp, html);
  await page.goto('file://' + tmp);
  await page.evaluate(setup, { IT, ROOT, STACK: { display: STACK.display.stack, text: STACK.text.stack } });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (const i of document.images) await i.decode(); });
  const fams = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
  if (!fams.some((f) => /Armenian/.test(f))) throw new Error('Armenian font not loaded: ' + fams.join(','));
  let frames;
  if (WHICH === 'all') frames = [...Array(IT.frames).keys()];
  else if (WHICH === 'cover') frames = [];
  else frames = WHICH.split(',').map(Number);
  // f0–INTRO_END: the L02 v4 intro, rendered by the L02 renderer itself (pixel-identical by construction)
  const intro = frames.filter((f) => f <= INTRO_END);
  if (intro.length) {
    const tmpd = path.join(OUT, '_l02');
    fs.rmSync(tmpd, { recursive: true, force: true });
    execFileSync('node', [path.join(ROOT, IN.l02_renderer), ROOT, tmpd, intro.join(','), IN.l02_batch], { stdio: 'inherit' });
    for (const f of intro) { const n = String(f).padStart(3, '0'); fs.renameSync(path.join(tmpd, `L02_${n}.png`), path.join(OUT, `R2_${n}.png`)); }
    fs.rmSync(tmpd, { recursive: true, force: true });
  }
  for (const f of frames.filter((f) => f > INTRO_END)) {
    await page.evaluate((f) => window.setFrame(f), f);
    await page.screenshot({ path: path.join(OUT, `R2_${String(f).padStart(3, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  if (WHICH === 'cover' || WHICH === 'all') {
    await page.evaluate(() => window.setCover());
    await page.screenshot({ path: path.join(OUT, 'R2_cover.png'), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  const meas = await page.evaluate(() => window.measure());
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(meas, null, 1));
  await browser.close();
}

// ------------------------------------------------------------------ in-page code
function setup({ IT, ROOT, STACK }) {
  const NS = 'http://www.w3.org/2000/svg';
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
    if (!keys) return 1;
    if (typeof keys === 'number') return keys;
    if (f <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [f0, v0, ez] = keys[i], [f1, v1] = keys[i + 1];
      if (f < f1) { if (ez === 'hold') return v0; return lerp(v0, v1, EZ[ez]((f - f0) / (f1 - f0))); }
    }
    return keys[keys.length - 1][1];
  }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const app = document.getElementById('app');
  const div = (css, parent = app) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; parent.appendChild(d); return d; };
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const file = (rel) => 'file://' + ROOT + '/' + rel;
  const vis = (el, o) => { el.style.opacity = o; el.style.visibility = o <= 0.0005 ? 'hidden' : 'visible'; };
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
  const NONE = 'polygon(0 0,0 0,0 0)';
  const W = IT.window.rect;
  const grade = IT.pair_impl.grade.match(/saturate\([^)]*\) contrast\([^)]*\)/)[0];

  const IN = IT.intro;

  // ---- background layers (f180+; the L02 intro's grid, ground line and glow have all faded out by f160)
  div(`left:0;top:0;width:1080px;height:1920px;background:${TH.bg}`);
  const bpCss = IT.blueprint.css.replace(/; /g, ';');
  const bp = div('left:0;top:0;width:1080px;height:1920px;' + bpCss); // cover only
  const vl = div('left:0;top:0;width:1080px;height:1920px');
  for (const x of IT.vlines.xs) div(`left:${x - IT.vlines.w / 2}px;top:0;width:${IT.vlines.w}px;height:1920px;background:${IT.vlines.color}`, vl);

  // ---- finished L02 lockup (= L02 logoImg in its camera wrapper from f167), exits 180–198 under the gold piece
  const SB = IN.stage_box_px, TO = IN.transform_origin_px;
  const cam = div(`left:${SB.x}px;top:${SB.y}px;width:${SB.w}px;height:${SB.h}px;transform-origin:${TO[0]}px ${TO[1]}px`);
  const logoImg = document.createElement('img'); logoImg.src = file(IN.logo_file); logoImg.style.cssText = `position:absolute;left:0;top:0;width:${SB.w}px;height:${SB.h}px`; cam.appendChild(logoImg);

  // ---- photo helpers
  const mkImg = (src, parent) => { const i = document.createElement('img'); i.src = file(src); i.style.cssText = `position:absolute;left:0;top:0;filter:${grade}`; parent.appendChild(i); return i; };
  const placeCrop = (img, [SW, SH], bw, c) => { const sc = bw / (c.w * SW); img.style.width = SW * sc + 'px'; img.style.height = SH * sc + 'px'; img.style.left = -c.x * SW * sc + 'px'; img.style.top = -c.y * SH * sc + 'px'; };
  // a "plate" = wrap (moves) with base img + optional foreground parallax copy
  function plate(parent, side, w, h, par) {
    const wrap = div(`left:0;top:0;width:${w}px;height:${h}px`, parent);
    const base = mkImg(side.src, wrap); placeCrop(base, side.src_px, w, side.crop);
    let fg = null;
    if (par) {
      const a = (par.mask_y - par.feather / 2) * 100, b = (par.mask_y + par.feather / 2) * 100;
      fg = div(`left:0;top:0;width:${w}px;height:${h}px;-webkit-mask-image:linear-gradient(to bottom, transparent ${a}%, #000 ${b}%);transform-origin:${par.origin[0] * 100}% ${par.origin[1] * 100}%`, wrap);
      const im = mkImg(side.src, fg); placeCrop(im, side.src_px, w, side.crop);
    }
    return { wrap, fg };
  }
  // ---- pairs
  const pairs = IT.pairs.map((P) => {
    const layer = div('left:0;top:0;width:1080px;height:1920px');
    const win = div(`left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px;overflow:hidden`, layer);
    const after = plate(win, P.after, W.w, W.h, P.parallax);
    const bclip = div(`left:0;top:0;width:${W.w}px;height:${W.h}px`, win);
    const before = plate(bclip, P.before, W.w, W.h, P.parallax);
    for (const pl of [after, before]) pl.wrap.style.transformOrigin = `${P.push.anchor[0] * 100}% ${P.push.anchor[1] * 100}%`;
    return { P, layer, after, before, bclip };
  });
  // ---- triptych
  const T = IT.triptych;
  const tSheet = div(`left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px;overflow:hidden;background:${TH.bg}`);
  div(`left:${-W.x}px;top:${-W.y}px;width:1080px;height:1920px;opacity:0.7;${bpCss.replace(/-webkit-mask-image:[^;]*;?/, '')}`, tSheet);
  const panels = T.panels.map((Q) => {
    const R = Q.rect;
    const layer = div('left:0;top:0;width:1080px;height:1920px');
    const win = div(`left:${R.x}px;top:${R.y}px;width:${R.w}px;height:${R.h}px;overflow:hidden`, layer);
    const after = plate(win, Q.after, R.w, R.h, null);
    const bclip = div(`left:0;top:0;width:${R.w}px;height:${R.h}px`, win);
    const before = plate(bclip, Q.before, R.w, R.h, null);
    return { Q, layer, after, before, bclip };
  });
  const tripBlurTargets = [tSheet, ...panels.map((p) => p.layer)];
  // ---- gold fill, edges, divider, handle, frame
  const goldFill = div('left:0;top:0;width:1080px;height:1920px;background:linear-gradient(135deg,#d4b57a,#b8955c)');
  const shutE1 = div(`left:${W.x}px;width:${W.w}px;height:2px;background:${TH.wipe_edge}`), shutE2 = div(`left:${W.x}px;width:${W.w}px;height:2px;background:${TH.wipe_edge}`);
  const divLine = div(`top:${W.y}px;width:2px;height:${W.h}px;background:${TH.wipe_edge};box-shadow:${TH.divider_shadow}`);
  const HY = 1016;
  function handleEl(d, ring, chev, shadow) {
    const h = div(`width:${d}px;height:${d}px;border-radius:50%;box-sizing:border-box;background:${TH.handle_fill};border:1.5px solid ${ring};${shadow ? 'box-shadow:' + shadow : ''}`);
    const k = d / 64;
    h.innerHTML = `<svg width="${d}" height="${d}" viewBox="0 0 64 64" style="position:absolute;left:-1.5px;top:-1.5px"><polyline points="25.5,26 19.5,32 25.5,38" fill="none" stroke="${chev}" stroke-width="${2 / k}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="38.5,26 44.5,32 38.5,38" fill="none" stroke="${chev}" stroke-width="${2 / k}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return h;
  }
  const handle = handleEl(72, TH.wipe_edge, TH.gold_on_light, TH.handle_shadow); handle.style.top = HY - 36 + 'px';
  const frameLine = div(`box-sizing:border-box;left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px;border:${IT.window.frame_line.css}`);
  const leak = div('width:900px;height:900px;mix-blend-mode:screen;background:radial-gradient(closest-side, rgba(255,214,150,0.9), rgba(201,169,106,0.35) 45%, rgba(201,169,106,0) 100%)');
  const EC = IT.end_card;
  const veil = div(`left:0;top:0;width:1080px;height:1920px;background:${EC.veil.color}`);
  const CL = IT.corner_logo;
  const corner = document.createElement('img'); corner.src = file(CL.file); corner.style.cssText = `position:absolute;left:${CL.x}px;top:${CL.y}px;width:${CL.w}px;height:${CL.h}px`; app.appendChild(corner);
  // indicator
  const ind = div('left:0;top:0;width:1080px;height:1920px');
  div('left:874px;top:352px;width:136px;height:2px;background:rgba(23,25,28,0.16)', ind);
  const indLit = div(`left:874px;top:352px;width:136px;height:2px;background:${TH.gold_on_light};transform-origin:0 50%`, ind);
  const indDot = div(`top:349px;width:8px;height:8px;border-radius:50%;background:${TH.gold_on_light}`, ind);

  // ---- text
  const styleCss = (s) => `font-family:${STACK[s.font]};font-weight:${s.weight};font-size:${s.size}px;line-height:${s.line_height || 1.2};color:${s.color};` +
    (s.letter_spacing ? `letter-spacing:${s.letter_spacing};` : '') + (s.transform ? `text-transform:${s.transform};` : '');
  const SL = IT.styles_local;
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
    if (L.layer === 'handle_small') { const h = handleEl(L.d, TH.gold_on_light, TH.gold_on_light, null); h.style.left = L.cx - L.d / 2 + 'px'; h.style.top = L.cy - L.d / 2 + 'px'; h.style.background = TH.bg; return { L, d: h }; }
    const origin = L.layer === 'divider' ? '50% 50%' : L.origin === 'left' ? '0 50%' : '50% 50%';
    return { L, d: div(`left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px;background:${L.color};transform-origin:${origin}`) };
  });
  // cover-only elements
  const CV = IT.cover;
  const coverG = div('left:0;top:0;width:1080px;height:1920px');
  textEl({ text: 'Տուն', x: 240, y: 270, w: 770, align: 'right' }, SL.section_label, coverG);
  textEl({ text: CV.stage_text, x: 240, y: 294, w: 770, align: 'right' }, SL.stage_label, coverG);
  for (const c of CV.chips) { const s = SL.chip; const d = div(`top:${c.y}px;${c.align === 'right' ? `right:${1080 - c.x_right}px` : `left:${c.x}px`};background:${s.bg};padding:${s.padding};white-space:nowrap;${styleCss(s)}`, coverG); d.textContent = c.text; }
  vis(coverG, 0);
  // ---- grain (deterministic noise tile)
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const cx2 = cv.getContext('2d'); const id = cx2.createImageData(256, 256);
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 256 * 256; i++) { const v = Math.round(128 + (rnd() + rnd() - 1) * 40); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  cx2.putImageData(id, 0, 0);
  const grain = div(`left:0;top:0;width:1080px;height:1920px;mix-blend-mode:overlay;opacity:0.05;background-image:url(${cv.toDataURL()})`);

  // ---- transitions
  const GP = IT.pair_impl.gold_piece;
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
  const goldPts = (en, f) => {
    const e = en.frame, u = clamp01((f - e) / 12), g = f <= e ? 1.6 : 1.6 * Math.pow(32, EZ.inOutCubic(u));
    const an = en.type === 'gold_piece_from_logo' ? lerp(en.anchor_from_px, en.anchor_to_px, EZ[en.anchor_ease](u)) : GP.anchor_px;
    return GP.shape_units.map(([x, y]) => [an[0] + g * x, an[1] + g * y]);
  };
  const bandRect = (yc, hv, R) => { const y0 = Math.max(R.y, yc - hv), y1 = Math.min(R.y + R.h, yc + hv); return y1 <= y0 ? NONE : poly([[R.x, y0], [R.x + R.w, y0], [R.x + R.w, y1], [R.x, y1]]); };

  let coverMode = false;
  window.setFrame = function (f) {
    // ---- lockup exit (L02 stage.camera at f ≥ 180: s = 1, ty = 0, shake = 0)
    const CX = IN.camera_exit;
    cam.style.transform = `translate(0px, 0px) scale(${kf(CX.exit_scale_mul, f)})`; vis(cam, coverMode ? 0 : kf(CX.exit_opacity, f));
    vis(bp, coverMode ? 0.55 : 0); bp.style.transform = 'none';
    vis(vl, coverMode ? 1 : kf(IT.vlines.opacity, f));

    // ---- pairs
    const drift = [2.5 * Math.sin(f / 41), 2 * Math.sin(f / 53 + 1)];
    let activeP = null, handleO = 0, grab = 1;
    vis(goldFill, 0); vis(shutE1, 0); vis(shutE2, 0);
    for (const o of pairs) {
      const P = o.P, [a, b] = P.life, en = P.entry, e = en.frame;
      if (/^gold_piece/.test(en.type) && !coverMode && f >= e - 4 && f <= e + 11) {
        const go = kf(en.gold_fill_opacity, f);
        if (go > 0) { const cp = clipPoly(goldPts(en, f), W); goldFill.style.clipPath = cp.length ? poly(cp) : NONE; vis(goldFill, go); }
      }
      const on = coverMode ? P.id === 'H' : f >= a && f <= b; vis(o.layer, on ? 1 : 0); if (!on) continue;
      const ff = coverMode ? IT.cover.base_frame_index : f;
      const z = kf(P.push.z, ff), ex = kf(P.parallax.extra_scale, ff);
      const tf = `translate(${drift[0]}px,${drift[1]}px) scale(${z})`;
      for (const pl of [o.after, o.before]) { pl.wrap.style.transform = tf; pl.fg.style.transform = `scale(${ex})`; }
      const p = coverMode ? 0.5 : kf(P.p, f);
      o.bclip.style.clipPath = `inset(0px ${(W.w * (1 - p)).toFixed(2)}px 0px 0px)`;
      let clip = 'none';
      if (!coverMode && /^gold_piece/.test(en.type) && f < e + 12) { const cp = clipPoly(goldPts(en, f), W); clip = cp.length ? poly(cp) : NONE; }
      if (!coverMode && en.type === 'horizon_shutter') {
        const hv = kf(en.hv, f);
        if (f < en.hv[en.hv.length - 1][0]) clip = bandRect(en.y_px, hv, W);
        const eo = kf(en.edges_opacity, f);
        if (eo > 0 && f <= en.edges_opacity[en.edges_opacity.length - 1][0]) {
          const y0 = Math.max(W.y, en.y_px - hv), y1 = Math.min(W.y + W.h, en.y_px + hv);
          shutE1.style.top = y0 - 1 + 'px'; shutE2.style.top = y1 - 1 + 'px'; vis(shutE1, y0 > W.y ? eo : 0); vis(shutE2, y1 < W.y + W.h ? eo : 0);
        }
      }
      o.layer.style.clipPath = clip;
      const ho = coverMode ? 1 : kf(P.handle_opacity, f);
      if (ho > 0 || (p > 0.001 && p < 0.999)) { activeP = p; handleO = ho; grab = coverMode ? 1 : kf(P.handle_grab, f); }
      if (f >= a && f <= b) o._p = p;
    }
    // ---- triptych
    const tOn = !coverMode && f >= T.frames[0];
    vis(tSheet, tOn ? kf(T.sheet_opacity, f) : 0);
    const tp = kf(T.p, f), tz = kf(T.panel_zoom, f);
    const blur = kf(EC.veil.blur_px_on_triptych, f);
    for (const o of panels) {
      vis(o.layer, tOn ? 1 : 0); if (!tOn) continue;
      const R = o.Q.rect, ty = kf(o.Q.ty, f);
      const tf = `translate(${drift[0] * 0.6}px,${ty}px) scale(${tz})`;
      for (const pl of [o.after, o.before]) { pl.wrap.style.transformOrigin = '50% 50%'; pl.wrap.style.transform = tf; }
      const xd = W.x + W.w * tp, loc = Math.max(0, Math.min(R.w, xd - R.x));
      o.bclip.style.clipPath = `inset(0px ${(R.w - loc).toFixed(2)}px 0px 0px)`;
      const hv = kf(o.Q.rise, f);
      o.layer.style.clipPath = f < o.Q.rise[o.Q.rise.length - 1][0] ? bandRect(1016.5, hv, R) : 'none';
    }
    for (const el of tripBlurTargets) el.style.filter = blur > 0.01 ? `blur(${blur}px)` : '';
    if (tOn && f >= T.handle_visible_from) { const ho = kf(T.handle_opacity, f); if (ho > 0 || (tp > 0.001 && tp < 0.999)) { activeP = tp; handleO = ho; grab = kf(T.handle_grab, f); } }
    if (activeP !== null) {
      const xd = W.x + W.w * activeP;
      divLine.style.left = xd - 1 + 'px'; vis(divLine, Math.max(handleO, activeP > 0.001 && activeP < 0.999 ? 1 : 0));
      handle.style.left = xd - 36 + 'px'; handle.style.transform = `scale(${grab})`; vis(handle, handleO);
    } else { vis(divLine, 0); vis(handle, 0); }
    // indicator mirrors the visible divider state
    let ip = activeP;
    if (ip === null) { for (const o of pairs) if (f >= o.P.life[0] && f <= o.P.life[1]) ip = kf(o.P.p, f); if (tOn) ip = tp; }
    if (coverMode) ip = 0.5;
    ip = ip === null ? 0 : ip;
    indLit.style.transform = `scaleX(${ip})`; indDot.style.left = 874 + 136 * ip - 4 + 'px';
    // ---- light leaks
    let lo = 0, lx = 540, ly = 1016;
    if (!coverMode) for (const L of IT.light_leaks.events) { const v = kf(L.opacity, f); if (v > lo) { lo = v; lx = kf(L.cx, f); ly = L.cy; } }
    leak.style.left = lx - 450 + 'px'; leak.style.top = ly - 450 + 'px'; vis(leak, lo);
    // ---- frame, veil, corner, labels
    vis(frameLine, coverMode ? 1 : kf(IT.window.frame_line.opacity, f));
    vis(veil, coverMode ? 0 : kf(EC.veil.opacity, f));
    vis(corner, coverMode ? 0.92 : kf(CL.opacity, f));
    let secO = 0;
    IT.labels.forEach((l, i) => { const o = coverMode ? 0 : kf(l.opacity, f); vis(labels[i], o); labels[i].style.transform = `translateY(${kf(l.translate_y, f)}px)`; if (l.kind === 'section') secO = Math.max(secO, o); });
    vis(ind, coverMode ? 1 : secO);
    for (const { L, d } of endEls) {
      let o = coverMode ? 0 : L.opacity ? kf(L.opacity, f) : L.scale_x ? (f >= L.scale_x[0][0] ? 1 : 0) : L.scale_y ? (f >= L.scale_y[0][0] ? 1 : 0) : 1;
      vis(d, o);
      const tf = []; if (L.translate_y) tf.push(`translateY(${kf(L.translate_y, f)}px)`); if (L.scale_x) tf.push(`scaleX(${kf(L.scale_x, f)})`); if (L.scale_y) tf.push(`scaleY(${kf(L.scale_y, f)})`); if (L.scale) tf.push(`scale(${kf(L.scale, f)})`);
      d.style.transform = tf.join(' ');
    }
    vis(coverG, coverMode ? 1 : 0);
    vis(grain, coverMode ? 0.05 : f < IT.grain.active_from ? 0 : kf(IT.grain.opacity, f));
    const k = Math.floor((coverMode ? 0 : f) / 2); grain.style.backgroundPosition = `${(37 * k) % 256}px ${(91 * k) % 256}px`;
  };
  window.setCover = function () { coverMode = true; window.setFrame(IT.cover.base_frame_index); };
  window.measure = function () {
    coverMode = false;
    const out = [];
    for (const fr of [220, 290, 360, 460, 620, 660, 760]) {
      window.setFrame(fr);
      for (const { t, d } of texts) { if (getComputedStyle(d).visibility === 'hidden' || +d.style.opacity < 0.5) continue; const r = d.querySelector('.in').getBoundingClientRect(); out.push({ f: fr, text: t.text, x0: Math.round(r.left), x1: Math.round(r.right), y0: Math.round(r.top), y1: Math.round(r.bottom), font: getComputedStyle(d).fontFamily }); }
    }
    return out;
  };
}

main().catch((e) => { console.error(e); process.exit(1); });
