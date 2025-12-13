import { useCallback, useRef } from 'react'

/**
 * Custom hook for debouncing function calls
 * Delays the execution of a function until after the specified delay has elapsed since the last call
 */
export function useDebounce<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallRef = useRef<{ args: any[], timestamp: number } | null>(null)

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      // Store the latest call
      lastCallRef.current = { args, timestamp: Date.now() }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (lastCallRef.current) {
          callback(...lastCallRef.current.args)
        }
      }, delay)
    },
    [callback, delay]
  )

  // Cleanup on unmount
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Flush pending calls immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (lastCallRef.current) {
      callback(...lastCallRef.current.args)
    }
  }, [callback])

  return {
    debounced: debounced as T,
    cancel,
    flush
  }
}

/**
 * Custom hook for throttling function calls
 * Limits the function to execute at most once per delay period
 */
export function useThrottle<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = 500
) {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now
        callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now()
          callback(...args)
        }, delay - timeSinceLastCall)
      }
    },
    [callback, delay]
  )

  return throttled as T
}
