import React from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-toast flex w-full max-w-sm flex-col gap-3 p-6">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
