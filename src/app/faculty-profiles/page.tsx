"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function FacultyProfiles() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"directory" | "detail">("directory");

  const facultyByDept = useMemo(() => ({
    "DEANS OFFICE": [
      { name: "DR. MA. BETH S. CONCEPCION", title: "College Dean", description: "Faculty in BSIS and MIT", image: "/images/dean.png" },
      { name: "MR. NEILJAN C. RABORAR", title: "College Secretary / Quality Assurance Focal Person", description: "Faculty in BSIS", image: "/images/secretary.png" },
      { name: "MS. AUBREY V. BALAJADIA", title: "Admin Aide Clerk", description: "Office Administration", image: "/images/clerk.png" }
    ],
    "INFORMATION TECHNOLOGY": [
      { name: "DR. FRANK I. ELIJORDE", title: "Division Chair", description: "Faculty in BSIT and MIT", image: "/images/it-chair.png" },
      { name: "DR. ENGR. LEA M. GABAWA", title: "GAD Coordinator", description: "Faculty in BSIT", image: "/images/it-gad.png" },
      { name: "DR. CHERYL ANN FELIPRADA", title: "OJT Coordinator", description: "Faculty in BSIT", image: "/images/it-ojt.png" },
      { name: "MR. CHRISTIAN CADIZ", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty1.png" },
      { name: "PROF. CYRENEO S. DOFITAS JR.", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty2.png" },
      { name: "MS. KEILA JOY H. ARMADA", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty3.png" },
      { name: "MS. ANGELICA GRACE P. SIMBRAN", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty4.png" },
      { name: "MS. TRACY ANDREA MARIE MADRESTA", title: "Faculty member", description: "Faculty in BSIT", image: "/images/it-faculty5.png" }
    ],
    "INFORMATION SYSTEM": [
      { name: "DR. REGIN A. CABACAS", title: "Division Chair / Undergraduate Research Coordinator", description: "Faculty in BSIS and MIT", image: "/images/is-chair.png" },
      { name: "PROF. ERWIN D. OSORIO", title: "CICT Building Supervisor", description: "Faculty in BSIS", image: "/images/is-supervisor.png" },
      { name: "MR. SHEM DURST ELIJA B. SANDIG", title: "Extension Coordinator", description: "Faculty in BSIS", image: "/images/is-ext.png" },
      { name: "DR. NIKIE JO E. DEOCAMPO", title: "Faculty member", description: "Faculty in BSIS and MIT", image: "/images/is-faculty1.png" },
      { name: "MR. JHON ANTHONY ELECCION", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty2.png" },
      { name: "MR. KEITH C. CENSORO", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty3.png" },
      { name: "MR. PAOLO HILADO", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty4.png" },
      { name: "MS. ROFA MAE MEDINA", title: "Faculty member", description: "Faculty in BSIS", image: "/images/is-faculty5.png" }
    ],
    "COMPUTER SCIENCE": [
      { name: "DR. RALPH J. VOLTAIRE DAYOT", title: "Division Chair / Computer Laboratory Supervisor", description: "Faculty in BSCS and MIT", image: "/images/cs-chair.png" },
      { name: "DR. MA. LUCHE P. SABAYLE", title: "Faculty member", description: "Faculty in BSCS and MIT", image: "/images/cs-faculty1.png" },
      { name: "DR. ARNEL N. SECONDES", title: "Educational Tour Coordinator", description: "Faculty in BSCS and MIT", image: "/images/cs-faculty2.png" },
      { name: "MR. JOHN CHRISTOPHER MATEO", title: "Assistant Undergraduate Research Coordinator", description: "Faculty in BSCS and MIT", image: "/images/cs-faculty3.png" },
      { name: "MS. KAREN MADOLINE CABRILLOS", title: "Division Chair", description: "Faculty in BSCS", image: "/images/cs-faculty4.png" },
      { name: "MR. ORLANDO C. CABILLOS", title: "Faculty member", description: "Faculty in BSCS", image: "/images/cs-faculty5.png" }
    ],
    "ENTERTAINMENT AND MULTIMEDIA COMPUTING (BSEMC)": [
      { name: "MR. MARK JOSEPH J. SOLIDARIOS", title: "Division Chair", description: "Faculty In BSEMC", image: "/images/emc-chair.png" },
      { name: "DR. EVAN C. SUMIDO", title: "Faculty member", description: "Faculty In BSEMC And MIT", image: "/images/emc-faculty1.png" },
      { name: "PROF. KAREN ALINOR J. DUMPIT", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty2.png" },
      { name: "MS. JANINE P. DEFANTE", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty3.png" },
      { name: "MS. CHRISTY G. VILLANO", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty4.png" },
      { name: "MR. LIBY NORMAN LIMOSO", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty5.png" },
      { name: "MR. PAUL NOEL DEQUITO", title: "Faculty member", description: "Faculty In BSEMC", image: "/images/emc-faculty6.png" }
    ],
    "LIBRARY & INFORMATION SCIENCE (BLIS)": [
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
      name: "DEANS OFFICE",
      side: "left",
      y: 200, x: 0, 
      link: "/faculty-profiles/deans-office",
      logoAnchor: { x: 130, y: 200 }, 
      zoomScale: 15,
    },
    {
      name: "INFORMATION TECHNOLOGY",
      side: "left",
      y: 450, x: -100,
      link: "/faculty-profiles/it",
      logoAnchor: { x: 170, y: 450 },
      zoomScale: 12,
    },
    {
      name: "INFORMATION SYSTEM",
      side: "left",
      y: 650, x: 0,
      link: "/faculty-profiles/is",
      logoAnchor: { x: 400, y: 650 },
      zoomScale: 12,
    },
    {
      name: "Master of Information Technology",
      side: "left",
      y: 950, x: 90,
      link: "/faculty-profiles/mit",
      logoAnchor: { x: 500, y: 950 },
      zoomScale: 12,
    },
    {
      name: "COMPUTER SCIENCE",
      side: "right",
      y: 300, x: 1000,
      link: "/faculty-profiles/cs",
      logoAnchor: { x: 800, y: 300 },
      zoomScale: 12,
    },
    {
      name: "LIBRARY & INFORMATION SCIENCE (BLIS)",
      side: "right",
      y: 500, x: 950,
      link: "/faculty-profiles/lis",
      logoAnchor: { x: 510, y: 500 },
      zoomScale: 12,
    },
    {
      name: "ENTERTAINMENT AND MULTIMEDIA COMPUTING (BSEMC)",
      side: "right",
      y: 600, x: 1000,
      link: "/faculty-profiles/emc",
      logoAnchor: { x: 660, y: 600 },
      zoomScale: 12,
    },
    {
      name: "Laboratory & Technical Support",
      side: "right",
      y: 800, x: 1000,
      link: "/faculty-profiles/lts",
      logoAnchor: { x: 650, y: 800 },
      zoomScale: 12,
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


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-white overflow-hidden scroll-smooth selection:bg-[#BA3D1B] selection:text-white pt-20">
      <header className={`relative z-30 w-full text-center pb-20 px-8 transition-all duration-700 ${zoomedIndex !== null ? 'opacity-0 -translate-y-10 focus-within:opacity-100' : 'opacity-100'}`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-major tracking-tight uppercase">
          <span className="text-neutral-900 font-bold">Faculty </span>
          <span className="text-[#BA3D1B]">Directory</span>
        </h1>
      </header>

      <div
        className="absolute z-10 w-full max-w-[1600px] aspect-[16/10] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
        style={{
          left: activeView === "detail" ? "22%" : "50%",
          top: activeView === "detail" ? "50%" : "55%",
          transform: `translate(-50%, -50%) scale(${currentScale * (activeView === "detail" ? 1 : 0.6)})`,
          transformOrigin: zoomedIndex !== null
            ? `${((departments[zoomedIndex].logoAnchor.x + 300) / 1600) * 100}% ${(departments[zoomedIndex].logoAnchor.y / 1000) * 100}%`
            : "center center",
          opacity: activeView === "detail" ? 0.2 : 1,
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
            <line key={`line-${index}`} x1={dept.x} y1={dept.y} x2={dept.logoAnchor.x} y2={dept.logoAnchor.y} stroke="#BA3D1B" strokeWidth="1" className="transition-all duration-300" style={{ vectorEffect: 'non-scaling-stroke' }} strokeOpacity={hoveredIndex === null ? "0.6" : hoveredIndex === index ? "1" : "0.1"} />
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
                  className={`flex items-center gap-3 ${dept.side === "left" ? "flex-row" : "flex-row-reverse"}`}
                >
                  <span className={`font-minor text-[12px] md:text-[14px] font-bold tracking-[0.05em] uppercase whitespace-nowrap transition-all duration-300 text-[#BA3D1B] ${hoveredIndex === null || hoveredIndex === index ? "opacity-100" : "opacity-20"}`}>
                    {dept.name}
                  </span>
                  <div className={`h-1.5 w-1.5 bg-[#BA3D1B] rounded-[1px] transition-all duration-300 shrink-0 ${hoveredIndex === index ? "scale-150 shadow-[0_0_12px_rgba(186,61,27,1)]" : "scale-100"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`w-full min-h-screen fixed inset-0 z-40 flex items-stretch transition-all duration-1000 ${activeView === "detail" ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-20 pointer-events-none"}`}>
        <div className="relative w-[32%] shrink-0 flex flex-col p-14 lg:p-20">
          <button
            onClick={handleBack}
            className="group relative z-50 flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 w-fit cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#BA3D1B] text-white transition-transform group-hover:-rotate-45">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-[8px] font-black tracking-[0.2em] text-neutral-900 uppercase">Return to Faculty</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col px-12 lg:px-24 py-24 bg-white relative shadow-[-60px_0_90px_rgba(0,0,0,0.05)] overflow-y-auto">
          <div className="absolute left-0 top-0 h-full w-px bg-neutral-100/60" />
          <header className="mb-24">
            <h1 className="font-major text-[50px] md:text-[70px] font-medium tracking-[-0.02em] text-neutral-900 uppercase leading-tight md:leading-[85px]">{currentDept}</h1>
          </header>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
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

      <div className="fixed bottom-4 left-4 h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-white font-bold opacity-80 z-50">N</div>
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-[#141414] z-50" />
    </main>
  );
}


