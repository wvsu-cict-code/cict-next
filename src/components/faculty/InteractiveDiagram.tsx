"use client";

import Image from "next/image";
import { Department } from "@/lib/faculty";

interface InteractiveDiagramProps {
  departments: Department[];
  hoveredIndex: number | null;
  zoomedIndex: number | null;
  isTransitioning: boolean;
  onHover: (index: number | null) => void;
  onClick: (e: React.MouseEvent, index: number) => void;
}

export default function InteractiveDiagram({
  departments,
  hoveredIndex,
  zoomedIndex,
  isTransitioning,
  onHover,
  onClick,
}: InteractiveDiagramProps) {
  const currentScale = zoomedIndex !== null ? departments[zoomedIndex].zoomScale : 1;
  const invScale = 1 / (currentScale || 1);

  return (
    <div className="relative flex-1 w-full hidden md:flex items-center justify-center min-h-[600px]">
      <div
        className="absolute z-10 w-full max-w-[1600px] aspect-[16/10] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
        style={{
          left: "50%",
          top: "48%",
          transform: `translate(-50%, -50%) scale(${currentScale * (zoomedIndex !== null ? 1 : 0.6)})`,
          transformOrigin: zoomedIndex !== null
            ? `${((departments[zoomedIndex].logoAnchor.x + 300) / 1600) * 100}% ${(departments[zoomedIndex].logoAnchor.y / 1000) * 100}%`
            : "center center",
          pointerEvents: isTransitioning ? "none" : "auto",
        }}
      >
        {/* Background Logo */}
        <div className="absolute inset-x-0 top-0 bottom-0 z-0 flex justify-center items-center">
          <div className="relative h-full aspect-square">
            <Image src="/icons/facultiylogo.svg" alt="CICT Logo" fill priority className="object-contain" />
          </div>
        </div>

        {/* Connection Lines */}
        <svg
          className={`absolute inset-0 z-10 h-full w-full pointer-events-none transition-all duration-700 ${isTransitioning || zoomedIndex !== null ? 'opacity-0' : 'opacity-100'}`}
          viewBox="-300 0 1600 1000"
          fill="none"
        >
          {departments.map((dept, index) => (
            <line 
              key={`line-${index}`} 
              x1={dept.x} 
              y1={dept.y} 
              x2={dept.logoAnchor.x} 
              y2={dept.logoAnchor.y} 
              stroke="#BA3D1B" 
              strokeWidth="2.5" 
              className="transition-all duration-300" 
              style={{ vectorEffect: 'non-scaling-stroke' }} 
              strokeOpacity={hoveredIndex === null ? "0.6" : hoveredIndex === index ? "1" : "0.1"} 
            />
          ))}
        </svg>

        {/* Department Labels */}
        <div className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ${isTransitioning || zoomedIndex !== null ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="relative w-full h-full">
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
                onMouseEnter={() => onHover(index)}
                onMouseLeave={() => onHover(null)}
              >
                <button
                  onClick={(e) => onClick(e, index)}
                  className={`flex items-center gap-4 ${dept.side === "left" ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`px-4 py-2 bg-white border border-neutral-100 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ${hoveredIndex === index ? 'scale-110 shadow-[0_10px_30px_rgba(0,0,0,0.12)] -translate-y-1' : 'scale-100'}`}>
                    <span className={`font-minor text-[12px] lg:text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${hoveredIndex === null || hoveredIndex === index ? "text-neutral-900" : "text-neutral-400 opacity-40"}`}>
                      {dept.name}
                    </span>
                  </div>
                  <div className={`h-2 w-2 bg-[#BA3D1B] rounded-full transition-all duration-300 shrink-0 ${hoveredIndex === index ? "scale-150 shadow-[0_0_12px_rgba(186,61,27,1)]" : "scale-100"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
