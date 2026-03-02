import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import Toast from '@/components/Toast'

interface ToastMessage {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastContextType {
  showToast: (message: ToastMessage) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showToast = useCallback(({ message, type, duration = 4000 }: ToastMessage) => {
    setToast({ message, type, duration })
    setIsVisible(true)
  }, [])

  const success = useCallback((message: string, duration = 4000) => {
    showToast({ message, type: 'success', duration })
  }, [showToast])

  const error = useCallback((message: string, duration = 5000) => {
    showToast({ message, type: 'error', duration })
  }, [showToast])

  const info = useCallback((message: string, duration = 4000) => {
    showToast({ message, type: 'info', duration })
  }, [showToast])

  const contextValue = useMemo(() => ({
    showToast,
    success,
    error,
    info
  }), [showToast, success, error, info])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
          duration={toast.duration}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
