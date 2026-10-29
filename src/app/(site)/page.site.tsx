import Link from "next/link";
import { Great_Vibes } from "next/font/google";
import { NewsHomeSection } from "@/components/NewsHomeSection";
import { HomePrograms } from "@/components/HomePrograms";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ArrowIcon, PhotoSlot } from "@/components/PhotoSlot";

const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const primaryCta =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-theme-red px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 ease-draw hover:bg-accent-deep active:scale-[0.98]";
const secondaryCta =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 bg-white px-5 text-sm font-semibold whitespace-nowrap text-ink transition-colors duration-200 ease-draw hover:border-ink hover:bg-paper active:scale-[0.98]";

const record = [
  {
    value: "23",
    unit: "years",
    detail: "of academic excellence in ICT education",
    icon: "cap",
  },
  {
    value: "2002",
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

function Mark({ children }: { children: string }) {
  return (
    <p className="text-theme-red flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
      <span className="bg-theme-red h-px w-8" aria-hidden />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <div className="bg-white">
      <section className="rise relative">
        <div className="lg:grid lg:grid-cols-2">
          <div className="px-4 pt-10 pb-8 md:px-8 md:pt-14 lg:flex lg:justify-end lg:pb-28">
            <div className="lg:w-full lg:max-w-[700px] lg:pr-12 lg:pl-8">
              <Mark>Transforming generations</Mark>
              <h1 className="text-ink mt-4 max-w-[12ch] text-[2.5rem] leading-[1.05] font-medium md:text-6xl">
                Building the digital leaders of tomorrow.
              </h1>
              <p className="text-ink-soft mt-4 max-w-[36ch] text-base leading-relaxed md:text-lg">
                College of Information and Communications Technology, West
                Visayas State University.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/programs" className={primaryCta}>
                  Explore our programs
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link href="#why-choose-us" className={secondaryCta}>
                  Why choose us
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden lg:min-h-full">
            <PhotoSlot
              label="Campus photo coming"
              className="absolute inset-0 h-full w-full"
            />
            <ul
              aria-hidden
              className="absolute top-1/2 right-6 hidden -translate-y-1/2 space-y-4 text-right text-[11px] font-semibold tracking-[0.22em] text-white/85 uppercase sm:block"
            >
              {pillars.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
            <div
              aria-hidden
              className="bg-theme-red absolute right-0 bottom-0 h-28 w-28"
              style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 70%)" }}
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-8 max-w-[1120px] px-4 pb-4 lg:-mt-16">
          <h2 className="sr-only">College record</h2>
          <dl className="grid grid-cols-2 gap-6 rounded-2xl bg-white px-5 py-6 shadow-[0_18px_50px_rgba(16,32,51,0.1)] sm:px-8 lg:grid-cols-4">
            {record.map((item) => (
              <div key={item.value} className="flex min-w-0 gap-3">
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

      <section id="about" className="bg-navy scroll-mt-24 text-white">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div className="px-4 py-16 md:px-8 md:py-20">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
              <span className="h-px w-8 bg-white/70" aria-hidden />
              About CICT
            </p>
            <h2 className="mt-3 max-w-[16ch] text-4xl leading-[1.1] font-medium md:text-5xl">
              Innovative education for a digital tomorrow.
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-white/80 md:text-lg">
              Founded in <strong>2002</strong> under BOR Resolution No. 34, the
              College of Information and Communications Technology (CICT) began
              as the{" "}
              <strong>
                Institute of Information and Communications Technology (IICT)
              </strong>{" "}
              and launched the{" "}
              <strong>BS in Information Technology (BSIT)</strong> and{" "}
              <strong>BS in Information Management (BSIM)</strong> programs in
              AY 2002-2003, producing its first graduates soon after.
            </p>
            <Link href="/about" className={`${primaryCta} mt-8`}>
              Learn more about us
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[22rem]">
            <PhotoSlot
              label="Classroom photo coming"
              className="absolute inset-0 h-full w-full"
            />
            <div
              aria-hidden
              className="bg-theme-red absolute inset-y-0 right-0 w-2/5"
              style={{ clipPath: "polygon(42% 0, 100% 0, 100% 100%, 0 100%)" }}
            />
            <p
              className={`${script.className} absolute right-6 bottom-8 left-6 text-right text-4xl text-white md:text-5xl`}
            >
              Transforming Generations
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div className="flex gap-4">
            <span className="text-theme-red border-theme-red/30 mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M12 2v3M12 19v3M2 12h3M19 12h3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-ink text-2xl font-medium">Mission</h2>
              <p className="text-ink-soft mt-3 text-base leading-relaxed md:text-lg">
                The WVSU-CICT aims to develop professionals who shall be able to
                meet the growing manpower demand by expanding the ICT industries
                in the country. Being the lead institution of higher learning in{" "}
                <strong>Western Visayas.</strong>
              </p>
            </div>
          </div>
          <div className="md:border-rule flex gap-4 md:border-l md:pl-10">
            <span className="text-theme-red border-theme-red/30 mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </span>
            <div>
              <h2 className="text-ink text-2xl font-medium">Vision</h2>
              <p className="text-ink-soft mt-3 text-base leading-relaxed md:text-lg">
                To be the leading provider of ICT education in{" "}
                <strong>Western Visayas</strong>, aligned with the broader
                mandate of WVSU as the lead institution of higher learning in
                the region.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses-offered" className="scroll-mt-24 bg-[#f7f8fa]">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Mark>Our programs</Mark>
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
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
          <div className="relative min-h-[22rem]">
            <PhotoSlot
              label="Students photo coming"
              className="absolute inset-0 h-full w-full"
            />
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 hidden w-24 bg-[#f7f8fa] lg:block"
              style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 0 100%)" }}
            />
          </div>
          <div className="relative flex items-center overflow-hidden px-4 py-16 md:px-12 md:py-20">
            <img
              src="/cict-emblem.png"
              alt=""
              className="pointer-events-none absolute -right-6 -bottom-8 w-56 opacity-[0.06]"
            />
            <div className="relative max-w-[36rem]">
              <Mark>Admission</Mark>
              <h2 className="text-ink mt-3 max-w-[16ch] text-4xl leading-[1.1] font-medium md:text-5xl">
                Questions about admission or a program?
              </h2>
              <p className="text-ink-soft mt-4 max-w-[42ch] text-base leading-relaxed md:text-lg">
                Write to the CICT office about programs, visits, and enrollment.
              </p>
              <Link href="/contact" className={`${primaryCta} mt-8`}>
                Contact us
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
