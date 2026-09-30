export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <div className="mb-4 h-10 w-10 rounded-full bg-orange-50" />
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? (
        <div className="mt-5 w-full max-w-xs [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
