import { useRef } from "react";
import { gsap, useGSAP, isTouch } from "@/lib/gsap";
import { Seal } from "@/components/ui/SectionMark";

const LINES = [
  { en: "Learn deeply.", jp: "深く学ぶ" },
  { en: "Build continuously.", jp: "作り続ける" },
  { en: "Question everything.", jp: "全てを疑う" },
];

export default function Philosophy() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const lines = q(".ph-line");
        const jps = q(".ph-jp");
        gsap.set(lines, { clipPath: "inset(0 100% 0 0)" });
        // pinned: each statement wipes in as solid ink, then recedes into an outline as the next arrives
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: q(".ph-stage"),
            start: "top top",
            // touch: shorter pin — less time scrubbing clip-path on mobile GPUs
            end: () => (isTouch() ? "+=150%" : "+=220%"),
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        lines.forEach((line, i) => {
          tl.fromTo(line, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "none" }, i * 1.4);
          tl.fromTo(jps[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, i * 1.4 + 0.4);
          if (i < lines.length - 1) {
            tl.to(line, { color: "transparent", webkitTextStroke: "1px var(--fg)", duration: 0.7, ease: "none" }, (i + 1) * 1.4);
          }
        });
        tl.to({}, { duration: 0.6 });

        gsap.from(q(".ph-body"), {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.4,
          ease: "power4.inOut",
          scrollTrigger: { trigger: q(".ph-body"), start: "top 85%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="philosophy" ref={root} data-theme="ink" className="relative" aria-labelledby="ph-title">
      <div className="ph-stage flex min-h-screen flex-col justify-center px-5 py-24 md:px-8 lg:px-12">
        <span className="t-label mb-8 text-shu">Philosophy — 哲学</span>
        <h2 id="ph-title" className="sr-only">
          Learn deeply. Build continuously. Question everything.
        </h2>
        <div aria-hidden className="flex flex-col gap-2 md:gap-4">
          {LINES.map((l) => (
            <div key={l.en} className="flex flex-col gap-1 md:flex-row md:items-end md:gap-8">
              <span className="ph-line t-display block text-[clamp(2.6rem,9.5vw,9.6rem)] leading-[0.9]">
                {l.en}
              </span>
              <span className="ph-jp font-jp pb-2 text-base tracking-[0.4em] text-muted md:text-xl">{l.jp}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ph-body grid grid-cols-1 gap-10 px-5 pb-32 pt-10 md:grid-cols-12 md:px-8 md:pb-44 lg:px-12">
        <div className="md:col-span-6 md:col-start-5 lg:col-span-5 lg:col-start-6">
          <p className="font-serif text-[1.6rem] leading-[1.15] md:text-[2.2rem]">
            I believe the best way to understand technology is to build with it, encounter problems, investigate why
            they happen, and improve until the underlying concept becomes clear.
          </p>
          <p className="mt-8 text-[1.05rem] leading-[1.5] text-muted" style={{ fontVariationSettings: '"opsz" 24, "wght" 380' }}>
            For me, every project is an opportunity to learn something I didn't know before.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Seal text="学" />
            <span className="t-meta">Prabin Wagle — 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
