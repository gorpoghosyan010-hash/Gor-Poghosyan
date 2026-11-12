// R3 «Գծագիր → Իրականություն» renovation reel — art-director renderer (frame-stepped HTML/SVG, light theme). v1.
// f0–179: the L02 v4 logo intro, IDENTICAL frames — delegated to marketing/instagram/tools/render_l02_frames.js
//   and renamed L02_%03d.png → R3_%03d.png (same mechanism as R2 v2).
// f180–779: this page. The finished L02 lockup pushes in/fades while its gold piece grows into the 3:4 window and opens on
//   a blueprint sheet; a one-point-perspective room is drawn in thin lines, then renovated step by step (walls, floor,
//   light, furniture), a gold slider compares «Գծագիր | Արդյունք», end card = R2 v2.
// EVERYTHING in the room is drawn procedurally in SVG here — no photos, no stock, no AI images.
// Reads items.R3 of 04-render-spec.json next to this file. If code and spec disagree, the spec wins.
// usage: NODE_PATH=$(npm root -g) node 04-R3-renderer.js <repo_root> <out_dir> [all|cover|0,30,105,...]
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
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const tmp = path.join(OUT, '_r3.html');
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
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const file = (rel) => 'file://' + ROOT + '/' + rel;
  const vis = (el, o) => { el.style.opacity = o; el.style.visibility = o <= 0.0005 ? 'hidden' : 'visible'; };
  const svis = (el, o) => { el.setAttribute('opacity', o.toFixed(4)); el.setAttribute('visibility', o <= 0.0005 ? 'hidden' : 'visible'); };
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
  const NONE = 'polygon(0 0,0 0,0 0)';
  const W = IT.window.rect;
  const IN = IT.intro;
  let seed = 1; const srand = (s) => { seed = s >>> 0; }; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  // ---- background (paper + vlines), finished lockup (exit 180–198) — = R2 v2
  div(`left:0;top:0;width:1080px;height:1920px;background:${TH.bg}`);
  const bpCss = IT.blueprint.css.replace(/; /g, ';');
  const bp = div('left:0;top:0;width:1080px;height:1920px;' + bpCss); // cover only
  const vl = div('left:0;top:0;width:1080px;height:1920px');
  for (const x of IT.vlines.xs) div(`left:${x - IT.vlines.w / 2}px;top:0;width:${IT.vlines.w}px;height:1920px;background:${IT.vlines.color}`, vl);
  const SB = IN.stage_box_px, TO = IN.transform_origin_px;
  const cam = div(`left:${SB.x}px;top:${SB.y}px;width:${SB.w}px;height:${SB.h}px;transform-origin:${TO[0]}px ${TO[1]}px`);
  const logoImg = document.createElement('img'); logoImg.src = file(IN.logo_file); logoImg.style.cssText = `position:absolute;left:0;top:0;width:${SB.w}px;height:${SB.h}px`; cam.appendChild(logoImg);

  // ================================================================ ROOM
  const RM = IT.room, PAL = RM.palette, LW = RM.line_widths;
  const F = RM.f, VP = RM.vp, CX = RM.cam.x, CY = RM.cam.y, X0 = RM.x[0], X1 = RM.x[1], HH = RM.h, ZB = RM.z_back, ZN = RM.z_near;
  const P = (x, y, z) => [VP[0] + (F * (x - CX)) / z, VP[1] - (F * (y - CY)) / z];
  const pstr = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ');
  const closed = (pts) => pstr(pts) + ' Z';
  const ptsAttr = (pts) => pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  const PAD = 40; // svg overdraw so camera push/drift never exposes an edge
  const VB = `${-PAD} ${-PAD} ${W.w + 2 * PAD} ${W.h + 2 * PAD}`;
  const svgCss = `position:absolute;left:${-PAD}px;top:${-PAD}px;width:${W.w + 2 * PAD}px;height:${W.h + 2 * PAD}px;overflow:hidden`;

  const win = div(`left:${W.x}px;top:${W.y}px;width:${W.w}px;height:${W.h}px;overflow:hidden`);
  const resWrap = div(`left:0;top:0;width:${W.w}px;height:${W.h}px;transform-origin:${VP[0]}px ${VP[1]}px`, win);
  const planClip = div(`left:0;top:0;width:${W.w}px;height:${W.h}px`, win);
  const planWrap = div(`left:0;top:0;width:${W.w}px;height:${W.h}px;transform-origin:${VP[0]}px ${VP[1]}px`, planClip);
  const RS = sv('svg', { viewBox: VB, width: W.w + 2 * PAD, height: W.h + 2 * PAD, style: svgCss }); resWrap.appendChild(RS);
  const PS = sv('svg', { viewBox: VB, width: W.w + 2 * PAD, height: W.h + 2 * PAD, style: svgCss }); planWrap.appendChild(PS);

  // ---- noise tiles: plaster (soft value noise) for the walls
  function noiseTile(sd, cell, amp) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const s = document.createElement('canvas'); s.width = s.height = 256 / cell; const sg = s.getContext('2d'); const id = sg.createImageData(s.width, s.height);
    srand(sd); for (let i = 0; i < s.width * s.height; i++) { const v = Math.round(128 + (rnd() - 0.5) * amp); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    sg.putImageData(id, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(s, 0, 0, 256, 256);
    const fine = g.getImageData(0, 0, 256, 256); for (let i = 0; i < 256 * 256; i++) { const d = (rnd() - 0.5) * 18; for (let k = 0; k < 3; k++) fine.data[i * 4 + k] = Math.max(0, Math.min(255, fine.data[i * 4 + k] + d)); }
    g.putImageData(fine, 0, 0); return c.toDataURL();
  }
  const plasterURL = noiseTile(11, 8, 120);

  function defs(svg, withRoom) {
    const d = sv('defs', {}, svg);
    const gm = sv('pattern', { id: 'gridMin', patternUnits: 'userSpaceOnUse', width: 36, height: 36, x: IT.blueprint.window_grid.offset_px[0], y: IT.blueprint.window_grid.offset_px[1] }, d);
    sv('path', { d: 'M 0 0.5 H 36 M 0.5 0 V 36', stroke: IT.blueprint.window_grid.minor, 'stroke-width': 1, fill: 'none' }, gm);
    const gM = sv('pattern', { id: 'gridMaj', patternUnits: 'userSpaceOnUse', width: 180, height: 180, x: IT.blueprint.window_grid.offset_px[0], y: IT.blueprint.window_grid.offset_px[1] }, d);
    sv('path', { d: 'M 0 0.5 H 180 M 0.5 0 V 180', stroke: IT.blueprint.window_grid.major, 'stroke-width': 1, fill: 'none' }, gM);
    if (!withRoom) return d;
    const pl = sv('pattern', { id: 'plaster', patternUnits: 'userSpaceOnUse', width: 256, height: 256 }, d);
    sv('image', { href: plasterURL, width: 256, height: 256 }, pl);
    const blur = (id, s) => { const fl = sv('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, d); sv('feGaussianBlur', { stdDeviation: s }, fl); };
    blur('b3', 3); blur('b6', 6); blur('b10', 10); blur('b18', 18); blur('b30', 30);
    const lg = (id, attrs, stops) => { const g = sv('linearGradient', Object.assign({ id }, attrs), d); for (const [o, c, op] of stops) sv('stop', { offset: o, 'stop-color': c, 'stop-opacity': op === undefined ? 1 : op }, g); return g; };
    const rg = (id, attrs, stops) => { const g = sv('radialGradient', Object.assign({ id }, attrs), d); for (const [o, c, op] of stops) sv('stop', { offset: o, 'stop-color': c, 'stop-opacity': op === undefined ? 1 : op }, g); return g; };
    const dm = sv('filter', { id: 'dimF', x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB' }, d); const dct = sv('feComponentTransfer', {}, dm);
    window._dimFuncs = ['R', 'G', 'B'].map((c) => sv('feFunc' + c, { type: 'linear', slope: 1 }, dct));
    lg('sky', { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, PAL.sky_on[0]], [1, PAL.sky_on[1]]]);
    lg('doorIn', { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, PAL.door_inside[1]], [1, PAL.door_inside[0]]]);
    lg('cove', { gradientUnits: 'userSpaceOnUse', x1: 0, y1: P(0, HH, ZB)[1], x2: 0, y2: P(0, 0.9, ZB)[1] }, [[0, '#ffd99a', 0.55], [0.35, '#ffe2b0', 0.22], [1, '#ffe9c4', 0]]);
    rg('warm', { gradientUnits: 'userSpaceOnUse', cx: VP[0], cy: 330, r: 900 }, [[0, '#ffdcae', 0.5], [0.6, '#ffe7c6', 0.18], [1, '#ffffff', 0]]);
    rg('lampGlow', {}, [[0, '#ffe2ae', 0.95], [0.35, '#ffd28f', 0.45], [1, '#ffd28f', 0]]);
    lg('artGold', { x1: 0, y1: 0, x2: 1, y2: 1 }, [[0, '#d4b57a'], [1, '#b8955c']]);
    lg('pot', { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, '#2f2e2d'], [1, '#232322']]);
    return d;
  }
  const rDefs = defs(RS, true); defs(PS, false);
  for (const svg of [RS, PS]) {
    sv('rect', { x: -PAD, y: -PAD, width: W.w + 2 * PAD, height: W.h + 2 * PAD, fill: TH.bg }, svg);
    sv('rect', { x: -PAD, y: -PAD, width: W.w + 2 * PAD, height: W.h + 2 * PAD, fill: 'url(#gridMin)' }, svg);
    sv('rect', { x: -PAD, y: -PAD, width: W.w + 2 * PAD, height: W.h + 2 * PAD, fill: 'url(#gridMaj)', opacity: 0.85 }, svg);
  }

  // ---- geometry helpers
  const BL = P(X0, 0, ZB), BR = P(X1, 0, ZB), TL = P(X0, HH, ZB), TR = P(X1, HH, ZB);
  const nBL = P(X0, 0, ZN), nBR = P(X1, 0, ZN), nTL = P(X0, HH, ZN), nTR = P(X1, HH, ZN);
  const OP = RM.openings, WO = OP.window_left_wall, DO = OP.door_right_wall;
  const winQuad = (z0, z1, y0, y1) => [P(X0, y0, z0), P(X0, y0, z1), P(X0, y1, z1), P(X0, y1, z0)];
  const WQ = winQuad(WO.z[0], WO.z[1], WO.y[0], WO.y[1]);
  const zm = (WO.z[0] + WO.z[1]) / 2;
  const DQ = [P(X1, DO.y[0], DO.z[0]), P(X1, DO.y[0], DO.z[1]), P(X1, DO.y[1], DO.z[1]), P(X1, DO.y[1], DO.z[0])];

  // box → visible faces [{pts, kind}] in paint order (sides, top, front)
  function boxFaces(x0, x1, y0, y1, z0, z1) {
    const out = [];
    if (CX < x0) out.push({ kind: 'side', pts: [P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0)] });
    if (CX > x1) out.push({ kind: 'side', pts: [P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)] });
    if (CY > y1) out.push({ kind: 'top', pts: [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)] });
    out.push({ kind: 'front', pts: [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)] });
    return out;
  }
  const floorQuad = (x0, x1, z0, z1, y = 0) => [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)];
  const ellipseFloor = (cx, cz, r, y = 0, n = 40) => [...Array(n).keys()].map((i) => { const a = (i / n) * Math.PI * 2; return P(cx + r * Math.cos(a), y, cz + r * Math.sin(a)); });

  // ---- furniture definitions (geometry in metres; documented in items.R3.room.furniture)
  const C = PAL;
  const box = (b, c) => ({ type: 'box', b, c });
  const FURN = {
    rug: [{ type: 'rug', x: [-1.75, 1.75], z: [3.25, 5.45] }],
    sofa: [
      { type: 'shadow', pts: floorQuad(-1.45, 1.45, 4.68, 5.6), o: 0.22 },
      box([-1.28, 1.28, 0, 0.1, 4.82, 5.45], { front: C.charcoal, top: C.charcoal_top, side: C.charcoal }),
      box([-1.35, 1.35, 0.1, 0.84, 5.3, 5.55], { front: C.stone, top: C.stone_top, side: C.stone_side }),
      box([-1.35, -1.12, 0.1, 0.6, 4.75, 5.5], { front: C.stone, top: C.stone_top, side: C.stone_side }),
      box([1.12, 1.35, 0.1, 0.6, 4.75, 5.5], { front: C.stone, top: C.stone_top, side: C.stone_side }),
      box([-1.12, 1.12, 0.1, 0.42, 4.75, 5.5], { front: '#c4bbac', top: C.stone_top, side: C.stone_side }),
      box([-1.1, -0.01, 0.52, 0.8, 5.13, 5.3], { front: '#d3cabd', top: '#ddd6ca', side: '#c3b9aa' }),
      box([0.01, 1.1, 0.52, 0.8, 5.13, 5.3], { front: '#d3cabd', top: '#ddd6ca', side: '#c3b9aa' }),
      box([-1.11, -0.01, 0.42, 0.52, 4.78, 5.3], { front: '#cfc6b8', top: '#ddd5c9', side: '#c0b6a7' }),
      box([0.01, 1.11, 0.42, 0.52, 4.78, 5.3], { front: '#cfc6b8', top: '#ddd5c9', side: '#c0b6a7' }),
      box([-0.98, -0.6, 0.52, 0.78, 5.02, 5.12], { front: C.brass, top: C.brass_light, side: '#a5844f' }),
      box([0.62, 0.98, 0.52, 0.74, 5.02, 5.12], { front: '#3b3a38', top: '#4a4845', side: '#33322f' })],
    table: [
      { type: 'shadow', pts: floorQuad(-0.68, 0.68, 3.68, 4.38), o: 0.24 },
      box([-0.36, 0.36, 0, 0.31, 3.92, 4.14], { front: '#252524', top: '#2c2b2a', side: '#1f1f1e' }),
      box([-0.6, 0.6, 0.31, 0.38, 3.75, 4.3], { front: C.charcoal, top: '#45433f', side: C.charcoal }),
      box([-0.4, -0.12, 0.38, 0.42, 3.92, 4.12], { front: '#e7e0d3', top: '#efe9de', side: '#ddd5c7' }),
      box([-0.37, -0.15, 0.42, 0.445, 3.94, 4.1], { front: '#b8955c', top: '#c9a96a', side: '#a5844f' }),
      { type: 'bowl', cx: 0.25, cz: 4.02, y: 0.38, r: 0.13 }],
    tree: [
      { type: 'shadow', pts: floorQuad(-2.62, -2.02, 4.9, 5.48), o: 0.22 },
      box([-2.55, -2.1, 0, 0.5, 4.95, 5.4], { front: '#2c2b2a', top: '#3a3936', side: '#242423' }),
      { type: 'tree', base: [-2.325, 0.5, 5.17], canopy: [-2.2, 1.78, 5.12], r: [0.6, 0.48, 0.32], n: 110, seed: 3 }],
    art: [{ type: 'art', x: [-0.7, 0.7], y: [1.3, 2.15], z: ZB - 0.004 }],
    lamp: [{ type: 'shadow', pts: floorQuad(1.66, 2.04, 4.86, 5.14), o: 0.2 }, { type: 'lamp', x: 1.85, z: 5.0 }]
  };

  // ---- RESULT: walls
  const ST = IT.stages;
  const R = sv('g', {}, RS);
  function wipeMask(id, ax0, ay0, ax1, ay1) {
    const g = sv('linearGradient', { id: id + 'G', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1, y2: 0 }, rDefs);
    sv('stop', { offset: 0, 'stop-color': '#fff' }, g); sv('stop', { offset: 1, 'stop-color': '#000' }, g);
    const m = sv('mask', { id, maskUnits: 'userSpaceOnUse', x: -PAD - 2000, y: -PAD - 2000, width: W.w + 4000, height: W.h + 4000 }, rDefs);
    sv('rect', { x: -PAD - 2000, y: -PAD - 2000, width: W.w + 4000, height: W.h + 4000, fill: `url(#${id}G)` }, m);
    const L = Math.hypot(ax1 - ax0, ay1 - ay0), ux = (ax1 - ax0) / L, uy = (ay1 - ay0) / L, s = ST.walls.soft_edge_px;
    return (t) => { const c = -s / 2 + (L + s) * t; g.setAttribute('x1', ax0 + ux * (c - s / 2)); g.setAttribute('y1', ay0 + uy * (c - s / 2)); g.setAttribute('x2', ax0 + ux * (c + s / 2)); g.setAttribute('y2', ay0 + uy * (c + s / 2)); };
  }
  const wall = (pts, fill, maskId) => { const g0 = sv('g', { mask: `url(#${maskId})` }, R); const g = sv('g', { filter: 'url(#dimF)' }, g0); sv('polygon', { points: ptsAttr(pts), fill }, g); sv('polygon', { points: ptsAttr(pts), fill: 'url(#plaster)', opacity: 0.06, style: 'mix-blend-mode:multiply' }, g); return g; };
  const wipes = {
    ceiling: wipeMask('mCeil', VP[0], TL[1], VP[0], -PAD - 10),
    left: wipeMask('mLeft', BL[0], VP[1], -PAD - 10, VP[1]),
    right: wipeMask('mRight', BR[0], VP[1], W.w + PAD + 10, VP[1]),
    back: wipeMask('mBack', BL[0] - 4, VP[1], BR[0] + 4, VP[1])
  };
  const gCeil = wall([TL, TR, nTR, nTL], PAL.ceiling, 'mCeil');
  // LED channels (off) belong to the ceiling finish
  for (const x of RM.led.channels_x) sv('path', { d: pstr([P(x, HH, ZN), P(x, HH, ZB)]), stroke: PAL.led_off, 'stroke-width': 3, fill: 'none' }, gCeil);
  const gLeft = wall([TL, BL, nBL, nTL], PAL.wall_left, 'mLeft');
  // window: glass (off), sky (on), frame
  sv('polygon', { points: ptsAttr(WQ), fill: PAL.glass_off }, gLeft);
  const skyEl = sv('polygon', { points: ptsAttr(WQ), fill: 'url(#sky)' }, gLeft);
  const winFrame = (g, col, w) => {
    sv('polygon', { points: ptsAttr(WQ), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linejoin': 'miter' }, g);
    sv('path', { d: pstr([P(X0, WO.y[0], zm), P(X0, WO.y[1], zm)]), stroke: col, 'stroke-width': w * 0.75, fill: 'none' }, g);
  };
  winFrame(gLeft, PAL.charcoal, 4);
  sv('path', { d: pstr([P(X0 + 0.05, WO.y[0] - 0.02, WO.z[0] - 0.03), P(X0 + 0.05, WO.y[0] - 0.02, WO.z[1] + 0.03)]), stroke: '#d6cec1', 'stroke-width': 3, fill: 'none' }, gLeft);
  const gRight = wall([TR, BR, nBR, nTR], PAL.wall_right, 'mRight');
  sv('polygon', { points: ptsAttr(DQ), fill: 'url(#doorIn)' }, gRight);
  sv('path', { d: pstr([DQ[0], DQ[3], DQ[2], DQ[1]]), stroke: PAL.charcoal, 'stroke-width': 3, fill: 'none' }, gRight);
  const gBack = wall([TL, TR, BR, BL], PAL.wall_back, 'mBack');
  // skirting line on the back wall + side walls (thin shadow gap)
  sv('path', { d: pstr([P(X0, 0.06, ZB), P(X1, 0.06, ZB)]), stroke: 'rgba(60,50,40,0.18)', 'stroke-width': 1.2, fill: 'none' }, gBack);

  // ---- RESULT: floor boards
  const FL = RM.floor, boards = [];
  const gFloor = sv('g', { filter: 'url(#dimF)' }, R);
  srand(FL.seed);
  for (let x0 = X0; x0 < X1 - 1e-6; x0 += FL.strip_w) {
    const x1 = Math.min(X1, x0 + FL.strip_w);
    let z = ZB + rnd() * FL.board_len[1];
    while (z > ZN) {
      const len = FL.board_len[0] + rnd() * (FL.board_len[1] - FL.board_len[0]);
      const zf = Math.min(z, ZB), zn = Math.max(z - len, ZN);
      if (zf > zn + 0.02) {
        const g = sv('g', {}, gFloor);
        const col = PAL.oak[Math.floor(rnd() * PAL.oak.length)];
        sv('polygon', { points: ptsAttr(floorQuad(x0, x1, zn, zf)), fill: col, stroke: PAL.oak_seam, 'stroke-width': 0.9, 'stroke-linejoin': 'round' }, g);
        for (let k = 0; k < FL.grain_lines_per_board; k++) {
          const gx = x0 + FL.strip_w * (0.2 + 0.6 * rnd()), a = zn + (zf - zn) * rnd() * 0.3, b = zf - (zf - zn) * rnd() * 0.3;
          sv('path', { d: pstr([P(gx, 0, a), P(gx + 0.01 * (rnd() - 0.5), 0, b)]), stroke: PAL.oak_grain, 'stroke-width': 0.8, fill: 'none' }, g);
        }
        const t0 = 332 + 44 * (ZB - zf) / (ZB - ZN) + 6 * rnd();
        boards.push({ g, t0 }); svis(g, 0);
      }
      z -= len;
    }
  }
  // floor light patch (sun through the window), split by the mullion
  const SD = WO.sun_dir;
  const sunP = (y, z) => { const t = y / -SD[1]; return P(X0 + SD[0] * t, 0, z + SD[2] * t); };
  const patchG = sv('g', { filter: 'url(#b6)', style: 'mix-blend-mode:screen' }, R);
  for (const [a, b] of [[WO.z[0] + 0.03, zm - 0.04], [zm + 0.04, WO.z[1] - 0.03]])
    sv('polygon', { points: ptsAttr([sunP(WO.y[0] + 0.03, a), sunP(WO.y[0] + 0.03, b), sunP(WO.y[1] - 0.03, b), sunP(WO.y[1] - 0.03, a)]), fill: PAL.light_warm }, patchG);
  // light on the left wall around the window + window bloom
  const bloom = sv('polygon', { points: ptsAttr(WQ), fill: '#fff4dc', filter: 'url(#b18)', style: 'mix-blend-mode:screen' }, R);

  // ---- RESULT: line overlay (drawn-in during Նախագիծ) — sits below furniture
  const PLN = IT.plan_lines;
  const LG = Object.fromEntries(PLN.groups.map((g) => [g.id, g]));
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  function buildLines(svg, animated) {
    const root = sv('g', {}, svg), items = [], dimEls = [];
    const sw = (w) => (w === 'main' ? { stroke: PAL.line_main, 'stroke-width': LW.main } : w === 'sub' ? { stroke: PAL.line_sub, 'stroke-width': LW.sub } : { stroke: PAL.dims, 'stroke-width': LW.dims });
    const line = (gid, pts, extra = {}) => {
      const G = LG[gid];
      const a = Object.assign({ d: pstr(pts), fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sw(G.w), extra);
      if (animated) Object.assign(a, { pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
      delete a._lag; const el = sv('path', a, root); items.push({ el, draw: G.draw, lag: extra._lag || 0 }); if (gid === 'dims') dimEls.push(el); return el;
    };
    line('back_wall', [TL, TR, BR, BL, TL]);
    [[TL, nTL], [TR, nTR], [BL, nBL], [BR, nBR]].forEach((s, i) => line('corners', s, { _lag: i * 2 }));
    line('window', [...WQ, WQ[0]]); line('window', [P(X0, WO.y[0], zm), P(X0, WO.y[1], zm)], { _lag: 6 });
    line('door', [DQ[0], DQ[3], DQ[2], DQ[1]]);
    let i = 0; for (let x = -2.4; x <= 2.41; x += 0.8) line('floor_lines', [P(x, 0, ZB), P(x, 0, ZN)], { _lag: (i++ % 7) * 2 });
    for (const z of [4.4, 3.2, 2.0]) line('floor_lines', [P(X0, 0, z), P(X1, 0, z)], { _lag: 8 });
    for (const x of RM.led.channels_x) for (const dx of [-0.05, 0.05]) line('led', [P(x + dx, HH, ZN), P(x + dx, HH, ZB)]);
    line('led', [P(X0, RM.led.cove_y, ZB), P(X1, RM.led.cove_y, ZB)], { _lag: 6 });
    // dimensions
    const dy = TL[1] - 30, dx = BL[0] - 30, t = 7;
    line('dims', [[TL[0], TL[1] - 8], [TL[0], dy - 10]]); line('dims', [[TR[0], TR[1] - 8], [TR[0], dy - 10]]);
    line('dims', [[TL[0] - 12, dy], [TR[0] + 12, dy]]);
    line('dims', [[TL[0] - t, dy + t], [TL[0] + t, dy - t]], { _lag: 10 }); line('dims', [[TR[0] - t, dy + t], [TR[0] + t, dy - t]], { _lag: 10 });
    line('dims', [[TL[0] - 8, TL[1]], [dx - 10, TL[1]]]); line('dims', [[BL[0] - 8, BL[1]], [dx - 10, BL[1]]]);
    line('dims', [[dx, TL[1] - 12], [dx, BL[1] + 12]]);
    line('dims', [[dx - t, TL[1] + t], [dx + t, TL[1] - t]], { _lag: 10 }); line('dims', [[dx - t, BL[1] + t], [dx + t, BL[1] - t]], { _lag: 10 });
    const tStyle = `font-family:${STACK.text};font-weight:500;font-size:15px;letter-spacing:0.12em;fill:${PAL.dims}`;
    const tw = sv('text', { x: (TL[0] + TR[0]) / 2, y: dy - 10, 'text-anchor': 'middle', style: tStyle }, root); tw.textContent = fmt(Math.round((X1 - X0) * 1000));
    const th = sv('text', { x: dx - 10, y: (TL[1] + BL[1]) / 2, 'text-anchor': 'middle', transform: `rotate(-90 ${dx - 10} ${(TL[1] + BL[1]) / 2})`, style: tStyle }, root); th.textContent = fmt(Math.round(HH * 1000));
    const dimTexts = [tw, th];
    // furniture outlines (dashed design intent)
    const fo = sv('g', { fill: 'none', stroke: PAL.line_furniture, 'stroke-width': LW.furniture_dashed, 'stroke-dasharray': LW.dash, 'stroke-linejoin': 'round' }, root);
    const out = (pts) => sv('polygon', { points: ptsAttr(pts) }, fo);
    for (const k of ['rug', 'sofa', 'table', 'tree', 'art', 'lamp']) for (const it of FURN[k]) {
      if (it.type === 'box') for (const fc of boxFaces(...it.b)) out(fc.pts);
      else if (it.type === 'rug') out(floorQuad(it.x[0], it.x[1], it.z[0], it.z[1]));
      else if (it.type === 'art') out([P(it.x[0], it.y[0], it.z), P(it.x[1], it.y[0], it.z), P(it.x[1], it.y[1], it.z), P(it.x[0], it.y[1], it.z)]);
      else if (it.type === 'tree') { const c = P(...it.canopy), s = F / it.canopy[2]; sv('ellipse', { cx: c[0], cy: c[1], rx: it.r[0] * s, ry: it.r[1] * s }, fo); }
      else if (it.type === 'lamp') { sv('path', { d: pstr([P(it.x, 0, it.z), P(it.x, 1.32, it.z)]) }, fo); out(lampShade(it.x, it.z)); }
    }
    return { root, items, dimTexts, dimEls, fo };
  }
  function lampShade(x, z) { return [P(x - 0.2, 1.3, z), P(x + 0.2, 1.3, z), P(x + 0.155, 1.6, z), P(x - 0.155, 1.6, z)]; }
  const resLines = buildLines(R, true);
  const planLines = buildLines(PS, false);

  // ---- RESULT: furniture
  const gFurn = {};
  const FD = Object.fromEntries(RM.furniture.map((x) => [x.id, x]));
  const order = ['rug', 'art', 'sofa', 'tree', 'lamp', 'table'];
  for (const k of order) {
    const g = sv('g', {}, R); gFurn[k] = g; svis(g, 0);
    for (const it of FURN[k]) {
      if (it.type === 'shadow') sv('polygon', { points: ptsAttr(it.pts), fill: '#3a2c1e', opacity: it.o, filter: 'url(#b6)' }, g);
      else if (it.type === 'box') for (const fc of boxFaces(...it.b)) sv('polygon', { points: ptsAttr(fc.pts), fill: it.c[fc.kind], stroke: it.c[fc.kind], 'stroke-width': 0.6, 'stroke-linejoin': 'round' }, g);
      else if (it.type === 'rug') {
        sv('polygon', { points: ptsAttr(floorQuad(it.x[0], it.x[1], it.z[0], it.z[1], 0.004)), fill: PAL.rug }, g);
        sv('polygon', { points: ptsAttr(floorQuad(it.x[0] + 0.12, it.x[1] - 0.12, it.z[0] + 0.12, it.z[1] - 0.12, 0.004)), fill: 'none', stroke: PAL.rug_border, 'stroke-width': 1.6 }, g);
        sv('polygon', { points: ptsAttr(floorQuad(it.x[0], it.x[1], it.z[0], it.z[1], 0.004)), fill: 'url(#plaster)', opacity: 0.18, style: 'mix-blend-mode:multiply' }, g);
      } else if (it.type === 'bowl') {
        const pts = ellipseFloor(it.cx, it.cz, it.r, it.y + 0.07), pb = ellipseFloor(it.cx, it.cz, it.r * 0.55, it.y);
        const hull = [...pb.slice(0, 20), ...pts.slice(20).reverse()];
        sv('polygon', { points: ptsAttr([...pb.slice(0, 21), ...pts.slice(0, 21).reverse()]), fill: '#a5844f' }, g);
        sv('polygon', { points: ptsAttr(pts), fill: C.brass_light, stroke: '#a5844f', 'stroke-width': 1 }, g);
        sv('polygon', { points: ptsAttr(ellipseFloor(it.cx, it.cz, it.r * 0.8, it.y + 0.07)), fill: '#b8955c' }, g);
        void hull;
      } else if (it.type === 'art') {
        const q = (x0, x1, y0, y1) => [P(x0, y0, it.z), P(x1, y0, it.z), P(x1, y1, it.z), P(x0, y1, it.z)];
        sv('polygon', { points: ptsAttr(q(it.x[0] + 0.03, it.x[1] + 0.03, it.y[0] - 0.04, it.y[1] - 0.04)), fill: '#3a2c1e', opacity: 0.18, filter: 'url(#b3)' }, g);
        sv('polygon', { points: ptsAttr(q(it.x[0], it.x[1], it.y[0], it.y[1])), fill: C.charcoal }, g);
        sv('polygon', { points: ptsAttr(q(it.x[0] + 0.025, it.x[1] - 0.025, it.y[0] + 0.025, it.y[1] - 0.025)), fill: '#f6f2ea' }, g);
        const ix0 = it.x[0] + 0.16, ix1 = it.x[1] - 0.16, iy0 = it.y[0] + 0.14, iy1 = it.y[1] - 0.14;
        sv('polygon', { points: ptsAttr(q(ix0, ix1, iy0, iy1)), fill: '#ece4d6' }, g);
        // gold arch (left) + charcoal arch outline (right) on a thin horizon
        const a0 = P(ix0 + 0.12, iy0, it.z), s = F / it.z, aw = 0.42 * s, ah = 0.38 * s;
        sv('path', { d: `M ${a0[0]} ${a0[1]} V ${a0[1] - ah + aw / 2} A ${aw / 2} ${aw / 2} 0 0 1 ${a0[0] + aw} ${a0[1] - ah + aw / 2} V ${a0[1]} Z`, fill: 'url(#artGold)' }, g);
        const b0 = [a0[0] + aw * 0.72, a0[1]], bw = 0.3 * s, bh = 0.3 * s;
        sv('path', { d: `M ${b0[0]} ${b0[1]} V ${b0[1] - bh + bw / 2} A ${bw / 2} ${bw / 2} 0 0 1 ${b0[0] + bw} ${b0[1] - bh + bw / 2} V ${b0[1]}`, fill: 'none', stroke: C.charcoal, 'stroke-width': 1.4 }, g);
        const h0 = P(ix0, iy0, it.z), h1 = P(ix1, iy0, it.z);
        sv('path', { d: pstr([h0, h1]), stroke: C.charcoal, 'stroke-width': 1.4 }, g);
      } else if (it.type === 'tree') {
        srand(it.seed);
        const base = P(...it.base), s = F / it.canopy[2], cc = it.canopy;
        const trunkTop = P(it.base[0] + 0.05, 1.25, it.base[2]);
        const trunk = sv('g', { stroke: '#4a4237', fill: 'none', 'stroke-linecap': 'round' }, g);
        sv('path', { d: `M ${base[0]} ${base[1]} C ${base[0] - 3} ${base[1] - 40} ${trunkTop[0] + 6} ${trunkTop[1] + 50} ${trunkTop[0]} ${trunkTop[1]}`, 'stroke-width': 4.5 }, trunk);
        const tips = [[-0.38, 1.85], [0.05, 2.15], [0.4, 1.8], [-0.15, 1.55], [0.3, 1.5]];
        for (const [dx, y] of tips) { const tp = P(cc[0] + dx, y, cc[2]); sv('path', { d: `M ${trunkTop[0]} ${trunkTop[1]} Q ${(trunkTop[0] + tp[0]) / 2} ${trunkTop[1] - 10} ${tp[0]} ${tp[1]}`, 'stroke-width': 2 }, trunk); }
        const leaves = [];
        for (let n = 0; n < it.n; n++) {
          let u, v, w; do { u = rnd() * 2 - 1; v = rnd() * 2 - 1; w = rnd() * 2 - 1; } while (u * u + v * v + w * w > 1);
          const pt = [cc[0] + u * it.r[0], cc[1] + v * it.r[1], cc[2] + w * it.r[2]];
          leaves.push({ pt, col: PAL.olive[Math.floor(rnd() * PAL.olive.length)], rot: -60 + rnd() * 120 + (u < 0 ? -20 : 20), len: 0.085 + rnd() * 0.05 });
        }
        leaves.sort((a, b) => b.pt[2] - a.pt[2]);
        for (const L of leaves) { const p = P(...L.pt), ss = F / L.pt[2]; sv('ellipse', { cx: p[0], cy: p[1], rx: (L.len * ss) / 2, ry: L.len * ss * 0.16, fill: L.col, transform: `rotate(${L.rot.toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)})` }, g); }
      } else if (it.type === 'lamp') {
        const glow = sv('circle', { cx: P(it.x, 1.45, it.z)[0], cy: P(it.x, 1.45, it.z)[1], r: 190, fill: 'url(#lampGlow)', style: 'mix-blend-mode:screen', opacity: 0.6 }, g);
        sv('polygon', { points: ptsAttr(ellipseFloor(it.x, it.z, 0.16, 0.01)), fill: C.brass, stroke: '#a5844f', 'stroke-width': 1 }, g);
        sv('path', { d: pstr([P(it.x, 0.01, it.z), P(it.x, 1.32, it.z)]), stroke: C.brass, 'stroke-width': 2.6, fill: 'none' }, g);
        sv('polygon', { points: ptsAttr(lampShade(it.x, it.z)), fill: '#f4ecdd' }, g);
        sv('polygon', { points: ptsAttr(lampShade(it.x, it.z)), fill: '#ffe2ae', opacity: 0.35 }, g);
        const sh = lampShade(it.x, it.z); sv('path', { d: pstr([sh[0], sh[1]]) + ' ' + pstr([sh[3], sh[2]]), stroke: C.brass, 'stroke-width': 1.6, fill: 'none' }, g);
        void glow;
      }
    }
  }

  // ---- RESULT: dim overlay, light glows (above everything in the room)
  const LT = ST.light;
  const dimRGB = [1, 3, 5].map((i) => parseInt(LT.dim_overlay.color.substr(i, 2), 16) / 255);
  const warmEl = sv('rect', { x: -PAD, y: -PAD, width: W.w + 2 * PAD, height: W.h + 2 * PAD, fill: 'url(#warm)', style: 'mix-blend-mode:soft-light' }, RS);
  const coveWash = sv('polygon', { points: ptsAttr([TL, TR, BR, BL]), fill: 'url(#cove)', style: 'mix-blend-mode:screen' }, RS);
  function ledLine(pts, parent) {
    const g = sv('g', {}, parent);
    sv('path', { d: pstr(pts), stroke: PAL.led_glow, 'stroke-width': 22, fill: 'none', filter: 'url(#b18)', style: 'mix-blend-mode:screen' }, g);
    sv('path', { d: pstr(pts), stroke: PAL.led_glow, 'stroke-width': 8, fill: 'none', filter: 'url(#b6)', style: 'mix-blend-mode:screen' }, g);
    sv('path', { d: pstr(pts), stroke: PAL.led_core, 'stroke-width': 3, fill: 'none' }, g);
    svis(g, 0); return g;
  }
  const led1 = ledLine([P(RM.led.channels_x[0], HH, ZN), P(RM.led.channels_x[0], HH, ZB)], RS);
  const led2 = ledLine([P(RM.led.channels_x[1], HH, ZN), P(RM.led.channels_x[1], HH, ZB)], RS);
  const cove = ledLine([P(X0, RM.led.cove_y, ZB), P(X1, RM.led.cove_y, ZB)], RS);
  // the lamp sits above the dim layer only through its own glow (furniture arrives after the light stage)

  // ================================================================ overlays (screen space) — = R2 v2
  const goldFill = div('left:0;top:0;width:1080px;height:1920px;background:linear-gradient(135deg,#d4b57a,#b8955c)');
  const divLine = div(`top:${W.y}px;width:2px;height:${W.h}px;background:${TH.wipe_edge};box-shadow:${TH.divider_shadow}`);
  const SL_ = ST.slider, HY = SL_.handle_y;
  function handleEl(d, ring, chev, shadow) {
    const h = div(`width:${d}px;height:${d}px;border-radius:50%;box-sizing:border-box;background:${TH.handle_fill};border:1.5px solid ${ring};${shadow ? 'box-shadow:' + shadow : ''}`);
    const k = d / 64;
    h.innerHTML = `<svg width="${d}" height="${d}" viewBox="0 0 64 64" style="position:absolute;left:-1.5px;top:-1.5px"><polyline points="25.5,26 19.5,32 25.5,38" fill="none" stroke="${chev}" stroke-width="${2 / k}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="38.5,26 44.5,32 38.5,38" fill="none" stroke="${chev}" stroke-width="${2 / k}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return h;
  }
  const handle = handleEl(72, TH.wipe_edge, TH.gold_on_light, TH.handle_shadow); handle.style.top = HY - 36 + 'px';
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
    // camera
    const z = kf(RM.camera.z, f), dx = 2.0 * Math.sin(f / 41), dy = 1.6 * Math.sin(f / 53 + 1);
    const tf = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${z.toFixed(5)})`;
    resWrap.style.transform = tf; planWrap.style.transform = tf;
    // plan lines (result copy): draw-in
    for (const it of resLines.items) { const t = ramp(f, it.draw[0] + it.lag, it.draw[1] + it.lag); it.el.setAttribute('stroke-dashoffset', (1 - t).toFixed(4)); }
    const dimsO = kf(PLN.dims_result_opacity, f);
    for (const t of resLines.dimTexts) svis(t, ramp(f, 244, 256, 'outSine') * dimsO);
    for (const el of resLines.dimEls) svis(el, dimsO);
    svis(resLines.root, kf(PLN.result_opacity, f));
    svis(resLines.fo, kf(LG.furniture_outline.fade, f));
    // walls
    const WS = ST.walls;
    wipes.back(ramp(f, WS.back[0], WS.back[1], WS.ease)); wipes.left(ramp(f, WS.left[0], WS.left[1], WS.ease));
    wipes.right(ramp(f, WS.right[0], WS.right[1], WS.ease)); wipes.ceiling(ramp(f, WS.ceiling[0], WS.ceiling[1], WS.ease));
    // floor
    for (const b of boards) { const t = ramp(f, b.t0, b.t0 + 8); svis(b.g, t); b.g.setAttribute('transform', t > 0 && t < 1 ? `translate(0 ${(-6 * (1 - t)).toFixed(2)})` : ''); }
    // light
    const dO = kf(LT.dim_overlay.opacity, f); window._dimFuncs.forEach((fn, i) => fn.setAttribute('slope', (1 - dO * (1 - dimRGB[i])).toFixed(4)));
    const pulse = (s) => { if (f < s) return 0; const u = f - s; return u < 4 ? (u / 4) * 1.25 : u < 14 ? 1.25 - 0.25 * EZ.outCubic((u - 4) / 10) : 1; };
    svis(led1, Math.min(1, kf(LT.led_1, f)) * (f >= 390 ? pulse(390) : 0)); svis(led2, f >= 405 ? pulse(405) : 0);
    svis(cove, kf(LT.cove, f)); svis(coveWash, kf(LT.cove, f));
    svis(skyEl, kf(LT.window_sky, f)); svis(bloom, 0.75 * kf(LT.window_sky, f));
    svis(patchG, kf(LT.floor_light_patch, f)); svis(warmEl, kf(LT.warm_wash, f));
    // furniture
    for (const d of RM.furniture) { const t = ramp(f, d.frame, d.frame + 10); svis(gFurn[d.id], t); gFurn[d.id].setAttribute('transform', `translate(0 ${(14 * (1 - ramp(f, d.frame, d.frame + 12))).toFixed(2)})`); }
    // slider
    const p = coverMode ? 0.5 : kf(SL_.p, f);
    planClip.style.clipPath = `inset(0px ${(W.w * (1 - p)).toFixed(2)}px 0px 0px)`; vis(planClip, p > 0.0005 ? 1 : 0);
    const ho = coverMode ? 1 : kf(SL_.handle_opacity, f);
    const xd = W.x + W.w * p;
    divLine.style.left = xd - 1 + 'px'; vis(divLine, Math.max(ho, p > 0.001 && p < 0.999 ? 1 : 0));
    handle.style.left = xd - 36 + 'px'; handle.style.transform = `scale(${coverMode ? 1 : kf(SL_.handle_grab, f)})`; vis(handle, ho);
    vis(chipsG, coverMode ? 1 : kf(SL_.chips.opacity, f));
    // indicator
    const ip = coverMode ? 0.5 : f >= IT.indicator.slider_from ? 1 - p : kf(IT.indicator.steps, f);
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
      if (coverMode) o = l.kind === 'section' || l.text === IT.cover.stage_text ? 1 : 0;
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
    for (const fr of [220, 300, 360, 420, 500, 560, 590, 625, 660, 760]) {
      window.setFrame(fr);
      for (const { t, d } of texts) { if (getComputedStyle(d).visibility === 'hidden' || +d.style.opacity < 0.5) continue; const r = d.querySelector('.in').getBoundingClientRect(); out.push({ f: fr, text: t.text, x0: Math.round(r.left), x1: Math.round(r.right), y0: Math.round(r.top), y1: Math.round(r.bottom), font: getComputedStyle(d).fontFamily }); }
    }
    return out;
  };
}

main().catch((e) => { console.error(e); process.exit(1); });
