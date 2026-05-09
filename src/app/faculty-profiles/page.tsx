"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { departments } from "@/lib/faculty";
import InteractiveDiagram from "@/components/faculty/InteractiveDiagram";
import MobileList from "@/components/faculty/MobileList";

/**
 * FacultyProfiles Page
 * 
 * Displays the interactive faculty directory with a central logo diagram.
 * Features a seamless zoom-and-pan transition to individual department pages.
 */
export default function FacultyProfiles() {
  const router = useRouter();
  
  // Interaction State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Handles department selection with a zoom animation before navigation
   */
  const handleDeptClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setZoomedIndex(index);
    setIsTransitioning(true);
    
    // Allow the 1000ms CSS transition to play out before routing
    setTimeout(() => {
      router.push(departments[index].link);
    }, 1000);
  };

  // Reset state when mounting (in case of browser back navigation)
  useEffect(() => {
    setZoomedIndex(null);
    setIsTransitioning(false);
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-white overflow-hidden scroll-smooth selection:bg-[#BA3D1B] selection:text-white">
      {/* Page Header */}
      <header className={`relative z-30 w-full text-center pt-16 pb-8 px-8 transition-all duration-700 ${isTransitioning ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
        <h1 className="text-3xl md:text-6xl font-major tracking-tight leading-none">
          <span className="text-neutral-900 font-bold">Faculty</span>
          <span className="text-[#f48128] ml-2 font-medium">Directory</span>
        </h1>
      </header>

      {/* Mobile-specific view */}
      <MobileList 
        departments={departments} 
        zoomedIndex={zoomedIndex} 
        isTransitioning={isTransitioning} 
        onClick={handleDeptClick} 
      />

      {/* Desktop-specific interactive diagram */}
      <InteractiveDiagram 
        departments={departments}
        hoveredIndex={hoveredIndex}
        zoomedIndex={zoomedIndex}
        isTransitioning={isTransitioning}
        onHover={setHoveredIndex}
        onClick={handleDeptClick}
      />

      {/* Brand Watermarks */}
      <div className="fixed bottom-4 left-4 h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-white font-bold opacity-80 z-50">N</div>
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#141414] z-50" />
    </main>
  );
}
