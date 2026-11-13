"use client";

type PillVariant = "default" | "language" | "tool";

interface TechPillProps {
  label: string;
  variant?: PillVariant;
}

/**
 * Tech stack markers: amber tint for frameworks, violet tint for languages,
 * quiet outline for tools. All tinted, so no single pill shouts.
 */
export function TechPill({ label, variant = "default" }: TechPillProps) {
  const variants: Record<PillVariant, string> = {
    default: "bg-primary/10 text-primary border border-primary/20",
    language: "bg-secondary/10 text-secondary border border-secondary/25",
    tool: "text-text-secondary border border-line",
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
