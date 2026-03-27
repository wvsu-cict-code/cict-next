"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function FacultyProfiles() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Coordinates optimized to match the blue anchor nodes in the visual reference
  const departments = [
    {
      name: "DEANS OFFICE",
      side: "left",
      y: 20, // Matches visual middle of top-left arc
      x: 20, 
      link: "/faculty-profiles/deans-office",
      logoAnchor: { x: 39, y: 20 },
    },
    {
      name: "INFORMATION TECHNOLOGY",
      side: "left",
      y: 45, // Skip outer ring, hit inner ring node
      x: 23,
      link: "/faculty-profiles/it",
      logoAnchor: { x: 42.5, y: 45 },
    },
    {
      name: "INFORMATION SYSTEM",
      side: "left",
      y: 65, // Lower-left diagonal node
      x: 20,
      link: "/faculty-profiles/is",
      logoAnchor: { x: 40, y: 65 },
    },
    {
      name: "MASTER OF INFORMATION TECHNOLOGY",
      side: "left",
      y: 84, // Bottom-left outer arc node
      x: 35,
      link: "/faculty-profiles/mit",
      logoAnchor: { x: 44, y: 84 },
    },
    // Right side
    {
      name: "COMPUTER SCIENCE",
      side: "right",
      y: 34, // Top-right diagonal bar node
      x: 75,
      link: "/faculty-profiles/cs",
      logoAnchor: { x: 62, y: 34 },
    },
    {
      name: "LIBRARY & INFORMATION SCIENCE",
      side: "right",
      y: 50, // Center node (middle of the entire SVG)
      x: 85,
      link: "/faculty-profiles/lis",
      logoAnchor: { x: 51, y: 50 }, 
    },
    {
      name: "ENTERTAINMENT AND MULTIMEDIA COMPUTING",
      side: "right",
      y: 58, // Inner-right ring node
      x: 80,
      link: "/faculty-profiles/emc",
      logoAnchor: { x: 56, y: 58 },
    },
    {
      name: "LABORATORY & TECHNICAL SUPPORT",
      side: "right",
      y: 75, // Bottom-right outer arc node
      x: 85,
      link: "/faculty-profiles/lts",
      logoAnchor: { x: 53, y: 75 },
    },
  ];

  return (
    <main className="w-full flex flex-col items-center bg-white text-center pb-20">
      {/* Hero Section */}
      <section className="w-full pt-16 pb-0 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-major tracking-tight uppercase">
          <span className="text-neutral-900 font-bold">Faculty </span>
          <span className="text-orange-light">Directory</span>
        </h1>
      </section>

      {/* Interactive Map Container */}
      <div className="relative aspect-video w-full max-w-[1240px] select-none -mt-8">
        
        {/* LOGO (Background Layer) - Behind everything */}
        <div className="absolute left-1/2 top-1/2 z-0 w-[42%] -translate-x-1/2 -translate-y-1/2 overflow-visible">
          <Image
            src="/icons/facultiylogo.svg"
            alt="Faculty Logo"
            width={500}
            height={500}
            priority
            className="h-full w-full object-contain opacity-90 transition-opacity duration-300"
          />
        </div>

        {/* LINES (Foreground Layer) */}
        <svg
          className="absolute inset-0 z-10 h-full w-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          {departments.map((dept, index) => (
            <line
              key={`line-${index}`}
              x1={dept.x}
              y1={dept.y}
              x2={dept.logoAnchor.x}
              y2={dept.logoAnchor.y}
              stroke="var(--color-orange-light)"
              strokeWidth={hoveredIndex === index ? "0.4" : "0.15"}
              className="transition-all duration-300"
              strokeOpacity={hoveredIndex === null ? "0.6" : hoveredIndex === index ? "1" : "0.1"}
            />
          ))}
        </svg>

        {/* LABELS & DOTS (Top Layer) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {departments.map((dept, index) => (
            <div
              key={index}
              className={`absolute pointer-events-auto flex items-center transition-all duration-300`}
              style={{
                top: `${dept.y}%`,
                left: `${dept.x}%`,
                transform: `translate(${dept.side === "left" ? "-100%" : "0%"}, -50%)`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link
                href={dept.link}
                className={`flex items-center gap-2.5 ${
                  dept.side === "left" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <span 
                  className={`font-minor text-[0.6rem] sm:text-[0.65rem] md:text-[0.7rem] font-bold tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300 pointer-events-none ${
                    hoveredIndex === null || hoveredIndex === index ? "text-orange-light opacity-100" : "text-orange-light opacity-20"
                  }`}
                >
                  {dept.name}
                </span>
                
                {/* Square Dot (Visual Point) */}
                <div 
                  className={`h-1.5 w-1.5 bg-orange-light rounded-[1px] transition-all duration-300 shrink-0 pointer-events-none ${
                    hoveredIndex === index ? "scale-150 shadow-[0_0_12px_rgba(255,111,66,1)]" : "scale-100"
                  }`}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#1a1a1a]" />
    </main>
  );
}


