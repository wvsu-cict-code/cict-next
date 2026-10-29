"use client";

import { useState } from "react";

const whyChooseItems = [
  {
    title: "ACCREDITATIONS",
    content: `The WVSU College of ICT core programs in Computer Science, Information Technology, and Information Systems are AACCUP Level III Re-accredited, representing a high tier of national certification. Most recently, the Bachelor of Library and Information Science (BLIS) program attained Level I Accreditation in September 2025, further solidifying the college's commitment to verified academic quality across all its offerings.`,
  },
  {
    title: "NATIONAL RANKINGS",
    content: `The WVSU-College of ICT is ranked <span class="text-orange-light font-bold">25th in the Philippines</span> and <span class="text-orange-light font-bold">2nd in Iloilo</span> according to <span class="font-bold">EduRank.org</span>, an independent global university ranking that evaluates institutions based on scholarly publications, citations, academic impact, and institutional prominence. This recognition reflects our commitment to academic excellence, research innovation, and quality education, ensuring that our students receive globally competitive training and opportunities.`,
  },
  {
    title: "INTERNATIONAL RELATIONS",
    content: `Our college maintains collaborative relations with <span class="font-bold">3 international university partners, 7 institutional and industry associations, 7 government agencies</span> and LGUs, <span class="font-bold">30 ICT companies and OJT venues,</span> and a <span class="font-bold">Jeju-based startup.</span> These partnerships support academic cooperation, research linkages, and industry collaboration at the international, national, and local levels.`,
  },
  {
    title: "COMPETITION RECOGNITIONS",
    content: `The WVSU-College of ICT participated in <span class="font-bold">7 national, 6 regional</span>, and <span class="font-bold">3 provincial and local</span> competitions, earning a total of <span class="text-orange-light font-bold">41 major and special awards</span>. These achievements reflect the consistent performance and competencies of our students and faculty in academic and skills-based competitions, all in the academic year 2025–2026.`,
  },
  {
    title: "INTERNATIONAL ENGAGEMENTS",
    content: `These past few years has been a blast for CICT, wherein the college advances international engagement through <span class="font-bold">1 international study mission, 7 international research presentations</span> by faculty and students, <span class="font-bold">3 institutional visits</span>, and <span class="font-bold">3 international lectures</span> and engagement sessions. Students also participate in 2 Students for Canada SEEDS programs, <span class="font-bold">20 JNU student exchange</span> and immersion activities, and <span class="font-bold">4 graduate scholarship programs</span>, supporting ongoing academic and cultural exchange.`,
  },
];

const divider = "border border-transparent border-b-[#363636] p-2 md:p-4";

export function WhyChooseUs() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="why-choose-us"
      className="mx-4 my-8 scroll-mt-24 md:mx-40 md:my-20"
    >
      <h1 className="mb-4 text-[32px] font-medium text-[#363636] md:mb-2 md:text-[80px]">
        Why Choose <span className="text-orange-light">Us</span>?
      </h1>
      {whyChooseItems.map((item, index) => (
        <div
          key={index}
          className={`${divider} ${index === 0 ? "border-t-[#363636]" : ""}`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="group flex w-full cursor-pointer items-center text-left"
          >
            <img
              src={
                openIndex === index
                  ? "/home-page_assets/dropdown.png"
                  : "/home-page_assets/cict-emblem-thick.png"
              }
              className="h-auto w-5 shrink-0 md:w-16"
              alt="dropdown option"
            />
            <p className="ml-4 flex-1 text-base font-medium text-[#363636] md:text-5xl">
              {item.title}
            </p>
          </button>
          <div
            className={`overflow-hidden ${openIndex === index ? "mt-2 max-h-96 opacity-100 md:mt-4" : "max-h-0 opacity-0"}`}
          >
            <p
              className="py-2 text-justify text-xs leading-5 font-normal text-[#6F6F6F] md:text-2xl md:leading-8 md:tracking-[-0.01em]"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
