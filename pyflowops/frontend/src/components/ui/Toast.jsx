import toast from 'react-hot-toast';
import { X } from 'lucide-react';

// Componente personalizado para toasts con botón de cerrar
const ToastContent = ({ message, toastId }) => (
  <div className="flex items-center justify-between gap-3 w-full">
    <span className="flex-1">{message}</span>
    <button
      onClick={() => toast.dismiss(toastId)}
      className="flex-shrink-0 p-0.5 hover:opacity-75 transition-opacity"
      aria-label="Cerrar notificación"
    >
      <X size={18} />
    </button>
  </div>
);

// Unificación de sistema de toasts: redirige a react-hot-toast con botón de cerrar
export const useToast = () => {
  const addToast = (message, type = 'info', duration = 5000) => {
    const opts = { duration };
    switch (type) {
      case 'success':
        return toast.success((t) => <ToastContent message={message} toastId={t.id} />, opts);
      case 'error':
        return toast.error((t) => <ToastContent message={message} toastId={t.id} />, opts);
      case 'warning':
        return toast((t) => <ToastContent message={message} toastId={t.id} />, { ...opts, icon: '⚠️' });
      default:
        return toast((t) => <ToastContent message={message} toastId={t.id} />, opts);
    }
  };

  const success = (message, duration) => 
    toast.success((t) => <ToastContent message={message} toastId={t.id} />, { duration });
  
  const error = (message, duration) => 
    toast.error((t) => <ToastContent message={message} toastId={t.id} />, { duration });
  
  const warning = (message, duration) => 
    toast((t) => <ToastContent message={message} toastId={t.id} />, { duration, icon: '⚠️' });
  
  const info = (message, duration) => 
    toast((t) => <ToastContent message={message} toastId={t.id} />, { duration });

  return { addToast, success, error, warning, info };
};

// Provider sin UI, solo pasa children; ya no renderiza contenedor propio
export const ToastProvider = ({ children }) => children;

// No exportamos default; los consumidores usan useToast/ToastProvider
