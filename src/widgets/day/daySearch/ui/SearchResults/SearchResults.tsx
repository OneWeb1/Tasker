import { memo } from 'react';
import type { NoteSearchEntry } from '@/entities/note';
import type { TaskSearchEntry } from '@/entities/task';
import type { SearchResultSection } from '@/features/day/searchDay';
import { formatDayMonth, getTodayKey } from '@/shared/lib/utils/date';
import { SEARCH_KIND_TITLES } from '../../model/constants/searchFilters';
import { SearchNoteRow } from '../SearchNoteRow';
import { SearchResultRow } from '../SearchResultRow';
import styles from './SearchResults.module.css';

export interface TaskResultItem {
  entry: TaskSearchEntry;
  context: string | null;
}

export interface NoteResultItem {
  entry: NoteSearchEntry;
}

export type SearchResultItem = TaskResultItem | NoteResultItem;

interface SearchResultsProps {
  sections: readonly SearchResultSection<SearchResultItem>[];
  onOpenTask: (entry: TaskSearchEntry) => void;
  onOpenNote: (entry: NoteSearchEntry) => void;
}

const isNoteItem = (item: SearchResultItem): item is NoteResultItem =>
  item.entry.kind === 'note';

function SearchResultsList({ sections, onOpenTask, onOpenNote }: SearchResultsProps) {
  const today = getTodayKey();

  return (
    <div className={styles.results}>
      {sections.map(({ kind, groups }) => (
        <section key={kind ?? 'all'} className={styles.section}>
          {kind && <h2 className={styles.title}>{SEARCH_KIND_TITLES[kind]}</h2>}
          {groups.map(({ dateKey, items }) => (
            <div key={dateKey} className={styles.group}>
              <h3 className={styles.date}>
                {dateKey === today ? 'Сьогодні' : formatDayMonth(dateKey)}
              </h3>
              <ul className={styles.list}>
                {items.map((item) =>
                  isNoteItem(item) ? (
                    <SearchNoteRow key={item.entry.id} entry={item.entry} onOpen={onOpenNote} />
                  ) : (
                    <SearchResultRow
                      key={item.entry.id}
                      entry={item.entry}
                      context={item.context}
                      onOpen={onOpenTask}
                    />
                  ),
                )}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export const SearchResults = memo(SearchResultsList);