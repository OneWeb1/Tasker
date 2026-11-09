import { useEffect, useRef } from 'react';
import { NoteScreen } from '@/entities/note';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { Tabs } from '@/shared/ui/Tabs';
import { CloseIcon, SearchIcon } from '@/shared/ui/icons';
import { SEARCH_SCOPE_TABS } from '../../model/constants/searchFilters';
import { useDaySearchScreen } from '../../model/hooks/useDaySearchScreen';
import { SearchFilters } from '../SearchFilters';
import { SearchResults } from '../SearchResults';
import styles from './DaySearchScreen.module.css';

const FOCUS_DELAY_MS = 380;

export function DaySearchScreen() {
  const {
    isOpen,
    term,
    scope,
    status,
    priority,
    workspaceTitle,
    isScrollLocked,
    sections,
    isEmpty,
    close,
    setTerm,
    setScope,
    setStatus,
    setPriority,
    openResult,
    openNote,
    openedNote,
    isNoteOpen,
    closeNote,
    isNotesOnly,
  } = useDaySearchScreen();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      FOCUS_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
    <SlideScreen
      isOpen={isOpen}
      title="Пошук"
      direction="vertical"
      isHeaderHidden
      isScrollLocked={isScrollLocked}
      onClose={close}
    >
      <div className={styles.screen}>
        <header className={styles.header}>
          <div className={styles.top}>
            <form
              className={styles.field}
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                inputRef.current?.blur();
              }}
            >
              <SearchIcon className={styles.icon} width={22} height={22} />
              <input
                ref={inputRef}
                type="text"
                enterKeyHint="search"
                className={styles.input}
                value={term}
                placeholder={isNotesOnly ? 'Пошук нотатки' : `Пошук у «${workspaceTitle}»`}
                aria-label="Пошук"
                onChange={(event) => setTerm(event.target.value)}
              />
              {term !== '' && (
                <button
                  type="button"
                  className={styles.clear}
                  aria-label="Очистити пошук"
                  onClick={() => setTerm('')}
                >
                  <CloseIcon width={16} height={16} />
                </button>
              )}
            </form>
            <button type="button" className={styles.cancel} onClick={close}>
              Скасувати
            </button>
          </div>
          {!isNotesOnly && (
            <Tabs
              variant="text"
              ariaLabel="Розділ пошуку"
              items={SEARCH_SCOPE_TABS}
              value={scope}
              onChange={setScope}
            />
          )}
          {scope !== 'notes' && (
            <SearchFilters
              status={status}
              priority={priority}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
            />
          )}
        </header>

        {isEmpty ? (
          <p className={styles.empty}>Нічого не знайдено</p>
        ) : (
          <SearchResults sections={sections} onOpenTask={openResult} onOpenNote={openNote} />
        )}
      </div>
    </SlideScreen>
    <NoteScreen note={openedNote} isOpen={isOpen && isNoteOpen} onClose={closeNote} />
    </>
  );
}