// Shared helpers for Instagram batch rendering (HTML + headless Chromium via Playwright).
// Fonts: @fontsource packages installed in marketing/instagram/tools/node_modules (gitignored):
//   npm i --prefix marketing/instagram/tools --no-save @fontsource/noto-sans-armenian \
//       @fontsource/noto-serif-armenian @fontsource/cormorant-garamond @fontsource/montserrat
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const FONTSRC = process.env.IG_FONTSOURCE || path.join(__dirname, 'node_modules', '@fontsource');
const FONT_SETS = {
  'montserrat': [400, 500, 600],
  'noto-sans-armenian': [400, 500, 600],
  'cormorant-garamond': [300, 400, 500],
  'noto-serif-armenian': [300, 400, 500],
};
const STACK = {
  display: "'Cormorant Garamond','Noto Serif Armenian',Georgia,serif",
  text: "'Montserrat','Noto Sans Armenian',Arial,sans-serif",
};

function fontLinks() {
  const out = [];
  for (const [pkg, ws] of Object.entries(FONT_SETS)) {
    for (const w of ws) {
      const f = path.join(FONTSRC, pkg, `${w}.css`);
      if (!fs.existsSync(f)) throw new Error(`font css missing: ${f} (install @fontsource/${pkg})`);
      out.push(`<link rel="stylesheet" href="file://${f}">`);
    }
  }
  return out.join('\n');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Draft placeholders like [ԱԱՀ՝ ճշտել] are rendered red (#ff4d4d) — never publishable.
const PLACEHOLDER_RE = /\[[^\]]*ճշտել\]/g;
function hasPlaceholder(s) { return typeof s === 'string' && /\[[^\]]*ճշտել\]/.test(s); }

function richText(text, opt = {}) {
  let h = esc(text);
  if (opt.break_after) {
    const b = esc(opt.break_after);
    if (!h.includes(b)) throw new Error(`break_after not found: ${opt.break_after} in ${text}`);
    h = h.replace(b + ' ', b + '<br>');
    if (!h.includes('<br>')) h = h.replace(b, b + '<br>');
  }
  // typographic: keep short numbers with the following word (no orphaned "4" / "7" at line end)
  h = h.replace(/(^|[\s>])(\d{1,3}) (?=[^\s<])/g, '$1$2\u00a0');
  // never break inside hyphenated mixed words like "direct-ում"
  h = h.replace(/([^\s<>]+-[^\s<>]+)/g, '<span style="white-space:nowrap">$1</span>');
  h = h.replace(PLACEHOLDER_RE, (m) => `<span class="ph">${m}</span>`);
  return h;
}

function rgba(hex, a) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// CSS for a spec style + per-element overrides.
function styleCss(st, el = {}) {
  const size = el.size_override || st.size;
  const css = [
    `font-family:${STACK[st.font]}`,
    `font-weight:${st.weight}`,
    `font-size:${size}px`,
    `line-height:${st.line_height || 1.3}`,
    `color:${el.color_override || st.color}`,
    'font-feature-settings:normal',
    '-webkit-font-smoothing:antialiased',
  ];
  // Cormorant's default old-style "1" reads as a Roman "I" (e.g. "12.6" -> "I2.6"): use lining figures.
  if (st.font === 'display') css.push('font-variant-numeric:lining-nums');
  if (st.letter_spacing) css.push(`letter-spacing:${st.letter_spacing}`);
  if (st.transform) css.push(`text-transform:${st.transform}`);
  const shadow = el.shadow_override || el.text_shadow || st.shadow;
  if (shadow) css.push(`text-shadow:${shadow}`);
  const op = el.opacity != null ? el.opacity : st.opacity;
  if (op != null) css.push(`opacity:${op}`);
  // style.box: text on a padded rounded plate; (x,y) is the plate's outer corner per anchor
  if (st.box) css.push(`background:${st.box.color}`, `padding:${st.box.pad_y}px ${st.box.pad_x}px`, `border-radius:${st.box.radius}px`);
  return css.join(';');
}

function fitAttrs(st, el) {
  if (!st.max_lines) return '';
  const size = el.size_override || st.size;
  const min = el.min_size_override != null ? el.min_size_override
    : el.size_override ? Math.min(el.size_override, st.min_size || size) : (st.min_size || size);
  // explicit break_after => exactly 2 rendered lines (spec: "Render as 2 lines"); autofit shrinks to get there
  const maxl = el.break_after ? 2 : (el.max_lines || st.max_lines);
  return ` data-maxl="${maxl}" data-min="${min}"`;
}

// Absolute-positioned text element. Supports anchor: top (default) | bottom | top-right | bottom-right.
// `inner` lets callers inject extra absolutely-positioned children (e.g. label rules).
function textEl(styles, el, W, H, extra = {}) {
  const st = styles[el.style];
  if (!st) throw new Error('unknown style ' + el.style);
  const pos = ['position:absolute'];
  const anchor = el.anchor || 'top';
  const y = el.y_bottom != null ? el.y_bottom : el.y;
  if (anchor === 'top') pos.push(`left:${el.x}px`, `top:${y}px`);
  else if (anchor === 'bottom') pos.push(`left:${el.x}px`, `bottom:${H - y}px`);
  else if (anchor === 'top-right') pos.push(`right:${W - el.x}px`, `top:${y}px`, 'text-align:right');
  else if (anchor === 'bottom-right') pos.push(`right:${W - el.x}px`, `bottom:${H - y}px`, 'text-align:right');
  if (el.w) pos.push(`width:${el.w}px`); else pos.push('white-space:nowrap');
  if (el.align && anchor.indexOf('right') < 0) pos.push(`text-align:${el.align}`);
  const id = el.id || el.style;
  return `<div class="t" data-id="${esc(id)}"${fitAttrs(st, el)} style="${pos.join(';')};${styleCss(st, el)}${el.extra_css ? ';' + el.extra_css : ''}">${extra.before || ''}${el.html || richText(el.text, el)}${extra.after || ''}</div>`;
}

// Flow (static) text block for stacks / chained layouts.
function flowEl(styles, el, extraCss = '') {
  const st = styles[el.style];
  if (!st) throw new Error('unknown style ' + el.style);
  const css = [];
  if (el.w) css.push(`width:${el.w}px`); else css.push('white-space:nowrap');
  if (el.align) css.push(`text-align:${el.align}`);
  const id = el.id || el.style;
  return `<div class="t" data-id="${esc(id)}"${fitAttrs(st, el)} style="${css.join(';')};${styleCss(st, el)};${extraCss}${el.extra_css ? ';' + el.extra_css : ''}">${el.html || richText(el.text, el)}</div>`;
}

function ruleEl(r, extra = '') {
  return `<div style="position:absolute;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;background:${r.color};${extra}"></div>`;
}

function overlayEl(ov, W, H) {
  if (ov.type === 'solid') return `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:${rgba(ov.color, ov.alpha)}"></div>`;
  if (ov.type === 'linear') {
    return `<div style="position:absolute;left:0;top:${ov.y0}px;width:${W}px;height:${ov.y1 - ov.y0}px;background:linear-gradient(to bottom,${rgba(ov.color, ov.alpha0)},${rgba(ov.color, ov.alpha1)})"></div>`;
  }
  if (ov.type === 'linear_stops') {
    // vertical gradient, alpha linear between [y_px, alpha] stops, constant outside them
    const st = ov.stops.map(([y, a]) => `${rgba(ov.color, a)} ${y}px`).join(',');
    return `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:linear-gradient(to bottom,${st})"></div>`;
  }
  if (ov.type === 'radial') {
    return `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:radial-gradient(circle ${ov.r}px at ${ov.cx}px ${ov.cy}px,${rgba(ov.color, ov.alpha0)},${rgba(ov.color, ov.alpha1)})"></div>`;
  }
  throw new Error('unknown overlay ' + JSON.stringify(ov));
}

// Photo placed so that the source crop rect {x,y,w,h} (fractions) fills box {x,y,w,h} (px). Never stretched:
// uniform scale from the crop height, centred horizontally on the crop centre.
function photoEl(file, srcPx, crop, box, extraCss = '') {
  const [sw, sh] = srcPx;
  const cw = crop.w * sw, ch = crop.h * sh;
  const scale = Math.max(box.w / cw, box.h / ch);
  const iw = sw * scale, ih = sh * scale;
  const cx = (crop.x + crop.w / 2) * sw * scale, cy = (crop.y + crop.h / 2) * sh * scale;
  const left = box.w / 2 - cx, top = box.h / 2 - cy;
  return `<div style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;overflow:hidden;${extraCss}"><img src="file://${file}" style="position:absolute;left:${left.toFixed(3)}px;top:${top.toFixed(3)}px;width:${iw.toFixed(3)}px;height:${ih.toFixed(3)}px"></div>`;
}

function logoEl(root, lg, extra = {}) {
  const x = extra.x != null ? extra.x : lg.x;
  return `<img src="file://${path.join(root, lg.file)}" style="position:absolute;left:${x}px;top:${lg.y}px;width:${lg.w}px;height:${lg.h}px;opacity:${lg.opacity != null ? lg.opacity : 0.92}">`;
}

const FIT_SCRIPT = `<script>
window.__doFit = () => {
  const rep = [];
  document.querySelectorAll('[data-maxl]').forEach(el => {
    const max = +el.dataset.maxl, min = +(el.dataset.min || 0);
    const cs = () => getComputedStyle(el);
    let size = parseFloat(cs().fontSize); const size0 = size;
    const lines = () => Math.round((el.getBoundingClientRect().height - parseFloat(cs().paddingTop) - parseFloat(cs().paddingBottom)) / parseFloat(cs().lineHeight));
    while (lines() > max && size - 2 >= min) { size -= 2; el.style.fontSize = size + 'px'; }
    rep.push({ kind: 'fit', id: el.dataset.id, text: el.innerText.slice(0, 50), size0, size, lines: lines(), max, ok: lines() <= max });
  });
  // data-maxright: shrink (2px steps, down to data-min) until every .t inside stays left of maxright
  document.querySelectorAll('[data-maxright]').forEach(el => {
    const mr = +el.dataset.maxright, min = +(el.dataset.min || 0);
    let size = parseFloat(getComputedStyle(el).fontSize); const size0 = size;
    const right = () => Math.max(...[...el.querySelectorAll('.t')].map(e => e.getBoundingClientRect().right));
    while (right() > mr && size - 2 >= min) { size -= 2; el.style.fontSize = size + 'px'; }
    rep.push({ kind: 'fit', id: 'maxright', text: el.innerText.slice(0, 50), size0, size, lines: 0, max: 0, ok: right() <= mr });
  });
  document.querySelectorAll('.t').forEach(el => {
    const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect();
    rep.push({ kind: 'box', id: el.dataset.id, text: el.innerText.slice(0, 50), x0: Math.round(b.left), y0: Math.round(b.top), x1: Math.round(b.right), y1: Math.round(b.bottom) });
  });
  window.__report = rep;
};
</script>`;

function page(W, H, body, bg = 'transparent') {
  return `<!doctype html><html><head><meta charset="utf-8">${fontLinks()}
<style>html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:${bg}}
#c{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.ph{color:#ff4d4d}</style></head><body><div id="c">${body}</div>${FIT_SCRIPT}</body></html>`;
}

class Renderer {
  constructor(workdir) { this.workdir = workdir; fs.mkdirSync(workdir, { recursive: true }); this.n = 0; }
  async open() { this.browser = await chromium.launch(); return this; }
  async close() { if (this.browser) await this.browser.close(); }
  async render(html, W, H, out, transparent = false) {
    const f = path.join(this.workdir, `r${String(++this.n).padStart(4, '0')}_${path.basename(out)}.html`);
    fs.writeFileSync(f, html);
    const p = await this.browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await p.goto('file://' + f, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => window.__doFit());
    await p.evaluate(() => document.fonts.ready);
    const report = await p.evaluate(() => window.__report);
    // verify Armenian/Latin fonts actually loaded (no silent fallback)
    const fonts = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.screenshot({ path: out, omitBackground: transparent, clip: { x: 0, y: 0, width: W, height: H } });
    await p.close();
    return { out, report, fonts };
  }
}

module.exports = { fontLinks, esc, richText, rgba, styleCss, textEl, flowEl, ruleEl, overlayEl, photoEl, logoEl, page, Renderer, hasPlaceholder, STACK };
