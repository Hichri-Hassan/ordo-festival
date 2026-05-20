"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { DemoBanner } from "@/components/DemoBanner";
import { DynamicCheckinQr } from "@/components/DynamicCheckinQr";
import { Card, Heading, Logo, Page } from "@/components/ui";

type QrItem = {
  title: string;
  sub?: string;
  path: string;
  forDevice?: string;
};

const STATIC_QR_ITEMS: QrItem[] = [
  {
    title: "Stand — Entrée",
    sub: "À afficher sur le panneau principal",
    path: "/networking",
    forDevice: "QR grand format",
  },
  {
    title: "Session Maintenant — Hôte",
    sub: "Ouvre sur l'iPad (favori) — le QR check-in est sur cette page",
    path: "/session/now/host",
    forDevice: "iPad (favori)",
  },
  {
    title: "Hôte 14:00",
    sub: "iPad créneau 14h",
    path: "/session/14-00/host",
    forDevice: "iPad",
  },
];

const CHECKIN_SESSIONS: { id: string; title: string; sub?: string; forDevice?: string }[] = [
  { id: "now", title: "Session Maintenant — Check-in", sub: "QR affiché aussi sur l’iPad hôte", forDevice: "Téléphones" },
  { id: "14-00", title: "Check-in 14:00", sub: "Créneau festival" },
  { id: "15-00", title: "Check-in 15:00" },
  { id: "16-00", title: "Check-in 16:00" },
  { id: "17-00", title: "Check-in 17:00" },
];

function StaticQrCard({ title, sub, url, forDevice }: QrItem & { url: string }) {
  return (
    <Card className="flex flex-col items-center text-center print:break-inside-avoid">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-ink-faint)]">
        {forDevice ?? "QR"}
      </p>
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{sub}</p>}
      <div className="my-4 rounded-xl bg-white p-3">
        <QRCode value={url} size={160} level="M" />
      </div>
      <p className="max-w-full break-all text-[10px] text-[var(--color-ink-faint)]">{url}</p>
    </Card>
  );
}

export default function StandPage() {
  const [base, setBase] = useState("");

  useEffect(() => {
    setBase(window.location.origin);
  }, []);

  return (
    <Page className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium"
        >
          Imprimer
        </button>
      </div>

      <DemoBanner />

      <Heading sub="Les QR check-in incluent un code qui change — garde cette page ouverte ou utilise l’iPad hôte.">
        QR codes Ordo
      </Heading>

      {!base ? (
        <p className="text-[var(--color-ink-muted)]">Chargement…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {STATIC_QR_ITEMS.map((item) => (
            <StaticQrCard key={item.path} {...item} url={`${base}${item.path}`} />
          ))}
          {CHECKIN_SESSIONS.map((c) => (
            <DynamicCheckinQr key={c.id} sessionId={c.id} {...c} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)] print:hidden">
        Ouvre <strong>/stand</strong> sur ton Mac — les QR check-in se mettent à jour quand la vague
        change.
      </p>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          main {
            max-width: 100% !important;
          }
        }
      `}</style>
    </Page>
  );
}
