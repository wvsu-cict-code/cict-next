import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/PhotoSlot";

const whyChooseItems: { title: string; body: () => ReactNode }[] = [
  {
    title: "Accreditations",
    body: () => (
      <>
        The WVSU College of ICT core programs in Computer Science, Information
        Technology, and Information Systems are AACCUP Level III Re-accredited,
        representing a high tier of national certification. Most recently, the
        Bachelor of Library and Information Science (BLIS) program attained
        Level I Accreditation in September 2025, further solidifying the
        college&apos;s commitment to verified academic quality across all its
        offerings.
      </>
    ),
  },
  {
    title: "National rankings",
    body: () => (
      <>
        The WVSU-College of ICT is ranked{" "}
        <strong>25th in the Philippines</strong> and{" "}
        <strong>2nd in Iloilo</strong> according to <strong>EduRank.org</strong>
        , an independent global university ranking that evaluates institutions
        based on scholarly publications, citations, academic impact, and
        institutional prominence. This recognition reflects our commitment to
        academic excellence, research innovation, and quality education,
        ensuring that our students receive globally competitive training and
        opportunities.
      </>
    ),
  },
  {
    title: "International relations",
    body: () => (
      <>
        Our college maintains collaborative relations with{" "}
        <strong>
          3 international university partners, 7 institutional and industry
          associations, 7 government agencies
        </strong>{" "}
        and LGUs, <strong>30 ICT companies and OJT venues,</strong> and a{" "}
        <strong>Jeju-based startup.</strong> These partnerships support academic
        cooperation, research linkages, and industry collaboration at the
        international, national, and local levels.
      </>
    ),
  },
  {
    title: "Competition recognitions",
    body: () => (
      <>
        The WVSU-College of ICT participated in{" "}
        <strong>7 national, 6 regional</strong>, and{" "}
        <strong>3 provincial and local</strong> competitions, earning a total of{" "}
        <strong>41 major and special awards</strong>. These achievements reflect
        the consistent performance and competencies of our students and faculty
        in academic and skills-based competitions, all in the academic year
        2025-2026.
      </>
    ),
  },
  {
    title: "International engagements",
    body: () => (
      <>
        These past few years has been a blast for CICT, wherein the college
        advances international engagement through{" "}
        <strong>
          1 international study mission, 7 international research presentations
        </strong>{" "}
        by faculty and students, <strong>3 institutional visits</strong>, and{" "}
        <strong>3 international lectures</strong> and engagement sessions.
        Students also participate in 2 Students for Canada SEEDS programs,{" "}
        <strong>20 JNU student exchange</strong> and immersion activities, and{" "}
        <strong>4 graduate scholarship programs</strong>, supporting ongoing
        academic and cultural exchange.
      </>
    ),
  },
];

const cards = [
  {
    title: "Accreditations",
    text: "AACCUP Level III for Computer Science, Information Technology, and Information Systems. BLIS reached Level I in September 2025.",
  },
  {
    title: "National rankings",
    text: "25th in the Philippines and 2nd in Iloilo, according to EduRank.",
  },
  {
    title: "International relations",
    text: "3 international university partners, 7 associations, 7 government agencies and LGUs, 30 ICT companies and OJT venues, and a Jeju-based startup.",
  },
  {
    title: "Competition recognitions",
    text: "7 national, 6 regional, and 3 provincial and local competitions. 41 major and special awards in AY 2025-2026.",
  },
];

export function WhyChooseUs() {
  const accreditation = whyChooseItems[0];

  return (
    <section id="why-choose-us" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <p className="text-theme-red flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
              <span className="bg-theme-red h-px w-8" aria-hidden />
              Why choose us
            </p>
            <h2 className="text-ink mt-3 max-w-[16ch] text-4xl leading-[1.1] font-medium md:text-5xl">
              More than a degree. A future-ready experience.
            </h2>
            <p className="text-ink-soft mt-5 max-w-[58ch] text-base leading-relaxed md:text-lg">
              {accreditation.body()}
            </p>
            <a
              href="#college-record"
              className="ease-draw bg-theme-red hover:bg-accent-deep mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors duration-200 active:scale-[0.98]"
            >
              View accreditation details
              <ArrowIcon className="h-4 w-4" />
            </a>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <li
                key={card.title}
                className="rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(16,32,51,0.06)]"
              >
                <h3 className="text-ink text-lg font-medium">{card.title}</h3>
                <p className="text-ink-soft mt-2 text-sm leading-relaxed">
                  {card.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div
          id="college-record"
          className="border-rule mt-16 scroll-mt-24 border-t pt-12"
        >
          <h3 className="text-ink text-2xl font-medium">The college record</h3>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {whyChooseItems.map((item) => (
              <div key={item.title}>
                <h4 className="text-ink text-xl font-medium">{item.title}</h4>
                <p className="text-ink-soft mt-3 text-base leading-relaxed">
                  {item.body()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
