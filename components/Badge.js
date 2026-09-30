import { cx } from "@/lib/classNames";

const tones = {
  neutral: "bg-zinc-100 text-zinc-700",
  accent: "bg-orange-50 text-accent",
  dark: "bg-ink text-white",
  warning: "bg-amber-50 text-amber-800",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
