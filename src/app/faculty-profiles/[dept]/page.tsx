"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { departments, facultyByDept } from "@/lib/faculty";
import ZoomedBackground from "@/components/faculty/ZoomedBackground";
import FacultyGallery from "@/components/faculty/FacultyGallery";
import FacultyInfoList from "@/components/faculty/FacultyInfoList";

/**
 * FacultyDetail Page
 * 
 * Displays detailed information about faculty members within a specific department.
 * Features a zoomed-in brand background and a glassmorphic content panel.
 */
export default function FacultyDetail() {
  const params = useParams();
  const deptSlug = params.dept as string;
  
  const [memberIndex, setMemberIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const dept = departments.find((d) => d.slug === deptSlug);
  const faculty = dept ? facultyByDept[dept.name] || [] : [];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!dept) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <h1 className="text-2xl font-bold font-major text-neutral-900 uppercase">Department not found</h1>
      </div>
    );
  }

  return (
    <main className="relative flex w-full flex-col selection:bg-[#BA3D1B] selection:text-white">
      {/* Sharp zoomed logo background */}
      <ZoomedBackground dept={dept} isVisible={isVisible} />

      <div className="relative z-10 w-full flex flex-col md:flex-row items-stretch min-h-[calc(100vh-64px)]">
        {/* Left Section: Back Navigation */}
        <div className="w-full md:w-[32%] shrink-0 flex flex-col p-8 md:p-14 lg:p-20">
          <Link
            href="/faculty-profiles"
            className={`group relative flex items-center gap-4 px-8 py-4 bg-[#BA3D1B] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-700 w-fit cursor-pointer ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <div className="flex items-center justify-center text-white transition-transform group-hover:-translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-[13px] font-bold tracking-tighter text-white uppercase">Back to Directory</span>
          </Link>
        </div>

        {/* Right Section: Detailed Info Panel (Blurred) */}
        <div 
          className={`flex-1 flex flex-col bg-white/70 backdrop-blur-md relative shadow-[-50px_0_120px_rgba(0,0,0,0.06)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200/40" />

          <div className="flex-1 px-8 md:px-16 lg:px-24 py-12 md:py-24 custom-scrollbar overflow-y-auto">
            <header className="mb-20">
              <h1 className="font-major text-[48px] md:text-[85px] font-medium tracking-tighter text-neutral-900 uppercase leading-[0.9]">
                {dept.name}
              </h1>
            </header>

            <div className="flex flex-col gap-20 items-start pb-32">
              <div className="flex flex-col lg:flex-row gap-16 items-start w-full">
                <FacultyGallery 
                  faculty={faculty} 
                  memberIndex={memberIndex} 
                  onSelect={setMemberIndex} 
                />
                <FacultyInfoList 
                  faculty={faculty} 
                  memberIndex={memberIndex} 
                  onSelect={setMemberIndex} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Global brand markers */}
      <div className="fixed bottom-8 left-8 h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-[12px] text-white font-bold opacity-80 z-50">N</div>
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#141414] z-50" />

    </main>
  );
}
