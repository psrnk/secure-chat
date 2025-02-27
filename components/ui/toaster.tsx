"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

type Toast = {
  id: string
  title?: string
  description?: string
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Set up the global toast state
  useEffect(() => {
    ;(window as any).__TOAST_STATE = { setToasts }

    return () => {
      delete (window as any).__TOAST_STATE
    }
  }, [])

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 max-w-xs w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white rounded-lg shadow-lg p-4 border border-border animate-in slide-in-from-right"
        >
          <div className="flex justify-between items-start">
            {toast.title && <h3 className="font-medium">{toast.title}</h3>}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {toast.description && <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>}
        </div>
      ))}
    </div>
  )
}

