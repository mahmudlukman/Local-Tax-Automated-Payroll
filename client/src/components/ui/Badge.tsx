import type { ReactNode } from "react";

export type BadgeTone = "outline" | "subtle" | "solid";
export type BadgeVariant =
  | "default"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeVariant, Record<BadgeTone, string>> = {
  default: {
    outline: "border border-neutral-300 text-neutral-700 bg-transparent",
    subtle: "bg-neutral-100 text-neutral-800 border border-neutral-200/60",
    solid: "bg-neutral-900 text-white",
  },
  neutral: {
    outline: "border border-neutral-300 text-neutral-600 bg-transparent",
    subtle: "bg-neutral-100 text-neutral-700 border border-neutral-200/80",
    solid: "bg-neutral-800 text-white",
  },
  success: {
    outline: "border border-emerald-300 text-emerald-700 bg-transparent",
    subtle: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
    solid: "bg-emerald-700 text-white",
  },
  warning: {
    outline: "border border-amber-300 text-amber-700 bg-transparent",
    subtle: "bg-amber-50 text-amber-800 border border-amber-200/80",
    solid: "bg-amber-600 text-white",
  },
  error: {
    outline: "border border-red-300 text-red-700 bg-transparent",
    subtle: "bg-red-50 text-red-700 border border-red-200/70",
    solid: "bg-red-600 text-white",
  },
  info: {
    outline: "border border-sky-300 text-sky-700 bg-transparent",
    subtle: "bg-sky-50 text-sky-700 border border-sky-200/70",
    solid: "bg-sky-600 text-white",
  },
};

const DOT_COLORS: Record<BadgeVariant, Record<BadgeTone, string>> = {
  default: { outline: "bg-neutral-500", subtle: "bg-neutral-500", solid: "bg-neutral-300" },
  neutral: { outline: "bg-neutral-400", subtle: "bg-neutral-500", solid: "bg-neutral-300" },
  success: { outline: "bg-emerald-500", subtle: "bg-emerald-500", solid: "bg-emerald-200" },
  warning: { outline: "bg-amber-500", subtle: "bg-amber-500", solid: "bg-amber-200" },
  error: { outline: "bg-red-500", subtle: "bg-red-500", solid: "bg-red-200" },
  info: { outline: "bg-sky-500", subtle: "bg-sky-500", solid: "bg-sky-200" },
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1 font-medium",
  md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
};

/**
 * Premium Status Badge Component
 * Supports outline, subtle, and solid fill weights with optional dot indicators,
 * custom icons, and semantic colors.
 */
export default function Badge({
  tone = "outline",
  variant = "default",
  size = "sm",
  dot = false,
  icon,
  children,
  className = "",
}: BadgeProps) {
  const toneStyle = TONE_CLASSES[variant]?.[tone] ?? TONE_CLASSES.default.outline;
  const dotColor = DOT_COLORS[variant]?.[tone] ?? "bg-neutral-400";
  const sizeStyle = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full tracking-tight transition-colors ${sizeStyle} ${toneStyle} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}