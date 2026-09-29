# GARON — Construction & Architecture (v2)

Նոր, առանձին կայք՝ Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP (ScrollTrigger) · Framer Motion։
Վիզուալ կոնցեպտը՝ [CONCEPT.md](CONCEPT.md)։

## Գործարկում

```bash
npm install
npm run dev      # http://localhost:4000
npm run build    # production build (բոլոր 48 էջերը ստատիկ են)
```

Deploy-ի համար (Vercel): import արեք repo-ն, **Root Directory = `new-site`**, և նշեք
`NEXT_PUBLIC_SITE_URL` (օր.՝ `https://garon.am`), որ canonical/hreflang/sitemap հղումները ճիշտ լինեն։

## Որտեղ փոխել բովանդակությունը

| Ինչ | Ֆայլ |
|---|---|
| Բոլոր տեքստերը (հայ / eng / рус) | `content/dictionaries/hy.ts`, `en.ts`, `ru.ts` |
| Նախագծեր (տեքստ, նկարներ, գլուխներ) | `content/projects.ts` |
| Ծառայությունների նկարներ և փուլերի լուսանկարներ | `content/services.ts` |
| Հեռախոս, Instagram, Facebook, email, քարտեզ | `content/site.ts` (դատարկ դաշտը թաքցնում է կոճակը) |
| Նկարներ / տեսանյութեր | `public/media/...` |

## Լեզուներ և URL-ներ

- Հայերեն՝ առանց prefix-ի (`/projects`), անգլերեն՝ `/en/...`, ռուսերեն՝ `/ru/...`։
- `/hy/...` հասցեները 308-ով ուղղորդվում են մաքուր հասցեին (`proxy.ts`)։
- Յուրաքանչյուր էջ ունի canonical + hreflang, `sitemap.xml`-ում կան բոլոր 3 լեզուները։

## «Գիծ → Իրականություն» գծագրերը

`public/media/lines/*.webp` գծագրերը ստացվել են հենց լուսանկարներից (edge detection), որպեսզի գծերն
իդեալական համընկնեն շենքի հետ։ Նկարը փոխելիս նորից ստեղծեք գծագիրը (ffmpeg).

```bash
ffmpeg -i photo.webp -filter_complex "[0]split[a][b];[a]format=gray,gblur=sigma=2.2,edgedetect=mode=canny:low=0.12:high=0.3,gblur=sigma=0.6,lut=y='min(val*2.2,255)',format=gray[e];[b]drawbox=x=0:y=0:w=iw:h=ih:color=0xD9C4A0:t=fill,format=rgb24[c];[c][e]alphamerge,format=yuva420p" -c:v libwebp -quality 90 photo-lines.webp
```

Եթե գծերը շատ են (խոտ, ծառեր), մեծացրեք `sigma`-ն և `low/high` շեմերը։

## Կառուցվածք

```
app/[locale]/            էջեր (layout, template = էջերի անցում, page, projects, services, about, process, contact)
components/layout/       Header, Footer, Loader, Cursor, LanguageSwitcher
components/ui/           SplitReveal, Reveal, ScrubText, ParallaxImage, LineToPhoto, DragStrip, ...
components/home/         Hero, ProjectsRail (հորիզոնական), ServicesIndex, ProcessStrip, ClosingCta
components/projects/     ProjectStory, ProjectHero, ProjectChapter, BeforeAfter, NextProject
components/services/     Scenes (Architecture / Engineering / Sequence / Renovation), useScene
components/process/      Timeline, StageIcon
components/drawings/     SVG գծագրեր (VillaElevation, StructuralGrid)
```

Բոլոր անիմացիաները անջատվում են, երբ համակարգում միացված է `prefers-reduced-motion`։
