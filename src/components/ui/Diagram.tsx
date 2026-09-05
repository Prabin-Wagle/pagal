import { useEffect, useRef } from "react";
import { animate, svg, stagger } from "animejs";
import type { Capability } from "@/data/content";
import { prefersReducedMotion } from "@/lib/gsap";

type Kind = Capability["diagram"];

const S = { stroke: "currentColor", fill: "none", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
const Node = ({ cx, cy, r = 3, filled = false }: { cx: number; cy: number; r?: number; filled?: boolean }) => (
  <circle className="d-node" cx={cx} cy={cy} r={r} {...S} fill={filled ? "currentColor" : "var(--bg)"} />
);

function Shapes({ kind }: { kind: Kind }) {
  switch (kind) {
    case "graph": {
      const pts = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
        return [100 + Math.cos(a) * 70, 100 + Math.sin(a) * 70];
      });
      return (
        <>
          {pts.map(([x, y], i) =>
            pts.slice(i + 1).map(([x2, y2], j) => (
              <line key={`${i}-${j}`} className="d-line" x1={x} y1={y} x2={x2} y2={y2} {...S} opacity={0.35} />
            )),
          )}
          {pts.map(([x, y], i) => (
            <Node key={i} cx={x} cy={y} r={i === 0 ? 5 : 3} filled={i === 0} />
          ))}
          <Node cx={100} cy={100} r={6} filled />
        </>
      );
    }
    case "matrix":
      return (
        <>
          {Array.from({ length: 36 }, (_, i) => {
            const x = 40 + (i % 6) * 24;
            const y = 40 + Math.floor(i / 6) * 24;
            const v = (Math.sin(i * 1.7) + 1) / 2;
            return (
              <rect
                key={i}
                className="d-node"
                x={x}
                y={y}
                width={16}
                height={16}
                {...S}
                fill="currentColor"
                fillOpacity={0.08 + v * 0.8}
                stroke="none"
              />
            );
          })}
          <path className="d-line" d="M30 30 H180 V180 H30 Z" {...S} />
          <path className="d-line" d="M20 100 H10 M190 100 H180" {...S} />
        </>
      );
    case "lens":
      return (
        <>
          <circle className="d-line" cx={100} cy={100} r={70} {...S} />
          <circle className="d-line" cx={100} cy={100} r={44} {...S} strokeDasharray="3 5" />
          <circle className="d-line" cx={100} cy={100} r={16} {...S} />
          <path className="d-line" d="M100 10 V40 M100 160 V190 M10 100 H40 M160 100 H190" {...S} />
          <path className="d-line" d="M56 56 h18 M56 56 v18 M144 56 h-18 M144 56 v18 M56 144 h18 M56 144 v-18 M144 144 h-18 M144 144 v-18" {...S} stroke="var(--color-shu)" strokeWidth={1.5} />
          <Node cx={100} cy={100} r={3} filled />
        </>
      );
    case "tokens": {
      const widths = [26, 14, 38, 20, 30, 12, 34, 22];
      let x = 20;
      return (
        <>
          {widths.map((w, i) => {
            const el = (
              <rect key={i} className="d-node" x={x} y={i % 2 ? 84 : 96} width={w} height={20} {...S} />
            );
            x += w + 6;
            return el;
          })}
          <path className="d-line" d="M20 60 H180" {...S} strokeDasharray="2 4" />
          <path className="d-line" d="M20 140 H180" {...S} strokeDasharray="2 4" />
          <path className="d-line" d="M100 40 v14 m0 92 v14" {...S} />
          <path className="d-line" d="M150 22 l8 8 -8 8" {...S} stroke="var(--color-shu)" />
          <path className="d-line" d="M20 30 H158" {...S} stroke="var(--color-shu)" />
        </>
      );
    }
    case "stack":
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} className="d-line" d={`M40 ${60 + i * 22} l60 -22 l60 22 l-60 22 z`} {...S} />
          ))}
          <path className="d-line" d="M100 38 V172" {...S} strokeDasharray="1 4" />
          <Node cx={100} cy={38} r={3} filled />
          <Node cx={100} cy={172} r={3} />
        </>
      );
    case "device":
      return (
        <>
          <rect className="d-line" x={62} y={20} width={76} height={160} rx={10} {...S} />
          <path className="d-line" d="M88 32 h24" {...S} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} className="d-line" d={`M74 ${56 + i * 18} H126`} {...S} opacity={0.5} />
          ))}
          <rect className="d-node" x={74} y={44} width={22} height={8} {...S} fill="var(--color-shu)" stroke="none" />
          <path className="d-line" d="M20 100 H50 M150 100 H180" {...S} strokeDasharray="2 4" />
          <Node cx={20} cy={100} r={3} filled />
          <Node cx={180} cy={100} r={3} filled />
        </>
      );
    case "infra":
      return (
        <>
          <rect className="d-line" x={14} y={84} width={40} height={32} {...S} />
          <rect className="d-line" x={80} y={70} width={40} height={60} {...S} />
          {[40, 100, 160].map((y, i) => (
            <rect key={i} className="d-line" x={150} y={y - 12} width={36} height={24} {...S} />
          ))}
          <path className="d-line" d="M54 100 H80" {...S} />
          <path className="d-line" d="M120 100 H135 V40 H150 M135 100 H150 M135 100 V160 H150" {...S} />
          <path className="d-line" d="M84 76 h32 M84 82 h20" {...S} stroke="var(--color-shu)" />
        </>
      );
    case "orbit":
    default:
      return (
        <>
          <ellipse className="d-line" cx={100} cy={100} rx={80} ry={30} {...S} />
          <ellipse className="d-line" cx={100} cy={100} rx={80} ry={30} transform="rotate(60 100 100)" {...S} />
          <ellipse className="d-line" cx={100} cy={100} rx={80} ry={30} transform="rotate(-60 100 100)" {...S} />
          <Node cx={100} cy={100} r={5} filled />
          <Node cx={180} cy={100} r={3} />
          <Node cx={60} cy={169} r={3} />
          <Node cx={60} cy={31} r={3} filled />
        </>
      );
  }
}

export default function Diagram({ kind, className = "" }: { kind: Kind; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const lines = el.querySelectorAll<SVGElement>(".d-line");
    const nodes = el.querySelectorAll<SVGElement>(".d-node");
    const drawables = svg.createDrawable(lines);
    const lineAnimation = animate(drawables, {
      draw: ["0 0", "0 1"],
      duration: 1100,
      delay: stagger(40),
      ease: "inOut(3)",
    });
    const nodeAnimation = animate(nodes, {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(30, { start: 250 }),
      ease: "outElastic(1, .6)",
      transformOrigin: "center",
    });

    return () => {
      lineAnimation.pause();
      nodeAnimation.pause();
    };
  }, [kind]);

  return (
    <svg
      ref={ref}
      key={kind}
      viewBox="0 0 200 200"
      className={className}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <Shapes kind={kind} />
    </svg>
  );
}
