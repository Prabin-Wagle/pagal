import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import Magnetic from "@/components/ui/Magnetic";

const LostInkScene = lazy(() => import("@/components/three/LostInkScene"));

/* ------------------------------------------------------------------ */
/* Copy — editorial voice, zero mercy                                   */
/* ------------------------------------------------------------------ */
const JOKES = [
  "This page pulled a disappearing jutsu. No smoke bomb. Just gone.",
  "My AI searched 47 dimensions. The page wasn't in any of them.",
  "The 0 in the middle is holding it together. Barely.",
  "Even the training data has never seen this URL.",
  "404: the page achieved enlightenment and left the server.",
  "I asked the LLM where it went. It hallucinated three answers.",
  "Somewhere, a semicolon is laughing at you.",
];

const POKE_LABELS = [
  "poke the void",
  "the void felt that",
  "it blinked. did you see that?",
  "okay now they're dizzy",
  "stop it, they're trying their best",
  "certified void-botherer",
];

const TERM_LINES = [
  "$ locate lost-page --everywhere",
  "▸ searching 47 dimensions……………",
  "▸ checking behind the couch………… nah",
  "▸ asking the LLM……………………… it lied",
  "✕ result: page not found (but these guys were)",
];

function useRotator(length: number, interval = 3200) {
  const [i, setI] = useState(0);
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % length), interval);
    return () => window.clearInterval(id);
  }, [length, interval, reduced]);
  return i;
}

export default function NotFound() {
  const root = useRef<HTMLDivElement>(null);
  const [pokeSignal, setPokeSignal] = useState(0);
  const joke = useRotator(JOKES.length);
  const [termCount, setTermCount] = useState(0);

  // fake terminal types itself out
  useEffect(() => {
    if (prefersReducedMotion()) {
      setTermCount(TERM_LINES.length);
      return;
    }
    if (termCount >= TERM_LINES.length) return;
    const id = window.setTimeout(() => setTermCount((c) => c + 1), termCount === 0 ? 900 : 650);
    return () => window.clearTimeout(id);
  }, [termCount]);

  // page chrome: ink theme, top of page, title, "B beams you home"
  useEffect(() => {
    document.body.dataset.theme = "ink";
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title = "404 — Lost in the ink · Prabin Wagle";
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && !e.metaKey && !e.ctrlKey) window.location.href = "/";
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.title = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const split = new SplitText(q(".nf-headline"), { type: "lines", linesClass: "line-mask", mask: "lines" });
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(q(".nf-meta"), { opacity: 0, y: 10, duration: 0.9, stagger: 0.07 }, 0.1)
        .from(q(".nf-diorama"), { opacity: 0, scale: 0.96, duration: 1.4, ease: "power3.out" }, 0.2)
        .from(split.lines, { yPercent: 115, duration: 1.2, stagger: 0.1 }, 0.5)
        .fromTo(q(".nf-fade"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.8);
      return () => split.revert();
    },
    { scope: root },
  );

  const pokeLabel = POKE_LABELS[Math.min(pokeSignal, POKE_LABELS.length - 1)];

  return (
    <div ref={root} className="relative min-h-svh overflow-hidden bg-ink text-paper">
      <div className="grain" aria-hidden />

      {/* minimal header — same blend trick as the main nav */}
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex items-center justify-between px-4 text-paper mix-blend-difference sm:px-5 md:px-8"
        style={{ paddingTop: "max(1.1rem, env(safe-area-inset-top))" }}
      >
        <a href="/" data-cursor="link" className="pointer-events-auto flex min-h-[44px] items-center gap-3" aria-label="Back home">
          <span className="font-display text-lg leading-none tracking-tight sm:text-xl">PW</span>
          <span className="font-jp hidden text-[11px] tracking-[0.3em] opacity-70 sm:block">プラビン</span>
        </a>
        <a href="/" data-cursor="link" className="t-label pointer-events-auto flex min-h-[44px] items-center opacity-70 transition-opacity hover:opacity-100">
          Beam home ↑
        </a>
      </header>

      <main className="relative z-[1] px-5 pb-10 pt-28 md:px-8 md:pt-32 lg:px-12">
        {/* meta row — mirrors the hero's Fig. 01 strip */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-12">
          <p className="nf-meta t-meta md:col-span-3">
            Error 404 — 迷子<br />
            page evaporated mid-render
          </p>
          <p className="nf-meta t-meta hidden md:col-span-3 md:block">
            Fig. 404 — runaway digits
            <br />
            they have eyes · they judge
          </p>
          <p className="nf-meta t-meta text-right md:col-span-6 md:col-start-10">
            Portfolio
            <br />
            Vol. I — 2026
          </p>
        </div>

        {/* the void diorama — the three.js digits ARE the 404 */}
        <div className="nf-diorama relative mt-6 h-[44svh] min-h-[320px] overflow-hidden border border-paper/10 bg-ink-2/60 md:h-[50svh]">
          <Suspense fallback={null}>
            <LostInkScene pokeSignal={pokeSignal} />
          </Suspense>

          {/* corner annotations, diagram-style */}
          <span className="t-label pointer-events-none absolute left-4 top-4 text-ash">VOID-01 // live render</span>
          <span className="t-label pointer-events-none absolute right-4 top-4 hidden text-ash sm:block">drag? no. stare? yes.</span>
          <span className="t-label pointer-events-none absolute bottom-4 left-4 hidden text-ash md:block">
            L — 4 · C — 0 (overachiever) · R — 4 (drunk)
          </span>

          <div className="absolute bottom-4 right-4">
            <Magnetic strength={0.3}>
              <button
                type="button"
                onClick={() => setPokeSignal((s) => s + 1)}
                data-cursor="link"
                className="t-label border border-paper/25 bg-ink/70 px-4 py-2 backdrop-blur-sm transition-colors duration-300 hover:border-shu hover:text-shu"
              >
                {pokeSignal > 0 ? `(${pokeSignal}) ` : ""}◉ {pokeLabel}
              </button>
            </Magnetic>
          </div>

          {/* vermilion seal */}
          <span className="pointer-events-none absolute left-4 top-10 hidden h-8 w-8 items-center justify-center bg-shu font-jp text-sm text-paper md:flex" aria-hidden>
            迷
          </span>
        </div>

        {/* headline + rotating excuse */}
        <h1 className="nf-headline t-serif-i mt-10 max-w-[22ch] text-[clamp(2rem,6vw,4.5rem)] leading-[1.02]">
          Well. This is awkward. The page you're after ghosted everyone.
        </h1>

        <div className="nf-fade mt-6 flex min-h-[3.5rem] items-start gap-3" aria-live="polite">
          <span className="mt-[0.55rem] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-shu" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.p
              key={joke}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[52ch] text-[1.05rem] leading-snug text-paper/80"
            >
              {JOKES[joke]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* fake terminal */}
        <div className="nf-fade mt-8 max-w-2xl border border-paper/10 bg-ink-2/60 p-5 font-mono text-[0.8rem] leading-[1.9] md:text-[0.85rem]">
          <div className="t-label mb-3 flex items-center justify-between text-ash">
            <span>prabin@void — zsh</span>
            <span className="flex gap-1.5" aria-hidden>
              <i className="block h-2 w-2 rounded-full bg-paper/20" />
              <i className="block h-2 w-2 rounded-full bg-paper/20" />
              <i className="block h-2 w-2 rounded-full bg-shu" />
            </span>
          </div>
          {TERM_LINES.slice(0, termCount).map((l) => (
            <p key={l} className={l.startsWith("✕") ? "text-shu" : l.startsWith("$") ? "text-paper" : "text-ash"}>
              {l}
            </p>
          ))}
          {termCount < TERM_LINES.length && <span className="nf-caret inline-block h-4 w-2 translate-y-[3px] bg-shu" aria-hidden />}
        </div>

        {/* actions — same slide-fill buttons as the contact footer */}
        <div className="nf-fade mt-10 flex flex-wrap items-center gap-4">
          <Magnetic strength={0.3}>
            <a
              href="/"
              data-cursor="link"
              className="group relative inline-flex items-center gap-3 overflow-hidden border border-current px-7 py-3 t-label"
            >
              <span className="absolute inset-0 -translate-x-full bg-paper transition-transform duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0" aria-hidden />
              <span className="relative transition-colors duration-500 group-hover:text-ink">Beam me home</span>
              <span className="relative transition-all duration-500 group-hover:translate-x-1 group-hover:text-ink">↗</span>
            </a>
          </Magnetic>
          <Magnetic strength={0.3}>
            <a
              href="mailto:prabinwagle20@gmail.com?subject=Found%20a%20black%20hole%20on%20your%20site"
              data-cursor="link"
              className="t-label inline-flex items-center gap-2 px-2 py-3 text-ash transition-colors hover:text-paper"
            >
              <span className="brush-underline">Report a black hole</span>
              <span aria-hidden>↗</span>
            </a>
          </Magnetic>
          <span className="t-label hidden text-ash/60 lg:inline">— or press B, like a protagonist</span>
        </div>

        {/* stats strip */}
        <div className="nf-fade hairline-t mt-14 flex flex-col gap-2 pt-5 t-meta md:flex-row md:items-center md:justify-between">
          <span>lost count: 004 · dignity: recovering</span>
          <span className="hidden md:inline">suspects: a missing slash, a typo, fate</span>
          <span>coordinates of page: unknown · of me: Nepal</span>
        </div>
      </main>

      {/* vertical katakana signature + ghost digits */}
      <div className="pointer-events-none absolute right-5 top-28 z-[1] hidden select-none md:right-8 md:block lg:right-12" aria-hidden>
        <p className="vertical-rl font-jp text-[13px] tracking-[0.5em] text-paper/40">迷子 — まいご — lost child</p>
      </div>
      <span className="pointer-events-none absolute -bottom-[4vw] left-0 z-0 select-none font-display text-[30vw] leading-none text-paper/[0.04]" aria-hidden>
        404
      </span>

      <style>{`.nf-caret{animation:blink 1s steps(2) infinite}@keyframes blink{50%{opacity:0}}`}</style>
    </div>
  );
}
