import { useEffect } from 'react';
import { usePinchZoom } from '@/shared/lib/hooks/usePinchZoom';
import styles from './NoteAttachmentViewer.module.css';

interface ZoomableImageProps {
  src: string;
  alt: string;
  onZoomChange: (isZoomed: boolean) => void;
}

export function ZoomableImage({ src, alt, onZoomChange }: ZoomableImageProps) {
  const { targetRef, isZoomed, style, handlers } = usePinchZoom<HTMLImageElement>();

  useEffect(() => {
    onZoomChange(isZoomed);
    return () => onZoomChange(false);
  }, [isZoomed, onZoomChange]);

  return (
    <img
      ref={targetRef}
      className={styles.zoomable}
      data-zoomed={isZoomed || undefined}
      style={style}
      src={src}
      alt={alt}
      draggable={false}
      {...handlers}
    />
  );
}