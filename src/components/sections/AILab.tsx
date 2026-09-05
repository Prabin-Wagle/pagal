import { useEffect, useRef } from "react";
import { animate, svg, stagger } from "animejs";
import { LLM_TOPICS } from "@/data/content";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SectionMark from "@/components/ui/SectionMark";

const L = { stroke: "currentColor", fill: "none", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };

const MODELS = ["DeepSeek", "Mistral", "GPT-OSS", "Hugging Face"];
const OUTPUTS = ["AI agents", "Model serving", "Fine-tuning", "Applications"];

/** System diagram: models → local gateway → software. Tokens flow along the wires. */
function SystemDiagram() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const anims = Array.from(el.querySelectorAll<SVGPathElement>(".wire")).map((path, i) => {
      const dot = el.querySelector<SVGCircleElement>(`.tok-${i}`);
      if (!dot) return null;
      const { translateX, translateY } = svg.createMotionPath(path);
      return animate(dot, {
        translateX,
        translateY,
        duration: 2600 + (i % 4) * 500,
        delay: i * 320,
        ease: "inOut(2)",
        loop: true,
      });
    });
    const pulse = animate(el.querySelectorAll(".core"), {
      scale: [1, 1.06, 1],
      duration: 2400,
      ease: "inOut(2)",
      loop: true,
      delay: stagger(200),
      transformOrigin: "center",
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        anims.forEach((animation) => animation?.[entry.isIntersecting ? "play" : "pause"]());
        pulse[entry.isIntersecting ? "play" : "pause"]();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      anims.forEach((a) => a?.pause());
      pulse.pause();
    };
  }, []);

  const inY = [70, 130, 190, 250];
  const outY = [70, 130, 190, 250];

  return (
    <svg ref={ref} viewBox="0 0 800 320" className="h-full w-full text-fg" aria-hidden>
      {/* inputs */}
      {MODELS.map((m, i) => (
        <g key={m}>
          <rect x={20} y={inY[i] - 16} width={150} height={32} {...L} />
          <text x={36} y={inY[i] + 4} fill="currentColor" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em" }}>
            {m.toUpperCase()}
          </text>
          <path className="wire" d={`M170 ${inY[i]} C 260 ${inY[i]}, 260 160, 330 160`} {...L} opacity={0.5} />
        </g>
      ))}
      {/* gateway core */}
      <g className="core">
        <rect x={330} y={100} width={140} height={120} {...L} strokeWidth={1.5} />
        <rect x={342} y={112} width={116} height={96} {...L} strokeDasharray="2 3" opacity={0.6} />
        <text x={400} y={150} textAnchor="middle" fill="currentColor" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em" }}>
          OLLAMA
        </text>
        <text x={400} y={166} textAnchor="middle" fill="var(--color-shu)" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em" }}>
          LOCAL INFERENCE
        </text>
        <text x={400} y={182} textAnchor="middle" fill="currentColor" opacity={0.6} style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em" }}>
          AI GATEWAY
        </text>
      </g>
      {/* outputs */}
      {OUTPUTS.map((o, i) => (
        <g key={o}>
          <path className="wire" d={`M470 160 C 540 160, 540 ${outY[i]}, 630 ${outY[i]}`} {...L} opacity={0.5} />
          <rect x={630} y={outY[i] - 16} width={150} height={32} {...L} />
          <text x={646} y={outY[i] + 4} fill="currentColor" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em" }}>
            {o.toUpperCase()}
          </text>
        </g>
      ))}
      {/* tokens */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} className={`tok-${i}`} r={3} fill={i % 3 === 0 ? "var(--color-shu)" : "currentColor"} />
      ))}
      <text x={20} y={300} fill="currentColor" opacity={0.5} style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em" }}>
        FIG. 04 — MODELS AS COMPONENTS, NOT DESTINATIONS
      </text>
    </svg>
  );
}

export default function AILab() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // headline: two halves slide from opposite sides and lock
      gsap.from(q(".ai-h-a"), { xPercent: -30, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: q(".ai-head"), start: "top 80%" } });
      gsap.from(q(".ai-h-b"), { xPercent: 30, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: q(".ai-head"), start: "top 80%" } });

      // topics decode with scramble text
      gsap.utils.toArray<HTMLElement>(q(".ai-topic")).forEach((el, i) => {
        const text = el.dataset.text ?? "";
        gsap.fromTo(
          el,
          { scrambleText: { text: "", chars: "01" } },
          {
            scrambleText: { text, chars: "01▮▯", speed: 0.6, revealDelay: 0.2 },
            duration: 1.1,
            delay: i * 0.08,
            ease: "none",
            scrollTrigger: { trigger: q(".ai-topics"), start: "top 80%" },
          },
        );
      });

      // terminal types itself
      const lines = q(".term-line");
      gsap.set(lines, { opacity: 0 });
      gsap.to(lines, { opacity: 1, stagger: 0.45, duration: 0.01, scrollTrigger: { trigger: q(".ai-term"), start: "top 75%" } });

      // diagram frame reveal
      gsap.from(q(".ai-diagram"), { clipPath: "inset(0 0 100% 0)", duration: 1.6, ease: "power4.inOut", scrollTrigger: { trigger: q(".ai-diagram"), start: "top 80%" } });
    },
    { scope: root },
  );

  return (
    <section id="ai" ref={root} data-theme="ink" className="relative overflow-hidden px-5 py-28 md:px-8 md:py-40 lg:px-12" aria-labelledby="ai-title">
      <SectionMark n="04" label="AI / ML — Exploration" jp="知能" />

      <div className="ai-head mt-12 md:mt-16">
        <h2 id="ai-title" className="t-display text-[clamp(3rem,13vw,13rem)] leading-[0.82]">
          <span className="ai-h-a block">Beyond</span>
          <span className="ai-h-b block pl-[12vw] outline-text">the chatbot</span>
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="t-serif-i text-[1.5rem] leading-[1.15] md:text-[2rem]">
            A model is not the product. It is a component — one that can be pulled, served locally, wired to tools
            and placed inside a larger system.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted" style={{ fontVariationSettings: '"opsz" 24, "wght" 380' }}>
            I run open-source models locally, connect LLM APIs into applications, and explore how agents, gateways
            and serving layers turn language models into infrastructure.
          </p>

          <ul className="ai-topics mt-10 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[0.78rem] uppercase tracking-[0.12em]">
            {LLM_TOPICS.map((t) => (
              <li key={t} className="flex items-baseline gap-2 hairline-b py-2">
                <span className="text-shu">▸</span>
                <span className="ai-topic" data-text={t}>
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-8">
          <div className="ai-diagram border border-[var(--line)] p-4 md:p-8">
            <div className="aspect-[5/2] w-full">
              <SystemDiagram />
            </div>
          </div>

          <div className="ai-term mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
            <pre className="md:col-span-8 overflow-x-auto border border-[var(--line)] p-5 font-mono text-[0.72rem] leading-[1.7] text-muted md:text-[0.78rem]">
              <span className="term-line block"><span className="text-shu">$</span> ollama pull mistral</span>
              <span className="term-line block">pulling manifest … <span className="text-fg">done</span></span>
              <span className="term-line block"><span className="text-shu">$</span> ollama pull deepseek-r1</span>
              <span className="term-line block">pulling manifest … <span className="text-fg">done</span></span>
              <span className="term-line block"><span className="text-shu">$</span> curl localhost:11434/api/generate -d {"'{\"model\":\"mistral\",\"prompt\":\"…\"}'"}</span>
              <span className="term-line block text-fg">{"{\"model\":\"mistral\",\"response\":\"…\",\"done\":true}"}</span>
              <span className="term-line block"><span className="text-shu">$</span> <span className="animate-pulse">▮</span></span>
            </pre>
            <div className="md:col-span-4 flex flex-col justify-between border border-[var(--line)] p-5">
              <span className="t-label">Working notes</span>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Local first, API when it matters. The interesting problems start once the model is just another
                function call.
              </p>
              <span className="font-jp mt-6 text-2xl">言語 → 部品</span>
            </div>
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="mt-20 overflow-hidden hairline-t hairline-b py-4 md:mt-28" aria-hidden>
        <div className="marquee-track gap-10 t-meta">
          {[...LLM_TOPICS, ...LLM_TOPICS].map((t, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {t} <span className="text-shu">●</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
