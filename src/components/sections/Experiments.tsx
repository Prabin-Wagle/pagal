import { useRef } from "react";
import { animate } from "animejs";
import { EXPERIMENTS } from "@/data/content";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SectionMark from "@/components/ui/SectionMark";

export default function Experiments() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // each note is "pinned" to the page: rotates from a slight tilt and settles, like a paper slip
      gsap.utils.toArray<HTMLElement>(q(".exp-item")).forEach((el, i) => {
        gsap.from(el, {
          rotate: i % 2 ? 2.5 : -2.5,
          yPercent: 30,
          opacity: 0,
          transformOrigin: i % 2 ? "100% 0%" : "0% 0%",
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      gsap.from(q(".exp-head"), {
        scaleY: 0.2,
        opacity: 0,
        transformOrigin: "0% 100%",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: q(".exp-head"), start: "top 85%" },
      });
    },
    { scope: root },
  );

  const wobble = (el: HTMLElement | null) => {
    if (!el || prefersReducedMotion()) return;
    animate(el, { rotate: [0, -14, 10, 0], scale: [1, 1.25, 1], duration: 700, ease: "outElastic(1, .5)" });
  };

  return (
    <section id="experiments" ref={root} data-theme="paper" className="relative px-5 py-28 md:px-8 md:py-40 lg:px-12" aria-labelledby="exp-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <SectionMark n="05" label="Experiments" jp="実験" />
          <h2 id="exp-title" className="exp-head t-display mt-10 text-[clamp(3rem,9vw,8rem)] leading-[0.85]">
            Open
            <br />
            <span className="t-serif-i normal-case text-shu">questions</span>
          </h2>
          <p className="mt-8 max-w-[30ch] text-sm leading-relaxed text-muted" style={{ fontVariationSettings: '"opsz" 24, "wght" 400' }}>
            Curiosity, not expertise. Territories I'm reading about, prototyping in, and asking questions of — the
            next projects usually start here.
          </p>
          <p className="t-label mt-10 hidden text-muted lg:block">Field notes · 野帳</p>
        </div>

        <ol className="lg:col-span-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
          {EXPERIMENTS.map((e, i) => (
            <li
              key={e.title}
              className={`exp-item group hairline-b py-6 ${i % 2 ? "lg:mt-16" : ""}`}
              onMouseEnter={(ev) => wobble(ev.currentTarget.querySelector(".exp-glyph"))}
              data-cursor="link"
            >
              <div className="flex items-baseline gap-5">
                <span className="exp-glyph inline-block font-serif text-3xl text-shu" aria-hidden>
                  {e.n}
                </span>
                <h3
                  className="font-sans text-[1.6rem] leading-none transition-[font-variation-settings] duration-500 md:text-[2rem]"
                  style={{ fontVariationSettings: '"opsz" 96, "wdth" 90, "wght" 500' }}
                >
                  {e.title}
                </h3>
              </div>
              <p className="t-serif-i mt-3 pl-12 text-[1.05rem] text-muted transition-colors duration-500 group-hover:text-fg md:text-lg">
                {e.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
