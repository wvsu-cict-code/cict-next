const STEPS = [
  {
    title: "Sign in",
    detail: "Sign in with your WVSU account.",
  },
  {
    title: "Upload",
    detail: "Add project files, details and media.",
  },
  {
    title: "Review",
    detail: "A CICT admin checks your submission.",
  },
  {
    title: "Exhibit",
    detail: "Your work goes live in the Virtual Museum.",
  },
] as const;

export function HowItWorks() {
  return (
    <div className="border-rule bg-surface-2 h-full rounded-2xl border p-6 md:p-8">
      <h2 className="text-ink text-3xl leading-tight font-medium">
        How It Works
      </h2>
      <ol aria-label="How it works" className="mt-6 grid gap-5 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className="bg-paper text-accent flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="text-ink text-lg leading-tight font-medium">
                {step.title}
              </h3>
              <p className="text-ink-soft mt-1 text-sm leading-relaxed">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
