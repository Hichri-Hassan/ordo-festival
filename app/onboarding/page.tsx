"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Chip, Heading, Logo, Page } from "@/components/ui";
import { api, setStoredProfileId } from "@/lib/client";
import { INTERESTS, LOOKING_FOR, STUDY_YEARS } from "@/lib/types";
import type { Profile } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(list: string[], set: (v: string[]) => void, item: string) {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !studyYear || interests.length === 0 || lookingFor.length === 0) {
      return;
    }
    setLoading(true);
    try {
      const profile = await api<Profile>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ firstName, studyYear, interests, lookingFor }),
      });
      setStoredProfileId(profile.id);
      router.push("/sessions");
    } catch {
      setLoading(false);
    }
  }

  const valid =
    firstName.trim() && studyYear && interests.length > 0 && lookingFor.length > 0;

  return (
    <Page>
      <Logo size="sm" />
      <Heading sub="30 secondes, promis.">Ton profil</Heading>

      <form onSubmit={submit} className="space-y-6">
        <section>
          <label className="mb-2 block text-sm font-medium">Prénom</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alex"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-base outline-none focus:border-[var(--color-ink)]"
            autoComplete="given-name"
          />
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium">Année d&apos;études</label>
          <div className="flex flex-wrap gap-2">
            {STUDY_YEARS.map((y) => (
              <Chip
                key={y}
                label={y}
                selected={studyYear === y}
                onClick={() => setStudyYear(y)}
              />
            ))}
          </div>
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium">Centres d&apos;intérêt</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <Chip
                key={i}
                label={i}
                selected={interests.includes(i)}
                onClick={() => toggle(interests, setInterests, i)}
              />
            ))}
          </div>
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium">Tu cherches quoi ?</label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR.map((l) => (
              <Chip
                key={l}
                label={l}
                selected={lookingFor.includes(l)}
                onClick={() => toggle(lookingFor, setLookingFor, l)}
              />
            ))}
          </div>
        </section>

        <Button type="submit" disabled={!valid || loading}>
          {loading ? "..." : "Continuer"}
        </Button>
      </form>
    </Page>
  );
}
