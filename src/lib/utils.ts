// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge" // Correct import for twMerge

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
