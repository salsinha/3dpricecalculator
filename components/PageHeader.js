export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <div className="w-full shrink-0 sm:w-auto [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
