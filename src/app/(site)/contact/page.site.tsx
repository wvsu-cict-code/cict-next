"use client";

import Image from "next/image";
import { useState } from "react";

interface InfoBox {
  icon: string;
  title: string;
  content?: string;
  phone?: string;
  email?: string;
}

const infoBoxes: InfoBox[] = [
  {
    icon: "/icons/firstbox_icon.svg",
    title: "ADDRESS",
    content: "West Visayas State University, La Paz, Iloilo City",
  },
  {
    icon: "/icons/office_icon.svg",
    title: "OFFICE NAME",
    content:
      "College of Information and Communications Technology (CICT)\nOffice Hours: 8:00 AM – 5:00 PM",
  },
  {
    icon: "/icons/contact_icon.svg",
    title: "CONTACT INFO",
    phone: "+6312345689",
    email: "cict@wvsu.edu.ph",
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
    body: "Call +6312345689 or email cict@wvsu.edu.ph",
  },
  {
    header: "Does CICT provide IT or technical support for students?",
    body: "Yes, CICT provides technical support through the helpdesk and on-campus staff.",
  },
];

export default function Contact() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  return (
    <main className="flex w-full flex-col items-center text-center">
      {/* HERO */}
      <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-major text-4xl tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-neutral-900">COLLEGE CONTACT </span>
          <span className="text-orange-light">INFORMATION</span>
        </h1>
        <p className="font-minor mx-auto mt-4 max-w-3xl text-base text-neutral-600 sm:text-lg">
          For any inquiries or collaborations, we'd{" "}
          <span className="text-orange-light">love</span> to hear from you.{" "}
          <span className="text-orange-light">Reach out</span> and let's{" "}
          <span className="text-orange-light">connect.</span>
        </p>
      </section>

      {/* INFO BOXES */}
      <section className="mt-22 flex w-full flex-wrap justify-center gap-x-6 gap-y-14 px-4 sm:gap-x-8 sm:gap-y-18 sm:px-6 lg:px-8">
        {infoBoxes.map((box, i) => (
          <div
            key={i}
            className="relative flex h-56 w-72 flex-col items-center rounded-xl bg-white pt-12 shadow-xl sm:h-60 sm:w-80"
          >
            <Image
              src={box.icon}
              alt={box.title}
              width={56}
              height={56}
              className="absolute -top-7"
            />
            <p className="font-major text-orange-light text-lg font-bold">
              {box.title}
            </p>
            {"phone" in box || "email" in box ? (
              <div className="font-minor mt-3 px-4 text-sm text-neutral-600 sm:px-6">
                {box.phone && (
                  <p>
                    <a href={`tel:${box.phone}`} className="hover:underline">
                      Phone: {box.phone}
                    </a>
                  </p>
                )}
                {box.email && (
                  <p>
                    <a href={`mailto:${box.email}`} className="hover:underline">
                      Email: {box.email}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="font-minor mt-3 px-4 text-sm whitespace-pre-line text-neutral-600 sm:px-6">
                {box.content}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="mt-20 w-full bg-neutral-900">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 sm:gap-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
          {/* LOGO */}
          <div className="order-1 mt-16 mb-6 flex justify-center lg:order-2 lg:mb-0">
            <Image
              src="/icons/cictlogo.svg"
              alt="CICT Logo"
              width={300}
              height={300}
              className="h-auto w-52 sm:w-64 lg:w-72"
            />
          </div>

          {/* FAQ CONTENT */}
          <div className="order-2 text-left lg:order-1">
            <h2 className="font-major mb-6 text-3xl leading-tight sm:mb-8 sm:text-4xl md:text-5xl">
              <span className="block text-white">FREQUENTLY ASKED</span>
              <span className="text-orange-light block">QUESTIONS</span>
            </h2>

            <div className="font-minor flex flex-col">
              {faqItems.map((item, index) => {
                const isOpen = activeFAQ === index;
                const isFirst = index === 0;

                return (
                  <div key={index}>
                    {isFirst && <div className="border-t border-neutral-700" />}

                    <button
                      className="flex w-full items-start justify-between gap-4 border-b border-neutral-700 py-4 font-semibold text-white sm:py-5"
                      onClick={() => setActiveFAQ(isOpen ? null : index)}
                    >
                      <span className="pr-4 text-left leading-snug">
                        {item.header}
                      </span>
                      <span className="shrink-0 text-xl">
                        {isOpen ? "-" : "⌵"}
                      </span>
                    </button>

                    {isOpen && (
                      <>
                        <p className="py-3 leading-relaxed text-neutral-300">
                          {item.body}
                        </p>
                        <div className="border-b border-neutral-700" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="w-full bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 lg:grid-cols-2">
          {/* LEFT */}
          <div className="text-left">
            <h2 className="font-major text-3xl sm:text-4xl md:text-5xl">
              <span className="text-neutral-900">Get in </span>
              <span className="text-orange-light">Touch</span>
            </h2>
            <p className="font-minor mt-4 max-w-md text-base text-neutral-600">
              Whether you have questions, need support, or want to learn more —
              our team is here to help.
            </p>
            <div className="mt-6 flex gap-6">
              <a
                href="https://www.facebook.com/WVSUCICT"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/icons/facebook.svg"
                  alt="fb"
                  width={40}
                  height={40}
                />
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
            <div className="text-left">
              <Image
                src="/icons/home.svg"
                alt="address"
                width={36}
                height={36}
              />
              <h3 className="font-major text-orange-light mt-4 text-lg font-bold">
                Our Address
              </h3>
              <p className="font-minor mt-2 text-neutral-600">
                WVSU, La Paz, Iloilo City, Philippines
              </p>
            </div>

            <div className="text-left">
              <Image
                src="/icons/mobile.svg"
                alt="contact"
                width={36}
                height={36}
              />
              <h3 className="font-major text-orange-light mt-4 text-lg font-bold">
                Contact Info
              </h3>
              <p className="font-minor mt-2 text-neutral-600">
                <a href="tel:+6312345689" className="hover:underline">
                  Phone: +6312345689
                </a>
              </p>
              <p className="font-minor mt-1 text-neutral-600">
                <a href="mailto:cict@wvsu.edu.ph" className="hover:underline">
                  Email: cict@wvsu.edu.ph
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* MAP */}
        <section className="mt-20 flex w-full justify-center sm:mt-24">
          <div className="aspect-[1148/539] w-full max-w-6xl overflow-hidden rounded-xl shadow-xl">
            <iframe
              src="https://www.google.com/maps?q=West%20Visayas%20State%20University%20La%20Paz%20Iloilo&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              title="Map of WVSU"
            />
          </div>
        </section>
      </section>
    </main>
  );
}
