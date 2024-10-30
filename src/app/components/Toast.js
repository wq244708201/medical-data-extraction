'use client';
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border ${backgrounds[type]} shadow-lg max-w-md animate-fade-in`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 mr-4 text-sm font-medium text-gray-800">
        {message}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-auto text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
