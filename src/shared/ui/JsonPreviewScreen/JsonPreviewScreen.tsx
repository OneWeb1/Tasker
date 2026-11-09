import type { ReactNode } from 'react';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import styles from './JsonPreviewScreen.module.css';

interface JsonPreviewScreenProps {
  isOpen: boolean;
  title: string;
  text: string;
  isInvalid?: boolean;
  action?: ReactNode;
  onClose: () => void;
}

export function JsonPreviewScreen({
  isOpen,
  title,
  text,
  isInvalid = false,
  action,
  onClose,
}: JsonPreviewScreenProps) {
  return (
    <SlideScreen isOpen={isOpen} title={title} action={action} onClose={onClose}>
      <pre className={styles.text} data-invalid={isInvalid}>
        {text}
      </pre>
    </SlideScreen>
  );
}