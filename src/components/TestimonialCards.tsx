"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Experience {
  period: string;
  role: string;
  company: string;
  type: string;
  description: string;
  skills: string[];
  accent: string;
  darkAccent: string;
}

const experiences: Experience[] = [
  // 2023
  {
    period: "2023 — Present",
    role: "Graphic Designer",
    company: "Freelance",
    type: "Freelance",
    description:
      "Designing and Building identity for local clients - from crafting brandings to polished and publishable pubmats. I utilize Photoshop for most of my works and can do slight 3D rendering on the side.",
    skills: ["Branding", "Typography", "Visual Identity", "Photoshop"],
    accent: "#00FF87",
    darkAccent: "#00FF87",
  },
  {
    period: "09/2023 — Present",
    role: "Assistant Art Director",
    company: "West Esports",
    type: "Leadership",
    description:
      "Designed and delivered promotional and event visuals to support community engagement — reaching 3,300+ followers and engaging 200+ active members. Oversaw junior designers and co-developed annual branding systems, ensuring consistent visual identity and quality control across all digital publications.",
    skills: ["Art Direction", "Event Visuals", "Branding", "Team Oversight"],
    accent: "#FF2D78",
    darkAccent: "#FF2D78",
  },
  {
    period: "09/2023 — Present",
    role: "Marketing Manager",
    company: "Commission on Innovation and Tech Empowerment",
    type: "Leadership",
    description:
      "Planned and executed digital marketing campaigns for recruitment and announcements — driving increased social media engagement and clearer brand visibility. Conducted audience and market research to inform content strategy and improve campaign relevance and targeted visual messaging performance.",
    skills: ["Digital Marketing", "Campaign Strategy", "Market Research", "Content Planning"],
    accent: "#FF2D78",
    darkAccent: "#FF2D78",
  },
  {
    period: "10/2023 — 08/2025",
    role: "Board Member — Public Relations",
    company: "Cyb Robotics Organization",
    type: "Campus",
    description:
      "Led event documentation for two CYB events under the Public Relations Committee. Color-graded 100+ images for social media and designed branded graphics for accepted applicants and official postings — maintaining visual consistency and professionalism throughout.",
    skills: ["PR", "Event Documentation", "Color Grading", "Graphic Design"],
    accent: "#00C2FF",
    darkAccent: "#00C2FF",
  },
  // 2024
  {
    period: "2024 — Present",
    role: "UI/UX Designer & Frontend Dev",
    company: "Freelance",
    type: "Freelance",
    description:
      "Designing and building interfaces for local businesses and startups — from discovery and wireframes to polished, deployed products. Specializing in interactive web experiences with Next.js and Tailwind.",
    skills: ["Next.js", "Figma", "Tailwind CSS", "Client Relations"],
    accent: "#00FF87",
    darkAccent: "#00FF87",
  },
  {
    period: "08/2024 — Present",
    role: "Head for Creatives and Multimedia",
    company: "Cipher Organization",
    type: "Leadership",
    description:
      "Led and executed UI/UX and visual strategy for a web application and organizational publications — maintaining consistent brand alignment and deploying standardized design systems across all digital platforms. Managed and directed a creatives team producing high-quality marketing and publication assets.",
    skills: ["UI/UX", "Design Systems", "Team Leadership", "Brand Strategy"],
    accent: "#FF2D78",
    darkAccent: "#FF2D78",
  },
  {
    period: "07/2024 — 08/2025",
    role: "Editorial Assistant",
    company: "ICON Publications",
    type: "Campus",
    description:
      "Enhanced visual storytelling through collaboration with illustrators, photographers, and writers — increasing audience engagement. Produced and curated high-quality photo and video content with consistent color grading. Wrote editorials, columns, and captions meeting editorial standards.",
    skills: ["Editorial Design", "Color Grading", "Photography", "Writing"],
    accent: "#00C2FF",
    darkAccent: "#00C2FF",
  },
  // 2025
  {
    period: "09/2025 — Present",
    role: "Layout Artist",
    company: "WVSU Film Society",
    type: "Campus",
    description:
      "Collaborated with cross-functional teams to ensure cohesive branding and messaging across all organizational materials — maintaining visual consistency across print and digital publications.",
    skills: ["Layout Design", "Print", "Branding", "Cross-functional Collaboration"],
    accent: "#00C2FF",
    darkAccent: "#00C2FF",
  },
  {
    period: "11/2025 — Present",
    role: "Assistant Public Information Officer",
    company: "University Senior Curriculum Council",
    type: "Academic",
    description:
      "Developed branding direction and digital publication assets for official council communications — achieving consistent UI hierarchy and reuse across Facebook and digital platforms. Translated institutional branding into scalable templates, including the successful rollout of the AY 2025–2026 official council uniform.",
    skills: ["Branding", "Digital Publications", "Templates", "UI Hierarchy"],
    accent: "#FFE500",
    darkAccent: "#FFE500",
  },
  // 2026
  {
    period: "01/2026 — 04/2026",
    role: "Software Developer Intern",
    company: "Department of Science and Technology - Central Office",
    type: "Internship",
    description:
      "Developed project features, integrated backend and frontend, insert data into the database, general state management through redux, clean architecture for generalizability, user story understanding, unit testing, and knowledge transfers for new interns.",
    skills: ["ReactJs", "Node", "TailwindCss", "Fullstack", "PostgreSQL", "Clean Architecture", "Redux", "Git Commands", "Knowledge Transfer"],
    accent: "#BF5FFF",
    darkAccent: "#BF5FFF",
  },
];

// Breakpoint hook
type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("lg");
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 480)  return setBp("xs");
      if (w < 640)  return setBp("sm");
      if (w < 1024) return setBp("md");
      if (w < 1280) return setBp("lg");
      if (w < 1920) return setBp("xl");
      setBp("2xl");
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return bp;
}

function isMobileOrTablet(bp: Breakpoint) {
  return bp === "xs" || bp === "sm" || bp === "md";
}

function cardScale(bp: Breakpoint): number {
  switch (bp) {
    case "lg":  return 1.00;
    case "xl":  return 1.05;
    case "2xl": return 1.15;
    default:    return 1.00;
  }
}

const CARD_BASE_W     = 320;
const CARD_BASE_H     = 380;
const SCROLL_PER_CARD = 400;
const DRAG_THRESHOLD  = 6;

function getFanPos(i: number, total: number, vw: number) {
  const spread = Math.min(vw * 0.72, 860);
  const t   = total > 1 ? i / (total - 1) : 0.5;
  const x   = (t - 0.5) * spread;
  const arc = Math.abs(t - 0.5) * 2;
  const y   = arc * 36 + 30;
  const rot = (t - 0.5) * 30;
  return { x, y, rot };
}

function getStackPos(i: number) {
  const jx  = ((i * 53 + 11) % 26) - 13;
  const jy  = ((i * 37 +  7) % 16) - 8;
  const rot = ((i * 17 +  3) % 12) - 6;
  return { x: jx, y: -i * 3 + jy, rot };
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// Shared Modal (bottom-sheet on mobile/tablet, centered on desktop)
function Modal({ exp, isDark, onClose, sheet }: {
  exp: Experience; isDark: boolean; onClose: () => void; sheet: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const color      = isDark ? exp.darkAccent : exp.accent;

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    if (sheet) {
      gsap.fromTo(panelRef.current, { y: "100%" }, { y: "0%", duration: 0.4, ease: "power3.out" });
    } else {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.91, y: 32 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(1.6)" });
    }
  }, [sheet]);

  const close = useCallback(() => {
    if (sheet) {
      gsap.to(panelRef.current,   { y: "100%", duration: 0.3, ease: "power3.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.32, ease: "power2.in", onComplete: onClose });
    } else {
      gsap.to(panelRef.current,   { opacity: 0, scale: 0.94, y: 16, duration: 0.2, ease: "power2.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.28, ease: "power2.in", onComplete: onClose });
    }
  }, [onClose, sheet]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex"
      style={{
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        alignItems: sheet ? "flex-end" : "center",
        justifyContent: "center",
        padding: sheet ? 0 : "1.5rem",
      }}
      onClick={close}
    >
      <div
        ref={panelRef}
        className="relative overflow-hidden w-full"
        style={{
          maxWidth: sheet ? "100%" : "28rem",
          maxHeight: sheet ? "88vh" : "88vh",
          overflowY: "auto",
          borderRadius: sheet ? "1.5rem 1.5rem 0 0" : "1.5rem",
          background: isDark ? "#161616" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isDark
            ? "0 40px 100px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)"
            : "0 40px 100px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        {sheet && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} />
          </div>
        )}

        {/* Accent strip */}
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />

        {/* Close */}
        <button
          onClick={close}
          className="absolute z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors text-sm"
          style={{
            top: sheet ? "2.75rem" : "1rem",
            right: "1rem",
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
          }}
          aria-label="Close"
        >✕</button>

        <div className="space-y-5" style={{ padding: sheet ? "1rem 1.25rem 2.5rem" : "1.5rem" }}>
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                {exp.period}
              </p>
              <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide" style={{ color, background: `${color}18`, border: `1px solid ${color}45` }}>
                {exp.type}
              </span>
            </div>
            <h2 className="font-black leading-tight" style={{ fontSize: sheet ? "1.2rem" : "1.5rem", color: isDark ? "#f0f0f0" : "#1a1a1a" }}>
              {exp.role}
            </h2>
            <p className="text-sm font-semibold mt-1" style={{ color }}>{exp.company}</p>
          </div>

          <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }} />

          <p className="leading-relaxed" style={{ fontSize: sheet ? "0.8rem" : "0.875rem", color: isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.58)" }}>
            {exp.description}
          </p>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] mb-2.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              Tools &amp; Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {exp.skills.map((s) => (
                <span key={s} className="px-3 py-1 text-[11px] font-medium rounded-full" style={{
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)",
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Number watermark */}
        <div
          className="absolute bottom-4 right-5 font-black leading-none select-none pointer-events-none"
          style={{ fontSize: sheet ? 56 : 80, opacity: 0.15, color }}
        >
          {String(experiences.indexOf(exp) + 1).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

// Mobile: Vertical Timeline List
function MobileTimeline({ isDark, onCardClick }: { isDark: boolean; onCardClick: (exp: Experience) => void }) {
  return (
    <div className="relative px-6 sm:px-10 py-20">
      {/* Heading */}
      <div className="mb-10">
        <h2 className="text-[2.8rem] sm:text-[3.6rem] font-black bg-gradient-to-r from-[#404040] to-[#606060] dark:from-[#80CEFF] dark:to-[#F7B2FD] bg-clip-text text-transparent leading-tight">
          experience.
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tap a card to read more.</p>
      </div>

      {/* Timeline line */}
      <div
        className="absolute left-[2.35rem] sm:left-[2.85rem] top-[11rem] bottom-12 w-px"
        style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
      />

      <div className="space-y-5">
        {experiences.map((exp, i) => {
          const color = isDark ? exp.darkAccent : exp.accent;
          return (
            <div key={i} className="flex gap-5 items-start">
              {/* Timeline dot */}
              <div className="flex-shrink-0 relative z-10 mt-4">
                <div
                  className="w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: color,
                    background: isDark ? "#0e0e0e" : "#fff",
                    boxShadow: `0 0 8px ${color}88`,
                  }}
                />
              </div>

              {/* Card */}
              <button
                onClick={() => onCardClick(exp)}
                className="flex-1 text-left rounded-2xl overflow-hidden transition-transform duration-200 active:scale-[0.98]"
                style={{
                  background: isDark ? "#161616" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                  boxShadow: isDark
                    ? "0 4px 24px rgba(0,0,0,0.35)"
                    : "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                {/* Top accent */}
                <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />

                <div className="p-4">
                  {/* Period + badge row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                      {exp.period}
                    </p>
                    <span className="px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wide"
                      style={{ color, background: `${color}18`, border: `1px solid ${color}45` }}>
                      {exp.type}
                    </span>
                  </div>

                  {/* Role + company */}
                  <h3 className="font-black text-base leading-snug"
                    style={{ color: isDark ? "#f0f0f0" : "#1a1a1a" }}>
                    {exp.role}
                  </h3>
                  <p className="text-sm font-semibold mt-0.5 mb-3" style={{ color }}>
                    {exp.company}
                  </p>

                  {/* Skills row */}
                  <div className="flex flex-wrap gap-1.5">
                    {exp.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[9px] font-medium rounded-full"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)",
                          background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                        }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="text-[9px] italic mt-2" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)" }}>
                    tap to expand
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Desktop: GSAP scroll-stack 
function DesktopStack({ isDark, bp, onCardClick }: {
  isDark: boolean; bp: Breakpoint; onCardClick: (exp: Experience) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const labelRef   = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLParagraphElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);

  const dragState = useRef(
    experiences.map(() => ({
      baseX: 0, baseY: 0, baseRot: 0,
      offsetX: 0, offsetY: 0,
      dragging: false, didDrag: false,
      startMX: 0, startMY: 0,
    }))
  );

  const [zOrders, setZOrders] = useState<number[]>(() => experiences.map((_, i) => i + 10));
  const [vh, setVh] = useState(0);
  const [scrollDone, setScrollDone] = useState(false);

  const sc     = cardScale(bp);
  const CARD_W = Math.round(CARD_BASE_W * sc);
  const CARD_H = Math.round(CARD_BASE_H * sc);

  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!vh) return;

    gsap.fromTo(headingRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true } }
    );

    const vw    = stageRef.current?.offsetWidth ?? window.innerWidth;
    const total = experiences.length;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const { x, y, rot } = getFanPos(i, total, vw);
      gsap.set(el, { x, y, rotation: rot, scale: 0.82, zIndex: i + 1, opacity: 1 });
      dragState.current[i].baseX   = x;
      dragState.current[i].baseY   = y;
      dragState.current[i].baseRot = rot;
    });

    const tl = gsap.timeline({ paused: true });
    experiences.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const { x, y, rot } = getStackPos(i);
      tl.to(el, {
        x, y, rotation: rot, scale: 1, zIndex: i + 10, duration: 1, ease: "power3.inOut",
        onComplete: () => {
          dragState.current[i].baseX   = x;
          dragState.current[i].baseY   = y;
          dragState.current[i].baseRot = rot;
        },
      }, i);
    });

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: `+=${total * SCROLL_PER_CARD}`,
      pin: stageRef.current,
      scrub: 1.2,
      animation: tl,
      onUpdate(self) {
        if (!counterRef.current) return;
        const idx = Math.min(Math.floor(self.progress * total), total - 1);
        counterRef.current.textContent = `${idx + 1} / ${total}`;
        gsap.to(labelRef.current, { opacity: self.progress > 0.01 ? 1 : 0, duration: 0.3 });
      },
      onLeaveBack() {
        setScrollDone(false);
        if (hintRef.current) gsap.to(hintRef.current, { opacity: 0, duration: 0.3 });
      },
      onLeave() {
        setScrollDone(true);
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const matrix = new DOMMatrix(window.getComputedStyle(el).transform);
          dragState.current[i].baseX = matrix.m41;
          dragState.current[i].baseY = matrix.m42;
          dragState.current[i].baseRot = getStackPos(i).rot;
        });
        if (hintRef.current) {
          gsap.fromTo(hintRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
        }
      },
    });

    return () => {
      st.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === sectionRef.current || t.trigger === headingRef.current) t.kill();
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh, bp]);

  const bringToFront = useCallback((idx: number) => {
    setZOrders(prev => {
      const max  = Math.max(...prev);
      const next = [...prev];
      next[idx]  = max + 1;
      return next;
    });
  }, []);

  const makeHandlers = useCallback((i: number) => {
    const ds = dragState.current[i];
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!scrollDone) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      bringToFront(i);
      ds.dragging = true; ds.didDrag = false;
      ds.startMX = e.clientX; ds.startMY = e.clientY;
      gsap.to(cardRefs.current[i], { scale: 1.06, rotation: ds.baseRot * 0.3, duration: 0.18, ease: "power2.out" });
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!ds.dragging) return;
      const dx = e.clientX - ds.startMX;
      const dy = e.clientY - ds.startMY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) ds.didDrag = true;
      ds.offsetX = dx; ds.offsetY = dy;
      gsap.set(cardRefs.current[i], { x: ds.baseX + dx, y: ds.baseY + dy });
    };
    const onPointerUp = () => {
      if (!ds.dragging) return;
      ds.dragging = false;
      ds.baseX += ds.offsetX; ds.baseY += ds.offsetY;
      ds.offsetX = 0; ds.offsetY = 0;
      gsap.to(cardRefs.current[i], { scale: 1, rotation: ds.baseRot, duration: 0.55, ease: "elastic.out(1, 0.45)" });
      if (!ds.didDrag) onCardClick(experiences[i]);
    };
    return { onPointerDown, onPointerMove, onPointerUp };
  }, [scrollDone, bringToFront, onCardClick]);

  const totalH = vh > 0 ? vh + experiences.length * SCROLL_PER_CARD : "200vh";

  return (
    <div ref={sectionRef} id="experience" style={{ height: totalH }} className="relative">
      <div
        ref={stageRef}
        className="relative w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#0e0e0e]"
        style={{ height: vh > 0 ? vh : "100vh" }}
      >
        <div className="absolute inset-0 hero-grid opacity-[0.025] dark:opacity-[0.04] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] dark:opacity-0 transition-opacity duration-500" style={{ opacity: 0.18, background: "radial-gradient(circle, #E0790B, transparent 65%)" }} />
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-0 dark:opacity-[0.13] transition-opacity duration-500" style={{ background: "radial-gradient(circle, #80CEFF, transparent 65%)" }} />
        </div>

        <div ref={headingRef} className="absolute top-14 left-6 sm:left-10 lg:left-16 xl:left-24 opacity-0 z-50 pointer-events-none">
          <h2 className="text-[2.6rem] sm:text-[3.6rem] lg:text-[4.2rem] font-black bg-gradient-to-r from-[#404040] to-[#606060] dark:from-[#80CEFF] dark:to-[#F7B2FD] bg-clip-text text-transparent leading-tight">
            experience.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 tracking-wide">Scroll to build the stack.</p>
        </div>

        <div ref={labelRef} className="absolute top-14 right-6 sm:right-10 lg:right-16 xl:right-24 opacity-0 z-50 text-right pointer-events-none">
          <span ref={counterRef} className="text-sm font-mono font-bold text-gray-500 dark:text-gray-400 tracking-widest">1 / {experiences.length}</span>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-[0.18em]">experience</p>
        </div>

        <p ref={hintRef} className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-0 text-[10px] tracking-[0.2em] uppercase pointer-events-none z-50 whitespace-nowrap"
          style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.28)" }}>
          drag to rearrange · tap to expand
        </p>

        {/* Card stack */}
        <div className="relative" style={{ width: CARD_W, height: CARD_H, marginTop: 40 }}>
          {experiences.map((exp, i) => {
            const color    = isDark ? exp.darkAccent : exp.accent;
            const handlers = makeHandlers(i);
            const fsPeriod = sc < 0.90 ? "8px"  : "9px";
            const fsRole   = sc < 0.90 ? "15px" : "17px";
            const fsComp   = sc < 0.90 ? "12px" : "14px";
            const fsDesc   = sc < 0.90 ? "12px" : "14px";
            const fsSkill  = sc < 0.90 ? "9px"  : "10px";
            const px       = sc < 0.90 ? "18px" : "24px";
            const pyH      = sc < 0.90 ? "14px" : "20px";

            return (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute inset-0 rounded-3xl"
                style={{ width: CARD_W, height: CARD_H, willChange: "transform", zIndex: zOrders[i], cursor: scrollDone ? "grab" : "default", touchAction: "none" }}
                onPointerDown={handlers.onPointerDown}
                onPointerMove={handlers.onPointerMove}
                onPointerUp={handlers.onPointerUp}
              >
                <div className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col"
                  style={{
                    background: isDark ? "#161616" : "#ffffff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                    boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)" : "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                    transition: "background 0.4s, border-color 0.4s",
                  }}
                >
                  <div className="h-[3px] w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />

                  <div className="flex-shrink-0" style={{ padding: `${pyH} ${px} 14px`, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold uppercase tracking-[0.22em] mb-1.5" style={{ fontSize: fsPeriod, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>{exp.period}</p>
                        <h3 className="font-black leading-snug" style={{ fontSize: fsRole, color: isDark ? "#f0f0f0" : "#1a1a1a" }}>{exp.role}</h3>
                        <p className="font-semibold mt-0.5" style={{ fontSize: fsComp, color }}>{exp.company}</p>
                      </div>
                      <span className="flex-shrink-0 mt-0.5 px-2.5 py-1 font-bold rounded-full uppercase tracking-wide" style={{ fontSize: fsPeriod, color, background: `${color}18`, border: `1px solid ${color}45` }}>{exp.type}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden" style={{ padding: `14px ${px}` }}>
                    <p className="leading-relaxed" style={{ fontSize: fsDesc, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)" }}>{exp.description}</p>
                  </div>

                  <div className="flex-shrink-0" style={{ padding: `0 ${px} 20px` }}>
                    <p className="font-bold uppercase tracking-[0.22em] mb-2" style={{ fontSize: "8px", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>Tools &amp; Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.skills.map((s) => (
                        <span key={s} className="font-medium rounded-full" style={{ fontSize: fsSkill, padding: "2px 8px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-4 font-black leading-none select-none pointer-events-none" style={{ fontSize: 72, opacity: 0.14, color }}>{String(i + 1).padStart(2, "0")}</div>
                </div>
              </div>
            );
          })}
        </div>

        {!scrollDone && (
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 pointer-events-none z-50">
            <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}` }}>
              <div className="w-1 h-2 rounded-full animate-bounce" style={{ background: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }} />
            </div>
            <p className="text-[8px] tracking-[0.2em] uppercase" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>scroll</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main export
export default function ExperienceSection() {
  const [activeModal, setActiveModal] = useState<Experience | null>(null);
  const isDark = useIsDark();
  const bp     = useBreakpoint();
  const sheet  = isMobileOrTablet(bp);

  return (
    <>
      {activeModal && (
        <Modal exp={activeModal} isDark={isDark} onClose={() => setActiveModal(null)} sheet={sheet} />
      )}

      {sheet ? (
        // Mobile: simple vertical timeline, no scroll-pinning
        <section id="experience" className="bg-white dark:bg-[#0e0e0e]">
          <MobileTimeline isDark={isDark} onCardClick={setActiveModal} />
        </section>
      ) : (
        // Desktop: GSAP scroll-stack
        <DesktopStack isDark={isDark} bp={bp} onCardClick={setActiveModal} />
      )}
    </>
  );
}