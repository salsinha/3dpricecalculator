import { cx } from "@/lib/classNames";

export default function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  className = "",
  id,
  ...props
}) {
  const selectId = id || props.name;

  return (
    <label className="block" htmlFor={selectId}>
      {label ? <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span> : null}
      <select
        id={selectId}
        className={cx(
          "w-full rounded-xl border bg-white px-3 py-3 text-base text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:py-2.5 sm:text-sm",
          error ? "border-red-400" : "border-line",
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
