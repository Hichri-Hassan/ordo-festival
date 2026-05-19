"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";
import { api, getStoredProfileId } from "@/lib/client";

type SessionInfo = {
  sessionId: string;
  status: string;
  scheduledAt: string;
  checkedInCount: number;
  participantCount: number;
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function WaitPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const profileId = getStoredProfileId();
    if (!profileId) {
      router.replace("/onboarding");
      return;
    }

    const poll = () =>
      api<SessionInfo>(`/api/sessions/${sessionId}`).then((data) => {
        setInfo(data);
        if (data.status === "live") {
          router.replace(`/session/${sessionId}/live`);
        }
        if (data.status === "ended") {
          router.replace(`/session/${sessionId}/done`);
        }
      });

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [sessionId, router]);

  useEffect(() => {
    if (!info) return;
    const tick = () => {
      const diff = new Date(info.scheduledAt).getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [info]);

  const label = sessionId.replace("-", ":");

  return (
    <Page className="text-center">
      <Logo size="sm" />
      <Heading sub={`Session ${label}`}>On t'attend au stand</Heading>

      <Card className="mb-6 py-10">
        <p className="text-sm uppercase tracking-widest text-[var(--color-ink-faint)]">
          Début dans
        </p>
        <p className="mt-2 text-5xl font-semibold tabular-nums tracking-tight">{countdown}</p>
        {info && (
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            {info.checkedInCount} présent{info.checkedInCount !== 1 ? "s" : ""} au stand ·{" "}
            {info.participantCount} inscrit{info.participantCount !== 1 ? "s" : ""}
          </p>
        )}
      </Card>

      <p className="mb-6 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Quand la session commence, scanne le QR code affiché au stand pour être matché avec ton
        premier partenaire.
      </p>

      <Button href={`/session/${sessionId}/checkin`}>J&apos;arrive au stand — scanner</Button>
    </Page>
  );
}
