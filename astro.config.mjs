// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ackisshomes.com',

  integrations: [
    svelte(),
    partytown({ config: { forward: ["dataLayer.push"] } }),
    sitemap({
      filter: (page) =>
        // Exclude private/internal pages from sitemap
        !page.includes('/deal/') &&
        !page.includes('/leave-a-review') &&
        !page.includes('/referrals') &&
        !page.includes('/ads') &&
        !page.includes('/todo'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  build: {
    inlineStylesheets: 'always',
  },

  adapter: vercel()
});