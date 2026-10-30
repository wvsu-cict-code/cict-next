import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/PhotoSlot";
import { Eyebrow, container, primaryButton } from "@/components/PageHeader";

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
    figure: "Level III",
    title: "Accreditations",
    text: "AACCUP Level III for Computer Science, Information Technology, and Information Systems. BLIS reached Level I in September 2025.",
  },
  {
    figure: "25th",
    title: "National rankings",
    text: "25th in the Philippines and 2nd in Iloilo, according to EduRank.",
  },
  {
    figure: "48",
    title: "International relations",
    text: "3 international university partners, 7 associations, 7 government agencies and LGUs, 30 ICT companies and OJT venues, and a Jeju-based startup.",
  },
  {
    figure: "41",
    title: "Competition recognitions",
    text: "7 national, 6 regional, and 3 provincial and local competitions. 41 major and special awards in AY 2025-2026.",
  },
];

export function WhyChooseUs() {
  const accreditation = whyChooseItems[0];

  return (
    <section id="why-choose-us" className="scroll-mt-24 bg-white">
      <div className={`${container} py-16 md:py-24`}>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Eyebrow>Why choose us</Eyebrow>
            <h2 className="text-ink mt-3 max-w-[16ch] text-4xl leading-[1.1] font-medium md:text-5xl">
              More than a degree. A future-ready experience.
            </h2>
            <p className="text-ink-soft mt-5 max-w-[58ch] text-base leading-relaxed md:text-lg">
              {accreditation.body()}
            </p>
            <a href="#college-record" className={`${primaryButton} mt-8`}>
              View accreditation details
              <ArrowIcon className="h-4 w-4" />
            </a>
          </div>

          <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:self-stretch">
            {cards.map((card) => (
              <li
                key={card.title}
                className="border-rule flex flex-col rounded-2xl border bg-[#f7f8fa] p-6"
              >
                <p
                  aria-hidden
                  className="font-major text-theme-red text-4xl leading-none md:text-5xl"
                >
                  {card.figure}
                </p>
                <h3 className="text-ink mt-6 text-lg font-medium">
                  {card.title}
                </h3>
                <p className="text-ink-soft mt-2 text-sm leading-relaxed">
                  {card.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div id="college-record" className="mt-16 scroll-mt-24 md:mt-24">
          <h3 className="text-ink text-3xl font-medium md:text-4xl">
            The college record
          </h3>
          <ol className="border-rule mt-8 border-t">
            {whyChooseItems.map((item, index) => (
              <li
                key={item.title}
                className="border-rule grid gap-3 border-b py-8 md:grid-cols-[3rem_minmax(0,18rem)_minmax(0,1fr)] md:gap-8"
              >
                <span
                  aria-hidden
                  className="font-major text-theme-red text-lg leading-none md:pt-1"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="text-ink text-xl leading-snug font-medium">
                  {item.title}
                </h4>
                <p className="text-ink-soft max-w-[75ch] text-base leading-relaxed">
                  {item.body()}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
