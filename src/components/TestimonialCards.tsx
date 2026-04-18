"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Testimony {
  testimony: string;
  name: string;
  position: string;
  batch: string;
  company: string;
}

const testimonies: Testimony[] = [
  {
    testimony:
      "CICT became my springboard to relevance—pushing me to compete with my own potential. Beyond honing my skillset, it shaped how I see the world, grounding me in real societal and industry needs; and challenging the status quo as I build exciting projects in innovating business processes and contributing meaningfully to our digital transformation.",
    name: "HSIEN-NA T. KUO",
    position: "Product Manager",
    batch: "Batch Oracle - Class of 2025",
    company: "Hoversight AI",
  },
  {
    testimony:
      "Thank you CICT for an unforgettable college journey. Beyond the knowledge and skills I gained, It gave me the chance to meet incredible classmates. Together, we sharpened our skills through teamwork, late nights, and shared goals. I'm truly grateful for the environment that helped shape both my career and the friendships I'll carry forward.",
    name: "Jasper Nillos",
    position: "Firmware Engineer",
    batch: "Batch Oracle - Class of 2025",
    company: "Lexmark | Xerox",
  },
  {
    testimony:
      "WVSU-CICT merged my academic workload with the hands-on challenges of extracurricular activities. This balance taught me how to solve technical and theoretical problems while effectively managing team dynamics as I would in the workforce. Navigating both worlds shaped me into the versatile and disciplined person I am today.",
    name: "Von Ashley Chichirita",
    position: "Data Analyst",
    batch: "Batch Oracle - Class of 2025",
    company: "XtendOps",
  },
];

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("lg");
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 480) return setBp("xs");
      if (w < 640) return setBp("sm");
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

const CARD_BASE_W     = 384;
const CARD_BASE_H     = 560;
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

function CardFace({ exp }: { exp: Testimony }) {
  return (
    <div
      className="w-full h-full rounded-3xl overflow-hidden flex flex-col"
      style={{ background: "#898989", padding: "24px" }}
    >
      <p
        style={{
          fontFamily: "var(--font-major)",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "22px",
          letterSpacing: "0.01em",
          color: "#ffffff",
          flexShrink: 0,
          marginBottom: "16px",
        }}
      >
        {exp.batch}
      </p>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <p
          style={{
            fontFamily: "var(--font-minor)",
            fontWeight: 500,
            fontSize: "24px",
            lineHeight: "22px",
            letterSpacing: "0.01em",
            color: "#ffffff",
          }}
        >
          "{exp.testimony}"
        </p>
      </div>

      <div style={{ flexShrink: 0, paddingTop: "16px" }}>
        <h3
          style={{
            fontFamily: "var(--font-major)",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "16px",
            letterSpacing: "0.01em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          {exp.name}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-major)",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "16px",
            letterSpacing: "0.01em",
            color: "#ffffff",
            marginTop: "4px",
          }}
        >
          {exp.position}, {exp.company}
        </p>
      </div>
    </div>
  );
}

// Modal renders into a portal outside the GSAP-controlled DOM tree
import { createPortal } from "react-dom";

function Modal({
  exp,
  onClose,
  sheet,
}: {
  exp: Testimony;
  onClose: () => void;
  sheet: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

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

  // Render into document.body so it's completely outside the GSAP-pinned subtree
  return createPortal(
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
        className="relative w-full"
        style={{
          maxWidth: sheet ? "100%" : `${CARD_BASE_W}px`,
          height: sheet ? "auto" : `${CARD_BASE_H}px`,
          maxHeight: sheet ? "88vh" : undefined,
          borderRadius: sheet ? "1.5rem 1.5rem 0 0" : "1.5rem",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm"
          style={{
            top: "1rem",
            right: "1rem",
            background: "rgba(255,255,255,0.15)",
            color: "#ffffff",
          }}
          aria-label="Close"
        >
          ✕
        </button>
        <CardFace exp={exp} />
      </div>
    </div>,
    document.body
  );
}

function MobileTimeline({ onCardClick }: { onCardClick: (exp: Testimony) => void }) {
  return (
    <div className="px-6 sm:px-10 py-16 space-y-5">
      {testimonies.map((exp, i) => (
        <button
          key={i}
          onClick={() => onCardClick(exp)}
          className="w-full text-left active:scale-[0.98] transition-transform duration-150"
          style={{
            borderRadius: "1.5rem",
            height: "280px",
            overflow: "hidden",
            display: "block",
          }}
        >
          <CardFace exp={exp} />
        </button>
      ))}
    </div>
  );
}

function DesktopStack({
  bp,
  onCardClick,
}: {
  bp: Breakpoint;
  onCardClick: (exp: Testimony) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);

  const dragState = useRef(
    testimonies.map(() => ({
      baseX: 0, baseY: 0, baseRot: 0,
      offsetX: 0, offsetY: 0,
      dragging: false, didDrag: false,
      startMX: 0, startMY: 0,
    }))
  );

  const [zOrders, setZOrders]       = useState<number[]>(() => testimonies.map((_, i) => i + 10));
  const [scrollDone, setScrollDone] = useState(false);

  const sc      = cardScale(bp);
  const CARD_W  = Math.round(CARD_BASE_W * sc);
  const CARD_H  = Math.round(CARD_BASE_H * sc);
  const V_PAD   = 80;
  const STAGE_H = CARD_H + V_PAD * 2;
  const totalH  = STAGE_H + testimonies.length * SCROLL_PER_CARD;

  useEffect(() => {
    const vw    = stageRef.current?.offsetWidth ?? window.innerWidth;
    const total = testimonies.length;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const { x, y, rot } = getFanPos(i, total, vw);
      gsap.set(el, { x, y, rotation: rot, scale: 0.82, zIndex: i + 1, opacity: 1 });
      dragState.current[i].baseX   = x;
      dragState.current[i].baseY   = y;
      dragState.current[i].baseRot = rot;
    });

    const tl = gsap.timeline({ paused: true });
    testimonies.forEach((_, i) => {
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
      end: `+=${testimonies.length * SCROLL_PER_CARD}`,
      pin: sectionRef.current,
      pinSpacing: false,
      scrub: 1.2,
      animation: tl,
      onLeaveBack() {
        setScrollDone(false);
      },
      onLeave() {
        setScrollDone(true);
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const matrix = new DOMMatrix(window.getComputedStyle(el).transform);
          dragState.current[i].baseX   = matrix.m41;
          dragState.current[i].baseY   = matrix.m42;
          dragState.current[i].baseRot = getStackPos(i).rot;
        });
      },
    });

    return () => { st.kill(); };
  }, [bp]);

  const bringToFront = useCallback((idx: number) => {
    setZOrders((prev) => {
      const max  = Math.max(...prev);
      const next = [...prev];
      next[idx]  = max + 1;
      return next;
    });
  }, []);

  const makeHandlers = useCallback(
    (i: number) => {
      const ds = dragState.current[i];

      const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!scrollDone) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        bringToFront(i);
        ds.dragging = true;
        ds.didDrag  = false;
        ds.startMX  = e.clientX;
        ds.startMY  = e.clientY;
        gsap.to(cardRefs.current[i], { scale: 1.06, rotation: ds.baseRot * 0.3, duration: 0.18, ease: "power2.out" });
      };

      const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!ds.dragging) return;
        const dx = e.clientX - ds.startMX;
        const dy = e.clientY - ds.startMY;
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD) ds.didDrag = true;
        ds.offsetX = dx;
        ds.offsetY = dy;
        gsap.set(cardRefs.current[i], { x: ds.baseX + dx, y: ds.baseY + dy });
      };

      const onPointerUp = () => {
        if (!ds.dragging) return;
        ds.dragging  = false;
        ds.baseX    += ds.offsetX;
        ds.baseY    += ds.offsetY;
        ds.offsetX   = 0;
        ds.offsetY   = 0;
        gsap.to(cardRefs.current[i], { scale: 1, rotation: ds.baseRot, duration: 0.55, ease: "elastic.out(1, 0.45)" });
        if (!ds.didDrag) onCardClick(testimonies[i]);
      };

      return { onPointerDown, onPointerMove, onPointerUp };
    },
    [scrollDone, bringToFront, onCardClick]
  );

  return (
    <div ref={sectionRef} id="experience" style={{ height: totalH }} className="relative">
      <div
        ref={stageRef}
        className="relative w-full flex flex-col items-center justify-center"
        style={{ height: STAGE_H, bottom: 64 }}
      >
        <div className="relative" style={{ width: CARD_W, height: CARD_H }}>
          {testimonies.map((exp, i) => {
            const handlers = makeHandlers(i);
            return (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute inset-0"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  willChange: "transform",
                  zIndex: zOrders[i],
                  cursor: scrollDone ? "grab" : "default",
                  touchAction: "none",
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                  boxShadow: "0px 6px 6.3px 3px #0000006E",
                }}
                onPointerDown={handlers.onPointerDown}
                onPointerMove={handlers.onPointerMove}
                onPointerUp={handlers.onPointerUp}
              >
                <CardFace exp={exp} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialCards() {
  const [activeModal, setActiveModal] = useState<Testimony | null>(null);
  const bp    = useBreakpoint();
  const sheet = isMobileOrTablet(bp);

  return (
    <>
      {activeModal && (
        <Modal exp={activeModal} onClose={() => setActiveModal(null)} sheet={sheet} />
      )}

      {sheet ? (
        <section id="experience">
          <MobileTimeline onCardClick={setActiveModal} />
        </section>
      ) : (
        <DesktopStack bp={bp} onCardClick={setActiveModal} />
      )}
    </>
  );
}