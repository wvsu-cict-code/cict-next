import { notFound } from 'next/navigation';
import Link from 'next/link';
import programsData from '../../data/programs.json';
import Image from 'next/image';

interface Program {
    id: string;
    code: string;
    name: string;
    href: string;
    logo: string;
    description: string;
    objectives: string;
    duration: string;
    semesters: string;
    curriculumPdf: string;
}

// Requires params to be a Promise
interface PageProps {
    params: Promise<{ id: string }>;
}

// Generate static paths for all programs at build time
export async function generateStaticParams() {
    return programsData.map((program) => ({
        id: program.id,
    }));
}

export default async function ProgramDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const program = (programsData as Program[]).find((p) => p.id === id);
    if (!program) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-white pb-20 font-sans">

            <section className="relative w-auto h-98 md:w-full md:min-h-154 bg-orange-light flex flex-col items-center justify-center px-6 md:px-20 text-center overflow-hidden">

                {/* Dynamic Background Watermark */}
                {/* Left SVG */}
                <div className="absolute -left-20 bottom-0 md:-left-50 md:bottom-12 opacity-0 md:opacity-20 w-60 h-60 md:w-125 md:h-125 ">
                    <Image
                        src={program.logo}
                        alt=""
                        fill
                        className="object-contain object-bottom-left brightness-0 invert"
                        priority
                    />
                </div>

                {/* Right SVG */}
                <div className="absolute -right-20 top-10 md:-right-50 md:top-1/2 md:-translate-y-1/2 opacity-20 md:opacity-20 w-80 h-80 md:w-125 md:h-125">
                    <Image
                        src={program.logo}
                        alt=""
                        fill
                        className="object-contain object-right brightness-0 invert"
                        priority
                    />
                </div>

                {/* Back Button */}
                <div className="absolute top-8 left-6 md:top-24 md:left-20 z-20">
                    <Link
                        href="/programs"
                        className="group relative flex items-center gap-4 px-8 py-4 bg-white text-orange-light rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-700 w-fit cursor-pointer"
                    >
                        <div className="flex items-center justify-center text-orange-light transition-transform group-hover:-translate-x-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="text-[13px] font-bold tracking-tighter text-orange-light uppercase">Back to Programs</span>
                    </Link>
                </div>

                {/* Program Title */}
                <h1 className="relative z-10 max-w-2xl md:max-w-6xl text-left md:text-center text-white text-[40px] md:text-7xl font-semibold md:font-normal leading-12 md:leading-tight mt-10 md:mt-0 drop-shadow-sm">
                    {program.name}
                </h1>
            </section>


            {/* CONTENT SECTION */}
            <div className="max-w-7xl mx-auto px-7 pt-8 md:pt-20 mb-15">

                {/* 1. Description */}
                <div className="mb-12 md:mb-16">
                    <h2 className="text-orange-light text-3xl md:text-[40px] font-medium md:font-normal mb-8">
                        Program Description
                    </h2>
                    <div className="text-black text-sm md:text-base text-justify font-minor leading-relaxed tracking-tight whitespace-pre-line">
                        {program.description}
                    </div>
                </div>

                {/* 2. Objectives */}
                <div className="mb-20">
                    <h2 className="text-orange-light text-3xl md:text-[40px] font-medium md:font-normal mb-8">
                        Program Objectives
                    </h2>
                    <p className="text-black text-sm md:text-base text-justify leading-relaxed tracking-tight whitespace-pre-line">
                        {program.objectives}
                    </p>
                </div>

                {/* INFO CARD */}
                {/*<div className="w-auto mx-auto bg-white border-[1.5] border-black rounded-2xl p-8 mb-45 md:mt-0 md:mb-0 md:px-35 md:py-4 flex flex-col sm:flex-row md:flex-row justify-between gap-10 shadow-sm">


                    <a
                        href={program.curriculumPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-12 group cursor-pointer w-full md:w-auto hover:opacity-80 transition-opacity"
                    >

                        <div className="shrink-0 w-15 h-15 md:w-20 md:h-20 rounded-full bg-orange-light text-white flex items-center justify-center shadow-md">
                            <Image
                                src="/program_assets/pdf-icon.svg"
                                alt=""
                                width={30}
                                height={30}
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-bold text-sm md:text-base text-black leading-tight tracking-tight">
                                [PDF] Curriculum Details
                            </span>
                            <span className="text-black text-sm md:text-base tracking-tight">
                                Press button to download
                            </span>
                        </div>
                    </a>



                    <div className="flex items-center gap-12 w-full md:w-auto">

                        <div className="shrink-0 w-15 h-15 md:w-20 md:h-20 rounded-full bg-orange-light text-white flex items-center justify-center shadow-md">
                            <Image
                                src="/program_assets/cap-icon.svg"
                                alt=""
                                width={40}
                                height={40}
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-bold text-sm md:text-base text-black leading-tight tracking-tight">
                                Program Duration
                            </span>
                            <span className="text-black text-sm md:text-base tracking-tight">
                                {program.duration}
                            </span>
                            <span className="text-black text-sm md:text-base tracking-tight">
                                {program.semesters}
                            </span>
                        </div>
                    </div>

                </div>*/}
            </div>
        </main>
    );
}
