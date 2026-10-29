import Link from "next/link";
import { NewsHomeSection } from "@/components/NewsHomeSection";
import { HomePrograms } from "@/components/HomePrograms";
import { WhyChooseUs } from "@/components/WhyChooseUs";

export default function Home() {
  const button_big =
    "flex justify-center items-center border-1 rounded-2xl w-32 md:w-xs h-6 md:h-10 p-2";

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
      <NewsHomeSection />

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
      <WhyChooseUs />

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
              Explore All →
            </Link>
          </div>
          <div className="flex items-center justify-center py-8 md:py-16">
            <HomePrograms />
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
          <span className="font-major m-2 md:m-4">CONTACT US →</span>
        </Link>
      </section>
    </main>
  );
}
