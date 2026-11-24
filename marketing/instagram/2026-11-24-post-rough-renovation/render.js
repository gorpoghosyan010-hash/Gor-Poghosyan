// Single post 1080x1350 — «Սկզբնական վերանորոգում». node render.js
const path=require('path'); const {chromium}=require('playwright');
const {fontLinks}=require('../tools/ig_lib.js');
const D=__dirname, logo='file://'+path.resolve(D,'../../../public/brand/garon-logo-light.svg');
const html=`<!doctype html><html><head><meta charset="utf-8">${fontLinks()}<style>
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px}
#c{position:relative;width:1080px;height:1350px;overflow:hidden;background:#f5f5f3;
 background-image:linear-gradient(rgba(23,25,28,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(23,25,28,.05) 1px,transparent 1px);background-size:54px 54px}
.ph{position:absolute;left:60px;top:60px;width:960px;height:820px;background:url(file://${D}/photo.jpg) center/cover;
 clip-path:polygon(0 90px,50% 0,100% 90px,100% 100%,0 100%)}
.edge{position:absolute;left:60px;top:60px;width:960px;height:90px}
.lab{position:absolute;right:84px;top:178px;background:rgba(245,245,243,.92);color:#856727;font:600 20px 'Montserrat','Noto Sans Armenian';letter-spacing:3px;padding:10px 18px}
.t{position:absolute;left:60px;top:920px;font:500 66px 'Cormorant Garamond','Noto Serif Armenian';color:#17191c;line-height:1.1}
.r{position:absolute;left:62px;top:1010px;width:120px;height:3px;background:#856727}
.s{position:absolute;left:60px;top:1040px;width:900px;font:400 30px 'Montserrat','Noto Sans Armenian';color:#3a3d42;line-height:1.4}
.ft{position:absolute;left:60px;right:60px;bottom:60px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(23,25,28,.18);padding-top:28px}
.ft img{height:88px}.ft div{text-align:right;font:500 22px 'Montserrat','Noto Sans Armenian';color:#17191c;line-height:1.6}
.ft b{color:#856727;font:600 24px 'Montserrat','Noto Sans Armenian'}
</style></head><body><div id="c">
<div class="ph"></div>
<svg class="edge" viewBox="0 0 960 90"><polyline points="0,90 480,0 960,90" fill="none" stroke="#856727" stroke-width="5"/></svg>
<div class="lab">ՍԿԶԲՆԱԿԱՆ ՓՈՒԼ</div>
<div class="t">Սկզբնական վերանորոգում</div><div class="r"></div>
<div class="s">Ճիշտ հիմքը՝ պատեր, հատակ, կոմունիկացիաներ.<br>լավ արդյունքը սկսվում է այստեղից։</div>
<div class="ft"><img src="${logo}"><div>Լողավազաններ · Տներ · Վերանորոգում<br><b>garon.am</b></div></div>
</div></body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
require('fs').writeFileSync(D+'/post.html',html);await p.goto('file://'+D+'/post.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
await p.locator('#c').screenshot({path:D+'/post.png'});await b.close();})();
