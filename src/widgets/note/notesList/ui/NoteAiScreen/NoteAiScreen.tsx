import type { Note } from '@/entities/note';
import { useImportNoteUpdateJson } from '@/features/createItem';
import { JsonImportPanel } from '@/shared/ui/JsonImportPanel';
import { SlideScreen } from '@/shared/ui/SlideScreen';

const TITLE = 'Покращення через ШІ';

interface NoteAiContentProps {
  note: Note;
  selection?: string;
  onClose: () => void;
}

function NoteAiContent({ note, selection, onClose }: NoteAiContentProps) {
  const { raw, error, prompt, isSubmitting, handleChange, handleImport } = useImportNoteUpdateJson(
    note,
    onClose,
    selection,
  );

  return (
    <JsonImportPanel
      value={raw}
      prompt={prompt}
      error={error}
      isSubmitting={isSubmitting}
      title={TITLE}
      lead={
        selection
          ? 'Надішліть ШІ нотатку з виділеним фрагментом — він покращить лише його, а потім застосуйте результат.'
          : 'Надішліть ШІ поточну нотатку, щоб він структурував або доповнив її, а потім застосуйте результат.'
      }
      submitLabel="Оновити нотатку"
      promptDescription={
        selection
          ? 'Скопіюйте промпт: він містить повну нотатку та виділений вами фрагмент. Опишіть, що саме покращити у фрагменті.'
          : 'Скопіюйте промпт із поточною нотаткою і надішліть його ШІ. Опишіть, що саме покращити: структуру, форматування, стиль, теги.'
      }
      inputDescription="Скопіюйте оновлену нотатку від ШІ та натисніть «Вставити JSON». Вкладення залишаться на місці."
      onChange={handleChange}
      onSubmit={() => void handleImport()}
    />
  );
}

interface NoteAiScreenProps {
  note: Note | null;
  selection?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteAiScreen({ note, selection, isOpen, onClose }: NoteAiScreenProps) {
  return (
    <SlideScreen isOpen={isOpen} title={TITLE} onClose={onClose}>
      {note && <NoteAiContent note={note} selection={selection} onClose={onClose} />}
    </SlideScreen>
  );
}