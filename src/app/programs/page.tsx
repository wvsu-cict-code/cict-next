import Image from 'next/image';
import Link from 'next/link';
import programsData from '../data/programs.json';
import { Metadata } from 'next';

// --- SEO METADATA CONFIGURATION ---
export const metadata: Metadata = {
  title: 'Programs', 
  description: 'Explore our undergraduate and graduate degree programs and take the next step toward your goals.',
  alternates: {
    canonical: '/programs',
  },
  openGraph: {
    title: 'Programs',
    description: 'Explore our undergraduate and graduate degree programs and take the next step toward your goals.', 
  },
};

interface Program {
  id: string;
  code: string;
  name: string;
  href: string;
  logo: string;
}

const PROGRAMS: Program[] = programsData as Program[];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative flex md:flex-row w-auto md:w-full h-103 md:h-148">
        <div className="absolute md:relative w-full h-100 md:h-full md:w-1/2">
          <Image
            src="/program_assets/cict.webp"
            alt="WVSU CICT Building"
            fill
            className="object-cover opacity-70 md:opacity-100"
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          {/* Overlay: Only visible on Mobile to make text readable */}
          <div className="absolute inset-0 bg-linear-to-t from-orange-dark/70 via-orange-dark/20 to-transparent md:hidden" />
        </div>
        <div className="relative z-10 flex flex-col justify-center w-full h-full px-6 text-center text-white md:w-1/2 md:bg-orange-light md:text-left md:p-20 ">
          <h1 className="text-5xl font-medium mb-6 drop-shadow-xl md:drop-shadow-none">Programs and Curriculum</h1>
          <p className="mx-auto md:mx-0 max-w-md text-base font-light leading-relaxed tracking-tight drop-shadow-xl md:drop-shadow-none">
            Explore our undergraduate and graduate degree programs and take the next step toward your goals.
          </p>
        </div>
      </section>
      {/* Courses Offered Section */}
      <section className="max-w-6xl mx-auto pt-9 md:pt-27 px-6">
        <h2 className="text-4xl md:text-6xl font-medium text-center mb-9 pb-9 md:mb-16 md:pb-15 tracking-tighter">
          Courses Offered
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-17 md:gap-y-22 pb-80 md:pb-42">
          {PROGRAMS.map((program: Program) => (
            <Link
              key={program.id}
              href={program.href}
              className="group relative bg-white border border-gray-100 rounded-lg p-4 pt-8 md:p-8 md:pt-12 flex flex-col items-center text-center cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Floating Icon Circle */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-orange-light flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-orange-500">
                <div className="w-50 h-50 rounded-full flex items-center justify-center p-2">
                  <Image
                    src={program.logo}
                    alt={`${program.code} logo`}
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-medium tracking-tighter pt-10 mb-3 md:mb-2">{program.code}</h3>
              <p className="px-10 text-sm md:text-base font-normal mb-14 leading-tight tracking-tight h-10">
                {program.name}
              </p>
              <div className="text-black group-hover:text-orange-500 transition-colors transform group-hover:translate-x-1">
                <Image
                  src="/program_assets/arrow.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}