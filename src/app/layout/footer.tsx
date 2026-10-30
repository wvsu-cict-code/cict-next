import Link from "next/link";

const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news-announcements", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/faculty-profiles", label: "Faculty" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#1e1e1e] text-white">
      {/* Background emblem */}
      <img
        src="/footer_assets/cict-icon.svg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute -right-40 -bottom-40 w-[36rem] max-w-none opacity-[0.08] md:-right-24 md:-bottom-64 md:w-[48rem]"
      />

      <div className="relative mx-auto max-w-[1400px] px-4 pt-14 pb-8 md:px-8 md:pt-16">
        <div className="grid gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Branding and contact */}
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/footer_assets/cict-icon.svg"
                className="h-10 w-10 md:h-12 md:w-12"
                alt="WVSU CICT Logo"
              />
              <h2 className="flex gap-3 text-4xl leading-none font-medium uppercase md:text-5xl">
                WVSU <span className="font-major font-light">CICT</span>
              </h2>
            </div>

            <p className="mt-5 max-w-[60ch] text-sm leading-relaxed text-white/80 md:text-base">
              The official website of the{" "}
              <span className="text-orange-light">
                WVSU College of Information and Communications Technology.
              </span>{" "}
              We aim to foster a resilient, innovative, and digitally-ready
              Western Visayas - producing competent, globally competitive, and
              technologically skilled harbingers of change.
            </p>

            <h3 className="mt-10 text-xl tracking-wide md:text-2xl">
              Get in touch with{" "}
              <span className="text-orange-light font-major">us</span>
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="https://web.facebook.com/cictwvsu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit WVSU CICT Facebook Page"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors duration-200 hover:border-white/60 hover:bg-white/5"
              >
                <img
                  src="/footer_assets/footer-fb.svg"
                  className="h-5 w-5 object-contain"
                  alt=""
                  aria-hidden="true"
                />
              </a>
              <a
                href="mailto:cict@wvsu.edu.ph"
                aria-label="Email WVSU CICT"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors duration-200 hover:border-white/60 hover:bg-white/5"
              >
                <img
                  src="/footer_assets/footer-mail.svg"
                  className="h-5 w-5 object-contain brightness-0 invert"
                  alt=""
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="md:justify-self-end">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
              Navigation
            </p>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-orange-light text-lg text-white transition-colors md:text-xl"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/15 pt-6">
          <p className="text-sm text-white/70">
            Copyright {currentYear} © WVSU CICT. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
