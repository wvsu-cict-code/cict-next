"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DeansOffice() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const themeOrange = "#f48128"; // Based on globals.css --color-orange-dark

  const faculty = [
    {
      name: "DR. MA. BETH S. CONCEPCION",
      title: "College Dean",
      description: "Faculty in BSIS and MIT",
      image: "/images/dean.png",
      role: "Leadership",
    },
    {
      name: "MR. NEILJAN C. RABORAR",
      title: "College Secretary",
      subtitle: "Quality Assurance Focal Person",
      description: "Faculty in BSIS",
      image: "/images/secretary.png",
      role: "Administration",
    },
    {
      name: "MS. AUBREY V. BALAJADIA",
      title: "Administrative Aide Clerk",
      description: "Office Administration",
      image: "/images/clerk.png",
      role: "Support",
    },
  ];

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-white overflow-x-hidden selection:bg-[#f48128] selection:text-white">
      {/* HEADER SECTION */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-10 lg:px-16 lg:py-12">
        <Link 
          href="/faculty-profiles" 
          className="group flex items-center gap-4 px-5 py-2.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BA3D1B] text-white transition-transform group-hover:-rotate-45">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-neutral-900 uppercase">Return to Faculty</span>
        </Link>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black tracking-[0.3em] text-[#BA3D1B] uppercase mb-1">Office of the Dean</span>
          <div className="h-1 w-12 bg-[#BA3D1B]" />
        </div>
      </nav>

      <section className="relative z-10 flex flex-col px-8 lg:px-24 pt-10 pb-32">
        <div className="max-w-[1400px] mx-auto w-full">
          {/* TITLE BLOCK */}
          <header className={`mb-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-major text-[70px] font-medium tracking-[-0.02em] text-neutral-900 uppercase leading-[85px]">
              DEANS OFFICE
            </h1>
          </header>

          <div className="flex flex-col xl:flex-row gap-20 items-start">
            
            {/* ASYMMETRIC GRID - LEFT SIDE */}
            <div className="relative z-30 w-full xl:w-1/2 flex gap-6 h-[700px]">
              {/* Primary Column */}
              <div className="flex flex-col gap-6 w-1/2">
                 {/* Dean Image */}
                 <button 
                  onMouseEnter={() => setActiveIndex(0)}
                  onClick={() => setActiveIndex(0)}
                  className={`relative h-[340px] w-full cursor-pointer transition-all duration-700 rounded-sm overflow-hidden shadow-lg outline-none
                  ${activeIndex === 0 ? "scale-105 z-20 shadow-2xl" : "scale-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"}`}
                 >
                    <Image src={faculty[0].image} alt={faculty[0].name} fill className="object-cover" />
                    {activeIndex === 0 && <div className="absolute inset-0 bg-[#f48128]/10" />}
                 </button>

                 {/* Clerk Image */}
                 <button 
                  onMouseEnter={() => setActiveIndex(2)}
                  onClick={() => setActiveIndex(2)}
                  className={`relative h-[300px] w-full cursor-pointer transition-all duration-700 rounded-sm overflow-hidden shadow-lg outline-none
                  ${activeIndex === 2 ? "scale-105 z-20 shadow-2xl ring-4 ring-[#f48128]" : "scale-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"}`}
                 >
                    <Image src={faculty[2].image} alt={faculty[2].name} fill className="object-cover border-t-4 border-white" />
                    {activeIndex === 2 && <div className="absolute inset-0 bg-[#f48128]/10" />}
                 </button>
              </div>

              {/* Offset Column */}
              <div className="flex flex-col gap-6 w-1/2 pt-24">
                 {/* Secretary Image */}
                 <button 
                  onMouseEnter={() => setActiveIndex(1)}
                  onClick={() => setActiveIndex(1)}
                  className={`relative h-[360px] w-full cursor-pointer transition-all duration-700 rounded-sm overflow-hidden shadow-lg outline-none
                  ${activeIndex === 1 ? "scale-105 z-20 shadow-2xl ring-4 ring-[#f48128]" : "scale-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"}`}
                 >
                    <Image src={faculty[1].image} alt={faculty[1].name} fill className="object-cover border-r-4 border-white" />
                    {activeIndex === 1 && <div className="absolute inset-0 bg-[#f48128]/10" />}
                 </button>

                 <div className="h-[140px] w-full border border-neutral-100 rounded-sm flex items-center justify-center p-8 opacity-40">
                    <div className="w-full h-full border-t border-l border-neutral-200" />
                 </div>
              </div>
            </div>

            {/* INTERACTIVE FACULTY LIST - RIGHT SIDE */}
            <div className="relative z-30 flex flex-1 flex-col gap-14 pt-8 w-full">
              {faculty.map((member, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveIndex(idx)}
                  className="group flex items-start gap-12 text-left outline-none"
                >
                  {/* Status/Color Block Indicator */}
                  <div className={`mt-2 h-4 w-12 shrink-0 transition-all duration-500 shadow-sm ${activeIndex === idx ? 'bg-[#f48128] w-20' : 'bg-neutral-200'}`} />
                  
                  <div className="flex flex-col gap-3">
                    <h2 className={`font-minor text-2xl font-bold tracking-tight transition-all duration-500 uppercase ${activeIndex === idx ? 'text-[#f48128]' : 'text-neutral-900'}`}>
                      {member.name}
                    </h2>
                    
                    <div className="flex flex-col">
                      <span className={`font-minor text-[12px] font-black tracking-[0.2em] uppercase transition-colors duration-500 ${activeIndex === idx ? 'text-[#f48128]/70' : 'text-neutral-500'}`}>
                        {member.title}
                      </span>
                      
                      <span className={`font-minor text-[10px] font-bold mt-2 uppercase tracking-widest transition-opacity duration-500 ${activeIndex === idx ? 'opacity-100 text-neutral-400' : 'opacity-0'}`}>
                        {member.description}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER ACCENT */}
      <footer className="relative mt-20 pb-10 px-8 flex flex-col items-center">
        <div className="w-full h-px bg-neutral-100 mb-10" />
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 relative opacity-10 filter grayscale">
             <Image src="/icons/facultiylogo.svg" alt="CICT Logo" fill className="object-contain" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 tracking-[0.4em] uppercase">College of Information and Computing Technology</span>
        </div>
      </footer>
    </main>
  );
}
