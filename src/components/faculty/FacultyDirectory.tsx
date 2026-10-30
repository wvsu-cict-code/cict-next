"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Department } from "@/lib/faculty";
import InteractiveDiagram from "@/components/faculty/InteractiveDiagram";
import MobileList from "@/components/faculty/MobileList";
import { Eyebrow } from "@/components/PageHeader";

/**
 * Kept compact: the department page's zoomed background is lined up with
 * where the diagram sits below this header.
 */
export function FacultyPageHeader() {
  return (
    <header className="relative z-30 w-full px-8 pt-16 pb-8 text-center">
      <div className="flex justify-center">
        <Eyebrow>Faculty</Eyebrow>
      </div>
      <h1 className="text-ink mt-3 text-3xl leading-none font-medium md:text-6xl">
        Faculty directory
      </h1>
    </header>
  );
}

/**
 * FacultyDirectory
 *
 * Displays the interactive faculty directory with a central logo diagram.
 * Features a seamless zoom-and-pan transition to individual department pages.
 */
export default function FacultyDirectory({
  departments,
}: {
  departments: Department[];
}) {
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
    <div className="selection:bg-theme-red relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-white selection:text-white">
      {/* Page Header */}
      <div
        className={`relative z-30 w-full transition-all duration-700 ${isTransitioning ? "-translate-y-10 opacity-0" : "opacity-100"}`}
      >
        <FacultyPageHeader />
      </div>

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
    </div>
  );
}
