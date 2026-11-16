import { Suspense } from "react";
import { ConfirmLanding } from "@/components/account/ConfirmLanding";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ConfirmLanding />
    </Suspense>
  );
}
