"use client";

type PillVariant = "default" | "language" | "tool";

interface TechPillProps {
  label: string;
  variant?: PillVariant;
}

/**
 * Tech stack markers. Variants follow DESIGN.md: green for frameworks/tools,
 * violet for languages. Solid pills use dark ink for AA contrast.
 */
export function TechPill({ label, variant = "default" }: TechPillProps) {
  const variants: Record<PillVariant, string> = {
    default: "bg-primary/10 text-primary border border-primary/20",
    language: "bg-secondary text-secondary-ink",
    tool: "bg-primary text-primary-ink",
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
