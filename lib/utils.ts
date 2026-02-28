import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function for dynamically combining Tailwind classes safely without style conflicts.
 * Very useful and neat when passing classNames as props directly.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
