"use client";

import { Department } from "@/lib/faculty";

interface MobileListProps {
  departments: Department[];
  zoomedIndex: number | null;
  isTransitioning: boolean;
  onClick: (e: React.MouseEvent, index: number) => void;
}

export default function MobileList({
  departments,
  zoomedIndex,
  isTransitioning,
  onClick,
}: MobileListProps) {
  return (
    <div className={`w-full px-6 pb-20 z-20 md:hidden ${isTransitioning ? 'hidden' : 'block'}`}>
      <div className="bg-white rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-neutral-100 overflow-hidden">
        {departments.map((dept, index) => {
          const isActive = zoomedIndex === index;
          return (
            <button
              key={index}
              onClick={(e) => onClick(e, index)}
              className={`w-full flex items-center justify-between px-6 py-5 border-b border-neutral-100 last:border-0 transition-all duration-300 text-left
                ${isActive ? 'ring-2 ring-inset ring-[#f48128] bg-[#f48128]/5' : 'bg-white'}`}
            >
              <span className={`font-minor font-bold text-[15px] tracking-tight transition-colors duration-300 ${isActive ? 'text-[#f48128]' : 'text-neutral-900'}`}>
                {dept.name}
              </span>
              {isActive && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-500">
                  <span className="text-[#f48128] text-[10px] font-minor italic font-medium">See more</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f48128" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
