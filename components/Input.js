import { cx } from "@/lib/classNames";

export default function Input({ label, hint, error, className = "", id, ...props }) {
  const inputId = id || props.name;

  return (
    <label className="block" htmlFor={inputId}>
      {label ? <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span> : null}
      <input
        id={inputId}
        className={cx(
          "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/20",
          error ? "border-red-400" : "border-line",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
