# GARON — Visual Concept

## Idea: "Line → Reality"

Every building GARON delivers starts as a line on paper. The whole site tells that story:
**a bronze architectural line drawing becomes the real, built place.**

The drawings are not decoration. They are made from the actual photographs (edge extraction), so each line sits
exactly on the building it becomes. When a drawing turns into a photograph, it lands in the same spot, with no visible jump.

The same idea runs through every interaction:
- **Loader:** the GARON mark is drawn in bronze line work, then the page opens like a sheet being lifted.
- **Hero:** the villa photograph sits under a thin architectural grid, with survey coordinates of Yerevan.
  On scroll the photo recedes (parallax + inset "frame") and the giant wordmark compresses.
- **Services:** four scenes, each a different transformation:
  drawing → building (Architecture), structural lines → finished district (Engineering),
  land → foundation → structure → facade → home (Construction, GARON's real house photos),
  bare concrete → finished interior (Renovation).
- **Renovation projects:** an interactive BEFORE → CONSTRUCTION → AFTER scrubber.
- **Process:** a single bronze line that draws itself down the page, lighting each of the six stages.

## Visual identity

| Token | Value | Use |
|---|---|---|
| Ink | `#0B0A09` | page background (warm near-black, not blue-black) |
| Graphite | `#141311` | raised surfaces |
| Stone | `#E9E3D8` | primary text |
| Sand | `#9C9486` | secondary text |
| Bronze | `#C29B62` | lines, numbers, focus, the one accent |
| Hairline | `rgba(233,227,216,.12)` | 1px rules, grid |

- **Display:** Cormorant Garamond (Latin / Cyrillic) + Noto Serif Armenian, light weights at very large sizes,
  in the spirit of an architecture magazine.
- **Text:** Manrope + Noto Sans Armenian.
- **Annotations:** IBM Plex Mono, small caps-style labels, like the dimension notes on a drawing.
- **Layout:** a 12-column editorial grid with deliberately empty columns, hairline rules instead of cards,
  and oversized numerals (01–06) as structure.
- **Glass:** used only for the header on scroll and the hero coordinate plate.
- **Motion:** slow and weighted (`cubic-bezier(.16,1,.3,1)`, 0.9–1.4 s). Scroll-linked motion goes to the story
  moments; everything else just reveals once. `prefers-reduced-motion` turns off scrubbing and parallax.

## Page structure

```
/                    Loader → Hero (parallax) → Manifesto (word reveal) + figures
                     → "Line → Reality" signature scene (pinned) → Projects rail (horizontal, pinned)
                     → Services index (hover image) → Process strip → Closing CTA
/projects            Title → category index 01–04 → vertical storytelling list (alternating, large images)
/projects/[slug]     Full-screen image → facts → chapters (Concept, Architecture, Materials, Construction,
                     Interior, Final result: only the ones that apply) → before/after (renovation) → gallery → next
/services            Intro → Architecture → Engineering → Construction → Renovation → Pools → CTA
/about               Short statement, 25+ years, pools origin, four values, figures
/process             Six-stage animated timeline
/contact             Form + direct buttons (phone, email, Instagram, Facebook) + dark map of Yerevan
```

Languages: Armenian (default, no prefix: `/projects`), English (`/en/projects`), Russian (`/ru/projects`),
with hreflang alternates and a sitemap covering all three.

## Honest-content rules

- Houses and pools are GARON's own photographs.
- The renovation and architecture/engineering "projects" use visualisations the client supplied. They are labelled
  as concepts until real projects replace them.
- Phone, Instagram and Facebook live in `content/site.ts` and are hidden until filled in.
- Exact project locations are not known yet, so they show "Armenia" (`content/projects.ts`).
