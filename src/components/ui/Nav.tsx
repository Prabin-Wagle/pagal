import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV, LINKS } from "@/data/content";
import { gsap } from "@/lib/gsap";
import { getLenis, scrollToHash } from "@/lib/lenis";
import Magnetic from "./Magnetic";

export { scrollToHash };

const EASE = [0.76, 0, 0.24, 1] as const;

/** true only on devices with a real hover pointer (mouse/trackpad) */
function useCanHover() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return canHover;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const pendingScroll = useRef<gsap.core.Tween | null>(null);
  const canHover = useCanHover();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;

    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      lenis?.start();
      setHovered(null);
    };
  }, [open]);

  useEffect(
    () => () => {
      pendingScroll.current?.kill();
    },
    [],
  );

  const go = (href: string) => {
    setOpen(false);
    pendingScroll.current?.kill();
    pendingScroll.current = gsap.delayedCall(open ? 0.55 : 0, () => {
      pendingScroll.current = null;
      scrollToHash(href);
    });
  };

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex items-center justify-between px-4 mix-blend-difference text-paper sm:px-5 md:px-8"
        style={{ paddingTop: "max(1.1rem, env(safe-area-inset-top))" }}
      >
        <Magnetic strength={0.25} className="pointer-events-auto">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            data-cursor="link"
            className="group flex min-h-[44px] items-center gap-3"
            aria-label="Back to top"
          >
            <span className="font-display text-lg leading-none tracking-tight sm:text-xl">PW</span>
            <span className="font-jp hidden text-[11px] tracking-[0.3em] opacity-70 transition-opacity group-hover:opacity-100 sm:block">
              プラビン
            </span>
          </a>
        </Magnetic>

        <div className="pointer-events-auto flex items-center gap-4 sm:gap-6">
          <span className="t-label hidden opacity-70 md:block">Nepal · CE Student</span>
          <Magnetic strength={0.3}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              data-cursor="link"
              aria-expanded={open}
              aria-controls="site-index"
              className="-mr-2 flex min-h-[44px] items-center gap-3 px-2"
            >
              <span className="t-label">{open ? "Close" : "Index"}</span>
              <span className="relative block h-4 w-7 sm:w-8">
                <motion.span
                  animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute left-0 top-0 block h-px w-full bg-current"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: 0, width: "100%" } : { rotate: 0, y: 14, width: "60%" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute left-0 top-0 block h-px bg-current"
                />
              </span>
            </button>
          </Magnetic>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-index"
            key="menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-0 z-[110] flex h-screen flex-col bg-ink text-paper supports-[height:100dvh]:h-[100dvh]"
            aria-label="Site index"
          >
            {/* guide lines */}
            <div className="pointer-events-none absolute inset-y-0 right-[8vw] hidden w-px bg-paper/10 lg:block" />
            <div className="pointer-events-none absolute left-[8vw] top-0 hidden h-full w-px bg-paper/10 lg:block" />

            {/* scrollable body — falls back to scrolling on very short viewports */}
            {/* scrollable body — falls back to scrolling on very short viewports */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 sm:px-8 md:px-[8vw] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="my-auto pb-6 pt-20 sm:pt-24">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="t-label mb-4 block text-ash sm:mb-6 md:mb-10"
                >
                  Index — 目次
                </motion.span>

                <ul className="flex flex-col" onMouseLeave={() => canHover && setHovered(null)}>
                  {NAV.map((item, i) => {
                    const dim = canHover && hovered !== null && hovered !== i;
                    return (
                      <li key={item.href} className="overflow-hidden">
                        <motion.a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            go(item.href);
                          }}
                          onMouseEnter={() => canHover && setHovered(i)}
                          data-cursor="link"
                          initial={{ y: "110%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "-110%", transition: { duration: 0.4, delay: i * 0.03 } }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.06 }}
                          className="group flex items-baseline gap-3 border-b border-paper/10 py-2 sm:gap-4 md:gap-8 md:py-3"
                          style={{ opacity: dim ? 0.28 : 1, transition: "opacity .4s" }}
                        >
                          <span className="font-mono text-[10px] text-shu sm:text-xs md:text-sm">{item.n}</span>
                          {/* size is capped by both width AND height so 6 items always fit on landscape phones */}
                          <span className="t-display truncate leading-[0.95] text-[clamp(2rem,min(12vw,8.5svh),5rem)] transition-transform duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-4 md:text-[clamp(2.5rem,min(7.5vw,9svh),8rem)] lg:text-[clamp(3rem,min(6vw,10svh),9rem)]">
                            {item.label}
                          </span>
                          <span className="font-jp ml-auto hidden shrink-0 text-sm text-ash transition-colors group-hover:text-paper sm:block md:text-lg">
                            {item.jp}
                          </span>
                        </motion.a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex shrink-0 flex-col gap-5 border-t border-paper/10 px-5 pt-5 sm:px-8 md:flex-row md:items-end md:justify-between md:border-0 md:px-[8vw] md:pt-0"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    data-cursor="link"
                    className="t-label inline-flex min-h-[44px] items-center text-ash hover:text-paper md:min-h-0"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <p className="t-label hidden max-w-[14rem] text-ash sm:block md:text-right">
                Building intelligent systems at the intersection of AI, software & real-world problems.
              </p>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
