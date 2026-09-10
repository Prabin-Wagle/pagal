/**
 * Cloudflare Pages Functions middleware — wildcard-subdomain guard.
 *
 * Setup (one time, in the Cloudflare dashboard):
 *   1. Pages project → Custom domains → "Set up a custom domain"
 *      → add `www.prabinwagle.com.np` AND `*.prabinwagle.com.np`
 *      (Cloudflare creates the wildcard DNS record + SSL cert for you;
 *      explicit records like `mail` keep working — they beat the wildcard.)
 *   2. Deploy (push to main). This file goes live with the site.
 *
 * What it does:
 *   - apex (prabinwagle.com.np) and allow-listed subdomains → site as normal
 *   - ANY other subdomain (blah.prabinwagle.com.np, /anything) → serves the
 *     funny static 404 (`public/404.html`) with a real 404 status,
 *     keeping the visitor on the URL they typed.
 *
 * Unknown PATHS on the main domain need no code: Pages already serves
 * `/404.html` for those automatically.
 *
 * NOTE on extraction: the zone is stripped by name, NOT by counting dots.
 * Dot-counting assumes a one-part TLD (`.com`) and breaks on `.com.np` —
 * `prabinwagle.com.np` would misread as subdomain `"prabinwagle"` and 404
 * the whole site. If the domain ever changes, update ZONE below (or set a
 * `ZONE` env var in Pages → Settings → Environment variables).
 *
 * Optional allow-list: set an `ALLOWED_SUBDOMAINS` env var, comma-separated,
 * e.g. `www,blog,app`. Defaults to just `www`.
 */

interface PagesContext {
  request: Request;
  env: Record<string, string> & {
    ASSETS: { fetch: (req: Request | string) => Promise<Response> };
  };
  next: () => Promise<Response>;
}

const PREVIEW_SUFFIXES = [".pages.dev", ".workers.dev"];
const DEFAULT_ZONE = "prabinwagle.com.np";

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

  // Strip the known zone: "prabinwagle.com.np" → "", "www.prabinwagle.com.np"
  // → "www", "a.b.prabinwagle.com.np" → "a.b". Anything else isn't our
  // domain at all → pass through untouched.
  const zone = String(env.ZONE ?? DEFAULT_ZONE)
    .toLowerCase()
    .replace(/^\.+/, "");
  let sub: string | null;
  if (host === zone) sub = "";
  else if (host.endsWith(`.${zone}`)) sub = host.slice(0, -(zone.length + 1));
  else return next();

  const allowed = String(env.ALLOWED_SUBDOMAINS ?? "www")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Apex + allow-listed subdomains pass through to the portfolio.
  if (sub === "" || allowed.includes(sub)) return next();

  // Unknown subdomain → the funny 404, real 404 status, URL untouched.
  try {
    const page = await env.ASSETS.fetch(new URL("/404.html", url).toString());
    return new Response(page.body, {
      status: 404,
      headers: {
        "content-type": page.headers.get("content-type") ?? "text/html; charset=utf-8",
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
