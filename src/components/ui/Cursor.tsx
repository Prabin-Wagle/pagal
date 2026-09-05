import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { useIsTouch, useReducedMotion } from "@/hooks/useMedia";

/**
 * Custom cursor: a small ink dot + a slow trailing ring.
 * Elements opt into states with `data-cursor="view|drag|link|text"` and optional `data-cursor-label`.
 */
export default function Cursor() {
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (touch || reduced) return;
    document.body.classList.add("has-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const last = { x: pos.x, y: pos.y };
    const setDot = { x: gsap.quickSetter(dot.current, "x", "px"), y: gsap.quickSetter(dot.current, "y", "px") };
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setDot.x(pos.x);
      setDot.y(pos.y);
      ringX(pos.x);
      ringY(pos.y);
      sceneState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dx = pos.x - last.x;
        const dy = pos.y - last.y;
        sceneState.velocity = Math.min(1, Math.hypot(dx, dy) / 60);
        last.x = pos.x;
        last.y = pos.y;
      });
    };

    const setState = (state: string | null, text = "") => {
      const r = ring.current;
      const d = dot.current;
      if (!r || !d) return;
      const map: Record<string, { size: number; bg: string; blend: string }> = {
        view: { size: 88, bg: "#c1301c", blend: "normal" },
        link: { size: 56, bg: "transparent", blend: "difference" },
        text: { size: 6, bg: "transparent", blend: "difference" },
        drag: { size: 80, bg: "#ece6d8", blend: "normal" },
      };
      const s = state ? map[state] : null;
      gsap.to(r, {
        width: s ? s.size : 36,
        height: s ? s.size : 36,
        backgroundColor: s ? s.bg : "transparent",
        borderColor: s && s.bg !== "transparent" ? "transparent" : "currentColor",
        duration: 0.5,
        ease: "expo.out",
      });
      gsap.to(d, { scale: state === "view" || state === "drag" ? 0 : 1, duration: 0.3 });
      if (label.current) {
        label.current.textContent = text;
        gsap.to(label.current, { opacity: text ? 1 : 0, duration: 0.3 });
      }
      sceneState.hover = state === "link" || state === "view" ? 1 : 0;
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      if (el) setState(el.dataset.cursor ?? null, el.dataset.cursorLabel ?? "");
      else setState(null);
    };
    const onLeave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
    const onEnter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
      gsap.killTweensOf([dot.current, ring.current, label.current]);
      sceneState.hover = 0;
      sceneState.velocity = 0;
    };
  }, [touch, reduced]);

  if (touch || reduced) return null;

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-shu"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[199] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-current text-paper mix-blend-difference"
        style={{ willChange: "transform, width, height" }}
      >
        <span ref={label} className="t-label opacity-0 text-paper" style={{ fontSize: "0.58rem" }} />
      </div>
    </>
  );
}
