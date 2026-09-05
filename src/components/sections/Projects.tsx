import { useRef } from "react";
import { PROJECTS, type Project } from "@/data/content";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import SectionMark from "@/components/ui/SectionMark";
import { AgriVisual, LibraryVisual, LmsVisual, PipelineVisual } from "@/components/projects/ProjectVisuals";

const VISUALS = {
  agri: AgriVisual,
  pipeline: PipelineVisual,
  library: LibraryVisual,
  lms: LmsVisual,
} as const;

function ProjectCase({ p, i }: { p: Project; i: number }) {
  const root = useRef<HTMLElement>(null);
  const Visual = VISUALS[p.visual];
  const flip = i % 2 === 1;
  const wide = p.visual === "pipeline" || p.visual === "lms";

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // Title: chars slice in — different direction per project
      const split = new SplitText(q(".pj-title"), {
        type: "chars,words",
        charsClass: "char",
        wordsClass: "pj-word",
      });
      gsap.from(split.chars, {
        yPercent: flip ? -100 : 100,
        opacity: 0,
        rotate: flip ? -3 : 3,
        duration: 1,
        ease: "power4.out",
        stagger: { each: 0.02, from: flip ? "end" : "start" },
        scrollTrigger: { trigger: q(".pj-title"), start: "top 85%" },
      });

      // Visual frame: clip-path reveal, direction alternates; then lines draw on scrub
      gsap.fromTo(
        q(".pj-visual"),
        { clipPath: flip ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0%)",
          duration: 1.6,
          ease: "power4.inOut",
          scrollTrigger: { trigger: q(".pj-visual"), start: "top 80%" },
        },
      );
      const paths = q(".pv-draw");
      const pops = q(".pv-pop");
      const labels = q(".pv-label");
      gsap.set(pops, { scale: 0, transformOrigin: "center" });
      gsap.set(labels, { opacity: 0 });
      const mm = gsap.matchMedia();
      // desktop: scrub the drawing across the viewport
      mm.add("(pointer: fine)", () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: q(".pj-visual"), start: "top 70%", end: "bottom 45%", scrub: 0.8 },
          })
          .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.02, ease: "none" }, 0)
          .to(pops, { scale: 1, stagger: 0.02, ease: "back.out(2)" }, 0.25)
          .to(labels, { opacity: 1, stagger: 0.03, ease: "none" }, 0.4);
      });
      // touch: play once on enter — scrubbing would repaint the SVG every scroll frame
      mm.add("(pointer: coarse)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: q(".pj-visual"), start: "top 70%" } })
          .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.4, stagger: 0.02, ease: "power2.inOut" }, 0)
          .to(pops, { scale: 1, duration: 0.6, stagger: 0.03, ease: "back.out(2)" }, 0.5)
          .to(labels, { opacity: 1, duration: 0.4, stagger: 0.03, ease: "none" }, 0.7);
      });

      // Meta list ticks in like a readout
      gsap.from(q(".pj-bullet"), {
        x: -12,
        opacity: 0,
        stagger: 0.06,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: q(".pj-bullets"), start: "top 85%" },
      });

      // Parallax: visual drifts slower than text
      gsap.to(q(".pj-visual-inner"), {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      // Oversized index number scrubs past
      gsap.fromTo(
        q(".pj-num"),
        { yPercent: 20 },
        { yPercent: -20, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );

      return () => {
        split.revert();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <article
      ref={root}
      data-theme={p.theme}
      className="relative overflow-hidden px-5 py-24 md:px-8 md:py-36 lg:px-12"
      aria-labelledby={`pj-${p.slug}`}
    >
      <span
        className={`pj-num pointer-events-none absolute top-8 font-display text-[36vw] leading-[0.8] text-current opacity-[0.045] md:text-[22vw] ${flip ? "left-0" : "right-0"}`}
        aria-hidden
      >
        {p.n}
      </span>

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* text column */}
        <div className={`flex flex-col lg:col-span-5 ${flip ? "lg:order-2 lg:col-start-8" : "lg:col-start-1"}`}>
          <div className="flex items-center gap-4 t-meta">
            <span className="text-shu">Project {p.n}</span>
            <span className="h-px flex-1 bg-current opacity-20" />
            <span className="font-jp text-sm normal-case tracking-[0.3em] text-fg">{p.jp}</span>
          </div>

          <h3 id={`pj-${p.slug}`} className="pj-title t-display mt-6 text-[clamp(2.8rem,8vw,6.4rem)] leading-[0.9]">
            {p.title}
          </h3>
          <p className="t-meta mt-4">{p.kind}</p>

          <p className="t-serif-i mt-8 max-w-[34ch] text-[1.35rem] leading-[1.2] md:text-[1.7rem]">{p.summary}</p>

          <ul className="pj-bullets mt-10 space-y-2 hairline-t pt-6">
            {p.bullets.map((b, bi) => (
              <li key={b} className="pj-bullet flex items-baseline gap-4 text-[0.95rem] md:text-base">
                <span className="font-mono text-[10px] text-shu">{String(bi + 1).padStart(2, "0")}</span>
                <span style={{ fontVariationSettings: '"opsz" 24, "wght" 420' }}>{b}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 t-meta">
            {p.tech.map((t) => (
              <li key={t} data-cursor="text" className="hover:text-fg transition-colors">
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* visual column */}
        <div className={`lg:col-span-7 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-6"}`}>
          <div
            className="pj-visual relative border border-[var(--line)] text-fg"
            data-cursor="view"
            data-cursor-label="Fig."
          >
            <div className="pointer-events-none absolute left-3 top-3 t-label opacity-60">
              Fig. {p.n} — {p.visual}
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 t-label opacity-60">Drawn on scroll</div>
            <div className={`pj-visual-inner p-6 md:p-10 ${wide ? "aspect-[16/9] lg:aspect-[2/1]" : "aspect-square"}`}>
              <Visual />
            </div>
            {/* corner ticks */}
            {["left-0 top-0", "right-0 top-0", "left-0 bottom-0", "right-0 bottom-0"].map((pos) => (
              <span key={pos} className={`pointer-events-none absolute ${pos} h-3 w-3 border-shu`} style={{
                borderTopWidth: pos.includes("top") ? 1 : 0,
                borderBottomWidth: pos.includes("bottom") ? 1 : 0,
                borderLeftWidth: pos.includes("left") ? 1 : 0,
                borderRightWidth: pos.includes("right") ? 1 : 0,
              }} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const head = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(head);
      const split = new SplitText(q(".pj-head"), { type: "lines", linesClass: "line-mask", mask: "lines" });
      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: head.current, start: "top 80%" },
      });
      return () => split.revert();
    },
    { scope: head },
  );

  return (
    <section id="projects" aria-labelledby="projects-title">
      <div ref={head} data-theme="ink" className="px-5 pb-10 pt-28 md:px-8 md:pt-40 lg:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionMark n="03" label="Selected projects" jp="作品" />
          <p className="t-meta max-w-[28ch] md:text-right">
            Four builds, from a farm to a classroom. Each one taught something the last one didn't.
          </p>
        </div>
        <h2 id="projects-title" className="pj-head t-display mt-12 text-[clamp(3rem,12vw,12rem)] leading-[0.85]">
          Work <span className="t-serif-i normal-case text-shu">&amp;</span> Cases
        </h2>
      </div>
      {PROJECTS.map((p, i) => (
        <ProjectCase key={p.slug} p={p} i={i} />
      ))}
    </section>
  );
}
