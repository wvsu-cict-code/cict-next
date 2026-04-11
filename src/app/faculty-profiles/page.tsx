"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function FacultyProfiles() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"directory" | "detail">("directory");

  const faculty = useMemo(() => [
    {
      name: "DR. MA. BETH S. CONCEPCION",
      title: "College Dean",
      description: "Faculty in BSIS and MIT",
      color: "bg-[#BA3D1B]",
    },
    {
      name: "MR. NEILJAN C. RABORAR",
      title: "College Secretary",
      subtitle: "Quality Assurance Focal Person",
      description: "Faculty in BSIS",
      color: "bg-neutral-300",
    },
    {
      name: "MS. AUBREY V. BALAJADIA",
      title: "Administrative Aide Clerk",
      description: "",
      color: "bg-neutral-300",
    },
  ], []);

  const handleDeptClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setZoomedIndex(index);
    setTimeout(() => {
      setActiveView("detail");
    }, 1000);
  };

  const handleBack = () => {
    setActiveView("directory");
    setTimeout(() => {
      setZoomedIndex(null);
    }, 150);
  };

  const departments = [
    {
      name: "DEANS OFFICE",
      side: "left",
      y: 200, x: 0, 
      link: "/faculty-profiles/deans-office",
      logoAnchor: { x: 130, y: 200 }, 
      zoomScale: 15,
    },
    {
      name: "INFORMATION TECHNOLOGY",
      side: "left",
      y: 450, x: -100,
      link: "/faculty-profiles/it",
      logoAnchor: { x: 170, y: 450 },
      zoomScale: 12,
    },
    {
      name: "INFORMATION SYSTEM",
      side: "left",
      y: 650, x: 0,
      link: "/faculty-profiles/is",
      logoAnchor: { x: 400, y: 650 },
      zoomScale: 12,
    },
    {
      name: "Master of Information Technology",
      side: "left",
      y: 840, x: 350,
      link: "/faculty-profiles/mit",
      logoAnchor: { x: 440, y: 840 },
      zoomScale: 12,
    },
    {
      name: "COMPUTER SCIENCE",
      side: "right",
      y: 300, x: 1000,
      link: "/faculty-profiles/cs",
      logoAnchor: { x: 800, y: 300 },
      zoomScale: 12,
    },
    {
      name: "Library & Information Science",
      side: "right",
      y: 500, x: 850,
      link: "/faculty-profiles/lis",
      logoAnchor: { x: 510, y: 500 },
      zoomScale: 12,
    },
    {
      name: "Entertainment and Multimedia Computing",
      side: "right",
      y: 580, x: 800,
      link: "/faculty-profiles/emc",
      logoAnchor: { x: 560, y: 580 },
      zoomScale: 12,
    },
    {
      name: "Laboratory & Technical Support",
      side: "right",
      y: 750, x: 850,
      link: "/faculty-profiles/lts",
      logoAnchor: { x: 530, y: 750 },
      zoomScale: 12,
    },
  ];

  const currentScale = zoomedIndex !== null ? departments[zoomedIndex].zoomScale : 1;
  const invScale = 1 / currentScale;

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-white overflow-hidden scroll-smooth selection:bg-[#BA3D1B] selection:text-white pt-20">
      <header className={`relative z-30 w-full text-center pb-20 px-8 transition-all duration-700 ${zoomedIndex !== null ? 'opacity-0 -translate-y-10 focus-within:opacity-100' : 'opacity-100'}`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-major tracking-tight uppercase">
          <span className="text-neutral-900 font-bold">Faculty </span>
          <span className="text-[#BA3D1B]">Directory</span>
        </h1>
      </header>

      <div 
        className="absolute z-10 w-full max-w-[1600px] aspect-[16/10] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
        style={{
          left: activeView === "detail" ? "22%" : "50%",
          top: activeView === "detail" ? "50%" : "55%", 
          transform: `translate(-50%, -50%) scale(${currentScale * (activeView === "detail" ? 1 : 0.6)})`,
          transformOrigin: zoomedIndex !== null 
            ? `${((departments[zoomedIndex].logoAnchor.x + 300) / 1600) * 100}% ${(departments[zoomedIndex].logoAnchor.y / 1000) * 100}%` 
            : "center center",
          opacity: activeView === "detail" ? 0.2 : 1,
        }}
      >
        {/* LOGO AREA (Centered at 0-1000 scale, but viewBox is wider) */}
        <div className="absolute inset-x-0 top-0 bottom-0 z-0 flex justify-center items-center">
           <div className="relative h-full aspect-square">
             <Image src="/icons/facultiylogo.svg" alt="CICT Logo" fill priority className="object-contain" />
           </div>
        </div>

        {/* SVG LINES (WIDER VIEWBOX) */}
        <svg 
          className={`absolute inset-0 z-10 h-full w-full pointer-events-none transition-all duration-700 ${zoomedIndex !== null ? 'opacity-0' : 'opacity-100'}`} 
          viewBox="-300 0 1600 1000" 
          fill="none"
        >
          {departments.map((dept, index) => (
            <line key={`line-${index}`} x1={dept.x} y1={dept.y} x2={dept.logoAnchor.x} y2={dept.logoAnchor.y} stroke="#BA3D1B" strokeWidth="1" className="transition-all duration-300" style={{ vectorEffect: 'non-scaling-stroke' }} strokeOpacity={hoveredIndex === null ? "0.6" : hoveredIndex === index ? "1" : "0.1"} />
          ))}
        </svg>

        {/* LABELS & DOTS (WIDER AREA) */}
        <div className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ${zoomedIndex !== null ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="relative w-full h-full">
            {/* The following coordinates are relative to the -300 to 1300 viewBox horizontally */}
            {departments.map((dept, index) => (
              <div 
                key={index} 
                className="absolute pointer-events-auto transition-all duration-300" 
                style={{ 
                  top: `${(dept.y / 1000) * 100}%`, 
                  left: `${((dept.x + 300) / 1600) * 100}%`, 
                  transform: `translate(${dept.side === "left" ? "-100%" : "0%"}, -50%) scale(${invScale * 1.5})`, 
                  transformOrigin: dept.side === "left" ? "right center" : "left center" 
                }} 
                onMouseEnter={() => setHoveredIndex(index)} 
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button 
                  onClick={(e) => handleDeptClick(e, index)} 
                  className={`flex items-center gap-3 ${dept.side === "left" ? "flex-row" : "flex-row-reverse"}`}
                >
                  <span className={`font-minor text-[12px] md:text-[14px] font-bold tracking-[0.05em] uppercase whitespace-nowrap transition-all duration-300 text-[#BA3D1B] ${hoveredIndex === null || hoveredIndex === index ? "opacity-100" : "opacity-20"}`}>
                    {dept.name}
                  </span>
                  <div className={`h-1.5 w-1.5 bg-[#BA3D1B] rounded-[1px] transition-all duration-300 shrink-0 ${hoveredIndex === index ? "scale-150 shadow-[0_0_12px_rgba(186,61,27,1)]" : "scale-100"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`w-full min-h-screen fixed inset-0 z-40 flex items-stretch transition-all duration-1000 ${activeView === "detail" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-20 pointer-events-none"}`}>
        <div className="relative w-[32%] shrink-0 flex flex-col p-14 lg:p-20">
           <button 
            onClick={handleBack} 
            className="group relative z-50 flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 w-fit cursor-pointer"
           >
             <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#BA3D1B] text-white transition-transform group-hover:-rotate-45">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M19 12H5M12 19l-7-7 7-7" />
               </svg>
             </div>
             <span className="text-[8px] font-black tracking-[0.2em] text-neutral-900 uppercase">Return to Faculty</span>
           </button>
        </div>

        <div className="flex-1 flex flex-col px-12 lg:px-24 py-24 bg-white relative shadow-[-60px_0_90px_rgba(0,0,0,0.05)] overflow-y-auto">
          <div className="absolute left-0 top-0 h-full w-px bg-neutral-100/60" />
          <header className="mb-24">
            <h1 className="font-major text-[70px] font-medium tracking-[-0.02em] text-neutral-900 uppercase leading-[85px]">DEANS OFFICE</h1>
          </header>

          <div className="flex flex-col xl:flex-row gap-20 items-start">
            <div className="relative flex gap-5 z-20">
              <div className="flex flex-col gap-5">
                <button
                  onMouseEnter={() => setZoomedIndex(0)}
                  onClick={() => setZoomedIndex(0)} 
                  className={`relative h-[280px] w-[210px] overflow-hidden rounded-[2px] transition-all duration-500 cursor-pointer outline-none ${zoomedIndex === 0 ? 'scale-105 z-20 shadow-2xl' : 'grayscale opacity-50'}`}
                >
                  <Image src="/images/dean.png" alt="Dean" fill className="object-cover" />
                </button>
                <button 
                  onMouseEnter={() => setZoomedIndex(2)}
                  onClick={() => setZoomedIndex(2)}
                  className={`relative h-[280px] w-[210px] overflow-hidden rounded-[2px] transition-all duration-500 cursor-pointer outline-none ${zoomedIndex === 2 ? "scale-105 z-20 shadow-2xl" : "scale-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"}`}
                >
                  <Image src="/images/clerk.png" alt="Aide" fill className="object-cover" />
                </button>
              </div>
              <div className="mt-28 flex flex-col gap-5">
                <button 
                  onMouseEnter={() => setZoomedIndex(1)}
                  onClick={() => setZoomedIndex(1)}
                  className={`relative h-[240px] w-[230px] overflow-hidden rounded-[2px] transition-all duration-500 border-r-8 border-[#BA3D1B]/10 cursor-pointer outline-none ${zoomedIndex === 1 ? "scale-105 z-20 shadow-2xl" : "scale-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"}`}
                >
                  <Image src="/images/secretary.png" alt="Secretary" fill className="object-cover" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-12 pt-6 z-20">
              {faculty.map((member, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setZoomedIndex(idx)}
                  className="group flex items-start gap-10 text-left outline-none cursor-pointer"
                >
                  <div className={`mt-2 h-4 shrink-0 transition-all duration-500 shadow-sm ${zoomedIndex === idx ? 'bg-[#f48128] w-20' : 'bg-neutral-200 w-12'}`} />
                  <div className="flex flex-col gap-2.5">
                    <h2 className={`font-minor text-2xl font-bold tracking-tight transition-colors duration-300 ${zoomedIndex === idx ? 'text-[#f48128]' : 'text-neutral-900 group-hover:text-[#BA3D1B]'}`}>
                      {member.name}
                    </h2>
                    <div className="flex flex-col">
                      <span className={`font-minor text-sm font-black tracking-[0.15em] uppercase transition-colors ${zoomedIndex === idx ? 'text-[#f48128]/70' : 'text-neutral-500'}`}>{member.title}</span>
                      {member.subtitle && <span className="font-minor text-xs font-semibold text-neutral-400 mt-1">{member.subtitle}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-white font-bold opacity-80 z-50">N</div>
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#141414] z-50" />
    </main>
  );
}


