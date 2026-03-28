"use client";

import Image from "next/image";
import Link from "next/link";


export default function DeansOffice() {
  const faculty = [
    {
      name: "DR. MA. BETH S. CONCEPCION",
      title: "College Dean",
      description: "Faculty in BSIS and MIT",
      color: "bg-[#BA3D1B]",
    },
    {
      name: "MR. NEILJAN C. RABORAR",
      title: "College Secretary",
      subtitle: "Quality Assurance Focal Person",
      description: "Faculty in BSIS",
      color: "bg-neutral-300",
    },
    {
      name: "MS. AUBREY V. BALAJADIA",
      title: "Administrative Aide Clerk",
      description: "",
      color: "bg-neutral-300",
    },
  ];

  return (
    <main className="relative flex min-h-screen w-full overflow-hidden bg-white">
      {/* 
        LEFT SIDE: SYNCHRONIZED ZOOMED BACKGROUND
      */}
      <div className="relative flex h-screen w-[32%] shrink-0 flex-col items-start p-10 lg:p-14 overflow-hidden bg-white">
        {/* The Synchronized Logo Fragment */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <Image
            src="/icons/facultiylogo.svg"
            alt="Faculty Logo Fragment"
            width={1200}
            height={1200}
            className="h-full w-full object-contain"
            style={{
              transform: "scale(15)",
              transformOrigin: "39% 20%",
            }}
          />
        </div>

        {/* Glossy Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />

        {/* Back Button */}
        <Link 
          href="/faculty-profiles" 
          className="group relative z-20 flex items-center gap-3 rounded-full bg-[#BA3D1B] px-8 py-3 text-xs font-black tracking-widest text-white transition-all hover:bg-[#9a3216] shadow-[0_8px_24px_rgba(186,61,27,0.3)] active:scale-95"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          BACK TO DIRECTORY
        </Link>
      </div>

      {/* RIGHT SIDE: MAIN CONTENT */}
      <div className="relative flex flex-1 flex-col overflow-y-auto px-12 py-20 lg:px-24">
        {/* Subtle vertical line separator */}
        <div className="absolute left-0 top-0 h-full w-px bg-neutral-100/50" />

        <header className="mb-24">
          <h1 className="font-major text-[8rem] font-bold tracking-tighter text-neutral-900 uppercase leading-[0.75] italic">
            DEANS <br /> OFFICE
          </h1>
        </header>

        <div className="flex flex-col xl:flex-row gap-20 items-start">
          {/* Photo Grid - Asymmetric Layout matching reference */}
          <div className="relative flex gap-4">
            {/* Left Column of Grid */}
            <div className="flex flex-col gap-4">
              <div className="relative h-[260px] w-[190px] overflow-hidden rounded-[2px] shadow-2xl transition-all duration-700 hover:scale-[1.02] cursor-pointer">
                <Image
                  src="/news-article-placeholder.jpg"
                  alt="DR. MA. BETH S. CONCEPCION"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-[260px] w-[190px] overflow-hidden rounded-[2px] shadow-xl grayscale transition-all duration-700 hover:grayscale-0 hover:scale-[1.02] cursor-pointer">
                <Image
                  src="/news-article-placeholder.jpg"
                  alt="MS. AUBREY V. BALAJADIA"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column of Grid - Shifted Down */}
            <div className="mt-20 flex flex-col gap-4">
              <div className="relative h-[220px] w-[210px] overflow-hidden rounded-[2px] shadow-xl grayscale transition-all duration-700 hover:grayscale-0 hover:scale-[1.02] cursor-pointer border-r-4 border-neutral-100/30">
                <Image
                  src="/news-article-placeholder.jpg"
                  alt="MR. NEILJAN C. RABORAR"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* FACULTY LIST */}
          <div className="flex flex-1 flex-col gap-12 pt-4">
            {faculty.map((member, idx) => (
              <div key={idx} className="group flex items-start gap-8">
                {/* Status/Color Block */}
                <div className={`mt-2 h-4 w-12 shrink-0 ${member.color} transition-all duration-500 group-hover:w-16 shadow-sm`} />
                
                <div className="flex flex-col gap-2">
                  <h2 className="font-minor text-xl font-bold tracking-tight text-neutral-900 group-hover:text-[#BA3D1B] transition-colors duration-300">
                    {member.name}
                  </h2>
                  <div className="flex flex-col">
                    <span className="font-minor text-sm font-bold tracking-widest text-neutral-600 uppercase">
                      {member.title}
                    </span>
                    {member.subtitle && (
                      <span className="font-minor text-xs font-semibold text-neutral-400">
                        {member.subtitle}
                      </span>
                    )}
                    <span className="font-minor text-[0.65rem] font-bold text-neutral-400 mt-1 uppercase tracking-tight">
                      {member.description}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Black indicator in bottom left like image */}
      <div className="fixed bottom-4 left-4 h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-white font-bold opacity-80 z-50">
        N
      </div>

      {/* Footer bar */}
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#141414] z-50" />
    </main>
  );
}
