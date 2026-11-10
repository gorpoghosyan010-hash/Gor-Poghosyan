#!/usr/bin/env node
// Render an Instagram batch from <batch>/04-render-spec.json + <batch>/03-copy.json.
// usage: node render_batch.js <repo_root> <batch_dir> [ITEM ...]
// Produces in <batch>/05-output/<ITEM>/:
//   feed stills (.png master + .jpg upload), reel covers, caption.txt, alt_hy.txt
//   and for reels: layer PNGs + timeline.json in <batch>/.tools/work/<ITEM>/ (compose with compose_reel.py)
// Items with asset_status "needs_shoot" (P07) get overlay templates only.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./ig_lib');

const [root, batchArg, ...only] = process.argv.slice(2);
if (!root || !batchArg) { console.error('usage: render_batch.js <repo_root> <batch_dir> [ITEM...]'); process.exit(2); }
const batch = path.resolve(root, batchArg);
const spec = JSON.parse(fs.readFileSync(path.join(batch, '04-render-spec.json'), 'utf8'));
const copy = JSON.parse(fs.readFileSync(path.join(batch, '03-copy.json'), 'utf8'));
const OUT = path.join(batch, '05-output');
const WORK = path.join(batch, '.tools', 'work');
const S = spec.styles;
const FEED = { W: 1080, H: 1350 }, REEL = { W: 1080, H: 1920 };
const report = { items: {}, warnings: [] };
const warn = (m) => { report.warnings.push(m); console.warn('WARN', m); };

// ---------- sources ----------
function collectSrc(o, acc) {
  if (Array.isArray(o)) o.forEach((v) => collectSrc(v, acc));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
    if (k === 'src' && typeof v === 'string' && v.endsWith('.webp')) acc.add(v); else collectSrc(v, acc);
  }
  return acc;
}
const srcs = [...collectSrc(spec.items, new Set())];
const forbidden = ['public/services/', 'public/stock/', 'public/projects/house-01/11.webp', 'public/projects/pool-02/04.webp'];
for (const s of srcs) {
  if (forbidden.some((f) => s.startsWith(f))) throw new Error('forbidden asset referenced: ' + s);
  if (!fs.existsSync(path.join(root, s))) throw new Error('missing source: ' + s);
}
const graded = JSON.parse(execFileSync('python3', [path.join(__dirname, 'prep_sources.py'), root, path.join(batch, '.tools', 'src'), ...srcs]).toString());
const G = (s) => graded[s] || (() => { throw new Error('not graded ' + s); })();

const ov = (o) => (typeof o === 'string' ? spec.overlays[o] : o);
const logoRef = (r) => (typeof r === 'string' ? spec.brand.logo[r.replace('brand.logo.', '')] : r);

// ---------- feed still builder ----------
function chain(first, second, gapStr, W, H) {
  // second.y == "title.bottom + N": group both in one absolute container
  const gap = +String(second.y).split('+')[1];
  if (second.x !== first.x) warn(`chain x mismatch ${first.text}`);
  return `<div style="position:absolute;left:${first.x}px;top:${first.y}px">${L.flowEl(S, { ...first, id: first.id || 'title' })}${L.flowEl(S, { ...second, id: second.id || 'body' }, `margin-top:${gap}px`)}</div>`;
}

function stackEl(ts, W, H) {
  const pos = ts.anchor === 'bottom' ? `bottom:${H - ts.y}px` : `top:${ts.y}px`;
  let inner = '';
  if (ts.rule) inner += `<div style="width:${ts.rule.w}px;height:${ts.rule.h}px;background:${ts.rule.color};margin-bottom:${ts.rule.gap}px"></div>`;
  ts.items.forEach((it, i) => { inner += L.flowEl(S, { ...it, id: `stack${i}` }, i ? `margin-top:${ts.gap}px` : ''); });
  return `<div style="position:absolute;left:${ts.x}px;${pos}">${inner}</div>`;
}

function pageEl(pg, hint, W, H) {
  const el = { ...pg, id: 'page' };
  if (hint) {
    const hs = L.styleCss(S[hint.style], { size_override: hint.size_override });
    el.html = `${L.esc(pg.text)}<span style="${hs};margin-left:26px;letter-spacing:0;vertical-align:-3px">${L.esc(hint.text)}</span>`;
  }
  const h = L.textEl(S, el, W, H);
  return hint ? h.replace(/ data-maxl="\d+" data-min="\d+"/, '') : h;
}

function tableEl(t) {
  const c = t.columns; let h = '';
  const div = 'rgba(201,169,106,0.35)';
  t.rows.forEach((r, i) => {
    const top = t.y + i * t.row_h; const base = top + 34;
    h += `<div style="position:absolute;left:${t.x}px;top:${top}px;width:${t.w}px;height:1px;background:${div}"></div>`;
    h += L.textEl(S, { style: c.name_desc.name_style, text: r.name, x: c.name_desc.x, y: base, id: `row${i}_name` }, 1080, 1350);
    h += L.textEl(S, { style: c.name_desc.desc_style, text: r.desc, x: c.name_desc.x, y: base + c.name_desc.desc_offset_y, w: c.name_desc.w, id: `row${i}_desc`, max_lines: c.name_desc.desc_max_lines }, 1080, 1350)
      .replace('style="position', `data-maxl="${c.name_desc.desc_max_lines}" data-min="24" style="line-height:1.4;position`);
    // Deviation from spec: rate column at x=600 collides with the 66px totals (e.g. "180,000 ֏/մ²" vs "12.6 մլն ֏"),
    // so the rate sits right-aligned directly under its total.
    h += L.textEl(S, { style: c.rate.style, text: r.rate, x: c.total.x_right, y: base + 72, anchor: 'top-right', id: `row${i}_rate` }, 1080, 1350);
    h += L.textEl(S, { style: c.total.style, text: r.total, x: c.total.x_right, y: base + c.total.offset_y, anchor: 'top-right', id: `row${i}_total` }, 1080, 1350);
  });
  h += `<div style="position:absolute;left:${t.x}px;top:${t.y + t.rows.length * t.row_h}px;width:${t.w}px;height:1px;background:${div}"></div>`;
  return h;
}

function buildStill(item, sl, W, H, opts = {}) {
  const p = [];
  const bg = sl.background || item.background || '#0c0d0e';
  if (sl.src) {
    const box = sl.photo_box || { x: 0, y: 0, w: W, h: H };
    const border = sl.photo_border ? `outline:${sl.photo_border.replace(/^1 px/, '1px solid')};outline-offset:0` : '';
    p.push(L.photoEl(G(sl.src), sl.src_px, sl.crop, box, border));
  }
  if (sl.photo) p.push(L.photoEl(G(sl.photo.src), sl.photo.src_px, sl.photo.crop, sl.photo.box));
  for (const o of sl.overlays || item.overlays_still || []) p.push(L.overlayEl(ov(o), W, H));
  // logo
  let lg = sl.logo !== undefined ? sl.logo : item.logo;
  if (sl.logo_large) lg = null;
  if (lg) {
    if (typeof lg === 'object' && lg.ref) p.push(L.logoEl(root, { ...logoRef(lg.ref), ...lg.position_override }));
    else p.push(L.logoEl(root, logoRef(lg), opts.logoX != null ? { x: opts.logoX } : {}));
  }
  if (sl.logo_large) p.push(L.logoEl(root, { ...sl.logo_large, opacity: 0.92 }));
  if (sl.rule && sl.rule.x != null) p.push(L.ruleEl(sl.rule));
  if (sl.numeral) p.push(L.textEl(S, { ...sl.numeral, id: 'numeral' }, W, H));
  if (sl.quote_mark) p.push(L.textEl(S, { ...sl.quote_mark, id: 'quote' }, W, H));
  // text set directly on a full-bleed photo (P08: light grey sky) gets a soft dark halo for contrast
  const halo = sl.src && !sl.photo_box && sl.title ? '0 1px 18px rgba(12,13,14,0.7),0 0 4px rgba(12,13,14,0.35)' : null;
  if (sl.title && sl.body && typeof sl.body.y === 'string') {
    const h = chain(sl.title, sl.body, sl.body.y, W, H);
    p.push(halo ? h.replace('<div style="position:absolute;', `<div style="text-shadow:${halo};position:absolute;`) : h);
  }
  else {
    if (sl.title) p.push(L.textEl(S, { ...sl.title, id: 'title' }, W, H));
    if (sl.body) p.push(L.textEl(S, { ...sl.body, id: 'body' }, W, H));
  }
  if (sl.text_stack) p.push(stackEl(sl.text_stack, W, H));
  // full-bleed photos: soft shadow under small corner labels so they hold on bright sky/water
  const sh = sl.src && !sl.photo_box ? '0 1px 10px rgba(12,13,14,0.6)' : null;
  const withShadow = (h) => (sh ? h.replace('style="position', `style="text-shadow:${sh};position`) : h);
  if (sl.corner) p.push(withShadow(L.textEl(S, { ...sl.corner, id: 'corner' }, W, H)));
  if (sl.page) p.push(withShadow(pageEl(sl.page, sl.swipe_hint, W, H)));
  if (sl.eyebrow) p.push(L.textEl(S, { ...sl.eyebrow, id: 'eyebrow' }, W, H));
  if (sl.eyebrow_bottom) p.push(L.textEl(S, { ...sl.eyebrow_bottom, id: 'eyebrow_bottom' }, W, H));
  if (sl.photo_caption) p.push(L.textEl(S, { ...sl.photo_caption, id: 'photo_caption' }, W, H));
  if (sl.formula) p.push(L.textEl(S, { ...sl.formula, id: 'formula' }, W, H));
  if (sl.result) p.push(L.textEl(S, { ...sl.result, id: 'result' }, W, H));
  if (sl.table) p.push(tableEl(sl.table));
  if (sl.footer) p.push(L.textEl(S, { ...sl.footer, id: 'footer' }, W, H));
  if (sl.text) for (const [i, t] of sl.text.entries()) p.push(L.textEl(S, { ...t, id: `text${i}`, x: opts.textX != null ? opts.textX : t.x }, W, H));
  if (opts.extra) p.push(opts.extra);
  return L.page(W, H, p.join('\n'), bg);
}

// ---------- checks ----------
function checkReport(name, rep, kind) {
  const fails = rep.report.filter((r) => r.kind === 'fit' && !r.ok);
  for (const f of fails) warn(`${name}: AUTOFIT FAILED "${f.text}" lines ${f.lines} > ${f.max} at min ${f.size}px`);
  for (const f of rep.report.filter((r) => r.kind === 'fit' && r.ok && r.size !== r.size0)) console.log(`  ${name}: autofit ${f.id} ${f.size0}->${f.size}px`);
  const fams = new Set(rep.fonts.map((f) => f.split(' ')[0] + ' ' + f.split(' ').slice(1, -1).join(' ')));
  if (rep.report.some((r) => r.kind === 'box') && ![...rep.fonts].some((f) => /Armenian/.test(f))) warn(`${name}: no Armenian font loaded`);
  const sa = kind === 'feed' ? { x0: 72, x1: 1008, y0: 52, y1: 1298 } : kind === 'cover' ? { x0: 120, x1: 960, y0: 250, y1: 1500 } : { x0: 70, x1: 1010, y0: 250, y1: 1500 };
  for (const b of rep.report.filter((r) => r.kind === 'box')) {
    const optical = /^(numeral|quote|num)$/.test(b.id) ? 10 : 1; // big display numerals carry side bearing
    if (b.x0 < sa.x0 - optical || b.x1 > sa.x1 + 1 || b.y0 < sa.y0 - 1 || b.y1 > sa.y1 + 1) warn(`${name}: text "${b.text}" box ${b.x0},${b.y0}-${b.x1},${b.y1} outside safe area ${JSON.stringify(sa)}`);
    if (kind === 'reel' && b.y1 > 1100 && b.x1 > 900) warn(`${name}: text "${b.text}" right of x=900 below y=1100`);
  }
  return fails.length === 0;
}

async function saveStill(r, html, W, H, outPng, kind, q) {
  const rep = await r.render(html, W, H, outPng, false);
  checkReport(path.basename(outPng), rep, kind);
  execFileSync('python3', [path.join(__dirname, 'png2jpg.py'), outPng, outPng.replace(/\.png$/, '.jpg'), String(q)]);
  return rep;
}

// ---------- captions ----------
function writeCaption(id) {
  const c = copy[id]; if (!c) return;
  const dir = path.join(OUT, id); fs.mkdirSync(dir, { recursive: true });
  const txt = [c.caption_hy, c.caption_ru, c.caption_en, (c.hashtags || []).join(' ')].filter(Boolean).join('\n\n') + '\n';
  fs.writeFileSync(path.join(dir, 'caption.txt'), txt);
  if (c.alt_hy) fs.writeFileSync(path.join(dir, 'alt_hy.txt'), c.alt_hy + '\n');
}

// ---------- reels ----------
function parseAnim(s) {
  if (!s || /^none/.test(s) || /persists/.test(s)) return { fade: 0, rise: 0 };
  const f = /fade (\d+)f/.exec(s), r = /rise (\d+)px/.exec(s);
  return { fade: f ? +f[1] : 0, rise: r ? +r[1] : 0 };
}

function reelTextHTML(el, xShift = 0) {
  // single reel element (style text or layer rule), with optional rule_above / label rule
  const W = REEL.W, H = REEL.H; const parts = [];
  if (el.layer === 'rule') return L.ruleEl({ ...el, x: el.x + xShift });
  const st = S[el.style];
  let before = '';
  if (st.rule) before = `<div style="position:absolute;left:0;top:${st.rule.offset_y}px;width:${st.rule.w}px;height:${st.rule.h}px;background:${st.rule.color}"></div>`;
  // soft halo for legibility over bright photo areas (spec shadow only on reel_hook; harmless on solid bg)
  const halo = st.shadow ? '' : 'text-shadow:0 1px 14px rgba(12,13,14,0.7),0 0 3px rgba(12,13,14,0.4);';
  parts.push(L.textEl(S, { ...el, x: el.x + xShift, id: el.style }, W, H, { before }).replace('style="position', `style="${halo}position`));
  if (el.rule_above) parts.push(L.ruleEl({ ...el.rule_above, x: el.rule_above.x + xShift }));
  return parts.join('');
}

async function layerPng(r, name, bodyHtml, dir) {
  const out = path.join(dir, name + '.png');
  const rep = await r.render(L.page(REEL.W, REEL.H, bodyHtml, 'transparent'), REEL.W, REEL.H, out, true);
  checkReport(`${path.basename(dir)}/${name}`, rep, 'reel');
  return out;
}

function sceneTL(item, sc) {
  return {
    n: sc.n, in: sc.in, out: sc.out, background: sc.background || null,
    src: sc.src ? G(sc.src) : null, src_px: sc.src_px || null, motion: sc.motion || null,
    transition_in: sc.transition_in || 'cut', overlays: (sc.overlays || []).map(ov),
  };
}

async function buildReel(r, id, item) {
  const dir = path.join(WORK, id); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const tl = { id, w: REEL.W, h: REEL.H, fps: 30, duration: item.duration, scenes: [], layers: [] };
  const lg = spec.brand.logo.reel;
  for (const g of item.layers_global || []) {
    if (g.layer === 'logo') tl.layers.push({ png: await layerPng(r, 'g_logo', L.logoEl(root, lg), dir), in: g.in, out: g.out, z: 50 });
    if (g.layer === 'frame_rule') tl.layers.push({ png: await layerPng(r, 'g_frame_rule', L.ruleEl({ x: 1010, y: 250, w: 2, h: 1250, color: 'rgba(201,169,106,0.35)' }), dir), in: 0, out: item.duration, z: 1 });
    if (g.layer === 'word_sequence') {
      // runs of identical active word
      const runs = [];
      for (const sc of item.scenes) {
        const ws = sc.words_state; const last = runs[runs.length - 1];
        if (last && last.idx === ws.active_index) last.out = sc.out; else runs.push({ idx: ws.active_index, en: ws.en, in: sc.in, out: sc.out });
      }
      const full = g.lines.map((l) => l.join('')).join(' ').replace(/\s+/g, ' ').trim();
      if (full !== g.full_text_check) warn(`${id}: word_sequence text mismatch "${full}" vs "${g.full_text_check}"`);
      const st = S[g.style];
      for (const [k, run] of runs.entries()) {
        let wi = -1;
        const lines = g.lines.map((line, li) => `<div style="${li ? `margin-top:${g.line_gap}px;` : ''}white-space:nowrap">` + line.map((tok) => {
          if (tok.includes('→')) return L.esc(tok);
          wi += 1;
          return wi === run.idx ? `<span style="color:${st.active_color};text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:10px;text-decoration-color:${st.active_color}">${L.esc(tok)}</span>` : L.esc(tok);
        }).join('') + '</div>').join('');
        const block = `<div class="t" data-id="words" style="text-shadow:0 1px 14px rgba(12,13,14,0.7),0 0 3px rgba(12,13,14,0.4);position:absolute;left:${g.x}px;top:${g.y}px;width:${g.w}px;text-align:${g.align};${L.styleCss(st)}">${lines}</div>`
          + L.textEl(S, { style: g.en_label.style, text: run.en, x: g.en_label.x, y: g.en_label.y, id: 'en' }, REEL.W, REEL.H).replace('style="position', 'style="text-shadow:0 1px 10px rgba(12,13,14,0.7);position');
        const png = await layerPng(r, `g_words_${k}`, block, dir);
        const next = runs[k + 1];
        tl.layers.push({ png, in: run.in, out: next ? next.in + 4 / 30 : item.duration, fade_in: k ? 4 : 0, z: 10 + k });
      }
    }
  }
  // Text zones that a contain_blur foreground photo must not cover (spec P04 s7 put the photo under the
  // word sequence and the CTA). Top: below global word sequence + EN label; bottom: above scene text.
  const ws = (item.layers_global || []).find((g) => g.layer === 'word_sequence');
  const topLimit = ws ? ws.en_label.y + 40 : 0;
  for (const [si, sc] of item.scenes.entries()) {
    const stl = sceneTL(item, sc);
    if (stl.motion && stl.motion.type === 'contain_blur') {
      const fg = stl.motion.foreground;
      const texts = (sc.text || []).map((t) => Math.min(t.y, t.rule_above ? t.rule_above.y : t.y));
      const bottomLimit = texts.length ? Math.min(...texts) - 20 : 1500;
      if (fg.y < topLimit || fg.y + fg.h > bottomLimit) {
        const hMax = bottomLimit - topLimit; const k = Math.min(1, hMax / fg.h);
        const nw = Math.round(fg.w * k), nh = Math.round(fg.h * k);
        const ny = Math.round(topLimit + (hMax - nh) / 2);
        warn(`${id} scene ${sc.n}: contain_blur foreground ${fg.w}x${fg.h}@y${fg.y} overlaps text zones -> ${nw}x${nh}@(${Math.round((1080 - nw) / 2)},${ny}) [layout deviation]`);
        stl.motion = { ...stl.motion, foreground: { ...fg, w: nw, h: nh, x: Math.round((1080 - nw) / 2), y: ny } };
      }
    }
    tl.scenes.push(stl);
    const texts = sc.text || [];
    if (!texts.length) continue;
    const nextTr = (item.scenes[si + 1] || {}).transition_in || '';
    const tr = sc.transition_in || '';
    if (/^text:/.test(tr) || /^text:/.test(nextTr)) {
      // P07B style: all scene elements as one group; in-anim from this scene, out-anim from next scene
      const ain = /in fade (\d+)f(?: \+ rise (\d+)px)?/.exec(tr);
      const aout = /out fade (\d+)f/.exec(nextTr);
      const html = texts.map((t) => reelTextHTML(t)).join('');
      const png = await layerPng(r, `s${sc.n}_group`, html, dir);
      tl.layers.push({ png, in: sc.in, out: sc.out, fade_in: ain ? +ain[1] : 0, rise: ain && ain[2] ? +ain[2] : 0, fade_out: aout ? +aout[1] : 0, z: 20 });
      continue;
    }
    for (const [ti, t] of texts.entries()) {
      const a = parseAnim(t.anim_in), o = parseAnim(t.anim_out);
      const png = await layerPng(r, `s${sc.n}_t${ti}`, reelTextHTML(t), dir);
      tl.layers.push({ png, in: t.in != null ? t.in : sc.in, out: t.out != null ? t.out : sc.out, fade_in: a.fade, rise: a.rise, fade_out: o.fade, z: 20 + ti });
    }
  }
  fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(tl, null, 1));
  // cover
  const cv = item.cover; const cdir = path.join(OUT, id); fs.mkdirSync(cdir, { recursive: true });
  const cpng = path.join(cdir, `${id}_cover.png`);
  if (cv.src) {
    const sl = { src: cv.src, src_px: null, crop: cv.crop, overlays: cv.overlays, text: cv.text.map((t) => ({ ...t, x: 120, w: Math.min(t.w || 840, 840) })) };
    const scn = item.scenes.find((s) => s.src === cv.src); sl.src_px = scn ? scn.src_px : null;
    if (!sl.src_px) { const im = require('child_process').execFileSync('python3', ['-c', `from PIL import Image;print(*Image.open('${path.join(root, cv.src)}').size)`]).toString().trim().split(' ').map(Number); sl.src_px = im; }
    const html = buildStill({}, { ...sl, logo: 'brand.logo.reel' }, REEL.W, REEL.H, { logoX: 120 });
    await saveStill(r, html, REEL.W, REEL.H, cpng, 'cover', 92);
  } else if (/frame at/.test(cv.use || '')) {
    const t = /frame at ([\d.]+) s/.exec(cv.use); const at = +t[1];
    const sc = item.scenes.find((s) => s.in <= at && at < s.out);
    const body = [L.logoEl(root, lg, { x: 120 }), L.ruleEl({ x: 1010, y: 250, w: 2, h: 1250, color: 'rgba(201,169,106,0.35)' })]
      .concat(sc.text.map((el) => reelTextHTML(el.layer === 'rule' ? el : { ...el, w: el.w ? Math.min(el.w, 840) : el.w }, 40))).join('');
    await saveStill(r, L.page(REEL.W, REEL.H, body, sc.background || '#0c0d0e'), REEL.W, REEL.H, cpng, 'cover', 92);
  }
  return tl;
}

// ---------- P07 (needs shoot): overlay templates only ----------
function chunkSubs(text, maxChars, maxLines) {
  // Sentences (end with ։ ? ՞ !) are split independently. Within a sentence a DP picks chunk
  // boundaries: each chunk must fit maxLines x maxChars; penalties for breaking inside «…»,
  // for very short chunks; bonus for breaking after ՝ or ,. Lines inside a chunk are balanced.
  const inQuote = (words) => { const t = words.join(' '); return (t.match(/«/g) || []).length > (t.match(/»/g) || []).length; };
  const splitLines = (words) => {
    const t = words.join(' ');
    if (t.length <= maxChars) return { l: [t], c: 0 };
    if (maxLines < 2) return null;
    let best = null;
    for (let k = 1; k < words.length; k++) {
      const a = words.slice(0, k).join(' '), b = words.slice(k).join(' ');
      if (a.length > maxChars || b.length > maxChars) continue;
      const c = Math.abs(a.length - b.length) * 0.5 + (inQuote(words.slice(0, k)) ? 40 : 0) - (/[՝,]$/.test(words[k - 1]) ? 4 : 0);
      if (!best || c < best.c) best = { l: [a, b], c };
    }
    return best;
  };
  const out = [];
  for (const sen of text.trim().split(/(?<=[։?՞!])\s+/)) {
    const w = sen.split(/\s+/); const n = w.length;
    const dp = Array(n + 1).fill(null); dp[0] = { c: 0, prev: -1, lines: null };
    for (let e = 1; e <= n; e++) for (let b = 0; b < e; b++) {
      if (!dp[b]) continue;
      const seg = w.slice(b, e); const sl = splitLines(seg); if (!sl) continue;
      const len = seg.join(' ').length;
      let c = dp[b].c + 100 + sl.c + (len < 15 ? 30 : 0);
      if (e < n) c += (inQuote(w.slice(0, e)) ? 60 : 0) - (/[՝,]$/.test(w[e - 1]) ? 10 : 0);
      if (!dp[e] || c < dp[e].c) dp[e] = { c, prev: b, lines: sl.l };
    }
    const chunks = []; let e = n;
    if (!dp[n]) throw new Error('cannot chunk subtitle: ' + sen);
    while (e > 0) { chunks.unshift(dp[e].lines); e = dp[e].prev; }
    out.push(...chunks);
  }
  return out;
}

async function buildP07(r, id, item) {
  const dir = path.join(OUT, id, 'templates'); fs.mkdirSync(dir, { recursive: true });
  const files = [];
  const lg = spec.brand.logo.reel;
  // Deviation: P07 titles sit at y=270-300 (spec), which collides with the standard reel logo slot
  // (x70-202, y262-358). Logo moves to the top-right corner of the safe area for P07.
  const lgP07 = { ...lg, x: 1010 - lg.w };
  files.push(await layerPng(r, 'P07_logo', L.logoEl(root, lgP07), dir));
  for (const sg of item.segments) {
    // titles wrap before the top-right logo (x >= 878 - 8 px gap)
    const capW = (e) => ({ ...e, w: Math.min(e.w, lgP07.x - 8 - e.x) });
    const t = sg.title.numeral ? { ...sg.title, text: capW(sg.title.text) } : capW(sg.title); let html = '';
    if (t.numeral) {
      html += L.textEl(S, { ...t.numeral, id: 'num' }, REEL.W, REEL.H) + L.ruleEl(t.rule) + L.textEl(S, { ...t.text, id: 'title' }, REEL.W, REEL.H);
    } else html += L.textEl(S, { ...t, id: 'title' }, REEL.W, REEL.H);
    files.push(await layerPng(r, `P07_seg${sg.n}_title`, html, dir));
    if (sg.cta) {
      files.push(await layerPng(r, `P07_seg${sg.n}_cta`, reelTextHTML(sg.cta), dir));
      files.push(await layerPng(r, `P07_seg${sg.n}_cta_fallback`, reelTextHTML({ ...sg.cta, text: sg.cta.fallback_text }), dir));
    }
  }
  // subtitles
  const sub = item.subtitles; const st = S[sub.style];
  const srt = []; let k = 0;
  const fmt = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  for (const sg of item.segments) {
    // 27 (< spec 30) so Armenian lines at 40-44px stay left of x=900 (IG buttons) while centred
    const chunks = chunkSubs(sg.vo_hy, Math.min(27, st.max_chars_per_line), st.max_lines);
    const rejoined = chunks.map((c) => c.join(' ')).join(' ');
    if (rejoined !== sg.vo_hy.trim().replace(/\s+/g, ' ')) warn(`P07 seg${sg.n}: subtitle chunks do not rejoin to vo_hy`);
    const total = chunks.reduce((a, c) => a + c.join(' ').length, 0); let t0 = sg.in;
    for (const c of chunks) {
      k += 1;
      for (const l of c) if (l.length > st.max_chars_per_line) warn(`P07 subtitle line > ${st.max_chars_per_line} chars: ${l}`);
      const dur = sg.dur * c.join(' ').length / total;
      const lines = c.map((l, i) => `<div style="${i ? 'margin-top:6px;' : ''}"><span class="t" data-id="sub" style="display:inline-block;background:${st.box.color};padding:${st.box.pad_y}px ${st.box.pad_x}px;border-radius:${st.box.radius}px">${L.richText(l)}</span></div>`).join('');
      const html = `<div data-maxright="900" data-min="${st.min_size}" style="position:absolute;left:${sub.box.x}px;width:${sub.box.w}px;bottom:${REEL.H - sub.box.y_bottom}px;text-align:${sub.box.align};${L.styleCss(st)}">${lines}</div>`;
      files.push(await layerPng(r, `P07_sub_${String(k).padStart(2, '0')}`, html, dir));
      srt.push(`${k}\n${fmt(t0)} --> ${fmt(t0 + dur)}\n${c.join('\n')}\n`);
      t0 += dur;
    }
  }
  const srtPath = path.join(dir, 'P07_subtitles_hy_DRAFT_timing.srt');
  fs.writeFileSync(srtPath, srt.join('\n')); files.push(srtPath);
  // cover overlay (to be placed over the chosen A-roll frame)
  const cv = item.cover;
  const body = cv.overlays.map((o) => L.overlayEl(ov(o), REEL.W, REEL.H)).join('') + L.logoEl(root, lg, { x: 120 })
    + cv.text.map((t) => L.textEl(S, { ...t, id: 'hook' }, REEL.W, REEL.H)).join('');
  const covOut = path.join(dir, 'P07_cover_overlay.png');
  const rep = await r.render(L.page(REEL.W, REEL.H, body, 'transparent'), REEL.W, REEL.H, covOut, true);
  checkReport('P07_cover_overlay', rep, 'cover'); files.push(covOut);
  return files;
}

(async () => {
  const r = await new L.Renderer(path.join(WORK, '_html')).open();
  try {
    for (const [id, item] of Object.entries(spec.items)) {
      if (only.length && !only.includes(id)) continue;
      console.log('==', id, item.type, item.asset_status);
      writeCaption(id);
      const dir = path.join(OUT, id); fs.mkdirSync(dir, { recursive: true });
      if (item.type === 'reel' && item.asset_status === 'needs_shoot') { report.items[id] = await buildP07(r, id, item); continue; }
      if (item.type === 'reel') { await buildReel(r, id, item); report.items[id] = 'timeline'; continue; }
      if (item.type === 'carousel') {
        for (const sl of item.slides) {
          const out = path.join(dir, `${id}_${String(sl.n).padStart(2, '0')}.png`);
          const typo = !sl.src;
          await saveStill(r, buildStill(item, sl, FEED.W, FEED.H), FEED.W, FEED.H, out, 'feed', typo ? 95 : 92);
          if (sl.variant_A_after_B5) {
            const v = sl.variant_A_after_B5;
            const sl2 = { ...sl, title: { ...sl.title, text: v.title }, body: { ...sl.body, text: v.body } };
            await saveStill(r, buildStill(item, sl2, FEED.W, FEED.H), FEED.W, FEED.H, path.join(dir, `${id}_${String(sl.n).padStart(2, '0')}_A.png`), 'feed', 95);
          }
        }
        continue;
      }
      if (item.type === 'post') {
        const out = path.join(dir, `${id}.png`);
        await saveStill(r, buildStill(item, item, FEED.W, FEED.H), FEED.W, FEED.H, out, 'feed', item.src || item.photo ? 92 : 95);
      }
    }
  } finally { await r.close(); }
  fs.writeFileSync(path.join(WORK, 'render_report.json'), JSON.stringify(report, null, 1));
  console.log('warnings:', report.warnings.length);
})().catch((e) => { console.error(e); process.exit(1); });
