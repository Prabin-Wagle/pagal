import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CAPABILITIES } from "@/data/content";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SectionMark from "@/components/ui/SectionMark";
import Diagram from "@/components/ui/Diagram";
import { useIsDesktop } from "@/hooks/useMedia";

export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [openMobile, setOpenMobile] = useState<number | null>(0);
  const desktop = useIsDesktop();
  const cap = CAPABILITIES[active];

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // rows cut in fast from the left, one after another — a typographic edit, not a fade
      gsap.from(q(".cap-row"), {
        xPercent: -6,
        clipPath: "inset(0 100% 0 0)",
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.07,
        scrollTrigger: { trigger: q(".cap-list"), start: "top 75%" },
      });
      gsap.from(q(".cap-panel"), {
        clipPath: "inset(100% 0 0 0)",
        duration: 1.4,
        ease: "power4.inOut",
        scrollTrigger: { trigger: q(".cap-list"), start: "top 75%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="capabilities"
      ref={root}
      data-theme="ink"
      className="relative px-5 py-28 md:px-8 md:py-40 lg:px-12"
      aria-labelledby="cap-title"
    >
      <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
        <SectionMark n="02" label="Capabilities" jp="領域" />
        <h2 id="cap-title" className="t-display max-w-[12ch] text-[clamp(2.6rem,7vw,6.5rem)]">
          What I <span className="t-serif-i normal-case text-shu">build</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* index */}
        <ul className="cap-list lg:col-span-7" onMouseLeave={() => undefined}>
          {CAPABILITIES.map((c, i) => {
            const isActive = active === i;
            return (
              <li key={c.n} className="cap-row hairline-b">
                <button
                  type="button"
                  onMouseEnter={() => desktop && setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => {
                    setActive(i);
                    setOpenMobile(openMobile === i ? null : i);
                  }}
                  data-cursor="link"
                  aria-expanded={!desktop ? openMobile === i : undefined}
                  className="group flex w-full items-baseline gap-4 py-4 text-left md:gap-8 md:py-5"
                >
                  <span className="font-mono text-xs text-muted transition-colors group-hover:text-shu">{c.n}</span>
                  <span
                    className="font-sans text-[clamp(1.6rem,4.6vw,3.6rem)] leading-[1] transition-[font-variation-settings,color,letter-spacing] duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)]"
                    style={{
                      fontVariationSettings: isActive ? '"opsz" 96, "wdth" 100, "wght" 700' : '"opsz" 96, "wdth" 85, "wght" 260',
                      letterSpacing: isActive ? "-0.02em" : "0em",
                      color: isActive ? "var(--fg)" : "var(--muted)",
                    }}
                  >
                    {c.title}
                  </span>
                  <span className="ml-auto hidden font-jp text-sm text-muted md:block">{c.jp}</span>
                </button>

                {/* mobile / tablet expansion */}
                {!desktop && (
                  <AnimatePresence initial={false}>
                    {openMobile === i && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[1fr_96px] gap-6 pb-6 pl-8">
                          <div>
                            <p className="t-serif-i text-xl">{c.short}</p>
                            <p className="mt-2 text-sm leading-relaxed text-muted">{c.detail}</p>
                            <p className="t-meta mt-3">{c.meta.join(" · ")}</p>
                          </div>
                          <Diagram kind={c.diagram} className="h-24 w-24 text-fg" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>

        {/* sticky diagram panel — desktop */}
        {desktop && (
          <div className="lg:col-span-5">
            <div className="cap-panel sticky top-24 border border-[var(--line)] p-8">
              <div className="flex items-start justify-between">
                <span className="t-label">Fig. {cap.n}</span>
                <span className="font-jp text-lg">{cap.jp}</span>
              </div>
              <div className="relative mx-auto my-8 aspect-square w-[62%] text-fg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={cap.diagram}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <Diagram kind={cap.diagram} className="h-full w-full" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={cap.n}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="t-serif-i text-2xl leading-tight">{cap.short}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{cap.detail}</p>
                  <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 t-meta">
                    {cap.meta.map((m) => (
                      <li key={m} className="ink-dot">
                        {m}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
              <div className="mt-8 flex items-center justify-between hairline-t pt-4 t-meta">
                <span>
                  {cap.n} / {String(CAPABILITIES.length).padStart(2, "0")}
                </span>
                <span>Hover to explore</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
