import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      style: {
        background: '#22c55e',
        color: '#ffffff',
        border: '1px solid #16a34a',
      },
    });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      style: {
        background: '#ef4444',
        color: '#ffffff',
        border: '1px solid #dc2626',
      },
    });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      style: {
        background: '#eab308',
        color: '#ffffff',
        border: '1px solid #ca8a04',
      },
    });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      style: {
        background: '#3b82f6',
        color: '#ffffff',
        border: '1px solid #1d4ed8',
      },
    });
  },
};
