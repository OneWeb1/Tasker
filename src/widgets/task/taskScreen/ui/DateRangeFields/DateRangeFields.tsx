import type { ComponentType, SVGProps } from 'react';
import { formatNumericDate } from '@/shared/lib/utils/date';
import { CalendarDueIcon, CalendarStartIcon, CloseIcon } from '@/shared/ui/icons';
import type { DateField } from '../../model/hooks/useDatesForm';
import styles from './DateRangeFields.module.css';

interface DateRangeFieldsProps {
  start: string;
  end: string | null;
  activeField: DateField;
  startCaption: string;
  allowEndDate: boolean;
  startTime: string | null;
  endTime: string | null;
  canResetStart: boolean;
  onFocus: (field: DateField) => void;
  onResetStart: () => void;
  onClearEnd: () => void;
  onOpenTime: (field: DateField) => void;
  onClearTime: () => void;
}

interface DateFieldRowProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  caption: string;
  placeholder: string;
  date: string | null;
  time: string | null;
  isActive: boolean;
  isDisabled?: boolean;
  timeLabel: string;
  clearDateLabel: string;
  canClearDate: boolean;
  canAddTime: boolean;
  onFocus: () => void;
  onClearDate: () => void;
  onOpenTime: () => void;
  onClearTime: () => void;
}

function DateFieldRow({
  icon: Icon,
  caption,
  placeholder,
  date,
  time,
  isActive,
  isDisabled = false,
  timeLabel,
  clearDateLabel,
  canClearDate,
  canAddTime,
  onFocus,
  onClearDate,
  onOpenTime,
  onClearTime,
}: DateFieldRowProps) {
  const hasTime = date !== null && time !== null;

  return (
    <div className={styles.field} data-active={isActive}>
      <div className={styles.label}>
        <button
          type="button"
          className={styles.main}
          data-grow={!hasTime}
          aria-pressed={isActive}
          disabled={isDisabled}
          onClick={onFocus}
        >
          <Icon width={24} height={24} />
          {date === null ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            <span className={styles.text}>
              <span className={styles.caption}>{caption}</span>
              <span className={styles.value}>{formatNumericDate(date)}</span>
            </span>
          )}
        </button>
        {hasTime && (
          <button
            type="button"
            className={styles.timeText}
            aria-label={`${timeLabel}: ${time}`}
            onClick={onOpenTime}
          >
            о {time}
          </button>
        )}
      </div>

      {hasTime ? (
        <button type="button" className={styles.clear} aria-label="Прибрати час" onClick={onClearTime}>
          <CloseIcon width={12} height={12} />
        </button>
      ) : (
        date !== null && (
          <>
            {!isDisabled && (
              <button
                type="button"
                className={styles.clear}
                aria-label={clearDateLabel}
                disabled={!canClearDate}
                onClick={onClearDate}
              >
                <CloseIcon width={12} height={12} />
              </button>
            )}
            {canAddTime && (
              <button type="button" className={styles.timeButton} onClick={onOpenTime}>
                Додати час
              </button>
            )}
          </>
        )
      )}
    </div>

  );
}

export function DateRangeFields({
  start,
  end,
  activeField,
  startCaption,
  allowEndDate,
  startTime,
  endTime,
  canResetStart,
  onFocus,
  onResetStart,
  onClearEnd,
  onOpenTime,
  onClearTime,
}: DateRangeFieldsProps) {
  const hasTime = startTime !== null && endTime !== null;
  const endDate = end ?? (hasTime ? start : null);

  return (
    <div className={styles.fields}>
      <DateFieldRow
        icon={CalendarStartIcon}
        caption={startCaption}
        placeholder="Вкажіть дату початку"
        date={start}
        time={startTime}
        isActive={activeField === 'start'}
        timeLabel="Час початку"
        clearDateLabel="Скинути дату початку"
        canClearDate={canResetStart}
        canAddTime
        onFocus={() => onFocus('start')}
        onClearDate={onResetStart}
        onOpenTime={() => onOpenTime('start')}
        onClearTime={onClearTime}
      />

      <DateFieldRow
        icon={CalendarDueIcon}
        caption="Завершення"
        placeholder={allowEndDate ? 'Вкажіть дату завершення' : 'Того ж дня'}
        date={endDate}
        time={endTime}
        isActive={allowEndDate && activeField === 'end'}
        isDisabled={!allowEndDate}
        timeLabel="Час завершення"
        clearDateLabel="Прибрати дату завершення"
        canClearDate={end !== null}
        canAddTime={end !== null}
        onFocus={() => onFocus('end')}
        onClearDate={onClearEnd}
        onOpenTime={() => onOpenTime('end')}
        onClearTime={onClearTime}
      />
    </div>
  );
}