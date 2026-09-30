export default function Loading({ label = "A carregar..." }) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}
    </div>
  );
}
