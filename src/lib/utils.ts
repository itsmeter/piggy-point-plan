import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumberWithCommas(value: string): string {
  const num = value.replace(/,/g, '');
  if (!num || isNaN(Number(num))) return value;
  return Number(num).toLocaleString('en-US');
}

export function parseFormattedNumber(value: string): string {
  return value.replace(/,/g, '');
}
