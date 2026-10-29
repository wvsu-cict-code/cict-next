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
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            src="/cict-emblem.png"
            width={48}
            height={49}
            alt="CICT logo"
          />
          <h1 className="text-2xl font-medium">CICT Website CMS</h1>
          <p className="text-sm text-neutral-500">
            Sign in to manage site content.
          </p>
        </div>
        <LoginForm
          initialError={
            error === "not-admin"
              ? "Your account does not have CMS access."
              : undefined
          }
        />
        <p className="text-center text-xs text-neutral-500">
          <Link href="/" className="hover:text-orange-dark underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
