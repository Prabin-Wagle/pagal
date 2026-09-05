type Props = {
  n: string;
  label: string;
  jp: string;
  className?: string;
  align?: "left" | "right";
};

/** Oversized section index + rotated label. Deliberately not a "heading", it's wayfinding. */
export default function SectionMark({ n, label, jp, className = "", align = "left" }: Props) {
  return (
    <div className={`flex items-start gap-4 ${align === "right" ? "flex-row-reverse text-right" : ""} ${className}`}>
      <span className="font-display text-[3.2rem] leading-[0.8] text-shu md:text-[4.5rem]" aria-hidden>
        {n}
      </span>
      <div className="flex flex-col gap-1 pt-1">
        <span className="t-label">{label}</span>
        <span className="font-jp text-xs tracking-[0.3em] text-muted">{jp}</span>
      </div>
    </div>
  );
}

export function Seal({ text = "波", className = "" }: { text?: string; className?: string }) {
  return (
    <span
      className={`inline-flex h-11 w-11 -rotate-6 items-center justify-center border-2 border-shu font-jp text-xl font-bold text-shu md:h-14 md:w-14 md:text-2xl ${className}`}
      style={{ boxShadow: "inset 0 0 0 2px var(--bg), inset 0 0 0 3px var(--color-shu)" }}
      aria-hidden
    >
      {text}
    </span>
  );
}
