import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`mx-auto min-h-dvh max-w-lg px-5 py-8 pb-12 ${className}`}>{children}</main>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[0_2px_24px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const text = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className={`font-semibold tracking-tight text-[var(--color-ink)] ${text}`}>
      ordo
    </span>
  );
}

export function Heading({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--color-ink)]">
        {children}
      </h1>
      {sub && (
        <p className="mt-2 text-base leading-relaxed text-[var(--color-ink-muted)]">{sub}</p>
      )}
    </header>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-base font-medium transition active:scale-[0.98] disabled:opacity-40";
  const styles = {
    primary: "bg-[var(--color-ink)] text-white",
    secondary:
      "border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink)]",
    ghost: "text-[var(--color-ink-muted)] underline-offset-4 hover:underline",
  };

  const cls = `${base} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-sm transition ${
        selected
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--color-cream-dark)] px-3 py-1 text-sm text-[var(--color-ink)]">
      {children}
    </span>
  );
}

export function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = Math.max(0, Math.min(1, seconds / total));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - pct);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="var(--color-cream-dark)"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="text-3xl font-semibold tabular-nums tracking-tight">
        {m}:{s.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

