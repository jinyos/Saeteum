'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/40 px-6"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title ?? message}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-xs flex-col gap-8 rounded-md border-2 border-ink-primary bg-white px-6 py-10 text-center filter-[url(#hand-rough)]"
      >
        {title && <p className="font-bold text-ink-primary">{title}</p>}
        <p className="whitespace-pre-line text-ink-primary">{message}</p>
        <div className="flex justify-center gap-6">
          <Button autoFocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button color={danger ? 'red' : undefined} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
