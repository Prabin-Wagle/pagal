/**
 * Cloudflare Worker entry — wildcard-subdomain guard + static portfolio.
 * (Project "pagal" deploys via Workers Builds, so this `fetch` handler is
 * the front door. The old Pages Functions middleware in
 * `functions/_middleware.ts` never executes on Workers — it was removed.)
 *
 *  - apex (prabinwagle.com.np) + allow-listed subdomains → portfolio as normal
 *  - ANY other subdomain (blah.prabinwagle.com.np, /anything) → serves the
 *    funny static 404 (`public/404.html`) with a real 404 status,
 *    keeping the visitor on the URL they typed.
 *  - Unknown PATHS fall through to static-asset serving; `not_found_handling`
 *    in wrangler.toml serves `/404.html` for those automatically.
 *
 * Subdomain extraction strips the zone BY NAME — dot-counting assumes a
 * one-part TLD (`.com`) and breaks on `.com.np`. If the domain ever changes,
 * update DEFAULT_ZONE below (or set a `ZONE` env var in the dashboard).
 *
 * Optional allow-list: `ALLOWED_SUBDOMAINS` env var, comma-separated,
 * e.g. `www,blog,app`. Defaults to just `www`.
 */

interface Env {
  ASSETS: { fetch: (req: Request | string) => Promise<Response> };
  ALLOWED_SUBDOMAINS?: string;
  ZONE?: string;
}

const PREVIEW_SUFFIXES = [".pages.dev", ".workers.dev"];
const DEFAULT_ZONE = "prabinwagle.com.np";

function getSubdomain(host: string, zone: string): string | null {
  if (host === zone) return "";
  if (host.endsWith(`.${zone}`)) return host.slice(0, -(zone.length + 1));
  return null; // not our domain at all
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Static assets serve the site; the guard only overrides unknown subdomains.
    const passThrough = () => env.ASSETS.fetch(request);

    // Local dev, preview deploys → never interfere.
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      PREVIEW_SUFFIXES.some((s) => host.endsWith(s))
    ) {
      return passThrough();
    }

    const zone = String(env.ZONE ?? DEFAULT_ZONE)
      .toLowerCase()
      .replace(/^\.+/, "");
    const sub = getSubdomain(host, zone);
    if (sub === null) return passThrough();

    const allowed = String(env.ALLOWED_SUBDOMAINS ?? "www")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    // Apex + allow-listed subdomains pass through to the portfolio.
    if (sub === "" || allowed.includes(sub)) return passThrough();

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
  },
};
