import { Suspense } from "react";
import { SubmissionForm } from "@/components/account/SubmissionForm";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SubmissionForm />
    </Suspense>
  );
}
