import toast from 'react-hot-toast';

// Unificación de sistema de toasts: redirige a react-hot-toast
export const useToast = () => {
  const addToast = (message, type = 'info', duration = 5000) => {
    const opts = { duration };
    switch (type) {
      case 'success':
        toast.success(message, opts);
        break;
      case 'error':
        toast.error(message, opts);
        break;
      case 'warning':
        toast(message, { ...opts, icon: '⚠️' });
        break;
      default:
        toast(message, opts);
    }
  };

  const success = (message, duration) => toast.success(message, { duration });
  const error = (message, duration) => toast.error(message, { duration });
  const warning = (message, duration) => toast(message, { duration, icon: '⚠️' });
  const info = (message, duration) => toast(message, { duration });

  return { addToast, success, error, warning, info };
};

// Provider sin UI, solo pasa children; ya no renderiza contenedor propio
export const ToastProvider = ({ children }) => children;

// No exportamos default; los consumidores usan useToast/ToastProvider
