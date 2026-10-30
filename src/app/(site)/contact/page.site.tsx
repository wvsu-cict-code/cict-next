"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  Eyebrow,
  PageHeader,
  SectionHeading,
  container,
} from "@/components/PageHeader";

const PHONE = "+6312345689";
const EMAIL = "cict@wvsu.edu.ph";

const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-6 w-6",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const infoCards: { title: string; icon: ReactNode; body: ReactNode }[] = [
  {
    title: "Address",
    icon: (
      <svg {...iconProps}>
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    ),
    body: <p>West Visayas State University, La Paz, Iloilo City</p>,
  },
  {
    title: "Office",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
      </svg>
    ),
    body: (
      <>
        <p>College of Information and Communications Technology (CICT)</p>
        <p className="mt-2">Office hours: 8:00 AM – 5:00 PM</p>
      </>
    ),
  },
  {
    title: "Contact info",
    icon: (
      <svg {...iconProps}>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
      </svg>
    ),
    body: (
      <>
        <p>
          Phone:{" "}
          <a href={`tel:${PHONE}`} className="text-ink hover:text-theme-red">
            {PHONE}
          </a>
        </p>
        <p className="mt-1">
          Email:{" "}
          <a href={`mailto:${EMAIL}`} className="text-ink hover:text-theme-red">
            {EMAIL}
          </a>
        </p>
        <p className="mt-1">
          Facebook:{" "}
          <a
            href="https://www.facebook.com/WVSUCICT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink hover:text-theme-red"
          >
            WVSU CICT
          </a>
        </p>
      </>
    ),
  },
];

const faqItems = [
  {
    header: "What programs and courses are offered by CICT?",
    body: "The College of Information and Communications Technology (CICT) offers BLIS, BSCS, BSEMC, BSIS, and BSIT.",
  },
  {
    header: "How do I apply or shift to a CICT program?",
    body: "Visit the university admissions office or check the official WVSU website.",
  },
  {
    header: "Who should I contact for urgent concerns?",
    body: `Call ${PHONE} or email ${EMAIL}`,
  },
  {
    header: "Does CICT provide IT or technical support for students?",
    body: "Yes, CICT provides technical support through the helpdesk and on-campus staff.",
  },
];

export default function Contact() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Contact"
        title="College contact information"
        intro="For any inquiries or collaborations, we'd love to hear from you. Reach out and let's connect."
      />

      {/* INFO CARDS */}
      <section className={`${container} py-16 md:py-20`}>
        <ul className="grid gap-5 md:grid-cols-3">
          {infoCards.map((card) => (
            <li
              key={card.title}
              className="border-rule rounded-2xl border bg-[#f7f8fa] p-6"
            >
              <span className="text-theme-red border-theme-red/30 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-white">
                {card.icon}
              </span>
              <h2 className="text-ink mt-5 text-xl font-medium">
                {card.title}
              </h2>
              <div className="text-ink-soft mt-2 text-base leading-relaxed">
                {card.body}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="bg-navy text-white">
        <div
          className={`${container} grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-20`}
        >
          <div>
            <Eyebrow onDark>FAQ</Eyebrow>
            <h2 className="mt-3 text-3xl leading-[1.1] font-medium md:text-4xl">
              Frequently asked questions
            </h2>

            <div className="mt-8 border-t border-white/15">
              {faqItems.map((item, index) => {
                const isOpen = activeFAQ === index;
                return (
                  <div key={index} className="border-b border-white/15">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${index}`}
                      className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold md:text-lg"
                      onClick={() => setActiveFAQ(isOpen ? null : index)}
                    >
                      <span className="leading-snug">{item.header}</span>
                      <svg
                        viewBox="0 0 20 20"
                        className={`ease-draw h-5 w-5 shrink-0 text-white/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        aria-hidden
                      >
                        <path
                          d="M5 8l5 5 5-5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isOpen && (
                      <p
                        id={`faq-${index}`}
                        className="max-w-[60ch] pb-5 text-base leading-relaxed text-white/75"
                      >
                        {item.body}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src="/icons/cictlogo.svg"
              alt="CICT seal"
              width={300}
              height={300}
              className="h-auto w-52 sm:w-64 lg:w-72"
            />
          </div>
        </div>
      </section>

      {/* FIND US */}
      <section className={`${container} py-16 md:py-24`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Visit"
              title="Get in touch"
              intro="Whether you have questions, need support, or want to learn more — our team is here to help."
            />
            <p className="text-ink mt-6 text-base font-medium">
              WVSU, La Paz, Iloilo City, Philippines
            </p>
          </div>
          <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-[0_12px_40px_rgba(16,32,51,0.06)]">
            <iframe
              src="https://www.google.com/maps?q=West%20Visayas%20State%20University%20La%20Paz%20Iloilo&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              title="Map of WVSU"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
