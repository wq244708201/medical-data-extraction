'use client';
import React from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all transform 
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
        text-white`}
    >
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
