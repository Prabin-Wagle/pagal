import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIsTouch, useReducedMotion } from "@/hooks/useMedia";

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: "div" | "span";
};

/** Wraps any element and lets it lean toward the pointer with spring-like inertia. */
export default function Magnetic({ children, strength = 0.35, className, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || touch || reduced) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.45)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.45)" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref, dependencies: [touch, reduced, strength] },
  );

  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={{ display: as === "span" ? "inline-block" : undefined }}>
      {children}
    </Tag>
  );
}
