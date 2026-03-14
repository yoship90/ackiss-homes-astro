import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const isProduction = process.env.VERCEL_ENV === "production";

  const content = isProduction
    ? `User-agent: *\nAllow: /\nSitemap: https://www.ackisshomes.com/sitemap-index.xml`
    : `User-agent: *\nDisallow: /`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
};
