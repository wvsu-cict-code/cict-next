import Link from "next/link";
import { primaryButton } from "@/components/PageHeader";
import { ArrowIcon } from "@/components/PhotoSlot";

/** Navy card on the BSEMC program page, above the student-works wall. */
export function MuseumBanner() {
  return (
    <aside className="bg-navy mt-12 flex flex-col gap-6 rounded-2xl px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:px-8">
      <div className="max-w-[40rem]">
        <h2 className="text-2xl leading-tight font-medium md:text-3xl">
          Visit the Virtual Museum
        </h2>
        <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-white/80">
          Walk through games, films, art, and other work by BSEMC students.
        </p>
      </div>
      <Link
        href="/programs/bsemc/museum/"
        className={`${primaryButton} self-start`}
      >
        Enter the museum
        <ArrowIcon className="h-4 w-4" />
      </Link>
    </aside>
  );
}
