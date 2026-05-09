"use client";

import Image from "next/image";
import { Department } from "@/lib/faculty";

interface ZoomedBackgroundProps {
  dept: Department;
  isVisible: boolean;
}

export default function ZoomedBackground({ dept, isVisible }: ZoomedBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white">
      <div 
        className={`absolute w-full max-w-[1600px] aspect-[16/10] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          left: "50%",
          top: "48%",
          transform: `translate(-50%, -50%) scale(${dept.zoomScale})`,
          transformOrigin: `${((dept.logoAnchor.x + 300) / 1600) * 100}% ${(dept.logoAnchor.y / 1000) * 100}%`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full aspect-square opacity-40">
            <Image src="/icons/facultiylogo.svg" alt="" fill className="object-contain" priority />
          </div>
        </div>
      </div>
    </div>
  );
}
