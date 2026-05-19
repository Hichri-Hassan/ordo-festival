"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Heading, Logo, Page } from "@/components/ui";
import { api, getStoredProfileId } from "@/lib/client";

type SessionRow = {
  id: string;
  label: string;
  joined: boolean;
  participantCount: number;
  status: string;
  scheduledAt: string;
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const profileId = getStoredProfileId();
    if (!profileId) {
      router.replace("/onboarding");
      return;
    }
    api<{ sessions: SessionRow[] }>(`/api/sessions?profileId=${profileId}`)
      .then((data) => setSessions(data.sessions))
      .finally(() => setLoading(false));
  }, [router]);

  async function openSession(session: SessionRow) {
    if (session.joined) {
      router.push(`/session/${session.id}/wait`);
      return;
    }
    const profileId = getStoredProfileId();
    if (!profileId) return;
    setJoining(session.id);
    await api(`/api/sessions/${session.id}/join`, {
      method: "POST",
      body: JSON.stringify({ profileId }),
    });
    router.push(`/session/${session.id}/wait`);
  }

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <p className="text-[var(--color-ink-muted)] animate-pulse-soft">Chargement…</p>
      </Page>
    );
  }

  return (
    <Page>
      <Logo size="sm" />
      <Heading sub="Rejoins un ou plusieurs créneaux. Viens au stand à l'heure indiquée.">
        Choisis ta session
      </Heading>

      <div className="space-y-3">
        {sessions.map((s) => (
          <Card key={s.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight">{s.label}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {s.participantCount} inscrit{s.participantCount !== 1 ? "s" : ""}
                {s.joined ? " · tu es inscrit" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSession(s)}
              disabled={joining === s.id}
              className="shrink-0 rounded-xl bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {s.joined ? "Voir" : "Rejoindre"}
            </button>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)]">
        ~10 min · 5 rotations · 2 min par personne
      </p>
    </Page>
  );
}
