import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { LINKS } from "@/data/content";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import Magnetic from "@/components/ui/Magnetic";
import { scrollToHash } from "@/components/ui/Nav";

type Status = "idle" | "loading" | "success" | "error";

const FIELDS = ["name", "email", "message"] as const;
type FieldName = (typeof FIELDS)[number];
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateField(field: FieldName, value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Required.";
  switch (field) {
    case "name":
      if (v.length < 2) return "Name must be at least 2 characters.";
      break;
    case "email":
      if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
      break;
    case "message":
      if (v.length < 10) return "Message must be at least 10 characters.";
      break;
  }
  return undefined;
}

const inputClass =
  "w-full border-b border-current/25 bg-transparent py-3 text-lg placeholder:text-muted/60 outline-none transition-colors duration-300 focus:border-shu";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const split = new SplitText(q(".ct-title"), { type: "words,chars", charsClass: "char" });
      gsap.from(split.chars, {
        yPercent: 100,
        opacity: 0,
        rotateX: -80,
        transformOrigin: "50% 100%",
        duration: 1.2,
        ease: "expo.out",
        stagger: { each: 0.02, from: "random" },
        scrollTrigger: { trigger: q(".ct-title"), start: "top 85%" },
      });
      gsap.from(q(".ct-field"), {
        yPercent: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: q(".ct-form"), start: "top 85%" },
      });
      gsap.from(q(".ct-link"), {
        yPercent: 100,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: q(".ct-links"), start: "top 90%" },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  const handleBlur = (field: FieldName) => (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    // don't punish a field the user simply tabbed through
    if (!value.trim() && !errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleChange = (field: FieldName) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // once a field is flagged, re-validate live so the error clears as it's fixed
    if (!errors[field]) return;
    const value = e.currentTarget.value;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const nextErrors: FieldErrors = {};
    for (const field of FIELDS) {
      const err = validateField(field, String(data.get(field) ?? ""));
      if (err) nextErrors[field] = err;
    }
    setErrors(nextErrors);
    const firstInvalid = FIELDS.find((f) => nextErrors[f]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      setStatus("idle");
      return;
    }

    setStatus("loading");
    data.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
    data.append("subject", "New message from portfolio contact form");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setStatus("success");
        setErrors({});
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer
      id="contact"
      ref={root}
      data-theme="paper"
      className="relative overflow-hidden px-5 pb-8 pt-28 md:px-8 md:pt-40 lg:px-12"
      aria-labelledby="ct-title"
    >
      {/* Row 1 — heading (left) + form (right) */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <span className="t-label text-shu">06 — Contact · 連絡</span>
          <h2
            id="ct-title"
            className="ct-title t-display mt-6 text-[clamp(3.2rem,10vw,10.5rem)] leading-[0.85]"
            style={{ perspective: "800px" }}
          >
            Let's build
            <br />
            something
            <br />
            that <span className="t-serif-i normal-case text-shu">thinks</span>
          </h2>
        </div>

        <div className="flex flex-col justify-end lg:col-span-5">
          <form ref={formRef} onSubmit={handleSubmit} className="ct-form w-full" noValidate>
            {/* honeypot — hidden from real users, catches bots */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <label className="ct-field flex flex-col gap-2">
                <span className="t-label text-muted">Name</span>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  className={inputClass}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={errors.name ? "ct-name-error" : undefined}
                />
                {errors.name && (
                  <span id="ct-name-error" className="t-meta text-shu">
                    {errors.name}
                  </span>
                )}
              </label>
              <label className="ct-field flex flex-col gap-2">
                <span className="t-label text-muted">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? "ct-email-error" : undefined}
                />
                {errors.email && (
                  <span id="ct-email-error" className="t-meta text-shu">
                    {errors.email}
                  </span>
                )}
              </label>
            </div>

            <label className="ct-field mt-8 flex flex-col gap-2">
              <span className="t-label text-muted">Message</span>
              <textarea
                required
                name="message"
                rows={4}
                placeholder="What are you building?"
                className={`${inputClass} resize-none`}
                onChange={handleChange("message")}
                onBlur={handleBlur("message")}
                aria-invalid={!!errors.message || undefined}
                aria-describedby={errors.message ? "ct-message-error" : undefined}
              />
              {errors.message && (
                <span id="ct-message-error" className="t-meta text-shu">
                  {errors.message}
                </span>
              )}
            </label>

            <div className="ct-field mt-8 flex flex-wrap items-center gap-6">
              <button
                type="submit"
                disabled={status === "loading"}
                data-cursor="link"
                className="group relative inline-flex items-center gap-3 overflow-hidden border border-current px-7 py-3 t-label disabled:opacity-50"
              >
                <span className="absolute inset-0 -translate-x-full bg-fg transition-transform duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0" />
                <span className="relative transition-colors duration-500 group-hover:text-bg">
                  {status === "loading" ? "Sending…" : "Send message"}
                </span>
                <span className="relative transition-all duration-500 group-hover:translate-x-1 group-hover:text-bg">
                  ↗
                </span>
              </button>

              {status === "success" && (
                <p role="status" className="t-meta text-shu">
                  Thanks — I'll get back to you soon.
                </p>
              )}
              {status === "error" && (
                <p role="alert" className="t-meta text-shu">
                  Something went wrong. Try emailing directly instead.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Row 2 — statement (left) + links (right) */}
      <div className="mt-20 grid grid-cols-1 gap-10 hairline-t pt-10 md:mt-28 lg:grid-cols-12 lg:items-end lg:gap-8">
        <p className="t-serif-i max-w-xl text-[1.35rem] leading-[1.2] md:text-[1.7rem] lg:col-span-7">
          Open to collaborations, research and building things that don't exist yet.
        </p>
        <ul className="ct-links flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
          {LINKS.map((l) => (
            <li key={l.label} className="ct-link">
              <Magnetic strength={0.3}>
                <a
                  href={l.href}
                  data-cursor="link"
                  className="group relative inline-flex items-center gap-3 border border-current px-6 py-3 t-label overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full bg-fg transition-transform duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0" />
                  <span className="relative transition-colors duration-500 group-hover:text-bg">{l.label}</span>
                  <span className="relative transition-all duration-500 group-hover:translate-x-1 group-hover:text-bg">
                    ↗
                  </span>
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer bar */}
      <div className="mt-20 flex flex-col gap-6 hairline-t pt-6 md:mt-28 md:flex-row md:items-end md:justify-between">
        <div className="t-meta">
          <p>© 2026 Prabin Wagle</p>
          <p className="mt-1">Computer Engineering · AI / ML · Software · Nepal</p>
        </div>
        <p className="font-jp text-xs tracking-[0.4em] text-muted">深く学び、作り続け、全てを疑う</p>
        <div className="t-meta flex items-center gap-6">
          <span className="hidden md:inline">React · GSAP · Three · Framer Motion · anime.js</span>
          <button
            type="button"
            onClick={() => scrollToHash("#top")}
            data-cursor="link"
            className="group flex items-center gap-2"
          >
            <span>Top</span>
            <span className="inline-block transition-transform duration-500 group-hover:-translate-y-1">↑</span>
          </button>
        </div>
      </div>

      <span
        className="pointer-events-none absolute -bottom-[6vw] right-0 select-none font-display text-[30vw] leading-none text-current opacity-[0.04]"
        aria-hidden
      >
        PW
      </span>
    </footer>
  );
}
