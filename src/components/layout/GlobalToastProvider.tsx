'use client';

import { ToastContainer } from '@/components/ui/UI';
import { useGlobalToast } from '@/hooks/useGlobalToast';

export function GlobalToastProvider() {
  const { toasts, removeToast } = useGlobalToast();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}
