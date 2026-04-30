"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

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

// Stack offsets for cards at each depth position (0 = top)
function getStackOffset(depth: number) {
  if (depth === 0) return { rot: 0,  x: 0,  y: 0  };
  if (depth === 1) return { rot: -4, x: -6, y: 4  };
  if (depth === 2) return { rot: 6,  x: 8,  y: 8  };
  // Hidden — parked far below
  return { rot: 0, x: 0, y: 80 };
}

function CardFace({ exp }: { exp: Testimony }) {
  return (
    <div
      className="w-full h-full rounded-4xl overflow-hidden flex flex-col p-2 md:p-3"
      style={{ background: "#898989" }}
    >
      <h2 className="font-semibold text-[11px] md:text-2xl md:leading-5.5 text-white mt-3 md:mt-12 mb-2 md:mb-10 px-2 md:px-3">
        {exp.batch}
      </h2>

      <div className="flex-1 overflow-hidden">
        <p className="font-medium text-[11px] md:text-2xl md:leading-5.5 text-white px-2 md:px-6 tracking-normal leading-tight">
          "{exp.testimony}"
        </p>
      </div>
      <div className="flex items-center gap-2 px-2 py-1 md:p-2">
        <img
          src="/home-page_assets/grinch.png"
          className="w-6 h-6 md:w-16 md:h-16"
        />

        <div className="ml-1">
          <h3
            className="text-[11px] md:text-base leading-tight"
            style={{
              fontFamily: "var(--font-major)",
              fontWeight: 600,
              letterSpacing: "0.01em",
              color: "#ffffff",
              margin: 0,
            }}
          >
            {exp.name}
          </h3>

          <p
            className="text-[11px] md:text-base leading-tight"
            style={{
              fontFamily: "var(--font-major)",
              fontWeight: 400,
              letterSpacing: "0.01em",
              color: "#ffffff",
              marginTop: "2px",
            }}
          >
            {exp.position}
          </p>
        </div>
      </div>
    </div>
  );
}

const DRAG_THRESHOLD  = 6;
const SWIPE_THRESHOLD = 80;
const TILT_FACTOR     = 0.05;
const FLY_DURATION    = 0.75;
const SETTLE_DURATION = 0.55; // duration for cards to rotate into new stack positions

function SwipeStack() {
  const total = testimonies.length;

  // cardRefs[i] points to the DOM node for testimony[i]
  const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(total).fill(null));

  // order[i] = depth position of card i (0 = top, 1 = second, etc.)
  // Initially card 0 is on top, card 1 is second, card 2 is third
  const order = useRef<number[]>(testimonies.map((_, i) => i));

  const [topCard, setTopCard]   = useState(0); // index of the card currently on top
  const [finished, setFinished] = useState(false);
  const dismissing              = useRef(false); // prevent double-dismiss

  const drag = useRef({
    active: false,
    didDrag: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Apply stack positions to all cards via GSAP
  const applyStackPositions = useCallback((skipIndex?: number, duration = SETTLE_DURATION) => {
    const remaining = total - dismissCount.current;
    order.current.forEach((depth, i) => {
      if (i === skipIndex) return;
      const el = cardRefs.current[i];
      if (!el) return;
      const { rot, x, y } = getStackOffset(depth);
      const isVisible = depth < remaining; // only show as many cards as are left
      gsap.to(el, {
        x, y,
        rotation: rot,
        zIndex: total - depth,
        opacity: isVisible ? 1 : 0,
        duration,
        ease: "power2.out",
      });
    });
  }, [total]);

  // Set initial positions on mount
  useEffect(() => {
    applyStackPositions(undefined, 0); // instant, no animation
  }, []);

  // Find which card index is currently at depth 0 (on top)
  const getTopCardIndex = useCallback(() => {
    return order.current.indexOf(0);
  }, []);

  // Advance stack — rotate order positions
  const advanceStack = useCallback(() => {
    // Move the old top card to the bottom (depth = total - 1), shift everything else up
    order.current = order.current.map((depth) =>
      depth === 0 ? total - 1 : depth - 1
    );
    const newTop = getTopCardIndex();
    setTopCard(newTop);
    return newTop;
  }, [total, getTopCardIndex]);

  const dismiss = useCallback((dirX: number, dirY: number) => {
    if (dismissing.current) return;
    dismissing.current = true;

    const topIdx = getTopCardIndex();
    const el     = cardRefs.current[topIdx];
    if (!el) return;

    const flyX = dirX * (window.innerWidth * 1.3);
    const flyY = dirY * 150 + (Math.random() - 0.5) * 100;
    const rot  = dirX * (15 + Math.random() * 10);

    // Fly the top card off
    gsap.to(el, {
      x: flyX, y: flyY, rotation: rot, opacity: 0,
      duration: FLY_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        // Advance stack order
        advanceStack();

        // Smoothly rotate the flown card back to straight and park it at the bottom
        const { x, y, rot: stackRot } = getStackOffset(total - 1);
        gsap.to(el, {
          x, y, rotation: stackRot, opacity: 0, // keep hidden at bottom
          duration: SETTLE_DURATION,
          ease: "power2.out",
          onComplete: () => {
            dismissing.current = false;

            // Check if all cards have been seen
            // "seen" means the current top card has looped around once
            // We track this by checking if we've dismissed all cards
          },
        });

        // Shift the other cards into their new positions
        applyStackPositions(topIdx);
      },
    });
  }, [getTopCardIndex, advanceStack, applyStackPositions, total]);

  // Track how many cards have been dismissed
  const dismissCount = useRef(0);

  const handleDismiss = useCallback((dirX: number, dirY: number) => {
    dismissCount.current += 1;
    if (dismissCount.current >= total) {
      // All cards seen — after fly-off, show finished state
      const topIdx = getTopCardIndex();
      const el     = cardRefs.current[topIdx];
      if (!el) return;

      const flyX = dirX * (window.innerWidth * 1.3);
      const flyY = dirY * 150 + (Math.random() - 0.5) * 100;
      const rot  = dirX * (15 + Math.random() * 10);

      gsap.to(el, {
        x: flyX, y: flyY, rotation: rot, opacity: 0,
        duration: FLY_DURATION,
        ease: "power2.inOut",
        onComplete: () => setFinished(true),
      });
      return;
    }
    dismiss(dirX, dirY);
  }, [dismiss, getTopCardIndex, total]);

  const resetCard = useCallback(() => {
    const topIdx = getTopCardIndex();
    const el     = cardRefs.current[topIdx];
    if (!el) return;
    gsap.to(el, {
      x: 0, y: 0, rotation: 0,
      duration: 0.5, ease: "elastic.out(1, 0.6)",
    });
  }, [getTopCardIndex]);

  const handleReset = useCallback(() => {
    dismissCount.current = 0;
    dismissing.current   = false;
    order.current        = testimonies.map((_, i) => i);
    setTopCard(0);
    setFinished(false);
    // Re-apply initial positions instantly
    setTimeout(() => applyStackPositions(undefined, 0.3), 50);
  }, [applyStackPositions]);

  // --- Pointer handlers (only active for the top card) ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dismissing.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      active: true, didDrag: false,
      startX: e.clientX, startY: e.clientY,
      currentX: e.clientX, currentY: e.clientY,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const topIdx = getTopCardIndex();
    const el     = cardRefs.current[topIdx];
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.current.didDrag = true;
    drag.current.currentX = e.clientX;
    drag.current.currentY = e.clientY;
    gsap.to(el, {
      x: dx, y: dy, rotation: dx * TILT_FACTOR,
      duration: 0.08, ease: "none", overwrite: true,
    });
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx   = drag.current.currentX - drag.current.startX;
    const dy   = drag.current.currentY - drag.current.startY;
    const dist = Math.hypot(dx, dy);
    if (!drag.current.didDrag) {
      handleDismiss(1, -0.2);
    } else if (dist >= SWIPE_THRESHOLD) {
      handleDismiss(dx / dist, dy / dist);
    } else {
      resetCard();
    }
  };

  if (finished) {
    return (
      <div className="flex items-center justify-center w-[186px] h-[273px] md:w-[384px] md:h-[560px] mx-auto overflow-hidden">
        <button
          onClick={handleReset}
          className="flex justify-center items-center text-orange-light text-center font-normal text-base md:text-2xl w-20 md:w-40 h-auto rounded-full border-2 md:border-3 border-orange-light hover:bg-orange-light hover:text-white transition-colors duration-500"
        >
          <span className="font-major m-1 md:m-2">RELOAD</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-[186px] h-[273px] md:w-[384px] md:h-[560px]">
      {testimonies.map((exp, i) => (
        <div
          key={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          className="absolute inset-0 w-full h-full rounded-4xl"
          style={{
            overflow: "hidden",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.5)",
            // Only the top card gets pointer events
            cursor: i === topCard ? "grab" : "default",
            touchAction: "none",
            willChange: "transform",
            pointerEvents: i === topCard ? "auto" : "none",
          }}
          onPointerDown={i === topCard ? onPointerDown : undefined}
          onPointerMove={i === topCard ? onPointerMove : undefined}
          onPointerUp={i === topCard ? onPointerUp : undefined}
        >
          <CardFace exp={exp} />
        </div>
      ))}
    </div>
  );
}

export default function TestimonialCards() {
  return (
    <div className="px-4 sm:px-10 py-16">
      {/* Section heading */}
      <h1 className="font-medium text-2xl md:text-6xl text-white md:mx-40 mb-16">
        <span className="text-orange-light">STUDENT LIFE</span> AND{" "}
        <span className="text-orange-light">COMMUNITY.</span>
      </h1>

      {/* Card stack — centered */}
      <div className="flex justify-center items-center">
        <SwipeStack />
      </div>
    </div>
  );
}