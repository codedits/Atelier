import React, { createContext, useContext, useState } from 'react'
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

  const showToast = ({ message, type, duration = 4000 }: ToastMessage) => {
    setToast({ message, type, duration })
    setIsVisible(true)
  }

  const success = (message: string, duration = 4000) => {
    showToast({ message, type: 'success', duration })
  }

  const error = (message: string, duration = 5000) => {
    showToast({ message, type: 'error', duration })
  }

  const info = (message: string, duration = 4000) => {
    showToast({ message, type: 'info', duration })
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
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
