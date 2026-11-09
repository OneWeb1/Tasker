import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { DEFAULT_NOTE_TAG, NOTE_TAG_MAX_LENGTH, NOTE_TAGS_MAX_COUNT } from '@/entities/note';
import { CloseIcon } from '@/shared/ui/icons';
import styles from './NoteTagsEditor.module.css';

interface NoteTagsEditorProps {
  tags: readonly string[];
  onAdd: (raw: string) => void;
  onRemove: (tag: string) => void;
}

export function NoteTagsEditor({ tags, onAdd, onRemove }: NoteTagsEditorProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    if (draft.trim() === '') return;
    onAdd(draft);
    setDraft('');
  };

  const handleChange = (value: string) => {
    if (value.endsWith(',')) {
      onAdd(value.slice(0, -1));
      setDraft('');
      return;
    }
    setDraft(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commit();
  };

  return (
    <div className={styles.tags}>
      {tags.length === 0 && (
        <span className={styles.tag} data-default="true">
          {DEFAULT_NOTE_TAG}
        </span>
      )}
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          #{tag}
          <button
            type="button"
            className={styles.remove}
            aria-label={`Видалити тег ${tag}`}
            onClick={() => onRemove(tag)}
          >
            <CloseIcon width={12} height={12} />
          </button>
        </span>
      ))}
      {tags.length < NOTE_TAGS_MAX_COUNT && (
        <input
          type="text"
          enterKeyHint="done"
          className={styles.input}
          value={draft}
          maxLength={NOTE_TAG_MAX_LENGTH + 1}
          placeholder="Додати тег"
          aria-label="Новий тег"
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
        />
      )}
    </div>
  );
}