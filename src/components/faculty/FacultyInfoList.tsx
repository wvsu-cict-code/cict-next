"use client";

import { FacultyMember } from "@/lib/faculty";

interface FacultyInfoListProps {
  faculty: FacultyMember[];
  memberIndex: number;
  onSelect: (index: number) => void;
}

export default function FacultyInfoList({ faculty, memberIndex, onSelect }: FacultyInfoListProps) {
  return (
    <div className="flex-1 flex flex-col gap-12 pt-4">
      {faculty.map((member, idx) => {
        const isActive = memberIndex === idx;
        return (
          <button
            key={idx}
            onMouseEnter={() => onSelect(idx)}
            onClick={() => onSelect(idx)}
            className="group flex items-start gap-8 text-left outline-none cursor-pointer"
          >
            {/* Box Indicator: Rectangle when active, Square when inactive */}
            <div 
              className={`shrink-0 transition-all duration-700 rounded-full 
                ${isActive 
                  ? 'bg-theme-red w-10 h-1.5 mt-3' 
                  : 'bg-rule w-5 h-1.5 mt-3'
                }`} 
            />

            <div className="flex flex-col gap-1.5">
              {/* Name: Bold black when active, muted gray when inactive */}
              <h2 className={`text-lg font-semibold transition-all duration-300 uppercase
                ${isActive ? 'text-ink' : 'text-ink-soft'}
              `}>
                {member.name}
              </h2>

              <div className={`flex flex-col gap-0.5 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {/* Title: Bold black when active, muted gray when inactive */}
                {member.title.split("/").map((segment, sIdx) => (
                  <span 
                    key={sIdx} 
                    className={`text-[15px] font-medium leading-tight
                      ${isActive ? 'text-ink' : 'text-ink-soft'}
                    `}
                  >
                    {segment.trim()}
                  </span>
                ))}
                
                {/* Description: Always muted gray as in Figma */}
                <span className={`text-sm mt-1 leading-snug
                  ${isActive ? 'text-ink-soft' : 'text-ink-soft/70'}
                `}>
                  {member.description}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
