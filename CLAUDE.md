# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).

## Local Server
- Start the dev server: `export PATH="/c/nvm4w/nodejs:$PATH" && npm run dev -- --port 3001`
- Next.js live site always uses port 3000 — Astro always uses port 3001. Never start Astro on 3000.
- If the server is already running, do not start a second instance.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

# Ackiss Homes — Project Context

## Overview
**Live production site at https://www.ackisshomes.com — Astro 5 + Svelte 5 + Tailwind CSS 4.**
- Replaced the Next.js site (yoship90/ackiss-homes) — Next.js repo is now legacy/archived
- `index, follow` is live — site is indexed by Google and Bing
- Google Search Console and Bing Webmaster Tools verified, sitemaps submitted

## Tech Stack
- Astro 5, Svelte 5 (runes), TypeScript, Tailwind CSS 4
- Deployed on Vercel — `master` branch = production (ackisshomes.com), `dev` branch = preview URL
- GitHub: yoship90/ackiss-homes-astro
- Production URL: https://www.ackisshomes.com
- Node.js v24.x managed by nvm — path is `/c/nvm4w/nodejs`. Use `export PATH="/c/nvm4w/nodejs:$PATH"` before npm/node commands
- GitHub CLI installed at C:/Users/Admin/gh-temp/bin/gh.exe
- Start local dev server: `export PATH="/c/nvm4w/nodejs:$PATH" && npm run dev -- --port 3001`

## Branch & Deploy Workflow
- Work on `dev` branch → auto-deploys to Vercel preview URL
- Merge `dev` → `master` via PR to deploy to production
- Always use a PR — never push directly to master:
```bash
C:/Users/Admin/gh-temp/bin/gh.exe pr create --base master --head dev --title "Deploy: [summary]"
```
- After PR merge: `git fetch origin && git reset --hard origin/master && git checkout -b dev && git push origin dev --force-with-lease`

## Environment Variables
- `FUB_API_KEY` — Follow Up Boss API key. Set in Vercel env vars (all environments) and `.env.local` (gitignored). Never committed to git.
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token, shared with the Next.js project (same blob store). Set in Vercel env vars and `.env.local`.
- `FRED_API_KEY` — FRED API key for mortgage rate chart. Set in `.env.local`.
- `.gitignore` uses `.env*.local` wildcard — all local env files are excluded from git.

## Svelte 5 + Astro Patterns
- Use Svelte 5 runes: `$state`, `$derived`, `$props`, `onMount` — not legacy Svelte 4 syntax
- Interactive components use `client:load` directive in Astro pages
- Static sections (no interactivity needed) use `.astro` components
- Svelte components with `client:load` are SSR'd first, then hydrated on the client
- **IntersectionObserver for scroll reveals**: set up on `window.load` (not DOMContentLoaded) to avoid Svelte hydration conflicts — the observer is in `src/layouts/Base.astro`
- **Svelte `class:` directive limitation**: cannot use Tailwind classes containing colons (e.g. `hover:bg-x`). Use ternary in class attribute string instead.

## Scroll Reveal System
- CSS utility classes in `global.css`: `.sr` (base), `.sr-left`, `.sr-right`, `.sr-up`
- Elements start hidden (`opacity: 0`, translated) and gain `in-view` class when scrolled into view
- Observer set up in `Base.astro` on `window.load`
- Elements already in the viewport on load (e.g. Team section) use CSS `animation` with delay instead of `.sr` classes, to avoid conflicting with the page-reveal entrance
- `motion-safe:` prefix used throughout to respect `prefers-reduced-motion`

## Site Structure (top to bottom)
1. Header — Sticky nav with logo + section links, mobile hamburger menu (`Header.svelte`)
2. Hero — Full-screen with logo watermark, staggered fade-up reveals, parallax, stat counters (`Hero.svelte`)
3. Team — Family photo + bio, CSS slide-in animations on load (`Team.astro`)
4. Services — 3-card grid: Buying, Selling, Consultations (`Services.astro`)
5. Property Inquiry — Lead capture form → pushes to FUB (`PropertyInquiry.svelte`)
6. Mortgage Calculator — Payment calculator with amortization + FRED rate chart (`PaymentCalculator.svelte`)
7. Testimonials — Auto-rotating carousel, touch swipe, dot indicators (`Testimonials.svelte`)
8. Social Feed — Instagram placeholder grid (`SocialFeed.astro`)
9. Contact — Form → pushes to FUB (`Contact.svelte`)
10. Footer — Logo, social links, copyright (`Footer.astro`)
11. /todo — Internal feedback/todo board, password gated, Vercel Blob persistence (`TodoPage.svelte`)
12. /leave-a-review — Google + Zillow review link page (`LeaveAReview.svelte`)

## API Routes (`src/pages/api/`)
- `lead.ts` — POST handler for Contact and PropertyInquiry forms → FUB `/v1/events`
- `todo-feedback.ts` — GET/POST for todo board feedback data → Vercel Blob
- `mortgage-rates.ts` — Fetches historical mortgage rates from FRED API

## OG Image
- Static file: `public/og-image.png` — served at `/og-image.png`, referenced in Base.astro meta tags
- Generation script: `src/pages/og-image-gen.png.ts` — server endpoint using `@vercel/og` + `React.createElement`
- **Workflow to update OG image:**
  1. Edit `src/pages/og-image-gen.png.ts`
  2. Push to `dev` → Vercel preview auto-deploys
  3. Visit `/og-image-gen.png` on the preview URL — right-click → Save image
  4. Replace `public/og-image.png` with the saved file
  5. Commit and PR to master

## Design
- Dark backgrounds (#0a0a0a to #2a2a2a), gold/amber accent (#c9952e)
- Fonts: Playfair Display (headings), Inter (body) — both via `@fontsource`, preloaded in Base.astro
- Page-reveal entrance animation on full page wrapper (scale 0.98→1, 1s)
- Scroll reveal animations on all below-fold sections
- Mobile responsive with hamburger nav

## Key Decisions
- FUB integration: Contact and PropertyInquiry forms push leads via `/api/lead` → FUB `/v1/events`. Tags: `website-lead` + `website-contact` or `website-property-inquiry`
- Shared Vercel Blob store — `/todo` feedback data persists via Vercel Blob
- Google Business Profile live: https://maps.app.goo.gl/FFWGgPPpNy8crVKD9 — added to JSON-LD `sameAs`
- No MLS iframe, no Listings section, no Neighborhoods section (not yet ported from Next.js)

## Future TODO
- **Google Reviews:** Priority — Amanda/Jeremy should send past clients the GBP review link. Zero Google reviews currently despite 64 Zillow reviews.
- **GBP:** Add business hours in GBP dashboard (currently flagged as missing)
- **GBP:** Add team/cover photo to GBP
- **Instagram:** Connect feed via Behold widget in `SocialFeed.astro`
- **Calendly:** Add "Schedule a Free Consultation" booking integration
- **Port remaining sections:** Listings, MLS iframe, Neighborhoods
- **uPlot chart:** Fix x-axis labels (only showing 6 of 7 year labels, no quarter labels)
- **FUB:** Email drip campaigns for cold leads, wire up featured listings API
- **Family photo:** Get portrait-cropped version from Amanda/Jeremy for better mobile optimization
