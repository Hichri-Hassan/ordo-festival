"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, Heading, Logo, Page } from "@/components/ui";

type QrItem = {
  title: string;
  sub?: string;
  path: string;
  forDevice?: string;
};

const QR_ITEMS: QrItem[] = [
  {
    title: "Stand — Entrée",
    sub: "À afficher sur le panneau principal",
    path: "/networking",
    forDevice: "QR grand format",
  },
  {
    title: "Session Maintenant — Check-in",
    sub: "Les étudiants scannent en arrivant au stand",
    path: "/session/now/checkin",
    forDevice: "Téléphones",
  },
  {
    title: "Session Maintenant — Hôte",
    sub: "Ouvre sur l'iPad, ne pas scanner en QR (bookmark)",
    path: "/session/now/host",
    forDevice: "iPad (favori)",
  },
  {
    title: "Check-in 14:00",
    sub: "Créneau festival",
    path: "/session/14-00/checkin",
  },
  {
    title: "Hôte 14:00",
    sub: "iPad créneau 14h",
    path: "/session/14-00/host",
  },
  {
    title: "Check-in 15:00",
    path: "/session/15-00/checkin",
  },
  {
    title: "Check-in 16:00",
    path: "/session/16-00/checkin",
  },
  {
    title: "Check-in 17:00",
    path: "/session/17-00/checkin",
  },
];

function QrCard({ title, sub, url, forDevice }: QrItem & { url: string }) {
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

      <Heading sub="Tous les QR du stand — générés automatiquement depuis ton URL.">
        QR codes Ordo
      </Heading>

      {!base ? (
        <p className="text-[var(--color-ink-muted)]">Chargement…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {QR_ITEMS.map((item) => (
            <QrCard key={item.path} {...item} url={`${base}${item.path}`} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--color-ink-faint)] print:hidden">
        Ouvre cette page sur ton Mac : <strong>/stand</strong> — les QR utilisent toujours la bonne
        URL Railway.
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
