import type { ComponentProps, FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { JsonInputCard } from '@/shared/ui/JsonInputCard';
import { JsonPromptCard } from '@/shared/ui/JsonPromptCard';
import styles from './JsonImportPanel.module.css';

interface JsonImportPanelProps {
  value: string;
  prompt: string;
  error: string | null;
  isSubmitting: boolean;
  title?: string;
  lead?: string;
  submitLabel?: string;
  promptDescription?: string;
  inputDescription?: string;
  inputPreviewLabel?: string;
  buildInputPreview?: ComponentProps<typeof JsonInputCard>['buildPreview'];
  renderInputPreview?: ComponentProps<typeof JsonInputCard>['renderPreview'];
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function JsonImportPanel({
  value,
  prompt,
  error,
  isSubmitting,
  title = 'Створення через ШІ',
  lead = 'Отримайте готовий JSON від ШІ та додайте його в застосунок за кілька кроків.',
  submitLabel = 'Створити',
  promptDescription,
  inputDescription,
  inputPreviewLabel,
  buildInputPreview,
  renderInputPreview,
  onChange,
  onSubmit,
}: JsonImportPanelProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <header className={styles.intro}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.lead}>{lead}</p>
      </header>
      <JsonPromptCard prompt={prompt} description={promptDescription} />
      <JsonInputCard
        value={value}
        description={inputDescription}
        previewLabel={inputPreviewLabel}
        buildPreview={buildInputPreview}
        renderPreview={renderInputPreview}
        onChange={onChange}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.footer}>
        <Button type="submit" fullWidth disabled={value.trim() === '' || isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}