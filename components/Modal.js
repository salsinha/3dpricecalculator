"use client";

import { useEffect } from "react";

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  wide = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function onKey(event) {
      if (event.key === "Escape") onClose();
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[92vh] sm:rounded-2xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-5 sm:pb-4 [&_button]:w-full sm:[&_button]:w-auto">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
