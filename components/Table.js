export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
            {columns.map((column) => (
              <th
                key={column.key || column}
                className={`px-4 py-3 font-medium ${column.align === "right" ? "text-right" : "text-left"}`}
              >
                {typeof column === "string" ? column : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, align = "left", className = "" }) {
  return (
    <td className={`px-4 py-3 text-ink ${align === "right" ? "text-right tabular-nums" : ""} ${className}`}>
      {children}
    </td>
  );
}
