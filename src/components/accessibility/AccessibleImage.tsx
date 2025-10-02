import { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';
import { ScreenReaderOnly } from './ScreenReaderOnly';

interface AccessibleImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  src: string;
  alt: string;
  decorative?: boolean;
  caption?: string;
  loading?: 'lazy' | 'eager';
  onLoadAnnounce?: boolean;
}

/**
 * Accessible image component with proper semantics
 * Handles decorative images, captions, lazy loading, and screen reader announcements
 * 
 * @param src - Image source URL
 * @param alt - Alternative text (required unless decorative)
 * @param decorative - If true, marks image as decorative (alt="" and role="presentation")
 * @param caption - Optional visible caption (uses figure/figcaption)
 * @param loading - Loading strategy (default: 'lazy')
 * @param onLoadAnnounce - Announce to screen readers when image loads (default: false)
 */
export const AccessibleImage = ({
  src,
  alt,
  decorative = false,
  caption,
  loading = 'lazy',
  onLoadAnnounce = false,
  className,
  ...props
}: AccessibleImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoadAnnounce) {
      const announcement = `Image loaded: ${alt}`;
      const liveRegion = document.getElementById('aria-live-polite');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  };

  const handleError = () => {
    setHasError(true);
    const announcement = `Failed to load image: ${alt}`;
    const liveRegion = document.getElementById('aria-live-assertive');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  };

  // Decorative image (no semantic meaning)
  if (decorative) {
    return (
      <img
        src={src}
        alt=""
        role="presentation"
        loading={loading}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }

  // Error state
  if (hasError) {
    return (
      <div 
        role="img" 
        aria-label={alt}
        className={cn("bg-muted flex items-center justify-center p-4 rounded", className)}
      >
        <span className="text-muted-foreground text-sm">
          Failed to load image: {alt}
        </span>
      </div>
    );
  }

  // Image with caption
  if (caption) {
    return (
      <figure className={cn("space-y-2", className)}>
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-auto",
            !isLoaded && "animate-pulse bg-muted"
          )}
          {...props}
        />
        <figcaption className="text-sm text-muted-foreground">
          {caption}
        </figcaption>
        <ScreenReaderOnly>
          <p>Image description: {alt}</p>
        </ScreenReaderOnly>
      </figure>
    );
  }

  // Standard image
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        className,
        !isLoaded && "animate-pulse bg-muted"
      )}
      {...props}
    />
  );
};
