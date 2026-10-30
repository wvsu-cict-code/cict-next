"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Department, FacultyMember } from "@/lib/faculty";
import ZoomedBackground from "@/components/faculty/ZoomedBackground";
import FacultyGallery from "@/components/faculty/FacultyGallery";
import FacultyInfoList from "@/components/faculty/FacultyInfoList";
import { Eyebrow } from "@/components/PageHeader";

import Image from "next/image";

interface FacultyDetailProps {
  dept: Department | null;
  faculty: FacultyMember[];
}

/**
 * FacultyDetail
 *
 * Displays detailed information about faculty members within a specific department.
 * Features a zoomed-in brand background and a glassmorphic content panel.
 */
export default function FacultyDetail({ dept, faculty }: FacultyDetailProps) {
  const [memberIndex, setMemberIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!dept) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-4 text-center">
        <h1 className="text-ink text-3xl font-medium md:text-4xl">
          Department not found
        </h1>
        <Link
          href="/faculty-profiles"
          className="text-theme-red text-sm font-semibold hover:underline"
        >
          Back to the directory
        </Link>
      </div>
    );
  }

  return (
    <div className="selection:bg-theme-red relative flex w-full flex-col overflow-hidden selection:text-white">
      {/* Sharp zoomed logo background */}
      <ZoomedBackground dept={dept} isVisible={isVisible} />

      <div className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col items-stretch md:flex-row">
        {/* Left Section: Back Navigation */}
        <div className="flex w-full shrink-0 flex-col bg-white p-8 md:w-[32%] md:bg-transparent md:p-14 lg:p-20">
          <Link
            href="/faculty-profiles"
            className={`group bg-theme-red hover:bg-accent-deep ease-draw relative flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-lg transition-all duration-700 hover:-translate-y-0.5 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden
            >
              <path
                d="M16 10H4M9 5l-5 5 5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to directory
          </Link>
        </div>

        {/* Right Section: Detailed Info Panel (Blurred on Desktop, Solid on Mobile) */}
        <div
          className={`relative flex flex-1 flex-col bg-white shadow-[-50px_0_120px_rgba(16,32,51,0.06)] transition-all duration-1000 lg:bg-white/70 lg:backdrop-blur-md ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div className="absolute top-0 bottom-0 left-0 w-px bg-neutral-200/40" />

          <div className="flex-1 overflow-y-auto px-8 py-12 md:px-16 md:py-24 lg:px-24">
            <header className="mb-12 md:mb-16">
              <Eyebrow>Faculty</Eyebrow>
              <h1 className="text-ink mt-4 text-4xl leading-[1.05] font-medium text-balance md:text-6xl">
                {dept.name}
              </h1>
            </header>

            <div className="flex flex-col items-start gap-20 pb-32">
              {/* Desktop View */}
              <div className="hidden w-full flex-row items-start gap-16 lg:flex">
                <FacultyGallery
                  faculty={faculty}
                  memberIndex={memberIndex}
                  onSelect={setMemberIndex}
                />
                <FacultyInfoList
                  faculty={faculty}
                  memberIndex={memberIndex}
                  onSelect={setMemberIndex}
                />
              </div>

              {/* Mobile View */}
              <ul className="grid w-full gap-12 sm:grid-cols-2 lg:hidden">
                {faculty.map((member, idx) => (
                  <li key={idx} className="flex w-full flex-col gap-5">
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f7f8fa] shadow-[0_12px_40px_rgba(16,32,51,0.08)]">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden
                        className="bg-theme-red mt-2 h-1.5 w-8 shrink-0 rounded-full"
                      />
                      <div className="flex flex-col gap-1">
                        <h2 className="text-ink text-lg leading-tight font-semibold uppercase">
                          {member.name}
                        </h2>
                        {member.title.split("/").map((segment, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-ink text-[15px] leading-tight font-medium"
                          >
                            {segment.trim()}
                          </span>
                        ))}
                        <span className="text-ink-soft mt-1 text-sm leading-snug">
                          {member.description}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
