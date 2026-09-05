import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, useGSAP);

gsap.defaults({ ease: "expo.out", duration: 1.2 });

export const EASE = {
  out: "expo.out",
  inOut: "power4.inOut",
  cinematic: "power3.out",
  snap: "power2.out",
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);

/**
 * Split an element into lines + chars with line masks.
 * Returns the SplitText instance for cleanup/animation.
 */
export function splitLines(el: Element, type: "lines" | "chars" | "words" = "lines") {
  return new SplitText(el, {
    type: type === "lines" ? "lines" : type === "words" ? "lines,words" : "lines,chars",
    linesClass: "line-mask",
    charsClass: "char",
    wordsClass: "word",
    mask: type === "lines" ? "lines" : undefined,
  });
}

/** Mask reveal for a set of lines (used across sections with different timing signatures). */
export function revealLines(
  targets: gsap.TweenTarget,
  opts: { delay?: number; stagger?: number; duration?: number; y?: string } = {},
) {
  return gsap.from(targets, {
    yPercent: 110,
    rotate: 2,
    transformOrigin: "0% 100%",
    duration: opts.duration ?? 1.4,
    stagger: opts.stagger ?? 0.08,
    delay: opts.delay ?? 0,
    ease: "expo.out",
  });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
