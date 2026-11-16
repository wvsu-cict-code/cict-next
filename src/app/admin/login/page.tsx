import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/cms/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  if (await getAdmin()) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-navy relative isolate hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/temp-photos/campus.jpg"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
        />
        <div className="from-navy via-navy/70 absolute inset-0 -z-10 bg-gradient-to-t to-transparent" />
        <div className="flex h-full flex-col justify-end p-12 text-white">
          <p className="text-orange-light flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
            <span className="bg-orange-light h-px w-8" aria-hidden />
            WVSU College of ICT
          </p>
          <p className="font-major mt-4 max-w-[16ch] text-5xl leading-[1.05] font-medium">
            Keep the college website current.
          </p>
          <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-white/75">
            Publish news, update programs, and manage the faculty directory.
          </p>
        </div>
        <div
          aria-hidden
          className="bg-theme-red absolute right-0 bottom-0 h-24 w-24"
          style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 70%)" }}
        />
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/cict-emblem.png"
              width={40}
              height={41}
              alt="CICT logo"
            />
            <span className="font-major text-ink text-2xl leading-none">
              <b className="font-medium">CICT</b>{" "}
              <span className="text-ink-soft">CMS</span>
            </span>
          </div>
          <h1 className="text-ink mt-10 text-3xl font-medium">Sign in</h1>
          <p className="text-ink-soft mt-2 text-sm">
            Use your CMS admin account to manage site content.
          </p>
          <div className="mt-8">
            <LoginForm
              initialError={
                error === "not-admin"
                  ? "Your account does not have CMS access."
                  : undefined
              }
            />
          </div>
          <p className="mt-8 text-sm">
            <Link
              href="/"
              className="text-ink-soft hover:text-theme-red inline-flex items-center gap-1.5 font-medium"
            >
              <span aria-hidden>←</span> Back to the website
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
