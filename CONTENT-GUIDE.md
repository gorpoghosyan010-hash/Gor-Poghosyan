# GARON V5 — Content Guide

## Where to edit text and project images

All project content is centralized in:

`content/siteContent.ts`

You can change:
- project title
- project description
- project facts
- intro text
- hero image
- gallery images
- next-project text/link
- project-card titles and descriptions

## How to replace a photo

1. Open `public/projects/<project-folder>/`.
2. Replace the image file with your new image.
3. Keep the same filename if you want the site to update without changing code.
4. If you use a new filename, change the corresponding path in `content/siteContent.ts`.

Example:
`public/projects/pool-01/06.jpeg`

## How to change a text

Open `content/siteContent.ts`, find the project (`pool-01`, `pool-02`, etc.) and edit the text between quotes.

## Important

- Do not change the GARON logo files in `public/brand/` unless intentionally replacing the approved logo.
- Keep Pool 01–05 and House 01 as separate projects.
- Image paths start with `/projects/...` because they are served from the `public` folder.
