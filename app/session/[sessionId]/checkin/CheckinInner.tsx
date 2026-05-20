"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Heading, Logo, Page } from "@/components/ui";
import {
  api,
  ApiError,
  clearStoredProfileId,
  getStoredProfileId,
  isProfileNotFound,
  setReturnAfterOnboarding,
} from "@/lib/client";

export default function CheckinPageInner() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wave = searchParams.get("wave");
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "need_wave">("loading");

  useEffect(() => {
    if (!wave) {
      setStatus("need_wave");
      return;
    }

    const profileId = getStoredProfileId();
    if (!profileId) {
      setReturnAfterOnboarding(`/session/${sessionId}/checkin?wave=${encodeURIComponent(wave)}`);
      router.replace("/onboarding");
      return;
    }

    api<{ status: string }>(`/api/sessions/${sessionId}/checkin`, {
      method: "POST",
      body: JSON.stringify({ profileId, wave }),
    })
      .then((session) => {
        setStatus("ok");
        if (session.status === "live") {
          router.replace(`/session/${sessionId}/live`);
        } else {
          router.replace(`/session/${sessionId}/wait`);
        }
      })
      .catch((e) => {
        if (isProfileNotFound(e)) {
          clearStoredProfileId();
          setReturnAfterOnboarding(`/session/${sessionId}/checkin?wave=${encodeURIComponent(wave)}`);
          router.replace("/onboarding");
          return;
        }
        if (e instanceof ApiError && (e.code === "WAVE_INVALID" || e.code === "SESSION_IN_PROGRESS")) {
          setStatus("error");
          return;
        }
        setStatus("error");
      });
  }, [sessionId, router, wave]);

  if (status === "need_wave") {
    return (
      <Page className="flex flex-col items-center justify-center text-center">
        <Logo />
        <Heading sub="Le code change toutes les quelques minutes">Scanne le QR au stand</Heading>
        <Card className="mt-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Le check-in utilise un lien avec un code unique affiché sur l&apos;iPad hôte. Les anciens QR
          ou liens ne fonctionnent plus après renouvellement.
        </Card>
      </Page>
    );
  }

  return (
    <Page className="flex flex-col items-center justify-center text-center">
      <Logo />
      <Heading>
        {status === "loading" && "Check-in…"}
        {status === "ok" && "Bienvenue !"}
        {status === "error" && "Lien expiré ou invalide"}
      </Heading>
      {status === "loading" && (
        <p className="animate-pulse-soft text-[var(--color-ink-muted)]">Connexion à la session</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
          Retourne au stand et scanne le <strong>nouveau</strong> QR code check-in.
        </p>
      )}
    </Page>
  );
}
