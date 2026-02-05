import { toast as sonnerToast, type ExternalToast } from 'sonner';

export const toast = {
  ...sonnerToast,
  success: (message: any, data?: ExternalToast) => {
    return sonnerToast.success(message, {
      className: '!text-white-500',
      icon: '✅',
      duration: 6000,
      ...data,
    });
  },
  error: (message: any, data?: ExternalToast) => {
    return sonnerToast.error(message, {
      className: '!text-red-500',
      icon: '⚠️',
      duration: 6000,
      ...data,
    });
  },
};
