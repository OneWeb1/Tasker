import { useState } from 'react';
import type { ReactNode } from 'react';
import { CREATE_ITEM_MODE_ITEMS, useCreateItem } from '@/features/createItem';
import type { CreateItemMode } from '@/features/createItem';
import { NoteContentScreen } from '@/features/note/editNoteContent';
import { useTabShiftStore } from '@/shared/lib/hooks/useTabShift';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { Tabs } from '@/shared/ui/Tabs';
import { useModeSwipe } from '../../model/hooks/useModeSwipe';
import { useTaskEditor } from '../../model/hooks/useTaskEditor';
import { CategoryEditor } from '../CategoryEditor';
import { CategoryJsonImport } from '../CategoryJsonImport';
import { ItemEditor } from '../ItemEditor';
import { ItemJsonImport } from '../ItemJsonImport';
import styles from './TaskEditorScreen.module.css';

interface TaskEditorFormProps {
  defaultDate: string;
  mode: CreateItemMode;
  onModeChange: (mode: CreateItemMode) => void;
}

function TaskEditorForm({ defaultDate, mode, onModeChange }: TaskEditorFormProps) {
  const { close } = useCreateItem();
  const editor = useTaskEditor(defaultDate);
  const { kind, categories, workspaceId, isEditing } = editor;
  const shiftStore = useTabShiftStore<CreateItemMode>();
  const swipe = useModeSwipe({ mode, onChange: onModeChange, shiftStore });

  let body: ReactNode;

  if (!isEditing && mode === 'json') {
    body =
      kind === 'category' ? (
        <CategoryJsonImport categories={categories} workspaceId={workspaceId} onCreated={close} />
      ) : (
        <ItemJsonImport defaultDate={defaultDate} />
      );
  } else if (kind === 'category') {
    body = <CategoryEditor categories={categories} workspaceId={workspaceId} onCreated={close} />;
  } else {
    body = <ItemEditor editor={editor} />;
  }

  return (
    <div className={styles.screen}>
      {!isEditing && (
        <Tabs
          variant="underline"
          ariaLabel="Спосіб створення"
          items={CREATE_ITEM_MODE_ITEMS}
          value={mode}
          shiftStore={shiftStore}
          onChange={onModeChange}
        />
      )}
      <div
        className={styles.swipe}
        data-settling={swipe.isSettling}
        style={swipe.offset === 0 ? undefined : { transform: `translateX(${swipe.offset}px)` }}
        onTransitionEnd={swipe.onTransitionEnd}
        {...(isEditing ? {} : swipe.handlers)}
      >
        <div
          key={mode}
          className={styles.content}
          data-motion={swipe.motion ?? undefined}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) swipe.clearMotion();
          }}
        >
          {body}
        </div>
      </div>
      {kind === 'note' && (
        <NoteContentScreen
          isOpen={editor.isContentOpen}
          value={editor.content}
          onChange={editor.setContent}
          attachments={editor.attachments}
          onAttachmentsChange={editor.setAttachments}
          textAlign={editor.textAlign}
          onTextAlignChange={editor.setTextAlign}
          onClose={editor.closeContent}
        />
      )}
    </div>
  );
}

interface TaskEditorScreenProps {
  defaultDate: string;
}

export function TaskEditorScreen({ defaultDate }: TaskEditorScreenProps) {
const { isOpen, close, task, note, kind } = useCreateItem();
  const [mode, setMode] = useState<CreateItemMode>('form');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setMode('form');
  }

  const KIND_TITLES = { task: 'Нове завдання', note: 'Нова нотатка', category: 'Нова категорія' };
  const title = task ? 'Редагувати завдання' : note ? 'Редагувати нотатку' : KIND_TITLES[kind];

  return (
    <SlideScreen
      isOpen={isOpen}
      title={title}
      swipeToDismiss={Boolean(task || note) || mode === 'form'}
      onClose={close}
    >
      <TaskEditorForm defaultDate={defaultDate} mode={mode} onModeChange={setMode} />
    </SlideScreen>
  );
}