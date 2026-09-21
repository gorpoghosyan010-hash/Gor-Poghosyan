# GARON — Content Guide

## Where to edit text and project images

- Page texts (Armenian / English / Russian): `content/i18n.ts`
- Projects: `content/siteContent.ts` (title, description, facts, intro, hero image, gallery, next-project link)
- Contact details: `content/siteConfig.ts` (leave a value empty to hide it)
- Search-engine titles/descriptions: `content/seo.ts`

## How to replace a photo

1. Open `public/projects/<project-folder>/`.
2. Put your new photo there as **.webp** (max ~1920px wide, quality ~80) with the same filename to update the site without changing code.
3. If you use a new filename, change the path in `content/siteContent.ts`.

Example: `public/projects/pool-01/06.webp`

## Important

- Do not change the GARON logo files in `public/brand/` unless intentionally replacing the approved logo.
- Keep Pool 01–05 and House 01 as separate projects.
- Image paths start with `/projects/...` because they are served from the `public` folder.
