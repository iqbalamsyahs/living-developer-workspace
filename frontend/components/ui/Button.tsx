"use client";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Shared button. Shape lock: interactive elements are `rounded-sm` (6px) per
 * DESIGN.md. Solid variants use dark ink on the accent color so the label
 * clears WCAG AA (white on #10b981 and #8b5cf6 both fail).
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-primary text-primary-ink font-medium hover:bg-primary/90 active:translate-y-[1px]",
    outline:
      "border border-primary/60 text-primary font-medium hover:bg-primary hover:text-primary-ink active:translate-y-[1px]",
    ghost:
      "text-text-secondary font-medium hover:text-text-primary hover:bg-surface",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
}
