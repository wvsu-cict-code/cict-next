"use client";

import Image from "next/image";
import { FacultyMember } from "@/lib/faculty";

interface FacultyGalleryProps {
  faculty: FacultyMember[];
  memberIndex: number;
  onSelect: (index: number) => void;
}

export default function FacultyGallery({ faculty, memberIndex, onSelect }: FacultyGalleryProps) {
  const leftCol = faculty.slice(0, 10).filter((_, i) => i % 2 === 0);
  const rightCol = faculty.slice(0, 10).filter((_, i) => i % 2 !== 0);

  return (
    <div className="relative flex gap-6 z-20 shrink-0 mx-auto lg:mx-0">
      <div className="flex flex-col gap-6">
        {leftCol.map((member, i) => {
          const originalIdx = i * 2;
          const isActive = memberIndex === originalIdx;
          return (
            <button
              key={originalIdx}
              onMouseEnter={() => onSelect(originalIdx)}
              onClick={() => onSelect(originalIdx)}
              className={`relative aspect-square w-[180px] md:w-[200px] lg:w-[220px] rounded-sm overflow-hidden transition-all duration-700 cursor-pointer outline-none ${isActive ? 'scale-105 z-20 shadow-2xl' : 'grayscale opacity-30 hover:opacity-100 hover:grayscale-0'}`}
            >
              <Image src={member.image} alt={member.name} fill className="object-cover" />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-6 mt-16">
        {rightCol.map((member, i) => {
          const originalIdx = i * 2 + 1;
          const isActive = memberIndex === originalIdx;
          return (
            <button
              key={originalIdx}
              onMouseEnter={() => onSelect(originalIdx)}
              onClick={() => onSelect(originalIdx)}
              className={`relative aspect-square w-[180px] md:w-[200px] lg:w-[220px] rounded-sm overflow-hidden transition-all duration-700 cursor-pointer outline-none ${isActive ? 'scale-105 z-20 shadow-2xl' : 'grayscale opacity-30 hover:opacity-100 hover:grayscale-0'}`}
            >
              <Image src={member.image} alt={member.name} fill className="object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
