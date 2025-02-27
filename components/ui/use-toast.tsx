type ToastProps = {
  title?: string
  description?: string
  duration?: number
}

export function toast({ title, description, duration = 3000 }: ToastProps) {
  // Get the toast state from the global window object
  const toastState = (window as any).__TOAST_STATE

  if (toastState && typeof toastState.setToasts === "function") {
    const id = Date.now().toString()

    // Add the toast
    toastState.setToasts((prev) => [...prev, { id, title, description }])

    // Remove the toast after duration
    setTimeout(() => {
      toastState.setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }
}

