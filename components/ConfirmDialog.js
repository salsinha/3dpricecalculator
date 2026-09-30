"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-muted">{message}</p>
    </Modal>
  );
}
