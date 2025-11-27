import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, variant, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Trigger entry animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation to finish before removing from DOM
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (variant) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
      case 'info': default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getStyles = () => {
    switch (variant) {
      case 'success': return 'bg-white border-green-200 text-green-900';
      case 'error': return 'bg-white border-red-200 text-red-900';
      case 'warning': return 'bg-white border-orange-200 text-orange-900';
      case 'info': default: return 'bg-white border-blue-200 text-blue-900';
    }
  };

  const animationClass = shouldReduceMotion 
    ? (isVisible ? 'opacity-100' : 'opacity-0')
    : (isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0');

  return (
    <div 
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-sm w-full
        ${getStyles()}
        ${animationClass}
      `}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button 
        onClick={handleClose} 
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;