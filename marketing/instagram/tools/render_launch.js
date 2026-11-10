#!/usr/bin/env node
// Render a "launch"-type Instagram batch (spec has `site_capture`): triptych canvas (L01), frame-stepped
// site-splash reel (L02), photo/chapter carousel (L03) and phone-screenshot carousel (L04).
// usage: node render_launch.js <repo_root> <batch_dir> [ITEM ...]     ITEM = L01 | L02 | L03 | L04
// env:   IG_ALLOW_PARTIAL=1 — a failed L04 site check blocks only that slide (default: STOP the run)
//        IG_SITE_URL (default http://localhost:3123) — the LOCAL production build (render_batch.sh starts it)
// Writes <batch>/05-output/<ITEM>/..., L02 frames + layers + timeline.json in <batch>/.tools/work/L02/
// (compose with compose_reel.py), and <batch>/.tools/work/launch_report.json (fit/box/site checks).
// Any failed check (autofit, forbidden asset, forbidden text, price in crop) throws = STOP.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium, devices } = require('playwright');
const L = require('./ig_lib');

const [root, batchArg, ...only] = process.argv.slice(2);
if (!root || !batchArg) { console.error('usage: render_launch.js <repo_root> <batch_dir> [ITEM...]'); process.exit(2); }
const batch = path.resolve(root, batchArg);
const spec = JSON.parse(fs.readFileSync(path.join(batch, '04-render-spec.json'), 'utf8'));
const copy = JSON.parse(fs.readFileSync(path.join(batch, '03-copy.json'), 'utf8'));
const OUT = path.join(batch, '05-output');
const WORK = path.join(batch, '.tools', 'work');
const SITE = process.env.IG_SITE_URL || 'http://localhost:3123';
const S = spec.styles;
const IT = spec.items;
const want = (id) => !only.length || only.includes(id);
const report = { site: SITE, items: {}, checks: [] };
const py = (script, ...args) => execFileSync('python3', [path.join(__dirname, script), ...args.map(String)]).toString().trim();
const mk = (d) => { fs.mkdirSync(d, { recursive: true }); return d; };
const check = (ok, msg) => { report.checks.push({ ok, msg }); if (!ok) throw new Error('CHECK FAILED (STOP): ' + msg); console.log('  ok  ', msg); };

// ---------- forbidden assets ----------
const FORBIDDEN = ['public/services/', 'public/stock/', 'public/projects/house-01/11.webp', 'public/projects/pool-02/04.webp', 'public/projects/pool-01/08.webp'];
(function scan(o) {
  if (Array.isArray(o)) return o.forEach(scan);
  if (o && typeof o === 'object') return Object.entries(o).forEach(([k, v]) => {
    if (['src', 'file'].includes(k) && typeof v === 'string') {
      if (FORBIDDEN.some((f) => v.startsWith(f))) throw new Error('forbidden asset referenced: ' + v);
      if (!fs.existsSync(path.join(root, v))) throw new Error('missing source: ' + v);
    } else scan(v);
  });
})(IT);

// ---------- small builders ----------
const ov = (o) => (typeof o === 'string' ? spec.overlays[o] : o.ref ? spec.overlays[o.ref] : o);
// letter-spaced text: CSS adds tracking after the last glyph -> compensate so visible glyphs are centred / flush right
function track(st, align) {
  if (!st.letter_spacing) return '';
  if (align === 'center') return `box-sizing:border-box;padding-left:${st.letter_spacing}`;
  if (align === 'right') return `margin-right:-${st.letter_spacing}`;
  return '';
}
const T = (el) => ({ ...el, extra_css: [track(S[el.style], el.anchor && el.anchor.includes('right') ? 'right' : el.align), el.extra_css].filter(Boolean).join(';') });
function vlines(xs, w, color, H, x0 = 0) {
  return xs.map((x) => `<div style="position:absolute;left:${x0 + x}px;top:0;width:${w}px;height:${H}px;background:${color}"></div>`).join('');
}
function grid6(H = 1440) { const g = spec.overlays.grid6_tile; return vlines(g.xs, g.w, g.color, H); }
function stackEl(ts, W, H) {
  const pos = ts.anchor === 'bottom' ? `bottom:${H - ts.y}px` : `top:${ts.y}px`;
  let inner = '';
  if (ts.rule) inner += `<div style="width:${ts.rule.w}px;height:${ts.rule.h}px;background:${ts.rule.color};margin-bottom:${ts.rule.gap}px"></div>`;
  ts.items.forEach((it, i) => { inner += L.flowEl(S, T({ ...it, id: `stack${i}` }), i ? `margin-top:${ts.gap}px` : ''); });
  return `<div style="position:absolute;left:${ts.x}px;${pos}">${inner}</div>`;
}
const pageEl = (pg, W, H) => L.textEl(S, T({ ...pg, id: 'page' }), W, H);
const imgEl = (file, x, y, w, h, op = 1) => `<img src="file://${file}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;opacity:${op}">`;
const ruleFull = (r) => L.ruleEl(r);

async function still(r, html, W, H, png, q, transparent = false) {
  const res = await r.render(html, W, H, png, transparent);
  const fails = res.report.filter((x) => x.kind === 'fit' && !x.ok);
  check(!fails.length, `${path.basename(png)}: autofit ${fails.length ? JSON.stringify(fails) : 'all text fits'}`);
  const shrunk = res.report.filter((x) => x.kind === 'fit' && x.size !== x.size0);
  if (shrunk.length) console.log('  note autofit', path.basename(png), JSON.stringify(shrunk.map((x) => [x.id, x.size0, x.size])));
  const fam = new Set(res.fonts.map((f) => f.split(' ').slice(0, -1).join(' ')));
  const needArm = res.report.some((x) => x.kind === 'box' && /[԰-֏]/.test(x.text));
  if (needArm) check([...fam].some((f) => /Armenian/.test(f)), `${path.basename(png)}: Armenian font loaded (${[...fam].join(', ')})`);
  if (q) py('png2jpg.py', png, png.replace(/\.png$/, '.jpg'), q);
  report.items[path.basename(png)] = { boxes: res.report.filter((x) => x.kind === 'box'), fit: res.report.filter((x) => x.kind === 'fit') };
  return res;
}
const boxes = (res) => Object.fromEntries(res.report.filter((x) => x.kind === 'box').map((b) => [b.id, b]));

function caption(id, dir, prefix = '') {
  const c = copy[id]; if (!c) throw new Error('no copy for ' + id);
  const txt = [c.caption_hy, c.caption_ru, c.caption_en, (c.hashtags || []).join(' ')].filter(Boolean).join('\n\n') + '\n';
  fs.writeFileSync(path.join(dir, `${prefix}caption.txt`), txt);
  fs.writeFileSync(path.join(dir, `${prefix}alt_hy.txt`), c.alt_hy + '\n');
}

// ---------- site capture ----------
const FREEZE = () => {
  localStorage.setItem('garon-lang', 'hy');
  const st = window.setTimeout;
  window.setTimeout = function (f, d, ...a) { if (d === 3200 || d === 250) return 0; return st.call(window, f, d, ...a); };
};
async function splashPage(browser) {
  const cap = IT.L02.capture;
  const { viewport, deviceScaleFactor, isMobile, hasTouch, reducedMotion } = cap.context;
  const ctx = await browser.newContext({ viewport, deviceScaleFactor, isMobile, hasTouch, reducedMotion });
  await ctx.addInitScript(FREEZE);
  const p = await ctx.newPage();
  await p.goto(SITE + '/', { waitUntil: 'networkidle' });
  return { ctx, p };
}

async function captureVilla(browser) {
  const { ctx, p } = await splashPage(browser);
  const svg = await p.evaluate(() => document.querySelector('.splashVilla').outerHTML);
  await ctx.close();
  return svg;
}

const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
function l02State(f) {
  const t = f / 30;
  const zoom = (tt) => 1 + 0.03 * easeInOutSine(Math.min(1, Math.max(0, (tt - 2.2) / 2.4)));
  if (f <= 71) return { anims: t * 1000, lift: 0, scale: t < 2.2 ? 1 : zoom(t) };
  if (f <= 137) return { anims: 2400, lift: 0, scale: zoom(t) };
  if (f <= 164) return { anims: 2400, lift: 2300 + (t - 4.6) * 1000, scale: 1.03 };
  return { anims: 2400, lift: 3200, scale: 1.03 };
}

async function captureSplash(browser, dir) {
  const { ctx, p } = await splashPage(browser);
  await p.addStyleTag({ content: 'html,body{background:#0c0d0e linear-gradient(90deg,rgba(201,169,106,.035) 1px,transparent 1px) 0 0/60px 100%!important;overflow:hidden!important} body>:not(.splash){visibility:hidden!important} .splash{visibility:visible!important}' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => { const i = document.querySelector('.splashLogo img'); return i && i.complete && i.naturalWidth > 0; });
  const lang = await p.evaluate(() => document.documentElement.lang);
  check(lang === 'hy', `L02 capture: html lang = ${lang}`);
  await p.evaluate(() => { for (const a of document.getAnimations()) a.pause(); });
  const setState = (s) => p.evaluate((s) => {
    for (const a of document.getAnimations()) a.currentTime = a.animationName === 'splashLift' ? s.lift : s.anims;
    document.querySelector('.splash').style.scale = String(s.scale);
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, s);
  const files = [];
  let endFile = null;
  for (let f = 0; f < 270; f++) {
    const s = l02State(f);
    if (f >= 165 && endFile) { files.push(endFile); continue; }
    await setState(s);
    const out = path.join(dir, `L02_${String(f).padStart(3, '0')}.png`);
    await p.screenshot({ path: out });
    if (f >= 165) endFile = out;
    files.push(out);
  }
  // measured layout at scale 1 (compare with spec measured_layout_px)
  await setState({ anims: 2400, lift: 0, scale: 1 });
  const meas = await p.evaluate(() => {
    const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 3)); };
    return { villa_svg: r('.splashVilla'), logo_img: r('.splashLogo img'), tag: r('.splashTag'), corner: r('.splashCorner'), counter: r('.splashCounter'),
      counterText: getComputedStyle(document.querySelector('.splashCounter'), '::after').content };
  });
  const cover = path.join(dir, 'L02_cover_capture.png');
  await p.screenshot({ path: cover });
  await ctx.close();
  return { files, cover, meas };
}

async function captureShots(browser, dir) {
  const sc = IT.L04.screenshots;
  const { defaultBrowserType, ...dev } = devices['iPhone 13'];
  const ctx = await browser.newContext({ ...dev, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => localStorage.setItem('garon-lang', 'hy'));
  const res = {};
  for (const shot of sc.shots) {
    try { res[shot.id] = await captureShot(ctx, dev, shot, dir); } catch (e) {
      // IG_ALLOW_PARTIAL=1: a failed site check blocks only this shot's slide (reported), other slides still render
      if (process.env.IG_ALLOW_PARTIAL !== '1') throw e;
      console.error('  BLOCKED', shot.id, String(e.message));
      res[shot.id] = { blocked: String(e.message) };
      for (const pg of ctx.pages()) await pg.close();
    }
  }
  await ctx.close();
  return res;
}

async function captureShot(ctx, dev, shot, dir) {
  const sc = IT.L04.screenshots;
  {
    const slide = IT.L04.slides.find((s) => s.phone && s.phone.screenshot === shot.id);
    const cropCss = Math.round(slide.phone.crop.h * dev.viewport.height); // crop bottom in CSS px (viewport coords)
    const p = await ctx.newPage();
    await p.goto(SITE + shot.url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
    await p.waitForTimeout(800);
    const sy = await p.evaluate(() => window.scrollY);
    check(sy === shot.scrollY, `${shot.id} ${shot.url}: scrollY ${sy} === ${shot.scrollY}`);
    await p.evaluate(async () => {
      const vh = innerHeight;
      await Promise.all([...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.width > 0; })
        .map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((ok) => { i.onload = i.onerror = ok; }))));
    });
    await p.waitForTimeout(200);
    const info = await p.evaluate(({ cropCss }) => {
      const vw = innerWidth, vh = innerHeight;
      const inView = (r, h = vh) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < vw;
      const dec = (u) => { try { return decodeURIComponent(u); } catch (e) { return u; } };
      const media = [];
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect(); if (!inView(r)) continue;
        const urls = [getComputedStyle(el).backgroundImage, getComputedStyle(el, '::before').backgroundImage, getComputedStyle(el, '::after').backgroundImage];
        if (el.tagName === 'IMG') urls.push(el.currentSrc, el.getAttribute('src'), el.getAttribute('srcset'));
        if (el.tagName === 'VIDEO') urls.push(el.currentSrc, el.getAttribute('src'), el.getAttribute('poster'));
        for (const u of urls) if (u && u !== 'none') media.push({ tag: el.tagName, cls: String(el.className), url: dec(u).slice(0, 200), top: Math.round(r.top) });
      }
      // visible text nodes intersecting the viewport (and, separately, the crop region)
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const vis = [], crop = [], gram = [];
      let n;
      while ((n = tw.nextNode())) {
        const t = n.nodeValue.trim(); if (!t) continue;
        const pe = n.parentElement;
        if (!pe || !pe.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        const rects = [...rg.getClientRects()];
        if (rects.some((r) => inView(r))) vis.push(t);
        if (rects.some((r) => inView(r, cropCss))) crop.push(t);
        if (t.includes('֏')) gram.push({ t, top: Math.round(pe.getBoundingClientRect().top) });
      }
      const inp = document.querySelector('input');
      const results = [...document.querySelectorAll('[class*="calcResult"],[class*="Result"]')]
        .filter((e) => e.checkVisibility() && inView(e.getBoundingClientRect(), cropCss)).map((e) => String(e.className));
      return { lang: document.documentElement.lang, media, vis, crop, gram, inputValue: inp ? inp.value : null, inputPh: inp ? inp.placeholder : null, results, scrolled: document.querySelector('.siteHeader')?.className };
    }, { cropCss });
    const id = shot.id;
    check(info.lang === 'hy', `${id}: html lang = ${info.lang}`);
    const badMedia = info.media.filter((m) => /\/(stock|services)\//.test(m.url));
    check(!badMedia.length, `${id}: no /stock/ or /services/ media in viewport (${info.media.length} media urls: ${[...new Set(info.media.map((m) => m.url.replace(/^url\("?|"?\)$/g, '')))].join(' | ')})${badMedia.length ? ' BAD: ' + JSON.stringify(badMedia) : ''}`);
    const visTxt = info.vis.join(' ‖ ');
    const fb = visTxt.match(/25\+|50\+|ՀԻՄՆ|2000/g);
    check(!fb, `${id}: visible text free of 25+ / 50+ / ՀԻՄՆ / 2000${fb ? ' FOUND ' + fb.join(',') : ''}`);
    const cropTxt = info.crop.join(' ‖ ');
    const price = cropTxt.match(/֏|AMD|драм|\$|€|\d{1,3}([ ,. ]\d{3})+/g);
    check(!price, `${id}: no price / currency inside the published crop (viewport y 0..${cropCss})${price ? ' FOUND ' + price.join(',') : ''}`);
    if (id === 'L04_shot4') {
      check(info.gram.every((g) => g.top >= cropCss), `${id}: every ֏ element top >= ${cropCss} (${JSON.stringify(info.gram.slice(0, 4))})`);
      check(info.inputValue === '', `${id}: area input empty (placeholder «${info.inputPh}»)`);
      check(!info.results.length, `${id}: no result block in crop (${info.results.join(',')})`);
    }
    const out = path.join(dir, `${id}.png`);
    await p.screenshot({ path: out });
    await p.close();
    return { file: out, cropCss, header: info.scrolled, visibleText: info.crop.join(' | ').slice(0, 600), media: [...new Set(info.media.map((m) => m.url))] };
  }
}

// ---------- L01 ----------
async function buildL01(r, villaSvg) {
  const it = IT.L01; const W = it.canvas.w, H = it.canvas.h;
  const dir = mk(path.join(OUT, 'L01'));
  const tileX = Object.fromEntries(it.slices.map((s) => [s.id, s.x]));
  const p = [];
  p.push(L.overlayEl(spec.overlays.triptych_glow, W, H));
  p.push(vlines(Array.from({ length: 18 }, (_, k) => 90 + 180 * k), 2, 'rgba(201,169,106,0.07)', H));
  const hz = it.canvas_layers.find((l) => l.layer === 'horizon');
  p.push(L.ruleEl(hz));
  for (const [tid, tile] of Object.entries(it.tiles)) {
    const x0 = tileX[tid];
    for (const [i, el] of tile.elements.entries()) {
      if (el.kind === 'text') p.push(L.textEl(S, T({ ...el, x: el.x + x0, id: `${tid}_${i}` }), W, H));
      else if (el.kind === 'image') p.push(imgEl(path.join(root, el.src), el.x + x0, el.y, el.w, el.h));
      else if (el.kind === 'svg') {
        p.push(`<style>.villa svg{display:block;width:${el.w}px;height:${el.h}px;color:#c9a96a} .villa .draw{stroke-dasharray:none!important;stroke-dashoffset:0!important;animation:none!important} .villa path{vector-effect:non-scaling-stroke;stroke-width:2px}</style>`);
        p.push(`<div class="villa" style="position:absolute;left:${el.x + x0}px;top:${el.y}px;width:${el.w}px;height:${el.h}px">${villaSvg}</div>`);
      }
    }
  }
  const canvas = path.join(dir, 'L01_canvas.png');
  const res = await still(r, L.page(W, H, p.join('\n'), it.canvas.background), W, H, canvas, 0);
  // seam rule: every text box >= 90 px from tile edges (range box includes the trailing letter-spacing, <= 6 px here)
  for (const b of Object.values(boxes(res))) {
    const t = Math.floor(b.x0 / 1080); const lx0 = b.x0 - t * 1080, lx1 = b.x1 - t * 1080;
    check(lx0 >= 90 && lx1 <= 996, `L01 ${b.id} «${b.text}» inside tile x 90..990 (${lx0}..${lx1}, y ${b.y0}..${b.y1})`);
  }
  py('slice_canvas.py', canvas, dir, ...it.slices.map((s) => `${s.id}:${s.x}`));
  for (const s of it.slices) py('png2jpg.py', path.join(dir, `${s.id}.png`), path.join(dir, `${s.id}.jpg`), 95);
  for (const s of it.slices) caption(s.id, dir, `${s.id}_`);
  report.items.L01 = { boxes: boxes(res) };
}

// ---------- L02 ----------
async function buildL02(r, cap) {
  const it = IT.L02; const W = 1080, H = 1920;
  const dir = mk(path.join(OUT, 'L02'));
  const wd = mk(path.join(WORK, 'L02'));
  const layers = [];
  const anim = (s) => { const f = /fade (\d+)f/.exec(s || ''), rr = /rise (\d+)px/.exec(s || ''); return { fade: f ? +f[1] : 0, rise: rr ? +rr[1] : 0 }; };
  for (const [i, h] of it.overlay_text.entries()) {
    const png = path.join(wd, `hook${i + 1}.png`);
    const res = await still(r, L.page(W, H, L.textEl(S, T({ ...h, id: `hook${i + 1}` }), W, H)), W, H, png, 0, true);
    const b = boxes(res)[`hook${i + 1}`];
    check(b.y1 - b.y0 < 120, `L02 hook ${i + 1} single line (${b.y0}..${b.y1})`);
    layers.push({ png, in: h.in, out: h.out, fade_in: anim(h.anim_in).fade, fade_out: anim(h.anim_out).fade, z: 1 });
  }
  for (const [i, el] of it.end_card.layers.entries()) {
    if (el.layer === 'vlines') continue; // in the capture
    const png = path.join(wd, `end${i}.png`);
    if (el.layer === 'text') {
      await still(r, L.page(W, H, L.textEl(S, T({ ...el, id: `end${i}` }), W, H)), W, H, png, 0, true);
      const a = anim(el.anim_in);
      layers.push({ png, in: el.in, out: el.out, fade_in: a.fade, rise: a.rise, z: 2 });
    } else if (el.layer === 'horizon') {
      await r.render(L.page(W, H, L.ruleEl(el)), W, H, png, true);
      layers.push({ png, in: el.in, out: it.end_card.out, wipe_in: 0.7, z: 2 });
    }
  }
  const tl = { w: W, h: H, fps: 30, duration: it.duration,
    scenes: [{ in: 0, out: it.duration, motion: { type: 'frames', files: cap.files } }], layers };
  fs.writeFileSync(path.join(wd, 'timeline.json'), JSON.stringify(tl, null, 1));
  fs.copyFileSync(cap.cover, path.join(dir, 'L02_cover.png'));
  py('png2jpg.py', path.join(dir, 'L02_cover.png'), path.join(dir, 'L02_cover.jpg'), 92);
  caption('L02', dir);
  report.items.L02 = { measured_layout_px: cap.meas, spec_measured: it.capture.measured_layout_px, frames: cap.files.length, unique_frames: new Set(cap.files).size };
}

// ---------- L03 ----------
function gradedPhoto(src, crop, w, h, tag) {
  const g = JSON.parse(py('prep_sources.py', root, path.join(batch, '.tools', 'src'), src))[src];
  const out = path.join(batch, '.tools', 'src', `${tag}_${w}x${h}.png`);
  py('fit_photo.py', g, out, w, h, crop.x, crop.y, crop.w, crop.h);
  return out;
}
function emptyFrame(f) {
  const t = f.corner_ticks; const { x, y, w, h } = f; const L2 = t.len, s = t.w;
  const tick = (l, tp, ww, hh) => `<div style="position:absolute;left:${l}px;top:${tp}px;width:${ww}px;height:${hh}px;background:${t.color}"></div>`;
  return `<svg style="position:absolute;left:${x}px;top:${y}px" width="${w}" height="${h}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="rgba(201,169,106,0.35)" stroke-width="1" stroke-dasharray="${f.dash.join(' ')}"/></svg>`
    + tick(x, y, L2, s) + tick(x, y, s, L2) + tick(x + w - L2, y, L2, s) + tick(x + w - s, y, s, L2)
    + tick(x, y + h - s, L2, s) + tick(x, y + h - L2, s, L2) + tick(x + w - L2, y + h - s, L2, s) + tick(x + w - s, y + h - L2, s, L2);
}
function endBlock(sl) {
  const p = [];
  if (sl.logo_center) { const lc = sl.logo_center; p.push(imgEl(path.join(root, lc.src), lc.x, lc.y, lc.w, lc.h)); }
  let inner = L.flowEl(S, T({ ...sl.title, id: 'title' }));
  const lines = sl.body ? [sl.body] : (sl.body_lines || []).filter((b) => typeof b.y === 'string');
  for (const [i, b] of lines.entries()) {
    const gap = +String(b.y).split('+')[1];
    const dx = b.x - sl.title.x;
    inner += L.flowEl(S, T({ ...b, id: `body${i}` }), `margin-top:${gap}px;margin-left:${dx}px`);
  }
  p.push(`<div style="position:absolute;left:${sl.title.x}px;top:${sl.title.y}px">${inner}</div>`);
  for (const [i, b] of (sl.body_lines || []).entries()) if (typeof b.y === 'number') p.push(L.textEl(S, T({ ...b, id: `abs${i}` }), 1080, 1440));
  return p.join('');
}
async function buildL03(r) {
  const it = IT.L03; const [W, H] = it.size;
  const dir = mk(path.join(OUT, 'L03'));
  const feedLogo = spec.brand.logo.feed;
  for (const sl of it.slides) {
    const p = [];
    let bg = sl.background || '#0c0d0e';
    if (sl.layout === 'full_photo') {
      p.push(imgEl(gradedPhoto(sl.src, sl.crop, W, H, `L03_${sl.n}`), 0, 0, W, H));
      for (const o of sl.overlays) p.push(L.overlayEl(ov(o), W, H));
      p.push(L.logoEl(root, feedLogo));
      p.push(stackEl(sl.text_stack, W, H));
    } else if (sl.layout === 'chapter') {
      if (sl.photo) { const ph = sl.photo; p.push(imgEl(gradedPhoto(ph.src, ph.crop, ph.dest.w, ph.dest.h, `L03_${sl.n}`), ph.dest.x, ph.dest.y, ph.dest.w, ph.dest.h)); }
      for (const o of sl.overlays || []) p.push(L.overlayEl(ov(o), W, H));
      if (sl.empty_frame) p.push(emptyFrame(sl.empty_frame));
      p.push(ruleFull(sl.rule_full));
      p.push(L.logoEl(root, feedLogo));
      p.push(stackEl(sl.text_stack, W, H));
    } else if (sl.layout === 'end') {
      p.push(grid6(H));
      p.push(L.ruleEl(sl.horizon));
      p.push(endBlock(sl));
    }
    p.push(pageEl(sl.page, W, H));
    const png = path.join(dir, `L03_${String(sl.n).padStart(2, '0')}.png`);
    const res = await still(r, L.page(W, H, p.join('\n'), bg), W, H, png, sl.layout === 'full_photo' || sl.photo ? 92 : 95);
    const bx = boxes(res);
    for (const b of Object.values(bx)) check(b.x0 >= 90 && b.x1 <= 996 && b.y0 >= 60 && b.y1 <= 1380, `L03_${sl.n} «${b.text.slice(0, 30)}» in safe area (${b.x0},${b.y0})-(${b.x1},${b.y1})`);
    if (sl.layout === 'end') check(bx.body0.y1 < 1079, `L03_${sl.n} body ends above horizon (${bx.body0.y1})`);
  }
  caption('L03', dir);
}

// ---------- L04 ----------
async function buildL04(r, shots) {
  const it = IT.L04; const [W, H] = it.size;
  const dir = mk(path.join(OUT, 'L04'));
  const pt = it.phone_template;
  for (const sl of it.slides) {
    const p = [grid6(H)];
    if (sl.layout === 'phone') {
      const ph = sl.phone; const shot = shots[ph.screenshot];
      if (shot.blocked) { console.error(`  SKIP L04_${sl.n}: ${ph.screenshot} blocked`); report.items[`L04_${sl.n}`] = { blocked: shot.blocked }; continue; }
      const scr = path.join(WORK, 'L04', `${ph.screenshot}_${ph.dest.w}x${ph.dest.h}.png`);
      py('fit_photo.py', shot.file, scr, ph.dest.w, ph.dest.h, ph.crop.x, ph.crop.y, ph.crop.w, ph.crop.h);
      const f = pt.frame;
      p.push(`<div style="position:absolute;left:${f.x}px;top:${ph.frame_top}px;width:${f.w}px;height:${H - ph.frame_top + 200}px;box-sizing:border-box;background:${f.fill};border:${f.border};border-radius:${f.radius_outer}px;box-shadow:${f.shadow}"></div>`);
      p.push(`<div style="position:absolute;left:${ph.dest.x}px;top:${ph.dest.y}px;width:${ph.dest.w}px;height:${ph.dest.h}px;overflow:hidden;border-radius:${pt.frame.radius_screen}px ${pt.frame.radius_screen}px 0 0"><img src="file://${scr}" style="display:block;width:${ph.dest.w}px;height:${ph.dest.h}px"></div>`);
      p.push(stackEl(sl.text_stack, W, H));
    } else {
      p.push(L.ruleEl(sl.horizon));
      p.push(endBlock(sl));
    }
    p.push(pageEl(sl.page, W, H));
    const png = path.join(dir, `L04_${String(sl.n).padStart(2, '0')}.png`);
    const res = await still(r, L.page(W, H, p.join('\n'), sl.background), W, H, png, 95);
    const bx = boxes(res);
    for (const b of Object.values(bx)) check(b.x0 >= 90 && b.x1 <= 996 && b.y0 >= 60, `L04_${sl.n} «${b.text.slice(0, 30)}» in safe area (${b.x0},${b.y0})-(${b.x1},${b.y1})`);
    if (sl.layout === 'phone') {
      const bottom = Math.max(...Object.values(bx).filter((b) => b.id.startsWith('stack')).map((b) => b.y1));
      const limit = sl.n === 4 ? 690 : sl.phone.frame_top - 30;
      check(bottom <= limit, `L04_${sl.n} text block ends at ${bottom} <= ${limit}`);
    } else {
      check(bx.body1.y1 < 1079 && bx.abs2.y0 > 1081, `L04_${sl.n} url/body above horizon (${bx.body1.y1}), email below (${bx.abs2.y0})`);
    }
  }
  caption('L04', dir);
}

(async () => {
  mk(OUT); mk(WORK);
  const needSite = ['L01', 'L02', 'L04'].some(want);
  let villa = null, cap = null, shots = null;
  if (needSite) {
    const b = await chromium.launch();
    try {
      if (want('L01')) { villa = await captureVilla(b); console.log('villa svg captured', villa.length, 'chars'); }
      if (want('L02')) { cap = await captureSplash(b, mk(path.join(WORK, 'L02', 'frames'))); console.log('L02 frames', cap.files.length, JSON.stringify(cap.meas)); }
      if (want('L04')) { shots = await captureShots(b, mk(path.join(WORK, 'L04'))); report.items.L04_shots = shots; }
    } finally { await b.close(); }
  }
  const r = await new L.Renderer(path.join(WORK, 'html')).open();
  try {
    if (want('L01')) await buildL01(r, villa);
    if (want('L02')) await buildL02(r, cap);
    if (want('L03')) await buildL03(r);
    if (want('L04')) await buildL04(r, shots);
  } finally {
    await r.close();
    fs.writeFileSync(path.join(WORK, 'launch_report.json'), JSON.stringify(report, null, 1));
  }
  console.log('done; report:', path.join(WORK, 'launch_report.json'));
})().catch((e) => { fs.writeFileSync(path.join(WORK, 'launch_report.json'), JSON.stringify({ ...report, error: String(e) }, null, 1)); console.error(e); process.exit(1); });
