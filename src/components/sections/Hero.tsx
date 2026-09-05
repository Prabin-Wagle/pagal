import { useRef } from "react";
import { gsap, useGSAP, SplitText, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { scrollToHash } from "@/components/ui/Nav";

type Props = { ready: boolean };

export default function Hero({ ready }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ready || !root.current) return;
      const q = gsap.utils.selector(root);
      const reduced = prefersReducedMotion();

      if (reduced) {
        sceneState.intro = 1;
        gsap.set(q(".hero-fade"), { opacity: 1 });
        return;
      }

      const first = new SplitText(q(".hero-first"), { type: "chars", charsClass: "char" });
      const last = new SplitText(q(".hero-last"), { type: "chars", charsClass: "char" });
      const statement = new SplitText(q(".hero-statement"), { type: "lines", linesClass: "line-mask", mask: "lines" });
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(sceneState, { intro: 1, duration: 2.4, ease: "power3.inOut" }, 0)
        .from(
          first.chars,
          { yPercent: 120, rotate: 6, transformOrigin: "0% 100%", duration: 1.4, stagger: { each: 0.045, from: "start" } },
          0.15,
        )
        .from(
          last.chars,
          { yPercent: -120, rotate: -4, transformOrigin: "100% 0%", duration: 1.4, stagger: { each: 0.045, from: "end" } },
          0.3,
        )
        .from(q(".hero-rule"), { scaleX: 0, transformOrigin: "0 0", duration: 1.4, ease: "power4.inOut" }, 0.4)
        .from(statement.lines, { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.9)
        .fromTo(q(".hero-fade"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1, stagger: 0.06 }, 1.1)
        .from(q(".hero-vertical"), { yPercent: 20, opacity: 0, duration: 1.6 }, 1.0)
        .from(q(".hero-scroll-line"), { scaleY: 0, transformOrigin: "0 0", duration: 1.2 }, 1.6);

      // scroll-scrubbed exit; also drives the sculpture
      const exit = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => {
            sceneState.scroll = self.progress;
          },
        },
      });
      exit
        // no letterSpacing here: it's a layout property and would reflow the
        // display-size title on every scroll frame
        .to(q(".hero-first"), { xPercent: -18, ease: "none" }, 0)
        .to(q(".hero-last"), { xPercent: 12, ease: "none" }, 0)
        .to(q(".hero-statement"), { yPercent: -60, opacity: 0, ease: "none" }, 0)
        .to(q(".hero-fade, .hero-vertical, .hero-scroll"), { opacity: 0, ease: "none" }, 0)
        .to(q(".hero-title"), { opacity: 0.15, ease: "none" }, 0.3);

      ScrollTrigger.refresh();
      return () => {
        first.revert();
        last.revert();
        statement.revert();
      };
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-8 pt-28 md:px-8 md:pb-10 lg:px-12"
      aria-label="Introduction"
    >
      {/* top metadata row */}
      <div className="hero-fade relative z-10 grid grid-cols-2 gap-4 opacity-0 md:grid-cols-12">
        <p className="t-meta md:col-span-3">
          Computer Engineering Student
          <br />
          AI • ML • Software
        </p>
        <p className="t-meta hidden md:col-span-3 md:block">
          Fig. 01 — Computational ink
          <br />
          morphs on scroll · reacts to cursor
        </p>
        <p className="t-meta text-right md:col-span-6 md:col-start-10">
          Portfolio
          <br />
          Vol. I — 2026
        </p>
      </div>

      {/* title block */}
      <div className="hero-title relative z-10 mt-auto">
        <h1 className="t-display flex flex-col text-[clamp(4.6rem,20vw,19rem)] leading-[0.82] md:text-[clamp(6rem,16.5vw,21rem)]">
          <span className="hero-first block overflow-hidden pb-[0.05em] will-change-transform">Prabin</span>
          <span className="hero-last block overflow-hidden pb-[0.05em] pl-[0.28em] will-change-transform md:pl-[0.55em]">
            Wagle
          </span>
        </h1>

        <div className="hero-rule mt-6 h-px w-full bg-current opacity-30 md:mt-8" />

        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-12 md:gap-8">
          <p className="hero-statement t-serif-i col-span-1 max-w-[30ch] text-[1.35rem] leading-[1.15] md:col-span-6 md:text-[2rem] lg:col-span-5 lg:text-[2.3rem]">
            I build intelligent systems and experimental software at the intersection of AI, engineering and
            emerging technology.
          </p>

          <div className="hero-fade col-span-1 flex items-end justify-between gap-6 opacity-0 md:col-span-6 md:col-start-8 lg:col-span-5 lg:col-start-8">
            <ul className="t-meta space-y-1">
              <li>— Artificial Intelligence</li>
              <li>— Machine Learning &amp; Vision</li>
              <li>— Software Engineering</li>
            </ul>
            <button
              type="button"
              onClick={() => scrollToHash("#about")}
              data-cursor="link"
              className="hero-scroll group flex items-center gap-3"
              aria-label="Scroll to about"
            >
              <span className="t-label">Scroll</span>
              <span className="hero-scroll-line relative block h-14 w-px overflow-hidden bg-current/30">
                <span className="absolute inset-x-0 top-0 h-1/2 bg-shu animate-[scrollline_2.2s_cubic-bezier(.76,0,.24,1)_infinite]" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* vertical katakana — Japanese editorial signature */}
      <div className="hero-vertical pointer-events-none absolute right-5 top-28 z-10 hidden select-none md:right-8 md:block lg:right-12">
        <p className="vertical-rl font-jp text-[13px] tracking-[0.5em] text-muted">
          プラビン・ワグレ　—　知能と工学の交差点
        </p>
      </div>

      {/* oversized ghost index */}
      <span className="pointer-events-none absolute -right-4 bottom-[26%] z-0 hidden font-display text-[26vw] leading-none text-paper/[0.035] md:block">
        00
      </span>

      <style>{`@keyframes scrollline{0%{transform:translateY(-100%)}60%{transform:translateY(200%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
