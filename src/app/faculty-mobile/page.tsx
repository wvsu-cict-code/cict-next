"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const facultyByDept = [
  {
    id: "deans-office",
    name: "Deans Office",
    faculty: [
      { 
        name: "DR. MA. BETH S. CONCEPCION", 
        title: "College Dean", 
        description: "Faculty in BSIS and MIT", 
        image: "/images/dean.png" 
      },
      { 
        name: "MR. NEILJAN C. RABORAR", 
        title: "College Secretary, Quality Assurance Focal Person", 
        description: "Faculty in BSIS and MIT", 
        image: "/images/secretary.png" 
      },
      { 
        name: "MS. AUBREY V. BALAJADIA", 
        title: "Administrative Aide Clerk", 
        description: "Office Administration", 
        image: "/images/clerk.png" 
      }
    ]
  },
  { id: "cs", name: "Computer Science", faculty: [] },
  { id: "it", name: "Information Technology", faculty: [] },
  { id: "is", name: "Information System", faculty: [] },
  { id: "emc", name: "Entertainment and Multimedia Computing", faculty: [] },
  { id: "lis", name: "Library and Information Science", faculty: [] },
  { id: "lts", name: "Laboratory and Technical Support", faculty: [] },
  { id: "mit", name: "Master of Information Technology", faculty: [] },
];

export default function FacultyMobile() {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // Deans Office open by default

  const toggleAccordion = (index: number) => {
    setOpenIdx(openIdx === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      {/* Mobile Prototype Container */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#fce8e2] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-neutral-900 relative flex flex-col font-minor text-[#2b1b17] selection:bg-[#ba3d1b] selection:text-white">
        
        {/* Subtle Stripe Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #2b1b17 40px, #2b1b17 41px)' }} />

        {/* STATUS BAR */}
        <div className="h-10 px-8 pt-6 flex justify-between items-center z-10">
          <span className="text-[12px] font-bold">9:30</span>
          <div className="flex gap-1.5 items-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8h14v-8h3L12 3z"/></svg>
            <div className="w-6 h-3 border border-current rounded-sm relative"><div className="absolute left-0 top-0 bottom-0 w-3/4 bg-current" /></div>
          </div>
        </div>

        {/* NAV BAR */}
        <nav className="px-6 py-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 relative">
               <Image src="/icons/facultiylogo.svg" alt="WVSU Logo" fill className="object-contain filter grayscale brightness-50" />
             </div>
             <span className="text-[14px] font-major font-bold tracking-tight uppercase">WVSU <span className="text-[#ba3d1b]">CICT</span></span>
          </div>
          <button className="p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </nav>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-8 pb-12 z-10 px-4">
          
          {/* PAGE TITLE */}
          <header className="mb-10 pl-2">
            <h1 className="text-3xl font-major tracking-tight uppercase flex flex-col leading-none">
              <span className="font-bold text-[#2b1b17]">Faculty</span>
              <span className="text-[#f48128] italic ml-1">Directory</span>
            </h1>
          </header>

          {/* ACCORDION LIST */}
          <div className="flex flex-col border-b border-[#e8b8aa]">
            {facultyByDept.map((dept, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={dept.id} className="flex flex-col border-t border-[#e8b8aa]">
                  {/* Accordion Row */}
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className={`w-full flex items-center justify-between px-5 py-4.5 transition-all duration-300 ${isOpen ? 'bg-[#f48128] text-white' : 'bg-white text-[#2b1b17]'}`}
                  >
                    <span className="font-minor font-bold text-[14px] text-left leading-tight pr-4 uppercase tracking-tight">{dept.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOpen && <span className="text-[10px] font-minor font-medium uppercase tracking-widest opacity-90">See more →</span>}
                      <svg className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-neutral-50/30`}
                    style={{ maxHeight: isOpen ? (dept.faculty.length ? `${dept.faculty.length * 140}px` : '100px') : '0px' }}
                  >
                    <div className="flex flex-col divide-y divide-[#e8b8aa]/40">
                      {dept.faculty.length > 0 ? (
                        dept.faculty.map((member, mIdx) => (
                          <div key={mIdx} className="bg-white p-4 flex items-center gap-4">
                            {/* Photo Thumbnail */}
                            <div className="w-16 h-16 shrink-0 relative rounded-md overflow-hidden bg-[#e8b8aa]/20 border border-[#e8b8aa]/30">
                              {member.image ? (
                                <Image src={member.image} alt={member.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#fce8e2]">
                                  <span className="text-[#ba3d1b] font-major font-bold text-lg">
                                    {(member.name.split(' ').pop() || 'F').charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Info Block */}
                            <div className="flex flex-1 items-stretch gap-3">
                              {/* Red Highlight Bar */}
                              <div className="w-1 bg-[#ba3d1b] rounded-full self-stretch" />
                              
                              <div className="flex flex-col justify-center py-1">
                                <h3 className="font-major font-bold text-[13px] text-[#2b1b17] leading-tight uppercase tracking-tight mb-0.5">
                                  {member.name}
                                </h3>
                                <p className="font-minor font-bold text-[12px] text-[#ba3d1b] leading-tight mb-1 tracking-tight">
                                  {member.title}
                                </p>
                                <p className="font-minor text-[11px] text-neutral-500 font-medium leading-tight">
                                  {member.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-white italic text-[12px] text-neutral-400">
                           No records found for this department.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </main>

        {/* BOTTOM HOME INDICATOR */}
        <div className="h-8 flex justify-center items-end pb-2 shrink-0">
          <div className="w-32 h-1 bg-neutral-900/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
