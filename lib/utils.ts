import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random string of specified length
export function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  const charactersLength = characters.length

  // Use the Web Crypto API for better randomness
  const randomValues = new Uint8Array(length)
  window.crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomValues[i] % charactersLength)
  }

  return result
}

