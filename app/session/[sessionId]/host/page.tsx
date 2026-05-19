"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";
import { api } from "@/lib/client";

/** Page for stand staff — force-start a session (pin on iPad at stand) */
export default function HostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [done, setDone] = useState(false);
  const label = sessionId.replace("-", ":");

  async function start() {
    await api(`/api/sessions/${sessionId}/start`, { method: "POST" });
    setDone(true);
  }

  return (
    <Page className="text-center">
      <Logo />
      <Heading sub={`Session ${label} · mode hôte`}>Démarrer la session</Heading>

      <Card className="mb-6">
        <p className="text-sm text-[var(--color-ink-muted)]">
          À utiliser au stand quand les participants sont prêts. Lance les 5 rotations de 2
          minutes.
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
