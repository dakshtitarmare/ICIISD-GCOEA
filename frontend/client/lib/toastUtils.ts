import { toast } from 'sonner';

/**
 * Show a success toast notification
 */
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

/**
 * Show an error toast notification
 */
export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 3000,
  });
};

/**
 * Show an info toast notification
 */
export const showInfoToast = (message: string) => {
  toast.info(message, {
    duration: 3000,
  });
};

/**
 * Show a loading toast notification (no auto-dismiss)
 */
export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

/**
 * Dismiss a toast by its ID
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Promise wrapper for async operations
 */
export const showPromiseToast = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};
