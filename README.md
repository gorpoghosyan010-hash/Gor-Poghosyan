# GARON Construction

Multi-page website (Next.js 14, App Router) in Armenian, English and Russian:
Home, About, Services (pools, residential, renovation, public buildings), Projects, Cost calculator, Contact.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Where to edit

| What | File |
| --- | --- |
| Phone, WhatsApp, Viber, Telegram, address, email, Instagram, Facebook (empty value = hidden on the site) | `content/siteConfig.ts` |
| All page texts in hy / en / ru | `content/i18n.ts` |
| Projects (one JSON file per project) | `content/projects/<slug>.json`, photos in `public/projects/<slug>/` — or the admin panel at `/admin` (see `CONTENT-GUIDE.md`) |
| Page titles and descriptions for search engines | `content/seo.ts` |
| Calculator prices | top of `components/CostCalculator.tsx` |

## Deploy

Vercel imports the GitHub repository and deploys the `main` branch automatically on every push
(also on every «Publish» in the admin panel, because the CMS commits to `main`).
Optional `NEXT_PUBLIC_SITE_URL=https://your-domain` sets the address used in the sitemap, canonical links and social previews.

### Contact form → Telegram / email (environment variables)

**Հայերեն.** Կապի ձևի հայտերը ուղարկվում են `app/api/lead` հասցեով։ Vercel → Project → Settings →
Environment Variables բաժնում լրացրեք ստորև փոփոխականները (Production), ապա Redeploy։
Կարելի է միացնել միայն Telegram-ը, միայն email-ը կամ երկուսը։ Եթե ոչինչ լրացված չէ, ձևը, ինչպես նախկինում,
բացում է այցելուի էլ. փոստի ծրագիրը (mailto)։
- Telegram. @BotFather-ում ստեղծեք bot (`/newbot`) → token-ը դրեք `TELEGRAM_BOT_TOKEN`։
  Գրեք ձեր bot-ին ցանկացած հաղորդագրություն (կամ ավելացրեք այն խմբում), բացեք
  `https://api.telegram.org/bot<TOKEN>/getUpdates` և `chat.id`-ն դրեք `TELEGRAM_CHAT_ID`։
- Email (Resend, անվճար սահմանաչափով). resend.com-ում ստեղծեք API key → `RESEND_API_KEY`,
  ստացողը → `LEADS_EMAIL` (մի քանիսը՝ ստորակետով)։ Ուղարկողը → `LEADS_FROM`
  (օր.՝ `GARON <site@garon.am>`, պահանջում է garon.am դոմենի հաստատում Resend-ում. մինչ այդ
  `onboarding@resend.dev`-ը նամակ է ուղարկում միայն Resend հաշվի սեփականատիրոջ email-ին)։

**English.** Leads from the contact form go to `app/api/lead` (Node runtime: validation, honeypot,
in-memory rate limit of 5 requests / 10 min per IP). Set in Vercel → Settings → Environment Variables, then redeploy:

| Variable | Required | Meaning |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | for Telegram | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | for Telegram | Chat/group id that receives the leads |
| `RESEND_API_KEY` | for email | Resend API key |
| `LEADS_EMAIL` | for email | Recipient(s), comma-separated |
| `LEADS_FROM` | optional | Sender, e.g. `GARON <site@garon.am>` (domain must be verified in Resend); default `onboarding@resend.dev` |

Whichever channel is configured is used; with none configured the API answers `503 {fallback:"mailto"}`
and the form falls back to opening the visitor's email app.

## Admin panel (`/admin`)

Sveltia CMS (git-based, free, no server) is served from `public/admin/` (`index.html` + `config.yml`; version pinned).
It edits `content/projects/*.json` and uploads photos to `public/projects/<slug>/` (converted to WebP, max 2000px)
by committing to the **`main`** branch of `gorpoghosyan010-hash/gor-poghosyan` — so these files must be merged into
`main` before the panel works. Sign-in: GitHub fine-grained personal access token (Contents: read & write, this repo only).
Owner guide: `CONTENT-GUIDE.md`.

## Notes

- Projects are validated at build time (`content/projects.ts`): a broken file (missing photo, wrong category …) fails the
  build with a clear message and Vercel keeps the previous version online.
- Image sizes are read from the files automatically; `content/imageSizes.ts` is only an optional override.
