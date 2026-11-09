import { useCallback } from 'react';
import { useTaskDiff } from '@/entities/task';
import type { Task } from '@/entities/task';
import { useTabShiftStore } from '@/shared/lib/hooks/useTabShift';
import { Button } from '@/shared/ui/Button';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { TabPanel } from '@/shared/ui/TabPanel';
import { Tabs } from '@/shared/ui/Tabs';
import { ChecklistAddIcon } from '@/shared/ui/icons';
import { useChecklists } from '../../model/hooks/useChecklists';
import { ChecklistPanel } from '../ChecklistPanel';
import styles from './ChecklistsScreen.module.css';

interface ChecklistsScreenProps {
  task: Task;
  isOpen: boolean;
  activeId: string | null;
  autoAddId: string | null;
  onActiveChange: (id: string) => void;
  onAutoAddChange: (id: string | null) => void;
  onClose: () => void;
}

export function ChecklistsScreen({
  task,
  isOpen,
  activeId,
  autoAddId,
  onActiveChange,
  onAutoAddChange,
  onClose,
}: ChecklistsScreenProps) {
  const { checklists, addChecklist } = useChecklists(task);
  const isReadOnly = useTaskDiff() !== null;
  const active = checklists.find((checklist) => checklist.id === activeId) ?? checklists[0];
  const isFirstActive = active !== undefined && active.id === checklists[0]?.id;

  const tabs = checklists.map((checklist) => ({
    value: checklist.id,
    label: checklist.title,
  }));
  const tabOrder = tabs.map((tab) => tab.value);
  const shiftStore = useTabShiftStore<string>();

  const renderPanel = useCallback(
    (id: string) => {
      const checklist = checklists.find((item) => item.id === id);
      return checklist ? <ChecklistPanel task={task} checklist={checklist} /> : null;
    },
    [checklists, task],
  );

  const handleAdd = () => {
    const id = addChecklist();
    onAutoAddChange(id);
    onActiveChange(id);
  };

  const handleAutoAdded = useCallback(() => onAutoAddChange(null), [onAutoAddChange]);

  return (
    <SlideScreen
      isOpen={isOpen}
      title="Чеклісти"
      swipeToDismiss={isFirstActive}
      onClose={onClose}
      action={
        isReadOnly ? undefined : (
          <button type="button" className={styles.add} onClick={handleAdd}>
            <ChecklistAddIcon width={24} height={24} />
            Додати чекліст
          </button>
        )
      }
    >
      {active ? (
        <>
          <div onPointerDown={(event) => event.stopPropagation()}>
            <Tabs
              variant="text"
              ariaLabel="Чеклісти завдання"
              items={tabs}
              value={active.id}
              shiftStore={shiftStore}
              onChange={onActiveChange}
            />
          </div>
          <TabPanel
            value={active.id}
            order={tabOrder}
            swipe={{ onChange: onActiveChange, renderPanel, shiftStore }}
          >
            <ChecklistPanel
              task={task}
              checklist={active}
              autoAdd={active.id === autoAddId}
              onAutoAdded={handleAutoAdded}
            />
          </TabPanel>
        </>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Чеклістів ще немає</p>
          <Button onClick={handleAdd}>Створити чекліст</Button>
        </div>
      )}
    </SlideScreen>
  );
}