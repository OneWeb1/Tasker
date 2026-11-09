import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useClipboard } from '@/shared/lib/hooks/useClipboard';
import type { ClipboardStatus } from '@/shared/lib/hooks/useClipboard';
import { formatJson } from '@/shared/lib/utils/json';
import { Button } from '@/shared/ui/Button';
import { JsonPreviewScreen } from '@/shared/ui/JsonPreviewScreen';
import { JsonStepCard } from '@/shared/ui/JsonStepCard';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import styles from './JsonInputCard.module.css';

interface JsonInputCardProps {
  value: string;
  description?: string;
  previewLabel?: string;
  buildPreview?: (value: string) => Preview;
  renderPreview?: (screen: PreviewScreenState) => ReactNode;
  onChange: (value: string) => void;
}

interface PreviewScreenState {
  isOpen: boolean;
  onClose: () => void;
}

const PASTE_RESET_DELAY_MS = 3000;
const DEFAULT_DESCRIPTION =
  'Скопіюйте відповідь ШІ та натисніть «Вставити JSON». Перед створенням можна переглянути відформатований JSON.';
const EMPTY_PREVIEW = 'Порожньо. Вставте JSON, щоб побачити прев’ю.';

interface Preview {
  text: string;
  isInvalid: boolean;
}

const getPreview = (value: string): Preview => {
  if (value.trim() === '') return { text: EMPTY_PREVIEW, isInvalid: false };

  const result = formatJson(value);
  return result.ok
    ? { text: result.value, isInvalid: false }
    : { text: result.error, isInvalid: true };
};

interface PasteView {
  label: string;
  variant: 'primary' | 'danger';
  isSuccess: boolean;
  isFailure: boolean;
}

const getPasteView = (status: ClipboardStatus, isValid: boolean): PasteView => {
  if (status === 'failed') {
    return {
      label: 'Немає доступу до буфера',
      variant: 'danger',
      isSuccess: false,
      isFailure: true,
    };
  }
  if (status === 'done') {
    return isValid
      ? { label: 'JSON вставлено', variant: 'primary', isSuccess: true, isFailure: false }
      : { label: 'Некоректний JSON', variant: 'danger', isSuccess: false, isFailure: true };
  }
  return { label: 'Вставити JSON', variant: 'primary', isSuccess: false, isFailure: false };
};

export function JsonInputCard({
  value,
  description = DEFAULT_DESCRIPTION,
  previewLabel = 'Прев’ю JSON',
  buildPreview = getPreview,
  renderPreview,
  onChange,
}: JsonInputCardProps) {
  const { status, paste } = useClipboard(PASTE_RESET_DELAY_MS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const preview = useMemo(
    () => (value.trim() === '' ? getPreview(value) : buildPreview(value)),
    [value, buildPreview],
  );
  const isValid = value.trim() !== '' && !preview.isInvalid;
  const view = getPasteView(status, isValid);

  const handlePaste = async () => {
    const text = await paste();
    if (text !== null) onChange(text);
  };

  return (
    <JsonStepCard
      step={2}
      title="Вставте JSON"
      description={description}
      actions={
        <>
          <Button size="sm" variant={view.variant} onClick={() => void handlePaste()}>
            <span className={styles.content}>
              {view.isSuccess && <CheckIcon width={16} height={16} />}
              {view.isFailure && <CloseIcon width={16} height={16} />}
              {view.label}
            </span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-haspopup="dialog"
            onClick={() => setIsPreviewOpen(true)}
          >
            {previewLabel}
          </Button>
        </>
      }
    >
      {renderPreview && isValid ? (
        renderPreview({ isOpen: isPreviewOpen, onClose: () => setIsPreviewOpen(false) })
      ) : (
        <JsonPreviewScreen
          isOpen={isPreviewOpen}
          title={previewLabel}
          text={preview.text}
          isInvalid={preview.isInvalid}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </JsonStepCard>
  );
}