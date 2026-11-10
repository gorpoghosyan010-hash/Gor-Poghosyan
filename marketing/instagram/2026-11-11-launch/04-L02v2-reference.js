// L02 reference prototype (art director) — renders v3 (light theme + stock mood stills). File name kept from v2.
// Implements items.L02 of 04-render-spec.json literally; all colours come from items.L02.theme.
// The SPEC is authoritative; this file only proves it is executable and gives the producer a starting point.
// usage: node 04-L02v2-reference.js <repo_root> <out_dir> [frames=all|cover|0,30,105,...]
//   writes <out_dir>/L02_%03d.png (and L02_cover.png for "cover"). Encode with items.L02.render.encode.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || 'L02v2_frames');
const WHICH = process.argv[4] || 'all';
const BATCH = path.join(ROOT, 'marketing/instagram/2026-11-11-launch');
const SPEC = JSON.parse(fs.readFileSync(path.join(BATCH, '04-render-spec.json'), 'utf8'));
const IT = SPEC.items.L02;
const TH = IT.theme;
const LOGO = path.join(ROOT, IT.stage.logo_file || TH.logo_file);
const LOGO_SVG = fs.readFileSync(LOGO, 'utf8');
const FONTSRC = path.join(ROOT, 'marketing/instagram/tools/node_modules/@fontsource');

function fontLinks() {
  const sets = { montserrat: [400, 500, 600], 'noto-sans-armenian': [400, 500, 600], 'cormorant-garamond': [300, 400, 500], 'noto-serif-armenian': [300, 400, 500] };
  return Object.entries(sets).flatMap(([p, ws]) => ws.map((w) => `<link rel="stylesheet" href="file://${FONTSRC}/${p}/${w}.css">`)).join('\n');
}
const STACK = SPEC.brand.fonts;
const ST = SPEC.styles;

const html = `<!doctype html><html><head><meta charset="utf-8">${fontLinks()}
<style>
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:${TH.bg};-webkit-font-smoothing:antialiased}
.abs{position:absolute;left:0;top:0}
.full{position:absolute;left:0;top:0;width:1080px;height:1920px}
.txt{position:absolute;white-space:nowrap;font-feature-settings:normal}
</style></head><body>
<div id="app" class="full"></div>
<script>window.__LOGO_URL=${JSON.stringify('file://' + LOGO)};</script>
</body></html>`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const tmp = path.join(OUT, '_l02v2.html');
  fs.writeFileSync(tmp, html);
  await page.goto('file://' + tmp);
  await page.evaluate(setup, { IT, LOGO_SVG, ROOT, STACK: { display: STACK.display.stack, text: STACK.text.stack }, hook: { ...ST.reel_hook, ...(IT.hook_style_override || {}) } });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (const i of document.images) await i.decode(); });
  const fams = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
  if (!fams.some((f) => /Armenian/.test(f))) throw new Error('Armenian font not loaded: ' + fams.join(','));
  let frames;
  if (WHICH === 'all') frames = [...Array(IT.frames).keys()];
  else if (WHICH === 'cover') frames = [];
  else frames = WHICH.split(',').map(Number);
  for (const f of frames) {
    await page.evaluate((f) => window.setFrame(f), f);
    await page.screenshot({ path: path.join(OUT, `L02_${String(f).padStart(3, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  if (WHICH === 'cover' || WHICH === 'all') {
    await page.evaluate(() => window.setCover());
    await page.screenshot({ path: path.join(OUT, 'L02_cover.png'), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  const meas = await page.evaluate(() => window.measure());
  fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(meas, null, 1));
  await browser.close();
}

// ------------------------------------------------------------------ in-page code
function setup({ IT, LOGO_SVG, ROOT, STACK, hook }) {
  const NS = 'http://www.w3.org/2000/svg';
  const E = IT.render.easings;
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
  const EZ = {}; for (const k in E) if (Array.isArray(E[k])) EZ[k] = bez(E[k]);
  const lerp = (a, b, t) => (typeof a === 'number' ? a + (b - a) * t : Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t])));
  function kf(keys, f) {
    if (f <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [f0, v0, ez] = keys[i], [f1, v1] = keys[i + 1];
      if (f < f1) { if (ez === 'hold') return v0; return lerp(v0, v1, EZ[ez]((f - f0) / (f1 - f0))); }
    }
    return keys[keys.length - 1][1];
  }
  window.kf = kf;
  const app = document.getElementById('app');
  const div = (css, parent = app) => { const d = document.createElement('div'); d.style.cssText = css; parent.appendChild(d); return d; };
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const file = (rel) => 'file://' + ROOT + '/' + rel;

  // ---- logo geometry from the file
  const doc = new DOMParser().parseFromString(LOGO_SVG, 'image/svg+xml');
  const lp = [...doc.querySelectorAll('path')];
  const grads = [...doc.querySelectorAll('linearGradient')].map((g) => g.outerHTML).join('');
  const G = IT.stage.paths;
  const fillOf = { BIG: G.BIG_fill, MID: G.MID_fill, GOLD: G.GOLD_fill };
  const GARON_D = lp[3].getAttribute('d'), CONS_D = lp[4].getAttribute('d');
  const rectEl = doc.querySelector('rect');

  // ---- layers
  const TH = IT.theme;
  const bg = div('position:absolute;left:0;top:0;width:1080px;height:1920px;background:' + TH.bg);
  const bp = div('position:absolute;left:0;top:0;width:1080px;height:1920px;' + IT.blueprint.css.replace(/; /g, ';'));
  const vl = div('position:absolute;left:0;top:0;width:1080px;height:1920px');
  for (const x of IT.vlines.xs) div(`position:absolute;left:${x - IT.vlines.w / 2}px;top:0;width:${IT.vlines.w}px;height:1920px;background:${IT.vlines.color}`, vl);
  const ground = div('position:absolute;left:0;width:1080px;height:2px;background:' + TH.ground_line + ';transform-origin:50% 50%');
  const glow = div('position:absolute;width:520px;height:80px;background:' + TH.impact_glow);

  const SB = IT.stage.box_px;
  const cam = div(`position:absolute;left:${SB.x}px;top:${SB.y}px;width:${SB.w}px;height:${SB.h}px;transform-origin:342.4px 158px`);
  const svg = sv('svg', { width: SB.w, height: SB.h, viewBox: '0 0 425 310', overflow: 'visible', 'shape-rendering': 'geometricPrecision', style: 'position:absolute;left:0;top:0;overflow:visible' }, cam);
  const defs = sv('defs', {}, svg);
  defs.innerHTML = grads +
    `<linearGradient id="sweep" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="rgb(255,244,222)" stop-opacity="0"/><stop offset="0.5" stop-color="rgb(255,244,222)" stop-opacity="0.85"/><stop offset="1" stop-color="rgb(255,244,222)" stop-opacity="0"/></linearGradient>` +
    `<filter id="blurG" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur id="blurGs" stdDeviation="0"/></filter>` +
    `<filter id="blurC" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur id="blurCs" stdDeviation="0"/></filter>` +
    `<clipPath id="markClip" clipPathUnits="userSpaceOnUse"><path d="${G.BIG}"/><path d="${G.MID}"/><path d="${G.GOLD}"/></clipPath>`;
  const mark = sv('g', { transform: 'translate(0,9.25)' }, svg);
  const wm = sv('g', { transform: 'translate(0,-12.75)' }, svg);
  let cid = 0;
  const clipRect = (x, y, w, h) => { const id = 'c' + (cid++); const cp = sv('clipPath', { id, clipPathUnits: 'userSpaceOnUse' }, defs); const r = sv('rect', { x, y, width: w, height: h }, cp); return { id, r }; };

  // dimensions (below the mark)
  const dims = sv('g', {}, mark);
  const DS = 'stroke:' + TH.dims_stroke + ';stroke-width:1.5;fill:none;vector-effect:non-scaling-stroke';
  const GS = 'stroke:' + TH.dims_stroke + ';stroke-width:0.65;fill:none;stroke-dasharray:2.5 2.5';
  const dimEls = {};
  for (const d of IT.dimensions.elements) {
    const g = sv('g', {}, dims); dimEls[d.id] = { g, d };
    if (d.line) { const [x1, y1, x2, y2] = d.line; const l = sv('line', { x1, y1, x2, y2, style: d.dash ? GS : DS }, g); if (d.draw) dimEls[d.id].l = l; }
    for (const L of (d.lines || []).concat(d.ticks || [])) sv('line', { x1: L[0], y1: L[1], x2: L[2], y2: L[3], style: DS }, g);
    if (d.polygon) sv('polygon', { points: d.polygon.map((p) => p.join(',')).join(' '), style: DS }, g);
  }
  // build pieces
  const pieces = sv('g', {}, mark);
  const P = {};
  for (const pc of IT.build.pieces) {
    const d = G[pc.path], fill = fillOf[pc.path];
    if (pc.id.endsWith('band')) {
      const ic = clipRect(...pc.inner_clip_rect), oc = clipRect(...pc.outer_clip_rect);
      const outer = sv('g', { 'clip-path': `url(#${oc.id})` }, pieces); const mv = sv('g', {}, outer);
      sv('path', { d, fill, 'clip-path': `url(#${ic.id})` }, mv);
      P[pc.id] = { pc, mv, dx: pc.offset_at_p0[0], dy: pc.offset_at_p0[1] };
    } else if (pc.id === 'gold') {
      const g = sv('g', {}, pieces); sv('path', { d, fill }, g); P.gold = { pc, g };
    } else {
      const c = clipRect(pc.clip_x_w[0], 157, pc.clip_x_w[1], 0);
      sv('path', { d, fill, 'clip-path': `url(#${c.id})` }, pieces); P[pc.id] = { pc, r: c.r };
    }
  }
  const finalMark = sv('g', {}, mark);
  for (const k of ['BIG', 'MID', 'GOLD']) sv('path', { d: G[k], fill: fillOf[k] }, finalMark);
  const glintG = sv('g', { 'clip-path': 'url(#markClip)', style: 'mix-blend-mode:screen' }, mark);
  const glint = sv('rect', { x: 0, y: -30, width: 60, height: 240, fill: 'url(#sweep)' }, glintG);
  // wordmark glyphs
  const wmSrc = sv('g', { id: 'wmG' }, defs); sv('path', { d: GARON_D, fill: TH.wordmark_fill }, wmSrc); sv('rect', { x: rectEl.getAttribute('x'), y: rectEl.getAttribute('y'), width: rectEl.getAttribute('width'), height: rectEl.getAttribute('height'), fill: TH.wordmark_fill }, wmSrc);
  const wmC = sv('g', { id: 'wmC' }, defs); sv('path', { d: CONS_D, fill: TH.wordmark_fill }, wmC);
  function glyphs(spec, ref, filt) {
    const grp = sv('g', { filter: `url(#${filt})` }, wm); const out = [];
    for (let i = 0; i < spec.glyph_cx.length; i++) {
      const b0 = spec.clip_x_bounds[i], b1 = spec.clip_x_bounds[i + 1];
      const c = clipRect(b0, spec.clip_y[0], b1 - b0, spec.clip_y[1] - spec.clip_y[0]);
      const g = sv('g', {}, grp); sv('use', { href: '#' + ref, 'clip-path': `url(#${c.id})` }, g); out.push({ g, cx: spec.glyph_cx[i] });
    }
    return { grp, out };
  }
  const GW = glyphs(IT.wordmark.garon, 'wmG', 'blurG'), CW = glyphs(IT.wordmark.construction, 'wmC', 'blurC');
  const logoImg = document.createElement('img'); logoImg.src = window.__LOGO_URL; logoImg.style.cssText = `position:absolute;left:0;top:0;width:${SB.w}px;height:${SB.h}px`; cam.appendChild(logoImg);

  // photos
  const W = IT.window.rect;
  const grade = 'saturate(0.92) contrast(1.05)';
  const photos = {};
  for (const ph of IT.photos) {
    const layer = div('position:absolute;left:0;top:0;width:1080px;height:1920px');
    const isFull = ph.id === 'P4';
    const box = isFull ? { x: 0, y: 0, w: 1080, h: 1920 } : W;
    const inner = div(`position:absolute;left:${isFull ? 0 : W.x}px;top:${isFull ? 0 : W.y}px;width:${box.w}px;height:${box.h}px;overflow:hidden`, layer);
    const img = document.createElement('img'); img.src = file(ph.src); img.style.cssText = `position:absolute;filter:${grade};transform-origin:0 0`; inner.appendChild(img);
    photos[ph.id] = { ph, layer, inner, img, box };
  }
  const goldFill = div('position:absolute;left:0;top:0;width:1080px;height:1920px;background:linear-gradient(135deg,#d4b57a,#b8955c)');
  const edges = sv('svg', { width: 1080, height: 1920, style: 'position:absolute;left:0;top:0' }, app);
  const edgeClip = sv('clipPath', { id: 'edgeClip' }, edges); const edgeClipR = sv('rect', {}, edgeClip);
  const eg = sv('g', { 'clip-path': 'url(#edgeClip)' }, edges);
  const e1 = sv('line', { stroke: TH.wipe_edge, 'stroke-width': 2 }, eg), e2 = sv('line', { stroke: TH.wipe_edge, 'stroke-width': 2 }, eg);
  const vEdge = div('position:absolute;width:2px;background:' + TH.wipe_edge);
  const endOv = div('position:absolute;left:0;top:0;width:1080px;height:1920px;background:' + TH.end_overlay);
  const frameLine = div('position:absolute;box-sizing:border-box;border:' + TH.frame_line);
  const corner = document.createElement('img'); corner.src = file(IT.corner_logo.file);
  corner.style.cssText = `position:absolute;left:${IT.corner_logo.x}px;top:${IT.corner_logo.y}px;width:${IT.corner_logo.w}px;height:${IT.corner_logo.h}px`; app.appendChild(corner);

  // text
  const fontOf = (k) => STACK[k];
  const styleCss = (s) => `font-family:${fontOf(s.font)};font-weight:${s.weight};font-size:${s.size}px;line-height:${s.line_height || 1.2};color:${s.color};` +
    (s.letter_spacing ? `letter-spacing:${s.letter_spacing};` : '') + (s.transform ? `text-transform:${s.transform};` : '') + (s.shadow ? `text-shadow:${s.shadow};` : '');
  const SL = IT.styles_local;
  const texts = [];
  function textEl(t, s) {
    const d = div(`position:absolute;left:${t.x}px;top:${t.y}px;width:${t.w}px;text-align:${t.align};white-space:nowrap;${styleCss(s)}`);
    const ls = s.letter_spacing || '0';
    let h = t.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    if (s === SL.end_cta) h = h.replace('«ՇՈՒՏՈՎ»', `<span style="color:${SL.end_cta.accent_color}">«ՇՈՒՏՈՎ»</span>`);
    const span = `<span class="in" style="${t.align === 'center' ? `padding-left:${ls}` : t.align === 'right' ? `margin-right:-${ls}` : ''}">${h}</span>`;
    d.innerHTML = span; texts.push({ t, d, s }); return d;
  }
  const hooks = IT.hooks.map((h) => textEl(h, { ...hook, font: 'display' }));
  const labels = IT.labels.map((l) => textEl(l, SL.photo_label));
  const endEls = IT.end_card.layers.map((L) => {
    if (L.layer === 'text') return { L, d: textEl(L, SL[L.style]) };
    if (L.layer === 'logo') { const i = document.createElement('img'); i.src = file(L.file); i.style.cssText = `position:absolute;left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px`; app.appendChild(i); return { L, d: i }; }
    return { L, d: div(`position:absolute;left:${L.x}px;top:${L.y}px;width:${L.w}px;height:${L.h}px;background:${L.color};transform-origin:${L.origin === 'left' ? '0 50%' : '50% 50%'}`) };
  });

  // ---- helpers
  const vis = (el, o) => { el.style.opacity = o; el.style.visibility = o <= 0 ? 'hidden' : 'visible'; };
  function placeCrop(p, crop) {
    const [SW, SH] = p.ph.src_px; const sc = p.box.w / (crop.w * SW);
    p.img.style.width = SW * sc + 'px'; p.img.style.height = SH * sc + 'px';
    p.img.style.left = -crop.x * SW * sc + 'px'; p.img.style.top = -crop.y * SH * sc + 'px';
  }
  function band(xc, yc, hv) { const y = (x) => yc - 0.5 * (x - xc); return [[-10, y(-10) - hv], [1090, y(1090) - hv], [1090, y(1090) + hv], [-10, y(-10) + hv]]; }
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
  function clipPoly(subject, rect) { // Sutherland–Hodgman against axis-aligned rect
    let out = subject;
    const edgesR = [[(p) => p[0] >= rect.x, (a, b) => { const t = (rect.x - a[0]) / (b[0] - a[0]); return [rect.x, a[1] + t * (b[1] - a[1])]; }],
      [(p) => p[0] <= rect.x + rect.w, (a, b) => { const t = (rect.x + rect.w - a[0]) / (b[0] - a[0]); return [rect.x + rect.w, a[1] + t * (b[1] - a[1])]; }],
      [(p) => p[1] >= rect.y, (a, b) => { const t = (rect.y - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), rect.y]; }],
      [(p) => p[1] <= rect.y + rect.h, (a, b) => { const t = (rect.y + rect.h - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), rect.y + rect.h]; }]];
    for (const [inside, inter] of edgesR) {
      const inp = out; out = [];
      for (let i = 0; i < inp.length; i++) { const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
        if (inside(b)) { if (!inside(a)) out.push(inter(a, b)); out.push(b); } else if (inside(a)) out.push(inter(a, b)); }
      if (!out.length) break;
    }
    return out;
  }
  function setEdges(pts, rect, o) {
    if (o <= 0) { vis(edges, 0); return; } vis(edges, o);
    edgeClipR.setAttribute('x', rect.x); edgeClipR.setAttribute('y', rect.y); edgeClipR.setAttribute('width', rect.w); edgeClipR.setAttribute('height', rect.h);
    for (const [l, a, b] of [[e1, pts[0], pts[1]], [e2, pts[3], pts[2]]]) { l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); }
  }
  const mul = (a, s) => a.map(([x, y]) => [x * s, y * s]);

  let coverMode = false;
  window.setFrame = function (f) {
    const S = IT.stage.camera;
    // camera
    const s = kf(S.s, f) * kf(S.exit_scale_mul, f), ty = kf(S.ty, f), sh = kf(S.shake, f);
    cam.style.transform = `translate(0px, ${ty + sh}px) scale(${s})`;
    vis(cam, kf(S.exit_opacity, f));
    const sBase = kf(S.s, f);
    const gy = 858 + ty + sh + 104.8 * sBase;
    // blueprint, ground
    vis(bp, kf(IT.blueprint.opacity, f)); bp.style.transform = `translateY(${kf(IT.blueprint.translate_y, f)}px)`;
    const gsx = kf(IT.ground_line.sx, f);
    ground.style.top = gy - 1 + 'px'; ground.style.transform = `scaleX(${gsx})`; vis(ground, gsx <= 0 ? 0 : kf(IT.ground_line.opacity, f));
    const gcx = 542.4 + 185.6 * sBase; glow.style.left = gcx - 260 + 'px'; glow.style.top = gy - 40 + 'px'; vis(glow, kf(IT.ground_line.impact_glow.opacity, f));
    // dims
    dims.setAttribute('opacity', kf(IT.dimensions.group_opacity, f));
    for (const { g, d, l } of Object.values(dimEls)) {
      if (d.opacity) g.setAttribute('opacity', kf(d.opacity, f));
      if (l) { const k = kf(d.draw, f), [x1, y1, x2, y2] = d.line; l.setAttribute('x2', x1 + (x2 - x1) * k); l.setAttribute('y2', y1 + (y2 - y1) * k); l.setAttribute('visibility', k > 0 ? 'visible' : 'hidden'); }
    }
    // pieces
    const showPieces = f < 118 && !coverMode;
    pieces.setAttribute('visibility', showPieces ? 'visible' : 'hidden');
    finalMark.setAttribute('visibility', showPieces ? 'hidden' : 'visible');
    for (const k of ['big_stem', 'mid_stem', 'mid_pier']) { const h = kf(P[k].pc.h, f); P[k].r.setAttribute('y', 157 - h); P[k].r.setAttribute('height', h); }
    for (const k of ['big_band', 'mid_band']) { const p = kf(P[k].pc.p, f); P[k].mv.setAttribute('transform', `translate(${P[k].dx * (1 - p)},${P[k].dy * (1 - p)})`); }
    { const pc = P.gold.pc; const dy = kf(pc.dy, f), sy = kf(pc.squash_sy, f), sx = 1 + 0.5 * (1 - sy);
      P.gold.g.setAttribute('transform', `translate(0,${dy}) translate(330,155) scale(${sx},${sy}) translate(-330,-155)`); P.gold.g.setAttribute('opacity', kf(pc.opacity, f)); }
    // glint
    const gOn = f >= 124 && f <= 150 && !coverMode; glintG.setAttribute('visibility', gOn ? 'visible' : 'hidden');
    glint.setAttribute('transform', `translate(${kf(IT.glint.gx, f)},0) skewX(-22)`);
    // wordmark
    for (const [spec, Wd, id] of [[IT.wordmark.garon, GW, 'blurGs'], [IT.wordmark.construction, CW, 'blurCs']]) {
      const p = kf(spec.p, f);
      for (const g of Wd.out) g.g.setAttribute('transform', `translate(${(g.cx - 210.5) * spec.k * (1 - p)},0)`);
      Wd.grp.setAttribute('opacity', kf(spec.opacity, f));
      const b = kf(spec.blur_std_units, f); document.getElementById(id).setAttribute('stdDeviation', b);
      Wd.grp.setAttribute('filter', b > 0.001 ? `url(#${id === 'blurGs' ? 'blurG' : 'blurC'})` : 'none');
    }
    const useImg = f >= 167 && !coverMode;
    svg.style.visibility = useImg ? 'hidden' : 'visible'; logoImg.style.visibility = useImg ? 'visible' : 'hidden';
    // vlines, window frame
    vis(vl, kf(IT.vlines.opacity, f));
    // photos
    const [p1, p2, p3, p4] = ['P1', 'P2', 'P3', 'P4'].map((k) => photos[k]);
    let edgeSet = false; vis(vEdge, 0); vis(goldFill, 0);
    for (const p of [p1, p2, p3, p4]) {
      const [a, b] = p.ph.life; const on = f >= a && f <= b && !coverMode; vis(p.layer, on ? 1 : 0); if (!on) continue;
      const t = (f - a) / (b - a); placeCrop(p, lerp(p.ph.crop_from, p.ph.crop_to, t)); p.img.style.transform = '';
    }
    if (f >= 180 && f <= 226) { // P1 roof band
      const hv = kf(p1.ph.reveal.hv, f); const pts = band(460.8, 846, hv);
      p1.layer.style.clipPath = poly(clipPoly(pts, W));
      if (f >= 210) p1.img.style.transform = `translateX(${-0.12 * (1010 - kf(p2.ph.reveal.xe, f))}px)`;
      const eo = kf(p1.ph.reveal.edges.opacity, f); if (eo > 0) { setEdges(pts, W, eo); edgeSet = true; }
    }
    if (f >= 210 && f <= 256) { // P2 sliding frame
      const xe = kf(p2.ph.reveal.xe, f);
      p2.layer.style.clipPath = poly([[xe, W.y], [W.x + W.w, W.y], [W.x + W.w, W.y + W.h], [xe, W.y + W.h]]);
      p2.img.style.transform = `translateX(${0.25 * (xe - 70)}px)`;
      const eo = kf(p2.ph.reveal.edges.opacity, f);
      if (eo > 0) { vEdge.style.left = xe - 1 + 'px'; vEdge.style.top = W.y + 'px'; vEdge.style.height = W.h + 'px'; vis(vEdge, eo); }
    }
    if (f >= 236 && f <= 286) { // P3 gold piece
      const r = p3.ph.reveal; const g = f <= 240 ? 1.6 : 1.6 * Math.pow(32, EZ.inOutCubic(Math.min(1, (f - 240) / 12)));
      const pts = r.shape_units.map(([x, y]) => [r.anchor_px[0] + g * x, r.anchor_px[1] + g * y]);
      const cp = clipPoly(pts, W);
      p3.layer.style.clipPath = cp.length ? poly(cp) : 'polygon(0 0,0 0,0 0)';
      const go = kf(r.gold_fill.opacity, f);
      if (go > 0) { goldFill.style.clipPath = p3.layer.style.clipPath; vis(goldFill, go); }
    }
    if (f >= 270) { // P4 roof band -> full bleed
      const r = p4.ph.reveal; const R = kf(r.R, f); const pts = band(540, 1016.5, kf(r.hv, f));
      p4.layer.style.clipPath = poly(clipPoly(pts, R));
      const eo = kf(r.edges.opacity, f); if (eo > 0) { setEdges(pts, R, eo); edgeSet = true; }
      p4.img.style.filter = `${grade} blur(${kf(p4.ph.end_blur_px, f)}px)`;
      frameLine.style.left = R.x + 'px'; frameLine.style.top = R.y + 'px'; frameLine.style.width = R.w + 'px'; frameLine.style.height = R.h + 'px';
    } else { frameLine.style.left = W.x + 'px'; frameLine.style.top = W.y + 'px'; frameLine.style.width = W.w + 'px'; frameLine.style.height = W.h + 'px'; }
    if (!edgeSet) vis(edges, 0);
    vis(endOv, kf(p4.ph.end_overlay.opacity, f) * (f >= 270 ? 1 : 0));
    vis(frameLine, coverMode ? 0 : kf(IT.window.frame_line.opacity, f));
    vis(corner, coverMode ? 0 : kf(IT.corner_logo.opacity, f));
    // text
    IT.hooks.forEach((h, i) => { vis(hooks[i], coverMode ? 0 : kf(h.opacity, f)); hooks[i].style.transform = `translateY(${kf(h.translate_y, f)}px)`; });
    IT.labels.forEach((l, i) => vis(labels[i], coverMode ? 0 : kf(l.opacity, f)));
    for (const { L, d } of endEls) {
      vis(d, coverMode ? 0 : (L.opacity ? kf(L.opacity, f) : (f >= L.scale_x[0][0] ? 1 : 0)));
      const tf = []; if (L.translate_y) tf.push(`translateY(${kf(L.translate_y, f)}px)`); if (L.scale_x) tf.push(`scaleX(${kf(L.scale_x, f)})`); d.style.transform = tf.join(' ');
    }
  };
  window.setCover = function () {
    coverMode = false; window.setFrame(167); coverMode = true; window.setFrame(167);
    vis(bp, 0.55); bp.style.transform = 'none';
    dims.setAttribute('opacity', 1);
    for (const { g, d, l } of Object.values(dimEls)) { const guide = /^guide|^plumb/.test(d.id); g.setAttribute('opacity', guide ? 0 : 1); if (l) { l.setAttribute('x2', d.line[2]); l.setAttribute('y2', d.line[3]); l.setAttribute('visibility', 'visible'); } }
    ground.style.top = 962.8 - 1 + 'px'; ground.style.transform = 'scaleX(0.409)'; vis(ground, 0.9); vis(glow, 0);
    svg.style.visibility = 'visible'; logoImg.style.visibility = 'hidden';
  };
  window.measure = function () {
    window.setFrame(380);
    return texts.map(({ t, d }) => { const r = d.querySelector('.in').getBoundingClientRect(); return { text: t.text, x0: Math.round(r.left), x1: Math.round(r.right), y0: Math.round(r.top), y1: Math.round(r.bottom), font: getComputedStyle(d).fontFamily }; });
  };
}

main().catch((e) => { console.error(e); process.exit(1); });
