import { cx } from "@/lib/classNames";

export default function Card({ children, className = "", padded = true }) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-line bg-card shadow-sm",
        padded ? "p-5" : "overflow-hidden",
        className,
      )}
    >
      {children}
    </section>
  );
}
