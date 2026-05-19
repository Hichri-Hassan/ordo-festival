"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heading, Logo, Page } from "@/components/ui";
import {
  api,
  clearStoredProfileId,
  getStoredProfileId,
  isProfileNotFound,
  setReturnAfterOnboarding,
} from "@/lib/client";

export default function CheckinPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const profileId = getStoredProfileId();
    if (!profileId) {
      setReturnAfterOnboarding(`/session/${sessionId}/checkin`);
      router.replace("/onboarding");
      return;
    }

    api<{ status: string }>(`/api/sessions/${sessionId}/checkin`, {
      method: "POST",
      body: JSON.stringify({ profileId }),
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
          setReturnAfterOnboarding(`/session/${sessionId}/checkin`);
          router.replace("/onboarding");
          return;
        }
        setStatus("error");
      });
  }, [sessionId, router]);

  return (
    <Page className="flex flex-col items-center justify-center text-center">
      <Logo />
      <Heading>
        {status === "loading" && "Check-in…"}
        {status === "ok" && "Bienvenue !"}
        {status === "error" && "Erreur de check-in"}
      </Heading>
      {status === "loading" && (
        <p className="animate-pulse-soft text-[var(--color-ink-muted)]">Connexion à la session</p>
      )}
    </Page>
  );
}
