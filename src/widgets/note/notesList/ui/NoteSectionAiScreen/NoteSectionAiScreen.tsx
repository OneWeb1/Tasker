import type { Note } from '@/entities/note';
import { useImportNoteSectionJson } from '@/features/createItem';
import { JsonImportPanel } from '@/shared/ui/JsonImportPanel';
import { SlideScreen } from '@/shared/ui/SlideScreen';

const TITLE = 'Покращення блока';

interface NoteSectionAiContentProps {
  note: Note;
  ordinal: number;
  onClose: () => void;
}

function NoteSectionAiContent({ note, ordinal, onClose }: NoteSectionAiContentProps) {
  const { raw, error, prompt, isSubmitting, handleChange, handleImport } =
    useImportNoteSectionJson(note, ordinal, onClose);

  return (
    <JsonImportPanel
      value={raw}
      prompt={prompt}
      error={error}
      isSubmitting={isSubmitting}
      title={TITLE}
      lead="Надішліть ШІ усю нотатку як контекст — він покращить лише цей блок та його вміст."
      submitLabel="Оновити блок"
      promptDescription="Скопіюйте промпт: він містить повну нотатку і вказує, який блок змінювати. Опишіть, що саме покращити чи доповнити."
      inputDescription="Скопіюйте оновлений блок від ШІ та натисніть «Вставити JSON». Решта нотатки та вкладення залишаться без змін."
      onChange={handleChange}
      onSubmit={() => void handleImport()}
    />
  );
}

interface NoteSectionAiScreenProps {
  note: Note | null;
  ordinal: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteSectionAiScreen({ note, ordinal, isOpen, onClose }: NoteSectionAiScreenProps) {
  return (
    <SlideScreen isOpen={isOpen} title={TITLE} onClose={onClose}>
      {note && ordinal !== null && (
        <NoteSectionAiContent note={note} ordinal={ordinal} onClose={onClose} />
      )}
    </SlideScreen>
  );
}