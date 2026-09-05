/**
 * Procedural technical illustrations for each project.
 * Classes: .pv-draw (stroke drawn on scroll), .pv-pop (scaled in), .pv-label (typed in).
 */
const L = { stroke: "currentColor", fill: "none", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
const Shu = { ...L, stroke: "var(--color-shu)" };

const Label = ({ x, y, text, anchor = "start" }: { x: number; y: number; text: string; anchor?: "start" | "end" | "middle" }) => (
  <text
    className="pv-label"
    x={x}
    y={y}
    textAnchor={anchor}
    fill="currentColor"
    style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase" }}
  >
    {text}
  </text>
);

export function AgriVisual() {
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden>
      {/* leaf */}
      <path className="pv-draw" d="M300 80 C 470 150, 500 380, 300 540 C 100 380, 130 150, 300 80 Z" {...L} strokeWidth={1.4} />
      <path className="pv-draw" d="M300 90 V530" {...L} />
      {[0.18, 0.32, 0.46, 0.6, 0.74].map((t, i) => {
        const y = 110 + t * 400;
        const w = Math.sin(t * Math.PI) * 150 + 20;
        return (
          <g key={i}>
            <path className="pv-draw" d={`M300 ${y} C ${300 + w * 0.4} ${y + 20}, ${300 + w * 0.8} ${y + 40}, ${300 + w} ${y + 70}`} {...L} opacity={0.7} />
            <path className="pv-draw" d={`M300 ${y} C ${300 - w * 0.4} ${y + 20}, ${300 - w * 0.8} ${y + 40}, ${300 - w} ${y + 70}`} {...L} opacity={0.7} />
          </g>
        );
      })}
      {/* lesion — region of interest */}
      <ellipse className="pv-pop" cx={362} cy={300} rx={26} ry={18} fill="var(--color-shu)" fillOpacity={0.35} transform="rotate(-20 362 300)" />
      <path className="pv-draw" d="M322 268 h14 M322 268 v14 M402 268 h-14 M402 268 v14 M322 332 h14 M322 332 v-14 M402 332 h-14 M402 332 v-14" {...Shu} strokeWidth={1.5} />
      <path className="pv-draw" d="M402 300 H500" {...Shu} strokeDasharray="2 3" />
      <Label x={504} y={303} text="Region of interest" />
      {/* scan line */}
      <line className="pv-scan" x1={140} x2={460} y1={80} y2={80} {...Shu} strokeWidth={1} opacity={0.8} />
      {/* annotations */}
      <path className="pv-draw" d="M300 80 V40 H380" {...L} />
      <Label x={384} y={43} text="Plant recognition" />
      <path className="pv-draw" d="M300 540 V568 H220" {...L} />
      <Label x={216} y={571} text="Disease detection" anchor="end" />
      <path className="pv-draw" d="M150 220 H60" {...L} />
      <Label x={60} y={212} text="Weather intel." />
      <g className="pv-pop">
        <circle cx={70} cy={240} r={12} {...L} />
        <path d="M60 250 Q70 230 80 250" {...L} />
      </g>
      <path className="pv-draw" d="M150 400 H60" {...L} />
      <Label x={60} y={392} text="Seed bank" />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="pv-pop" x={58 + i * 14} y={408} width={10} height={14} {...L} />
      ))}
      <path className="pv-draw" d="M470 440 H540" {...L} />
      <Label x={472} y={432} text="Farmer network" />
      {[
        [500, 470],
        [530, 490],
        [480, 500],
      ].map(([x, y], i) => (
        <circle key={i} className="pv-pop" cx={x} cy={y} r={4} fill="currentColor" />
      ))}
      <path className="pv-draw" d="M500 470 L530 490 L480 500 Z" {...L} opacity={0.5} />
      <style>{`.pv-scan{animation:pvscan 4s cubic-bezier(.76,0,.24,1) infinite}@keyframes pvscan{0%{transform:translateY(0)}50%{transform:translateY(460px)}100%{transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.pv-scan{animation:none}}`}</style>
    </svg>
  );
}

export function PipelineVisual() {
  const stages = ["Dataset", "Augmentation", "Model", "Training", "Prediction"];
  return (
    <svg viewBox="0 0 900 360" className="h-full w-full" aria-hidden>
      {/* bus */}
      <path className="pv-draw" d="M60 180 H840" {...L} strokeDasharray="3 5" />
      {stages.map((s, i) => {
        const x = 90 + i * 180;
        return (
          <g key={s}>
            <Label x={x} y={40} text={`0${i + 1} — ${s}`} anchor="middle" />
            <path className="pv-draw" d={`M${x} 50 V70`} {...L} />
          </g>
        );
      })}
      {/* 01 dataset: grid of leaf thumbs */}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} className="pv-pop" x={40 + (i % 4) * 26} y={130 + Math.floor(i / 4) * 26} width={20} height={20} {...L} fill="currentColor" fillOpacity={(i * 37) % 7 / 10} />
      ))}
      <Label x={90} y={260} text="PlantVillage" anchor="middle" />
      {/* 02 augmentation: same tile rotated/flipped */}
      {[0, 15, -20, 35].map((r, i) => (
        <rect key={i} className="pv-pop" x={240} y={150} width={44} height={44} {...L} transform={`rotate(${r} 262 172) translate(${i * 6} ${i * -4})`} opacity={1 - i * 0.2} />
      ))}
      <path className="pv-draw" d="M232 210 l-10 10 M232 210 l10 10" {...Shu} />
      <Label x={270} y={260} text="flip · rotate · zoom" anchor="middle" />
      {/* 03 model: MobileNetV2 blocks */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} className="pv-pop" x={410 + i * 14} y={120 + i * 8} width={10} height={120 - i * 16} {...L} fill={i === 5 ? "var(--color-shu)" : "none"} />
      ))}
      <path className="pv-draw" d="M400 120 h-8 v120 h8" {...L} />
      <Label x={450} y={260} text="MobileNetV2 · transfer" anchor="middle" />
      {/* 04 training: loss curve */}
      <path className="pv-draw" d="M570 120 V240 H690" {...L} />
      <path className="pv-draw" d="M575 128 C 600 200, 620 215, 685 222" {...Shu} strokeWidth={1.5} />
      <path className="pv-draw" d="M575 230 C 610 160, 640 140, 685 136" {...L} strokeDasharray="2 3" />
      <Label x={630} y={260} text="GPU · Colab · W&B" anchor="middle" />
      {/* 05 prediction: bars */}
      {[0.9, 0.35, 0.15, 0.08].map((v, i) => (
        <g key={i}>
          <rect className="pv-pop" x={760} y={125 + i * 26} width={110 * v} height={14} fill={i === 0 ? "var(--color-shu)" : "currentColor"} fillOpacity={i === 0 ? 1 : 0.35} />
        </g>
      ))}
      <path className="pv-draw" d="M760 120 V240" {...L} />
      <Label x={815} y={260} text="class · confidence" anchor="middle" />
      {/* arrows */}
      {[180, 360, 540, 720].map((x) => (
        <path key={x} className="pv-draw" d={`M${x - 6} 174 l8 6 -8 6`} {...L} />
      ))}
    </svg>
  );
}

export function LibraryVisual() {
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden>
      {/* isometric sheets */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} className="pv-pop">
          <path d={`M150 ${300 - i * 34} l150 -80 l150 80 l-150 80 z`} {...L} fill="var(--bg)" />
          {i === 4 && (
            <>
              <path d="M220 300 l80 -42 M240 318 l80 -42 M260 336 l60 -32" {...L} opacity={0.6} />
              <path d="M300 220 l40 20" {...Shu} strokeWidth={2} />
            </>
          )}
        </g>
      ))}
      <path className="pv-draw" d="M150 300 V332 l150 80 l150 -80 V300" {...L} opacity={0.5} />
      {/* labels with leaders */}
      <path className="pv-draw" d="M450 164 H540" {...L} />
      <Label x={452} y={156} text="Notes · Resources" />
      <path className="pv-draw" d="M450 232 H540" {...L} />
      <Label x={452} y={224} text="Quizzes" />
      <path className="pv-draw" d="M150 266 H60" {...L} />
      <Label x={60} y={258} text="Auth" />
      <path className="pv-draw" d="M150 334 H60" {...L} />
      <Label x={60} y={326} text="Search" />
      {/* cloud storage (three cylinders) */}
      {[0, 1, 2].map((i) => (
        <g key={i} className="pv-pop">
          <ellipse cx={120 + i * 40} cy={470} rx={14} ry={5} {...L} />
          <path d={`M${106 + i * 40} 470 v30 a14 5 0 0 0 28 0 v-30`} {...L} />
        </g>
      ))}
      <Label x={100} y={530} text="Firestore · Supabase · MySQL" />
      <path className="pv-draw" d="M300 412 V450 H160" {...L} strokeDasharray="2 3" />
      {/* phone */}
      <rect className="pv-draw" x={440} y={400} width={70} height={130} rx={8} {...L} />
      <path className="pv-draw" d="M452 420 h46 M452 436 h30 M452 452 h40" {...L} opacity={0.6} />
      <rect className="pv-pop" x={452} y={500} width={46} height={14} fill="var(--color-shu)" />
      <path className="pv-draw" d="M300 412 V450 H440" {...L} strokeDasharray="2 3" />
      <Label x={440} y={550} text="Flutter app" />
    </svg>
  );
}

export function LmsVisual() {
  const portals = [
    { t: "Student", x: 60, rows: ["Dashboard", "Courses", "Live", "Recorded", "Quizzes", "Analytics"] },
    { t: "Admin", x: 330, rows: ["Users", "Courses", "Content"] },
    { t: "Editor", x: 600, rows: ["Create course", "Questions", "Content"] },
  ];
  return (
    <svg viewBox="0 0 900 460" className="h-full w-full" aria-hidden>
      {portals.map((p, pi) => (
        <g key={p.t}>
          <rect className="pv-draw" x={p.x} y={60} width={240} height={240} {...L} />
          <path className="pv-draw" d={`M${p.x} 92 H${p.x + 240}`} {...L} />
          <circle className="pv-pop" cx={p.x + 16} cy={76} r={4} fill={pi === 0 ? "var(--color-shu)" : "currentColor"} />
          <Label x={p.x + 30} y={79} text={`${p.t} portal`} />
          {p.rows.map((r, i) => (
            <g key={r}>
              <rect className="pv-pop" x={p.x + 16} y={108 + i * 30} width={pi === 0 ? 90 + (i % 3) * 30 : 120} height={16} fill="currentColor" fillOpacity={0.12} />
              <Label x={p.x + 20} y={120 + i * 30} text={r} />
            </g>
          ))}
          <path className="pv-draw" d={`M${p.x + 120} 300 V360`} {...L} strokeDasharray="2 3" />
        </g>
      ))}
      {/* shared backbone */}
      <path className="pv-draw" d="M60 360 H840" {...L} strokeWidth={1.5} />
      <rect className="pv-pop" x={330} y={380} width={240} height={44} {...L} />
      <Label x={450} y={406} text="Firebase · Firestore · Supabase" anchor="middle" />
      <path className="pv-draw" d="M450 360 V380" {...Shu} strokeWidth={2} />
      <Label x={60} y={448} text="React · TypeScript · Tailwind" />
    </svg>
  );
}
