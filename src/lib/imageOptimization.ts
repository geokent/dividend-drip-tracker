/**
 * Image optimization utilities for SEO and performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseSrc: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  return widths.map(width => `${baseSrc}?w=${width} ${width}w`).join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints?: Record<string, string>): string {
  if (breakpoints) {
    return Object.entries(breakpoints)
      .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
      .join(', ');
  }
  return '100vw';
}

/**
 * Get optimized image URL with parameters
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 85, format = 'webp' } = options;
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('fm', format);
  
  return `${src}?${params.toString()}`;
}

/**
 * Generate descriptive alt text from filename or title
 */
export function generateAltText(filename: string, context?: string): string {
  const name = filename
    .split('/').pop()
    ?.replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  if (context) {
    return `${context} - ${name}`;
  }
  
  return name || 'Image';
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Lazy load images with IntersectionObserver
 */
export function setupLazyLoading(selector: string = 'img[data-lazy]'): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  const images = document.querySelectorAll(selector);
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-lazy');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Get image dimensions from URL or element
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
}
