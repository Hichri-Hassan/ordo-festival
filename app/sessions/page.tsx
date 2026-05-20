"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, Heading, Logo, Page } from "@/components/ui";
import { api, ApiError, getStoredProfileId } from "@/lib/client";

type SessionRow = {
  id: string;
  label: string;
  joined: boolean;
  startsNow?: boolean;
  waveCode: string;
  waveExpiresAt?: number;
  participantCount: number;
  status: string;
  scheduledAt: string;
  demoMode?: boolean;
};

type SessionsMeta = {
  demoMode: boolean;
  roundDurationSec: number;
  totalRounds: number;
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [meta, setMeta] = useState<SessionsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const profileId = getStoredProfileId();
    if (!profileId) {
      router.replace("/onboarding");
      return;
    }
    Promise.all([
      api<{ sessions: SessionRow[] }>(`/api/sessions?profileId=${profileId}`),
      api<SessionsMeta>("/api/config"),
    ])
      .then(([data, config]) => {
        setSessions(data.sessions);
        setMeta(config);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function openSession(session: SessionRow) {
    const wave = session.waveCode;
    if (session.joined) {
      router.push(
        session.startsNow
          ? `/session/${session.id}/checkin?wave=${encodeURIComponent(wave)}`
          : `/session/${session.id}/wait`
      );
      return;
    }
    const profileId = getStoredProfileId();
    if (!profileId) return;
    setJoining(session.id);
    try {
      await api(`/api/sessions/${session.id}/join`, {
        method: "POST",
        body: JSON.stringify({ profileId, wave }),
      });
      router.push(
        session.startsNow
          ? `/session/${session.id}/checkin?wave=${encodeURIComponent(wave)}`
          : `/session/${session.id}/wait`
      );
    } catch (e) {
      if (e instanceof ApiError && e.code === "WAVE_INVALID") {
        window.alert("Ce créneau a renouvelé son code. Reviens à la liste des sessions.");
        window.location.reload();
      }
    } finally {
      setJoining(null);
    }
  }

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <p className="text-[var(--color-ink-muted)] animate-pulse-soft">Chargement…</p>
      </Page>
    );
  }

  const demo = meta?.demoMode ?? false;
  const footer = demo
    ? `${meta?.totalRounds ?? 3} tours · ${Math.round((meta?.roundDurationSec ?? 120) / 60)} min par personne · démarrage immédiat`
    : "~10 min · 5 rotations · 2 min par personne";

  return (
    <Page>
      <Logo size="sm" />
      <DemoBanner />
      <Heading
        sub={
          demo
            ? "Choisis « Maintenant » pour tester tout de suite au stand."
            : "Rejoins un ou plusieurs créneaux. Viens au stand à l'heure indiquée."
        }
      >
        Choisis ta session
      </Heading>

      <div className="space-y-3">
        {sessions.map((s) => (
          <Card
            key={s.id}
            className={`flex items-center justify-between gap-4 ${
              s.startsNow ? "ring-2 ring-[var(--color-ink)] ring-offset-2 ring-offset-[var(--color-cream)]" : ""
            }`}
          >
            <div>
              <p className="text-2xl font-semibold tracking-tight">{s.label}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {s.startsNow && (
                  <span className="font-medium text-[var(--color-ink)]">Démarre immédiatement</span>
                )}
                {s.startsNow && s.participantCount > 0 && (
                  <>
                    {s.startsNow ? " · " : ""}
                    {s.participantCount} inscrit{s.participantCount !== 1 ? "s" : ""}
                  </>
                )}
                {!s.startsNow && (
                  <>
                    {s.participantCount} inscrit{s.participantCount !== 1 ? "s" : ""}
                    {s.joined ? " · tu es inscrit" : ""}
                  </>
                )}
                {s.startsNow && s.joined ? " · tu es inscrit" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSession(s)}
              disabled={joining === s.id}
              className="shrink-0 rounded-xl bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {s.joined ? (s.startsNow ? "Check-in" : "Voir") : s.startsNow ? "Commencer" : "Rejoindre"}
            </button>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)]">{footer}</p>
    </Page>
  );
}
