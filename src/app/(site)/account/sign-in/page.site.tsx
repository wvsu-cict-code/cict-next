import { Suspense } from "react";
import { SignInForm } from "@/components/account/SignInForm";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
