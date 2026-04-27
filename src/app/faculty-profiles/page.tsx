"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

export default function FacultyProfiles() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"directory" | "detail">("directory");

  const facultyByDept = useMemo(() => ({
    "Deans Office": [
      { name: "DR. MA. BETH S. CONCEPCION", title: "College Dean", description: "Faculty in BSIS and MIT", image: "/images/dean.png" },
      { name: "MR. NEILJAN C. RABORAR", title: "College Secretary / Quality Assurance Focal Person", description: "Faculty in BSIS", image: "/images/secretary.png" },
      { name: "MS. AUBREY V. BALAJADIA", title: "Admin Aide Clerk", description: "Office Administration", image: "/images/clerk.png" }
    ],
    "Information Technology": [
      { name: "DR. FRANK I. ELIJORDE", title: "Division Chair", description: "Faculty in BSIT and MIT", image: "/images/it-chair.png" },
      { name: "DR. ENGR. LEA M. GABAWA", title: "GAD Coordinator", description: "Faculty in BSIT", image: "/images/it-gad.png" },
      { name: "DR. CHERYL ANN FELIPRADA", title: "OJT Coordinator", description: "Faculty in BSIT", image: "/images/it-ojt.png" },
      { name: "MR. CHRISTIAN CADIZ", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty1.png" },
      { name: "PROF. CYRENEO S. DOFITAS JR.", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty2.png" },
      { name: "MS. KEILA JOY H. ARMADA", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty3.png" },
      { name: "MS. ANGELICA GRACE P. SIMBRAN", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty4.png" },
      { name: "MS. TRACY ANDREA MARIE MADRESTA", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty5.png" }
    ],
    "Information System": [
      { name: "DR. REGIN A. CABACAS", title: "Division Chair / Undergraduate Research Coordinator", description: "Faculty in BSIS and MIT", image: "/images/is-chair.png" },
      { name: "PROF. ERWIN D. OSORIO", title: "CICT Building Supervisor", description: "Faculty in BSIS", image: "/images/is-supervisor.png" },
      { name: "MR. SHEM DURST ELIJA B. SANDIG", title: "Extension Coordinator", description: "Faculty in BSIS", image: "/images/is-ext.png" },
      { name: "DR. NIKIE JO E. DEOCAMPO", title: "Faculty member", description: "Faculty in BSIS and MIT", image: "/images/is-faculty1.png" },
      { name: "MR. JHON ANTHONY ELECCION", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty2.png" },
      { name: "MR. KEITH C. CENSORO", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty3.png" },
      { name: "MR. PAOLO HILADO", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty4.png" },
      { name: "MS. ROFA MAE MEDINA", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty5.png" }
    ],
    "Computer Science": [
      { name: "DR. RALPH J. VOLTAIRE DAYOT", title: "Division Chair / Computer Laboratory Supervisor", description: "Faculty in BSCS and MIT", image: "/images/cs-chair.png" },
      { name: "DR. MA. LUCHE P. SABAYLE", title: "Faculty member", description: "Faculty in BSCS and MIT", image: "/images/cs-faculty1.png" },
      { name: "DR. ARNEL N. SECONDES", title: "Educational Tour Coordinator", description: "Faculty in BSCS and MIT", image: "/images/cs-faculty2.png" },
      { name: "MR. JOHN CHRISTOPHER MATEO", title: "Assistant Undergraduate Research Coordinator", description: "Faculty in BSCS and MIT", image: "/images/cs-faculty3.png" },
      { name: "MS. KAREN MADOLINE CABRILLOS", title: "Division Chair", description: "Faculty in BSCS", image: "/images/cs-faculty4.png" },
      { name: "MR. ORLANDO C. CABILLOS", title: "Faculty member", description: "Faculty in BSCS", image: "/images/cs-faculty5.png" }
    ],
    "Entertainment and Multimedia Computing (BSEMC)": [
      { name: "MR. MARK JOSEPH J. SOLIDARIOS", title: "Division Chair", description: "Faculty In BSEMC", image: "/images/emc-chair.png" },
      { name: "DR. EVAN C. SUMIDO", title: "Faculty member", description: "Faculty In BSEMC And MIT", image: "/images/emc-faculty1.png" },
      { name: "PROF. KAREN ALINOR J. DUMPIT", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty2.png" },
      { name: "MS. JANINE P. DEFANTE", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty3.png" },
      { name: "MS. CHRISTY G. VILLANO", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty4.png" },
      { name: "MR. LIBY NORMAN LIMOSO", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty5.png" },
      { name: "MR. PAUL NOEL DEQUITO", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty6.png" }
    ],
    "Library & Information Science (BLIS)": [
      { name: "MR. STEPHEN B. ALAYON", title: "Program Coordinator / Research Coordinator", description: "Faculty In BLIS", image: "/images/blis-coord.png" },
      { name: "DR. MANUELA R. LOSAÑES", title: "Guidance Counselor", description: "Faculty In BLIS", image: "/images/blis-faculty1.png" },
      { name: "DR. ELRA D. M. MADALOGDOG", title: "Faculty member", description: "Faculty In BLIS", image: "/images/blis-faculty2.png" },
      { name: "MR. JOSEPH M. YAP", title: "Faculty member", description: "Faculty In BLIS", image: "/images/blis-faculty3.png" },
      { name: "MS. APRIL R. MANABAT", title: "Faculty member", description: "Faculty In BLIS", image: "/images/blis-faculty4.png" },
      { name: "DR. ANALIZA C. ROSALES", title: "Faculty member", description: "Faculty In BLIS", image: "/images/blis-faculty5.png" },
      { name: "MS. REGINA A. MALIGAD", title: "Faculty member", description: "Faculty In BLIS", image: "/images/blis-faculty6.png" }
    ],
    "Master of Information Technology": [
      { name: "MS. JOSSETH MARIE J. UMADHAY", title: "Graduate School Staff", description: "Faculty in MIT", image: "/images/mit-staff.png" }
    ],
    "Laboratory & Technical Support": [
      { name: "MR. FELIZARDO YGOT", title: "Laboratory Custodian", description: "Technical Support", image: "/images/lab-custodian1.png" },
      { name: "MR. MIKE JOSEPH VELEZ", title: "Assistant Laboratory Custodian", description: "Technical Support", image: "/images/lab-custodian2.png" },
      { name: "MR. ROBINSON CAPIOSO", title: "Assistant Laboratory Custodian", description: "Technical Support", image: "/images/lab-custodian3.png" }
    ]
  }), []);

  const [memberIndex, setMemberIndex] = useState(0);

  const departments = [
    {
      name: "Deans Office",
      side: "left",
      y: 200, x: 0, 
      link: "/faculty-profiles/deans-office",
      logoAnchor: { x: 130, y: 200 }, 
      zoomScale: 13.5,
    },
    {
      name: "Information Technology",
      side: "left",
      y: 450, x: -100,
      link: "/faculty-profiles/it",
      logoAnchor: { x: 170, y: 450 },
      zoomScale: 10.8,
    },
    {
      name: "Information System",
      side: "left",
      y: 650, x: 0,
      link: "/faculty-profiles/is",
      logoAnchor: { x: 400, y: 650 },
      zoomScale: 10.8,
    },
    {
      name: "Master of Information Technology",
      side: "left",
      y: 950, x: 90,
      link: "/faculty-profiles/mit",
      logoAnchor: { x: 500, y: 950 },
      zoomScale: 10.8,
    },
    {
      name: "Computer Science",
      side: "right",
      y: 300, x: 1000,
      link: "/faculty-profiles/cs",
      logoAnchor: { x: 800, y: 300 },
      zoomScale: 10.8,
    },
    {
      name: "Library & Information Science (BLIS)",
      side: "right",
      y: 500, x: 950,
      link: "/faculty-profiles/lis",
      logoAnchor: { x: 510, y: 500 },
      zoomScale: 10.8,
    },
    {
      name: "Entertainment and Multimedia Computing (BSEMC)",
      side: "right",
      y: 600, x: 1000,
      link: "/faculty-profiles/emc",
      logoAnchor: { x: 660, y: 600 },
      zoomScale: 10.8,
    },
    {
      name: "Laboratory & Technical Support",
      side: "right",
      y: 800, x: 1000,
      link: "/faculty-profiles/lts",
      logoAnchor: { x: 650, y: 800 },
      zoomScale: 10.8,
    },
  ];

  const currentScale = zoomedIndex !== null ? departments[zoomedIndex].zoomScale : 1;
  const invScale = 1 / currentScale;
  const currentDept = zoomedIndex !== null ? departments[zoomedIndex].name : "";
  const faculty = facultyByDept[currentDept] || [];

  const handleDeptClick = (e, index) => {
    e.preventDefault();
    setZoomedIndex(index);
    setMemberIndex(0); // Reset member selection
    setTimeout(() => {
      setActiveView("detail");
    }, 1000);
  };

  const handleBack = () => {
    setActiveView("directory");
    setTimeout(() => {
      setZoomedIndex(null);
    }, 150);
  };

  useEffect(() => {
    if (activeView === "detail") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeView]);


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-white overflow-hidden scroll-smooth selection:bg-[#BA3D1B] selection:text-white">
      <header className={`relative z-30 w-full text-center pt-16 pb-8 px-8 transition-all duration-700 ${activeView === 'detail' ? 'hidden md:block opacity-0 -translate-y-10' : 'opacity-100'}`}>
        <h1 className="text-3xl md:text-6xl font-major tracking-tight leading-none">
          <span className="text-neutral-900 font-bold">Faculty</span>
          <span className="text-[#f48128] ml-2 font-medium">Directory</span>
        </h1>
      </header>

      {/* Mobile Directory List */}
      <div className={`w-full px-6 pb-20 z-20 md:hidden ${activeView === 'detail' ? 'hidden' : 'block'}`}>
        <div className="bg-white rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-neutral-100 overflow-hidden">
          {departments.map((dept, index) => {
            const isActive = zoomedIndex === index;
            return (
              <button
                key={index}
                onClick={(e) => handleDeptClick(e, index)}
                className={`w-full flex items-center justify-between px-6 py-5 border-b border-neutral-100 last:border-0 transition-all duration-300 text-left
                  ${isActive ? 'ring-2 ring-inset ring-[#f48128] bg-[#f48128]/5' : 'bg-white'}`}
              >
                <span className={`font-minor font-bold text-[15px] tracking-tight transition-colors duration-300 ${isActive ? 'text-[#f48128]' : 'text-neutral-900'}`}>
                  {dept.name}
                </span>
                {isActive && (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-500">
                    <span className="text-[#f48128] text-[10px] font-minor italic font-medium">See more</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f48128" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex-1 w-full hidden md:flex items-center justify-center min-h-[600px]">
        <div
          className={`absolute z-10 w-full max-w-[1600px] aspect-[16/10] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${activeView === 'detail' ? 'opacity-0 md:opacity-20' : 'opacity-100'}`}
          style={{
            left: activeView === "detail" ? "22%" : "50%",
            top: activeView === "detail" ? "50%" : "48%",
            transform: `translate(-50%, -50%) scale(${currentScale * (activeView === "detail" ? 1 : 0.6)})`,
            transformOrigin: zoomedIndex !== null
              ? `${((departments[zoomedIndex].logoAnchor.x + 300) / 1600) * 100}% ${(departments[zoomedIndex].logoAnchor.y / 1000) * 100}%`
              : "center center",
            pointerEvents: activeView === "detail" ? "none" : "auto",
          }}
        >
        <div className="absolute inset-x-0 top-0 bottom-0 z-0 flex justify-center items-center">
          <div className="relative h-full aspect-square">
            <Image src="/icons/facultiylogo.svg" alt="CICT Logo" fill priority className="object-contain" />
          </div>
        </div>

        <svg
          className={`absolute inset-0 z-10 h-full w-full pointer-events-none transition-all duration-700 ${zoomedIndex !== null ? 'opacity-0' : 'opacity-100'}`}
          viewBox="-300 0 1600 1000"
          fill="none"
        >
          {departments.map((dept, index) => (
            <line key={`line-${index}`} x1={dept.x} y1={dept.y} x2={dept.logoAnchor.x} y2={dept.logoAnchor.y} stroke="#BA3D1B" strokeWidth="2.5" className="transition-all duration-300" style={{ vectorEffect: 'non-scaling-stroke' }} strokeOpacity={hoveredIndex === null ? "0.6" : hoveredIndex === index ? "1" : "0.1"} />
          ))}
        </svg>

        <div className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ${zoomedIndex !== null ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="relative w-full h-full">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="absolute pointer-events-auto transition-all duration-300"
                style={{
                  top: `${(dept.y / 1000) * 100}%`,
                  left: `${((dept.x + 300) / 1600) * 100}%`,
                  transform: `translate(${dept.side === "left" ? "-100%" : "0%"}, -50%) scale(${invScale * 1.5})`,
                  transformOrigin: dept.side === "left" ? "right center" : "left center"
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button
                  onClick={(e) => handleDeptClick(e, index)}
                  className={`flex items-center gap-4 ${dept.side === "left" ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`px-4 py-2 bg-white border border-neutral-100 rounded-[2px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ${hoveredIndex === index ? 'scale-110 shadow-[0_10px_30px_rgba(0,0,0,0.12)] -translate-y-1' : 'scale-100'}`}>
                    <span className={`font-minor text-[12px] lg:text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${hoveredIndex === null || hoveredIndex === index ? "text-neutral-900" : "text-neutral-400 opacity-40"}`}>
                      {dept.name}
                    </span>
                  </div>
                  <div className={`h-2 w-2 bg-[#BA3D1B] rounded-full transition-all duration-300 shrink-0 ${hoveredIndex === index ? "scale-150 shadow-[0_0_12px_rgba(186,61,27,1)]" : "scale-100"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      <div className={`w-full min-h-screen fixed inset-0 z-40 flex flex-col md:flex-row items-stretch transition-all duration-1000 ${activeView === "detail" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-20 pointer-events-none"}`}>
        <div className="relative w-full md:w-[32%] shrink-0 flex flex-col p-6 md:p-14 lg:p-20 bg-white md:bg-transparent">
          <button
            onClick={handleBack}
            className="group relative z-50 flex items-center gap-1.5 px-3 md:px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 w-fit cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#BA3D1B] text-white transition-transform group-hover:-rotate-45">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-[8px] font-black tracking-[0.2em] text-neutral-900 uppercase">Back to Directory</span>
          </button>
        </div>

        <div 
          className="flex-1 flex flex-col px-6 md:px-12 lg:px-24 py-8 md:py-24 bg-white md:bg-transparent md:backdrop-blur-xl relative shadow-[-60px_0_90px_rgba(0,0,0,0.05)] overflow-y-auto"
          style={{ 
            background: typeof window !== 'undefined' && window.innerWidth >= 768 
              ? 'linear-gradient(to right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 1) 50%)' 
              : undefined 
          }}
        >
          <div className="hidden md:block absolute left-0 top-0 h-full w-px bg-neutral-100/60" />
          <header className="mb-12 md:mb-24">
            <h1 className="font-major text-[40px] md:text-[70px] font-medium tracking-[-0.02em] text-neutral-900 uppercase leading-tight md:leading-[85px]">{currentDept}</h1>
          </header>

          <div className="flex flex-col gap-12 md:gap-16 items-start">
            {/* Mobile-only Members Stack */}
            <div className="flex md:hidden flex-col gap-10 w-full">
              {faculty.map((member, idx) => (
                <div key={idx} className="flex flex-col gap-6">
                  <div className="relative aspect-square w-full rounded-sm overflow-hidden shadow-md">
                    <Image src={member.image || "/news-article-placeholder.jpg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <div className="mt-2 h-4 w-10 bg-[#BA3D1B] shrink-0" />
                      <div className="flex flex-col gap-1">
                        <h2 className="font-minor text-lg font-bold text-neutral-900 uppercase leading-tight">{member.name}</h2>
                        <p className="font-minor text-xs font-black tracking-widest text-[#BA3D1B] uppercase">{member.title}</p>
                      </div>
                    </div>
                    <p className="font-minor text-[10px] text-neutral-400 uppercase tracking-wider pl-14">{member.description}</p>
                  </div>
                  <div className="h-px w-full bg-neutral-100 mt-4" />
                </div>
              ))}
            </div>

            {/* Desktop Members Grid (Hidden on Mobile) */}
            <div className="hidden md:flex flex-row gap-16 items-start w-full">
              <div className="relative flex gap-5 z-20 w-full lg:w-auto">
              {/* Column 1 (Even indices: 0, 2, 4) */}
              <div className="flex flex-col gap-5">
                {faculty.slice(0, 6).filter((_, i) => i % 2 === 0).map((member, i) => {
                  const originalIdx = i * 2;
                  return (
                    <button
                      key={originalIdx}
                      onMouseEnter={() => setMemberIndex(originalIdx)}
                      onClick={() => setMemberIndex(originalIdx)}
                      className={`relative h-[240px] w-full sm:w-[190px] overflow-hidden rounded-[2px] transition-all duration-500 cursor-pointer outline-none ${memberIndex === originalIdx ? 'scale-105 z-20 shadow-2xl' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
                    >
                      <Image src={member.image || "/news-article-placeholder.jpg"} alt={member.name} fill className="object-cover" />
                    </button>
                  );
                })}
              </div>

              {/* Column 2 (Odd indices: 1, 3, 5) - Staggered Down */}
              <div className="flex flex-col gap-5 mt-16">
                {faculty.slice(0, 6).filter((_, i) => i % 2 !== 0).map((member, i) => {
                  const originalIdx = i * 2 + 1;
                  return (
                    <button
                      key={originalIdx}
                      onMouseEnter={() => setMemberIndex(originalIdx)}
                      onClick={() => setMemberIndex(originalIdx)}
                      className={`relative h-[240px] w-full sm:w-[190px] overflow-hidden rounded-[2px] transition-all duration-500 cursor-pointer outline-none ${memberIndex === originalIdx ? 'scale-105 z-20 shadow-2xl' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
                    >
                      <Image src={member.image || "/news-article-placeholder.jpg"} alt={member.name} fill className="object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-10 pt-6 z-20">
              {faculty.map((member, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setMemberIndex(idx)}
                  onClick={() => setMemberIndex(idx)}
                  className="group flex items-start gap-10 text-left outline-none cursor-pointer"
                >
                  <div className={`mt-2 h-4 shrink-0 transition-all duration-500 shadow-sm ${memberIndex === idx ? 'bg-[#f48128] w-20' : 'bg-neutral-200 w-12'}`} />
                  <div className="flex flex-col gap-2">
                    <h2 className={`font-minor text-base font-bold tracking-tight transition-colors duration-300 ${memberIndex === idx ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-[#BA3D1B]'}`}>
                      {member.name}
                    </h2>
                    <div className="flex flex-col gap-1">
                      {member.title.split("/").map((segment, sIdx) => (
                        <span key={sIdx} className={`font-minor text-sm font-semibold transition-colors duration-300 ${memberIndex === idx ? 'text-neutral-800' : 'text-neutral-400 opacity-60'}`}>
                          {segment.trim()}
                        </span>
                      ))}
                      <span className={`font-minor text-[12px] font-medium mt-1 uppercase tracking-wider transition-opacity duration-500 ${memberIndex === idx ? 'opacity-100 text-neutral-400' : 'opacity-60 text-neutral-300'}`}>
                        {member.description}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-white font-bold opacity-80 z-50">N</div>
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#141414] z-50" />
    </main>
  );
}


