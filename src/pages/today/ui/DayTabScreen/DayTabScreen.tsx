import { useDeferredValue, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCreateItem } from '@/features/createItem';
import { ExportSheet } from '@/features/day/exportTasks';
import { DateOverride, useDateBounds, useSelectedDate } from '@/features/day/selectDate';
import type { DayTab } from '@/features/day/switchTab';
import { NotesMenuSheet } from '@/features/note/clipboardNotes';
import { useHideOnScroll } from '@/shared/lib/hooks/useHideOnScroll';
import { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import { addDaysToKey, getWeekDays } from '@/shared/lib/utils/date';
import type { DateRange } from '@/shared/lib/utils/date';
import { IconButton } from '@/shared/ui/IconButton';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { MoreIcon } from '@/shared/ui/icons';
import { DayHeader } from '@/widgets/day/dayHeader';
import { DayTabSettingsSheet } from '@/widgets/day/dayTabSettings';
import { DayTabPanel } from '../DayTabPanel';
import styles from './DayTabScreen.module.css';

const TITLES: Record<DayTab, string> = {
  tasks: 'Завдання',
  events: 'Події',
  notes: 'Нотатки',
};

const SETTINGS_LABELS: Record<DayTab, string> = {
  tasks: 'Фільтр завдань',
  events: 'Календарі подій',
  notes: 'Сортування нотаток',
};

const DAY_SWIPE_GAP = 32;

interface DayTabScreenProps {
  tab: DayTab;
  isOpen: boolean;
  dateKey: string;
  workspaceId: string;
  projectId: string | null;
  range: DateRange | null;
  isScrollLocked?: boolean;
  onClose: () => void;
}

export function DayTabScreen({
  tab,
  isOpen,
  dateKey,
  workspaceId,
  projectId,
  range,
  isScrollLocked = true,
  onClose,
}: DayTabScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNotesMenuOpen, setIsNotesMenuOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderHidden = useHideOnScroll(headerRef);
  const { open: openCreateItem } = useCreateItem();
  const { bounds, selectDate } = useSelectedDate();
  useDateBounds(isOpen ? range : null);

  const hasDayActions = tab !== 'notes';
  const nextDate = addDaysToKey(dateKey, 1);
  const previousDate = addDaysToKey(dateKey, -1);
  const hasNext = bounds === null || nextDate <= bounds.to;
  const hasPrevious = bounds === null || previousDate >= bounds.from;

  const weekEdge = useMemo(() => {
    const week = getWeekDays(dateKey);
    if (week[6]?.dateKey === dateKey) return -1;
    if (week[0]?.dateKey === dateKey) return 1;
    return 0;
  }, [dateKey]);

  const { handlers, onTransitionEnd } = useHorizontalSwipe({
    targetRef: trackRef,
    gap: DAY_SWIPE_GAP,
    onSwipeRight: () => selectDate(previousDate),
    onSwipeLeft: () => selectDate(nextDate),
    canSwipeRight: hasPrevious,
    canSwipeLeft: hasNext,
    onProgress: ({ direction: side, progress, isSettling }) => {
      const header = headerRef.current;
      if (!header) return;
      const isCrossing = side !== 0 && side === weekEdge;
      const swipe = side * progress;
      header.style.setProperty('--step-swipe', String(swipe));
      header.style.setProperty('--week-swipe', String(isCrossing ? swipe : 0));
      header.dataset.swipeSettling = String(isSettling);
      header.dataset.daySwiping = String(isSettling || progress > 0);
    },
  });

  const deferredPreviousDate = useDeferredValue(previousDate);
  const deferredNextDate = useDeferredValue(nextDate);

  return (
    <>
      <SlideScreen
        isOpen={isOpen}
        title={TITLES[tab]}
        isHeaderPlain
        swipeToDismiss={!isSettingsOpen && !isExportOpen && !isNotesMenuOpen}
        isScrollLocked={isScrollLocked}
        onClose={onClose}
        action={
          hasDayActions ? (
            <IconButton
              size="lg"
              variant="ghost"
              label="Дії дня"
              aria-haspopup="dialog"
              onClick={() => setIsExportOpen(true)}
            >
              <MoreIcon width={24} height={24} />
            </IconButton>
          ) : (
            <IconButton
              size="lg"
              variant="ghost"
              label="Дії з нотатками"
              aria-haspopup="dialog"
              onClick={() => setIsNotesMenuOpen(true)}
            >
              <MoreIcon width={24} height={24} />
            </IconButton>
          )
        }
      >
        <div className={styles.content}>
          <div
            className={styles.panel}
            data-horizontal-swipe
            {...handlers}
          >
            <div
              ref={trackRef}
              className={styles.track}
              style={{ '--swipe-gap': `${DAY_SWIPE_GAP}px` } as CSSProperties}
              onTransitionEnd={onTransitionEnd}
            >
              <DayTabPanel tab={tab} />
              {hasPrevious && (
                <div className={styles.side} data-side="left" aria-hidden="true">
                  <DateOverride dateKey={deferredPreviousDate}>
                    <DayTabPanel tab={tab} />
                  </DateOverride>
                </div>
              )}
              {hasNext && (
                <div className={styles.side} data-side="right" aria-hidden="true">
                  <DateOverride dateKey={deferredNextDate}>
                    <DayTabPanel tab={tab} />
                  </DateOverride>
                </div>
              )}
            </div>
          </div>
          <div ref={headerRef} className={styles.header} data-hidden={isHeaderHidden || undefined}>
            <DayHeader
              settingsLabel={SETTINGS_LABELS[tab]}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      </SlideScreen>
      <DayTabSettingsSheet
        tab={tab}
        isOpen={isOpen && isSettingsOpen}
        dateKey={dateKey}
        workspaceId={workspaceId}
        projectId={projectId}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ExportSheet
        isOpen={isOpen && isExportOpen}
        defaultDate={dateKey}
        onClose={() => setIsExportOpen(false)}
      />
      <NotesMenuSheet
        isOpen={isOpen && isNotesMenuOpen}
        workspaceId={workspaceId}
        dateKey={dateKey}
        onCreate={() => openCreateItem({ kind: 'note' })}
        onClose={() => setIsNotesMenuOpen(false)}
      />
    </>
  );
}