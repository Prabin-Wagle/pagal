import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { initLenis, destroyLenis, getLenis } from "@/lib/lenis";
import Cursor from "@/components/ui/Cursor";
import Nav from "@/components/ui/Nav";
import Preloader from "@/components/ui/Preloader";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Stack from "@/components/sections/Stack";
import Projects from "@/components/sections/Projects";
import AILab from "@/components/sections/AILab";
import Experiments from "@/components/sections/Experiments";
import Philosophy from "@/components/sections/Philosophy";
import Contact from "@/components/sections/Contact";
import NotFound from "@/components/sections/NotFound";

const InkSculpture = lazy(() => import("@/components/three/InkSculpture"));

/**
 * Lightweight lost-route detection (no router dependency).
 * True for /404, /404.html, ?404, #/404, or any non-root path —
 * the last case covers static hosts that rewrite unknown URLs to index.html.
 * Preview locally with `/404` or `?404`.
 */
function isLostRoute() {
  if (typeof window === "undefined") return false;
  const { pathname, hash, search } = window.location;
  if (hash === "#/404") return true;
  if (new URLSearchParams(search).has("404")) return true;
  const p = pathname.replace(/\/+$/, "") || "/";
  return p === "/404" || p.endsWith("/404.html") || (p !== "/" && p !== "/index.html");
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [sculptureActive, setSculptureActive] = useState(true);
  // Hooks-safe: computed once, branched on at render time below.
  const [isLost] = useState(isLostRoute);

  const onLoaded = useCallback(() => setReady(true), []);

  // Lenis smooth scroll (native scroll, GSAP-ticker driven) + global triggers.
  // Created once — ready/menu only stop & start the same instance.
  useGSAP(() => {
    if (isLost) return; // the void has no scroll triggers
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = prefersReducedMotion() ? null : initLenis();
    // Lock scroll behind the preloader; released when `ready` flips.
    lenis?.stop();

    // Flip body theme as sections cross the middle of the viewport
    const sections = gsap.utils.toArray<HTMLElement>("[data-theme]");
    const setTheme = (t: string) => {
      if (document.body.dataset.theme !== t) document.body.dataset.theme = t;
    };
    sections.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => setTheme(el.dataset.theme!),
        onEnterBack: () => setTheme(el.dataset.theme!),
      });
    });

    // Only render WebGL while the hero is on screen
    ScrollTrigger.create({
      trigger: "#top",
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setSculptureActive(self.isActive),
    });

    let mounted = true;
    document.fonts?.ready.then(() => {
      if (mounted) ScrollTrigger.refresh();
    });
    return () => {
      mounted = false;
      destroyLenis();
    };
  });

  // Release the scroll lock once the preloader lifts.
  useEffect(() => {
    if (!ready) return;
    getLenis()?.start();
    ScrollTrigger.refresh();
  }, [ready]);

  useEffect(() => {
    document.body.dataset.theme = "ink";
  }, []);

  // Funny animated 404 — same ink/paper/vermilion world, its own three.js void.
  if (isLost) {
    return (
      <>
        <Cursor />
        <div className="grain" aria-hidden />
        <NotFound />
      </>
    );
  }

  return (
    <>
      <Preloader onDone={onLoaded} />
      <Cursor />
      <Nav />
      <div className="grain" aria-hidden />

      <Suspense fallback={null}>
        <InkSculpture active={sculptureActive && ready} />
      </Suspense>

      <div className="relative z-[1]">
        <main>
          <Hero ready={ready} />
          <About />
          <Capabilities />
          <Stack />
          <Projects />
          <AILab />
          <Experiments />
          <Philosophy />
        </main>
        <Contact />
      </div>
    </>
  );
}
