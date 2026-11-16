import { Suspense } from "react";
import { AccountHome } from "@/components/account/AccountHome";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AccountHome />
    </Suspense>
  );
}
