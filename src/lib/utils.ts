import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatCompact(value: number): string {
    if (Math.abs(value) >= 1e6) {
        return (value / 1e6).toFixed(1) + 'M';
    }
    if (Math.abs(value) >= 1e3) {
        return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toFixed(0);
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Generate color based on value (green for positive, red for negative)
 */
export function getValueColor(value: number): string {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
