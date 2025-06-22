import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely formats a public key for display by truncating it
 * @param publicKey - The public key string (can be null or undefined)
 * @param startChars - Number of characters to show at start (default: 8)
 * @param endChars - Number of characters to show at end (default: 8)
 * @returns Formatted string or fallback message
 */
export function formatPublicKey(
  publicKey: string | null | undefined, 
  startChars: number = 8, 
  endChars: number = 8
): string {
  if (!publicKey || typeof publicKey !== 'string' || publicKey.length < startChars + endChars) {
    return 'Not available';
  }
  return `${publicKey.slice(0, startChars)}...${publicKey.slice(-endChars)}`;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const binaryString = String.fromCharCode(...bytes);
  return btoa(binaryString);
}

export function bufferToBase64(buffer: ArrayBuffer): string {
  return uint8ArrayToBase64(new Uint8Array(buffer));
}

export function base64ToBuffer(base64: string): ArrayBufferLike {
  return base64ToUint8Array(base64).buffer;
}

export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
