"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => push({ type: "success", message }),
      error: (message) => push({ type: "error", message }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 left-4 z-[70] flex flex-col gap-2 sm:left-auto sm:w-[22rem] lg:top-auto lg:bottom-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.type === "error"
                ? "border-red-200 bg-white text-red-700"
                : "border-line bg-ink text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast tem de ser usado dentro da aplicação.");
  }
  return context;
}
