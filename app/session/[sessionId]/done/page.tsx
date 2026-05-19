"use client";

import { useParams } from "next/navigation";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";

export default function DonePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const label = sessionId.replace("-", ":");

  return (
    <Page className="text-center">
      <Logo />
      <Heading sub={`Session ${label} terminée`}>Merci d&apos;avoir participé</Heading>

      <Card className="mb-8">
        <p className="text-base leading-relaxed text-[var(--color-ink-muted)]">
          Tu as rencontré 5 personnes en 10 minutes. Continue à explorer le campus avec Ordo.
        </p>
      </Card>

      <Button href="/networking">Retour</Button>
    </Page>
  );
}
