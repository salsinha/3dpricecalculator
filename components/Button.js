import Link from "next/link";
import { cx } from "@/lib/classNames";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  secondary: "border border-line bg-white text-ink hover:bg-zinc-50",
  ghost: "text-ink hover:bg-black/[0.04]",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  const classes = cx(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
