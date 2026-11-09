import { useState } from 'react';
import { useClipboard } from '@/shared/lib/hooks/useClipboard';
import type { ClipboardStatus } from '@/shared/lib/hooks/useClipboard';
import { Button } from '@/shared/ui/Button';
import { JsonPreviewScreen } from '@/shared/ui/JsonPreviewScreen';
import { JsonStepCard } from '@/shared/ui/JsonStepCard';

interface JsonPromptCardProps {
  prompt: string;
  description?: string;
}

const DEFAULT_DESCRIPTION =
  'Скопіюйте промпт і надішліть його ШІ. У ньому вже описано всі поля, тож вам лишається лише сказати, що саме створити, — значення ШІ визначить сам.';

const COPY_LABELS: Record<ClipboardStatus, string> = {
  idle: 'Скопіювати промпт',
  done: 'Скопійовано',
  failed: 'Не вдалося скопіювати',
};

export function JsonPromptCard({ prompt, description = DEFAULT_DESCRIPTION }: JsonPromptCardProps) {
  const { status, copy } = useClipboard();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <JsonStepCard
      step={1}
      title="Промпт для ШІ"
      description={description}
      actions={
        <>
          <Button size="sm" onClick={() => void copy(prompt)}>
            {COPY_LABELS[status]}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-haspopup="dialog"
            onClick={() => setIsPreviewOpen(true)}
          >
            Прев’ю промпту
          </Button>
        </>
      }
    >
      <JsonPreviewScreen
        isOpen={isPreviewOpen}
        title="Прев’ю промпту"
        text={prompt}
        action={
          <Button size="sm" variant="ghost" onClick={() => void copy(prompt)}>
            {COPY_LABELS[status]}
          </Button>
        }
        onClose={() => setIsPreviewOpen(false)}
      />
    </JsonStepCard>
  );
}