// R4 overlays: transparent 1080×1920 PNG layers that compose.py animates (same end card as R2 v2 + corner logo).
// usage: NODE_PATH=$(npm root -g) node overlays.js <repo_root> <out_dir>
// writes ec_logo.png, ec_rule.png, ec_cats.png, ec_horizon.png, ec_url.png, corner_logo.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || 'overlays');
const FONTSRC = path.join(ROOT, 'marketing/instagram/tools/node_modules/@fontsource');
const sets = { montserrat: [400, 500, 600], 'noto-sans-armenian': [400, 500, 600] };
const links = Object.entries(sets).flatMap(([p, ws]) => ws.map((w) => `<link rel="stylesheet" href="file://${FONTSRC}/${p}/${w}.css">`)).join('\n');
const TEXT = "'Montserrat','Noto Sans Armenian',Arial,sans-serif";
const LOGO_L = 'file://' + path.join(ROOT, 'public/brand/garon-logo-light.svg');
// geometry = items.R2.end_card of 2026-11-12-reel-2/04-render-spec.json (v2)
const LAYERS = {
  ec_logo: `<img src="${LOGO_L}" style="position:absolute;left:340px;top:560px;width:400px;height:291.76px">`,
  ec_rule: `<div style="position:absolute;left:508px;top:882px;width:64px;height:2px;background:#856727"></div>`,
  ec_cats: `<div style="position:absolute;left:70px;top:920px;width:940px;text-align:center;white-space:nowrap;font-family:${TEXT};font-weight:500;font-size:24px;letter-spacing:0.22em;text-transform:uppercase;color:#856727"><span style="padding-left:0.22em">Լողավազաններ · Տներ · Վերանորոգում</span></div>`,
  ec_horizon: `<div style="position:absolute;left:0;top:1106px;width:1080px;height:2px;background:#856727"></div>`,
  ec_url: `<div style="position:absolute;left:70px;top:1146px;width:940px;text-align:center;white-space:nowrap;font-family:${TEXT};font-weight:500;font-size:30px;letter-spacing:0.08em;color:#17191c"><span style="padding-left:0.08em">garon.am</span></div>`,
  // small corner logo (same spot/size as R2's corner logo), on a soft paper chip so it reads on concrete and on panels
  corner_logo: `<div style="position:absolute;left:58px;top:250px;width:156px;height:120px;border-radius:14px;background:rgba(245,245,243,0.72);box-shadow:0 6px 24px rgba(0,0,0,0.12)"></div><img src="${LOGO_L}" style="position:absolute;left:70px;top:262px;width:132px;height:96px">`,
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
  fs.rmSync(path.join(OUT, '_ov.html'), { force: true });
  await browser.close();
  console.log('overlays ->', OUT);
})();
