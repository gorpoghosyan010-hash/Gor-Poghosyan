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
| Phone, email, Instagram, Facebook (empty value = hidden on the site) | `content/siteConfig.ts` |
| All page texts in hy / en / ru | `content/i18n.ts` |
| Projects (texts and photos) | `content/siteContent.ts`, photos in `public/projects/` |
| Page titles and descriptions for search engines | `content/seo.ts` |
| Calculator prices | top of `components/CostCalculator.tsx` |

## Deploy

Import the GitHub repository into Vercel. Optional environment variable
`NEXT_PUBLIC_SITE_URL=https://your-domain` sets the address used in the sitemap, canonical links and social previews.

## Notes

- The contact form opens the visitor's email app with a ready message (no server needed).
  To receive messages directly (email/Telegram), replace the submit handler in `components/ContactForm.tsx`.
- Project photos are WebP; add new photos as `.webp` and register their size in `content/imageSizes.ts`
  (or leave it out: the image will still work, just without a reserved layout size).
