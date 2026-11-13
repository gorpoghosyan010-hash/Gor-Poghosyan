// R5 overlays: transparent 1080x1920 PNG layers for compose (corner logo + top-right labels, same fonts as R2/R4).
// usage: NODE_PATH=$(npm root -g) node overlays.js <repo_root> <out_dir>
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || 'overlays');
const FONTSRC = path.join(ROOT, 'marketing/instagram/tools/node_modules/@fontsource');
const sets = { montserrat: [500], 'noto-sans-armenian': [500], 'cormorant-garamond': [500], 'noto-serif-armenian': [500] };
const links = Object.entries(sets).flatMap(([p, ws]) => ws.map((w) => `<link rel="stylesheet" href="file://${FONTSRC}/${p}/${w}.css">`)).join('\n');
const TEXT = "'Montserrat','Noto Sans Armenian',Arial,sans-serif";
const DISPLAY = "'Cormorant Garamond','Noto Serif Armenian',Georgia,serif";
const LOGO_L = 'file://' + path.join(ROOT, 'public/brand/garon-logo-light.svg');
// chip behind the labels (right side) mirrors the corner-logo chip (left side) so both read on sky, concrete and night
const chipR = `<div style="position:absolute;left:806px;top:250px;width:216px;height:120px;border-radius:14px;background:rgba(245,245,243,0.74);box-shadow:0 6px 24px rgba(0,0,0,0.12)"></div>`;
const section = (t) => `<div style="position:absolute;left:240px;top:277px;width:770px;text-align:right;font-family:${TEXT};font-weight:500;font-size:18px;line-height:1.2;letter-spacing:0.24em;text-transform:uppercase;color:rgba(23,25,28,0.62)"><span style="margin-right:-0.24em">${t}</span></div>`;
const stage = (t) => `<div style="position:absolute;left:240px;top:305px;width:770px;text-align:right;font-family:${DISPLAY};font-weight:500;font-size:40px;line-height:1.1;color:#856727">${t}</div>`;
const LAYERS = {
  corner_logo: `<div style="position:absolute;left:58px;top:250px;width:156px;height:120px;border-radius:14px;background:rgba(245,245,243,0.74);box-shadow:0 6px 24px rgba(0,0,0,0.12)"></div><img src="${LOGO_L}" style="position:absolute;left:70px;top:262px;width:132px;height:96px">`,
  chip: chipR,
  section: section('Տուն'),
  stage_1: stage('Սկիզբ'),
  stage_2: stage('Ընթացք'),
  stage_3: stage('Արդյունք'),
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const [name, body] of Object.entries(LAYERS)) {
    const tmp = path.join(OUT, '_ov.html');
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8">${links}<style>html,body{margin:0;width:1080px;height:1920px;background:transparent;-webkit-font-smoothing:antialiased}</style></head><body>${body}</body></html>`);
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => { for (const i of document.images) await i.decode(); });
    await page.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true });
  }
  const fams = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
  console.log('fonts', [...new Set(fams)].join(','));
  fs.rmSync(path.join(OUT, '_ov.html'), { force: true });
  await browser.close();
  console.log('overlays ->', OUT);
})();
