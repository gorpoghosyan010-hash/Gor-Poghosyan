from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import os
FD='/home/user/Gor-Poghosyan/marketing/instagram/tools/node_modules/@fontsource/montserrat/files/'
def glyph_paths(font, text, cap_px, x0, x1, baseline, mode, runs=None):
    f=TTFont(FD+font); gs=f.getGlyphSet(); cmap=f.getBestCmap()
    capH=f['OS/2'].sCapHeight; s=cap_px/capH
    out=[]; boxes=[]
    for ch in text:
        g=gs[cmap[ord(ch)]]; bp=BoundsPen(gs); g.draw(bp); boxes.append(bp.bounds)
    if mode=='runs':
        for ch,(a,b),bb in zip(text,runs,boxes):
            w=(bb[2]-bb[0])*s; cx=(a+b+1)/2; ox=cx-w/2-bb[0]*s
            out.append((ch,ox))
    else:
        widths=[(bb[2]-bb[0])*s for bb in boxes]; gap=(x1-x0-sum(widths))/(len(text)-1); x=x0
        for ch,bb,w in zip(text,boxes,widths):
            out.append((ch,x-bb[0]*s)); x+=w+gap
    d=[]
    for (ch,ox) in out:
        g=gs[cmap[ord(ch)]]; pen=SVGPathPen(gs)
        g.draw(TransformPen(pen,(s,0,0,-s,ox,baseline))); d.append(pen.getCommands())
    return ' '.join(d)
garon=glyph_paths('montserrat-latin-700-normal.woff2','GARON',55.5,0,0,257.5,'runs',[(30, 88), (103, 168), (184, 237), (251, 315), (334, 391)])
cons=glyph_paths('montserrat-latin-500-normal.woff2','CONSTRUCTION',12.5,39,379,289.5,'spread')
BIG="M250 24 L250 54 L88 135 L88 177 L76 177 L76 111 Z"
MID="M250 66 L250 177 L206 177 L206 118 L112 165 L112 177 L100 177 L100 141 Z"
GOLD="M264 66 L352 110 L352 177 L308 177 L308 118 L264 96 Z"
def svg(theme, wordmark=True):
    ink,txt,m1,m2 = ('#1d2124','#1d2124','#9a9a9b','#2f3235') if theme=='light' else ('#ffffff','#ffffff','#ffffff','#cfd1d3')
    vb='0 0 425 310' if wordmark else '70 16 288 168'
    w = f'<path fill="{txt}" d="{garon}"/><path fill="{txt}" d="{cons}"/>' if wordmark else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="GARON Construction">
<defs><linearGradient id="gm{theme}" x1="100" y1="160" x2="250" y2="110" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{m1}"/><stop offset="1" stop-color="{m2}"/></linearGradient>
<linearGradient id="gg{theme}" x1="264" y1="66" x2="352" y2="177" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c8a677"/><stop offset="1" stop-color="#ad895d"/></linearGradient></defs>
<path fill="{ink}" d="{BIG}"/><path fill="url(#gm{theme})" d="{MID}"/><path fill="url(#gg{theme})" d="{GOLD}"/>{w}</svg>
'''
os.makedirs('/home/user/Gor-Poghosyan/public/brand',exist_ok=True)
for name,t,wm in [('garon-logo-light.svg','light',True),('garon-logo-dark.svg','dark',True),('garon-mark-light.svg','light',False),('garon-mark-dark.svg','dark',False)]:
    open('/home/user/Gor-Poghosyan/public/brand/'+name,'w').write(svg(t,wm))
print('done')
