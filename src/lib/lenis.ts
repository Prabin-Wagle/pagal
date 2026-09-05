import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

const EXPO_OUT = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export type LenisOptions = ConstructorParameters<typeof Lenis>[0];

export function initLenis(options?: LenisOptions): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.15,
    easing: EXPO_OUT,
    smoothWheel: true,
    touchMultiplier: 1.6,
    autoRaf: false,
    ...options,
  });

  lenis.on("scroll", ScrollTrigger.update);

  tickerFn = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function destroyLenis() {
  if (tickerFn) {
    gsap.ticker.remove(tickerFn);
    tickerFn = null;
  }
  lenis?.destroy();
  lenis = null;
}

export function stopScroll() {
  lenis?.stop();
}

export function startScroll() {
  lenis?.start();
}

/**
 * Smooth-scroll to an in-page hash via Lenis.
 * Falls back to native smooth scroll when Lenis isn't running
 * (reduced motion / not yet initialised).
 */
export function scrollToHash(href: string, offset = 0) {
  if (lenis && !lenis.isStopped) {
    lenis.scrollTo(href, {
      offset,
      duration: 1.5,
      easing: EXPO_OUT,
    });
    return;
  }
  document.querySelector(href)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}
