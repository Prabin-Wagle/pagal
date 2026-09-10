/**
 * Cloudflare Pages Functions middleware — wildcard-subdomain guard.
 *
 * Setup (one time, in the Cloudflare dashboard):
 *   1. Pages project → Custom domains → "Set up a custom domain"
 *      → add `www.yourdomain.com` AND `*.yourdomain.com`
 *      (Cloudflare creates the wildcard DNS record + SSL cert for you;
 *      explicit records like `mail` keep working — they beat the wildcard.)
 *   2. Deploy (push to main). This file goes live with the site.
 *
 * What it does:
 *   - apex (yourdomain.com) and allow-listed subdomains → site as normal
 *   - ANY other subdomain (blah.yourdomain.com, /anything) → serves the
 *     funny static 404 (`public/404.html`) with a real 404 status,
 *     keeping the visitor on the URL they typed.
 *
 * Unknown PATHS on the main domain need no code: Pages already serves
 * `/404.html` for those automatically.
 *
 * Optional: set an `ALLOWED_SUBDOMAINS` env var (Pages → Settings →
 * Environment variables), comma-separated, e.g. `www,blog,app`.
 * Defaults to just `www`.
 */

interface PagesContext {
  request: Request;
  env: Record<string, string> & {
    ASSETS: { fetch: (req: Request | string) => Promise<Response> };
  };
  next: () => Promise<Response>;
}

const PREVIEW_SUFFIXES = [".pages.dev", ".workers.dev"];

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  // Local dev, preview deploys → never interfere.
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    PREVIEW_SUFFIXES.some((s) => host.endsWith(s))
  ) {
    return next();
  }

  const parts = host.split(".");
  // "example.com" → no subdomain. "a.b.example.com" → subdomain "a.b".
  const sub = parts.length > 2 ? parts.slice(0, -2).join(".") : "";

  const allowed = String(env.ALLOWED_SUBDOMAINS ?? "www")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Apex + allow-listed subdomains pass through to the portfolio.
  if (sub === "" || allowed.includes(sub)) return next();

  // Unknown subdomain → the funny 404, real 404 status, URL untouched.
  try {
    const page = await env.ASSETS.fetch(new URL("/404.html", url));
    return new Response(page.body, {
      status: 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("404 — lost in the ink.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
