import { useState } from 'react';
import type { TaskSubtask } from '@/entities/task';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { TabPanel } from '@/shared/ui/TabPanel';
import { Tabs } from '@/shared/ui/Tabs';
import { PlusIcon } from '@/shared/ui/icons';
import { SUBTASK_EMPTY_TEXT, SUBTASK_TABS } from '../../model/constants/subtask';
import { useSubtaskSelection } from '../../model/hooks/useSubtaskSelection';
import type { SubtaskBulkActions, SubtaskTab } from '../../model/types/subtask';
import { SubtaskActionsBar } from '../SubtaskActionsBar';
import { SubtaskList } from '../SubtaskList';
import styles from './SubtasksScreen.module.css';

const TAB_ORDER = SUBTASK_TABS.map((item) => item.value);

interface SubtasksScreenProps {
  isOpen: boolean;
  openSubtasks: readonly TaskSubtask[];
  doneSubtasks: readonly TaskSubtask[];
  bulkActions?: SubtaskBulkActions;
  onToggle?: (id: string) => void;
  onOpen: (id: string) => void;
  onAdd?: () => void;
  onClose: () => void;
}

export function SubtasksScreen({
  isOpen,
  openSubtasks,
  doneSubtasks,
  bulkActions,
  onToggle,
  onOpen,
  onAdd,
  onClose,
}: SubtasksScreenProps) {
  const [tab, setTab] = useState<SubtaskTab>('open');

  const counts: Record<SubtaskTab, number> = {
    open: openSubtasks.length,
    done: doneSubtasks.length,
  };
  const tabs = SUBTASK_TABS.map((item) => ({ ...item, count: counts[item.value] }));
  const items = tab === 'open' ? openSubtasks : doneSubtasks;
  const { selection, bar, reset } = useSubtaskSelection(items, bulkActions);

  const handleTabChange = (next: SubtaskTab) => {
    reset();
    setTab(next);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <SlideScreen
      isOpen={isOpen}
      title="Підзавдання"
      onClose={handleClose}
      action={
        onAdd && (
          <button type="button" className={styles.plus} aria-label="Додати підзавдання" onClick={onAdd}>
            <PlusIcon width={26} height={26} />
          </button>
        )
      }
    >
      <div className={styles.screen}>
        <Tabs
          variant="text"
          ariaLabel="Підзавдання"
          items={tabs}
          value={tab}
          onChange={handleTabChange}
        />

        <TabPanel value={tab} order={TAB_ORDER}>
          {items.length > 0 ? (
            <div className={styles.list}>
              <SubtaskList
                items={items}
                selection={selection}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            </div>
          ) : (
            <p className={styles.empty}>{SUBTASK_EMPTY_TEXT[tab]}</p>
          )}
        </TabPanel>

        {onAdd && (
          <button type="button" className={styles.fab} aria-haspopup="dialog" onClick={onAdd}>
            <PlusIcon width={18} height={18} />
            Додати підзавдання
          </button>
        )}

        {isOpen && bar && <SubtaskActionsBar {...bar} />}
      </div>
    </SlideScreen>
  );
}