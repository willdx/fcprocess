import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      className={clsx(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg transition-all duration-300 pointer-events-none",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <CheckCircle2 size={16} className="text-emerald-400" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Toast;