import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (toastId: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

let toastCount = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastProps: Omit<Toast, 'id'>) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      ...toastProps,
      id,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toastProps.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const variant = type === 'error' ? 'destructive' : 
                   type === 'success' ? 'success' : 
                   type === 'warning' ? 'warning' : 'default';
    
    toast({
      description: message,
      variant,
      duration: 5000,
    });
  }, [toast]);

  return {
    toasts,
    toast,
    dismiss,
    showToast,
  };
};
