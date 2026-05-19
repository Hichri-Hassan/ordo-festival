import { DemoBanner } from "@/components/DemoBanner";
import { Button, Card, Heading, Logo, Page } from "@/components/ui";

export default function NetworkingLandingPage() {
  return (
    <Page className="flex flex-col justify-center">
      <Logo />
      <DemoBanner />
      <Heading
        sub={
          <>
            Qu&apos;est-ce qu&apos;il manque à votre campus ?
            <br />
            Rencontrez d&apos;autres étudiants en 10 minutes — pour de vrai.
          </>
        }
      >
        Networking campus
      </Heading>

      <Card className="mb-6 space-y-3">
        <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
          5 conversations · 2 minutes chacune · nouveaux partenaires à chaque tour
        </p>
        <ul className="space-y-2 text-sm text-[var(--color-ink)]">
          <li className="flex gap-2">
            <span className="text-[var(--color-ink-faint)]">1</span>
            Crée ton profil en 30 secondes
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-ink-faint)]">2</span>
            Choisis un créneau
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-ink-faint)]">3</span>
            Viens au stand, scanne le QR de ta session
          </li>
        </ul>
      </Card>

      <Button href="/onboarding">Commencer</Button>
      <p className="mt-6 text-center text-xs text-[var(--color-ink-faint)]">
        Ordo · Pépite Festival
      </p>
    </Page>
  );
}
