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
      <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(16,32,51,0.06)] border border-rule overflow-hidden">
        {departments.map((dept, index) => {
          const isActive = zoomedIndex === index;
          return (
            <button
              key={index}
              onClick={(e) => onClick(e, index)}
              className={`w-full flex items-center justify-between px-6 py-5 border-b border-rule last:border-0 transition-all duration-300 text-left
                ${isActive ? 'ring-2 ring-inset ring-theme-red bg-theme-red/5' : 'bg-white'}`}
            >
              <span className={`text-base font-semibold transition-colors duration-300 ${isActive ? 'text-theme-red' : 'text-ink'}`}>
                {dept.name}
              </span>
              {isActive && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-500">
                  <span className="text-theme-red text-xs font-semibold">See more</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-theme-red" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
