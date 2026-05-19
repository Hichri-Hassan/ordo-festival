"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";
import { api } from "@/lib/client";

/** Page for stand staff — force-start a session (pin on iPad at stand) */
export default function HostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [done, setDone] = useState(false);
  const [roundSec, setRoundSec] = useState(120);
  const label = sessionId === "now" ? "Maintenant" : sessionId.replace("-", ":");

  useEffect(() => {
    api<{ roundDurationSec: number }>("/api/config").then((c) =>
      setRoundSec(c.roundDurationSec)
    );
  }, []);

  async function start() {
    await api(`/api/sessions/${sessionId}/start`, { method: "POST" });
    setDone(true);
  }

  return (
    <Page className="text-center">
      <Logo />
      <DemoBanner />
      <Heading sub={`Session ${label} · mode hôte`}>Démarrer la session</Heading>

      <Card className="mb-6">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Quand les participants sont prêts, lance la session. Tours de {roundSec} secondes.
        </p>
      </Card>

      <Button onClick={start} disabled={done}>
        {done ? "Session lancée ✓" : "Lancer maintenant"}
      </Button>

      <p className="mt-6 text-xs text-[var(--color-ink-faint)]">
        QR check-in : /session/{sessionId}/checkin
      </p>
    </Page>
  );
}
