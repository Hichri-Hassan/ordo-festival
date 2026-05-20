"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { DemoBanner } from "@/components/DemoBanner";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";
import { api, ApiError } from "@/lib/client";

type SessionSnap = {
  validCheckedIn: number;
  waveCode: string;
  waveExpiresAt: number;
};

export default function HostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [done, setDone] = useState(false);
  const [roundSec, setRoundSec] = useState(120);
  const [demoMode, setDemoMode] = useState(false);
  const [snap, setSnap] = useState<SessionSnap | null>(null);
  const [base, setBase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const label = sessionId === "now" ? "Maintenant" : sessionId.replace("-", ":");

  useEffect(() => {
    setBase(window.location.origin);
  }, []);

  const refresh = useCallback(() => {
    api<SessionSnap>(`/api/sessions/${sessionId}`).then((s) =>
      setSnap({
        validCheckedIn: s.validCheckedIn ?? 0,
        waveCode: s.waveCode,
        waveExpiresAt: s.waveExpiresAt,
      })
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

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  async function start() {
    setError(null);
    try {
      await api(`/api/sessions/${sessionId}/start`, { method: "POST" });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === "NEED_TWO") {
        setError(
          `Seulement ${snap?.validCheckedIn ?? 0} personne(s) avec le bon QR. Chaque téléphone doit faire onboarding puis scanner le QR affiché ici.`
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

  const checkInUrl =
    base && snap?.waveCode
      ? `${base}/session/${sessionId}/checkin?wave=${encodeURIComponent(snap.waveCode)}`
      : "";

  const leftSec =
    snap?.waveExpiresAt != null
      ? Math.max(0, Math.ceil((snap.waveExpiresAt - Date.now()) / 1000))
      : 0;
  const m = Math.floor(leftSec / 60);
  const s = leftSec % 60;
  void tick;

  const validCheckedIn = snap?.validCheckedIn ?? 0;

  return (
    <Page className="text-center">
      <Logo />
      <DemoBanner />
      <Heading sub={`Session ${label} · mode hôte`}>Démarrer la session</Heading>

      <Card className="mb-4 text-left">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-[var(--color-ink-faint)]">
          QR check-in (affiche grand pour les étudiants)
        </p>
        {snap?.waveExpiresAt != null && (
          <p className="mt-2 text-center text-sm tabular-nums text-[var(--color-ink)]">
            Nouveau QR dans {m}:{s.toString().padStart(2, "0")}
          </p>
        )}
        <div className="mt-4 flex justify-center">
          {checkInUrl ? (
            <div className="rounded-xl bg-white p-4">
              <QRCode value={checkInUrl} size={200} level="M" />
            </div>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)]">Chargement du QR…</p>
          )}
        </div>
        {checkInUrl && (
          <p className="mt-3 break-all text-center text-[10px] text-[var(--color-ink-faint)]">
            {checkInUrl}
          </p>
        )}
      </Card>

      <Card className="mb-4 text-left">
        <p className="text-center text-3xl font-semibold tabular-nums">{validCheckedIn}</p>
        <p className="mt-1 text-center text-sm font-medium text-[var(--color-ink)]">
          check-in actifs (bon code vague)
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">
          Le code dans l&apos;URL change automatiquement — les anciens liens ne comptent plus. Code
          actuel : <strong className="text-[var(--color-ink)]">{snap?.waveCode ?? "…"}</strong>
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
          Vider cette session (tests)
        </button>
      )}

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      <Button onClick={start} disabled={done || validCheckedIn < 2}>
        {done ? "Session lancée ✓" : "Lancer maintenant"}
      </Button>
    </Page>
  );
}
