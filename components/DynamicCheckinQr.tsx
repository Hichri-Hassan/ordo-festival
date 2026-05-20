"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Card } from "@/components/ui";

type Props = {
  sessionId: string;
  title: string;
  sub?: string;
  forDevice?: string;
};

export function DynamicCheckinQr({ sessionId, title, sub, forDevice }: Props) {
  const [base, setBase] = useState("");
  const [waveCode, setWaveCode] = useState<string | null>(null);
  const [waveExpiresAt, setWaveExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    setBase(window.location.origin);
  }, []);

  useEffect(() => {
    if (!base) return;
    const load = () =>
      fetch(`/api/sessions/${sessionId}`)
        .then((r) => r.json())
        .then((d: { waveCode?: string; waveExpiresAt?: number }) => {
          if (d.waveCode) setWaveCode(d.waveCode);
          if (d.waveExpiresAt) setWaveExpiresAt(d.waveExpiresAt);
        })
        .catch(() => {});

    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [base, sessionId]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const url =
    base && waveCode
      ? `${base}/session/${sessionId}/checkin?wave=${encodeURIComponent(waveCode)}`
      : "";

  const leftSec =
    waveExpiresAt != null ? Math.max(0, Math.ceil((waveExpiresAt - Date.now()) / 1000)) : 0;
  const m = Math.floor(leftSec / 60);
  const s = leftSec % 60;
  void tick;

  return (
    <Card className="flex flex-col items-center text-center print:break-inside-avoid">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-ink-faint)]">
        {forDevice ?? "QR"} · se met à jour tout seul
      </p>
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{sub}</p>}
      {waveExpiresAt != null && (
        <p className="mt-2 text-xs tabular-nums text-[var(--color-ink)]">
          Prochain renouvellement dans {m}:{s.toString().padStart(2, "0")}
        </p>
      )}
      <div className="my-4 rounded-xl bg-white p-3">
        {url ? (
          <QRCode value={url} size={160} level="M" />
        ) : (
          <div className="flex h-[160px] w-[160px] items-center justify-center text-xs text-[var(--color-ink-muted)]">
            Chargement…
          </div>
        )}
      </div>
      {url && (
        <p className="max-w-full break-all text-[10px] text-[var(--color-ink-faint)]">{url}</p>
      )}
    </Card>
  );
}
