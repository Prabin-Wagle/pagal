import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Props = { onDone: () => void };

/** Short cinematic opener: a counter inks up, the name registers, the curtain lifts. */
export default function Preloader({ onDone }: Props) {
  const [show, setShow] = useState(true);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShow(false);
      onDone();
      return;
    }
    const state = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setShow(false);
        onDone();
      },
    });
    tl.to(state, {
      v: 100,
      duration: 1.5,
      ease: "power3.inOut",
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(state.v)).padStart(3, "0");
      },
    })
      .to(bar.current, { scaleX: 1, duration: 1.5, ease: "power3.inOut" }, 0)
      .to({}, { duration: 0.25 });
    return () => {
      tl.kill();
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="pre"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[300] flex flex-col justify-between bg-ink px-5 py-6 text-paper md:px-8 md:py-8"
          style={{ clipPath: "inset(0 0 0% 0)" }}
          aria-hidden
        >
          <div className="flex items-start justify-between">
            <span className="t-label text-ash">Loading — 読込</span>
            <span className="font-jp vertical-rl text-xs tracking-[0.5em] text-ash">プラビン・ワグレ</span>
          </div>
          <div>
            <span ref={num} className="font-display block text-[22vw] leading-[0.8] md:text-[14vw]">
              000
            </span>
            <span className="relative mt-4 block h-px w-full bg-paper/15">
              <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-shu" />
            </span>
            <div className="mt-3 flex justify-between t-label text-ash">
              <span>Prabin Wagle</span>
              <span>Vol. I</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
