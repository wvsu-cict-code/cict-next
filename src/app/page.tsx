"use client";

import Link from "next/link";
import { useState } from "react";
import { HomeNewsCard } from "@/components/NewsHome";

interface NewsItem {
  date: string;
  tag: string;
  title: string;
  href: string;
}

export const items = [
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
  {
    date: "December 26, 2025",
    tag: "NEWS",
    title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    href: "/news-announcements",
  },
];
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

export default function Home() {
  const [openIndex, setOpenIndex] = useState(null);

  const HOME_NEWS_CARD_LIMIT = 4;

  const button_big =
    "flex justify-center items-center border-1 rounded-2xl w-32 md:w-xs h-6 md:h-10 p-2";
  const card_small =
    "w-full shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-xl p-3 shadow-lg rounded-xl";
  const divider = "border border-transparent border-b-[#363636] p-2 md:p-4";
  const course_container =
    "w-25 h-24 md:w-58 md:h-54 flex flex-col justify-center items-center gap-2 md:gap-6 bg-white pt-3 md:pt-6 duration-200 hover:scale-105 hover:shadow-xl hover:-translate-y-1";

  return (
    <main>
      {/*Landing Page*/}
      <section>
        {/*Header*/}
        <div className="mt-12 gap-6 text-center text-[#373737] md:mt-36">
          <h1 className="text-[32px] leading-none font-medium md:text-8xl md:leading-22">
            Building the{" "}
            <span className="text-orange-light">
              Digital
              <br />
              Leaders
            </span>{" "}
            of Tomorrow
          </h1>
          <h2 className="font-minor mt-1 text-[8px] font-normal md:mt-6 md:text-2xl">
            COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY
          </h2>
        </div>

        {/*Buttons*/}
        <div className="mt-4 flex items-center justify-center gap-4 text-center text-[8px] font-bold text-white md:mt-16 md:gap-20 md:text-base">
          <Link
            href="/programs"
            className={` ${button_big} border-orange-light bg-orange-light hover:text-orange-light transition-colors duration-200 hover:bg-white`}
          >
            COURSES OFFERED
          </Link>
          <Link
            href="#why-choose-us"
            className={` ${button_big} border-[#373737] bg-[#373737] transition-colors duration-200 hover:bg-white hover:text-[#373737]`}
          >
            WHY CHOOSE US
          </Link>
        </div>

        {/*Tagline*/}
        <p className="font-major text-size-base mt-28 text-center font-medium text-[#373737] md:mt-44 md:text-2xl">
          We have been shaping{" "}
          <span className="text-orange-light">careers</span> for{" "}
          <br className="md:hidden" />
          technological trailblazers across{" "}
          <span className="text-orange-light">industries</span> for{" "}
          <br className="md:hidden" />
          <span className="text-orange-light">23 years</span>.
        </p>
      </section>

      {/*News and Announcements*/}
      <section className="mx-4 mt-10 mb-16 flex max-w-full flex-col items-center justify-center md:mx-40 md:mt-38">
        {/*Top Section*/}
        <div className="grid w-full grid-cols-2 gap-6">
          <div className="w-full">
            <div className="flex items-center">
              <h1 className="flex text-[11px] font-medium text-[#585858] md:text-2xl">
                NEWS AND ANNOUNCEMENTS
              </h1>
              <Link
                href="/news-announcements"
                className="group ml-auto flex h-3 w-14 items-center justify-center rounded-full border border-[#4D4D4D] text-[6px] text-[#4D4D4D] transition duration-200 hover:bg-[#4D4D4D] hover:text-white md:h-8 md:w-32 md:text-xs"
              >
                READ MORE
                <img
                  src="/home-page_assets/grey-arrow-icon.png"
                  className="ml-0.5 h-[5px] w-[7px] transition duration-200 group-hover:brightness-0 group-hover:invert md:ml-2 md:h-3 md:w-4"
                  alt="image"
                />
              </Link>
            </div>

            <h1 className="text-lg font-medium text-[#373737] md:mt-6 md:text-5xl">
              CHECK OUT THE LATEST <br />
              <span className="text-orange-light">COLLEGE UPDATES</span>
            </h1>

            <p className="text-[8px] font-normal text-[#828282] md:mt-1 md:text-base">
              Stay informed with the latest updates, official announcements, and
              important notices
            </p>
          </div>

          {/*Featured Card*/}
          <div className="bg-yellow hidden h-52 w-full rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.15)] md:flex">
            <img
              src="/home-page_assets/featured-card-image.png"
              className="mr-4 w-3xs"
              alt="image"
            />
            <div className="mt-4">
              <div className="flex h-6 items-center">
                <p className="text-xs font-normal text-[#4D4D4D]">
                  2 days ago |
                </p>
                <span className="bg-orange-light border-orange-light ml-1.5 rounded-sm px-2 text-[8px] font-bold text-white">
                  ANNOUNCEMENT
                </span>
              </div>
              <div className="mt-6 ml-2 flex h-36 flex-col">
                <h1 className="mr-3 text-xl font-bold">
                  WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan
                </h1>
                <Link
                  href="/news-announcements"
                  className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto mr-3 mb-3 ml-auto flex h-8 w-28 items-center justify-center rounded-full border text-xs font-normal transition duration-200 hover:text-white"
                >
                  Read Now
                  <img
                    src="/home-page_assets/orange-arrow-icon.png"
                    className="ml-1.5 w-5 transition duration-200 group-hover:brightness-0 group-hover:invert"
                    alt="image"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className={`${card_small} block md:hidden`}>
            <div className="flex items-center">
              <p className="font-minor text-[8px] font-normal text-[#4D4D4D]">
                December 26, 2025
              </p>
              <span className="font-minor border-orange-light bg-orange-light ml-auto flex h-3.5 w-17 items-center justify-center rounded-sm border text-center text-[6px] font-bold text-white">
                ANNOUNCEMENT
              </span>
            </div>
            <div className="mt-1 flex h-20 flex-col">
              <h1 className="text-sm font-bold">
                WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan
              </h1>
              <Link
                href="/news-announcements"
                className="border-orange-light text-orange-light hover:bg-orange-light group mt-auto ml-auto flex h-4.5 w-17.5 items-center justify-center rounded-full border text-[8px] font-normal transition duration-200 hover:text-white"
              >
                Read More
                <img
                  src="/home-page_assets/orange-arrow-icon.png"
                  className="ml-1 h-2 w-3 transition duration-200 group-hover:brightness-0 group-hover:invert"
                  alt="image"
                />
              </Link>
            </div>
          </div>
        </div>

        {/*Bottom Section
          NOTE: We should only limit 4 news articles
          */}
        <div className="mt-6 grid w-full grid-cols-2 gap-6 md:mt-8 md:grid-cols-4">
          {items.slice(0, HOME_NEWS_CARD_LIMIT).map((item, index) => (
            <HomeNewsCard key={index} className={card_small} {...item} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="relative max-w-full bg-[#1e1e1e] px-4 py-12 md:px-52 md:py-40">
        <img
          src="/home-page_assets/cict-logo.png"
          className="mx-auto -mt-4 h-auto w-24 shrink-0 md:float-right md:-mt-20 md:w-69"
          alt="CICT Logo"
        />
        <div>
          <h1 className="text-orange-light my-1 text-[32px] font-medium md:my-4 md:text-6xl">
            ABOUT.
          </h1>
          <p className="w-4/5 text-[10px] leading-4 font-medium text-white md:w-160 md:text-base md:leading-8">
            Founded in <span className="text-orange-light font-bold">2002</span>{" "}
            under BOR Resolution No. 34, the College of Information and
            Communications Technology (CICT) began as the{" "}
            <span className="text-orange-light font-bold">
              Institute of Information and Communications Technology (IICT)
            </span>{" "}
            and launched the{" "}
            <span className="text-orange-light font-bold">
              BS in Information Technology (BSIT)
            </span>{" "}
            and{" "}
            <span className="text-orange-light font-bold">
              BS in Information Management (BSIM)
            </span>{" "}
            programs in AY 2002-2003, producing its first graduates soon after.
          </p>
        </div>

        <div className="mt-4 ml-auto flex flex-col text-right">
          <h1 className="text-orange-light my-1 text-[32px] font-medium md:my-4 md:text-6xl">
            MISSION.
          </h1>
          <p className="ml-auto w-4/5 text-[10px] leading-4 font-medium text-white md:w-150 md:text-base md:leading-8">
            The WVSU-CICT aims to develop professionals who shall be able to
            meet the growing manpower demand by expanding the ICT industries in
            the country. Being the lead institution of higher learning in{" "}
            <span className="text-orange-light font-bold">
              Western Visayas.
            </span>
          </p>
        </div>

        <div className="mt-4">
          <h1 className="text-orange-light my-1 text-[32px] font-medium md:my-4 md:text-6xl">
            VISION.
          </h1>
          <p className="w-4/5 text-[10px] leading-4 font-medium text-white md:w-150 md:text-base md:leading-8">
            To be the leading provider of ICT education in{" "}
            <span className="text-orange-light font-bold">Western Visayas</span>
            , aligned with the broader mandate of WVSU as the lead institution
            of higher learning in the region.
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
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

      {/* Offered Programs Section */}
      <section
        id="courses-offered"
        className="mx-4 my-8 scroll-mt-24 md:mx-40 md:my-20"
      >
        <h1 className="mb-12 text-right text-2xl font-medium text-[#363636] md:text-6xl">
          INTERESTED IN THE COLLEGE? SEE WHAT <br className="hidden md:block" />
          <span className="text-orange-light font-bold">WE OFFER</span> IN THE
          TABLE
        </h1>
        <div className="flex h-auto w-full flex-col rounded-3xl bg-[#F0F0F0] md:rounded-[92px]">
          <div className="mx-4 mt-4 flex flex-1 items-center justify-center md:mx-12 md:mt-16">
            <h2 className="text-2xl font-medium text-[#1E1E1E] md:text-6xl">
              Offered Programs
            </h2>
            <Link
              href="/programs"
              className="group ml-auto flex h-5 w-20 items-center justify-center rounded-full border border-[#4D4D4D] text-[10px] font-medium text-[#4D4D4D] transition duration-200 hover:bg-[#4D4D4D] hover:text-white md:h-12 md:w-52 md:text-2xl"
            >
              Explore All
              <img
                src="/home-page_assets/grey-arrow-icon.png"
                className="ml-1 h-auto w-3 transition duration-200 group-hover:brightness-0 group-hover:invert md:ml-4 md:w-6"
                alt="Toggle"
              />
            </Link>
          </div>
          <div className="flex items-center justify-center py-8 md:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              <Link href="/programs/bsemc" className={` ${course_container} `}>
                <img
                  src="/home-page_assets/bsemc-icon.png"
                  className="h-auto w-12 md:w-24"
                  alt="BSEMC Logo"
                />
                <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                  BSEMC
                </h3>
              </Link>
              <Link href="/programs/bscs" className={` ${course_container} `}>
                <img
                  src="/home-page_assets/bscs-icon.png"
                  className="h-auto w-12 md:w-24"
                  alt="bscs icon"
                />
                <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                  BSCS
                </h3>
              </Link>
              <Link href="/programs/blis" className={` ${course_container} `}>
                <img
                  src="/home-page_assets/blis-icon.png"
                  className="h-auto w-12 md:w-24"
                  alt="blis logo"
                />
                <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                  BLIS
                </h3>
              </Link>
              <Link href="/programs/bsis" className={` ${course_container} `}>
                <img
                  src="/home-page_assets/bsis-icon.png"
                  className="h-auto w-12 md:w-24"
                  alt="bsis logo"
                />
                <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                  BSIS
                </h3>
              </Link>
              <Link href="/programs/bsit" className={` ${course_container} `}>
                <img
                  src="/home-page_assets/bsit-icon.png"
                  className="h-auto w-12 md:w-24"
                  alt="bsit logo"
                />
                <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                  BSIT
                </h3>
              </Link>
              <Link href="/programs/mit" className={` ${course_container} `}>
                <img
                  src="/home-page_assets/mit-icon.png"
                  className="h-auto w-12 md:w-24"
                  alt="mit logo"
                />
                <h3 className="text-xs font-medium text-[#1E1E1E] md:text-2xl">
                  MIT
                </h3>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Cards Section */}
      {/*
      <section className="flex flex-col bg-[#1E1E1E] md:py-12">
        <TestimonialCards />
      </section>
      */}

      {/* Contact Us Section */}
      <section className="my-16 flex flex-col items-center justify-center gap-6 md:my-40 md:gap-20">
        <h1 className="text-center text-2xl leading-snug font-medium text-[#1E1E1E] md:text-7xl">
          <span className="text-orange-light">
            Finding quality education is hard.
          </span>
          <br />
          We make it easy.
        </h1>
        <Link
          href="/contact"
          className="text-orange-light border-orange-light hover:bg-orange-light group flex h-auto w-40 items-center justify-center rounded-full border-2 text-center text-base font-normal transition duration-200 hover:text-white md:w-80 md:border-3 md:text-3xl"
        >
          <span className="font-major m-2 md:m-4">CONTACT US</span>
          <img
            src="/home-page_assets/orange-arrow-icon.png"
            className="h-auto w-5 transition duration-200 group-hover:brightness-0 group-hover:invert md:w-7"
            alt="arrow icon"
          />
        </Link>
      </section>
    </main>
  );
}
