const iconFrame =
  "text-theme-red border-theme-red/30 mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border";

/** The college mission and vision, side by side; used on Home and About. */
export function MissionVision() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="flex gap-4">
        <span className={iconFrame}>
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
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h2 className="text-ink text-2xl font-medium">Mission</h2>
          <p className="text-ink-soft mt-3 text-base leading-relaxed md:text-lg">
            The WVSU-CICT aims to develop professionals who shall be able to
            meet the growing manpower demand by expanding the ICT industries in
            the country. Being the lead institution of higher learning in{" "}
            <strong>Western Visayas.</strong>
          </p>
        </div>
      </div>
      <div className="md:border-rule flex gap-4 md:border-l md:pl-10">
        <span className={iconFrame}>
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
            <strong>Western Visayas</strong>, aligned with the broader mandate
            of WVSU as the lead institution of higher learning in the region.
          </p>
        </div>
      </div>
    </div>
  );
}
