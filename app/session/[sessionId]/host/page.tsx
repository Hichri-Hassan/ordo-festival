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
  const [demoMode, setDemoMode] = useState(false);
  const [validCheckedIn, setValidCheckedIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const label = sessionId === "now" ? "Maintenant" : sessionId.replace("-", ":");

  const refresh = useCallback(() => {
    api<{ validCheckedIn: number }>(`/api/sessions/${sessionId}`).then((s) =>
      setValidCheckedIn(s.validCheckedIn ?? 0)
    );
  }, [sessionId]);

  useEffect(() => {
    api<{ roundDurationSec: number; demoMode: boolean }>("/api/config").then((c) => {
      setRoundSec(c.roundDurationSec);
      setDemoMode(c.demoMode);
    });
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

  async function resetSession() {
    setError(null);
    setDone(false);
    try {
      await api(`/api/sessions/${sessionId}/reset`, { method: "POST" });
      refresh();
    } catch {
      setError("Impossible de vider la session.");
    }
  }

  return (
    <Page className="text-center">
      <Logo />
      <DemoBanner />
      <Heading sub={`Session ${label} · mode hôte`}>Démarrer la session</Heading>

      <Card className="mb-4 text-left">
        <p className="text-3xl font-semibold tabular-nums text-center">{validCheckedIn}</p>
        <p className="mt-1 text-center text-sm font-medium text-[var(--color-ink)]">
          check-in actifs sur cette session
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">
          Chaque téléphone qui ouvre le lien <strong>check-in</strong> (QR ou copié-collé) est compté
          une fois — ce n&apos;est pas un capteur physique au stand. Les tests d&apos;hier restent
          tant que Railway n&apos;a pas redémarré le serveur.
        </p>
        <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
          Tours de {roundSec} secondes · minimum 2 personnes pour lancer
        </p>
      </Card>

      {demoMode && (
        <button
          type="button"
          onClick={resetSession}
          className="mb-6 w-full rounded-xl border border-[var(--color-border)] py-3 text-sm text-[var(--color-ink-muted)]"
        >
          Vider cette session (repartir à 0 pour les tests)
        </button>
      )}

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      <Button onClick={start} disabled={done || validCheckedIn < 2}>
        {done ? "Session lancée ✓" : "Lancer maintenant"}
      </Button>

      <p className="mt-6 text-xs text-[var(--color-ink-faint)]">
        Check-in : /session/{sessionId}/checkin
      </p>
    </Page>
  );
}
