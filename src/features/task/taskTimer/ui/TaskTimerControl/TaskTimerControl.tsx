import type { Task } from '@/entities/task';
import { Toggle } from '@/shared/ui/Toggle';
import { PauseIcon, PlayIcon, RestoreIcon } from '@/shared/ui/icons';
import { formatTimer } from '../../lib/formatTimer';
import { useTaskTimer } from '../../model/hooks/useTaskTimer';
import styles from './TaskTimerControl.module.css';

interface TaskTimerControlProps {
  task: Task;
  dateKey: string;
}

export function TaskTimerControl({ task, dateKey }: TaskTimerControlProps) {
  const { isEnabled, isRunning, elapsedSeconds, setEnabled, toggleRunning, reset } = useTaskTimer(
    task,
    dateKey,
  );

  return (
    <div className={styles.control}>
      {isEnabled && (
        <>
          {!isRunning && elapsedSeconds > 0 && (
            <button
              type="button"
              className={styles.reset}
              aria-label="Скинути таймер"
              onClick={reset}
            >
              <RestoreIcon width={18} height={18} />
            </button>
          )}
          <button
            type="button"
            className={styles.time}
            data-running={isRunning}
            aria-label={isRunning ? 'Призупинити таймер' : 'Запустити таймер'}
            onClick={toggleRunning}
          >
            {isRunning ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
            <span>{formatTimer(elapsedSeconds)}</span>
          </button>
        </>
      )}
      <Toggle checked={isEnabled} label="Таймер виконання" onChange={setEnabled} />
    </div>
  );
}