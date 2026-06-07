import Link from "next/link";

const NAV_LINKS = [
  { href: "/programs", label: "PROGRAM" },
  { href: "/news-announcements", label: "NEWS" },
  { href: "/faculty-profiles", label: "FACULTY" },
  { href: "/contact", label: "CONTACT" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#1e1e1e] pb-2 md:pb-0">
      <div className="relative z-10 mx-auto w-auto px-6 pt-10 md:px-0 md:py-12">
        <div className="flex flex-col justify-between md:grid md:grid-cols-[2fr_1fr]">
          {/* Left Column: Branding and Contact */}
          <div className="md:pl-10">
            {/* Logo Section */}
            <div className="relative z-10 mb-6 flex items-center md:mb-2 md:ml-32">
              <img
                src="/footer_assets/cict-icon.svg"
                className="h-10 w-10 md:mr-1 md:h-14 md:w-14"
                alt="WVSU CICT Logo"
              />
              <h2 className="flex gap-3 text-4xl leading-4 font-medium text-white uppercase md:text-5xl">
                WVSU <span className="font-major font-light">CICT</span>
              </h2>
            </div>

            {/* Description */}
            <p className="relative z-10 mb-12 text-left text-sm leading-6 text-white md:mb-18 md:ml-35 md:max-w-170 md:text-base">
              The official website of the{" "}
              <span className="text-orange-light">
                WVSU College of Information and Communications Technology.{" "}
              </span>
              We aim to foster a resilient, innovative, and digitally-ready
              Western Visayas - producing competent, globally competitive, and
              technologically skilled harbingers of change.
            </p>

            {/* Social Media Section */}
            <div className="relative z-10">
              <h3 className="mb-2 text-xl tracking-wide text-white md:mb-4 md:ml-35 md:text-2xl">
                Get in touch with{" "}
                <span className="text-orange-light font-major">us</span>
              </h3>

              {/* Added gap for mobile spacing */}
              <div className="flex items-center gap-2 md:ml-33 md:gap-0">
                <a
                  href="https://web.facebook.com/cictwvsu"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit WVSU CICT Facebook Page"
                  className="text-gray-300 transition-colors duration-200 hover:text-white"
                >
                  <img
                    src="/footer_assets/footer-fb.svg"
                    className="h-6 w-5 object-contain md:h-5 md:w-7"
                    alt=""
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="mailto:cict@wvsu.edu.ph"
                  aria-label="Email WVSU CICT"
                  className="text-gray-300 transition-colors duration-200 hover:text-white"
                >
                  <img
                    src="/footer_assets/footer-mail.svg"
                    className="h-8 w-8 object-contain pt-1 brightness-0 invert md:h-7 md:w-10"
                    alt=""
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile SVG Background */}
          <div
            className="pointer-events-none absolute top-60 -left-42 z-0 opacity-8 sm:top-48"
            aria-hidden="true"
          >
            <img
              src="/footer_assets/cict-icon.svg"
              alt=""
              loading="lazy"
              className="block w-155 max-w-none md:hidden"
            />
          </div>

          {/* Desktop SVG Background */}
          <div
            className="pointer-events-none absolute top-1/2 right-0 z-0 mt-47 translate-x-35 -translate-y-1/2 opacity-8"
            aria-hidden="true"
          >
            <img
              src="/footer_assets/cict-icon.svg"
              alt=""
              loading="lazy"
              className="hidden h-200 object-contain md:block"
            />
          </div>

          {/* Right Column: Navigation */}
          <div className="relative z-10 flex flex-col items-start pt-12 pr-0 text-left md:items-end md:pt-18 md:pr-44 md:text-right">
            <p className="font-minor mb-4 text-base font-extrabold tracking-tight text-white md:text-2xl">
              NAVIGATION
            </p>
            <nav className="flex flex-col items-start gap-5 text-sm md:items-end md:gap-4 md:text-xl">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="tracking-wide text-white uppercase transition-colors hover:text-gray-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom Copyright Divider */}
          {/* Stretches full width on mobile, centers text */}
          <div className="relative z-10 mt-10 w-full md:col-span-2 md:mt-15 md:mb-20">
            <div className="-mx-6 mb-4 h-px bg-[#4D4D4D] md:mx-0 md:mb-4 md:ml-0 md:w-291 md:translate-x-45" />
            <p className="text-center text-sm font-medium text-white md:translate-x-55 md:text-left md:text-base">
              Copyright {currentYear} © WVSU CICT. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
