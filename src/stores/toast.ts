import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    show: (toast: Omit<Toast, 'id'>) => {
      const id = Date.now().toString();
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration || 3000
      };

      update(toasts => [...toasts, newToast]);

      // Auto remove after duration
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, newToast.duration);

      return id;
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const toastStore = createToastStore();

// Helper functions
export const showToast = {
  success: (message: string) => toastStore.show({ type: 'success', message }),
  error: (message: string) => toastStore.show({ type: 'error', message }),
  info: (message: string) => toastStore.show({ type: 'info', message }),
  warning: (message: string) => toastStore.show({ type: 'warning', message })
};
