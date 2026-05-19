"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";
import { api, ApiError } from "@/lib/client";

export default function HostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [done, setDone] = useState(false);
  const [roundSec, setRoundSec] = useState(120);
  const [validCheckedIn, setValidCheckedIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const label = sessionId === "now" ? "Maintenant" : sessionId.replace("-", ":");

  const refresh = useCallback(() => {
    api<{ validCheckedIn: number }>(`/api/sessions/${sessionId}`).then((s) =>
      setValidCheckedIn(s.validCheckedIn ?? 0)
    );
  }, [sessionId]);

  useEffect(() => {
    api<{ roundDurationSec: number }>("/api/config").then((c) =>
      setRoundSec(c.roundDurationSec)
    );
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  async function start() {
    setError(null);
    try {
      await api(`/api/sessions/${sessionId}/start`, { method: "POST" });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === "NEED_TWO") {
        setError(
          `Seulement ${validCheckedIn} personne(s) prête(s). Chaque téléphone doit refaire onboarding + check-in sur cette session.`
        );
      } else {
        setError("Impossible de lancer. Réessaie.");
      }
    }
  }

  return (
    <Page className="text-center">
      <Logo />
      <DemoBanner />
      <Heading sub={`Session ${label} · mode hôte`}>Démarrer la session</Heading>

      <Card className="mb-6">
        <p className="text-3xl font-semibold tabular-nums">{validCheckedIn}</p>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          personne{validCheckedIn !== 1 ? "s" : ""} prête{validCheckedIn !== 1 ? "s" : ""}{" "}
          (profil + check-in)
        </p>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Tours de {roundSec} secondes · minimum 2 personnes
        </p>
      </Card>

      {error && (
        <p className="mb-4 text-sm text-red-700">{error}</p>
      )}

      <Button onClick={start} disabled={done || validCheckedIn < 2}>
        {done ? "Session lancée ✓" : "Lancer maintenant"}
      </Button>

      <p className="mt-6 text-xs text-[var(--color-ink-faint)]">
        Check-in QR : /session/{sessionId}/checkin
      </p>
    </Page>
  );
}
