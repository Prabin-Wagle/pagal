<div align="center">
  <img src="assets/readme-hero.svg" alt="Animated terminal: whoami, stack, status" width="100%" />
</div>

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0b0a09)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-r185-black?logo=three.js&logoColor=white)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-3-0AE448?logo=gsap&logoColor=0b0a09)](https://gsap.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=0b0a09)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

</div>

# Prabin Wagle — Portfolio Vol. I

A premium creative developer portfolio. Editorial ink-and-paper aesthetic with Japanese accents, a morphing WebGL ink sculpture, cinematic scroll choreography — and a haunted 404 void with googly eyes.

**Live:** `prabinwagle.com.np` · Try getting lost: `/404`

<img src="assets/readme-divider.svg" alt="" width="100%" />

## Features

- **Cinematic preloader** — ink counter, progress hairline, curtain lift
- **InkSculpture (Three.js)** — noise-displaced icosahedron with fresnel + contour shaders, reacts to cursor and scroll
- **Scroll choreography** — GSAP ScrollTrigger + Lenis smooth scroll, per-section ink/paper theme flipping
- **8 sections** — Hero, About, Capabilities, Stack, Projects, AI Lab, Experiments, Philosophy + Contact footer with validated form (Web3Forms)
- **Funny animated 404** — three.js runaway digits with cursor-tracking googly eyes, poke-to-panic physics, rotating excuses, self-typing terminal (`/404`, `?404`, `#/404`)
- **Wildcard subdomain guard** (Cloudflare Worker) — unknown `*.prabinwagle.com.np` hosts get the 404 with a real 404 status, URL untouched
- **Custom cursor, magnetic buttons, grain overlay**, reduced-motion + touch fallbacks throughout

## Getting started

```bash
npm install
npm run dev      # local dev -> open /404 to preview the void
npm run build    # single-file production build into dist/
npm run preview
```

Copy `.env.example` to `.env` and set `VITE_WEB3FORMS_ACCESS_KEY` for the contact form.

## Project structure

```
src/
  components/
    sections/     # Hero, About, Capabilities, Stack, Projects, AILab, ...
    three/        # InkSculpture, LostInkScene (404 void)
    ui/           # Nav, Cursor, Preloader, Magnetic, ...
  lib/            # gsap setup, lenis, sceneState
  data/           # content.ts — all copy lives here
  App.tsx         # includes lightweight lost-route detection (no router)
src/index.ts      # Cloudflare Worker: subdomain guard + asset serving
public/404.html   # standalone 404 fallback (own Three.js scene, zero-dep copy)
wrangler.toml     # Workers Builds wiring (run_worker_first, 404-page handling)
```

## Deployment (Cloudflare Workers Builds)

1. Connect the repo, framework preset **Vite** (`npm run build` → `dist`)
2. Custom domains: attach apex, `www`, **and `*.prabinwagle.com.np`** (wildcard DNS + cert are automatic)
3. Optional env vars: `ALLOWED_SUBDOMAINS` (default `www`), `ZONE` (default `prabinwagle.com.np`)
4. Push to `main` — deploys automatically

## Routes

| Route | What shows |
|---|---|
| `/` | Portfolio |
| `/404`, `/404.html`, `/?404`, `/#/404`, any unknown path | The void (animated or static 404) |
| `random.prabinwagle.com.np` (any path) | Funny 404, real 404 status |

---

<div align="center">

© 2026 Prabin Wagle · Computer Engineering · AI / ML · Software · Nepal

深く学び、作り続け、全てを疑う

</div>
