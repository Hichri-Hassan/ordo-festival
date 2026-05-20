"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export function DemoBanner() {
  const [demo, setDemo] = useState(false);
  const [secs, setSecs] = useState(120);

  useEffect(() => {
    api<{ demoMode: boolean; roundDurationSec: number }>("/api/config").then((c) => {
      setDemo(c.demoMode);
      setSecs(c.roundDurationSec);
    });
  }, []);

  if (!demo) return null;

  return (
    <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-dark)] px-4 py-3 text-center text-sm text-[var(--color-ink-muted)]">
      <span className="font-medium text-[var(--color-ink)]">Mode test actif</span>
      {" · "}
      sessions immédiates · {secs >= 60 ? `${secs / 60} min` : `${secs} s`} par tour
    </div>
  );
}
