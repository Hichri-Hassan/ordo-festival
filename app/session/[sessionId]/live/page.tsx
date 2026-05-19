"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Heading, Logo, Page, Tag, TimerRing } from "@/components/ui";
import { api, getStoredProfileId } from "@/lib/client";

type PartnerPayload = {
  partner: {
    firstName: string;
    studyYear: string;
    interests: string[];
    lookingFor: string[];
  } | null;
  sharedInterests: string[];
  icebreaker: string;
  round: number;
  totalRounds: number;
  roundEndsAt: number | null;
  roundDurationSec?: number;
  status: string;
};

export default function LivePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PartnerPayload | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [transitioning, setTransitioning] = useState(false);
  const [total, setTotal] = useState(120);

  useEffect(() => {
    const profileId = getStoredProfileId();
    if (!profileId) {
      router.replace("/onboarding");
      return;
    }

    const load = () =>
      api<PartnerPayload>(
        `/api/sessions/${sessionId}/partner?profileId=${profileId}`
      ).then((d) => {
        if (d.status === "ended") {
          router.replace(`/session/${sessionId}/done`);
          return;
        }
        if (d.status === "waiting") {
          router.replace(`/session/${sessionId}/wait`);
          return;
        }
        setData(d);
        setTransitioning(false);
        if (d.roundDurationSec) setTotal(d.roundDurationSec);
        if (d.roundEndsAt) {
          setSecondsLeft(Math.max(0, Math.ceil((d.roundEndsAt - Date.now()) / 1000)));
        }
      });

    load();
    const poll = setInterval(load, 2000);
    return () => clearInterval(poll);
  }, [sessionId, router]);

  useEffect(() => {
    if (!data?.roundEndsAt) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((data.roundEndsAt! - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) setTransitioning(true);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [data?.roundEndsAt, data?.round]);

  if (!data?.partner) {
    return (
      <Page className="flex flex-col items-center justify-center text-center">
        <Logo />
        <p className="mt-4 text-[var(--color-ink-muted)] animate-pulse-soft">
          En attente d&apos;un partenaire…
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-faint)]">
          Assure-toi d&apos;être au moins 2 au stand
        </p>
      </Page>
    );
  }

  if (transitioning && secondsLeft === 0) {
    return (
      <Page className="flex flex-col items-center justify-center text-center">
        <Heading sub="Ton prochain partenaire arrive">Change de partenaire</Heading>
        <p className="animate-pulse-soft text-4xl">↻</p>
      </Page>
    );
  }

  const { partner, sharedInterests, icebreaker, round, totalRounds } = data;

  return (
    <Page>
      <div className="mb-4 flex items-center justify-between">
        <Logo size="sm" />
        <span className="text-sm text-[var(--color-ink-muted)]">
          Tour {round}/{totalRounds}
        </span>
      </div>

      <Card className="mb-6 text-center">
        <p className="text-sm text-[var(--color-ink-faint)]">Tu parles avec</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">{partner.firstName}</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{partner.studyYear}</p>
      </Card>

      {sharedInterests.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">En commun</p>
          <div className="flex flex-wrap gap-2">
            {sharedInterests.map((i) => (
              <Tag key={i}>{i}</Tag>
            ))}
          </div>
        </div>
      )}

      <Card className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-ink-faint)]">
          Brise-glace
        </p>
        <p className="mt-2 text-lg leading-snug font-medium">{icebreaker}</p>
      </Card>

      <TimerRing seconds={secondsLeft} total={total} />

      <p className="mt-8 text-center text-sm text-[var(--color-ink-faint)]">
        {total >= 60 ? `${total / 60} min` : `${total} sec`} — puis nouveau partenaire
      </p>
    </Page>
  );
}
