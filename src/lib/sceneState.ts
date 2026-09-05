/**
 * Mutable, allocation-free state shared between DOM (GSAP/ScrollTrigger, pointer)
 * and the WebGL render loop. Avoids React re-renders on every frame.
 */
export const sceneState = {
  /** 0 → 1 as the hero scrolls out */
  scroll: 0,
  /** normalized pointer, -1 → 1 */
  mouse: { x: 0, y: 0 },
  /** pointer speed, decays each frame */
  velocity: 0,
  /** 1 when hovering an interactive hero element */
  hover: 0,
  /** true while the sculpture is on screen */
  active: true,
  /** 0 → 1 during the hero entrance */
  intro: 0,
};
