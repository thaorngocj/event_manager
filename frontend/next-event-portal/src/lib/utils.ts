import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url?: string): string | undefined {
  if (!url) return undefined;

  // Nếu là URL đầy đủ chứa /uploads/ → trích filename và dùng proxy nội bộ
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/').pop();
      return `/api/uploads/${filename}`;
    }
    return url;
  }

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  if (cleanUrl.startsWith('/uploads/')) {
    const filename = cleanUrl.replace('/uploads/', '');
    return `/api/uploads/${filename}`;
  }
  return cleanUrl;
}
