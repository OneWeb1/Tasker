import { useState } from 'react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { ClockDial, padTime } from './ClockDial';
import type { ClockUnit } from './ClockDial';
import styles from './TimePickerSheet.module.css';

interface TimePickerFormProps {
  value: string;
  onSave: (value: string) => void;
}

function TimePickerForm({ value, onSave }: TimePickerFormProps) {
  const [hours, setHours] = useState(() => Number(value.slice(0, 2)));
  const [minutes, setMinutes] = useState(() => Number(value.slice(3, 5)));
  const [unit, setUnit] = useState<ClockUnit>('hours');

  return (
    <div className={styles.form}>
      <div className={styles.fields}>
        <button
          type="button"
          className={styles.field}
          aria-label="Години"
          aria-pressed={unit === 'hours'}
          onClick={() => setUnit('hours')}
        >
          {padTime(hours)}
        </button>
        <span className={styles.colon} aria-hidden="true">
          :
        </span>
        <button
          type="button"
          className={styles.field}
          aria-label="Хвилини"
          aria-pressed={unit === 'minutes'}
          onClick={() => setUnit('minutes')}
        >
          {padTime(minutes)}
        </button>
      </div>

      <ClockDial
        unit={unit}
        value={unit === 'hours' ? hours : minutes}
        onChange={unit === 'hours' ? setHours : setMinutes}
        onCommit={() => {
          if (unit === 'hours') setUnit('minutes');
        }}
      />

      <div className={styles.footer}>
        <Button fullWidth onClick={() => onSave(`${padTime(hours)}:${padTime(minutes)}`)}>
          Готово
        </Button>
      </div>
    </div>
  );
}

interface TimePickerSheetProps {
  isOpen: boolean;
  title: string;
  value: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function TimePickerSheet({ isOpen, title, value, onSave, onClose }: TimePickerSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title={title} onClose={onClose}>
      <TimePickerForm value={value} onSave={onSave} />
    </BottomSheet>
  );
}