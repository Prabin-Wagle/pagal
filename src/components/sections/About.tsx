import { useRef } from "react";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import SectionMark, { Seal } from "@/components/ui/SectionMark";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // 1. Lead paragraph: words ink-in as you scroll (scrubbed, no fade-up)
      const lead = new SplitText(q(".about-lead"), { type: "words", wordsClass: "word" });
      gsap.fromTo(
        lead.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: { trigger: q(".about-lead"), start: "top 80%", end: "bottom 45%", scrub: 0.5 },
        },
      );

      // 2. Secondary paragraphs: clip-path wipe from the left, staggered per block
      gsap.utils.toArray<HTMLElement>(q(".about-block")).forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 1.6,
            delay: i * 0.1,
            ease: "power4.inOut",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });

      // 3. Ghost number parallax
      gsap.to(q(".about-ghost"), {
        yPercent: -35,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      // 4. Seal stamps in with a physical thud
      gsap.from(q(".about-seal"), {
        scale: 1.8,
        opacity: 0,
        rotate: 12,
        duration: 0.7,
        ease: "power4.in",
        scrollTrigger: { trigger: q(".about-seal"), start: "top 85%" },
      });

      return () => lead.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      data-theme="paper"
      className="relative overflow-hidden px-5 py-28 md:px-8 md:py-40 lg:px-12"
      aria-labelledby="about-title"
    >
      <span className="about-ghost pointer-events-none absolute -left-6 top-10 font-display text-[40vw] leading-none text-current opacity-[0.045] md:text-[28vw]">
        01
      </span>

      <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <SectionMark n="01" label="About" jp="紹介" />
          <div className="mt-10 hidden lg:block">
            <p className="vertical-rl font-jp text-xs tracking-[0.5em] text-muted">
              問題を理解し、作り、壊し、学ぶ
            </p>
          </div>
        </div>

        <div className="lg:col-span-9">
          <h2 id="about-title" className="sr-only">
            About Prabin Wagle
          </h2>
          <p className="about-lead font-serif text-[2rem] leading-[1.08] md:text-[3.4rem] lg:text-[4rem] lg:leading-[1.02]">
            I'm Prabin Wagle, a Computer Engineering student and technology enthusiast from Nepal with a strong
            interest in <em className="t-serif-i text-shu">Artificial Intelligence</em>, Machine Learning, Software
            Engineering, Computer Vision, and emerging technologies.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12">
            <div className="about-block md:col-span-5 md:col-start-2">
              <span className="t-label block text-shu">Method — 方法</span>
              <p className="mt-4 text-[1.05rem] leading-[1.5] md:text-[1.15rem]" style={{ fontVariationSettings: '"opsz" 24, "wght" 380' }}>
                I enjoy taking an idea, understanding the underlying problem, researching possible technologies,
                building a prototype, debugging it, and turning it into a functional product.
              </p>
            </div>
            <div className="about-block md:col-span-5 md:col-start-8 md:mt-24">
              <span className="t-label block text-shu">Range — 範囲</span>
              <p className="mt-4 text-[1.05rem] leading-[1.5] md:text-[1.15rem]" style={{ fontVariationSettings: '"opsz" 24, "wght" 380' }}>
                I have explored full-stack development, mobile applications, cloud platforms, databases, machine
                learning, computer vision, Large Language Models, AI APIs and local AI systems.
              </p>
            </div>
          </div>

          {/* process strip — the method, as a diagram */}
          <div className="mt-20 hairline-t pt-6 md:mt-28">
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-3 t-meta">
              {["Idea", "Problem", "Research", "Prototype", "Debug", "Product"].map((s, i, a) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="text-fg">{s}</span>
                  {i < a.length - 1 && <span aria-hidden className="text-shu">→</span>}
                </li>
              ))}
              <li className="ml-auto flex items-center gap-4">
                <span>Origin — Nepal</span>
                <Seal className="about-seal" text="学" />
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
