import { useMemo } from 'react';
import type { FormEvent } from 'react';
import type { TaskDates } from '@/features/task/editTask';
import { getTodayKey } from '@/shared/lib/utils/date';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { RangeCalendar } from '@/shared/ui/RangeCalendar';
import { TimePickerSheet } from '@/shared/ui/TimePickerSheet';
import { useDatesForm } from '../../model/hooks/useDatesForm';
import { buildDatePresets } from '../../model/lib/buildDatePresets';
import type { DatesBounds } from '../../model/types/datesBounds';
import { DatePresets } from '../DatePresets';
import { DateRangeFields } from '../DateRangeFields';
import styles from './DatesSheet.module.css';

const NO_BOUNDS: DatesBounds = {};

interface DatesFormProps {
  value: TaskDates;
  isRecurring: boolean;
  bounds: DatesBounds;
  onSave: (dates: TaskDates) => void;
}

function DatesForm({ value, isRecurring, bounds, onSave }: DatesFormProps) {
  const allowEndDate = !isRecurring;
  const form = useDatesForm({ value, bounds, allowEndDate });
  const today = getTodayKey();
  const { minDate, maxDate } = bounds;
  const presets = useMemo(
    () => buildDatePresets(today, { minDate, maxDate }),
    [today, minDate, maxDate],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (form.isValid) onSave(form.build());
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.content}>
          <DateRangeFields
            start={form.start}
            end={form.end}
            activeField={form.activeField}
            startCaption={isRecurring ? 'Починаючи з' : 'Початок'}
            allowEndDate={allowEndDate}
            startTime={form.hasTime ? form.startTime : null}
            endTime={form.hasTime ? form.endTime : null}
            canResetStart={form.canResetStart}
            onFocus={form.focusField}
            onResetStart={form.resetStart}
            onClearEnd={form.clearEnd}
            onOpenTime={form.openTime}
            onClearTime={form.clearTime}
          />

          {form.timeHint && (
            <p className={styles.hint} role="alert">
              {form.timeHint}
            </p>
          )}

          <DatePresets presets={presets} onSelect={form.applyPreset} />

          <RangeCalendar
            monthKey={form.monthKey}
            start={form.start}
            end={form.end}
            today={today}
            minDate={form.calendarMinDate}
            maxDate={maxDate}
            onSelect={form.selectDay}
            onMonthChange={form.setMonthKey}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" fullWidth disabled={!form.canClear} onClick={form.clear}>
            Очистити
          </Button>
          <Button type="submit" fullWidth disabled={!form.isValid}>
            Зберегти
          </Button>
        </div>
      </form>

      <TimePickerSheet
        isOpen={form.timeField !== null}
        title={form.timeField === 'end' ? 'Час завершення' : 'Час початку'}
        value={form.timeField === 'end' ? form.endTime : form.startTime}
        onSave={form.saveTime}
        onClose={form.closeTime}
      />
    </>

  );
}

interface DatesSheetProps {
  value: TaskDates;
  isRecurring: boolean;
  bounds?: DatesBounds;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dates: TaskDates) => void;
}

export function DatesSheet({
  value,
  isRecurring,
  bounds = NO_BOUNDS,
  isOpen,
  onClose,
  onSave,
}: DatesSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Оберіть дати" size="full" onClose={onClose}>
      <DatesForm value={value} isRecurring={isRecurring} bounds={bounds} onSave={onSave} />
    </BottomSheet>
  );
}