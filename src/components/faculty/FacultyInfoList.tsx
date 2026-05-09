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
              className={`mt-1.5 shrink-0 transition-all duration-700 rounded-[2px] 
                ${isActive 
                  ? 'bg-[#f48128] w-12 h-6 shadow-[0_0_15px_rgba(244,129,40,0.4)]' 
                  : 'bg-[#a3a3a3] w-6 h-6 opacity-60'
                }`} 
            />

            <div className="flex flex-col gap-1.5">
              {/* Name: Bold black when active, muted gray when inactive */}
              <h2 className={`font-minor text-[19px] font-bold tracking-tight transition-all duration-300 uppercase
                ${isActive ? 'text-black' : 'text-[#737373]'}
              `}>
                {member.name}
              </h2>

              <div className={`flex flex-col gap-0.5 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {/* Title: Bold black when active, muted gray when inactive */}
                {member.title.split("/").map((segment, sIdx) => (
                  <span 
                    key={sIdx} 
                    className={`font-minor text-[15px] font-bold tracking-tight leading-tight
                      ${isActive ? 'text-black' : 'text-[#737373]'}
                    `}
                  >
                    {segment.trim()}
                  </span>
                ))}
                
                {/* Description: Always muted gray as in Figma */}
                <span className={`font-minor text-[14px] font-medium mt-1 leading-tight
                  ${isActive ? 'text-[#333333]' : 'text-[#a3a3a3]'}
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
