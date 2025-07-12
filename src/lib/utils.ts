// src/lib/utils.ts

import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-variants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Optional: logout utility (if you want to use it in Dashboard)
export function logout() {
  localStorage.removeItem("token")
}
