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
        g=gs[cmap[ord(ch)]]; bp=BoundsPen(gs); g.draw(bp); boxes.append(bp.bounds or (0,0,g.width*0.6,0))
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
BIG="M250 24 L250 54 L81 128 L81 155 L76 155 L76 111 Z"
MID="M250 66 L250 155 L206 155 L206 118 L100 148 L100 155 L95 155 L95 134 Z"
GOLD="M264 66 L352 110 L352 155 L308 155 L308 118 L264 96 Z"
def svg(theme, wordmark=True, tagline=False):
    if theme=='light': ink,txt,m1,m2,rule=('#1e1e1e','#1e1e1e','#a3a3a3','#4f4f4f','#c9a96a')
    elif theme=='dark': ink,txt,m1,m2,rule=('#ffffff','#ffffff','#f2f2f2','#a8a8a8','#c9a96a')
    else: ink,txt,m1,m2,rule=('#1e1e1e','#1e1e1e','#8a8a8a','#6b6b6b','#6b6b6b')
    g1,g2=('#d4b57a','#b8955c') if theme!='mono' else ('#6b6b6b','#6b6b6b')
    if wordmark:
        vb='0 0 425 %d'%(352 if tagline else 310)
        w=f'<path fill="{txt}" d="{garon}"/><rect x="67.5" y="228.8" width="17.9" height="9.6" fill="{txt}"/><path fill="{txt}" d="{cons}"/>'
        if tagline: w+=f'<path fill="{txt}" d="{tag}"/>'
        tf=' transform="translate(0,9.25)"'
    else:
        vb='66 14 296 151'; w=''; tf=''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="GARON Construction">
<defs><linearGradient id="gm{theme}" x1="95" y1="165" x2="250" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{m1}"/><stop offset="1" stop-color="{m2}"/></linearGradient>
<linearGradient id="gg{theme}" x1="264" y1="66" x2="352" y2="177" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{g1}"/><stop offset="1" stop-color="{g2}"/></linearGradient></defs>
<g{tf}><path fill="{ink}" d="{BIG}"/><path fill="url(#gm{theme})" d="{MID}"/><path fill="url(#gg{theme})" d="{GOLD}"/></g><g transform="translate(0,-12.75)">{w}</g></svg>
'''
tag=glyph_paths('montserrat-latin-500-normal.woff2','PEOPLE. PROJECTS. PROGRESS.',10.5,52,373,342,'spread')
os.makedirs('/home/user/Gor-Poghosyan/public/brand',exist_ok=True)
for name,t,wm,tg in [('garon-logo-light.svg','light',True,False),('garon-logo-dark.svg','dark',True,False),('garon-logo-mono.svg','mono',True,False),('garon-logo-light-tagline.svg','light',True,True),('garon-logo-dark-tagline.svg','dark',True,True),('garon-mark-light.svg','light',False,False),('garon-mark-dark.svg','dark',False,False)]:
    open('/home/user/Gor-Poghosyan/public/brand/'+name,'w').write(svg(t,wm,tg))
print('done')
