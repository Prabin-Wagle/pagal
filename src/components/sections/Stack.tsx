import { useRef } from "react";
import { STACK } from "@/data/content";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionMark from "@/components/ui/SectionMark";

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const getX = () => -(t.scrollWidth - window.innerWidth);
        const tween = gsap.to(t, {
          x: getX,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${t.scrollWidth - window.innerWidth}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        // per-panel: number drifts slower than the panel (parallax within horizontal scroll)
        gsap.utils.toArray<HTMLElement>(".stack-num").forEach((num) => {
          gsap.fromTo(
            num,
            { xPercent: 30 },
            {
              xPercent: -30,
              ease: "none",
              scrollTrigger: {
                trigger: num,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
        gsap.utils.toArray<HTMLElement>(".stack-panel").forEach((panel) => {
          const items = panel.querySelectorAll(".stack-item");
          if (!items.length) return;
          gsap.from(items, {
            yPercent: 60,
            opacity: 0,
            stagger: 0.04,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 70%" },
          });
        });
        // progress bar
        gsap.to(".stack-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${t.scrollWidth - window.innerWidth}`, scrub: true },
        });
      });
      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>(".stack-panel").forEach((panel) => {
          const items = panel.querySelectorAll(".stack-item");
          if (!items.length) return;
          gsap.from(items, {
            xPercent: -8,
            opacity: 0,
            stagger: 0.03,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: panel, start: "top 80%" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="stack"
      ref={root}
      data-theme="paper"
      className="relative overflow-hidden"
      aria-labelledby="stack-title"
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-10 md:px-8 lg:px-12 lg:pt-12">
        <SectionMark n="02" label="Appendix — Stack" jp="技術" />
        <h2 id="stack-title" className="t-label hidden md:block">
          Specimen sheet — scroll sideways
        </h2>
      </div>
      <div className="absolute inset-x-5 top-[7.5rem] z-10 hidden h-px bg-current/15 lg:block lg:inset-x-12">
        <div className="stack-progress h-full w-full origin-left scale-x-0 bg-shu" />
      </div>

      <div ref={track} className="flex flex-col lg:h-screen lg:flex-row lg:items-stretch">
        {STACK.map((group, gi) => (
          <article
            key={group.n}
            className="stack-panel relative flex shrink-0 flex-col justify-end border-b border-[var(--line)] px-5 pb-12 pt-40 md:px-8 lg:h-full lg:w-[min(46vw,760px)] lg:border-b-0 lg:border-r lg:px-12 lg:pb-16 lg:pt-44"
          >
            <span className="stack-num pointer-events-none absolute right-4 top-24 font-display text-[28vw] leading-[0.8] text-current opacity-[0.05] lg:top-32 lg:text-[18vw]">
              {group.n}
            </span>
            <header className="relative mb-8 flex items-baseline gap-4 lg:mb-12">
              <h3 className="t-display text-[clamp(2.4rem,6vw,5rem)]">{group.title}</h3>
              <span className="font-jp text-base text-muted">{group.jp}</span>
            </header>
            <ul className="relative flex flex-wrap gap-x-6 gap-y-3 lg:max-w-[34rem]">
              {group.items.map((item, i) => (
                <li
                  key={item}
                  className="stack-item flex items-baseline gap-2 font-sans text-[1.25rem] leading-none md:text-[1.6rem]"
                  style={{ fontVariationSettings: '"opsz" 60, "wdth" 92, "wght" 420' }}
                >
                  <span className="font-mono text-[10px] text-shu">{String(i + 1).padStart(2, "0")}</span>
                  <span data-cursor="text" className="hover:t-serif-i transition-all">{item}</span>
                </li>
              ))}
            </ul>
            <footer className="t-meta relative mt-8 flex justify-between lg:mt-12">
              <span>{group.items.length} entries</span>
              <span>
                {gi + 1} / {STACK.length}
              </span>
            </footer>
          </article>
        ))}

        {/* end plate */}
        <aside className="stack-panel flex shrink-0 flex-col justify-center px-5 py-20 md:px-8 lg:h-full lg:w-[38vw] lg:px-12">
          <p className="t-serif-i text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.1]">
            Tools change. The habit of learning them{" "}
            <span className="brush-underline">quickly</span> doesn't.
          </p>
          <p className="t-meta mt-6">End of specimen — 終</p>
        </aside>
      </div>
    </section>
  );
}
