import type { Metadata } from "next";
import Link from "next/link";
import { HomeEvents } from "@/components/EventList";
import { NewsHomeSection } from "@/components/NewsHomeSection";
import { HomePrograms } from "@/components/HomePrograms";
import { LandingMaintenance } from "@/components/LandingMaintenance";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { MissionVision } from "@/components/MissionVision";
import {
  Eyebrow,
  container,
  outlineButtonOnDark,
  primaryButton,
} from "@/components/PageHeader";
import { ArrowIcon, PhotoSlot } from "@/components/PhotoSlot";
import {
  SHARE_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  pageMetadata,
} from "@/lib/seo";
import { FOUNDING_YEAR, yearsOfService } from "@/lib/site";

const record = [
  {
    value: String(yearsOfService()),
    unit: "years",
    detail: "of academic excellence in ICT education",
    icon: "cap",
  },
  {
    value: String(FOUNDING_YEAR),
    unit: "",
    detail: "Founded under BOR Resolution No. 34",
    icon: "people",
  },
  {
    value: "25th",
    unit: "",
    detail: "In the Philippines, according to EduRank",
    icon: "rank",
  },
  {
    value: "41",
    unit: "",
    detail: "Major and special awards in AY 2025-2026",
    icon: "trophy",
  },
] as const;

const pillars = ["People", "Technology", "Creativity", "Community"];

function StatIcon({ name }: { name: (typeof record)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true as const,
  };
  if (name === "cap") {
    return (
      <svg {...common}>
        <path d="M3 10l9-5 9 5-9 5-9-5z" />
        <path d="M7 12v4c2 2 8 2 10 0v-4" />
      </svg>
    );
  }
  if (name === "people") {
    return (
      <svg {...common}>
        <circle cx="9" cy="9" r="3" />
        <circle cx="16" cy="10" r="2.2" />
        <path d="M4 18c.6-2.4 2.6-4 5-4s4.4 1.6 5 4" />
        <path d="M14 14.2c1.6-.3 3.2.4 4.2 2.3" />
      </svg>
    );
  }
  if (name === "rank") {
    return (
      <svg {...common}>
        <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" />
      <path d="M12 11v3M9 20h6M10 17h4" strokeLinecap="round" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  ...pageMetadata({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
};

// Structured data so search engines can show the college as an organization
const collegeJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  name: "College of Information and Communications Technology",
  alternateName: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icons/cictlogo.png`,
  image: `${SITE_URL}${SHARE_IMAGE.url}`,
  email: "cict@wvsu.edu.ph",
  foundingDate: "2002",
  address: {
    "@type": "PostalAddress",
    addressLocality: "La Paz, Iloilo City",
    addressRegion: "Iloilo",
    addressCountry: "PH",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "West Visayas State University",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static data defined above; no user content goes in here
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeJsonLd) }}
      />
      <LandingMaintenance>
        <HomeContent />
      </LandingMaintenance>
    </>
  );
}

function HomeContent() {
  return (
    <div className="bg-white">
      <section className="rise relative">
        <div className="relative isolate overflow-hidden">
          <PhotoSlot
            label="Campus photo coming"
            src="/temp-photos/campus.jpg"
            alt="University building on a tropical campus"
            className="absolute inset-0 -z-10 h-full w-full [&>img]:object-[70%_center]"
          />
          {/* Darkens the photo behind the text: the whole frame on small
              screens, the left side (where the text sits) on large ones */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(16,32,51,0.55)_0%,rgba(16,32,51,0.82)_100%)] lg:bg-[linear-gradient(90deg,rgba(16,32,51,0.92)_0%,rgba(16,32,51,0.78)_38%,rgba(16,32,51,0.25)_70%,rgba(16,32,51,0.1)_100%)]"
          />

          <div className="mx-auto flex min-h-[30rem] max-w-[1400px] items-center px-4 pt-16 pb-24 md:px-8 md:pt-20 lg:min-h-[40rem] lg:pb-36">
            <div className="max-w-[40rem] text-white">
              <Eyebrow onDark>Transforming generations</Eyebrow>
              <h1 className="mt-4 max-w-[12ch] text-[2.75rem] leading-[1.05] font-medium md:text-7xl">
                Building the digital leaders of tomorrow.
              </h1>
              <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-white/85 md:text-lg">
                College of Information and Communications Technology, West
                Visayas State University.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/programs" className={primaryButton}>
                  Explore our programs
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link href="#why-choose-us" className={outlineButtonOnDark}>
                  Why choose us
                </Link>
              </div>
            </div>
          </div>

          <ul
            aria-hidden
            className="absolute top-1/2 right-6 hidden -translate-y-1/2 space-y-4 border-r border-white/40 pr-4 text-right text-[11px] font-semibold tracking-[0.22em] text-white uppercase md:right-8 lg:block"
          >
            {pillars.map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
          <div
            aria-hidden
            className="bg-theme-red absolute right-0 bottom-0 h-20 w-20 md:h-28 md:w-28"
            style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 70%)" }}
          />
        </div>

        <div className="relative z-10 mx-auto -mt-12 max-w-[1120px] px-4 pb-4 lg:-mt-20">
          <h2 className="sr-only">College record</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 rounded-2xl bg-white px-5 py-6 shadow-[0_18px_50px_rgba(16,32,51,0.1)] sm:px-8 sm:py-8 lg:grid-cols-4 lg:gap-0">
            {record.map((item) => (
              <div
                key={item.value}
                className="lg:border-rule flex min-w-0 gap-3 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <span className="text-theme-red mt-1 shrink-0">
                  <StatIcon name={item.icon} />
                </span>
                <div className="min-w-0">
                  <dt className="font-major text-ink text-3xl leading-none md:text-4xl">
                    {item.value}
                    {item.unit ? (
                      <span className="ml-1.5 text-lg font-medium md:text-xl">
                        {item.unit}
                      </span>
                    ) : null}
                  </dt>
                  <dd className="text-ink-soft mt-2 text-sm leading-snug">
                    {item.detail}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <NewsHomeSection />
      <HomeEvents />

      <section id="about" className="bg-navy scroll-mt-24 text-white">
        <div className="grid lg:grid-cols-2">
          <div className="px-4 py-16 md:px-8 md:py-20 lg:flex lg:items-center lg:justify-end lg:px-0 lg:py-24">
            <div className="lg:w-full lg:max-w-[700px] lg:pr-12 lg:pl-8">
              <Eyebrow onDark>About CICT</Eyebrow>
              <h2 className="mt-4 max-w-[18ch] text-4xl leading-[1.1] font-medium text-balance md:text-5xl">
                Innovative education for a digital tomorrow.
              </h2>
              <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-white/75 md:text-lg [&_strong]:font-semibold [&_strong]:text-white">
                Founded in <strong>2002</strong> under BOR Resolution No. 34,
                the College of Information and Communications Technology (CICT)
                began as the{" "}
                <strong>
                  Institute of Information and Communications Technology (IICT)
                </strong>{" "}
                and launched the{" "}
                <strong>BS in Information Technology (BSIT)</strong> and{" "}
                <strong>BS in Information Management (BSIM)</strong> programs in
                AY 2002-2003, producing its first graduates soon after.
              </p>
              <Link href="/about" className={`${primaryButton} mt-8`}>
                Learn more about us
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <figure className="relative min-h-[22rem] overflow-hidden lg:min-h-[34rem]">
            <PhotoSlot
              label="Building photo coming"
              src="/program_assets/cict.webp"
              alt="The CICT building at West Visayas State University"
              className="absolute inset-0 h-full w-full [&>img]:object-[60%_center]"
            />
            {/* Blends the photo into the navy text panel beside it */}
            <div
              aria-hidden
              className="from-navy/70 absolute inset-0 hidden bg-gradient-to-r via-transparent to-transparent lg:block"
            />
            <div
              aria-hidden
              className="from-navy/60 absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
            />
            <figcaption className="absolute bottom-6 left-6 flex items-center gap-2 text-sm font-medium text-white md:left-8">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              CICT Building, WVSU La Paz, Iloilo City
            </figcaption>
            <div
              aria-hidden
              className="bg-theme-red absolute right-0 bottom-0 h-20 w-20 md:h-28 md:w-28"
              style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 70%)" }}
            />
          </figure>
        </div>
      </section>

      <section className="bg-white">
        <div className={`${container} py-16 md:py-20`}>
          <MissionVision />
        </div>
      </section>

      <section id="courses-offered" className="scroll-mt-24 bg-[#f7f8fa]">
        <div className={`${container} py-16 md:py-24`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Our programs</Eyebrow>
              <h2 className="text-ink mt-3 text-4xl font-medium md:text-5xl">
                Offered programs
              </h2>
              <p className="text-ink-soft mt-3 max-w-[42ch] text-base leading-relaxed">
                Undergraduate and graduate degrees taught at the college.
              </p>
            </div>
            <Link
              href="/programs"
              className="text-theme-red inline-flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap"
            >
              View all programs
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10">
            <HomePrograms />
          </div>
        </div>
      </section>

      <WhyChooseUs />

      <section className="bg-[#f7f8fa]">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[22rem] lg:min-h-[30rem]">
            <PhotoSlot
              label="Students photo coming"
              src="/temp-photos/students.jpg"
              alt="Students walking across a campus lawn"
              className="absolute inset-0 h-full w-full"
            />
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 hidden w-24 bg-[#f7f8fa] lg:block"
              style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 0 100%)" }}
            />
          </div>
          <div className="relative flex items-center overflow-hidden px-4 py-16 md:px-8 md:py-20 lg:pr-8 lg:pl-12">
            <img
              src="/cict-emblem.png"
              alt=""
              className="pointer-events-none absolute -right-6 -bottom-8 w-56 opacity-[0.06]"
            />
            <div className="relative max-w-[36rem]">
              <Eyebrow>Admission</Eyebrow>
              <h2 className="text-ink mt-3 max-w-[16ch] text-4xl leading-[1.1] font-medium md:text-5xl">
                Questions about admission or a program?
              </h2>
              <p className="text-ink-soft mt-4 max-w-[42ch] text-base leading-relaxed md:text-lg">
                See how to apply, or write to the CICT office about programs,
                visits, and enrollment.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/admissions" className={primaryButton}>
                  How to apply
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="text-ink hover:text-theme-red text-base font-semibold underline underline-offset-4"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
