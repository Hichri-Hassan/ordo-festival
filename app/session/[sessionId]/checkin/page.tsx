import { Suspense } from "react";
import CheckinPageInner from "./CheckinInner";

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5">
          <p className="text-[var(--color-ink-muted)]">Chargement…</p>
        </main>
      }
    >
      <CheckinPageInner />
    </Suspense>
  );
}
