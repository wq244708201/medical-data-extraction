'use client';
import React, { createContext, useContext, useState } from 'react';
import Toast from '/src/components/ui/toast';

// 创建 Context
export const ToastContext = createContext({
  showToast: () => {},
});

// Provider 组件
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
  });

  // 显示 toast 的方法
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    // 3秒后自动关闭
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      )}
    </ToastContext.Provider>
  );
}

// 自定义 Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
