export const NAV = [
  { href: "/dashboard", label: "Painel", mobileLabel: "Painel", icon: "grid" },
  { href: "/pecas", label: "Peças", mobileLabel: "Peças", icon: "box" },
  { href: "/filamentos", label: "Filamentos", mobileLabel: "Filamentos", icon: "spool" },
  { href: "/calculadora", label: "Calculadora", mobileLabel: "Cálculo", icon: "calc" },
  { href: "/configuracoes", label: "Configurações", mobileLabel: "Config", icon: "settings" },
];

export function NavIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "grid") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (name === "box") {
    return (
      <svg {...common}>
        <path d="M3 8l9-4 9 4-9 4-9-4z" />
        <path d="M3 8v8l9 4 9-4V8" />
        <path d="M12 12v8" />
      </svg>
    );
  }
  if (name === "spool") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
        <path d="M12 3v6M12 15v6" />
      </svg>
    );
  }
  if (name === "calc") {
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </svg>
  );
}
